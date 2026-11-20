import { apiFetch, parseJsonSafely } from './apiConfig';
import { TRANSLATIONS, TranslationKey } from '../data/translations';

/**
 * React-Safe Full-Site Translation Engine
 * - Never wraps nodes in <font> tags (prevents React Virtual DOM crashes)
 * - Uses instant built-in dictionary + client/server cached /api/translate batching
 * - Observes dynamically mounted modals, audit results, tabs, and attributes
 * - Cleanly restores pristine Arabic when returning to 'ar'
 */

const ARABIC_CHAR_REGEX = /[\u0600-\u06FF]/;
const SKIP_TAGS = new Set(['SCRIPT', 'STYLE', 'NOSCRIPT', 'CODE', 'PRE', 'TEXTAREA', 'SVG', 'PATH']);
const TRANSLATABLE_ATTRS = ['placeholder', 'title', 'aria-label'] as const;

// Track original Arabic text & attributes per DOM node/element
const originalTextsMap = new WeakMap<Text, string>();
const appliedLangMap = new WeakMap<Text, string>();
const lastWrittenTextMap = new WeakMap<Text, string>();
const trackedTextNodes = new Set<Text>();

const originalAttrsMap = new WeakMap<Element, Record<string, string>>();
const appliedAttrLangMap = new WeakMap<Element, Record<string, string>>();
const lastWrittenAttrsMap = new WeakMap<Element, Record<string, string>>();
const trackedAttrElements = new Set<Element>();

// In-memory client cache: `${langCode}::${arabicTrimmed}` -> translated string
const clientTranslationCache = new Map<string, string>();
const LOCAL_CACHE_PREFIX = 'rasid_i18n_v1_';
const MAX_PERSISTED_PER_LANG = 800;

export const FULL_SITE_PHRASES: Record<string, Record<string, string>> = {
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
  }
};

// Build fast Arabic->Target lookup from static TRANSLATIONS dictionary
function lookupStaticDictionary(arabicTrimmed: string, langCode: string): string | null {
  const phraseHit = FULL_SITE_PHRASES[arabicTrimmed];
  if (phraseHit && phraseHit[langCode]) {
    return phraseHit[langCode];
  }

  const arDict = TRANSLATIONS.ar;
  const targetDict = TRANSLATIONS[langCode];
  if (arDict && targetDict) {
    for (const key of Object.keys(arDict) as TranslationKey[]) {
      if (arDict[key] === arabicTrimmed && targetDict[key]) {
        return targetDict[key]!;
      }
    }
  }

  return null;
}

function hydrateCacheFromStorage(langCode: string) {
  try {
    const raw = localStorage.getItem(`${LOCAL_CACHE_PREFIX}${langCode}`);
    if (!raw) return;
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') {
      Object.entries(parsed).forEach(([src, dst]) => {
        if (typeof dst === 'string' && dst.trim()) {
          clientTranslationCache.set(`${langCode}::${src}`, dst);
        }
      });
    }
  } catch {
    // ignore storage errors
  }
}

function persistLangCacheToStorage(langCode: string) {
  try {
    const entries: Record<string, string> = {};
    let count = 0;
    const prefix = `${langCode}::`;
    clientTranslationCache.forEach((val, key) => {
      if (key.startsWith(prefix) && count < MAX_PERSISTED_PER_LANG) {
        entries[key.slice(prefix.length)] = val;
        count++;
      }
    });
    localStorage.setItem(`${LOCAL_CACHE_PREFIX}${langCode}`, JSON.stringify(entries));
  } catch {
    // ignore quota errors
  }
}

function getCachedTranslation(arabicTrimmed: string, langCode: string): string | null {
  const key = `${langCode}::${arabicTrimmed}`;
  const mem = clientTranslationCache.get(key);
  if (mem) return mem;

  const dictHit = lookupStaticDictionary(arabicTrimmed, langCode);
  if (dictHit) {
    clientTranslationCache.set(key, dictHit);
    return dictHit;
  }
  return null;
}

