package main

import (
	"backend/config"
	"backend/middleware"
	"backend/routes"

	"log"
	"os"
	"strings"
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

	app := fiber.New(fiber.Config{AppName: "Newcom Web API", BodyLimit: 60 << 20})

	//Database configuration
	config.DBConnect()    // inventory (read-only)
	config.WebDBConnect() // NEWCOM_WEB (website data)

	app.Use(cors.New(cors.Config{
		AllowOrigins:     strings.Join(middleware.AllowedOrigins(), ","),
		AllowMethods:     "GET,POST,PUT,DELETE,OPTIONS",
		AllowHeaders:     "Accept,Content-Type",
		AllowCredentials: true,
		MaxAge:           300,
	}))

	// Other middleware
	app.Use(requestid.New())
	app.Use(logger.New())
	app.Use(recover.New())
	app.Use(limiter.New(limiter.Config{Max: 240, Expiration: time.Minute}))

	// inventory API is fetch only; website data under /api/web and /api/admin may write
	app.Use(middleware.ReadOnly)
	app.Use(middleware.OriginCheck)

	app.Get("/", func(c *fiber.Ctx) error { return c.SendString("Newcom Web API") })
	routes.HealthRoute(app)
	routes.ItemRoute(app)
	routes.CategoryRoute(app)
	routes.BrandRoute(app)
	routes.ImageRoute(app)
	routes.WebRoute(app)
	routes.AdminRoute(app)
	app.Static("/uploads", "./uploads", fiber.Static{Browse: false, MaxAge: 86400})

	log.Printf("Application listening on port %s", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Failed to start server: %v", err)
	}
}
