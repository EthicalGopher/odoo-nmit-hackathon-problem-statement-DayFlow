package handlers

import (
	"fmt"
	"strconv"
	"strings"
	"time"

	"dayflow-backend/database"
	"dayflow-backend/models"
	"dayflow-backend/utils"

	"github.com/gofiber/fiber/v3"
	"github.com/golang-jwt/jwt/v5"
)

var jwtSecret = []byte("dayflow_secret_key_odoo_hackathon_2026")

func generateJWT(empID string, email string, role string) (string, error) {
	claims := jwt.MapClaims{
		"employee_id": empID,
		"email":       email,
		"role":        role,
		"exp":         time.Now().Add(24 * time.Hour).Unix(),
	}
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	return token.SignedString(jwtSecret)
}

func formatLoginID(companyName string, fullName string, year string, serial int64) string {
	compClean := strings.ToUpper(strings.ReplaceAll(companyName, " ", ""))
	compPrefix := "OI"
	if len(compClean) >= 2 {
		compPrefix = compClean[0:2]
	}

	parts := strings.Fields(fullName)
	nameCode := "JODO"
	if len(parts) >= 2 {
		f := strings.ToUpper(parts[0])
		l := strings.ToUpper(parts[len(parts)-1])
		fCode := f
		if len(f) >= 2 {
			fCode = f[0:2]
		}
		lCode := l
		if len(l) >= 2 {
			lCode = l[0:2]
		}
		nameCode = fCode + lCode
	} else if len(parts) == 1 {
		clean := strings.ToUpper(parts[0])
		if len(clean) >= 4 {
			nameCode = clean[0:4]
		} else {
			nameCode = (clean + "XXXX")[0:4]
		}
	}

	if year == "" {
		year = time.Now().Format("2006")
	}

	return fmt.Sprintf("%s%s%s%04d", compPrefix, nameCode, year, serial)
}

// Auth Handlers
func Login(c fiber.Ctx) error {
	var req models.LoginRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	var user models.User
	result := database.DB.Where("email = ? OR employee_id = ?", req.Email, req.Email).First(&user)
	if result.Error != nil || user.Password != req.Password {
		return c.Status(401).JSON(fiber.Map{"error": "Incorrect credentials. Please check your Login ID / Email and password."})
	}

	tokenStr, err := generateJWT(user.EmployeeID, user.Email, user.Role)
	if err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to generate authentication token"})
	}

	c.Cookie(&fiber.Cookie{
		Name:     "dayflow_token",
		Value:    tokenStr,
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HTTPOnly: true,
		SameSite: "Lax",
	})

	return c.JSON(fiber.Map{
		"message": "Login successful",
		"token":   tokenStr,
		"user":    user,
	})
}

func Register(c fiber.Ctx) error {
	var req models.RegisterRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	if req.Email == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Email is required"})
	}

	var existing models.User
	if database.DB.Where("email = ?", req.Email).First(&existing).Error == nil {
		return c.Status(400).JSON(fiber.Map{"error": "User with this email already exists"})
	}

	compName := req.CompanyName
	if compName == "" {
		compName = "Odoo India"
	}

	var count int64
	database.DB.Model(&models.User{}).Count(&count)

	empID := req.EmployeeID
	if empID == "" {
		empID = formatLoginID(compName, req.Name, time.Now().Format("2006"), count+1)
	}

	pass := req.Password
	if pass == "" {
		pass = "Dayflow#2026"
	}

	role := req.Role
	if role == "" {
		role = "HR"
	}

	dept := req.Department
	if dept == "" {
		dept = "People & Culture"
	}

	job := req.JobTitle
	if job == "" {
		if role == "HR" {
			job = "Head of HR Operations"
		} else {
			job = "Software Engineer"
		}
	}

	newUser := models.User{
		EmployeeID:         empID,
		CompanyName:        compName,
		CompanyLogo:        req.CompanyLogo,
		ManagerName:        "Self (HR Manager)",
		Name:               req.Name,
		Email:              req.Email,
		Password:           pass,
		Role:               role,
		Phone:              req.Phone,
		Department:         dept,
		JobTitle:           job,
		JoiningDate:        time.Now().Format("2006-01-02"),
		Address:            "Pending profile update",
		AvatarUrl:          "",
		Status:             "absent",
		PaidLeaveAvailable: 24,
		SickLeaveAvailable: 12,
	}

	if err := database.DB.Create(&newUser).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create user record"})
	}

	// Create default payroll entry
	monthWage := 75000.0
	basic := monthWage * 0.50
	hra := basic * 0.40
	standard := 5000.0
	bonus := monthWage * 0.08
	lta := monthWage * 0.05
	fixed := monthWage - (basic + hra + standard + bonus + lta)
	pf := basic * 0.12
	pt := 200.0
	net := (basic + hra + standard + bonus + lta + fixed) - (pf + pt)

	payroll := models.Payroll{
		EmployeeID:           empID,
		EmployeeName:         req.Name,
		WageType:             "Fixed",
		MonthWage:            monthWage,
		YearlyWage:           monthWage * 12,
		WorkingDaysPerWeek:   5,
		BasicSalary:          basic,
		HRA:                  hra,
		StandardAllowance:    standard,
		PerformanceBonus:     bonus,
		LeaveTravelAllowance: lta,
		FixedAllowance:       fixed,
		ProvidentFund:        pf,
		ProfessionalTax:      pt,
		NetSalary:            net,
		UpdatedAt:            time.Now(),
	}
	database.DB.Create(&payroll)

	// DISPATCH WELCOME EMAIL
	var hrEmailSender string = req.Email
	if role != "HR" {
		var hrUser models.User
		database.DB.Where("role = ?", "HR").First(&hrUser)
		if hrUser.Email != "" {
			hrEmailSender = hrUser.Email
		}
	}

	regSubject := fmt.Sprintf("Welcome to %s - DayFlow HRMS Registration", compName)
	regPlain := fmt.Sprintf("Hello %s,\n\nYour account has been successfully registered on DayFlow HRMS.\n\nEmployee ID: %s\nWork Email: %s\nRole: %s\n\nPlease log in at http://localhost:5173/login.\n\nBest regards,\nDayFlow HRMS Team", req.Name, empID, req.Email, role)
	regHTML := utils.BuildWelcomeEmailHTML(req.Name, empID, req.Email, pass, compName)
	go utils.SendEmail(hrEmailSender, req.Email, regSubject, regPlain, regHTML)

	tokenStr, _ := generateJWT(newUser.EmployeeID, newUser.Email, newUser.Role)
	c.Cookie(&fiber.Cookie{
		Name:     "dayflow_token",
		Value:    tokenStr,
		Path:     "/",
		Expires:  time.Now().Add(24 * time.Hour),
		HTTPOnly: true,
		SameSite: "Lax",
	})

	return c.Status(201).JSON(fiber.Map{
		"message": "Registration successful",
		"token":   tokenStr,
		"user":    newUser,
	})
}

