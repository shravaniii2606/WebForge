import React, { useState } from 'react';
import { useDesks } from '../context/DeskContext';

export default function LandingScreen() {
  const { userRole, currentUser, login, logout, currentStudentDesk, setCurrentView } = useDesks();

  // Student login states
  const [studentIdInput, setStudentIdInput] = useState('ST-1024'); // prefilled ST-1024 matches the prefilled occupied desk!
  const [studentError, setStudentError] = useState('');

  // Librarian login states
  const [libIdInput, setLibIdInput] = useState('LIB-ADMIN');
  const [pinInput, setPinInput] = useState('1234');
  const [libError, setLibError] = useState('');

  const handleStudentLogin = (e) => {
    e.preventDefault();
    if (!studentIdInput.trim()) {
      setStudentError('Student ID is required.');
      return;
    }
    setStudentError('');
    login('student', studentIdInput.trim());
  };

  const handleLibrarianLogin = (e) => {
    e.preventDefault();
    if (!libIdInput.trim() || !pinInput.trim()) {
      setLibError('Please fill in both admin fields.');
      return;
    }
    setLibError('');
    login('librarian', libIdInput.trim());
  };

  return (
    <div className="relative min-h-[calc(100vh-80px)] flex flex-col justify-between overflow-hidden px-6 py-12 lg:py-16 bg-navy-950">
      {/* Ambient decorative background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-primary-500/10 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>

      <div className="max-w-6xl mx-auto w-full flex-grow flex flex-col justify-center">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center space-x-2 px-3 py-1.5 rounded-full bg-primary-500/10 border border-primary-500/20 text-xs font-semibold text-primary-400 tracking-wider uppercase">
            <span className="flex h-2 w-2 rounded-full bg-primary-400 animate-pulse"></span>
            <span>Intelligent Library Seat Booking</span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight text-white">
            Desk<span className="text-transparent bg-clip-text bg-gradient-to-r from-primary-400 to-emerald-500">Guard</span>
          </h1>

          <p className="text-md sm:text-lg text-slate-300 font-medium max-w-xl mx-auto">
            Fair seats for every student. Auto-expiry timers, live seating layout layouts, and automated hoarding sensor warnings.
          </p>
        </div>

        {/* Auth Forms Gated Panel */}
        <div className="max-w-4xl mx-auto w-full mb-16">
          {!userRole ? (
            /* Logged Out: Show 2 Login Cards */
            <div className="grid md:grid-cols-2 gap-8">
              
              {/* Student Login Card */}
              <div className="bg-navy-850/60 backdrop-blur-sm p-8 rounded-2xl border border-navy-800 hover:border-primary-500/20 transition-all duration-300 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-primary-500/10 border border-primary-500/20 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 14l9-5-9-4-9 4 9 5zm0 0l-9-4.243V17a4 4 0 004 4h10a4 4 0 004-4v-7.243L12 14z" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Student Access</h3>
                  <p className="text-slate-400 text-xs mt-1.5 mb-6">
                    Log in with your university student ID to book, release, or temporarily pause desk timers.
                  </p>

                  <form onSubmit={handleStudentLogin} className="space-y-4">
                    <div>
                      <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-widest">Student ID</label>
                      <input
                        type="text"
                        value={studentIdInput}
                        onChange={(e) => setStudentIdInput(e.target.value)}
                        placeholder="e.g. ST-1024"
                        className="w-full bg-navy-900 border border-navy-700 focus:border-primary-500 rounded-xl px-4 py-3 text-white text-sm focus:outline-none transition font-semibold"
                      />
                      {studentError && <p className="text-red-400 text-xs mt-1">{studentError}</p>}
                      <span className="text-[10px] text-slate-500 block mt-1.5">
                        *Tip: Use pre-filled `ST-1024` to automatically link to Desk #3!
                      </span>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-primary-500 hover:bg-primary-400 text-navy-950 font-bold rounded-xl shadow-lg transition duration-200 uppercase text-xs tracking-wider"
                    >
                      Log in as Student
                    </button>
                  </form>
                </div>
              </div>

              {/* Librarian Login Card */}
              <div className="bg-navy-850/60 backdrop-blur-sm p-8 rounded-2xl border border-navy-800 hover:border-red-500/10 transition-all duration-300 flex flex-col justify-between shadow-xl">
                <div>
                  <div className="h-12 w-12 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mb-6">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <h3 className="text-xl font-bold text-white">Librarian Panel</h3>
                  <p className="text-slate-400 text-xs mt-1.5 mb-6">
                    Administrator gate. Monitor all active timers, override bookings, and review hoarding sensors.
                  </p>

                  <form onSubmit={handleLibrarianLogin} className="space-y-4">
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-widest">Admin User</label>
                        <input
                          type="text"
                          value={libIdInput}
                          onChange={(e) => setLibIdInput(e.target.value)}
                          placeholder="LIB-ADMIN"
                          className="w-full bg-navy-900 border border-navy-700 focus:border-red-500 rounded-xl px-3 py-3 text-white text-xs focus:outline-none transition font-semibold"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-400 block mb-2 uppercase tracking-widest">Access PIN</label>
                        <input
                          type="password"
                          value={pinInput}
                          onChange={(e) => setPinInput(e.target.value)}
                          placeholder="PIN"
                          className="w-full bg-navy-900 border border-navy-700 focus:border-red-500 rounded-xl px-3 py-3 text-white text-xs focus:outline-none transition font-semibold"
                        />
                      </div>
                    </div>
                    {libError && <p className="text-red-400 text-xs mt-1">{libError}</p>}

                    <button
                      type="submit"
                      className="w-full py-3.5 bg-red-500/10 hover:bg-red-500 hover:text-navy-950 border border-red-500/30 hover:border-red-500 text-red-400 font-bold rounded-xl shadow-lg transition duration-200 uppercase text-xs tracking-wider"
                    >
                      Authenticate Admin
                    </button>
                  </form>
                </div>
              </div>

            </div>
          ) : (
            /* Logged In Dashboard CTA Card */
            <div className="bg-navy-850 border border-navy-800 p-8 rounded-2xl shadow-xl max-w-xl mx-auto text-center space-y-6 relative overflow-hidden">
              <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-primary-500 to-emerald-500"></div>

              <div>
                <span className="text-xs uppercase font-bold text-slate-500 tracking-widest">Active Role Session</span>
                <h3 className="text-2xl font-black text-white mt-1">
                  Welcome, {currentUser}!
                </h3>
                <p className="text-slate-400 text-sm mt-1">
                  You are logged in as a <span className="text-primary-400 font-semibold uppercase">{userRole}</span>.
                </p>
              </div>

              {/* Status details for logged in students */}
              {userRole === 'student' && (
                <div className="p-4 bg-navy-900 border border-navy-800 rounded-xl max-w-xs mx-auto text-xs text-slate-400">
                  {currentStudentDesk ? (
                    <p>
                      You are checked in at <span className="text-white font-bold">Desk #{currentStudentDesk}</span>.
                    </p>
                  ) : (
                    <p>You do not have a desk checked in right now.</p>
                  )}
                </div>
              )}

              {/* CTA buttons based on role */}
              <div className="flex flex-col sm:flex-row justify-center items-center gap-3 max-w-sm mx-auto">
                {userRole === 'student' ? (
                  <>
                    <button
                      onClick={() => setCurrentView('map')}
                      className="w-full py-3 bg-primary-500 hover:bg-primary-400 text-navy-950 font-bold rounded-xl text-xs uppercase tracking-wider transition"
                    >
                      View Live Map
                    </button>
                    <button
                      onClick={() => setCurrentView('student-flow')}
                      className="w-full py-3 bg-navy-800 hover:bg-navy-750 border border-navy-750 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition"
                    >
                      Check-in Portal
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setCurrentView('librarian')}
                      className="w-full py-3 bg-red-500 hover:bg-red-400 text-navy-950 font-bold rounded-xl text-xs uppercase tracking-wider transition"
                    >
                      Librarian Panel
                    </button>
                    <button
                      onClick={() => setCurrentView('map')}
                      className="w-full py-3 bg-navy-800 hover:bg-navy-750 border border-navy-700 text-white font-bold rounded-xl text-xs uppercase tracking-wider transition"
                    >
                      Review Map
                    </button>
                  </>
                )}
              </div>

              <div className="pt-4 border-t border-navy-800">
                <button
                  onClick={logout}
                  className="text-xs text-red-400 hover:text-red-300 font-semibold flex items-center justify-center gap-1.5 mx-auto"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                  </svg>
                  <span>Sign Out Session</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* 3-Point Value Props */}
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div className="bg-navy-850/60 backdrop-blur-sm p-6 rounded-2xl border border-navy-800">
            <h3 className="text-lg font-bold text-white mb-2">Live Map Layouts</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Check real-time occupancy before heading in. View occupied, free, away, and recently abandoned seats instantly.
            </p>
          </div>
          <div className="bg-navy-850/60 backdrop-blur-sm p-6 rounded-2xl border border-navy-800">
            <h3 className="text-lg font-bold text-white mb-2">Auto-Expiry Warnings</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Seat bookings are backed by intelligent timers. If a student leaves or goes away for too long, the seat resets automatically.
            </p>
          </div>
          <div className="bg-navy-850/60 backdrop-blur-sm p-6 rounded-2xl border border-navy-800">
            <h3 className="text-lg font-bold text-white mb-2">Anti-Hoarding Sensors</h3>
            <p className="text-slate-400 text-xs leading-relaxed">
              Integrated desk sensors verify student presence. System flags idle desks to the librarian to free them for others.
            </p>
          </div>
        </div>
      </div>

      {/* Info Footer */}
      <div className="max-w-6xl mx-auto w-full pt-8 border-t border-navy-800 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} DeskGuard Systems. All rights reserved.</p>
        <p>Security & Efficiency for Shared Workspaces.</p>
      </div>
    </div>
  );
}
