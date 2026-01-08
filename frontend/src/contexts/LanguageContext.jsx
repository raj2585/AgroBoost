import React, { createContext, useState, useContext, useEffect, useRef } from 'react';

// Available languages with their codes and display names
export const languages = [
  { code: 'en', name: 'English' },
  { code: 'hi', name: 'हिन्दी (Hindi)' },
  { code: 'mr', name: 'मराठी (Marathi)' },
  { code: 'te', name: 'తెలుగు (Telugu)' },
  { code: 'pa', name: 'ਪੰਜਾਬੀ (Punjabi)' },
  { code: 'ta', name: 'தமிழ் (Tamil)' },
  { code: 'kn', name: 'ಕನ್ನಡ (Kannada)' },
  { code: 'bn', name: 'বাংলা (Bengali)' },
];

// Create the context
const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  // Default to English or get from localStorage if available
  const [currentLanguage, setCurrentLanguage] = useState(() => {
    const savedLanguage = localStorage.getItem('agroboost-language');
    return savedLanguage || 'en';
  });

  // Maintain a reference to monitoring intervals
  const persistenceInterval = useRef(null);

  // Apply initial language on mount and set up persistence
  useEffect(() => {
    // Clear any existing interval
    if (persistenceInterval.current) {
      clearInterval(persistenceInterval.current);
    }

    // If we have a non-English language, apply it and keep it persistent
    if (currentLanguage !== 'en') {
      // Initial application after a delay
      const initialTranslationTimer = setTimeout(() => {
        applyTranslationFully(currentLanguage);
      }, 1500);
      
      // Set up continuous monitoring to keep translation persistent
      persistenceInterval.current = setInterval(() => {
        // Check if translation is still active by looking for Google Translate elements
        const hasTranslation = document.querySelector('.goog-te-menu-frame') || 
                              document.querySelector('.goog-te-banner-frame') || 
                              document.cookie.includes('googtrans');
                              
        // Re-apply translation if it seems to have been lost
        if (!hasTranslation && currentLanguage !== 'en') {
          console.log('Translation lost, reapplying...');
          applyTranslationFully(currentLanguage);
        }
      }, 3000); // Check every 3 seconds
      
      return () => {
        clearTimeout(initialTranslationTimer);
        clearInterval(persistenceInterval.current);
      };
    }
    
    return () => {
      if (persistenceInterval.current) {
        clearInterval(persistenceInterval.current);
      }
    };
  }, [currentLanguage]);
  
  // Apply translation with multiple methods to ensure it works
  const applyTranslationFully = (languageCode) => {
    console.log(`Applying translation to ${languageCode} with all methods`);
    
    // Method 1: Google Translate Element approach
    const selectElement = document.querySelector('.goog-te-combo');
    if (selectElement) {
      selectElement.value = languageCode;
      selectElement.dispatchEvent(new Event('change', { bubbles: true }));
    }
    
    // Method 2: Cookie-based approach (without page reload)
    try {
      const domain = location.hostname.split('.').slice(-2).join('.');
      document.cookie = `googtrans=/en/${languageCode}; path=/; domain=.${domain}`;
      document.cookie = `googtrans=/en/${languageCode}; path=/;`;
    } catch (e) {
      console.error('Error setting translation cookies:', e);
    }
    
    // Method 3: Force Google Translate through window interface
    try {
      if (window.google && window.google.translate && window.google.translate.TranslateElement) {
        window.google.translate.TranslateElement({
          pageLanguage: 'en',
          includedLanguages: languages.map(lang => lang.code).join(','),
          autoDisplay: true
        });
      }
    } catch (e) {
      console.error('Error with google.translate.TranslateElement:', e);
    }
    
    // Method 4: Look for auto-injected Google Translate functions
    try {
      if (window.doGTranslate) {
        window.doGTranslate(`en|${languageCode}`);
      }
    } catch (e) {
      console.error('Error with doGTranslate:', e);
    }
  };

  // Change language function
  const changeLanguage = (languageCode) => {
    setCurrentLanguage(languageCode);
    localStorage.setItem('agroboost-language', languageCode);
    
    console.log(`Changing language to: ${languageCode}`);
    
    // Skip further processing if English is selected (resets to default)
    if (languageCode === 'en') {
      // Try to reset translation
      try {
        const iframe = document.querySelector('.goog-te-banner-frame');
        if (iframe) {
          const iframeDocument = iframe.contentDocument || iframe.contentWindow.document;
          const resetButton = iframeDocument.querySelector('.goog-close-link');
          if (resetButton) {
            resetButton.click();
            return;
          }
        }
        
        // Alternative reset method
        if (document.cookie.indexOf('googtrans') > -1) {
          document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
          document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/; domain=.' + location.hostname;
          // Only reload if we had a translation cookie
          window.location.reload();
        }
      } catch (e) {
        console.error('Error resetting translation:', e);
      }
      return;
    }
    
    // For non-English languages, apply all translation methods
    applyTranslationFully(languageCode);
  };
  
  return (
    <LanguageContext.Provider value={{ 
      currentLanguage, 
      changeLanguage,
      languages 
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Custom hook for easy usage
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};