func Logout(c fiber.Ctx) error {
	c.Cookie(&fiber.Cookie{
		Name:     "dayflow_token",
		Value:    "",
		Path:     "/",
		Expires:  time.Now().Add(-1 * time.Hour),
		HTTPOnly: true,
		SameSite: "Lax",
	})
	return c.JSON(fiber.Map{"message": "Logged out successfully"})
}

func GetMe(c fiber.Ctx) error {
	cookie := c.Cookies("dayflow_token")
	if cookie == "" {
		authHeader := c.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			cookie = strings.TrimPrefix(authHeader, "Bearer ")
		}
	}

	if cookie == "" {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized: No token cookie provided"})
	}

	token, err := jwt.Parse(cookie, func(token *jwt.Token) (interface{}, error) {
		if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
			return nil, fmt.Errorf("unexpected signing method")
		}
		return jwtSecret, nil
	})

	if err != nil || !token.Valid {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized: Invalid or expired token"})
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized: Invalid token claims"})
	}

	empID, _ := claims["employee_id"].(string)
	var user models.User
	if err := database.DB.Where("employee_id = ?", empID).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	return c.JSON(user)
}

func getCurrentUserFromContext(c fiber.Ctx) (*models.User, error) {
	cookie := c.Cookies("dayflow_token")
	if cookie == "" {
		authHeader := c.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			cookie = strings.TrimPrefix(authHeader, "Bearer ")
		}
	}
	if cookie == "" {
		return nil, fmt.Errorf("no token provided")
	}

	token, err := jwt.Parse(cookie, func(token *jwt.Token) (interface{}, error) {
		return jwtSecret, nil
	})
	if err != nil || !token.Valid {
		return nil, fmt.Errorf("invalid token")
	}

	claims, ok := token.Claims.(jwt.MapClaims)
	if !ok {
		return nil, fmt.Errorf("invalid claims")
	}

	empID, _ := claims["employee_id"].(string)
	var user models.User
	if err := database.DB.Where("employee_id = ?", empID).First(&user).Error; err != nil {
		return nil, fmt.Errorf("user not found")
	}
	return &user, nil
}

// Employee Handlers
func GetEmployees(c fiber.Ctx) error {
	var employees []models.User
	user, err := getCurrentUserFromContext(c)
	query := database.DB.Order("created_at desc")

	if err == nil && user != nil && user.CompanyName != "" {
		query = query.Where("company_name = ?", user.CompanyName)
	}

	query.Find(&employees)

	// Check today's attendance log for each employee to accurately set status (present, half-day, leave, absent)
	todayStr := time.Now().Format("2006-01-02")
	var todayAttendance []models.Attendance
	database.DB.Where("date = ?", todayStr).Find(&todayAttendance)

	attMap := make(map[string]models.Attendance)
	for _, att := range todayAttendance {
		attMap[att.EmployeeID] = att
	}

	for i := range employees {
		empID := employees[i].EmployeeID
		if att, exists := attMap[empID]; exists {
			if att.Status == "Half-day" || att.Status == "half-day" {
				employees[i].Status = "half-day"
			} else if att.CheckIn != "" && att.CheckIn != "--:--" && att.CheckOut != "" && att.CheckOut != "--:--" {
				inMins := parseTimeToMinutes(att.CheckIn)
				outMins := parseTimeToMinutes(att.CheckOut)
				if inMins > 0 && outMins > inMins {
					diffMins := outMins - inMins
					if diffMins <= 270 { // 4.5 hours or less (270 mins)
						employees[i].Status = "half-day"
						database.DB.Model(&models.User{}).Where("employee_id = ?", empID).Update("status", "half-day")
						database.DB.Model(&models.Attendance{}).Where("id = ?", att.ID).Update("status", "Half-day")
					}
				}
			}
		}
	}

	return c.JSON(employees)
}

func GetEmployeeByID(c fiber.Ctx) error {
	id := c.Params("id")
	var emp models.User
	result := database.DB.Where("employee_id = ? OR id = ?", id, id).First(&emp)
	if result.Error != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Employee not found"})
	}
	return c.JSON(emp)
}

type FireEmployeeRequest struct {
	Reason string `json:"reason"`
}

func DeleteEmployee(c fiber.Ctx) error {
	id := c.Params("id")
	var req FireEmployeeRequest
	c.Bind().JSON(&req)

	reason := req.Reason
	if reason == "" {
		reason = "Employment contract terminated by HR Officer"
	}

	var user models.User
	if err := database.DB.Where("employee_id = ? OR id = ?", id, id).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Employee not found"})
	}

	notif := models.Notification{
		UserEmail: user.Email,
		Title:     "Account Terminated",
		Message:   fmt.Sprintf("Your employee account (%s) was terminated. Reason: %s", user.EmployeeID, reason),
		Type:      "danger",
		Read:      false,
		CreatedAt: time.Now(),
	}
	database.DB.Create(&notif)

	// DISPATCH TERMINATION EMAIL
	var hrUser models.User
	database.DB.Where("role = ?", "HR").First(&hrUser)
	hrEmail := hrUser.Email
	if hrEmail == "" {
		hrEmail = "sankhyahrick.hr@gmail.com"
	}

	termSubject := "Important Notice: Employment Termination - DayFlow HRMS"
	termPlain := fmt.Sprintf("Dear %s,\n\nYour employment contract with %s has been terminated.\nReason: %s\n\nAll access credentials and system records have been deactivated.", user.Name, user.CompanyName, reason)
	termHTML := utils.BuildTerminationEmailHTML(user.Name, user.EmployeeID, reason, user.CompanyName)
	go utils.SendEmail(hrEmail, user.Email, termSubject, termPlain, termHTML)

	empID := user.EmployeeID

	// CASCADE DELETE ALL ASSOCIATED DATA: Leaves, Attendance, Payroll, Documents
	database.DB.Where("employee_id = ?", empID).Delete(&models.LeaveRequest{})
	database.DB.Where("employee_id = ?", empID).Delete(&models.Attendance{})
	database.DB.Where("employee_id = ?", empID).Delete(&models.Payroll{})
	database.DB.Where("employee_id = ?", empID).Delete(&models.Document{})

	if err := database.DB.Delete(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to terminate employee account"})
	}

	return c.JSON(fiber.Map{
		"message": fmt.Sprintf("Employee %s (%s) and all associated records (leaves, attendance, salary) have been completely removed", user.Name, user.EmployeeID),
		"reason":  reason,
	})
}

