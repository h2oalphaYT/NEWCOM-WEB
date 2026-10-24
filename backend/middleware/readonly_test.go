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
