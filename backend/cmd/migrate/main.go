// Command migrate creates the NEWCOM_WEB database (if missing) on the same SQL Server as the
// inventory and applies every script in ./migrations in name order. Scripts are idempotent.
//
//	cd backend && go run ./cmd/migrate
package main

import (
	"backend/config"
	"log"
	"os"
	"path/filepath"
	"regexp"
	"sort"
	"strings"

	"github.com/joho/godotenv"
	"gorm.io/driver/sqlserver"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var goSep = regexp.MustCompile(`(?mi)^\s*GO\s*$`)
var validName = regexp.MustCompile(`^[A-Za-z0-9_]+$`)

func main() {
	_ = godotenv.Load(".env")
	name := config.WebDBName()
	if !validName.MatchString(name) {
		log.Fatalf("invalid WEB_DB_NAME %q", name)
	}

	master, err := gorm.Open(sqlserver.Open(config.DSN("master")), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		log.Fatalf("connect master: %v", err)
	}
	if err := master.Exec("IF DB_ID(?) IS NULL EXEC('CREATE DATABASE ["+name+"]')", name).Error; err != nil {
		log.Fatalf("create database %s: %v", name, err)
	}
	log.Printf("database %s ready", name)

	db, err := gorm.Open(sqlserver.Open(config.DSN(name)), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		log.Fatalf("connect %s: %v", name, err)
	}

	files, _ := filepath.Glob(filepath.Join("migrations", "*.sql"))
	sort.Strings(files)
	for _, f := range files {
		raw, err := os.ReadFile(f)
		if err != nil {
			log.Fatalf("read %s: %v", f, err)
		}
		for i, batch := range goSep.Split(string(raw), -1) {
			if strings.TrimSpace(batch) == "" {
				continue
			}
			if err := db.Exec(batch).Error; err != nil {
				log.Fatalf("%s batch %d: %v", f, i+1, err)
			}
		}
		log.Printf("applied %s", filepath.Base(f))
	}
	log.Println("done")
}
