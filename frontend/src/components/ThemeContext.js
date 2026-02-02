import React, { createContext, useEffect, useState } from 'react';

export const ThemeContext = createContext({
  theme: 'auto',
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState('auto');

  // Đọc theme từ localStorage hoặc prefers-color-scheme
  useEffect(() => {
    let t = localStorage.getItem('ks_theme');
    if (!t || t === 'auto') {
      // Tự động theo hệ điều hành
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    setThemeState(t);
    applyTheme(t);
  }, []);

  // Hàm áp dụng theme
  function applyTheme(t) {
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }

  // Khi theme thay đổi
  function setTheme(t) {
    setThemeState(t);
    localStorage.setItem('ks_theme', t);
    if (t === 'auto') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    applyTheme(t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}