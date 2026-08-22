package models

import (
	"time"
)

type User struct {
	ID                 uint      `gorm:"primaryKey" json:"id"`
	EmployeeID         string    `gorm:"uniqueIndex;not null" json:"employeeId"`
	CompanyName        string    `json:"companyName"`
	CompanyLogo        string    `json:"companyLogo"`
	ManagerName        string    `json:"managerName"`
	Name               string    `json:"name"`
	Email              string    `gorm:"uniqueIndex;not null" json:"email"`
	Password           string    `json:"-"`
	Role               string    `json:"role"` // "HR" or "Employee"
	Phone              string    `json:"phone"`
	Department         string    `json:"department"`
	JobTitle           string    `json:"jobTitle"`
	JoiningDate        string    `json:"joiningDate"`
	Address            string    `json:"address"`
	Location           string    `json:"location"`
	WorkingDays        int       `json:"workingDays"`
	AvatarUrl          string    `json:"avatarUrl"`
	Status             string    `json:"status"` // "present", "absent", "leave"
	PaidLeaveAvailable int       `json:"paidLeaveAvailable"`
	SickLeaveAvailable int       `json:"sickLeaveAvailable"`
	GmailAppPassword   string    `json:"gmailAppPassword,omitempty"`
	CreatedAt          time.Time `json:"createdAt"`
	UpdatedAt          time.Time `json:"updatedAt"`
}

type Attendance struct {
	ID           uint      `gorm:"primaryKey" json:"id"`
	EmployeeID   string    `gorm:"index;not null" json:"employeeId"`
	EmployeeName string    `json:"employeeName"`
	Date         string    `json:"date"` // YYYY-MM-DD
	CheckIn      string    `json:"checkIn"` // HH:MM AM/PM
	CheckOut     string    `json:"checkOut"` // HH:MM AM/PM
	WorkHours    string    `json:"workHours"`
	ExtraHours   string    `json:"extraHours"`
	Status       string    `json:"status"` // "Present", "Absent", "Half-day", "Leave"
	Remarks      string    `json:"remarks"`
	CreatedAt    time.Time `json:"createdAt"`
}

type LeaveRequest struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	EmployeeID    string    `gorm:"index;not null" json:"employeeId"`
	EmployeeName  string    `json:"employeeName"`
	LeaveType     string    `json:"leaveType"` // "Paid", "Sick", "Unpaid"
	StartDate     string    `json:"startDate"` // YYYY-MM-DD
	EndDate       string    `json:"endDate"`   // YYYY-MM-DD
	TotalDays     int       `json:"totalDays"`
	Reason        string    `json:"reason"`
	AttachmentUrl string    `json:"attachmentUrl,omitempty"`
	Status                string    `json:"status"` // "Pending", "Approved", "Rejected", "Callback Pending"
	HRComment             string    `json:"hrComment,omitempty"`
	CallbackStatus        string    `json:"callbackStatus,omitempty"`
	CallbackReason        string    `json:"callbackReason,omitempty"`
	CallbackEffectiveDate string    `json:"callbackEffectiveDate,omitempty"`
	CreatedAt             time.Time `json:"createdAt"`
}

type Payroll struct {
	ID                    uint      `gorm:"primaryKey" json:"id"`
	EmployeeID            string    `gorm:"uniqueIndex;not null" json:"employeeId"`
	EmployeeName          string    `json:"employeeName"`
	WageType              string    `json:"wageType"` // "Fixed"
	MonthWage             float64   `json:"monthWage"`
	YearlyWage            float64   `json:"yearlyWage"`
	WorkingDaysPerWeek    int       `json:"workingDaysPerWeek"`
	BasicSalary           float64   `json:"basicSalary"`
	HRA                   float64   `json:"hra"`
	StandardAllowance     float64   `json:"standardAllowance"`
	PerformanceBonus      float64   `json:"performanceBonus"`
	LeaveTravelAllowance  float64   `json:"leaveTravelAllowance"`
	FixedAllowance        float64   `json:"fixedAllowance"`
	ProvidentFund         float64   `json:"providentFund"`
	ProfessionalTax       float64   `json:"professionalTax"`
	NetSalary             float64   `json:"netSalary"`
	UpdatedAt             time.Time `json:"updatedAt"`
}

