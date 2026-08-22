import React from 'react';
import { useViewMode } from '../context/ViewModeContext';
import { FiGitCommit, FiDatabase, FiType, FiCheck } from 'react-icons/fi';

export const SettingsPage: React.FC = () => {
  const { mode, setMode } = useViewMode();

  return (
    <div className="p-8 space-y-8 max-w-4xl mx-auto">
      <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl">
        <h2 className="font-crimson text-2xl font-bold text-[#E8E3DD]">
          System Configurations
        </h2>
        <p className="text-xs text-[#A39C95] font-carme mt-0.5">
          Interface preferences, typography settings, and database synchronization.
        </p>
      </div>

      {/* Interface Mode Preference */}
      <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-[#E07A5F]">
          <FiGitCommit className="w-5 h-5" />
          <h3 className="font-crimson font-bold text-lg text-[#E8E3DD]">
            Default Workflow View Mode
          </h3>
        </div>
        <p className="text-xs text-[#A39C95]">
          Choose your default interface layout for leave workflows, approval pipelines, and organizational directory mapping.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          <div
            onClick={() => setMode('canvas')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              mode === 'canvas'
                ? 'bg-[#2B2825] border-[#E07A5F] ring-1 ring-[#E07A5F]'
                : 'bg-[#181716] border-[#332F2C] hover:border-[#E07A5F]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#E8E3DD]">Interactive Visual Canvas</span>
              {mode === 'canvas' && <FiCheck className="w-4 h-4 text-[#E07A5F]" />}
            </div>
            <p className="text-[11px] text-[#A39C95] mt-1">
              Visual node topology graph, custom handles, and side panel node inspection.
            </p>
          </div>

          <div
            onClick={() => setMode('traditional')}
            className={`p-4 rounded-xl border cursor-pointer transition-all ${
              mode === 'traditional'
                ? 'bg-[#2B2825] border-[#709775] ring-1 ring-[#709775]'
                : 'bg-[#181716] border-[#332F2C] hover:border-[#709775]/50'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-bold text-xs text-[#E8E3DD]">Structured Directory Table</span>
              {mode === 'traditional' && <FiCheck className="w-4 h-4 text-[#709775]" />}
            </div>
            <p className="text-[11px] text-[#A39C95] mt-1">
              Structured tables, forms, status badges, and interactive action controls.
            </p>
          </div>
        </div>
      </div>

      {/* Typography System Information */}
      <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-[#709775]">
          <FiType className="w-5 h-5" />
          <h3 className="font-crimson font-bold text-lg text-[#E8E3DD]">
            Typography System
          </h3>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          <div className="p-3 bg-[#181716] border border-[#2B2825] rounded-xl">
            <span className="text-[#78726A] block text-[10px] uppercase font-semibold">Primary Headings</span>
            <span className="font-crimson font-bold text-lg text-[#E8E3DD] block mt-1">Crimson Text</span>
            <span className="text-[10px] text-[#A39C95]">Editorial serif precision</span>
          </div>

          <div className="p-3 bg-[#181716] border border-[#2B2825] rounded-xl">
            <span className="text-[#78726A] block text-[10px] uppercase font-semibold">UI & Dashboard Text</span>
            <span className="font-carme text-sm font-semibold text-[#E8E3DD] block mt-1">Carme</span>
            <span className="text-[10px] text-[#A39C95]">Clean, readable UI font</span>
          </div>

          <div className="p-3 bg-[#181716] border border-[#2B2825] rounded-xl">
            <span className="text-[#78726A] block text-[10px] uppercase font-semibold">Product Moments</span>
            <span className="font-crafty text-sm text-[#E07A5F] block mt-1">Crafty Girls</span>
            <span className="text-[10px] text-[#A39C95]">Handwritten notes</span>
          </div>
        </div>
      </div>

      {/* Database & Backend Architecture */}
      <div className="bg-[#1C1A19] border border-[#332F2C] rounded-2xl p-6 shadow-xl space-y-4">
        <div className="flex items-center space-x-2 text-[#F4A261]">
          <FiDatabase className="w-5 h-5" />
          <h3 className="font-crimson font-bold text-lg text-[#E8E3DD]">
            Database & Backend Architecture
          </h3>
        </div>
        <div className="p-4 bg-[#141312] border border-[#2B2825] rounded-xl text-xs space-y-2 font-mono text-[#A39C95]">
          <div className="flex justify-between"><span>Backend Engine:</span> <span className="text-[#709775] font-bold">GoFiber v3</span></div>
          <div className="flex justify-between"><span>Database:</span> <span className="text-[#E07A5F] font-bold">PostgreSQL / SQLite GORM</span></div>
          <div className="flex justify-between"><span>State Engine:</span> <span className="text-[#E8E3DD]">Zustand</span></div>
          <div className="flex justify-between"><span>Containerization:</span> <span className="text-[#F4A261]">Docker & Docker Compose</span></div>
        </div>
      </div>
    </div>
  );
};
