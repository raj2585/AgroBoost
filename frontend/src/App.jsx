import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { LanguageProvider } from './contexts/LanguageContext';
import GTranslate from './components/GTranslate';
import TranslateButton from './components/TranslateButton';
import Home from './pages/home.jsx';
import './app.css';
import Login from './pages/login.jsx';
import Dashboard from './pages/dashboard.jsx';
import Profile from './pages/profile.jsx';
import Forum from './pages/chat.jsx';

function App() {
  return (
    <LanguageProvider>
      <GTranslate />
      <TranslateButton />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </BrowserRouter>
    </LanguageProvider>
  )
}

export default App
