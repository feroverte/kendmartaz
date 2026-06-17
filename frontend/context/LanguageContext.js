"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";

const LanguageContext = createContext();

function getCookie(name) {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp(`(?:^|; )${name}=([^;]*)`));
  return match ? decodeURIComponent(match[1]) : null;
}

function setCookie(name, value, days = 365) {
  if (typeof document === "undefined") return;
  document.cookie = `${name}=${encodeURIComponent(value)}; path=/; max-age=${days * 86400}`;
}

export function LanguageProvider({ children }) {
  const [locale, setLocaleState] = useState("en");

  useEffect(() => {
    const saved = getCookie("kendmart_locale");
    if (saved === "az" || saved === "en") setLocaleState(saved);
  }, []);

  const setLocale = useCallback((l) => {
    setLocaleState(l);
    setCookie("kendmart_locale", l);
    if (typeof document !== "undefined") {
      document.documentElement.lang = l;
    }
  }, []);

  const toggleLocale = useCallback(() => {
    setLocale(locale === "en" ? "az" : "en");
  }, [locale, setLocale]);

  return (
    <LanguageContext.Provider value={{ locale, setLocale, toggleLocale }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLocale() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLocale must be used within LanguageProvider");
  return ctx;
}

export { LanguageContext };
