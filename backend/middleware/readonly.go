package middleware

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

// ReadOnly rejects every method except GET/HEAD/OPTIONS for the inventory API.
// The website only displays inventory data; all inventory writes stay in the Newcom Inventory system.
// Website-owned data (NEWCOM_WEB) lives under /api/web and /api/admin and is allowed to write.
func ReadOnly(c *fiber.Ctx) error {
	switch c.Method() {
	case fiber.MethodGet, fiber.MethodHead, fiber.MethodOptions:
		return c.Next()
	}
	if p := c.Path(); strings.HasPrefix(p, "/api/web/") || strings.HasPrefix(p, "/api/admin/") {
		return c.Next()
	}
	return c.Status(fiber.StatusMethodNotAllowed).JSON(fiber.Map{
		"success": false,
		"message": "Read-only API",
	})
}
