import React, { useState, useEffect } from 'react';
import { HTTP_BASE_URL } from '../config';


export default function Profile() {
  const [profile, setProfile] = useState({ name: 'Learner', role: 'Active Explorer' });
  const [history, setHistory] = useState([]);
  const [calendarDays, setCalendarDays] = useState([]);
  const [saveStatus, setSaveStatus] = useState('Save Changes');
  
  // --- NEW: Backend Tracking State ---
  const [studentStats, setStudentStats] = useState(() => {
    const saved = localStorage.getItem('tenjin_progress');
    return saved ? JSON.parse(saved) : { level: 1, xp: 0 };
  });
  const [userId] = useState(() => localStorage.getItem('tenjin_user_id') || 'guest');

  useEffect(() => {
    // Fetch Level and XP from backend
    fetch(`${HTTP_BASE_URL}/api/profile?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        const local = JSON.parse(localStorage.getItem('tenjin_progress')) || { level: 1, xp: 0 };
        
        // Protect against Google Cloud memory wipes. Only accept server data if it's higher than local data.
        const totalBackendXP = (data.level * 1000) + data.xp; 
        const totalLocalXP = (local.level * 1000) + local.xp;
        
        if (totalBackendXP >= totalLocalXP) {
            setStudentStats(data);
            localStorage.setItem('tenjin_progress', JSON.stringify({ level: data.level, xp: data.xp }));
        }
      })
      .catch(err => console.error("Failed to fetch profile", err));

    setProfile(JSON.parse(localStorage.getItem('tenjin_user_profile')) || { name: 'Learner', role: 'Active Explorer' });
    const storedHistory = JSON.parse(localStorage.getItem('tenjin_score_history')) || [];
    setHistory(storedHistory);

    const activeDates = JSON.parse(localStorage.getItem('tenjin_active_days')) || [];
    const today = new Date();
    let daysArray = [];
    for (let i = 13; i >= 0; i--) {
      let d = new Date();
      d.setDate(today.getDate() - i);
      daysArray.push({
        dayNumber: d.getDate(),
        isActive: activeDates.includes(d.toISOString().split('T')[0])
      });
    }
    setCalendarDays(daysArray);
  }, [userId]);

  const saveProfile = () => {
    localStorage.setItem('tenjin_user_profile', JSON.stringify(profile));
    setSaveStatus('✓ Saved!');
    setTimeout(() => setSaveStatus('Save Changes'), 1500);
  };

  const wipeHistory = () => {
    if (window.confirm('Wipe all tracking data and score records permanently?')) {
      localStorage.removeItem('tenjin_score_history');
      setHistory([]);
    }
  };

  const totalExams = history.length;
  const totalScore = history.reduce((acc, curr) => acc + (curr.score || 0), 0);
  const totalPossible = history.reduce((acc, curr) => acc + (curr.total || 0), 0);
  const overallAccuracy = totalPossible > 0 ? Math.round((totalScore / totalPossible) * 100) : 0;
  const passedExams = history.filter(test => test.percentage >= 80).length;

  // Calculate Level Progress for Profile Card
  const xpNeeded = studentStats.level * 100;
  const progressPercent = Math.min(100, Math.max(0, (studentStats.xp / xpNeeded) * 100));

  return (
    <div style={{ maxWidth: '950px', margin: '0 auto', paddingBottom: '40px' }}>
      
      {/* HEADER */}
      <h2 style={{ marginBottom: '25px', color: 'var(--text-main)' }}>Account Settings</h2>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px', marginBottom: '30px' }}>
        {/* PROFILE CARD */}
        <div className="dashboard-card" style={{ margin: 0 }}>
          <h3 style={{ marginBottom: '15px' }}>👤 Profile Details</h3>
          
          {/* NEW: Level & XP Bar built into profile box */}
          <div style={{ background: 'rgba(255,255,255,0.03)', padding: '15px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '25px' }}>
             <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
               <span style={{ fontWeight: 'bold', color: 'var(--text-main)' }}>Level {studentStats.level}</span>
               <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{studentStats.xp} / {xpNeeded} XP</span>
             </div>
             <div style={{ background: 'var(--bg-primary)', borderRadius: '8px', height: '8px', width: '100%', overflow: 'hidden' }}>
               <div style={{ width: `${progressPercent}%`, height: '100%', background: 'var(--accent-color)', borderRadius: '8px', transition: 'width 1s ease' }}></div>
             </div>
          </div>

          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Display Name</label>
          <input className="form-control" style={{ marginBottom: '20px' }} value={profile.name} onChange={(e) => setProfile({ ...profile, name: e.target.value })} />
          
          <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '8px', display: 'block' }}>Learning Title</label>
          <input className="form-control" style={{ marginBottom: '25px' }} value={profile.role} onChange={(e) => setProfile({ ...profile, role: e.target.value })} />
          
          <button className="btn btn-primary" style={{ width: '100%', padding: '12px' }} onClick={saveProfile}>{saveStatus}</button>
        </div>

        {/* CALENDAR CARD */}
        <div className="dashboard-card" style={{ margin: 0 }}>
          <h3 style={{ marginBottom: '20px' }}>📅 Activity Matrix</h3>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '10px' }}>
            {calendarDays.map((day, idx) => (
              <div key={idx} style={{ 
                aspectRatio: '1', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                borderRadius: '8px', background: day.isActive ? 'var(--accent-color)' : 'var(--bg-primary)',
                fontWeight: 600, color: day.isActive ? 'white' : 'var(--text-muted)'
              }}>{day.dayNumber}</div>
            ))}
          </div>
        </div>
      </div>

      {/* METRICS ROW */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '20px', marginBottom: '30px' }}>
        {[{ label: 'Overall Accuracy', val: `${overallAccuracy}%`, icon: '📈' }, { label: 'Exams Taken', val: totalExams, icon: '📝' }, { label: 'Modules Passed', val: passedExams, icon: '🏆' }].map((stat, idx) => (
          <div key={idx} className="dashboard-card" style={{ margin: 0, textAlign: 'center', padding: '20px' }}>
            <div style={{ fontSize: '1.8rem', marginBottom: '10px' }}>{stat.icon}</div>
            <h2 style={{ margin: 0 }}>{stat.val}</h2>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', fontWeight: 600 }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* HISTORY TABLE */}
      <div className="dashboard-card" style={{ margin: 0 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '25px' }}>
          <h3>Assessment Timeline</h3>
          <button className="btn" style={{ borderColor: '#ef4444', color: '#ef4444' }} onClick={wipeHistory}>Reset Progress</button>
        </div>
        <div>
          {history.length === 0 ? <p style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No tests logged yet.</p> : history.map((test, i) => (
            <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'var(--bg-primary)', borderRadius: '12px', marginBottom: '12px', border: '1px solid var(--border-color)' }}>
              <div>
                <h4 style={{ margin: '0 0 4px 0' }}>{test.level}</h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', margin: 0 }}>{test.topic} • {test.date}</p>
              </div>
              <div style={{ fontSize: '1.2rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>{test.score}/{test.total}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}