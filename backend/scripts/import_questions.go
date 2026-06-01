package main

import (
	"database/sql"
	"encoding/json"
	"fmt"
	"io/ioutil"
	"log"
	"os"
	"path/filepath"

	_ "github.com/lib/pq"
)

type TestFile struct {
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
	db, err := sql.Open(
		"postgres",
		"postgres://postgres:postgres123@localhost:5432/xambook?sslmode=disable",
	)

	if err != nil {
		log.Fatal(err)
	}

	defer db.Close()

	root := "./neet"

	err = filepath.Walk(root, func(path string, info os.FileInfo, err error) error {

		if filepath.Ext(path) != ".json" {
			return nil
		}

		fmt.Println("Importing:", path)

		data, err := ioutil.ReadFile(path)

		if err != nil {
			return err
		}

		var testFile TestFile

		err = json.Unmarshal(data, &testFile)

		if err != nil {
			return err
		}

		for _, q := range testFile.Questions {

			optionsJSON, err := json.Marshal(q.Options)

			if err != nil {
				return err
			}

			_, err = db.Exec(`
				INSERT INTO questions (
					subject,
					test_number,
					question,
					image_url,
					options,
					correct_option,
					explanation
				)
				VALUES ($1,$2,$3,$4,$5,$6,$7)
			`,
				testFile.Subject,
				testFile.TestNumber,
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

	fmt.Println("Import completed")
}
