package routes

import (
	"backend/controllers"

	"github.com/gofiber/fiber/v2"
)

func CategoryRoute(app *fiber.App) {
	api := app.Group("/api/categories")

	api.Get("/", controllers.RetrieveCategoryList)
	api.Get("/:categoryCode/subcategories", controllers.RetrieveSubCategoryByCategory)
}
