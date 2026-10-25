package controllers

import (
	"context"
	"log"
	"net/http"
	"os"
	"path"
	"strings"
	"sync"
	"time"

	"github.com/aws/aws-sdk-go-v2/aws"
	"github.com/aws/aws-sdk-go-v2/config"
	"github.com/aws/aws-sdk-go-v2/service/s3"
	"github.com/gofiber/fiber/v2"
)

// Item images live in the inventory's S3 bucket under "Files/<path>" (same layout the
// NEWCOM-Web-Service download endpoint uses). This endpoint only signs GETs for image files
// under Files/items/ and redirects to the short-lived URL; it never lists or writes.

var (
	presignOnce sync.Once
	presigner   *s3.PresignClient
)

func getPresigner() *s3.PresignClient {
	presignOnce.Do(func() {
		cfg, err := config.LoadDefaultConfig(context.Background())
		if err != nil {
			log.Printf("aws config: %v", err)
			return
		}
		if r := os.Getenv("AWS_REGION"); r != "" {
			cfg.Region = r
		}
		presigner = s3.NewPresignClient(s3.NewFromConfig(cfg))
	})
	return presigner
}

// ItemImage handles GET /api/image?path=items/ITM001/ITM001_item_image.jpg
func ItemImage(c *fiber.Ctx) error {
	p := path.Clean("/" + strings.ReplaceAll(c.Query("path"), "\\", "/"))[1:]
	// only item pictures (stored under items/), some of which have odd or missing extensions
	if p == "" || strings.Contains(p, "..") || !strings.HasPrefix(p, "items/") {
		return c.SendStatus(fiber.StatusBadRequest)
	}
	ps := getPresigner()
	bucket := os.Getenv("AWS_BUCKET")
	if ps == nil || bucket == "" || os.Getenv("AWS_ACCESS_KEY_ID") == "" {
		return c.SendStatus(fiber.StatusServiceUnavailable) // website falls back to a category photo
	}
	req, err := ps.PresignGetObject(context.Background(), &s3.GetObjectInput{
		Bucket: aws.String(bucket),
		Key:    aws.String("Files/" + p),
	}, s3.WithPresignExpires(15*time.Minute))
	if err != nil {
		log.Printf("presign %s: %v", p, err)
		return c.SendStatus(fiber.StatusNotFound)
	}
	c.Set("Cache-Control", "public, max-age=600")
	return c.Redirect(req.URL, http.StatusTemporaryRedirect)
}
