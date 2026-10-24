package middleware

import (
	"github.com/gofiber/fiber/v2"
)

// ReadOnly rejects every method except GET/HEAD/OPTIONS.
// The website only displays inventory data; all writes stay in the Newcom Inventory system.
func ReadOnly(c *fiber.Ctx) error {
	switch c.Method() {
	case fiber.MethodGet, fiber.MethodHead, fiber.MethodOptions:
		return c.Next()
	}
	return c.Status(fiber.StatusMethodNotAllowed).JSON(fiber.Map{
		"success": false,
		"message": "Read-only API",
	})
}
