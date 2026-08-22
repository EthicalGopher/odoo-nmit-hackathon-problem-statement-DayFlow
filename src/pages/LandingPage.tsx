import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { motion } from 'framer-motion';
import {
  FiUsers,
  FiClock,
  FiCalendar,
  FiBarChart2,
  FiShield,
  FiMail,
  FiFileText,
  FiActivity,
  FiArrowRight,
  FiChevronDown,
  FiCheckCircle,
  FiTrendingUp,
  FiDollarSign,
} from 'react-icons/fi';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isLoadingSession } = useAuth();
  const [activeTab, setActiveTab] = useState<'payroll' | 'attendance' | 'leaves' | 'analytics'>('payroll');
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Redirect to app dashboard if already logged in
  useEffect(() => {
    if (!isLoadingSession && currentUser) {
      navigate('/employees', { replace: true });
    }
  }, [currentUser, isLoadingSession, navigate]);

  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-[#141312] flex items-center justify-center font-carme">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-[#E07A5F] border-t-transparent rounded-full animate-spin shadow-lg" />
          <img src="/logo.png" alt="Dayflow" className="h-10 w-auto object-contain opacity-70" />
          <span className="text-xs text-[#A39C95] tracking-wider uppercase font-mono">Loading Dayflow HRMS...</span>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <FiFileText className="w-6 h-6 text-[#E07A5F]" />,
      badge: 'Payroll Matrix',
      title: 'Automated Compensation & Slips',
      desc: 'Automatic component calculation (Basic 50%, HRA 25%, PF 12%, Tax) with printable PDF salary slips.',
    },
    {
      icon: <FiUsers className="w-6 h-6 text-[#9333EA]" />,
      badge: 'Workforce Hub',
      title: 'Employee Directory & Roster',
      desc: 'Centralized directory with interactive profile cards, status indicators, and department filters.',
    },
    {
      icon: <FiClock className="w-6 h-6 text-[#709775]" />,
      badge: 'Time Tracking',
      title: 'Real-Time Attendance',
      desc: 'Instant 1-click check-in/out tracking with automated work-hour logging and overtime calculations.',
    },
    {
      icon: <FiCalendar className="w-6 h-6 text-[#F4A261]" />,
      badge: 'Absence Engine',
      title: 'Leave & Callback System',
      desc: 'Request paid/sick leaves, manage holiday calendars, approve requests, and trigger callback notices.',
    },
    {
      icon: <FiBarChart2 className="w-6 h-6 text-[#3B82F6]" />,
      badge: 'Intelligence',
      title: 'Executive Reports & Analytics',
      desc: 'Real-time charts for weekly attendance distribution, department cost allocations, and active KPIs.',
    },
    {
      icon: <FiMail className="w-6 h-6 text-[#EC4899]" />,
      badge: 'Internal Comms',
      title: 'Private Peer Messaging',
      desc: 'Integrated peer-to-peer chat drawer with live unread counts and instant notification alerts.',
    },
    {
      icon: <FiShield className="w-6 h-6 text-[#10B981]" />,
      badge: 'Security',
      title: 'Role-Based Access (RBAC)',
      desc: 'Strict access boundaries — HR Managers get full administrative control, employees read their own data.',
    },
    {
      icon: <FiActivity className="w-6 h-6 text-[#F59E0B]" />,
      badge: 'Live Sync',
      title: 'Real-Time State Polling',
      desc: 'Multi-tab state synchronization, instant notification bell, and background activity updates.',
    },
  ];

  const faqs = [
    {
      q: 'How does payroll calculation work in Dayflow?',
      a: 'Dayflow dynamically calculates gross monthly wages into structured components: Basic Salary (50%), HRA (25% of Basic), Standard Allowance, Performance Bonus, PF Deductions (12% of Basic), and Professional Tax. Printable salary slips are generated in one click.',
    },
    {
      q: 'Can employees see or modify salary details on their profiles?',
      a: 'Employees can view their full monthly compensation breakdown in read-only mode from their profile page. All salary editing controls and save actions are strictly restricted to HR Managers.',
    },
    {
      q: 'How does leave and callback management work?',
      a: 'Employees submit paid or sick leave requests directly from their portal. HR Officers review, approve, or reject applications, view available leave balances, and send official callback notices when urgent staffing is required.',
    },
    {
      q: 'How do role permissions work between HR and Employees?',
      a: 'HR Managers can onboard team members, update compensation, process callbacks, view executive analytics, and manage payroll. Employees can log attendance, apply for leaves, chat with peers, and view their own documents.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#141312] text-[#E8E3DD] font-carme selection:bg-[#E07A5F]/30 selection:text-[#E8E3DD]">
      {/* 1. STICKY TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-50 bg-[#1C1A19]/80 backdrop-blur-md border-b border-[#332F2C]">
        <div className="max-w-7xl mx-auto px-6 py-3.5 flex items-center justify-between">
          {/* Logo & Brand Name */}
          <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
            <img src="/logo.png" alt="Dayflow" className="h-16 md:scale-200 scale-105  w-auto object-contain hover:scale-105 transition-transform" />
          </div>

          {/* Center Navigation Anchors */}
          <nav className="hidden md:flex items-center space-x-8 text-xs font-medium text-[#A39C95]">
            <a href="#features" className="hover:text-[#E07A5F] transition-colors">Features</a>
            <a href="#preview" className="hover:text-[#E07A5F] transition-colors">Live Modules</a>
            <a href="#workflow" className="hover:text-[#E07A5F] transition-colors">How It Works</a>
            <a href="#faq" className="hover:text-[#E07A5F] transition-colors">FAQ</a>
          </nav>

          {/* Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-xl bg-[#24211F] border border-[#332F2C] text-xs font-bold text-[#E8E3DD] hover:border-[#E07A5F] hover:text-[#E07A5F] transition-all shadow-sm"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 rounded-xl bg-[#E07A5F] text-xs font-bold text-white hover:bg-[#D0694E] transition-all flex items-center space-x-1.5 shadow-md shadow-[#E07A5F]/20"
            >
              <span>Get Started</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* 2. HERO SECTION WITH SCROLL ANIMATIONS */}
      <section className="relative overflow-hidden py-20 md:py-28 border-b border-[#292624]">
        {/* Glow Ambient Orbs */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-[#E07A5F]/10 rounded-full blur-[140px] pointer-events-none" />
        <div className="absolute top-10 right-10 w-[350px] h-[350px] bg-[#709775]/10 rounded-full blur-[120px] pointer-events-none" />

        <div className="max-w-4xl mx-auto px-6 relative z-10 text-center space-y-8">
          {/* Title */}
          <motion.h1
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: 'easeOut' }}
            className="font-crimson text-5xl sm:text-6xl lg:text-7xl font-extrabold text-[#E8E3DD] leading-[1.1] tracking-tight"
          >
            Empower Your <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#E07A5F] via-[#F4A261] to-[#709775]">
              Workforce.
            </span>
          </motion.h1>

          {/* Description */}
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.15, ease: 'easeOut' }}
            className="text-base sm:text-lg text-[#A39C95] leading-relaxed max-w-2xl mx-auto"
          >
            Dayflow is an enterprise Human Resource platform. Effortlessly manage employee rosters, real-time attendance, leave workflows, automated payroll structures, and printable salary slips in one unified hub.
          </motion.p>

          {/* CTA Group */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: 'easeOut' }}
            className="flex flex-wrap items-center justify-center gap-4 pt-2"
          >
            <button
              onClick={() => navigate('/login')}
              className="px-8 py-4 rounded-xl bg-[#E07A5F] text-sm font-bold text-white hover:bg-[#D0694E] transition-all flex items-center space-x-2.5 shadow-xl shadow-[#E07A5F]/25 hover:scale-105"
            >
              <span>Launch Dayflow Portal</span>
              <FiArrowRight className="w-4 h-4" />
            </button>
          </motion.div>

          {/* Comprehensive Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.45, ease: 'easeOut' }}
            className="pt-8 border-t border-[#24211F] max-w-3xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-6 text-xs font-mono"
          >
            <div className="p-3 bg-[#1C1A19] border border-[#332F2C] rounded-xl space-y-1">
              <span className="block text-xl font-bold text-[#E8E3DD]">Payroll Engine</span>
              <span className="text-[#78726A] text-[11px]">Dynamic Slips & Tax</span>
            </div>
            <div className="p-3 bg-[#1C1A19] border border-[#332F2C] rounded-xl space-y-1">
              <span className="block text-xl font-bold text-[#709775]">Time & Attendance</span>
              <span className="text-[#78726A] text-[11px]">1-Click Check-in & Logs</span>
            </div>
            <div className="p-3 bg-[#1C1A19] border border-[#332F2C] rounded-xl space-y-1">
              <span className="block text-xl font-bold text-[#F4A261]">Leave Workflows</span>
              <span className="text-[#78726A] text-[11px]">Approval & Callbacks</span>
            </div>
            <div className="p-3 bg-[#1C1A19] border border-[#332F2C] rounded-xl space-y-1">
              <span className="block text-xl font-bold text-[#3B82F6]">Live Analytics</span>
              <span className="text-[#78726A] text-[11px]">Executive Reports</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 3. INTERACTIVE LIVE FEATURE PREVIEW MODULE SWITCHER */}
      <section id="preview" className="py-20 border-b border-[#292624] bg-[#181716]/60">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-3"
          >
            <span className="text-xs font-mono font-bold text-[#E07A5F] uppercase tracking-wider">Live System Modules</span>
            <h2 className="font-crimson text-3xl sm:text-4xl font-bold text-[#E8E3DD]">
              Built for Speed, Transparency & Scale
            </h2>
            <p className="text-sm text-[#A39C95]">
              Click through the modules below to preview how Dayflow manages workforce operations.
            </p>
          </motion.div>

          {/* Module Switcher Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex flex-wrap justify-center items-center gap-2 sm:gap-4"
          >
            <button
              onClick={() => setActiveTab('payroll')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${activeTab === 'payroll'
                ? 'bg-[#E07A5F] text-white shadow-lg shadow-[#E07A5F]/20'
                : 'bg-[#1C1A19] border border-[#332F2C] text-[#A39C95] hover:text-[#E8E3DD]'
                }`}
            >
              <FiDollarSign className="w-4 h-4" />
              <span>Smart Payroll Engine</span>
            </button>
            <button
              onClick={() => setActiveTab('attendance')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${activeTab === 'attendance'
                ? 'bg-[#E07A5F] text-white shadow-lg shadow-[#E07A5F]/20'
                : 'bg-[#1C1A19] border border-[#332F2C] text-[#A39C95] hover:text-[#E8E3DD]'
                }`}
            >
              <FiClock className="w-4 h-4" />
              <span>Real-Time Attendance</span>
            </button>
            <button
              onClick={() => setActiveTab('leaves')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${activeTab === 'leaves'
                ? 'bg-[#E07A5F] text-white shadow-lg shadow-[#E07A5F]/20'
                : 'bg-[#1C1A19] border border-[#332F2C] text-[#A39C95] hover:text-[#E8E3DD]'
                }`}
            >
              <FiCalendar className="w-4 h-4" />
              <span>Leave & Callbacks</span>
            </button>
            <button
              onClick={() => setActiveTab('analytics')}
              className={`px-5 py-2.5 rounded-xl text-xs font-bold transition-all flex items-center space-x-2 ${activeTab === 'analytics'
                ? 'bg-[#E07A5F] text-white shadow-lg shadow-[#E07A5F]/20'
                : 'bg-[#1C1A19] border border-[#332F2C] text-[#A39C95] hover:text-[#E8E3DD]'
                }`}
            >
              <FiBarChart2 className="w-4 h-4" />
              <span>Executive Analytics</span>
            </button>
          </motion.div>

          {/* Module Card Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="bg-[#1C1A19] border border-[#332F2C] rounded-3xl p-8 shadow-2xl"
          >
            {activeTab === 'payroll' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center font-carme">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded bg-[#24211F] text-[#E07A5F] text-xs font-mono font-bold">Automated Wage Calculations</span>
                  <h3 className="font-crimson text-2xl font-bold text-[#E8E3DD]">Transparent Salary Structure & Slips</h3>
                  <p className="text-xs text-[#A39C95] leading-relaxed">
                    Configure base gross wages while Dayflow computes Basic Salary (50%), HRA (25%), Standard Allowance, Performance Bonus, PF deductions (12%), and Professional Tax. Printable slips are generated on demand.
                  </p>
                  <ul className="space-y-2 text-xs text-[#E8E3DD]">
                    <li className="flex items-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-[#E07A5F]" />
                      <span>Employee confidential read-only profile access</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-[#E07A5F]" />
                      <span>Dynamic company header & registration ID fetching</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-[#E07A5F]" />
                      <span>One-click PDF printable pay slips</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 bg-[#141312] border border-[#2B2825] rounded-2xl font-mono text-xs space-y-3">
                  <div className="flex justify-between items-center pb-2 border-b border-[#292624]">
                    <span className="font-bold text-[#E8E3DD]">Salary Breakdown</span>
                    <span className="text-[#E07A5F]">Monthly Wage: ₹75,000</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#78726A]">Basic Salary (50%)</span>
                    <span className="text-[#E8E3DD]">₹37,500</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#78726A]">HRA (50% of Basic)</span>
                    <span className="text-[#E8E3DD]">₹18,750</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#78726A]">PF Deduction (12%)</span>
                    <span className="text-[#E06C68]">-₹4,500</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#292624]">
                    <span className="font-bold text-[#709775]">Net Monthly Take-Home:</span>
                    <span className="font-bold text-[#709775] text-sm">₹70,300.00</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'attendance' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center font-carme">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded bg-[#24211F] text-[#709775] text-xs font-mono font-bold">1-Click Check-In & Out</span>
                  <h3 className="font-crimson text-2xl font-bold text-[#E8E3DD]">Precision Attendance & Shift Logs</h3>
                  <p className="text-xs text-[#A39C95] leading-relaxed">
                    Dayflow logs daily check-in and check-out timestamps with microsecond accuracy. It computes total worked hours, extra hours / overtime, and updates status indicators across the organization.
                  </p>
                  <ul className="space-y-2 text-xs text-[#E8E3DD]">
                    <li className="flex items-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-[#709775]" />
                      <span>Instant Check-in / Check-out toggle button</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-[#709775]" />
                      <span>Automatic extra-hours / overtime matrix</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-[#709775]" />
                      <span>Departmental day view for HR Officers</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 bg-[#141312] border border-[#2B2825] rounded-2xl font-mono text-xs space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-[#292624]">
                    <span className="font-bold text-[#E8E3DD]">Today's Shift Log</span>
                    <span className="text-[#709775]">Active Shift</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#78726A]">Check In Time:</span>
                    <span className="text-[#E8E3DD]">09:15 AM</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#78726A]">Check Out Time:</span>
                    <span className="text-[#E8E3DD]">05:45 PM</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#292624]">
                    <span className="text-[#78726A]">Total Work Duration:</span>
                    <span className="text-[#709775] font-bold">08h 30m</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'leaves' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center font-carme">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded bg-[#24211F] text-[#F4A261] text-xs font-mono font-bold">Seamless Leave Workflow</span>
                  <h3 className="font-crimson text-2xl font-bold text-[#E8E3DD]">Paid/Sick Leaves & HR Callbacks</h3>
                  <p className="text-xs text-[#A39C95] leading-relaxed">
                    Track employee paid and sick leave balances, request time off with calendar pickers, and send HR callback notifications when urgent duty assignments arise.
                  </p>
                  <ul className="space-y-2 text-xs text-[#E8E3DD]">
                    <li className="flex items-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-[#F4A261]" />
                      <span>Automatic leave balance deduction</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-[#F4A261]" />
                      <span>Indian holiday calendar integration</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-[#F4A261]" />
                      <span>Urgent staffing callback notice triggers</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 bg-[#141312] border border-[#2B2825] rounded-2xl font-mono text-xs space-y-4">
                  <div className="flex justify-between items-center pb-3 border-b border-[#292624]">
                    <span className="font-bold text-[#E8E3DD]">Leave Request</span>
                    <span className="text-[#709775] px-2 py-0.5 rounded bg-[#1C251F] border border-[#709775]/40 text-[10px]">Approved</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#78726A]">Leave Type:</span>
                    <span className="text-[#E8E3DD]">Paid Casual Leave</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-[#78726A]">Duration:</span>
                    <span className="text-[#E8E3DD]">Aug 25 – Aug 27 (3 Days)</span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[#292624]">
                    <span className="text-[#78726A]">Remaining Paid Balance:</span>
                    <span className="text-[#F4A261] font-bold">12 Days</span>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center font-carme">
                <div className="space-y-4">
                  <span className="px-3 py-1 rounded bg-[#24211F] text-[#3B82F6] text-xs font-mono font-bold">Executive Intelligence</span>
                  <h3 className="font-crimson text-2xl font-bold text-[#E8E3DD]">Live Reports & Workforce Analytics</h3>
                  <p className="text-xs text-[#A39C95] leading-relaxed">
                    Gain deep organizational visibility with real-time attendance rate metrics, weekly weekday distribution charts, and department payroll commitment breakdowns.
                  </p>
                  <ul className="space-y-2 text-xs text-[#E8E3DD]">
                    <li className="flex items-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-[#3B82F6]" />
                      <span>Calculated live from active database logs</span>
                    </li>
                    <li className="flex items-center space-x-2">
                      <FiCheckCircle className="w-4 h-4 text-[#3B82F6]" />
                      <span>Restricted strictly to HR & Admin roles</span>
                    </li>
                  </ul>
                </div>
                <div className="p-6 bg-[#141312] border border-[#2B2825] rounded-2xl font-mono text-xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#E8E3DD]">Attendance Rate Trends</span>
                    <span className="text-[#709775] flex items-center space-x-1">
                      <FiTrendingUp className="w-3.5 h-3.5" />
                      <span>+4.2% this week</span>
                    </span>
                  </div>
                  <div className="space-y-2">
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#A39C95]">Engineering Dept</span>
                        <span className="text-[#709775]">98% Present</span>
                      </div>
                      <div className="h-2 bg-[#24211F] rounded-full overflow-hidden">
                        <div className="h-full bg-[#709775] w-[98%]" />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <div className="flex justify-between text-[11px]">
                        <span className="text-[#A39C95]">People & Culture</span>
                        <span className="text-[#F4A261]">92% Present</span>
                      </div>
                      <div className="h-2 bg-[#24211F] rounded-full overflow-hidden">
                        <div className="h-full bg-[#F4A261] w-[92%]" />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </section>

      {/* 4. FEATURES GRID WITH STAGGERED SCROLL ANIMATION */}
      <section id="features" className="py-20 border-b border-[#292624]">
        <div className="max-w-7xl mx-auto px-6 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-3"
          >
            <span className="text-xs font-mono font-bold text-[#E07A5F] uppercase tracking-wider">Comprehensive Suite</span>
            <h2 className="font-crimson text-3xl sm:text-4xl font-bold text-[#E8E3DD]">
              Everything Your Team Needs to Excel
            </h2>
            <p className="text-sm text-[#A39C95]">
              Designed from the ground up to replace fragmented HR spreadsheets with a single, elegant platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: (i % 4) * 0.1 }}
                className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-4 hover:border-[#E07A5F]/60 transition-all duration-300 transform hover:-translate-y-1 group"
              >
                <div className="flex items-center justify-between">
                  <div className="p-3 rounded-xl bg-[#141312] border border-[#2B2825] group-hover:border-[#E07A5F]/40 transition-colors">
                    {item.icon}
                  </div>
                  <span className="text-[10px] font-mono text-[#78726A] uppercase px-2 py-0.5 rounded bg-[#141312]">
                    {item.badge}
                  </span>
                </div>
                <h3 className="font-crimson text-xl font-bold text-[#E8E3DD] group-hover:text-[#E07A5F] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[#A39C95] leading-relaxed">
                  {item.desc}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* 5. WORKFLOW ONBOARDING WITH ANIMATION */}
      <section id="workflow" className="py-20 border-b border-[#292624] bg-[#181716]/40">
        <div className="max-w-7xl mx-auto px-6 space-y-16">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center max-w-2xl mx-auto space-y-3"
          >
            <span className="text-xs font-mono font-bold text-[#709775] uppercase tracking-wider">3-Step Onboarding</span>
            <h2 className="font-crimson text-3xl sm:text-4xl font-bold text-[#E8E3DD]">
              Get Started in Minutes
            </h2>
            <p className="text-sm text-[#A39C95]">
              Seamless onboarding for admins and team members with zero complex setup.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-8 shadow-xl text-center space-y-4 relative"
            >
              <div className="w-12 h-12 rounded-full bg-[#E07A5F]/15 border border-[#E07A5F]/40 text-[#E07A5F] font-mono font-bold text-lg flex items-center justify-center mx-auto">
                01
              </div>
              <h3 className="font-crimson text-xl font-bold text-[#E8E3DD]">Sign In or Create Organization</h3>
              <p className="text-xs text-[#A39C95] leading-relaxed">
                Log in as HR Manager or standard employee using your assigned login credentials.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-8 shadow-xl text-center space-y-4 relative"
            >
              <div className="w-12 h-12 rounded-full bg-[#709775]/15 border border-[#709775]/40 text-[#709775] font-mono font-bold text-lg flex items-center justify-center mx-auto">
                02
              </div>
              <h3 className="font-crimson text-xl font-bold text-[#E8E3DD]">Check In & Manage Workday</h3>
              <p className="text-xs text-[#A39C95] leading-relaxed">
                Click Check-In at shift start. Dayflow tracks attendance, half-days, leaves, and overtime automatically.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-8 shadow-xl text-center space-y-4 relative"
            >
              <div className="w-12 h-12 rounded-full bg-[#F4A261]/15 border border-[#F4A261]/40 text-[#F4A261] font-mono font-bold text-lg flex items-center justify-center mx-auto">
                03
              </div>
              <h3 className="font-crimson text-xl font-bold text-[#E8E3DD]">Review Slips & Analytics</h3>
              <p className="text-xs text-[#A39C95] leading-relaxed">
                Employees view their salary breakdown, while HR accesses executive reports and printable pay slips.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 6. FAQ ACCORDION WITH ANIMATION */}
      <section id="faq" className="py-20 border-b border-[#292624]">
        <div className="max-w-4xl mx-auto px-6 space-y-12">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-3"
          >
            <span className="text-xs font-mono font-bold text-[#E07A5F] uppercase tracking-wider">Got Questions?</span>
            <h2 className="font-crimson text-3xl sm:text-4xl font-bold text-[#E8E3DD]">
              Frequently Asked Questions
            </h2>
          </motion.div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: idx * 0.1 }}
                  className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl overflow-hidden transition-colors"
                >
                  <button
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left flex items-center justify-between focus:outline-none"
                  >
                    <span className="font-crimson text-lg font-bold text-[#E8E3DD]">{faq.q}</span>
                    <FiChevronDown className={`w-5 h-5 text-[#E07A5F] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="px-5 pb-5 text-xs text-[#A39C95] leading-relaxed border-t border-[#292624] pt-3 font-carme">
                      {faq.a}
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 7. GLASSMORPHIC CTA WITH ANIMATION */}
      <section className="py-24 relative overflow-hidden">
        <div className="max-w-5xl mx-auto px-6 relative z-10">
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="bg-gradient-to-r from-[#1C1A19] via-[#24211F] to-[#1C1A19] border border-[#E07A5F]/40 rounded-3xl p-12 shadow-2xl text-center space-y-6 relative overflow-hidden"
          >
            <div className="absolute -top-24 -left-24 w-48 h-48 bg-[#E07A5F]/20 rounded-full blur-3xl" />
            <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-[#709775]/20 rounded-full blur-3xl" />

            <h2 className="font-crimson text-4xl sm:text-5xl font-extrabold text-[#E8E3DD]">
              Ready to Upgrade Your HR System?
            </h2>
            <p className="text-sm text-[#A39C95] max-w-xl mx-auto">
              Join teams managing workforce rosters, attendance, leaves, and salary slips effortlessly with Dayflow.
            </p>
            <div className="pt-4 flex justify-center">
              <button
                onClick={() => navigate('/login')}
                className="px-8 py-4 rounded-xl bg-[#E07A5F] text-sm font-bold text-white hover:bg-[#D0694E] transition-all flex items-center space-x-2 shadow-2xl shadow-[#E07A5F]/30 hover:scale-105"
              >
                <span>Launch Dayflow Portal Now</span>
                <FiArrowRight className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 8. FOOTER */}
      <footer className="bg-[#181716] border-t border-[#292624] py-10 font-carme text-xs text-[#78726A]">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Dayflow" className="h-7 w-auto opacity-70" />
            <span className="font-crimson font-bold text-[#E8E3DD] text-sm">Dayflow Technologies Inc.</span>
          </div>

          <div className="flex items-center space-x-6 text-[#A39C95]">
            <a href="#features" className="hover:text-[#E07A5F] transition-colors">Features</a>
            <a href="#preview" className="hover:text-[#E07A5F] transition-colors">Preview</a>
            <a href="#faq" className="hover:text-[#E07A5F] transition-colors">FAQ</a>
            <button onClick={() => navigate('/login')} className="hover:text-[#E07A5F] transition-colors font-bold text-[#E8E3DD]">
              Login
            </button>
          </div>

          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#709775] animate-ping" />
            <span>© 2026 Dayflow HRMS — All Rights Reserved</span>
          </div>
        </div>
      </footer>
    </div>
  );
};
