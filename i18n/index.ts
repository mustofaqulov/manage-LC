import React, { createContext, useState, ReactNode } from 'react';
import {
  Language,
  LANGUAGES,
  DEFAULT_LANGUAGE,
  getStoredLanguage,
  setStoredLanguage,
} from './languages';
import uz from './uz';
import en from './en';
import ru from './ru';
import { useTranslation } from './useTranslation';

export type { Language };
export { LANGUAGES, DEFAULT_LANGUAGE, useTranslation };

const translations = {
  uz,
  en,
  ru,
};

export interface I18nContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: typeof uz;
}

export const I18nContext = createContext<I18nContextType | undefined>(undefined);

interface I18nProviderProps {
  children: ReactNode;
}

export const I18nProvider: React.FC<I18nProviderProps> = ({ children }) => {
  // Initialize with stored language or default immediately
  const [language, setLanguageState] = useState<Language>(() => getStoredLanguage());

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    setStoredLanguage(lang);
  };

  return React.createElement(
    I18nContext.Provider,
    {
      value: {
        language,
        setLanguage,
        translations: translations[language],
      },
    },
    children,
  );
};
