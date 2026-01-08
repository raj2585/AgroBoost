import React from 'react'
import { useNavigate } from "react-router-dom";
import LanguageSelector from './LanguageSelector';
import img from '../assets/hero.jpg';

export default function Hero() {
  const navigate = useNavigate();
    
  const handleGetStarted = () => {
    navigate('/login');
  };
  
  return (
    <section className="relative bg-cover bg-center h-screen" 
      style={{ 
        backgroundImage: `linear-gradient(rgba(22, 101, 52, 0.75), rgba(22, 101, 52, 0.75)), 
                          url(${img})`
      }}
    >
      {/* Navigation Bar */}
      <nav className="absolute top-0 left-0 right-0 p-4">
        <div className="container mx-auto flex justify-between items-center">
          <h1 className="text-white text-2xl font-bold">AgroBoost</h1>
          <div className="flex items-center">
            <LanguageSelector />
            <button 
              onClick={() => navigate('/login')}
              className="ml-4 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors"
            >
              Login
            </button>
          </div>
        </div>
      </nav>
      
      <div className="relative z-10 flex flex-col items-center justify-center h-full text-center text-white px-4">
        <h1 className="text-4xl md:text-6xl font-bold">Empowering Farmers with AI-Driven Insights</h1>
        <p className="mt-4 text-lg md:text-xl">Real-time weather updates, market trends, and expert farming advice at your fingertips.</p>
        <button 
          className="mt-6 px-6 py-3 bg-green-600 hover:bg-green-700 rounded-lg text-white font-semibold"
          onClick={handleGetStarted}
        >
          Get Started
        </button>
      </div>
    </section>
  )
}
