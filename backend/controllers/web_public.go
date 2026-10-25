package controllers

import (
	"strings"

	"github.com/gofiber/fiber/v2"
)

const activeWindow = "IsActive = 1 AND (StartDate IS NULL OR StartDate <= SYSUTCDATETIME()) AND (EndDate IS NULL OR EndDate >= SYSUTCDATETIME())"

// PublicBanners: GET /api/web/banners?placement=home-hero
func PublicBanners(c *fiber.Ctx) error {
	rows := []map[string]interface{}{}
	q := "SELECT BannerId, Placement, Eyebrow, Title, Subtitle, MediaType, MediaUrl, PosterUrl, ButtonText, ButtonUrl, Button2Text, Button2Url FROM dbo.WebBanner WHERE " + activeWindow
	args := []interface{}{}
	if p := c.Query("placement"); p != "" {
		q += " AND Placement = ?"
		args = append(args, p)
	}
	if err := WDB.Raw(q+" ORDER BY SortOrder, BannerId DESC", args...).Scan(&rows).Error; err != nil {
		return serverErr(c, err)
	}
	return ok(c, normalize(rows))
}

// PublicPromotions: GET /api/web/promotions (active promotions with their item codes)
func PublicPromotions(c *fiber.Ctx) error {
	rows := []map[string]interface{}{}
	if err := WDB.Raw("SELECT PromotionId, Name, Slug, Description, BadgeText, DiscountType, DiscountValue, ImageUrl, EndDate, PromoCode, MinOrder, ShowInBar FROM dbo.WebPromotion WHERE " + activeWindow + " ORDER BY SortOrder, PromotionId DESC").Scan(&rows).Error; err != nil {
		return serverErr(c, err)
	}
	for _, r := range rows {
		var codes []string
		WDB.Raw("SELECT ItemCode FROM dbo.WebPromotionItem WHERE PromotionId = ?", r["PromotionId"]).Scan(&codes)
		r["itemCodes"] = codes
	}
	return ok(c, normalize(rows))
}

// PublicSettings: GET /api/web/settings (public keys only)
func PublicSettings(c *fiber.Ctx) error {
	rows := []struct {
		SettingKey   string
		SettingValue string
	}{}
	WDB.Raw("SELECT SettingKey, ISNULL(SettingValue,'') SettingValue FROM dbo.WebSetting WHERE IsPublic = 1").Scan(&rows)
	out := map[string]string{}
	for _, r := range rows {
		out[r.SettingKey] = r.SettingValue
	}
	return ok(c, out)
}

// PublicCategories: GET /api/web/categories (curated shop categories)
func PublicCategories(c *fiber.Ctx) error {
	rows := []map[string]interface{}{}
	WDB.Raw("SELECT CategoryId, Name, Slug, ParentId, InventoryCategoryCodes, SearchKeyword, ImageUrl FROM dbo.WebCategory WHERE IsVisible = 1 ORDER BY SortOrder, Name").Scan(&rows)
	return ok(c, rows)
}

type prebuiltPart struct {
	Slot      string   `json:"slot"`
	ItemCode  *string  `json:"itemCode"`
	PartName  string   `json:"name"`
	Qty       int      `json:"qty"`
	Price     float64  `json:"price"`
	Stock     string   `json:"stock"`
	Image     string   `json:"image"`
	ItemPrice *float64 `json:"-"`
}

// pricePrebuilt fills each linked part from the live inventory and returns the build price
// (the fixed price when set, otherwise the sum of the parts).
func pricePrebuilt(row map[string]interface{}) {
	normalize([]map[string]interface{}{row})
	parts := []prebuiltPart{}
	WDB.Raw("SELECT Slot, ItemCode, PartName, Qty FROM dbo.WebPrebuiltPcPart WHERE PrebuiltId = ? ORDER BY SortOrder, PartId", row["PrebuiltId"]).Scan(&parts)
	sum := 0.0
	allIn := true
	for i := range parts {
		p := &parts[i]
		if p.ItemCode != nil && strings.TrimSpace(*p.ItemCode) != "" && DB != nil {
			if items, err := fetchWebsiteItems(strings.TrimSpace(*p.ItemCode), "", "", 1, 1); err == nil && len(items) == 1 {
				it := items[0]
				p.Price = it.SellingPrice
				if it.SpecialPrice > 0 && it.SpecialPrice < it.SellingPrice {
					p.Price = it.SpecialPrice
				}
				p.Stock = it.StockStatus
				p.Image = it.VcItemImage
			}
		}
		if p.Stock == "Out of Stock" {
			allIn = false
		}
		sum += p.Price * float64(max(p.Qty, 1))
	}
	row["parts"] = parts
	row["partsTotal"] = sum
	if row["Price"] == nil {
		row["Price"] = sum
	}
	row["allInStock"] = allIn
}

// PublicPrebuilt: GET /api/web/prebuilt
func PublicPrebuilt(c *fiber.Ctx) error {
	rows := []map[string]interface{}{}
	if err := WDB.Raw("SELECT PrebuiltId, Name, Slug, Tagline, Tier, UseCase, Platform, ImageUrl, Price, IsFeatured FROM dbo.WebPrebuiltPc WHERE IsActive = 1 ORDER BY SortOrder, PrebuiltId DESC").Scan(&rows).Error; err != nil {
		return serverErr(c, err)
	}
	for _, r := range rows {
		pricePrebuilt(r)
	}
	return ok(c, rows)
}

// PublicPrebuiltOne: GET /api/web/prebuilt/:slug
func PublicPrebuiltOne(c *fiber.Ctx) error {
	rows := []map[string]interface{}{}
	WDB.Raw("SELECT PrebuiltId, Name, Slug, Tagline, Tier, UseCase, Platform, Description, ImageUrl, Price, IsFeatured FROM dbo.WebPrebuiltPc WHERE IsActive = 1 AND Slug = ?", c.Params("slug")).Scan(&rows)
	if len(rows) == 0 {
		return c.Status(fiber.StatusNotFound).JSON(fiber.Map{"success": false, "message": "Not found"})
	}
	pricePrebuilt(rows[0])
	return ok(c, rows[0])
}
