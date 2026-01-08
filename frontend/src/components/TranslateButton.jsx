import React from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const TranslateButton = () => {
  const { currentLanguage } = useLanguage();
  
  // Function to directly translate the page using Google Translate API
  const forceTranslation = () => {
    // Create the translation function if it doesn't exist yet
    if (!window.googleTranslateDirectExecute) {
      window.googleTranslateDirectExecute = (lang) => {
        // Try to get the Google Translate element
        const selectElement = document.querySelector('.goog-te-combo');
        if (selectElement) {
          selectElement.value = lang;
          selectElement.dispatchEvent(new Event('change', { bubbles: true }));
          return true;
        }
        
        // If the element doesn't exist yet, try a cookie-based approach
        try {
          document.cookie = `googtrans=/en/${lang}`;
          window.location.reload();
          return true;
        } catch (e) {
          console.error('Translation failed:', e);
          return false;
        }
      };
    }
    
    // Only attempt to translate if not already in English
    if (currentLanguage !== 'en') {
      window.googleTranslateDirectExecute(currentLanguage);
    }
  };

  // Only show the button if not in English
  if (currentLanguage === 'en') {
    return null;
  }

  return (
    <button 
      onClick={forceTranslation}
      className="fixed bottom-5 right-5 bg-green-600 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-green-700 transition-colors z-50"
      aria-label="Translate page"
      title="Click here if translation didn't work automatically"
    >
      <span className="mr-2">🌐</span>
      Translate
    </button>
  );
};

export default TranslateButton;