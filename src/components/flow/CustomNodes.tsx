import { memo } from 'react';
import { Handle, Position } from '@xyflow/react';
import type { NodeProps } from '@xyflow/react';
import { FiUser, FiCalendar, FiCheckCircle, FiXCircle, FiClock, FiDollarSign } from 'react-icons/fi';
import { UserAvatar } from '../ui/UserAvatar';

// 1. Custom Employee Node
export const EmployeeNode = memo(({ data }: NodeProps) => {
  const d = data as { label?: string; name?: string; role?: string; status?: string };
  const empName = d.name || d.label || 'Employee';

  return (
    <div className="bg-[#1C1A19] border border-[#383330] hover:border-[#E07A5F] rounded-xl p-3 shadow-lg min-w-[200px] transition-all cursor-pointer group">
      <Handle type="source" position={Position.Right} className="!bg-[#E07A5F]" />
      <div className="flex items-center space-x-3">
        <UserAvatar name={empName} size="w-9 h-9" />
        <div>
          <div className="text-xs font-bold text-[#E8E3DD] group-hover:text-[#E07A5F] transition-colors">
            {empName}
          </div>
          <div className="text-[10px] text-[#A39C95]">{d.role || 'Staff Member'}</div>
        </div>
      </div>
      <div className="mt-2 pt-2 border-t border-[#292624] flex items-center justify-between text-[10px]">
        <span className="text-[#78726A]">Status</span>
        <span className={`capitalize font-medium ${d.status === 'present' ? 'text-[#709775]' : d.status === 'leave' ? 'text-[#E07A5F]' : 'text-[#F4A261]'}`}>
          ● {d.status || 'Active'}
        </span>
      </div>
    </div>
  );
});

// 2. Custom Leave Node
export const LeaveNode = memo(({ data }: NodeProps) => {
  const d = data as { leaveType?: string; dates?: string; days?: number; status?: string; reason?: string };
  return (
    <div className="bg-[#1C1A19] border border-[#383330] hover:border-[#E07A5F] rounded-xl p-3 shadow-lg min-w-[220px] transition-all cursor-pointer group">
      <Handle type="target" position={Position.Left} className="!bg-[#E07A5F]" />
      <Handle type="source" position={Position.Right} className="!bg-[#E07A5F]" />
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center space-x-1.5 text-[#E07A5F]">
          <FiCalendar className="w-3.5 h-3.5" />
          <span className="text-xs font-bold font-crimson text-[#E8E3DD]">{d.leaveType || 'Paid'} Leave</span>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#24211F] text-[#F4A261] font-mono border border-[#332F2C]">
          {d.days || 1} Days
        </span>
      </div>
      <p className="text-[11px] text-[#A39C95] truncate">{d.dates || 'Aug 25 – Aug 26'}</p>
      <div className="mt-2 text-[10px] text-[#78726A] line-clamp-1 italic font-crafty">
        "{d.reason || 'Leave request details'}"
      </div>
    </div>
  );
});

// 3. Custom HR Review Node
export const HRReviewNode = memo(({ data }: NodeProps) => {
  const d = data as { reviewer?: string };
  return (
    <div className="bg-[#1C1A19] border border-[#383330] hover:border-[#E07A5F] rounded-xl p-3 shadow-lg min-w-[200px] transition-all cursor-pointer">
      <Handle type="target" position={Position.Left} className="!bg-[#E07A5F]" />
      <Handle type="source" position={Position.Right} className="!bg-[#E07A5F]" />
      <div className="flex items-center space-x-2 text-[#709775] mb-1">
        <FiUser className="w-3.5 h-3.5" />
        <span className="text-xs font-bold text-[#E8E3DD]">HR Approval Review</span>
      </div>
      <p className="text-[11px] text-[#A39C95]">Reviewer: {d.reviewer || 'Alex Mercer'}</p>
      <div className="mt-2 flex items-center space-x-1 text-[10px] text-[#F4A261]">
        <FiClock className="w-3 h-3" />
        <span>Awaiting Approval Action</span>
      </div>
    </div>
  );
});

// 4. Custom Approval Status Node
export const ApprovalStatusNode = memo(({ data }: NodeProps) => {
  const d = data as { status?: 'Approved' | 'Rejected' | 'Pending'; timestamp?: string };
  const isApproved = d.status === 'Approved';
  const isRejected = d.status === 'Rejected';

  return (
    <div className={`border rounded-xl p-3 shadow-lg min-w-[190px] transition-all cursor-pointer ${
      isApproved ? 'bg-[#1C251F] border-[#709775]' : isRejected ? 'bg-[#291B1B] border-[#E06C68]' : 'bg-[#1C1A19] border-[#383330]'
    }`}>
      <Handle type="target" position={Position.Left} className="!bg-[#E07A5F]" />
      <div className="flex items-center space-x-2 mb-1">
        {isApproved ? (
          <FiCheckCircle className="w-4 h-4 text-[#709775]" />
        ) : isRejected ? (
          <FiXCircle className="w-4 h-4 text-[#E06C68]" />
        ) : (
          <FiClock className="w-4 h-4 text-[#F4A261]" />
        )}
        <span className={`text-xs font-bold ${isApproved ? 'text-[#709775]' : isRejected ? 'text-[#E06C68]' : 'text-[#F4A261]'}`}>
          {d.status || 'Pending'}
        </span>
      </div>
      <p className="text-[10px] text-[#A39C95]">Employee record updated</p>
      <span className="text-[9px] text-[#78726A] block mt-1">{d.timestamp || 'Just now'}</span>
    </div>
  );
});

// 5. Custom Payroll Node
export const PayrollNode = memo(({ data }: NodeProps) => {
  const d = data as { employeeName?: string; netSalary?: number };
  return (
    <div className="bg-[#1C1A19] border border-[#383330] hover:border-[#E07A5F] rounded-xl p-3 shadow-lg min-w-[210px] transition-all cursor-pointer">
      <Handle type="target" position={Position.Left} className="!bg-[#E07A5F]" />
      <div className="flex items-center space-x-2 text-[#F4A261] mb-1">
        <FiDollarSign className="w-4 h-4" />
        <span className="text-xs font-bold text-[#E8E3DD]">Salary Structure</span>
      </div>
      <p className="text-[11px] text-[#A39C95]">{d.employeeName || 'Staff Member'}</p>
      <div className="mt-2 pt-2 border-t border-[#292624] flex items-center justify-between">
        <span className="text-[10px] text-[#78726A]">Net Monthly</span>
        <span className="text-xs font-bold font-mono text-[#709775]">
          ${d.netSalary ? d.netSalary.toLocaleString() : '75,000'}
        </span>
      </div>
    </div>
  );
});
