import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { appCopy, type AppLanguage } from "@/data/app-copy";

type LanguageContextValue = { language: AppLanguage; setLanguage: (language: AppLanguage) => void; t: (typeof appCopy)[AppLanguage] };
const LanguageContext = createContext<LanguageContextValue | null>(null);

export function AppLanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<AppLanguage>("en");

  useEffect(() => {
    const saved = localStorage.getItem("trucksaathi.language");
    if (saved === "en" || saved === "hi") setLanguageState(saved);
  }, []);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  function setLanguage(next: AppLanguage) {
    localStorage.setItem("trucksaathi.language", next);
    setLanguageState(next);
  }

  return <LanguageContext.Provider value={{ language, setLanguage, t: appCopy[language] }}>{children}</LanguageContext.Provider>;
}

export function useAppLanguage() {
  const value = useContext(LanguageContext);
  if (!value) throw new Error("useAppLanguage must be used inside AppLanguageProvider");
  return value;
}