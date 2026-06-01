package handlers

import (
	"net/http"
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
	testNumberStr := c.Param("test")

	testNumber, err := strconv.Atoi(testNumberStr)

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid test number",
		})
		return
	}

	normalizedSubject := normalizeSubject(subject)

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
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	defer rows.Close()

	var response []QuestionResponse

	for rows.Next() {
		var q models.Question

		err := rows.Scan(
			&q.ID,
			&q.Subject,
			&q.TestNumber,
			&q.Text,
			&q.OptionA,
			&q.OptionB,
			&q.OptionC,
			&q.OptionD,
			&q.CorrectOption,
			&q.Explanation,
			&q.ImageURL,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		response = append(response, QuestionResponse{
			ID:            q.ID,
			Question:      q.Text,
			ImageURL:      deref(q.ImageURL),
			CorrectOption: convertCorrectOption(q.CorrectOption),
			Explanation:   q.Explanation,

			Options: map[string]string{
				"a": q.OptionA,
				"b": q.OptionB,
				"c": q.OptionC,
				"d": q.OptionD,
			},
		})
	}

	c.JSON(http.StatusOK, QuestionsAPIResponse{
		TestNumber: testNumber,
		Subject:    normalizedSubject,
		Questions:  response,
	})
}

func convertCorrectOption(option int) string {
	switch option {
	case 0:
		return "a"
	case 1:
		return "b"
	case 2:
		return "c"
	case 3:
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
