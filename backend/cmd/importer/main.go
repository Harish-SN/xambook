package main

import (
	"encoding/json"
	"log"
	"os"
	"path/filepath"
	"strings"

	"xambook/db"

	_ "github.com/lib/pq"
)

type QuestionFile struct {
	TestNumber int        `json:"test_number"`
	Subject    string     `json:"subject"`
	Questions  []Question `json:"questions"`
}

type Question struct {
	ID       int    `json:"id"`
	Subject  string `json:"subject"`
	Question string `json:"question"`

	Options struct {
		A string `json:"a"`
		B string `json:"b"`
		C string `json:"c"`
		D string `json:"d"`
	} `json:"options"`

	CorrectOption string `json:"correct_option"`
	Explanation   string `json:"explanation"`

	ImageURL string `json:"image_url"`
}

func main() {
	db.Connect()

	root := "./questions"

	err := filepath.Walk(root, func(path string, info os.FileInfo, err error) error {
		if err != nil {
			return err
		}

		if info.IsDir() {
			return nil
		}

		if !strings.HasSuffix(path, ".json") {
			return nil
		}

		log.Println("Importing:", path)

		fileBytes, err := os.ReadFile(path)
		if err != nil {
			return err
		}

		var file QuestionFile

		if err := json.Unmarshal(fileBytes, &file); err != nil {
			return err
		}

		for _, q := range file.Questions {
			_, err := db.DB.Exec(`
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
				q.Subject,
				file.TestNumber,
				q.Question,
				q.Options.A,
				q.Options.B,
				q.Options.C,
				q.Options.D,
				strings.ToLower(q.CorrectOption),
				q.Explanation,
				q.ImageURL,
			)

			if err != nil {
				log.Fatal(err)
			}
		}

		return nil
	})

	if err != nil {
		log.Fatal(err)
	}

	log.Println("Import completed successfully")
}
