/**
 * Full-Site Translation Engine
 * Synchronizes Google Translate across all 40 world languages
 * and provides client-side translations for instant responsive UI.
 */

// Cache of original Arabic texts before translation
const originalTextsMap = new WeakMap<Node, string>();

export const FULL_SITE_PHRASES: Record<string, Record<string, string>> = {
  // Common UI words across the entire site
  'المنصة الرائدة لفحص وتدقيق أخطاء السيو والمواقع والمدونات 2026': {
    en: 'Leading 2026 Platform for SEO Audit & Website Error Detection',
    fr: 'Plateforme leader 2026 d’audit SEO et détection d’erreurs de sites',
    es: 'Plataforma líder 2026 de auditoría SEO e inspección de errores',
    de: 'Führende Plattform 2026 für SEO-Audits und Fehlererkennung',
    tr: '2026 Lider SEO Denetimi ve Web Sitesi Hata Tespit Platformu',
    'zh-CN': '2026年领先的网站与博客SEO错误诊断平台',
    ru: 'Ведущая платформа SEO-аудита и поиска ошибок веб-сайтов 2026',
    ja: '2026年最新のWebサイト・ブログSEO診断プラットフォーム'
  },
  'افحص موقعك ومدونتك واكتشف الأخطاء التي تعيق تصدرك في': {
    en: 'Audit your site and blog to discover errors blocking ranking on',
    fr: 'Analysez votre site pour découvrir les erreurs bloquant votre rang sur',
    es: 'Audite su sitio para descubrir errores que bloquean su puesto en',
    de: 'Überprüfen Sie Ihre Website und beheben Sie Ranking-Fehler bei',
    tr: 'Sitenizi denetleyin, sıralamanızı engelleyen hataları keşfedin:',
    'zh-CN': '全面检测您的网站与博客，找出阻碍您在',
    ru: 'Проверьте сайт и найдите ошибки, мешающие ранжированию в',
    ja: 'サイトを診断し、掲載順位を妨げているエラーを発見：'
  },
  'أداة متكاملة لتحليل السيو الداخلي (On-Page SEO)، والسرعة، وهيكل العناوين H1-H6، ووسوم الميتا، وفحص ملفات الروبوتات وخريطة الموقع مع توليد فوري للأكواد واستشارة ذكاء اصطناعي ذكية.': {
    en: 'All-in-one suite for On-Page SEO, speed, H1-H6 structure, meta tags, robots.txt, sitemaps, instant code fixes & AI consultation.',
    fr: 'Suite complète pour le SEO On-Page, la vitesse, structure H1-H6, balises méta, robots.txt, sitemap et conseils IA.',
    es: 'Herramienta integral para SEO On-Page, velocidad, estructura H1-H6, metaetiquetas, robots.txt, sitemaps y consultoría de IA.',
    de: 'Komplettlösung für On-Page-SEO, Geschwindigkeit, H1-H6-Hierarchie, Meta-Tags, robots.txt, Sitemaps und KI-Beratung.',
    tr: 'Sayfa İçi SEO, hız, H1-H6 hiyerarşisi, meta etiketler, robots.txt, site haritası ve yapay zeka danışmanlığı tek bir araçta.',
    'zh-CN': '集页面SEO、加载速度、H1-H6标题层级、元标签、robots.txt、站点地图与智能AI咨询于一体的专业工具。',
    ru: 'Комплексный инструмент для On-Page SEO, скорости, структуры H1-H6, мета-тегов, robots.txt, sitemap и рекомендаций ИИ.',
    ja: '内部SEO、表示速度、H1-H6構造、メタタグ、robots.txt、サイトマップ、AI診断を備えた総合ツール。'
  },
  'أدخل رابط موقعك أو مدونتك (مثال: example.com)': {
    en: 'Enter your website or blog URL (e.g. example.com)',
    fr: 'Entrez l’URL de votre site ou blog (ex: example.com)',
    es: 'Ingrese la URL de su sitio o blog (ej: example.com)',
    de: 'Website-URL eingeben (z. B. example.com)',
    tr: 'Web sitesi veya blog URL girin (ör: example.com)',
    'zh-CN': '输入您的网站或博客网址 (例如: example.com)',
    ru: 'Введите адрес сайта (например: example.com)',
    ja: 'サイトのURLを入力 (例: example.com)'
  },
  'فحص وتدقيق الموقع': {
    en: 'Audit & Inspect Website',
    fr: 'Auditer le site web',
    es: 'Auditar sitio web',
    de: 'Website prüfen',
    tr: 'Siteyi Denetle',
    'zh-CN': '立即全面分析网站',
    ru: 'Проверить сайт',
    ja: 'サイトを診断する'
  },
  'جاري الفحص...': {
    en: 'Auditing in progress...',
    fr: 'Analyse en cours...',
    es: 'Auditando...',
    de: 'Wird geprüft...',
    tr: 'Denetleniyor...',
    'zh-CN': '正在检测中...',
    ru: 'Выполняется проверка...',
    ja: '診断中...'
  },
  'تقييم السيو العام': {
    en: 'Overall SEO Score',
    fr: 'Score SEO Global',
    es: 'Puntuación SEO General',
    de: 'SEO-Gesamtwertung',
    tr: 'Genel SEO Skoru',
    'zh-CN': '综合 SEO 得分',
    ru: 'Общая оценка SEO',
    ja: '総合SEOスコア'
  },
  'أخطاء حرجة يجب إصلاحها': {
    en: 'Critical Errors to Fix',
    fr: 'Erreurs critiques à corriger',
    es: 'Errores críticos a corregir',
    de: 'Kritische Fehler zu beheben',
    tr: 'Düzeltilmesi Gereken Kritik Hatalar',
    'zh-CN': '亟需修复的严重错误',
    ru: 'Критические ошибки для исправления',
    ja: '修正が必要な重大エラー'
  },
  'تنبيهات وملاحظات': {
    en: 'Warnings & Improvement Notes',
    fr: 'Avertissements et remarques',
    es: 'Advertencias y notas de mejora',
    de: 'Warnungen und Hinweise',
    tr: 'Uyarılar ve İyileştirme Notları',
    'zh-CN': '优化建议与警告项',
    ru: 'Предупреждения и рекомендации',
    ja: '警告および改善事項'
  },
  'اختبارات ناجحة وسليمة': {
    en: 'Passed & Valid Tests',
    fr: 'Tests réussis et conformes',
    es: 'Pruebas aprobadas y válidas',
    de: 'Erfolgreich bestandene Tests',
    tr: 'Başarılı ve Geçerli Testler',
    'zh-CN': '已通过的标准测试项',
    ru: 'Успешно пройденные тесты',
    ja: '合格した検証項目'
  },
  'مؤشرات أداء الويب الأساسية (Core Web Vitals)': {
    en: 'Core Web Vitals & Live Performance Monitor',
    fr: 'Signaux Web essentiels (Core Web Vitals)',
    es: 'Métricas Web Principales (Core Web Vitals)',
    de: 'Core Web Vitals & Live-Geschwindigkeit',
    tr: 'Önemli Web Verileri (Core Web Vitals)',
    'zh-CN': '核心网页体验指标 (Core Web Vitals)',
    ru: 'Основные показатели Web Vitals',
    ja: 'Core Web Vitals＆リアルタイムモニター'
  },
  'شجرة العناوين وهيكل H1-H6': {
    en: 'Headings Structure & Hierarchy (H1-H6)',
    fr: 'Hiérarchie des titres (H1-H6)',
    es: 'Estructura de Encabezados (H1-H6)',
    de: 'Überschriftenstruktur (H1-H6)',
    tr: 'Başlık Hiyerarşisi (H1-H6)',
    'zh-CN': 'H1-H6 标题层级结构树',
    ru: 'Структура заголовков H1-H6',
    ja: '見出し構造と階層 (H1-H6)'
  },
  'فاحص الروابط الخارجية (External Link Checker 404)': {
    en: 'External Link & 404 Checker',
    fr: 'Vérificateur de liens 404',
    es: 'Verificador de enlaces rotos 404',
    de: '404-Fehlerprüfung für Links',
    tr: '404 Kırık Bağlantı Kontrolü',
    'zh-CN': '404 死链与外链检测器',
    ru: 'Проверка битых ссылок 404',
    ja: '404リンク＆外部リンクチェッカー'
  },
  'تصدير تقرير PDF': {
    en: 'Export PDF Report',
    fr: 'Exporter Rapport PDF',
    es: 'Exportar Informe PDF',
    de: 'PDF-Bericht exportieren',
    tr: 'PDF Raporu İndir',
    'zh-CN': '导出 PDF 报告',
    ru: 'Экспорт отчета в PDF',
    ja: 'PDFレポートを出力'
  },
  'تصدير JSON': {
    en: 'Export JSON',
    fr: 'Exporter JSON',
    es: 'Exportar JSON',
    de: 'JSON exportieren',
    tr: 'JSON İndir',
    'zh-CN': '导出 JSON',
    ru: 'Экспорт в JSON',
    ja: 'JSON出力'
  },
  'قائمة المهام التنفيذية': {
    en: 'Actionable Task Checklist',
    fr: 'Liste des tâches d’action',
    es: 'Lista de tareas accionables',
    de: 'Aufgaben-Checkliste',
    tr: 'Uygulanabilir Görev Listesi',
    'zh-CN': '可执行优化清单',
    ru: 'Список практических задач',
    ja: '実行タスクチェックリスト'
  },
  'مشاركة التقرير': {
    en: 'Share Report',
    fr: 'Partager le rapport',
    es: 'Compartir informe',
    de: 'Bericht teilen',
    tr: 'Raporu Paylaş',
    'zh-CN': '分享诊断报告',
    ru: 'Поделиться отчетом',
    ja: 'レポートを共有'
  },
  'حفظ التقرير': {
    en: 'Save Report',
    fr: 'Enregistrer le rapport',
    es: 'Guardar informe',
    de: 'Bericht speichern',
    tr: 'Raporu Kaydet',
    'zh-CN': '保存诊断报告',
    ru: 'Сохранить отчет',
    ja: 'レポートを保存'
  },
  'وضع الإصلاح السريع': {
    en: 'Quick Fix Mode',
    fr: 'Mode correction rapide',
    es: 'Modo arreglo rápido',
    de: 'Schnellreparatur-Modus',
    tr: 'Hızlı Onarım Modu',
    'zh-CN': '快速修复模式',
    ru: 'Режим быстрого исправления',
    ja: 'クイック修正モード'
  },
  'التصنيفات المخصصة': {
    en: 'Custom Categories',
    fr: 'Catégories personnalisées',
    es: 'Categorías personalizadas',
    de: 'Eigene Kategorien',
    tr: 'Özel Kategoriler',
    'zh-CN': '自定义分类管理',
    ru: 'Пользовательские категории',
    ja: 'カスタムカテゴリ管理'
  }
};

