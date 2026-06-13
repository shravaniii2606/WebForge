import React, { useState } from 'react';
import { useDesks } from '../context/DeskContext';

export default function DemoPanel() {
  const {
    desks,
    timerSpeed,
    setTimerSpeed,
    triggerStillHereAlert,
    simulateHoardingSensor,
    stats,
  } = useDesks();

  const [isOpen, setIsOpen] = useState(false);
  const [selectedDeskId, setSelectedDeskId] = useState(1);

  const speeds = [
    { label: 'Normal (1s)', value: 1 },
    { label: 'Fast (10x)', value: 10 },
    { label: 'Hour/Min (60x)', value: 60 },
    { label: 'Speedy (100x)', value: 100 },
  ];

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Toggle Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-emerald-600 hover:from-primary-400 hover:to-emerald-500 text-navy-950 font-bold rounded-full shadow-2xl transition duration-200 border border-primary-400/20"
      >
        <span className="flex h-2.5 w-2.5 rounded-full bg-navy-950 animate-ping"></span>
        <span>{isOpen ? 'Close Demo Deck' : 'Open Demo Simulation'}</span>
      </button>

      {/* Slide-up Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 w-80 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-2xl space-y-5 border-b-4 border-b-primary-500 animate-scale-in">
          <div className="border-b border-navy-800 pb-3">
            <h4 className="font-bold text-white text-sm">Demo Simulation Deck</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Simulate events and test the anti-hoarding rules instantly without waiting for real time.
            </p>
          </div>

          {/* Time Accelerator */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Timer Speed</label>
            <div className="grid grid-cols-2 gap-1.5">
              {speeds.map((s) => (
                <button
                  key={s.value}
                  onClick={() => setTimerSpeed(s.value)}
                  className={`text-[10px] py-1.5 font-bold rounded-lg border transition ${
                    timerSpeed === s.value
                      ? 'bg-primary-500 border-primary-500 text-navy-950'
                      : 'bg-navy-950 border-navy-800 hover:border-navy-700 text-slate-300'
                  }`}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Seat Target selection */}
          <div className="space-y-2">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Target Desk Selection</label>
            <select
              value={selectedDeskId}
              onChange={(e) => setSelectedDeskId(parseInt(e.target.value))}
              className="w-full bg-navy-950 border border-navy-800 rounded-lg px-2 py-2 text-xs font-bold text-white focus:outline-none"
            >
              {desks.map((d) => (
                <option key={d.id} value={d.id}>
                  Desk #{d.id} ({d.status.toUpperCase()})
                </option>
              ))}
            </select>
          </div>

          {/* Simulation Commands */}
          <div className="space-y-2 border-t border-navy-800 pt-4">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block mb-2">Simulate Events</label>
            <div className="space-y-2">
              <button
                onClick={() => {
                  triggerStillHereAlert(selectedDeskId);
                  setIsOpen(false); // Close panel to see modal
                }}
                className="w-full text-left px-3 py-2.5 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/20 text-amber-400 rounded-xl text-xs font-bold transition flex justify-between items-center"
              >
                <span>Trigger Still Here Alert</span>
                <span className="text-[9px] bg-amber-500/20 px-1 py-0.5 rounded">Screen 4</span>
              </button>
              <button
                onClick={() => simulateHoardingSensor(selectedDeskId)}
                className="w-full text-left px-3 py-2.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 rounded-xl text-xs font-bold transition flex justify-between items-center"
              >
                <span>Simulate Sensor Idle (Hoard)</span>
                <span className="text-[9px] bg-red-500/20 px-1 py-0.5 rounded">Sensor Alert</span>
              </button>
            </div>
          </div>

          {/* Quick status counters summary */}
          <div className="text-[9px] text-slate-500 flex justify-between border-t border-navy-800 pt-3">
            <span>F: {stats.free}</span>
            <span>O: {stats.occupied}</span>
            <span>A: {stats.away}</span>
            <span>Ab: {stats.abandoned}</span>
            <span className="text-primary-500 font-bold uppercase">Ready</span>
          </div>
        </div>
      )}
    </div>
  );
}
