import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { LeaveRequest, NotificationItem } from '../types';
import {
  FiUser,
  FiClock,
  FiCalendar,
  FiLogOut,
  FiCheckCircle,
  FiAlertCircle,
  FiArrowRight,
  FiBell,
  FiActivity,
} from 'react-icons/fi';

export const DashboardPage: React.FC = () => {
  const { currentUser, role, allEmployees, switchEmployee, logout } = useAuth();
  const navigate = useNavigate();

  const [pendingLeaves, setPendingLeaves] = useState<LeaveRequest[]>([]);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const leaves = await api.getLeaveRequests(undefined, 'Pending');
        setPendingLeaves(leaves);
        const notifs = await api.getNotifications(currentUser?.email);
        setNotifications(notifs);
      } catch (err) {
        console.error(err);
      }
    };
    fetchData();
  }, [currentUser]);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const isHR = role === 'HR';

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Welcome Banner */}
      <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl relative overflow-hidden flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="relative z-10">
          <span className="font-crafty text-xs text-[#E07A5F]">
            Good afternoon, {currentUser?.name?.split(' ')[0] || 'Employee'}.
          </span>
          <h2 className="font-crimson text-2xl font-bold text-[#E8E3DD] mt-0.5">
            {isHR ? 'HR Command Overview' : 'Employee Portal'}
          </h2>
          <p className="text-xs text-[#A39C95] mt-1 font-carme">
            {isHR
              ? `Managing ${allEmployees.length} employees across People, Engineering & Design.`
              : 'Quick access to your profile, attendance, leave requests, and recent activity.'}
          </p>
        </div>
      </div>

      {/* 1. EMPLOYEE DASHBOARD VIEW */}
      {!isHR && (
        <div className="space-y-8">
          {/* Quick-Access Cards Grid */}
          <div className="space-y-3">
            <h3 className="font-crimson text-lg font-bold text-[#E8E3DD]">
              Quick-Access Controls
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Card 1: Profile */}
              <button
                onClick={() => navigate('/profile')}
                className="p-6 rounded-2xl bg-[#1C1A19] border border-[#332F2C] hover:border-[#E07A5F] text-left transition-all group shadow-xl hover:scale-[1.02] flex flex-col justify-between h-40"
              >
                <div className="w-12 h-12 rounded-xl bg-[#24211F] border border-[#332F2C] flex items-center justify-center text-[#E07A5F] group-hover:bg-[#E07A5F] group-hover:text-white transition-all shadow-md">
                  <FiUser className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-base text-[#E8E3DD] group-hover:text-[#E07A5F] transition-colors">
                    Profile
                  </div>
                  <div className="text-xs text-[#A39C95] mt-0.5 font-carme">
                    View & update personal details
                  </div>
                </div>
              </button>

              {/* Card 2: Attendance */}
              <button
                onClick={() => navigate('/attendance')}
                className="p-6 rounded-2xl bg-[#1C1A19] border border-[#332F2C] hover:border-[#709775] text-left transition-all group shadow-xl hover:scale-[1.02] flex flex-col justify-between h-40"
              >
                <div className="w-12 h-12 rounded-xl bg-[#24211F] border border-[#332F2C] flex items-center justify-center text-[#709775] group-hover:bg-[#709775] group-hover:text-white transition-all shadow-md">
                  <FiClock className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-base text-[#E8E3DD] group-hover:text-[#709775] transition-colors">
                    Attendance
                  </div>
                  <div className="text-xs text-[#A39C95] mt-0.5 font-carme">
                    Daily check-in logs & hours
                  </div>
                </div>
              </button>

              {/* Card 3: Leave Requests */}
              <button
                onClick={() => navigate('/leave')}
                className="p-6 rounded-2xl bg-[#1C1A19] border border-[#332F2C] hover:border-[#F4A261] text-left transition-all group shadow-xl hover:scale-[1.02] flex flex-col justify-between h-40"
              >
                <div className="w-12 h-12 rounded-xl bg-[#24211F] border border-[#332F2C] flex items-center justify-center text-[#F4A261] group-hover:bg-[#F4A261] group-hover:text-white transition-all shadow-md">
                  <FiCalendar className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-base text-[#E8E3DD] group-hover:text-[#F4A261] transition-colors">
                    Leave Requests
                  </div>
                  <div className="text-xs text-[#A39C95] mt-0.5 font-carme">
                    Apply time-off & view balances
                  </div>
                </div>
              </button>

              {/* Card 4: Logout */}
              <button
                onClick={handleLogout}
                className="p-6 rounded-2xl bg-[#1C1A19] border border-[#332F2C] hover:border-[#E06C68] text-left transition-all group shadow-xl hover:scale-[1.02] flex flex-col justify-between h-40"
              >
                <div className="w-12 h-12 rounded-xl bg-[#24211F] border border-[#332F2C] flex items-center justify-center text-[#E06C68] group-hover:bg-[#E06C68] group-hover:text-white transition-all shadow-md">
                  <FiLogOut className="w-6 h-6" />
                </div>
                <div>
                  <div className="font-bold text-base text-[#E8E3DD] group-hover:text-[#E06C68] transition-colors">
                    Logout
                  </div>
                  <div className="text-xs text-[#A39C95] mt-0.5 font-carme">
                    Sign out of your account
                  </div>
                </div>
              </button>
            </div>
          </div>

          {/* Recent Activity & System Alerts */}
          <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#292624] pb-3">
              <div className="flex items-center space-x-2 text-[#E07A5F]">
                <FiBell className="w-5 h-5" />
                <h3 className="font-crimson text-xl font-bold text-[#E8E3DD]">
                  Recent Activity & Alerts
                </h3>
              </div>
              <button
                onClick={() => navigate('/notifications')}
                className="text-xs text-[#E07A5F] hover:underline font-carme font-semibold"
              >
                All Notifications
              </button>
            </div>

            <div className="space-y-3">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-[#A39C95] font-carme">
                  No recent activity or alerts recorded. You are completely up to date!
                </div>
              ) : (
                notifications.slice(0, 5).map(n => (
                  <div
                    key={n.id}
                    className="p-4 bg-[#181716] border border-[#2B2825] rounded-xl flex items-start justify-between text-xs transition-colors hover:border-[#383330]"
                  >
                    <div className="flex items-start space-x-3.5">
                      <div className="mt-0.5">
                        {n.type === 'success' ? (
                          <FiCheckCircle className="w-5 h-5 text-[#709775]" />
                        ) : n.type === 'warning' ? (
                          <FiAlertCircle className="w-5 h-5 text-[#F4A261]" />
                        ) : (
                          <FiActivity className="w-5 h-5 text-[#E07A5F]" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-bold text-xs text-[#E8E3DD]">{n.title}</h4>
                        <p className="text-xs text-[#A39C95] mt-0.5 font-carme">{n.message}</p>
                        <span className="text-[10px] text-[#78726A] block mt-1 font-mono">
                          {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. HR / ADMIN DASHBOARD VIEW */}
      {isHR && (
        <div className="space-y-8">
          {/* Overview Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-5 shadow-xl">
              <span className="text-xs text-[#78726A] font-semibold uppercase tracking-wider">Total Employees</span>
              <div className="font-mono text-3xl font-bold text-[#E8E3DD] my-2">{allEmployees.length}</div>
              <span className="text-[11px] text-[#709775] font-carme">Active workforce</span>
            </div>

            <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-5 shadow-xl">
              <span className="text-xs text-[#78726A] font-semibold uppercase tracking-wider">Present Today</span>
              <div className="font-mono text-3xl font-bold text-[#709775] my-2">
                {allEmployees.filter(e => e.status === 'present').length}
              </div>
              <span className="text-[11px] text-[#A39C95]">In office / Checked in</span>
            </div>

            <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-5 shadow-xl">
              <span className="text-xs text-[#78726A] font-semibold uppercase tracking-wider">On Leave</span>
              <div className="font-mono text-3xl font-bold text-[#E07A5F] my-2">
                {allEmployees.filter(e => e.status === 'leave').length}
              </div>
              <span className="text-[11px] text-[#A39C95]">Approved time off</span>
            </div>

            <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-5 shadow-xl">
              <span className="text-xs text-[#78726A] font-semibold uppercase tracking-wider">Pending Approvals</span>
              <div className="font-mono text-3xl font-bold text-[#F4A261] my-2">
                {pendingLeaves.length}
              </div>
              <span className="text-[11px] text-[#F4A261] font-carme">Action required</span>
            </div>
          </div>

          {/* Interactive Employee Switcher Grid */}
          <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-4">
            <div className="flex items-center justify-between border-b border-[#292624] pb-4">
              <div>
                <h3 className="font-crimson text-xl font-bold text-[#E8E3DD]">
                  Employee Directory Grid & Context Switcher
                </h3>
                <p className="text-xs text-[#A39C95]">
                  Click any employee card to switch into their profile or view their status.
                </p>
              </div>
              <button
                onClick={() => navigate('/employees')}
                className="text-xs text-[#E07A5F] font-bold hover:underline flex items-center space-x-1"
              >
                <span>Full Directory</span>
                <FiArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
              {allEmployees.map(emp => {
                const isSelected = currentUser?.employeeId === emp.employeeId;
                const statusColor =
                  emp.status === 'present'
                    ? 'bg-[#709775]'
                    : emp.status === 'leave'
                    ? 'bg-[#E07A5F]'
                    : 'bg-[#F4A261]';

                return (
                  <div
                    key={emp.employeeId}
                    onClick={() => switchEmployee(emp.employeeId)}
                    className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative group ${
                      isSelected
                        ? 'bg-[#2B2825] border-[#E07A5F] shadow-lg ring-1 ring-[#E07A5F]'
                        : 'bg-[#181716] border-[#332F2C] hover:border-[#E07A5F]/60'
                    }`}
                  >
                    <span className={`absolute top-3 right-3 w-2.5 h-2.5 rounded-full ${statusColor}`} title={`Status: ${emp.status}`} />

                    <div className="font-bold text-xs text-[#E8E3DD] truncate group-hover:text-[#E07A5F]">
                      {emp.name}
                    </div>
                    <div className="text-[11px] text-[#A39C95] truncate">{emp.jobTitle}</div>
                    <div className="text-[10px] text-[#78726A] font-mono mt-1">{emp.employeeId}</div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pending Approval Actions */}
          <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-crimson text-xl font-bold text-[#E8E3DD]">
                Pending HR Approvals ({pendingLeaves.length})
              </h3>
              <button
                onClick={() => navigate('/leave')}
                className="text-xs text-[#E07A5F] hover:underline font-carme"
              >
                Go to Leave Manager
              </button>
            </div>

            {pendingLeaves.length === 0 ? (
              <div className="p-8 text-center text-[#A39C95] font-carme">
                All leave requests have been reviewed and actioned cleanly!
              </div>
            ) : (
              <div className="space-y-3">
                {pendingLeaves.map(leave => (
                  <div
                    key={leave.id}
                    className="p-4 bg-[#181716] border border-[#2B2825] rounded-xl flex items-center justify-between text-xs"
                  >
                    <div>
                      <div className="font-bold text-[#E8E3DD]">{leave.employeeName}</div>
                      <div className="text-[#A39C95] text-[11px] mt-0.5">
                        {leave.leaveType} Leave • {leave.totalDays} Days ({leave.startDate} – {leave.endDate})
                      </div>
                      <p className="text-[#78726A] italic font-carme mt-1">"{leave.reason}"</p>
                    </div>

                    <button
                      onClick={() => navigate('/leave')}
                      className="px-3 py-1.5 rounded-lg bg-[#E07A5F] text-[#FFFFFF] text-xs font-bold hover:bg-[#D0694E]"
                    >
                      Review & Approve
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
