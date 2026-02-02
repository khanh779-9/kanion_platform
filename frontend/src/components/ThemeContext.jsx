import React, {
  createContext,
  useEffect,
  useLayoutEffect,
  useState,
} from "react";

export const ThemeContext = createContext({
  theme: "auto",
  setTheme: () => {},
});

export function ThemeProvider({ children }) {
  function getSystemTheme() {
    if (typeof window !== "undefined" && window.matchMedia) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }
    return "light";
  }

  const [themePreference, setThemePreference] = useState(() => {
    const token = localStorage.getItem("ks_token");
    if (!token) return "light";
    return localStorage.getItem("ks_theme") || "auto";
  });

  // Resolve theme từ preference
  const theme = themePreference === "auto" ? getSystemTheme() : themePreference;

  // Áp dụng theme mỗi khi theme thay đổi
  useLayoutEffect(() => {
    const token = localStorage.getItem("ks_token");
    if (!token) {
      document.documentElement.classList.remove("dark");
      return;
    }
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
  }, [theme]);

  // Khi theme thay đổi từ context
  function setTheme(t) {
    setThemePreference(t);
    localStorage.setItem("ks_theme", t);
  }

  return (
    <ThemeContext.Provider value={{ theme, setTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}
