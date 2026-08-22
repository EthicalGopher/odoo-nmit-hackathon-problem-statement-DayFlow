import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import { UserAvatar } from '../components/ui/UserAvatar';
import {
  FiUser,
  FiBriefcase,
  FiDollarSign,
  FiShield,
  FiEdit2,
  FiPlus,
  FiLock,
  FiCheckCircle,
  FiCamera,
  FiSave,
} from 'react-icons/fi';

export const ProfilePage: React.FC = () => {
  const { currentUser, role, allEmployees, refreshEmployees } = useAuth();
  const [activeTab, setActiveTab] = useState<'resume' | 'private' | 'salary' | 'security'>('resume');

  const hrManager = allEmployees.find(e => e.role === 'HR');
  const fallbackHRName = hrManager ? `${hrManager.name} (HR Manager)` : 'Sankhyahrick Swami (HR Manager)';
  const isHR = role === 'HR';
  const managerDisplayName = currentUser?.managerName || (isHR ? 'Self (HR Manager)' : fallbackHRName);

  // Avatar Picture Upload State
  const [avatarUrl, setAvatarUrl] = useState('');

  // Resume Tab - Editable States
  const [isEditing, setIsEditing] = useState(false);
  const [about, setAbout] = useState('');
  const [whatILove, setWhatILove] = useState('');
  const [interests, setInterests] = useState('');

  // Private Info Tab - Read Only for Users (Managed by HR from /employees)
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [nationality, setNationality] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [gender, setGender] = useState('');
  const [joiningDate, setJoiningDate] = useState('');
  const [location, setLocation] = useState(currentUser?.location || 'San Francisco, CA');
  const [accountNumber, setAccountNumber] = useState('');
  const [bankName, setBankName] = useState('');
  const [ifscCode, setIfscCode] = useState('');
  const [panNo, setPanNo] = useState('');
  const [uanNo, setUanNo] = useState('');

  // Dynamic Salary Configuration State (Admin / HR)
  const [monthWage, setMonthWage] = useState<number>(50000);
  const [workingDays, setWorkingDays] = useState<number>(currentUser?.workingDays || 5);
  const [breakTime, setBreakTime] = useState<number>(1);
  const [basicSalary, setBasicSalary] = useState<number>(25000);
  const [hra, setHra] = useState<number>(12500);
  const [standardAllowance, setStandardAllowance] = useState<number>(4167);
  const [performanceBonus, setPerformanceBonus] = useState<number>(2085);
  const [lta, setLta] = useState<number>(2085);

  const handleMonthWageChange = (newWage: number) => {
    setMonthWage(newWage);
    const basic = newWage * 0.50;
    setBasicSalary(basic);
    setHra(basic * 0.50);
    setStandardAllowance(4167);
    setPerformanceBonus(Math.round(basic * 0.0833));
    setLta(Math.round(basic * 0.0833));
  };

  // Skills & Certifications List
  const [skills, setSkills] = useState<string[]>([]);
  const [newSkill, setNewSkill] = useState('');
  const [certifications, setCertifications] = useState<string[]>([]);
  const [newCert, setNewCert] = useState('');

  // Gmail App Password State for HR Live SMTP
  const [gmailAppPassword, setGmailAppPassword] = useState('');
  const [gmailSaved, setGmailSaved] = useState(false);

  const handleSaveGmailAppPassword = async () => {
    if (!currentUser) return;
    try {
      await api.updateProfile(currentUser.employeeId, {
        gmailAppPassword,
      });
      setGmailSaved(true);
      setTimeout(() => setGmailSaved(false), 4000);
    } catch (err) {
      console.error('Failed to save Gmail app password', err);
    }
  };

  // Password Security State
  const [currentPass, setCurrentPass] = useState('');
  const [newPass, setNewPass] = useState('');
  const [confirmNewPass, setConfirmNewPass] = useState('');
  const [passUpdated, setPassUpdated] = useState(false);
  const [passError, setPassError] = useState<string | null>(null);

  // Salary Save State
  const [salarySaved, setSalarySaved] = useState(false);
  const [isSavingSalary, setIsSavingSalary] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setAddress(currentUser.address || '');
      setLocation(currentUser.location || 'San Francisco, CA');
      setWorkingDays(currentUser.workingDays || 5);
      setJoiningDate(currentUser.joiningDate || '');
      setAvatarUrl(currentUser.avatarUrl || '');
      setDob(currentUser.dob || '');
      setNationality(currentUser.nationality || '');
      setPersonalEmail(currentUser.personalEmail || currentUser.email || '');
      setGender(currentUser.gender || '');
      setAccountNumber(currentUser.accountNumber || '');
      setBankName(currentUser.bankName || '');
      setIfscCode(currentUser.ifscCode || '');
      setPanNo(currentUser.panNo || '');
      setUanNo(currentUser.uanNo || '');

      api.getPayroll(currentUser.employeeId).then(pData => {
        const pr = Array.isArray(pData) ? pData[0] : pData;
        if (pr && pr.monthWage) {
          const mw = pr.monthWage;
          setMonthWage(mw);
          setBasicSalary(pr.basicSalary || mw * 0.50);
          setHra(pr.hra || mw * 0.25);
          setStandardAllowance(pr.standardAllowance || 4167);
          setPerformanceBonus(pr.performanceBonus || Math.round(mw * 0.0417));
          setLta(pr.leaveTravelAllowance || Math.round(mw * 0.0417));
        }
      }).catch(() => {});
    }
  }, [currentUser]);

  const handleAvatarUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0] && currentUser) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = async (event) => {
        if (event.target?.result) {
          const newAvatar = event.target.result as string;
          setAvatarUrl(newAvatar);
          try {
            await api.updateProfile(currentUser.employeeId, { avatarUrl: newAvatar });
          } catch (err) {
            console.error('Failed to update profile picture', err);
          }
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSaveSalaryDetails = async () => {
    if (!currentUser) return;
    setIsSavingSalary(true);
    try {
      await api.updateProfile(currentUser.employeeId, {
        monthWage,
        workingDays,
        breakTime,
        basicSalary,
        hra,
        standardAllowance,
        performanceBonus,
        leaveTravelAllowance: lta,
      });
      await refreshEmployees();
      setSalarySaved(true);
      setTimeout(() => setSalarySaved(false), 4000);
    } catch (err) {
      console.error('Failed to save salary details', err);
    } finally {
      setIsSavingSalary(false);
    }
  };

  // Dynamic Derived Calculations
  const yearlyWage = monthWage * 12;
  const fixedAllowance = Math.max(0, monthWage - (basicSalary + hra + standardAllowance + performanceBonus + lta));
  const pfEmployee = basicSalary * 0.12;
  const pfEmployer = basicSalary * 0.12;
  const profTax = 200;
  const netTakeHome = (basicSalary + hra + standardAllowance + performanceBonus + lta + fixedAllowance) - (pfEmployee + profTax);

  const handleAddSkill = () => {
    if (newSkill.trim() && !skills.includes(newSkill.trim())) {
      setSkills([...skills, newSkill.trim()]);
      setNewSkill('');
    }
  };

  const handleAddCert = () => {
    if (newCert.trim() && !certifications.includes(newCert.trim())) {
      setCertifications([...certifications, newCert.trim()]);
      setNewCert('');
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPassError(null);

    if (newPass !== confirmNewPass) {
      setPassError('New Password and Confirm Password do not match.');
      return;
    }

    if (!currentUser) return;

    try {
      await api.changePassword(currentUser.employeeId, currentPass, newPass);
      setPassUpdated(true);
      setCurrentPass('');
      setNewPass('');
      setConfirmNewPass('');
      setTimeout(() => setPassUpdated(false), 4000);
    } catch (err: any) {
      setPassError(err.message || 'Failed to update password');
    }
  };

  if (!currentUser) return null;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto font-carme text-[#E8E3DD]">
      {/* 1. HEADER PROFILE CARD */}
      <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
          {/* Left Column: Avatar Picture with Upload Capability */}
          <div className="md:col-span-3 flex flex-col items-center justify-center relative border-r border-[#292624] pr-4">
            <div className="relative group cursor-pointer">
              <UserAvatar name={currentUser.name} src={avatarUrl || currentUser.avatarUrl} size="w-28 h-28" />
              <label
                className="absolute bottom-1 right-1 p-2.5 rounded-full bg-[#E07A5F] text-white shadow-lg hover:scale-110 transition-transform cursor-pointer"
                title="Upload Profile Picture"
              >
                <FiCamera className="w-4 h-4" />
                <input type="file" accept="image/*" onChange={handleAvatarUpload} className="hidden" />
              </label>
            </div>
            <span className="text-[10px] text-[#A39C95] font-mono mt-2">Click icon to upload photo</span>
          </div>

          {/* Center Column: Primary Employee Details */}
          <div className="md:col-span-5 space-y-1.5 border-r border-[#292624] pr-4">
            <h2 className="font-crimson text-3xl font-bold text-[#E8E3DD]">
              {currentUser.name}
            </h2>
            <div className="text-xs font-semibold text-[#E07A5F]">
              {currentUser.jobTitle || (isHR ? 'Head of HR Operations' : 'Role Not Assigned')}
            </div>
            <div className="space-y-1 text-xs text-[#A39C95] font-mono pt-1">
              <div><span className="text-[#78726A]">Login ID:</span> <span className="text-[#E8E3DD] font-bold">{currentUser.employeeId}</span></div>
              <div><span className="text-[#78726A]">Email:</span> <span className="text-[#E8E3DD]">{currentUser.email}</span></div>
              <div><span className="text-[#78726A]">Mobile:</span> <span className="text-[#E8E3DD]">{currentUser.phone || 'Not Provided'}</span></div>
            </div>
          </div>

          {/* Right Column: Organizational Context */}
          <div className="md:col-span-4 space-y-1.5 text-xs text-[#A39C95]">
            <div><span className="text-[#78726A]">Company:</span> <span className="text-[#E8E3DD] font-semibold">{currentUser.companyName || 'Odoo India'}</span></div>
            <div><span className="text-[#78726A]">Department:</span> <span className="text-[#709775] font-semibold">{currentUser.department || (isHR ? 'People & Culture' : 'Not Assigned')}</span></div>
            <div><span className="text-[#78726A]">Manager:</span> <span className="text-[#E8E3DD] font-bold">{managerDisplayName}</span></div>
            <div><span className="text-[#78726A]">Location:</span> <span className="text-[#E8E3DD] font-semibold">{location || currentUser?.location || 'San Francisco, CA'}</span></div>
          </div>
        </div>
      </div>

      {/* 2. PROFILE TABS NAVIGATION */}
      <div className="flex items-center space-x-2 border-b border-[#292624] pb-1 text-xs font-bold">
        <button
          onClick={() => setActiveTab('resume')}
          className={`px-5 py-2.5 rounded-t-xl transition-all flex items-center space-x-2 ${
            activeTab === 'resume'
              ? 'bg-[#1C1A19] border-t-2 border-[#E07A5F] text-[#E07A5F] shadow-md'
              : 'text-[#A39C95] hover:text-[#E8E3DD] hover:bg-[#24211F]'
          }`}
        >
          <FiUser className="w-4 h-4" />
          <span>Resume</span>
        </button>

        <button
          onClick={() => setActiveTab('private')}
          className={`px-5 py-2.5 rounded-t-xl transition-all flex items-center space-x-2 ${
            activeTab === 'private'
              ? 'bg-[#1C1A19] border-t-2 border-[#E07A5F] text-[#E07A5F] shadow-md'
              : 'text-[#A39C95] hover:text-[#E8E3DD] hover:bg-[#24211F]'
          }`}
        >
          <FiBriefcase className="w-4 h-4" />
          <span>Private Info</span>
        </button>

        {/* Salary Info Tab - Visible to all employees on their profile */}
        <button
          onClick={() => setActiveTab('salary')}
          className={`px-5 py-2.5 rounded-t-xl transition-all flex items-center space-x-2 ${
            activeTab === 'salary'
              ? 'bg-[#1C1A19] border-t-2 border-[#709775] text-[#709775] shadow-md'
              : 'text-[#A39C95] hover:text-[#E8E3DD] hover:bg-[#24211F]'
          }`}
        >
          <FiDollarSign className="w-4 h-4 text-[#709775]" />
          <span>Salary Info</span>
        </button>

        <button
          onClick={() => setActiveTab('security')}
          className={`px-5 py-2.5 rounded-t-xl transition-all flex items-center space-x-2 ${
            activeTab === 'security'
              ? 'bg-[#1C1A19] border-t-2 border-[#E07A5F] text-[#E07A5F] shadow-md'
              : 'text-[#A39C95] hover:text-[#E8E3DD] hover:bg-[#24211F]'
          }`}
        >
          <FiShield className="w-4 h-4" />
          <span>Security</span>
        </button>
      </div>

      {/* 3. TAB CONTENT CONTAINERS */}
      <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl">
        {/* ================= A. RESUME TAB ================= */}
        {activeTab === 'resume' && (
          <div className="space-y-6 text-xs">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column */}
              <div className="lg:col-span-7 space-y-5">
                {/* About Box */}
                <div className="p-5 bg-[#141312] border border-[#2B2825] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-crimson font-bold text-sm text-[#E8E3DD]">About</h4>
                    <FiEdit2 className="w-3.5 h-3.5 text-[#78726A] cursor-pointer hover:text-[#E07A5F]" onClick={() => setIsEditing(!isEditing)} />
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={about}
                      onChange={e => setAbout(e.target.value)}
                      placeholder="Write a brief professional bio description..."
                      className="w-full bg-[#1C1A19] border border-[#332F2C] rounded-lg p-2 text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F]"
                    />
                  ) : (
                    <p className="text-[#A39C95] leading-relaxed">
                      {about.trim() ? about : 'No bio description provided yet.'}
                    </p>
                  )}
                </div>

                {/* What I Love About My Job */}
                <div className="p-5 bg-[#141312] border border-[#2B2825] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-crimson font-bold text-sm text-[#E8E3DD]">What I love about my job</h4>
                    <FiEdit2 className="w-3.5 h-3.5 text-[#78726A] cursor-pointer hover:text-[#E07A5F]" onClick={() => setIsEditing(!isEditing)} />
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={3}
                      value={whatILove}
                      onChange={e => setWhatILove(e.target.value)}
                      placeholder="What drives your passion in this role..."
                      className="w-full bg-[#1C1A19] border border-[#332F2C] rounded-lg p-2 text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F]"
                    />
                  ) : (
                    <p className="text-[#A39C95] leading-relaxed font-crafty">
                      {whatILove.trim() ? `"${whatILove}"` : 'No details added yet.'}
                    </p>
                  )}
                </div>

                {/* My Interests and Hobbies */}
                <div className="p-5 bg-[#141312] border border-[#2B2825] rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <h4 className="font-crimson font-bold text-sm text-[#E8E3DD]">My interests and hobbies</h4>
                    <FiEdit2 className="w-3.5 h-3.5 text-[#78726A] cursor-pointer hover:text-[#E07A5F]" onClick={() => setIsEditing(!isEditing)} />
                  </div>
                  {isEditing ? (
                    <textarea
                      rows={2}
                      value={interests}
                      onChange={e => setInterests(e.target.value)}
                      placeholder="Enter your interests and hobbies..."
                      className="w-full bg-[#1C1A19] border border-[#332F2C] rounded-lg p-2 text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F]"
                    />
                  ) : (
                    <p className="text-[#A39C95] leading-relaxed">
                      {interests.trim() ? interests : 'No details added yet.'}
                    </p>
                  )}
                </div>
              </div>

              {/* Right Column */}
              <div className="lg:col-span-5 space-y-5">
                {/* Skills Box */}
                <div className="p-5 bg-[#141312] border border-[#2B2825] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-crimson font-bold text-sm text-[#E8E3DD]">Skills</h4>
                    <span className="text-[10px] text-[#709775] font-mono">{skills.length} Skills</span>
                  </div>
                  {skills.length === 0 ? (
                    <p className="text-[#78726A] text-xs font-mono">No skills added yet.</p>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {skills.map((sk, idx) => (
                        <span key={idx} className="px-3 py-1 rounded-lg bg-[#24211F] text-[#E07A5F] border border-[#332F2C] text-xs font-semibold">
                          {sk}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-2 border-t border-[#292624]">
                    <input
                      type="text"
                      value={newSkill}
                      onChange={e => setNewSkill(e.target.value)}
                      placeholder="Add new skill..."
                      className="flex-1 bg-[#1C1A19] border border-[#332F2C] rounded-lg px-3 py-1.5 text-xs text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F]"
                    />
                    <button
                      onClick={handleAddSkill}
                      className="px-3 py-1.5 bg-[#E07A5F] text-white rounded-lg text-xs font-bold hover:bg-[#D0694E] flex items-center space-x-1"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>

                {/* Certifications Box */}
                <div className="p-5 bg-[#141312] border border-[#2B2825] rounded-xl space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-crimson font-bold text-sm text-[#E8E3DD]">Certifications</h4>
                    <span className="text-[10px] text-[#709775] font-mono">{certifications.length} Listed</span>
                  </div>

                  {certifications.length === 0 ? (
                    <p className="text-[#78726A] text-xs font-mono">No certifications added yet.</p>
                  ) : (
                    <div className="space-y-2 font-mono text-xs">
                      {certifications.map((cert, idx) => (
                        <div key={idx} className="p-2.5 rounded-lg bg-[#1C1A19] border border-[#332F2C] text-[#E8E3DD]">
                          {cert}
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center space-x-2 pt-2 border-t border-[#292624]">
                    <input
                      type="text"
                      value={newCert}
                      onChange={e => setNewCert(e.target.value)}
                      placeholder="Add new certification..."
                      className="flex-1 bg-[#1C1A19] border border-[#332F2C] rounded-lg px-3 py-1.5 text-xs text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F]"
                    />
                    <button
                      onClick={handleAddCert}
                      className="px-3 py-1.5 bg-[#E07A5F] text-white rounded-lg text-xs font-bold hover:bg-[#D0694E] flex items-center space-x-1"
                    >
                      <FiPlus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= B. PRIVATE INFO TAB (READ-ONLY FOR USERS - EDITABLE BY HR FROM EMPLOYEES ROUTE ONLY) ================= */}
        {activeTab === 'private' && (
          <div className="space-y-6 text-xs">
            {/* HR Notice Banner */}
            <div className="p-4 rounded-xl bg-[#24211F] border border-[#332F2C] text-[#F4A261] flex items-center space-x-3 text-xs font-mono">
              <FiLock className="w-4 h-4 shrink-0 text-[#E07A5F]" />
              <span>
                Private Information & Statutory Bank details can only be edited by the <strong>HR Manager</strong> via the Employees Roster route (<code>/employees</code>).
              </span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Sub-Column: Personal Data */}
              <div className="lg:col-span-6 space-y-4">
                <h3 className="font-crimson font-bold text-lg text-[#E8E3DD] border-b border-[#292624] pb-2">
                  Personal Data
                </h3>

                <div className="space-y-3">
                  <div className="p-3 bg-[#141312] border border-[#2B2825] rounded-xl space-y-1">
                    <label className="text-[#78726A] text-[11px] block font-semibold">Date of Birth</label>
                    <input
                      type="date"
                      value={dob || '1995-06-15'}
                      disabled
                      className="w-full bg-[#1C1A19]/50 border border-[#332F2C] rounded-lg px-3 py-2 text-[#A39C95] cursor-not-allowed"
                    />
                  </div>

                  <div className="p-3 bg-[#141312] border border-[#2B2825] rounded-xl space-y-1">
                    <label className="text-[#78726A] text-[11px] block font-semibold">Residing Address</label>
                    <input
                      type="text"
                      value={address || '100 Pine Street, Suite 2400, San Francisco, CA'}
                      disabled
                      className="w-full bg-[#1C1A19]/50 border border-[#332F2C] rounded-lg px-3 py-2 text-[#A39C95] cursor-not-allowed"
                    />
                  </div>

                  <div className="p-3 bg-[#141312] border border-[#2B2825] rounded-xl space-y-1">
                    <label className="text-[#78726A] text-[11px] block font-semibold">Work Location / City</label>
                    <input
                      type="text"
                      value={location || 'San Francisco, CA'}
                      disabled
                      className="w-full bg-[#1C1A19]/50 border border-[#332F2C] rounded-lg px-3 py-2 text-[#A39C95] cursor-not-allowed"
                    />
                  </div>

                  <div className="p-3 bg-[#141312] border border-[#2B2825] rounded-xl space-y-1">
                    <label className="text-[#78726A] text-[11px] block font-semibold">Working Days Per Week</label>
                    <input
                      type="text"
                      value={`${workingDays || 5} Days / Week`}
                      disabled
                      className="w-full bg-[#1C1A19]/50 border border-[#332F2C] rounded-lg px-3 py-2 text-[#A39C95] cursor-not-allowed"
                    />
                  </div>

                  <div className="p-3 bg-[#141312] border border-[#2B2825] rounded-xl space-y-1">
                    <label className="text-[#78726A] text-[11px] block font-semibold">Nationality</label>
                    <input
                      type="text"
                      value={nationality || 'Indian / American'}
                      disabled
                      className="w-full bg-[#1C1A19]/50 border border-[#332F2C] rounded-lg px-3 py-2 text-[#A39C95] cursor-not-allowed"
                    />
                  </div>

                  <div className="p-3 bg-[#141312] border border-[#2B2825] rounded-xl space-y-1">
                    <label className="text-[#78726A] text-[11px] block font-semibold">Personal Email</label>
                    <input
                      type="email"
                      value={personalEmail || currentUser?.email || 'user@dayflow.com'}
                      disabled
                      className="w-full bg-[#1C1A19]/50 border border-[#332F2C] rounded-lg px-3 py-2 text-[#A39C95] cursor-not-allowed"
                    />
                  </div>

                  <div className="p-3 bg-[#141312] border border-[#2B2825] rounded-xl space-y-1">
                    <label className="text-[#78726A] text-[11px] block font-semibold">Gender</label>
                    <input
                      type="text"
                      value={gender || 'Male'}
                      disabled
                      className="w-full bg-[#1C1A19]/50 border border-[#332F2C] rounded-lg px-3 py-2 text-[#A39C95] cursor-not-allowed"
                    />
                  </div>

                  <div className="p-3 bg-[#141312] border border-[#2B2825] rounded-xl space-y-1">
                    <label className="text-[#78726A] text-[11px] block font-semibold">Date of Joining</label>
                    <input
                      type="text"
                      value={joiningDate || currentUser?.joiningDate || '2024-01-15'}
                      disabled
                      className="w-full bg-[#1C1A19]/50 border border-[#332F2C] rounded-lg px-3 py-2 text-[#A39C95] cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>

              {/* Right Sub-Column: Bank Account Details */}
              <div className="lg:col-span-6 space-y-4">
                <h3 className="font-crimson font-bold text-lg text-[#E8E3DD] border-b border-[#292624] pb-2">
                  Bank Account & Statutory Info
                </h3>

                <div className="space-y-3 font-mono">
                  <div className="p-3 bg-[#141312] border border-[#2B2825] rounded-xl space-y-1">
                    <label className="text-[#78726A] text-[11px] block font-semibold font-sans">Account Number</label>
                    <input
                      type="text"
                      value={accountNumber || '5010023491823'}
                      disabled
                      className="w-full bg-[#1C1A19]/50 border border-[#332F2C] rounded-lg px-3 py-2 text-[#A39C95] cursor-not-allowed"
                    />
                  </div>

                  <div className="p-3 bg-[#141312] border border-[#2B2825] rounded-xl space-y-1">
                    <label className="text-[#78726A] text-[11px] block font-semibold font-sans">Bank Name</label>
                    <input
                      type="text"
                      value={bankName || 'HDFC Bank Ltd'}
                      disabled
                      className="w-full bg-[#1C1A19]/50 border border-[#332F2C] rounded-lg px-3 py-2 text-[#A39C95] cursor-not-allowed"
                    />
                  </div>

                  <div className="p-3 bg-[#141312] border border-[#2B2825] rounded-xl space-y-1">
                    <label className="text-[#78726A] text-[11px] block font-semibold font-sans">IFSC Code</label>
                    <input
                      type="text"
                      value={ifscCode || 'HDFC0001234'}
                      disabled
                      className="w-full bg-[#1C1A19]/50 border border-[#332F2C] rounded-lg px-3 py-2 text-[#A39C95] cursor-not-allowed"
                    />
                  </div>

                  <div className="p-3 bg-[#141312] border border-[#2B2825] rounded-xl space-y-1">
                    <label className="text-[#78726A] text-[11px] block font-semibold font-sans">PAN Number</label>
                    <input
                      type="text"
                      value={panNo || 'ABCDE1234F'}
                      disabled
                      className="w-full bg-[#1C1A19]/50 border border-[#332F2C] rounded-lg px-3 py-2 text-[#A39C95] cursor-not-allowed"
                    />
                  </div>

                  <div className="p-3 bg-[#141312] border border-[#2B2825] rounded-xl space-y-1">
                    <label className="text-[#78726A] text-[11px] block font-semibold font-sans">UAN Number</label>
                    <input
                      type="text"
                      value={uanNo || '100928374651'}
                      disabled
                      className="w-full bg-[#1C1A19]/50 border border-[#332F2C] rounded-lg px-3 py-2 text-[#A39C95] cursor-not-allowed"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ================= C. SALARY INFO TAB (LIVE DYNAMIC CALCULATIONS & CUSTOMIZATION) ================= */}
        {activeTab === 'salary' && (
          <div className="space-y-6 text-xs">
            {!isHR && (
              <div className="p-3 bg-[#141312] border border-[#332F2C] rounded-xl flex items-center justify-between font-mono text-[11px] text-[#A39C95]">
                <span className="flex items-center space-x-2">
                  <FiLock className="w-4 h-4 text-[#E07A5F]" />
                  <span>Read-Only Mode: Official salary compensation structure. Contact HR Operations for changes.</span>
                </span>
                <span className="px-2.5 py-1 rounded bg-[#24211F] border border-[#332F2C] text-[#709775] font-bold">Confidential</span>
              </div>
            )}

            {/* Header Controls: Month Wage & Working Days */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-5 bg-[#141312] border border-[#2B2825] rounded-2xl">
              <div className="space-y-4">
                <div className="flex items-center space-x-4">
                  <span className="text-[#E8E3DD] font-bold w-28">Month Wage (₹)</span>
                  <div className="flex items-center space-x-2 flex-1">
                    <input
                      type="number"
                      value={monthWage}
                      disabled={!isHR}
                      onChange={e => handleMonthWageChange(Number(e.target.value) || 0)}
                      placeholder="50000"
                      className="w-full bg-[#1C1A19] border border-[#332F2C] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#E07A5F] focus:outline-none focus:border-[#E07A5F] disabled:opacity-80 disabled:cursor-not-allowed"
                    />
                    <span className="text-xs text-[#A39C95] font-mono shrink-0">/ Month</span>
                  </div>
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-[#E8E3DD] font-bold w-28">Yearly wage</span>
                  <div className="flex items-center space-x-2 flex-1">
                    <div className="w-full bg-[#1C1A19] border border-[#2B2825] rounded-xl px-3 py-2 text-sm font-mono font-bold text-[#709775]">
                      ₹{yearlyWage.toLocaleString()}
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
                    value={workingDays}
                    disabled={!isHR}
                    onChange={e => setWorkingDays(Number(e.target.value) || 5)}
                    className="w-24 bg-[#1C1A19] border border-[#332F2C] rounded-xl px-3 py-2 text-xs font-mono text-[#E8E3DD] focus:outline-none disabled:opacity-80 disabled:cursor-not-allowed"
                  />
                </div>

                <div className="flex items-center space-x-4">
                  <span className="text-[#E8E3DD] font-bold w-44">Break Time:</span>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={breakTime}
                      disabled={!isHR}
                      onChange={e => setBreakTime(Number(e.target.value) || 1)}
                      className="w-24 bg-[#1C1A19] border border-[#332F2C] rounded-xl px-3 py-2 text-xs font-mono text-[#E8E3DD] focus:outline-none disabled:opacity-80 disabled:cursor-not-allowed"
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
                  Salary Component Breakdown {isHR ? '& Customization' : '(Read-Only)'}
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
                            value={basicSalary}
                            disabled={!isHR}
                            onChange={e => setBasicSalary(Number(e.target.value) || 0)}
                            className="w-24 bg-transparent text-right font-mono font-bold text-[#E07A5F] focus:outline-none disabled:opacity-80 disabled:cursor-not-allowed"
                          />
                          <span className="text-[#A39C95]">₹ / month</span>
                        </div>
                        <div className="flex items-center space-x-1 border-b border-[#555] pb-0.5">
                          <span className="w-14 text-right font-mono text-[#A39C95]">
                            {monthWage > 0 ? ((basicSalary / monthWage) * 100).toFixed(2) : '50.00'}
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
                            value={hra}
                            disabled={!isHR}
                            onChange={e => setHra(Number(e.target.value) || 0)}
                            className="w-24 bg-transparent text-right font-mono font-bold text-[#E8E3DD] focus:outline-none disabled:opacity-80 disabled:cursor-not-allowed"
                          />
                          <span className="text-[#A39C95]">₹ / month</span>
                        </div>
                        <div className="flex items-center space-x-1 border-b border-[#555] pb-0.5">
                          <span className="w-14 text-right font-mono text-[#A39C95]">
                            {basicSalary > 0 ? ((hra / basicSalary) * 100).toFixed(2) : '50.00'}
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
                            value={standardAllowance}
                            disabled={!isHR}
                            onChange={e => setStandardAllowance(Number(e.target.value) || 0)}
                            className="w-24 bg-transparent text-right font-mono font-bold text-[#E8E3DD] focus:outline-none disabled:opacity-80 disabled:cursor-not-allowed"
                          />
                          <span className="text-[#A39C95]">₹ / month</span>
                        </div>
                        <div className="flex items-center space-x-1 border-b border-[#555] pb-0.5">
                          <span className="w-14 text-right font-mono text-[#A39C95]">
                            {monthWage > 0 ? ((standardAllowance / monthWage) * 100).toFixed(2) : '8.33'}
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
                            value={performanceBonus}
                            disabled={!isHR}
                            onChange={e => setPerformanceBonus(Number(e.target.value) || 0)}
                            className="w-24 bg-transparent text-right font-mono font-bold text-[#E8E3DD] focus:outline-none disabled:opacity-80 disabled:cursor-not-allowed"
                          />
                          <span className="text-[#A39C95]">₹ / month</span>
                        </div>
                        <div className="flex items-center space-x-1 border-b border-[#555] pb-0.5">
                          <span className="w-14 text-right font-mono text-[#A39C95]">
                            {basicSalary > 0 ? ((performanceBonus / basicSalary) * 100).toFixed(2) : '8.33'}
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
                            value={lta}
                            disabled={!isHR}
                            onChange={e => setLta(Number(e.target.value) || 0)}
                            className="w-24 bg-transparent text-right font-mono font-bold text-[#E8E3DD] focus:outline-none disabled:opacity-80 disabled:cursor-not-allowed"
                          />
                          <span className="text-[#A39C95]">₹ / month</span>
                        </div>
                        <div className="flex items-center space-x-1 border-b border-[#555] pb-0.5">
                          <span className="w-14 text-right font-mono text-[#A39C95]">
                            {basicSalary > 0 ? ((lta / basicSalary) * 100).toFixed(2) : '8.33'}
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
                            ₹{fixedAllowance.toFixed(2)}
                          </span>
                          <span className="text-[#A39C95]">₹ / month</span>
                        </div>
                        <div className="flex items-center space-x-1 border-b border-[#555] pb-0.5">
                          <span className="w-14 text-right font-mono text-[#A39C95]">
                            {monthWage > 0 ? ((fixedAllowance / monthWage) * 100).toFixed(2) : '0.00'}
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
                          <span className="font-bold text-[#E07A5F]">₹{pfEmployee.toFixed(2)}</span>
                          <span className="text-[#709775] font-bold">(12% of Basic)</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-0.5">
                      <div className="flex justify-between items-center">
                        <span className="font-bold text-[#E8E3DD]">Employer PF</span>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-[#E07A5F]">₹{pfEmployer.toFixed(2)}</span>
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
                      <span className="font-bold text-[#E06C68]">₹{profTax.toFixed(2)} / month</span>
                    </div>
                  </div>
                </div>

                {/* Net Take-Home Salary Summary Card */}
                <div className="p-4 bg-[#141312] border border-[#709775] rounded-xl space-y-2">
                  <span className="text-xs text-[#709775] font-bold uppercase tracking-wider block font-sans">Net Monthly Take-Home Salary</span>
                  <div className="font-mono text-3xl font-extrabold text-[#709775]">
                    ₹{netTakeHome.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </div>
                  <span className="text-[10px] text-[#A39C95] block font-sans">Includes Basic + HRA + Allowances minus PF & Professional Tax</span>
                </div>
              </div>
            </div>

            {/* Save Status Banner */}
            {salarySaved && (
              <div className="p-3 rounded-xl bg-[#1C251F] border border-[#709775] text-[#709775] flex items-center space-x-2 font-mono text-xs">
                <FiCheckCircle className="w-4 h-4" />
                <span>Salary components & configuration saved successfully to database!</span>
              </div>
            )}

            {/* Action Buttons */}
            {isHR && (
              <div className="flex justify-end pt-2">
                <button
                  type="button"
                  onClick={handleSaveSalaryDetails}
                  disabled={isSavingSalary}
                  className="px-6 py-2.5 rounded-xl bg-[#709775] text-white font-bold hover:bg-[#5C8260] transition-colors shadow-lg flex items-center space-x-2 disabled:opacity-50"
                >
                  <FiSave className="w-4 h-4" />
                  <span>{isSavingSalary ? 'Saving...' : 'Save Salary Details'}</span>
                </button>
              </div>
            )}
          </div>
        )}

        {/* ================= D. SECURITY TAB ================= */}
        {activeTab === 'security' && (
          <div className="space-y-6 text-xs max-w-xl">
            <h3 className="font-crimson font-bold text-xl text-[#E8E3DD] border-b border-[#292624] pb-2">
              Security & Password Management
            </h3>

            {passUpdated && (
              <div className="p-3 rounded-xl bg-[#1C251F] border border-[#709775] text-[#709775] flex items-center space-x-2 font-mono">
                <FiCheckCircle className="w-4 h-4" />
                <span>Password updated successfully!</span>
              </div>
            )}

            {passError && (
              <div className="p-3 rounded-xl bg-[#291B1B] border border-[#E06C68] text-[#E06C68] font-mono">
                {passError}
              </div>
            )}

            <form onSubmit={handleUpdatePassword} className="space-y-4 font-mono">
              <div className="space-y-1">
                <label className="text-[#78726A] text-[11px] block font-semibold font-sans">Current Password</label>
                <input
                  type="password"
                  value={currentPass}
                  onChange={e => setCurrentPass(e.target.value)}
                  className="w-full bg-[#141312] border border-[#332F2C] rounded-xl px-3 py-2 text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#78726A] text-[11px] block font-semibold font-sans">New Password</label>
                <input
                  type="password"
                  value={newPass}
                  onChange={e => setNewPass(e.target.value)}
                  className="w-full bg-[#141312] border border-[#332F2C] rounded-xl px-3 py-2 text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F]"
                  required
                />
              </div>

              <div className="space-y-1">
                <label className="text-[#78726A] text-[11px] block font-semibold font-sans">Confirm New Password</label>
                <input
                  type="password"
                  value={confirmNewPass}
                  onChange={e => setConfirmNewPass(e.target.value)}
                  className="w-full bg-[#141312] border border-[#332F2C] rounded-xl px-3 py-2 text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F]"
                  required
                />
              </div>

              <div className="pt-2 font-sans">
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-[#E07A5F] text-white font-bold hover:bg-[#D0694E] transition-colors shadow-lg flex items-center space-x-2"
                >
                  <FiLock className="w-4 h-4" />
                  <span>Update Password</span>
                </button>
              </div>
            </form>

            {/* HR Gmail Live SMTP Configuration */}
            {isHR && (
              <div className="p-5 bg-[#141312] border border-[#2B2825] rounded-xl space-y-3 font-mono border-l-4 border-l-[#709775] pt-4">
                <h4 className="font-crimson font-bold text-base text-[#E8E3DD] font-sans">
                  HR Gmail SMTP Configuration (Live Email Dispatch)
                </h4>
                <p className="text-[11px] text-[#A39C95] font-sans leading-relaxed">
                  Enter your 16-character Google Account <strong>App Password</strong> to send account creation & termination emails directly from <strong>{currentUser.email}</strong> to any real email address.
                </p>
                <div className="space-y-1">
                  <label className="text-[#78726A] text-[10px] block font-semibold font-sans">Gmail App Password (16 chars)</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="password"
                      value={gmailAppPassword}
                      onChange={e => setGmailAppPassword(e.target.value)}
                      placeholder="e.g. abcd efgh ijkl mnop"
                      className="flex-1 bg-[#1C1A19] border border-[#332F2C] rounded-lg px-3 py-2 text-[#E8E3DD] focus:outline-none focus:border-[#709775]"
                    />
                    <button
                      type="button"
                      onClick={handleSaveGmailAppPassword}
                      className="px-4 py-2 rounded-lg bg-[#709775] text-white font-bold text-xs hover:bg-[#5C8260] font-sans shrink-0"
                    >
                      Save Key
                    </button>
                  </div>
                </div>
                {gmailSaved && (
                  <span className="text-xs text-[#709775] block font-bold font-sans">
                    ✓ Gmail App Password saved! Real emails will now be sent directly from {currentUser.email}.
                  </span>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
