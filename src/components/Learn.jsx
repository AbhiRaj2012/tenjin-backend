import React, { useState, useEffect } from 'react';
import { HTTP_BASE_URL } from '../config';
import { vocabData } from './Level2';


const LevelCard = ({ lvl, navigateTo }) => {
  const [isHovered, setIsHovered] = useState(false);
  return (
    <div 
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={() => navigateTo(lvl.id)}
      style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        cursor: 'pointer', 
        transition: 'all 0.3s ease', 
        background: isHovered ? 'rgba(255,255,255,0.02)' : 'var(--bg-card)', 
        border: `1px solid ${isHovered ? lvl.color : 'var(--border-color)'}`, 
        borderRadius: '16px', 
        padding: '25px',
        transform: isHovered ? 'translateY(-4px)' : 'translateY(0)',
        boxShadow: isHovered ? `0 12px 25px ${lvl.color}20` : '0 4px 15px rgba(0,0,0,0.1)'
      }}
    >
      <div>
        <span style={{ fontSize: '0.85rem', fontWeight: 'bold', color: lvl.color, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
          {lvl.tag}
        </span>
        <h3 style={{ margin: '8px 0', border: 'none', padding: 0, color: 'var(--text-main)', fontSize: '1.25rem' }}>
          {lvl.title}
        </h3>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.95rem', margin: 0, lineHeight: 1.5 }}>
          {lvl.desc}
        </p>
      </div>
      <button 
        className={`btn ${lvl.primary ? 'btn-primary' : ''}`} 
        style={{
          background: lvl.primary ? lvl.color : (isHovered ? `${lvl.color}15` : 'transparent'), 
          color: lvl.primary ? 'white' : lvl.color, 
          border: `1px solid ${lvl.color}`,
          transition: 'all 0.3s ease',
          transform: isHovered ? 'scale(1.05)' : 'scale(1)',
          boxShadow: (lvl.primary && isHovered) ? `0 4px 15px ${lvl.color}60` : 'none'
        }}
      >
        {lvl.action}
      </button>
    </div>
  );
};

