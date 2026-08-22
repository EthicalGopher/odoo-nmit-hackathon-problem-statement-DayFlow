import React from 'react';
import { FiX, FiPrinter } from 'react-icons/fi';
import type { Payroll, Employee } from '../../types';
import { useAuth } from '../../context/AuthContext';

interface SalarySlipModalProps {
  isOpen: boolean;
  onClose: () => void;
  payroll: Payroll;
  employee: Employee;
}

export const SalarySlipModal: React.FC<SalarySlipModalProps> = ({
  isOpen,
  onClose,
  payroll,
  employee,
}) => {
  const { currentUser, allEmployees } = useAuth();

  if (!isOpen) return null;

  const handlePrint = () => {
    window.print();
  };

  const grossEarnings =
    payroll.basicSalary +
    payroll.hra +
    payroll.standardAllowance +
    payroll.performanceBonus +
    payroll.leaveTravelAllowance +
    payroll.fixedAllowance;

  const totalDeductions = payroll.providentFund + payroll.professionalTax;

  const companyName =
    employee.companyName ||
    currentUser?.companyName ||
    allEmployees.find(e => e.companyName)?.companyName ||
    'Odoo India';

  const companyAddress =
    employee.address && employee.address !== 'Pending profile update'
      ? employee.address
      : currentUser?.address && currentUser.address !== 'Pending profile update'
      ? currentUser.address
      : employee.location || currentUser?.location || 'Gujarat, India';

  const cleanCompCode = companyName.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 6) || 'DFMS';
  const companyRegId = `REG-${cleanCompCode}-2026`;

  const now = new Date();
  const monthName = now.toLocaleString('en-US', { month: 'short' });
  const year = now.getFullYear();
  const lastDay = new Date(year, now.getMonth() + 1, 0).getDate();
  const payPeriodStr = `Pay Period: ${monthName} 01 – ${monthName} ${lastDay}, ${year}`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1C1A19] border border-[#383330] w-full max-w-2xl rounded-2xl shadow-2xl p-6 relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-[#292624]">
          <div className="flex items-center space-x-2">
            <div className="w-7 h-7 rounded-md bg-[#E07A5F] flex items-center justify-center text-white font-bold font-crimson text-sm">
              {companyName.charAt(0)}
            </div>
            <h2 className="font-crimson text-lg font-bold text-[#E8E3DD]">
              Official Salary Pay Slip — {monthName} {year}
            </h2>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={handlePrint}
              className="px-3 py-1.5 rounded-lg bg-[#24211F] border border-[#332F2C] text-xs font-semibold text-[#E8E3DD] hover:border-[#E07A5F] transition-colors flex items-center space-x-1.5"
            >
              <FiPrinter className="w-3.5 h-3.5 text-[#E07A5F]" />
              <span>Print Slip</span>
            </button>
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-[#A39C95] hover:text-[#E8E3DD] hover:bg-[#24211F]"
            >
              <FiX className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div id="salary-slip-content" className="mt-5 p-6 bg-[#141312] border border-[#2B2825] rounded-xl space-y-6">
          <div className="flex items-start justify-between border-b border-[#292624] pb-4">
            <div>
              <h3 className="font-crimson text-2xl font-bold text-[#E8E3DD]">
                {companyName}
              </h3>
              <p className="text-xs text-[#A39C95]">
                {companyAddress}
              </p>
              <p className="text-[11px] text-[#78726A] font-mono mt-0.5">
                Company Tax / Reg ID: {companyRegId}
              </p>
            </div>
            <div className="text-right">
              <span className="inline-block px-3 py-1 bg-[#24211F] border border-[#332F2C] rounded-lg text-xs font-bold text-[#E07A5F] font-mono">
                CONFIDENTIAL PAYSLIP
              </span>
              <p className="text-xs text-[#A39C95] mt-1">{payPeriodStr}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 text-xs bg-[#1C1A19] p-4 rounded-xl border border-[#2B2825]">
            <div>
              <div className="text-[#78726A] text-[10px] uppercase font-semibold">Employee Details</div>
              <div className="font-bold text-sm text-[#E8E3DD] mt-1">{employee.name}</div>
              <div className="text-[#A39C95]">{employee.jobTitle}</div>
              <div className="text-[#709775] font-mono text-[11px] mt-0.5">{employee.department}</div>
            </div>
            <div className="space-y-1 text-right">
              <div><span className="text-[#78726A]">Employee ID:</span> <span className="font-mono text-[#E8E3DD]">{employee.employeeId}</span></div>
              <div><span className="text-[#78726A]">Joining Date:</span> <span className="text-[#E8E3DD]">{employee.joiningDate}</span></div>
              <div><span className="text-[#78726A]">Payment Mode:</span> <span className="text-[#E8E3DD]">Direct Bank Deposit</span></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="border border-[#2B2825] rounded-xl overflow-hidden">
              <div className="bg-[#1C1A19] px-4 py-2 border-b border-[#2B2825] font-bold text-[#709775]">
                Earnings (Gross Components)
              </div>
              <div className="p-4 space-y-2 text-[#A39C95]">
                <div className="flex justify-between"><span>Basic Salary (50%)</span><span className="font-mono text-[#E8E3DD]">₹{payroll.basicSalary.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>House Rent Allowance (HRA)</span><span className="font-mono text-[#E8E3DD]">₹{payroll.hra.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Standard Allowance</span><span className="font-mono text-[#E8E3DD]">₹{payroll.standardAllowance.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Performance Bonus</span><span className="font-mono text-[#E8E3DD]">₹{payroll.performanceBonus.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Leave Travel Allowance</span><span className="font-mono text-[#E8E3DD]">₹{payroll.leaveTravelAllowance.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Fixed Allowance</span><span className="font-mono text-[#E8E3DD]">₹{payroll.fixedAllowance.toLocaleString()}</span></div>
                <div className="pt-2 border-t border-[#292624] flex justify-between font-bold text-[#E8E3DD]">
                  <span>Total Gross Earnings</span>
                  <span className="font-mono">₹{grossEarnings.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="border border-[#2B2825] rounded-xl overflow-hidden">
              <div className="bg-[#1C1A19] px-4 py-2 border-b border-[#2B2825] font-bold text-[#E06C68]">
                Deductions
              </div>
              <div className="p-4 space-y-2 text-[#A39C95]">
                <div className="flex justify-between"><span>Provident Fund (PF - 12%)</span><span className="font-mono text-[#E8E3DD]">₹{payroll.providentFund.toLocaleString()}</span></div>
                <div className="flex justify-between"><span>Professional Tax</span><span className="font-mono text-[#E8E3DD]">₹{payroll.professionalTax.toLocaleString()}</span></div>
                <div className="pt-2 border-t border-[#292624] flex justify-between font-bold text-[#E66868]">
                  <span>Total Deductions</span>
                  <span className="font-mono">₹{totalDeductions.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 bg-gradient-to-r from-[#1F2620] to-[#1C1A19] border border-[#709775]/50 rounded-xl flex items-center justify-between">
            <div>
              <span className="text-xs uppercase text-[#A39C95] font-bold tracking-wider">Net Salary Payable</span>
              <p className="text-[11px] text-[#78726A] font-crafty">Directly transferred to registered bank account</p>
            </div>
            <div className="text-2xl font-bold font-mono text-[#709775]">
              ₹{payroll.netSalary.toLocaleString()}
            </div>
          </div>

          <div className="text-[10px] text-[#78726A] text-center italic border-t border-[#292624] pt-3 font-crafty">
            This is a system-generated salary slip created via Dayflow HRMS and does not require a physical signature.
          </div>
        </div>
      </div>
    </div>
  );
};
