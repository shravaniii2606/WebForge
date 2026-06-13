import React, { useState, useEffect } from 'react';
import { useDesks } from '../context/DeskContext';

export default function LibraryMapScreen() {
  const {
    desks,
    stats,
    selectedDeskId,
    setSelectedDeskId,
    setCurrentView,
    setCurrentStudentDesk,
    checkIn,
    userRole,
    currentUser,
    login,
    setAway,
    releaseDesk,
    simulateHoardingSensor,
  } = useDesks();

  // Scanner modal states
  const [isScannerOpen, setIsScannerOpen] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanSuccess, setScanSuccess] = useState(false);
  const [scanBlocked, setScanBlocked] = useState(false);
  const [blockedDeskId, setBlockedDeskId] = useState(null);

  const selectedDesk = desks.find((d) => d.id === selectedDeskId);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getStatusDetails = (status) => {
    switch (status) {
      case 'free':
        return {
          bg: 'bg-emerald-500/20 border-emerald-500 text-emerald-400',
          dot: 'bg-emerald-400',
          label: 'Free',
          hoverBg: 'hover:bg-emerald-500/30',
        };
      case 'occupied':
        return {
          bg: 'bg-red-500/20 border-red-500 text-red-400',
          dot: 'bg-red-400',
          label: 'Occupied',
          hoverBg: 'hover:bg-red-500/30',
        };
      case 'away':
        return {
          bg: 'bg-amber-500/20 border-amber-500 text-amber-400',
          dot: 'bg-amber-400',
          label: 'Away',
          hoverBg: 'hover:bg-amber-500/30',
        };
      case 'abandoned':
        return {
          bg: 'bg-slate-700/40 border-slate-500 text-slate-300',
          dot: 'bg-slate-400',
          label: 'Abandoned',
          hoverBg: 'hover:bg-slate-700/60',
        };
      default:
        return {
          bg: 'bg-navy-800 border-navy-700 text-slate-400',
          dot: 'bg-slate-400',
          label: 'Unknown',
          hoverBg: '',
        };
    }
  };

  // Trigger Scanner simulation - check if student already holds a desk first
  const handleTriggerScanner = () => {
    if (userRole === 'student' && currentUser) {
      const alreadyHeld = desks.find(
        d => d.studentId === currentUser &&
             (d.status === 'occupied' || d.status === 'away')
      );
      if (alreadyHeld) {
        // Open scanner in blocked state immediately
        setScanBlocked(true);
        setBlockedDeskId(alreadyHeld.id);
        setScanProgress(0);
        setScanSuccess(false);
        setIsScannerOpen(true);
        return;
      }
    }
    setIsScannerOpen(true);
    setScanProgress(0);
    setScanSuccess(false);
    setScanBlocked(false);
    setBlockedDeskId(null);
  };

  // Handle Scanning progress interval
  useEffect(() => {
    let interval;
    if (isScannerOpen && selectedDesk && !scanBlocked) {
      interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setScanSuccess(true);
            // Wait 1 second on success to show checkmark, then attempt check-in
            setTimeout(() => {
              const finalStudentId = currentUser || `ST-${Math.floor(1000 + Math.random() * 9000)}`;
              if (!userRole) {
                login('student', finalStudentId);
              }
              const result = checkIn(selectedDesk.id, finalStudentId);
              if (result && result.blocked) {
                // Student tried to book a second desk — show blocked state
                setScanSuccess(false);
                setScanBlocked(true);
                setBlockedDeskId(result.existingDeskId);
              } else {
                setIsScannerOpen(false);
              }
            }, 1000);
            return 100;
          }
          return prev + 8;
        });
      }, 150);
    }
    return () => clearInterval(interval);
  }, [isScannerOpen, selectedDeskId, currentUser, userRole, scanBlocked]);

  // Override desk status directly (Librarian feature in Side Panel)
  const handleLibrarianOverride = (deskId, newStatus) => {
    if (newStatus === 'free') {
      releaseDesk(deskId);
    } else if (newStatus === 'occupied') {
      checkIn(deskId, `ST-${Math.floor(1000 + Math.random() * 9000)}`);
    } else if (newStatus === 'away') {
      const d = desks.find(x => x.id === deskId);
      if (d.status === 'free') {
        checkIn(deskId, `ST-LIBR`);
      }
      setAway(deskId);
    } else if (newStatus === 'abandoned') {
      simulateHoardingSensor(deskId);
    }
  };

  // Determine if selected desk is reserved by someone else
  const isOccupiedByOther = selectedDesk && 
    selectedDesk.status !== 'free' && 
    userRole === 'student' && 
    selectedDesk.studentId !== currentUser;

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Live Library Map</h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time layout of seats. Click a seat to inspect or check in. 
            {userRole === 'librarian' && <span className="text-red-400 font-bold ml-1">Librarian Override mode active.</span>}
          </p>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-4 bg-navy-950/40 border border-navy-800 px-4 py-2.5 rounded-xl text-xs font-semibold">
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded bg-emerald-500 border border-emerald-400"></span>
            <span className="text-slate-300">Free</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded bg-red-500 border border-red-400"></span>
            <span className="text-slate-300">Occupied</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded bg-amber-500 border border-amber-400"></span>
            <span className="text-slate-300">Away</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="h-3.5 w-3.5 rounded bg-slate-600 border border-slate-500"></span>
            <span className="text-slate-300">Abandoned</span>
          </div>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-8">
        <div className="bg-navy-850 p-4 rounded-xl border border-navy-800 text-center">
          <div className="text-2xl font-black text-white">{stats.total}</div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Total Seats</div>
        </div>
        <div className="bg-navy-850 p-4 rounded-xl border border-navy-800 text-center">
          <div className="text-2xl font-black text-emerald-400">{stats.free}</div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Available</div>
        </div>
        <div className="bg-navy-850 p-4 rounded-xl border border-navy-800 text-center">
          <div className="text-2xl font-black text-red-400">{stats.occupied}</div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Occupied</div>
        </div>
        <div className="bg-navy-850 p-4 rounded-xl border border-navy-800 text-center">
          <div className="text-2xl font-black text-amber-400">{stats.away}</div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Away</div>
        </div>
        <div className="bg-navy-850 p-4 rounded-xl border border-navy-800 text-center col-span-2 md:col-span-1">
          <div className="text-2xl font-black text-slate-400">{stats.abandoned}</div>
          <div className="text-[10px] uppercase font-bold text-slate-500 tracking-wider">Abandoned</div>
        </div>
      </div>

      {/* Map Layout & Desk Details Row */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Desks Grid Map Area */}
        <div className="lg:col-span-2 bg-navy-950/30 border border-navy-800/80 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-[10px] font-bold text-slate-600 bg-navy-800/30 border-b border-l border-navy-800 rounded-bl-lg uppercase">
            Library Floor 1
          </div>

          {/* Layout Surroundings / Floor Plan Details */}
          <div className="flex justify-between items-center mb-6 text-xs text-slate-500 px-2 select-none border-b border-navy-800/40 pb-3">
            <span>[ West Wall - Bookshelves A-D ]</span>
            <span>[ Entrance Door & Kiosk ]</span>
          </div>

          <div className="grid grid-cols-6 gap-4 aspect-[6/5] min-h-[300px]">
            {desks.map((desk) => {
              const { bg, dot, label, hoverBg } = getStatusDetails(desk.status);
              const isSelected = selectedDeskId === desk.id;

              return (
                <button
                  key={desk.id}
                  onClick={() => setSelectedDeskId(desk.id)}
                  className={`relative flex flex-col justify-between items-center p-3 rounded-xl border-2 transition-all duration-300 ${bg} ${hoverBg} ${
                    isSelected ? 'ring-4 ring-primary-500/20 scale-[1.05] border-white shadow-xl' : 'shadow-md'
                  }`}
                >
                  <span className="text-xs font-black opacity-40 select-none">#{desk.id}</span>

                  {/* Visual Seat Representation */}
                  <div className="my-1.5 flex items-center justify-center">
                    <svg className="w-8 h-8 opacity-80" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                    </svg>
                  </div>

                  <div className="flex items-center gap-1">
                    <span className={`h-2.5 w-2.5 rounded-full ${dot} inline-block`}></span>
                    <span className="text-[10px] font-black tracking-wider uppercase hidden sm:inline">
                      {desk.status === 'abandoned' ? 'Abnd' : label}
                    </span>
                  </div>

                  {/* Desk active countdown mini text - LIBRARIAN ONLY */}
                  {desk.status !== 'free' && desk.status !== 'abandoned' && userRole === 'librarian' && (
                    <span className="absolute top-1 right-1 text-[8px] bg-navy-950/80 px-1 py-0.5 rounded text-white font-mono leading-none">
                      {formatTime(desk.timer)}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="mt-6 flex justify-between items-center text-xs text-slate-500 px-2 select-none border-t border-navy-800/40 pt-3">
            <span>[ Quiet Study Area ]</span>
            <span>[ Restrooms & Coffee Station ]</span>
          </div>
        </div>

        {/* Desk Detail Card */}
        <div className="bg-navy-850 border border-navy-800 rounded-2xl p-6 flex flex-col justify-between h-fit min-h-[400px]">
          {selectedDesk ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-navy-800 pb-4">
                <div>
                  <h3 className="text-2xl font-black text-white">Desk #{selectedDesk.id}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">Floor Plan Position: Row {Math.ceil(selectedDesk.id/6)}, Col {((selectedDesk.id - 1) % 6) + 1}</p>
                </div>
                <button
                  onClick={() => setSelectedDeskId(null)}
                  className="text-slate-400 hover:text-white bg-navy-800 p-1.5 rounded-lg border border-navy-700"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              {/* Status Section */}
              <div className="space-y-4">
                <div>
                  <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-widest">Status</label>
                  
                  {userRole === 'librarian' ? (
                    /* Librarian Status Changer Dropdown */
                    <select
                      value={selectedDesk.status}
                      onChange={(e) => handleLibrarianOverride(selectedDesk.id, e.target.value)}
                      className={`bg-navy-900 border text-sm font-bold rounded-xl px-3 py-2 w-full focus:outline-none cursor-pointer uppercase ${
                        selectedDesk.status === 'free'
                          ? 'border-emerald-500 text-emerald-400'
                          : selectedDesk.status === 'occupied'
                          ? 'border-red-500 text-red-400'
                          : selectedDesk.status === 'away'
                          ? 'border-amber-500 text-amber-400'
                          : 'border-slate-500 text-slate-300'
                      }`}
                    >
                      <option value="free">🟢 Free</option>
                      <option value="occupied">🔴 Occupied</option>
                      <option value="away">🟡 Away</option>
                      <option value="abandoned">⚫ Abandoned</option>
                    </select>
                  ) : (
                    /* Standard Badge */
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border uppercase tracking-wider ${getStatusDetails(selectedDesk.status).bg}`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${getStatusDetails(selectedDesk.status).dot} animate-pulse`}></span>
                      {selectedDesk.status}
                    </span>
                  )}
                </div>

                {selectedDesk.status !== 'free' && (
                  <div className="grid grid-cols-2 gap-4 bg-navy-950/40 p-4 rounded-xl border border-navy-800">
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">Occupier ID</span>
                      <span className="text-sm font-semibold text-white">
                        {isOccupiedByOther ? 'Reserved (Other)' : (selectedDesk.studentId || 'N/A')}
                      </span>
                    </div>
                    <div>
                      <span className="text-[9px] uppercase font-bold text-slate-500 block mb-0.5">Seated Since</span>
                      <span className="text-sm font-semibold text-white">{selectedDesk.occupiedAt || 'N/A'}</span>
                    </div>
                  </div>
                )}

                {/* Reservation Countdown Progress bar - LIBRARIAN ONLY */}
                {(selectedDesk.status === 'occupied' || selectedDesk.status === 'away') && userRole === 'librarian' && (
                  <div className="bg-navy-950/30 p-4 rounded-xl border border-navy-800">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs font-semibold text-slate-400">Time Remaining:</span>
                      <span className="text-base font-bold font-mono text-white tracking-wider">{formatTime(selectedDesk.timer)}</span>
                    </div>
                    <div className="w-full bg-navy-800 h-2.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-1000 ${
                          selectedDesk.status === 'away' ? 'bg-amber-500' : 'bg-primary-500'
                        }`}
                        style={{ width: `${(selectedDesk.timer / selectedDesk.maxTimer) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              {/* Booking Actions Simulation */}
              <div className="border-t border-navy-800 pt-6 space-y-4">
                {selectedDesk.status === 'free' ? (
                  <div className="space-y-4">
                    <div className="flex flex-col items-center justify-center bg-white p-4 rounded-xl border-4 border-navy-950 shadow-inner max-w-[160px] mx-auto group relative">
                      {/* Fake QR representation */}
                      <svg className="w-32 h-32 text-navy-950" viewBox="0 0 100 100" fill="currentColor">
                        <rect x="0" y="0" width="25" height="25" />
                        <rect x="0" y="75" width="25" height="25" />
                        <rect x="75" y="0" width="25" height="25" />
                        <rect x="75" y="75" width="25" height="25" />
                        <rect x="10" y="10" width="5" height="5" fill="white" />
                        <rect x="85" y="10" width="5" height="5" fill="white" />
                        <rect x="10" y="85" width="5" height="5" fill="white" />
                        <rect x="35" y="35" width="30" height="30" />
                        <rect x="35" y="10" width="10" height="15" />
                        <rect x="10" y="35" width="15" height="10" />
                        <rect x="55" y="75" width="10" height="15" />
                        <rect x="75" y="55" width="15" height="10" />
                      </svg>
                      <span className="text-[8px] font-black text-slate-500 mt-2 tracking-wider font-sans">SCAN QR CODE AT DESK {selectedDesk.id}</span>
                    </div>

                    <p className="text-xs text-slate-400 text-center leading-relaxed">
                      {userRole === 'student'
                        ? 'Simulate scanning this desk\'s physical QR code to check in and secure your seat.'
                        : 'Review this desk\'s QR code. Log in as a student to book or check in.'}
                    </p>

                    <button
                      onClick={handleTriggerScanner}
                      className="w-full py-3 bg-primary-500 hover:bg-primary-400 text-navy-950 font-bold rounded-xl shadow-lg transition-all duration-200 uppercase text-xs tracking-wider font-sans"
                    >
                      {userRole === 'student' ? 'Simulate QR Scan (Check-in)' : 'Log in & Scan QR'}
                    </button>
                  </div>
                ) : isOccupiedByOther ? (
                  /* Block actions for other students */
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center space-y-2">
                    <svg className="w-6 h-6 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Reserved Workstation</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      This desk is currently in use by student <span className="text-white font-bold">{selectedDesk.studentId}</span>. You do not have access to manage this booking.
                    </p>
                  </div>
                ) : (
                  /* Own desk or Librarian actions */
                  <div>
                    <p className="text-xs text-slate-400 leading-relaxed mb-4">
                      Desk {selectedDesk.id} is occupied. 
                      {userRole === 'librarian' 
                        ? ' You can modify its status using the override dropdown above.' 
                        : ' This is your active reservation.'}
                    </p>
                    <div className="flex flex-col gap-2">
                      {/* Manage own booking directly in map panel (replaces separate Student Portal screen) */}
                      {userRole === 'student' && selectedDesk.studentId === currentUser && (
                        <div className="space-y-3 p-3 bg-navy-900 border border-navy-800 rounded-xl">
                          <span className="block text-[9px] uppercase font-bold text-primary-400 tracking-wider text-center">
                            Seat Actions
                          </span>
                          {selectedDesk.status === 'occupied' && (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => setAway(selectedDesk.id)}
                                className="py-2 bg-amber-500 hover:bg-amber-400 text-navy-950 font-bold rounded-lg text-[10px] uppercase tracking-wide transition"
                              >
                                I'm Away
                              </button>
                              <button
                                onClick={() => releaseDesk(selectedDesk.id)}
                                className="py-2 bg-navy-800 hover:bg-navy-750 border border-navy-700 text-slate-300 font-bold rounded-lg text-[10px] uppercase tracking-wide transition"
                              >
                                Release
                              </button>
                            </div>
                          )}
                          {selectedDesk.status === 'away' && (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => checkIn(selectedDesk.id, currentUser)}
                                className="py-2 bg-primary-500 hover:bg-primary-400 text-navy-950 font-bold rounded-lg text-[10px] uppercase tracking-wide transition"
                              >
                                Confirm Back
                              </button>
                              <button
                                onClick={() => releaseDesk(selectedDesk.id)}
                                className="py-2 bg-navy-800 hover:bg-navy-750 border border-navy-700 text-slate-300 font-bold rounded-lg text-[10px] uppercase tracking-wide transition"
                              >
                                Release
                              </button>
                            </div>
                          )}
                          {selectedDesk.status === 'abandoned' && (
                            <div className="grid grid-cols-2 gap-2">
                              <button
                                onClick={() => checkIn(selectedDesk.id, currentUser)}
                                className="py-2 bg-primary-500 hover:bg-primary-400 text-navy-950 font-bold rounded-lg text-[10px] uppercase tracking-wide transition"
                              >
                                Re-claim
                              </button>
                              <button
                                onClick={() => releaseDesk(selectedDesk.id)}
                                className="py-2 bg-navy-800 hover:bg-navy-750 border border-navy-700 text-slate-300 font-bold rounded-lg text-[10px] uppercase tracking-wide transition"
                              >
                                Release
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                      {userRole === 'librarian' && (
                        <button
                          onClick={() => setCurrentView('librarian')}
                          className="w-full py-2.5 bg-navy-800 hover:bg-navy-750 border border-navy-700 text-white font-semibold rounded-lg text-xs font-sans"
                        >
                          Control Dashboard
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full flex flex-col justify-center items-center text-center space-y-4 flex-grow my-auto">
              <div className="h-16 w-16 rounded-full bg-navy-800 border border-navy-700 flex items-center justify-center text-slate-400 shadow-md">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
              </div>
              <div>
                <h4 className="text-lg font-bold text-white">No Desk Selected</h4>
                <p className="text-xs text-slate-400 mt-1 max-w-[200px]">
                  Click on any desk workstation on the floor plan map to view details or trigger checks.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Mock Camera QR Scanner Overlay Modal */}
      {isScannerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-navy-950/90 backdrop-blur-sm p-6">
          <div className="w-full max-w-sm bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden text-center flex flex-col items-center">

            {scanBlocked ? (
              /* ── BLOCKED STATE: student already has an active desk ── */
              <>
                <div className="w-60 h-60 bg-black border-2 border-red-500 rounded-xl overflow-hidden mb-6 flex flex-col items-center justify-center shadow-inner relative">
                  {/* Framing corners in red */}
                  <div className="absolute top-4 left-4 h-6 w-6 border-t-4 border-l-4 border-red-500"></div>
                  <div className="absolute top-4 right-4 h-6 w-6 border-t-4 border-r-4 border-red-500"></div>
                  <div className="absolute bottom-4 left-4 h-6 w-6 border-b-4 border-l-4 border-red-500"></div>
                  <div className="absolute bottom-4 right-4 h-6 w-6 border-b-4 border-r-4 border-red-500"></div>
                  {/* Blocked icon */}
                  <div className="flex flex-col items-center gap-3 z-10">
                    <svg className="w-14 h-14 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                    </svg>
                    <span className="text-xs font-black uppercase tracking-widest text-red-400">Check-in Denied</span>
                  </div>
                </div>

                <h3 className="text-lg font-bold text-white mb-1">Already Booked</h3>
                <p className="text-xs text-slate-400 mb-2">
                  You currently hold an active booking at
                </p>
                <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-5 py-3 mb-6 text-center">
                  <span className="text-2xl font-black text-red-400">Desk #{blockedDeskId}</span>
                  <p className="text-[10px] text-slate-500 mt-1 uppercase tracking-wider">Release it before booking another seat</p>
                </div>
                <button
                  onClick={() => {
                    setIsScannerOpen(false);
                    setScanBlocked(false);
                    setBlockedDeskId(null);
                    // Navigate to their existing desk on the map
                    setSelectedDeskId(blockedDeskId);
                  }}
                  className="w-full py-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 font-bold rounded-xl transition mb-2"
                >
                  Go to My Desk #{blockedDeskId}
                </button>
                <button
                  onClick={() => {
                    setIsScannerOpen(false);
                    setScanBlocked(false);
                    setBlockedDeskId(null);
                  }}
                  className="w-full py-3 bg-navy-800 hover:bg-navy-750 text-slate-300 font-bold rounded-xl border border-navy-700 transition"
                >
                  Dismiss
                </button>
              </>
            ) : (
              /* ── NORMAL SCAN STATE ── */
              <>
                {/* Scanner Visual Container */}
                <div className="relative w-60 h-60 bg-black border-2 border-primary-500 rounded-xl overflow-hidden mb-6 flex flex-col items-center justify-center shadow-inner">
                  {/* Scanning laser line animation */}
                  {!scanSuccess && (
                    <div className="absolute left-0 right-0 h-1 bg-red-500 shadow-md shadow-red-500/85 animate-scan-laser z-20"></div>
                  )}
                  {/* Framing corners */}
                  <div className="absolute top-4 left-4 h-6 w-6 border-t-4 border-l-4 border-primary-500"></div>
                  <div className="absolute top-4 right-4 h-6 w-6 border-t-4 border-r-4 border-primary-500"></div>
                  <div className="absolute bottom-4 left-4 h-6 w-6 border-b-4 border-l-4 border-primary-500"></div>
                  <div className="absolute bottom-4 right-4 h-6 w-6 border-b-4 border-r-4 border-primary-500"></div>

                  {/* Scan Status Rendering */}
                  {scanSuccess ? (
                    <div className="z-10 animate-bounce text-primary-400 flex flex-col items-center">
                      <svg className="w-16 h-16 border-4 border-primary-400 rounded-full p-2 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" />
                      </svg>
                      <span className="text-xs font-black uppercase tracking-widest text-primary-400">Seat Verified!</span>
                    </div>
                  ) : (
                    <div className="z-10 text-center opacity-65">
                      <svg className="w-12 h-12 text-slate-500 mx-auto animate-pulse mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      <span className="text-xs text-slate-400 font-bold uppercase tracking-wider block">Aligning QR Code...</span>
                    </div>
                  )}
                </div>

                {/* Text Info */}
                <h3 className="text-lg font-bold text-white mb-1">Scanning Desk #{selectedDesk?.id}</h3>
                <p className="text-xs text-slate-400 mb-6">Camera scanner is actively checking seat authenticity...</p>

                {/* Progress Bar */}
                <div className="w-full bg-navy-950 h-2 rounded-full overflow-hidden border border-navy-800 mb-6">
                  <div
                    className="h-full bg-gradient-to-r from-primary-500 to-emerald-500 transition-all duration-100 ease-out"
                    style={{ width: `${scanProgress}%` }}
                  ></div>
                </div>

                <button
                  onClick={() => setIsScannerOpen(false)}
                  className="w-full py-3 bg-navy-800 hover:bg-navy-750 text-slate-300 font-bold rounded-xl border border-navy-700 transition"
                >
                  Cancel Scan
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
