package controllers

import (
	"backend/utils"

	"github.com/gofiber/fiber/v2"
)

// RetrieveBrands lists brands for filters and the brand strip.
func RetrieveBrands(c *fiber.Ctx) error {
	filter := c.Query("filter")
	page, rows := utils.Paging(c, 100, 500)

	var list []map[string]interface{}

	result := DB.Raw("SELECT * FROM [dbo].[fxMastBrandGetAll] (?,?,?)", filter, page, rows).Scan(&list)
	if result.Error != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "failed to fetch brands")
	}
	if list == nil {
		list = []map[string]interface{}{}
	}

	return utils.Success(c, "Brands retrieved successfully", list)
}
