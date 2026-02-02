import { createContext, useContext, useState, createElement } from 'react';
import vi from './vi.json';
import en from './en.json';

const LanguageContext = createContext();

const translations = {
  vi,
  en
};

export function LanguageProvider({ children }) {
  const [language, setLanguage] = useState(() => {
    
    return localStorage.getItem('language') || 'vi';
  });

  const changeLanguage = (lang) => {
    if (translations[lang]) {
      setLanguage(lang);
      localStorage.setItem('language', lang);
    }
  };

  return createElement(
    LanguageContext.Provider,
    { value: { language, changeLanguage, translations } },
    children
  );
}

export function useTranslate() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useTranslate must be used within LanguageProvider');
  }
  
  const { language, translations, changeLanguage } = context;
  const t = (key) => {
    const keys = key.split('.');
    let value = translations[language];
    
    for (const k of keys) {
      value = value?.[k];
    }
    
    return value || key;
  };

  return { t, language, changeLanguage };
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within LanguageProvider');
  }
  return context;
}
