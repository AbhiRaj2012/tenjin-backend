
import React, { useState, useEffect } from 'react';
import { HTTP_BASE_URL } from '../config';

export default function Dashboard({ navigateTo }) {
  const [avatarSrc, setAvatarSrc] = useState('/assets/images/tenjin_idle.png');
  const [streakCount, setStreakCount] = useState(0);
  const [history, setHistory] = useState([]);
  const [userProfile, setUserProfile] = useState({ name: 'Learner', role: 'Active Explorer' });
  const [calendarDays, setCalendarDays] = useState([]);
  
  // Hover state for the center interactive card
  const [isHeroHovered, setIsHeroHovered] = useState(false);

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

    const storedHistory = JSON.parse(localStorage.getItem('tenjin_score_history')) || [];
    const storedProfile = JSON.parse(localStorage.getItem('tenjin_user_profile')) || { name: 'Learner', role: 'Active Explorer' };
    
    const todayStr = new Date().toISOString().split('T')[0];
    let activeDates = JSON.parse(localStorage.getItem('tenjin_active_days')) || [];
    if (!activeDates.includes(todayStr)) {
      activeDates.push(todayStr);
      localStorage.setItem('tenjin_active_days', JSON.stringify(activeDates));
    }

    setHistory(storedHistory);
    setUserProfile(storedProfile);

    let currentStreak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      let d = new Date();
      d.setDate(today.getDate() - i);
      if (activeDates.includes(d.toISOString().split('T')[0])) currentStreak++;
      else break;
    }
    setStreakCount(currentStreak);

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

    const avatarStates = [
      '/assets/images/tenjin_dance.png',
      '/assets/images/tenjin_disappointed.png',
      '/assets/images/tenjin_lovely.png',
      '/assets/images/tenjin_thinking.png',
      '/assets/images/tenjin_happy.png',
      '/assets/images/tenjin_idle.png'
    ];

    const interval = setInterval(() => {
      const randomState = avatarStates[Math.floor(Math.random() * avatarStates.length)];
      setAvatarSrc(randomState);
    }, 10000);

    return () => clearInterval(interval);
  }, [userId]);

  // --- NEW: Calculate Level Progress ---
  const xpNeeded = studentStats.level * 100;
  const progressPercent = Math.min(100, Math.max(0, (studentStats.xp / xpNeeded) * 100));

  return (
    <div className="dashboard-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1.3fr 1fr', gap: '30px', alignItems: 'stretch' }}>
      
      {/* LEFT COLUMN: Progress & Scores */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <div className="dashboard-card" style={{ flex: 1, margin: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center', background: 'var(--bg-card)' }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '5px' }}>Current Rank</h3>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '15px' }}>
            <p style={{ color: 'var(--accent-color)', fontSize: '1.4rem', fontWeight: 600, margin: 0 }}>Level {studentStats.level}</p>
            <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>{studentStats.xp} / {xpNeeded} XP</p>
          </div>
          
          <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: '12px', height: '10px', width: '100%', overflow: 'hidden' }}>
            <div style={{ 
                width: `${progressPercent}%`, 
                height: '100%', 
                background: 'linear-gradient(90deg, var(--accent-color), #a29bfe)',
                boxShadow: '0 0 10px var(--accent-color)',
                borderRadius: '12px',
                transition: 'width 1s ease-out'
              }}>
            </div>
          </div>
          <p style={{ marginTop: '12px', fontSize: '0.8rem', color: 'var(--text-muted)', textAlign: 'right', fontWeight: 500 }}>
             {xpNeeded - studentStats.xp} XP to level up!
          </p>
        </div>

        <div className="dashboard-card" style={{ flex: 1.5, margin: 0 }}>
          <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', marginBottom: '20px' }}>Recent Test Scores</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
            {history.length > 0 ? history.slice(0, 3).map((item, index) => (
              <div key={index} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '12px', border: '1px solid var(--border-color)' }}>
                <div>
                  <p style={{ fontWeight: 500, fontSize: '0.95rem', margin: '0 0 4px 0', color: 'var(--text-main)' }}>{item.topic}</p>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{item.date}</span>
                </div>
                <div style={{ fontWeight: 'bold', color: item.percentage >= 80 ? 'var(--success-color)' : '#f59e0b', fontSize: '1.1rem' }}>
                  {item.percentage}%
                </div>
              </div>
            )) : <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '20px' }}>No tests taken yet. Start learning!</p>}
          </div>
        </div>
      </div>

      {/* CENTER COLUMN: Interactive Hero Frame */}
      <div 
        className="dashboard-card" 
        onMouseEnter={() => setIsHeroHovered(true)}
        onMouseLeave={() => setIsHeroHovered(false)}
        onClick={() => navigateTo('chat')} 
        style={{ 
            margin: 0, 
            cursor: 'pointer', 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            position: 'relative',
            background: 'var(--bg-card)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
            transform: isHeroHovered ? 'translateY(-5px)' : 'translateY(0)',
            boxShadow: isHeroHovered ? '0 12px 30px rgba(0,0,0,0.4)' : '0 4px 20px rgba(0,0,0,0.1)',
            overflow: 'hidden'
        }}
      >
        <div style={{
          position: 'absolute',
          top: '40%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '250px',
          height: '250px',
          background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, transparent 60%)',
          zIndex: 0
        }}></div>

        <img 
          src={avatarSrc} 
          alt="Tenjin Sensei" 
          style={{ 
            width: '130%', 
            maxWidth: '340px', 
            height: 'auto', 
            objectFit: 'contain', 
            position: 'relative',
            zIndex: 1,
            transition: 'opacity 0.5s ease-in-out',
           WebkitMaskImage: 'radial-gradient(circle at center, black 62%, rgba(0,0,0,.9) 72%, transparent 100%)',
           maskImage:'radial-gradient(circle at center, black 62%, rgba(0,0,0,.9) 72%, transparent 100%)',
          }} 
        />
        
        <div style={{ 
            position: 'relative', 
            zIndex: 2, 
            marginTop: '-15px', 
            background: 'var(--bg-primary)', 
            padding: '8px 25px 8px 12px', 
            borderRadius: '40px', 
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            boxShadow: '0 4px 15px rgba(0,0,0,0.3)',
            transition: 'background 0.3s',
            border: '1px solid rgba(255,255,255,0.05)'
        }}>
          <img 
            src="/assets/images/nanami_icon.png" 
            alt="Nanami" 
            style={{ 
              width: '40px', 
              height: '40px', 
              borderRadius: '50%', 
              objectFit: 'cover',
              border: '2px solid var(--accent-color)'
            }} 
            onError={(e) => { e.target.style.display='none'; e.target.parentNode.innerText='奈'; }}
          />
          <div style={{ textAlign: 'left' }}>
            <h2 style={{ fontSize: '1.1rem', color: 'var(--text-main)', margin: '0 0 2px 0', letterSpacing: '0.5px' }}>Nanami</h2>
            <p style={{ color: 'var(--accent-color)', fontSize: '0.85rem', fontWeight: 600, margin: 0 }}>💬 Chat with Nanami</p>
          </div>
        </div>
      </div>

      
      {/* RIGHT COLUMN: Profile & Streak Matrix */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '25px' }}>
        <div className="dashboard-card" style={{ margin: 0, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '30px 20px' }}>
          <div style={{ 
              width: '75px', 
              height: '75px', 
              fontSize: '2rem', 
              margin: '0 auto 15px', 
              background: 'var(--accent-color)', 
              borderRadius: '50%', 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'center', 
              color: 'white', 
              boxShadow: '0 4px 20px rgba(99, 102, 241, 0.4)' 
            }}>
            👤
          </div>
          <h3 style={{ fontSize: '1.2rem', color: 'var(--text-main)', margin: '0 0 5px 0' }}>{userProfile.name}</h3>
          <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 500 }}>{userProfile.role}</p>
        </div>

        <div className="dashboard-card" style={{ flex: 1, margin: 0, display: 'flex', flexDirection: 'column' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '1.05rem', color: 'var(--text-main)', margin: 0 }}>Streak Matrix</h3>
            <span style={{ fontWeight: '600', color: '#fb923c', background: 'rgba(251, 146, 60, 0.1)', padding: '4px 12px', borderRadius: '20px', fontSize: '0.85rem' }}>🔥 {streakCount} Days</span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '8px', marginTop: 'auto' }}>
            {calendarDays.map((day, idx) => (
              <div 
                key={idx} 
                style={{ 
                    aspectRatio: '1', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'center', 
                    borderRadius: '8px', 
                    fontSize: '0.85rem', 
                    fontWeight: 600,
                    transition: 'all 0.2s',
                    background: day.isActive ? 'var(--accent-color)' : 'rgba(255,255,255,0.03)',
                    color: day.isActive ? 'white' : 'var(--text-muted)',
                    boxShadow: day.isActive ? '0 4px 12px rgba(99, 102, 241, 0.5)' : 'none',
                }}>
                {day.dayNumber}
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}