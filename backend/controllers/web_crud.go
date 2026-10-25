package controllers

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"github.com/gofiber/fiber/v2"
	"gorm.io/gorm"
)

// Generic admin CRUD over NEWCOM_WEB tables. Every table and column name comes from the fixed
// resource definitions below (never from the request), and every value is a bound parameter.

type field struct {
	Col      string
	Kind     string // str | text | int | bool | dec | date
	Max      int    // max length for str/text
	Required bool
	ReadOnly bool // listed but not editable from the admin
}

type child struct {
	Table, FK, PK, Order string
	Fields               []field
}

type resource struct {
	Table, PK  string
	AutoPK     bool
	Fields     []field
	Order      string
	Search     []string
	Touch      bool // has UpdatedAt
	Child      *child
	NoCreate   bool
	NoDelete   bool
	ListFields []string // smaller column set for lists (default: all)
}

var resources = map[string]resource{
	"banners": {Table: "WebBanner", PK: "BannerId", AutoPK: true, Touch: true, Order: "Placement, SortOrder, BannerId DESC", Search: []string{"Title", "Subtitle"},
		Fields: []field{{"Placement", "str", 40, true, false}, {"Eyebrow", "str", 80, false, false}, {"Title", "str", 200, true, false}, {"Subtitle", "str", 400, false, false},
			{"MediaType", "str", 10, true, false}, {"MediaUrl", "str", 500, false, false}, {"PosterUrl", "str", 500, false, false},
			{"ButtonText", "str", 60, false, false}, {"ButtonUrl", "str", 300, false, false}, {"Button2Text", "str", 60, false, false}, {"Button2Url", "str", 300, false, false},
			{"StartDate", "date", 0, false, false}, {"EndDate", "date", 0, false, false}, {"SortOrder", "int", 0, false, false}, {"IsActive", "bool", 0, false, false}}},
	"promotions": {Table: "WebPromotion", PK: "PromotionId", AutoPK: true, Touch: true, Order: "SortOrder, PromotionId DESC", Search: []string{"Name", "Slug"},
		Fields: []field{{"Name", "str", 160, true, false}, {"Slug", "str", 160, true, false}, {"Description", "str", 1000, false, false}, {"BadgeText", "str", 40, false, false},
			{"DiscountType", "str", 10, true, false}, {"DiscountValue", "dec", 0, false, false}, {"ImageUrl", "str", 500, false, false},
			{"StartDate", "date", 0, false, false}, {"EndDate", "date", 0, false, false}, {"SortOrder", "int", 0, false, false}, {"IsActive", "bool", 0, false, false},
			{"PromoCode", "str", 40, false, false}, {"MinOrder", "dec", 0, false, false}, {"ShowInBar", "bool", 0, false, false}},
		Child: &child{Table: "WebPromotionItem", FK: "PromotionId", Order: "ItemCode", Fields: []field{{"ItemCode", "str", 20, true, false}, {"SpecialPrice", "dec", 0, false, false}}}},
	"prebuilt": {Table: "WebPrebuiltPc", PK: "PrebuiltId", AutoPK: true, Touch: true, Order: "SortOrder, PrebuiltId DESC", Search: []string{"Name", "Slug", "Tier"},
		Fields: []field{{"Name", "str", 160, true, false}, {"Slug", "str", 160, true, false}, {"Tagline", "str", 200, false, false}, {"Tier", "str", 40, false, false},
			{"UseCase", "str", 80, false, false}, {"Platform", "str", 10, false, false}, {"Description", "text", 20000, false, false}, {"ImageUrl", "str", 500, false, false},
			{"Price", "dec", 0, false, false}, {"IsFeatured", "bool", 0, false, false}, {"IsActive", "bool", 0, false, false}, {"SortOrder", "int", 0, false, false}},
		Child: &child{Table: "WebPrebuiltPcPart", FK: "PrebuiltId", PK: "PartId", Order: "SortOrder, PartId", Fields: []field{{"Slot", "str", 20, true, false},
			{"ItemCode", "str", 20, false, false}, {"PartName", "str", 200, true, false}, {"Qty", "int", 0, false, false}, {"SortOrder", "int", 0, false, false}}}},
	"categories": {Table: "WebCategory", PK: "CategoryId", AutoPK: true, Order: "SortOrder, Name", Search: []string{"Name", "Slug"},
		Fields: []field{{"Name", "str", 120, true, false}, {"Slug", "str", 120, true, false}, {"ParentId", "int", 0, false, false}, {"InventoryCategoryCodes", "str", 400, false, false},
			{"SearchKeyword", "str", 80, false, false}, {"ImageUrl", "str", 500, false, false}, {"SortOrder", "int", 0, false, false}, {"IsVisible", "bool", 0, false, false}}},
	"itemcontent": {Table: "WebItemContent", PK: "ItemCode", Touch: true, Order: "ItemCode", Search: []string{"ItemCode", "Title", "Brand"},
		Fields: []field{{"ItemCode", "str", 20, true, false}, {"Brand", "str", 80, false, false}, {"Title", "str", 200, false, false}, {"Description", "text", 20000, false, false},
			{"SpecsJson", "text", 20000, false, false}, {"IsFeatured", "bool", 0, false, false}, {"IsNewArrival", "bool", 0, false, false}, {"IsHidden", "bool", 0, false, false},
			{"SeoTitle", "str", 200, false, false}, {"SeoDescription", "str", 400, false, false}}},
	"itemimages": {Table: "WebItemImage", PK: "ImageId", AutoPK: true, Order: "ItemCode, SortOrder", Search: []string{"ItemCode"},
		Fields: []field{{"ItemCode", "str", 20, true, false}, {"ImageUrl", "str", 500, true, false}, {"AltText", "str", 200, false, false}, {"SortOrder", "int", 0, false, false}, {"IsPrimary", "bool", 0, false, false}}},
	"settings": {Table: "WebSetting", PK: "SettingKey", Touch: true, Order: "SettingKey", Search: []string{"SettingKey"},
		Fields: []field{{"SettingKey", "str", 80, true, false}, {"SettingValue", "text", 20000, false, false}, {"IsPublic", "bool", 0, false, false}}},
	"orders": {Table: "WebOrder", PK: "OrderId", AutoPK: true, Touch: true, Order: "OrderId DESC", Search: []string{"OrderNo", "Name", "Mobile", "Email"}, NoCreate: true, NoDelete: true,
		Fields: []field{{"OrderNo", "str", 20, false, true}, {"Name", "str", 120, false, true}, {"Email", "str", 200, false, true}, {"Mobile", "str", 20, false, true},
			{"Address", "str", 300, false, true}, {"City", "str", 80, false, true}, {"District", "str", 80, false, true}, {"Province", "str", 40, false, true},
			{"DeliveryMethod", "str", 30, false, true}, {"PaymentMethod", "str", 30, false, true}, {"Status", "str", 20, true, false},
			{"SubTotal", "dec", 0, false, true}, {"Discount", "dec", 0, false, true}, {"DeliveryFee", "dec", 0, false, true}, {"Total", "dec", 0, false, true},
			{"Notes", "str", 1000, false, true}, {"AdminNote", "str", 1000, false, false}, {"CreatedAt", "date", 0, false, true}, {"PromoCode", "str", 40, false, true}},
		Child: &child{Table: "WebOrderLine", FK: "OrderId", PK: "OrderLineId", Order: "OrderLineId", Fields: []field{{"ItemCode", "str", 40, false, true},
			{"ItemName", "str", 250, false, true}, {"UnitPrice", "dec", 0, false, true}, {"Qty", "int", 0, false, true}, {"LineTotal", "dec", 0, false, true}}}},
	"claims": {Table: "WebWarrantyClaim", PK: "ClaimId", AutoPK: true, Touch: true, Order: "ClaimId DESC", Search: []string{"TicketNo", "Name", "Mobile", "SerialNo", "InvoiceNo"}, NoCreate: true, NoDelete: true,
		Fields: []field{{"TicketNo", "str", 20, false, true}, {"Name", "str", 120, false, true}, {"Mobile", "str", 20, false, true}, {"Email", "str", 200, false, true},
			{"InvoiceNo", "str", 60, false, true}, {"Product", "str", 200, false, true}, {"SerialNo", "str", 80, false, true}, {"Issue", "str", 2000, false, true},
			{"Branch", "str", 60, false, true}, {"Stage", "int", 0, false, false}, {"Status", "str", 20, true, false}, {"AdminNote", "str", 1000, false, false}, {"CreatedAt", "date", 0, false, true}}},
	"bookings": {Table: "WebServiceBooking", PK: "BookingId", AutoPK: true, Order: "BookingId DESC", Search: []string{"Name", "Mobile", "Device", "Service"}, NoCreate: true, NoDelete: true,
		Fields: []field{{"Service", "str", 80, false, true}, {"Name", "str", 120, false, true}, {"Mobile", "str", 20, false, true}, {"Device", "str", 200, false, true},
			{"PreferredDate", "date", 0, false, true}, {"Branch", "str", 60, false, true}, {"Details", "str", 2000, false, true}, {"Status", "str", 20, true, false},
			{"AdminNote", "str", 1000, false, false}, {"CreatedAt", "date", 0, false, true}}},
	"customers": {Table: "WebCustomer", PK: "CustomerId", AutoPK: true, Order: "CustomerId DESC", Search: []string{"Name", "Email", "Mobile"}, NoCreate: true,
		Fields: []field{{"Name", "str", 120, true, false}, {"Email", "str", 200, false, true}, {"Mobile", "str", 20, false, false}, {"Address", "str", 300, false, false},
			{"City", "str", 80, false, false}, {"District", "str", 80, false, false}, {"Province", "str", 40, false, false}, {"NewsletterOptIn", "bool", 0, false, false},
			{"CreatedAt", "date", 0, false, true}, {"LastLoginAt", "date", 0, false, true}}},
	"newsletter": {Table: "WebNewsletter", PK: "SubscriberId", AutoPK: true, Order: "SubscriberId DESC", Search: []string{"Email"}, NoCreate: true,
		Fields: []field{{"Email", "str", 200, false, true}, {"ConsentAt", "date", 0, false, true}, {"IsActive", "bool", 0, false, false}}},
}

