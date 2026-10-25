package controllers

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

type orderIn struct {
	Name           string `json:"name"`
	Email          string `json:"email"`
	Mobile         string `json:"mobile"`
	Address        string `json:"address"`
	City           string `json:"city"`
	District       string `json:"district"`
	Province       string `json:"province"`
	DeliveryMethod string `json:"deliveryMethod"`
	PaymentMethod  string `json:"paymentMethod"`
	Notes          string        `json:"notes"`
	PromoCode      string        `json:"promoCode"`
	Lines          []orderLineIn `json:"lines"`
}

type orderLineIn struct {
	ItemCode string  `json:"itemCode"`
	Name     string  `json:"name"`
	Qty      int     `json:"qty"`
	Price    float64 `json:"price"` // only used for items the server cannot price (sample/demo items)
}

type cartLine struct {
	code, name string
	price      float64
	qty        int
	unverified bool
}

// priceCart prices every line from the live inventory / pre-built PCs. Items the server cannot
// price (sample PC-builder parts) are kept and flagged so the team confirms them.
func priceCart(in []orderLineIn) (lines []cartLine, sub float64, unverified bool, problem string) {
	for _, l := range in {
		code := clip(l.ItemCode, 40)
		qty := l.Qty
		if code == "" || qty < 1 || qty > 20 {
			return nil, 0, false, "Check the quantities in your cart"
		}
		ln := cartLine{code: code, qty: qty}
		if strings.HasPrefix(code, "PB-") {
			rows := []map[string]interface{}{}
			WDB.Raw("SELECT PrebuiltId, Name, Price FROM dbo.WebPrebuiltPc WHERE IsActive = 1 AND Slug = ?", strings.TrimPrefix(code, "PB-")).Scan(&rows)
			if len(rows) == 1 {
				pricePrebuilt(rows[0])
				ln.name = fmt.Sprint(rows[0]["Name"])
				ln.price, _ = strconv.ParseFloat(fmt.Sprint(rows[0]["Price"]), 64)
			}
		} else if DB != nil {
			if items, err := fetchWebsiteItems(code, "", "", 1, 1); err == nil && len(items) == 1 && items[0].CItemCode == code {
				it := items[0]
				if it.StockStatus == "Out of Stock" {
					return nil, 0, false, it.VcItemDescrition + " is out of stock"
				}
				ln.name = it.VcItemDescrition
				ln.price = it.SellingPrice
				if it.SpecialPrice > 0 && it.SpecialPrice < it.SellingPrice {
					ln.price = it.SpecialPrice
				}
			}
		}
		if ln.name == "" {
			ln.name = clip(l.Name, 230)
			if ln.name == "" {
				return nil, 0, false, "Unknown item in cart"
			}
			ln.name += " (price to be confirmed)"
			ln.price = l.Price
			ln.unverified = true
			unverified = true
		}
		sub += ln.price * float64(qty)
		lines = append(lines, ln)
	}
	return lines, sub, unverified, ""
}

var payMethods = map[string]bool{"card": true, "koko": true, "mintpay": true, "bank": true, "store": true}

