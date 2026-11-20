import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Globe, ChevronDown, Search, Check, X, Sparkles } from 'lucide-react';
import { WORLD_LANGUAGES, LanguageItem } from '../data/languages';
import { useLanguage } from '../context/LanguageContext';

interface LanguageSelectorProps {
  className?: string;
  onLanguageChange?: (lang: LanguageItem) => void;
}

export const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  className = '',
  onLanguageChange
}) => {
  const { currentLanguage, setLanguage, t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notification, setNotification] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const selectedCode = currentLanguage.code;

  // Filter languages by search query
  const filteredLanguages = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return WORLD_LANGUAGES;
    return WORLD_LANGUAGES.filter(
      (l) =>
        l.name.toLowerCase().includes(q) ||
        l.nameAr.toLowerCase().includes(q) ||
        l.code.toLowerCase().includes(q) ||
        (l.region && l.region.toLowerCase().includes(q))
    );
  }, [searchQuery]);

  // Handle outside click & escape key
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
      document.addEventListener('keydown', handleKeyDown);
      // Auto-focus search input
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 50);
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  // Handle selecting a language
  const handleSelectLanguage = (lang: LanguageItem) => {
    setLanguage(lang.code);

    // Call external handler if provided
    onLanguageChange?.(lang);

    // Show quick feedback notification
    setNotification(lang.code === 'ar' ? 'تم اختيار: العربية 🇸🇦' : `Language: ${lang.name} (${lang.nameAr})`);
    setTimeout(() => {
      setNotification(null);
    }, 2800);

    setIsOpen(false);
    setSearchQuery('');
  };

  return (
    <div className={`relative ${className}`} ref={containerRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="flex items-center gap-1.5 sm:gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-700/80 bg-white dark:bg-slate-800/90 text-slate-700 dark:text-slate-200 hover:border-indigo-400 dark:hover:border-indigo-500 hover:bg-slate-50 dark:hover:bg-slate-800 text-xs font-semibold shadow-2xs transition-all cursor-pointer focus:outline-hidden focus:ring-2 focus:ring-indigo-500/30"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        title={`اختر لغة الموقع والتقارير (${WORLD_LANGUAGES.length} لغة عالمية متوفرة)`}
      >
        <span className="text-sm select-none" role="img" aria-label={currentLanguage.name}>
          {currentLanguage.flag}
        </span>
        <span className="font-bold tracking-tight max-w-[85px] sm:max-w-[110px] truncate text-slate-800 dark:text-slate-100">
          {currentLanguage.name}
        </span>
        <ChevronDown
          className={`w-3.5 h-3.5 text-slate-400 dark:text-slate-500 transition-transform duration-200 ${
            isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
          }`}
        />
      </button>

      {/* Temporary Toast feedback banner right next to selector */}
      {notification && (
        <div className="absolute top-full mt-2 right-0 sm:right-auto sm:left-0 z-50 bg-indigo-900 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg shadow-lg flex items-center gap-1.5 animate-in fade-in slide-in-from-top-1 whitespace-nowrap border border-indigo-700">
          <Check className="w-3.5 h-3.5 text-emerald-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* Popover Dropdown Menu */}
      {isOpen && (
        <div
          role="listbox"
          className="absolute left-0 sm:left-auto right-auto sm:right-0 mt-2 w-72 sm:w-80 max-w-[90vw] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-150"
        >
          {/* Header */}
          <div className="p-3 border-b border-slate-100 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-900/80 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-1 rounded-lg bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400">
                <Globe className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                  اللغات العالمية
                </h4>
                <p className="text-[10px] text-slate-500 dark:text-slate-400">
                  {WORLD_LANGUAGES.length} لغة عالمية مدعومة
                </p>
              </div>
            </div>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-200/70 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
              {filteredLanguages.length} / {WORLD_LANGUAGES.length}
            </span>
          </div>

          {/* Search Input Bar */}
          <div className="p-2.5 border-b border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900">
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="ابحث عن لغة أو دولة (مثل: فرنسية، Türkçe)..."
                className="w-full text-xs pr-8 pl-8 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5 rounded-md"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Quick Filter: Arabic Pin if not searched */}
          {!searchQuery && selectedCode !== 'ar' && (
            <div className="px-2.5 pt-2 pb-1 bg-amber-50/50 dark:bg-amber-950/20 border-b border-amber-100 dark:border-amber-900/30">
              <button
                type="button"
                onClick={() => handleSelectLanguage(WORLD_LANGUAGES[0])}
                className="w-full text-right flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-amber-100/70 dark:bg-amber-900/40 hover:bg-amber-200/70 dark:hover:bg-amber-900/60 text-amber-900 dark:text-amber-200 text-xs font-bold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="text-base">🇸🇦</span>
                  <span>العودة إلى اللغة العربية (الأساسية)</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded-sm bg-amber-200 dark:bg-amber-800 text-amber-900 dark:text-amber-100">
                  افتراضي
                </span>
              </button>
            </div>
          )}

          {/* Scrollable Language List */}
          <div className="max-h-64 sm:max-h-72 overflow-y-auto p-1.5 space-y-0.5 divide-y divide-slate-100 dark:divide-slate-800/50">
            {filteredLanguages.length === 0 ? (
              <div className="py-8 px-4 text-center">
                <p className="text-xs font-bold text-slate-600 dark:text-slate-400">
                  لم يتم العثور على أي لغة مطابقة لـ "{searchQuery}"
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                  جرب البحث بالاسم المحلي أو العربي أو رمز اللغة
                </p>
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="mt-3 text-xs text-indigo-600 dark:text-indigo-400 font-semibold underline cursor-pointer"
                >
                  إعادة ضبط البحث
                </button>
              </div>
            ) : (
              filteredLanguages.map((lang) => {
                const isSelected = lang.code === selectedCode;
                return (
                  <button
                    key={lang.code}
                    type="button"
                    role="option"
                    aria-selected={isSelected}
                    onClick={() => handleSelectLanguage(lang)}
                    className={`w-full text-right flex items-center justify-between px-2.5 py-2 rounded-xl text-xs transition-all cursor-pointer group ${
                      isSelected
                        ? 'bg-indigo-50 dark:bg-indigo-950/70 text-indigo-950 dark:text-white font-bold ring-1 ring-indigo-200 dark:ring-indigo-800'
                        : 'hover:bg-slate-100 dark:hover:bg-slate-800/70 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-base select-none shrink-0" role="img" aria-label={lang.name}>
                        {lang.flag}
                      </span>
                      <div className="text-right truncate">
                        <div className="flex items-center gap-1.5 truncate">
                          <span
                            className={`truncate ${
                              isSelected
                                ? 'text-indigo-700 dark:text-indigo-300 font-extrabold'
                                : 'text-slate-900 dark:text-slate-100 font-semibold'
                            }`}
                          >
                            {lang.name}
                          </span>
                          {lang.code === 'ar' && (
                            <span className="text-[9px] px-1 py-0.2 rounded-sm bg-emerald-100 dark:bg-emerald-950 text-emerald-700 dark:text-emerald-300 font-bold shrink-0">
                              الأساسية
                            </span>
                          )}
                        </div>
                        <div className="text-[10px] text-slate-400 dark:text-slate-500 truncate flex items-center gap-1.5">
                          <span>{lang.nameAr}</span>
                          {lang.region && (
                            <>
                              <span>•</span>
                              <span className="text-slate-400/80 truncate">{lang.region}</span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 pr-2">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 group-hover:bg-slate-200 dark:group-hover:bg-slate-700">
                        {lang.code}
                      </span>
                      {isSelected && (
                        <div className="w-5 h-5 rounded-full bg-indigo-600 dark:bg-indigo-500 text-white flex items-center justify-center">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  </button>
                );
              })
            )}
          </div>

          {/* Footer stats */}
          <div className="p-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/80 text-[10px] text-slate-500 dark:text-slate-400 flex items-center justify-between px-3">
            <span className="flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-500" />
              <span>جاهز للترجمة وتصدير التقارير متعددة اللغات</span>
            </span>
            <span className="font-mono font-bold text-slate-600 dark:text-slate-300">
              {WORLD_LANGUAGES.length} Languages
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
