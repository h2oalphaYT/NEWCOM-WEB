package controllers

import (
	"strings"
)

// applyWebOverrides layers website data from NEWCOM_WEB on top of inventory items:
// hidden items are removed, titles/brands/images can be overridden, and active promotions set
// the special price and a badge (promo-code promotions only apply at checkout). Inventory data
// itself is never changed.
func applyWebOverrides(items []WebsiteItem) []WebsiteItem {
	if WDB == nil || len(items) == 0 {
		return items
	}
	codes := make([]string, len(items))
	for i, it := range items {
		codes[i] = it.CItemCode
	}

	var content []struct {
		ItemCode string
		Brand    *string
		Title    *string
		IsHidden bool
	}
	WDB.Raw("SELECT ItemCode, Brand, Title, IsHidden FROM dbo.WebItemContent WHERE ItemCode IN ?", codes).Scan(&content)
	hidden := map[string]bool{}
	byCode := map[string]int{}
	for i, it := range items {
		byCode[it.CItemCode] = i
	}
	for _, ct := range content {
		i, found := byCode[strings.TrimSpace(ct.ItemCode)]
		if !found {
			continue
		}
		if ct.IsHidden {
			hidden[items[i].CItemCode] = true
		}
		if ct.Title != nil && strings.TrimSpace(*ct.Title) != "" {
			items[i].VcItemDescrition = strings.TrimSpace(*ct.Title)
		}
		if ct.Brand != nil {
			items[i].Brand = strings.TrimSpace(*ct.Brand)
		}
	}

	var imgs []struct {
		ItemCode string
		ImageUrl string
	}
	WDB.Raw("SELECT ItemCode, ImageUrl FROM dbo.WebItemImage WHERE ItemCode IN ? ORDER BY IsPrimary DESC, SortOrder", codes).Scan(&imgs)
	seen := map[string]bool{}
	for _, im := range imgs {
		code := strings.TrimSpace(im.ItemCode)
		if i, found := byCode[code]; found && !seen[code] {
			items[i].VcItemImage = im.ImageUrl
			seen[code] = true
		}
	}

	var promos []struct {
		ItemCode      string
		DiscountType  string
		DiscountValue float64
		SpecialPrice  *float64
		BadgeText     *string
	}
	WDB.Raw(`SELECT pi.ItemCode, p.DiscountType, p.DiscountValue, pi.SpecialPrice, p.BadgeText
		FROM dbo.WebPromotionItem pi JOIN dbo.WebPromotion p ON p.PromotionId = pi.PromotionId
		WHERE pi.ItemCode IN ? AND p.IsActive = 1 AND ISNULL(p.PromoCode, '') = '' AND (p.StartDate IS NULL OR p.StartDate <= SYSUTCDATETIME()) AND (p.EndDate IS NULL OR p.EndDate >= SYSUTCDATETIME())
		ORDER BY p.SortOrder, p.PromotionId DESC`, codes).Scan(&promos)
	done := map[string]bool{}
	for _, pr := range promos {
		code := strings.TrimSpace(pr.ItemCode)
		i, found := byCode[code]
		if !found || done[code] {
			continue
		}
		base := items[i].SellingPrice
		price := base
		switch {
		case pr.SpecialPrice != nil && *pr.SpecialPrice > 0:
			price = *pr.SpecialPrice
		case pr.DiscountType == "percent":
			price = base * (1 - pr.DiscountValue/100)
		case pr.DiscountType == "fixed":
			price = base - pr.DiscountValue
		case pr.DiscountType == "price":
			price = pr.DiscountValue
		}
		if price > 0 && price < base {
			items[i].SpecialPrice = float64(int64(price + 0.5))
			items[i].IsOnOffer = true
			if pr.BadgeText != nil {
				items[i].PromoBadge = *pr.BadgeText
			}
			done[code] = true
		}
	}

	if len(hidden) == 0 {
		return items
	}
	out := items[:0]
	for _, it := range items {
		if !hidden[it.CItemCode] {
			out = append(out, it)
		}
	}
	return out
}
