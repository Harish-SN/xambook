package main

import (
	"context"
	"log"
	"os"

	"github.com/Harish-SN/xambook-backend/db"
	"github.com/Harish-SN/xambook-backend/handlers"
	"github.com/Harish-SN/xambook-backend/internal/storage"
	"github.com/Harish-SN/xambook-backend/internal/telemetry"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)

func main() {
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found")
	}

	shutdown := telemetry.InitTracer()
	defer shutdown(context.Background())

	db.Connect()

	if err := storage.InitMinio(); err != nil {
		log.Fatal(err)
	}

	r := gin.Default()

	r.Use(otelgin.Middleware("xambook-backend"))

	r.Use(corsMiddleware())

	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	api := r.Group("/api")
	{
		api.POST("/admin/upload-image",
			handlers.UploadImage)

		api.GET("/user/me",
			handlers.GetMe)

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

	if err := r.Run(":" + port); err != nil {
		log.Fatal(err)
	}
}

func corsMiddleware() gin.HandlerFunc {
	return func(c *gin.Context) {

		allowedOrigins := map[string]bool{
			"https://xambook.com":        true,
			"https://www.xambook.com":    true,
			"https://argocd.xambook.com": true,
			"https://minio.xambook.com":  true,
			"http://localhost:5173":      true,
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
	}
}
