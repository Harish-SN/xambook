package main

import (
	"log"
	"os"

	"github.com/Harish-SN/xambook-backend/db"
	"github.com/Harish-SN/xambook-backend/handlers"

	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
)

func main() {
	db.Connect()

	r := gin.Default()

	r.Use(cors.Default())

	api := r.Group("/api")
	{
		// USER
		api.GET("/user/me", handlers.GetMe)

		// QUESTIONS
		api.GET(
			"/tests/:subject/:test/questions",
			func(c *gin.Context) {
				handlers.GetQuestions(c.Writer, c.Request)
			},
		)

		// ATTEMPTS
		api.POST("/attempts", handlers.SaveAttempt)
		api.GET("/attempts/me", handlers.GetMyAttempts)

		// PAYMENT
		api.POST("/payment/create-order", handlers.CreateOrder)
		api.POST("/payment/verify", handlers.VerifyPayment)

		// ADMIN
		api.POST("/admin/upload-image", handlers.UploadImage)
	}

	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	log.Println("API running on :" + port)

	r.Run(":" + port)
}
