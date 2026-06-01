package main

import (
	"context"
	"log"
	"os"

	"github.com/Harish-SN/xambook-backend/db"
	"github.com/Harish-SN/xambook-backend/handlers"
	"github.com/Harish-SN/xambook-backend/internal/storage"
	"github.com/Harish-SN/xambook-backend/internal/telemetry"
	"github.com/Harish-SN/xambook-backend/middleware"

	"github.com/gin-gonic/gin"
	"github.com/joho/godotenv"

	"go.opentelemetry.io/contrib/instrumentation/github.com/gin-gonic/gin/otelgin"
)

func main() {

	// Load .env
	err := godotenv.Load()

	if err != nil {
		log.Println("No .env file found")
	} else {
		log.Println(".env loaded successfully")
	}

	// Debug Razorpay env
	log.Println(
		"RAZORPAY_KEY_ID:",
		os.Getenv("RAZORPAY_KEY_ID"),
	)

	log.Println(
		"RAZORPAY_KEY_SECRET loaded:",
		os.Getenv("RAZORPAY_KEY_SECRET") != "",
	)

	// Telemetry
	shutdown := telemetry.InitTracer()
	defer shutdown(context.Background())

	// Database
	db.Connect()

	// MinIO
	if err := storage.InitMinio(); err != nil {
		log.Fatal(err)
	}

	// Gin
	r := gin.Default()

	r.Use(
		otelgin.Middleware(
			"xambook-backend",
		),
	)

	r.Use(corsMiddleware())

	// Health
	r.GET("/health", func(c *gin.Context) {
		c.JSON(200, gin.H{
			"status": "ok",
		})
	})

	// Keycloak auth middleware
	authMiddleware, err := middleware.NewKeycloakAuth(
		"https://auth.xambook.com/realms/xambook",
	)

	if err != nil {
		log.Fatal(err)
	}

	// =========================================
	// API ROUTES
	// =========================================

	api := r.Group("/api")

	{
		// =========================================
		// PUBLIC ROUTES
		// =========================================

		// FREE TEST ONLY
		api.GET(
			"/tests/free/:testNumber/questions",
			handlers.GetQuestions,
		)

		// Public payment config
		api.GET(
			"/payment/config",
			handlers.GetPaymentConfig,
		)

		// =========================================
		// AUTH ROUTES
		// =========================================

		protected := api.Group("/")
		protected.Use(authMiddleware)

		{
			// User
			protected.GET(
				"/user/me",
				handlers.GetMe,
			)

			// Attempts
			protected.POST(
				"/attempts",
				handlers.SaveAttempt,
			)

			protected.GET(
				"/attempts/me",
				handlers.GetMyAttempts,
			)

			// Admin
			protected.POST(
				"/admin/upload-image",
				handlers.UploadImage,
			)
		}

		// =========================================
		// PREMIUM TEST ROUTES
		// =========================================

		premium := api.Group("/tests")

		premium.Use(authMiddleware)

		premium.Use(
			middleware.PremiumMiddleware(),
		)

		{
			premium.GET(
				"/:subject/:testNumber/questions",
				handlers.GetQuestions,
			)
		}

		// =========================================
		// PAYMENT ROUTES
		// =========================================

		payment := api.Group("/payment")

		payment.Use(authMiddleware)

		{
			payment.POST(
				"/create-order",
				handlers.CreateOrder,
			)

			payment.POST(
				"/verify",
				handlers.VerifyPayment,
			)
		}
	}

	// =========================================
	// PORT
	// =========================================

	port := os.Getenv("PORT")

	if port == "" {
		port = "8080"
	}

	log.Printf(
		"Server running on port %s",
		port,
	)

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

			c.Header(
				"Access-Control-Allow-Origin",
				origin,
			)
		}

		c.Header(
			"Access-Control-Allow-Methods",
			"GET, POST, PUT, DELETE, OPTIONS",
		)

		c.Header(
			"Access-Control-Allow-Headers",
			"Authorization, Content-Type",
		)

		c.Header(
			"Access-Control-Allow-Credentials",
			"true",
		)

		if c.Request.Method == "OPTIONS" {

			c.AbortWithStatus(204)
			return
		}

		c.Next()
	}
}
