import React, { useState } from 'react';
import { useDesks } from '../context/DeskContext';

export default function StudentCheckInScreen() {
  const {
    desks,
    currentStudentDesk,
    setCurrentStudentDesk,
    checkIn,
    setAway,
    releaseDesk,
    userRole,
    currentUser,
  } = useDesks();

  const [studentIdInput, setStudentIdInput] = useState(currentUser || `ST-${Math.floor(1000 + Math.random() * 9000)}`);
  
  // Find current desk object
  const activeDesk = desks.find(d => d.id === currentStudentDesk);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const handleDeskSelect = (e) => {
    const id = parseInt(e.target.value);
    setCurrentStudentDesk(id || null);
  };

  // Determine if active desk is reserved by someone else
  const isOccupiedByOther = activeDesk && 
    activeDesk.status !== 'free' && 
    activeDesk.studentId !== currentUser;

  return (
    <div className="max-w-md mx-auto px-6 py-12">
      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-primary-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="bg-navy-850 border border-navy-800 rounded-2xl p-8 shadow-xl relative z-10">
        <div className="text-center mb-8 border-b border-navy-800 pb-6">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-primary-500/10 border border-primary-500/20 text-primary-400 mb-4">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-black text-white">Student QR Check-in</h2>
          <p className="text-xs text-slate-400 mt-1.5">
            Simulating scanning a physical QR code mounted on a library desk workstation.
          </p>
        </div>

        {/* Step 1: No desk scanned -> Select desk */}
        {!currentStudentDesk ? (
          <div className="space-y-6">
            <div>
              <label className="text-xs font-bold text-slate-400 block mb-2 uppercase tracking-widest">Select Desk to Scan</label>
              <select
                onChange={handleDeskSelect}
                className="w-full bg-navy-900 border border-navy-700 focus:border-primary-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition"
                defaultValue=""
              >
                <option value="" disabled>-- Select a library desk to scan --</option>
                {desks.map(desk => (
                  <option key={desk.id} value={desk.id}>
                    Desk #{desk.id} ({desk.status.toUpperCase()})
                  </option>
                ))}
              </select>
            </div>

            <div className="bg-navy-950/40 p-4 rounded-xl border border-navy-800 flex items-start gap-3">
              <svg className="w-5 h-5 text-primary-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-slate-400 leading-relaxed">
                Scanning a desk checks you in, starts your 45-minute reservation timer, and tells sensors you are present.
              </p>
            </div>
          </div>
        ) : (
          /* Step 2: Desk Scanned -> Status Actions */
          <div className="space-y-6">
            <div className="flex justify-between items-center bg-navy-900 border border-navy-800 p-4 rounded-xl">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-500">Scanned Location</span>
                <h3 className="text-xl font-bold text-white">Desk #{activeDesk.id}</h3>
              </div>
              <button
                onClick={() => setCurrentStudentDesk(null)}
                className="text-xs text-primary-400 hover:text-primary-300 font-semibold"
              >
                Scan Another
              </button>
            </div>

            {/* Status Display */}
            <div className="text-center py-4 bg-navy-950/40 border border-navy-800 rounded-xl">
              <span className="text-[10px] uppercase font-bold text-slate-500 block mb-2 tracking-widest">Current Status</span>
              {activeDesk.status === 'free' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400 uppercase">
                  <span className="h-2 w-2 rounded-full bg-emerald-400"></span>
                  Free & Available
                </span>
              ) : activeDesk.status === 'occupied' ? (
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-500/10 border border-red-500/20 text-xs font-bold text-red-400 uppercase">
                    <span className="h-2 w-2 rounded-full bg-red-400 animate-pulse"></span>
                    Occupied
                  </span>
                  {userRole === 'librarian' && (
                    <div className="text-3xl font-black font-mono text-white tracking-widest pt-2">
                      {formatTime(activeDesk.timer)}
                    </div>
                  )}
                  <span className="text-[9px] text-slate-500 block mt-1">45-minute booking limit</span>
                </div>
              ) : activeDesk.status === 'away' ? (
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-400 uppercase">
                    <span className="h-2 w-2 rounded-full bg-amber-400 animate-ping"></span>
                    Away (Temporarily)
                  </span>
                  {userRole === 'librarian' && (
                    <div className="text-3xl font-black font-mono text-white tracking-widest pt-2">
                      {formatTime(activeDesk.timer)}
                    </div>
                  )}
                  <span className="text-[9px] text-amber-500 font-semibold block mt-1">Seat releases in 20 mins max</span>
                </div>
              ) : (
                <div className="space-y-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-700/50 border border-slate-600 text-xs font-bold text-slate-300 uppercase">
                    <span className="h-2 w-2 rounded-full bg-slate-400"></span>
                    Abandoned
                  </span>
                  <p className="text-xs text-red-400 px-4 mt-2 font-medium">
                    Seat flag generated. User left belongings but didn't respond to presence prompt.
                  </p>
                </div>
              )}
            </div>

            {/* Actions based on Desk State & Ownership */}
            <div className="space-y-4 pt-4 border-t border-navy-800">
              {isOccupiedByOther ? (
                /* Occupied by someone else */
                <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center space-y-2">
                  <svg className="w-5 h-5 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                  <p className="text-xs font-bold text-red-400 uppercase">Access Denied</p>
                  <p className="text-xs text-slate-400">
                    This desk is registered to student <span className="text-white font-bold">{activeDesk.studentId}</span>. You cannot modify or release this workstation.
                  </p>
                </div>
              ) : (
                /* Available or Checked in by current user */
                <>
                  {activeDesk.status === 'free' && (
                    <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-widest">Student ID</label>
                        {userRole === 'student' && currentUser ? (
                          <div className="w-full bg-navy-900 border border-navy-800 rounded-xl px-4 py-3 text-white text-sm font-black tracking-wider">
                            {currentUser} <span className="text-[10px] text-primary-400 font-normal ml-2">(Authenticated)</span>
                          </div>
                        ) : (
                          <input
                            type="text"
                            value={studentIdInput}
                            onChange={(e) => setStudentIdInput(e.target.value)}
                            placeholder="e.g. ST-2849"
                            className="w-full bg-navy-900 border border-navy-700 focus:border-primary-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition font-semibold"
                          />
                        )}
                      </div>
                      <button
                        onClick={() => checkIn(activeDesk.id, userRole === 'student' ? currentUser : studentIdInput)}
                        className="w-full py-4 bg-primary-500 hover:bg-primary-400 text-navy-950 font-bold rounded-xl shadow-lg transition duration-200"
                      >
                        Confirm I'm Seated
                      </button>
                    </div>
                  )}

                  {activeDesk.status === 'occupied' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => setAway(activeDesk.id)}
                        className="py-3 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold rounded-xl shadow-md transition duration-200"
                      >
                        I'm Away (20m)
                      </button>
                      <button
                        onClick={() => releaseDesk(activeDesk.id)}
                        className="py-3 bg-navy-800 hover:bg-navy-750 border border-navy-700 text-white font-bold rounded-xl transition duration-200"
                      >
                        Release Desk
                      </button>
                    </div>
                  )}

                  {activeDesk.status === 'away' && (
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        onClick={() => checkIn(activeDesk.id, activeDesk.studentId || currentUser || studentIdInput)}
                        className="py-3 bg-primary-500 hover:bg-primary-400 text-navy-950 font-bold rounded-xl shadow-md transition duration-200"
                      >
                        Confirm I'm Back
                      </button>
                      <button
                        onClick={() => releaseDesk(activeDesk.id)}
                        className="py-3 bg-navy-800 hover:bg-navy-750 border border-navy-700 text-white font-bold rounded-xl transition duration-200"
                      >
                        Release Desk
                      </button>
                    </div>
                  )}

                  {activeDesk.status === 'abandoned' && (
                    <div className="space-y-3">
                      <button
                        onClick={() => checkIn(activeDesk.id, currentUser || studentIdInput)}
                        className="w-full py-4 bg-primary-500 hover:bg-primary-400 text-navy-950 font-bold rounded-xl shadow-lg transition duration-200"
                      >
                        Re-claim & Check-in
                      </button>
                      <button
                        onClick={() => releaseDesk(activeDesk.id)}
                        className="w-full py-3 bg-navy-800 hover:bg-navy-750 border border-navy-700 text-slate-300 font-semibold rounded-xl transition duration-200"
                      >
                        Release & Mark Free
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
