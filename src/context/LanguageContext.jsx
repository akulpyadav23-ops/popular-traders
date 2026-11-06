import React, { createContext, useContext, useState } from 'react';
import { translations } from '../i18n/translations';

const LanguageContext = createContext();

export const useLanguage = () => {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
};

export const LanguageProvider = ({ children }) => {
  const [lang, setLang] = useState(() => localStorage.getItem('populartraders_lang') || 'en');

  const setLanguage = (newLang) => {
    setLang(newLang);
    localStorage.setItem('populartraders_lang', newLang);
  };

  const toggleLanguage = (newLang) => {
    if (newLang) {
      setLanguage(newLang);
    } else {
      const order = ['en', 'kn', 'hi'];
      const next = order[(order.indexOf(lang) + 1) % order.length];
      setLanguage(next);
    }
  };

  const t = (key) => translations[lang]?.[key] || translations['en']?.[key] || key;

  return (
    <LanguageContext.Provider value={{ lang, setLanguage, toggleLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};
