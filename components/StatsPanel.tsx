import React from 'react';
import { SimulationStats } from '../types';
import { Timer, ArrowRight, ArrowUp, Flag } from 'lucide-react';

interface StatsPanelProps {
  stats: SimulationStats;
}

const StatsPanel: React.FC<StatsPanelProps> = ({ stats }) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 w-full">
      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex items-center gap-3">
        <div className="p-2 bg-blue-50 text-blue-600 rounded-full">
          <Timer size={20} />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase">Time Elapsed</p>
          <p className="text-xl font-bold text-slate-800">{stats.time.toFixed(2)} <span className="text-sm font-normal text-slate-500">s</span></p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex items-center gap-3">
        <div className="p-2 bg-purple-50 text-purple-600 rounded-full">
          <ArrowRight size={20} />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase">Displacement X</p>
          <p className="text-xl font-bold text-slate-800">{stats.displacementX.toFixed(1)} <span className="text-sm font-normal text-slate-500">m</span></p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-lg shadow-sm border border-slate-100 flex items-center gap-3">
        <div className="p-2 bg-emerald-50 text-emerald-600 rounded-full">
          <ArrowUp size={20} />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase">Displacement Y</p>
          <p className="text-xl font-bold text-slate-800">{stats.displacementY.toFixed(1)} <span className="text-sm font-normal text-slate-500">m</span></p>
        </div>
      </div>

      <div className={`p-4 rounded-lg shadow-sm border flex items-center gap-3 transition-colors ${stats.isFinished ? 'bg-green-50 border-green-200' : 'bg-white border-slate-100'}`}>
        <div className={`p-2 rounded-full ${stats.isFinished ? 'bg-green-200 text-green-700' : 'bg-slate-100 text-slate-400'}`}>
          <Flag size={20} />
        </div>
        <div>
          <p className="text-xs text-slate-500 font-medium uppercase">Status</p>
          <p className={`text-lg font-bold ${stats.isFinished ? 'text-green-700' : 'text-slate-400'}`}>
            {stats.isFinished ? 'Arrived!' : 'Crossing...'}
          </p>
        </div>
      </div>
    </div>
  );
};

export default StatsPanel;
