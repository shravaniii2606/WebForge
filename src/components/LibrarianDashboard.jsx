import React from 'react';
import { useDesks } from '../context/DeskContext';

export default function LibrarianDashboard() {
  const {
    desks,
    triggers,
    stats,
    resetDesk,
    resetAllOccupied,
    checkIn,
    setAway,
    releaseDesk,
  } = useDesks();

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Change desk status directly (Librarian control)
  const handleStatusChange = (deskId, newStatus) => {
    if (newStatus === 'free') {
      releaseDesk(deskId);
    } else if (newStatus === 'occupied') {
      checkIn(deskId, `ST-${Math.floor(1000 + Math.random() * 9000)}`);
    } else if (newStatus === 'away') {
      // Must be occupied first, check in then set away
      const d = desks.find(x => x.id === deskId);
      if (d.status === 'free') {
        checkIn(deskId, `ST-LIBR`);
      }
      setAway(deskId);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-6 py-8">
      {/* Header section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-navy-800 pb-6">
        <div>
          <h2 className="text-3xl font-extrabold text-white">Librarian Control Center</h2>
          <p className="text-slate-400 text-sm mt-1">
            Monitor library seat allocation, active timers, and override desk configurations.
          </p>
        </div>
        <button
          onClick={resetAllOccupied}
          disabled={stats.occupied + stats.away === 0}
          className="px-4 py-2.5 bg-red-500/10 hover:bg-red-500 disabled:hover:bg-red-500/10 border border-red-500/30 hover:border-red-500 disabled:border-red-500/10 text-red-400 hover:text-navy-950 disabled:text-red-500/30 rounded-xl text-xs font-bold uppercase tracking-wider transition disabled:cursor-not-allowed"
        >
          Reset All Occupied
        </button>
      </div>

      {/* Overview stats cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-navy-850 p-6 rounded-2xl border border-navy-800 flex items-center justify-between shadow-md">
          <div>
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Total Desk Slots</span>
            <h4 className="text-3xl font-black text-white mt-1">{stats.total}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-navy-800 flex items-center justify-center text-slate-400 border border-navy-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
        </div>

        <div className="bg-navy-850 p-6 rounded-2xl border border-navy-800 flex items-center justify-between shadow-md">
          <div>
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Occupied Desks</span>
            <h4 className="text-3xl font-black text-red-400 mt-1">{stats.occupied}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-red-500/10 flex items-center justify-center text-red-400 border border-red-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-navy-850 p-6 rounded-2xl border border-navy-800 flex items-center justify-between shadow-md">
          <div>
            <span className="text-xs uppercase font-bold text-slate-500 tracking-wider">Free & Available</span>
            <h4 className="text-3xl font-black text-emerald-400 mt-1">{stats.free}</h4>
          </div>
          <div className="h-12 w-12 rounded-xl bg-emerald-500/10 flex items-center justify-center text-emerald-400 border border-emerald-500/20">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Main content grid */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Table list of desks (2 columns wide) */}
        <div className="lg:col-span-2 bg-navy-850 border border-navy-800 rounded-2xl overflow-hidden shadow-md">
          <div className="px-6 py-5 border-b border-navy-800 flex justify-between items-center bg-navy-900/40">
            <h3 className="font-bold text-white text-lg">Desk Management Registry</h3>
            <span className="text-xs text-slate-400">{desks.length} Seats Registered</span>
          </div>

          <div className="overflow-x-auto max-h-[600px] overflow-y-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-navy-800 text-slate-400 text-[10px] font-bold uppercase tracking-wider bg-navy-900/20">
                  <th className="py-4 px-6">Desk No</th>
                  <th className="py-4 px-6">Status (Librarian Override)</th>
                  <th className="py-4 px-6">Student ID</th>
                  <th className="py-4 px-6">Reservation Time</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {desks.map((desk) => {
                  const rowClass = 'border-b border-navy-800 hover:bg-navy-800/25 transition duration-150';

                  return (
                    <tr key={desk.id} className={rowClass}>
                      {/* Desk No */}
                      <td className="py-4 px-6 font-bold text-white">
                        Desk #{desk.id}
                      </td>

                      {/* Status select (Change the status directly) */}
                      <td className="py-4 px-6">
                        <select
                          value={desk.status}
                          onChange={(e) => handleStatusChange(desk.id, e.target.value)}
                          className={`bg-navy-900 text-xs font-bold rounded-lg border px-2 py-1.5 focus:outline-none transition cursor-pointer ${
                            desk.status === 'free'
                              ? 'border-emerald-500/40 text-emerald-400'
                              : desk.status === 'occupied'
                              ? 'border-red-500/40 text-red-400'
                              : desk.status === 'away'
                              ? 'border-amber-500/40 text-amber-400'
                              : 'border-red-500 text-red-400'
                          }`}
                        >
                          <option value="free">Free</option>
                          <option value="occupied">Occupied</option>
                          <option value="away">Away</option>
                        </select>
                      </td>

                      {/* Student ID */}
                      <td className="py-4 px-6 font-mono text-xs text-slate-300">
                        {desk.studentId || <span className="text-slate-600 font-sans">-</span>}
                      </td>

                      {/* Remaining Timer */}
                      <td className="py-4 px-6">
                        {desk.status !== 'free' ? (
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs text-white font-bold">{formatTime(desk.timer)}</span>
                            <span className="text-[10px] text-slate-500">
                              ({desk.status === 'occupied' ? 'Occupied' : 'Away'})
                            </span>
                          </div>
                        ) : (
                          <span className="text-slate-600 text-xs">-</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-4 px-6 text-right">
                        {desk.status !== 'free' ? (
                          <button
                            onClick={() => resetDesk(desk.id)}
                            className="px-3 py-1.5 bg-navy-800 hover:bg-navy-750 text-white rounded-lg border border-navy-700 text-xs font-semibold hover:border-slate-500 transition duration-150"
                          >
                            Reset Desk
                          </button>
                        ) : (
                          <button
                            onClick={() => handleStatusChange(desk.id, 'occupied')}
                            className="px-3 py-1.5 bg-primary-500/10 hover:bg-primary-500/25 border border-primary-500/20 text-primary-400 rounded-lg text-xs font-semibold transition duration-150"
                          >
                            Check-in ST
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Live trigger logs feed (1 column wide) */}
        <div className="bg-navy-850 border border-navy-800 rounded-2xl overflow-hidden shadow-md flex flex-col h-full max-h-[662px]">
          <div className="px-6 py-5 border-b border-navy-800 bg-navy-900/40">
            <h3 className="font-bold text-white text-lg">Student Trigger Alerts</h3>
            <p className="text-[10px] text-slate-400 mt-1 uppercase font-semibold tracking-wider">
              Session Logs
            </p>
          </div>

          <div className="p-6 overflow-y-auto space-y-4 flex-grow">
            {triggers.length > 0 ? (
              triggers.map((log) => {
                let alertColor = 'border-slate-800 bg-navy-900/50 text-slate-300';
                if (log.type === 'warning') {
                  alertColor = 'border-amber-500/20 bg-amber-950/15 text-amber-300';
                } else if (log.type === 'check_in') {
                  alertColor = 'border-emerald-500/20 bg-emerald-950/10 text-emerald-300';
                }

                return (
                  <div
                    key={log.id}
                    className={`p-4 rounded-xl border text-xs leading-relaxed space-y-1.5 ${alertColor}`}
                  >
                    <div className="flex justify-between items-center">
                      <span className="font-bold uppercase tracking-wider text-[9px] opacity-75">
                        {log.type === 'check_in' && '✅ Check In'}
                        {log.type === 'away' && '⏳ Away'}
                        {log.type === 'release' && '🔓 Released'}
                        {log.type === 'warning' && '⚠️ Alert Warning'}
                        {log.type === 'reset' && '🔄 Hard Reset'}
                      </span>
                      <span className="font-mono text-[9px] opacity-50">{log.time}</span>
                    </div>
                    <p className="font-medium">{log.message}</p>
                    {log.deskId > 0 && (
                      <span className="inline-block text-[9px] bg-navy-950/60 px-1.5 py-0.5 rounded font-semibold text-slate-400 mt-1 border border-navy-800">
                        Desk #{log.deskId}
                      </span>
                    )}
                  </div>
                );
              })
            ) : (
              <div className="text-center py-12 text-slate-500 text-xs">
                No logs recorded yet. Action events will show up here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