func resOf(c *fiber.Ctx) (resource, bool) {
	r, found := resources[c.Params("res")]
	return r, found
}

func cols(fs []field) []string {
	out := make([]string, len(fs))
	for i, f := range fs {
		out[i] = "[" + f.Col + "]"
	}
	return out
}

// convert validates one incoming value for a column.
func convert(f field, v interface{}) (interface{}, error) {
	if v == nil || v == "" {
		if f.Required {
			return nil, fmt.Errorf("%s is required", f.Col)
		}
		if f.Kind == "bool" {
			return false, nil
		}
		return nil, nil
	}
	switch f.Kind {
	case "str", "text":
		s := strings.TrimSpace(fmt.Sprint(v))
		if f.Required && s == "" {
			return nil, fmt.Errorf("%s is required", f.Col)
		}
		if f.Max > 0 && len([]rune(s)) > f.Max {
			return nil, fmt.Errorf("%s is too long (max %d)", f.Col, f.Max)
		}
		return s, nil
	case "int":
		switch n := v.(type) {
		case float64:
			return int(n), nil
		default:
			i, err := strconv.Atoi(strings.TrimSpace(fmt.Sprint(v)))
			if err != nil {
				return nil, fmt.Errorf("%s must be a whole number", f.Col)
			}
			return i, nil
		}
	case "dec":
		switch n := v.(type) {
		case float64:
			return n, nil
		default:
			d, err := strconv.ParseFloat(strings.TrimSpace(fmt.Sprint(v)), 64)
			if err != nil {
				return nil, fmt.Errorf("%s must be a number", f.Col)
			}
			return d, nil
		}
	case "bool":
		switch b := v.(type) {
		case bool:
			return b, nil
		default:
			s := strings.ToLower(fmt.Sprint(v))
			return s == "true" || s == "1" || s == "on" || s == "yes", nil
		}
	case "date":
		s := strings.TrimSpace(fmt.Sprint(v))
		for _, layout := range []string{time.RFC3339, "2006-01-02T15:04", "2006-01-02 15:04:05", "2006-01-02"} {
			if t, err := time.Parse(layout, s); err == nil {
				return t, nil
			}
		}
		return nil, fmt.Errorf("%s must be a date", f.Col)
	}
	return nil, fmt.Errorf("unknown field %s", f.Col)
}

