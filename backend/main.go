package main

import (
	"log"
	"os"

	"dayflow-backend/database"
	"dayflow-backend/handlers"

	"github.com/gofiber/fiber/v3"
	"github.com/gofiber/fiber/v3/middleware/cors"
)

func main() {
	// Initialize Database connection & seed data
	database.InitDB()

	// Initialize Fiber v3 app
	app := fiber.New(fiber.Config{
		AppName: "Dayflow HRMS API v1.0",
	})

	// Configure CORS with credentials support for HTTP cookies (Origins must be explicitly declared without wildcard)
	app.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173", "http://127.0.0.1:3000"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept", "Authorization"},
		AllowMethods:     []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
		AllowCredentials: true,
	}))

	// API Routes Group
	api := app.Group("/api")

	// Auth routes
	api.Post("/auth/login", handlers.Login)
	api.Post("/auth/register", handlers.Register)
	api.Post("/auth/logout", handlers.Logout)
	api.Post("/auth/change-password", handlers.ChangePassword)
	api.Get("/auth/me", handlers.GetMe)

	// Employee routes
	api.Get("/employees", handlers.GetEmployees)
	api.Post("/employees", handlers.CreateEmployee)
	api.Get("/employees/:id", handlers.GetEmployeeByID)
	api.Put("/employees/:id", handlers.UpdateEmployeeProfile)
	api.Delete("/employees/:id", handlers.DeleteEmployee)

	// Attendance routes
	api.Get("/attendance", handlers.GetAttendanceRecords)
	api.Post("/attendance/check-in", handlers.CheckIn)
	api.Post("/attendance/check-out", handlers.CheckOut)

	// Leave Management routes
	api.Get("/leaves", handlers.GetLeaveRequests)
	api.Post("/leaves/request", handlers.SubmitLeaveRequest)
	api.Put("/leaves/:id/status", handlers.UpdateLeaveStatus)
	api.Post("/leaves/:id/callback", handlers.CallbackLeave)
	api.Post("/leaves/:id/respond-callback", handlers.RespondCallback)
	api.Delete("/leaves/:id", handlers.DeleteLeaveRequest)

	// Payroll routes
	api.Get("/payroll", handlers.GetPayroll)
	api.Put("/payroll/:employeeId", handlers.UpdatePayroll)

	// Notification routes
	api.Get("/notifications", handlers.GetNotifications)
	api.Put("/notifications/:id/read", handlers.MarkNotificationRead)

	// Analytics & Reports route
	api.Get("/reports/analytics", handlers.GetReportsAnalytics)

	// Private Messaging routes
	api.Get("/messages", handlers.GetMessages)
	api.Post("/messages", handlers.SendMessage)
	api.Get("/messages/unread", handlers.GetUnreadMessageCounts)


	// Health Check
	app.Get("/health", func(c fiber.Ctx) error {
		return c.JSON(fiber.Map{
			"status":   "healthy",
			"app":      "Dayflow HRMS Backend",
			"engine":   "GoFiber v3",
			"database": "PostgreSQL / SQLite GORM",
			"auth":     "JWT HTTP-Only Cookies",
		})
	})

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}

	log.Printf("Dayflow GoFiber v3 Backend starting on port :%s ...", port)
	if err := app.Listen(":" + port); err != nil {
		log.Fatalf("Error starting GoFiber server: %v", err)
	}
}
