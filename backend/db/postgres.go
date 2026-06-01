package db

import (
	"database/sql"
	"log"
	"os"

	_ "github.com/lib/pq"
)

var DB *sql.DB

func Connect() {
	var err error
	DB, err = sql.Open("postgres", os.Getenv("POSTGRES_URL"))
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}
	if err = DB.Ping(); err != nil {
		log.Fatal("Database not reachable:", err)
	}
	log.Println("Connected to PostgreSQL")
	createTables()
}

func createTables() {
	queries := []string{
		`
		CREATE TABLE IF NOT EXISTS users (
			id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
			keycloak_id VARCHAR UNIQUE NOT NULL,
			email VARCHAR NOT NULL,
			name VARCHAR,
			is_premium BOOLEAN DEFAULT false,
			purchased_at TIMESTAMP
		)
		`,

		`
		CREATE TABLE IF NOT EXISTS questions (
			id SERIAL PRIMARY KEY,

			subject VARCHAR NOT NULL,
			test_number INT NOT NULL,

			text TEXT NOT NULL,

			option_a TEXT NOT NULL,
			option_b TEXT NOT NULL,
			option_c TEXT NOT NULL,
			option_d TEXT NOT NULL,

			-- IMPORTANT:
			-- must store a/b/c/d
			correct_option VARCHAR NOT NULL,

			-- REQUIRED FOR RESULT PAGE
			explanation TEXT NOT NULL,

			image_url VARCHAR
		)
		`,

		`
		CREATE TABLE IF NOT EXISTS attempts (
			id SERIAL PRIMARY KEY,

			user_id UUID REFERENCES users(id),

			subject VARCHAR NOT NULL,
			test_number INT NOT NULL,

			score INT NOT NULL,
			marks INT NOT NULL,
			total_marks INT NOT NULL,

			correct INT NOT NULL,
			wrong INT NOT NULL,
			skipped INT NOT NULL,

			attempted_at TIMESTAMP DEFAULT NOW()
		)
		`,
	}

	for _, q := range queries {
		if _, err := DB.Exec(q); err != nil {
			log.Fatal("Failed to create table:", err)
		}
	}

	log.Println("Tables ready")
}
