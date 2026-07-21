import React, { useState, useEffect } from 'react';
import { HTTP_BASE_URL } from '../config';


export default function LearningPath() {
  const [vocabulary, setVocabulary] = useState([]);
  const [loading, setLoading] = useState(true);
  const [flippedIndex, setFlippedIndex] = useState(null);

  const userId = localStorage.getItem('tenjin_user_id');

  useEffect(() => {
    // Fetch the saved flashcards from your Node backend
    fetch(`${HTTP_BASE_URL}/api/vocabulary?userId=${userId}`)
      .then(res => res.json())
      .then(data => {
        setVocabulary(data.vocabulary || []);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch vocabulary:", err);
        setLoading(false);
      });
  }, [userId]);

  const handleFlip = (index) => {
    setFlippedIndex(flippedIndex === index ? null : index);
  };

  return (
    <div style={{ padding: '20px', height: 'calc(100vh - 100px)', overflowY: 'auto' }}>
      
      <div style={{ marginBottom: '30px', textAlign: 'center' }}>
        <h2 style={{ color: 'var(--text-main)', margin: '0 0 10px 0' }}>My Vocabulary Deck</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          You have mastered <strong style={{ color: 'var(--accent-color)' }}>{vocabulary.length}</strong> words with Nanami.
        </p>
      </div>

      {loading ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '50px' }}>Loading your flashcards...</div>
      ) : vocabulary.length === 0 ? (
        <div style={{ textAlign: 'center', color: 'var(--text-muted)', marginTop: '50px', background: 'var(--bg-card)', padding: '40px', borderRadius: '16px', border: '1px solid var(--border-color)' }}>
          <span style={{ fontSize: '3rem' }}>📭</span>
          <h3>Your deck is empty</h3>
          <p>Go chat with Nanami in the scenarios to discover and save new words!</p>
        </div>
      ) : (
        <div style={{ 
          display: 'grid', 
          gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', 
          gap: '20px',
          maxWidth: '1200px',
          margin: '0 auto'
        }}>
          {vocabulary.map((word, index) => {
            const isFlipped = flippedIndex === index;
            
            return (
              <div 
                key={index} 
                onClick={() => handleFlip(index)}
                style={{
                  perspective: '1000px',
                  height: '180px',
                  cursor: 'pointer'
                }}
              >
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  textAlign: 'center',
                  transition: 'transform 0.6s cubic-bezier(0.4, 0.2, 0.2, 1)',
                  transformStyle: 'preserve-3d',
                  transform: isFlipped ? 'rotateY(180deg)' : 'rotateY(0deg)'
                }}>
                  
                  {/* FRONT OF CARD (Japanese) */}
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    background: 'var(--bg-card)',
                    border: '1px solid var(--border-color)',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                  }}>
                    <h3 style={{ fontSize: '2rem', color: 'white', margin: '0 0 10px 0' }}>{word.japanese}</h3>
                    <p style={{ color: 'var(--text-muted)', margin: 0, fontSize: '0.9rem' }}>Click to flip ⤵</p>
                  </div>

                  {/* BACK OF CARD (English & Romaji) */}
                  <div style={{
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    backfaceVisibility: 'hidden',
                    background: 'var(--accent-color)',
                    borderRadius: '16px',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    transform: 'rotateY(180deg)',
                    boxShadow: '0 4px 12px rgba(108, 92, 231, 0.3)',
                    padding: '20px'
                  }}>
                    <h3 style={{ fontSize: '1.5rem', color: 'white', margin: '0 0 5px 0' }}>{word.english}</h3>
                    <p style={{ color: 'rgba(255,255,255,0.8)', margin: 0, fontStyle: 'italic', letterSpacing: '1px' }}>{word.romaji}</p>
                  </div>

                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}