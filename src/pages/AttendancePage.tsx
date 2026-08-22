import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { AttendanceRecord } from '../types';
import { UserAvatar } from '../components/ui/UserAvatar';
import { Plane } from 'lucide-react';
import {
  FiChevronLeft,
  FiChevronRight,
  FiSearch,
} from 'react-icons/fi';

export const AttendancePage: React.FC = () => {
  const { currentUser, role } = useAuth();
  const isHR = role === 'HR';

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('August 2026');

  const fetchAttendance = async () => {
    try {
      const data = await api.getAttendanceRecords(isHR ? undefined : currentUser?.employeeId);
      setRecords(data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchAttendance();

    const handleAttendanceUpdated = () => {
      fetchAttendance();
    };
    window.addEventListener('dayflow_attendance_updated', handleAttendanceUpdated);

    const interval = setInterval(fetchAttendance, 3000);

    return () => {
      window.removeEventListener('dayflow_attendance_updated', handleAttendanceUpdated);
      clearInterval(interval);
    };
  }, [currentUser, isHR]);

  // Employee KPI Calculations for ongoing month
  const userRecords = records.filter(r => !currentUser || r.employeeId === currentUser.employeeId);
  const presentDaysCount = userRecords.filter(r => r.status === 'Present').length;
  const leaveDaysCount = userRecords.filter(r => r.status === 'Leave').length;
  const totalWorkingDays = 22;

  // Filtered records for HR search
  const filteredRecords = records.filter(rec => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      rec.employeeName.toLowerCase().includes(term) ||
      rec.employeeId.toLowerCase().includes(term) ||
      rec.status.toLowerCase().includes(term)
    );
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto font-carme text-[#E8E3DD]">
      {/* 1. TOP HEADER & SEARCHBAR */}
      <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-crimson text-2xl font-bold text-[#E8E3DD]">
            Attendance
          </h2>
          <p className="text-xs text-[#A39C95] mt-0.5">
            {isHR
              ? 'Admin View — Real-time attendance logs of all employees present on current day.'
              : 'Employee View — Day-wise attendance log for ongoing month.'}
          </p>
        </div>

        {/* HR Searchbar */}
        {isHR && (
          <div className="relative w-full md:w-72">
            <FiSearch className="w-4 h-4 text-[#78726A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Searchbar (employee name or ID)..."
              className="w-full bg-[#141312] border border-[#332F2C] rounded-xl pl-9 pr-4 py-2 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
            />
          </div>
        )}
      </div>

      {/* 2. NAVIGATION & METRIC SUMMARY BAR */}
      <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-[#292624]">
          {/* Navigation Arrows & Month/Date Selector */}
          <div className="flex items-center space-x-3">
            <div className="flex items-center space-x-1 bg-[#141312] border border-[#332F2C] p-1 rounded-xl">
              <button className="p-1.5 rounded-lg text-[#A39C95] hover:text-[#E8E3DD] hover:bg-[#24211F]">
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <button className="p-1.5 rounded-lg text-[#A39C95] hover:text-[#E8E3DD] hover:bg-[#24211F]">
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>

            {/* Month Dropdown / View Selector */}
            <select
              value={selectedMonth}
              onChange={e => setSelectedMonth(e.target.value)}
              className="bg-[#141312] border border-[#332F2C] rounded-xl px-3 py-2 text-xs text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F] font-mono"
            >
              <option value="August 2026">Aug v (August 2026)</option>
              <option value="September 2026">Sep v (September 2026)</option>
              <option value="October 2026">Oct v (October 2026)</option>
            </select>

            {isHR && (
              <span className="px-3 py-1.5 rounded-xl bg-[#24211F] border border-[#332F2C] text-xs font-bold text-[#E07A5F]">
                Day View
              </span>
            )}
          </div>

          {/* Employee KPI Metric Summary Boxes (Right Diagram Spec) */}
          {!isHR && (
            <div className="flex flex-wrap items-center gap-3 text-xs">
              <div className="px-4 py-2 rounded-xl bg-[#141312] border border-[#2B2825] flex items-center space-x-2">
                <span className="text-[#78726A]">Count of days present:</span>
                <span className="font-mono font-bold text-[#709775]">{presentDaysCount} Days</span>
              </div>

              <div className="px-4 py-2 rounded-xl bg-[#141312] border border-[#2B2825] flex items-center space-x-2">
                <span className="text-[#78726A]">Leaves count:</span>
                <span className="font-mono font-bold text-[#E07A5F]">{leaveDaysCount} Days</span>
              </div>

              <div className="px-4 py-2 rounded-xl bg-[#141312] border border-[#2B2825] flex items-center space-x-2">
                <span className="text-[#78726A]">Total working days:</span>
                <span className="font-mono font-bold text-[#E8E3DD]">{totalWorkingDays} Days</span>
              </div>
            </div>
          )}
        </div>

        {/* Current Date Banner */}
        <div className="text-center py-2 bg-[#141312] border border-[#2B2825] rounded-xl font-mono text-sm font-bold text-[#E07A5F]">
          22, August 2026
        </div>

        {/* 3. ATTENDANCE TABLE VIEW */}
        <div className="overflow-x-auto border border-[#2B2825] rounded-xl shadow-inner">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="bg-[#181716] border-b border-[#292624] text-[#78726A] font-semibold text-[10px] uppercase tracking-wider">
                {isHR ? (
                  <th className="py-3.5 px-4">Emp</th>
                ) : (
                  <th className="py-3.5 px-4">Date</th>
                )}
                <th className="py-3.5 px-4">Check In</th>
                <th className="py-3.5 px-4">Check Out</th>
                <th className="py-3.5 px-4">Work Hours</th>
                <th className="py-3.5 px-4">Extra hours</th>
                <th className="py-3.5 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2B2825]">
              {(isHR ? filteredRecords : userRecords).length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#A39C95]">
                    No attendance records found for this view.
                  </td>
                </tr>
              ) : (
                (isHR ? filteredRecords : userRecords).map(rec => (
                  <tr key={rec.id} className="hover:bg-[#24211F] transition-colors">
                    {/* Emp column for Admin vs Date column for Employee */}
                    {isHR ? (
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-3">
                          <UserAvatar name={rec.employeeName} size="w-8 h-8" />
                          <div>
                            <span className="font-bold text-[#E8E3DD] block">{rec.employeeName}</span>
                            <span className="text-[10px] font-mono text-[#E07A5F]">{rec.employeeId}</span>
                          </div>
                        </div>
                      </td>
                    ) : (
                      <td className="py-3.5 px-4 font-mono font-bold text-[#E8E3DD]">{rec.date}</td>
                    )}

                    <td className="py-3.5 px-4 font-mono text-[#E8E3DD]">{rec.checkIn || '--:--'}</td>
                    <td className="py-3.5 px-4 font-mono text-[#E8E3DD]">{rec.checkOut || '--:--'}</td>
                    <td className="py-3.5 px-4 font-mono font-bold text-[#709775]">{rec.workHours || '00h 00m'}</td>
                    <td className="py-3.5 px-4 font-mono text-[#A39C95]">{rec.extraHours || '00h 00m'}</td>
                    <td className="py-3.5 px-4">
                      {rec.status === 'Present' ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#1C251F] text-[#709775] border border-[#709775]/40 font-semibold text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-[#709775]" />
                          <span>Present</span>
                        </span>
                      ) : rec.status === 'Leave' ? (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#291D24] text-[#E07A5F] border border-[#E07A5F]/40 font-semibold text-[11px]">
                          <Plane className="w-3 h-3 text-[#E07A5F]" />
                          <span>Leave</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center space-x-1.5 px-2.5 py-0.5 rounded-full bg-[#25221C] text-[#F4A261] border border-[#F4A261]/40 font-semibold text-[11px]">
                          <span className="w-2 h-2 rounded-full bg-[#F4A261]" />
                          <span>Absent</span>
                        </span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
