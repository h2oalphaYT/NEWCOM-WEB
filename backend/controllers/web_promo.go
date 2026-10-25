package controllers

import (
	"fmt"
	"math"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// Promo codes are promotions with a PromoCode. They apply only when the customer enters the code
// at checkout: to the promotion's listed items, or to the whole cart when it lists none.

func normCode(s string) string {
	return strings.ToUpper(clip(strings.TrimSpace(s), 40))
}

// applyPromoCode returns the discount for a priced cart, or a message saying why the code
// does not apply.
func applyPromoCode(code string, lines []cartLine, sub float64) (float64, string) {
	var promos []struct {
		PromotionId   int
		DiscountType  string
		DiscountValue float64
		MinOrder      *float64
	}
	WDB.Raw("SELECT PromotionId, DiscountType, DiscountValue, MinOrder FROM dbo.WebPromotion WHERE UPPER(PromoCode) = ? AND "+activeWindow, code).Scan(&promos)
	if len(promos) == 0 {
		return 0, "That promo code is not valid or has expired"
	}
	p := promos[0]
	if p.MinOrder != nil && sub < *p.MinOrder {
		return 0, fmt.Sprintf("This code needs an order of at least LKR %s", commas(*p.MinOrder))
	}
	var items []struct {
		ItemCode     string
		SpecialPrice *float64
	}
	WDB.Raw("SELECT ItemCode, SpecialPrice FROM dbo.WebPromotionItem WHERE PromotionId = ?", p.PromotionId).Scan(&items)
	listed := map[string]*float64{}
	for _, it := range items {
		listed[strings.TrimSpace(it.ItemCode)] = it.SpecialPrice
	}

	disc := 0.0
	for _, l := range lines {
		if l.unverified {
			continue
		}
		special, inPromo := listed[l.code]
		if len(listed) > 0 && !inPromo {
			continue
		}
		lineTotal := l.price * float64(l.qty)
		var d float64
		switch {
		case special != nil && *special > 0:
			d = math.Max(0, l.price-*special) * float64(l.qty)
		case p.DiscountType == "percent":
			d = lineTotal * p.DiscountValue / 100
		case p.DiscountType == "price" && len(listed) > 0:
			d = math.Max(0, l.price-p.DiscountValue) * float64(l.qty)
		case p.DiscountType == "fixed" && len(listed) > 0:
			d = math.Min(p.DiscountValue, l.price) * float64(l.qty)
		}
		disc += d
	}
	if p.DiscountType == "fixed" && len(listed) == 0 {
		disc = p.DiscountValue // a flat amount off the whole order
	}
	disc = math.Min(math.Round(disc), sub)
	if disc <= 0 {
		return 0, "This code doesn't apply to the items in your cart"
	}
	return disc, ""
}

func commas(v float64) string {
	s := fmt.Sprintf("%.0f", v)
	for i := len(s) - 3; i > 0; i -= 3 {
		s = s[:i] + "," + s[i:]
	}
	return s
}

// CheckPromo: POST /api/web/promo {code, lines} — previews the discount before ordering.
func CheckPromo(c *fiber.Ctx) error {
	var in struct {
		Code  string        `json:"code"`
		Lines []orderLineIn `json:"lines"`
	}
	if err := c.BodyParser(&in); err != nil {
		return bad(c, "Invalid JSON")
	}
	code := normCode(in.Code)
	if code == "" {
		return bad(c, "Enter a promo code")
	}
	if len(in.Lines) == 0 || len(in.Lines) > 50 {
		return bad(c, "Your cart is empty")
	}
	lines, sub, _, problem := priceCart(in.Lines)
	if problem != "" {
		return bad(c, problem)
	}
	disc, msg := applyPromoCode(code, lines, sub)
	if msg != "" {
		return bad(c, msg)
	}
	return ok(c, fiber.Map{"code": code, "discount": disc, "subTotal": sub})
}
