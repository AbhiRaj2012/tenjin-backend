import React, { useState, useEffect, useRef } from 'react';
import AvatarCanvas from './AvatarCanvas';
import { WS_BASE_URL } from '../config';
import { lipsyncManager } from '../App';

const globalAudio = new Audio();
let isLipsyncConnected = false; 

// 1. Scenarios configured with background image paths
const SCENARIOS = [
  { 
    id: 'free', 
    label: '🎌 Free Style', 
    intro: 'Konnichiwa! I am Nanami. What would you like to talk about today?',
    bg: '/assets/images/scenarios/default.jpg' // Fallback / default background
  },
  { 
    id: 'restaurant', 
    label: '🍜 Restaurant', 
    intro: 'Irasshaimase! Welcome to our restaurant. Are you ready to order?',
    bg: '/assets/images/scenarios/restaurant.jpg'
  },
  { 
    id: 'directions', 
    label: '📍 Directions', 
    intro: 'Sumimasen! You look a bit lost near Shibuya Station. Need help finding a place?',
    bg: '/assets/images/scenarios/directions.jpg'
  },
  { 
    id: 'konbini', 
    label: '🏪 Konbini', 
    intro: 'Irasshaimase! Welcome to the convenience store.',
    bg: '/assets/images/scenarios/konbini.jpg'
  }
];

