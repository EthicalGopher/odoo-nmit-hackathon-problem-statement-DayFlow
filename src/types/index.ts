export type UserRole = 'HR' | 'Employee';

export type EmployeeStatus = 'present' | 'absent' | 'leave';

export interface Employee {
  id: number;
  employeeId: string;
  companyName?: string;
  companyLogo?: string;
  managerName?: string;
  name: string;
  email: string;
  role: UserRole;
  phone: string;
  department: string;
  jobTitle: string;
  joiningDate: string;
  address: string;
  location?: string;
  workingDays?: number;
  avatarUrl: string;
  status: EmployeeStatus;
  paidLeaveAvailable: number;
  sickLeaveAvailable: number;
  createdAt?: string;
  updatedAt?: string;
}

export type AttendanceStatus = 'Present' | 'Absent' | 'Half-day' | 'Leave';

export interface AttendanceRecord {
  id: number;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn: string;
  checkOut: string;
  workHours: string;
  extraHours: string;
  status: AttendanceStatus;
  remarks?: string;
}

export type LeaveType = 'Paid' | 'Sick' | 'Unpaid';
export type LeaveStatus = 'Pending' | 'Approved' | 'Rejected';

export interface LeaveRequest {
  id: number;
  employeeId: string;
  employeeName: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachmentUrl?: string;
  status: LeaveStatus;
  hrComment?: string;
  createdAt: string;
}

export interface Payroll {
  id: number;
  employeeId: string;
  employeeName: string;
  wageType: string;
  monthWage: number;
  yearlyWage: number;
  workingDaysPerWeek: number;
  basicSalary: number;
  hra: number;
  standardAllowance: number;
  performanceBonus: number;
  leaveTravelAllowance: number;
  fixedAllowance: number;
  providentFund: number;
  professionalTax: number;
  netSalary: number;
  updatedAt?: string;
}

export type NotificationType = 'info' | 'success' | 'warning' | 'danger';

export interface NotificationItem {
  id: number;
  userEmail: string;
  title: string;
  message: string;
  type: NotificationType;
  read: boolean;
  createdAt: string;
}

export interface ReportAnalytics {
  totalEmployees: number;
  presentToday: number;
  onLeave: number;
  pendingLeave: number;
  totalMonthlyPayroll: number;
  attendanceRate: number;
  workingDaysThisMonth: number;
}
