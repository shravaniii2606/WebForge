import React from 'react';
import { useDesks } from '../context/DeskContext';

export default function StillHereModal() {
  const {
    showStillHereModal,
    stillHereDeskId,
    stillHereTimer,
    confirmStillHere,
    releaseDesk,
  } = useDesks();

  if (!showStillHereModal) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/90 backdrop-blur-md p-6">
      {/* Pulse warning background */}
      <div className="absolute inset-0 bg-red-950/10 animate-pulse pointer-events-none"></div>

      <div className="w-full max-w-md bg-navy-900 border border-red-500/30 rounded-2xl p-8 shadow-2xl border-t-4 border-t-red-500 relative overflow-hidden transform animate-scale-in">
        {/* Animated warning rings */}
        <div className="absolute -top-12 -right-12 h-32 w-32 rounded-full bg-red-500/5 blur-xl pointer-events-none"></div>

        {/* Warning Icon */}
        <div className="flex justify-center mb-6">
          <div className="h-16 w-16 rounded-full bg-red-500/10 border-2 border-red-500/30 flex items-center justify-center text-red-500 animate-bounce">
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>

        {/* Modal Text content */}
        <div className="text-center space-y-3 mb-8">
          <h2 className="text-2xl font-black text-white uppercase tracking-wider">Are you still here?</h2>
          <p className="text-sm text-slate-400">
            Our sensor noticed you might be away from <span className="text-white font-bold">Desk #{stillHereDeskId}</span>.
          </p>
          <div className="p-4 bg-navy-950 border border-navy-800 rounded-xl max-w-[240px] mx-auto my-4">
            <span className="text-[10px] font-bold text-slate-500 block uppercase tracking-widest mb-1">Releasing Seat In</span>
            <span className="text-3xl font-black font-mono text-red-500 tracking-widest animate-pulse">
              {formatTime(stillHereTimer)}
            </span>
          </div>
          <p className="text-[11px] text-red-400/80 italic font-medium px-4">
            If you do not confirm, this desk will be marked Abandoned and released to other students.
          </p>
        </div>

        {/* Buttons */}
        <div className="space-y-3">
          <button
            onClick={confirmStillHere}
            className="w-full py-4 bg-primary-500 hover:bg-primary-400 text-navy-950 font-bold rounded-xl shadow-lg transition duration-200 uppercase text-xs tracking-wider"
          >
            Yes, I'm still here
          </button>
          <button
            onClick={() => releaseDesk(stillHereDeskId)}
            className="w-full py-3 bg-navy-800 hover:bg-navy-750 border border-navy-700 text-slate-300 font-bold rounded-xl transition duration-200 uppercase text-xs tracking-wider"
          >
            Release Desk
          </button>
        </div>
      </div>
    </div>
  );
}
