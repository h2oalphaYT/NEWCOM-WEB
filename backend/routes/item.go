package routes

import (
	"backend/controllers"

	"github.com/gofiber/fiber/v2"
)

func ItemRoute(app *fiber.App) {
	api := app.Group("/api/items")

	api.Get("/", controllers.RetrieveItems)
	api.Get("/:id", controllers.RetrieveItemById)
}
