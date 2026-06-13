import React from 'react';
import { useDesks } from '../context/DeskContext';

export default function Navbar() {
  const { currentView, setCurrentView, currentStudentDesk, stats, userRole, currentUser, logout } = useDesks();

  // Define navigation items dynamically based on role
  const getNavItems = () => {
    const items = [{ id: 'landing', label: 'Home' }];

    // Both guest and authenticated roles get the map
    items.push({ id: 'map', label: 'Library Map' });

    // Students get a dedicated QR scanner page
    if (userRole === 'student') {
      items.push({ id: 'scanner', label: 'Scan QR' });
    }

    if (userRole === 'librarian') {
      items.push({ id: 'librarian', label: 'Librarian Panel' });
    }

    return items;
  };


  const navItems = getNavItems();

  return (
    <nav className="sticky top-0 z-40 bg-navy-900/80 backdrop-blur-md border-b border-navy-800 px-6 py-4">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
        {/* Brand/Logo */}
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => setCurrentView('landing')}>
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-primary-600 to-primary-400 flex items-center justify-center shadow-lg shadow-primary-500/20">
            <svg className="w-5 h-5 text-navy-950 font-bold" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.57-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <span className="text-xl font-bold tracking-tight text-white flex items-center">
              Desk<span className="text-primary-500">Guard</span>
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 font-medium block leading-none">
              Fair Seats & Smart Booking
            </span>
          </div>
        </div>

        {/* Dynamic Navigation Items */}
        <div className="flex flex-wrap justify-center items-center gap-2 bg-navy-950/60 p-1.5 rounded-xl border border-navy-800">
          {navItems.map((item) => {
            const isActive = currentView === item.id;
            const isLibrarian = item.id === 'librarian';
            const showAbandonedBadge = isLibrarian && stats.abandoned > 0;

            return (
              <button
                key={item.id}
                onClick={() => setCurrentView(item.id)}
                className={`relative px-4 py-2 text-sm font-medium rounded-lg transition-all duration-300 ${
                  isActive
                    ? 'bg-primary-500 text-navy-950 shadow-md shadow-primary-500/10 font-semibold'
                    : 'text-slate-300 hover:text-white hover:bg-navy-800/50'
                }`}
              >
                <span className="relative z-10 flex items-center gap-1.5">
                  {item.label}
                  {showAbandonedBadge && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white animate-pulse">
                      {stats.abandoned}
                    </span>
                  )}
                </span>
              </button>
            );
          })}
        </div>

        {/* User Session Profile & Log Out */}
        <div className="flex items-center space-x-4">
          {userRole ? (
            <div className="flex items-center space-x-3 bg-navy-950/60 pl-3 pr-2 py-1 rounded-xl border border-navy-800">
              <div className="text-right">
                <span className="block text-[10px] text-slate-500 uppercase font-black tracking-wider leading-none">
                  {userRole}
                  {userRole === 'student' && currentStudentDesk && ` (Desk ${currentStudentDesk})`}
                </span>
                <span className="text-xs text-white font-bold block mt-0.5">
                  {currentUser}
                </span>
              </div>
              <button
                onClick={logout}
                className="p-2 bg-navy-850 hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-lg border border-navy-800 transition"
                title="Log Out"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          ) : (
            <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5 py-1 px-3 bg-navy-850 rounded-lg border border-navy-800">
              <span className="h-1.5 w-1.5 rounded-full bg-slate-500"></span>
              <span>Anonymous Session</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
