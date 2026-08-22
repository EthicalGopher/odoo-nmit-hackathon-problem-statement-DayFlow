import React from 'react';
import { FiX, FiCheck, FiXCircle, FiUser } from 'react-icons/fi';
import type { LeaveRequest } from '../../types';
import { UserAvatar } from '../ui/UserAvatar';

interface WorkflowSidePanelProps {
  selectedNode: any | null;
  onClose: () => void;
  onApproveLeave?: (id: number) => void;
  onRejectLeave?: (id: number) => void;
  leaveRequests?: LeaveRequest[];
}

export const WorkflowSidePanel: React.FC<WorkflowSidePanelProps> = ({
  selectedNode,
  onClose,
  onApproveLeave,
  onRejectLeave,
  leaveRequests = [],
}) => {
  if (!selectedNode) return null;

  const data = selectedNode.data || {};
  const nodeType = selectedNode.type;

  const matchingLeave = leaveRequests.find(
    l => l.id === data.leaveId || l.employeeName === data.name || l.employeeName === data.employeeName
  ) || leaveRequests[0];

  return (
    <div className="w-80 bg-[#1C1A19] border-l border-[#332F2C] h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl animate-in slide-in-from-right duration-200">
      <div>
        <div className="flex items-center justify-between pb-4 border-b border-[#292624]">
          <div className="flex items-center space-x-2">
            <span className="w-2 h-2 rounded-full bg-[#E07A5F]" />
            <h3 className="font-crimson font-bold text-lg text-[#E8E3DD]">
              Workflow Inspection
            </h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-[#A39C95] hover:text-[#E8E3DD] hover:bg-[#24211F]"
          >
            <FiX className="w-5 h-5" />
          </button>
        </div>

        <div className="mt-5 space-y-4">
          <div className="p-3 bg-[#24211F] rounded-xl border border-[#332F2C]">
            <div className="text-[10px] uppercase font-semibold text-[#78726A] tracking-wider mb-1">
              Node Type
            </div>
            <div className="text-sm font-bold text-[#E07A5F] capitalize">
              {nodeType || 'Workflow Step'}
            </div>
            <div className="text-xs text-[#A39C95] mt-1 font-mono">{selectedNode.id}</div>
          </div>

          {nodeType === 'employeeNode' && (
            <div className="space-y-3">
              <div className="flex items-center space-x-3 p-3 bg-[#181716] rounded-xl border border-[#2B2825]">
                <UserAvatar name={data.name || 'Employee'} size="w-12 h-12" />
                <div>
                  <h4 className="font-bold text-sm text-[#E8E3DD]">{data.name || 'Employee'}</h4>
                  <p className="text-xs text-[#A39C95]">{data.role || 'Team Member'}</p>
                </div>
              </div>
              <div className="p-3 bg-[#181716] rounded-xl border border-[#2B2825] space-y-2 text-xs">
                <div className="flex justify-between">
                  <span className="text-[#78726A]">Status</span>
                  <span className="text-[#709775] font-medium capitalize">● {data.status || 'Active'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-[#78726A]">Department</span>
                  <span className="text-[#E8E3DD]">Engineering</span>
                </div>
              </div>
            </div>
          )}

          {nodeType === 'leaveNode' && matchingLeave && (
            <div className="space-y-3">
              <div className="p-3 bg-[#181716] rounded-xl border border-[#2B2825] space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-[#78726A]">Employee</span>
                  <span className="font-bold text-[#E8E3DD]">{matchingLeave.employeeName}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#78726A]">Leave Type</span>
                  <span className="font-semibold text-[#E07A5F]">{matchingLeave.leaveType}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-[#78726A]">Duration</span>
                  <span className="text-[#F4A261] font-mono">{matchingLeave.totalDays} Days ({matchingLeave.startDate} to {matchingLeave.endDate})</span>
                </div>
                <div className="pt-2 border-t border-[#292624]">
                  <span className="text-[#78726A] block mb-1">Reason</span>
                  <p className="text-[#E8E3DD] italic font-crafty">"{matchingLeave.reason}"</p>
                </div>
              </div>

              {matchingLeave.status === 'Pending' && onApproveLeave && onRejectLeave && (
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => onApproveLeave(matchingLeave.id)}
                    className="w-full flex items-center justify-center space-x-2 py-2.5 rounded-lg bg-[#709775] text-white text-xs font-bold hover:bg-[#5C8260] transition-colors"
                  >
                    <FiCheck className="w-4 h-4" />
                    <span>Approve Request</span>
                  </button>
                  <button
                    onClick={() => onRejectLeave(matchingLeave.id)}
                    className="w-full flex items-center justify-center space-x-2 py-2 rounded-lg bg-[#291B1B] border border-[#E06C68] text-[#E06C68] text-xs font-bold hover:bg-[#3D1E1E] transition-colors"
                  >
                    <FiXCircle className="w-4 h-4" />
                    <span>Reject Request</span>
                  </button>
                </div>
              )}
            </div>
          )}

          {nodeType === 'hrReviewNode' && (
            <div className="p-3 bg-[#181716] rounded-xl border border-[#2B2825] space-y-2 text-xs">
              <div className="flex items-center space-x-2 text-[#709775]">
                <FiUser className="w-4 h-4" />
                <span className="font-bold text-[#E8E3DD]">HR Approval Pipeline</span>
              </div>
              <p className="text-[#A39C95]">
                Leave requests in this state trigger instant record synchronization upon manager approval or rejection.
              </p>
            </div>
          )}
        </div>
      </div>

      <div className="pt-4 border-t border-[#292624] text-[11px] text-[#78726A] font-crafty">
        Dayflow Interactive React Flow Workflow Canvas
      </div>
    </div>
  );
};
