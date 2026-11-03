import React, { createContext, useContext, useState, useEffect, useMemo } from 'react';
import {
  AppLanguage,
  LANGUAGE_OPTIONS,
  LanguageOption,
  UI_TRANSLATIONS,
  UIStrings,
} from '../i18n/translations';

interface LanguageContextValue {
  lang: AppLanguage;
  setLang: (next: AppLanguage) => void;
  locale: string;
  currentOption: LanguageOption;
  t: UIStrings;
}

const LanguageContext = createContext<LanguageContextValue>({
  lang: 'en',
  setLang: () => {},
  locale: 'en-US',
  currentOption: LANGUAGE_OPTIONS[0],
  t: UI_TRANSLATIONS.en,
});

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [lang, setLangState] = useState<AppLanguage>(() => {
    try {
      const saved = localStorage.getItem('orah_lang') as AppLanguage | null;
      if (saved && ['en', 'fr', 'es', 'ru'].includes(saved)) {
        return saved;
      }
    } catch {
      // ignore
    }
    return 'en';
  });

  const setLang = (next: AppLanguage) => {
    setLangState(next);
    try {
      localStorage.setItem('orah_lang', next);
    } catch {
      // ignore
    }
  };

  const currentOption = useMemo(
    () =>
      LANGUAGE_OPTIONS.find((opt) => opt.code === lang) || LANGUAGE_OPTIONS[0],
    [lang]
  );

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo<LanguageContextValue>(
    () => ({
      lang,
      setLang,
      locale: currentOption.locale,
      currentOption,
      t: UI_TRANSLATIONS[lang] || UI_TRANSLATIONS.en,
    }),
    [lang, currentOption]
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export function useLanguage(): LanguageContextValue {
  return useContext(LanguageContext);
}
