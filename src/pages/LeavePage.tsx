import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { LeaveRequest, AttendanceRecord, Employee } from '../types';
import { UserAvatar } from '../components/ui/UserAvatar';
import {
  FiPlus,
  FiSearch,
  FiX,
  FiCheck,
  FiUploadCloud,
  FiCalendar,
  FiChevronLeft,
  FiChevronRight,
  FiUserCheck,
  FiUserX,
  FiClock,
  FiTrash2,
} from 'react-icons/fi';

export const LeavePage: React.FC = () => {
  const { currentUser, role, refreshEmployees, allEmployees } = useAuth();
  const isHR = role === 'HR';

  const [activeTab, setActiveTab] = useState<'timeoff' | 'calendar'>('timeoff');
  const [leaveRequests, setLeaveRequests] = useState<LeaveRequest[]>([]);
  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Selected Day Detail Modal State for Calendar
  const [selectedDayDetail, setSelectedDayDetail] = useState<{
    dateStr: string;
    dayNum: number;
    leaves: { name: string; type: string; id: string }[];
    absents: Employee[];
    presents: AttendanceRecord[];
  } | null>(null);

  // Indian Calendar Month & Year State (Defaults to current year/month)
  const today = new Date();
  const [calendarYear, setCalendarYear] = useState(today.getFullYear());
  const [calendarMonth, setCalendarMonth] = useState(today.getMonth()); // 0-indexed

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Indian Public Holidays Map (Key: YYYY-MM-DD)
  const indianHolidays: Record<string, string> = {
    '2026-01-26': 'Republic Day',
    '2026-03-25': 'Holi',
    '2026-04-14': 'Ambedkar Jayanti',
    '2026-08-15': 'Independence Day',
    '2026-08-28': 'Raksha Bandhan',
    '2026-10-02': 'Gandhi Jayanti',
    '2026-10-20': 'Dussehra',
    '2026-11-08': 'Diwali',
    '2026-12-25': 'Christmas',
  };

  // Time off Request Form State
  const [selectedEmployee] = useState(currentUser?.name || 'Employee');
  const [timeOffType, setTimeOffType] = useState<'Paid time off' | 'Sick Leave' | 'Unpaid Leaves'>('Paid time off');
  const [startDate, setStartDate] = useState('2026-08-28');
  const [endDate, setEndDate] = useState('2026-08-28');
  const [attachment, setAttachment] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeavesAndAttendance = async () => {
    try {
      const [leaves, attendance] = await Promise.all([
        api.getLeaveRequests(isHR ? undefined : currentUser?.employeeId),
        api.getAttendanceRecords(isHR ? undefined : currentUser?.employeeId),
      ]);
      setLeaveRequests(leaves);
      setAttendanceRecords(attendance);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchLeavesAndAttendance();
  }, [currentUser, isHR]);

  const handleApprove = async (id: number) => {
    try {
      await api.updateLeaveStatus(id, 'Approved');
      await fetchLeavesAndAttendance();
      await refreshEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const handleReject = async (id: number) => {
    try {
      await api.updateLeaveStatus(id, 'Rejected');
      await fetchLeavesAndAttendance();
      await refreshEmployees();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDeleteLeave = async (id: number) => {
    if (!window.confirm('Are you sure you want to delete this leave request?')) return;
    try {
      await api.deleteLeaveRequest(id);
      await fetchLeavesAndAttendance();
      await refreshEmployees();
    } catch (err) {
      console.error('Failed to delete leave request', err);
    }
  };

  // Call Back Modal State & Handlers
  const [callbackModalReq, setCallbackModalReq] = useState<LeaveRequest | null>(null);
  const [callbackReason, setCallbackReason] = useState('');
  const [callbackDate, setCallbackDate] = useState('');

  const handleSendCallback = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!callbackModalReq) return;
    try {
      await api.callbackLeave(callbackModalReq.id, callbackReason, callbackDate);
      setCallbackModalReq(null);
      await fetchLeavesAndAttendance();
    } catch (err) {
      console.error('Failed to send callback request', err);
    }
  };

  const handleAcceptCallback = async (id: number) => {
    try {
      await api.respondCallback(id, 'accept');
      await fetchLeavesAndAttendance();
      await refreshEmployees();
    } catch (err) {
      console.error('Failed to accept callback', err);
    }
  };

  const handleDeclineCallback = async (id: number) => {
    try {
      await api.respondCallback(id, 'reject');
      await fetchLeavesAndAttendance();
      await refreshEmployees();
    } catch (err) {
      console.error('Failed to decline callback', err);
    }
  };

  const handleStartDateChange = (val: string) => {
    setStartDate(val);
    if (endDate < val) {
      setEndDate(val);
    }
  };

  const handleEndDateChange = (val: string) => {
    if (val < startDate) {
      setEndDate(startDate);
    } else {
      setEndDate(val);
    }
  };

  // Compute calculated allocation days
  const computeDays = () => {
    try {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end < start) return 1;
      const diffTime = Math.abs(end.getTime() - start.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      return isNaN(diffDays) ? 1 : diffDays;
    } catch {
      return 1;
    }
  };

  const calculatedDays = computeDays();

  const handleSubmitRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (startDate > endDate) {
      alert('Error: Start Date cannot be after End Date.');
      return;
    }

    setIsSubmitting(true);
    try {
      await api.submitLeaveRequest({
        employeeId: currentUser.employeeId,
        employeeName: currentUser.name,
        leaveType: timeOffType === 'Paid time off' ? 'Paid' : timeOffType === 'Sick Leave' ? 'Sick' : 'Unpaid',
        startDate,
        endDate,
        totalDays: calculatedDays,
        reason: `${timeOffType} Request`,
      });
      await fetchLeavesAndAttendance();
      setIsModalOpen(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredRequests = leaveRequests.filter(req => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return (
      req.employeeName.toLowerCase().includes(term) ||
      req.employeeId.toLowerCase().includes(term) ||
      req.leaveType.toLowerCase().includes(term)
    );
  });

  // Dynamic Paid & Sick Leave Balances
  const totalApprovedPaid = leaveRequests
    .filter(req => (!currentUser || req.employeeId === currentUser.employeeId) && req.leaveType === 'Paid' && req.status === 'Approved')
    .reduce((acc, req) => acc + req.totalDays, 0);

  const totalApprovedSick = leaveRequests
    .filter(req => (!currentUser || req.employeeId === currentUser.employeeId) && req.leaveType === 'Sick' && req.status === 'Approved')
    .reduce((acc, req) => acc + req.totalDays, 0);

  const paidLeaveAvailable = Math.max(0, (currentUser?.paidLeaveAvailable || 24) - totalApprovedPaid);
  const sickLeaveAvailable = Math.max(0, (currentUser?.sickLeaveAvailable || 12) - totalApprovedSick);
  const joiningDateStr = currentUser?.joiningDate || '2026-08-22';
  const userWorkingDays = currentUser?.workingDays || 5;

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto font-carme text-[#E8E3DD]">
      {/* URGENT HR CALL BACK NOTICE BANNER FOR EMPLOYEES */}
      {leaveRequests
        .filter(r => r.callbackStatus === 'Pending' && (r.employeeId === currentUser?.employeeId || isHR))
        .map(req => (
          <div key={`callback-notice-${req.id}`} className="p-5 rounded-2xl bg-[#291B1B] border-2 border-[#E06C68] shadow-2xl space-y-3 font-carme animate-in slide-in-from-top-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
              <div className="flex items-center space-x-2 text-[#E06C68] font-bold">
                <span className="text-xl emoji-white">⚠️</span>
                <h4 className="text-base">URGENT: Time Off Call Back Notice from HR Operations</h4>
              </div>
              <span className="px-2.5 py-0.5 rounded-full bg-[#E06C68] text-white font-mono text-[10px] font-bold tracking-wider uppercase animate-pulse">
                Action Required
              </span>
            </div>

            <p className="text-xs text-[#E8E3DD] leading-relaxed">
              HR Operations has issued an urgent Call Back for <strong>{req.employeeName}</strong> ({req.leaveType} Leave) starting on <strong className="text-[#F4A261] font-mono">{req.callbackEffectiveDate}</strong>.
            </p>

            <div className="bg-[#1C1A19] p-3 rounded-xl border border-[#E06C68]/40 text-xs font-mono text-[#A39C95]">
              <strong className="text-[#E8E3DD]">HR Recall Reason:</strong> {req.callbackReason || 'Urgent company operational requirement'}
            </div>

            {(!isHR || req.employeeId === currentUser?.employeeId) && (
              <div className="flex items-center space-x-3 pt-1">
                <button
                  onClick={() => handleAcceptCallback(req.id)}
                  className="px-5 py-2 rounded-xl bg-[#709775] text-white font-bold text-xs hover:bg-[#5C8260] transition-all shadow-lg flex items-center space-x-1.5 cursor-pointer"
                >
                  <FiCheck className="w-4 h-4" />
                  <span>Accept Call Back (Truncate & Restore Leave Days)</span>
                </button>
                <button
                  onClick={() => handleDeclineCallback(req.id)}
                  className="px-5 py-2 rounded-xl bg-[#2B2825] text-[#E06C68] border border-[#E06C68]/40 hover:bg-[#E06C68] hover:text-white transition-all font-bold text-xs flex items-center space-x-1.5 cursor-pointer"
                >
                  <FiX className="w-4 h-4" />
                  <span>Decline Call Back</span>
                </button>
              </div>
            )}
          </div>
        ))}

      {/* 1. HEADER & SUB-NAVIGATION BAR */}
      <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            {/* Sub-Nav Tabs: Time Off | Calendar */}
            <div className="flex items-center p-1 bg-[#141312] border border-[#332F2C] rounded-xl text-xs font-bold">
              <button
                onClick={() => setActiveTab('timeoff')}
                className={`px-4 py-2 rounded-lg transition-all ${
                  activeTab === 'timeoff'
                    ? 'bg-[#E07A5F] text-white shadow-sm'
                    : 'text-[#A39C95] hover:text-[#E8E3DD]'
                }`}
              >
                Time Off
              </button>
              <button
                onClick={() => setActiveTab('calendar')}
                className={`px-4 py-2 rounded-lg transition-all flex items-center space-x-1.5 ${
                  activeTab === 'calendar'
                    ? 'bg-[#E07A5F] text-white shadow-sm'
                    : 'text-[#A39C95] hover:text-[#E8E3DD]'
                }`}
              >
                <FiCalendar className="w-3.5 h-3.5" />
                <span>Calendar</span>
              </button>
            </div>

            {/* NEW Request Button */}
            <button
              onClick={() => setIsModalOpen(true)}
              className="px-4 py-2 rounded-xl bg-[#9333EA] text-white text-xs font-bold hover:bg-[#7E22CE] transition-colors flex items-center space-x-1.5 shadow-md uppercase tracking-wider"
            >
              <FiPlus className="w-4 h-4" />
              <span>NEW</span>
            </button>
          </div>

          {/* Searchbar */}
          <div className="relative w-full md:w-72">
            <FiSearch className="w-4 h-4 text-[#78726A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Searchbar (employee or type)..."
              className="w-full bg-[#141312] border border-[#332F2C] rounded-xl pl-9 pr-4 py-2 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
            />
          </div>
        </div>
      </div>

      {/* 2. BALANCES CARDS HEADER */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-1">
          <span className="text-xs text-[#709775] font-bold uppercase tracking-wider">
            Paid time off
          </span>
          <div className="font-mono text-3xl font-extrabold text-[#709775]">
            {paidLeaveAvailable < 10 ? `0${paidLeaveAvailable}` : paidLeaveAvailable} Days Available
          </div>
          <span className="text-[11px] text-[#A39C95] block">Annual paid leave quota</span>
        </div>

        <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-1">
          <span className="text-xs text-[#E07A5F] font-bold uppercase tracking-wider">
            Sick time off
          </span>
          <div className="font-mono text-3xl font-extrabold text-[#E07A5F]">
            {sickLeaveAvailable < 10 ? `0${sickLeaveAvailable}` : sickLeaveAvailable} Days Available
          </div>
          <span className="text-[11px] text-[#A39C95] block">Medical & health quota</span>
        </div>
      </div>

      {/* 3. TAB CONTENTS */}
      {activeTab === 'timeoff' && (
        isHR ? (
          /* For Admin & HR Officer Table View */
          <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-4">
            <h3 className="font-crimson font-bold text-xl text-[#E8E3DD]">
              Time Off Requests Directory (Admin / HR View)
            </h3>

            <div className="overflow-x-auto border border-[#2B2825] rounded-xl shadow-inner">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#181716] border-b border-[#292624] text-[#78726A] font-semibold text-[10px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Employee</th>
                    <th className="py-3.5 px-4">Time Off Type</th>
                    <th className="py-3.5 px-4">Start Date</th>
                    <th className="py-3.5 px-4">End Date</th>
                    <th className="py-3.5 px-4">Duration</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B2825]">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={7} className="py-8 text-center text-[#A39C95]">
                        No time off requests submitted yet.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map(req => (
                      <tr key={req.id} className="hover:bg-[#24211F] transition-colors">
                        <td className="py-3.5 px-4">
                          <div className="flex items-center space-x-3">
                            <UserAvatar name={req.employeeName} size="w-8 h-8" />
                            <div>
                              <span className="font-bold text-[#E8E3DD] block">{req.employeeName}</span>
                              <span className="text-[10px] font-mono text-[#E07A5F]">{req.employeeId}</span>
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 font-bold text-[#E07A5F]">{req.leaveType} Time Off</td>
                        <td className="py-3.5 px-4 font-mono text-[#E8E3DD]">{req.startDate}</td>
                        <td className="py-3.5 px-4 font-mono text-[#E8E3DD]">{req.endDate}</td>
                        <td className="py-3.5 px-4 font-mono text-[#709775]">{req.totalDays}.00 Days</td>
                        <td className="py-3.5 px-4">
                          {req.status === 'Approved' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#1C251F] text-[#709775] border border-[#709775]/40 font-bold text-[11px]">
                              Approved
                            </span>
                          ) : req.status === 'Rejected' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#291B1B] text-[#E06C68] border border-[#E06C68]/40 font-bold text-[11px]">
                              Rejected
                            </span>
                          ) : req.status === 'Callback Pending' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#291B1B] text-[#E06C68] border border-[#E06C68]/40 font-bold text-[11px] animate-pulse">
                              Callback Sent ({req.callbackStatus || 'Pending'})
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#25221C] text-[#F4A261] border border-[#F4A261]/40 font-bold text-[11px]">
                              Pending
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            {req.status === 'Pending' ? (
                              <>
                                <button
                                  onClick={() => handleApprove(req.id)}
                                  className="p-1.5 rounded-lg bg-[#1C251F] text-[#709775] hover:bg-[#709775] hover:text-white transition-colors border border-[#709775]/40 cursor-pointer"
                                  title="Approve Leave"
                                >
                                  <FiCheck className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleReject(req.id)}
                                  className="p-1.5 rounded-lg bg-[#291B1B] text-[#E06C68] hover:bg-[#E06C68] hover:text-white transition-colors border border-[#E06C68]/40 cursor-pointer"
                                  title="Reject Leave"
                                >
                                  <FiX className="w-4 h-4" />
                                </button>
                              </>
                            ) : req.status === 'Approved' ? (
                              <button
                                onClick={() => {
                                  setCallbackModalReq(req);
                                  setCallbackReason('');
                                  setCallbackDate(req.startDate);
                                }}
                                className="px-2.5 py-1 rounded-lg bg-[#291B1B] text-[#E06C68] hover:bg-[#E06C68] hover:text-white transition-colors border border-[#E06C68]/40 font-mono text-[11px] font-bold flex items-center space-x-1 shadow-xs cursor-pointer"
                                title="Call Back Employee from Leave"
                              >
                                <span><span className="emoji-white">📞</span> Call Back</span>
                              </button>
                            ) : req.status === 'Callback Pending' ? (
                              <button
                                onClick={() => {
                                  setCallbackModalReq(req);
                                  setCallbackReason(req.callbackReason || '');
                                  setCallbackDate(req.callbackEffectiveDate || req.startDate);
                                }}
                                className="px-2 py-1 rounded-lg bg-[#25221C] text-[#F4A261] hover:bg-[#F4A261] hover:text-black transition-colors border border-[#F4A261]/40 font-mono text-[10px] font-bold cursor-pointer"
                              >
                                Edit Callback
                              </button>
                            ) : null}

                            <button
                              onClick={() => handleDeleteLeave(req.id)}
                              className="p-1.5 rounded-lg bg-[#291B1B] text-[#E06C68] hover:bg-[#E06C68] hover:text-white transition-colors border border-[#E06C68]/40 cursor-pointer"
                              title="Delete Leave Request"
                            >
                              <FiTrash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* For Employee Table View */
          <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between">
              <h3 className="font-crimson font-bold text-xl text-[#E8E3DD]">
                My Time Off History
              </h3>
              <div className="flex items-center space-x-4 text-xs">
                <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#709775]" /><span>Validated (Approved)</span></span>
                <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#F4A261]" /><span>To Approve (Pending)</span></span>
                <span className="flex items-center space-x-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#E06C68]" /><span>Refused (Rejected)</span></span>
              </div>
            </div>

            <div className="overflow-x-auto border border-[#2B2825] rounded-xl shadow-inner">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-[#181716] border-b border-[#292624] text-[#78726A] font-semibold text-[10px] uppercase tracking-wider">
                    <th className="py-3.5 px-4">Start Date</th>
                    <th className="py-3.5 px-4">End Date</th>
                    <th className="py-3.5 px-4">Time off Type</th>
                    <th className="py-3.5 px-4">Allocation Days</th>
                    <th className="py-3.5 px-4">Status</th>
                    <th className="py-3.5 px-4 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#2B2825]">
                  {filteredRequests.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-[#A39C95]">
                        No time off records submitted yet.
                      </td>
                    </tr>
                  ) : (
                    filteredRequests.map(req => (
                      <tr key={req.id} className="hover:bg-[#24211F] transition-colors">
                        <td className="py-3.5 px-4 font-mono text-[#E8E3DD]">{req.startDate}</td>
                        <td className="py-3.5 px-4 font-mono text-[#E8E3DD]">{req.endDate}</td>
                        <td className="py-3.5 px-4 font-bold text-[#E07A5F]">{req.leaveType}</td>
                        <td className="py-3.5 px-4 font-mono text-[#709775]">{req.totalDays}.00 Days</td>
                        <td className="py-3.5 px-4">
                          {req.status === 'Approved' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#1C251F] text-[#709775] border border-[#709775]/40 font-bold text-[11px]">
                              Validated
                            </span>
                          ) : req.status === 'Rejected' ? (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#291B1B] text-[#E06C68] border border-[#E06C68]/40 font-bold text-[11px]">
                              Refused
                            </span>
                          ) : (
                            <span className="px-2.5 py-0.5 rounded-full bg-[#25221C] text-[#F4A261] border border-[#F4A261]/40 font-bold text-[11px]">
                              To Approve
                            </span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <button
                            onClick={() => handleDeleteLeave(req.id)}
                            className="p-1.5 rounded-lg bg-[#291B1B] text-[#E06C68] hover:bg-[#E06C68] hover:text-white transition-colors border border-[#E06C68]/40 inline-flex items-center space-x-1 cursor-pointer"
                            title="Delete Request"
                          >
                            <FiTrash2 className="w-3.5 h-3.5" />
                            <span className="text-[10px] font-mono font-bold">Delete</span>
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )
      )}

      {/* ================= B. INDIAN CALENDAR VIEW TAB (WHITE THEME & DYNAMIC ABSENT/LEAVE LIST) ================= */}
      {activeTab === 'calendar' && (
        <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
          {/* Calendar Header with Navigation */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-200 pb-4">
            <div>
              <h3 className="font-crimson font-bold text-2xl text-slate-900">
                India Employee Time Off & Attendance Calendar
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Day-by-day roster breakdown ({userWorkingDays} Working Days Configured). Click any date to view present, absent, and leave takers.
              </p>
            </div>

            {/* Month Selector Controls */}
            <div className="flex items-center space-x-3 bg-slate-100 border border-slate-300 p-1.5 rounded-xl font-mono text-xs text-slate-800">
              <button
                onClick={() => {
                  if (calendarMonth === 0) {
                    setCalendarMonth(11);
                    setCalendarYear(y => y - 1);
                  } else {
                    setCalendarMonth(m => m - 1);
                  }
                }}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 font-bold transition-colors"
                title="Previous Month"
              >
                <FiChevronLeft className="w-4 h-4" />
              </button>
              <span className="font-bold text-slate-900 px-2 min-w-[130px] text-center">
                {monthNames[calendarMonth]} {calendarYear}
              </span>
              <button
                onClick={() => {
                  if (calendarMonth === 11) {
                    setCalendarMonth(0);
                    setCalendarYear(y => y + 1);
                  } else {
                    setCalendarMonth(m => m + 1);
                  }
                }}
                className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 hover:bg-slate-200 font-bold transition-colors"
                title="Next Month"
              >
                <FiChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Legend Bar */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono bg-slate-50 border border-slate-200 p-3 rounded-xl">
            <span className="text-slate-700 font-sans font-bold">Status Legend:</span>
            <span className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded-full bg-emerald-500" /><span className="text-slate-800 font-semibold">Present</span></span>
            <span className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded-full bg-amber-500" /><span className="text-slate-800 font-semibold">Absent</span></span>
            <span className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded-full bg-rose-500" /><span className="text-slate-800 font-semibold">Paid Leave</span></span>
            <span className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded-full bg-purple-500" /><span className="text-slate-800 font-semibold">Sick Leave</span></span>
            <span className="flex items-center space-x-1.5"><span className="w-3 h-3 rounded-full bg-slate-400" /><span className="text-slate-800 font-semibold">Closed / Holiday</span></span>
          </div>

          {/* Calendar Grid Table */}
          <div className="border border-slate-200 rounded-xl overflow-hidden shadow-sm">
            {/* Days of Week Header (Mon to Sun - Indian Workweek format) */}
            <div className="grid grid-cols-7 bg-slate-100 border-b border-slate-200 text-center font-mono font-bold text-xs text-slate-700 py-3">
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span className={userWorkingDays <= 5 ? "text-rose-600 font-bold" : "text-emerald-700 font-bold"}>
                Sat {userWorkingDays >= 6 ? '(Work)' : ''}
              </span>
              <span className="text-rose-600 font-bold">Sun</span>
            </div>

            {/* Month Days Grid */}
            <div className="grid grid-cols-7 divide-x divide-y divide-slate-200 bg-white">
              {/* Render Padding empty cells for first day offset */}
              {Array.from({ length: (new Date(calendarYear, calendarMonth, 1).getDay() + 6) % 7 }).map((_, idx) => (
                <div key={`empty-${idx}`} className="h-32 bg-slate-50/50 p-2 opacity-30" />
              ))}

              {/* Render Days 1..DaysInMonth */}
              {Array.from({ length: new Date(calendarYear, calendarMonth + 1, 0).getDate() }).map((_, idx) => {
                const dayNum = idx + 1;
                const dateStr = `${calendarYear}-${(calendarMonth + 1).toString().padStart(2, '0')}-${dayNum.toString().padStart(2, '0')}`;
                const dayDate = new Date(calendarYear, calendarMonth, dayNum);

                // DYNAMIC SATURDAY RULE: Closed ONLY IF workingDays <= 5! If workingDays >= 6, Saturday is NOT closed!
                const isWeekend = dayDate.getDay() === 0 || (dayDate.getDay() === 6 && userWorkingDays <= 5);
                const holidayName = indianHolidays[dateStr];
                const isToday = dateStr === todayStr;
                const isPastOrToday = dateStr <= todayStr;
                const isBeforeJoining = dateStr < joiningDateStr;

                // 1. Employee leave requests covering this date (all intermediate days between startDate & endDate inclusive)
                const dayLeaveRequests = leaveRequests.filter(req => {
                  const s = (req.startDate || '').split('T')[0];
                  const e = (req.endDate || '').split('T')[0];
                  return dateStr >= s && dateStr <= e && (req.status === 'Approved' || req.status === 'Pending');
                });
                const leaveMatch = isHR
                  ? dayLeaveRequests[0]
                  : dayLeaveRequests.find(req => req.employeeId === currentUser?.employeeId);

                // 2. Attendance records for this date
                const dayAttendance = attendanceRecords.filter(a => a.date === dateStr && a.status === 'Present');
                const attMatch = dayAttendance.find(a => !currentUser || a.employeeId === currentUser.employeeId);

                const presentEmpIds = new Set(dayAttendance.map(a => a.employeeId));
                const leaveEmpIds = new Set(dayLeaveRequests.map(r => r.employeeId));

                // 3. Compute exact list of employee absentees for this date
                const dayAbsentees = (isPastOrToday && !isWeekend && !holidayName)
                  ? allEmployees.filter(e => {
                      const joined = e.joiningDate || '2026-08-22';
                      return dateStr >= joined && !presentEmpIds.has(e.employeeId) && !leaveEmpIds.has(e.employeeId);
                    })
                  : [];

                // Determine Main Status Badge for current user / overall
                let statusBg = '';
                let badgeText = '';

                if (leaveMatch) {
                  if (leaveMatch.status === 'Pending') {
                    statusBg = 'bg-[#25221C] text-[#F4A261] border-[#F4A261]/40';
                    badgeText = 'Leave Pending';
                  } else if (leaveMatch.leaveType === 'Sick') {
                    statusBg = 'bg-purple-100 text-purple-800 border-purple-300';
                    badgeText = 'Sick Leave';
                  } else {
                    statusBg = 'bg-rose-100 text-rose-800 border-rose-300';
                    badgeText = 'Paid Leave';
                  }
                } else if (holidayName) {
                  statusBg = 'bg-amber-100 text-amber-800 border-amber-300';
                  badgeText = holidayName;
                } else if (isWeekend) {
                  statusBg = 'bg-slate-100 text-slate-500 border-slate-300';
                  badgeText = 'Closed (Weekend)';
                } else if (attMatch && attMatch.status === 'Present') {
                  statusBg = 'bg-emerald-100 text-emerald-800 border-emerald-300';
                  badgeText = 'Present';
                } else if (isBeforeJoining) {
                  statusBg = 'bg-slate-50 text-slate-400 border-slate-200';
                  badgeText = 'Not Joined Yet';
                } else if (isPastOrToday) {
                  statusBg = 'bg-amber-100 text-amber-800 border-amber-300';
                  badgeText = 'Absent';
                } else {
                  statusBg = 'bg-slate-50 text-slate-600 border-slate-200';
                  badgeText = 'Working Day';
                }

                return (
                  <div
                    key={dateStr}
                    onClick={() => {
                      setSelectedDayDetail({
                        dateStr,
                        dayNum,
                        leaves: dayLeaveRequests.map(r => ({ name: r.employeeName, type: r.leaveType, id: r.employeeId })),
                        absents: dayAbsentees,
                        presents: dayAttendance,
                      });
                    }}
                    className={`h-32 p-2 flex flex-col justify-between transition-colors cursor-pointer ${
                      isToday
                        ? 'bg-indigo-50/40 ring-2 ring-indigo-500 z-10'
                        : isWeekend
                        ? 'bg-slate-50/80'
                        : 'bg-white hover:bg-slate-100/80'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`font-mono text-xs font-bold ${isWeekend ? 'text-rose-600' : 'text-slate-800'}`}>
                        {dayNum}
                      </span>
                      {isToday && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-indigo-600 text-white font-mono font-bold">
                          Today
                        </span>
                      )}
                    </div>

                    <div className="space-y-1 my-1">
                      <span className={`block w-full px-1.5 py-0.5 rounded-lg border text-[10px] font-mono font-bold truncate text-center shadow-xs ${statusBg}`}>
                        {badgeText}
                      </span>

                      {/* Display Absentees / Leave Takers Summary Tags for this date */}
                      <div className="space-y-0.5 text-[9px] font-mono">
                        {dayLeaveRequests.length > 0 && (
                          <span className="block px-1 rounded bg-rose-50 text-rose-700 font-bold border border-rose-200 truncate" title={dayLeaveRequests.map(r => r.employeeName).join(', ')}>
                            🔴 {dayLeaveRequests.length} On Leave ({dayLeaveRequests[0].employeeName.split(' ')[0]})
                          </span>
                        )}
                        {!isWeekend && !holidayName && dayAbsentees.length > 0 && (
                          <span className="block px-1 rounded bg-amber-50 text-amber-700 font-bold border border-amber-200 truncate" title={dayAbsentees.map(a => a.name).join(', ')}>
                            🟠 {dayAbsentees.length} Absent ({dayAbsentees[0].name.split(' ')[0]})
                          </span>
                        )}
                      </div>
                    </div>

                    <span className="text-[9px] text-slate-400 font-mono text-right block hover:underline">
                      View details →
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ================= C. DAY ATTENDANCE & LEAVE ROSTER MODAL ================= */}
      {selectedDayDetail && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white border border-slate-200 text-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 font-carme">
            <div className="flex items-center justify-between border-b border-slate-200 pb-3">
              <div>
                <h3 className="font-crimson font-bold text-xl text-slate-900">
                  Roster Breakdown ({selectedDayDetail.dateStr})
                </h3>
                <p className="text-xs text-slate-500">
                  Full list of employees present, on leave, or absent on this date.
                </p>
              </div>
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs max-h-[60vh] overflow-y-auto">
              {/* 1. On Leave Section */}
              <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-rose-800 text-sm">
                  <FiClock className="w-4 h-4" />
                  <span>Employees On Leave ({selectedDayDetail.leaves.length})</span>
                </div>
                {selectedDayDetail.leaves.length === 0 ? (
                  <p className="text-rose-600 text-xs italic">No employees on leave for this date.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedDayDetail.leaves.map((l, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-2 rounded-lg border border-rose-200">
                        <span className="font-bold text-slate-800">{l.name}</span>
                        <span className="px-2 py-0.5 rounded bg-rose-100 text-rose-700 font-mono text-[10px] font-bold">
                          {l.type} Leave
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 2. Absent Section */}
              <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-amber-800 text-sm">
                  <FiUserX className="w-4 h-4" />
                  <span>Employees Absent ({selectedDayDetail.absents.length})</span>
                </div>
                {selectedDayDetail.absents.length === 0 ? (
                  <p className="text-amber-600 text-xs italic">No employees absent on this date.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2">
                    {selectedDayDetail.absents.map((a, i) => (
                      <div key={i} className="flex items-center space-x-2 bg-white p-2 rounded-lg border border-amber-200">
                        <UserAvatar name={a.name} src={a.avatarUrl} size="w-6 h-6" />
                        <span className="font-bold text-slate-800 truncate">{a.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* 3. Present Section */}
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 space-y-2">
                <div className="flex items-center space-x-2 font-bold text-emerald-800 text-sm">
                  <FiUserCheck className="w-4 h-4" />
                  <span>Employees Present ({selectedDayDetail.presents.length})</span>
                </div>
                {selectedDayDetail.presents.length === 0 ? (
                  <p className="text-emerald-600 text-xs italic">No check-in records logged for this date.</p>
                ) : (
                  <div className="space-y-1.5">
                    {selectedDayDetail.presents.map((p, i) => (
                      <div key={i} className="flex justify-between items-center bg-white p-2 rounded-lg border border-emerald-200">
                        <span className="font-bold text-slate-800">{p.employeeName}</span>
                        <span className="font-mono text-emerald-700 text-[10px]">
                          In: {p.checkIn} | Out: {p.checkOut}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-200">
              <button
                onClick={() => setSelectedDayDetail(null)}
                className="px-5 py-2 rounded-xl bg-slate-900 text-white font-bold text-xs hover:bg-slate-800"
              >
                Close Breakdown
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 4. TIME OFF TYPE REQUEST MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#292624] pb-4">
              <h3 className="font-crimson font-bold text-xl text-[#E8E3DD]">
                Time off Type Request
              </h3>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-[#A39C95] hover:text-[#E8E3DD] hover:bg-[#24211F]"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmitRequest} className="space-y-4 text-xs font-mono">
              <div className="space-y-1">
                <label className="text-[#78726A] text-[11px] block font-semibold font-sans">Employee</label>
                <input
                  type="text"
                  value={selectedEmployee}
                  disabled
                  className="w-full bg-[#141312] border border-[#332F2C] rounded-xl px-3 py-2 text-[#E8E3DD] opacity-70"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#78726A] text-[11px] block font-semibold font-sans">Time off Type</label>
                <select
                  value={timeOffType}
                  onChange={e => setTimeOffType(e.target.value as any)}
                  className="w-full bg-[#141312] border border-[#332F2C] rounded-xl px-3 py-2 text-[#E07A5F] font-bold focus:outline-none focus:border-[#E07A5F]"
                >
                  <option value="Paid time off">Paid time off</option>
                  <option value="Sick Leave">Sick Leave</option>
                  <option value="Unpaid Leaves">Unpaid Leaves</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[#78726A] text-[11px] block font-semibold font-sans">Start Date</label>
                  <input
                    type="date"
                    value={startDate}
                    onChange={e => handleStartDateChange(e.target.value)}
                    className="w-full bg-[#141312] border border-[#332F2C] rounded-xl px-3 py-2 text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#78726A] text-[11px] block font-semibold font-sans">End Date</label>
                  <input
                    type="date"
                    value={endDate}
                    min={startDate}
                    onChange={e => handleEndDateChange(e.target.value)}
                    className="w-full bg-[#141312] border border-[#332F2C] rounded-xl px-3 py-2 text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F]"
                    required
                  />
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#141312] border border-[#2B2825] flex justify-between items-center text-xs">
                <span className="text-[#A39C95] font-sans">Calculated Duration:</span>
                <span className="font-mono font-bold text-[#709775] text-sm">{calculatedDays}.00 Days</span>
              </div>

              <div className="space-y-1">
                <label className="text-[#78726A] text-[11px] block font-semibold font-sans">Attach Supporting Document (Optional)</label>
                <div className="border-2 border-dashed border-[#332F2C] rounded-xl p-4 text-center hover:border-[#E07A5F] transition-colors cursor-pointer relative bg-[#141312]">
                  <FiUploadCloud className="w-6 h-6 text-[#E07A5F] mx-auto mb-1" />
                  <span className="text-xs text-[#A39C95] block">
                    {attachment ? attachment.name : 'Click to browse or drag file here'}
                  </span>
                  <input
                    type="file"
                    onChange={e => setAttachment(e.target.files ? e.target.files[0] : null)}
                    className="absolute inset-0 opacity-0 cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#292624] font-sans">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl bg-[#24211F] text-[#E8E3DD] font-bold text-xs hover:bg-[#332F2C]"
                >
                  Discard
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-[#9333EA] text-white font-bold text-xs hover:bg-[#7E22CE] transition-colors shadow-lg disabled:opacity-50"
                >
                  {isSubmitting ? 'Submitting...' : 'Save & Submit Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ================= D. HR CALL BACK EMPLOYEE MODAL ================= */}
      {callbackModalReq && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1A19] border border-[#332F2C] text-[#E8E3DD] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 font-carme">
            <div className="flex items-center justify-between border-b border-[#292624] pb-3">
              <div>
                <h3 className="font-crimson font-bold text-xl text-[#E06C68]">
                  <span className="emoji-white">📞</span> Call Back Employee from Leave
                </h3>
                <p className="text-xs text-[#78726A] mt-0.5 font-mono">
                  {callbackModalReq.employeeName} ({callbackModalReq.leaveType} Leave)
                </p>
              </div>
              <button
                onClick={() => setCallbackModalReq(null)}
                className="p-1 rounded-lg text-[#78726A] hover:text-white hover:bg-[#292624]"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSendCallback} className="space-y-4 font-mono text-xs">
              <div className="space-y-1">
                <label className="text-[#78726A] block font-sans font-semibold">Callback Effective Date</label>
                <input
                  type="date"
                  value={callbackDate}
                  onChange={e => setCallbackDate(e.target.value)}
                  min={callbackModalReq.startDate}
                  max={callbackModalReq.endDate}
                  className="w-full bg-[#141312] border border-[#332F2C] rounded-xl px-3 py-2 text-[#E8E3DD] focus:outline-none focus:border-[#E06C68]"
                  required
                />
                <span className="text-[10px] text-[#A39C95] font-sans block">
                  Original Leave Range: {callbackModalReq.startDate} to {callbackModalReq.endDate}
                </span>
              </div>

              <div className="space-y-1">
                <label className="text-[#78726A] block font-sans font-semibold">Mandatory Reason for Call Back</label>
                <textarea
                  value={callbackReason}
                  onChange={e => setCallbackReason(e.target.value)}
                  placeholder="e.g. Critical production deployment requires immediate engineering presence..."
                  rows={3}
                  className="w-full bg-[#141312] border border-[#332F2C] rounded-xl p-3 text-[#E8E3DD] focus:outline-none focus:border-[#E06C68] resize-none"
                  required
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3 font-sans">
                <button
                  type="button"
                  onClick={() => setCallbackModalReq(null)}
                  className="px-4 py-2 rounded-xl border border-[#332F2C] text-[#A39C95] hover:text-white font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-[#E06C68] text-white font-bold hover:bg-[#C0504D] transition-colors shadow-lg flex items-center space-x-1.5"
                >
                  <span>Send Call Back & Email Notice</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