/**
 * Triggers Google Translate element across all 40 world languages
 */
export function triggerGoogleTranslate(langCode: string): void {
  try {
    const gtCode = langCode === 'he' ? 'iw' : langCode === 'pt-BR' ? 'pt' : langCode;

    if (langCode === 'ar') {
      // Revert to original Arabic
      document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
      document.cookie = `googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=${window.location.hostname}; path=/;`;
      
      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (combo) {
        combo.value = 'ar';
        combo.dispatchEvent(new Event('change'));
      }
    } else {
      // Set translation cookie
      const cookieValue = `/ar/${gtCode}`;
      document.cookie = `googtrans=${cookieValue}; path=/;`;
      document.cookie = `googtrans=${cookieValue}; domain=${window.location.hostname}; path=/;`;

      const combo = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
      if (combo) {
        combo.value = gtCode;
        combo.dispatchEvent(new Event('change'));
      } else {
        // Poll for Google Translate select combo to mount
        let attempts = 0;
        const interval = setInterval(() => {
          attempts++;
          const c = document.querySelector('.goog-te-combo') as HTMLSelectElement | null;
          if (c) {
            c.value = gtCode;
            c.dispatchEvent(new Event('change'));
            clearInterval(interval);
          } else if (attempts > 30) {
            clearInterval(interval);
          }
        }, 100);
      }
    }
  } catch (e) {
    console.warn('Failed to trigger Google Translate', e);
  }
}

