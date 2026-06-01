package middleware

import (
	"context"
	"net/http"
	"strings"
	"time"

	"github.com/MicahParks/keyfunc/v3"
	"github.com/gin-gonic/gin"
	"github.com/golang-jwt/jwt/v5"
)

// Context keys populated by the auth middleware once a token is verified.
const (
	CtxKeycloakID = "keycloak_id"
	CtxEmail      = "email"
	CtxName       = "name"
)

// NewKeycloakAuth builds a Gin middleware that verifies a Bearer JWT against
// the realm's JWKS endpoint. issuer is "<KEYCLOAK_URL>/realms/<REALM>".
// The JWKS is fetched once and refreshed in the background by keyfunc.
func NewKeycloakAuth(issuer string) (gin.HandlerFunc, error) {
	jwksURL := strings.TrimRight(issuer, "/") + "/protocol/openid-connect/certs"

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Second)
	defer cancel()

	jwks, err := keyfunc.NewDefaultCtx(ctx, []string{jwksURL})
	if err != nil {
		return nil, err
	}

	return func(c *gin.Context) {
		raw := bearerToken(c.GetHeader("Authorization"))
		if raw == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "missing bearer token"})
			return
		}

		token, err := jwt.Parse(
			raw,
			jwks.Keyfunc,
			jwt.WithValidMethods([]string{"RS256"}),
			jwt.WithIssuer(issuer),
			jwt.WithExpirationRequired(),
		)
		if err != nil || !token.Valid {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid token"})
			return
		}

		claims, ok := token.Claims.(jwt.MapClaims)
		if !ok {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "invalid claims"})
			return
		}

		sub, _ := claims["sub"].(string)
		if sub == "" {
			c.AbortWithStatusJSON(http.StatusUnauthorized, gin.H{"error": "token missing subject"})
			return
		}

		c.Set(CtxKeycloakID, sub)
		if v, ok := claims["email"].(string); ok {
			c.Set(CtxEmail, v)
		}
		// Prefer the human name, fall back to the username.
		if v, ok := claims["name"].(string); ok && v != "" {
			c.Set(CtxName, v)
		} else if v, ok := claims["preferred_username"].(string); ok {
			c.Set(CtxName, v)
		}

		c.Next()
	}, nil
}
func bearerToken(header string) string {
	const prefix = "Bearer "
	if len(header) > len(prefix) && strings.EqualFold(header[:len(prefix)], prefix) {
		return strings.TrimSpace(header[len(prefix):])
	}
	return ""
}