func CreateEmployee(c fiber.Ctx) error {
	var req models.RegisterRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid payload"})
	}

	var count int64
	database.DB.Model(&models.User{}).Count(&count)

	empID := formatLoginID("Odoo India", req.Name, time.Now().Format("2006"), count+1)
	pass := req.Password
	if pass == "" {
		pass = "Dayflow#2026"
	}

	var hrUser models.User
	cookie := c.Cookies("jwt")
	if cookie == "" {
		authHeader := c.Get("Authorization")
		if strings.HasPrefix(authHeader, "Bearer ") {
			cookie = strings.TrimPrefix(authHeader, "Bearer ")
		}
	}
	if cookie != "" {
		token, _ := jwt.Parse(cookie, func(token *jwt.Token) (interface{}, error) { return jwtSecret, nil })
		if token != nil && token.Valid {
			if claims, ok := token.Claims.(jwt.MapClaims); ok {
				empIDStr, _ := claims["employee_id"].(string)
				database.DB.Where("employee_id = ?", empIDStr).First(&hrUser)
			}
		}
	}
	if hrUser.ID == 0 {
		database.DB.Where("role = ?", "HR").First(&hrUser)
	}

	compName := hrUser.CompanyName
	if compName == "" {
		compName = "Odoo India"
	}
	compLogo := hrUser.CompanyLogo
	managerName := hrUser.Name
	if managerName != "" {
		managerName = managerName + " (HR Manager)"
	} else {
		managerName = "HR Operations"
	}

	newUser := models.User{
		EmployeeID:         empID,
		CompanyName:        compName,
		CompanyLogo:        compLogo,
		ManagerName:        managerName,
		Name:               req.Name,
		Email:              req.Email,
		Password:           pass,
		Role:               "Employee",
		Phone:              req.Phone,
		Department:         req.Department,
		JobTitle:           req.JobTitle,
		JoiningDate:        time.Now().Format("2006-01-02"),
		Address:            "Pending profile update",
		AvatarUrl:          "",
		Status:             "absent",
		PaidLeaveAvailable: 24,
		SickLeaveAvailable: 12,
	}

	if err := database.DB.Create(&newUser).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to create employee"})
	}

	// Create payroll
	createPayrollRecord(empID, req.Name, 75000)

	// Automated Email Dispatcher for HR employee creation
	hrEmail := hrUser.Email
	if hrEmail == "" {
		hrEmail = "sankhyahrick.hr@gmail.com"
	}
	emailSubject := fmt.Sprintf("Welcome to %s - DayFlow HRMS Account Credentials", compName)
	emailBody := fmt.Sprintf(
		"Hello %s,\n\nYour Employee Account has been created by your HR Officer.\n\nLogin ID: %s\nWork Email: %s\nInitial System Password: %s\n\nPlease log in at http://localhost:5173/login and update your password under Profile -> Security.\n\nBest regards,\nHR Operations",
		req.Name, empID, req.Email, pass,
	)
	welcomeHTML := utils.BuildWelcomeEmailHTML(req.Name, empID, req.Email, pass, compName)
	go utils.SendEmail(hrEmail, req.Email, emailSubject, emailBody, welcomeHTML)

	return c.Status(201).JSON(fiber.Map{
		"message":          "Employee created successfully & email sent",
		"employee":         newUser,
		"generatedLoginId": empID,
		"initialPassword":  pass,
		"emailSent":        true,
		"emailRecipient":   req.Email,
		"emailSubject":     emailSubject,
		"emailBody":        emailBody,
	})
}

type ChangePasswordRequest struct {
	EmployeeID      string `json:"employeeId"`
	CurrentPassword string `json:"currentPassword"`
	NewPassword     string `json:"newPassword"`
}

func ChangePassword(c fiber.Ctx) error {
	var req ChangePasswordRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid payload"})
	}

	var user models.User
	if err := database.DB.Where("employee_id = ? OR id = ?", req.EmployeeID, req.EmployeeID).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "User not found"})
	}

	if user.Password != req.CurrentPassword {
		return c.Status(400).JSON(fiber.Map{"error": "Incorrect current password"})
	}

	user.Password = req.NewPassword
	if err := database.DB.Save(&user).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to update password"})
	}

	return c.JSON(fiber.Map{"message": "Password updated successfully"})
}

