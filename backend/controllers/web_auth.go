package controllers

import (
	"backend/utils"
	"fmt"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"golang.org/x/crypto/bcrypt"
)

const (
	adminTTL    = 12 * time.Hour
	customerTTL = 30 * 24 * time.Hour
)

// a valid bcrypt hash used to keep login timing the same when the email does not exist
var dummyHash, _ = bcrypt.GenerateFromPassword([]byte("not-a-real-password"), 12)

type credentials struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

// ---------- admins ----------

// AdminLogin: POST /api/admin/login
func AdminLogin(c *fiber.Ctx) error {
	var in credentials
	if err := c.BodyParser(&in); err != nil {
		return bad(c, "Invalid JSON")
	}
	var rows []struct {
		AdminId      int
		Name         string
		Role         string
		PasswordHash string
	}
	WDB.Raw("SELECT AdminId, Name, Role, PasswordHash FROM dbo.WebAdminUser WHERE Email = ? AND IsActive = 1", strings.ToLower(strings.TrimSpace(in.Email))).Scan(&rows)
	hash := dummyHash
	if len(rows) == 1 {
		hash = []byte(rows[0].PasswordHash)
	}
	if bcrypt.CompareHashAndPassword(hash, []byte(in.Password)) != nil || len(rows) != 1 {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Wrong email or password"})
	}
	a := rows[0]
	tok, err := utils.SignSession("admin", fmt.Sprint(a.AdminId), a.Role, a.Name, adminTTL)
	if err != nil {
		return serverErr(c, err)
	}
	WDB.Exec("UPDATE dbo.WebAdminUser SET LastLoginAt = SYSUTCDATETIME() WHERE AdminId = ?", a.AdminId)
	utils.SetSessionCookie(c, utils.AdminCookie, tok, adminTTL)
	return ok(c, fiber.Map{"name": a.Name, "role": a.Role})
}

func AdminLogout(c *fiber.Ctx) error {
	utils.ClearSessionCookie(c, utils.AdminCookie)
	return ok(c, nil)
}

// AdminMe: GET /api/admin/me
func AdminMe(c *fiber.Ctx) error {
	var rows []struct {
		AdminId int
		Email   string
		Name    string
		Role    string
	}
	WDB.Raw("SELECT AdminId, Email, Name, Role FROM dbo.WebAdminUser WHERE AdminId = ? AND IsActive = 1", c.Locals("admin_id")).Scan(&rows)
	if len(rows) != 1 {
		utils.ClearSessionCookie(c, utils.AdminCookie)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Please sign in"})
	}
	return ok(c, rows[0])
}

// AdminChangePassword: POST /api/admin/password {current, next}
func AdminChangePassword(c *fiber.Ctx) error {
	var in struct{ Current, Next string }
	if err := c.BodyParser(&in); err != nil {
		return bad(c, "Invalid JSON")
	}
	if len(in.Next) < 10 {
		return bad(c, "New password must be at least 10 characters")
	}
	var hash string
	WDB.Raw("SELECT PasswordHash FROM dbo.WebAdminUser WHERE AdminId = ?", c.Locals("admin_id")).Scan(&hash)
	if bcrypt.CompareHashAndPassword([]byte(hash), []byte(in.Current)) != nil {
		return bad(c, "Current password is wrong")
	}
	nh, _ := bcrypt.GenerateFromPassword([]byte(in.Next), 12)
	WDB.Exec("UPDATE dbo.WebAdminUser SET PasswordHash = ? WHERE AdminId = ?", string(nh), c.Locals("admin_id"))
	return ok(c, nil)
}

// AdminUsers: GET /api/admin/users (admins only)
func AdminUsers(c *fiber.Ctx) error {
	rows := []map[string]interface{}{}
	WDB.Raw("SELECT AdminId, Email, Name, Role, IsActive, CreatedAt, LastLoginAt FROM dbo.WebAdminUser ORDER BY AdminId").Scan(&rows)
	return ok(c, rows)
}