// AdminList: GET /api/admin/:res?q=&status=&page=&size=
func AdminList(c *fiber.Ctx) error {
	r, found := resOf(c)
	if !found {
		return c.SendStatus(fiber.StatusNotFound)
	}
	page, _ := strconv.Atoi(c.Query("page", "1"))
	size, _ := strconv.Atoi(c.Query("size", "50"))
	if page < 1 {
		page = 1
	}
	if size < 1 || size > 200 {
		size = 50
	}
	where, args := []string{"1=1"}, []interface{}{}
	if q := strings.TrimSpace(c.Query("q")); q != "" && len(r.Search) > 0 {
		var ors []string
		for _, s := range r.Search {
			ors = append(ors, "["+s+"] LIKE ?")
			args = append(args, "%"+q+"%")
		}
		where = append(where, "("+strings.Join(ors, " OR ")+")")
	}
	if st := c.Query("status"); st != "" {
		for _, f := range r.Fields {
			if f.Col == "Status" {
				where = append(where, "[Status] = ?")
				args = append(args, st)
			}
		}
	}
	w := strings.Join(where, " AND ")
	var total int64
	if err := WDB.Raw("SELECT COUNT(*) FROM dbo.["+r.Table+"] WHERE "+w, args...).Scan(&total).Error; err != nil {
		return serverErr(c, err)
	}
	rows := []map[string]interface{}{}
	sql := fmt.Sprintf("SELECT [%s], %s FROM dbo.[%s] WHERE %s ORDER BY %s OFFSET %d ROWS FETCH NEXT %d ROWS ONLY",
		r.PK, strings.Join(withoutPK(r), ", "), r.Table, w, r.Order, (page-1)*size, size)
	if err := WDB.Raw(sql, args...).Scan(&rows).Error; err != nil {
		return serverErr(c, err)
	}
	return c.JSON(fiber.Map{"success": true, "payload": normalize(rows), "total": total, "page": page, "size": size})
}

