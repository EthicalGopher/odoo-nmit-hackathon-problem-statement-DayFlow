import React, { createContext, useContext, useState, useEffect } from 'react';
import type { Employee, UserRole } from '../types';
import { api } from '../api/client';

interface AuthContextType {
  currentUser: Employee | null;
  role: UserRole;
  allEmployees: Employee[];
  isLoadingEmployees: boolean;
  isLoadingSession: boolean;
  login: (email: string, pass: string) => Promise<void>;
  register: (data: Partial<Employee> & { password: string; companyName?: string; companyLogo?: string }) => Promise<{ message: string; token: string; user: Employee }>;
  logout: () => Promise<void>;
  switchRole: (newRole: UserRole) => void;
  switchEmployee: (employeeId: string) => void;
  refreshEmployees: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Synchronous initialization from localStorage to prevent flash redirect on refresh
  const [currentUser, setCurrentUser] = useState<Employee | null>(() => {
    try {
      const saved = localStorage.getItem('dayflow_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [allEmployees, setAllEmployees] = useState<Employee[]>([]);
  const [isLoadingEmployees, setIsLoadingEmployees] = useState(true);
  const [isLoadingSession, setIsLoadingSession] = useState(true);

  const fetchEmployeesAndSession = async () => {
    try {
      setIsLoadingEmployees(true);
      setIsLoadingSession(true);

      const data = await api.getEmployees();
      setAllEmployees(data);

      // Validate JWT cookie session with backend /auth/me
      try {
        const me = await api.getMe();
        if (me && me.employeeId) {
          setCurrentUser(me);
          localStorage.setItem('dayflow_user', JSON.stringify(me));
        } else {
          setCurrentUser(null);
          localStorage.removeItem('dayflow_user');
        }
      } catch {
        // No valid session — do not auto-authenticate
        setCurrentUser(null);
        localStorage.removeItem('dayflow_user');
      }
    } catch (err) {
      console.error('Failed to load employees', err);
    } finally {
      setIsLoadingEmployees(false);
      setIsLoadingSession(false);
    }
  };

  useEffect(() => {
    fetchEmployeesAndSession();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setCurrentUser(res.user);
    localStorage.setItem('dayflow_user', JSON.stringify(res.user));
  };

  const register = async (data: Partial<Employee> & { password: string; companyName?: string; companyLogo?: string }) => {
    const res = await api.register(data);
    setCurrentUser(res.user);
    localStorage.setItem('dayflow_user', JSON.stringify(res.user));
    await fetchEmployeesAndSession();
    return res;
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch (err) {
      console.error(err);
    }
    localStorage.removeItem('dayflow_user');
    setCurrentUser(null);
  };

  const switchRole = (newRole: UserRole) => {
    if (currentUser) {
      const updated = { ...currentUser, role: newRole };
      setCurrentUser(updated);
      localStorage.setItem('dayflow_user', JSON.stringify(updated));
    }
  };

  const switchEmployee = (employeeId: string) => {
    const target = allEmployees.find(e => e.employeeId === employeeId || e.id === Number(employeeId));
    if (target) {
      setCurrentUser(target);
      localStorage.setItem('dayflow_user', JSON.stringify(target));
    }
  };

  const role = currentUser?.role || 'Employee';

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        role,
        allEmployees,
        isLoadingEmployees,
        isLoadingSession,
        login,
        register,
        logout,
        switchRole,
        switchEmployee,
        refreshEmployees: fetchEmployeesAndSession,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
