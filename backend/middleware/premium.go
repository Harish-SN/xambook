package middleware

import (
	"net/http"

	"github.com/Harish-SN/xambook-backend/db"

	"github.com/gin-gonic/gin"
)

func PremiumMiddleware() gin.HandlerFunc {

	return func(c *gin.Context) {

		keycloakID := c.GetString(
			CtxKeycloakID,
		)

		if keycloakID == "" {

			c.JSON(
				http.StatusUnauthorized,
				gin.H{
					"error": "unauthorized",
				},
			)

			c.Abort()
			return
		}

		var premium bool

		err := db.DB.QueryRow(`
			SELECT is_premium
			FROM users
			WHERE keycloak_id = $1
		`, keycloakID).Scan(&premium)

		if err != nil || !premium {

			c.JSON(
				http.StatusForbidden,
				gin.H{
					"error": "premium required",
				},
			)

			c.Abort()
			return
		}

		c.Next()
	}
}
