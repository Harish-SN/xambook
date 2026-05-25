package models

import "time"

type User struct {
	ID          string     `json:"id"`
	KeycloakID  string     `json:"keycloak_id"`
	Email       string     `json:"email"`
	Name        string     `json:"name"`
	IsPremium   bool       `json:"is_premium"`
	PurchasedAt *time.Time `json:"purchased_at"`
}
