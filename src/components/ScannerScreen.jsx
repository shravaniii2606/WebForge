import React, { useState, useEffect } from 'react';
import { useDesks } from '../context/DeskContext';

// Simulated desk IDs that could be scanned (in a real app, QR codes embed this)
const SCANNABLE_DESK_IDS = Array.from({ length: 30 }, (_, i) => i + 1);

export default function ScannerScreen() {
  const { desks, checkIn, userRole, currentUser, login, setSelectedDeskId, setCurrentView } = useDesks();

  // --- States ---
  const [phase, setPhase] = useState('idle'); // 'idle' | 'scanning' | 'success' | 'blocked'
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedDeskId, setScannedDeskId] = useState(null);
  const [blockedDeskId, setBlockedDeskId] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null); // e.g. desk is occupied by someone else

  // Pick a random free desk to simulate the QR pointing to
  const pickRandomFreeDeskId = () => {
    const freeDesks = desks.filter(d => d.status === 'free');
    if (freeDesks.length === 0) return null;
    return freeDesks[Math.floor(Math.random() * freeDesks.length)].id;
  };

  // Start scan
  const handleStartScan = () => {
    const resolvedDeskId = pickRandomFreeDeskId();
    if (!resolvedDeskId) {
      setErrorMsg('No free desks available right now.');
      return;
    }
    setScannedDeskId(resolvedDeskId);
    setScanProgress(0);
    setPhase('scanning');
    setErrorMsg(null);
    setBlockedDeskId(null);
  };

  // Reset back to idle
  const handleReset = () => {
    setPhase('idle');
    setScanProgress(0);
    setScannedDeskId(null);
    setBlockedDeskId(null);
    setErrorMsg(null);
  };

  // Scanning progress interval
  useEffect(() => {
    if (phase !== 'scanning') return;
    const interval = setInterval(() => {
      setScanProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          // Attempt check-in after 1s visual delay
          setTimeout(() => {
            const finalStudentId = currentUser || `ST-${Math.floor(1000 + Math.random() * 9000)}`;
            if (!userRole) {
              login('student', finalStudentId);
            }

            // Check if already holding a desk
            const alreadyHeld = desks.find(
              d => d.studentId === finalStudentId &&
                   (d.status === 'occupied' || d.status === 'away')
            );
            if (alreadyHeld) {
              setBlockedDeskId(alreadyHeld.id);
              setPhase('blocked');
              return;
            }

            // Desk might have been taken while we were "scanning"
            const targetDesk = desks.find(d => d.id === scannedDeskId);
            if (!targetDesk || targetDesk.status !== 'free') {
              setErrorMsg(`Desk #${scannedDeskId} is no longer free. Please rescan.`);
              setPhase('idle');
              return;
            }

            const result = checkIn(scannedDeskId, finalStudentId);
            if (result && result.blocked) {
              setBlockedDeskId(result.existingDeskId);
              setPhase('blocked');
            } else {
              setPhase('success');
            }
          }, 900);
          return 100;
        }
        return prev + 7;
      });
    }, 130);
    return () => clearInterval(interval);
  }, [phase, scannedDeskId]);

  return (
    <div className="max-w-xl mx-auto px-6 py-10 min-h-[calc(100vh-80px)] flex flex-col">

      {/* Page Header */}
      <div className="mb-8">
        <h2 className="text-3xl font-extrabold text-white">QR Check-in</h2>
        <p className="text-slate-400 text-sm mt-1">
          Scan the QR code at your desk to secure your seat.
        </p>
      </div>

      {/* Main Card */}
      <div className="flex-grow flex flex-col items-center justify-start">

        {/* ── IDLE ── */}
        {phase === 'idle' && (
          <div className="w-full bg-navy-850 border border-navy-800 rounded-2xl p-8 flex flex-col items-center text-center gap-6">
            {/* Static viewfinder */}
            <div className="relative w-64 h-64 bg-navy-950 border-2 border-navy-700 rounded-2xl flex items-center justify-center overflow-hidden">
              {/* Corners */}
              <div className="absolute top-4 left-4 h-7 w-7 border-t-4 border-l-4 border-primary-500 rounded-tl-sm" />
              <div className="absolute top-4 right-4 h-7 w-7 border-t-4 border-r-4 border-primary-500 rounded-tr-sm" />
              <div className="absolute bottom-4 left-4 h-7 w-7 border-b-4 border-l-4 border-primary-500 rounded-bl-sm" />
              <div className="absolute bottom-4 right-4 h-7 w-7 border-b-4 border-r-4 border-primary-500 rounded-br-sm" />
              {/* Camera icon */}
              <div className="flex flex-col items-center gap-3 opacity-40">
                <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">Camera Ready</span>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Ready to Scan</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed max-w-xs">
                Point your camera at the QR code posted on the physical desk to instantly check in and reserve your seat.
              </p>
            </div>

            {errorMsg && (
              <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-3 text-xs text-red-400 font-semibold">
                {errorMsg}
              </div>
            )}

            <button
              onClick={handleStartScan}
              className="w-full py-4 bg-primary-500 hover:bg-primary-400 text-navy-950 font-black rounded-xl shadow-lg shadow-primary-500/20 transition-all duration-200 uppercase tracking-widest text-sm"
            >
              Simulate QR Scan
            </button>

            <button
              onClick={() => setCurrentView('map')}
              className="text-xs text-slate-500 hover:text-slate-300 transition"
            >
              ← Back to Live Map
            </button>
          </div>
        )}

        {/* ── SCANNING ── */}
        {phase === 'scanning' && (
          <div className="w-full bg-navy-850 border border-navy-800 rounded-2xl p-8 flex flex-col items-center text-center gap-6">
            <div className="relative w-64 h-64 bg-black border-2 border-primary-500 rounded-2xl overflow-hidden flex items-center justify-center">
              {/* Laser sweep */}
              <div className="absolute left-0 right-0 h-[3px] bg-red-500 shadow-lg shadow-red-500/80 animate-scan-laser z-20" />
              {/* Corners */}
              <div className="absolute top-4 left-4 h-7 w-7 border-t-4 border-l-4 border-primary-500 rounded-tl-sm" />
              <div className="absolute top-4 right-4 h-7 w-7 border-t-4 border-r-4 border-primary-500 rounded-tr-sm" />
              <div className="absolute bottom-4 left-4 h-7 w-7 border-b-4 border-l-4 border-primary-500 rounded-bl-sm" />
              <div className="absolute bottom-4 right-4 h-7 w-7 border-b-4 border-r-4 border-primary-500 rounded-br-sm" />
              {/* Fake QR code in the frame */}
              <svg className="w-28 h-28 text-white opacity-30 z-10" viewBox="0 0 100 100" fill="currentColor">
                <rect x="0"  y="0"  width="25" height="25" />
                <rect x="0"  y="75" width="25" height="25" />
                <rect x="75" y="0"  width="25" height="25" />
                <rect x="75" y="75" width="25" height="25" />
                <rect x="10" y="10" width="5"  height="5"  fill="black" />
                <rect x="85" y="10" width="5"  height="5"  fill="black" />
                <rect x="10" y="85" width="5"  height="5"  fill="black" />
                <rect x="35" y="35" width="30" height="30" />
                <rect x="35" y="10" width="10" height="15" />
                <rect x="10" y="35" width="15" height="10" />
                <rect x="55" y="75" width="10" height="15" />
                <rect x="75" y="55" width="15" height="10" />
              </svg>
            </div>

            <div>
              <h3 className="text-lg font-bold text-white">Scanning Desk #{scannedDeskId}</h3>
              <p className="text-xs text-slate-400 mt-1">Verifying seat availability…</p>
            </div>

            {/* Progress bar */}
            <div className="w-full bg-navy-950 h-2.5 rounded-full overflow-hidden border border-navy-800">
              <div
                className="h-full bg-gradient-to-r from-primary-500 to-emerald-400 transition-all duration-100 ease-out"
                style={{ width: `${scanProgress}%` }}
              />
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3 bg-navy-800 hover:bg-navy-700 text-slate-300 font-bold rounded-xl border border-navy-700 transition text-sm"
            >
              Cancel
            </button>
          </div>
        )}

        {/* ── SUCCESS ── */}
        {phase === 'success' && (
          <div className="w-full bg-navy-850 border border-emerald-500/30 rounded-2xl p-8 flex flex-col items-center text-center gap-6">
            <div className="relative w-64 h-64 bg-black border-2 border-emerald-500 rounded-2xl overflow-hidden flex items-center justify-center">
              {/* Corners in green */}
              <div className="absolute top-4 left-4 h-7 w-7 border-t-4 border-l-4 border-emerald-500 rounded-tl-sm" />
              <div className="absolute top-4 right-4 h-7 w-7 border-t-4 border-r-4 border-emerald-500 rounded-tr-sm" />
              <div className="absolute bottom-4 left-4 h-7 w-7 border-b-4 border-l-4 border-emerald-500 rounded-bl-sm" />
              <div className="absolute bottom-4 right-4 h-7 w-7 border-b-4 border-r-4 border-emerald-500 rounded-br-sm" />
              {/* Checkmark */}
              <div className="flex flex-col items-center gap-3 z-10 animate-bounce">
                <svg className="w-20 h-20 text-emerald-400 border-4 border-emerald-400 rounded-full p-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                </svg>
                <span className="text-xs font-black text-emerald-400 uppercase tracking-widest">Seat Verified!</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-white">You're Checked In!</h3>
              <p className="text-sm text-slate-400 mt-1">Desk <span className="text-emerald-400 font-bold">#{scannedDeskId}</span> is now reserved for you.</p>
            </div>

            {/* Confirmation badge */}
            <div className="w-full bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-6 py-4 text-center">
              <span className="text-4xl font-black text-emerald-400">Desk #{scannedDeskId}</span>
              <p className="text-[11px] text-slate-500 mt-1.5 uppercase tracking-wider font-semibold">Reserved • 45 min timer started</p>
            </div>

            <div className="w-full flex flex-col gap-2">
              <button
                onClick={() => { setCurrentView('map'); setSelectedDeskId(scannedDeskId); }}
                className="w-full py-3 bg-primary-500 hover:bg-primary-400 text-navy-950 font-black rounded-xl shadow-md shadow-primary-500/20 transition text-sm uppercase tracking-wider"
              >
                View My Desk on Map
              </button>
              <button
                onClick={handleReset}
                className="w-full py-3 bg-navy-800 hover:bg-navy-700 text-slate-300 font-bold rounded-xl border border-navy-700 transition text-sm"
              >
                Scan Another Code
              </button>
            </div>
          </div>
        )}

        {/* ── BLOCKED ── */}
        {phase === 'blocked' && (
          <div className="w-full bg-navy-850 border border-red-500/30 rounded-2xl p-8 flex flex-col items-center text-center gap-6">
            <div className="relative w-64 h-64 bg-black border-2 border-red-500 rounded-2xl overflow-hidden flex items-center justify-center">
              {/* Corners in red */}
              <div className="absolute top-4 left-4 h-7 w-7 border-t-4 border-l-4 border-red-500 rounded-tl-sm" />
              <div className="absolute top-4 right-4 h-7 w-7 border-t-4 border-r-4 border-red-500 rounded-tr-sm" />
              <div className="absolute bottom-4 left-4 h-7 w-7 border-b-4 border-l-4 border-red-500 rounded-bl-sm" />
              <div className="absolute bottom-4 right-4 h-7 w-7 border-b-4 border-r-4 border-red-500 rounded-br-sm" />
              {/* Blocked icon */}
              <div className="flex flex-col items-center gap-3 z-10">
                <svg className="w-16 h-16 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
                <span className="text-xs font-black text-red-400 uppercase tracking-widest">Check-in Denied</span>
              </div>
            </div>

            <div>
              <h3 className="text-xl font-black text-white">Already Booked</h3>
              <p className="text-sm text-slate-400 mt-1">You can only hold one desk at a time.</p>
            </div>

            <div className="w-full bg-red-500/10 border border-red-500/20 rounded-xl px-6 py-4 text-center">
              <span className="text-4xl font-black text-red-400">Desk #{blockedDeskId}</span>
              <p className="text-[11px] text-slate-500 mt-1.5 uppercase tracking-wider font-semibold">Your current active booking</p>
              <p className="text-xs text-slate-500 mt-1">Release it before checking into a new desk.</p>
            </div>

            <div className="w-full flex flex-col gap-2">
              <button
                onClick={() => { setCurrentView('map'); setSelectedDeskId(blockedDeskId); }}
                className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-black rounded-xl transition text-sm uppercase tracking-wider"
              >
                Go to My Desk #{blockedDeskId}
              </button>
              <button
                onClick={handleReset}
                className="w-full py-3 bg-navy-800 hover:bg-navy-700 text-slate-300 font-bold rounded-xl border border-navy-700 transition text-sm"
              >
                Dismiss
              </button>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
