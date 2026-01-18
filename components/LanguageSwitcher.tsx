import React, { useState } from 'react';
import { useTranslation, LANGUAGES, type Language } from '../i18n';
import UZ from '../assets/images/uzb.svg';
import EN from '../assets/images/uk.svg';
import RU from '../assets/images/ru.svg';

export const LanguageSwitcher: React.FC = () => {
  const { language, setLanguage } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);

  const handleLanguageChange = (lang: Language) => {
    setLanguage(lang);
    setIsOpen(false);
  };

  const renderFlag = (lang: Language) => {
    if (lang === 'uz') {
      return <img className="w-full h-full object-cover" src={UZ} alt="" />;
    }

    if (lang === 'en') {
      return <img className="w-full h-full object-cover" src={EN} alt="" />;
    }

    if (lang === 'ru') {
      return <img className="w-full h-full object-cover" src={RU} alt="" />;
    }
  };

  return (
    <div className="relative h-[40px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative w-10 h-10 rounded-full bg-white/[0.06] backdrop-blur-xl border border-white/[0.1] hover:bg-white/[0.1] hover:border-white/20 transition-all duration-300 overflow-hidden group"
        title={LANGUAGES[language].name}>
        <div className="absolute inset-0 opacity-[0.015] mix-blend-overlay pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

        <div className="absolute inset-2  d-flex items-center justify-center rounded-full overflow-hidden ring-1 ring-white/20 shadow-sm">
          {renderFlag(language)}
        </div>
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-[90]" onClick={() => setIsOpen(false)} />

          <div className="absolute top-full right-0 mt-2 z-[100] animate-in fade-in slide-in-from-top-2 duration-200">
            <div className="absolute -inset-2 bg-black/20 blur-xl rounded-2xl" />

            <div className="relative min-w-[160px] p-2 rounded-2xl bg-white/[0.1] backdrop-blur-[30px] border border-white/[0.15] shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2),0_8px_32px_rgba(0,0,0,0.4)] overflow-hidden">
              <div className="absolute inset-0 opacity-[0.02] mix-blend-overlay pointer-events-none bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIzMDAiIGhlaWdodD0iMzAwIj48ZmlsdGVyIGlkPSJhIiB4PSIwIiB5PSIwIj48ZmVUdXJidWxlbmNlIGJhc2VGcmVxdWVuY3k9Ii43NSIgc3RpdGNoVGlsZXM9InN0aXRjaCIgdHlwZT0iZnJhY3RhbE5vaXNlIi8+PGZlQ29sb3JNYXRyaXggdHlwZT0ic2F0dXJhdGUiIHZhbHVlcz0iMCIvPjwvZmlsdGVyPjxwYXRoIGQ9Ik0wIDBoMzAwdjMwMEgweiIgZmlsdGVyPSJ1cmwoI2EpIiBvcGFjaXR5PSIuMDUiLz48L3N2Zz4=')]" />

              <div className="absolute top-0 left-4 right-4 h-[1px] bg-gradient-to-r from-transparent via-white/30 to-transparent" />

              <div className="relative space-y-0.5">
                <button
                  onClick={() => handleLanguageChange('uz')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    language === 'uz'
                      ? 'bg-white/[0.12] backdrop-blur-sm ring-1 ring-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]'
                      : 'hover:bg-white/[0.06] active:bg-white/[0.08]'
                  }`}
                  title={LANGUAGES.uz.name}>
                  <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/20 shadow-sm flex-shrink-0">
                    {renderFlag('uz')}
                  </div>
                  <span
                    className={`text-xs font-medium tracking-wide transition-colors ${
                      language === 'uz' ? 'text-white' : 'text-white/60 group-hover:text-white/80'
                    }`}>
                    {LANGUAGES.uz.name}
                  </span>
                  {language === 'uz' && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]" />
                  )}
                </button>

                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    language === 'en'
                      ? 'bg-white/[0.12] backdrop-blur-sm ring-1 ring-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]'
                      : 'hover:bg-white/[0.06] active:bg-white/[0.08]'
                  }`}
                  title={LANGUAGES.en.name}>
                  <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/20 shadow-sm flex-shrink-0">
                    {renderFlag('en')}
                  </div>
                  <span
                    className={`text-xs font-medium tracking-wide transition-colors ${
                      language === 'en' ? 'text-white' : 'text-white/60 group-hover:text-white/80'
                    }`}>
                    {LANGUAGES.en.name}
                  </span>
                  {language === 'en' && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]" />
                  )}
                </button>

                <button
                  onClick={() => handleLanguageChange('ru')}
                  className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-all duration-200 ${
                    language === 'ru'
                      ? 'bg-white/[0.12] backdrop-blur-sm ring-1 ring-white/20 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.2)]'
                      : 'hover:bg-white/[0.06] active:bg-white/[0.08]'
                  }`}
                  title={LANGUAGES.ru.name}>
                  <div className="w-6 h-6 rounded-full overflow-hidden ring-1 ring-white/20 shadow-sm flex-shrink-0">
                    {renderFlag('ru')}
                  </div>
                  <span
                    className={`text-xs font-medium tracking-wide transition-colors ${
                      language === 'ru' ? 'text-white' : 'text-white/60 group-hover:text-white/80'
                    }`}>
                    {LANGUAGES.ru.name}
                  </span>
                  {language === 'ru' && (
                    <div className="ml-auto w-1.5 h-1.5 rounded-full bg-orange-400 shadow-[0_0_8px_rgba(251,146,60,0.6)]" />
                  )}
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default LanguageSwitcher;
