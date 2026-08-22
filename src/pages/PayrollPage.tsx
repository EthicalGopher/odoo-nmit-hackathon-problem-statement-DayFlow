import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../api/client';
import type { Payroll } from '../types';
import { SalarySlipModal } from '../components/ui/SalarySlipModal';
import {
  FiPrinter,
  FiEdit2,
  FiCheck,
  FiLock,
  FiShield,
} from 'react-icons/fi';

export const PayrollPage: React.FC = () => {
  const { currentUser, role, allEmployees } = useAuth();
  const [payrolls, setPayrolls] = useState<Payroll[]>([]);
  const [selectedPayroll, setSelectedPayroll] = useState<Payroll | null>(null);
  const [showSlipModal, setShowSlipModal] = useState(false);

  const [isEditing, setIsEditing] = useState(false);
  const [monthWageInput, setMonthWageInput] = useState(80000);

  const isHR = role === 'HR';

  const fetchPayroll = async () => {
    try {
      const data = await api.getPayroll(isHR ? undefined : currentUser?.employeeId);
      if (Array.isArray(data)) {
        setPayrolls(data);
        const match = data.find(p => p.employeeId === currentUser?.employeeId) || data[0];
        setSelectedPayroll(match);
        if (match) setMonthWageInput(match.monthWage);
      } else {
        setPayrolls([data]);
        setSelectedPayroll(data);
        setMonthWageInput(data.monthWage);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchPayroll();
  }, [currentUser, isHR]);

  const handleUpdateWage = async () => {
    if (!selectedPayroll) return;
    try {
      await api.updatePayroll(selectedPayroll.employeeId, monthWageInput);
      await fetchPayroll();
      setIsEditing(false);
    } catch (err) {
      console.error(err);
    }
  };

  const currentEmpObj = allEmployees.find(e => e.employeeId === selectedPayroll?.employeeId) || currentUser!;

  return (
    <div className="p-8 space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h2 className="font-crimson text-2xl font-bold text-[#E8E3DD]">
            Payroll & Compensation Structure
          </h2>
          <p className="text-xs text-[#A39C95] font-carme mt-0.5">
            {isHR
              ? 'View & configure employee salary components, allowances, tax deductions & slips.'
              : 'Read-only view of your official monthly compensation breakdown.'}
          </p>
        </div>

        {selectedPayroll && (
          <button
            onClick={() => setShowSlipModal(true)}
            className="px-4 py-2.5 rounded-xl bg-[#E07A5F] text-white text-xs font-bold hover:bg-[#D0694E] transition-colors flex items-center space-x-2 shadow-md"
          >
            <FiPrinter className="w-4 h-4" />
            <span>View Printable Pay Slip</span>
          </button>
        )}
      </div>

      {/* HR Employee Selector if HR */}
      {isHR && (
        <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-4 shadow-xl flex items-center justify-between">
          <span className="text-xs font-bold text-[#E8E3DD] flex items-center space-x-1.5">
            <FiShield className="w-4 h-4 text-[#E07A5F]" />
            <span>HR Employee Payroll Switcher:</span>
          </span>
          <div className="flex items-center space-x-2 overflow-x-auto py-1">
            {payrolls.map(p => (
              <button
                key={p.employeeId}
                onClick={() => {
                  setSelectedPayroll(p);
                  setMonthWageInput(p.monthWage);
                  setIsEditing(false);
                }}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors shrink-0 ${
                  selectedPayroll?.employeeId === p.employeeId
                    ? 'bg-[#E07A5F] text-white font-bold'
                    : 'bg-[#141312] text-[#A39C95] hover:text-[#E8E3DD] border border-[#332F2C]'
                }`}
              >
                {p.employeeName}
              </button>
            ))}
          </div>
        </div>
      )}

      {selectedPayroll && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Compensation Overview Card */}
          <div className="lg:col-span-2 bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex items-center justify-between border-b border-[#292624] pb-4">
              <div>
                <span className="text-xs text-[#78726A] font-mono">{selectedPayroll.employeeId}</span>
                <h3 className="font-crimson text-xl font-bold text-[#E8E3DD]">
                  {selectedPayroll.employeeName}
                </h3>
              </div>

              {isHR ? (
                isEditing ? (
                  <button
                    onClick={handleUpdateWage}
                    className="px-3.5 py-1.5 rounded-lg bg-[#709775] text-white text-xs font-bold hover:bg-[#5C8260] flex items-center space-x-1"
                  >
                    <FiCheck className="w-3.5 h-3.5" />
                    <span>Recalculate & Save</span>
                  </button>
                ) : (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-3.5 py-1.5 rounded-lg bg-[#24211F] border border-[#332F2C] text-[#E07A5F] text-xs font-bold hover:border-[#E07A5F] flex items-center space-x-1"
                  >
                    <FiEdit2 className="w-3.5 h-3.5" />
                    <span>Edit Wage Structure</span>
                  </button>
                )
              ) : (
                <span className="text-[11px] text-[#A39C95] font-mono flex items-center space-x-1 bg-[#141312] px-2.5 py-1 rounded border border-[#332F2C]">
                  <FiLock className="w-3 h-3 text-[#78726A]" />
                  <span>Read-Only</span>
                </span>
              )}
            </div>

            {/* Monthly Wage Setting Input */}
            {isEditing ? (
              <div className="p-4 bg-[#141312] border border-[#E07A5F] rounded-xl space-y-2">
                <label className="block text-xs font-bold text-[#E07A5F]">
                  Configure Base Gross Monthly Wage ($)
                </label>
                <div className="flex items-center space-x-3">
                  <input
                    type="number"
                    value={monthWageInput}
                    onChange={e => setMonthWageInput(Number(e.target.value))}
                    className="bg-[#1C1A19] border border-[#332F2C] rounded-lg px-3 py-2 text-sm font-mono text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F] w-48"
                  />
                  <span className="text-xs text-[#A39C95] font-crafty">
                    Automatic component calculation will execute on save.
                  </span>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-[#141312] border border-[#2B2825] rounded-xl">
                  <span className="text-[11px] text-[#78726A] uppercase font-semibold">Monthly Wage</span>
                  <div className="font-mono text-2xl font-bold text-[#E8E3DD] mt-1">
                    ${selectedPayroll.monthWage.toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-[#141312] border border-[#2B2825] rounded-xl">
                  <span className="text-[11px] text-[#78726A] uppercase font-semibold">Yearly Package</span>
                  <div className="font-mono text-2xl font-bold text-[#F4A261] mt-1">
                    ${selectedPayroll.yearlyWage.toLocaleString()}
                  </div>
                </div>

                <div className="p-4 bg-[#141312] border border-[#2B2825] rounded-xl">
                  <span className="text-[11px] text-[#78726A] uppercase font-semibold">Net Take-Home</span>
                  <div className="font-mono text-2xl font-bold text-[#709775] mt-1">
                    ${selectedPayroll.netSalary.toLocaleString()}
                  </div>
                </div>
              </div>
            )}

            {/* Formula Breakdown Table */}
            <div className="space-y-3">
              <h4 className="font-crimson font-bold text-base text-[#E8E3DD]">
                Salary Components & Formula Matrix
              </h4>

              <div className="border border-[#2B2825] rounded-xl overflow-hidden text-xs">
                <table className="w-full text-left">
                  <thead>
                    <tr className="bg-[#181716] border-b border-[#2B2825] text-[#78726A] font-semibold text-[10px] uppercase">
                      <th className="py-2.5 px-4">Component</th>
                      <th className="py-2.5 px-4">Calculation Rule</th>
                      <th className="py-2.5 px-4 text-right">Amount ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#2B2825] text-[#A39C95]">
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-[#E8E3DD]">Basic Salary</td>
                      <td className="py-2.5 px-4 font-mono text-[11px]">50% of Wage</td>
                      <td className="py-2.5 px-4 text-right font-mono text-[#E8E3DD]">${selectedPayroll.basicSalary.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-[#E8E3DD]">House Rent Allowance (HRA)</td>
                      <td className="py-2.5 px-4 font-mono text-[11px]">40% of Basic</td>
                      <td className="py-2.5 px-4 text-right font-mono text-[#E8E3DD]">${selectedPayroll.hra.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-[#E8E3DD]">Standard Allowance</td>
                      <td className="py-2.5 px-4 font-mono text-[11px]">Fixed standard allowance</td>
                      <td className="py-2.5 px-4 text-right font-mono text-[#E8E3DD]">${selectedPayroll.standardAllowance.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-[#E8E3DD]">Performance Bonus</td>
                      <td className="py-2.5 px-4 font-mono text-[11px]">8% of Wage</td>
                      <td className="py-2.5 px-4 text-right font-mono text-[#E8E3DD]">${selectedPayroll.performanceBonus.toLocaleString()}</td>
                    </tr>
                    <tr>
                      <td className="py-2.5 px-4 font-bold text-[#E8E3DD]">Leave Travel Allowance (LTA)</td>
                      <td className="py-2.5 px-4 font-mono text-[11px]">5% of Wage</td>
                      <td className="py-2.5 px-4 text-right font-mono text-[#E8E3DD]">${selectedPayroll.leaveTravelAllowance.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-[#291B1B]/40">
                      <td className="py-2.5 px-4 font-bold text-[#E06C68]">Provident Fund Deduction</td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-[#E06C68]">12% of Basic</td>
                      <td className="py-2.5 px-4 text-right font-mono text-[#E06C68]">-${selectedPayroll.providentFund.toLocaleString()}</td>
                    </tr>
                    <tr className="bg-[#291B1B]/40">
                      <td className="py-2.5 px-4 font-bold text-[#E06C68]">Professional Tax</td>
                      <td className="py-2.5 px-4 font-mono text-[11px] text-[#E06C68]">Statutory deduction</td>
                      <td className="py-2.5 px-4 text-right font-mono text-[#E06C68]">-${selectedPayroll.professionalTax.toLocaleString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Side Slip & History Card */}
          <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-6 flex flex-col justify-between">
            <div className="space-y-4">
              <h4 className="font-crimson font-bold text-lg text-[#E8E3DD]">
                Salary History & Slips
              </h4>

              <div className="p-4 bg-[#141312] border border-[#2B2825] rounded-xl text-xs space-y-2">
                <div className="flex items-center justify-between font-bold text-[#E8E3DD]">
                  <span>August 2026</span>
                  <span className="text-[#709775] font-mono">Paid</span>
                </div>
                <div className="flex justify-between text-[#A39C95]">
                  <span>Net Salary</span>
                  <span className="font-mono">${selectedPayroll.netSalary.toLocaleString()}</span>
                </div>
                <button
                  onClick={() => setShowSlipModal(true)}
                  className="w-full mt-2 py-2 rounded-lg bg-[#24211F] border border-[#332F2C] text-xs font-semibold text-[#E07A5F] hover:border-[#E07A5F] transition-colors"
                >
                  Download / View Slip
                </button>
              </div>

              <div className="p-4 bg-[#141312] border border-[#2B2825] rounded-xl text-xs space-y-2 opacity-60">
                <div className="flex items-center justify-between font-bold text-[#E8E3DD]">
                  <span>July 2026</span>
                  <span className="text-[#709775] font-mono">Paid</span>
                </div>
                <div className="flex justify-between text-[#A39C95]">
                  <span>Net Salary</span>
                  <span className="font-mono">${selectedPayroll.netSalary.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="p-3 bg-[#181716] rounded-xl border border-[#292624] text-[11px] text-[#78726A] font-crafty">
              Calculated automatically based on working days and active attendance logs.
            </div>
          </div>
        </div>
      )}

      {/* Salary Slip Modal */}
      {selectedPayroll && (
        <SalarySlipModal
          isOpen={showSlipModal}
          onClose={() => setShowSlipModal(false)}
          payroll={selectedPayroll}
          employee={currentEmpObj}
        />
      )}
    </div>
  );
};
