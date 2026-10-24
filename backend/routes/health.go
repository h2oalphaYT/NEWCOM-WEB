package routes

import (
	"backend/controllers"

	"github.com/gofiber/fiber/v2"
)

func HealthRoute(app *fiber.App) {
	app.Get("/api/health", controllers.Health)
}
