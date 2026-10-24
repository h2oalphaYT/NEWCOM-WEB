package controllers

import (
	"os"

	"gorm.io/gorm"
)

var DB *gorm.DB

func Init(db *gorm.DB) {
	DB = db
}

// companyCode is the inventory company whose stock the public site shows.
// The inventory backend reads it from the user's JWT; the public site has no login, so it comes from env.
func companyCode() string {
	return os.Getenv("COMPANY_CODE")
}
