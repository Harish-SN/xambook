package main

import (
	"database/sql"
	"encoding/json"
	"log"
	"os"
	"path/filepath"

	_ "github.com/lib/pq"
)

type QuestionFile struct {
	TestNumber int        `json:"test_number"`
	Subject    string     `json:"subject"`
	Questions  []Question `json:"questions"`
}

type Question struct {
	Question      string            `json:"question"`
	ImageURL      string            `json:"image_url"`
	Options       map[string]string `json:"options"`
	CorrectOption string            `json:"correct_option"`
	Explanation   string            `json:"explanation"`
}

func main() {
	dbURL := os.Getenv("POSTGRES_URL")

	if dbURL == "" {
		dbURL = "postgres://postgres:postgres123@localhost:5432/xambook?sslmode=disable"
	}

	db, err := sql.Open("postgres", dbURL)
	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	// Ensure the table exists (the API also creates it, but the importer
	// may run first in a fresh environment).
	_, err = db.Exec(`
		CREATE TABLE IF NOT EXISTS questions (
			id SERIAL PRIMARY KEY,
			subject VARCHAR NOT NULL,
			test_number INT NOT NULL,
			text TEXT NOT NULL,
			option_a TEXT NOT NULL,
			option_b TEXT NOT NULL,
			option_c TEXT NOT NULL,
			option_d TEXT NOT NULL,
			correct_option VARCHAR NOT NULL,
			explanation TEXT NOT NULL,
			image_url VARCHAR
		)
	`)
	if err != nil {
		log.Fatal("failed to ensure questions table:", err)
	}

	// Idempotent reseed: clear existing questions so re-running the
	// importer doesn't create duplicates.
	if _, err = db.Exec(`DELETE FROM questions`); err != nil {
		log.Fatal("failed to clear questions:", err)
	}

	root := "./questions"

	err = filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if filepath.Ext(path) != ".json" {
			return nil
		}

		log.Println("Importing:", path)

		data, err := os.ReadFile(path)
		if err != nil {
			return err
		}

		var file QuestionFile

		err = json.Unmarshal(data, &file)
		if err != nil {
			return err
		}

		for _, q := range file.Questions {
			correctOption := 0

			switch q.CorrectOption {
			case "a":
				correctOption = 0
			case "b":
				correctOption = 1
			case "c":
				correctOption = 2
			case "d":
				correctOption = 3
			}

			_, err = db.Exec(`
				INSERT INTO questions (
					subject,
					test_number,
					text,
					option_a,
					option_b,
					option_c,
					option_d,
					correct_option,
					explanation,
					image_url
				)
				VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
			`,
				file.Subject,
				file.TestNumber,
				q.Question,
				q.Options["a"],
				q.Options["b"],
				q.Options["c"],
				q.Options["d"],
				correctOption,
				q.Explanation,
				q.ImageURL,
			)

			if err != nil {
				return err
			}
		}

		return nil
	})

	if err != nil {
		log.Fatal(err)
	}

	log.Println("Import completed successfully")
}
