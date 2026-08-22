import { create } from 'zustand';
import type { Employee, UserRole } from '../types';
import { api } from '../api/client';

interface AuthState {
  currentUser: Employee | null;
  role: UserRole;
  allEmployees: Employee[];
  isLoadingEmployees: boolean;
  isLoadingSession: boolean;

  login: (email: string, pass: string) => Promise<void>;
  register: (data: Partial<Employee> & { password: string; companyName?: string }) => Promise<{ message: string; token: string; user: Employee }>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  switchEmployee: (employeeId: string) => void;
  fetchEmployeesAndSession: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set, get) => ({
  currentUser: (() => {
    try {
      const saved = localStorage.getItem('dayflow_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  })(),
  role: 'HR',
  allEmployees: [],
  isLoadingEmployees: true,
  isLoadingSession: true,

  fetchEmployeesAndSession: async () => {
    set({ isLoadingEmployees: true, isLoadingSession: true });
    try {
      const data = await api.getEmployees();
      set({ allEmployees: data });

      // Validate JWT cookie session
      try {
        const me = await api.getMe();
        if (me && me.employeeId) {
          set({ currentUser: me, role: me.role as UserRole });
          localStorage.setItem('dayflow_user', JSON.stringify(me));
        }
      } catch {
        // Fallback to local storage user if cookie check fails in dev/offline
        const saved = localStorage.getItem('dayflow_user');
        if (saved) {
          const user = JSON.parse(saved);
          set({ currentUser: user, role: user.role as UserRole });
        } else if (data.length > 0) {
          set({ currentUser: data[0], role: data[0].role as UserRole });
          localStorage.setItem('dayflow_user', JSON.stringify(data[0]));
        }
      }
    } catch (err) {
      console.error('Failed to load employees session:', err);
    } finally {
      set({ isLoadingEmployees: false, isLoadingSession: false });
    }
  },

  login: async (email, pass) => {
    const res = await api.login(email, pass);
    set({ currentUser: res.user, role: res.user.role as UserRole });
    localStorage.setItem('dayflow_user', JSON.stringify(res.user));
  },

  register: async (data) => {
    const res = await api.register(data);
    set({ currentUser: res.user, role: res.user.role as UserRole });
    localStorage.setItem('dayflow_user', JSON.stringify(res.user));
    return res;
  },

  logout: async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error(err);
    }
    set({ currentUser: null });
    localStorage.removeItem('dayflow_user');
  },

  switchRole: (newRole: UserRole) => {
    set({ role: newRole });
    const { currentUser } = get();
    if (currentUser) {
      const updated = { ...currentUser, role: newRole };
      set({ currentUser: updated });
      localStorage.setItem('dayflow_user', JSON.stringify(updated));
    }
  },

  switchEmployee: (employeeId: string) => {
    const { allEmployees } = get();
    const found = allEmployees.find(e => e.employeeId === employeeId);
    if (found) {
      set({ currentUser: found, role: found.role as UserRole });
      localStorage.setItem('dayflow_user', JSON.stringify(found));
    }
  },
}));
