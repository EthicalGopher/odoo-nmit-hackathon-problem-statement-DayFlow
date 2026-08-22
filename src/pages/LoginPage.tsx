import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FiMail,
  FiLock,
  FiUser,
  FiPhone,
  FiEye,
  FiEyeOff,
  FiAlertCircle,
  FiCheckCircle,
  FiArrowRight,
  FiBriefcase,
  FiUploadCloud,
} from 'react-icons/fi';

export const LoginPage: React.FC = () => {
  const { login, register } = useAuth();
  const navigate = useNavigate();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');

  // Form states
  const [loginIdOrEmail, setLoginIdOrEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Sign Up states
  const [companyName, setCompanyName] = useState('Odoo India');
  const [companyLogo, setCompanyLogo] = useState<string>('');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [error, setError] = useState<string | null>(null);
  const [registeredLoginId, setRegisteredLoginId] = useState<string | null>(null);

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setCompanyLogo(event.target.result as string);
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      await login(loginIdOrEmail, password);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Incorrect credentials. Please check your Email / Login ID and password.');
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!name.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Password and Confirm Password do not match.');
      return;
    }

    try {
      const res = await register({
        companyName,
        companyLogo: companyLogo || undefined,
        name,
        email,
        phone,
        password,
        role: 'HR',
      });

      const assignedId = res.user?.employeeId || 'OIALME20260001';
      setRegisteredLoginId(assignedId);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <div className="min-h-screen bg-[#141312] text-[#E8E3DD] flex items-center justify-center p-6 relative overflow-hidden font-carme select-none">
      {/* Background Decorative Accent Blobs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-[#E07A5F]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-[#582C35]/15 rounded-full blur-3xl pointer-events-none" />

      {/* Main Standard Authentication Card */}
      <div className="w-full max-w-md bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-8 shadow-2xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <img
            src="/logo.png"
            alt="Company Logo"
            className="h-16 scale-200 w-auto mx-auto object-contain mb-2 max-w-[220px]"
          />
          <p className="text-xs text-[#A39C95] mt-1 font-carme">
            Human Resource Management System
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="grid grid-cols-2 p-1 bg-[#141312] border border-[#332F2C] rounded-xl mb-6 text-xs font-semibold">
          <button
            type="button"
            onClick={() => {
              setMode('signin');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${mode === 'signin'
              ? 'bg-[#2B2825] text-[#E07A5F] shadow-sm'
              : 'text-[#A39C95] hover:text-[#E8E3DD]'
              }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => {
              setMode('signup');
              setError(null);
            }}
            className={`py-2 rounded-lg transition-all ${mode === 'signup'
              ? 'bg-[#2B2825] text-[#E07A5F] shadow-sm'
              : 'text-[#A39C95] hover:text-[#E8E3DD]'
              }`}
          >
            Sign Up
          </button>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div className="mb-5 p-3 rounded-xl bg-[#291B1B] border border-[#E06C68] text-[#E06C68] text-xs flex items-center space-x-2">
            <FiAlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* ================ SIGN IN FORM ================ */}
        {mode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold text-[#A39C95] mb-1">
                Email or Login ID :-
              </label>
              <div className="relative">
                <FiMail className="w-4 h-4 text-[#78726A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={loginIdOrEmail}
                  onChange={e => setLoginIdOrEmail(e.target.value)}
                  placeholder="alex.mercer@dayflow.io or OIALME20220001"
                  className="w-full bg-[#141312] border border-[#332F2C] rounded-xl pl-9 pr-4 py-2.5 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A39C95] mb-1">
                Password :-
              </label>
              <div className="relative">
                <FiLock className="w-4 h-4 text-[#78726A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#141312] border border-[#332F2C] rounded-xl pl-9 pr-10 py-2.5 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78726A] hover:text-[#E8E3DD]"
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center space-x-2 text-[#A39C95] cursor-pointer">
                <input type="checkbox" defaultChecked className="rounded border-[#332F2C] accent-[#E07A5F]" />
                <span>Remember me</span>
              </label>
              <span className="text-[11px] text-[#78726A] font-mono">ID format: OIJODO20220001</span>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#E07A5F] text-white font-bold text-xs hover:bg-[#D0694E] transition-all flex items-center justify-center space-x-2 shadow-lg uppercase tracking-wider mt-2"
            >
              <span>SIGN IN</span>
              <FiArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* ================ SIGN UP FORM ================ */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-3.5">
            <div>
              <label className="block text-xs font-semibold text-[#A39C95] mb-1">Company Name & Logo :-</label>
              <div className="flex items-center space-x-2">
                <div className="relative flex-1">
                  <FiBriefcase className="w-4 h-4 text-[#78726A] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={companyName}
                    onChange={e => setCompanyName(e.target.value)}
                    placeholder="e.g. Odoo India"
                    className="w-full bg-[#141312] border border-[#332F2C] rounded-xl pl-9 pr-4 py-2 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
                    required
                  />
                </div>
                <label className="px-3 py-2 bg-[#24211F] border border-[#332F2C] hover:border-[#E07A5F] rounded-xl text-[11px] font-semibold text-[#E8E3DD] cursor-pointer flex items-center space-x-1 shrink-0">
                  <FiUploadCloud className="w-3.5 h-3.5 text-[#E07A5F]" />
                  <span>{companyLogo ? 'Uploaded ✓' : 'Upload Logo'}</span>
                  <input type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A39C95] mb-1">Name :-</label>
              <div className="relative">
                <FiUser className="w-4 h-4 text-[#78726A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="e.g. HR Manager"
                  className="w-full bg-[#141312] border border-[#332F2C] rounded-xl pl-9 pr-4 py-2 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A39C95] mb-1">Email :-</label>
              <div className="relative">
                <FiMail className="w-4 h-4 text-[#78726A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="alex.mercer@dayflow.io"
                  className="w-full bg-[#141312] border border-[#332F2C] rounded-xl pl-9 pr-4 py-2 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A39C95] mb-1">Phone :-</label>
              <div className="relative">
                <FiPhone className="w-4 h-4 text-[#78726A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={phone}
                  onChange={e => setPhone(e.target.value)}
                  placeholder="+1 (555) 234-5678"
                  className="w-full bg-[#141312] border border-[#332F2C] rounded-xl pl-9 pr-4 py-2 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A39C95] mb-1">Password :-</label>
              <div className="relative">
                <FiLock className="w-4 h-4 text-[#78726A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#141312] border border-[#332F2C] rounded-xl pl-9 pr-10 py-2 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78726A] hover:text-[#E8E3DD]"
                >
                  {showPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-[#A39C95] mb-1">Confirm Password :-</label>
              <div className="relative">
                <FiLock className="w-4 h-4 text-[#78726A] absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-[#141312] border border-[#332F2C] rounded-xl pl-9 pr-10 py-2 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#78726A] hover:text-[#E8E3DD]"
                >
                  {showConfirmPassword ? <FiEyeOff className="w-4 h-4" /> : <FiEye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-[#E07A5F] text-white font-bold text-xs hover:bg-[#D0694E] transition-all flex items-center justify-center space-x-2 shadow-lg uppercase tracking-wider mt-2"
            >
              <span>SIGN UP</span>
              <FiArrowRight className="w-4 h-4" />
            </button>
          </form>
        )}

        {/* HR Registration Note */}
        <div className="mt-6 pt-4 border-t border-[#292624] text-center">
          <p className="text-[11px] text-[#A39C95]">
            HR Officers register via <strong className="text-[#E07A5F]">Sign Up</strong> to set up their company. Employees sign in using credentials issued by HR.
          </p>
        </div>
      </div>

      {/* Account Created Confirmation Modal */}
      {registeredLoginId && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-[#1C1A19] border border-[#E07A5F] rounded-2xl p-8 max-w-md w-full text-center space-y-4 shadow-2xl animate-in zoom-in-95">
            <div className="w-14 h-14 rounded-full bg-[#1C251F] border border-[#709775] text-[#709775] mx-auto flex items-center justify-center text-2xl">
              <FiCheckCircle />
            </div>
            <h3 className="font-crimson font-bold text-2xl text-[#E8E3DD]">
              Account Registered Successfully!
            </h3>
            <p className="text-xs text-[#A39C95]">
              Your company HR Account has been created. Your system-generated Login ID is:
            </p>
            <div className="p-4 bg-[#141312] border border-[#332F2C] rounded-xl font-mono text-xl font-extrabold text-[#E07A5F]">
              {registeredLoginId}
            </div>
            <button
              type="button"
              onClick={() => {
                setRegisteredLoginId(null);
                navigate('/dashboard');
              }}
              className="w-full py-3 rounded-xl bg-[#E07A5F] text-white font-bold text-xs hover:bg-[#D0694E] transition-colors"
            >
              Continue to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
