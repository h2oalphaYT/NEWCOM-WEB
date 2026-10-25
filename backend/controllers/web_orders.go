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
	Notes          string `json:"notes"`
	Lines          []struct {
		ItemCode string  `json:"itemCode"`
		Name     string  `json:"name"`
		Qty      int     `json:"qty"`
		Price    float64 `json:"price"` // only used for items the server cannot price (sample/demo items)
	} `json:"lines"`
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

	type line struct {
		code, name string
		price      float64
		qty        int
		unverified bool
	}
	var lines []line
	unverified := false
	sub := 0.0
	for _, l := range in.Lines {
		code := clip(l.ItemCode, 40)
		qty := l.Qty
		if code == "" || qty < 1 || qty > 20 {
			return bad(c, "Check the quantities in your cart")
		}
		ln := line{code: code, qty: qty}
		if strings.HasPrefix(code, "PB-") {
			// pre-built PC from NEWCOM_WEB
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
					return bad(c, it.VcItemDescrition+" is out of stock")
				}
				ln.name = it.VcItemDescrition
				ln.price = it.SellingPrice
				if it.SpecialPrice > 0 && it.SpecialPrice < it.SellingPrice {
					ln.price = it.SpecialPrice
				}
			}
		}
		if ln.name == "" {
			// not a live inventory item (e.g. a sample PC-builder part): keep it, flagged for the team to price
			ln.name = clip(l.Name, 230)
			if ln.name == "" {
				return bad(c, "Unknown item in cart")
			}
			ln.name += " (price to be confirmed)"
			ln.price = l.Price
			ln.unverified = true
			unverified = true
		}
		sub += ln.price * float64(qty)
		lines = append(lines, ln)
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
			err := tx.Raw(`INSERT INTO dbo.WebOrder (OrderNo, CustomerId, Name, Email, Mobile, Address, City, District, Province, DeliveryMethod, PaymentMethod, SubTotal, DeliveryFee, Total, Notes)
				OUTPUT INSERTED.OrderId VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				orderNo, custID, clip(in.Name, 120), email, clip(in.Mobile, 20), clip(in.Address, 300), clip(in.City, 80), clip(in.District, 80), clip(in.Province, 40),
				in.DeliveryMethod, in.PaymentMethod, sub, fee, sub+fee, notes).Scan(&orderID).Error
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
	return ok(c, fiber.Map{"orderNo": orderNo, "total": sub + fee, "deliveryFee": fee, "needsConfirmation": unverified})
}
