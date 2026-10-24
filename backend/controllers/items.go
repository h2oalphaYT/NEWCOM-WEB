package controllers

import (
	"backend/utils"

	"github.com/gofiber/fiber/v2"
)

// RetrieveItems lists active items for the public catalogue.
// Uses the same DB function as the inventory app (fxMastItemsGetAll / fxMastItemsGetAllCount).
func RetrieveItems(c *fiber.Ctx) error {
	search := c.Query("q")
	category := c.Query("category")
	page, rows := utils.Paging(c, 24, 100)

	var items []map[string]interface{}
	var count int

	// params: cItemCode, vcItemDescrition, nBalanceQuantity, vcDescription, bActive, profileItem, CompanyCode, page_no, row_count
	result := DB.Raw("SELECT * FROM [dbo].[fxMastItemsGetAll] (?, ?, ?, ?, ?, ?, ?, ?, ?)",
		"", search, nil, category, "1", "", companyCode(), page, rows).Scan(&items)
	if result.Error != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Failed to fetch items")
	}

	result2 := DB.Raw("SELECT [dbo].[fxMastItemsGetAllCount] (?, ?, ?, ?, ?, ?, ?)",
		"", search, nil, category, "1", "", companyCode()).Scan(&count)
	if result2.Error != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "Failed to fetch items count")
	}

	if items == nil {
		items = []map[string]interface{}{}
	}

	return utils.Success(c, "Items retrieved successfully", utils.PublicRows(items), fiber.Map{
		"count": count, "page_no": page, "row_count": rows,
	})
}

// RetrieveItemById returns one item for the product page.
func RetrieveItemById(c *fiber.Ctx) error {
	itemId := c.Params("id")

	var item []map[string]interface{}

	result := DB.Raw("SELECT * FROM [dbo].[fxMastItemsGetById] (?,?)", itemId, companyCode()).Scan(&item)
	if result.Error != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "failed to fetch item")
	}

	if len(item) == 0 {
		return utils.Fail(c, fiber.StatusNotFound, "item not found")
	}

	return utils.Success(c, "item retrieved successfully", utils.PublicRows(item)[0])
}
