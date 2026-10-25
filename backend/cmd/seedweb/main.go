// Command seedweb adds starter website content to NEWCOM_WEB: home banners, promotions (one
// with a promo code shown in the top bar) and pre-built PCs made from real inventory items.
// Everything can be edited or deleted in /admin. Rows that already exist (same title or slug)
// are skipped, so it is safe to run again.
//
//	go run ./cmd/seedweb
package main

import (
	"log"
	"time"

	"backend/config"

	"github.com/joho/godotenv"
	"gorm.io/driver/sqlserver"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

type banner struct {
	Placement, Eyebrow, Title, Subtitle, MediaType, MediaUrl, PosterUrl, ButtonText, ButtonUrl, Button2Text, Button2Url string
	SortOrder                                                                                                           int
}

type promoItem struct {
	Code    string
	Special *float64
}

type promo struct {
	Name, Slug, Description, Badge, Type string
	Value                                float64
	Code                                 string
	MinOrder                             *float64
	ShowInBar                            bool
	Days                                 int
	Items                                []promoItem
}

type part struct {
	Slot, Code, Name string
	Qty              int
}

type prebuilt struct {
	Name, Slug, Tagline, Tier, UseCase, Platform, Description, Image string
	Price                                                            float64
	Featured                                                         bool
	Parts                                                            []part
}

func f(v float64) *float64 { return &v }

var banners = []banner{
	{"home-hero", "Computer hardware, Sri Lanka", "Performance hardware, chosen with care.", "Laptops, PCs and components with clear specs, honest stock status and real support.",
		"video", "/media/hero.mp4", "/media/hero-poster.jpg", "Shop products", "/products", "Build your PC", "/pc-builder", 0},
	{"home-hero", "Pre-built PCs", "Office PCs, ready to work today.", "Assembled and tested by Newcom with parts from our own stock. Pick one up from the showroom or get it delivered.",
		"image", "/media/cat/desktop.webp", "", "See pre-built PCs", "/prebuilt", "Build your own", "/pc-builder", 1},
	{"home-hero", "Upgrades", "Faster storage. More memory.", "SSD and RAM upgrades for the PC you already own, with upgrade deal prices this month.",
		"video", "/media/show-storage.mp4", "/media/show-storage.jpg", "Shop upgrades", "/products?category=Memory%20and%20storage", "", "", 2},
	{"home-strip", "Peripheral week", "10% off mice and headsets", "Logitech and iMICE favourites, this month only.",
		"image", "/media/cat/peripherals.webp", "", "Shop peripherals", "/products?category=Peripherals", "", "", 0},
	{"home-strip", "Promo code", "Save 5% with code NEWCOM5", "On orders over LKR 25,000. Enter the code in your cart.",
		"image", "/media/cat/monitor.webp", "", "Start shopping", "/products", "", "", 1},
}

var promos = []promo{
	{Name: "Peripheral week", Slug: "peripheral-week", Description: "10% off selected mice and headsets.", Badge: "10% off", Type: "percent", Value: 10, Days: 30,
		Items: []promoItem{{"MUS0001", nil}, {"MUS0004", nil}, {"MUS0009", nil}, {"HDS0002", nil}, {"HDS0004", nil}, {"HDS0005", nil}}},
	{Name: "SSD upgrade deal", Slug: "ssd-upgrade-deal", Description: "Special prices on DATO SATA SSDs.", Badge: "Upgrade deal", Type: "price", Value: 0, Days: 30,
		Items: []promoItem{{"SSD0008", f(5990)}, {"SSD0011", f(10490)}, {"SSD0007", f(17490)}}},
	{Name: "5% off with NEWCOM5", Slug: "newcom5", Description: "5% off the whole order over LKR 25,000.", Badge: "Save 5%", Type: "percent", Value: 5,
		Code: "NEWCOM5", MinOrder: f(25000), ShowInBar: true, Days: 60},
}

var builds = []prebuilt{
	{"Newcom Office Starter", "newcom-office-starter", "Fast, quiet everyday office PC", "Budget", "Office", "intel",
		"Intel Core i3 10th Gen on a Gigabyte H410M board with an SSD, so Windows, email, spreadsheets and video calls feel quick. Assembled, tested and covered by warranty.",
		"/media/cat/desktop.webp", 87900, true, []part{
			{"cpu", "PRS0001", "CPU Intel Core i3 10th Gen", 1}, {"mb", "MBD0004", "M/B Gigabyte H410M K", 1},
			{"ram", "RAM0037", "RAM Desk Kingston DDR4 8GB 3200", 1}, {"ssd", "SSD0008", "SSD DATO 256GB 2.5 SATA3 - DS700", 1},
			{"case", "", "Micro-ATX case with 450W power supply", 1}}},
	{"Newcom Office Pro Desk", "newcom-office-pro-desk", "Complete desk setup with a 27\" monitor", "Mid range", "Office", "intel",
		"Everything for a new desk in one order: Core i3 10th Gen PC with 16GB RAM and a 512GB SSD, an HP 27\" monitor, a Logitech wireless mouse and a USB headset for calls.",
		"/media/cat/monitor.webp", 134900, true, []part{
			{"cpu", "PRS0001", "CPU Intel Core i3 10th Gen", 1}, {"mb", "MBD0004", "M/B Gigabyte H410M K", 1},
			{"ram", "RAM0001", "RAM Desk DATO DDR4 8GB 3200", 2}, {"ssd", "SSD0011", "SSD DATO 512GB 2.5 SATA3 - DS700", 1},
			{"case", "", "Micro-ATX case with 450W power supply", 1}, {"other", "MNT0011", "Monitor HP E271l 27\"", 1},
			{"other", "MUS0009", "Logitech M190 Wireless Mouse Charcoal", 1}, {"other", "HDS0005", "Headset Logitech USB H390", 1}}},
	{"Newcom Student Value", "newcom-student-value", "Affordable PC for study and browsing", "Budget", "Student", "intel",
		"Intel Core i5 6th Gen with 8GB DDR4 and an SSD: a dependable, low-cost PC for assignments, online classes and browsing.",
		"/media/cat/case.webp", 56900, false, []part{
			{"cpu", "PRS0011", "CPU Intel Core i5 6th Gen", 1}, {"mb", "MBD0014", "M/B Gigabyte H110M-S2", 1},
			{"ram", "RAM0037", "RAM Desk Kingston DDR4 8GB 3200", 1}, {"ssd", "SSD0008", "SSD DATO 256GB 2.5 SATA3 - DS700", 1},
			{"case", "", "Micro-ATX case with 450W power supply", 1}}},
}

func nz(s string) interface{} {
	if s == "" {
		return nil
	}
	return s
}

func main() {
	_ = godotenv.Load(".env")
	db, err := gorm.Open(sqlserver.Open(config.DSN(config.WebDBName())), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		log.Fatalf("connect: %v", err)
	}
	exists := func(q string, arg interface{}) bool {
		var n int
		db.Raw(q, arg).Scan(&n)
		return n > 0
	}

	for _, b := range banners {
		if exists("SELECT COUNT(*) FROM dbo.WebBanner WHERE Title = ?", b.Title) {
			log.Printf("skip banner %q (exists)", b.Title)
			continue
		}
		must(db.Exec(`INSERT INTO dbo.WebBanner (Placement, Eyebrow, Title, Subtitle, MediaType, MediaUrl, PosterUrl, ButtonText, ButtonUrl, Button2Text, Button2Url, SortOrder, IsActive)
			VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`, b.Placement, nz(b.Eyebrow), b.Title, nz(b.Subtitle), b.MediaType, nz(b.MediaUrl), nz(b.PosterUrl),
			nz(b.ButtonText), nz(b.ButtonUrl), nz(b.Button2Text), nz(b.Button2Url), b.SortOrder).Error)
		log.Printf("banner %q", b.Title)
	}

	for i, p := range promos {
		if exists("SELECT COUNT(*) FROM dbo.WebPromotion WHERE Slug = ?", p.Slug) {
			log.Printf("skip promotion %q (exists)", p.Name)
			continue
		}
		end := time.Now().UTC().AddDate(0, 0, p.Days)
		var id int
		must(db.Raw(`INSERT INTO dbo.WebPromotion (Name, Slug, Description, BadgeText, DiscountType, DiscountValue, PromoCode, MinOrder, ShowInBar, EndDate, SortOrder, IsActive)
			OUTPUT INSERTED.PromotionId VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`, p.Name, p.Slug, p.Description, p.Badge, p.Type, p.Value, nz(p.Code), p.MinOrder, p.ShowInBar, end, i).Scan(&id).Error)
		for _, it := range p.Items {
			must(db.Exec("INSERT INTO dbo.WebPromotionItem (PromotionId, ItemCode, SpecialPrice) VALUES (?, ?, ?)", id, it.Code, it.Special).Error)
		}
		log.Printf("promotion %q (%d items)", p.Name, len(p.Items))
	}

	for i, b := range builds {
		if exists("SELECT COUNT(*) FROM dbo.WebPrebuiltPc WHERE Slug = ?", b.Slug) {
			log.Printf("skip pre-built %q (exists)", b.Name)
			continue
		}
		var id int
		must(db.Raw(`INSERT INTO dbo.WebPrebuiltPc (Name, Slug, Tagline, Tier, UseCase, Platform, Description, ImageUrl, Price, IsFeatured, IsActive, SortOrder)
			OUTPUT INSERTED.PrebuiltId VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1, ?)`, b.Name, b.Slug, b.Tagline, b.Tier, b.UseCase, b.Platform, b.Description, b.Image, b.Price, b.Featured, i).Scan(&id).Error)
		for j, pt := range b.Parts {
			must(db.Exec("INSERT INTO dbo.WebPrebuiltPcPart (PrebuiltId, Slot, ItemCode, PartName, Qty, SortOrder) VALUES (?, ?, ?, ?, ?, ?)", id, pt.Slot, nz(pt.Code), pt.Name, pt.Qty, j).Error)
		}
		log.Printf("pre-built %q (%d parts)", b.Name, len(b.Parts))
	}
	log.Print("done")
}

func must(err error) {
	if err != nil {
		log.Fatal(err)
	}
}
