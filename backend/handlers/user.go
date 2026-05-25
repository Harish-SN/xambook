package handlers

import (
	"net/http"

	"github.com/gin-gonic/gin"
	"github.com/yourusername/xambook-backend/db"
	"github.com/yourusername/xambook-backend/models"
)

func GetMe(c *gin.Context) {
	// Later this will come from Keycloak JWT
	// For now hardcode for testing
	keycloakID := "test-user-123"

	var user models.User
	err := db.DB.QueryRow(`
		SELECT id, keycloak_id, email, name, is_premium, purchased_at
		FROM users WHERE keycloak_id = $1
	`, keycloakID).Scan(
		&user.ID,
		&user.KeycloakID,
		&user.Email,
		&user.Name,
		&user.IsPremium,
		&user.PurchasedAt,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "user not found"})
		return
	}

	c.JSON(http.StatusOK, user)
}
