import type { Employee, AttendanceRecord, LeaveRequest, Payroll, NotificationItem, ReportAnalytics, Message, UnreadCountResponse } from '../types';


const API_BASE = '/api';

// Helper function to handle API calls with HTTP-Only Cookie credentials and fallback
async function apiFetch<T>(endpoint: string, options?: RequestInit, fallbackData?: T): Promise<T> {
  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      credentials: 'include',
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
      ...options,
    });

    if (!res.ok) {
      const err = await res.json().catch(() => ({ error: 'HTTP request failed' }));
      throw new Error(err.error || `Error ${res.status}: ${res.statusText}`);
    }

    return await res.json();
  } catch (err: any) {
    if (fallbackData !== undefined && (err instanceof TypeError || err.message?.includes('Failed to fetch'))) {
      console.warn(`[Dayflow API] Backend unreachable at ${endpoint}. Using fallback data.`);
      return fallbackData;
    }
    throw err;
  }
}

const MOCK_EMPLOYEES: Employee[] = [];

const MOCK_ATTENDANCE: AttendanceRecord[] = [];

const MOCK_LEAVES: LeaveRequest[] = [];

const MOCK_PAYROLLS: Payroll[] = [];

const MOCK_NOTIFICATIONS: NotificationItem[] = [];

const MOCK_REPORTS: ReportAnalytics = {
  totalEmployees: 0,
  presentToday: 0,
  onLeave: 0,
  pendingLeave: 0,
  totalMonthlyPayroll: 0,
  attendanceRate: 0,
  workingDaysThisMonth: 22,
};