func UpdateEmployeeProfile(c fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdateProfileRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request body"})
	}

	var emp models.User
	if err := database.DB.Where("employee_id = ? OR id = ?", id, id).First(&emp).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Employee not found"})
	}

	if req.Phone != "" {
		emp.Phone = req.Phone
	}
	if req.Address != "" {
		emp.Address = req.Address
	}
	if req.Location != "" {
		emp.Location = req.Location
	}
	if req.WorkingDays > 0 {
		emp.WorkingDays = req.WorkingDays
	}
	if req.DOB != "" {
		emp.DOB = req.DOB
	}
	if req.Nationality != "" {
		emp.Nationality = req.Nationality
	}
	if req.PersonalEmail != "" {
		emp.PersonalEmail = req.PersonalEmail
	}
	if req.Gender != "" {
		emp.Gender = req.Gender
	}
	if req.MaritalStatus != "" {
		emp.MaritalStatus = req.MaritalStatus
	}
	if req.AccountNumber != "" {
		emp.AccountNumber = req.AccountNumber
	}
	if req.BankName != "" {
		emp.BankName = req.BankName
	}
	if req.IFSCCode != "" {
		emp.IFSCCode = req.IFSCCode
	}
	if req.PanNo != "" {
		emp.PanNo = req.PanNo
	}
	if req.UanNo != "" {
		emp.UanNo = req.UanNo
	}
	if req.AvatarUrl != "" {
		emp.AvatarUrl = req.AvatarUrl
	}
	if req.GmailAppPassword != "" {
		emp.GmailAppPassword = req.GmailAppPassword
	}

	if req.Name != "" {
		emp.Name = req.Name
	}
	if req.Email != "" {
		emp.Email = req.Email
	}
	if req.Role != "" {
		emp.Role = req.Role
	}
	if req.Department != "" {
		emp.Department = req.Department
	}
	if req.JobTitle != "" {
		emp.JobTitle = req.JobTitle
	}
	if req.JoiningDate != "" {
		emp.JoiningDate = req.JoiningDate
	}

	emp.UpdatedAt = time.Now()
	database.DB.Save(&emp)

	if req.MonthWage > 0 || req.BasicSalary > 0 || req.WorkingDays > 0 {
		var payroll models.Payroll
		if err := database.DB.Where("employee_id = ?", emp.EmployeeID).First(&payroll).Error; err == nil {
			if req.MonthWage > 0 {
				payroll.MonthWage = req.MonthWage
				payroll.YearlyWage = req.MonthWage * 12
			}
			if req.WorkingDays > 0 {
				payroll.WorkingDaysPerWeek = req.WorkingDays
			}

			if req.BasicSalary > 0 {
				payroll.BasicSalary = req.BasicSalary
			} else if req.MonthWage > 0 {
				payroll.BasicSalary = req.MonthWage * 0.50
			}

			if req.HRA > 0 {
				payroll.HRA = req.HRA
			} else if req.MonthWage > 0 {
				payroll.HRA = req.MonthWage * 0.25
			}

			if req.StandardAllowance > 0 {
				payroll.StandardAllowance = req.StandardAllowance
			} else if payroll.StandardAllowance == 0 {
				payroll.StandardAllowance = 4167.0
			}

			if req.PerformanceBonus > 0 {
				payroll.PerformanceBonus = req.PerformanceBonus
			} else if req.MonthWage > 0 {
				payroll.PerformanceBonus = req.MonthWage * 0.0417
			}

			if req.LeaveTravelAllowance > 0 {
				payroll.LeaveTravelAllowance = req.LeaveTravelAllowance
			} else if req.MonthWage > 0 {
				payroll.LeaveTravelAllowance = req.MonthWage * 0.0417
			}

			pf := payroll.BasicSalary * 0.12
			pt := 200.0
			payroll.ProvidentFund = pf
			payroll.ProfessionalTax = pt
			payroll.NetSalary = (payroll.BasicSalary + payroll.HRA + payroll.StandardAllowance + payroll.PerformanceBonus + payroll.LeaveTravelAllowance) - (pf + pt)
			payroll.UpdatedAt = time.Now()
			database.DB.Save(&payroll)
		}
	}

	return c.JSON(fiber.Map{
		"message":  "Profile updated successfully",
		"employee": emp,
	})
}

func parseTimeToMinutes(tStr string) int {
	tStr = strings.TrimSpace(tStr)
	if tStr == "" || tStr == "--:--" {
		return 0
	}

	tUpper := strings.ToUpper(tStr)
	tUpper = strings.ReplaceAll(tUpper, "\u00a0", " ")

	formats := []string{
		"03:04 PM",
		"3:04 PM",
		"03:04PM",
		"3:04PM",
		"15:04:05",
		"15:04",
	}

	for _, fmtStr := range formats {
		if t, err := time.Parse(fmtStr, tUpper); err == nil {
			return t.Hour()*60 + t.Minute()
		}
	}

	var h, m int
	var ampm string
	n, _ := fmt.Sscanf(tUpper, "%d:%d %s", &h, &m, &ampm)
	if n >= 2 {
		if strings.HasPrefix(ampm, "P") && h < 12 {
			h += 12
		} else if strings.HasPrefix(ampm, "A") && h == 12 {
			h = 0
		}
		return h*60 + m
	}

	return 0
}

func formatTimeToAMPM(tStr string) string {
	tStr = strings.TrimSpace(tStr)
	if tStr == "" || tStr == "--:--" {
		return "--:--"
	}

	tUpper := strings.ToUpper(tStr)
	tUpper = strings.ReplaceAll(tUpper, "\u00a0", " ")

	formats := []string{
		"03:04 PM",
		"3:04 PM",
		"03:04PM",
		"3:04PM",
		"15:04:05",
		"15:04",
	}

	for _, fmtStr := range formats {
		if t, err := time.Parse(fmtStr, tUpper); err == nil {
			return t.Format("03:04 PM")
		}
	}

	var h, m int
	var ampm string
	n, _ := fmt.Sscanf(tUpper, "%d:%d %s", &h, &m, &ampm)
	if n >= 2 {
		if strings.HasPrefix(ampm, "P") && h < 12 {
			h += 12
		} else if strings.HasPrefix(ampm, "A") && h == 12 {
			h = 0
		}
		t := time.Date(2026, 1, 1, h, m, 0, 0, time.UTC)
		return t.Format("03:04 PM")
	}

	return tStr
}

func calculateWorkAndExtraHours(checkInStr, checkOutStr string) (string, string) {
	inMins := parseTimeToMinutes(checkInStr)
	outMins := parseTimeToMinutes(checkOutStr)

	if inMins == 0 || outMins == 0 || outMins <= inMins {
		return "00h 00m", "00h 00m"
	}

	diff := outMins - inMins
	hours := diff / 60
	mins := diff % 60
	workStr := fmt.Sprintf("%02dh %02dm", hours, mins)

	extraStr := "00h 00m"
	if diff > 480 { // Over standard 8 hours (480 mins)
		extraDiff := diff - 480
		eHours := extraDiff / 60
		eMins := extraDiff % 60
		extraStr = fmt.Sprintf("%02dh %02dm", eHours, eMins)
	}

	return workStr, extraStr
}

