import React, { useState } from 'react';
import type { LeaveRequest } from '../../types';
import { FiCheck, FiX, FiClock } from 'react-icons/fi';

interface LeaveTableProps {
  leaveRequests: LeaveRequest[];
  isHR: boolean;
  onApprove: (id: number, comment?: string) => void;
  onReject: (id: number, comment?: string) => void;
}

export const LeaveTable: React.FC<LeaveTableProps> = ({
  leaveRequests,
  isHR,
  onApprove,
  onReject,
}) => {
  const [commentInput, setCommentInput] = useState<{ [key: number]: string }>({});

  const handleCommentChange = (id: number, val: string) => {
    setCommentInput(prev => ({ ...prev, [id]: val }));
  };

  return (
    <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl overflow-hidden shadow-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#181716] border-b border-[#332F2C] text-[#78726A] font-semibold uppercase text-[10px] tracking-wider">
              <th className="py-3.5 px-4">Employee</th>
              <th className="py-3.5 px-4">Leave Type</th>
              <th className="py-3.5 px-4">Dates & Duration</th>
              <th className="py-3.5 px-4">Reason / Remarks</th>
              <th className="py-3.5 px-4">Status</th>
              {isHR && <th className="py-3.5 px-4 text-right">Actions</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#2B2825]">
            {leaveRequests.length === 0 ? (
              <tr>
                <td colSpan={isHR ? 6 : 5} className="py-12 text-center text-[#A39C95]">
                  <p className="font-crafty text-sm text-[#E07A5F] mb-1">No leave requests found</p>
                  <p className="text-xs text-[#78726A]">All leave submissions will appear here.</p>
                </td>
              </tr>
            ) : (
              leaveRequests.map(req => {
                const isPending = req.status === 'Pending';
                const isApproved = req.status === 'Approved';
                const isRejected = req.status === 'Rejected';

                return (
                  <tr key={req.id} className="hover:bg-[#24211F] transition-colors">
                    <td className="py-4 px-4">
                      <div className="font-bold text-[#E8E3DD]">{req.employeeName}</div>
                      <div className="text-[10px] text-[#78726A] font-mono">{req.employeeId}</div>
                    </td>

                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center px-2.5 py-1 rounded-md text-[11px] font-semibold border ${
                        req.leaveType === 'Paid'
                          ? 'bg-[#29221C] text-[#E07A5F] border-[#E07A5F]/30'
                          : req.leaveType === 'Sick'
                          ? 'bg-[#291F24] text-[#E06C68] border-[#E06C68]/30'
                          : 'bg-[#22211C] text-[#F4A261] border-[#F4A261]/30'
                      }`}>
                        {req.leaveType} Leave
                      </span>
                    </td>

                    <td className="py-4 px-4">
                      <div className="font-medium text-[#E8E3DD]">
                        {req.startDate} — {req.endDate}
                      </div>
                      <div className="text-[10px] text-[#A39C95] font-mono mt-0.5">
                        {req.totalDays} {req.totalDays === 1 ? 'day' : 'days'}
                      </div>
                    </td>

                    <td className="py-4 px-4 max-w-xs">
                      <p className="text-[#E8E3DD] truncate">{req.reason}</p>
                      {req.hrComment && (
                        <p className="text-[10px] text-[#709775] font-crafty mt-1">
                          HR: "{req.hrComment}"
                        </p>
                      )}
                    </td>

                    <td className="py-4 px-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                        isApproved
                          ? 'bg-[#1C251F] text-[#709775] border border-[#709775]/40'
                          : isRejected
                          ? 'bg-[#291B1B] text-[#E06C68] border border-[#E06C68]/40'
                          : 'bg-[#25221C] text-[#F4A261] border border-[#F4A261]/40'
                      }`}>
                        {isApproved ? (
                          <FiCheck className="w-3 h-3" />
                        ) : isRejected ? (
                          <FiX className="w-3 h-3" />
                        ) : (
                          <FiClock className="w-3 h-3" />
                        )}
                        <span>{req.status}</span>
                      </span>
                    </td>

                    {isHR && (
                      <td className="py-4 px-4 text-right">
                        {isPending ? (
                          <div className="flex flex-col items-end space-y-2">
                            <input
                              type="text"
                              placeholder="Add optional comment..."
                              value={commentInput[req.id] || ''}
                              onChange={e => handleCommentChange(req.id, e.target.value)}
                              className="w-44 bg-[#141312] border border-[#332F2C] rounded px-2 py-1 text-[11px] text-[#E8E3DD] focus:outline-none focus:border-[#E07A5F]"
                            />
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => onApprove(req.id, commentInput[req.id])}
                                className="px-3 py-1 rounded-md bg-[#709775] text-white text-xs font-bold hover:bg-[#5C8260] transition-colors flex items-center space-x-1"
                              >
                                <FiCheck className="w-3 h-3" />
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => onReject(req.id, commentInput[req.id])}
                                className="px-3 py-1 rounded-md bg-[#291B1B] border border-[#E06C68] text-[#E06C68] text-xs font-bold hover:bg-[#3D1E1E] transition-colors flex items-center space-x-1"
                              >
                                <FiX className="w-3 h-3" />
                                <span>Reject</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <span className="text-[11px] text-[#78726A] font-mono">Actioned</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
