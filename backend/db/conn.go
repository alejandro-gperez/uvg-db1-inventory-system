package db

import (
	"fmt"
	"os"

	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func Connect() (*gorm.DB, error) {
	host, err := requiredEnv("DB_HOST")
	if err != nil {
		return nil, err
	}
	port, err := requiredEnv("DB_PORT")
	if err != nil {
		return nil, err
	}
	user := firstNonEmpty(os.Getenv("DB_USER"), os.Getenv("POSTGRES_USER"))
	password := firstNonEmpty(os.Getenv("DB_PASSWORD"), os.Getenv("POSTGRES_PASSWORD"))
	dbname := firstNonEmpty(os.Getenv("DB_NAME"), os.Getenv("POSTGRES_DB"))
	sslmode := firstNonEmpty(os.Getenv("DB_SSLMODE"), "disable")

	if user == "" || password == "" || dbname == "" {
		return nil, fmt.Errorf("database credentials are incomplete")
	}

	connStr := fmt.Sprintf(
		"host=%s port=%s user=%s password=%s dbname=%s sslmode=%s",
		host, port, user, password, dbname, sslmode,
	)

	db, err := gorm.Open(postgres.Open(connStr), &gorm.Config{
		SkipDefaultTransaction: true,
	})
	if err != nil {
		return nil, err
	}

	sqlDB, err := db.DB()
	if err != nil {
		return nil, err
	}

	return db, sqlDB.Ping()
}

func requiredEnv(key string) (string, error) {
	value := os.Getenv(key)
	if value == "" {
		return "", fmt.Errorf("%s is required", key)
	}
	return value, nil
}

func firstNonEmpty(values ...string) string {
	for _, value := range values {
		if value != "" {
			return value
		}
	}
	return ""
}
