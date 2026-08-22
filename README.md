# Dayflow — Human Resource Management System (HRMS)

> *Every workday, perfectly aligned.*

**Dayflow** is a complete, production-grade Human Resource Management System. It features an editorial, dark warm-charcoal aesthetic with custom typography (**Crimson Text**, **Carme**, and **Crafty Girls**), deterministic SVG avatar generation via **`react-nice-avatar`**, state management powered by **`zustand`**, and JWT HTTP-Only cookie authentication backed by a **GoFiber v3** REST server.

Dayflow offers dual presentation views: **Interactive Visual Canvas View** and **Structured Directory Table View** sharing the exact same backend API and PostgreSQL data model.

---

## 🚀 Highlights & Key Capabilities

1. **Deterministic Seeded Avatars (`react-nice-avatar`)**:
   - Every employee profile automatically generates a unique SVG avatar derived from their full name using `react-nice-avatar` and `genConfig(name)`.

2. **State Management (`zustand`)**:
   - Centralized, high-performance state management using Zustand stores (`useAuthStore`, `useViewModeStore`).
   - Synchronous local session restoration to eliminate redirect flashes on page refresh.

3. **Secure Authentication (JWT HTTP-Only Cookies)**:
   - Tokens signed using `golang-jwt/jwt/v5` and stored in `HTTPOnly`, `SameSite=Lax` browser cookies.
   - Endpoint `/api/auth/me` validates live JWT tokens upon page initialization.
   - Access Role Switcher (`HR Manager` vs `Employee`) and Employee Context Switcher in the topbar for instant perspective testing.

4. **Dual Presentation Views**:
   - **Interactive Visual Canvas View**: Visual node topology for Leave Approvals, Employee Journey mapping, and HR pipeline review. Clicking any node opens an interactive `WorkflowSidePanel` for node inspection and quick HR approval/rejection.
   - **Structured Directory Table View**: Clean, production-ready tables, tabbed sections, modals, and status badges.

5. **Attendance Management & Live Clock**:
   - Hero attendance check widget featuring a ticking digital clock (`7xl font-mono text-[#E8E3DD]`), live date banner, status pill badge, prominent Check In / Check Out button, and active work timer cards.
   - Weekly (Monday–Sunday) and daily log views tracking Present, Absent, Half-day, and Leave states.

6. **Leave Approvals & Payroll Visibility**:
   - Available leave counters (Paid, Sick, Unpaid) with auto-calculated working day durations.
   - Salary component matrix: Basic 50%, HRA 40%, Standard Allowance, Performance Bonus 8%, LTA 5%, Fixed Allowance, PF deduction 12%, Professional Tax $200.
   - Official printable Salary Pay Slip preview modal.

---

## 🛠️ Complete Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript (Vite build engine)
- **State Management**: Zustand (`zustand`)
- **Avatar Engine**: `react-nice-avatar` (Seeded by employee name)
- **Routing & Data Queries**: React Router v7 & TanStack Query v5
- **Visual Workflows**: React Flow (`@xyflow/react`)
- **Styling**: Tailwind CSS v4, React Icons (`react-icons`)
- **Charts & Data Visualization**: Recharts (`recharts`)

### Backend
- **Server Framework**: GoFiber v3 (`github.com/gofiber/fiber/v3`)
- **Authentication**: JWT Cookies via `github.com/golang-jwt/jwt/v5`
- **Database & ORM**: PostgreSQL with SQLite fallback via GORM (`gorm.io/gorm`)
- **Containerization**: Docker & Docker Compose (`docker-compose.yml`)

---

## 💻 Installation & Quickstart

### Method 1: Docker Compose (Full Stack)

Run the entire application (PostgreSQL + GoFiber v3 Backend + React Frontend) with a single command:

```bash
docker compose up --build
```

- **Frontend Application**: `http://localhost:3000`
- **GoFiber v3 Backend API**: `http://localhost:8080`
- **PostgreSQL Database**: Port `5432`

---

### Method 2: Local Development

#### 1. Backend Setup (GoFiber v3)

```bash
cd backend
go run main.go
```
*The backend automatically initializes SQLite/PostgreSQL schema auto-migrations and seeds initial employee records.*

#### 2. Frontend Setup (React + Vite)

```bash
# In the project root directory
npm install
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## 🎨 Design & Typography System

- **Crimson Text**: Primary headings and editorial titles.
- **Carme**: Clean UI text, dashboard labels, and table content.
- **Crafty Girls**: Handwritten product notes and accents.
- **Color Palette**: Warm charcoal base (`#141312` / `#1C1A19`), warm off-white text (`#E8E3DD`), burnt orange (`#E07A5F`), soft olive (`#709775`), dusty red (`#E06C68`), and muted yellow (`#F4A261`).
