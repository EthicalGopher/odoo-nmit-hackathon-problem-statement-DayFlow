import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { UserAvatar } from '../components/ui/UserAvatar';
import { PrivateChatDrawer } from '../components/ui/PrivateChatDrawer';
import { api } from '../api/client';
import type { Employee, Payroll } from '../types';
import { Plane } from 'lucide-react';
import {
  FiSearch,
  FiMail,
  FiPhone,
  FiPlus,
  FiX,
  FiCheckCircle,
  FiBriefcase,
  FiUser,
  FiDollarSign,
  FiShield,
  FiTrash2,
  FiMessageSquare,
} from 'react-icons/fi';


export const EmployeesPage: React.FC = () => {
  const { currentUser, allEmployees, role, refreshEmployees } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [departmentFilter, setDepartmentFilter] = useState('All');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [viewOnlyEmployee, setViewOnlyEmployee] = useState<Employee | null>(null);
  const [_viewOnlyPayroll, setViewOnlyPayroll] = useState<Payroll | null>(null);
  const [viewOnlyTab, setViewOnlyTab] = useState<'resume' | 'private' | 'salary' | 'security'>('resume');

  // Editable Salary State inside inspection modal
  const [modalMonthWage, setModalMonthWage] = useState<number>(75000);
  const [modalWorkingDays, setModalWorkingDays] = useState<number>(5);
  const [modalBreakTime, setModalBreakTime] = useState<number>(1);
  const [modalBasicSalary, setModalBasicSalary] = useState<number>(37500);
  const [modalHra, setModalHra] = useState<number>(18750);
  const [modalStandardAllowance, setModalStandardAllowance] = useState<number>(4167);
  const [modalPerformanceBonus, setModalPerformanceBonus] = useState<number>(3127.5);
  const [modalLta, setModalLta] = useState<number>(3127.5);
  const [modalSalarySaved, setModalSalarySaved] = useState(false);
  const [isSavingModalSalary, setIsSavingModalSalary] = useState(false);

  // Fire / Terminate Employee Modal State
  const [fireModalEmp, setFireModalEmp] = useState<Employee | null>(null);
  const [fireReason, setFireReason] = useState('');
  const [isFiring, setIsFiring] = useState(false);

  // Add Employee Form State
  const [newName, setNewName] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newDept, setNewDept] = useState('Engineering');
  const [newJob, setNewJob] = useState('Software Engineer');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdResult, setCreatedResult] = useState<{ loginId: string; pass: string } | null>(null);

  // Private Chat Drawer State
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatTargetEmp, setChatTargetEmp] = useState<Employee | null>(null);
  const [totalUnreadCount, setTotalUnreadCount] = useState(0);

  React.useEffect(() => {
    const checkUnread = async () => {
      if (!currentUser) return;
      try {
        const res = await api.getUnreadMessageCounts();
        setTotalUnreadCount(res.totalUnread || 0);
      } catch (err) {
        console.error(err);
      }
    };
    checkUnread();
    const interval = setInterval(checkUnread, 3000);
    return () => clearInterval(interval);
  }, [currentUser]);

  const openChatWith = (emp?: Employee | null) => {
    if (emp) setChatTargetEmp(emp);
    setIsChatOpen(true);
  };

  const departments = ['All', 'People & Culture', 'Engineering', 'Design', 'Product'];


  const isHR = role === 'HR';

  // Compute live Login ID preview for HR creation
  const computeLiveLoginID = (name: string) => {
    const compPrefix = 'OI'; // Odoo India
    const parts = name.trim().split(/\s+/).filter(Boolean);
    let nameCode = 'JODO';
    if (parts.length >= 2) {
      const f = parts[0].replace(/[^a-zA-Z]/g, '').toUpperCase();
      const l = parts[parts.length - 1].replace(/[^a-zA-Z]/g, '').toUpperCase();
      const fCode = f.length >= 2 ? f.slice(0, 2) : f;
      const lCode = l.length >= 2 ? l.slice(0, 2) : l;
      nameCode = (fCode + lCode).padEnd(4, 'X').slice(0, 4);
    } else if (parts.length === 1) {
      const clean = parts[0].replace(/[^a-zA-Z]/g, '').toUpperCase();
      nameCode = clean.length >= 4 ? clean.slice(0, 4) : clean.padEnd(4, 'X').slice(0, 4);
    }
    const year = new Date().getFullYear().toString();
    const serial = (allEmployees.length + 1).toString().padStart(4, '0');
    return `${compPrefix}${nameCode}${year}${serial}`;
  };

  const previewID = computeLiveLoginID(newName);

  const handleCreateEmployee = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newEmail) return;

    setIsSubmitting(true);
    try {
      const res = await api.createEmployee({
        name: newName,
        email: newEmail,
        phone: newPhone,
        department: newDept,
        jobTitle: newJob,
      });

      await refreshEmployees();
      setCreatedResult({
        loginId: res.generatedLoginId || res.employee.employeeId,
        pass: res.initialPassword || 'Dayflow#2026',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardClick = async (emp: Employee) => {
    setViewOnlyEmployee(emp);
    setViewOnlyTab('resume');
    setModalSalarySaved(false);
    try {
      const pData = await api.getPayroll(emp.employeeId);
      const pr = Array.isArray(pData) ? pData[0] : pData;
      setViewOnlyPayroll(pr);
      if (pr && pr.monthWage) {
        const mw = pr.monthWage;
        setModalMonthWage(mw);
        setModalBasicSalary(pr.basicSalary || mw * 0.50);
        setModalHra(pr.hra || mw * 0.25);
        setModalStandardAllowance(pr.standardAllowance || 4167);
        setModalPerformanceBonus(pr.performanceBonus || mw * 0.0417);
        setModalLta(pr.leaveTravelAllowance || mw * 0.0417);
      } else {
        setModalMonthWage(75000);
        setModalBasicSalary(37500);
        setModalHra(18750);
        setModalStandardAllowance(4167);
        setModalPerformanceBonus(3127.5);
        setModalLta(3127.5);
      }
    } catch {
      setViewOnlyPayroll(null);
      setModalMonthWage(75000);
      setModalBasicSalary(37500);
      setModalHra(18750);
      setModalStandardAllowance(4167);
      setModalPerformanceBonus(3127.5);
      setModalLta(3127.5);
    }
  };

  const handleModalMonthWageChange = (newWage: number) => {
    setModalMonthWage(newWage);
    const basic = newWage * 0.50;
    setModalBasicSalary(basic);
    setModalHra(basic * 0.50);
    setModalStandardAllowance(4167);
    setModalPerformanceBonus(Math.round(basic * 0.0833));
    setModalLta(Math.round(basic * 0.0833));
  };

  const handleSaveModalSalaryDetails = async () => {
    if (!viewOnlyEmployee) return;
    setIsSavingModalSalary(true);
    try {
      await api.updateProfile(viewOnlyEmployee.employeeId, {
        monthWage: modalMonthWage,
        workingDays: modalWorkingDays,
        basicSalary: modalBasicSalary,
        hra: modalHra,
        standardAllowance: modalStandardAllowance,
        performanceBonus: modalPerformanceBonus,
        leaveTravelAllowance: modalLta,
      });
      setModalSalarySaved(true);
      const updatedPR = await api.getPayroll(viewOnlyEmployee.employeeId);
      setViewOnlyPayroll(Array.isArray(updatedPR) ? updatedPR[0] : updatedPR);
      await refreshEmployees();
      setTimeout(() => setModalSalarySaved(false), 4000);
    } catch (err) {
      console.error('Failed to save salary details', err);
    } finally {
      setIsSavingModalSalary(false);
    }
  };

  const handleConfirmFire = async () => {
    if (!fireModalEmp) return;
    setIsFiring(true);
    try {
      await api.fireEmployee(fireModalEmp.employeeId, fireReason);
      await refreshEmployees();
      if (viewOnlyEmployee?.employeeId === fireModalEmp.employeeId) {
        setViewOnlyEmployee(null);
      }
      setFireModalEmp(null);
      setFireReason('');
    } catch (err) {
      console.error('Failed to terminate employee', err);
    } finally {
      setIsFiring(false);
    }
  };

  const [statusFilter, setStatusFilter] = useState('All');
  const statusOptions = ['All', 'Present', 'Half-day', 'Leave', 'Absent'];

  const filteredEmployees = allEmployees.filter(emp => {
    const matchesSearch =
      emp.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.employeeId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      emp.jobTitle.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesDept = departmentFilter === 'All' || emp.department === departmentFilter;

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Present' && emp.status === 'present') ||
      (statusFilter === 'Half-day' && (emp.status === 'half-day' || emp.status === 'Half-day')) ||
      (statusFilter === 'Leave' && emp.status === 'leave') ||
      (statusFilter === 'Absent' && emp.status === 'absent');

    return matchesSearch && matchesDept && matchesStatus;
  });

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto font-carme">
      {/* Header controls: Logo / NEW / Search */}
      <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <h2 className="font-crimson text-3xl font-bold text-[#E8E3DD]">
              Employee Roster
            </h2>

            {/* HR Only NEW Employee Creation Trigger Button */}
            {isHR && (
              <button
                onClick={() => {
                  setNewName('');
                  setNewEmail('');
                  setNewPhone('');
                  setCreatedResult(null);
                  setIsAddModalOpen(true);
                }}
                className="px-4 py-2 rounded-xl bg-[#9333EA] text-white text-xs font-bold hover:bg-[#7E22CE] transition-colors flex items-center space-x-1.5 shadow-md uppercase tracking-wider"
              >
                <FiPlus className="w-4 h-4" />
                <span>NEW</span>
              </button>
            )}
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <FiSearch className="w-4 h-4 text-[#78726A] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search by name, login ID, role..."
              className="w-full bg-[#141312] border border-[#332F2C] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
            />
          </div>
        </div>

        {/* Department & Status Filters */}
        <div className="space-y-3">
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-semibold">
            <span className="text-[#78726A] mr-2 shrink-0">Department:</span>
            {departments.map(dept => (
              <button
                key={dept}
                onClick={() => setDepartmentFilter(dept)}
                className={`px-3.5 py-1.5 rounded-xl transition-all shrink-0 ${
                  departmentFilter === dept
                    ? 'bg-[#E07A5F] text-white shadow-md'
                    : 'bg-[#141312] text-[#A39C95] hover:text-[#E8E3DD] border border-[#332F2C]'
                }`}
              >
                {dept}
              </button>
            ))}
          </div>

          <div className="flex items-center space-x-2 overflow-x-auto pb-1 text-xs font-semibold">
            <span className="text-[#78726A] mr-2 shrink-0">Status Filter:</span>
            {statusOptions.map(st => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3.5 py-1 rounded-xl transition-all shrink-0 ${
                  statusFilter === st
                    ? 'bg-[#709775] text-white font-bold shadow-md'
                    : 'bg-[#141312] text-[#A39C95] hover:text-[#E8E3DD] border border-[#332F2C]'
                }`}
              >
                {st}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Roster Legend Bar */}
      <div className="flex flex-wrap items-center gap-6 text-xs font-mono px-2">
        <span className="text-[#78726A] font-bold">Status Legend:</span>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#709775] shadow-[0_0_6px_#709775]" />
          <span className="text-[#A39C95]">Present</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="px-1.5 py-0.5 rounded bg-[#F4A261] text-[#141312] text-[10px] font-extrabold font-mono">Half-day</span>
          <span className="text-[#A39C95]">Half-day (Worked ≤ 4.5h)</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <Plane className="w-3.5 h-3.5 text-[#E07A5F]" />
          <span className="text-[#A39C95]">Leave</span>
        </div>
        <div className="flex items-center space-x-1.5">
          <span className="w-2.5 h-2.5 rounded-full bg-[#E06C68]" />
          <span className="text-[#A39C95]">Absent</span>
        </div>
      </div>

      {/* Grid of Clickable Employee Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEmployees.map(emp => {
          const isPresent = emp.status === 'present';
          const isHalfDay = emp.status === 'half-day' || emp.status === 'Half-day';
          const isOnLeave = emp.status === 'leave';
          const canFire = isHR && emp.employeeId !== currentUser?.employeeId;

          return (
            <div
              key={emp.employeeId}
              className="bg-[#1C1A19] border border-[#332F2C] hover:border-[#E07A5F] rounded-2xl p-6 shadow-xl relative transition-all group cursor-pointer hover:scale-[1.02] flex flex-col justify-between"
            >
              <div>
                {/* Top-Right Corner Status Indicator Icon */}
                <div className="absolute top-4 right-4" title={`Status: ${emp.status}`}>
                  {isPresent ? (
                    <span className="w-3 h-3 rounded-full bg-[#709775] block shadow-[0_0_8px_#709775]" title="Status: Present" />
                  ) : isHalfDay ? (
                    <span className="px-2 py-0.5 rounded bg-[#F4A261] text-[#141312] text-[10px] font-extrabold block shadow-sm font-mono">
                      Half-day
                    </span>
                  ) : isOnLeave ? (
                    <Plane className="w-4 h-4 text-[#E07A5F]" title="Status: On Leave" />
                  ) : (
                    <span className="w-3 h-3 rounded-full bg-[#E06C68] block" title="Status: Absent" />
                  )}
                </div>

                {/* Avatar & Main Info */}
                <div className="flex items-start space-x-4" onClick={() => handleCardClick(emp)}>
                  <UserAvatar name={emp.name} src={emp.avatarUrl} size="w-14 h-14" />
                  <div>
                    <h3 className="font-crimson font-bold text-lg text-[#E8E3DD] group-hover:text-[#E07A5F] transition-colors">
                      {emp.name}
                    </h3>
                    <p className="text-xs text-[#A39C95]">{emp.jobTitle}</p>
                    <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-[#141312] text-[#709775] font-semibold border border-[#2B2825]">
                      {emp.department}
                    </span>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="mt-5 pt-4 border-t border-[#292624] space-y-2 text-xs text-[#A39C95]" onClick={() => handleCardClick(emp)}>
                  <div className="flex items-center space-x-2">
                    <FiMail className="w-3.5 h-3.5 text-[#78726A]" />
                    <span className="truncate">{emp.email}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <FiPhone className="w-3.5 h-3.5 text-[#78726A]" />
                    <span>{emp.phone || '+91 98765 43210'}</span>
                  </div>
                </div>
              </div>

              {/* Footer ID Badge & Termination Button */}
              <div className="mt-4 pt-3 border-t border-[#292624] flex items-center justify-between text-xs">
                <span className="text-[10px] font-mono text-[#E07A5F] bg-[#24211F] px-2 py-0.5 rounded border border-[#332F2C]">
                  {emp.employeeId}
                </span>

                <div className="flex items-center space-x-2">
                  {emp.employeeId !== currentUser?.employeeId && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        openChatWith(emp);
                      }}
                      className="p-1.5 rounded-lg bg-[#24211F] text-[#E07A5F] hover:bg-[#E07A5F] hover:text-white transition-colors border border-[#E07A5F]/40 flex items-center space-x-1"
                      title="Send Private Message"
                    >
                      <FiMessageSquare className="w-3.5 h-3.5" />
                      <span className="text-[10px] font-bold">Message</span>
                    </button>
                  )}
                  {canFire && (
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setFireModalEmp(emp);
                        setFireReason('');
                      }}
                      className="p-1.5 rounded-lg bg-[#291B1B] text-[#E06C68] hover:bg-[#E06C68] hover:text-white transition-colors border border-[#E06C68]/40"
                      title="Terminate Employee"
                    >
                      <FiTrash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                  <span onClick={() => handleCardClick(emp)} className="text-[11px] text-[#A39C95] group-hover:text-[#E07A5F] transition-colors">
                    Click for Profile →
                  </span>
                </div>

              </div>
            </div>
          );
        })}
      </div>

      {/* ================ VIEW-ONLY EMPLOYEE INFORMATION MODAL ================ */}
      {viewOnlyEmployee && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl max-w-5xl w-full p-6 space-y-6 shadow-2xl animate-in zoom-in-95 my-8 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-start justify-between border-b border-[#292624] pb-4">
              <div className="flex items-center space-x-4">
                <UserAvatar name={viewOnlyEmployee.name} src={viewOnlyEmployee.avatarUrl} size="w-16 h-16" />
                <div>
                  <div className="flex items-center space-x-3">
                    <h3 className="font-crimson font-bold text-2xl text-[#E8E3DD]">
                      {viewOnlyEmployee.name}
                    </h3>
                  </div>
                  <p className="text-xs text-[#A39C95] mt-0.5">{viewOnlyEmployee.jobTitle} • {viewOnlyEmployee.department}</p>
                  <div className="flex items-center space-x-4 mt-2 text-xs font-mono">
                    <span className="text-[#E07A5F]">Login ID: {viewOnlyEmployee.employeeId}</span>
                    <span className="text-[#A39C95]">Joined: {viewOnlyEmployee.joiningDate}</span>
                    <span className="text-[#709775] font-bold">
                      Managed By: {viewOnlyEmployee.managerName || (viewOnlyEmployee.role === 'HR' ? 'Self (HR Manager)' : (allEmployees.find(e => e.role === 'HR')?.name ? `${allEmployees.find(e => e.role === 'HR')?.name} (HR Manager)` : 'Sankhyahrick Swami (HR Manager)'))}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setViewOnlyEmployee(null)}
                className="p-1.5 rounded-lg text-[#A39C95] hover:text-[#E8E3DD] hover:bg-[#24211F]"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            {/* Modal Tabs Navigation */}
            <div className="flex items-center space-x-2 border-b border-[#292624] pb-1 text-xs font-bold">
              <button
                onClick={() => setViewOnlyTab('resume')}
                className={`px-4 py-2 rounded-t-lg transition-colors flex items-center space-x-1.5 ${viewOnlyTab === 'resume' ? 'bg-[#24211F] text-[#E07A5F] border-t-2 border-[#E07A5F]' : 'text-[#A39C95] hover:text-[#E8E3DD]'
                  }`}
              >
                <FiUser className="w-3.5 h-3.5" />
                <span>Resume</span>
              </button>
              <button
                onClick={() => setViewOnlyTab('private')}
                className={`px-4 py-2 rounded-t-lg transition-colors flex items-center space-x-1.5 ${viewOnlyTab === 'private' ? 'bg-[#24211F] text-[#E07A5F] border-t-2 border-[#E07A5F]' : 'text-[#A39C95] hover:text-[#E8E3DD]'
                  }`}
              >
                <FiBriefcase className="w-3.5 h-3.5" />
                <span>Private Info</span>
              </button>
              {isHR && (
                <button
                  onClick={() => setViewOnlyTab('salary')}
                  className={`px-4 py-2 rounded-t-lg transition-colors flex items-center space-x-1.5 ${viewOnlyTab === 'salary' ? 'bg-[#24211F] text-[#E07A5F] border-t-2 border-[#E07A5F]' : 'text-[#A39C95] hover:text-[#E8E3DD]'
                    }`}
                >
                  <FiDollarSign className="w-3.5 h-3.5 text-[#709775]" />
                  <span>Salary Info</span>
                </button>
              )}
              <button
                onClick={() => setViewOnlyTab('security')}
                className={`px-4 py-2 rounded-t-lg transition-colors flex items-center space-x-1.5 ${viewOnlyTab === 'security' ? 'bg-[#24211F] text-[#E07A5F] border-t-2 border-[#E07A5F]' : 'text-[#A39C95] hover:text-[#E8E3DD]'
                  }`}
              >
                <FiShield className="w-3.5 h-3.5" />
                <span>Security</span>
              </button>
            </div>

            {/* Modal Tab Contents */}
            <div className="space-y-4 text-xs">
              {/* 1. Resume Tab */}
              {viewOnlyTab === 'resume' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="p-4 bg-[#141312] border border-[#2B2825] rounded-xl space-y-2">
                      <h4 className="font-bold text-[#E8E3DD] text-sm">About</h4>
                      <p className="text-[#A39C95] leading-relaxed">
                        No bio description provided yet.
                      </p>
                    </div>

                    <div className="p-4 bg-[#141312] border border-[#2B2825] rounded-xl space-y-2">
                      <h4 className="font-bold text-[#E8E3DD] text-sm">What I love about my job</h4>
                      <p className="text-[#A39C95] leading-relaxed font-crafty">
                        No details provided yet.
                      </p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="p-4 bg-[#141312] border border-[#2B2825] rounded-xl space-y-2">
                      <h4 className="font-bold text-[#E8E3DD] text-sm">Core Skills</h4>
                      <p className="text-[#78726A] text-xs font-mono">No skills listed yet.</p>
                    </div>

                    <div className="p-4 bg-[#141312] border border-[#2B2825] rounded-xl space-y-2">
                      <h4 className="font-bold text-[#E8E3DD] text-sm font-mono">Certifications</h4>
                      <p className="text-[#78726A] text-xs font-mono">No certifications listed yet.</p>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. Private Info Tab */}
              {viewOnlyTab === 'private' && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-[#141312] border border-[#2B2825] rounded-xl">
                    <span className="text-[#78726A] block text-[10px]">Date of Birth</span>
                    <span className="font-mono text-[#E8E3DD] block mt-0.5">Not Provided</span>
                  </div>
                  <div className="p-3 bg-[#141312] border border-[#2B2825] rounded-xl">
                    <span className="text-[#78726A] block text-[10px]">Nationality</span>
                    <span className="text-[#E8E3DD] block mt-0.5">Not Provided</span>
                  </div>
                  <div className="p-3 bg-[#141312] border border-[#2B2825] rounded-xl">
                    <span className="text-[#78726A] block text-[10px]">Personal Email</span>
                    <span className="font-mono text-[#E8E3DD] block mt-0.5">{viewOnlyEmployee.email}</span>
                  </div>
                  <div className="p-3 bg-[#141312] border border-[#2B2825] rounded-xl">
                    <span className="text-[#78726A] block text-[10px]">Phone Number</span>
                    <span className="font-mono text-[#E8E3DD] block mt-0.5">{viewOnlyEmployee.phone || 'Not Provided'}</span>
                  </div>
                  <div className="col-span-2 p-3 bg-[#141312] border border-[#2B2825] rounded-xl">
                    <span className="text-[#78726A] block text-[10px]">Residing Address</span>
                    <span className="text-[#E8E3DD] block mt-0.5">{viewOnlyEmployee.address || 'Not Provided'}</span>
                  </div>
                </div>
              )}

              {/* 3. Salary Info Tab (Matching Profile Page Styling) */}
              {viewOnlyTab === 'salary' && isHR && (
                <div className="space-y-6 text-xs">
                  {/* Header Controls: Month Wage & Working Days */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-[#141312] border border-[#2B2825] rounded-2xl">
                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-[#E8E3DD] font-bold w-28">Month Wage (₹)</span>
                        <div className="flex items-center space-x-2 flex-1">
                          <input
                            type="number"
                            value={modalMonthWage}
                            onChange={e => handleModalMonthWageChange(Number(e.target.value) || 0)}
                            placeholder="50000"
                            className="w-full bg-[#1C1A19] border border-[#332F2C] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#E07A5F] focus:outline-none focus:border-[#E07A5F]"
                          />
                          <span className="text-xs text-[#A39C95] font-mono shrink-0">/ Month</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-[#E8E3DD] font-bold w-28">Yearly wage</span>
                        <div className="flex items-center space-x-2 flex-1">
                          <div className="w-full bg-[#1C1A19] border border-[#2B2825] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#709775]">
                            ₹{(modalMonthWage * 12).toLocaleString()}
                          </div>
                          <span className="text-xs text-[#A39C95] font-mono shrink-0">/ Yearly</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-4">
                        <span className="text-[#E8E3DD] font-bold w-44">No of working days in a week:</span>
                        <input
                          type="number"
                          value={modalWorkingDays}
                          onChange={e => setModalWorkingDays(Number(e.target.value) || 5)}
                          className="w-24 bg-[#1C1A19] border border-[#332F2C] rounded-xl px-3 py-2 text-xs font-mono text-[#E8E3DD] focus:outline-none"
                        />
                      </div>

                      <div className="flex items-center space-x-4">
                        <span className="text-[#E8E3DD] font-bold w-44">Break Time:</span>
                        <div className="flex items-center space-x-2">
                          <input
                            type="number"
                            value={modalBreakTime}
                            onChange={e => setModalBreakTime(Number(e.target.value) || 1)}
                            className="w-24 bg-[#1C1A19] border border-[#332F2C] rounded-xl px-3 py-2 text-xs font-mono text-[#E8E3DD] focus:outline-none"
                          />
                          <span className="text-xs text-[#A39C95] font-mono">/hrs</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Component Breakdown Tables with Dynamic Inputs */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 font-mono pt-2">
                    {/* Left Column: Salary Components */}
                    <div className="lg:col-span-7 space-y-4">
                      <h4 className="font-crimson font-bold text-lg text-[#E8E3DD] border-b border-[#292624] pb-2 font-sans">
                        Salary Component Breakdown & Customization
                      </h4>

                      <div className="space-y-4 text-[11px]">
                        {/* Basic Salary */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#E8E3DD]">Basic Salary</span>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1 border-b border-[#555] pb-0.5 focus-within:border-[#E07A5F]">
                                <input
                                  type="number"
                                  value={modalBasicSalary}
                                  onChange={e => setModalBasicSalary(Number(e.target.value) || 0)}
                                  className="w-24 bg-transparent text-right font-mono font-bold text-[#E07A5F] focus:outline-none"
                                />
                                <span className="text-[#A39C95]">₹ / month</span>
                              </div>
                              <div className="flex items-center space-x-1 border-b border-[#555] pb-0.5">
                                <span className="w-14 text-right font-mono text-[#A39C95]">
                                  {modalMonthWage > 0 ? ((modalBasicSalary / modalMonthWage) * 100).toFixed(2) : '50.00'}
                                </span>
                                <span className="text-[#A39C95]">%</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-[10px] text-[#78726A] font-sans">Define Basic salary from company cost compute it based on monthly Wages</p>
                        </div>

                        {/* House Rent Allowance */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#E8E3DD]">House Rent Allowance</span>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1 border-b border-[#555] pb-0.5 focus-within:border-[#E07A5F]">
                                <input
                                  type="number"
                                  value={modalHra}
                                  onChange={e => setModalHra(Number(e.target.value) || 0)}
                                  className="w-24 bg-transparent text-right font-mono font-bold text-[#E8E3DD] focus:outline-none"
                                />
                                <span className="text-[#A39C95]">₹ / month</span>
                              </div>
                              <div className="flex items-center space-x-1 border-b border-[#555] pb-0.5">
                                <span className="w-14 text-right font-mono text-[#A39C95]">
                                  {modalBasicSalary > 0 ? ((modalHra / modalBasicSalary) * 100).toFixed(2) : '50.00'}
                                </span>
                                <span className="text-[#A39C95]">% of Basic</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-[10px] text-[#78726A] font-sans">HRA provided to employees 50% of the basic salary</p>
                        </div>

                        {/* Standard Allowance */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#E8E3DD]">Standard Allowance</span>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1 border-b border-[#555] pb-0.5 focus-within:border-[#E07A5F]">
                                <input
                                  type="number"
                                  value={modalStandardAllowance}
                                  onChange={e => setModalStandardAllowance(Number(e.target.value) || 0)}
                                  className="w-24 bg-transparent text-right font-mono font-bold text-[#E8E3DD] focus:outline-none"
                                />
                                <span className="text-[#A39C95]">₹ / month</span>
                              </div>
                              <div className="flex items-center space-x-1 border-b border-[#555] pb-0.5">
                                <span className="w-14 text-right font-mono text-[#A39C95]">
                                  {modalMonthWage > 0 ? ((modalStandardAllowance / modalMonthWage) * 100).toFixed(2) : '8.33'}
                                </span>
                                <span className="text-[#A39C95]">%</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-[10px] text-[#78726A] font-sans">A standard allowance is a predetermined, fixed amount provided to employee as part of their salary</p>
                        </div>

                        {/* Performance Bonus */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#E8E3DD]">Performance Bonus</span>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1 border-b border-[#555] pb-0.5 focus-within:border-[#E07A5F]">
                                <input
                                  type="number"
                                  value={modalPerformanceBonus}
                                  onChange={e => setModalPerformanceBonus(Number(e.target.value) || 0)}
                                  className="w-24 bg-transparent text-right font-mono font-bold text-[#E8E3DD] focus:outline-none"
                                />
                                <span className="text-[#A39C95]">₹ / month</span>
                              </div>
                              <div className="flex items-center space-x-1 border-b border-[#555] pb-0.5">
                                <span className="w-14 text-right font-mono text-[#A39C95]">
                                  {modalBasicSalary > 0 ? ((modalPerformanceBonus / modalBasicSalary) * 100).toFixed(2) : '8.33'}
                                </span>
                                <span className="text-[#A39C95]">%</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-[10px] text-[#78726A] font-sans font-normal">Variable amount paid during payroll computed as % of basic salary</p>
                        </div>

                        {/* Leave Travel Allowance */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#E8E3DD]">Leave Travel Allowance</span>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1 border-b border-[#555] pb-0.5 focus-within:border-[#E07A5F]">
                                <input
                                  type="number"
                                  value={modalLta}
                                  onChange={e => setModalLta(Number(e.target.value) || 0)}
                                  className="w-24 bg-transparent text-right font-mono font-bold text-[#E8E3DD] focus:outline-none"
                                />
                                <span className="text-[#A39C95]">₹ / month</span>
                              </div>
                              <div className="flex items-center space-x-1 border-b border-[#555] pb-0.5">
                                <span className="w-14 text-right font-mono text-[#A39C95]">
                                  {modalBasicSalary > 0 ? ((modalLta / modalBasicSalary) * 100).toFixed(2) : '8.33'}
                                </span>
                                <span className="text-[#A39C95]">%</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-[10px] text-[#78726A] font-sans font-normal">LTA is paid by the company to employees to cover travel expenses</p>
                        </div>

                        {/* Fixed Allowance */}
                        <div className="space-y-1">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#E07A5F]">Fixed Allowance</span>
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center space-x-1 border-b border-[#555] pb-0.5">
                                <span className="w-24 text-right font-mono font-bold text-[#E07A5F]">
                                  ₹{Math.max(0, modalMonthWage - (modalBasicSalary + modalHra + modalStandardAllowance + modalPerformanceBonus + modalLta)).toFixed(2)}
                                </span>
                                <span className="text-[#A39C95]">₹ / month</span>
                              </div>
                              <div className="flex items-center space-x-1 border-b border-[#555] pb-0.5">
                                <span className="w-14 text-right font-mono text-[#A39C95]">
                                  {modalMonthWage > 0 ? ((Math.max(0, modalMonthWage - (modalBasicSalary + modalHra + modalStandardAllowance + modalPerformanceBonus + modalLta)) / modalMonthWage) * 100).toFixed(2) : '0.00'}
                                </span>
                                <span className="text-[#A39C95]">%</span>
                              </div>
                            </div>
                          </div>
                          <p className="text-[10px] text-[#78726A] font-sans font-normal">Fixed allowance portion of wages determined after calculating all components</p>
                        </div>
                      </div>
                    </div>

                    {/* Right Column: PF & Tax Deductions */}
                    <div className="lg:col-span-5 space-y-6">
                      {/* Provident Fund Box */}
                      <div className="space-y-3">
                        <h4 className="font-crimson font-bold text-lg text-[#E8E3DD] border-b border-[#292624] pb-2 font-sans">
                          Provident Fund (PF) Contribution
                        </h4>

                        <div className="space-y-3 text-[11px]">
                          <div className="space-y-0.5">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[#E8E3DD]">Employee PF</span>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-[#E07A5F]">₹{(modalBasicSalary * 0.12).toFixed(2)}</span>
                                <span className="text-[#709775] font-bold">(12% of Basic)</span>
                              </div>
                            </div>
                          </div>

                          <div className="space-y-0.5">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-[#E8E3DD]">Employer PF</span>
                              <div className="flex items-center space-x-2">
                                <span className="font-bold text-[#E07A5F]">₹{(modalBasicSalary * 0.12).toFixed(2)}</span>
                                <span className="text-[#709775] font-bold">(12% of Basic)</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Tax Deductions Box */}
                      <div className="space-y-3">
                        <h4 className="font-crimson font-bold text-lg text-[#E8E3DD] border-b border-[#292624] pb-2 font-sans">
                          Tax Deductions
                        </h4>

                        <div className="space-y-0.5 text-[11px]">
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-[#E8E3DD]">Professional Tax</span>
                            <span className="font-bold text-[#E06C68]">₹200.00 / month</span>
                          </div>
                        </div>
                      </div>

                      {/* Net Monthly Take-Home Salary Summary Card */}
                      <div className="p-4 bg-[#141312] border border-[#709775] rounded-xl space-y-2">
                        <span className="text-xs text-[#709775] font-bold uppercase tracking-wider block font-sans">Net Monthly Take-Home Salary</span>
                        <div className="font-mono text-3xl font-extrabold text-[#709775]">
                          ₹{((modalBasicSalary + modalHra + modalStandardAllowance + modalPerformanceBonus + modalLta + Math.max(0, modalMonthWage - (modalBasicSalary + modalHra + modalStandardAllowance + modalPerformanceBonus + modalLta))) - ((modalBasicSalary * 0.12) + 200)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <span className="text-[10px] text-[#A39C95] block font-sans">Includes Basic + HRA + Allowances minus PF & Professional Tax</span>
                      </div>
                    </div>
                  </div>

                  {/* Save Status Banner */}
                  {modalSalarySaved && (
                    <div className="p-3 rounded-xl bg-[#1C251F] border border-[#709775] text-[#709775] flex items-center space-x-2 font-mono text-xs">
                      <FiCheckCircle className="w-4 h-4" />
                      <span>Salary details updated successfully!</span>
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex justify-end pt-2">
                    <button
                      type="button"
                      onClick={handleSaveModalSalaryDetails}
                      disabled={isSavingModalSalary}
                      className="px-6 py-2.5 rounded-xl bg-[#709775] text-white font-bold hover:bg-[#5C8260] transition-colors shadow-lg flex items-center space-x-2 disabled:opacity-50"
                    >
                      <FiCheckCircle className="w-4 h-4" />
                      <span>{isSavingModalSalary ? 'Saving...' : 'Save Salary Details'}</span>
                    </button>
                  </div>
                </div>
              )}

              {/* 4. Security Tab */}
              {viewOnlyTab === 'security' && (
                <div className="p-4 bg-[#141312] border border-[#2B2825] rounded-xl space-y-3">
                  <h4 className="font-bold text-[#E8E3DD]">Security & Password Reset</h4>
                  <p className="text-[#A39C95]">Initial system password assigned upon creation. Employee can log in and update password.</p>
                  <div className="p-3 bg-[#1C1A19] border border-[#332F2C] rounded-lg font-mono text-xs text-[#F4A261]">
                    System Default Initial Password: Dayflow#2026
                  </div>
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[#292624] flex justify-between items-center">
              <div className="flex items-center space-x-3">
                {viewOnlyEmployee.employeeId !== currentUser?.employeeId && (
                  <button
                    type="button"
                    onClick={() => {
                      const target = viewOnlyEmployee;
                      setViewOnlyEmployee(null);
                      openChatWith(target);
                    }}
                    className="px-4 py-2 rounded-xl bg-[#E07A5F] text-white text-xs font-bold hover:bg-[#D0694E] transition-colors flex items-center space-x-1.5 shadow-md"
                  >
                    <FiMessageSquare className="w-4 h-4" />
                    <span>Send Private Message</span>
                  </button>
                )}

                {isHR && viewOnlyEmployee.employeeId !== currentUser?.employeeId && (
                  <button
                    type="button"
                    onClick={() => {
                      setFireModalEmp(viewOnlyEmployee);
                      setFireReason('');
                    }}
                    className="px-4 py-2 rounded-xl bg-[#291B1B] text-[#E06C68] border border-[#E06C68]/40 hover:bg-[#E06C68] hover:text-white transition-colors text-xs font-bold flex items-center space-x-1.5"
                  >
                    <FiTrash2 className="w-4 h-4" />
                    <span>Terminate Contract</span>
                  </button>
                )}
              </div>
              <button
                onClick={() => setViewOnlyEmployee(null)}
                className="px-5 py-2 rounded-xl bg-[#24211F] border border-[#332F2C] text-xs font-bold text-[#E8E3DD] hover:border-[#E07A5F]"
              >
                Close View
              </button>
            </div>
          </div>
        </div>
      )}

      {/* HR Add Employee Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-5 animate-in zoom-in-95">
            <div className="flex items-center justify-between border-b border-[#292624] pb-4">
              <div>
                <h3 className="font-crimson font-bold text-xl text-[#E8E3DD]">
                  Create Employee Account
                </h3>
                <p className="text-xs text-[#A39C95]">
                  Automated credentials will be dispatched to employee email.
                </p>
              </div>
              <button
                onClick={() => {
                  setIsAddModalOpen(false);
                  setCreatedResult(null);
                }}
                className="p-1 rounded-lg text-[#A39C95] hover:text-[#E8E3DD] hover:bg-[#24211F]"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            {createdResult ? (
              <div className="space-y-4 font-mono text-xs">
                <div className="p-4 rounded-xl bg-[#1C251F] border border-[#709775] text-[#709775] space-y-2">
                  <div className="flex items-center space-x-2 font-bold text-sm">
                    <FiCheckCircle className="w-5 h-5" />
                    <span>Employee Account Created Successfully!</span>
                  </div>
                  <p className="text-[#A39C95] font-sans">
                    Welcome email sent with initial login details.
                  </p>
                </div>

                <div className="p-4 bg-[#141312] border border-[#2B2825] rounded-xl space-y-2 text-[#E8E3DD]">
                  <div className="flex justify-between">
                    <span className="text-[#78726A]">Generated Login ID:</span>
                    <span className="font-bold text-[#E07A5F]">{createdResult.loginId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#78726A]">Default Password:</span>
                    <span className="font-bold text-[#F4A261]">{createdResult.pass}</span>
                  </div>
                </div>

                <div className="flex justify-end pt-2 font-sans">
                  <button
                    onClick={() => {
                      setIsAddModalOpen(false);
                      setCreatedResult(null);
                    }}
                    className="px-5 py-2.5 rounded-xl bg-[#709775] text-white font-bold text-xs hover:bg-[#5C8260]"
                  >
                    Done & Close
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleCreateEmployee} className="space-y-4 text-xs font-mono">
                <div className="p-3 bg-[#141312] border border-[#2B2825] rounded-xl space-y-1">
                  <span className="text-[10px] text-[#78726A] uppercase font-bold block font-sans">System Generated Login ID</span>
                  <div className="font-bold text-[#E07A5F] text-sm">{previewID}</div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#78726A] text-[11px] block font-semibold font-sans">Full Name</label>
                  <input
                    type="text"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    placeholder="e.g. Sankhyahrick Swami"
                    className="w-full bg-[#141312] border border-[#332F2C] rounded-xl px-3 py-2 text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F]"
                    required
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[#78726A] text-[11px] block font-semibold font-sans">Work Email</label>
                  <input
                    type="email"
                    value={newEmail}
                    onChange={e => setNewEmail(e.target.value)}
                    placeholder="e.g. s.swami@odooindia.io"
                    className="w-full bg-[#141312] border border-[#332F2C] rounded-xl px-3 py-2 text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F]"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[#78726A] text-[11px] block font-semibold font-sans">Phone Number</label>
                    <input
                      type="text"
                      value={newPhone}
                      onChange={e => setNewPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      className="w-full bg-[#141312] border border-[#332F2C] rounded-xl px-3 py-2 text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[#78726A] text-[11px] block font-semibold font-sans">Department</label>
                    <select
                      value={newDept}
                      onChange={e => setNewDept(e.target.value)}
                      className="w-full bg-[#141312] border border-[#332F2C] rounded-xl px-3 py-2 text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F]"
                    >
                      <option value="Engineering">Engineering</option>
                      <option value="People & Culture">People & Culture</option>
                      <option value="Design">Design</option>
                      <option value="Product">Product</option>
                    </select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[#78726A] text-[11px] block font-semibold font-sans">Job Title</label>
                  <input
                    type="text"
                    value={newJob}
                    onChange={e => setNewJob(e.target.value)}
                    placeholder="e.g. Software Engineer"
                    className="w-full bg-[#141312] border border-[#332F2C] rounded-xl px-3 py-2 text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F]"
                  />
                </div>

                <div className="flex justify-end space-x-3 pt-4 border-t border-[#292624] font-sans">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-5 py-2.5 rounded-xl bg-[#24211F] text-[#E8E3DD] font-bold text-xs hover:bg-[#332F2C]"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="px-6 py-2.5 rounded-xl bg-[#9333EA] text-white font-bold text-xs hover:bg-[#7E22CE] transition-colors shadow-lg disabled:opacity-50"
                  >
                    {isSubmitting ? 'Creating...' : 'Create Account & Send Email'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* HR Fire / Terminate Employee Modal */}
      {fireModalEmp && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1A19] border border-[#E06C68]/50 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-in zoom-in-95 font-carme text-[#E8E3DD]">
            <div className="flex items-center justify-between border-b border-[#292624] pb-3 text-[#E06C68]">
              <h3 className="font-crimson font-bold text-xl">Terminate Employee Contract</h3>
              <button onClick={() => setFireModalEmp(null)} className="p-1 rounded text-[#A39C95] hover:text-[#E8E3DD]">
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-[#A39C95] leading-relaxed">
                Are you sure you want to terminate <strong className="text-[#E8E3DD]">{fireModalEmp.name}</strong> (<span className="font-mono text-[#E07A5F]">{fireModalEmp.employeeId}</span>)? This will remove their account from the system.
              </p>

              <div className="space-y-1">
                <label className="text-[#78726A] text-[11px] block font-semibold">Reason for Termination</label>
                <textarea
                  rows={3}
                  value={fireReason}
                  onChange={e => setFireReason(e.target.value)}
                  placeholder="e.g. Violation of company policy / performance contract breach..."
                  className="w-full bg-[#141312] border border-[#332F2C] rounded-xl p-2.5 text-[#E8E3DD] focus:outline-none focus:border-[#E06C68]"
                  required
                />
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-3 border-t border-[#292624]">
              <button
                type="button"
                onClick={() => setFireModalEmp(null)}
                className="px-4 py-2 rounded-xl bg-[#24211F] text-[#E8E3DD] font-bold text-xs hover:bg-[#332F2C]"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmFire}
                disabled={isFiring || !fireReason.trim()}
                className="px-5 py-2 rounded-xl bg-[#E06C68] text-white font-bold text-xs hover:bg-[#C0504C] transition-colors shadow-lg disabled:opacity-50"
              >
                {isFiring ? 'Terminating...' : 'Confirm Termination'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Floating Private Messages Action Button */}
      <div className="fixed bottom-6 right-6 z-40">
        <button
          type="button"
          onClick={() => openChatWith()}
          className="px-5 py-3 rounded-full bg-[#E07A5F] text-white font-bold text-xs hover:bg-[#D0694E] transition-all shadow-2xl flex items-center space-x-2 border.2 border-[#1C1A19] cursor-pointer group hover:scale-105"
        >
          <FiMessageSquare className="w-4 h-4 group-hover:scale-110 transition-transform" />
          <span>Private Chat</span>
          {totalUnreadCount > 0 && (
            <span className="px-2 py-0.5 rounded-full bg-white text-[#E07A5F] font-mono text-[10px] font-extrabold animate-bounce">
              {totalUnreadCount}
            </span>
          )}
        </button>
      </div>

      {/* Private Chat Drawer Window */}
      <PrivateChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
        targetEmployee={chatTargetEmp}
        allEmployees={allEmployees}
        currentUser={currentUser}
      />
    </div>
  );
};