// --- NEW FLASHCARD QUIZ MODAL ---
const FlashcardModal = ({ isOpen, onClose, vocabulary, userId }) => {
  const [quizCards, setQuizCards] = useState([]);

  const generateQuiz = () => {
    if (!vocabulary || vocabulary.length === 0) return;
    
    // Shuffle and pick 4 random words
    const shuffled = [...vocabulary].sort(() => 0.5 - Math.random());
    const selected = shuffled.slice(0, 4);

    const formattedCards = selected.map(word => ({
      wordData: word,
      // Randomly decide if they are guessing English (from Japanese) or guessing Japanese (from English)
      mode: Math.random() > 0.5 ? 'guess_en' : 'guess_ja',
      userGuess: '',
      status: 'idle' // 'idle', 'correct', 'wrong'
    }));

    setQuizCards(formattedCards);
  };

  // Generate a quiz immediately when the modal opens
  useEffect(() => {
    if (isOpen) generateQuiz();
  }, [isOpen, vocabulary]);

  const handleGuessSubmit = async (index) => {
    const card = quizCards[index];
    if (!card.userGuess.trim()) return;

    const guess = card.userGuess.toLowerCase().trim();
    let isCorrect = false;

    if (card.mode === 'guess_en') {
      // Must match english
      isCorrect = guess === card.wordData.english.toLowerCase();
    } else {
      // Can match romaji OR actual japanese characters
      isCorrect = guess === card.wordData.romaji.toLowerCase() || guess === card.wordData.japanese;
    }

    const updatedCards = [...quizCards];
    updatedCards[index].status = isCorrect ? 'correct' : 'wrong';
    setQuizCards(updatedCards);

    // If correct, reward XP to DB!
    if (isCorrect) {
      try {
        await fetch('http://localhost:8000/api/add-xp', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: userId, amount: 10 }) // +10 XP per correct word
        });
      } catch (err) { console.error("Failed to add XP", err); }
    }
  };

  if (!isOpen) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: 'var(--bg-primary)', padding: '30px', borderRadius: '24px', width: '90%', maxWidth: '900px', border: '1px solid var(--border-color)', boxShadow: '0 20px 50px rgba(0,0,0,0.5)' }}>
        
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
          <div>
            <h2 style={{ margin: 0, color: 'var(--text-main)' }}>Vocabulary Practice</h2>
            <p style={{ margin: 0, color: 'var(--text-muted)' }}>Guess the missing translations. +10 XP for correct answers!</p>
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button onClick={generateQuiz} style={{ background: 'var(--accent-color)', color: 'white', border: 'none', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>🔄 Refresh</button>
            <button onClick={onClose} style={{ background: 'var(--bg-card)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '10px 20px', borderRadius: '12px', cursor: 'pointer', fontWeight: 'bold' }}>✕ Close</button>
          </div>
        </div>

        {vocabulary.length < 4 ? (
          <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
            You need to learn at least 4 words in the chat scenarios to use this feature!
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
            {quizCards.map((card, i) => (
              <div key={i} style={{ 
                background: 'var(--bg-card)', border: `2px solid ${card.status === 'correct' ? '#2ecc71' : card.status === 'wrong' ? '#e74c3c' : 'var(--border-color)'}`, 
                borderRadius: '16px', padding: '20px', position: 'relative', overflow: 'hidden' 
              }}>
                {/* Visual Feedback overlay */}
                {card.status === 'correct' && <div style={{ position: 'absolute', top: 10, right: 10, color: '#2ecc71', fontSize: '1.5rem' }}>✅</div>}
                {card.status === 'wrong' && <div style={{ position: 'absolute', top: 10, right: 10, color: '#e74c3c', fontSize: '1.5rem' }}>❌</div>}

                {/* The Prompt */}
                <div style={{ textAlign: 'center', marginBottom: '15px' }}>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px' }}>
                    {card.mode === 'guess_en' ? 'What does this mean?' : 'Translate to Japanese (Romaji)'}
                  </span>
                  <h3 style={{ fontSize: '1.8rem', color: 'var(--text-main)', margin: '5px 0 0 0' }}>
                    {card.mode === 'guess_en' ? card.wordData.japanese : card.wordData.english}
                  </h3>
                  {/* Show Romaji if they are guessing English */}
                  {card.mode === 'guess_en' && (
                    <p style={{ margin: 0, color: 'var(--text-muted)', fontStyle: 'italic' }}>({card.wordData.romaji})</p>
                  )}
                </div>

                {/* The Input */}
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input 
                    type="text" 
                    placeholder={card.mode === 'guess_en' ? "Type English..." : "Type Romaji..."}
                    value={card.userGuess}
                    onChange={(e) => {
                      const updated = [...quizCards];
                      updated[i].userGuess = e.target.value;
                      updated[i].status = 'idle'; // Reset status on typing
                      setQuizCards(updated);
                    }}
                    onKeyPress={(e) => e.key === 'Enter' && handleGuessSubmit(i)}
                    disabled={card.status === 'correct'}
                    style={{ flex: 1, padding: '12px 15px', borderRadius: '12px', background: 'var(--bg-primary)', border: '1px solid var(--border-color)', color: 'var(--text-main)' }}
                  />
                  <button 
                    onClick={() => handleGuessSubmit(i)} 
                    disabled={card.status === 'correct'}
                    style={{ background: card.status === 'correct' ? '#2ecc71' : 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '12px', padding: '0 20px', cursor: card.status === 'correct' ? 'default' : 'pointer', fontWeight: 'bold' }}
                  >
                    {card.status === 'correct' ? 'Done' : '➤'}
                  </button>
                </div>
                
                {/* Reveal Answer if wrong */}
                {card.status === 'wrong' && (
                  <p style={{ color: '#e74c3c', fontSize: '0.85rem', margin: '10px 0 0 0', textAlign: 'center' }}>
                    Answer: {card.mode === 'guess_en' ? card.wordData.english : card.wordData.romaji}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};


// --- MAIN CURRICULUM COMPONENT ---
export default function Learn({ navigateTo }) {
  const [isBtnHovered, setIsBtnHovered] = useState(false);
  
  // Flashcard States
  const [vocabulary, setVocabulary] = useState([]);
  const [isQuizOpen, setIsQuizOpen] = useState(false);
  const [userId] = useState(() => localStorage.getItem('tenjin_user_id') || 'guest');

  // Fetch Vocabulary on Mount & Merge
  useEffect(() => {
    // 2. Flatten all Level 2 categories into one array and fix the keys
    const level2Words = Object.values(vocabData).flat().map(item => ({
      japanese: item.j,
      romaji: item.r,
      english: item.e
    }));

    fetch(`${HTTP_BASE_URL}/api/vocabulary?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        const dynamicWords = data.vocabulary || [];
        // 3. Combine Level 2 words with AI-generated words!
        setVocabulary([...level2Words, ...dynamicWords]); 
      })
      .catch(err => {
        console.error("Failed to fetch vocabulary:", err);
        // If server fails, still load the Level 2 words
        setVocabulary([...level2Words]); 
      });
  }, [userId]);

  const levels = [
    { id: 'level1', tag: 'Level 1', color: 'var(--accent-color)', title: 'Foundations & Alphabets', desc: 'Master Hiragana, Katakana, and basic Kanji origins.', action: 'Start Level', primary: true },
    { id: 'level2', tag: 'Level 2', color: '#3498db', title: 'Vocabulary Dictionary', desc: 'Learn essential words for food, greetings, travel, and common verbs.', action: 'Explore' },
    { id: 'level3', tag: 'Level 3', color: '#9b59b6', title: 'Basic Grammar', desc: 'Understand sentence structure, particle usage (desu, ka), and word placement.', action: 'Explore' },
    { id: 'level4', tag: 'Level 4', color: '#e67e22', title: 'Common Sentences', desc: 'Practice 100+ everyday phrases with hidden translations.', action: 'Explore' }
  ];

  return (
    <>
      {/* Quiz Modal Render */}
      <FlashcardModal isOpen={isQuizOpen} onClose={() => setIsQuizOpen(false)} vocabulary={vocabulary} userId={userId} />

      {/* Floating Action Button */}
      {vocabulary.length >= 4 && (
        <button 
          onClick={() => setIsQuizOpen(true)}
          style={{
            position: 'fixed', bottom: '40px', right: '40px', zIndex: 900,
            background: 'var(--accent-color)', color: 'white', border: 'none', borderRadius: '50px',
            padding: '15px 25px', fontSize: '1rem', fontWeight: 'bold', cursor: 'pointer',
            boxShadow: '0 10px 25px rgba(108, 92, 231, 0.4)', transition: 'transform 0.2s ease',
            display: 'flex', alignItems: 'center', gap: '10px'
          }}
          onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05) translateY(-5px)'}
          onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1) translateY(0)'}
        >
          <span style={{ fontSize: '1.5rem' }}>🃏</span> Practice Vocabulary ({vocabulary.length})
        </button>
      )}

      {/* Existing Learn Layout */}
      <div style={{ display: 'flex', gap: '40px', maxWidth: '1200px', margin: '0 auto', alignItems: 'flex-start' }}>
        
        {/* Left Column: Curriculum List */}
        <div style={{ flex: 1 }}>
          <h2 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>Learning Path</h2>
          <p style={{ color: 'var(--text-muted)', marginBottom: '30px', fontSize: '1.05rem' }}>
            Follow the curriculum step-by-step to achieve Japanese fluency.
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {levels.map((lvl) => (
              <LevelCard key={lvl.id} lvl={lvl} navigateTo={navigateTo} />
            ))}
          </div>
        </div>

        {/* Right Column: Hero Graphic & Exam Anchor */}
        <div style={{ width: '340px', position: 'sticky', top: '20px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          
          <div style={{ position: 'relative', display: 'flex', justifyContent: 'center', height: '280px', alignItems: 'flex-end' }}>
            <img 
              src="/assets/images/tenjin_lovely.png" 
              alt="Tenjin" 
              style={{ 
                width: '250px', 
                position: 'relative', 
                zIndex: 1,
                WebkitMaskImage: 'linear-gradient(to bottom, black 55%, transparent 95%)',
                maskImage: 'linear-gradient(to bottom, black 55%, transparent 95%)',
                animation: 'float 4s ease-in-out infinite' 
              }} 
            />
          </div>
          
          <div style={{ background: 'var(--bg-card)', padding: '25px', borderRadius: '16px', textAlign: 'center', border: '1px solid var(--border-color)', boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
            <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-main)', fontSize: '1.15rem' }}>Let's master Japanese!</h4>
            <p style={{ margin: 0, color: 'var(--text-muted)', fontSize: '0.95rem' }}>Ganbatte! (Do your best!)</p>
          </div>

          <button 
            onMouseEnter={() => setIsBtnHovered(true)}
            onMouseLeave={() => setIsBtnHovered(false)}
            onClick={() => navigateTo('ultimate_quiz')}
            style={{ 
              width: '100%', padding: '18px', fontSize: '1.1rem', borderRadius: '16px', fontWeight: 'bold', 
              background: 'linear-gradient(135deg, var(--accent-color), #ff4757)', border: 'none', color: 'white', cursor: 'pointer',
              transition: 'all 0.3s ease', transform: isBtnHovered ? 'translateY(-4px)' : 'translateY(0)',
              boxShadow: isBtnHovered ? '0 10px 25px rgba(255, 71, 87, 0.4)' : '0 4px 15px rgba(0,0,0,0.2)'
            }}
          >
            👑 Ultimate Mastery Exam
          </button>

          <style>
            {`
              @keyframes float {
                0% { transform: translateY(0px); }
                50% { transform: translateY(-10px); }
                100% { transform: translateY(0px); }
              }
            `}
          </style>
        </div>
      </div>
    </>
  );
}