function isNodeIgnored(node: Node | null): boolean {
  let el: Element | null = node instanceof Element ? node : node?.parentElement || null;
  while (el) {
    if (SKIP_TAGS.has(el.tagName)) return true;
    const translateAttr = el.getAttribute('translate');
    if (translateAttr === 'no') return true;
    if (el.getAttribute('data-no-translate') === 'true') return true;
    if (el.classList?.contains('notranslate')) return true;
    el = el.parentElement;
  }
  return false;
}

function collectPendingWork(
  root: Node,
  targetLang: string
): {
  textNodes: { node: Text; sourceRaw: string; sourceTrimmed: string }[];
  attrItems: { el: Element; attr: string; sourceTrimmed: string }[];
  missingTexts: Set<string>;
} {
  const textNodes: { node: Text; sourceRaw: string; sourceTrimmed: string }[] = [];
  const attrItems: { el: Element; attr: string; sourceTrimmed: string }[] = [];
  const missingTexts = new Set<string>();

  if (!root || isNodeIgnored(root)) {
    return { textNodes, attrItems, missingTexts };
  }

  // 1. Walk Text nodes
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
    acceptNode(node) {
      if (isNodeIgnored(node)) return NodeFilter.FILTER_REJECT;
      return NodeFilter.FILTER_ACCEPT;
    }
  });

  let current = walker.nextNode() as Text | null;
  while (current) {
    const curVal = current.nodeValue || '';
    const lastWritten = lastWrittenTextMap.get(current);

    // Detect if React updated this text node directly with new Arabic text
    if (!originalTextsMap.has(current)) {
      if (ARABIC_CHAR_REGEX.test(curVal)) {
        originalTextsMap.set(current, curVal);
        trackedTextNodes.add(current);
      }
    } else if (lastWritten !== undefined && curVal !== lastWritten && ARABIC_CHAR_REGEX.test(curVal)) {
      originalTextsMap.set(current, curVal);
      appliedLangMap.delete(current);
    }

    const sourceRaw = originalTextsMap.get(current);
    if (sourceRaw && appliedLangMap.get(current) !== targetLang) {
      const sourceTrimmed = sourceRaw.trim();
      if (sourceTrimmed && ARABIC_CHAR_REGEX.test(sourceTrimmed)) {
        textNodes.push({ node: current, sourceRaw, sourceTrimmed });
        if (!getCachedTranslation(sourceTrimmed, targetLang)) {
          missingTexts.add(sourceTrimmed);
        }
      }
    }
    current = walker.nextNode() as Text | null;
  }

  // 2. Walk Elements with translatable attributes (placeholder, title, aria-label)
  const checkElementAttrs = (el: Element) => {
    if (isNodeIgnored(el)) return;
    for (const attr of TRANSLATABLE_ATTRS) {
      const curAttr = el.getAttribute(attr);
      if (!curAttr) continue;

      let origMap = originalAttrsMap.get(el);
      const lastAttrMap = lastWrittenAttrsMap.get(el);
      const appliedMap = appliedAttrLangMap.get(el);

      if (!origMap || !(attr in origMap)) {
        if (ARABIC_CHAR_REGEX.test(curAttr)) {
          origMap = { ...(origMap || {}), [attr]: curAttr };
          originalAttrsMap.set(el, origMap);
          trackedAttrElements.add(el);
        }
      } else if (lastAttrMap && lastAttrMap[attr] !== undefined && curAttr !== lastAttrMap[attr] && ARABIC_CHAR_REGEX.test(curAttr)) {
        origMap[attr] = curAttr;
        if (appliedMap) delete appliedMap[attr];
      }

      const sourceTrimmed = origMap?.[attr]?.trim();
      if (sourceTrimmed && ARABIC_CHAR_REGEX.test(sourceTrimmed) && appliedMap?.[attr] !== targetLang) {
        attrItems.push({ el, attr, sourceTrimmed });
        if (!getCachedTranslation(sourceTrimmed, targetLang)) {
          missingTexts.add(sourceTrimmed);
        }
      }
    }
  };

  if (root instanceof Element) {
    checkElementAttrs(root);
    const elements = root.querySelectorAll('[placeholder],[title],[aria-label]');
    elements.forEach((el) => checkElementAttrs(el));
  }

  return { textNodes, attrItems, missingTexts };
}

