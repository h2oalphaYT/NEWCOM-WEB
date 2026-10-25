package middleware

import (
	"net/http/httptest"
	"testing"

	"github.com/gofiber/fiber/v2"
)

func TestReadOnly(t *testing.T) {
	app := fiber.New()
	app.Use(ReadOnly)
	app.All("/x", func(c *fiber.Ctx) error { return c.SendString("ok") })

	cases := map[string]int{"GET": 200, "HEAD": 200, "POST": 405, "PUT": 405, "DELETE": 405, "PATCH": 405}
	for method, want := range cases {
		resp, err := app.Test(httptest.NewRequest(method, "/x", nil))
		if err != nil {
			t.Fatal(err)
		}
		if resp.StatusCode != want {
			t.Errorf("%s: got %d, want %d", method, resp.StatusCode, want)
		}
	}
}

func TestReadOnlyAllowsWebWrites(t *testing.T) {
	app := fiber.New()
	app.Use(ReadOnly)
	app.All("/*", func(c *fiber.Ctx) error { return c.SendString("ok") })
	cases := map[string]int{"/api/web/orders": 200, "/api/admin/r/banners": 200, "/api/items": 405, "/api/categories": 405}
	for path, want := range cases {
		resp, _ := app.Test(httptest.NewRequest("POST", path, nil))
		if resp.StatusCode != want {
			t.Errorf("POST %s: got %d, want %d", path, resp.StatusCode, want)
		}
	}
}

func TestOriginCheck(t *testing.T) {
	t.Setenv("WEB_ORIGIN", "https://newcom.lk")
	app := fiber.New()
	app.Use(OriginCheck)
	app.All("/*", func(c *fiber.Ctx) error { return c.SendString("ok") })
	for origin, want := range map[string]int{"https://newcom.lk": 200, "http://localhost:3000": 200, "https://evil.example": 403, "": 403} {
		req := httptest.NewRequest("POST", "/api/web/orders", nil)
		if origin != "" {
			req.Header.Set("Origin", origin)
		}
		resp, _ := app.Test(req)
		if resp.StatusCode != want {
			t.Errorf("origin %q: got %d, want %d", origin, resp.StatusCode, want)
		}
	}
}
