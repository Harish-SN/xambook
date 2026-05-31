package main

import (
	"log"
	"os"

	"github.com/Harish-SN/xambook-backend/db"
	"github.com/Harish-SN/xambook-backend/handlers"
	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	db.Connect()

	r := gin.Default()

	// CORS Middleware
	r.Use(func(c *gin.Context) {
		allowedOrigins := map[string]bool{
			"https://xambook.com":        true,
			"https://www.xambook.com":    true,
			"https://argocd.xambook.com": true,
			"http://localhost:5173":      true, // local frontend
		}

		origin := c.Request.Header.Get("Origin")

		if allowedOrigins[origin] {
			c.Header("Access-Control-Allow-Origin", origin)
		}

		c.Header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type")
		c.Header("Access-Control-Allow-Credentials", "true")

		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}

		c.Next()
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	api := r.Group("/api")
	{
		api.GET("/user/me", handlers.GetMe)

		api.GET("/tests/:subject/:testNumber/questions",
			handlers.GetQuestions)

		api.POST("/attempts",
			handlers.SaveAttempt)

		api.GET("/attempts/me",
			handlers.GetMyAttempts)

		api.POST("/payment/create-order",
			handlers.CreateOrder)

		api.POST("/payment/verify",
			handlers.VerifyPayment)
	}

	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on port %s", port)

	r.Run(":" + port)
}
// trigger