function applyCachedTranslations(
  targetLang: string,
  textNodes: { node: Text; sourceRaw: string; sourceTrimmed: string }[],
  attrItems: { el: Element; attr: string; sourceTrimmed: string }[]
) {
  for (const item of textNodes) {
    if (!item.node.isConnected) continue;
    const translated = getCachedTranslation(item.sourceTrimmed, targetLang);
    if (translated) {
      const leading = item.sourceRaw.match(/^\s*/)?.[0] || '';
      const trailing = item.sourceRaw.match(/\s*$/)?.[0] || '';
      const nextVal = `${leading}${translated}${trailing}`;
      if (item.node.nodeValue !== nextVal) {
        item.node.nodeValue = nextVal;
      }
      lastWrittenTextMap.set(item.node, nextVal);
      appliedLangMap.set(item.node, targetLang);
    }
  }

  for (const item of attrItems) {
    if (!item.el.isConnected) continue;
    const translated = getCachedTranslation(item.sourceTrimmed, targetLang);
    if (translated) {
      item.el.setAttribute(item.attr, translated);
      const lastMap = lastWrittenAttrsMap.get(item.el) || {};
      lastMap[item.attr] = translated;
      lastWrittenAttrsMap.set(item.el, lastMap);

      const appMap = appliedAttrLangMap.get(item.el) || {};
      appMap[item.attr] = targetLang;
      appliedAttrLangMap.set(item.el, appMap);
    }
  }
}

export function restoreArabicDom(): void {
  if (typeof document === 'undefined') return;

  trackedTextNodes.forEach((node) => {
    if (!node.isConnected) {
      trackedTextNodes.delete(node);
      return;
    }
    const orig = originalTextsMap.get(node);
    const lastWritten = lastWrittenTextMap.get(node);
    if (orig !== undefined && (lastWritten === undefined || node.nodeValue === lastWritten)) {
      if (node.nodeValue !== orig) {
        node.nodeValue = orig;
      }
    }
    appliedLangMap.delete(node);
    lastWrittenTextMap.delete(node);
  });

  trackedAttrElements.forEach((el) => {
    if (!el.isConnected) {
      trackedAttrElements.delete(el);
      return;
    }
    const origMap = originalAttrsMap.get(el);
    const lastMap = lastWrittenAttrsMap.get(el);
    if (origMap) {
      for (const [attr, origVal] of Object.entries(origMap)) {
        if (!lastMap || el.getAttribute(attr) === lastMap[attr]) {
          el.setAttribute(attr, origVal);
        }
      }
    }
    appliedAttrLangMap.delete(el);
    lastWrittenAttrsMap.delete(el);
  });
}

let activeObserver: MutationObserver | null = null;
let activeAbortController: AbortController | null = null;
let activeTargetLang = 'ar';
let debounceTimer: ReturnType<typeof setTimeout> | null = null;

export function stopDomTranslator(): void {
  if (debounceTimer) {
    clearTimeout(debounceTimer);
    debounceTimer = null;
  }
  if (activeObserver) {
    activeObserver.disconnect();
    activeObserver = null;
  }
  if (activeAbortController) {
    activeAbortController.abort();
    activeAbortController = null;
  }
}

export async function translateTextsBatch(
  texts: string[],
  targetLang: string,
  signal?: AbortSignal
): Promise<Record<string, string>> {
  if (!texts.length || targetLang === 'ar') return {};

  const resp = await apiFetch('/api/translate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ targetLang, texts }),
    signal
  });

  const parsed = await parseJsonSafely(resp);
  if (!parsed.ok || !parsed.data?.success || !parsed.data?.translations) {
    return {};
  }
  return parsed.data.translations as Record<string, string>;
}

