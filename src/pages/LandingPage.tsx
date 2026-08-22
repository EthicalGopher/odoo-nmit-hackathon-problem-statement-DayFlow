import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiUsers,
  FiClock,
  FiCalendar,
  FiBarChart2,
  FiShield,
  FiMail,
  FiFileText,
  FiActivity,
  FiCheck,
  FiArrowRight,
} from 'react-icons/fi';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { currentUser, isLoadingSession } = useAuth();

  // Only redirect once session validation has completed
  useEffect(() => {
    if (!isLoadingSession && currentUser) {
      navigate('/employees', { replace: true });
    }
  }, [currentUser, isLoadingSession, navigate]);

  // Don't render landing page content while session is being validated
  if (isLoadingSession) {
    return (
      <div className="min-h-screen bg-[#141312] flex items-center justify-center">
        <div className="flex flex-col items-center space-y-3">
          <div className="w-10 h-10 border-4 border-[#E07A5F] border-t-transparent rounded-full animate-spin" />
          <img src="/logo.png" alt="Dayflow" className="h-10 w-auto object-contain opacity-60" />
          <span className="font-carme text-xs text-[#A39C95]">Loading Dayflow...</span>
        </div>
      </div>
    );
  }

  const features = [
    {
      icon: <FiUsers className="w-6 h-6 text-[#E07A5F]" />,
      title: 'Employee Directory',
      desc: 'Centralized employee profiles with roles, departments, and contact information.',
    },
    {
      icon: <FiClock className="w-6 h-6 text-[#E07A5F]" />,
      title: 'Attendance Tracking',
      desc: 'Real-time check-in/check-out with automatic work-hour and overtime calculation.',
    },
    {
      icon: <FiCalendar className="w-6 h-6 text-[#E07A5F]" />,
      title: 'Leave Management',
      desc: 'Streamlined leave requests with Indian holiday calendar integration and callback workflows.',
    },
    {
      icon: <FiMail className="w-6 h-6 text-[#E07A5F]" />,
      title: 'Internal Messaging',
      desc: 'Secure private messaging between employees with real-time unread counts.',
    },
    {
      icon: <FiBarChart2 className="w-6 h-6 text-[#E07A5F]" />,
      title: 'Analytics & Reports',
      desc: 'Executive dashboards with attendance trends, payroll allocation, and work-hour analytics.',
    },
    {
      icon: <FiFileText className="w-6 h-6 text-[#E07A5F]" />,
      title: 'Salary Slips',
      desc: 'Printable salary slips with detailed earnings breakdown and deduction calculations.',
    },
    {
      icon: <FiShield className="w-6 h-6 text-[#E07A5F]" />,
      title: 'Role-Based Access',
      desc: 'Granular permissions — HR gets full control, employees see their own data only.',
    },
    {
      icon: <FiActivity className="w-6 h-6 text-[#E07A5F]" />,
      title: 'Live Dashboard',
      desc: 'Real-time attendance status with auto-refresh and instant notifications.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#141312] text-[#E8E3DD] font-carme">
      {/* Header / Nav */}
      <header className="bg-[#1C1A19] border-b border-[#332F2C]">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Dayflow" className="h-16 scale-200 w-auto object-contain" />
          </div>

          <nav className="hidden md:flex items-center space-x-6 text-sm text-[#A39C95] hover:text-[#E8E3DD] transition-colors">
            <a href="#features" className="hover:text-[#E07A5F]">Features</a>
            <a href="#about" className="hover:text-[#E07A5F]">About</a>
          </nav>

          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/login')}
              className="px-4 py-2 rounded-xl bg-transparent border border-[#332F2C] text-xs font-semibold text-[#A39C95] hover:border-[#E07A5F] hover:text-[#E07A5F] transition-colors"
            >
              Sign In
            </button>
            <button
              onClick={() => navigate('/login')}
              className="px-5 py-2 rounded-xl bg-[#E07A5F] text-xs font-semibold text-white hover:bg-[#E07A5F]/90 transition-colors flex items-center space-x-1.5"
            >
              <span>Sign Up</span>
              <FiArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 md:py-28">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <h1 className="font-crimson text-5xl md:text-6xl font-bold text-[#E8E3DD] leading-tight">
                Modern HR.
                <br />
                <span className="text-[#E07A5F]">Simplified.</span>
              </h1>
              <p className="text-lg text-[#A39C95] max-w-lg font-carme">
                Dayflow is an all-in-one Human Resource Management System that streamlines employee
                data, attendance, leave requests, payroll, and internal communication for modern
                teams.
              </p>
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 rounded-xl bg-[#E07A5F] text-sm font-semibold text-white hover:bg-[#E07A5F]/90 transition-colors flex items-center space-x-2"
                >
                  <span>Get Started</span>
                  <FiArrowRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => navigate('/login')}
                  className="px-6 py-3 rounded-xl bg-transparent border border-[#332F2C] text-sm font-semibold text-[#E8E3DD] hover:border-[#E07A5F] hover:text-[#E07A5F] transition-colors"
                >
                  Book a Demo
                </button>
              </div>
              <p className="text-xs text-[#78726A]">
                No credit card required. 14-day free trial.
              </p>
            </div>

            <div className="relative">
              <div className="bg-[#1C1A19] border border-[#332F2C] rounded-3xl shadow-2xl overflow-hidden">
                <div className="border-b border-[#292624] px-6 py-4 flex items-center space-x-3">
                  <img src="/logo.png" alt="Dayflow" className="h-6 w-auto opacity-80" />
                  <span className="font-crimson text-lg font-bold text-[#E8E3DD]">Dayflow Dashboard</span>
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-8 bg-gradient-to-r from-[#2B2825] to-[#141312] rounded-xl animate-pulse" />
                  <div className="grid grid-cols-3 gap-3">
                    <div className="h-20 bg-[#1C1A19] border border-[#332F2C] rounded-xl" />
                    <div className="h-20 bg-[#1C1A19] border border-[#332F2C] rounded-xl" />
                    <div className="h-20 bg-[#1C1A19] border border-[#332F2C] rounded-xl" />
                  </div>
                  <div className="h-6 w-3/4 bg-[#2B2825] rounded animate-pulse" />
                  <div className="h-6 w-1/2 bg-[#2B2825] rounded animate-pulse" />
                  <div className="h-40 bg-[#1C1A19] border border-[#332F2C] rounded-xl" />
                </div>
              </div>
              <div className="absolute -bottom-6 -right-6 w-32 h-32 bg-[#E07A5F]/10 rounded-full blur-3xl" />
              <div className="absolute -top-8 -left-8 w-24 h-24 bg-[#709775]/10 rounded-full blur-2xl" />
            </div>
          </div>
        </div>
      </section>


      {/* Features Section */}
      <section id="features" className="py-20">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-crimson text-3xl font-bold text-[#E8E3DD] mb-3">
              Everything your HR needs
            </h2>
            <p className="text-sm text-[#A39C95] max-w-2xl mx-auto">
              From employee onboarding to monthly payroll and everything in between.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, i) => (
              <div key={i} className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-4 hover:border-[#E07A5F]/40 transition-colors">
                <div className="bg-[#141312] border border-[#2B2825] w-12 h-12 rounded-xl flex items-center justify-center">
                  {feature.icon}
                </div>
                <h3 className="font-crimson text-lg font-bold text-[#E8E3DD]">
                  {feature.title}
                </h3>
                <p className="text-xs text-[#78726A] leading-relaxed">
                  {feature.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section id="about" className="py-20 border-t border-[#292624]">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-crimson text-3xl font-bold text-[#E8E3DD] mb-3">
              Simple. Intuitive. Powerful.
            </h2>
            <p className="text-sm text-[#A39C95] max-w-2xl mx-auto">
              Get up and running in minutes, not weeks.
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto bg-[#1C1A19] border border-[#332F2C] rounded-full flex items-center justify-center text-2xl font-crimson font-bold text-[#E07A5F]">
                1
              </div>
              <h3 className="font-crimson text-xl font-bold text-[#E8E3DD]">Create Company</h3>
              <p className="text-sm text-[#78726A]">
                Set up your company profile and invite your team in seconds.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto bg-[#1C1A19] border border-[#332F2C] rounded-full flex items-center justify-center text-2xl font-crimson font-bold text-[#E07A5F]">
                2
              </div>
              <h3 className="font-crimson text-xl font-bold text-[#E8E3DD]">Manage Daily Ops</h3>
              <p className="text-sm text-[#78726A]">
                Track attendance, manage leaves, process payroll — all in one place.
              </p>
            </div>
            <div className="text-center space-y-4">
              <div className="w-14 h-14 mx-auto bg-[#1C1A19] border border-[#332F2C] rounded-full flex items-center justify-center text-2xl font-crimson font-bold text-[#E07A5F]">
                3
              </div>
              <h3 className="font-crimson text-xl font-bold text-[#E8E3DD]">Scale Effortlessly</h3>
              <p className="text-sm text-[#78726A]">
                Analytics and insights help you grow with confidence.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 border-t border-[#292624]">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="font-crimson text-3xl md:text-4xl font-bold text-[#E8E3DD] mb-4">
            Ready to transform your HR?
          </h2>
          <p className="text-sm text-[#A39C95] mb-8 max-w-2xl mx-auto">
            Join thousands of companies already managing their workforce with Dayflow.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="px-8 py-3 rounded-xl bg-[#E07A5F] text-sm font-semibold text-white hover:bg-[#E07A5F]/90 transition-colors flex items-center space-x-2 mx-auto"
          >
            <span>Get Started — It’s Free</span>
            <FiArrowRight className="w-4 h-4" />
          </button>
          <p className="text-xs text-[#78726A] mt-4">
            No credit card required. Cancel anytime.
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#292624] py-8">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between text-xs text-[#78726A]">
          <div className="flex items-center space-x-3">
            <img src="/logo.png" alt="Dayflow" className="h-6 w-auto opacity-60" />
            <span className="font-crimson font-bold text-[#E8E3DD]">Dayflow</span>
          </div>
          <div className="flex items-center space-x-6 mt-4 md:mt-0">
            <span className="flex items-center space-x-1">
              <FiCheck className="w-3 h-3 text-[#709775]" />
              <span>© 2026 Dayflow HRMS</span>
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
};