// Attendance Handlers
func GetAttendanceRecords(c fiber.Ctx) error {
	empID := c.Query("employeeId")
	month := c.Query("month")
	date := c.Query("date")
	if date == "" {
		date = time.Now().Format("2006-01-02")
	}

	// If a month is specified, return all attendance records for that month
	if month != "" {
		var records []models.Attendance
		database.DB.Where("date LIKE ?", month+"%").Order("date desc, employee_id").Find(&records)
		for i := range records {
			records[i].CheckIn = formatTimeToAMPM(records[i].CheckIn)
			records[i].CheckOut = formatTimeToAMPM(records[i].CheckOut)
			if records[i].CheckIn != "--:--" && records[i].CheckOut != "--:--" {
				wh, eh := calculateWorkAndExtraHours(records[i].CheckIn, records[i].CheckOut)
				records[i].WorkHours = wh
				records[i].ExtraHours = eh
			}
		}
		return c.JSON(records)
	}

	if empID != "" {
		var records []models.Attendance
		database.DB.Where("employee_id = ?", empID).Order("date desc").Find(&records)
		for i := range records {
			records[i].CheckIn = formatTimeToAMPM(records[i].CheckIn)
			records[i].CheckOut = formatTimeToAMPM(records[i].CheckOut)
			if records[i].CheckIn != "--:--" && records[i].CheckOut != "--:--" {
				wh, eh := calculateWorkAndExtraHours(records[i].CheckIn, records[i].CheckOut)
				records[i].WorkHours = wh
				records[i].ExtraHours = eh
			}
		}
		return c.JSON(records)
	}

	// For HR Admin view: show all employees status on current date
	var todayRecords []models.Attendance
	database.DB.Where("date = ?", date).Find(&todayRecords)

	recordMap := make(map[string]models.Attendance)
	for _, r := range todayRecords {
		r.CheckIn = formatTimeToAMPM(r.CheckIn)
		r.CheckOut = formatTimeToAMPM(r.CheckOut)
		if r.CheckIn != "--:--" && r.CheckOut != "--:--" {
			r.WorkHours, r.ExtraHours = calculateWorkAndExtraHours(r.CheckIn, r.CheckOut)
			database.DB.Model(&models.Attendance{}).Where("id = ?", r.ID).Updates(map[string]interface{}{
				"check_in":    r.CheckIn,
				"check_out":   r.CheckOut,
				"work_hours":  r.WorkHours,
				"extra_hours": r.ExtraHours,
			})
		}
		recordMap[r.EmployeeID] = r
	}

	var users []models.User
	user, err := getCurrentUserFromContext(c)
	userQuery := database.DB.Order("created_at desc")
	if err == nil && user != nil && user.CompanyName != "" {
		userQuery = userQuery.Where("company_name = ?", user.CompanyName)
	}
	userQuery.Find(&users)

	var result []models.Attendance
	for _, u := range users {
		if rec, exists := recordMap[u.EmployeeID]; exists {
			rec.CheckIn = formatTimeToAMPM(rec.CheckIn)
			rec.CheckOut = formatTimeToAMPM(rec.CheckOut)
			result = append(result, rec)
		} else {
			status := "Absent"
			if u.Status == "leave" {
				status = "Leave"
			}
			result = append(result, models.Attendance{
				EmployeeID:   u.EmployeeID,
				EmployeeName: u.Name,
				Date:         date,
				CheckIn:      "--:--",
				CheckOut:     "--:--",
				WorkHours:    "00h 00m",
				ExtraHours:   "00h 00m",
				Status:       status,
			})
		}
	}

	return c.JSON(result)
}

func CheckIn(c fiber.Ctx) error {
	var req models.CheckInRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	todayStr := time.Now().Format("2006-01-02")
	timeStr := formatTimeToAMPM(req.Time)
	if timeStr == "" || timeStr == "--:--" {
		timeStr = time.Now().Format("03:04 PM")
	}

	var user models.User
	if err := database.DB.Where("employee_id = ?", req.EmployeeID).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Employee not found"})
	}

	var record models.Attendance
	err := database.DB.Where("employee_id = ? AND date = ?", req.EmployeeID, todayStr).First(&record).Error

	if err != nil {
		// New record for today — create with check-in
		record = models.Attendance{
			EmployeeID:   req.EmployeeID,
			EmployeeName: user.Name,
			Date:         todayStr,
			CheckIn:      timeStr,
			CheckOut:     "--:--",
			WorkHours:    "00h 00m",
			ExtraHours:   "00h 00m",
			Status:       "Present",
		}
		database.DB.Create(&record)
	} else {
		// Record already exists — only update check-in if not yet set
		if record.CheckIn == "" || record.CheckIn == "--:--" {
			record.CheckIn = timeStr
		}
		// Recompute work hours only if both check-in and check-out are present
		if record.CheckIn != "--:--" && record.CheckOut != "--:--" {
			record.WorkHours, record.ExtraHours = calculateWorkAndExtraHours(record.CheckIn, record.CheckOut)
		}
		record.Status = "Present"
		database.DB.Save(&record)
	}
	user.Status = "present"
	database.DB.Save(&user)

	notif := models.Notification{
		UserEmail: user.Email,
		Title:     "Check-In Successful",
		Message:   fmt.Sprintf("You checked in at %s.", timeStr),
		Type:      "success",
		Read:      false,
		CreatedAt: time.Now(),
	}
	database.DB.Create(&notif)

	return c.JSON(fiber.Map{
		"message": "Checked in successfully",
		"record":  record,
	})
}

func CheckOut(c fiber.Ctx) error {
	var req models.CheckOutRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	todayStr := time.Now().Format("2006-01-02")
	timeStr := formatTimeToAMPM(req.Time)
	if timeStr == "" || timeStr == "--:--" {
		timeStr = time.Now().Format("03:04 PM")
	}

	var user models.User
	if err := database.DB.Where("employee_id = ?", req.EmployeeID).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Employee not found"})
	}

	var record models.Attendance
	err := database.DB.Where("employee_id = ? AND date = ?", req.EmployeeID, todayStr).First(&record).Error
	
	checkInStr := "09:00 AM"
	if record.CheckIn != "" && record.CheckIn != "--:--" {
		checkInStr = record.CheckIn
	}
	workHours, extraHours := calculateWorkAndExtraHours(checkInStr, timeStr)

	inMins := parseTimeToMinutes(checkInStr)
	outMins := parseTimeToMinutes(timeStr)

	attStatus := "Present"
	userStatus := "absent"

	if inMins > 0 && outMins > inMins {
		diffMins := outMins - inMins
		if diffMins <= 270 { // 4.5 hours or less (270 mins)
			attStatus = "Half-day"
			userStatus = "half-day"
		}
	}

	if err != nil {
		record = models.Attendance{
			EmployeeID:   req.EmployeeID,
			EmployeeName: user.Name,
			Date:         todayStr,
			CheckIn:      checkInStr,
			CheckOut:     timeStr,
			WorkHours:    workHours,
			ExtraHours:   extraHours,
			Status:       attStatus,
		}
		database.DB.Create(&record)
	} else {
		record.CheckOut = timeStr
		record.WorkHours = workHours
		record.ExtraHours = extraHours
		record.Status = attStatus
		database.DB.Save(&record)
	}

	user.Status = userStatus
	database.DB.Save(&user)

	return c.JSON(fiber.Map{
		"message": "Checked out successfully",
		"record":  record,
	})
}

// Leave Handlers
func GetLeaveRequests(c fiber.Ctx) error {
	empID := c.Query("employeeId")
	status := c.Query("status")

	var leaves []models.LeaveRequest
	query := database.DB.Order("created_at desc")
	if empID != "" {
		query = query.Where("employee_id = ?", empID)
	}
	if status != "" {
		query = query.Where("status = ?", status)
	}
	query.Find(&leaves)
	return c.JSON(leaves)
}

