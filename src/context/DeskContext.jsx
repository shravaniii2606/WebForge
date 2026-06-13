import React, { createContext, useContext, useState, useEffect, useRef } from 'react';

const DeskContext = createContext();

// Pre-filled mock data for desks
const initialDesks = Array.from({ length: 30 }, (_, index) => {
  const id = index + 1;
  // Make some desks pre-filled for demo purposes
  if (id === 3) {
    return {
      id,
      status: 'occupied',
      studentId: 'ST-1024',
      timer: 1800, // 30 minutes left
      maxTimer: 2700,
      occupiedAt: new Date(Date.now() - 900000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
  if (id === 8) {
    return {
      id,
      status: 'away',
      studentId: 'ST-2089',
      timer: 600, // 10 minutes left
      maxTimer: 1200,
      occupiedAt: new Date(Date.now() - 1500000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
  if (id === 24) {
    return {
      id,
      status: 'away',
      studentId: 'ST-3351',
      timer: 45, // 45 seconds left
      maxTimer: 1200,
      occupiedAt: new Date(Date.now() - 2000000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
  }
  return {
    id,
    status: 'free',
    studentId: null,
    timer: 0,
    maxTimer: 0,
    occupiedAt: null,
  };
});

const initialTriggers = [
  {
    id: 1,
    time: new Date(Date.now() - 1500000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    deskId: 8,
    type: 'away',
    message: 'Desk 8 marked Away - Student ST-2089 set status to Away.',
  },
  {
    id: 2,
    time: new Date(Date.now() - 900000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
    deskId: 3,
    type: 'check_in',
    message: 'Desk 3 checked in by Student ST-1024.',
  },
];

const initialComplaints = [];

export const DeskProvider = ({ children }) => {
  const [desks, setDesks] = useState(initialDesks);
  const [triggers, setTriggers] = useState(initialTriggers);
  const [complaints, setComplaints] = useState(initialComplaints);
  const [currentView, setCurrentView] = useState('landing');
  const [currentStudentDesk, setCurrentStudentDesk] = useState(null); // Which desk the current student is interacting with
  const [selectedDeskId, setSelectedDeskId] = useState(null); // Selected desk details in Map modal
  const [timerSpeed, setTimerSpeed] = useState(1); // Speed up timers: 1x, 10x, 60x (1 min = 1 sec)
  
  // Login Role States
  const [userRole, setUserRole] = useState(null); // null, 'student', 'librarian'
  const [currentUser, setCurrentUser] = useState(null); // student ID or librarian name
  
  // Screen 4 modal state
  const [showStillHereModal, setShowStillHereModal] = useState(false);
  const [stillHereDeskId, setStillHereDeskId] = useState(null);
  const [stillHereTimer, setStillHereTimer] = useState(300); // 5 minutes countdown (300 seconds)

  // Use a ref for speed to always have the latest value in interval
  const speedRef = useRef(timerSpeed);
  useEffect(() => {
    speedRef.current = timerSpeed;
  }, [timerSpeed]);

  // Add trigger log helper
  const addLog = (deskId, type, message) => {
    const newLog = {
      id: Date.now(),
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      deskId,
      type,
      message,
    };
    setTriggers(prev => [newLog, ...prev].slice(0, 50)); // limit to 50 logs
  };

  // Main countdown clock interval
  useEffect(() => {
    const interval = setInterval(() => {
      setDesks(prevDesks => {
        return prevDesks.map(desk => {
          if (desk.status === 'free') return desk;

          const speed = speedRef.current;
          const nextTimer = Math.max(0, desk.timer - speed);

          // Transition occupied/away to next states when timer reaches 0
          if (nextTimer === 0) {
            if (desk.status === 'away') {
              addLog(desk.id, 'release', `Desk ${desk.id} released - Away timer expired.`);
              return {
                ...desk,
                status: 'free',
                studentId: null,
                timer: 0,
                maxTimer: 0,
                occupiedAt: null,
              };
            }
            if (desk.status === 'occupied') {
              addLog(desk.id, 'release', `Desk ${desk.id} released - Reservation expired.`);
              return {
                ...desk,
                status: 'free',
                studentId: null,
                timer: 0,
                maxTimer: 0,
                occupiedAt: null,
              };
            }
          }

          // Trigger "Still Here" prompt simulation if this is the student's active desk and countdown is below 5 minutes (300s)
          // and they haven't already dismissed it or are already seeing it
          if (
            desk.status === 'occupied' && 
            desk.id === currentStudentDesk && 
            nextTimer <= 300 && 
            !showStillHereModal && 
            desk.timer > 300 // just crossed threshold
          ) {
            setStillHereDeskId(desk.id);
            setStillHereTimer(300);
            setShowStillHereModal(true);
            addLog(desk.id, 'warning', `Desk ${desk.id} triggered "Still Here" check.`);
          }

          return { ...desk, timer: nextTimer };
        });
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [currentStudentDesk, showStillHereModal]);

  // Countdown clock for the "Still Here" modal
  useEffect(() => {
    let interval;
    if (showStillHereModal && stillHereDeskId) {
      interval = setInterval(() => {
        setStillHereTimer(prev => {
          const speed = speedRef.current;
          const nextTime = Math.max(0, prev - speed);
          if (nextTime === 0) {
            setShowStillHereModal(false);
            setDesks(prevDesks => {
              return prevDesks.map(d => {
                if (d.id === stillHereDeskId) {
                  addLog(d.id, 'release', `Desk ${d.id} released - Failed "Still Here" check.`);
                  return {
                    ...d,
                    status: 'free',
                    studentId: null,
                    timer: 0,
                    maxTimer: 0,
                    occupiedAt: null,
                  };
                }
                return d;
              });
            });
            return 0;
          }
          return nextTime;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [showStillHereModal, stillHereDeskId]);

  // Actions
  const login = (role, userId) => {
    setUserRole(role);
    setCurrentUser(userId);
    
    if (role === 'student') {
      // Find if this student already checked in to a desk
      const existingDesk = desks.find(d => d.studentId === userId && d.status !== 'free');
      if (existingDesk) {
        setCurrentStudentDesk(existingDesk.id);
      } else {
        setCurrentStudentDesk(null);
      }
      setCurrentView('map'); // Route to Map after login
    } else if (role === 'librarian') {
      setCurrentView('landing'); // Keep librarians on the shared homepage after login
    }
    addLog(0, 'check_in', `Role session started: logged in as ${role} (${userId}).`);
  };

  const logout = () => {
    addLog(0, 'release', `Role session ended for user ${currentUser || 'Guest'}.`);
    setUserRole(null);
    setCurrentUser(null);
    setCurrentStudentDesk(null);
    setCurrentView('landing');
  };

  const checkIn = (deskId, studentId = `ST-${Math.floor(1000 + Math.random() * 9000)}`) => {
    // If student is logged in, use their logged-in ID
    const finalStudentId = userRole === 'student' && currentUser ? currentUser : studentId;

    // ONE DESK PER STUDENT: block if this student already has an active desk
    if (userRole === 'student' && finalStudentId) {
      const alreadyHasDesk = desks.find(
        d => d.studentId === finalStudentId &&
             (d.status === 'occupied' || d.status === 'away') &&
             d.id !== deskId // not re-confirming their own desk
      );
      if (alreadyHasDesk) {
        addLog(deskId, 'warning',
          `Check-in BLOCKED: Student ${finalStudentId} already holds Desk ${alreadyHasDesk.id}.`);
        return { blocked: true, existingDeskId: alreadyHasDesk.id };
      }
    }

    setDesks(prev =>
      prev.map(d =>
        d.id === deskId
          ? {
              ...d,
              status: 'occupied',
              studentId: finalStudentId,
              timer: 2700, // 45 mins in seconds
              maxTimer: 2700,
              occupiedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
            }
          : d
      )
    );

    if (userRole === 'student') {
      setCurrentStudentDesk(deskId);
    }
    addLog(deskId, 'check_in', `Desk ${deskId} checked in by Student ${finalStudentId}.`);
    return { blocked: false };
  };

  const setAway = (deskId) => {
    setDesks(prev =>
      prev.map(d =>
        d.id === deskId
          ? {
              ...d,
              status: 'away',
              timer: 1200, // 20 mins in seconds
              maxTimer: 1200,
            }
          : d
      )
    );
    addLog(deskId, 'away', `Desk ${deskId} marked Away.`);
  };

  const releaseDesk = (deskId) => {
    setDesks(prev =>
      prev.map(d =>
        d.id === deskId
          ? {
              ...d,
              status: 'free',
              studentId: null,
              timer: 0,
              maxTimer: 0,
              occupiedAt: null,
            }
          : d
      )
    );
    if (currentStudentDesk === deskId) {
      setCurrentStudentDesk(null);
    }
    if (stillHereDeskId === deskId) {
      setShowStillHereModal(false);
      setStillHereDeskId(null);
    }
    addLog(deskId, 'release', `Desk ${deskId} released (now Free).`);
  };

  const resetDesk = (deskId) => {
    releaseDesk(deskId);
    addLog(deskId, 'reset', `Librarian manually reset Desk ${deskId}.`);
  };

  const resetAllOccupied = () => {
    const occupiedDeskCount = desks.filter(d => d.status !== 'free').length;

    setDesks(prev =>
      prev.map(d =>
        d.status !== 'free'
          ? {
              ...d,
              status: 'free',
              studentId: null,
              timer: 0,
              maxTimer: 0,
              occupiedAt: null,
            }
          : d
      )
    );

    setCurrentStudentDesk(null);
    setShowStillHereModal(false);
    setStillHereDeskId(null);
    addLog(0, 'reset', `Librarian reset all occupied desks (${occupiedDeskCount} cleared).`);
  };

  const submitComplaint = (message, deskId = null) => {
    const trimmedMessage = message.trim();
    if (!trimmedMessage) {
      return false;
    }

    const newComplaint = {
      id: Date.now(),
      studentId: currentUser || 'Anonymous student',
      deskId,
      message: trimmedMessage,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      date: new Date().toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' }),
    };

    setComplaints(prev => [newComplaint, ...prev].slice(0, 50));
    addLog(deskId || 0, 'warning', `Complaint submitted by ${newComplaint.studentId}.`);
    return true;
  };

  // Demo Helpers
  const triggerStillHereAlert = (deskId) => {
    const desk = desks.find(d => d.id === deskId);
    if (!desk || (desk.status !== 'occupied' && desk.status !== 'away')) {
      // Force make it occupied first so we can alert
      checkIn(deskId, 'ST-DEMO');
    }
    
    // Set timer close to triggering, or force open modal
    setDesks(prev =>
      prev.map(d =>
        d.id === deskId
          ? {
              ...d,
              status: 'occupied',
              timer: 299, // below 300s
            }
          : d
      )
    );
    setCurrentStudentDesk(deskId);
    setStillHereDeskId(deskId);
    setStillHereTimer(300);
    setShowStillHereModal(true);
    addLog(deskId, 'warning', `DEMO: Manually triggered Still Here alert for Desk ${deskId}.`);
  };

  const confirmStillHere = () => {
    if (stillHereDeskId) {
      setDesks(prev =>
        prev.map(d =>
          d.id === stillHereDeskId
            ? {
                ...d,
                status: 'occupied',
                timer: 2700, // Reset to 45 mins
              }
            : d
        )
      );
      addLog(stillHereDeskId, 'check_in', `Student confirmed presence at Desk ${stillHereDeskId}. Timer reset.`);
      setShowStillHereModal(false);
      setStillHereDeskId(null);
    }
  };

  // Stats
  const stats = {
    total: desks.length,
    free: desks.filter(d => d.status === 'free').length,
    occupied: desks.filter(d => d.status === 'occupied').length,
    away: desks.filter(d => d.status === 'away').length,
  };

  return (
    <DeskContext.Provider
      value={{
        desks,
        triggers,
        complaints,
        currentView,
        setCurrentView,
        currentStudentDesk,
        setCurrentStudentDesk,
        selectedDeskId,
        setSelectedDeskId,
        timerSpeed,
        setTimerSpeed,
        showStillHereModal,
        setShowStillHereModal,
        stillHereDeskId,
        stillHereTimer,
        stats,
        userRole,
        currentUser,
        login,
        logout,
        checkIn,
        setAway,
        releaseDesk,
        resetDesk,
        resetAllOccupied,
        submitComplaint,
        triggerStillHereAlert,
        confirmStillHere,
      }}
    >
      {children}
    </DeskContext.Provider>
  );
};

export const useDesks = () => useContext(DeskContext);