// CreateOrder: POST /api/web/orders. Prices are taken from the live inventory (and active
// promotions), never from the browser. Guests are saved as customers too.
func CreateOrder(c *fiber.Ctx) error {
	var in orderIn
	if err := c.BodyParser(&in); err != nil {
		return bad(c, "Invalid JSON")
	}
	email := strings.ToLower(strings.TrimSpace(in.Email))
	switch {
	case strings.TrimSpace(in.Name) == "":
		return bad(c, "Enter your full name")
	case !validMobile(in.Mobile):
		return bad(c, "Enter a Sri Lankan mobile number")
	case email != "" && !validEmail(email):
		return bad(c, "Enter a valid email address")
	case !payMethods[in.PaymentMethod]:
		return bad(c, "Choose a payment method")
	case len(in.Lines) == 0 || len(in.Lines) > 50:
		return bad(c, "Your cart is empty")
	}
	if in.DeliveryMethod != "pickup" {
		in.DeliveryMethod = "delivery"
		if strings.TrimSpace(in.Address) == "" || strings.TrimSpace(in.City) == "" {
			return bad(c, "Enter your delivery address")
		}
	}

	if len(in.Lines) > 50 {
		return bad(c, "Your cart is too large; please call us for bulk orders")
	}
	lines, sub, unverified, problem := priceCart(in.Lines)
	if problem != "" {
		return bad(c, problem)
	}
	var discount float64
	var promoCode *string
	if code := normCode(in.PromoCode); code != "" {
		d, msg := applyPromoCode(code, lines, sub)
		if msg != "" {
			return bad(c, msg)
		}
		discount, promoCode = d, &code
	}

	var fee float64
	if in.DeliveryMethod == "delivery" {
		var s string
		WDB.Raw("SELECT ISNULL(SettingValue,'0') FROM dbo.WebSetting WHERE SettingKey = 'delivery_fee'").Scan(&s)
		fee, _ = strconv.ParseFloat(s, 64)
	}
	notes := clip(in.Notes, 900)
	if unverified {
		notes = strings.TrimSpace(notes + " [Contains items that are not in the live inventory; confirm prices before processing.]")
	}

	var orderNo string
	err := WDB.Transaction(func(tx *gorm.DB) error {
		// customer: the signed-in account, or a guest record matched by email/mobile
		var custID *int
		if v := c.Locals("customer_id"); v != nil {
			id, _ := strconv.Atoi(fmt.Sprint(v))
			custID = &id
		} else if email != "" {
			var id int
			tx.Raw("SELECT CustomerId FROM dbo.WebCustomer WHERE Email = ?", email).Scan(&id)
			if id == 0 {
				if err := tx.Raw(`INSERT INTO dbo.WebCustomer (Email, Name, Mobile, Address, City, District, Province) OUTPUT INSERTED.CustomerId VALUES (?, ?, ?, ?, ?, ?, ?)`,
					email, clip(in.Name, 120), clip(in.Mobile, 20), clip(in.Address, 300), clip(in.City, 80), clip(in.District, 80), clip(in.Province, 40)).Scan(&id).Error; err != nil {
					return err
				}
			}
			custID = &id
		}
		var orderID int
		for attempt := 0; attempt < 5; attempt++ {
			orderNo = "NW" + time.Now().Format("060102") + randDigits(4)
			err := tx.Raw(`INSERT INTO dbo.WebOrder (OrderNo, CustomerId, Name, Email, Mobile, Address, City, District, Province, DeliveryMethod, PaymentMethod, SubTotal, Discount, DeliveryFee, Total, Notes, PromoCode)
				OUTPUT INSERTED.OrderId VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				orderNo, custID, clip(in.Name, 120), email, clip(in.Mobile, 20), clip(in.Address, 300), clip(in.City, 80), clip(in.District, 80), clip(in.Province, 40),
				in.DeliveryMethod, in.PaymentMethod, sub, discount, fee, sub-discount+fee, notes, promoCode).Scan(&orderID).Error
			if err == nil {
				break
			}
			if !strings.Contains(err.Error(), "UNIQUE") {
				return err
			}
		}
		if orderID == 0 {
			return fmt.Errorf("could not allocate order number")
		}
		for _, l := range lines {
			if err := tx.Exec("INSERT INTO dbo.WebOrderLine (OrderId, ItemCode, ItemName, UnitPrice, Qty, LineTotal) VALUES (?, ?, ?, ?, ?, ?)",
				orderID, l.code, l.name, l.price, l.qty, l.price*float64(l.qty)).Error; err != nil {
				return err
			}
		}
		return nil
	})
	if err != nil {
		return serverErr(c, err)
	}
	return ok(c, fiber.Map{"orderNo": orderNo, "total": sub - discount + fee, "discount": discount, "deliveryFee": fee, "needsConfirmation": unverified})
}
