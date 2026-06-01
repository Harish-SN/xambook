package handlers

import (
	"encoding/json"
	"net/http"
	"strconv"
	"strings"

	"github.com/gorilla/mux"

	"xambook/db"
	"xambook/models"
)

type QuestionResponse struct {
	ID            int               `json:"id"`
	Question      string            `json:"question"`
	ImageURL      string            `json:"image_url"`
	CorrectOption string            `json:"correct_option"`
	Explanation   string            `json:"explanation"`
	Options       map[string]string `json:"options"`
}

func deref(s *string) string {
	if s == nil {
		return ""
	}

	return *s
}

func GetQuestions(w http.ResponseWriter, r *http.Request) {
	params := mux.Vars(r)

	subject := params["subject"]

	testNumber, err := strconv.Atoi(params["test"])
	if err != nil {
		http.Error(w, "invalid test number", http.StatusBadRequest)
		return
	}

	rows, err := db.DB.Query(`
		SELECT
			id,
			subject,
			test_number,
			text,
			option_a,
			option_b,
			option_c,
			option_d,
			correct_option,
			explanation,
			image_url
		FROM questions
		WHERE LOWER(subject) = LOWER($1)
		AND test_number = $2
		ORDER BY id ASC
	`, strings.TrimSpace(subject), testNumber)

	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	defer rows.Close()

	var questions []models.Question

	for rows.Next() {
		var q models.Question

		err := rows.Scan(
			&q.ID,
			&q.Subject,
			&q.TestNumber,
			&q.Text,
			&q.OptionA,
			&q.OptionB,
			&q.OptionC,
			&q.OptionD,
			&q.CorrectOption,
			&q.Explanation,
			&q.ImageURL,
		)

		if err != nil {
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		questions = append(questions, q)
	}

	var response []QuestionResponse

	for _, q := range questions {
		response = append(response, QuestionResponse{
			ID:            q.ID,
			Question:      q.Text,
			ImageURL:      deref(q.ImageURL),
			CorrectOption: strings.ToLower(q.CorrectOption),
			Explanation:   q.Explanation,

			Options: map[string]string{
				"a": q.OptionA,
				"b": q.OptionB,
				"c": q.OptionC,
				"d": q.OptionD,
			},
		})
	}

	w.Header().Set("Content-Type", "application/json")

	json.NewEncoder(w).Encode(map[string]interface{}{
		"questions": response,
	})
}
