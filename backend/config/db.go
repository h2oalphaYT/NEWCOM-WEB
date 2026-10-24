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

// DBConnect opens the shared Newcom Inventory SQL Server database.
// Same settings as the inventory backend (DB_HOST, DB_PORT, DB_NAME, DB_USER, DB_PASSWORD).
func DBConnect() {
	dbHost := os.Getenv("DB_HOST")
	dbPort, _ := strconv.Atoi(os.Getenv("DB_PORT"))
	dbName := os.Getenv("DB_NAME")
	dbUser := os.Getenv("DB_USER")
	dbPassword := os.Getenv("DB_PASSWORD")

	dbUrl := fmt.Sprintf("sqlserver://%s:%s@%s:%d?database=%s&ApplicationIntent=ReadOnly",
		url.QueryEscape(dbUser), url.QueryEscape(dbPassword), dbHost, dbPort, url.QueryEscape(dbName))

	db, err := gorm.Open(sqlserver.Open(dbUrl), &gorm.Config{Logger: logger.Default.LogMode(logger.Warn)})
	if err != nil {
		log.Fatalf("failed to connect database: %v", err)
	}

	sqlDB, err := db.DB()
	if err == nil {
		sqlDB.SetMaxOpenConns(10)
		sqlDB.SetMaxIdleConns(5)
	}

	controllers.Init(db)
	log.Println("db conect")
}