// API Functions
export const api = {
  // Auth with JWT Cookie support
  login: async (email: string, password: string) => {
    return apiFetch<{ message: string; token: string; user: Employee }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    }, {
      message: 'Login successful',
      token: 'mock_token',
      user: MOCK_EMPLOYEES.find(e => e.email.toLowerCase() === email.toLowerCase()) || MOCK_EMPLOYEES[0],
    });
  },

  register: async (data: Partial<Employee> & { password: string; companyName?: string; companyLogo?: string }) => {
    return apiFetch<{ message: string; token: string; user: Employee }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(data),
    }, {
      message: 'User registered successfully',
      token: 'mock_token',
      user: {
        id: Date.now(),
        employeeId: data.employeeId || 'OIALME20260001',
        companyName: data.companyName || 'Odoo India',
        companyLogo: data.companyLogo,
        name: data.name || 'New HR User',
        email: data.email || 'user@odooindia.io',
        role: data.role || 'HR',
        phone: data.phone || '+91 98765 43210',
        department: data.department || 'People & Culture',
        jobTitle: data.jobTitle || 'Head of HR Operations',
        joiningDate: new Date().toISOString().split('T')[0],
        address: 'San Francisco, CA',
        avatarUrl: '',
        status: 'absent',
        paidLeaveAvailable: 24,
        sickLeaveAvailable: 12,
      },
    });
  },

  logout: async () => {
    return apiFetch<{ message: string }>('/auth/logout', { method: 'POST' }, { message: 'Logged out' });
  },

  getMe: async (): Promise<Employee> => {
    return apiFetch<Employee>('/auth/me', undefined, MOCK_EMPLOYEES[0]);
  },

  // Employees
  getEmployees: async (): Promise<Employee[]> => {
    return apiFetch<Employee[]>('/employees', undefined, MOCK_EMPLOYEES);
  },

  createEmployee: async (data: { name: string; email: string; phone?: string; department?: string; jobTitle?: string }): Promise<{ message: string; employee: Employee; generatedLoginId: string; initialPassword?: string }> => {
    return apiFetch<{ message: string; employee: Employee; generatedLoginId: string; initialPassword?: string }>('/employees', {
      method: 'POST',
      body: JSON.stringify(data),
    }, {
      message: 'Employee created successfully',
      employee: {
        id: Date.now(),
        employeeId: 'OIJODO20260007',
        name: data.name,
        email: data.email,
        role: 'Employee',
        phone: data.phone || '+91 98765 43210',
        department: data.department || 'Engineering',
        jobTitle: data.jobTitle || 'Software Engineer',
        joiningDate: new Date().toISOString().split('T')[0],
        address: 'San Francisco, CA',
        avatarUrl: '',
        status: 'absent',
        paidLeaveAvailable: 24,
        sickLeaveAvailable: 12,
      },
      generatedLoginId: 'OIJODO20260007',
      initialPassword: 'Dayflow#2026',
    });
  },

  getEmployeeById: async (id: string): Promise<Employee> => {
    return apiFetch<Employee>(`/employees/${id}`, undefined, MOCK_EMPLOYEES.find(e => e.employeeId === id || e.id === Number(id)) || MOCK_EMPLOYEES[0]);
  },

  changePassword: async (employeeId: string, currentPassword: string, newPassword: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>('/auth/change-password', {
      method: 'POST',
      body: JSON.stringify({ employeeId, currentPassword, newPassword }),
    }, {
      message: 'Password updated successfully',
    });
  },

  updateProfile: async (id: string, updates: Partial<Employee> & {
    monthWage?: number;
    basicSalary?: number;
    hra?: number;
    standardAllowance?: number;
    performanceBonus?: number;
    leaveTravelAllowance?: number;
    workingDays?: number;
    breakTime?: number;
    gmailAppPassword?: string;
  }): Promise<{ message: string; employee: Employee }> => {
    return apiFetch<{ message: string; employee: Employee }>(`/employees/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates),
    }, {
      message: 'Profile updated successfully',
      employee: { ...MOCK_EMPLOYEES[0], ...updates },
    });
  },

  fireEmployee: async (id: string, reason: string): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/employees/${id}`, {
      method: 'DELETE',
      body: JSON.stringify({ reason }),
    }, {
      message: 'Employee terminated successfully',
    });
  },

  // Attendance
   getAttendanceRecords: async (employeeId?: string, date?: string, month?: string): Promise<AttendanceRecord[]> => {
    const query = new URLSearchParams();
    if (employeeId) query.append('employeeId', employeeId);
    if (date) query.append('date', date);
    if (month) query.append('month', month);
    const qs = query.toString() ? `?${query.toString()}` : '';

    return apiFetch<AttendanceRecord[]>(`/attendance${qs}`, undefined, employeeId ? MOCK_ATTENDANCE.filter(a => a.employeeId === employeeId) : MOCK_ATTENDANCE);
   },

  checkIn: async (employeeId: string, time?: string): Promise<{ message: string; record: AttendanceRecord }> => {
    return apiFetch<{ message: string; record: AttendanceRecord }>('/attendance/check-in', {
      method: 'POST',
      body: JSON.stringify({ employeeId, time }),
    }, {
      message: 'Checked in successfully',
      record: {
        id: Date.now(),
        employeeId,
        employeeName: MOCK_EMPLOYEES.find(e => e.employeeId === employeeId)?.name || 'Employee',
        date: new Date().toISOString().split('T')[0],
        checkIn: time || '09:12 AM',
        checkOut: '--:--',
        workHours: '0h 00m',
        extraHours: '0h 00m',
        status: 'Present',
      },
    });
  },

  checkOut: async (employeeId: string, time?: string): Promise<{ message: string; record: AttendanceRecord }> => {
    return apiFetch<{ message: string; record: AttendanceRecord }>('/attendance/check-out', {
      method: 'POST',
      body: JSON.stringify({ employeeId, time }),
    }, {
      message: 'Checked out successfully',
      record: {
        id: Date.now(),
        employeeId,
        employeeName: MOCK_EMPLOYEES.find(e => e.employeeId === employeeId)?.name || 'Employee',
        date: new Date().toISOString().split('T')[0],
        checkIn: '09:12 AM',
        checkOut: time || '05:30 PM',
        workHours: '8h 18m',
        extraHours: '0h 18m',
        status: 'Present',
      },
    });
  },

  // Leave Management
  getLeaveRequests: async (employeeId?: string, status?: string): Promise<LeaveRequest[]> => {
    const query = new URLSearchParams();
    if (employeeId) query.append('employeeId', employeeId);
    if (status) query.append('status', status);
    const qs = query.toString() ? `?${query.toString()}` : '';

    return apiFetch<LeaveRequest[]>(`/leaves${qs}`, undefined, employeeId ? MOCK_LEAVES.filter(l => l.employeeId === employeeId) : MOCK_LEAVES);
  },

  submitLeaveRequest: async (request: Partial<LeaveRequest>): Promise<{ message: string; leave: LeaveRequest }> => {
    return apiFetch<{ message: string; leave: LeaveRequest }>('/leaves/request', {
      method: 'POST',
      body: JSON.stringify(request),
    }, {
      message: 'Leave request submitted successfully',
      leave: {
        id: Date.now(),
        employeeId: request.employeeId || 'ODAL0120260001',
        employeeName: request.employeeName || 'Employee',
        leaveType: request.leaveType || 'Paid',
        startDate: request.startDate || '2026-08-25',
        endDate: request.endDate || '2026-08-26',
        totalDays: request.totalDays || 2,
        reason: request.reason || 'Personal time off',
        status: 'Pending',
        createdAt: new Date().toISOString(),
      },
    });
  },

  updateLeaveStatus: async (id: number, status: 'Approved' | 'Rejected', hrComment?: string): Promise<{ message: string; leave: LeaveRequest }> => {
    return apiFetch<{ message: string; leave: LeaveRequest }>(`/leaves/${id}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status, hrComment }),
    }, {
      message: `Leave request ${status.toLowerCase()} successfully`,
      leave: { ...MOCK_LEAVES[0], id, status, hrComment },
    });
  },

  callbackLeave: async (id: number, reason: string, effectiveDate: string): Promise<{ message: string; leave: LeaveRequest }> => {
    return apiFetch<{ message: string; leave: LeaveRequest }>(`/leaves/${id}/callback`, {
      method: 'POST',
      body: JSON.stringify({ reason, effectiveDate }),
    }, {
      message: 'Callback request sent successfully',
      leave: { ...MOCK_LEAVES[0], id, status: 'Callback Pending', callbackStatus: 'Pending', callbackReason: reason, callbackEffectiveDate: effectiveDate },
    });
  },

  respondCallback: async (id: number, action: 'accept' | 'reject'): Promise<{ message: string; leave: LeaveRequest }> => {
    return apiFetch<{ message: string; leave: LeaveRequest }>(`/leaves/${id}/respond-callback`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    }, {
      message: `Callback request ${action}ed`,
      leave: { ...MOCK_LEAVES[0], id, callbackStatus: action === 'accept' ? 'Accepted' : 'Rejected', status: 'Approved' },
    });
  },

  deleteLeaveRequest: async (id: number): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/leaves/${id}`, {
      method: 'DELETE',
    }, {
      message: `Leave request #${id} deleted successfully`,
    });
  },

  // Payroll
  getPayroll: async (employeeId?: string): Promise<Payroll | Payroll[]> => {
    if (employeeId) {
      return apiFetch<Payroll>(`/payroll?employeeId=${employeeId}`, undefined, MOCK_PAYROLLS.find(p => p.employeeId === employeeId) || MOCK_PAYROLLS[0]);
    }
    return apiFetch<Payroll[]>('/payroll', undefined, MOCK_PAYROLLS);
  },

  updatePayroll: async (employeeId: string, monthWage: number, workingDaysPerWeek: number = 5): Promise<{ message: string; payroll: Payroll }> => {
    return apiFetch<{ message: string; payroll: Payroll }>(`/payroll/${employeeId}`, {
      method: 'PUT',
      body: JSON.stringify({ monthWage, workingDaysPerWeek }),
    }, {
      message: 'Payroll updated successfully',
      payroll: { ...MOCK_PAYROLLS[0], employeeId, monthWage, yearlyWage: monthWage * 12 },
    });
  },

  // Notifications
  getNotifications: async (email?: string): Promise<NotificationItem[]> => {
    const qs = email ? `?email=${email}` : '';
    return apiFetch<NotificationItem[]>(`/notifications${qs}`, undefined, MOCK_NOTIFICATIONS);
  },

  markNotificationRead: async (id: number | 'read-all'): Promise<{ message: string }> => {
    return apiFetch<{ message: string }>(`/notifications/${id}/read`, { method: 'PUT' }, { message: 'Notification marked as read' });
  },

  // Reports
  getReportsAnalytics: async (): Promise<ReportAnalytics> => {
    return apiFetch<ReportAnalytics>('/reports/analytics', undefined, MOCK_REPORTS);
  },

  // Private Messages
  getMessages: async (withEmpId?: string): Promise<Message[]> => {
    const qs = withEmpId ? `?with=${encodeURIComponent(withEmpId)}` : '';
    return apiFetch<Message[]>(`/messages${qs}`, undefined, []);
  },

  sendMessage: async (recipientId: string, content: string): Promise<{ message: string; data: Message }> => {
    return apiFetch<{ message: string; data: Message }>('/messages', {
      method: 'POST',
      body: JSON.stringify({ recipientId, content }),
    });
  },

  getUnreadMessageCounts: async (): Promise<UnreadCountResponse> => {
    return apiFetch<UnreadCountResponse>('/messages/unread', undefined, { unreadBySender: {}, totalUnread: 0 });
  },
};

