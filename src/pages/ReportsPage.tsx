import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { Employee, Payroll, AttendanceRecord, ReportAnalytics } from '../types';
import { SalarySlipModal } from '../components/ui/SalarySlipModal';
import { UserAvatar } from '../components/ui/UserAvatar';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import {
  FiDownload,
  FiFileText,
  FiClock,
  FiDollarSign,
  FiBarChart2,
  FiSearch,
  FiCheckCircle,
} from 'react-icons/fi';
import { Plane } from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const { allEmployees } = useAuth();

  const [activeTab, setActiveTab] = useState<'overview' | 'salary' | 'attendance'>('overview');
  const [period, setPeriod] = useState<'weekly' | 'monthly' | 'yearly'>('monthly');
  const [analytics, setAnalytics] = useState<ReportAnalytics | null>(null);

  // Salary Slips State
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [salarySearch, setSalarySearch] = useState('');
  const [salaryDeptFilter, setSalaryDeptFilter] = useState('All');
  const [selectedEmpForSlip, setSelectedEmpForSlip] = useState<Employee | null>(null);
  const [selectedPayrollForSlip, setSelectedPayrollForSlip] = useState<Payroll | null>(null);
  const [isSlipModalOpen, setIsSlipModalOpen] = useState(false);

  // Attendance Reports State
  const [attendanceLogs, setAttendanceLogs] = useState<AttendanceRecord[]>([]);
  const [attendanceSearch, setAttendanceSearch] = useState('');
  const [attendanceDeptFilter, setAttendanceDeptFilter] = useState('All');

  const departments = ['All', 'People & Culture', 'Engineering', 'Design', 'Product'];

  useEffect(() => {
    // Load general analytics
    api.getReportsAnalytics().then(setAnalytics).catch(console.error);

    // Load payroll records
    api.getPayroll().then(data => {
      setPayrolls(Array.isArray(data) ? data : [data]);
    }).catch(console.error);

    // Load attendance records
    api.getAttendanceRecords().then(setAttendanceLogs).catch(console.error);
  }, []);

  const handleOpenSalarySlip = async (emp: Employee) => {
    setSelectedEmpForSlip(emp);
    try {
      const pData = await api.getPayroll(emp.employeeId);
      const pr = Array.isArray(pData) ? pData[0] : pData;
      if (pr) {
        setSelectedPayrollForSlip(pr);
      } else {
        const mw = 75000;
        const basic = mw * 0.50;
        setSelectedPayrollForSlip({
          id: Date.now(),
          employeeId: emp.employeeId,
          employeeName: emp.name,
          wageType: 'Fixed',
          monthWage: mw,
          yearlyWage: mw * 12,
          workingDaysPerWeek: 5,
          basicSalary: basic,
          hra: basic * 0.50,
          standardAllowance: 4167,
          performanceBonus: basic * 0.0833,
          leaveTravelAllowance: basic * 0.0833,
          fixedAllowance: mw - (basic + basic * 0.50 + 4167 + basic * 0.0833 * 2),
          providentFund: basic * 0.12,
          professionalTax: 200,
          netSalary: mw - (basic * 0.12 + 200),
        });
      }
      setIsSlipModalOpen(true);
    } catch (err) {
      console.error('Failed to open salary slip:', err);
    }
  };

  // Recharts Chart Data
  const attendanceData = [
    { day: 'Mon', present: 5, absent: 0, leave: 0 },
    { day: 'Tue', present: 4, absent: 0, leave: 1 },
    { day: 'Wed', present: 3, absent: 1, leave: 1 },
    { day: 'Thu', present: 4, absent: 0, leave: 1 },
    { day: 'Fri', present: 4, absent: 1, leave: 0 },
  ];

  const departmentPayrollData = [
    { dept: 'Engineering', amount: 175000 },
    { dept: 'People & Culture', amount: 95000 },
    { dept: 'Design', amount: 75000 },
    { dept: 'Product', amount: 70000 },
  ];

  // Filtering for Salary Slips
  const filteredEmployeesForSalary = allEmployees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(salarySearch.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(salarySearch.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(salarySearch.toLowerCase());
    const matchesDept = salaryDeptFilter === 'All' || emp.department === salaryDeptFilter;
    return matchesSearch && matchesDept;
  });

  // Filtering for Attendance Logs
  const filteredAttendanceLogs = attendanceLogs.filter(log => {
    const matchesSearch =
      log.employeeName.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
      log.employeeId.toLowerCase().includes(attendanceSearch.toLowerCase()) ||
      log.date.includes(attendanceSearch);
    const emp = allEmployees.find(e => e.employeeId === log.employeeId);
    const matchesDept = attendanceDeptFilter === 'All' || (emp && emp.department === attendanceDeptFilter);
    return matchesSearch && matchesDept;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto font-carme text-[#E8E3DD]">
      {/* Header & Sub-Tabs Navigation */}
      <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h2 className="font-crimson text-3xl font-bold text-[#E8E3DD]">
              Analytics & Operational Reports
            </h2>
            <p className="text-xs text-[#A39C95] mt-0.5">
              Comprehensive company metrics, salary slip generation, and attendance logs.
            </p>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => window.print()}
              className="px-4 py-2 rounded-xl bg-[#24211F] border border-[#332F2C] text-xs font-semibold text-[#E8E3DD] hover:border-[#E07A5F] transition-colors flex items-center space-x-1.5"
            >
              <FiDownload className="w-4 h-4 text-[#E07A5F]" />
              <span>Export Full PDF</span>
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center space-x-2 border-b border-[#292624] pb-1 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center space-x-2 ${
              activeTab === 'overview'
                ? 'bg-[#2B2825] text-[#E07A5F] border-t-2 border-[#E07A5F]'
                : 'text-[#A39C95] hover:text-[#E8E3DD]'
            }`}
          >
            <FiBarChart2 className="w-4 h-4" />
            <span>Executive Dashboard</span>
          </button>

          <button
            onClick={() => setActiveTab('salary')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center space-x-2 ${
              activeTab === 'salary'
                ? 'bg-[#2B2825] text-[#E07A5F] border-t-2 border-[#E07A5F]'
                : 'text-[#A39C95] hover:text-[#E8E3DD]'
            }`}
          >
            <FiDollarSign className="w-4 h-4 text-[#709775]" />
            <span>Salary Slips & Payroll Reports</span>
          </button>

          <button
            onClick={() => setActiveTab('attendance')}
            className={`px-4 py-2.5 rounded-t-xl transition-all flex items-center space-x-2 ${
              activeTab === 'attendance'
                ? 'bg-[#2B2825] text-[#E07A5F] border-t-2 border-[#E07A5F]'
                : 'text-[#A39C95] hover:text-[#E8E3DD]'
            }`}
          >
            <FiClock className="w-4 h-4 text-[#F4A261]" />
            <span>Attendance & Work Hours Reports</span>
          </button>
        </div>
      </div>

      {/* ================= TAB 1: EXECUTIVE DASHBOARD ================= */}
      {activeTab === 'overview' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          {/* KPI Cards Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-5 shadow-xl space-y-1">
              <span className="text-xs text-[#78726A] font-semibold uppercase tracking-wider">Attendance Rate</span>
              <div className="font-mono text-3xl font-extrabold text-[#709775]">
                {analytics?.attendanceRate || 89.5}%
              </div>
              <span className="text-[11px] text-[#A39C95]">Avg across company</span>
            </div>

            <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-5 shadow-xl space-y-1">
              <span className="text-xs text-[#78726A] font-semibold uppercase tracking-wider">Monthly Payroll</span>
              <div className="font-mono text-3xl font-extrabold text-[#F4A261]">
                ₹{(analytics?.totalMonthlyPayroll || 415000).toLocaleString()}
              </div>
              <span className="text-[11px] text-[#A39C95]">Net company commitment</span>
            </div>

            <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-5 shadow-xl space-y-1">
              <span className="text-xs text-[#78726A] font-semibold uppercase tracking-wider">Active Employees</span>
              <div className="font-mono text-3xl font-extrabold text-[#E8E3DD]">
                {allEmployees.length || 5}
              </div>
              <span className="text-[11px] text-[#A39C95]">100% onboarded</span>
            </div>

            <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-5 shadow-xl space-y-1">
              <span className="text-xs text-[#78726A] font-semibold uppercase tracking-wider">Working Days</span>
              <div className="font-mono text-3xl font-extrabold text-[#E07A5F]">
                {analytics?.workingDaysThisMonth || 22} Days
              </div>
              <span className="text-[11px] text-[#A39C95]">Standard monthly cycle</span>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Weekly Attendance Distribution */}
            <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-crimson text-xl font-bold text-[#E8E3DD]">
                  Weekly Attendance Distribution
                </h3>
                <div className="flex items-center space-x-2 p-1 bg-[#141312] border border-[#332F2C] rounded-lg text-xs">
                  <button
                    onClick={() => setPeriod('weekly')}
                    className={`px-2.5 py-0.5 rounded transition-colors ${period === 'weekly' ? 'bg-[#E07A5F] text-white font-bold' : 'text-[#A39C95]'}`}
                  >
                    Weekly
                  </button>
                  <button
                    onClick={() => setPeriod('monthly')}
                    className={`px-2.5 py-0.5 rounded transition-colors ${period === 'monthly' ? 'bg-[#E07A5F] text-white font-bold' : 'text-[#A39C95]'}`}
                  >
                    Monthly
                  </button>
                </div>
              </div>
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

            {/* Department Salary Allocation */}
            <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-4">
              <h3 className="font-crimson text-xl font-bold text-[#E8E3DD]">
                Salary Allocation by Department (₹)
              </h3>
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentPayrollData} layout="vertical">
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
      )}

      {/* ================= TAB 2: SALARY SLIPS & PAYROLL REPORTS ================= */}
      {activeTab === 'salary' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <FiSearch className="w-4 h-4 text-[#78726A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={salarySearch}
                onChange={e => setSalarySearch(e.target.value)}
                placeholder="Search by employee name or login ID..."
                className="w-full bg-[#141312] border border-[#332F2C] rounded-xl pl-9 pr-4 py-2 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
              <span className="text-xs text-[#78726A] mr-1 shrink-0">Filter Dept:</span>
              {departments.map(d => (
                <button
                  key={d}
                  onClick={() => setSalaryDeptFilter(d)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    salaryDeptFilter === d
                      ? 'bg-[#E07A5F] text-white shadow-md'
                      : 'bg-[#141312] text-[#A39C95] hover:text-[#E8E3DD] border border-[#332F2C]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Salary Slips Roster Table */}
          <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#292624] flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#709775]">
                <FiDollarSign className="w-5 h-5" />
                <h3 className="font-crimson font-bold text-lg text-[#E8E3DD]">
                  Employee Salary Slips — August 2026
                </h3>
              </div>
              <span className="text-xs text-[#A39C95] font-mono">
                Total Records: {filteredEmployeesForSalary.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-carme">
                <thead className="bg-[#141312] border-b border-[#292624] text-[#78726A] uppercase text-[10px] font-mono font-bold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Login ID</th>
                    <th className="py-3.5 px-4">Department</th>
                    <th className="py-3.5 px-4">Month Wage</th>
                    <th className="py-3.5 px-4">Basic Salary</th>
                    <th className="py-3.5 px-4">PF & Tax</th>
                    <th className="py-3.5 px-4">Net Payable</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24211F]">
                  {filteredEmployeesForSalary.map(emp => {
                    const pr = payrolls.find(p => p.employeeId === emp.employeeId);
                    const monthWage = pr?.monthWage || 75000;
                    const basic = pr?.basicSalary || monthWage * 0.5;
                    const pf = pr?.providentFund || basic * 0.12;
                    const net = pr?.netSalary || (monthWage - (pf + 200));

                    return (
                      <tr key={emp.employeeId} className="hover:bg-[#24211F] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <UserAvatar name={emp.name} src={emp.avatarUrl} size="w-8 h-8" />
                            <div>
                              <span className="font-bold text-[#E8E3DD] block">{emp.name}</span>
                              <span className="text-[10px] text-[#A39C95]">{emp.jobTitle}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-[#E07A5F]">{emp.employeeId}</td>
                        <td className="py-3.5 px-4">
                          <span className="px-2 py-0.5 rounded bg-[#141312] border border-[#2B2825] text-[#709775] font-mono text-[10px]">
                            {emp.department}
                          </span>
                        </td>
                        <td className="py-3.5 px-4 font-mono font-bold text-[#E8E3DD]">₹{monthWage.toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-mono text-[#A39C95]">₹{basic.toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-mono text-[#E06C68]">₹{(pf + 200).toLocaleString()}</td>
                        <td className="py-3.5 px-4 font-mono font-extrabold text-[#709775]">₹{net.toLocaleString()}</td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleOpenSalarySlip(emp)}
                            className="px-3 py-1.5 rounded-lg bg-[#24211F] border border-[#332F2C] text-[#E07A5F] hover:bg-[#E07A5F] hover:text-white transition-colors font-bold text-[11px] flex items-center space-x-1.5 ml-auto shadow-sm"
                          >
                            <FiFileText className="w-3.5 h-3.5" />
                            <span>View Salary Slip</span>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 3: ATTENDANCE & WORK HOURS REPORTS ================= */}
      {activeTab === 'attendance' && (
        <div className="space-y-6 animate-in fade-in duration-200">
          {/* Controls Bar */}
          <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-4 shadow-xl flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="relative w-full md:w-80">
              <FiSearch className="w-4 h-4 text-[#78726A] absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={attendanceSearch}
                onChange={e => setAttendanceSearch(e.target.value)}
                placeholder="Search by employee name or date..."
                className="w-full bg-[#141312] border border-[#332F2C] rounded-xl pl-9 pr-4 py-2 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
              />
            </div>

            <div className="flex items-center space-x-2 overflow-x-auto w-full md:w-auto">
              <span className="text-xs text-[#78726A] mr-1 shrink-0">Filter Dept:</span>
              {departments.map(d => (
                <button
                  key={d}
                  onClick={() => setAttendanceDeptFilter(d)}
                  className={`px-3 py-1 rounded-xl text-xs font-semibold transition-all shrink-0 ${
                    attendanceDeptFilter === d
                      ? 'bg-[#E07A5F] text-white shadow-md'
                      : 'bg-[#141312] text-[#A39C95] hover:text-[#E8E3DD] border border-[#332F2C]'
                  }`}
                >
                  {d}
                </button>
              ))}
            </div>
          </div>

          {/* Attendance Log Table */}
          <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl shadow-xl overflow-hidden">
            <div className="p-4 border-b border-[#292624] flex items-center justify-between">
              <div className="flex items-center space-x-2 text-[#F4A261]">
                <FiClock className="w-5 h-5" />
                <h3 className="font-crimson font-bold text-lg text-[#E8E3DD]">
                  Attendance & Work Hours Log — August 2026
                </h3>
              </div>
              <span className="text-xs text-[#A39C95] font-mono">
                Total Logs: {filteredAttendanceLogs.length}
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-carme">
                <thead className="bg-[#141312] border-b border-[#292624] text-[#78726A] uppercase text-[10px] font-mono font-bold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">Date</th>
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Check In</th>
                    <th className="py-3.5 px-4">Check Out</th>
                    <th className="py-3.5 px-4">Work Hours</th>
                    <th className="py-3.5 px-4">Extra Hours</th>
                    <th className="py-3.5 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#24211F]">
                  {filteredAttendanceLogs.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#78726A]">
                        No attendance log entries matched the search criteria.
                      </td>
                    </tr>
                  ) : (
                    filteredAttendanceLogs.map(log => {
                      const isPresent = log.status === 'Present';
                      const isOnLeave = log.status === 'Leave';


                      return (
                        <tr key={log.id} className="hover:bg-[#24211F] transition-colors">
                          <td className="py-3.5 px-4 font-mono text-[#A39C95]">{log.date}</td>
                          <td className="py-3.5 px-4 font-bold text-[#E8E3DD]">
                            <div>{log.employeeName}</div>
                            <div className="text-[10px] font-mono text-[#E07A5F]">{log.employeeId}</div>
                          </td>
                          <td className="py-3.5 px-4 font-mono text-[#709775]">{log.checkIn || '--:--'}</td>
                          <td className="py-3.5 px-4 font-mono text-[#F4A261]">{log.checkOut || '--:--'}</td>
                          <td className="py-3.5 px-4 font-mono font-bold text-[#E8E3DD]">{log.workHours || '8h 00m'}</td>
                          <td className="py-3.5 px-4 font-mono text-[#78726A]">{log.extraHours || '0h 00m'}</td>
                          <td className="py-3.5 px-4 text-right">
                            <span
                              className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                                isPresent
                                  ? 'bg-[#1C251F] text-[#709775] border border-[#709775]/40'
                                  : isOnLeave
                                  ? 'bg-[#292019] text-[#E07A5F] border border-[#E07A5F]/40'
                                  : 'bg-[#291B1B] text-[#E06C68] border border-[#E06C68]/40'
                              }`}
                            >
                              {isPresent ? (
                                <FiCheckCircle className="w-3 h-3" />
                              ) : isOnLeave ? (
                                <Plane className="w-3 h-3" />
                              ) : null}
                              <span>{log.status}</span>
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
        </div>
      )}

      {/* Salary Slip Modal */}
      {selectedEmpForSlip && selectedPayrollForSlip && (
        <SalarySlipModal
          isOpen={isSlipModalOpen}
          onClose={() => setIsSlipModalOpen(false)}
          payroll={selectedPayrollForSlip}
          employee={selectedEmpForSlip}
        />
      )}
    </div>
  );
};
