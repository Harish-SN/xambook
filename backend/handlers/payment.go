// handlers/payment.go

package handlers

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"os"

	"github.com/Harish-SN/xambook-backend/db"
	"github.com/Harish-SN/xambook-backend/middleware"

	"github.com/gin-gonic/gin"
	razorpay "github.com/razorpay/razorpay-go"
)

func GetPaymentConfig(c *gin.Context) {

	keyID := os.Getenv(
		"RAZORPAY_KEY_ID",
	)

	if keyID == "" {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "razorpay key missing",
			},
		)

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"key": keyID,
	})
}

func CreateOrder(c *gin.Context) {

	keyID := os.Getenv(
		"RAZORPAY_KEY_ID",
	)

	keySecret := os.Getenv(
		"RAZORPAY_KEY_SECRET",
	)

	if keyID == "" || keySecret == "" {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "razorpay env missing",
			},
		)

		return
	}

	client := razorpay.NewClient(
		keyID,
		keySecret,
	)

	data := map[string]interface{}{
		"amount":   9900,
		"currency": "INR",
		"receipt":  "xambook_premium",
	}

	order, err := client.Order.Create(
		data,
		nil,
	)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": err.Error(),
			},
		)

		return
	}

	c.JSON(http.StatusOK, order)
}

func VerifyPayment(c *gin.Context) {

	var body struct {
		RazorpayOrderID string `json:"razorpay_order_id"`

		RazorpayPaymentID string `json:"razorpay_payment_id"`

		RazorpaySignature string `json:"razorpay_signature"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {

		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "invalid data",
			},
		)

		return
	}

	secret := os.Getenv(
		"RAZORPAY_KEY_SECRET",
	)

	message :=
		body.RazorpayOrderID +
			"|" +
			body.RazorpayPaymentID

	mac := hmac.New(
		sha256.New,
		[]byte(secret),
	)

	mac.Write([]byte(message))

	expectedSig := hex.EncodeToString(
		mac.Sum(nil),
	)

	if expectedSig != body.RazorpaySignature {

		c.JSON(
			http.StatusBadRequest,
			gin.H{
				"error": "invalid payment signature",
			},
		)

		return
	}

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

		c.JSON(
			http.StatusUnauthorized,
			gin.H{
				"error": "unauthorized",
			},
		)

		return
	}

	_, err := db.DB.Exec(`
		INSERT INTO users (
			keycloak_id,
			email,
			name,
			is_premium
		)
		VALUES ($1, $2, $3, false)
		ON CONFLICT (keycloak_id)
		DO NOTHING
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

	_, err = db.DB.Exec(`
		UPDATE users
		SET
			is_premium = true,
			purchased_at = NOW()
		WHERE keycloak_id = $1
	`, keycloakID)

	if err != nil {

		c.JSON(
			http.StatusInternalServerError,
			gin.H{
				"error": "failed to update user",
			},
		)

		return
	}

	c.JSON(http.StatusOK, gin.H{
		"message": "payment verified",
	})
}