// AdminUserSave: POST /api/admin/users {email, name, role, password, isActive} (admins only)
func AdminUserSave(c *fiber.Ctx) error {
	var in struct {
		Email, Name, Role, Password string
		IsActive                    *bool
	}
	if err := c.BodyParser(&in); err != nil {
		return bad(c, "Invalid JSON")
	}
	email := strings.ToLower(strings.TrimSpace(in.Email))
	if !validEmail(email) || strings.TrimSpace(in.Name) == "" {
		return bad(c, "Enter a valid email and name")
	}
	if in.Role != "admin" && in.Role != "editor" {
		in.Role = "editor"
	}
	active := in.IsActive == nil || *in.IsActive
	if in.Password != "" {
		if len(in.Password) < 10 {
			return bad(c, "Password must be at least 10 characters")
		}
		h, _ := bcrypt.GenerateFromPassword([]byte(in.Password), 12)
		err := WDB.Exec(`MERGE dbo.WebAdminUser AS t USING (SELECT ? AS Email) AS s ON t.Email = s.Email
			WHEN MATCHED THEN UPDATE SET Name = ?, Role = ?, IsActive = ?, PasswordHash = ?
			WHEN NOT MATCHED THEN INSERT (Email, Name, Role, IsActive, PasswordHash) VALUES (?, ?, ?, ?, ?);`,
			email, clip(in.Name, 120), in.Role, active, string(h), email, clip(in.Name, 120), in.Role, active, string(h)).Error
		if err != nil {
			return serverErr(c, err)
		}
		return ok(c, nil)
	}
	res := WDB.Exec("UPDATE dbo.WebAdminUser SET Name = ?, Role = ?, IsActive = ? WHERE Email = ?", clip(in.Name, 120), in.Role, active, email)
	if res.RowsAffected == 0 {
		return bad(c, "New users need a password")
	}
	return ok(c, nil)
}

// ---------- shop customers ----------

type customerRow struct {
	CustomerId      int    `json:"id"`
	Email           string `json:"email"`
	Name            string `json:"name"`
	Mobile          string `json:"mobile"`
	Address         string `json:"address"`
	City            string `json:"city"`
	District        string `json:"district"`
	Province        string `json:"province"`
	NewsletterOptIn bool   `json:"newsletter"`
}

func loadCustomer(id interface{}) (*customerRow, error) {
	var rows []customerRow
	err := WDB.Raw(`SELECT CustomerId, Email, Name, ISNULL(Mobile,'') Mobile, ISNULL(Address,'') Address, ISNULL(City,'') City,
		ISNULL(District,'') District, ISNULL(Province,'') Province, NewsletterOptIn FROM dbo.WebCustomer WHERE CustomerId = ?`, id).Scan(&rows).Error
	if err != nil || len(rows) == 0 {
		return nil, err
	}
	return &rows[0], nil
}

// CustomerRegister: POST /api/web/account/register {name, email, mobile, password}
func CustomerRegister(c *fiber.Ctx) error {
	var in struct{ Name, Email, Mobile, Password string }
	if err := c.BodyParser(&in); err != nil {
		return bad(c, "Invalid JSON")
	}
	email := strings.ToLower(strings.TrimSpace(in.Email))
	switch {
	case strings.TrimSpace(in.Name) == "":
		return bad(c, "Enter your name")
	case !validEmail(email):
		return bad(c, "Enter a valid email address")
	case in.Mobile != "" && !validMobile(in.Mobile):
		return bad(c, "Enter a Sri Lankan mobile number")
	case len(in.Password) < 8:
		return bad(c, "Password must be at least 8 characters")
	}
	h, _ := bcrypt.GenerateFromPassword([]byte(in.Password), 12)
	// a guest who checked out before can claim the account by registering with the same email
	var existing []struct {
		CustomerId   int
		PasswordHash *string
	}
	WDB.Raw("SELECT CustomerId, PasswordHash FROM dbo.WebCustomer WHERE Email = ?", email).Scan(&existing)
	var id int
	if len(existing) == 1 {
		if existing[0].PasswordHash != nil && *existing[0].PasswordHash != "" {
			return bad(c, "An account with this email already exists. Please sign in.")
		}
		id = existing[0].CustomerId
		WDB.Exec("UPDATE dbo.WebCustomer SET Name = ?, Mobile = ?, PasswordHash = ?, LastLoginAt = SYSUTCDATETIME() WHERE CustomerId = ?", clip(in.Name, 120), clip(in.Mobile, 20), string(h), id)
	} else {
		if err := WDB.Raw("INSERT INTO dbo.WebCustomer (Email, Name, Mobile, PasswordHash, LastLoginAt) OUTPUT INSERTED.CustomerId VALUES (?, ?, ?, ?, SYSUTCDATETIME())",
			email, clip(in.Name, 120), clip(in.Mobile, 20), string(h)).Scan(&id).Error; err != nil {
			return serverErr(c, err)
		}
	}
	return startCustomerSession(c, id)
}