type Notification struct {
	ID        uint      `gorm:"primaryKey" json:"id"`
	UserEmail string    `json:"userEmail"` // specific email or "all"
	Title     string    `json:"title"`
	Message   string    `json:"message"`
	Type      string    `json:"type"` // "info", "success", "warning", "danger"
	Read      bool      `json:"read"`
	CreatedAt time.Time `json:"createdAt"`
}

type Document struct {
	ID         uint      `gorm:"primaryKey" json:"id"`
	EmployeeID string    `json:"employeeId"`
	Name       string    `json:"name"`
	Type       string    `json:"type"`
	Size       string    `json:"size"`
	UploadedAt time.Time `json:"uploadedAt"`
}

// Request and Response DTOs
type LoginRequest struct {
	Email    string `json:"email"`
	Password string `json:"password"`
}

type RegisterRequest struct {
	CompanyName string `json:"companyName"`
	CompanyLogo string `json:"companyLogo"`
	EmployeeID  string `json:"employeeId"`
	Name        string `json:"name"`
	Email       string `json:"email"`
	Password    string `json:"password"`
	Role        string `json:"role"`
	Phone       string `json:"phone"`
	Department  string `json:"department"`
	JobTitle    string `json:"jobTitle"`
}

type CheckInRequest struct {
	EmployeeID string `json:"employeeId"`
	Time       string `json:"time"`
}

type CheckOutRequest struct {
	EmployeeID string `json:"employeeId"`
	Time       string `json:"time"`
}

type UpdateProfileRequest struct {
	Phone                string  `json:"phone"`
	Address              string  `json:"address"`
	Location             string  `json:"location"`
	WorkingDays          int     `json:"workingDays"`
	BreakTime            int     `json:"breakTime"`
	AvatarUrl            string  `json:"avatarUrl"`
	// Admin fields
	Name                 string  `json:"name"`
	Email                string  `json:"email"`
	Role                 string  `json:"role"`
	Department           string  `json:"department"`
	JobTitle             string  `json:"jobTitle"`
	JoiningDate          string  `json:"joiningDate"`
	MonthWage            float64 `json:"monthWage"`
	BasicSalary          float64 `json:"basicSalary"`
	HRA                  float64 `json:"hra"`
	StandardAllowance    float64 `json:"standardAllowance"`
	PerformanceBonus     float64 `json:"performanceBonus"`
	LeaveTravelAllowance float64 `json:"leaveTravelAllowance"`
	GmailAppPassword     string  `json:"gmailAppPassword"`
}

type UpdateLeaveStatusRequest struct {
	Status    string `json:"status"` // "Approved" or "Rejected"
	HRComment string `json:"hrComment"`
}

type CallbackLeaveRequest struct {
	Reason        string `json:"reason"`
	EffectiveDate string `json:"effectiveDate"`
}

type RespondCallbackRequest struct {
	Action string `json:"action"` // "accept" or "reject"
}

type Message struct {
	ID            uint      `gorm:"primaryKey" json:"id"`
	SenderID      string    `gorm:"index;not null" json:"senderId"`
	SenderName    string    `json:"senderName"`
	RecipientID   string    `gorm:"index;not null" json:"recipientId"`
	RecipientName string    `json:"recipientName"`
	CompanyName   string    `gorm:"index" json:"companyName"`
	Content       string    `gorm:"type:text;not null" json:"content"`
	Read          bool      `gorm:"default:false" json:"read"`
	CreatedAt     time.Time `json:"createdAt"`
}

type SendMessageRequest struct {
	RecipientID string `json:"recipientId"`
	Content     string `json:"content"`
}
