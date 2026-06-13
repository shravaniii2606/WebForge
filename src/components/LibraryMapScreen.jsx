import React, { useState } from 'react';
import { useDesks } from '../context/DeskContext';

export default function LibraryMapScreen() {
  const {
    desks,
    stats,
    selectedDeskId,
    setSelectedDeskId,
    setCurrentView,
    checkIn,
    userRole,
    currentUser,
    setAway,
    releaseDesk,
    submitComplaint,
  } = useDesks();

  const selectedDesk = desks.find((d) => d.id === selectedDeskId);
  const [isReportOpen, setIsReportOpen] = useState(false);
  const [reportText, setReportText] = useState('');
  const [reportSuccess, setReportSuccess] = useState('');
  const isReportingComplaint = isReportOpen && userRole === 'student';

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
      default:
        return {
          bg: 'bg-navy-800 border-navy-700 text-slate-400',
          dot: 'bg-slate-400',
          label: 'Unknown',
          hoverBg: '',
        };
    }
  };

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
    }
  };

  // Determine if selected desk is reserved by someone else (student view)
  const isOccupiedByOther = selectedDesk &&
    selectedDesk.status !== 'free' &&
    userRole === 'student' &&
    selectedDesk.studentId !== currentUser;

  const isMyDesk = selectedDesk &&
    userRole === 'student' &&
    selectedDesk.studentId === currentUser;

  const handleSubmitReport = (e) => {
    e.preventDefault();
    const didSubmit = submitComplaint(reportText, selectedDeskId);
    if (!didSubmit) {
      return;
    }

    setReportText('');
    setReportSuccess('Complaint sent to the librarian.');
    setIsReportOpen(false);
    window.setTimeout(() => setReportSuccess(''), 2500);
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Page Header */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Live Library Map</h2>
          <p className="text-slate-400 text-sm mt-1">
            Real-time seat availability.{' '}
            {userRole === 'librarian' && <span className="text-red-400 font-bold ml-1">Librarian Override mode active.</span>}
            {userRole === 'student' && !isReportingComplaint && (
              <button
                onClick={() => setCurrentView('scanner')}
                className="ml-2 inline-flex items-center gap-1 text-primary-400 hover:text-primary-300 font-semibold transition underline underline-offset-2"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                    d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                Scan QR to check in →
              </button>
            )}
          </p>
        </div>
        {/* Legend */}
        <div className="flex flex-wrap items-center gap-3">
          {userRole === 'student' && (
            <button
              onClick={() => setIsReportOpen(true)}
              className="px-4 py-2.5 bg-amber-500/10 hover:bg-amber-500 border border-amber-500/30 hover:border-amber-500 text-amber-300 hover:text-navy-950 rounded-xl text-xs font-bold uppercase tracking-wider transition"
            >
              Report Complaint
            </button>
          )}
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
          </div>
        </div>
      </div>

      {reportSuccess && (
        <div className="mb-6 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm font-semibold text-emerald-300">
          {reportSuccess}
        </div>
      )}

      {isReportOpen && userRole === 'student' && (
        <form onSubmit={handleSubmitReport} className="mb-8 bg-navy-850 border border-navy-800 rounded-2xl p-5 shadow-md">
          <div className="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Report a Complaint</h3>
              <p className="text-xs text-slate-400 mt-1">
                {selectedDeskId ? `This report will include Desk #${selectedDeskId}.` : 'Select a desk first if this complaint is about a specific seat.'}
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsReportOpen(false)}
              className="text-slate-400 hover:text-white bg-navy-800 p-1.5 rounded-lg border border-navy-700"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <textarea
            value={reportText}
            onChange={(e) => setReportText(e.target.value)}
            placeholder="Write your complaint here..."
            className="w-full min-h-28 resize-y bg-navy-900 border border-navy-700 focus:border-amber-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition"
          />
          <div className="mt-4 flex justify-end">
            <button
              type="submit"
              disabled={!reportText.trim()}
              className="px-5 py-3 bg-amber-500 hover:bg-amber-400 disabled:bg-amber-500/10 text-navy-950 disabled:text-amber-500/30 font-bold rounded-xl text-xs uppercase tracking-wider transition disabled:cursor-not-allowed"
            >
              Send Complaint
            </button>
          </div>
        </form>
      )}

      {/* Stats Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
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
      </div>

      {/* Map Layout & Desk Details Row */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Desks Grid Map Area */}
        <div className="lg:col-span-2 bg-navy-950/30 border border-navy-800/80 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 text-[10px] font-bold text-slate-600 bg-navy-800/30 border-b border-l border-navy-800 rounded-bl-lg uppercase">
            Library Floor 1
          </div>

          {/* Layout Surroundings */}
          <div className="flex justify-between items-center mb-6 text-xs text-slate-500 px-2 select-none border-b border-navy-800/40 pb-3">
            <span>[ West Wall - Bookshelves A-D ]</span>
            <span>[ Entrance Door &amp; Kiosk ]</span>
          </div>

          <div className="grid grid-cols-6 gap-4 aspect-[6/5] min-h-[300px]">
            {desks.map((desk) => {
              const { bg, dot, label, hoverBg } = getStatusDetails(desk.status);
              const isSelected = selectedDeskId === desk.id;
              const isCurrentStudentDesk = userRole === 'student' && desk.studentId === currentUser &&
                (desk.status === 'occupied' || desk.status === 'away');

              return (
                <button
                  key={desk.id}
                  onClick={() => setSelectedDeskId(desk.id)}
                  className={`relative flex flex-col justify-between items-center p-3 rounded-xl border-2 transition-all duration-300 ${bg} ${hoverBg} ${
                    isSelected ? 'ring-4 ring-primary-500/20 scale-[1.05] border-white shadow-xl' : 'shadow-md'
                  } ${isCurrentStudentDesk ? 'ring-2 ring-primary-500/60' : ''}`}
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
                      {label}
                    </span>
                  </div>

                  {/* My desk indicator badge */}
                  {isCurrentStudentDesk && (
                    <span className="absolute -top-1.5 -right-1.5 h-4 w-4 bg-primary-500 rounded-full border-2 border-navy-950 flex items-center justify-center">
                      <svg className="w-2 h-2 text-navy-950" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
                      </svg>
                    </span>
                  )}

                  {/* Timer pill - LIBRARIAN ONLY */}
                  {desk.status !== 'free' && userRole === 'librarian' && (
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
            <span>[ Restrooms &amp; Coffee Station ]</span>
          </div>
        </div>

        {/* Desk Detail Card */}
        <div className="bg-navy-850 border border-navy-800 rounded-2xl p-6 flex flex-col justify-between h-fit min-h-[400px]">
          {selectedDesk ? (
            <div className="space-y-6">
              <div className="flex justify-between items-start border-b border-navy-800 pb-4">
                <div>
                  <h3 className="text-2xl font-black text-white">Desk #{selectedDesk.id}</h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Row {Math.ceil(selectedDesk.id / 6)}, Col {((selectedDesk.id - 1) % 6) + 1}
                  </p>
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
                    </select>
                  ) : (
                    /* Standard Status Badge */
                    <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold border uppercase tracking-wider ${getStatusDetails(selectedDesk.status).bg}`}>
                      <span className={`h-2.5 w-2.5 rounded-full ${getStatusDetails(selectedDesk.status).dot} animate-pulse`}></span>
                      {selectedDesk.status}
                    </span>
                  )}
                </div>

                {/* Occupier info row */}
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

                {/* Timer - LIBRARIAN ONLY */}
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

              {/* Action Section */}
              <div className="border-t border-navy-800 pt-6 space-y-3">

                {/* FREE desk — student view */}
                {selectedDesk.status === 'free' && userRole === 'student' && !isReportingComplaint && (
                  <div className="space-y-3">
                    <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center">
                      <p className="text-xs font-semibold text-emerald-400 mb-1">This desk is available!</p>
                      <p className="text-[11px] text-slate-500">Go to the desk physically and scan its QR code to check in.</p>
                    </div>
                    <button
                      onClick={() => setCurrentView('scanner')}
                      className="w-full py-3 bg-primary-500 hover:bg-primary-400 text-navy-950 font-black rounded-xl shadow-md shadow-primary-500/20 transition text-xs uppercase tracking-widest"
                    >
                      Open QR Scanner →
                    </button>
                  </div>
                )}

                {/* FREE desk — librarian */}
                {selectedDesk.status === 'free' && userRole === 'librarian' && (
                  <p className="text-xs text-slate-400">Use the status dropdown above to override this desk's state.</p>
                )}

                {/* FREE desk — anonymous visitor */}
                {selectedDesk.status === 'free' && !userRole && (
                  <div className="bg-navy-900 border border-navy-800 rounded-xl p-4 text-center">
                    <p className="text-xs text-slate-400">Log in as a student to check into this desk.</p>
                  </div>
                )}

                {/* Occupied by someone else — student view */}
                {isOccupiedByOther && (
                  <div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-center space-y-2">
                    <svg className="w-6 h-6 text-red-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Reserved Workstation</p>
                    <p className="text-[11px] text-slate-400 leading-relaxed">
                      This desk is in use. You have no access to manage this booking.
                    </p>
                  </div>
                )}

                {/* Student's own desk actions */}
                {isMyDesk && !isReportingComplaint && (
                  <div className="space-y-3 p-3 bg-navy-900 border border-navy-800 rounded-xl">
                    <span className="block text-[9px] uppercase font-bold text-primary-400 tracking-wider text-center">Seat Actions</span>
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
                          I'm Back
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

                {/* Librarian control dashboard link */}
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
                  Click any seat on the floor plan to inspect its status.
                </p>
              </div>
              {userRole === 'student' && !isReportingComplaint && (
                <button
                  onClick={() => setCurrentView('scanner')}
                  className="mt-2 px-5 py-2.5 bg-primary-500 hover:bg-primary-400 text-navy-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-md shadow-primary-500/20 transition"
                >
                  Open QR Scanner
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
