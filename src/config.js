// src/config.js

// Detect if running locally or on live web host
const IS_LOCAL = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// ⚠️ Replace this with your live Google Cloud Run URL once deployed!
const LIVE_BACKEND_DOMAIN = 'tenjin-backend-xyz.a.run.app'; 

export const HTTP_BASE_URL = IS_LOCAL 
  ? 'http://localhost:8000' 
  : `https://${LIVE_BACKEND_DOMAIN}`;

export const WS_BASE_URL = IS_LOCAL 
  ? 'ws://localhost:8000' 
  : `wss://${LIVE_BACKEND_DOMAIN}`;