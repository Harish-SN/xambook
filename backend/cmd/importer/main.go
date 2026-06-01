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
	Chapter       string            `json:"chapter"`
	Topic         string            `json:"topic"`
	Difficulty    string            `json:"difficulty"`
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
			optionsJSON, err := json.Marshal(q.Options)
			if err != nil {
				return err
			}
			_, err = db.Exec(`
				INSERT INTO questions (
					subject,
					test_number,
					chapter,
					topic,
					difficulty,
					question,
					image_url,
					options,
					correct_option,
					explanation
				)
				VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
				ON CONFLICT DO NOTHING
			`,
				file.Subject,
				file.TestNumber,
				q.Chapter,
				q.Topic,
				q.Difficulty,
				q.Question,
				q.ImageURL,
				optionsJSON,
				q.CorrectOption,
				q.Explanation,
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
