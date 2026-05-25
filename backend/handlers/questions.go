package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/Harish-SN/xambook-backend/db"
	"github.com/Harish-SN/xambook-backend/models"
)

func GetQuestions(c *gin.Context) {
	subject := c.Param("subject")
	testNumber, err := strconv.Atoi(c.Param("testNumber"))
	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid test number"})
		return
	}

	rows, err := db.DB.Query(`
		SELECT id, subject, test_number, text,
		option_a, option_b, option_c, option_d,
		correct_option, explanation, image_url
		FROM questions
		WHERE subject = $1 AND test_number = $2
		ORDER BY id
	`, subject, testNumber)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch questions"})
		return
	}
	defer rows.Close()

	questions := []models.Question{} // ← empty slice not nil
	for rows.Next() {
		var q models.Question
		var explanation *string // nullable
		if err := rows.Scan(
			&q.ID, &q.Subject, &q.TestNumber, &q.Text,
			&q.OptionA, &q.OptionB, &q.OptionC, &q.OptionD,
			&q.CorrectOption, &explanation, &q.ImageURL,
		); err != nil {
			continue
		}
		if explanation != nil {
			q.Explanation = *explanation
		}
		questions = append(questions, q)
	}

	c.JSON(http.StatusOK, questions)
}
