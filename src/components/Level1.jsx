// src/components/Level1.jsx
import React, { useState } from 'react';

export default function Level1({ navigateTo, setQuizMode }) {
  const [activeTab, setActiveTab] = useState('hiragana');

  const playAudio = (filename) => {
    const audio = new Audio(`/assets/audio/level_one/${filename}`);
    audio.play().catch(() => console.warn(`Audio track missing: ${filename}`));
  };

    const alphabetData = {
    hiragana: [
                { j: 'あ', r: 'a', file: 'a.mp3' }, { j: 'い', r: 'i', file: 'i.mp3' }, { j: 'う', r: 'u', file: 'u.mp3' }, { j: 'え', r: 'e', file: 'e.mp3' }, { j: 'お', r: 'o', file: 'o.mp3' },
                { j: 'か', r: 'ka', file: 'ka.mp3' }, { j: 'き', r: 'ki', file: 'ki.mp3' }, { j: 'く', r: 'ku', file: 'ku.mp3' }, { j: 'け', r: 'ke', file: 'ke.mp3' }, { j: 'こ', r: 'ko', file: 'ko.mp3' },
                { j: 'さ', r: 'sa', file: 'sa.mp3' }, { j: 'し', r: 'shi', file: 'shi.mp3' }, { j: 'す', r: 'su', file: 'su.mp3' }, { j: 'せ', r: 'se', file: 'se.mp3' }, { j: 'そ', r: 'so', file: 'so.mp3' },
                { j: 'た', r: 'ta', file: 'ta.mp3' }, { j: 'ち', r: 'chi', file: 'chi.mp3' }, { j: 'つ', r: 'tsu', file: 'tsu.mp3' }, { j: 'て', r: 'te', file: 'te.mp3' }, { j: 'と', r: 'to', file: 'to.mp3' },
                { j: 'な', r: 'na', file: 'na.mp3' }, { j: 'に', r: 'ni', file: 'ni.mp3' }, { j: 'ぬ', r: 'nu', file: 'nu.mp3' }, { j: 'ね', r: 'ne', file: 'ne.mp3' }, { j: 'の', r: 'no', file: 'no.mp3' },
                { j: 'ま', r: 'ma', file: 'ma.mp3' }, { j: 'み', r: 'mi', file: 'mi.mp3' }, { j: 'む', r: 'mu', file: 'mu.mp3' }, { j: 'め', r: 'me', file: 'me.mp3' }, { j: 'も', r: 'mo', file: 'mo.mp3' },
                { j: 'や', r: 'ya', file: 'ya.mp3' }, { j: 'ゆ', r: 'yu', file: 'yu.mp3' }, { j: 'よ', r: 'yo', file: 'yo.mp3' },
                { j: 'ら', r: 'ra', file: 'ra.mp3' }, { j: 'り', r: 'ri', file: 'ri.mp3' }, { j: 'る', r: 'ru', file: 'ru.mp3' }, { j: 'れ', r: 're', file: 're.mp3' }, { j: 'ろ', r: 'ro', file: 'ro.mp3' },
                { j: 'わ', r: 'wa', file: 'wa.mp3' }, { j: 'を', r: 'wo', file: 'wo.mp3' }, { j: 'ん', r: 'n', file: 'n.mp3' }
            ],
            katakana: [
                { j: 'ア', r: 'a', file: 'a.mp3' }, { j: 'イ', r: 'i', file: 'i.mp3' }, { j: 'ウ', r: 'u', file: 'u.mp3' }, { j: 'エ', r: 'e', file: 'e.mp3' }, { j: 'オ', r: 'o', file: 'o.mp3' },
                { j: 'カ', r: 'ka', file: 'ka.mp3' }, { j: 'キ', r: 'ki', file: 'ki.mp3' }, { j: 'ク', r: 'ku', file: 'ku.mp3' }, { j: 'ケ', r: 'ke', file: 'ke.mp3' }, { j: 'コ', r: 'ko', file: 'ko.mp3' },
                { j: 'サ', r: 'sa', file: 'sa.mp3' }, { j: 'シ', r: 'shi', file: 'shi.mp3' }, { j: 'ス', r: 'su', file: 'su.mp3' }, { j: 'セ', r: 'se', file: 'se.mp3' }, { j: 'ソ', r: 'so', file: 'so.mp3' },
                { j: 'タ', r: 'ta', file: 'ta.mp3' }, { j: 'チ', r: 'chi', file: 'chi.mp3' }, { j: 'ツ', r: 'tsu', file: 'tsu.mp3' }, { j: 'テ', r: 'te', file: 'te.mp3' }, { j: 'ト', r: 'to', file: 'to.mp3' },
                { j: 'ナ', r: 'na', file: 'na.mp3' }, { j: 'ニ', r: 'ni', file: 'ni.mp3' }, { j: 'ヌ', r: 'nu', file: 'nu.mp3' }, { j: 'ネ', r: 'ne', file: 'ne.mp3' }, { j: 'ノ', r: 'no', file: 'no.mp3' },
                { j: 'マ', r: 'ma', file: 'ma.mp3' }, { j: 'ミ', r: 'mi', file: 'mi.mp3' }, { j: 'ム', r: 'mu', file: 'mu.mp3' }, { j: 'メ', r: 'me', file: 'me.mp3' }, { j: 'モ', r: 'mo', file: 'mo.mp3' },
                { j: 'ヤ', r: 'ya', file: 'ya.mp3' }, { j: 'ユ', r: 'yu', file: 'yu.mp3' }, { j: 'ヨ', r: 'yo', file: 'yo.mp3' },
                { j: 'ラ', r: 'ra', file: 'ra.mp3' }, { j: 'リ', r: 'ri', file: 'ri.mp3' }, { j: 'ル', r: 'ru', file: 'ru.mp3' }, { j: 'レ', r: 're', file: 're.mp3' }, { j: 'ロ', r: 'ro', file: 'ro.mp3' },
                { j: 'ワ', r: 'wa', file: 'wa.mp3' }, { j: 'ヲ', r: 'wo', file: 'wo.mp3' }, { j: 'ン', r: 'n', file: 'n.mp3' }
            ],
            kanji: [
                { j: '一', r: 'ichi', file: 'kanji_ichi.mp3', mean: 'One' },
                { j: '二', r: 'ni', file: 'kanji_ni.mp3', mean: 'Two' },
                { j: '三', r: 'san', file: 'kanji_san.mp3', mean: 'Three' },
                { j: '日', r: 'nichi / hi', file: 'kanji_nichi.mp3', mean: 'Sun / Day' },
                { j: '月', r: 'getsu / tsuki', file: 'kanji_getsu.mp3', mean: 'Moon / Month' },
                { j: '木', r: 'moku / ki', file: 'kanji_moku.mp3', mean: 'Tree' },
                { j: '水', r: 'sui / mizu', file: 'kanji_sui.mp3', mean: 'Water' },
                { j: '火', r: 'ka / hi', file: 'kanji_ka.mp3', mean: 'Fire' },
                { j: '金', r: 'kin / kane', file: 'kanji_kin.mp3', mean: 'Gold / Money' },
                { j: '土', r: 'do / tsuchi', file: 'kanji_do.mp3', mean: 'Earth / Soil' }
            ],
            numbers: [
              { j: '一', r: 'ichi', file: 'num_1.mp3', mean: '1' },
              { j: '二', r: 'ni', file: 'num_2.mp3', mean: '2' },
              { j: '三', r: 'san', file: 'num_3.mp3', mean: '3' },
              { j: '四', r: 'yon / shi', file: 'num_4.mp3', mean: '4' },
              { j: '五', r: 'go', file: 'num_5.mp3', mean: '5' },
              { j: '六', r: 'roku', file: 'num_6.mp3', mean: '6' },
              { j: '七', r: 'nana / shichi', file: 'num_7.mp3', mean: '7' },
              { j: '八', r: 'hachi', file: 'num_8.mp3', mean: '8' },
              { j: '九', r: 'kyū', file: 'num_9.mp3', mean: '9' },
              { j: '十', r: 'jū', file: 'num_10.mp3', mean: '10' }
            ]
          };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <button className="btn" style={{ marginBottom: '20px', background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => navigateTo('learn')}>← Back to Curriculum</button>
      
      <div className="settings-section">
        <h2 style={{ marginBottom: '10px', color: 'var(--text-main)' }}>Level 1: Language Foundations 🎌</h2>
        <p style={{ color: 'var(--text-muted)' }}>Master the core scripts and learn to count in Japanese.</p>
      </div>

      <div className="settings-section">
        <div style={{ display: 'flex', gap: '10px', marginBottom: '30px', borderBottom: '1px solid var(--border-color)', paddingBottom: '20px' }}>
          {['hiragana', 'katakana', 'kanji', 'numbers'].map(tab => (
            <button 
              key={tab} 
              className={`btn ${activeTab === tab ? 'btn-primary' : ''}`} 
              style={{ borderRadius: '20px', textTransform: 'capitalize' }} 
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: '20px' }}>
          {(alphabetData[activeTab] || []).map((item, idx) => (
            <div key={idx} style={{ 
              background: 'var(--bg-card)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '16px', 
              padding: '20px', 
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              transition: 'transform 0.2s',
            }}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-5px)'}
            onMouseOut={(e) => e.currentTarget.style.transform = 'translateY(0)'}
            >
              <div style={{ fontSize: '2.5rem', fontWeight: 'bold', color: 'var(--text-main)', marginBottom: '5px' }}>{item.j}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.95rem', marginBottom: item.mean ? '5px' : 'auto' }}>{item.r}</div>
              {item.mean && <div style={{ color: 'var(--accent-color)', fontSize: '0.8rem', fontWeight: 'bold', marginBottom: 'auto' }}>{item.mean}</div>}
              
              <button 
                className="btn" 
                style={{ 
                  marginTop: '15px',
                  background: 'rgba(99, 102, 241, 0.1)', 
                  color: 'var(--accent-color)', 
                  borderRadius: '50%', 
                  width: '45px', 
                  height: '45px', 
                  margin: 'auto auto 0 auto', 
                  padding: 0,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '1px solid rgba(99, 102, 241, 0.2)'
                }} 
                onClick={() => playAudio(item.file)}
              >
                🔊
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* RESTORED ASSESSMENT SECTION */}
      <div style={{ 
        textAlign: 'center', 
        marginTop: '60px', 
        padding: '40px', 
        background: 'var(--bg-card)', 
        borderRadius: '16px', 
        border: '1px solid var(--border-color)' 
      }}>
        <h3 style={{ marginBottom: '15px', color: 'var(--text-main)' }}>Ready to test your Alphabet knowledge?</h3>
        <p style={{ color: 'var(--text-muted)', marginBottom: '25px' }}>Challenge yourself with the Level 1 Assessment.</p>
        <button 
          className="btn btn-primary" 
          style={{ padding: '14px 40px', fontSize: '1.1rem', borderRadius: '12px', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)' }} 
          onClick={() => { setQuizMode('level1'); navigateTo('assessment'); }}
        >
          📝 Take Level 1 Assessment
        </button>
      </div>
    </div>
  );
}