package controllers

import (
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

// Admin media uploads (banner images/videos, pre-built PC photos, item photos). Files are saved
// under ./uploads/web/<yyyymm>/ with a random name and served read-only from /uploads.

var uploadTypes = map[string]string{
	"image/jpeg": ".jpg", "image/png": ".png", "image/webp": ".webp", "image/gif": ".gif",
	"video/mp4": ".mp4", "video/webm": ".webm",
}

const maxUpload = 50 << 20 // 50 MB

// AdminUpload: POST /api/admin/upload (multipart "file")
func AdminUpload(c *fiber.Ctx) error {
	fh, err := c.FormFile("file")
	if err != nil {
		return bad(c, "Choose a file")
	}
	if fh.Size > maxUpload {
		return bad(c, "File is larger than 50 MB")
	}
	f, err := fh.Open()
	if err != nil {
		return serverErr(c, err)
	}
	defer f.Close()
	head := make([]byte, 512)
	n, _ := io.ReadFull(f, head)
	kind := http.DetectContentType(head[:n])
	if strings.HasPrefix(kind, "application/octet-stream") && strings.EqualFold(filepath.Ext(fh.Filename), ".webp") {
		kind = "image/webp"
	}
	ext, allowed := uploadTypes[strings.Split(kind, ";")[0]]
	if !allowed {
		return bad(c, "Only JPG, PNG, WebP, GIF, MP4 or WebM files")
	}
	dir := filepath.Join("uploads", "web", time.Now().Format("200601"))
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return serverErr(c, err)
	}
	name := time.Now().Format("150405") + "-" + randDigits(10) + ext
	if err := c.SaveFile(fh, filepath.Join(dir, name)); err != nil {
		return serverErr(c, err)
	}
	return ok(c, fiber.Map{"url": "/" + filepath.ToSlash(filepath.Join(dir, name)), "type": strings.Split(kind, "/")[0]})
}
