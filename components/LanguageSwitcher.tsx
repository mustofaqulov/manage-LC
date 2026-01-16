import React from 'react';
import { useTranslation, LANGUAGES, type Language } from '../i18n';
import styles from './LanguageSwitcher.module.scss';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
  };

  return (
    <div className={styles.container}>
      {(Object.keys(LANGUAGES) as Language[]).map((lang) => (
        <button
          key={lang}
          onClick={() => handleLanguageChange(lang)}
          className={`${styles.button} ${language === lang ? styles.active : ''}`}
          title={LANGUAGES[lang].name}>
          {LANGUAGES[lang].label}
        </button>
      ))}
    </div>
  );
};

export default LanguageSwitcher;
