package controllers

import (
	"context"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"strings"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gofiber/fiber/v2"
)

// Admin media uploads (banner images/videos, pre-built PC photos, item photos). With AWS keys in
// .env they go to the S3 bucket under Files/website/<yyyymm>/ and are served through /api/image;
// otherwise they are saved under ./uploads/web/<yyyymm>/ and served read-only from /uploads.

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
	name := time.Now().Format("150405") + "-" + randDigits(10) + ext
	month := time.Now().Format("200601")
	if s3Ready() {
		if _, err := f.Seek(0, io.SeekStart); err != nil {
			return serverErr(c, err)
		}
		key := "website/" + month + "/" + name
		_, err := s3client.PutObject(context.Background(), &s3.PutObjectInput{
			Bucket:       aws.String(os.Getenv("AWS_BUCKET")),
			Key:          aws.String("Files/" + key),
			Body:         f,
			ContentType:  aws.String(strings.Split(kind, ";")[0]),
			CacheControl: aws.String("public, max-age=31536000"),
		})
		if err != nil {
			return serverErr(c, err)
		}
		return ok(c, fiber.Map{"url": "/api/image?path=" + key, "type": strings.Split(kind, "/")[0], "storage": "s3"})
	}
	dir := filepath.Join("uploads", "web", month)
	if err := os.MkdirAll(dir, 0o755); err != nil {
		return serverErr(c, err)
	}
	if err := c.SaveFile(fh, filepath.Join(dir, name)); err != nil {
		return serverErr(c, err)
	}
	return ok(c, fiber.Map{"url": "/" + filepath.ToSlash(filepath.Join(dir, name)), "type": strings.Split(kind, "/")[0], "storage": "local"})
}