func withoutPK(r resource) []string {
	var out []string
	for _, f := range r.Fields {
		if f.Col != r.PK {
			out = append(out, "["+f.Col+"]")
		}
	}
	return out
}

func loadOne(r resource, id string) (map[string]interface{}, error) {
	rows := []map[string]interface{}{}
	sql := fmt.Sprintf("SELECT [%s], %s FROM dbo.[%s] WHERE [%s] = ?", r.PK, strings.Join(withoutPK(r), ", "), r.Table, r.PK)
	if err := WDB.Raw(sql, id).Scan(&rows).Error; err != nil || len(rows) == 0 {
		return nil, err
	}
	row := rows[0]
	if r.Child != nil {
		kids := []map[string]interface{}{}
		pk := ""
		if r.Child.PK != "" {
			pk = "[" + r.Child.PK + "], "
		}
		q := fmt.Sprintf("SELECT %s%s FROM dbo.[%s] WHERE [%s] = ? ORDER BY %s", pk, strings.Join(cols(r.Child.Fields), ", "), r.Child.Table, r.Child.FK, r.Child.Order)
		if err := WDB.Raw(q, id).Scan(&kids).Error; err != nil {
			return nil, err
		}
		row["items"] = normalize(kids)
	}
	normalize(rows)
	return row, nil
}

// AdminGet: GET /api/admin/:res/:id
func AdminGet(c *fiber.Ctx) error {
	r, found := resOf(c)
	if !found {
		return c.SendStatus(fiber.StatusNotFound)
	}
	row, err := loadOne(r, c.Params("id"))
	if err != nil {
		return serverErr(c, err)
	}
	if row == nil {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Not found"})
	}
	return ok(c, row)
}

