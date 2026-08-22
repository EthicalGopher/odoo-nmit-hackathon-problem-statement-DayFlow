import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { UserAvatar } from '../ui/UserAvatar';
import { api } from '../../api/client';
import {
  FiUsers,
  FiClock,
  FiCalendar,
  FiUser,
  FiLogOut,
  FiArrowRight,
  FiChevronDown,
} from 'react-icons/fi';

export const Navbar: React.FC = () => {
  const { currentUser, logout, allEmployees } = useAuth();
  const navigate = useNavigate();

  const hrUser = allEmployees.find(e => e.role === 'HR');
  const companyLogo = currentUser?.companyLogo || hrUser?.companyLogo || '/logo.png';

  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isCheckedIn, setIsCheckedIn] = useState(() => {
    const saved = localStorage.getItem('dayflow_checked_in');
    return saved !== null ? saved === 'true' : false;
  });
  const [checkInTime, setCheckInTime] = useState(() => {
    return localStorage.getItem('dayflow_checkin_time') || '09:00 AM';
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleCheckInToggle = async () => {
    if (!currentUser) return;
    setIsSubmitting(true);
    try {
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      if (isCheckedIn) {
        await api.checkOut(currentUser.employeeId, nowStr);
        setIsCheckedIn(false);
        localStorage.setItem('dayflow_checked_in', 'false');
      } else {
        await api.checkIn(currentUser.employeeId, nowStr);
        setIsCheckedIn(true);
        setCheckInTime(nowStr);
        localStorage.setItem('dayflow_checked_in', 'true');
        localStorage.setItem('dayflow_checkin_time', nowStr);
      }
      window.dispatchEvent(new Event('dayflow_attendance_updated'));
    } catch (err) {
      console.error('Check in/out toggle failed:', err);
      const nextCheckedIn = !isCheckedIn;
      setIsCheckedIn(nextCheckedIn);
      localStorage.setItem('dayflow_checked_in', String(nextCheckedIn));
      window.dispatchEvent(new Event('dayflow_attendance_updated'));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLogout = async () => {
    setShowProfileMenu(false);
    await logout();
    navigate('/login');
  };

  return (
    <header className="h-20 bg-[#1C1A19] border-b border-[#332F2C] px-6 md:px-8 flex items-center justify-between sticky top-0 z-40 select-none shadow-xl font-carme">
      {/* Left: Company Logo & Nav Links */}
      <div className="flex items-center space-x-8">
        {/* Company Logo */}
        <NavLink to="/employees" className="flex items-center space-x-3 group">
          <img
            src={companyLogo}
            alt="Company Logo"
            className="h-10 w-auto object-contain max-w-[150px] group-hover:scale-105 transition-transform"
            onError={(e) => {
              (e.currentTarget as HTMLImageElement).src = '/logo.png';
            }}
          />
        </NavLink>

        {/* Navbar Items */}
        <nav className="flex items-center space-x-1">
          <NavLink
            to="/employees"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#2B2825] text-[#E07A5F] border border-[#E07A5F]/40 shadow-sm'
                  : 'text-[#A39C95] hover:text-[#E8E3DD] hover:bg-[#24211F]'
              }`
            }
          >
            <FiUsers className="w-4 h-4" />
            <span>Employees</span>
          </NavLink>

          <NavLink
            to="/attendance"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#2B2825] text-[#E07A5F] border border-[#E07A5F]/40 shadow-sm'
                  : 'text-[#A39C95] hover:text-[#E8E3DD] hover:bg-[#24211F]'
              }`
            }
          >
            <FiClock className="w-4 h-4" />
            <span>Attendance</span>
          </NavLink>

          <NavLink
            to="/leave"
            className={({ isActive }) =>
              `flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-[#2B2825] text-[#E07A5F] border border-[#E07A5F]/40 shadow-sm'
                  : 'text-[#A39C95] hover:text-[#E8E3DD] hover:bg-[#24211F]'
              }`
            }
          >
            <FiCalendar className="w-4 h-4" />
            <span>Time Off</span>
          </NavLink>
        </nav>
      </div>

      {/* Right: Systray Attendance Check In / Out Widget & Profile Dropdown */}
      <div className="flex items-center space-x-5">
        {/* Systray Attendance Widget */}
        <div className="hidden sm:flex items-center space-x-3 p-1.5 pl-3 rounded-xl bg-[#141312] border border-[#332F2C]">
          <div className="flex items-center space-x-2">
            <span
              className={`w-3 h-3 rounded-full transition-colors ${
                isCheckedIn ? 'bg-[#709775] animate-pulse shadow-[0_0_8px_#709775]' : 'bg-[#E06C68]'
              }`}
              title={isCheckedIn ? 'Status: Checked In (In Office)' : 'Status: Checked Out'}
            />
            <div className="text-left font-mono text-[11px]">
              <span className="text-[#A39C95] block text-[9px] uppercase font-semibold">
                {isCheckedIn ? `Since ${checkInTime}` : 'Checked Out'}
              </span>
            </div>
          </div>

          <button
            onClick={handleCheckInToggle}
            disabled={isSubmitting}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shadow-sm ${
              isCheckedIn
                ? 'bg-[#291B1B] border border-[#E06C68] text-[#E06C68] hover:bg-[#3D1E1E]'
                : 'bg-[#709775] text-white hover:bg-[#5C8260]'
            }`}
          >
            <span>{isCheckedIn ? 'Check Out' : 'Check IN'}</span>
            <FiArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* User Profile Picture (Avatar) Dropdown */}
        <div className="relative">
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2 p-1.5 rounded-full bg-[#24211F] border border-[#383330] hover:border-[#E07A5F]/50 transition-colors"
          >
            <UserAvatar name={currentUser?.name || 'User'} src={currentUser?.avatarUrl} size="w-9 h-9" />
            <span className="text-xs font-semibold text-[#E8E3DD] hidden md:inline truncate max-w-[120px]">
              {currentUser?.name}
            </span>
            <FiChevronDown className="w-3.5 h-3.5 text-[#A39C95]" />
          </button>

          {/* Profile Dropdown Menu */}
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 bg-[#1C1A19] border border-[#383330] rounded-2xl shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-[#292624] flex items-center space-x-2.5">
                <UserAvatar name={currentUser?.name || 'User'} src={currentUser?.avatarUrl} size="w-10 h-10" />
                <div className="overflow-hidden">
                  <div className="font-bold text-xs text-[#E8E3DD] truncate">{currentUser?.name}</div>
                  <div className="text-[11px] text-[#A39C95] truncate">{currentUser?.email}</div>
                  <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-[#141312] text-[#E07A5F] font-mono border border-[#332F2C]">
                    {currentUser?.employeeId}
                  </span>
                </div>
              </div>

              <div className="space-y-1 pt-1">
                <button
                  onClick={() => {
                    setShowProfileMenu(false);
                    navigate('/profile');
                  }}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#E8E3DD] hover:bg-[#2B2825] transition-colors"
                >
                  <FiUser className="w-4 h-4 text-[#E07A5F]" />
                  <span>My Profile</span>
                </button>

                <button
                  onClick={handleLogout}
                  className="w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium text-[#E06C68] hover:bg-[#291B1B] transition-colors"
                >
                  <FiLogOut className="w-4 h-4 text-[#E06C68]" />
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
