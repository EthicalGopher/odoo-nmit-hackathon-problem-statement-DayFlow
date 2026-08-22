import React, { useState, useEffect } from 'react';
import { api } from '../api/client';
import type { ReportAnalytics } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { FiDownload } from 'react-icons/fi';

export const ReportsPage: React.FC = () => {
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [analytics, setAnalytics] = useState<ReportAnalytics | null>(null);

  useEffect(() => {
    api.getReportsAnalytics().then(setAnalytics).catch(console.error);
  }, []);

  const attendanceData = [
    { day: 'Mon', present: 5, absent: 0, leave: 0 },
    { day: 'Tue', present: 4, absent: 0, leave: 1 },
    { day: 'Wed', present: 3, absent: 1, leave: 1 },
    { day: 'Thu', present: 4, absent: 0, leave: 1 },
    { day: 'Fri', present: 4, absent: 1, leave: 0 },
  ];

  const departmentPayroll = [
    { dept: 'Engineering', amount: 175000 },
    { dept: 'People & Culture', amount: 95000 },
    { dept: 'Design', amount: 75000 },
    { dept: 'Product', amount: 70000 },
  ];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header & Period Switcher */}
      <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-crimson text-2xl font-bold text-[#E8E3DD]">
            Reports & Analytics
          </h2>
          <p className="text-xs text-[#A39C95] font-carme mt-0.5">
            Operational intelligence for company attendance, salary distribution, and leave utilization.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          {/* Period Selector */}
          <div className="flex items-center p-1 bg-[#141312] border border-[#332F2C] rounded-lg text-xs">
            <button
              onClick={() => setPeriod('weekly')}
              className={`px-3 py-1 rounded transition-colors ${
                period === 'weekly' ? 'bg-[#E07A5F] text-white font-medium' : 'text-[#A39C95] hover:text-[#E8E3DD]'
              }`}
            >
              Weekly
            </button>
            <button
              onClick={() => setPeriod('monthly')}
              className={`px-3 py-1 rounded transition-colors ${
                period === 'monthly' ? 'bg-[#E07A5F] text-white font-medium' : 'text-[#A39C95] hover:text-[#E8E3DD]'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setPeriod('yearly')}
              className={`px-3 py-1 rounded transition-colors ${
                period === 'yearly' ? 'bg-[#E07A5F] text-white font-medium' : 'text-[#A39C95] hover:text-[#E8E3DD]'
              }`}
            >
              Yearly
            </button>
          </div>

          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl bg-[#24211F] border border-[#332F2C] text-xs font-semibold text-[#E8E3DD] hover:border-[#E07A5F] transition-colors flex items-center space-x-1.5"
          >
            <FiDownload className="w-4 h-4 text-[#E07A5F]" />
            <span>Export Report</span>
          </button>
        </div>
      </div>

      {/* Analytics High Level Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-5 shadow-xl">
          <span className="text-xs text-[#78726A] font-semibold uppercase tracking-wider">Attendance Rate</span>
          <div className="font-mono text-3xl font-bold text-[#709775] my-2">
            {analytics?.attendanceRate || 89.5}%
          </div>
          <span className="text-[11px] text-[#A39C95] font-crafty">Based on {period} log</span>
        </div>

        <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-5 shadow-xl">
          <span className="text-xs text-[#78726A] font-semibold uppercase tracking-wider">Monthly Payroll</span>
          <div className="font-mono text-3xl font-bold text-[#F4A261] my-2">
            ${analytics?.totalMonthlyPayroll?.toLocaleString() || '415,000'}
          </div>
          <span className="text-[11px] text-[#A39C95]">Net company commitment</span>
        </div>

        <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-5 shadow-xl">
          <span className="text-xs text-[#78726A] font-semibold uppercase tracking-wider">Active Employees</span>
          <div className="font-mono text-3xl font-bold text-[#E8E3DD] my-2">
            {analytics?.totalEmployees || 5}
          </div>
          <span className="text-[11px] text-[#A39C95]">100% profile completed</span>
        </div>

        <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-5 shadow-xl">
          <span className="text-xs text-[#78726A] font-semibold uppercase tracking-wider">Pending Leave</span>
          <div className="font-mono text-3xl font-bold text-[#E07A5F] my-2">
            {analytics?.pendingLeave || 2}
          </div>
          <span className="text-[11px] text-[#A39C95] font-crafty">Awaiting HR action</span>
        </div>
      </div>

      {/* Visual Chart Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Attendance Breakdown Bar Chart */}
        <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-crimson text-xl font-bold text-[#E8E3DD]">
            Weekly Attendance Distribution
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={attendanceData}>
                <XAxis dataKey="day" stroke="#78726A" fontSize={11} />
                <YAxis stroke="#78726A" fontSize={11} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1C1A19', borderColor: '#332F2C', color: '#E8E3DD' }}
                />
                <Bar dataKey="present" fill="#709775" name="Present" radius={[4, 4, 0, 0]} />
                <Bar dataKey="leave" fill="#E07A5F" name="On Leave" radius={[4, 4, 0, 0]} />
                <Bar dataKey="absent" fill="#E06C68" name="Absent" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payroll Distribution by Department */}
        <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-4">
          <h3 className="font-crimson text-xl font-bold text-[#E8E3DD]">
            Salary Allocation by Department ($)
          </h3>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentPayroll} layout="vertical">
                <XAxis type="number" stroke="#78726A" fontSize={11} />
                <YAxis dataKey="dept" type="category" stroke="#78726A" fontSize={11} width={110} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1C1A19', borderColor: '#332F2C', color: '#E8E3DD' }}
                />
                <Bar dataKey="amount" fill="#F4A261" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
};