// parseBody converts the editable fields present in the body. For create, missing required fields fail.
func parseBody(r resource, body map[string]interface{}, creating bool) ([]string, []interface{}, error) {
	var names []string
	var vals []interface{}
	for _, f := range r.Fields {
		if f.ReadOnly || (f.Col == r.PK && r.AutoPK) || (f.Col == r.PK && !creating) {
			continue
		}
		v, present := body[f.Col]
		if !present {
			if creating && f.Required {
				return nil, nil, fmt.Errorf("%s is required", f.Col)
			}
			continue
		}
		cv, err := convert(f, v)
		if err != nil {
			return nil, nil, err
		}
		names = append(names, f.Col)
		vals = append(vals, cv)
	}
	return names, vals, nil
}

// replaceChildren swaps the child rows (promotion items, pre-built parts) inside the transaction.
func replaceChildren(tx *gorm.DB, r resource, id interface{}, raw interface{}) error {
	list, okList := raw.([]interface{})
	if r.Child == nil || !okList {
		return nil
	}
	if err := tx.Exec("DELETE FROM dbo.["+r.Child.Table+"] WHERE ["+r.Child.FK+"] = ?", id).Error; err != nil {
		return err
	}
	for i, it := range list {
		m, isMap := it.(map[string]interface{})
		if !isMap {
			continue
		}
		names := []string{"[" + r.Child.FK + "]"}
		vals := []interface{}{id}
		for _, f := range r.Child.Fields {
			v := m[f.Col]
			if f.Col == "SortOrder" && (v == nil || v == "") {
				v = float64(i)
			}
			if f.Col == "Qty" && (v == nil || v == "") {
				v = float64(1)
			}
			cv, err := convert(f, v)
			if err != nil {
				return fmt.Errorf("row %d: %w", i+1, err)
			}
			names = append(names, "["+f.Col+"]")
			vals = append(vals, cv)
		}
		marks := strings.TrimSuffix(strings.Repeat("?, ", len(vals)), ", ")
		if err := tx.Exec("INSERT INTO dbo.["+r.Child.Table+"] ("+strings.Join(names, ", ")+") VALUES ("+marks+")", vals...).Error; err != nil {
			return err
		}
	}
	return nil
}

// AdminCreate: POST /api/admin/:res
func AdminCreate(c *fiber.Ctx) error {
	r, found := resOf(c)
	if !found || r.NoCreate {
		return c.SendStatus(fiber.StatusNotFound)
	}
	var body map[string]interface{}
	if err := c.BodyParser(&body); err != nil {
		return bad(c, "Invalid JSON")
	}
	names, vals, err := parseBody(r, body, true)
	if err != nil {
		return bad(c, err.Error())
	}
	var newID interface{}
	err = WDB.Transaction(func(tx *gorm.DB) error {
		qn := make([]string, len(names))
		for i, n := range names {
			qn[i] = "[" + n + "]"
		}
		marks := strings.TrimSuffix(strings.Repeat("?, ", len(vals)), ", ")
		var id []map[string]interface{}
		sql := fmt.Sprintf("INSERT INTO dbo.[%s] (%s) OUTPUT INSERTED.[%s] AS id VALUES (%s)", r.Table, strings.Join(qn, ", "), r.PK, marks)
		if err := tx.Raw(sql, vals...).Scan(&id).Error; err != nil {
			return err
		}
		if len(id) > 0 {
			newID = id[0]["id"]
		}
		return replaceChildren(tx, r, newID, body["items"])
	})
	if err != nil {
		if strings.Contains(err.Error(), "UNIQUE") || strings.Contains(err.Error(), "PRIMARY KEY") {
			return bad(c, "That slug, key or email already exists")
		}
		if strings.HasPrefix(err.Error(), "row ") {
			return bad(c, err.Error())
		}
		return serverErr(c, err)
	}
	row, _ := loadOne(r, fmt.Sprint(newID))
	return ok(c, row)
}

