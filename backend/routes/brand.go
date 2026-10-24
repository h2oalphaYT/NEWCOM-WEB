package routes

import (
	"backend/controllers"

	"github.com/gofiber/fiber/v2"
)

func BrandRoute(app *fiber.App) {
	api := app.Group("/api/brands")

	api.Get("/", controllers.RetrieveBrands)
}
