import React, { useState } from 'react';
import { FiX, FiUpload, FiSend } from 'react-icons/fi';
import type { LeaveType } from '../../types';

interface LeaveFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: { leaveType: LeaveType; startDate: string; endDate: string; totalDays: number; reason: string }) => void;
  paidAvailable: number;
  sickAvailable: number;
}

export const LeaveFormModal: React.FC<LeaveFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  paidAvailable,
  sickAvailable,
}) => {
  const [leaveType, setLeaveType] = useState<LeaveType>('Paid');
  const [startDate, setStartDate] = useState('2026-08-25');
  const [endDate, setEndDate] = useState('2026-08-26');
  const [reason, setReason] = useState('');
  const [fileName, setFileName] = useState('');

  if (!isOpen) return null;

  const start = new Date(startDate);
  const end = new Date(endDate);
  const diffTime = Math.max(0, end.getTime() - start.getTime());
  const totalDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reason.trim()) return;
    onSubmit({
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-[#1C1A19] border border-[#332F2C] w-full max-w-lg rounded-2xl shadow-2xl p-6 relative">
        <div className="flex items-center justify-between pb-4 border-b border-[#292624]">
          <div>
            <h2 className="font-crimson text-xl font-bold text-[#E8E3DD]">
              Request Leave / Time-Off
            </h2>
            <p className="text-xs text-[#A39C95]">
              Submit your leave request for manager review.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#A39C95] hover:text-[#E8E3DD] hover:bg-[#24211F]"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-[#A39C95] mb-2 uppercase tracking-wider">
              Leave Type
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => setLeaveType('Paid')}
                className={`p-3 rounded-xl border text-xs text-left transition-all ${
                  leaveType === 'Paid'
                    ? 'bg-[#29221C] border-[#E07A5F] text-[#E07A5F] font-bold shadow-sm'
                    : 'bg-[#24211F] border-[#332F2C] text-[#A39C95] hover:text-[#E8E3DD]'
                }`}
              >
                <div className="font-bold text-[#E8E3DD]">Paid Leave</div>
                <div className="text-[10px] text-[#78726A] mt-0.5">{paidAvailable} Days Available</div>
              </button>

              <button
                type="button"
                onClick={() => setLeaveType('Sick')}
                className={`p-3 rounded-xl border text-xs text-left transition-all ${
                  leaveType === 'Sick'
                    ? 'bg-[#291F24] border-[#E06C68] text-[#E06C68] font-bold shadow-sm'
                    : 'bg-[#24211F] border-[#332F2C] text-[#A39C95] hover:text-[#E8E3DD]'
                }`}
              >
                <div className="font-bold text-[#E8E3DD]">Sick Leave</div>
                <div className="text-[10px] text-[#78726A] mt-0.5">{sickAvailable} Days Available</div>
              </button>

              <button
                type="button"
                onClick={() => setLeaveType('Unpaid')}
                className={`p-3 rounded-xl border text-xs text-left transition-all ${
                  leaveType === 'Unpaid'
                    ? 'bg-[#22211C] border-[#F4A261] text-[#F4A261] font-bold shadow-sm'
                    : 'bg-[#24211F] border-[#332F2C] text-[#A39C95] hover:text-[#E8E3DD]'
                }`}
              >
                <div className="font-bold text-[#E8E3DD]">Unpaid Leave</div>
                <div className="text-[10px] text-[#78726A] mt-0.5">Flexible</div>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs text-[#A39C95] mb-1">Start Date</label>
              <input
                type="date"
                value={startDate}
                onChange={e => setStartDate(e.target.value)}
                className="w-full bg-[#141312] border border-[#332F2C] rounded-lg px-3 py-2 text-xs text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F]"
                required
              />
            </div>
            <div>
              <label className="block text-xs text-[#A39C95] mb-1">End Date</label>
              <input
                type="date"
                value={endDate}
                onChange={e => setEndDate(e.target.value)}
                className="w-full bg-[#141312] border border-[#332F2C] rounded-lg px-3 py-2 text-xs text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F]"
                required
              />
            </div>
          </div>

          <div className="p-2.5 bg-[#141312] border border-[#2B2825] rounded-lg flex items-center justify-between text-xs">
            <span className="text-[#A39C95]">Calculated Duration</span>
            <span className="font-bold text-[#E07A5F] font-mono">{totalDays} {totalDays === 1 ? 'Working Day' : 'Working Days'}</span>
          </div>

          <div>
            <label className="block text-xs text-[#A39C95] mb-1">Reason / Remarks</label>
            <textarea
              rows={3}
              placeholder="State the reason for your time-off request..."
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="w-full bg-[#141312] border border-[#332F2C] rounded-lg p-3 text-xs text-[#E8E3DD] placeholder-[#78726A] focus:outline-none focus:border-[#E07A5F]"
              required
            />
          </div>

          <div>
            <label className="block text-xs text-[#A39C95] mb-1">Attachment (Optional e.g. medical certificate)</label>
            <label className="flex items-center justify-center space-x-2 border border-dashed border-[#383330] rounded-xl p-3 bg-[#141312] cursor-pointer hover:border-[#E07A5F] transition-colors">
              <FiUpload className="w-4 h-4 text-[#A39C95]" />
              <span className="text-xs text-[#A39C95]">
                {fileName || 'Click to attach certificate or note'}
              </span>
              <input
                type="file"
                className="hidden"
                onChange={e => setFileName(e.target.files?.[0]?.name || '')}
              />
            </label>
          </div>

          <div className="pt-3 border-t border-[#292624] flex items-center justify-end space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-[#24211F] text-xs font-semibold text-[#A39C95] hover:text-[#E8E3DD] transition-colors"
            >
              Discard
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-lg bg-[#E07A5F] text-white text-xs font-bold hover:bg-[#D0694E] transition-colors flex items-center space-x-1.5 shadow-md"
            >
              <FiSend className="w-3.5 h-3.5" />
              <span>Submit Leave Request</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
