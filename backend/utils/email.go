package utils

import (
	"fmt"
	"log"
	"net/smtp"
	"os"
	"strings"

	"dayflow-backend/database"
	"dayflow-backend/models"
)

// SendEmail dispatches an email via SMTP if configured, using specified HR Gmail address
func SendEmail(fromEmail string, toEmail string, subject string, plainText string, htmlContent string) error {
	if fromEmail == "" {
		fromEmail = os.Getenv("SMTP_FROM")
		if fromEmail == "" {
			fromEmail = "hr@dayflow.com"
		}
	}

	smtpHost := os.Getenv("SMTP_HOST")
	smtpPort := os.Getenv("SMTP_PORT")
	smtpUser := os.Getenv("SMTP_USER")
	smtpPass := os.Getenv("SMTP_PASS")

	if smtpHost == "" && strings.HasSuffix(strings.ToLower(fromEmail), "@gmail.com") {
		smtpHost = "smtp.gmail.com"
	}
	if smtpUser == "" {
		smtpUser = fromEmail
	}
	if smtpPass == "" {
		var hrUser models.User
		database.DB.Where("email = ? OR role = 'HR'", fromEmail).First(&hrUser)
		if hrUser.GmailAppPassword != "" {
			smtpPass = hrUser.GmailAppPassword
			smtpHost = "smtp.gmail.com"
		}
	}

	if smtpPort == "" {
		smtpPort = "587"
	}

	// 1. Send via SMTP if host and pass are provided
	if smtpHost != "" && smtpPass != "" {
		auth := smtp.PlainAuth("", smtpUser, smtpPass, smtpHost)
		boundary := "DAYFLOW_MIME_BOUNDARY"

		header := make(map[string]string)
		header["From"] = fmt.Sprintf("HR Manager <%s>", fromEmail)
		header["To"] = toEmail
		header["Subject"] = subject
		header["MIME-Version"] = "1.0"
		header["Content-Type"] = fmt.Sprintf("multipart/alternative; boundary=\"%s\"", boundary)

		message := ""
		for k, v := range header {
			message += fmt.Sprintf("%s: %s\r\n", k, v)
		}
		message += "\r\n"

		// Plain text part
		message += fmt.Sprintf("--%s\r\n", boundary)
		message += "Content-Type: text/plain; charset=\"UTF-8\"\r\n\r\n"
		message += plainText + "\r\n\r\n"

		// HTML part
		if htmlContent != "" {
			message += fmt.Sprintf("--%s\r\n", boundary)
			message += "Content-Type: text/html; charset=\"UTF-8\"\r\n\r\n"
			message += htmlContent + "\r\n\r\n"
		}
		message += fmt.Sprintf("--%s--", boundary)

		addr := fmt.Sprintf("%s:%s", smtpHost, smtpPort)
		err := smtp.SendMail(addr, auth, fromEmail, []string{toEmail}, []byte(message))
		if err != nil {
			log.Printf("[SMTP ERROR] Failed to send email from %s to %s: %v", fromEmail, toEmail, err)
			return err
		}
		log.Printf("[SMTP SUCCESS] Dispatched email from %s to %s (Subject: %s)", fromEmail, toEmail, subject)
		return nil
	}

	// 2. Clear formatted log output when SMTP host is not set
	log.Printf("================================================================================")
	log.Printf("📧 [EMAIL DISPATCH NOTIFICATION]")
	log.Printf("FROM (HR GMAIL): %s", fromEmail)
	log.Printf("TO: %s", toEmail)
	log.Printf("SUBJECT: %s", subject)
	log.Printf("--------------------------------------------------------------------------------")
	log.Printf("%s", plainText)
	log.Printf("================================================================================")

	return nil
}

// BuildWelcomeEmailHTML generates HTML email for newly created employee accounts
func BuildWelcomeEmailHTML(name string, empID string, email string, password string, company string) string {
	return strings.TrimSpace(fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #141312; color: #E8E3DD; margin: 0; padding: 20px; }
    .card { background-color: #1C1A19; border: 1px solid #332F2C; border-radius: 12px; max-width: 550px; margin: 0 auto; padding: 30px; }
    .header { font-size: 22px; font-weight: bold; color: #E07A5F; border-b: 1px solid #292624; padding-bottom: 15px; margin-bottom: 20px; }
    .cred-box { background-color: #141312; border: 1px solid #2B2825; border-radius: 8px; padding: 15px; font-family: monospace; margin: 20px 0; }
    .field { margin-bottom: 8px; }
    .label { color: #78726A; display: inline-block; width: 140px; }
    .val { color: #E8E3DD; font-weight: bold; }
    .footer { font-size: 11px; color: #78726A; margin-top: 25px; border-top: 1px solid #292624; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">Welcome to %s - Account Created</div>
    <p>Dear <strong>%s</strong>,</p>
    <p>Your employee account has been created on the <strong>DayFlow HRMS</strong> platform.</p>
    
    <div class="cred-box">
      <div class="field"><span class="label">Employee ID:</span> <span class="val">%s</span></div>
      <div class="field"><span class="label">Work Email:</span> <span class="val">%s</span></div>
      <div class="field"><span class="label">Initial Password:</span> <span class="val" style="color: #709775;">%s</span></div>
    </div>
    
    <p>Please log in at <a href="http://localhost:5173/login" style="color: #E07A5F;">DayFlow HRMS Login Portal</a> and change your password under <em>Profile &rarr; Security</em>.</p>
    
    <div class="footer">
      This is an automated notification from %s HR Operations.
    </div>
  </div>
</body>
</html>
`, company, name, empID, email, password, company))
}

// BuildTerminationEmailHTML generates HTML email for fired/terminated employee accounts
func BuildTerminationEmailHTML(name string, empID string, reason string, company string) string {
	return strings.TrimSpace(fmt.Sprintf(`
<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #141312; color: #E8E3DD; margin: 0; padding: 20px; }
    .card { background-color: #1C1A19; border: 1px solid #332F2C; border-radius: 12px; max-width: 550px; margin: 0 auto; padding: 30px; }
    .header { font-size: 22px; font-weight: bold; color: #E06C68; border-b: 1px solid #292624; padding-bottom: 15px; margin-bottom: 20px; }
    .reason-box { background-color: #291B1B; border: 1px solid #E06C68; border-radius: 8px; padding: 15px; margin: 20px 0; color: #E8E3DD; }
    .footer { font-size: 11px; color: #78726A; margin-top: 25px; border-top: 1px solid #292624; padding-top: 15px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="header">Notice of Employment Termination</div>
    <p>Dear <strong>%s</strong> (Employee ID: %s),</p>
    <p>This email is to inform you that your employment contract with <strong>%s</strong> has been terminated effective immediately.</p>
    
    <div class="reason-box">
      <strong>Termination Reason:</strong><br />
      %s
    </div>
    
    <p>All access credentials, leave records, attendance logs, and internal system privileges have been deactivated and removed.</p>
    
    <div class="footer">
      If you have questions regarding final settlement or offboarding, please contact HR Operations.
    </div>
  </div>
</body>
</html>
`, name, empID, company, reason))
}
