import React, { useEffect, useRef } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

const GTranslate = () => {
  const { currentLanguage } = useLanguage();
  const translationAttempts = useRef(0);
  const isInitialized = useRef(false);

  // Track when Google Translate is ready
  const googleTranslateReady = useRef(false);

  useEffect(() => {
    // Immediately add CSS to hide the Google Translate top bar
    const hideTranslateBarStyle = document.createElement('style');
    hideTranslateBarStyle.innerHTML = `
      /* Hide Google Translate top bar */
      .skiptranslate iframe,
      .goog-te-banner-frame,
      #goog-gt-tt, 
      .goog-te-balloon-frame,
      div#goog-gt-,
      .goog-tooltip,
      .goog-tooltip:hover,
      .goog-te-banner-frame.skiptranslate {
        display: none !important;
        visibility: hidden !important;
      }
      
      /* Fix the body positioning that Google Translate modifies */
      body {
        top: 0 !important;
        position: static !important;
        min-height: 100vh !important;
      }
      
      /* Hide Google Translate's automatic popup elements */
      .goog-text-highlight {
        background-color: transparent !important;
        box-shadow: none !important;
        border: none !important;
      }
    `;
    document.head.appendChild(hideTranslateBarStyle);
    
    // Function to check if Google Translate is ready
    const checkGoogleTranslateReady = () => {
      return !!(
        document.querySelector('.goog-te-combo') || 
        window.google?.translate?.TranslateElement
      );
    };

    // Create translation function directly on window for global access
    window.applyGoogleTranslate = (langCode) => {
      console.log(`Direct translation triggered for: ${langCode}`);
      
      // Method 1: Use the select element directly
      const selectElement = document.querySelector('.goog-te-combo');
      if (selectElement) {
        selectElement.value = langCode;
        selectElement.dispatchEvent(new Event('change', { bubbles: true }));
        return true;
      }
      
      // Method 2: Use the doGTranslate function if available
      if (window.doGTranslate) {
        window.doGTranslate(`en|${langCode}`);
        return true;
      }
      
      // Method 3: Try cookie-based approach
      try {
        document.cookie = `googtrans=/en/${langCode}; path=/;`;
        return true;
      } catch (e) {
        console.error('Translation cookie setting failed:', e);
        return false;
      }
    };

    // Create a more direct translation approach using iframe
    const setupTranslation = () => {
      // Skip setup if already initialized
      if (isInitialized.current) return;
      
      // Remove any existing translation elements
      const existingFrame = document.getElementById('google_translate_element');
      if (existingFrame) {
        existingFrame.remove();
      }

      // Create container for Google Translate
      const translateContainer = document.createElement('div');
      translateContainer.id = 'google_translate_element';
      translateContainer.style.position = 'absolute';
      translateContainer.style.top = '-9999px';
      translateContainer.style.left = '-9999px';
      document.body.appendChild(translateContainer);

      // Set up Google Translate attributes in LocalStorage to prevent auto-reset
      if (currentLanguage !== 'en') {
        try {
          localStorage.setItem('googtrans', `/en/${currentLanguage}`);
        } catch (e) {
          console.error('Error setting localStorage for Google Translate:', e);
        }
      }

      // Load the Google Translate script directly
      const googleTranslateScript = document.createElement('script');
      googleTranslateScript.type = 'text/javascript';
      googleTranslateScript.innerHTML = `
        function googleTranslateElementInit() {
          new google.translate.TranslateElement({
            pageLanguage: 'en',
            includedLanguages: 'en,hi,mr,te,pa,ta,kn,bn',
            layout: google.translate.TranslateElement.InlineLayout.SIMPLE,
            autoDisplay: false,
            multilanguagePage: true,
            gaTrack: false
          }, 'google_translate_element');
          
          // Set a flag to indicate that Google Translate is fully initialized
          window.googleTranslateIsReady = true;
          
          // Additional fixes for Google Translate UI issues
          const additionalFixStyle = document.createElement('style');
          additionalFixStyle.textContent = 'body { top: 0 !important; position: static !important; }';
          document.head.appendChild(additionalFixStyle);
          
          // Set a cookie to prevent the banner from showing
          document.cookie = 'googtrans_nohud=1; path=/;';
          
          // Force hide the banner after a short delay
          setTimeout(() => {
            const banner = document.querySelector('.goog-te-banner-frame');
            if (banner) {
              banner.style.display = 'none';
              banner.style.visibility = 'hidden';
              banner.setAttribute('aria-hidden', 'true');
            }
            
            // Apply translation immediately after initialization if needed
            if (window.pendingLanguage && window.pendingLanguage !== 'en') {
              console.log("Applying pending language after init:", window.pendingLanguage);
              window.applyGoogleTranslate(window.pendingLanguage);
            }
          }, 300);
        }
      `;
      document.body.appendChild(googleTranslateScript);
      
      // Add the actual Google Translate API script if not already present
      if (!document.getElementById('google-translate-api')) {
        const script = document.createElement('script');
        script.id = 'google-translate-api';
        script.src = '//translate.google.com/translate_a/element.js?cb=googleTranslateElementInit';
        document.body.appendChild(script);
        
        // Set initialization flag
        isInitialized.current = true;
      }
    };

    // Set up the translation environment initially
    setupTranslation();
    
    // Apply translation after Google Translate has loaded
    const applyTranslation = () => {
      if (currentLanguage !== 'en') {
        console.log(`GTranslate attempting translation to: ${currentLanguage}`);
        translationAttempts.current += 1;
        
        // Store the pending language for post-initialization
        window.pendingLanguage = currentLanguage;
        
        // Check if Google Translate is ready
        if (checkGoogleTranslateReady()) {
          googleTranslateReady.current = true;
          
          // Use our direct translation function
          const success = window.applyGoogleTranslate(currentLanguage);
          
          if (success) {
            console.log(`Translation applied to: ${currentLanguage}`);
            translationAttempts.current = 0;
          } else if (translationAttempts.current < 5) {
            // Retry with exponential backoff
            const delay = Math.pow(2, translationAttempts.current) * 500;
            console.log(`Translation attempt failed, retrying in ${delay}ms`);
            setTimeout(applyTranslation, delay);
          }
        } else if (translationAttempts.current < 5) {
          // Google Translate not ready yet, retry
          console.log("Google Translate not ready, waiting...");
          setTimeout(applyTranslation, 1000);
        }
      }
    };
    
    // Allow time for Google Translate to load then apply translation
    const translationTimer = setTimeout(applyTranslation, 1000);
    
    // Continuous monitoring to hide the banner if it reappears
    const bannerMonitor = setInterval(() => {
      const banner = document.querySelector('.goog-te-banner-frame');
      if (banner) {
        banner.style.display = 'none';
        banner.style.visibility = 'hidden';
      }
      
      // Also fix the body positioning
      document.body.style.top = '0px';
      document.body.style.position = 'static';
      
      // Check if Google Translate became ready
      if (!googleTranslateReady.current && checkGoogleTranslateReady()) {
        googleTranslateReady.current = true;
        
        // Apply translation if we have a pending language
        if (currentLanguage !== 'en') {
          window.applyGoogleTranslate(currentLanguage);
        }
      }
    }, 1000);
    
    return () => {
      clearTimeout(translationTimer);
      clearInterval(bannerMonitor);
    };
  }, [currentLanguage]);

  return null; // This component doesn't render anything visible
};

export default GTranslate;