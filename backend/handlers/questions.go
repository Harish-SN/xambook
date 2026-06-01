package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"

	"github.com/Harish-SN/xambook-backend/db"
	"github.com/gin-gonic/gin"
)

type QuestionResponse struct {
	ID       int               `json:"id"`
	Question string            `json:"question"`
	ImageURL string            `json:"image_url"`
	Options  map[string]string `json:"options"`
}

func GetQuestions(c *gin.Context) {

	subject := c.Param("subject")

	testNumber, err := strconv.Atoi(c.Param("testNumber"))

	if err != nil {
		c.JSON(http.StatusBadRequest, gin.H{
			"error": "invalid test number",
		})
		return
	}

	rows, err := db.DB.Query(`
		SELECT
			id,
			question,
			image_url,
			options
		FROM questions
		WHERE lower(subject) = lower($1)
		AND test_number = $2
		ORDER BY id
	`, subject, testNumber)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{
			"error": err.Error(),
		})
		return
	}

	defer rows.Close()

	questions := []QuestionResponse{}

	for rows.Next() {

		var q QuestionResponse
		var optionsBytes []byte

		err := rows.Scan(
			&q.ID,
			&q.Question,
			&q.ImageURL,
			&optionsBytes,
		)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		err = json.Unmarshal(optionsBytes, &q.Options)

		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{
				"error": err.Error(),
			})
			return
		}

		questions = append(questions, q)
	}

	c.JSON(http.StatusOK, gin.H{
		"questions": questions,
	})
}
