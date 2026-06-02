package handlers

import (
	"database/sql"
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

	email := c.GetString(
		middleware.CtxEmail,
	)

	name := c.GetString(
		middleware.CtxName,
	)

	if keycloakID == "" {
		c.JSON(http.StatusUnauthorized, gin.H{
			"error": "unauthorized",
		})
		return
	}

	// Local dev with no database: return a premium dev user so premium
	// features are usable without infra.
	if db.DB == nil {
		c.JSON(http.StatusOK, models.User{
			ID:         "00000000-0000-0000-0000-000000000000",
			KeycloakID: keycloakID,
			Email:      email,
			Name:       name,
			IsPremium:  true,
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

	// Auto-create user if not exists
	if err == sql.ErrNoRows {

		_, err = db.DB.Exec(`
			INSERT INTO users (
				keycloak_id,
				email,
				name,
				is_premium
			)
			VALUES ($1, $2, $3, false)
		`,
			keycloakID,
			email,
			name,
		)

		if err != nil {
			c.JSON(
				http.StatusInternalServerError,
				gin.H{
					"error": "failed to create user",
				},
			)
			return
		}

		// Fetch newly created user
		err = db.DB.QueryRow(`
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
			c.JSON(
				http.StatusInternalServerError,
				gin.H{
					"error": "failed to fetch user",
				},
			)
			return
		}
	} else if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "database error",
			},
		)

		return
	}

	c.JSON(http.StatusOK, user)
}
