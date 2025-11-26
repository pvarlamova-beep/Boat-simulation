import React, { useState, useCallback } from 'react';
import Controls from './components/Controls';
import SimulationCanvas from './components/SimulationCanvas';
import StatsPanel from './components/StatsPanel';
import { SimulationConfig, INITIAL_CONFIG, SimulationStats } from './types';
import { Ship } from 'lucide-react';

const App: React.FC = () => {
  const [config, setConfig] = useState<SimulationConfig>(INITIAL_CONFIG);
  const [isPlaying, setIsPlaying] = useState(false);
  const [shouldReset, setShouldReset] = useState(false);
  const [stats, setStats] = useState<SimulationStats>({
    time: 0,
    displacementX: 0,
    displacementY: 0,
    isFinished: false
  });

  const handlePlayToggle = () => {
    if (stats.isFinished) {
      // If finished, restart logic (handled by reset)
      setShouldReset(true);
      setIsPlaying(true);
    } else {
      setIsPlaying(!isPlaying);
    }
  };

  const handleReset = () => {
    setIsPlaying(false);
    setShouldReset(true);
  };

  const handleResetComplete = useCallback(() => {
    setShouldReset(false);
  }, []);

  const handleStatsUpdate = useCallback((newStats: SimulationStats) => {
    // Only update state if values significantly changed or finished state changed to reduce renders
    // Or just let React handle it (usually fine for 60fps on modern machines if DOM isn't huge)
    // We'll trust React's batching but can optimize if needed.
    setStats(newStats);
    
    if (newStats.isFinished && isPlaying) {
      setIsPlaying(false);
    }
  }, [isPlaying]);

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex items-center gap-3 shadow-sm z-10">
        <div className="p-2 bg-blue-600 rounded-lg text-white">
          <Ship size={24} />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">Boat on the River</h1>
          <p className="text-sm text-slate-500">MYP4 Physics Simulation: Relative Velocity & Vectors</p>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-6 flex flex-col md:flex-row gap-6 h-[calc(100vh-80px)] overflow-hidden">
        
        {/* Left Column: Controls */}
        <aside className="hidden md:block shrink-0">
          <Controls
            config={config}
            setConfig={setConfig}
            isPlaying={isPlaying}
            onPlayToggle={handlePlayToggle}
            onReset={handleReset}
          />
        </aside>

        {/* Right Column: Visualization & Stats */}
        <div className="flex-1 flex flex-col gap-4 min-h-0">
          
          {/* Mobile Controls (Collapsible or simplified - showing full here for simplicity if screen allows) */}
          <div className="md:hidden">
             <Controls
                config={config}
                setConfig={setConfig}
                isPlaying={isPlaying}
                onPlayToggle={handlePlayToggle}
                onReset={handleReset}
              />
          </div>

          {/* Stats Bar */}
          <StatsPanel stats={stats} />

          {/* Canvas Container */}
          <div className="flex-1 bg-white rounded-xl shadow-lg border border-slate-200 p-2 relative min-h-[300px]">
             <SimulationCanvas
               config={config}
               isPlaying={isPlaying}
               shouldReset={shouldReset}
               onResetComplete={handleResetComplete}
               onStatsUpdate={handleStatsUpdate}
             />
             
             {/* Legend Overlay */}
             <div className="absolute top-4 right-4 bg-white/90 backdrop-blur border border-slate-200 p-3 rounded-lg shadow-sm text-xs space-y-2 pointer-events-none">
                <div className="font-bold text-slate-700 mb-1">Vector Key</div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-green-600 relative after:content-[''] after:absolute after:right-0 after:-top-1 after:border-l-[6px] after:border-l-green-600 after:border-y-[4px] after:border-y-transparent"></div>
                  <span>Velocity (Boat)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-cyan-500 relative after:content-[''] after:absolute after:right-0 after:-top-1 after:border-l-[6px] after:border-l-cyan-500 after:border-y-[4px] after:border-y-transparent"></div>
                  <span>Velocity (River)</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-8 h-0.5 bg-red-600 relative after:content-[''] after:absolute after:right-0 after:-top-1 after:border-l-[6px] after:border-l-red-600 after:border-y-[4px] after:border-y-transparent"></div>
                  <span>Velocity (Resultant)</span>
                </div>
             </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default App;
