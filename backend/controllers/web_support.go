package controllers

import (
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
)

var claimStages = []string{"Submitted", "Received at service centre", "Diagnosis", "Repair or replacement", "Ready for collection"}

// CreateClaim: POST /api/web/claims
func CreateClaim(c *fiber.Ctx) error {
	var in struct{ Name, Mobile, Email, Invoice, Product, Serial, Issue, Branch string }
	if err := c.BodyParser(&in); err != nil {
		return bad(c, "Invalid JSON")
	}
	switch {
	case strings.TrimSpace(in.Name) == "":
		return bad(c, "Enter your name")
	case !validMobile(in.Mobile):
		return bad(c, "Enter a Sri Lankan mobile number")
	case in.Email != "" && !validEmail(in.Email):
		return bad(c, "Enter a valid email or leave it blank")
	case strings.TrimSpace(in.Invoice) == "" || strings.TrimSpace(in.Product) == "" || strings.TrimSpace(in.Serial) == "":
		return bad(c, "Invoice number, product and serial number are required")
	case len(strings.TrimSpace(in.Issue)) < 10:
		return bad(c, "Describe the problem in a sentence or two")
	}
	var cust interface{}
	if v := c.Locals("customer_id"); v != nil {
		cust = v
	}
	var ticket string
	var err error
	for attempt := 0; attempt < 5; attempt++ {
		ticket = fmt.Sprintf("RMA-%d-%s", time.Now().Year(), randDigits(5))
		err = WDB.Exec(`INSERT INTO dbo.WebWarrantyClaim (TicketNo, CustomerId, Name, Mobile, Email, InvoiceNo, Product, SerialNo, Issue, Branch) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
			ticket, cust, clip(in.Name, 120), clip(in.Mobile, 20), clip(strings.ToLower(in.Email), 200), clip(in.Invoice, 60), clip(in.Product, 200), clip(in.Serial, 80), clip(in.Issue, 2000), clip(in.Branch, 60)).Error
		if err == nil || !strings.Contains(err.Error(), "UNIQUE") {
			break
		}
	}
	if err != nil {
		return serverErr(c, err)
	}
	return ok(c, fiber.Map{"ticket": ticket, "stages": claimStages, "stage": 0})
}

// TrackClaim: GET /api/web/claims/:ticket?mobile=07... (the mobile number must match)
func TrackClaim(c *fiber.Ctx) error {
	digits := func(s string) string { // last 9 digits identify a Sri Lankan mobile (07X XXX XXXX / +947X...)
		s = strings.NewReplacer(" ", "", "-", "", "+", "").Replace(s)
		if len(s) < 9 {
			return ""
		}
		return s[len(s)-9:]
	}
	mobile := digits(c.Query("mobile"))
	rows := []map[string]interface{}{}
	WDB.Raw(`SELECT TicketNo, Product, SerialNo, Branch, Stage, Status, CreatedAt, UpdatedAt, Mobile FROM dbo.WebWarrantyClaim WHERE TicketNo = ?`, strings.ToUpper(strings.TrimSpace(c.Params("ticket")))).Scan(&rows)
	if len(rows) == 0 || mobile == "" || digits(fmt.Sprint(rows[0]["Mobile"])) != mobile {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "No claim found with that ticket and mobile number"})
	}
	delete(rows[0], "Mobile")
	rows[0]["stages"] = claimStages
	return ok(c, rows[0])
}

// CreateBooking: POST /api/web/bookings
func CreateBooking(c *fiber.Ctx) error {
	var in struct{ Service, Name, Mobile, Device, Date, Branch, Details string }
	if err := c.BodyParser(&in); err != nil {
		return bad(c, "Invalid JSON")
	}
	switch {
	case strings.TrimSpace(in.Service) == "":
		return bad(c, "Choose a service")
	case strings.TrimSpace(in.Name) == "":
		return bad(c, "Enter your name")
	case !validMobile(in.Mobile):
		return bad(c, "Enter a Sri Lankan mobile number")
	case strings.TrimSpace(in.Device) == "":
		return bad(c, "Tell us which device or PC it is")
	}
	var date interface{}
	if d, err := time.Parse("2006-01-02", in.Date); err == nil {
		date = d
	}
	var id int
	if err := WDB.Raw(`INSERT INTO dbo.WebServiceBooking (Service, Name, Mobile, Device, PreferredDate, Branch, Details) OUTPUT INSERTED.BookingId VALUES (?, ?, ?, ?, ?, ?, ?)`,
		clip(in.Service, 80), clip(in.Name, 120), clip(in.Mobile, 20), clip(in.Device, 200), date, clip(in.Branch, 60), clip(in.Details, 2000)).Scan(&id).Error; err != nil {
		return serverErr(c, err)
	}
	return ok(c, fiber.Map{"bookingId": id})
}

// Subscribe: POST /api/web/newsletter {email}
func Subscribe(c *fiber.Ctx) error {
	var in struct{ Email string }
	if err := c.BodyParser(&in); err != nil || !validEmail(in.Email) {
		return bad(c, "Enter a valid email address")
	}
	email := strings.ToLower(strings.TrimSpace(in.Email))
	WDB.Exec(`MERGE dbo.WebNewsletter AS t USING (SELECT ? AS Email) AS s ON t.Email = s.Email
		WHEN MATCHED THEN UPDATE SET IsActive = 1, ConsentAt = SYSUTCDATETIME()
		WHEN NOT MATCHED THEN INSERT (Email) VALUES (?);`, email, email)
	return ok(c, nil)
}