func SubmitLeaveRequest(c fiber.Ctx) error {
	var leave models.LeaveRequest
	if err := c.Bind().JSON(&leave); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	var user models.User
	if err := database.DB.Where("employee_id = ?", leave.EmployeeID).First(&user).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Employee not found"})
	}

	if leave.StartDate > leave.EndDate {
		return c.Status(400).JSON(fiber.Map{"error": "Start date cannot be after end date"})
	}

	leave.EmployeeName = user.Name
	leave.Status = "Pending"
	leave.CreatedAt = time.Now()

	if leave.TotalDays <= 0 {
		leave.TotalDays = 1
	}

	if err := database.DB.Create(&leave).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to submit leave request"})
	}

	notif := models.Notification{
		UserEmail: "all",
		Title:     "New Leave Request",
		Message:   fmt.Sprintf("%s submitted a %s Leave request for %d days.", user.Name, leave.LeaveType, leave.TotalDays),
		Type:      "info",
		Read:      false,
		CreatedAt: time.Now(),
	}
	database.DB.Create(&notif)

	return c.Status(201).JSON(fiber.Map{
		"message": "Leave request submitted successfully",
		"leave":   leave,
	})
}

func UpdateLeaveStatus(c fiber.Ctx) error {
	id := c.Params("id")
	var req models.UpdateLeaveStatusRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid payload"})
	}

	var leave models.LeaveRequest
	if err := database.DB.First(&leave, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Leave request not found"})
	}

	leave.Status = req.Status
	leave.HRComment = req.HRComment
	database.DB.Save(&leave)

	var user models.User
	if err := database.DB.Where("employee_id = ?", leave.EmployeeID).First(&user).Error; err == nil {
		if req.Status == "Approved" {
			user.Status = "leave"
			if leave.LeaveType == "Paid" {
				user.PaidLeaveAvailable -= leave.TotalDays
				if user.PaidLeaveAvailable < 0 {
					user.PaidLeaveAvailable = 0
				}
			} else if leave.LeaveType == "Sick" {
				user.SickLeaveAvailable -= leave.TotalDays
				if user.SickLeaveAvailable < 0 {
					user.SickLeaveAvailable = 0
				}
			}
			database.DB.Save(&user)
		}

		notif := models.Notification{
			UserEmail: user.Email,
			Title:     fmt.Sprintf("Leave Request %s", req.Status),
			Message:   fmt.Sprintf("Your %s leave request from %s to %s was %s.", leave.LeaveType, leave.StartDate, leave.EndDate, strings.ToLower(req.Status)),
			Type:      "info",
			Read:      false,
			CreatedAt: time.Now(),
		}
		if req.Status == "Approved" {
			notif.Type = "success"
		} else {
			notif.Type = "warning"
		}
		database.DB.Create(&notif)
	}

	return c.JSON(fiber.Map{
		"message": fmt.Sprintf("Leave request %s", strings.ToLower(req.Status)),
		"leave":   leave,
	})
}

func CallbackLeave(c fiber.Ctx) error {
	id := c.Params("id")
	var req models.CallbackLeaveRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid payload"})
	}

	var leave models.LeaveRequest
	if err := database.DB.First(&leave, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Leave request not found"})
	}

	leave.Status = "Callback Pending"
	leave.CallbackStatus = "Pending"
	leave.CallbackReason = req.Reason
	leave.CallbackEffectiveDate = req.EffectiveDate
	database.DB.Save(&leave)

	var user models.User
	if err := database.DB.Where("employee_id = ?", leave.EmployeeID).First(&user).Error; err == nil {
		// Send notification
		notif := models.Notification{
			UserEmail: user.Email,
			Title:     "URGENT: Time Off Call Back Notice",
			Message:   fmt.Sprintf("HR has requested a call back from your leave starting %s. Reason: %s", req.EffectiveDate, req.Reason),
			Type:      "danger",
			Read:      false,
			CreatedAt: time.Now(),
		}
		database.DB.Create(&notif)

		// Dispatch Email via HR Gmail
		var hrUser models.User
		database.DB.Where("role = ?", "HR").First(&hrUser)
		hrEmail := hrUser.Email
		if hrEmail == "" {
			hrEmail = "sankhyahrick.hr@gmail.com"
		}

		subject := "URGENT: Time Off Call Back Notice from HR"
		plainText := fmt.Sprintf("Dear %s,\n\nHR Operations has issued an urgent Call Back notice for your current leave.\n\nCallback Effective Date: %s\nReason: %s\n\nPlease log in to DayFlow HRMS to accept or decline this callback request.\n\nBest regards,\nHR Operations", user.Name, req.EffectiveDate, req.Reason)
		htmlContent := fmt.Sprintf(`
<!DOCTYPE html>
<html>
<body style="font-family: sans-serif; background-color: #141312; color: #E8E3DD; padding: 20px;">
  <div style="background-color: #1C1A19; border: 1px solid #E06C68; border-radius: 12px; max-width: 550px; margin: 0 auto; padding: 25px;">
    <h2 style="color: #E06C68; margin-top: 0;">URGENT: Time Off Call Back Notice</h2>
    <p>Dear <strong>%s</strong>,</p>
    <p>Your HR Department has issued an official <strong>Leave Callback Notice</strong> for your approved time off.</p>
    <div style="background-color: #291B1B; border: 1px solid #E06C68; padding: 15px; border-radius: 8px; margin: 15px 0;">
      <strong>Callback Effective Date:</strong> %s<br />
      <strong>Reason for Recall:</strong> %s
    </div>
    <p>Please log in to your <a href="http://localhost:5173/leaves" style="color: #E07A5F;">DayFlow Leave Portal</a> to accept or respond to this recall request.</p>
  </div>
</body>
</html>`, user.Name, req.EffectiveDate, req.Reason)

		go utils.SendEmail(hrEmail, user.Email, subject, plainText, htmlContent)
	}

	return c.JSON(fiber.Map{
		"message": "Callback request sent to employee successfully",
		"leave":   leave,
	})
}

