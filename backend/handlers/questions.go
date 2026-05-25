package handlers

import (
	"net/http"
	"strconv"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/xambook-backend/db"
	"github.com/yourusername/xambook-backend/models"
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
		correct_option, image_url
		FROM questions
		WHERE subject = $1 AND test_number = $2
		ORDER BY id
	`, subject, testNumber)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch questions"})
		return
	}
	defer rows.Close()

	var questions []models.Question
	for rows.Next() {
		var q models.Question
		if err := rows.Scan(
			&q.ID, &q.Subject, &q.TestNumber, &q.Text,
			&q.OptionA, &q.OptionB, &q.OptionC, &q.OptionD,
			&q.CorrectOption, &q.ImageURL,
		); err != nil {
			continue
		}
		questions = append(questions, q)
	}

	c.JSON(http.StatusOK, questions)
}
