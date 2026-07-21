// src/components/Level3.jsx
import React, { useState } from 'react';

// Sub-component for grammar sections with reveal logic
const GrammarSection = ({ title, desc, examples, color }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', padding: '25px', transition: 'all 0.3s' }}>
      <h3 style={{ color: 'var(--text-main)', marginBottom: '10px', fontSize: '1.3rem' }}>{title}</h3>
      <p style={{ color: 'var(--text-muted)', lineHeight: 1.6, marginBottom: '15px' }}>{desc}</p>
      
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          background: isOpen ? `${color}20` : 'rgba(255,255,255,0.03)',
          color: color,
          border: `1px solid ${color}40`,
          borderRadius: '8px',
          padding: '8px 15px',
          cursor: 'pointer',
          fontWeight: 600,
          fontSize: '0.9rem',
          transition: 'all 0.3s'
        }}
      >
        {isOpen ? '▲ Hide Examples' : '▼ View Examples'}
      </button>

      {isOpen && (
        <div style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {examples.map((ex, i) => (
            <div key={i} style={{ background: 'var(--bg-primary)', borderLeft: `4px solid ${color}`, padding: '15px', borderRadius: '0 8px 8px 0' }}>
              <p style={{ fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--text-main)' }}>{ex.j}</p>
              <p style={{ color: color, fontSize: '0.9rem', margin: '0 0 5px 0' }}>{ex.r}</p>
              <p style={{ fontSize: '0.9rem', color: 'var(--text-muted)' }}>{ex.e}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default function Level3({ navigateTo, setQuizMode }) {
  const [activeTab, setActiveTab] = useState('basic');

  const basicRules = [
    {
      title: "1. Sentence Order (SOV)",
      desc: "Japanese uses Subject-Object-Verb (SOV). The verb almost always comes at the very end.",
      color: "#9b59b6",
      examples: [
        { j: '私は りんごを 食べます。', r: 'Watashi wa ringo o tabemasu.', e: 'I eat an apple.' },
        { j: '田中さんは 本を 読みます。', r: 'Tanaka-san wa hon o yomimasu.', e: 'Mr. Tanaka reads a book.' }
      ]
    },
    {
      title: "2. The Copula 'Desu' (です)",
      desc: "'Desu' is equivalent to 'is/am/are'. It is attached to nouns/adjectives for politeness.",
      color: "#9b59b6",
      examples: [
        { j: 'これは ペン です。', r: 'Kore wa pen desu.', e: 'This is a pen.' },
        { j: '私は 学生 です。', r: 'Watashi wa gakusei desu.', e: 'I am a student.' },
        { j: '今日は 晴れ です。', r: 'Kyō wa hare desu.', e: 'Today is sunny.' }
      ]
    },
    {
      title: "3. Essential Particles (は, を, も)",
      desc: "Particles act as 'glue' to mark the function of words.",
      color: "#9b59b6",
      examples: [
        { j: '[は] 彼は 先生 です。', r: 'Kare wa sensei desu.', e: 'He is a teacher.' },
        { j: '[を] 音楽を 聞きます。', r: 'Ongaku o kikimasu.', e: 'I listen to music.' },
        { j: '[も] 私も 行きます。', r: 'Watashi mo ikimasu.', e: 'I will also go.' }
      ]
    },
    {
      title: "4. Forming Questions (か)",
      desc: "Simply add 'ka' to the end of a polite sentence to turn it into a question.",
      color: "#9b59b6",
      examples: [
        { j: '学生 です か？', r: 'Gakusei desu ka?', e: 'Are you a student?' },
        { j: '元気 です か？', r: 'Genki desu ka?', e: 'How are you?' },
        { j: '今 何時 です か？', r: 'Ima nanji desu ka?', e: 'What time is it now?' }
      ]
    }
  ];

  const advanceRules = [
    {
      title: "1. Verb Conjugation (Masu Form)",
      desc: "Conjugate to show tense and polarity. Verbs do not change based on the subject.",
      color: "#9b59b6",
      examples: [
        { j: '映画を 見ます。', r: 'Eiga o mimasu.', e: 'I will watch a movie.' },
        { j: '肉を 食べません。', r: 'Niku o tabemasen.', e: 'I do not eat meat.' },
        { j: '昨日は 働きませんでした。', r: 'Kinō wa hatarakimasen deshita.', e: 'I did not work yesterday.' }
      ]
    },
    {
      title: "2. Two Types of Adjectives (I vs Na)",
      desc: "I-adjectives end in 'i'. Na-adjectives connect to nouns with 'na'.",
      color: "#9b59b6",
      examples: [
        { j: '高い 車 です。', r: 'Takai kuruma desu.', e: 'Expensive car.' },
        { j: '昨日は 寒かったです。', r: 'Kinō wa samukatta desu.', e: 'It was cold yesterday.' },
        { j: '綺麗な 花 です。', r: 'Kirei na hana desu.', e: 'Beautiful flower.' }
      ]
    },
    {
      title: "3. Location Particles (に vs で)",
      desc: "'Ni' indicates destination/existence. 'De' indicates where an action occurs.",
      color: "#9b59b6",
      examples: [
        { j: '東京に 住んでいます。', r: 'Tōkyō ni sundeimasu.', e: 'I live in Tokyo.' },
        { j: 'コンビニに 行きます。', r: 'Konbini ni ikimasu.', e: 'Go to the convenience store.' },
        { j: '公園で 遊びます。', r: 'Kōen de asobimasu.', e: 'I play at the park.' }
      ]
    }
  ];

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', paddingBottom: '40px' }}>
      <button className="btn" style={{ marginBottom: '20px', background: 'transparent', border: '1px solid var(--border-color)' }} onClick={() => navigateTo('learn')}>← Back to Curriculum</button>
      
      <div className="settings-section">
        <h2 style={{ marginBottom: '15px', color: '#9b59b6' }}>Level 3: Grammar Syntax 🧩</h2>
        <p style={{ color: 'var(--text-muted)' }}>Master logical sentence structures, particles, and verb rules.</p>
      </div>

      <div style={{ display: 'flex', gap: '10px', marginBottom: '25px', borderBottom: '1px solid var(--border-color)', paddingBottom: '15px' }}>
        {['basic', 'advanced'].map(tab => (
          <button 
            key={tab} 
            className={`btn ${activeTab === tab ? 'btn-primary' : ''}`} 
            style={{ borderRadius: '20px', background: activeTab === tab ? '#9b59b6' : 'var(--bg-card)', border: 'none' }} 
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'basic' ? 'Basic Rules' : 'Advanced Rules'}
          </button>
        ))}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {activeTab === 'basic' 
          ? basicRules.map((r, i) => <GrammarSection key={i} {...r} />)
          : advanceRules.map((r, i) => <GrammarSection key={i} {...r} />)
        }
      </div>

      <div style={{ textAlign: 'center', marginTop: '60px', paddingTop: '20px', borderTop: '1px solid var(--border-color)' }}>
        <button 
          className="btn btn-primary" 
          style={{ padding: '14px 40px', background: '#9b59b6', borderRadius: '12px' }} 
          onClick={() => { setQuizMode('level3'); navigateTo('assessment'); }}
        >
          📝 Take Level 3 Assessment
        </button>
      </div>
    </div>
  );
}