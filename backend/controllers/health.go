package controllers

import (
	"github.com/gofiber/fiber/v2"
)

// Health reports whether the API can reach the database.
func Health(c *fiber.Ctx) error {
	sqlDB, err := DB.DB()
	if err != nil || sqlDB.Ping() != nil {
		return c.Status(fiber.StatusServiceUnavailable).JSON(fiber.Map{"success": false, "db": "down"})
	}
	return c.JSON(fiber.Map{"success": true, "db": "up"})
}
