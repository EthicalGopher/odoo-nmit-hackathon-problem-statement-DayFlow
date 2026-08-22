import React, { useState } from 'react';
import { ReactFlow, Controls, Background, useNodesState, useEdgesState } from '@xyflow/react';
import type { Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { EmployeeNode, LeaveNode, PayrollNode } from './CustomNodes';
import { WorkflowSidePanel } from './WorkflowSidePanel';

const nodeTypes = {
  employeeNode: EmployeeNode,
  leaveNode: LeaveNode,
  payrollNode: PayrollNode,
};

export const EmployeeJourneyCanvas: React.FC = () => {
  const [selectedNode, setSelectedNode] = useState<Node | null>(null);

  const initialNodes: Node[] = [
    {
      id: 'journey-emp',
      type: 'employeeNode',
      position: { x: 50, y: 150 },
      data: { name: 'Alex Mercer', role: 'Head of HR', status: 'present', avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150' },
    },
    {
      id: 'journey-leave',
      type: 'leaveNode',
      position: { x: 320, y: 150 },
      data: { leaveType: 'Paid', dates: '24 Available', days: 24, reason: 'Active annual leave balance' },
    },
    {
      id: 'journey-payroll',
      type: 'payrollNode',
      position: { x: 590, y: 150 },
      data: { employeeName: 'Alex Mercer', netSalary: 89100, status: 'Active' },
    },
  ];

  const initialEdges: Edge[] = [
    { id: 'ej1-2', source: 'journey-emp', target: 'journey-leave', animated: true, style: { stroke: '#E07A5F', strokeWidth: 2 } },
    { id: 'ej2-3', source: 'journey-leave', target: 'journey-payroll', animated: true, style: { stroke: '#709775', strokeWidth: 2 } },
  ];

  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div className="w-full h-[400px] bg-[#141312] border border-[#332F2C] rounded-2xl relative overflow-hidden flex">
      <div className="flex-1 h-full relative">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          nodeTypes={nodeTypes}
          onNodeClick={(_, node) => setSelectedNode(node)}
          fitView
        >
          <Controls />
          <Background color="#292624" gap={18} size={1} />
        </ReactFlow>

        <div className="absolute top-4 left-4 bg-[#1C1A19]/90 border border-[#332F2C] px-3.5 py-2 rounded-xl text-xs backdrop-blur shadow-md">
          <span className="font-crimson font-bold text-[#E8E3DD] block">Employee Lifecycle & Systems Flow</span>
          <span className="font-crafty text-[11px] text-[#709775]">Visual map connecting profile, leave, and payroll</span>
        </div>
      </div>

      {selectedNode && (
        <WorkflowSidePanel selectedNode={selectedNode} onClose={() => setSelectedNode(null)} />
      )}
    </div>
  );
};
