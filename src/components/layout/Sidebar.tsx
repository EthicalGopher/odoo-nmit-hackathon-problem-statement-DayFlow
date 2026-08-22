import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  FiGrid,
  FiUsers,
  FiClock,
  FiCalendar,
  FiDollarSign,
  FiBarChart2,
  FiBell,
  FiSettings,
  FiLayers,
  FiGitCommit,
} from 'react-icons/fi';
import { useViewMode } from '../../context/ViewModeContext';

export const Sidebar: React.FC = () => {
  const { mode, toggleMode } = useViewMode();

  const navItems = [
    { name: 'Dashboard', path: '/dashboard', icon: FiGrid },
    { name: 'Employees', path: '/employees', icon: FiUsers },
    { name: 'Attendance', path: '/attendance', icon: FiClock },
    { name: 'Leave', path: '/leave', icon: FiCalendar },
    { name: 'Payroll', path: '/payroll', icon: FiDollarSign },
    { name: 'Reports', path: '/reports', icon: FiBarChart2 },
    { name: 'Notifications', path: '/notifications', icon: FiBell },
    { name: 'Settings', path: '/settings', icon: FiSettings },
  ];

  return (
    <aside className="w-64 bg-[#1C1A19] border-r border-[#332F2C] flex flex-col justify-between h-screen sticky top-0 z-30 select-none">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-[#292624]">
          <div className="flex items-center space-x-3">
            <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-[#E07A5F] to-[#582C35] flex items-center justify-center text-white font-bold font-crimson text-xl shadow-md">
              D
            </div>
            <div>
              <h1 className="font-crimson text-xl font-bold text-[#E8E3DD] tracking-wide leading-none">
                Dayflow
              </h1>
              <span className="font-carme text-xs text-[#A39C95]">
                Human Resource System
              </span>
            </div>
          </div>
        </div>

        {/* Navigation Items */}
        <nav className="p-4 space-y-1">
          {navItems.map(item => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-all duration-150 ${
                    isActive
                      ? 'bg-[#2B2825] text-[#E07A5F] border-l-2 border-[#E07A5F] shadow-sm'
                      : 'text-[#A39C95] hover:text-[#E8E3DD] hover:bg-[#252220]'
                  }`
                }
              >
                <Icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Footer Experience Mode Toggle */}
      <div className="p-4 border-t border-[#292624] bg-[#181716]/60">
        <div className="text-xs text-[#78726A] mb-2 font-medium flex items-center justify-between">
          <span>Workflow View</span>
          <span className="font-carme text-[#E07A5F]">
            {mode === 'canvas' ? 'Canvas View' : 'Table View'}
          </span>
        </div>
        <button
          onClick={toggleMode}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-[#24211F] border border-[#383330] text-xs font-medium text-[#E8E3DD] hover:border-[#E07A5F]/50 transition-colors"
        >
          <div className="flex items-center space-x-2">
            {mode === 'canvas' ? (
              <FiGitCommit className="w-3.5 h-3.5 text-[#E07A5F]" />
            ) : (
              <FiLayers className="w-3.5 h-3.5 text-[#709775]" />
            )}
            <span>{mode === 'canvas' ? 'Canvas Mode' : 'Table Mode'}</span>
          </div>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#1C1A19] text-[#A39C95]">
            Switch
          </span>
        </button>
      </div>
    </aside>
  );
};
