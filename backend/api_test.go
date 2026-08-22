package main

import (
	"bytes"
	"encoding/json"
	"io"
	"net/http"
	"net/http/cookiejar"
	"strings"
	"testing"
	"time"
)


const baseURL = "http://localhost:8080"

func TestAllAPIEndpoints(t *testing.T) {
	jar, err := cookiejar.New(nil)
	if err != nil {
		t.Fatalf("Failed to create cookie jar: %v", err)
	}

	client := &http.Client{
		Timeout: 5 * time.Second,
		Jar:     jar,
	}

	// 1. Health Check
	t.Run("GET /health", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/health")
		if err != nil {
			t.Fatalf("Health check request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.StatusCode)
		}
	})

	// Register temporary unit test account
	testEmail := "temp.unit.test@dayflow.io"
	regBody := map[string]string{
		"name":        "Temp Test Account",
		"email":       testEmail,
		"password":    "password123",
		"role":        "HR",
		"companyName": "Odoo India",
	}
	regBytes, _ := json.Marshal(regBody)
	client.Post(baseURL+"/api/auth/register", "application/json", bytes.NewBuffer(regBytes))

	// 2. Auth Login (Sets JWT Cookie)
	t.Run("POST /api/auth/login", func(t *testing.T) {
		body := map[string]string{
			"email":    testEmail,
			"password": "password123",
		}
		jsonBytes, _ := json.Marshal(body)

		resp, err := client.Post(baseURL+"/api/auth/login", "application/json", bytes.NewBuffer(jsonBytes))
		if err != nil {
			t.Fatalf("Login request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			b, _ := io.ReadAll(resp.Body)
			t.Fatalf("Expected status 200, got %d. Body: %s", resp.StatusCode, string(b))
		}
	})

	var testEmpID string = "ODAL0120260001"

	// 3. Auth Me (Validates JWT Cookie)
	t.Run("GET /api/auth/me", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/api/auth/me")
		if err != nil {
			t.Fatalf("GetMe request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			b, _ := io.ReadAll(resp.Body)
			t.Fatalf("Expected status 200, got %d. Body: %s", resp.StatusCode, string(b))
		}

		var userRes map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&userRes)
		if empIdVal, ok := userRes["employeeId"].(string); ok && empIdVal != "" {
			testEmpID = empIdVal
		}
	})

	// 4. Employees List
	t.Run("GET /api/employees", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/api/employees")
		if err != nil {
			t.Fatalf("GetEmployees request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.StatusCode)
		}
	})

	// 5. Attendance Records
	t.Run("GET /api/attendance", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/api/attendance")
		if err != nil {
			t.Fatalf("GetAttendance request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.StatusCode)
		}
	})

	// 6. Check In
	t.Run("POST /api/attendance/check-in", func(t *testing.T) {
		body := map[string]string{
			"employeeId": testEmpID,
			"time":       "09:15 AM",
		}
		jsonBytes, _ := json.Marshal(body)

		resp, err := client.Post(baseURL+"/api/attendance/check-in", "application/json", bytes.NewBuffer(jsonBytes))
		if err != nil {
			t.Fatalf("CheckIn request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.StatusCode)
		}
	})

	// 7. Check Out
	t.Run("POST /api/attendance/check-out", func(t *testing.T) {
		body := map[string]string{
			"employeeId": testEmpID,
			"time":       "05:30 PM",
		}
		jsonBytes, _ := json.Marshal(body)

		resp, err := client.Post(baseURL+"/api/attendance/check-out", "application/json", bytes.NewBuffer(jsonBytes))
		if err != nil {
			t.Fatalf("CheckOut request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.StatusCode)
		}
	})

	// 8. Leave Requests List
	t.Run("GET /api/leaves", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/api/leaves")
		if err != nil {
			t.Fatalf("GetLeaves request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.StatusCode)
		}
	})

	// 9. Leave Request Submission
	t.Run("POST /api/leaves/request", func(t *testing.T) {
		body := map[string]interface{}{
			"employeeId": testEmpID,
			"leaveType":  "Paid",
			"startDate":  "2026-09-01",
			"endDate":    "2026-09-02",
			"totalDays":  2,
			"reason":     "Conference attendance",
		}
		jsonBytes, _ := json.Marshal(body)

		resp, err := client.Post(baseURL+"/api/leaves/request", "application/json", bytes.NewBuffer(jsonBytes))
		if err != nil {
			t.Fatalf("SubmitLeave request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
			t.Fatalf("Expected status 201/200, got %d", resp.StatusCode)
		}
	})

	// 10. Payroll Records
	t.Run("GET /api/payroll", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/api/payroll")
		if err != nil {
			t.Fatalf("GetPayroll request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.StatusCode)
		}
	})

	// 11. Notifications
	t.Run("GET /api/notifications", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/api/notifications")
		if err != nil {
			t.Fatalf("GetNotifications request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.StatusCode)
		}
	})

	// 12. Reports Analytics
	t.Run("GET /api/reports/analytics", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/api/reports/analytics")
		if err != nil {
			t.Fatalf("GetReportsAnalytics request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.StatusCode)
		}
	})

	// 13. Messages - Send Message
	t.Run("POST /api/messages", func(t *testing.T) {
		msgPayload := strings.NewReader(`{"recipientId":"` + testEmpID + `", "content":"Hello test message"}`)
		resp, err := client.Post(baseURL+"/api/messages", "application/json", msgPayload)
		if err != nil {
			t.Fatalf("SendMessage request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusCreated {
			t.Fatalf("Expected status 201, got %d", resp.StatusCode)
		}
	})

	// 14. Messages - Get Messages Thread
	t.Run("GET /api/messages", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/api/messages?with=" + testEmpID)
		if err != nil {
			t.Fatalf("GetMessages request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.StatusCode)
		}
	})

	// 15. Messages - Get Unread Counts
	t.Run("GET /api/messages/unread", func(t *testing.T) {
		resp, err := client.Get(baseURL + "/api/messages/unread")
		if err != nil {
			t.Fatalf("GetUnreadMessageCounts request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.StatusCode)
		}
	})

	// 16. Auth Logout
	t.Run("POST /api/auth/logout", func(t *testing.T) {
		resp, err := client.Post(baseURL+"/api/auth/logout", "application/json", nil)
		if err != nil {
			t.Fatalf("Logout request failed: %v", err)
		}
		defer resp.Body.Close()

		if resp.StatusCode != http.StatusOK {
			t.Fatalf("Expected status 200, got %d", resp.StatusCode)
		}
	})

	// Delete temporary test user to ensure database remains 100% clean
	delReq, _ := http.NewRequest("DELETE", baseURL+"/api/employees/"+testEmpID, nil)
	client.Do(delReq)
}

