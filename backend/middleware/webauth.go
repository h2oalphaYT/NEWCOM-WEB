package middleware

import (
	"backend/utils"
	"os"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// AllowedOrigins is the list of website origins allowed to call the API with cookies.
func AllowedOrigins() []string {
	var out []string
	for _, v := range []string{os.Getenv("WEB_ORIGIN"), os.Getenv("consumer_origin"), "http://localhost:3000", "http://127.0.0.1:3000"} {
		for _, o := range strings.Split(v, ",") {
			if o = strings.TrimRight(strings.TrimSpace(o), "/"); o != "" {
				out = append(out, o)
			}
		}
	}
	return out
}

// OriginCheck blocks state-changing requests that do not come from the website itself
// (CSRF protection on top of SameSite cookies). GET/HEAD/OPTIONS pass through.
func OriginCheck(c *fiber.Ctx) error {
	switch c.Method() {
	case fiber.MethodGet, fiber.MethodHead, fiber.MethodOptions:
		return c.Next()
	}
	origin := strings.TrimRight(c.Get("Origin"), "/")
	for _, o := range AllowedOrigins() {
		if origin == o {
			return c.Next()
		}
	}
	return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"success": false, "message": "Origin not allowed"})
}

// AdminRequired checks the admin session cookie and exposes admin_id / admin_role.
func AdminRequired(c *fiber.Ctx) error {
	claims, err := utils.ParseSession(c.Cookies(utils.AdminCookie), "admin")
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Please sign in"})
	}
	c.Locals("admin_id", claims.Subject)
	c.Locals("admin_role", claims.Role)
	return c.Next()
}

// EditorBlocked lets editors manage content but keeps admin-only areas (admin users) for admins.
func AdminOnly(c *fiber.Ctx) error {
	if c.Locals("admin_role") != "admin" {
		return c.Status(fiber.StatusForbidden).JSON(fiber.Map{"success": false, "message": "Admins only"})
	}
	return c.Next()
}

// CustomerOptional reads the shop customer session when present (checkout works for guests too).
func CustomerOptional(c *fiber.Ctx) error {
	if claims, err := utils.ParseSession(c.Cookies(utils.CustomerCookie), "customer"); err == nil {
		c.Locals("customer_id", claims.Subject)
	}
	return c.Next()
}

func CustomerRequired(c *fiber.Ctx) error {
	claims, err := utils.ParseSession(c.Cookies(utils.CustomerCookie), "customer")
	if err != nil {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Please sign in"})
	}
	c.Locals("customer_id", claims.Subject)
	return c.Next()
}
