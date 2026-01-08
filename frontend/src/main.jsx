import React, { useEffect } from 'react';
import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Setup Google Translate script before mounting the app
const setupGoogleTranslateScript = () => {
  // Add meta tag for Google Translation
  const meta = document.createElement('meta');
  meta.name = 'google';
  meta.content = 'notranslate';
  document.head.appendChild(meta);
};

// Initialize setup
setupGoogleTranslateScript();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
