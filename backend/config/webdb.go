package config

import (
	"backend/controllers"
	"fmt"
	"log"
	"net/url"
	"os"
	"strconv"

	"gorm.io/driver/sqlserver"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

// WebDBName is the website's own database (banners, promotions, customers, orders, ...).
// Same server and login as the inventory; the website may write here, never to the inventory.
func WebDBName() string {
	if n := os.Getenv("WEB_DB_NAME"); n != "" {
		return n
	}
	return "NEWCOM_WEB"
}

// DSN builds a SQL Server connection string for the given database on the shared server.
func DSN(database string) string {
	port, _ := strconv.Atoi(os.Getenv("DB_PORT"))
	return fmt.Sprintf("sqlserver://%s:%s@%s:%d?database=%s",
		url.QueryEscape(os.Getenv("DB_USER")), url.QueryEscape(os.Getenv("DB_PASSWORD")),
		os.Getenv("DB_HOST"), port, url.QueryEscape(database))
}

// WebDBConnect opens NEWCOM_WEB. If it is missing the site still runs (inventory pages work)
// and the web endpoints answer 503 until `go run ./cmd/migrate` has been run.
func WebDBConnect() {
	db, err := gorm.Open(sqlserver.Open(DSN(WebDBName())), &gorm.Config{Logger: logger.Default.LogMode(logger.Warn)})
	if err != nil {
		log.Printf("web db not available (%v); run: go run ./cmd/migrate", err)
		return
	}
	if sqlDB, err := db.DB(); err == nil {
		if err := sqlDB.Ping(); err != nil {
			log.Printf("web db not reachable (%v); run: go run ./cmd/migrate", err)
			return
		}
		sqlDB.SetMaxOpenConns(10)
		sqlDB.SetMaxIdleConns(5)
	}
	controllers.InitWeb(db)
	log.Println("web db connect")
}
