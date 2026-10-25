package utils

import (
	"errors"
	"os"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"github.com/golang-jwt/jwt/v5"
)

// Session tokens for the website: one cookie for admins, one for shop customers.
const (
	AdminCookie    = "nw_admin"
	CustomerCookie = "nw_customer"
)

type SessionClaims struct {
	Kind string `json:"kind"` // admin | customer
	Role string `json:"role,omitempty"`
	Name string `json:"name,omitempty"`
	jwt.RegisteredClaims
}

func jwtKey() []byte {
	k := os.Getenv("JWT_KEY")
	if k == "" {
		k = "change-me-set-JWT_KEY" // dev only; set JWT_KEY in .env
	}
	return []byte(k)
}

func SignSession(kind, subject, role, name string, ttl time.Duration) (string, error) {
	c := SessionClaims{Kind: kind, Role: role, Name: name, RegisteredClaims: jwt.RegisteredClaims{
		Subject: subject, IssuedAt: jwt.NewNumericDate(time.Now()), ExpiresAt: jwt.NewNumericDate(time.Now().Add(ttl)),
	}}
	return jwt.NewWithClaims(jwt.SigningMethodHS256, c).SignedString(jwtKey())
}

func ParseSession(token, kind string) (*SessionClaims, error) {
	c := &SessionClaims{}
	t, err := jwt.ParseWithClaims(token, c, func(t *jwt.Token) (interface{}, error) { return jwtKey(), nil },
		jwt.WithValidMethods([]string{"HS256"}))
	if err != nil || !t.Valid {
		return nil, errors.New("invalid session")
	}
	if c.Kind != kind {
		return nil, errors.New("wrong session kind")
	}
	return c, nil
}

// SetSessionCookie stores the token in an HttpOnly cookie. SameSite=Lax keeps it off cross-site
// requests; set COOKIE_SECURE=true when the site runs on https.
func SetSessionCookie(c *fiber.Ctx, name, token string, ttl time.Duration) {
	c.Cookie(&fiber.Cookie{
		Name: name, Value: token, Path: "/", HTTPOnly: true, SameSite: "Lax",
		Secure: strings.EqualFold(os.Getenv("COOKIE_SECURE"), "true"), Expires: time.Now().Add(ttl),
	})
}

func ClearSessionCookie(c *fiber.Ctx, name string) {
	c.Cookie(&fiber.Cookie{Name: name, Value: "", Path: "/", HTTPOnly: true, SameSite: "Lax", Expires: time.Unix(0, 0)})
}
