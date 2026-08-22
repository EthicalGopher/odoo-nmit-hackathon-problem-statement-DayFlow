import React, { useState } from 'react';
import type { AttendanceRecord, AttendanceStatus } from '../../types';
import {
  FiChevronLeft,
  FiChevronRight,
  FiCheckCircle,
  FiXCircle,
  FiClock,
  FiCalendar,
  FiFilter,
  FiUserCheck,
} from 'react-icons/fi';

interface AttendanceCalendarProps {
  records: AttendanceRecord[];
  isHR: boolean;
}

export const AttendanceCalendar: React.FC<AttendanceCalendarProps> = ({ records, isHR }) => {
  const [viewMode, setViewMode] = useState<'weekly' | 'daily'>('weekly');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const daysOfWeek = [
    { name: 'Monday', date: 'Aug 18', fullDate: '2026-08-18' },
    { name: 'Tuesday', date: 'Aug 19', fullDate: '2026-08-19' },
    { name: 'Wednesday', date: 'Aug 20', fullDate: '2026-08-20' },
    { name: 'Thursday', date: 'Aug 21', fullDate: '2026-08-21' },
    { name: 'Friday', date: 'Aug 22', fullDate: '2026-08-22', isToday: true },
    { name: 'Saturday', date: 'Aug 23', fullDate: '2026-08-23', isWeekend: true },
    { name: 'Sunday', date: 'Aug 24', fullDate: '2026-08-24', isWeekend: true },
  ];

  const getStatusBadge = (status: AttendanceStatus) => {
    switch (status) {
      case 'Present':
        return {
          style: 'bg-[#1C251F] text-[#709775] border-[#709775]/40',
          icon: <FiCheckCircle className="w-3.5 h-3.5" />,
        };
      case 'Absent':
        return {
          style: 'bg-[#291B1B] text-[#E06C68] border-[#E06C68]/40',
          icon: <FiXCircle className="w-3.5 h-3.5" />,
        };
      case 'Half-day':
        return {
          style: 'bg-[#25221C] text-[#F4A261] border-[#F4A261]/40',
          icon: <FiClock className="w-3.5 h-3.5" />,
        };
      case 'Leave':
        return {
          style: 'bg-[#291D24] text-[#E07A5F] border-[#E07A5F]/40',
          icon: <FiCalendar className="w-3.5 h-3.5" />,
        };
      default:
        return {
          style: 'bg-[#1C1A19] text-[#A39C95] border-[#332F2C]',
          icon: <FiClock className="w-3.5 h-3.5" />,
        };
    }
  };

  const filteredRecords = records.filter(
    rec => statusFilter === 'All' || rec.status.toLowerCase() === statusFilter.toLowerCase()
  );

  return (
    <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-5 border-b border-[#292624] gap-4">
        <div>
          <div className="flex items-center space-x-2 text-[#E07A5F]">
            <FiUserCheck className="w-5 h-5" />
            <h2 className="font-crimson text-2xl font-bold text-[#E8E3DD]">
              Attendance Log & History
            </h2>
          </div>
          <p className="text-xs text-[#A39C95] mt-0.5 font-carme">
            {isHR
              ? 'Complete company-wide attendance log and check-in history.'
              : 'Detailed breakdown of your daily check-in times, working hours, and weekly status.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* View Mode Selector */}
          <div className="flex items-center p-1 bg-[#141312] border border-[#332F2C] rounded-xl text-xs">
            <button
              onClick={() => setViewMode('weekly')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                viewMode === 'weekly' ? 'bg-[#E07A5F] text-white shadow-sm' : 'text-[#A39C95] hover:text-[#E8E3DD]'
              }`}
            >
              Weekly Overview
            </button>
            <button
              onClick={() => setViewMode('daily')}
              className={`px-3 py-1.5 rounded-lg transition-all font-medium ${
                viewMode === 'daily' ? 'bg-[#E07A5F] text-white shadow-sm' : 'text-[#A39C95] hover:text-[#E8E3DD]'
              }`}
            >
              Detailed Log Table
            </button>
          </div>

          {/* Date Selector */}
          <div className="flex items-center space-x-1 bg-[#141312] border border-[#332F2C] px-2 py-1 rounded-xl text-xs">
            <button className="p-1 rounded text-[#A39C95] hover:text-[#E8E3DD]">
              <FiChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-[#E8E3DD] px-2">Aug 18 – Aug 24, 2026</span>
            <button className="p-1 rounded text-[#A39C95] hover:text-[#E8E3DD]">
              <FiChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Summary KPI Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-[#141312] border border-[#2B2825] rounded-xl text-xs">
        <div>
          <span className="text-[#78726A] font-semibold uppercase text-[10px]">Total Hours This Week</span>
          <div className="font-mono text-xl font-bold text-[#E8E3DD] mt-0.5">41h 45m</div>
        </div>
        <div>
          <span className="text-[#78726A] font-semibold uppercase text-[10px]">Days Present</span>
          <div className="font-mono text-xl font-bold text-[#709775] mt-0.5">5 Days</div>
        </div>
        <div>
          <span className="text-[#78726A] font-semibold uppercase text-[10px]">On-Time Arrival</span>
          <div className="font-mono text-xl font-bold text-[#F4A261] mt-0.5">98%</div>
        </div>
        <div>
          <span className="text-[#78726A] font-semibold uppercase text-[10px]">Approved Leaves</span>
          <div className="font-mono text-xl font-bold text-[#E07A5F] mt-0.5">1 Day</div>
        </div>
      </div>

      {/* View Display */}
      {viewMode === 'weekly' ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-7 gap-3">
          {daysOfWeek.map((dayItem, idx) => {
            const record = records[idx % records.length] || {
              date: dayItem.fullDate,
              checkIn: dayItem.isWeekend ? '--:--' : '09:05 AM',
              checkOut: dayItem.isWeekend ? '--:--' : '05:30 PM',
              status: dayItem.isWeekend ? 'Leave' : idx === 2 ? 'Half-day' : 'Present',
              workHours: dayItem.isWeekend ? '0h 00m' : idx === 2 ? '4h 00m' : '8h 25m',
            };

            const badge = getStatusBadge(record.status as AttendanceStatus);

            return (
              <div
                key={dayItem.name}
                className={`p-4 rounded-2xl border flex flex-col justify-between h-44 transition-all ${
                  dayItem.isToday
                    ? 'bg-[#29221C] border-[#E07A5F] ring-1 ring-[#E07A5F] shadow-lg'
                    : dayItem.isWeekend
                    ? 'bg-[#181716] border-[#292624]'
                    : 'bg-[#24211F] border-[#332F2C] hover:border-[#E07A5F]/40'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-[#E8E3DD]">{dayItem.name.slice(0, 3)}</span>
                    <span className="text-xs text-[#A39C95] font-mono">{dayItem.date}</span>
                  </div>

                  <div className="mt-3">
                    <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-md text-xs font-bold border ${badge.style}`}>
                      {badge.icon}
                      <span>{record.status}</span>
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-3 border-t border-[#292624] text-xs text-[#A39C95] font-mono space-y-1">
                  <div className="flex justify-between">
                    <span className="text-[#78726A]">In:</span>
                    <span className="text-[#E8E3DD] font-semibold">{record.checkIn}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#78726A]">Out:</span>
                    <span className="text-[#E8E3DD] font-semibold">{record.checkOut}</span>
                  </div>
                  <div className="flex justify-between text-[#709775] font-bold pt-1 border-t border-[#292624]/60">
                    <span className="text-[#78726A]">Total:</span>
                    <span>{record.workHours}</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="space-y-4">
          {/* Status Filter */}
          <div className="flex items-center space-x-3 text-xs">
            <span className="text-[#78726A] font-semibold flex items-center space-x-1">
              <FiFilter className="w-3.5 h-3.5" />
              <span>Filter Status:</span>
            </span>
            {['All', 'Present', 'Absent', 'Leave', 'Half-day'].map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1 rounded-lg transition-colors ${
                  statusFilter === st
                    ? 'bg-[#E07A5F] text-white font-bold'
                    : 'bg-[#141312] text-[#A39C95] hover:text-[#E8E3DD] border border-[#332F2C]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>

          <div className="border border-[#2B2825] rounded-2xl overflow-hidden shadow-lg">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#181716] border-b border-[#292624] text-[#78726A] font-semibold text-[10px] uppercase tracking-wider">
                  <th className="py-3.5 px-4">Date</th>
                  {isHR && <th className="py-3.5 px-4">Employee</th>}
                  <th className="py-3.5 px-4">Check-In Time</th>
                  <th className="py-3.5 px-4">Check-Out Time</th>
                  <th className="py-3.5 px-4">Working Hours</th>
                  <th className="py-3.5 px-4">Overtime / Extra</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2B2825]">
                {filteredRecords.length === 0 ? (
                  <tr>
                    <td colSpan={isHR ? 7 : 6} className="py-8 text-center text-[#A39C95] font-carme">
                      No matching attendance records found.
                    </td>
                  </tr>
                ) : (
                  filteredRecords.map(rec => {
                    const badge = getStatusBadge(rec.status);
                    return (
                      <tr key={rec.id} className="hover:bg-[#24211F] transition-colors">
                        <td className="py-4 px-4 font-mono font-bold text-[#E8E3DD]">{rec.date}</td>
                        {isHR && <td className="py-4 px-4 font-bold text-[#E8E3DD]">{rec.employeeName}</td>}
                        <td className="py-4 px-4 text-[#E8E3DD] font-mono">{rec.checkIn}</td>
                        <td className="py-4 px-4 text-[#E8E3DD] font-mono">{rec.checkOut}</td>
                        <td className="py-4 px-4 font-bold text-[#709775] font-mono">{rec.workHours}</td>
                        <td className="py-4 px-4 text-[#A39C95] font-mono">{rec.extraHours}</td>
                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center space-x-1.5 px-3 py-1 rounded-md text-xs font-bold border ${badge.style}`}>
                            {badge.icon}
                            <span>{rec.status}</span>
                          </span>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
