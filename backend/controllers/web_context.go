package controllers

import (
	"crypto/rand"
	"fmt"
	"math/big"
	"regexp"
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// WDB is the website database (NEWCOM_WEB). Nil when it has not been created yet.
var WDB *gorm.DB

func InitWeb(db *gorm.DB) { WDB = db }

// WebReady answers 503 for website endpoints until NEWCOM_WEB exists.
func WebReady(c *fiber.Ctx) error {
	if WDB == nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"success": false, "message": "Website database not set up yet (run: go run ./cmd/migrate)"})
	}
	return c.Next()
}

var (
	reEmail  = regexp.MustCompile(`^[^@\s]+@[^@\s]+\.[^@\s]{2,}$`)
	reMobile = regexp.MustCompile(`^(\+94|0)?7\d{8}$`)
)

func validEmail(s string) bool { return reEmail.MatchString(strings.TrimSpace(s)) }
func validMobile(s string) bool {
	return reMobile.MatchString(strings.NewReplacer(" ", "", "-", "").Replace(s))
}

// clip trims and shortens free text to the column size.
func clip(s string, n int) string {
	s = strings.TrimSpace(s)
	if len([]rune(s)) > n {
		return string([]rune(s)[:n])
	}
	return s
}

func randDigits(n int) string {
	var b strings.Builder
	for i := 0; i < n; i++ {
		d, _ := rand.Int(rand.Reader, big.NewInt(10))
		fmt.Fprint(&b, d.Int64())
	}
	return b.String()
}

func bad(c *fiber.Ctx, msg string) error {
	return c.Status(fiber.StatusBadRequest).JSON(fiber.Map{"success": false, "message": msg})
}

func ok(c *fiber.Ctx, payload interface{}) error {
	return c.JSON(fiber.Map{"success": true, "payload": payload})
}

func serverErr(c *fiber.Ctx, err error) error {
	fmt.Println("web api error:", err)
	return c.Status(fiber.StatusInternalServerError).JSON(fiber.Map{"success": false, "message": "Something went wrong"})
}

// normalize converts driver values that JSON would mangle: SQL Server DECIMAL columns arrive as
// []byte (which encoding/json would base64), so turn them into numbers (or strings).
func normalize(rows []map[string]interface{}) []map[string]interface{} {
	for _, r := range rows {
		for k, v := range r {
			switch b := v.(type) {
			case []byte:
				s := string(b)
				if f, err := strconv.ParseFloat(s, 64); err == nil {
					r[k] = f
				} else {
					r[k] = s
				}
			case []map[string]interface{}:
				normalize(b)
			}
		}
	}
	return rows
}
