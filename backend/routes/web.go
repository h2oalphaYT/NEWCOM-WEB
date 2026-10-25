package routes

import (
	"backend/controllers"
	"backend/middleware"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/limiter"
)

// slow down password guessing and form spam
func strict(max int) fiber.Handler {
	return limiter.New(limiter.Config{Max: max, Expiration: time.Minute})
}

// WebRoute: public website data from NEWCOM_WEB (content, accounts, orders, support).
func WebRoute(app *fiber.App) {
	api := app.Group("/api/web", controllers.WebReady, middleware.CustomerOptional)

	api.Get("/banners", controllers.PublicBanners)
	api.Get("/promotions", controllers.PublicPromotions)
	api.Get("/settings", controllers.PublicSettings)
	api.Get("/categories", controllers.PublicCategories)
	api.Get("/prebuilt", controllers.PublicPrebuilt)
	api.Get("/prebuilt/:slug", controllers.PublicPrebuiltOne)

	api.Post("/orders", strict(10), controllers.CreateOrder)
	api.Post("/claims", strict(10), controllers.CreateClaim)
	api.Get("/claims/:ticket", strict(30), controllers.TrackClaim)
	api.Post("/bookings", strict(10), controllers.CreateBooking)
	api.Post("/newsletter", strict(10), controllers.Subscribe)

	acc := api.Group("/account")
	acc.Post("/register", strict(10), controllers.CustomerRegister)
	acc.Post("/login", strict(10), controllers.CustomerLogin)
	acc.Post("/logout", controllers.CustomerLogout)
	acc.Get("/me", middleware.CustomerRequired, controllers.CustomerMe)
	acc.Put("/me", middleware.CustomerRequired, controllers.CustomerUpdate)
	acc.Get("/orders", middleware.CustomerRequired, controllers.CustomerOrders)
}
