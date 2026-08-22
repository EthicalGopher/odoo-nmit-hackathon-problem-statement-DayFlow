package database

import (
	"fmt"
	"log"
	"os"

	"dayflow-backend/models"

	"gorm.io/driver/postgres"
	"gorm.io/driver/sqlite"
	"gorm.io/gorm"
	"gorm.io/gorm/logger"
)

var DB *gorm.DB

func InitDB() *gorm.DB {
	var db *gorm.DB
	var err error

	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		host := os.Getenv("POSTGRES_HOST")
		if host != "" {
			port := os.Getenv("POSTGRES_PORT")
			if port == "" {
				port = "5432"
			}
			user := os.Getenv("POSTGRES_USER")
			if user == "" {
				user = "postgres"
			}
			password := os.Getenv("POSTGRES_PASSWORD")
			if password == "" {
				password = "postgres_password"
			}
			dbname := os.Getenv("POSTGRES_DB")
			if dbname == "" {
				dbname = "dayflow_db"
			}
			dsn = fmt.Sprintf("host=%s user=%s password=%s dbname=%s port=%s sslmode=disable TimeZone=UTC",
				host, user, password, dbname, port)
		}
	}

	if dsn != "" {
		log.Println("Connecting to PostgreSQL...")
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{
			Logger: logger.Default.LogMode(logger.Info),
		})
		if err != nil {
			log.Printf("PostgreSQL connection failed: %v. Falling back to SQLite database...", err)
			db, err = gorm.Open(sqlite.Open("dayflow.db"), &gorm.Config{})
		}
	} else {
		log.Println("No PostgreSQL config found. Initializing SQLite database (dayflow.db)...")
		db, err = gorm.Open(sqlite.Open("dayflow.db"), &gorm.Config{})
	}

	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}

	// Auto Migration
	log.Println("Running AutoMigrations...")
	err = db.AutoMigrate(
		&models.User{},
		&models.Attendance{},
		&models.LeaveRequest{},
		&models.Payroll{},
		&models.Notification{},
		&models.Document{},
		&models.Message{},
	)
	if err != nil {
		log.Fatalf("AutoMigration failed: %v", err)
	}

	DB = db
	SeedData(db)
	return db
}

func SeedData(db *gorm.DB) {
	// Wipe all records across all tables to start completely fresh from scratch (0 data)
	db.Exec("DELETE FROM users")
	db.Exec("DELETE FROM attendances")
	db.Exec("DELETE FROM leave_requests")
	db.Exec("DELETE FROM payrolls")
	db.Exec("DELETE FROM notifications")
	db.Exec("DELETE FROM documents")
	db.Exec("DELETE FROM messages")
	log.Println("Database wiped cleanly. 0 data remaining — starting from scratch.")
}
