import React, { createContext, useEffect, useLayoutEffect, useState } from 'react';

export const ThemeContext = createContext({
  theme: 'auto',
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => {
    const token = localStorage.getItem('ks_token');
    if (!token) return 'light';
    let t = localStorage.getItem('ks_theme');
    if (!t || t === 'auto') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    return t;
  });

  // Áp dụng theme mỗi khi theme thay đổi
  useLayoutEffect(() => {
    const token = localStorage.getItem('ks_token');
    if (!token) {
      document.documentElement.classList.remove('dark');
      return;
    }
    let t = theme;
    if (t === 'auto') {
      t = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    if (t === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [theme]);

  // Khi theme thay đổi từ context
  function setTheme(t) {
    setThemeState(t);
    localStorage.setItem('ks_theme', t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
