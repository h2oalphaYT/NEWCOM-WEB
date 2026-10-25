// Command createadmin adds (or resets the password of) a website admin user in NEWCOM_WEB.
//
//	cd backend && go run ./cmd/createadmin -email you@newcom.lk -name "Your Name"
//
// The password is read from the ADMIN_PASSWORD environment variable or typed at the prompt,
// so it never ends up in shell history.
package main

import (
	"backend/config"
	"bufio"
	"flag"
	"fmt"
	"log"
	"os"
	"strings"

	"github.com/joho/godotenv"
	"golang.org/x/crypto/bcrypt"
	"gorm.io/driver/sqlserver"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

func main() {
	_ = godotenv.Load(".env")
	email := flag.String("email", "", "admin email (login)")
	name := flag.String("name", "Admin", "display name")
	role := flag.String("role", "admin", "admin | editor")
	flag.Parse()
	if *email == "" {
		log.Fatal("-email is required")
	}
	pw := os.Getenv("ADMIN_PASSWORD")
	if pw == "" {
		fmt.Print("Password (min 10 characters): ")
		line, _ := bufio.NewReader(os.Stdin).ReadString('\n')
		pw = strings.TrimSpace(line)
	}
	if len(pw) < 10 {
		log.Fatal("password must be at least 10 characters")
	}
	hash, err := bcrypt.GenerateFromPassword([]byte(pw), 12)
	if err != nil {
		log.Fatal(err)
	}
	db, err := gorm.Open(sqlserver.Open(config.DSN(config.WebDBName())), &gorm.Config{Logger: logger.Default.LogMode(logger.Silent)})
	if err != nil {
		log.Fatalf("connect: %v", err)
	}
	err = db.Exec(`MERGE dbo.WebAdminUser AS t USING (SELECT ? AS Email) AS s ON t.Email = s.Email
		WHEN MATCHED THEN UPDATE SET Name = ?, PasswordHash = ?, Role = ?, IsActive = 1
		WHEN NOT MATCHED THEN INSERT (Email, Name, PasswordHash, Role) VALUES (?, ?, ?, ?);`,
		strings.ToLower(*email), *name, string(hash), *role, strings.ToLower(*email), *name, string(hash), *role).Error
	if err != nil {
		log.Fatalf("save admin: %v", err)
	}
	log.Printf("admin %s saved", strings.ToLower(*email))
}
