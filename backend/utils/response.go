package utils

import (
	"strconv"
	"strings"

	"github.com/gofiber/fiber/v2"
)

func Success(c *fiber.Ctx, message string, payload interface{}, extra ...fiber.Map) error {
	body := fiber.Map{"success": true, "message": message, "payload": payload}
	for _, m := range extra {
		for k, v := range m {
			body[k] = v
		}
	}
	return c.Status(fiber.StatusOK).JSON(body)
}

func Fail(c *fiber.Ctx, status int, message string) error {
	return c.Status(status).JSON(fiber.Map{"success": false, "message": message})
}

// Paging reads page_no / row_count (same names as the inventory API) and clamps them.
func Paging(c *fiber.Ctx, defRows, maxRows int) (int, int) {
	page, err := strconv.Atoi(c.Query("page_no", "1"))
	if err != nil || page < 1 {
		page = 1
	}
	rows, err := strconv.Atoi(c.Query("row_count", strconv.Itoa(defRows)))
	if err != nil || rows < 1 {
		rows = defRows
	}
	if rows > maxRows {
		rows = maxRows
	}
	return page, rows
}

// sensitive column fragments that must never reach the public site (cost, margin, supplier data, etc.)
var hiddenFragments = []string{"cost", "purchase", "margin", "profit", "supplier", "invest", "commission", "user", "password", "grn"}

// PublicRows drops internal columns from rows returned by the inventory DB functions.
// TODO: replace with an explicit allow-list once the item columns are confirmed against the live DB.
func PublicRows(rows []map[string]interface{}) []map[string]interface{} {
	for _, row := range rows {
		for k := range row {
			lk := strings.ToLower(k)
			for _, f := range hiddenFragments {
				if strings.Contains(lk, f) {
					delete(row, k)
					break
				}
			}
		}
	}
	return rows
}
