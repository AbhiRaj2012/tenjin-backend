import React, { useState, useEffect } from 'react';
import quizBank from '../data/quiz_bank'; // Ensure your quiz bank data points are exported here
import { HTTP_BASE_URL } from '../config';

export default function Assessment({ quizMode, navigateTo }) {
  const [questions, setQuestions] = useState([]);
  const [userAnswers, setUserAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [finalScore, setFinalScore] = useState(0);
  const [error, setError] = useState(null);

  // Retrieve user ID for backend tracking
  const [userId] = useState(() => localStorage.getItem('tenjin_user_id') || 'guest');

  const isFullQuiz = quizMode === 'all';
  const quizTitle = isFullQuiz ? "Ultimate Mastery Quiz (Levels 1-4)" : `${quizMode.toUpperCase()} Assessment`;

  useEffect(() => {
    try {
      if (!quizBank) throw new Error("Quiz Bank data structure configuration file is missing.");
      
      let pooledQuestions = [];

      if (isFullQuiz) {
        const levels = ['level1', 'level2', 'level3', 'level4'];
        levels.forEach(lvl => {
          if (!quizBank[lvl]) throw new Error(`Data pool mapping configuration for ${lvl} not found.`);
          let shuffledPool = [...quizBank[lvl]].sort(() => 0.5 - Math.random());
          pooledQuestions = pooledQuestions.concat(shuffledPool.slice(0, 5));
        });
      } else {
        if (!quizBank[quizMode]) throw new Error(`Level database for target field key '${quizMode}' not found.`);
        pooledQuestions = [...quizBank[quizMode]].sort(() => 0.5 - Math.random()).slice(0, 10);
      }

      setQuestions(pooledQuestions);
      setUserAnswers({});
      setIsSubmitted(false);
      setFinalScore(0);
      setError(null);
    } catch (err) {
      setError(err.message);
    }
  }, [quizMode]);

  const handleSelectOption = (qIdx, oIdx) => {
    setUserAnswers(prev => ({ ...prev, [qIdx]: oIdx }));
  };

  // Changed to async to handle the API call to the backend
  const handleSubmitExam = async (e) => {
    e.preventDefault();

    if (Object.keys(userAnswers).length < questions.length) {
      alert("Please resolve all question options completely before submitting.");
      return;
    }

    let computedScore = 0;
    questions.forEach((q, idx) => {
      if (userAnswers[idx] === q.correct_index) computedScore++;
    });

    const passRate = (computedScore / questions.length) * 100;

    // Persist scores safely to client-side data matrices
    const testRecord = {
      level: isFullQuiz ? "Full Mastery Exam" : quizTitle,
      topic: isFullQuiz ? "All Levels" : "Level Review",
      score: computedScore,
      total: questions.length,
      percentage: passRate,
      date: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
    };

    let localHistory = JSON.parse(localStorage.getItem('tenjin_score_history')) || [];
    localHistory.unshift(testRecord);
    localStorage.setItem('tenjin_score_history', JSON.stringify(localHistory));

    // --- NEW: Send earned XP to the backend ---
    const earnedXP = computedScore * 10; // Award 10 XP per correct answer
    if (earnedXP > 0) {
      try {
        const res = await fetch(`${HTTP_BASE_URL}/api/add-xp`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId, amount: earnedXP })
        });
        const data = await res.json();
        
        // --- NEW: Lock the returned XP into the browser's local storage ---
        if (data.success) {
           localStorage.setItem('tenjin_progress', JSON.stringify({ level: data.level, xp: data.xp }));
        }
      } catch (err) {
        console.error("Failed to sync XP with server:", err);
      }
    }

    setFinalScore(computedScore);
    setIsSubmitted(true);
  };

  if (error) {
    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', padding: '50px 20px' }}>
        <div style={{ fontSize: '3rem', marginBottom: '15px' }}>⚠️</div>
        <h2 style={{ color: 'var(--accent-color)', marginBottom: '10px' }}>Failed to Load Exam</h2>
        <p style={{ color: 'var(--text-muted)' }}>{error}</p>
      </div>
    );
  }

  if (isSubmitted) {
    const passRate = (finalScore / questions.length) * 100;
    const feedbackMsg = passRate >= 80 ? "Subarashii! (Excellent!) 🎉" : "Ganbatte! (Keep practicing!) 💪";
    const totalXPEarned = finalScore * 10;

    return (
      <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
        
        {/* Updated Results Header with XP Display */}
        <div style={{ textAlign: 'center', background: 'var(--bg-card)', padding: '40px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '30px', position: 'relative', overflow: 'hidden' }}>
          <h1 style={{ fontSize: '3.5rem', margin: 0, color: 'var(--accent-color)' }}>{finalScore}/{questions.length}</h1>
          <h2 style={{ margin: '10px 0 15px 0' }}>{feedbackMsg}</h2>
          
          {/* XP Reward Pill */}
          <div style={{ display: 'inline-block', background: 'rgba(46, 204, 113, 0.15)', border: '1px solid #2ecc71', color: '#2ecc71', padding: '8px 20px', borderRadius: '20px', fontWeight: 'bold', fontSize: '1.2rem', boxShadow: '0 4px 10px rgba(46, 204, 113, 0.2)' }}>
             +{totalXPEarned} XP Earned!
          </div>
        </div>

        {questions.map((q, qIdx) => {
          const userAns = userAnswers[qIdx];
          const isCorrect = userAns === q.correct_index;
          const statusColor = isCorrect ? 'var(--success-color)' : '#e74c3c';

          return (
            <div key={qIdx} style={{ background: 'var(--bg-card)', border: `1px solid ${statusColor}`, borderRadius: '12px', padding: '25px', marginBottom: '25px' }}>
              <h4 style={{ marginBottom: '15px' }}>
                {isCorrect ? '✅' : '❌'} <span style={{ color: 'var(--text-muted)', marginRight: '10px' }}>Q{qIdx + 1}.</span>{q.question}
              </h4>
              <div>
                {q.options.map((opt, oIdx) => {
                  let inlineStyle = { padding: '12px 15px', marginBottom: '8px', borderRadius: '8px', opacity: 0.6, background: 'var(--bg-primary)', border: '1px solid var(--border-color)' };
                  let tailIcon = "";

                  if (oIdx === q.correct_index) {
                    inlineStyle = { ...inlineStyle, background: 'rgba(46, 213, 115, 0.1)', border: '1px solid var(--success-color)', fontWeight: 'bold', opacity: 1 };
                    tailIcon = " ✓";
                  } else if (oIdx === userAns && !isCorrect) {
                    inlineStyle = { ...inlineStyle, background: 'rgba(231, 76, 60, 0.1)', border: '1px solid #e74c3c', color: '#e74c3c', opacity: 1 };
                    tailIcon = " ✗";
                  }

                  return <div key={oIdx} style={inlineStyle}>{opt}{tailIcon}</div>;
                })}
              </div>
              <div style={{ background: 'var(--bg-primary)', padding: '15px', borderRadius: '8px', borderLeft: '4px solid var(--accent-color)', marginTop: '15px' }}>
                <p style={{ margin: 0, fontSize: '0.9rem' }}><strong>Tenjin's Feedback:</strong> {q.explanation}</p>
              </div>
            </div>
          );
        })}

        <div style={{ textAlign: 'center', marginTop: '30px' }}>
          <button className="btn btn-primary" onClick={() => navigateTo('profile')}>View Profile Dashboard</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
      <div style={{ marginBottom: '30px' }}>
        <h2>{quizTitle}</h2>
        <p style={{ color: 'var(--text-muted)' }}>Please verify options across all {questions.length} questions inside the matrix bundle.</p>
      </div>

      <form onSubmit={handleSubmitExam}>
        {questions.map((q, qIdx) => (
          <div key={qIdx} style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '25px', marginBottom: '25px' }}>
            <h4 style={{ marginBottom: '15px' }}><span style={{ color: 'var(--text-muted)', marginRight: '10px' }}>Q{qIdx + 1}.</span>{q.question}</h4>
            <div>
              {q.options.map((opt, oIdx) => (
                <label key={oIdx} style={{ display: 'flex', alignItems: 'center', padding: '12px 15px', marginBottom: '8px', background: 'var(--bg-primary)', border: userAnswers[qIdx] === oIdx ? '1px solid var(--accent-color)' : '1px solid var(--border-color)', borderRadius: '8px', cursor: 'pointer' }}>
                  <input type="radio" name={`question_${qIdx}`} value={oIdx} checked={userAnswers[qIdx] === oIdx} onChange={() => handleSelectOption(qIdx, oIdx)} style={{ marginRight: '10px' }} />
                  <span>{opt}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
        <div style={{ textAlign: 'right' }}>
          <button type="submit" className="btn btn-primary" style={{ padding: '12px 30px', fontSize: '1.1rem' }}>Submit Answers</button>
        </div>
      </form>
    </div>
  );
}