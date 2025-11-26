import React from 'react';
import { SimulationConfig } from '../types';
import { Settings, Play, Pause, RotateCcw, Eye, EyeOff } from 'lucide-react';

interface ControlsProps {
  config: SimulationConfig;
  setConfig: React.Dispatch<React.SetStateAction<SimulationConfig>>;
  isPlaying: boolean;
  onPlayToggle: () => void;
  onReset: () => void;
}

const Controls: React.FC<ControlsProps> = ({
  config,
  setConfig,
  isPlaying,
  onPlayToggle,
  onReset,
}) => {
  const handleChange = (key: keyof SimulationConfig, value: number | boolean) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg w-full md:w-80 flex flex-col gap-6 overflow-y-auto max-h-screen border border-slate-200">
      <div className="flex items-center gap-2 border-b pb-4 mb-2">
        <Settings className="text-slate-600" />
        <h2 className="text-xl font-bold text-slate-800">Parameters</h2>
      </div>

      {/* Main Action Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={onPlayToggle}
          className={`flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold transition-colors ${
            isPlaying
              ? 'bg-amber-100 text-amber-700 hover:bg-amber-200'
              : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
          }`}
        >
          {isPlaying ? <Pause size={18} /> : <Play size={18} />}
          {isPlaying ? 'Pause' : 'Start'}
        </button>
        <button
          onClick={onReset}
          className="flex items-center justify-center gap-2 py-2 px-4 rounded-lg font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors"
        >
          <RotateCcw size={18} />
          Reset
        </button>
      </div>

      {/* Sliders */}
      <div className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Boat Speed (V<sub>b</sub>): <span className="text-blue-600 font-bold">{config.boatSpeed} m/s</span>
          </label>
          <input
            type="range"
            min="0"
            max="15"
            step="0.5"
            value={config.boatSpeed}
            onChange={(e) => handleChange('boatSpeed', parseFloat(e.target.value))}
            className="w-full accent-blue-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            River Flow (V<sub>r</sub>): <span className="text-cyan-600 font-bold">{config.riverSpeed} m/s</span>
          </label>
          <input
            type="range"
            min="0"
            max="10"
            step="0.5"
            value={config.riverSpeed}
            onChange={(e) => handleChange('riverSpeed', parseFloat(e.target.value))}
            className="w-full accent-cyan-600"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-600 mb-1">
            Aim Angle (&theta;): <span className="text-purple-600 font-bold">{config.angle}&deg;</span>
          </label>
          <input
            type="range"
            min="0"
            max="180"
            step="1"
            value={config.angle}
            onChange={(e) => handleChange('angle', parseFloat(e.target.value))}
            className="w-full accent-purple-600"
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Downstream (0&deg;)</span>
            <span>Upstream (180&deg;)</span>
          </div>
        </div>

        <div className="pt-2 border-t">
            <label className="block text-sm font-medium text-slate-600 mb-1">
              Simulation Speed: <span className="text-slate-800 font-bold">{config.simSpeed}x</span>
            </label>
            <input
              type="range"
              min="0.1"
              max="5"
              step="0.1"
              value={config.simSpeed}
              onChange={(e) => handleChange('simSpeed', parseFloat(e.target.value))}
              className="w-full accent-slate-600"
            />
        </div>
      </div>

      {/* Toggles */}
      <div className="space-y-3 pt-2 border-t">
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Visualization</h3>
        
        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm text-slate-700 group-hover:text-slate-900">Show Vectors</span>
          <button
             onClick={() => handleChange('showVectors', !config.showVectors)}
             className={`p-1.5 rounded-md transition-colors ${config.showVectors ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}
          >
            {config.showVectors ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </label>

        <label className="flex items-center justify-between cursor-pointer group">
          <span className="text-sm text-slate-700 group-hover:text-slate-900">Show Trajectory</span>
          <button
             onClick={() => handleChange('showTrajectory', !config.showTrajectory)}
             className={`p-1.5 rounded-md transition-colors ${config.showTrajectory ? 'bg-blue-100 text-blue-600' : 'bg-slate-100 text-slate-400'}`}
          >
            {config.showTrajectory ? <Eye size={16} /> : <EyeOff size={16} />}
          </button>
        </label>
      </div>
    </div>
  );
};

export default Controls;
