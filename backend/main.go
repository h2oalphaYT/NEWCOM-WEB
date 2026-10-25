package main

import (
	"backend/config"
	"backend/middleware"
	"backend/routes"

	"log"
	"os"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/gofiber/fiber/v2/middleware/cors"
	"github.com/gofiber/fiber/v2/middleware/limiter"
	"github.com/gofiber/fiber/v2/middleware/logger"
	"github.com/gofiber/fiber/v2/middleware/recover"
	"github.com/gofiber/fiber/v2/middleware/requestid"
	"github.com/joho/godotenv"
)

func init() {
	if err := godotenv.Load(".env"); err != nil {
		log.Println("env not loaded, using process environment")
		return
	}
	log.Println("env load successfully!")
}

func main() {
	port := os.Getenv("PORT")
	if port == "" {
		port = "8090"
	}

	app := fiber.New(fiber.Config{AppName: "Newcom Web API"})

	//Database configuration
	config.DBConnect()

	app.Use(cors.New(cors.Config{
		AllowOrigins: os.Getenv("consumer_origin"),
		AllowMethods: "GET,OPTIONS",
		AllowHeaders: "Accept,Content-Type",
		MaxAge:       300,
	}))

	// Other middleware
	app.Use(requestid.New())
	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(limiter.New(limiter.Config{Max: 120, Expiration: time.Minute}))

	// public website API: fetch only, never writes to the inventory database
	app.Use(middleware.ReadOnly)

	app.Get("/", func(c *fiber.Ctx) error { return c.SendString("Newcom Web API") })
	routes.HealthRoute(app)
	routes.ItemRoute(app)
	routes.CategoryRoute(app)
	routes.BrandRoute(app)
	routes.ImageRoute(app)

	log.Printf("Application listening on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
