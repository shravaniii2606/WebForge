import React, { useState, useEffect, useRef } from 'react';
import { useDesks } from '../context/DeskContext';

export default function DemoPanel() {
  const {
    desks,
    timerSpeed,
    setTimerSpeed,
    triggerStillHereAlert,
    checkIn,
    stats,
    currentUser,
    showStillHereModal,
  } = useDesks();

  const [isOpen, setIsOpen] = useState(false);
  const [simRunning, setSimRunning] = useState(false);
  // phases: null | 'scanning' | 'checkedin' | 'waiting' | 'alerting' | 'confirmed' | 'released'
  const [simPhase, setSimPhase] = useState(null);
  const [simDeskId, setSimDeskId] = useState(null);

  // Track when the StillHere modal was open, to detect its close
  const modalWasOpen = useRef(false);
  const awaitingModal = useRef(false); // true while we're waiting for the user to respond to modal

  const speeds = [
    { label: 'Normal (1s)', value: 1 },
    { label: 'Fast (10x)',  value: 10 },
    { label: 'Hour/Min (60x)', value: 60 },
    { label: 'Speedy (100x)', value: 100 },
  ];

  const phaseConfig = {
    scanning:  { color: 'blue',   icon: '📷', text: 'Scanning QR code…' },
    checkedin: { color: 'green',  icon: '✅', text: 'Checked in! Desk occupied.' },
    waiting:   { color: 'amber',  icon: '⏱',  text: 'Timer running… approaching limit.' },
    alerting:  { color: 'red',    icon: '🔔', text: '"Are You Still Here?" modal is active.' },
    confirmed: { color: 'green',  icon: '🟢', text: 'Student confirmed! Seat remains Occupied.' },
    released:  { color: 'slate',  icon: '⬜', text: 'Desk released → Now Free.' },
  };

  const colorMap = {
    blue:   'bg-blue-500/10 border-blue-500/20 text-blue-400',
    green:  'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
    amber:  'bg-amber-500/10 border-amber-500/20 text-amber-400',
    red:    'bg-red-500/10 border-red-500/20 text-red-400',
    slate:  'bg-slate-700/20 border-slate-600/20 text-slate-400',
  };

  // Watch modal close → determine outcome
  useEffect(() => {
    if (!awaitingModal.current) return;

    if (showStillHereModal) {
      modalWasOpen.current = true;
    } else if (modalWasOpen.current) {
      // Modal just closed — check desk status
      modalWasOpen.current = false;
      awaitingModal.current = false;

      const desk = desks.find(d => d.id === simDeskId);
      if (desk && (desk.status === 'occupied' || desk.status === 'away')) {
        setSimPhase('confirmed');
      } else {
        setSimPhase('released');
      }

      // Keep result visible until user closes the panel
      setSimRunning(false);
    }
  }, [showStillHereModal, desks, simDeskId]);

  const runSimulation = async () => {
    if (simRunning) return;

    const freeDesks = desks.filter(d => d.status === 'free');
    if (freeDesks.length === 0) return;

    setSimRunning(true);
    setIsOpen(true); // keep panel open throughout

    const targetDesk = freeDesks[Math.floor(Math.random() * freeDesks.length)];
    const studentId = currentUser || 'ST-DEMO';
    setSimDeskId(targetDesk.id);

    // Phase 1 — Scanning
    setSimPhase('scanning');
    await delay(1800);

    // Phase 2 — Check-in
    checkIn(targetDesk.id, studentId);
    setSimPhase('checkedin');
    await delay(1600);

    // Phase 3 — Waiting
    setSimPhase('waiting');
    await delay(2000);

    // Phase 4 — Trigger modal
    awaitingModal.current = true;
    modalWasOpen.current = false;
    setSimPhase('alerting');
    triggerStillHereAlert(targetDesk.id);
    // Outcome is handled by the useEffect above once modal closes
  };

  const cfg = simPhase ? phaseConfig[simPhase] : null;
  const isOutcome = simPhase === 'confirmed' || simPhase === 'released';

  // Step timeline for visual progress
  const steps = ['scanning', 'checkedin', 'waiting', 'alerting'];
  const stepOrder = [...steps, 'confirmed', 'released'];
  const currentStepIdx = simPhase ? stepOrder.indexOf(simPhase) : -1;

  return (
    <div className="fixed bottom-6 right-6 z-40">
      {/* Toggle Button */}
      <button
        onClick={() => {
          // Don't allow closing while simulation is actively running (before outcome)
          if (simRunning && !isOutcome) return;
          // Reset sim state so next open starts fresh
          setSimPhase(null);
          setSimRunning(false);
          setSimDeskId(null);
          setIsOpen(!isOpen);
        }}
        className={`flex items-center gap-2 px-4 py-3 bg-gradient-to-r from-primary-500 to-emerald-600 text-navy-950 font-bold rounded-full shadow-2xl transition duration-200 border border-primary-400/20 ${
          simRunning && !isOutcome
            ? 'opacity-60 cursor-not-allowed'
            : 'hover:from-primary-400 hover:to-emerald-500'
        }`}
      >
        <span className="flex h-2.5 w-2.5 rounded-full bg-navy-950 animate-ping"></span>
        <span>
          {simRunning && !isOutcome
            ? 'Simulation Running…'
            : isOpen
            ? 'Close Simulation'
            : 'Open Demo Simulation'}
        </span>
      </button>

      {/* Slide-up Panel */}
      {isOpen && (
        <div className="absolute bottom-16 right-0 bg-navy-900 border border-navy-800 rounded-2xl p-6 shadow-2xl space-y-5 border-b-4 border-b-primary-500 animate-scale-in" style={{ width: '420px' }}>

          {/* Header */}
          <div className="border-b border-navy-800 pb-3">
            <h4 className="font-bold text-white text-sm">Demo Simulation Deck</h4>
            <p className="text-[10px] text-slate-400 mt-0.5">
              Full end-to-end simulation: QR scan → check-in → "Are you still here?" → outcome.
            </p>
          </div>

          {/* Timer Speed */}
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

          {/* Simulation Section */}
          <div className="border-t border-navy-800 pt-4 space-y-3">
            <label className="text-[10px] uppercase font-bold text-slate-500 tracking-wider block">
              Full Flow Simulation {simDeskId && <span className="text-primary-400 normal-case">— Desk #{simDeskId}</span>}
            </label>

            {/* Step progress bar */}
            {simPhase && (
              <div className="space-y-2.5">
                {/* Timeline steps */}
                <div className="flex items-center gap-1">
                  {steps.map((step, i) => {
                    const done = currentStepIdx > i;
                    const active = currentStepIdx === i && !isOutcome;
                    return (
                      <React.Fragment key={step}>
                        <div className={`flex-1 h-1.5 rounded-full transition-all duration-500 ${
                          done || (isOutcome && i < steps.length)
                            ? 'bg-primary-500'
                            : active
                            ? 'bg-amber-400 animate-pulse'
                            : 'bg-navy-800'
                        }`} />
                        {i < steps.length - 1 && (
                          <div className={`h-2 w-2 rounded-full flex-shrink-0 transition-all duration-300 ${
                            done || isOutcome ? 'bg-primary-500' : active ? 'bg-amber-400' : 'bg-navy-800'
                          }`} />
                        )}
                      </React.Fragment>
                    );
                  })}
                </div>

                {/* Step labels */}
                <div className="flex justify-between text-[8px] text-slate-600 px-0.5">
                  <span>Scan</span>
                  <span>Check-in</span>
                  <span>Timer</span>
                  <span>Alert</span>
                </div>

                {/* Current phase status badge */}
                <div className={`rounded-xl px-3 py-3 border flex items-start gap-3 ${
                  isOutcome
                    ? (simPhase === 'confirmed' ? colorMap.green : colorMap.slate)
                    : simPhase === 'alerting'
                    ? colorMap.red
                    : simPhase === 'waiting'
                    ? colorMap.amber
                    : simPhase === 'checkedin'
                    ? colorMap.green
                    : colorMap.blue
                }`}>
                  <span className="text-lg leading-none flex-shrink-0">{cfg.icon}</span>
                  <div>
                    <p className="text-xs font-bold leading-snug">{cfg.text}</p>
                    {simPhase === 'alerting' && (
                      <p className="text-[10px] mt-1 opacity-75">
                        Respond on screen → outcome shows here.
                      </p>
                    )}
                    {simPhase === 'confirmed' && (
                      <p className="text-[10px] mt-1 opacity-75">
                        Timer reset to 45 min. Student kept their seat.
                      </p>
                    )}
                    {simPhase === 'released' && (
                      <p className="text-[10px] mt-1 opacity-75">
                        Desk #{simDeskId} is now available for others.
                      </p>
                    )}
                  </div>
                </div>

                {/* Outcome result banner */}
                {isOutcome && (
                  <div className={`rounded-xl px-3 py-2 text-center text-[10px] font-black uppercase tracking-wider border ${
                    simPhase === 'confirmed'
                      ? 'bg-emerald-500/20 border-emerald-500/30 text-emerald-400'
                      : 'bg-slate-700/30 border-slate-600/30 text-slate-400'
                  }`}>
                    {simPhase === 'confirmed' ? '🟢 RESULT: Desk #' + simDeskId + ' → OCCUPIED' : '⬜ RESULT: Desk #' + simDeskId + ' → FREE'}
                  </div>
                )}
              </div>
            )}

            {/* Run Button */}
            {!simRunning && (
              <button
                onClick={runSimulation}
                disabled={stats.free === 0}
                className={`w-full px-3 py-3 rounded-xl text-xs font-black uppercase tracking-wider border transition flex items-center justify-center gap-2 ${
                  stats.free === 0
                    ? 'bg-navy-950 border-navy-800 text-slate-600 cursor-not-allowed'
                    : 'bg-amber-500/10 hover:bg-amber-500/20 border-amber-500/20 text-amber-400'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {stats.free === 0 ? 'No free desks available' : 'Run Full Simulation'}
              </button>
            )}

            {simRunning && !isOutcome && (
              <div className="flex items-center justify-center gap-2 py-2 text-xs text-slate-500">
                <svg className="w-3.5 h-3.5 animate-spin text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                {simPhase === 'alerting'
                  ? 'Waiting for your response on the modal…'
                  : 'Simulation in progress…'}
              </div>
            )}
          </div>

          {/* Quick counters */}
          <div className="text-[9px] text-slate-500 flex justify-between border-t border-navy-800 pt-3">
            <span>Free: <span className="text-emerald-400 font-bold">{stats.free}</span></span>
            <span>Occ: <span className="text-red-400 font-bold">{stats.occupied}</span></span>
            <span>Away: <span className="text-amber-400 font-bold">{stats.away}</span></span>
            <span className="text-primary-500 font-bold uppercase">Live</span>
          </div>
        </div>
      )}
    </div>
  );
}

function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
