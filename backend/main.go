package main

import (
	"log"
	"os"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"
	"github.com/Harish-SN/xambook-backend/db"
	"github.com/Harish-SN/xambook-backend/handlers"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	db.Connect()

	r := gin.Default()

	r.Use(func(c *gin.Context) {
		c.Header("Access-Control-Allow-Origin", "http://localhost:5173")
		c.Header("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		c.Header("Access-Control-Allow-Headers", "Authorization, Content-Type")
		if c.Request.Method == "OPTIONS" {
			c.AbortWithStatus(204)
			return
		}
		c.Next()
	})

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{"status": "ok"})
	})

	api := r.Group("/api")
	{
		api.GET("/user/me", handlers.GetMe)
		api.GET("/tests/:subject/:testNumber/questions", handlers.GetQuestions)
		api.POST("/attempts", handlers.SaveAttempt)
		api.GET("/attempts/me", handlers.GetMyAttempts)
		api.POST("/payment/create-order", handlers.CreateOrder)
		api.POST("/payment/verify", handlers.VerifyPayment)
	}

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Server running on port %s", port)
	r.Run(":" + port)
}
