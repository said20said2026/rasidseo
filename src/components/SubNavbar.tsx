import React, { useState, useEffect } from 'react';
import { Home, FileBarChart2, Code2, BookOpen, Wrench, HelpCircle } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

export type SubNavSection = 'home' | 'report' | 'codegen' | 'guide' | 'fixguide' | 'faq';

interface SubNavbarProps {
  onHomeClick: () => void;
  onReportClick: () => void;
  onCodeGenClick: () => void;
  onGuideClick: () => void;
  onFixGuideClick?: () => void;
  onFaqClick?: () => void;
  hasAuditData?: boolean;
  auditScore?: number;
}

export const SubNavbar: React.FC<SubNavbarProps> = ({
  onHomeClick,
  onReportClick,
  onCodeGenClick,
  onGuideClick,
  onFixGuideClick,
  onFaqClick,
  hasAuditData = false,
  auditScore
}) => {
  const { t, isRtl } = useLanguage();
  const [activeSection, setActiveSection] = useState<SubNavSection>('home');

  // Scroll spy to detect active section dynamically as user scrolls
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;

      const faqEl = document.getElementById('faq-section');
      const guideEl = document.getElementById('guide-section');
      const checklistEl = document.getElementById('seo-checklist-section');
      const toolsEl = document.getElementById('tools-section');
      const resultsEl = document.getElementById('results-section');

      const faqTop = faqEl ? faqEl.offsetTop - 140 : Infinity;
      const guideTop = guideEl ? guideEl.offsetTop - 140 : Infinity;
      const checklistTop = checklistEl ? checklistEl.offsetTop - 140 : Infinity;
      const toolsTop = toolsEl ? toolsEl.offsetTop - 140 : Infinity;
      const resultsTop = resultsEl ? resultsEl.offsetTop - 140 : Infinity;

      if (scrollY >= faqTop) {
        setActiveSection('faq');
      } else if (scrollY >= guideTop) {
        setActiveSection('guide');
      } else if (checklistEl && scrollY >= checklistTop && scrollY < toolsTop) {
        setActiveSection('fixguide');
      } else if (scrollY >= toolsTop) {
        setActiveSection('codegen');
      } else if (scrollY >= resultsTop) {
        setActiveSection('report');
      } else {
        setActiveSection('home');
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [hasAuditData]);

  const navItems = [
    {
      id: 'home' as SubNavSection,
      label: t('nav.home', 'الرئيسية'),
      icon: Home,
      onClick: () => {
        setActiveSection('home');
        onHomeClick();
      },
      badge: null
    },
    {
      id: 'report' as SubNavSection,
      label: t('nav.audit_report', 'تقرير الفحص'),
      icon: FileBarChart2,
      onClick: () => {
        setActiveSection('report');
        onReportClick();
      },
      badge: hasAuditData && typeof auditScore === 'number' ? (
        <span
          className={`text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full ${
            auditScore >= 80
              ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
              : auditScore >= 60
              ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
              : 'bg-rose-100 text-rose-800 dark:bg-rose-950 dark:text-rose-300'
          }`}
        >
          {auditScore}%
        </span>
      ) : null
    },
    {
      id: 'codegen' as SubNavSection,
      label: t('nav.code_generator', 'مولد الأكواد'),
      icon: Code2,
      onClick: () => {
        setActiveSection('codegen');
        onCodeGenClick();
      },
      badge: null
    },
    {
      id: 'guide' as SubNavSection,
      label: t('nav.seo_guide', 'دليل السيو'),
      icon: BookOpen,
      onClick: () => {
        setActiveSection('guide');
        onGuideClick();
      },
      badge: null
    },
    {
      id: 'fixguide' as SubNavSection,
      label: t('nav.fix_guide', 'دليل إصلاح الأخطاء'),
      icon: Wrench,
      onClick: () => {
        setActiveSection('fixguide');
        if (onFixGuideClick) {
          onFixGuideClick();
        } else {
          onGuideClick();
        }
      },
      badge: null
    },
    {
      id: 'faq' as SubNavSection,
      label: t('nav.faq', 'الأسئلة الشائعة'),
      icon: HelpCircle,
      onClick: () => {
        setActiveSection('faq');
        if (onFaqClick) {
          onFaqClick();
        } else {
          document.getElementById('faq-section')?.scrollIntoView({ behavior: 'smooth' });
        }
      },
      badge: null
    }
  ];

  return (
    <nav
      aria-label="القائمة الفرعية لأقسام الموقع الرئيسية"
      className="sticky top-16 z-30 bg-white/95 dark:bg-slate-900/95 backdrop-blur-md border-b border-slate-200/90 dark:border-slate-800 shadow-2xs transition-colors"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-2 py-2">
          {/* Sub Navigation Items Row */}
          <div className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar scroll-smooth w-full sm:w-auto">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={item.onClick}
                  aria-current={isActive ? 'page' : undefined}
                  className={`flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all whitespace-nowrap cursor-pointer shrink-0 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-sm shadow-indigo-600/20 font-bold ring-2 ring-indigo-600/30'
                      : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-slate-600 dark:text-slate-500'}`} />
                  <span>{item.label}</span>
                  {item.badge}
                </button>
              );
            })}
          </div>

          {/* Quick Info / Status Indicator on Desktop */}
          <div className="hidden lg:flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400 shrink-0">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="font-medium text-[11px]">
              {isRtl ? 'تصفح مباشر لجميع أدوات وأقسام المنصة' : 'Direct navigation to all site sections'}
            </span>
          </div>
        </div>
      </div>
    </nav>
  );
};
