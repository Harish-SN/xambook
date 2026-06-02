package handlers

import (
	"database/sql"
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"strconv"
	"strings"

	"github.com/Harish-SN/xambook-backend/db"
	"github.com/Harish-SN/xambook-backend/models"

	"github.com/gin-gonic/gin"
)

type QuestionResponse struct {
	ID            int               `json:"id"`
	Question      string            `json:"question"`
	ImageURL      string            `json:"image_url"`
	CorrectOption string            `json:"correct_option"`
	Explanation   string            `json:"explanation"`
	Options       map[string]string `json:"options"`
}

type QuestionsAPIResponse struct {
	TestNumber int                `json:"test_number"`
	Subject    string             `json:"subject"`
	Questions  []QuestionResponse `json:"questions"`
}

func GetQuestions(c *gin.Context) {

	subject := c.Param("subject")

	// FREE ROUTE DOES NOT HAVE :subject
	if subject == "" {
		subject = "free"
	}

	testNumberStr := c.Param("testNumber")

	testNumber, err := strconv.Atoi(testNumberStr)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid test number",
		})
		return
	}

	normalizedSubject := normalizeSubject(subject)

	var response []QuestionResponse

	// 1) Try the database first (production path).
	if db.DB != nil {
		response, err = loadQuestionsFromDB(normalizedSubject, testNumber)
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}
	}

	// 2) Fall back to the bundled JSON files when the DB is absent or empty.
	//    This guarantees questions render in local dev with no infra.
	if len(response) == 0 {
		fromFile, ferr := loadQuestionsFromJSON(normalizedSubject, testNumber)
		if ferr == nil && len(fromFile) > 0 {
			response = fromFile
		}
	}

	c.JSON(http.StatusOK, QuestionsAPIResponse{
		TestNumber: testNumber,
		Subject:    normalizedSubject,
		Questions:  response,
	})
}

func loadQuestionsFromDB(normalizedSubject string, testNumber int) ([]QuestionResponse, error) {

	rows, err := db.DB.Query(`
		SELECT
			id,
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
		FROM questions
		WHERE LOWER(subject) = LOWER($1)
		AND test_number = $2
		ORDER BY id ASC
	`, normalizedSubject, testNumber)

	if err != nil {
		return nil, err
	}

	defer rows.Close()

	var response []QuestionResponse

	for rows.Next() {

		var q models.Question
		var correctRaw sql.NullString

		err := rows.Scan(
			&q.ID,
			&q.Subject,
			&q.TestNumber,
			&q.Text,
			&q.OptionA,
			&q.OptionB,
			&q.OptionC,
			&q.OptionD,
			&correctRaw,
			&q.Explanation,
			&q.ImageURL,
		)

		if err != nil {
			return nil, err
		}

		response = append(response, QuestionResponse{
			ID:            q.ID,
			Question:      q.Text,
			ImageURL:      deref(q.ImageURL),
			CorrectOption: normalizeCorrectOption(correctRaw.String),
			Explanation:   q.Explanation,

			Options: map[string]string{
				"a": q.OptionA,
				"b": q.OptionB,
				"c": q.OptionC,
				"d": q.OptionD,
			},
		})
	}

	return response, nil
}

// jsonQuestionFile mirrors the on-disk question file format.
type jsonQuestionFile struct {
	TestNumber int `json:"test_number"`
	Subject    string `json:"subject"`
	Questions  []struct {
		ID            int               `json:"id"`
		Question      string            `json:"question"`
		Options       map[string]string `json:"options"`
		CorrectOption string            `json:"correct_option"`
		Explanation   string            `json:"explanation"`
		ImageURL      string            `json:"image_url"`
	} `json:"questions"`
}

func loadQuestionsFromJSON(normalizedSubject string, testNumber int) ([]QuestionResponse, error) {

	dir := subjectToDir(normalizedSubject)
	if dir == "" {
		return nil, nil
	}

	root := os.Getenv("QUESTIONS_DIR")
	if root == "" {
		root = "./questions"
	}

	path := filepath.Join(root, dir, "test"+strconv.Itoa(testNumber)+".json")

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, err
	}

	var file jsonQuestionFile
	if err := json.Unmarshal(data, &file); err != nil {
		return nil, err
	}

	var response []QuestionResponse

	for i, q := range file.Questions {
		id := q.ID
		if id == 0 {
			id = i + 1
		}

		response = append(response, QuestionResponse{
			ID:            id,
			Question:      q.Question,
			ImageURL:      q.ImageURL,
			CorrectOption: normalizeCorrectOption(q.CorrectOption),
			Explanation:   q.Explanation,
			Options: map[string]string{
				"a": q.Options["a"],
				"b": q.Options["b"],
				"c": q.Options["c"],
				"d": q.Options["d"],
			},
		})
	}

	return response, nil
}

// normalizeCorrectOption accepts either a letter ("a".."d") or a numeric
// index ("0".."3") and always returns the lowercase letter form.
func normalizeCorrectOption(option string) string {

	s := strings.ToLower(strings.TrimSpace(option))

	switch s {
	case "a", "0":
		return "a"
	case "b", "1":
		return "b"
	case "c", "2":
		return "c"
	case "d", "3":
		return "d"
	default:
		return ""
	}
}

func deref(s *string) string {

	if s == nil {
		return ""
	}

	return *s
}

func normalizeSubject(subject string) string {

	s := strings.ToLower(strings.TrimSpace(subject))

	switch s {

	case "free":
		return "Free Test"

	case "mock":
		return "Full Test"

	case "physics":
		return "Physics"

	case "chemistry":
		return "Chemistry"

	case "botany":
		return "Botany"

	case "zoology":
		return "Zoology"

	default:
		return subject
	}
}

// subjectToDir maps the normalized subject name to its question directory.
func subjectToDir(normalizedSubject string) string {

	switch strings.ToLower(strings.TrimSpace(normalizedSubject)) {

	case "free test":
		return "free-test"

	case "full test":
		return "full-test"

	case "physics":
		return "physics"

	case "chemistry":
		return "chemistry"

	case "botany":
		return "botany"

	case "zoology":
		return "zoology"

	default:
		return ""
	}
}
