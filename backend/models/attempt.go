package models

import "time"

type Attempt struct {
	ID          int       `json:"id"`
	UserID      string    `json:"user_id"`
	Subject     string    `json:"subject"`
	TestNumber  int       `json:"test_number"`
	Score       int       `json:"score"`
	Correct     int       `json:"correct"`
	Wrong       int       `json:"wrong"`
	Skipped     int       `json:"skipped"`
	AttemptedAt time.Time `json:"attempted_at"`
}