func RespondCallback(c fiber.Ctx) error {
	id := c.Params("id")
	var req models.RespondCallbackRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid payload"})
	}

	var leave models.LeaveRequest
	if err := database.DB.First(&leave, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Leave request not found"})
	}

	var user models.User
	database.DB.Where("employee_id = ?", leave.EmployeeID).First(&user)

	if req.Action == "accept" {
		leave.CallbackStatus = "Accepted"
		leave.Status = "Approved"

		// Calculate new truncated end date and restore unused leave days
		effDate, errEff := time.Parse("2006-01-02", leave.CallbackEffectiveDate)
		startDate, errStart := time.Parse("2006-01-02", leave.StartDate)

		if errEff == nil && errStart == nil {
			newEndDate := effDate.AddDate(0, 0, -1)

			if newEndDate.Before(startDate) {
				restoredDays := leave.TotalDays
				leave.EndDate = leave.StartDate
				leave.TotalDays = 0
				leave.Status = "Rejected"

				if leave.LeaveType == "Paid" {
					user.PaidLeaveAvailable += restoredDays
				} else if leave.LeaveType == "Sick" {
					user.SickLeaveAvailable += restoredDays
				}
			} else {
				newTotalDays := int(newEndDate.Sub(startDate).Hours()/24) + 1
				if newTotalDays < 0 {
					newTotalDays = 0
				}

				restoredDays := leave.TotalDays - newTotalDays
				if restoredDays > 0 {
					if leave.LeaveType == "Paid" {
						user.PaidLeaveAvailable += restoredDays
					} else if leave.LeaveType == "Sick" {
						user.SickLeaveAvailable += restoredDays
					}
				}

				leave.EndDate = newEndDate.Format("2006-01-02")
				leave.TotalDays = newTotalDays
			}

			todayStr := time.Now().Format("2006-01-02")
			if todayStr >= leave.CallbackEffectiveDate {
				user.Status = "absent"
			}
			database.DB.Save(&user)
		}

		database.DB.Save(&leave)

		notif := models.Notification{
			UserEmail: "all",
			Title:     "Callback Accepted",
			Message:   fmt.Sprintf("%s accepted the leave callback. Leave truncated to %s.", leave.EmployeeName, leave.EndDate),
			Type:      "success",
			Read:      false,
			CreatedAt: time.Now(),
		}
		database.DB.Create(&notif)

		return c.JSON(fiber.Map{
			"message": "Callback request accepted. Leave days after callback date have been restored.",
			"leave":   leave,
		})
	} else {
		leave.CallbackStatus = "Rejected"
		leave.Status = "Approved"
		database.DB.Save(&leave)

		notif := models.Notification{
			UserEmail: "all",
			Title:     "Callback Declined",
			Message:   fmt.Sprintf("%s declined the leave callback.", leave.EmployeeName),
			Type:      "warning",
			Read:      false,
			CreatedAt: time.Now(),
		}
		database.DB.Create(&notif)

		return c.JSON(fiber.Map{
			"message": "Callback request declined.",
			"leave":   leave,
		})
	}
}

func DeleteLeaveRequest(c fiber.Ctx) error {
	id := c.Params("id")

	var leave models.LeaveRequest
	if err := database.DB.First(&leave, id).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Leave request not found"})
	}

	// If leave was Approved, restore allocated days back to user's leave balance
	if leave.Status == "Approved" {
		var user models.User
		if err := database.DB.Where("employee_id = ?", leave.EmployeeID).First(&user).Error; err == nil {
			if leave.LeaveType == "Paid" {
				user.PaidLeaveAvailable += leave.TotalDays
			} else if leave.LeaveType == "Sick" {
				user.SickLeaveAvailable += leave.TotalDays
			}
			user.Status = "absent"
			database.DB.Save(&user)
		}
	}

	if err := database.DB.Delete(&leave).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to delete leave request"})
	}

	return c.JSON(fiber.Map{
		"message": fmt.Sprintf("Leave request #%s has been deleted successfully", id),
	})
}

// Payroll Handlers
func GetPayroll(c fiber.Ctx) error {
	empID := c.Query("employeeId")
	if empID != "" {
		var p models.Payroll
		result := database.DB.Where("employee_id = ?", empID).First(&p)
		if result.Error != nil {
			return c.Status(404).JSON(fiber.Map{"error": "Payroll record not found"})
		}
		return c.JSON(p)
	}

	var payrolls []models.Payroll
	database.DB.Find(&payrolls)
	return c.JSON(payrolls)
}

func UpdatePayroll(c fiber.Ctx) error {
	empID := c.Params("employeeId")
	var req struct {
		MonthWage          float64 `json:"monthWage"`
		WorkingDaysPerWeek int     `json:"workingDaysPerWeek"`
	}
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	var p models.Payroll
	if err := database.DB.Where("employee_id = ?", empID).First(&p).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Payroll record not found"})
	}

	monthWage := req.MonthWage
	basic := monthWage * 0.50
	hra := basic * 0.40
	standard := 5000.0
	bonus := monthWage * 0.08
	lta := monthWage * 0.05
	fixed := monthWage - (basic + hra + standard + bonus + lta)
	if fixed < 0 {
		fixed = 2000.0
	}
	pf := basic * 0.12
	pt := 200.0
	net := (basic + hra + standard + bonus + lta + fixed) - (pf + pt)

	p.MonthWage = monthWage
	p.YearlyWage = monthWage * 12
	if req.WorkingDaysPerWeek > 0 {
		p.WorkingDaysPerWeek = req.WorkingDaysPerWeek
	}
	p.BasicSalary = basic
	p.HRA = hra
	p.StandardAllowance = standard
	p.PerformanceBonus = bonus
	p.LeaveTravelAllowance = lta
	p.FixedAllowance = fixed
	p.ProvidentFund = pf
	p.ProfessionalTax = pt
	p.NetSalary = net
	p.UpdatedAt = time.Now()

	database.DB.Save(&p)

	return c.JSON(fiber.Map{
		"message": "Payroll updated successfully",
		"payroll": p,
	})
}

// Notifications Handlers
func GetNotifications(c fiber.Ctx) error {
	email := c.Query("email")
	var notifs []models.Notification
	query := database.DB.Order("created_at desc")
	if email != "" {
		query = query.Where("user_email = ? OR user_email = 'all'", email)
	}
	query.Find(&notifs)
	return c.JSON(notifs)
}

func MarkNotificationRead(c fiber.Ctx) error {
	id := c.Params("id")
	if id == "read-all" {
		database.DB.Model(&models.Notification{}).Where("read = ?", false).Update("read", true)
		return c.JSON(fiber.Map{"message": "All notifications marked as read"})
	}

	idUint, _ := strconv.Atoi(id)
	database.DB.Model(&models.Notification{}).Where("id = ?", idUint).Update("read", true)
	return c.JSON(fiber.Map{"message": "Notification marked as read"})
}

