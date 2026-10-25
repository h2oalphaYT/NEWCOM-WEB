package routes

import (
	"backend/controllers"
	"backend/middleware"

	"github.com/gofiber/fiber/v2"
)

// AdminRoute: website management (banners, promotions, pre-built PCs, orders, customers, ...).
func AdminRoute(app *fiber.App) {
	api := app.Group("/api/admin", controllers.WebReady)
	api.Post("/login", strict(10), controllers.AdminLogin)
	api.Post("/logout", controllers.AdminLogout)

	auth := api.Group("", middleware.AdminRequired)
	auth.Get("/me", controllers.AdminMe)
	auth.Post("/password", controllers.AdminChangePassword)
	auth.Get("/stats", controllers.AdminStats)
	auth.Post("/upload", controllers.AdminUpload)
	auth.Get("/users", middleware.AdminOnly, controllers.AdminUsers)
	auth.Post("/users", middleware.AdminOnly, controllers.AdminUserSave)

	// generic resources: banners, promotions, prebuilt, categories, itemcontent, itemimages,
	// settings, orders, claims, bookings, customers, newsletter
	auth.Get("/r/:res", controllers.AdminList)
	auth.Get("/r/:res/:id", controllers.AdminGet)
	auth.Post("/r/:res", controllers.AdminCreate)
	auth.Put("/r/:res/:id", controllers.AdminUpdate)
	auth.Delete("/r/:res/:id", middleware.AdminOnly, controllers.AdminDelete)
}