// AdminUpdate: PUT /api/admin/:res/:id (only the fields sent are changed)
func AdminUpdate(c *fiber.Ctx) error {
	r, found := resOf(c)
	if !found {
		return c.SendStatus(fiber.StatusNotFound)
	}
	var body map[string]interface{}
	if err := c.BodyParser(&body); err != nil {
		return bad(c, "Invalid JSON")
	}
	names, vals, err := parseBody(r, body, false)
	if err != nil {
		return bad(c, err.Error())
	}
	id := c.Params("id")
	err = WDB.Transaction(func(tx *gorm.DB) error {
		if len(names) > 0 || r.Touch {
			sets := make([]string, 0, len(names)+1)
			for _, n := range names {
				sets = append(sets, "["+n+"] = ?")
			}
			if r.Touch {
				sets = append(sets, "[UpdatedAt] = SYSUTCDATETIME()")
			}
			res := tx.Exec("UPDATE dbo.["+r.Table+"] SET "+strings.Join(sets, ", ")+" WHERE ["+r.PK+"] = ?", append(vals, id)...)
			if res.Error != nil {
				return res.Error
			}
			if res.RowsAffected == 0 {
				return fmt.Errorf("not found")
			}
		}
		if _, sent := body["items"]; sent && r.Child != nil && !r.NoCreate {
			return replaceChildren(tx, r, id, body["items"])
		}
		return nil
	})
	if err != nil {
		if err.Error() == "not found" {
			return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Not found"})
		}
		if strings.Contains(err.Error(), "UNIQUE") {
			return bad(c, "That slug, key or email already exists")
		}
		if strings.HasPrefix(err.Error(), "row ") {
			return bad(c, err.Error())
		}
		return serverErr(c, err)
	}
	row, _ := loadOne(r, id)
	return ok(c, row)
}

// AdminDelete: DELETE /api/admin/:res/:id
func AdminDelete(c *fiber.Ctx) error {
	r, found := resOf(c)
	if !found || r.NoDelete {
		return c.SendStatus(fiber.StatusNotFound)
	}
	if err := WDB.Exec("DELETE FROM dbo.["+r.Table+"] WHERE ["+r.PK+"] = ?", c.Params("id")).Error; err != nil {
		return serverErr(c, err)
	}
	return ok(c, nil)
}

// AdminStats: GET /api/admin/stats (dashboard counters)
func AdminStats(c *fiber.Ctx) error {
	out := map[string]int64{}
	q := map[string]string{
		"orders_new":      "SELECT COUNT(*) FROM dbo.WebOrder WHERE Status = 'new'",
		"orders_total":    "SELECT COUNT(*) FROM dbo.WebOrder",
		"claims_open":     "SELECT COUNT(*) FROM dbo.WebWarrantyClaim WHERE Status = 'open'",
		"bookings_new":    "SELECT COUNT(*) FROM dbo.WebServiceBooking WHERE Status = 'new'",
		"customers":       "SELECT COUNT(*) FROM dbo.WebCustomer",
		"subscribers":     "SELECT COUNT(*) FROM dbo.WebNewsletter WHERE IsActive = 1",
		"banners_active":  "SELECT COUNT(*) FROM dbo.WebBanner WHERE IsActive = 1",
		"promos_active":   "SELECT COUNT(*) FROM dbo.WebPromotion WHERE IsActive = 1",
		"prebuilt_active": "SELECT COUNT(*) FROM dbo.WebPrebuiltPc WHERE IsActive = 1",
	}
	for k, s := range q {
		var n int64
		if err := WDB.Raw(s).Scan(&n).Error; err != nil {
			return serverErr(c, err)
		}
		out[k] = n
	}
	var sales float64
	WDB.Raw("SELECT ISNULL(SUM(Total),0) FROM dbo.WebOrder WHERE Status <> 'cancelled' AND CreatedAt >= DATEADD(day,-30,SYSUTCDATETIME())").Scan(&sales)
	return c.JSON(fiber.Map{"success": true, "payload": out, "sales_30d": sales})
}
