import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { WORLD_LANGUAGES, LanguageItem } from '../data/languages';
import { TranslationKey, getLocalizedText } from '../data/translations';
import { triggerGoogleTranslate, translateDomTextNodes } from '../utils/domTranslator';

interface LanguageContextType {
  currentLanguage: LanguageItem;
  setLanguage: (code: string) => void;
  t: (key: TranslationKey, fallback?: string) => string;
  isRtl: boolean;
  availableLanguages: LanguageItem[];
}

const STORAGE_KEY = 'rasid_selected_language';

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [selectedCode, setSelectedCode] = useState<string>(() => {
    try {
      return localStorage.getItem(STORAGE_KEY) || 'ar';
    } catch {
      return 'ar';
    }
  });

  const currentLanguage =
    WORLD_LANGUAGES.find((l) => l.code === selectedCode) || WORLD_LANGUAGES[0];

  const isRtl = currentLanguage.dir === 'rtl';

  // Synchronize document dir, lang, and classes whenever language changes
  useEffect(() => {
    try {
      document.documentElement.dir = currentLanguage.dir;
      document.documentElement.lang = currentLanguage.code;
      
      // Update body or root font or direction hints
      if (currentLanguage.dir === 'ltr') {
        document.body.classList.add('app-ltr');
        document.body.classList.remove('app-rtl');
      } else {
        document.body.classList.add('app-rtl');
        document.body.classList.remove('app-ltr');
      }

      localStorage.setItem(STORAGE_KEY, currentLanguage.code);

      // Trigger full website translation via Google Translate
      triggerGoogleTranslate(currentLanguage.code);

      // Also trigger client-side DOM text node translation
      setTimeout(() => {
        translateDomTextNodes(currentLanguage.code);
      }, 60);
    } catch (e) {
      console.warn('Failed to update language settings in DOM', e);
    }
  }, [currentLanguage]);

  const setLanguage = useCallback((code: string) => {
    const found = WORLD_LANGUAGES.find((l) => l.code === code);
    if (found) {
      setSelectedCode(found.code);
    }
  }, []);

  const t = useCallback(
    (key: TranslationKey, fallback: string = ''): string => {
      return getLocalizedText(currentLanguage.code, key, fallback);
    },
    [currentLanguage.code]
  );

  return (
    <LanguageContext.Provider
      value={{
        currentLanguage,
        setLanguage,
        t,
        isRtl,
        availableLanguages: WORLD_LANGUAGES
      }}
    >
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
