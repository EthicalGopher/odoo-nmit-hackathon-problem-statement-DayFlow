import React, { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
} from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { EmployeeNode, LeaveNode, HRReviewNode, ApprovalStatusNode } from './CustomNodes';
import { WorkflowSidePanel } from './WorkflowSidePanel';
import type { LeaveRequest } from '../../types';

const nodeTypes = {
  employeeNode: EmployeeNode,
  leaveNode: LeaveNode,
  hrReviewNode: HRReviewNode,
  approvalStatusNode: ApprovalStatusNode,
};

interface LeaveWorkflowCanvasProps {
  leaveRequests: LeaveRequest[];
  onApproveLeave?: (id: number) => void;
  onRejectLeave?: (id: number) => void;
}

export const LeaveWorkflowCanvas: React.FC<LeaveWorkflowCanvasProps> = ({
  leaveRequests,
  onApproveLeave,
  onRejectLeave,
}) => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const initialNodes: Node[] = [
    {
      id: 'emp-1',
      type: 'employeeNode',
      position: { x: 50, y: 100 },
      data: { name: 'Sophia Chen', role: 'Lead Engineer', status: 'present', avatarUrl: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150' },
    },
    {
      id: 'leave-1',
      type: 'leaveNode',
      position: { x: 300, y: 100 },
      data: { leaveId: 2, leaveType: 'Sick', dates: 'Aug 25 – Aug 26', days: 2, reason: 'Dental surgery consultation' },
    },
    {
      id: 'hr-1',
      type: 'hrReviewNode',
      position: { x: 570, y: 100 },
      data: { reviewer: 'Alex Mercer', actionNeeded: true },
    },
    {
      id: 'status-1',
      type: 'approvalStatusNode',
      position: { x: 820, y: 100 },
      data: { status: 'Pending', timestamp: 'Submitted 1h ago' },
    },
    {
      id: 'emp-2',
      type: 'employeeNode',
      position: { x: 50, y: 260 },
      data: { name: 'Marcus Vance', role: 'Product Designer', status: 'leave', avatarUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150' },
    },
    {
      id: 'leave-2',
      type: 'leaveNode',
      position: { x: 300, y: 260 },
      data: { leaveId: 1, leaveType: 'Paid', dates: 'Aug 20 – Aug 23', days: 4, reason: 'Annual family vacation' },
    },
    {
      id: 'hr-2',
      type: 'hrReviewNode',
      position: { x: 570, y: 260 },
      data: { reviewer: 'Alex Mercer', actionNeeded: false },
    },
    {
      id: 'status-2',
      type: 'approvalStatusNode',
      position: { x: 820, y: 260 },
      data: { status: 'Approved', timestamp: 'Approved yesterday' },
    },
  ];

  const initialEdges: Edge[] = [
    { id: 'e1-2', source: 'emp-1', target: 'leave-1', animated: true, style: { stroke: '#E07A5F', strokeWidth: 2 } },
    { id: 'e2-3', source: 'leave-1', target: 'hr-1', animated: true, style: { stroke: '#E07A5F', strokeWidth: 2 } },
    { id: 'e3-4', source: 'hr-1', target: 'status-1', animated: true, style: { stroke: '#F4A261', strokeWidth: 2, strokeDasharray: '5,5' } },

    { id: 'e5-6', source: 'emp-2', target: 'leave-2', style: { stroke: '#709775', strokeWidth: 2 } },
    { id: 'e6-7', source: 'leave-2', target: 'hr-2', style: { stroke: '#709775', strokeWidth: 2 } },
    { id: 'e7-8', source: 'hr-2', target: 'status-2', style: { stroke: '#709775', strokeWidth: 2 } },
  ];

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  const onNodeClick = useCallback((_: any, node: Node) => {
    setSelectedNode(node);
  }, []);

  return (
    <div className="w-full h-[520px] bg-[#141312] border border-[#332F2C] rounded-2xl relative overflow-hidden flex">
      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={onNodeClick}
          fitView
        >
          <Controls />
          <Background color="#292624" gap={18} size={1} />
        </ReactFlow>

        <div className="absolute top-4 left-4 bg-[#1C1A19]/90 border border-[#332F2C] px-3.5 py-2 rounded-xl text-xs backdrop-blur shadow-md">
          <span className="font-crimson font-bold text-[#E8E3DD] block">Leave Approval Workflow Canvas</span>
          <span className="font-crafty text-[11px] text-[#E07A5F]">Click any node to inspect details & approve</span>
        </div>
      </div>

      {selectedNode && (
        <WorkflowSidePanel
          selectedNode={selectedNode}
          onClose={() => setSelectedNode(null)}
          onApproveLeave={onApproveLeave}
          onRejectLeave={onRejectLeave}
          leaveRequests={leaveRequests}
        />
      )}
    </div>
  );
};
