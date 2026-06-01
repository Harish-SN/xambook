package models

type Question struct {
	ID            int     `json:"id"`
	Subject       string  `json:"subject"`
	TestNumber    int     `json:"test_number"`
	Text          string  `json:"text"`
	OptionA       string  `json:"option_a"`
	OptionB       string  `json:"option_b"`
	OptionC       string  `json:"option_c"`
	OptionD       string  `json:"option_d"`
	CorrectOption int     `json:"correct_option"`
	Explanation   string  `json:"explanation"`
	ImageURL      *string `json:"image_url"`
}
