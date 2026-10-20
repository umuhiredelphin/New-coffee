import { useState, useCallback } from "react";
import translations from "./i18n";

const LANG_KEY = "admin_lang";

export function useLanguage() {
  const [lang, setLangState] = useState(() => {
    return localStorage.getItem(LANG_KEY) || "en";
  });

  const setLang = useCallback((newLang) => {
    setLangState(newLang);
    localStorage.setItem(LANG_KEY, newLang);
  }, []);

  const t = translations[lang] || translations.en;

  return { lang, setLang, t, translations };
}

export function getT(lang) {
  return translations[lang] || translations.en;
}

export function getCurrentLang() {
  return localStorage.getItem(LANG_KEY) || "en";
}
