package routes

import (
	"backend/controllers"

	"github.com/gofiber/fiber/v2"
)

func ImageRoute(app *fiber.App) {
	app.Get("/api/image", controllers.ItemImage)
}
