package handlers

import (
	"crypto/hmac"
	"crypto/sha256"
	"encoding/hex"
	"net/http"
	"os"

	"github.com/Harish-SN/xambook-backend/db"
	"github.com/gin-gonic/gin"
	razorpay "github.com/razorpay/razorpay-go"
)

func CreateOrder(c *gin.Context) {
	client := razorpay.NewClient(
		os.Getenv("RAZORPAY_KEY_ID"),
		os.Getenv("RAZORPAY_KEY_SECRET"),
	)

	data := map[string]interface{}{
		"amount":   9900,
		"currency": "INR",
		"receipt":  "xambook_premium",
	}

	order, err := client.Order.Create(data, nil)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to create order"})
		return
	}

	c.JSON(http.StatusOK, order)
}

func VerifyPayment(c *gin.Context) {
	var body struct {
		RazorpayOrderID   string `json:"razorpay_order_id"`
		RazorpayPaymentID string `json:"razorpay_payment_id"`
		RazorpaySignature string `json:"razorpay_signature"`
	}

	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid data"})
		return
	}

	// Verify signature
	secret := os.Getenv("RAZORPAY_KEY_SECRET")
	message := body.RazorpayOrderID + "|" + body.RazorpayPaymentID
	mac := hmac.New(sha256.New, []byte(secret))
	mac.Write([]byte(message))
	expectedSig := hex.EncodeToString(mac.Sum(nil))

	if expectedSig != body.RazorpaySignature {
		c.JSON(http.StatusBadRequest, gin.H{"error": "invalid payment signature"})
		return
	}

	// Set isPremium = true
	keycloakID := "test-user-123"
	_, err := db.DB.Exec(`
		UPDATE users
		SET is_premium = true, purchased_at = NOW()
		WHERE keycloak_id = $1
	`, keycloakID)

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "failed to update user"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"message": "payment verified, premium activated"})
}