func startCustomerSession(c *fiber.Ctx, id int) error {
	tok, err := utils.SignSession("customer", fmt.Sprint(id), "", "", customerTTL)
	if err != nil {
		return serverErr(c, err)
	}
	utils.SetSessionCookie(c, utils.CustomerCookie, tok, customerTTL)
	cu, _ := loadCustomer(id)
	return ok(c, cu)
}

// CustomerLogin: POST /api/web/account/login
func CustomerLogin(c *fiber.Ctx) error {
	var in credentials
	if err := c.BodyParser(&in); err != nil {
		return bad(c, "Invalid JSON")
	}
	var rows []struct {
		CustomerId   int
		PasswordHash *string
	}
	WDB.Raw("SELECT CustomerId, PasswordHash FROM dbo.WebCustomer WHERE Email = ?", strings.ToLower(strings.TrimSpace(in.Email))).Scan(&rows)
	hash := dummyHash
	if len(rows) == 1 && rows[0].PasswordHash != nil {
		hash = []byte(*rows[0].PasswordHash)
	}
	if bcrypt.CompareHashAndPassword(hash, []byte(in.Password)) != nil || len(rows) != 1 {
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Wrong email or password"})
	}
	WDB.Exec("UPDATE dbo.WebCustomer SET LastLoginAt = SYSUTCDATETIME() WHERE CustomerId = ?", rows[0].CustomerId)
	return startCustomerSession(c, rows[0].CustomerId)
}

func CustomerLogout(c *fiber.Ctx) error {
	utils.ClearSessionCookie(c, utils.CustomerCookie)
	return ok(c, nil)
}

// CustomerMe: GET /api/web/account/me
func CustomerMe(c *fiber.Ctx) error {
	cu, err := loadCustomer(c.Locals("customer_id"))
	if err != nil || cu == nil {
		utils.ClearSessionCookie(c, utils.CustomerCookie)
		return c.Status(fiber.StatusUnauthorized).JSON(fiber.Map{"success": false, "message": "Please sign in"})
	}
	return ok(c, cu)
}

// CustomerUpdate: PUT /api/web/account/me
func CustomerUpdate(c *fiber.Ctx) error {
	var in customerRow
	if err := c.BodyParser(&in); err != nil {
		return bad(c, "Invalid JSON")
	}
	if strings.TrimSpace(in.Name) == "" {
		return bad(c, "Enter your name")
	}
	if in.Mobile != "" && !validMobile(in.Mobile) {
		return bad(c, "Enter a Sri Lankan mobile number")
	}
	WDB.Exec(`UPDATE dbo.WebCustomer SET Name = ?, Mobile = ?, Address = ?, City = ?, District = ?, Province = ?, NewsletterOptIn = ? WHERE CustomerId = ?`,
		clip(in.Name, 120), clip(in.Mobile, 20), clip(in.Address, 300), clip(in.City, 80), clip(in.District, 80), clip(in.Province, 40), in.NewsletterOptIn, c.Locals("customer_id"))
	cu, _ := loadCustomer(c.Locals("customer_id"))
	return ok(c, cu)
}

// CustomerOrders: GET /api/web/account/orders
func CustomerOrders(c *fiber.Ctx) error {
	rows := []map[string]interface{}{}
	WDB.Raw(`SELECT OrderId, OrderNo, Status, Total, PaymentMethod, CreatedAt FROM dbo.WebOrder WHERE CustomerId = ? ORDER BY OrderId DESC`, c.Locals("customer_id")).Scan(&rows)
	for _, r := range rows {
		lines := []map[string]interface{}{}
		WDB.Raw("SELECT ItemCode, ItemName, UnitPrice, Qty, LineTotal FROM dbo.WebOrderLine WHERE OrderId = ?", r["OrderId"]).Scan(&lines)
		r["lines"] = normalize(lines)
	}
	return ok(c, normalize(rows))
}
