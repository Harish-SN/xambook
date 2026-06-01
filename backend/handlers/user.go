package handlers

import (
	"net/http"

	"github.com/Harish-SN/xambook-backend/db"
	"github.com/Harish-SN/xambook-backend/middleware"
	"github.com/Harish-SN/xambook-backend/models"

	"github.com/gin-gonic/gin"
)

func GetMe(c *gin.Context) {
	keycloakID := c.GetString(
		middleware.CtxKeycloakID,
	)

	if keycloakID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "unauthorized",
		})
		return
	}

	var user models.User

	err := db.DB.QueryRow(`
		SELECT
			id,
			keycloak_id,
			email,
			name,
			is_premium,
			purchased_at
		FROM users
		WHERE keycloak_id = $1
	`, keycloakID).Scan(
		&user.ID,
		&user.KeycloakID,
		&user.Email,
		&user.Name,
		&user.IsPremium,
		&user.PurchasedAt,
	)

	if err != nil {
		c.JSON(http.StatusNotFound, gin.H{
			"error": "user not found",
		})
		return
	}

	c.JSON(http.StatusOK, user)
}