/**
 * Client-Side DOM text translator:
 * Translates text nodes in the DOM to ensure complete responsiveness
 * even when Google Translate is still loading or running offline.
 */
export function translateDomTextNodes(langCode: string): void {
  if (typeof document === 'undefined') return;

  const walker = document.createTreeWalker(
    document.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        // Skip scripts, styles, and inputs
        const parent = node.parentElement;
        if (!parent) return NodeFilter.FILTER_REJECT;
        const tag = parent.tagName.toLowerCase();
        if (tag === 'script' || tag === 'style' || tag === 'noscript' || tag === 'code' || tag === 'pre') {
          return NodeFilter.FILTER_REJECT;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  const nodesToUpdate: { node: Node; text: string }[] = [];
  let currentNode = walker.nextNode();

  while (currentNode) {
    const text = currentNode.nodeValue?.trim();
    if (text) {
      // Remember original text
      if (!originalTextsMap.has(currentNode)) {
        originalTextsMap.set(currentNode, currentNode.nodeValue || '');
      }

      const original = originalTextsMap.get(currentNode) || '';
      const originalTrimmed = original.trim();

      if (langCode === 'ar') {
        // Restore pristine Arabic
        if (currentNode.nodeValue !== original) {
          nodesToUpdate.push({ node: currentNode, text: original });
        }
      } else {
        // Check if we have translation for this text
        const translations = FULL_SITE_PHRASES[originalTrimmed];
        if (translations) {
          const translated = translations[langCode] || translations['en'];
          if (translated) {
            const nextVal = original.replace(originalTrimmed, translated);
            nodesToUpdate.push({ node: currentNode, text: nextVal });
          }
        }
      }
    }
    currentNode = walker.nextNode();
  }

  // Apply updates
  for (const item of nodesToUpdate) {
    item.node.nodeValue = item.text;
  }
}
