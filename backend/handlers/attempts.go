package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/xambook-backend/db"
	"github.com/yourusername/xambook-backend/models"
)

func SaveAttempt(c *gin.Context) {
	var attempt models.Attempt
	if err := c.ShouldBindJSON(&attempt); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid data"})
		return
	}

	// Get user_id from keycloak_id
	// Hardcoded for now, will come from JWT later
	keycloakID := "test-user-123"
	var userID string
	err := db.DB.QueryRow(`
		SELECT id FROM users WHERE keycloak_id = $1
	`, keycloakID).Scan(&userID)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	var id int
	err = db.DB.QueryRow(`
		INSERT INTO attempts 
		(user_id, subject, test_number, score, marks, total_marks, correct, wrong, skipped)
		VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
		RETURNING id
	`, userID, attempt.Subject, attempt.TestNumber,
		attempt.Score, attempt.Marks, attempt.TotalMarks,
		attempt.Correct, attempt.Wrong, attempt.Skipped,
	).Scan(&id)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save attempt"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "attempt saved", "id": id})
}

func GetMyAttempts(c *gin.Context) {
	keycloakID := "test-user-123"

	rows, err := db.DB.Query(`
		SELECT a.id, a.subject, a.test_number, a.score,
		a.marks, a.total_marks, a.correct, a.wrong, a.skipped, a.attempted_at
		FROM attempts a
		JOIN users u ON u.id = a.user_id
		WHERE u.keycloak_id = $1
		ORDER BY a.attempted_at DESC
	`, keycloakID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to fetch attempts"})
		return
	}
	defer rows.Close()

	attempts := []models.Attempt{}
	for rows.Next() {
		var a models.Attempt
		if err := rows.Scan(
			&a.ID, &a.Subject, &a.TestNumber, &a.Score,
			&a.Marks, &a.TotalMarks, &a.Correct, &a.Wrong, &a.Skipped, &a.AttemptedAt,
		); err != nil {
			continue
		}
		attempts = append(attempts, a)
	}
	c.JSON(http.StatusOK, attempts)
}
