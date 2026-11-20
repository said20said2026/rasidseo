import React, { useState } from 'react';
import { Search, ShieldCheck, Sun, Moon, Menu, X, Sparkles } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageSelector } from './LanguageSelector';
import { LanguageItem, WORLD_LANGUAGES } from '../data/languages';

interface NavbarProps {
  onNewAuditClick: () => void;
  onToolsClick?: () => void;
  onCompareClick?: () => void;
  onScheduledAuditsClick?: () => void;
  savedReportsCount?: number;
  onLanguageChange?: (lang: LanguageItem) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewAuditClick,
  onToolsClick,
  onCompareClick,
  onScheduledAuditsClick,
  savedReportsCount = 0,
  onLanguageChange
}) => {
  const { theme, themePreference, setThemePreference } = useTheme();
  const { t, isRtl, currentLanguage } = useLanguage();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-4 h-16">
          {/* Zone 1: Single element brand wordmark */}
          <a
            href="#"
            onClick={(e) => {
              e.preventDefault();
              onNewAuditClick();
            }}
            className="flex items-center gap-2.5 text-slate-900 dark:text-white font-extrabold text-xl tracking-tight whitespace-nowrap shrink-0 group"
          >
            <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-700 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-indigo-200 dark:shadow-indigo-950 group-hover:scale-105 transition-transform">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <span>
              {t('brand_name', 'راصد')} <span className="text-indigo-600 dark:text-indigo-400 font-black">{t('brand_tagline', 'سيو')}</span>
              <span className="text-xs font-mono font-medium text-slate-500 dark:text-slate-400 mr-1.5 ml-1.5 hidden sm:inline">RasidSEO</span>
            </span>
          </a>

          {/* Zone 2: Clean single-line text navigation links (desktop) */}
          <nav className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-600 dark:text-slate-300">
            <button
              onClick={onNewAuditClick}
              className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              {t('nav.instant_audit', 'فحص فوري')}
            </button>
            {onScheduledAuditsClick && (
              <button
                onClick={onScheduledAuditsClick}
                className="hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors whitespace-nowrap shrink-0 cursor-pointer flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold"
              >
                <span>{t('nav.schedule_audit', 'جدولة فحص دوري')}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </button>
            )}
          </nav>

          {/* Zone 3: Actions + 40-Language Dropdown + Dark Mode Toggle Switch */}
          <div className="flex items-center gap-2 sm:gap-2.5 shrink-0">
            {/* 40 World Languages Selector Dropdown */}
            <LanguageSelector onLanguageChange={onLanguageChange} />

            {/* Interactive Theme Switcher (مفتاح تبديل المظهر التفاعلي مع دعم النظام التلقائي) */}
            <div
              className="flex items-center p-1 bg-slate-100 dark:bg-slate-800/90 border border-slate-200/80 dark:border-slate-700/80 rounded-xl text-xs transition-colors shadow-2xs"
              role="group"
              aria-label="Theme toggle switch"
            >
              {/* Light Mode Button */}
              <button
                type="button"
                onClick={() => setThemePreference('light')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  themePreference === 'light'
                    ? 'bg-white text-amber-600 shadow-xs border border-amber-200/60 dark:border-transparent'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="Light Mode"
                aria-pressed={themePreference === 'light'}
              >
                <Sun className={`w-3.5 h-3.5 ${themePreference === 'light' ? 'text-amber-500 fill-amber-400' : 'text-slate-400'}`} />
                <span className="text-[11px] hidden sm:inline">{t('nav.light', 'فاتح')}</span>
              </button>

              {/* Dark Mode Button */}
              <button
                type="button"
                onClick={() => setThemePreference('dark')}
                className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                  themePreference === 'dark'
                    ? 'bg-slate-900 text-indigo-300 shadow-xs border border-indigo-500/40 ring-1 ring-indigo-500/20'
                    : 'text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white'
                }`}
                title="Dark Mode"
                aria-pressed={themePreference === 'dark'}
              >
                <Moon className={`w-3.5 h-3.5 ${themePreference === 'dark' ? 'text-indigo-400 fill-indigo-400' : 'text-slate-400'}`} />
                <span className="text-[11px] hidden sm:inline">{t('nav.dark', 'داكن')}</span>
              </button>
            </div>

            {/* Mobile Hamburger Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
              aria-label="فتح القائمة الرئيسية"
              title="القائمة"
            >
              {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 dark:border-slate-800 bg-white/98 dark:bg-slate-900/98 backdrop-blur-md px-4 py-3 space-y-2.5 animate-in slide-in-from-top-2 duration-150 shadow-lg">
          {/* Mobile Theme Switch Row */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-400" /> : <Sun className="w-3.5 h-3.5 text-amber-500" />}
              <span>{t('nav.appearance', 'مظهر الواجهة:')}</span>
            </span>

            <div className="flex items-center p-0.5 bg-slate-200/80 dark:bg-slate-900/80 rounded-lg text-xs font-bold">
              <button
                type="button"
                onClick={() => setThemePreference('light')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  themePreference === 'light'
                    ? 'bg-white text-amber-600 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                ☀️ {t('nav.light', 'فاتح')}
              </button>
              <button
                type="button"
                onClick={() => setThemePreference('dark')}
                className={`px-2.5 py-1 rounded-md transition-all ${
                  themePreference === 'dark'
                    ? 'bg-slate-800 text-indigo-300 shadow-xs'
                    : 'text-slate-600 dark:text-slate-400'
                }`}
              >
                🌙 {t('nav.dark', 'داكن')}
              </button>
            </div>
          </div>

          {/* Mobile Language Selector Row */}
          <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <span>{t('nav.language', 'اللغة')} ({WORLD_LANGUAGES.length}):</span>
            </span>
            <LanguageSelector onLanguageChange={onLanguageChange} />
          </div>

          {/* Mobile Menu Links */}
          <div className="flex flex-col gap-1 text-xs font-medium">
            <button
              onClick={() => {
                onNewAuditClick();
                setMobileMenuOpen(false);
              }}
              className="text-right px-3 py-2 rounded-lg text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 font-semibold flex items-center justify-between"
            >
              <span>{t('nav.instant_audit', 'فحص فوري للموقع')}</span>
              <Search className="w-3.5 h-3.5 text-slate-400" />
            </button>

            {onScheduledAuditsClick && (
              <button
                onClick={() => {
                  onScheduledAuditsClick();
                  setMobileMenuOpen(false);
                }}
                className="text-right px-3 py-2 rounded-lg text-indigo-600 dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-950/60 font-bold flex items-center justify-between"
              >
                <span>{t('nav.schedule_audit', 'جدولة فحص دوري للموقع')}</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
};
