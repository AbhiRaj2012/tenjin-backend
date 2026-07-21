// src/components/Settings.jsx
import React, { useState, useEffect } from 'react';

export default function Settings() {
  const [provider, setProvider] = useState('Google');
  const [apiKey, setApiKey] = useState('');
  const [cloudModel, setCloudModel] = useState('gemma-4-31b-it');
  const [showStatus, setShowStatus] = useState(false);

  useEffect(() => {
    setProvider(localStorage.getItem('tenjin_cloud_provider') || 'Google');
    setApiKey(localStorage.getItem('tenjin_api_key') || '');
    setCloudModel(localStorage.getItem('tenjin_cloud_model') || 'gemma-4-31b-it');
  }, []);

  const saveSettings = () => {
    localStorage.setItem('tenjin_cloud_provider', provider);
    localStorage.setItem('tenjin_api_key', apiKey.trim());
    localStorage.setItem('tenjin_cloud_model', cloudModel.trim());
    setShowStatus(true);
    setTimeout(() => setShowStatus(false), 2500);
  };

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', paddingBottom: '40px' }}>
      <h2 style={{ marginBottom: '8px', color: 'var(--text-main)' }}>Platform Configuration</h2>
      <p style={{ color: 'var(--text-muted)', marginBottom: '30px' }}>Connect Tenjin to your preferred cloud infrastructure ecosystem.</p>

      <div className="dashboard-card" style={{ margin: 0 }}>
        <h3 style={{ marginBottom: '20px' }}>☁️ Cloud Intelligence Core</h3>
        
        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Cloud Provider</label>
          <select 
            className="form-control" 
            style={{ width: '100%', padding: '12px', borderRadius: '8px' }} 
            value={provider} 
            onChange={(e) => setProvider(e.target.value)}
          >
            <option value="Google">Google AI Studio (Gemini/Gemma Native)</option>
            <option value="OpenAI">OpenAI / Groq Ecosystem</option>
          </select>
        </div>

        <div style={{ marginBottom: '20px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Secure Access Key</label>
          <input 
            type="password" 
            className="form-control" 
            style={{ width: '100%', padding: '12px', borderRadius: '8px' }} 
            value={apiKey} 
            onChange={(e) => setApiKey(e.target.value)} 
            placeholder="Paste token identity string..." 
          />
        </div>

        <div style={{ marginBottom: '30px' }}>
          <label style={{ display: 'block', marginBottom: '8px', fontSize: '0.9rem', color: 'var(--text-muted)' }}>Target Cloud Model Profile</label>
          <input 
            type="text" 
            className="form-control" 
            style={{ width: '100%', padding: '12px', borderRadius: '8px' }} 
            value={cloudModel} 
            onChange={(e) => setCloudModel(e.target.value)} 
          />
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <button className="btn btn-primary" style={{ padding: '12px 30px' }} onClick={saveSettings}>
            Apply Token Infrastructure
          </button>
          {showStatus && (
            <span style={{ color: 'var(--success-color)', fontWeight: 'bold' }}>✓ Credentials Cached</span>
          )}
        </div>
      </div>
    </div>
  );
}