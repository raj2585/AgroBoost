import React from 'react';
import { useLanguage, languages } from '../contexts/LanguageContext';

const LanguageDropdown = () => {
  const { currentLanguage, changeLanguage } = useLanguage();

  const handleLanguageChange = (e) => {
    const newLanguage = e.target.value;
    console.log(`LanguageDropdown: Changing language to ${newLanguage}`);
    
    // Update language in context
    changeLanguage(newLanguage);
    
    // Direct translation trigger
    if (window.applyGoogleTranslate && newLanguage !== 'en') {
      setTimeout(() => {
        console.log('Directly triggering translation from dropdown');
        window.applyGoogleTranslate(newLanguage);
      }, 100);
    }
  };

  return (
    <select
      value={currentLanguage}
      onChange={handleLanguageChange}
      className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
      aria-label="Select language"
    >
      {languages.map((language) => (
        <option key={language.code} value={language.code}>
          {language.name}
        </option>
      ))}
    </select>
  );
};

export default LanguageDropdown;