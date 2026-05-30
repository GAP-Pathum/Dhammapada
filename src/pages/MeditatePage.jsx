import { useState, useEffect, useCallback } from 'react';
import { useMeditationTimer } from '../hooks/useMeditationTimer';
import { useAuth } from '../context/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  addDoc, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  deleteDoc, 
  updateDoc 
} from 'firebase/firestore';

const DURATIONS = [5, 10, 15, 20, 30];
const MEDITATION_TYPES = ['Mindfulness (Anapanasati)', 'Loving-Kindness (Metta)', 'Zen (Zazen)', 'Vipassana', 'Body Scan'];
const DAYS = ['Everyday', 'Weekdays', 'Weekends', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function MeditatePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('timer'); // 'timer', 'history', 'schedule'
  const [history, setHistory] = useState(() => {
    try {
      const localHistory = localStorage.getItem('dhamma_meditation_history');
      return localHistory ? JSON.parse(localHistory) : [];
    } catch { return []; }
  });
  const [plans, setPlans] = useState(() => {
    try {
      const localPlans = localStorage.getItem('dhamma_meditation_plans');
      return localPlans ? JSON.parse(localPlans) : [];
    } catch { return []; }
  });

  // Form states for scheduling
  const [scheduleDay, setScheduleDay] = useState('Everyday');
  const [scheduleTime, setScheduleTime] = useState('07:00');
  const [scheduleDuration, setScheduleDuration] = useState(15);
  const [scheduleType, setScheduleType] = useState('Mindfulness (Anapanasati)');

  // Selected meditation type for timer session
  const [selectedType, setSelectedType] = useState('Mindfulness (Anapanasati)');

  // Fetch History and Plans
  useEffect(() => {
    if (user) {
      // 1. Subscribe to Firestore History
      const historyQuery = query(
        collection(db, 'users', user.uid, 'history'),
        orderBy('timestamp', 'desc')
      );
      const unsubHistory = onSnapshot(historyQuery, (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setHistory(items);
      }, (err) => console.error("Firestore history error:", err));

      // 2. Subscribe to Firestore Plans
      const plansQuery = query(
        collection(db, 'users', user.uid, 'plans'),
        orderBy('timestamp', 'desc')
      );
      const unsubPlans = onSnapshot(plansQuery, (snapshot) => {
        const items = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setPlans(items);
      }, (err) => console.error("Firestore plans error:", err));

      return () => {
        unsubHistory();
        unsubPlans();
      };
    }
  }, [user]);

  // Log session completed
  const handleSessionComplete = useCallback(async (duration) => {
    const newSession = {
      durationMins: duration,
      date: new Date().toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }),
      type: selectedType,
      timestamp: new Date().toISOString(),
    };

    if (user) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'history'), {
          ...newSession,
          timestamp: new Date(), // Firebase timestamp compatibility
        });
      } catch (err) {
        console.error('Error logging to Firestore:', err);
      }
    } else {
      // Guest local storage update
      const updatedHistory = [newSession, ...history];
      setHistory(updatedHistory);
      localStorage.setItem('dhamma_meditation_history', JSON.stringify(updatedHistory));
    }
  }, [user, history, selectedType]);

  // Timer custom hook
  const {
    durationMins,
    running,
    complete,
    breathePhase,
    breatheScale,
    displayTime,
    dashOffset,
    circumference,
    start,
    pause,
    reset,
    setDuration,
  } = useMeditationTimer(handleSessionComplete);

  // Add Meditation Plan
  const handleAddPlan = async (e) => {
    e.preventDefault();
    const newPlan = {
      dayOfWeek: scheduleDay,
      time: scheduleTime,
      durationMins: scheduleDuration,
      type: scheduleType,
      active: true,
      timestamp: new Date().toISOString(),
    };

    if (user) {
      try {
        await addDoc(collection(db, 'users', user.uid, 'plans'), {
          ...newPlan,
          timestamp: new Date(),
        });
      } catch (err) {
        console.error('Error creating plan in Firestore:', err);
      }
    } else {
      const updatedPlans = [{ id: `plan-${Date.now()}`, ...newPlan }, ...plans];
      setPlans(updatedPlans);
      localStorage.setItem('dhamma_meditation_plans', JSON.stringify(updatedPlans));
    }

    // Reset form states
    setScheduleDay('Everyday');
    setScheduleTime('07:00');
    setScheduleDuration(15);
  };

  // Toggle Plan Active State
  const handleTogglePlan = async (planId, currentActive) => {
    if (user) {
      try {
        const planRef = doc(db, 'users', user.uid, 'plans', planId);
        await updateDoc(planRef, { active: !currentActive });
      } catch (err) {
        console.error('Error toggling plan in Firestore:', err);
      }
    } else {
      const updatedPlans = plans.map((p) => p.id === planId ? { ...p, active: !currentActive } : p);
      setPlans(updatedPlans);
      localStorage.setItem('dhamma_meditation_plans', JSON.stringify(updatedPlans));
    }
  };

  // Delete Plan
  const handleDeletePlan = async (planId) => {
    if (user) {
      try {
        await deleteDoc(doc(db, 'users', user.uid, 'plans', planId));
      } catch (err) {
        console.error('Error deleting plan from Firestore:', err);
      }
    } else {
      const updatedPlans = plans.filter((p) => p.id !== planId);
      setPlans(updatedPlans);
      localStorage.setItem('dhamma_meditation_plans', JSON.stringify(updatedPlans));
    }
  };

  // Calculate Streak & Analytics
  const calculateStats = () => {
    const totalMinutes = history.reduce((sum, h) => sum + (h.durationMins || 0), 0);
    const totalSessions = history.length;
    const avgDuration = totalSessions > 0 ? Math.round(totalMinutes / totalSessions) : 0;
    
    // Simple streak calculation (consecutive dates)
    let currentStreak = 0;
    if (history.length > 0) {
      // Map to dates only and sort uniquely descending
      const dates = history
        .map(h => {
          const d = h.timestamp ? new Date(h.timestamp) : new Date();
          return d.toDateString();
        })
        .filter((val, idx, self) => self.indexOf(val) === idx);

      let today = new Date();
      let yesterday = new Date();
      yesterday.setDate(today.getDate() - 1);

      const todayStr = today.toDateString();
      const yesterdayStr = yesterday.toDateString();

      // Check if last meditated is today or yesterday to continue streak
      if (dates.includes(todayStr) || dates.includes(yesterdayStr)) {
        currentStreak = 1;
        let checkDate = dates.includes(todayStr) ? today : yesterday;
        
        while (true) {
          const nextDate = new Date(checkDate);
          nextDate.setDate(nextDate.getDate() - 1);
          const nextDateStr = nextDate.toDateString();
          if (dates.includes(nextDateStr)) {
            currentStreak++;
            checkDate = nextDate;
          } else {
            break;
          }
        }
      }
    }

    return { totalMinutes, totalSessions, avgDuration, currentStreak };
  };

  const stats = calculateStats();

  return (
    <div className="meditate-page-inner" id="meditatePage">
      <div className="meditate-container">
        
        {/* Page Header */}
        <div className="page-header">
          <div className="label">🧘 Contemplative Sanctuary</div>
          <h1>Guided Meditation & Planning</h1>
          {!user && (
            <p className="guest-badge">Practice Mode (Guest) — Sign in to sync your profile</p>
          )}
        </div>

        {/* Tab Selection */}
        <div className="meditate-tabs">
          <button 
            className={`meditate-tab-btn ${activeTab === 'timer' ? 'active' : ''}`}
            onClick={() => setActiveTab('timer')}
          >
            ☸ Timer
          </button>
          <button 
            className={`meditate-tab-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📈 Stats & History
          </button>
          <button 
            className={`meditate-tab-btn ${activeTab === 'schedule' ? 'active' : ''}`}
            onClick={() => setActiveTab('schedule')}
          >
            📅 Practice Schedule
          </button>
        </div>

        {/* ──────── TAB 1: TIMER ──────── */}
        {activeTab === 'timer' && (
          <div className="timer-tab-content fade-in">
            {/* Breathe Guide */}
            <div className="breathe-guide" id="breatheGuide">{breathePhase}</div>

            {/* Timer circle ring */}
            <div className="timer-wrap">
              <svg className="timer-ring" viewBox="0 0 220 220">
                <circle cx="110" cy="110" r="100" />
                <circle
                  className="progress"
                  id="timerRing"
                  cx="110"
                  cy="110"
                  r="100"
                  style={{ strokeDasharray: circumference, strokeDashoffset: dashOffset }}
                />
              </svg>
              <div className="timer-text">
                <div className="timer-num" id="timerNum">{displayTime}</div>
                <div className="timer-label" id="timerLabel">
                  {complete ? 'complete' : running ? 'remaining' : 'minutes'}
                </div>
              </div>
            </div>

            {/* Breathing lotus expander */}
            <div
              className="breathe-circle"
              id="breatheCircle"
              style={{
                transform: `scale(${breatheScale})`,
                opacity: running ? 1 : 0.8,
                transition: 'transform 4s ease-in-out, opacity 2s',
              }}
            />

            {/* Type selector */}
            <div className="session-type-selector">
              <label>Select Practice Type:</label>
              <select 
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                disabled={running}
              >
                {MEDITATION_TYPES.map((type) => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            {/* Duration selector */}
            <div className="duration-select">
              {DURATIONS.map((m) => (
                <button
                  key={m}
                  className={`dur-btn${durationMins === m ? ' active' : ''}`}
                  onClick={() => setDuration(m)}
                  disabled={running}
                >
                  {m} min
                </button>
              ))}
            </div>

            {/* Controls */}
            <div className="timer-controls">
              <button
                className="ctrl-btn ctrl-primary"
                id="startBtn"
                onClick={running ? pause : start}
              >
                {complete ? 'Begin Again' : running ? 'Pause' : 'Begin'}
              </button>
              <button className="ctrl-btn ctrl-secondary" onClick={reset}>
                Reset
              </button>
            </div>
          </div>
        )}

        {/* ──────── TAB 2: STATS & HISTORY ──────── */}
        {activeTab === 'history' && (
          <div className="history-tab-content fade-in">
            {/* Stats Dashboard */}
            <div className="stats-dashboard">
              <div className="stat-card">
                <div className="stat-value">{stats.totalMinutes}m</div>
                <div className="stat-label">Total Time</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.totalSessions}</div>
                <div className="stat-label">Sessions</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">🔥 {stats.currentStreak}d</div>
                <div className="stat-label">Active Streak</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{stats.avgDuration}m</div>
                <div className="stat-label">Avg Session</div>
              </div>
            </div>

            {/* Session Logs */}
            <div className="history-logs">
              <h3>Meditation Journal</h3>
              {history.length === 0 ? (
                <div className="empty-log-state">
                  <p>Your journal is empty. Let us begin a practice to record your first mindfulness session! 🙏</p>
                </div>
              ) : (
                <div className="logs-list">
                  {history.map((session, idx) => (
                    <div key={session.id || idx} className="log-card">
                      <div className="log-card-left">
                        <span className="log-badge">🧘</span>
                        <div>
                          <h4>{session.type || 'Mindfulness Session'}</h4>
                          <p>{session.date}</p>
                        </div>
                      </div>
                      <div className="log-card-right">
                        <span className="log-duration">{session.durationMins} minutes</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* ──────── TAB 3: SCHEDULE PLANNER ──────── */}
        {activeTab === 'schedule' && (
          <div className="schedule-tab-content fade-in">
            
            {/* Scheduler Form */}
            <div className="scheduler-form-card">
              <h3>Schedule a Practice Plan</h3>
              <form onSubmit={handleAddPlan} className="plan-form">
                <div className="form-group-row">
                  <div className="form-group">
                    <label>Day</label>
                    <select value={scheduleDay} onChange={(e) => setScheduleDay(e.target.value)}>
                      {DAYS.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Time</label>
                    <input 
                      type="time" 
                      value={scheduleTime} 
                      onChange={(e) => setScheduleTime(e.target.value)} 
                      required 
                    />
                  </div>
                </div>

                <div className="form-group-row">
                  <div className="form-group">
                    <label>Practice Type</label>
                    <select value={scheduleType} onChange={(e) => setScheduleType(e.target.value)}>
                      {MEDITATION_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Duration (mins)</label>
                    <select value={scheduleDuration} onChange={(e) => setScheduleDuration(Number(e.target.value))}>
                      {DURATIONS.map(dur => <option key={dur} value={dur}>{dur} mins</option>)}
                    </select>
                  </div>
                </div>

                <button type="submit" className="btn-gold form-submit-btn">
                  Create Practice Plan ☸
                </button>
              </form>
            </div>

            {/* Active plans list */}
            <div className="plans-list-section">
              <h3>Your Active Schedule</h3>
              {plans.length === 0 ? (
                <div className="empty-plans-state">
                  <p>No meditation plans created yet. Build one above to establish a daily mindfulness habit! 🪷</p>
                </div>
              ) : (
                <div className="plans-cards-grid">
                  {plans.map((plan) => (
                    <div key={plan.id} className={`plan-card ${plan.active ? 'active' : 'inactive'}`}>
                      <div className="plan-card-body">
                        <div className="plan-time-day">
                          <span className="plan-time">{plan.time}</span>
                          <span className="plan-day">{plan.dayOfWeek}</span>
                        </div>
                        <h4 className="plan-type">{plan.type}</h4>
                        <div className="plan-duration-badge">{plan.durationMins} minutes</div>
                      </div>
                      <div className="plan-card-actions">
                        <button 
                          className={`plan-toggle-btn ${plan.active ? 'active' : ''}`}
                          onClick={() => handleTogglePlan(plan.id, plan.active)}
                          title={plan.active ? 'Deactivate schedule' : 'Activate schedule'}
                        >
                          {plan.active ? '🔔 Enabled' : '🔕 Disabled'}
                        </button>
                        <button 
                          className="plan-delete-btn"
                          onClick={() => handleDeletePlan(plan.id)}
                          title="Delete plan"
                        >
                          🗑
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

          </div>
        )}

      </div>
    </div>
  );
}