// Reports Analytics Handler
func GetReportsAnalytics(c fiber.Ctx) error {
	var totalEmployees int64
	var presentCount int64
	var leaveCount int64
	var pendingLeaveCount int64

	database.DB.Model(&models.User{}).Count(&totalEmployees)
	database.DB.Model(&models.User{}).Where("status = ?", "present").Count(&presentCount)
	database.DB.Model(&models.User{}).Where("status = ?", "leave").Count(&leaveCount)
	database.DB.Model(&models.LeaveRequest{}).Where("status = ?", "Pending").Count(&pendingLeaveCount)

	var payrolls []models.Payroll
	database.DB.Find(&payrolls)

	var totalMonthlyPayroll float64
	for _, p := range payrolls {
		totalMonthlyPayroll += p.NetSalary
	}

	var totalAttendanceCount int64
	var presentAttendanceCount int64
	database.DB.Model(&models.Attendance{}).Count(&totalAttendanceCount)
	database.DB.Model(&models.Attendance{}).Where("status = ?", "Present").Count(&presentAttendanceCount)

	attendanceRate := 0.0
	if totalAttendanceCount > 0 {
		attendanceRate = (float64(presentAttendanceCount) / float64(totalAttendanceCount)) * 100.0
	} else if totalEmployees > 0 {
		attendanceRate = (float64(presentCount) / float64(totalEmployees)) * 100.0
	} else {
		attendanceRate = 100.0
	}
	rateFormatted, _ := strconv.ParseFloat(fmt.Sprintf("%.1f", attendanceRate), 64)

	return c.JSON(fiber.Map{
		"totalEmployees":       totalEmployees,
		"presentToday":         presentCount,
		"onLeave":              leaveCount,
		"pendingLeave":         pendingLeaveCount,
		"totalMonthlyPayroll":  totalMonthlyPayroll,
		"attendanceRate":       rateFormatted,
		"workingDaysThisMonth": 22,
	})
}

func createPayrollRecord(empId string, name string, monthWage float64) models.Payroll {
	basic := monthWage * 0.50
	hra := basic * 0.40
	standard := 5000.0
	bonus := monthWage * 0.08
	lta := monthWage * 0.05
	fixed := monthWage - (basic + hra + standard + bonus + lta)
	if fixed < 0 {
		fixed = 2000.0
	}
	pf := basic * 0.12
	pt := 200.0
	net := (basic + hra + standard + bonus + lta + fixed) - (pf + pt)

	p := models.Payroll{
		EmployeeID:           empId,
		EmployeeName:         name,
		WageType:             "Fixed",
		MonthWage:            monthWage,
		YearlyWage:           monthWage * 12,
		WorkingDaysPerWeek:   5,
		BasicSalary:          basic,
		HRA:                  hra,
		StandardAllowance:    standard,
		PerformanceBonus:     bonus,
		LeaveTravelAllowance: lta,
		FixedAllowance:       fixed,
		ProvidentFund:        pf,
		ProfessionalTax:      pt,
		NetSalary:            net,
		UpdatedAt:            time.Now(),
	}
	database.DB.Create(&p)
	return p
}

// Messaging Handlers
func GetMessages(c fiber.Ctx) error {
	currentUser, err := getCurrentUserFromContext(c)
	if err != nil || currentUser == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	withEmpID := c.Query("with")
	if withEmpID == "" {
		withEmpID = c.Query("recipientId")
	}

	if withEmpID != "" {
		var messages []models.Message
		database.DB.Where(
			"(sender_id = ? AND recipient_id = ?) OR (sender_id = ? AND recipient_id = ?)",
			currentUser.EmployeeID, withEmpID, withEmpID, currentUser.EmployeeID,
		).Order("created_at asc").Find(&messages)

		// Mark received messages from this sender as read
		database.DB.Model(&models.Message{}).
			Where("sender_id = ? AND recipient_id = ? AND read = ?", withEmpID, currentUser.EmployeeID, false).
			Update("read", true)

		return c.JSON(messages)
	}

	var allMessages []models.Message
	database.DB.Where("sender_id = ? OR recipient_id = ?", currentUser.EmployeeID, currentUser.EmployeeID).
		Order("created_at desc").Find(&allMessages)

	return c.JSON(allMessages)
}

func SendMessage(c fiber.Ctx) error {
	currentUser, err := getCurrentUserFromContext(c)
	if err != nil || currentUser == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	var req models.SendMessageRequest
	if err := c.Bind().JSON(&req); err != nil {
		return c.Status(400).JSON(fiber.Map{"error": "Invalid request payload"})
	}

	if req.RecipientID == "" || strings.TrimSpace(req.Content) == "" {
		return c.Status(400).JSON(fiber.Map{"error": "Recipient ID and message content are required"})
	}

	var recipient models.User
	if err := database.DB.Where("employee_id = ? OR id = ?", req.RecipientID, req.RecipientID).First(&recipient).Error; err != nil {
		return c.Status(404).JSON(fiber.Map{"error": "Recipient employee not found"})
	}

	msg := models.Message{
		SenderID:      currentUser.EmployeeID,
		SenderName:    currentUser.Name,
		RecipientID:   recipient.EmployeeID,
		RecipientName: recipient.Name,
		CompanyName:   currentUser.CompanyName,
		Content:       strings.TrimSpace(req.Content),
		Read:          false,
		CreatedAt:     time.Now(),
	}

	if err := database.DB.Create(&msg).Error; err != nil {
		return c.Status(500).JSON(fiber.Map{"error": "Failed to send message"})
	}

	// Create notification for recipient
	snippet := msg.Content
	if len(snippet) > 60 {
		snippet = snippet[:60] + "..."
	}
	notif := models.Notification{
		UserEmail: recipient.Email,
		Title:     fmt.Sprintf("New Private Message from %s", currentUser.Name),
		Message:   fmt.Sprintf("\"%s\"", snippet),
		Type:      "info",
		Read:      false,
		CreatedAt: time.Now(),
	}
	database.DB.Create(&notif)

	return c.Status(201).JSON(fiber.Map{
		"message": "Message sent successfully",
		"data":    msg,
	})
}

func GetUnreadMessageCounts(c fiber.Ctx) error {
	currentUser, err := getCurrentUserFromContext(c)
	if err != nil || currentUser == nil {
		return c.Status(401).JSON(fiber.Map{"error": "Unauthorized"})
	}

	type Result struct {
		SenderID string `json:"senderId"`
		Count    int    `json:"count"`
	}
	var results []Result
	database.DB.Model(&models.Message{}).
		Select("sender_id, count(*) as count").
		Where("recipient_id = ? AND read = ?", currentUser.EmployeeID, false).
		Group("sender_id").
		Scan(&results)

	unreadMap := make(map[string]int)
	totalUnread := 0
	for _, r := range results {
		unreadMap[r.SenderID] = r.Count
		totalUnread += r.Count
	}

	return c.JSON(fiber.Map{
		"unreadBySender": unreadMap,
		"totalUnread":    totalUnread,
	})
}

