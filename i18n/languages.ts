export type Language = 'uz' | 'en' | 'ru';

export const LANGUAGES = {
  uz: { name: "O'zbekcha", label: 'UZ', code: 'uz' },
  en: { name: 'English', label: 'EN', code: 'en' },
  ru: { name: 'Русский', label: 'RU', code: 'ru' },
} as const;

export const DEFAULT_LANGUAGE: Language = 'uz';
export const STORAGE_KEY = 'manage_lc_language';

export function getStoredLanguage(): Language {
  if (typeof window === 'undefined') return DEFAULT_LANGUAGE;

  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && (stored === 'uz' || stored === 'en' || stored === 'ru')) {
    return stored as Language;
  }
  return DEFAULT_LANGUAGE;
}

export function setStoredLanguage(lang: Language): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(STORAGE_KEY, lang);
  }
}