export default function ChatPanel() {
  const [currentScenario, setCurrentScenario] = useState('free');
  
  const [userId] = useState(() => {
      let id = localStorage.getItem('tenjin_user_id');
      if (!id) {
          id = 'student_' + Math.random().toString(36).substr(2, 9);
          localStorage.setItem('tenjin_user_id', id);
      }
      return id;
  });

  const [messages, setMessages] = useState(() => {
      const savedUI = localStorage.getItem('tenjin_chat_ui');
      if (savedUI) return JSON.parse(savedUI);
      return [{ role: "assistant", content: SCENARIOS[0].intro }];
  });

  const [inputText, setInputText] = useState('');
  const [isRecording, setIsRecording] = useState(false);
  const [imageBase64, setImageBase64] = useState(null);
  const [inputLang, setInputLang] = useState('en-US'); 
  const [avatarState, setAvatarState] = useState('idle'); 
  const [avatarText, setAvatarText] = useState('Connecting to Tenjin Core...');
  
  const chatWindowRef = useRef(null);
  const fileInputRef = useRef(null);
  const recognitionRef = useRef(null);
  const wsRef = useRef(null);

  useEffect(() => {
      localStorage.setItem('tenjin_chat_ui', JSON.stringify(messages));
  }, [messages]);

  const playAudioBase64 = (base64) => {
    if (!base64) return;
    const newSrc = "data:audio/mp3;base64," + base64;

    if (globalAudio.src.endsWith(base64) && !globalAudio.paused) {
        globalAudio.pause();
        setAvatarState('idle');
        return; 
    }

    globalAudio.pause();
    globalAudio.src = newSrc; 
    
    if (!isLipsyncConnected) {
        lipsyncManager.connectAudio(globalAudio);
        isLipsyncConnected = true;
    }
    
    if (lipsyncManager.audioContext && lipsyncManager.audioContext.state === 'suspended') {
        lipsyncManager.audioContext.resume();
    }
    
    setAvatarState('talking');
    setAvatarText('Speaking...');
    
    globalAudio.onended = () => {
        setAvatarState('idle');
        setAvatarText('Ready.');
    };

    globalAudio.play().catch(e => console.error("Playback error:", e));
  };

  useEffect(() => {
    // Replaced 'ws://localhost:8000' with dynamic WS_BASE_URL
    const ws = new WebSocket(`${WS_BASE_URL}/?userId=${userId}`);
    wsRef.current = ws;

    ws.onopen = () => {
      setAvatarText('Ready.');
    };

    // --- ADD THIS MISSING MESSAGE LISTENER ---
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data);

        // 1. Handle Errors (e.g. Rate limits, API failures)
        if (data.status === 'error') {
          setAvatarState('idle');
          setAvatarText('Ready.');
          alert(data.message || 'Processing failed.');
          return;
        }

        // 2. Handle Successful AI Response
        if (data.status === 'speaking') {
          const assistantMsg = {
            role: "assistant",
            content: data.text,
            audioBase64: data.audio_base64,
            flashcards: data.flashcards_added
          };

          // Append Nanami's reply to the message history
          setMessages(prev => [...prev, assistantMsg]);

          // Play TTS Audio if generated, otherwise return avatar to idle
          if (data.audio_base64) {
            playAudioBase64(data.audio_base64);
          } else {
            setAvatarState('idle');
            setAvatarText('Ready.');
          }
        }
      } catch (err) {
        console.error("Failed to parse incoming WebSocket message:", err);
        setAvatarState('idle');
        setAvatarText('Ready.');
      }
    };

    // Cleanup connection on unmount
    return () => {
      if (ws.readyState === 1) ws.close();
    };
  }, [userId]);

  useEffect(() => {
    if (chatWindowRef.current) chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
  }, [messages, avatarState, imageBase64]);

  // 2. Clean Scenario Switching without UI text clutter
  const handleSelectScenario = (scenario) => {
      if (scenario.id === currentScenario) return;
      setCurrentScenario(scenario.id);
      setMessages(prev => [
          ...prev, 
          { role: "assistant", content: scenario.intro }
      ]);
  };

  const toggleVoiceInput = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) return alert("Speech recognition is only supported in Chrome/Edge.");

    if (isRecording) {
      if (recognitionRef.current) recognitionRef.current.stop();
      setIsRecording(false);
      return;
    }

    try {
      const recognition = new SpeechRecognition();
      recognition.lang = inputLang; 
      recognition.interimResults = true;
      recognitionRef.current = recognition;

      setIsRecording(true);
      setAvatarText(`Listening in ${inputLang === 'en-US' ? 'English' : 'Japanese'}...`);

      recognition.onresult = (event) => {
        let resultText = '';
        for (let i = event.resultIndex; i < event.results.length; ++i) {
          resultText += event.results[i][0].transcript;
        }
        setInputText(resultText);
      };

      recognition.onend = () => {
        setIsRecording(false);
        setAvatarText("Ready.");
      };
      
      recognition.start();
    } catch (e) {
      console.error(e);
      setIsRecording(false);
    }
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      setImageBase64(event.target.result);
      setTimeout(() => { if (chatWindowRef.current) chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight; }, 100);
    };
    reader.readAsDataURL(file);
    e.target.value = ''; 
  };

  const sendMessage = () => {
    if (!inputText.trim() && !imageBase64) return;
    if (!wsRef.current || wsRef.current.readyState !== 1) return alert("WebSocket disconnected.");

    const userMsg = { role: "user", content: inputText, image: imageBase64 };
    setMessages(prev => [...prev, userMsg]);
    
    const payload = {
      message: inputText.trim(),
      image_data: imageBase64,
      scenario: currentScenario,
      api_key: localStorage.getItem('tenjin_api_key') || '',
      cloud_model: localStorage.getItem('tenjin_cloud_model') || 'gemma-4-31b-it'
    };
    
    wsRef.current.send(JSON.stringify(payload));
    setInputText('');
    setImageBase64(null);
    setAvatarState('thinking');
    setAvatarText('Nanami is thinking...');
  };

  // Find the active scenario object to get its background path
  const activeScenarioObj = SCENARIOS.find(s => s.id === currentScenario) || SCENARIOS[0];

  return (
    <div style={{ display: 'flex', gap: '25px', height: 'calc(100vh - 160px)', maxWidth: '1200px', margin: '0 auto' }}>
      
      {/* --- LEFT: CHAT CONTAINER --- */}
      <div style={{ flex: 2, display: 'flex', flexDirection: 'column', background: 'var(--bg-card)', border: '1px solid var(--border-color)', borderRadius: '16px', overflow: 'hidden', position: 'relative' }}>
        
        {/* --- SCENARIO SELECTOR BAR --- */}
        <div style={{ padding: '12px 20px', background: 'var(--bg-card)', borderBottom: '1px solid var(--border-color)', display: 'flex', gap: '10px', alignItems: 'center', overflowX: 'auto' }}>
          
          {/* Added Label */}
          <span style={{ color: 'var(--text-muted)', fontWeight: 'bold', fontSize: '0.9rem', marginRight: '5px', whiteSpace: 'nowrap' }}>
            Scenarios:
          </span>

          {SCENARIOS.map(sc => (
            <button
              key={sc.id}
              onClick={() => handleSelectScenario(sc)}
              style={{
                padding: '6px 14px',
                borderRadius: '20px',
                border: 'none',
                background: currentScenario === sc.id ? 'var(--accent-color)' : 'var(--bg-primary)',
                color: currentScenario === sc.id ? 'white' : 'var(--text-muted)',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease'
              }}
            >
              {sc.label}
            </button>
          ))}
        </div>

        {/* --- MESSAGES STREAM --- */}
        <div ref={chatWindowRef} style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '15px', background: 'var(--bg-primary)' }}>
          {messages.map((msg, i) => (
            <div key={i} style={{ display: 'flex', gap: '12px', alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', flexDirection: msg.role === 'user' ? 'row-reverse' : 'row', maxWidth: '80%' }}>
              
              <div style={{ background: 'var(--accent-color)', color: 'white', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', flexShrink: 0, overflow: 'hidden' }}>
                {msg.role === 'user' ? '👤' : (
                  <img 
                    src="/assets/images/nanami_icon.png" 
                    alt="Nanami" 
                    onError={(e) => { e.target.style.display='none'; e.target.parentNode.innerText='奈'; }}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }} 
                  />
                )}
              </div>
              
              <div style={{ background: msg.role === 'user' ? 'var(--accent-color)' : 'var(--bg-card)', border: '1px solid var(--border-color)', color: msg.role === 'user' ? 'white' : 'var(--text-main)', padding: '14px 18px', borderRadius: msg.role === 'user' ? '15px 15px 0 15px' : '15px 15px 15px 0', width: '100%', lineHeight: 1.6 }}>
                
                {msg.image && (
                  <img src={msg.image} style={{ maxWidth: '200px', borderRadius: '8px', marginBottom: '8px', display: 'block', border: '2px solid rgba(255,255,255,0.3)' }} alt="Context upload" />
                )}
                
                {typeof msg.content === 'string' 
                  ? msg.content.split('\n').map((line, idx) => (
                      <React.Fragment key={idx}>
                        {line}
                        <br />
                      </React.Fragment>
                    )) 
                  : "⚠️ Received unreadable data format."
                }

                {/* --- RENDER AUDIO BUTTON --- */}
                {msg.role === 'assistant' && msg.audioBase64 && (
                  <div style={{ textAlign: 'right', marginTop: '10px' }}>
                    <button 
                      onClick={() => playAudioBase64(msg.audioBase64)} 
                      style={{ background: 'rgba(230, 126, 34, 0.1)', color: 'var(--accent-color)', border: 'none', borderRadius: '50%', width: '34px', height: '34px', cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                      title="Listen to audio"
                    >
                      🔊
                    </button>
                  </div>
                )}

                {/* --- RENDER NEW FLASHCARD NOTIFICATIONS --- */}
                {msg.role === 'assistant' && msg.flashcards && msg.flashcards.length > 0 && (
                  <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '6px', fontWeight: 'bold' }}>
                      💾 New Vocabulary Saved:
                    </p>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      {msg.flashcards.map((word, idx) => (
                        <div key={idx} style={{ background: 'rgba(46, 204, 113, 0.15)', border: '1px solid #2ecc71', color: '#2ecc71', padding: '4px 10px', borderRadius: '12px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <span style={{ fontWeight: 'bold' }}>{word.japanese}</span> 
                          <span style={{ opacity: 0.7 }}>({word.romaji})</span> 
                          <span>- {word.english}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
              </div>
            </div>
          ))}

          {/* Upload Image Preview Box */}
          {imageBase64 && (
            <div style={{ alignSelf: 'flex-end', position: 'relative', marginTop: '10px', padding: '10px', background: 'rgba(255,255,255,0.05)', borderRadius: '12px', border: '1px dashed var(--accent-color)' }}>
              <img src={imageBase64} alt="Upload Preview" style={{ height: '80px', borderRadius: '8px' }} />
              <button 
                onClick={() => setImageBase64(null)}
                style={{ position: 'absolute', top: '-5px', right: '-5px', background: '#e74c3c', color: 'white', border: 'none', borderRadius: '50%', width: '24px', height: '24px', cursor: 'pointer', fontWeight: 'bold', fontSize: '12px', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.3)' }}
              >✕</button>
            </div>
          )}

          {avatarState === 'thinking' && (
            <div style={{ alignSelf: 'flex-start', background: 'var(--bg-card)', border: '1px solid var(--border-color)', padding: '10px 15px', borderRadius: '8px', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
              Nanami is thinking...
            </div>
          )}
        </div>



        {/* --- FULL INPUT CONTROL BAR --- */}
        <div style={{ padding: '15px', background: 'var(--bg-card)', borderTop: '1px solid var(--border-color)', display: 'flex', gap: '8px', alignItems: 'center' }}>
          
          <input type="file" ref={fileInputRef} accept="image/*" style={{ display: 'none' }} onChange={handleImageUpload} />
          <button className="btn" style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '50%', width: '45px', height: '45px', padding: 0 }} onClick={() => fileInputRef.current.click()} title="Upload Image">
            📷
          </button>
          
          <button 
            className="btn" 
            style={{ background: 'var(--bg-primary)', border: '1px solid var(--border-color)', borderRadius: '8px', padding: '0 8px', height: '45px', fontSize: '12px', fontWeight: 'bold', color: 'var(--text-main)', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '55px' }} 
            onClick={() => setInputLang(prev => prev === 'en-US' ? 'ja-JP' : 'en-US')}
            title="Toggle Input Language"
          >
            {inputLang === 'en-US' ? '🇺🇸 EN' : '🇯🇵 JA'}
          </button>

          <button className={`btn ${isRecording ? 'recording-active' : ''}`} style={{ background: isRecording ? 'rgba(231, 76, 60, 0.1)' : 'var(--bg-primary)', border: isRecording ? '1px solid #e74c3c' : '1px solid var(--border-color)', borderRadius: '50%', width: '45px', height: '45px', padding: 0 }} onClick={toggleVoiceInput} title="Record Audio">
            {isRecording ? '🛑' : '🎙️'}
          </button>
          
          <div style={{ flex: 1, position: 'relative' }}>
            <input 
              type="text" 
              className="form-control" 
              style={{ width: '100%', borderRadius: '25px', padding: '12px 20px', background: 'var(--bg-primary)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }} 
              placeholder={isRecording ? `Listening in ${inputLang === 'en-US' ? 'English' : 'Japanese'}...` : "Type your message..."} 
              value={inputText} 
              onChange={(e) => setInputText(e.target.value)} 
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()} 
              disabled={isRecording} 
            />
          </div>
          
          <button className="btn btn-primary" style={{ borderRadius: '50%', width: '45px', height: '45px', padding: 0 }} onClick={sendMessage}>
            ➤
          </button>
        </div>

      </div>

      {/* --- RIGHT: DYNAMIC AVATAR PANEL --- */}
      <div style={{ 
        flex: 1, 
        background: 'var(--bg-card)', 
        border: '1px solid var(--border-color)', 
        borderRadius: '16px', 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        padding: '20px', 
        position: 'relative'
      }}>
        
        {/* THIS is where the dynamic background lives! */}
        <div style={{ 
          flex: 1, 
          width: '100%', 
          display: 'flex', 
          justifyContent: 'center', 
          alignItems: 'center',
          borderRadius: '12px',
          overflow: 'hidden',
          background: `linear-gradient(to bottom, rgba(0,0,0,0) 70%, rgba(15, 23, 42, 0.6) 100%), url('${activeScenarioObj.bg}') center/cover no-repeat, var(--bg-primary)`,
          transition: 'background 0.4s ease-in-out'
        }}>
           <AvatarCanvas avatarState={avatarState} />
        </div>
        
        <div style={{ width: '100%', textAlign: 'center', marginTop: '15px', background: 'var(--bg-primary)', padding: '10px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
          <p style={{ fontWeight: 'bold', margin: '0 0 4px 0', color: 'var(--text-main)' }}>Nanami</p>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>{avatarText}</p>
        </div>

      </div>

    </div>
  );
}