import { createContext, useContext, useEffect, useState, type ReactNode } from "react";

export type AppTheme = "dark" | "light";

type ThemeContextValue = { theme: AppTheme; setTheme: (theme: AppTheme) => void };
const ThemeContext = createContext<ThemeContextValue | null>(null);

export function AppThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setThemeState] = useState<AppTheme>("dark");

  useEffect(() => {
    const saved = localStorage.getItem("trucksaathi.theme");
    const nextTheme: AppTheme = saved === "light" ? "light" : "dark";
    document.documentElement.dataset.theme = nextTheme;
    setThemeState(nextTheme);
  }, []);

  function setTheme(nextTheme: AppTheme) {
    localStorage.setItem("trucksaathi.theme", nextTheme);
    document.documentElement.dataset.theme = nextTheme;
    setThemeState(nextTheme);
  }

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>;
}

export function useAppTheme() {
  const value = useContext(ThemeContext);
  if (!value) throw new Error("useAppTheme must be used inside AppThemeProvider");
  return value;
}