export function startDomTranslator(
  langCode: string,
  onStatusChange?: (translating: boolean) => void
): void {
  if (typeof document === 'undefined') return;

  stopDomTranslator();
  activeTargetLang = langCode;

  if (langCode === 'ar') {
    restoreArabicDom();
    onStatusChange?.(false);
    return;
  }

  hydrateCacheFromStorage(langCode);
  const controller = new AbortController();
  activeAbortController = controller;

  let isApplying = false;

  const runPass = async () => {
    if (controller.signal.aborted || activeTargetLang !== langCode) return;
    const rootEl = document.getElementById('root') || document.body;

    isApplying = true;
    const { textNodes, attrItems, missingTexts } = collectPendingWork(rootEl, langCode);
    applyCachedTranslations(langCode, textNodes, attrItems);
    isApplying = false;

    const missingList = Array.from(missingTexts);
    if (missingList.length === 0) {
      onStatusChange?.(false);
      return;
    }

    onStatusChange?.(true);
    try {
      // Request missing translations in clean chunks of 45 items
      const CHUNK_SIZE = 45;
      for (let i = 0; i < missingList.length; i += CHUNK_SIZE) {
        if (controller.signal.aborted || activeTargetLang !== langCode) break;
        const chunk = missingList.slice(i, i + CHUNK_SIZE);
        const translatedMap = await translateTextsBatch(chunk, langCode, controller.signal);

        if (controller.signal.aborted || activeTargetLang !== langCode) break;

        Object.entries(translatedMap).forEach(([src, dst]) => {
          if (typeof dst === 'string' && dst.trim()) {
            clientTranslationCache.set(`${langCode}::${src}`, dst.trim());
          }
        });

        isApplying = true;
        const freshWork = collectPendingWork(rootEl, langCode);
        applyCachedTranslations(langCode, freshWork.textNodes, freshWork.attrItems);
        isApplying = false;
      }

      if (!controller.signal.aborted && activeTargetLang === langCode) {
        persistLangCacheToStorage(langCode);
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.warn('Translation batch error:', err);
      }
    } finally {
      isApplying = false;
      if (!controller.signal.aborted) {
        onStatusChange?.(false);
      }
    }
  };

  // Run initial pass right after React commits DOM updates
  setTimeout(() => {
    void runPass();
  }, 40);

  // Watch for React re-renders, newly opened modals, tabs, and dynamic audit content
  const rootTarget = document.getElementById('root') || document.body;
  activeObserver = new MutationObserver((mutations) => {
    if (isApplying || controller.signal.aborted || activeTargetLang !== langCode) return;

    let hasPotentialArabicWork = false;
    for (const m of mutations) {
      if (m.type === 'characterData') {
        const val = m.target.nodeValue || '';
        const last = lastWrittenTextMap.get(m.target as Text);
        if (val !== last && ARABIC_CHAR_REGEX.test(val)) {
          hasPotentialArabicWork = true;
          break;
        }
      } else if (m.type === 'childList' && m.addedNodes.length > 0) {
        for (let i = 0; i < m.addedNodes.length; i++) {
          const added = m.addedNodes[i];
          if (!isNodeIgnored(added) && ARABIC_CHAR_REGEX.test(added.textContent || '')) {
            hasPotentialArabicWork = true;
            break;
          }
        }
        if (hasPotentialArabicWork) break;
      } else if (m.type === 'attributes') {
        const el = m.target as Element;
        const attrName = m.attributeName || '';
        if (attrName && (TRANSLATABLE_ATTRS as readonly string[]).includes(attrName)) {
          const cur = el.getAttribute(attrName) || '';
          const last = lastWrittenAttrsMap.get(el)?.[attrName];
          if (cur !== last && ARABIC_CHAR_REGEX.test(cur)) {
            hasPotentialArabicWork = true;
            break;
          }
        }
      }
    }

    if (hasPotentialArabicWork) {
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        void runPass();
      }, 60);
    }
  });

  activeObserver.observe(rootTarget, {
    childList: true,
    subtree: true,
    characterData: true,
    attributes: true,
    attributeFilter: ['placeholder', 'title', 'aria-label']
  });
}

// Keep backward-compatible helper exports if referenced externally
export function triggerGoogleTranslate(_langCode: string): void {
  // Legacy no-op: handled natively by React-safe startDomTranslator
}

export function translateDomTextNodes(langCode: string): void {
  startDomTranslator(langCode);
}
