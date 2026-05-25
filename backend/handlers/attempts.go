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

	// Later get user_id from Keycloak JWT
	attempt.UserID = "test-user-123"

	_, err := db.DB.Exec(`
		INSERT INTO attempts (user_id, subject, test_number, score, correct, wrong, skipped)
		VALUES ($1, $2, $3, $4, $5, $6, $7)
	`, attempt.UserID, attempt.Subject, attempt.TestNumber,
		attempt.Score, attempt.Correct, attempt.Wrong, attempt.Skipped)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to save attempt"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "attempt saved"})
}

func GetMyAttempts(c *gin.Context) {
	// Later get from Keycloak JWT
	keycloakID := "test-user-123"

	rows, err := db.DB.Query(`
		SELECT a.id, a.subject, a.test_number, a.score,
		a.correct, a.wrong, a.skipped, a.attempted_at
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

	var attempts []models.Attempt
	for rows.Next() {
		var a models.Attempt
		if err := rows.Scan(
			&a.ID, &a.Subject, &a.TestNumber, &a.Score,
			&a.Correct, &a.Wrong, &a.Skipped, &a.AttemptedAt,
		); err != nil {
			continue
		}
		attempts = append(attempts, a)
	}

	c.JSON(http.StatusOK, attempts)
}
