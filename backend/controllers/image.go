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
// NEWCOM-Web-Service download endpoint uses); website media uploaded from /admin goes under
// "Files/website/". This endpoint only signs GETs under those two folders and redirects to the
// short-lived URL; it never lists or writes.

var (
	presignOnce sync.Once
	presigner   *s3.PresignClient
	s3client    *s3.Client
)

func initS3() {
	presignOnce.Do(func() {
		cfg, err := config.LoadDefaultConfig(context.Background())
		if err != nil {
			log.Printf("aws config: %v", err)
			return
		}
		if r := os.Getenv("AWS_REGION"); r != "" {
			cfg.Region = r
		}
		s3client = s3.NewFromConfig(cfg)
		presigner = s3.NewPresignClient(s3client)
	})
}

func getPresigner() *s3.PresignClient {
	initS3()
	return presigner
}

// s3Ready reports whether the bucket and access keys are configured in .env.
func s3Ready() bool {
	initS3()
	return s3client != nil && os.Getenv("AWS_BUCKET") != "" && os.Getenv("AWS_ACCESS_KEY_ID") != ""
}

// ItemImage handles GET /api/image?path=items/ITM001/ITM001_item_image.jpg
func ItemImage(c *fiber.Ctx) error {
	p := path.Clean("/" + strings.ReplaceAll(c.Query("path"), "\\", "/"))[1:]
	// only item pictures (items/, some with odd or missing extensions) and admin uploads (website/)
	if p == "" || strings.Contains(p, "..") || !(strings.HasPrefix(p, "items/") || strings.HasPrefix(p, "website/")) {
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
	// the signed URL lasts 15 minutes, so browsers may reuse the redirect for 10
	c.Set("Cache-Control", "public, max-age=600")
	return c.Redirect(req.URL, http.StatusTemporaryRedirect)
}
