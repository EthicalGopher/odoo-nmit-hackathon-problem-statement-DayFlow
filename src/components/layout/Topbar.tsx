import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  FiSearch,
  FiBell,
  FiUser,
  FiLogOut,
  FiChevronDown,
  FiShield,
  FiUsers,
  FiGrid,
  FiCheck,
  FiGitCommit,
} from 'react-icons/fi';
import { useAuth } from '../../context/AuthContext';
import { useViewMode } from '../../context/ViewModeContext';
import { UserAvatar } from '../ui/UserAvatar';

export const Topbar: React.FC = () => {
  const { currentUser, role, allEmployees, switchRole, switchEmployee, logout } = useAuth();
  const { mode, setMode } = useViewMode();
  const navigate = useNavigate();
  const location = useLocation();

  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotificationMenu, setShowNotificationMenu] = useState(false);

  // Dynamic titles according to current path
  const getPageMeta = () => {
    switch (location.pathname) {
      case '/dashboard':
        return { title: 'Dashboard', desc: 'Every workday, perfectly aligned.' };
      case '/employees':
        return { title: 'Employees', desc: 'Directory, organization roles, and work status.' };
      case '/attendance':
        return { title: 'Attendance', desc: 'Real-time check-in, weekly logs, and work hours.' };
      case '/leave':
        return { title: 'Leave Management', desc: 'Time-off requests, balances, and HR approvals.' };
      case '/payroll':
        return { title: 'Payroll & Compensation', desc: 'Wage structure, allowances, tax deductions & slips.' };
      case '/reports':
        return { title: 'Reports & Analytics', desc: 'Company attendance, salary distribution, and leave trends.' };
      case '/notifications':
        return { title: 'Notifications', desc: 'Real-time status updates and leave alerts.' };
      case '/settings':
        return { title: 'Settings', desc: 'System configurations and personal preferences.' };
      case '/profile':
        return { title: 'Employee Profile', desc: 'Personal records, job details, and compensation structure.' };
      default:
        return { title: 'Dayflow HRMS', desc: 'Human Resource Management System' };
    }
  };

  const { title, desc } = getPageMeta();

  return (
    <header className="h-20 bg-[#1C1A19]/90 backdrop-blur border-b border-[#332F2C] px-8 flex items-center justify-between sticky top-0 z-20">
      {/* Page Title & Subtitle */}
      <div>
        <h1 className="font-crimson text-2xl font-bold text-[#E8E3DD] leading-tight">
          {title}
        </h1>
        <p className="text-xs text-[#A39C95] font-carme">{desc}</p>
      </div>

      {/* Right Controls */}
      <div className="flex items-center space-x-4">
        {/* Search */}
        <div className="relative hidden md:block">
          <FiSearch className="w-4 h-4 text-[#78726A] absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search employee, leave..."
            className="w-56 bg-[#141312] border border-[#332F2C] rounded-lg pl-9 pr-4 py-1.5 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
          />
        </div>

        {/* Global View Mode Switcher */}
        <div className="hidden lg:flex items-center p-1 bg-[#141312] border border-[#332F2C] rounded-lg text-xs">
          <button
            onClick={() => setMode('canvas')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center space-x-1.5 ${
              mode === 'canvas'
                ? 'bg-[#E07A5F] text-white font-medium shadow-sm'
                : 'text-[#A39C95] hover:text-[#E8E3DD]'
            }`}
          >
            <FiGitCommit className="w-3 h-3" />
            <span>Canvas View</span>
          </button>
          <button
            onClick={() => setMode('traditional')}
            className={`px-3 py-1 rounded-md transition-colors flex items-center space-x-1.5 ${
              mode === 'traditional'
                ? 'bg-[#709775] text-white font-medium shadow-sm'
                : 'text-[#A39C95] hover:text-[#E8E3DD]'
            }`}
          >
            <FiGrid className="w-3 h-3" />
            <span>Table View</span>
          </button>
        </div>

        {/* Notifications Icon */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotificationMenu(!showNotificationMenu);
              setShowUserMenu(false);
            }}
            className="p-2 rounded-lg bg-[#24211F] border border-[#383330] text-[#A39C95] hover:text-[#E8E3DD] transition-colors relative"
            title="Notifications"
          >
            <FiBell className="w-4 h-4" />
            <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E07A5F]" />
          </button>

          {/* Quick Notification Dropdown */}
          {showNotificationMenu && (
            <div className="absolute right-0 mt-2 w-80 bg-[#1C1A19] border border-[#383330] rounded-xl shadow-xl p-4 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="flex items-center justify-between pb-3 border-b border-[#2B2825]">
                <h3 className="font-crimson font-bold text-sm text-[#E8E3DD]">
                  Recent Activity
                </h3>
                <button
                  onClick={() => {
                    setShowNotificationMenu(false);
                    navigate('/notifications');
                  }}
                  className="text-xs text-[#E07A5F] hover:underline font-carme"
                >
                  View All
                </button>
              </div>
              <div className="space-y-3 mt-3 max-h-60 overflow-y-auto pr-1">
                <div className="text-xs p-2.5 rounded-lg bg-[#24211F] border border-[#332F2C]">
                  <p className="font-medium text-[#E8E3DD]">Sophia Chen requested Sick Leave</p>
                  <p className="text-[11px] text-[#A39C95] mt-0.5">2 days • Dental consultation</p>
                  <span className="text-[10px] text-[#78726A] block mt-1">1 hour ago</span>
                </div>
                <div className="text-xs p-2.5 rounded-lg bg-[#24211F] border border-[#332F2C]">
                  <p className="font-medium text-[#E8E3DD]">Marcus Vance Leave Approved</p>
                  <p className="text-[11px] text-[#A39C95] mt-0.5">4 days Paid Leave approved</p>
                  <span className="text-[10px] text-[#78726A] block mt-1">Yesterday</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* User Profile & Role Switcher */}
        <div className="relative">
          <button
            onClick={() => {
              setShowUserMenu(!showUserMenu);
              setShowNotificationMenu(false);
            }}
            className="flex items-center space-x-3 p-1.5 pl-2 rounded-xl bg-[#24211F] border border-[#383330] hover:border-[#3E3935] transition-colors"
          >
            <UserAvatar name={currentUser?.name || 'Alex Mercer'} size="w-8 h-8" />
            <div className="text-left hidden sm:block">
              <div className="text-xs font-semibold text-[#E8E3DD] leading-none">
                {currentUser?.name || 'Alex Mercer'}
              </div>
              <div className="text-[10px] text-[#E07A5F] font-medium leading-tight mt-0.5 flex items-center space-x-1">
                <span>{role}</span>
                <span className="text-[#78726A]">•</span>
                <span className="text-[#A39C95]">{currentUser?.department || 'Operations'}</span>
              </div>
            </div>
            <FiChevronDown className="w-3.5 h-3.5 text-[#A39C95] ml-1" />
          </button>

          {/* User Menu Dropdown */}
          {showUserMenu && (
            <div className="absolute right-0 mt-2 w-72 bg-[#1C1A19] border border-[#383330] rounded-xl shadow-xl p-3 z-50">
              <div className="p-3 bg-[#24211F] rounded-lg mb-3 border border-[#332F2C] flex items-center space-x-3">
                <UserAvatar name={currentUser?.name || 'Alex Mercer'} size="w-10 h-10" />
                <div className="min-w-0 flex-1">
                  <div className="text-xs font-bold text-[#E8E3DD] truncate">{currentUser?.name}</div>
                  <div className="text-xs text-[#A39C95] truncate">{currentUser?.email}</div>
                  <div className="text-[11px] text-[#E07A5F] font-mono mt-0.5">{currentUser?.employeeId}</div>
                </div>
              </div>

              {/* Role Switcher */}
              <div className="mb-3 px-1">
                <div className="text-[11px] text-[#78726A] font-semibold uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <FiShield className="w-3 h-3 text-[#E07A5F]" />
                  <span>Active Access Role</span>
                </div>
                <div className="grid grid-cols-2 gap-1.5 bg-[#141312] p-1 rounded-lg border border-[#332F2C]">
                  <button
                    onClick={() => switchRole('HR')}
                    className={`px-2 py-1.5 text-xs rounded font-medium flex items-center justify-center space-x-1 ${
                      role === 'HR' ? 'bg-[#E07A5F] text-white' : 'text-[#A39C95] hover:text-[#E8E3DD]'
                    }`}
                  >
                    {role === 'HR' && <FiCheck className="w-3 h-3" />}
                    <span>HR Manager</span>
                  </button>
                  <button
                    onClick={() => switchRole('Employee')}
                    className={`px-2 py-1.5 text-xs rounded font-medium flex items-center justify-center space-x-1 ${
                      role === 'Employee' ? 'bg-[#709775] text-white' : 'text-[#A39C95] hover:text-[#E8E3DD]'
                    }`}
                  >
                    {role === 'Employee' && <FiCheck className="w-3 h-3" />}
                    <span>Employee</span>
                  </button>
                </div>
              </div>

              {/* Employee Context Switcher */}
              <div className="mb-3 px-1">
                <div className="text-[11px] text-[#78726A] font-semibold uppercase tracking-wider mb-1.5 flex items-center space-x-1">
                  <FiUsers className="w-3 h-3 text-[#709775]" />
                  <span>Switch Employee View</span>
                </div>
                <div className="space-y-1 max-h-36 overflow-y-auto pr-1">
                  {allEmployees.map(emp => (
                    <button
                      key={emp.employeeId}
                      onClick={() => {
                        switchEmployee(emp.employeeId);
                        setShowUserMenu(false);
                      }}
                      className={`w-full text-left px-2 py-1.5 rounded text-xs flex items-center justify-between ${
                        currentUser?.employeeId === emp.employeeId
                          ? 'bg-[#2B2825] text-[#E07A5F] font-medium'
                          : 'text-[#A39C95] hover:bg-[#24211F] hover:text-[#E8E3DD]'
                      }`}
                    >
                      <div className="truncate flex items-center space-x-2">
                        <UserAvatar name={emp.name} size="w-6 h-6" />
                        <div>
                          <span className="font-medium text-[#E8E3DD] block">{emp.name}</span>
                          <span className="text-[10px] text-[#78726A]">{emp.role} • {emp.department}</span>
                        </div>
                      </div>
                      {currentUser?.employeeId === emp.employeeId && (
                        <FiCheck className="w-3.5 h-3.5 text-[#E07A5F] shrink-0" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <div className="border-t border-[#292624] pt-2 space-y-1">
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#A39C95] hover:text-[#E8E3DD] hover:bg-[#24211F] transition-colors"
                >
                  <FiUser className="w-3.5 h-3.5" />
                  <span>My Profile</span>
                </button>
                <button
                  onClick={() => {
                    setShowUserMenu(false);
                    logout();
                    navigate('/login');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs text-[#E06C68] hover:bg-[#2B1B1B] transition-colors"
                >
                  <FiLogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
