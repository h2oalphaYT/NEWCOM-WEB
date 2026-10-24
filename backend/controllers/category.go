package controllers

import (
	"backend/utils"

	"github.com/gofiber/fiber/v2"
)

// RetrieveCategoryList returns categories for the navigation menu.
func RetrieveCategoryList(c *fiber.Ctx) error {
	filter := c.Query("filter")

	var category []map[string]interface{}

	result := DB.Raw("SELECT * FROM [dbo].[fxMastCategoryLists] (?)", filter).Scan(&category)
	if result.Error != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "failed to fetch categories")
	}
	if category == nil {
		category = []map[string]interface{}{}
	}

	return utils.Success(c, "Categories retrieved successfully", category)
}

// RetrieveSubCategoryByCategory returns sub categories under one category.
func RetrieveSubCategoryByCategory(c *fiber.Ctx) error {
	categoryCode := c.Params("categoryCode")
	searchTerm := c.Query("filter")

	var subcategories []map[string]interface{}

	result := DB.Raw("SELECT * FROM [dbo].[fxMastSubCategoryLists] (?, ?)", categoryCode, searchTerm).Scan(&subcategories)
	if result.Error != nil {
		return utils.Fail(c, fiber.StatusInternalServerError, "failed to fetch sub categories")
	}
	if subcategories == nil {
		subcategories = []map[string]interface{}{}
	}

	return utils.Success(c, "Sub categories retrieved successfully", subcategories)
}
