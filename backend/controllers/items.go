package controllers

import (
	"backend/utils"
	"net/url"
	"strings"

	"github.com/gofiber/fiber/v2"
)

// WebsiteItem is the public shape of an item. Only columns from fxMastItemsGetAllForWebsite,
// which is built for the website (no cost, supplier or margin data).
type WebsiteItem struct {
	CItemCode           string  `gorm:"column:cItemCode" json:"cItemCode"`
	VcItemDescrition    string  `gorm:"column:vcItemDescrition" json:"vcItemDescrition"`
	OriginalDescription string  `gorm:"column:OriginalDescription" json:"OriginalDescription"`
	MarkdownDescription string  `gorm:"column:MarkdownDescription" json:"MarkdownDescription"`
	CCategoryCode       string  `gorm:"column:cCategoryCode" json:"cCategoryCode"`
	CategoryName        string  `gorm:"column:CategoryName" json:"CategoryName"`
	CSubCategoryCode    string  `gorm:"column:cSubCategoryCode" json:"cSubCategoryCode"`
	CUnitCode           string  `gorm:"column:cUnitCode" json:"cUnitCode"`
	VcItemImage         string  `gorm:"column:vcItemImage" json:"vcItemImage"`
	SellingPrice        float64 `gorm:"column:SellingPrice" json:"SellingPrice"`
	SpecialPrice        float64 `gorm:"column:SpecialPrice" json:"SpecialPrice"`
	BActive             bool    `gorm:"column:bActive" json:"bActive"`
	BDiscount           bool    `gorm:"column:bDiscount" json:"bDiscount"`
	IsOnOffer           bool    `gorm:"column:IsOnOffer" json:"IsOnOffer"`
	StockQuantity       float64 `gorm:"column:StockQuantity" json:"StockQuantity"`
	StockStatus         string  `gorm:"column:StockStatus" json:"StockStatus"`
}

func fetchWebsiteItems(itemCode, search, category string, page, rows int) ([]WebsiteItem, error) {
	var items []WebsiteItem
	// params: cItemCode, vcItemDescrition, cCategoryCode, bActive, page_no, row_count
	result := DB.Raw("SELECT * FROM [dbo].[fxMastItemsGetAllForWebsite] (?, ?, ?, ?, ?, ?)",
		itemCode, search, category, 1, page, rows).Scan(&items)
	if result.Error != nil {
		return nil, result.Error
	}
	for i := range items {
		it := &items[i]
		// CHAR columns come back space-padded
		it.CItemCode = strings.TrimSpace(it.CItemCode)
		it.CCategoryCode = strings.TrimSpace(it.CCategoryCode)
		it.CSubCategoryCode = strings.TrimSpace(it.CSubCategoryCode)
		it.CUnitCode = strings.TrimSpace(it.CUnitCode)
		it.VcItemImage = imageURL(it.VcItemImage)
	}
	return items, nil
}

// imageURL turns a stored path like "items\ITM001\ITM001_item_image.jpg" into a path on our own
// /api/image endpoint (relative; the website prefixes the API address). Empty means "no image".
func imageURL(stored string) string {
	path := strings.Trim(strings.ReplaceAll(strings.TrimSpace(stored), "\\", "/"), "/")
	if path == "" {
		return ""
	}
	return "/api/image?path=" + url.QueryEscape(path)
}

// RetrieveItems lists active items for the catalogue.
// Query: q (name search), category (cCategoryCode), page_no, row_count.
func RetrieveItems(c *fiber.Ctx) error {
	page, rows := utils.Paging(c, 24, 100)
	items, err := fetchWebsiteItems("", c.Query("q"), c.Query("category"), page, rows)
	if err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Failed to fetch items")
	}
	if items == nil {
		items = []WebsiteItem{}
	}
	return utils.Success(c, "Items retrieved successfully", items, fiber.Map{
		"page_no": page, "row_count": rows, "has_more": len(items) == rows,
	})
}

// RetrieveItemById returns one item for the product page.
func RetrieveItemById(c *fiber.Ctx) error {
	items, err := fetchWebsiteItems(c.Params("id"), "", "", 1, 1)
	if err != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "failed to fetch item")
	}
	if len(items) == 0 {
		return utils.Fail(c, fiber.StatusNotFound, "item not found")
	}
	return utils.Success(c, "item retrieved successfully", items[0])
}
