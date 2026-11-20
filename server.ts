import express, { Request, Response } from 'express';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import * as cheerio from 'cheerio';
import { GoogleGenAI } from '@google/genai';
import { AuditItem, AuditResult, CategoryScore, HeadingsAnalysis, ImagesAnalysis, LinksAnalysis, SocialTags, KeywordDensityAnalysis, BrokenLinksAnalysis, ExternalLinkCheckResult, SchemaAnalysis, CoreWebVitalsAnalysis, InternalLinkingAnalysis, SecurityHeadersAnalysis, HighIntentKeywordsAnalysis, ScheduledAuditSubscription } from './src/types/seo.js';
import { SAMPLE_AUDITS } from './src/data/samples.js';
import { analyzeKeywordDensity } from './src/utils/keywordDensity.js';
import { inspectJsonLdFromHtml, inspectJsonLdText } from './src/utils/schemaValidator.js';
import { calculateCoreWebVitals } from './src/utils/cwvCalculator.js';
import { analyzeInternalLinking } from './src/utils/internalLinkingAnalyzer.js';
import { analyzeSecurityHeaders } from './src/utils/securityHeadersAnalyzer.js';
import { generateHighIntentKeywords } from './src/utils/highIntentKeywordsAnalyzer.js';
import { generateSeoRoadmapPlan } from './src/utils/roadmapGenerator.js';

dotenv.config();

const __dirnameResolved =
  typeof import.meta !== 'undefined' && import.meta.url
    ? path.dirname(fileURLToPath(import.meta.url))
    : process.cwd();

const app = express();
const PORT = process.env.PORT || 3000;

// CORS configuration binding the audit backend to https://www.rasidseo.site and preview origins
const ALLOWED_ORIGINS = new Set([
  'https://www.rasidseo.site',
  'https://rasidseo.site',
  'http://www.rasidseo.site',
  'http://rasidseo.site',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
  ...(process.env.APP_URL ? [process.env.APP_URL.replace(/\/+$/, '')] : []),
  ...(process.env.ALLOWED_ORIGIN ? process.env.ALLOWED_ORIGIN.split(',').map((o) => o.trim().replace(/\/+$/, '')) : [])
]);

app.use((req, res, next) => {
  const origin = req.headers.origin;
  if (origin) {
    const cleanOrigin = origin.replace(/\/+$/, '');
    const isAllowed =
      ALLOWED_ORIGINS.has(cleanOrigin) ||
      cleanOrigin.endsWith('.rasidseo.site') ||
      cleanOrigin.endsWith('.vercel.app') ||
      cleanOrigin.endsWith('.run.app');

    if (isAllowed) {
      res.setHeader('Access-Control-Allow-Origin', origin);
      res.setHeader('Vary', 'Origin');
    }
  } else {
    res.setHeader('Access-Control-Allow-Origin', 'https://www.rasidseo.site');
  }

  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PATCH, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  res.setHeader('Access-Control-Allow-Credentials', 'true');

  if (req.method === 'OPTIONS') {
    return res.status(204).end();
  }
  next();
});

app.use(express.json());

// Initialize Google GenAI with recommended telemetry header
let aiClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  try {
    aiClient = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  } catch (err) {
    console.error('Failed to initialize Google GenAI:', err);
  }
}

// Helper: Normalize URL
function normalizeUrl(input: string): string {
  let url = input.trim();
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }
  return url;
}

// High-Speed In-Memory Cache (TTL: 5 minutes)
interface CachedAudit {
  data: AuditResult;
  timestamp: number;
}
const auditCache = new Map<string, CachedAudit>();
const CACHE_TTL_MS = 5 * 60 * 1000;

// Helper: Fast probe URL (e.g., robots.txt or sitemap.xml) with 1400ms timeout
async function probePath(baseUrl: string, subpath: string, timeoutMs = 1400): Promise<boolean> {
  try {
    const origin = new URL(baseUrl).origin;
    const target = `${origin}${subpath}`;
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    const resp = await fetch(target, {
      method: 'HEAD',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; RasidSEOBot/1.0; +https://www.rasidseo.site)'
      }
    });
    clearTimeout(timeout);
    return resp.status >= 200 && resp.status < 400;
  } catch {
    return false;
  }
}

// Helper: Check a single external link with fast 1200ms timeout
interface LinkToTest {
  url: string;
  anchorText?: string;
  isNofollow?: boolean;
}

async function checkExternalLink(link: LinkToTest, timeoutMs = 1200): Promise<ExternalLinkCheckResult> {
  const start = Date.now();
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), timeoutMs);
    let resp: any;
    try {
      resp = await fetch(link.url, {
        method: 'HEAD',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
      if (resp.status === 405 || resp.status === 403) {
        resp = await fetch(link.url, {
          method: 'GET',
          signal: controller.signal,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
      }
    } catch (headErr: any) {
      if (headErr?.name === 'AbortError') {
        throw new Error('TIMEOUT');
      }
      resp = await fetch(link.url, {
        method: 'GET',
        signal: controller.signal,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
      });
    } finally {
      clearTimeout(timeout);
    }

    const duration = Date.now() - start;
    const status = resp.status;
    const isBroken = status === 404 || status >= 500;
    let errorType: ExternalLinkCheckResult['errorType'] = undefined;
    if (status === 404) errorType = 'not_found';
    else if (status >= 500) errorType = 'server_error';
    else if (status === 403) errorType = 'forbidden';

    return {
      url: link.url,
      anchorText: link.anchorText || '',
      statusCode: status,
      statusText: `${status} ${resp.statusText || ''}`.trim(),
      isBroken,
      errorType,
      responseTimeMs: duration,
      isNofollow: link.isNofollow,
      checkedAt: new Date().toISOString()
    };
  } catch (err: any) {
    const duration = Date.now() - start;
    const isTimeout = err?.message === 'TIMEOUT' || err?.name === 'AbortError';
    return {
      url: link.url,
      anchorText: link.anchorText || '',
      statusCode: 0,
      statusText: isTimeout ? 'انتهت المهلة (Timeout)' : 'تعذر الاتصال (Network Error)',
      isBroken: true,
      errorType: isTimeout ? 'timeout' : 'network_error',
      responseTimeMs: duration,
      isNofollow: link.isNofollow,
      checkedAt: new Date().toISOString()
    };
  }
}

// API: Health Check
app.get('/api/health', (_req: Request, res: Response) => {
  res.json({
    success: true,
    status: 'ok',
    service: 'RasidSEO Audit Server',
    domain: 'https://www.rasidseo.site',
    timestamp: new Date().toISOString()
  });
});

// API: Get Samples
app.get('/api/samples', (_req: Request, res: Response) => {
  res.json({
    success: true,
    samples: [
      { id: 'blog', name: 'مدونة تقنية متكاملة (مثال نموذجي)', url: 'https://al-arabi-tech.blog', score: 84 },
      { id: 'ecommerce_issues', name: 'متجر إلكتروني به أخطاء سيو حرجة', url: 'https://al-boutique-store.com', score: 59 }
    ]
  });
});

app.get('/api/sample/:id', (req: Request, res: Response) => {
  const sample = SAMPLE_AUDITS[req.params.id];
  if (sample) {
    res.json({ success: true, data: sample });
  } else {
    res.status(404).json({ success: false, error: 'النموذج غير موجود' });
  }
});

// API: Live SEO Audit
app.post('/api/audit', async (req: Request, res: Response) => {
  const { url: rawUrl, enableAi = true, turboMode = true, forceRefresh = false } = req.body;

  if (!rawUrl || typeof rawUrl !== 'string') {
    return res.status(400).json({ success: false, error: 'يرجى إدخال رابط صالح للموقع أو المدونة' });
  }

  const targetUrl = normalizeUrl(rawUrl);

  // Return sample if matching known sample domains
  if (targetUrl.includes('al-arabi-tech.blog')) {
    return res.json({ success: true, data: SAMPLE_AUDITS.blog });
  }
  if (targetUrl.includes('al-boutique-store.com')) {
    return res.json({ success: true, data: SAMPLE_AUDITS.ecommerce_issues });
  }

  let parsedUrl: URL;
  try {
    parsedUrl = new URL(targetUrl);
  } catch {
    return res.status(400).json({ success: false, error: 'صيغة الرابط غير صحيحة، يرجى كتابة عنوان مثل https://example.com' });
  }

  // High-Speed In-Memory Cache check (instant sub-millisecond response)
  const cacheKey = targetUrl.toLowerCase();
  if (!forceRefresh) {
    const cached = auditCache.get(cacheKey);
    if (cached && (Date.now() - cached.timestamp < CACHE_TTL_MS)) {
      return res.json({
        success: true,
        data: {
          ...cached.data,
          isCached: true,
          cachedAgeSeconds: Math.round((Date.now() - cached.timestamp) / 1000)
        }
      });
    }
  }

  try {
    const startTime = Date.now();
    const controller = new AbortController();
    const fetchTimeout = setTimeout(() => controller.abort(), turboMode ? 6000 : 10000);

    // Launch parallel probes for robots.txt & sitemap.xml concurrently with HTML fetch!
    const robotsPromise = probePath(targetUrl, '/robots.txt', turboMode ? 1400 : 2500);
    const sitemapPromise = probePath(targetUrl, '/sitemap.xml', turboMode ? 1400 : 2500);

    const response = await fetch(targetUrl, {
      method: 'GET',
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 RasidSEOBot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'ar,en-US;q=0.9,en;q=0.8'
      }
    });

    clearTimeout(fetchTimeout);
    const loadTimeMs = Date.now() - startTime;
    const statusCode = response.status;
    const finalUrl = response.url;
    const isHttps = finalUrl.startsWith('https://');

    // Extract headers
    const rawHeaders = response.headers;
    const hsts = rawHeaders.has('strict-transport-security');
    const xFrameOptions = rawHeaders.has('x-frame-options');
    const csp = rawHeaders.has('content-security-policy') || rawHeaders.has('content-security-policy-report-only');
    const xContentType = rawHeaders.has('x-content-type-options');

    const hstsValue = rawHeaders.get('strict-transport-security') || undefined;
    const cspValue = rawHeaders.get('content-security-policy') || rawHeaders.get('content-security-policy-report-only') || undefined;
    const xFrameOptionsValue = rawHeaders.get('x-frame-options') || undefined;
    const xContentTypeValue = rawHeaders.get('x-content-type-options') || undefined;
    const referrerPolicyValue = rawHeaders.get('referrer-policy') || undefined;
    const permissionsPolicyValue = rawHeaders.get('permissions-policy') || undefined;

    const html = await response.text();
    const pageSizeKb = Math.round(Buffer.byteLength(html, 'utf8') / 1024);

    // Parse HTML with cheerio
    const $ = cheerio.load(html);

    // Meta tag fallback for CSP
    const metaCsp = $('meta[http-equiv="Content-Security-Policy" i]').attr('content');
    const finalCsp = cspValue || metaCsp || undefined;

    // Deep analysis of Security Headers (CSP & HSTS) for XSS & MitM protection
    const securityHeadersAnalysis = analyzeSecurityHeaders({
      hsts: hstsValue,
      csp: finalCsp,
      xFrameOptions: xFrameOptionsValue,
      xContentTypeOptions: xContentTypeValue,
      referrerPolicy: referrerPolicyValue,
      permissionsPolicy: permissionsPolicyValue
    }, targetUrl);

    // Title
    const pageTitle = $('title').first().text().trim() || undefined;
    const titleLength = pageTitle ? pageTitle.length : 0;

    // Meta Description
    const metaDescription = $('meta[name="description" i]').attr('content')?.trim() || undefined;
    const descLength = metaDescription ? metaDescription.length : 0;

    // Canonical
    const canonicalUrl = $('link[rel="canonical" i]').attr('href')?.trim() || undefined;

    // Lang & Charset
    const lang = $('html').attr('lang') || undefined;
    const charset = $('meta[charset]').attr('charset') || $('meta[http-equiv="Content-Type" i]').attr('content') || undefined;

    // Viewport
    const viewport = $('meta[name="viewport" i]').attr('content');

    // Headings
    const h1Elements: string[] = [];
    $('h1').each((_, el) => {
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text) h1Elements.push(text);
    });

    const sampleHeadings: { tag: string; text: string }[] = [];
    $('h1, h2, h3').slice(0, 10).each((_, el) => {
      const tag = el.tagName.toLowerCase();
      const text = $(el).text().trim().replace(/\s+/g, ' ');
      if (text) sampleHeadings.push({ tag, text });
    });

    const headings: HeadingsAnalysis = {
      h1: h1Elements,
      h2Count: $('h2').length,
      h3Count: $('h3').length,
      h4Count: $('h4').length,
      sampleHeadings
    };

    // Images
    const imgElements = $('img');
    const totalImages = imgElements.length;
    let imagesWithAlt = 0;
    let imagesWithoutDimensions = 0;
    const missingAltSamples: { src: string }[] = [];

    imgElements.each((_, el) => {
      const alt = $(el).attr('alt');
      const src = $(el).attr('src') || $(el).attr('data-src') || '';
      const width = $(el).attr('width');
      const height = $(el).attr('height');
      if (!width || !height) {
        imagesWithoutDimensions++;
      }
      if (alt !== undefined && alt.trim().length > 0) {
        imagesWithAlt++;
      } else {
        if (missingAltSamples.length < 5 && src) {
          missingAltSamples.push({ src });
        }
      }
    });

    const images: ImagesAnalysis = {
      total: totalImages,
      withAlt: imagesWithAlt,
      withoutAlt: totalImages - imagesWithAlt,
      missingAltSamples
    };

    // Links
    const linkElements = $('a[href]');
    const totalLinks = linkElements.length;
    let internalLinks = 0;
    let externalLinks = 0;
    let nofollowLinks = 0;
    const rawExternalLinks: { url: string; anchorText: string; isNofollow: boolean }[] = [];
    const rawInternalLinks: { url: string; anchorText: string; isContextual: boolean; rel?: string }[] = [];
    const seenExternalUrls = new Set<string>();

    linkElements.each((_, el) => {
      const href = $(el).attr('href') || '';
      const rel = $(el).attr('rel') || '';
      const isNofollow = rel.includes('nofollow');
      if (isNofollow) {
        nofollowLinks++;
      }
      if (href.startsWith('#') || href.startsWith('javascript:') || href.startsWith('mailto:') || href.startsWith('tel:')) {
        return;
      }
      try {
        const linkUrl = new URL(href, targetUrl);
        if (linkUrl.hostname === parsedUrl.hostname) {
          internalLinks++;
          const parents = $(el).parents();
          let isContextual = false;
          parents.each((_, p) => {
            const tagName = p.tagName?.toLowerCase();
            if (['p', 'article', 'section', 'main'].includes(tagName)) {
              isContextual = true;
            }
          });
          parents.each((_, p) => {
            const tagName = p.tagName?.toLowerCase();
            if (['header', 'nav', 'footer'].includes(tagName)) {
              isContextual = false;
            }
          });

          rawInternalLinks.push({
            url: linkUrl.href,
            anchorText: $(el).text().replace(/\s+/g, ' ').trim().slice(0, 100),
            isContextual,
            rel
          });
        } else {
          externalLinks++;
          const cleanUrl = linkUrl.href;
          if (!seenExternalUrls.has(cleanUrl) && (cleanUrl.startsWith('http://') || cleanUrl.startsWith('https://'))) {
            seenExternalUrls.add(cleanUrl);
            rawExternalLinks.push({
              url: cleanUrl,
              anchorText: $(el).text().replace(/\s+/g, ' ').trim().slice(0, 80) || cleanUrl,
              isNofollow
            });
          }
        }
      } catch {
        internalLinks++;
        rawInternalLinks.push({
          url: href,
          anchorText: $(el).text().replace(/\s+/g, ' ').trim().slice(0, 100),
          isContextual: false,
          rel
        });
      }
    });

    const links: LinksAnalysis = {
      total: totalLinks,
      internal: internalLinks,
      external: externalLinks,
      nofollow: nofollowLinks
    };

    // Check sample of external links for broken links (404 / timeouts)
    const sampleLimit = turboMode ? 4 : 8;
    const linksToTest = rawExternalLinks.slice(0, sampleLimit);
    const checkedExternalLinksResults = await Promise.allSettled(
      linksToTest.map(link => checkExternalLink(link, turboMode ? 1200 : 2000))
    );
    const checkedExternalLinks: ExternalLinkCheckResult[] = checkedExternalLinksResults.map((r, i) => {
      if (r.status === 'fulfilled') {
        return r.value;
      }
      return {
        url: linksToTest[i].url,
        anchorText: linksToTest[i].anchorText,
        statusCode: 0,
        statusText: 'تعذر الاتصال',
        isBroken: true,
        errorType: 'network_error',
        responseTimeMs: 0,
        isNofollow: linksToTest[i].isNofollow,
        checkedAt: new Date().toISOString()
      };
    });

    const brokenLinksCount = checkedExternalLinks.filter(l => l.isBroken).length;
    const workingLinksCount = checkedExternalLinks.filter(l => !l.isBroken).length;

    const brokenLinksAnalysis: BrokenLinksAnalysis = {
      totalExternalChecked: checkedExternalLinks.length,
      brokenCount: brokenLinksCount,
      workingCount: workingLinksCount,
      warningCount: checkedExternalLinks.filter(l => l.statusCode === 403 || (l.statusCode && l.statusCode >= 300 && l.statusCode < 400)).length,
      links: checkedExternalLinks,
      summary: {
        brokenPercentage: checkedExternalLinks.length > 0 ? Math.round((brokenLinksCount / checkedExternalLinks.length) * 100) : 0,
        hasBrokenLinks: brokenLinksCount > 0,
        recommendationAr: brokenLinksCount > 0
          ? `تم رصد ${brokenLinksCount} روابط خارجية معطلة ترجع خطأ 404 أو غير متاحة. يوصى بتصحيحها فوراً للحفاظ على جودة السيو التقني.`
          : 'كافة الروابط الخارجية المفحوصة صالحة وتستجيب برمز 200 OK.'
      }
    };

    // Social & OpenGraph
    const social: SocialTags = {
      ogTitle: $('meta[property="og:title" i]').attr('content') || undefined,
      ogDescription: $('meta[property="og:description" i]').attr('content') || undefined,
      ogImage: $('meta[property="og:image" i]').attr('content') || undefined,
      ogType: $('meta[property="og:type" i]').attr('content') || undefined,
      ogUrl: $('meta[property="og:url" i]').attr('content') || undefined,
      twitterCard: $('meta[name="twitter:card" i]').attr('content') || undefined,
      twitterTitle: $('meta[name="twitter:title" i]').attr('content') || undefined,
      twitterDescription: $('meta[name="twitter:description" i]').attr('content') || undefined,
      twitterImage: $('meta[name="twitter:image" i]').attr('content') || undefined
    };

    // Schema detection & Structural Validation (JSON-LD)
    const schemaAnalysis = inspectJsonLdFromHtml(html, targetUrl);
    const schemasFound: string[] = schemaAnalysis.detectedTypes;

    // Resource & DOM footprint for Core Web Vitals
    const scriptsCount = $('script').length;
    const cssCount = $('link[rel="stylesheet"]').length;
    const domElementsCount = $('*').length;

    // Google Core Web Vitals (LCP, FID, CLS, TTFB, FCP, INP)
    const coreWebVitals = calculateCoreWebVitals({
      loadTimeMs,
      pageSizeKb,
      totalImages,
      imagesWithoutDimensions,
      scriptsCount,
      cssCount,
      domElementsCount,
      device: 'mobile'
    });

    // Content analysis (text length & word count)
    $('script, style, noscript, svg, nav, footer').remove();
    const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
    const words = bodyText.split(/\s+/).filter(Boolean);
    const wordCount = words.length;
    const textToHtmlRatio = Math.round((bodyText.length / Math.max(html.length, 1)) * 1000) / 10;

    // Keyword Density & Distribution Analysis
    const keywordsAnalysis = analyzeKeywordDensity(bodyText, {
      title: pageTitle,
      h1: headings.h1,
      description: metaDescription
    });

    // Internal Linking Structure Analysis
    const internalLinkingAnalysis = analyzeInternalLinking(rawInternalLinks, wordCount, targetUrl, headings.sampleHeadings);

    // Concurrently awaited probes for robots.txt & sitemap.xml
    const [robotsTxtFound, sitemapFound] = await Promise.all([
      robotsPromise,
      sitemapPromise
    ]);

    // Build Audit Items & Scoring
    const items: AuditItem[] = [];

    // 1. Title Tag
    if (!pageTitle) {
      items.push({
        id: 'title_missing',
        category: 'onpage',
        title: 'Title Tag Missing',
        titleAr: 'عنوان الصفحة (Title Tag) مفقود تماماً',
        status: 'error',
        score: 0,
        currentValue: 'غير موجود',
        idealValue: '50 - 60 حرفاً',
        descriptionAr: 'لا يوجد عنوان محدد للصفحة، مما يؤثر بشكل فادح على ظهور الموقع في محركات البحث.',
        impactAr: 'حرج',
        fixGuideAr: 'أضف وسم <title> معبّر داخل وسم <head> يحتوي على اسم الموقع والكلمة المفتاحية.',
        codeSnippet: `<title>${parsedUrl.hostname} | الكلمة المفتاحية للموقع</title>`
      });
    } else if (titleLength < 30) {
      items.push({
        id: 'title_short',
        category: 'onpage',
        title: 'Title Tag Too Short',
        titleAr: 'عنوان الصفحة قصير جداً',
        status: 'warning',
        score: 65,
        currentValue: `${titleLength} حرفاً ("${pageTitle}")`,
        idealValue: '50 - 60 حرفاً',
        descriptionAr: 'العنوان قصير، استغل المساحة المتاحة لإضافة عبارات وصفية دقيقة تجذب الباحثين.',
        impactAr: 'متوسط',
        fixGuideAr: 'قم بتوسيع العنوان ليشمل اسم المقال/المتجر متبوعاً بميزته التنافسية أو اسم البراند.'
      });
    } else if (titleLength > 65) {
      items.push({
        id: 'title_long',
        category: 'onpage',
        title: 'Title Tag Too Long',
        titleAr: 'عنوان الصفحة طويل وقد يتم اقتصاصه',
        status: 'warning',
        score: 75,
        currentValue: `${titleLength} حرفاً`,
        idealValue: '50 - 60 حرفاً',
        descriptionAr: 'العنوان يتجاوز 65 حرفاً مما قد يدفع جوجل لاقتطاعه بـ (...) في نتائج البحث.',
        impactAr: 'متوسط',
        fixGuideAr: 'احرص على ألا يتجاوز العنوان 60 حرفاً وضع الكلمات المفتاحية الأهم في البداية.'
      });
    } else {
      items.push({
        id: 'title_optimal',
        category: 'onpage',
        title: 'Title Tag Optimal',
        titleAr: 'عنوان الصفحة مثالي ومتوافق مع جوجل',
        status: 'pass',
        score: 100,
        currentValue: `${titleLength} حرفاً ("${pageTitle}")`,
        idealValue: '50 - 60 حرفاً',
        descriptionAr: 'طول العنوان مثالي وسيظهر بصورة كاملة وجذابة في نتائج البحث.',
        impactAr: 'حرج',
        fixGuideAr: 'ممتاز! العنوان متوازن وبطول مثالي.'
      });
    }

    // 2. Meta Description
    if (!metaDescription) {
      items.push({
        id: 'meta_description_missing',
        category: 'onpage',
        title: 'Meta Description Missing',
        titleAr: 'الوصف التعريفي (Meta Description) مفقود',
        status: 'error',
        score: 0,
        currentValue: 'غير موجود',
        idealValue: '120 - 160 حرفاً',
        descriptionAr: 'عدم وجود وصف تعريفي يجعل محركات البحث تقتطع نصوصاً عشوائية من الصفحة.',
        impactAr: 'حرج',
        fixGuideAr: 'أضف وسم meta description يوضح فائدة الصفحة ويحفز الزائر على النقر.',
        codeSnippet: '<meta name="description" content="اكتب هنا وصفاً دقيقاً وجذاباً للموقع أو المقال يتراوح بين 120 إلى 155 حرفاً." />'
      });
    } else if (descLength < 80) {
      items.push({
        id: 'meta_description_short',
        category: 'onpage',
        title: 'Meta Description Too Short',
        titleAr: 'الوصف التعريفي قصير جداً',
        status: 'warning',
        score: 60,
        currentValue: `${descLength} حرفاً`,
        idealValue: '120 - 160 حرفاً',
        descriptionAr: 'الوصف قصير جداً ولا يمنح الزائر المحتمل فكرة كافية عن محتوى الصفحة.',
        impactAr: 'متوسط',
        fixGuideAr: 'أضف مزيداً من التفاصيل وحثاً واضحاً على اتخاذ إجراء (CTA).'
      });
    } else if (descLength > 165) {
      items.push({
        id: 'meta_description_long',
        category: 'onpage',
        title: 'Meta Description Too Long',
        titleAr: 'الوصف التعريفي طويل وقد يقتطع',
        status: 'warning',
        score: 75,
        currentValue: `${descLength} حرفاً`,
        idealValue: '120 - 160 حرفاً',
        descriptionAr: 'الوصف طويل نسبياً وقد تقتطعه شاشات الهواتف الذكية.',
        impactAr: 'منخفض',
        fixGuideAr: 'اختصر الوصف ليكون في حدود 150 حرفاً لضمان ظهوره كاملاً على كافة الأجهزة.'
      });
    } else {
      items.push({
        id: 'meta_description_optimal',
        category: 'onpage',
        title: 'Meta Description Optimal',
        titleAr: 'الوصف التعريفي مثالي ومحدد',
        status: 'pass',
        score: 100,
        currentValue: `${descLength} حرفاً`,
        idealValue: '120 - 160 حرفاً',
        descriptionAr: 'طول الوصف متناسق ويغطي تفاصيل الصفحة بشكل فعال.',
        impactAr: 'حرج',
        fixGuideAr: 'ممتاز! الوصف يلتزم بأفضل معايير السيو الحديثة.'
      });
    }

    // 3. H1 Heading
    if (headings.h1.length === 0) {
      items.push({
        id: 'h1_missing',
        category: 'onpage',
        title: 'H1 Heading Missing',
        titleAr: 'وسم العنوان الرئيسي (H1) مفقود',
        status: 'error',
        score: 0,
        currentValue: 'لا يوجد وسم H1',
        idealValue: 'وسم H1 واحد رئيسي',
        descriptionAr: 'يعد وسم H1 أهم وسم هيكلي لفهم موضوع الصفحة في محركات البحث.',
        impactAr: 'حرج',
        fixGuideAr: 'أضف وسم <h1> واحداً فقط في قمة المحتوى يحتوي على الفكرة المحورية.',
        codeSnippet: '<h1>عنوان الصفحة أو المقال الرئيسي هنا</h1>'
      });
    } else if (headings.h1.length > 1) {
      items.push({
        id: 'h1_multiple',
        category: 'onpage',
        title: 'Multiple H1 Headings',
        titleAr: 'تكرار وسم H1 (يوجد أكثر من عنوان رئيسي)',
        status: 'error',
        score: 40,
        currentValue: `تم العثور على ${headings.h1.length} وسوم H1`,
        idealValue: 'وسم H1 واحد رئيسي فقط',
        descriptionAr: 'وجود أكثر من وسم H1 يشتت التركيز الدلالي للصفحة.',
        impactAr: 'حرج',
        fixGuideAr: 'احتفظ بوسم H1 رئيسي واحد فقط، وحوّل العناوين الأخرى إلى H2 أو H3.'
      });
    } else {
      items.push({
        id: 'h1_optimal',
        category: 'onpage',
        title: 'H1 Structure Optimal',
        titleAr: 'وسم H1 مضبوط بصورة صحيحة',
        status: 'pass',
        score: 100,
        currentValue: `"${headings.h1[0]}"`,
        idealValue: 'وسم H1 واحد',
        descriptionAr: 'تم تعيين وسم H1 واحد مميز يحدد موضوع الصفحة بوضوح.',
        impactAr: 'حرج',
        fixGuideAr: 'الهيكل التنظيمي للعنوان الرئيسي سليم.'
      });
    }

    // 4. Canonical
    if (!canonicalUrl) {
      items.push({
        id: 'canonical_missing',
        category: 'onpage',
        title: 'Canonical URL Missing',
        titleAr: 'الرابط المعياري (Canonical URL) غير محدد',
        status: 'warning',
        score: 50,
        currentValue: 'غير موجود',
        idealValue: 'رابط معياري canonical صالح',
        descriptionAr: 'عدم تحديد الرابط المعياري قد يؤدي لمشاكل تكرار المحتوى وتشتت سلطة الصفحة.',
        impactAr: 'متوسط',
        fixGuideAr: 'أضف وسم canonical داخل <head> للإشارة إلى النسخة الأصلية من الرابط.',
        codeSnippet: `<link rel="canonical" href="${targetUrl}" />`
      });
    } else {
      items.push({
        id: 'canonical_pass',
        category: 'onpage',
        title: 'Canonical URL Defined',
        titleAr: 'الرابط المعياري محدد بشكل صحيح',
        status: 'pass',
        score: 100,
        currentValue: canonicalUrl,
        idealValue: 'رابط معياري معرف',
        descriptionAr: 'تم تحديد الرابط المعياري لمنع الازدواجية وتوحيد قوة الترتيب.',
        impactAr: 'متوسط',
        fixGuideAr: 'الرابط المعياري يعمل بشكل سليم.'
      });
    }

    // 5. Mobile Viewport
    if (!viewport) {
      items.push({
        id: 'viewport_missing',
        category: 'technical',
        title: 'Viewport Tag Missing',
        titleAr: 'وسم العرض والتجاوب مع الهواتف (Viewport) مفقود',
        status: 'error',
        score: 0,
        currentValue: 'غير موجود',
        idealValue: 'width=device-width, initial-scale=1.0',
        descriptionAr: 'الموقع غير مهيأ للعرض التجاوبي على الهواتف الذكية وفق معايير Mobile-First.',
        impactAr: 'حرج',
        fixGuideAr: 'أضف وسم viewport في ترويسة الصفحة.',
        codeSnippet: '<meta name="viewport" content="width=device-width, initial-scale=1.0" />'
      });
    } else {
      items.push({
        id: 'viewport_pass',
        category: 'technical',
        title: 'Mobile Friendly Viewport',
        titleAr: 'الموقع مهيأ للتجاوب مع الهواتف الذكية (Mobile Viewport)',
        status: 'pass',
        score: 100,
        currentValue: viewport,
        idealValue: 'مفعّل ومهيأ للأجهزة المحمولة',
        descriptionAr: 'وسم التجاوب موجود ويتطابق مع متطلبات فهرسة جوجل الأولى للموبايل.',
        impactAr: 'حرج',
        fixGuideAr: 'إعداد ممتاز للتوافق مع شاشات الهواتف.'
      });
    }

    // 6. HTTPS & SSL
    if (!isHttps) {
      items.push({
        id: 'ssl_missing',
        category: 'security',
        title: 'Insecure HTTP Protocol',
        titleAr: 'الموقع لا يستخدم اتصال HTTPS مشفر',
        status: 'error',
        score: 0,
        currentValue: 'HTTP غير مشفر',
        idealValue: 'اتصال HTTPS مشفر بشهادة SSL سارية',
        descriptionAr: 'محركات البحث تصنف المواقع التي لا تستخدم HTTPS على أنها غير آمنة وتعاقبها في الترتيب.',
        impactAr: 'حرج',
        fixGuideAr: 'فعّل شهادة SSL مجانية عبر Let\'s Encrypt أو Cloudflare ووجّه كافة الزيارات إلى HTTPS.'
      });
    } else {
      items.push({
        id: 'ssl_pass',
        category: 'security',
        title: 'Secure HTTPS Active',
        titleAr: 'شهادة الأمان والاتصال المشفر (HTTPS) مفعلة',
        status: 'pass',
        score: 100,
        currentValue: 'اتصال مشفر وآمن',
        idealValue: 'HTTPS إلزامي',
        descriptionAr: 'الموقع محمي بشهادة SSL وينقل البيانات بشكل مشفر وآمن للزوار.',
        impactAr: 'حرج',
        fixGuideAr: 'حالة الأمان ممتازة.'
      });
    }

    // 7. Robots.txt
    if (!robotsTxtFound) {
      items.push({
        id: 'robots_missing',
        category: 'technical',
        title: 'Robots.txt Missing or Inaccessible',
        titleAr: 'ملف توجيه الروبوتات (Robots.txt) غير متاح',
        status: 'warning',
        score: 40,
        currentValue: 'غير موجود على المسار الرئيسي /robots.txt',
        idealValue: 'ملف robots.txt متاح بحالة 200 OK',
        descriptionAr: 'يوجه ملف robots.txt عناكب البحث نحو الصفحات المسموح بفهرستها ويحمي المسارات الحساسة.',
        impactAr: 'حرج',
        fixGuideAr: 'قم بإنشاء ملف robots.txt في المجلد الرئيسي واستشهد برابط خريطة الموقع.',
        codeSnippet: `User-agent: *\nAllow: /\n\nSitemap: ${parsedUrl.origin}/sitemap.xml`
      });
    } else {
      items.push({
        id: 'robots_pass',
        category: 'technical',
        title: 'Robots.txt Found',
        titleAr: 'ملف توجيه الروبوتات (Robots.txt) متاح ويعمل',
        status: 'pass',
        score: 100,
        currentValue: 'موجود ويعمل (200 OK)',
        idealValue: 'متاح ويسمح بالفهرسة',
        descriptionAr: 'تم العثور على ملف robots.txt وهو متاح لعناكب محركات البحث.',
        impactAr: 'حرج',
        fixGuideAr: 'إعداد سليم.'
      });
    }

    // 8. Sitemap.xml
    if (!sitemapFound) {
      items.push({
        id: 'sitemap_missing',
        category: 'technical',
        title: 'Sitemap.xml Missing or Inaccessible',
        titleAr: 'خريطة الموقع (Sitemap.xml) غير متاحة على المسار الافتراضي',
        status: 'warning',
        score: 45,
        currentValue: 'غير موجودة على /sitemap.xml',
        idealValue: 'خريطة موقع XML مفعلة ومحدثة',
        descriptionAr: 'تسرع خريطة الموقع أرشفة المقالات والصفحات الجديدة في جوجل بشكل كبير.',
        impactAr: 'حرج',
        fixGuideAr: 'أنشئ خريطة موقع بصيغة XML (عبر إضافة سيو مثل Yoast/RankMath أو مولد خريطة) وقدمها لـ Search Console.'
      });
    } else {
      items.push({
        id: 'sitemap_pass',
        category: 'technical',
        title: 'Sitemap.xml Active',
        titleAr: 'خريطة الموقع البرمجية (Sitemap.xml) متاحة',
        status: 'pass',
        score: 100,
        currentValue: 'مكتشفة بنجاح',
        idealValue: 'خريطة XML صالحة',
        descriptionAr: 'تتيح خريطة الموقع لعناكب البحث استكشاف وفهرسة كافة المقالات والصفحات بسهولة.',
        impactAr: 'حرج',
        fixGuideAr: 'خريطة الموقع جاهزة للاستكشاف.'
      });
    }

    // 8.1. Broken External Links (Technical SEO)
    if (brokenLinksCount > 0) {
      items.push({
        id: 'broken_external_links',
        category: 'technical',
        title: 'Broken External Links (404 / Inaccessible)',
        titleAr: `روابط خارجية معطلة ترجع خطأ 404 (${brokenLinksCount} من أصل ${checkedExternalLinks.length})`,
        status: 'error',
        score: Math.max(0, 100 - brokenLinksCount * 25),
        currentValue: `${brokenLinksCount} رابط خارجي معطل`,
        idealValue: '0 روابط خارجية معطلة (100% صالحة)',
        descriptionAr: 'تم اكتشاف روابط خارجية تقود إلى صفحات خطأ 404 أو تعذر في الاتصال. يؤدي ذلك إلى تجربة مستخدم سيئة وهدر في إشارات الثقة.',
        impactAr: 'حرج',
        fixGuideAr: 'قم بتحديث الروابط المعطلة بروابط بديلة صالحة، أو احذف الرابط المعطوب لحماية السيو التقني.',
        codeSnippet: '<!-- استبدل الرابط المعطل برابط بديل أو احذفه فوراً -->\n<a href="https://working-url.com" target="_blank" rel="noopener noreferrer">المصدر البديل</a>'
      });
    } else if (checkedExternalLinks.length > 0) {
      items.push({
        id: 'broken_external_links_pass',
        category: 'technical',
        title: 'External Links Health (200 OK)',
        titleAr: `سلامة الروابط الخارجية (${checkedExternalLinks.length} روابط مفحوصة تعمل بنجاح)`,
        status: 'pass',
        score: 100,
        currentValue: `جميع الروابط المفحوصة تستجيب بنجاح 200 OK`,
        idealValue: 'كافة الروابط الخارجية صالحة',
        descriptionAr: 'كافة الروابط الخارجية التي تم فحصها تعمل وتستجيب بكفاءة ولا تحتوي على صفحات مفقودة 404.',
        impactAr: 'متوسط',
        fixGuideAr: 'فحص الروابط الخارجية سليم تماماً.'
      });
    }

    // 9. Images Alt
    if (images.total > 0 && images.withoutAlt > 0) {
      const missingPct = Math.round((images.withoutAlt / images.total) * 100);
      items.push({
        id: 'images_missing_alt',
        category: 'content',
        title: 'Images Missing Alt Text',
        titleAr: `صور تفتقر للنص البديل (${images.withoutAlt} من أصل ${images.total})`,
        status: missingPct > 40 ? 'error' : 'warning',
        score: Math.max(0, 100 - missingPct),
        currentValue: `${images.withoutAlt} صورة بدون وسم alt (${missingPct}%)`,
        idealValue: '100% من الصور تحتوي على وسم alt معبّر',
        descriptionAr: 'النص البديل يساعد محركات البحث في فهم محتوى الصور وظهورها في بحث صور جوجل، كما يفيد ذوي الاحتياجات الخاصة.',
        impactAr: 'حرج',
        fixGuideAr: 'أضف خاصية alt="..." لكل صورة توضيحية مع وصف مختصر ودقيق.',
        codeSnippet: '<img src="path/to/image.jpg" alt="وصف مفصل لموضوع الصورة هنا" />'
      });
    } else if (images.total > 0) {
      items.push({
        id: 'images_alt_pass',
        category: 'content',
        title: 'All Images Have Alt Text',
        titleAr: 'جميع الصور مزودة بالنص البديل (Alt Attribute)',
        status: 'pass',
        score: 100,
        currentValue: `جميع الصور الـ ${images.total} تحتوي على نصوص بديلة`,
        idealValue: 'جميع الصور تمتلك خاصية alt',
        descriptionAr: 'كافة الصور مهيأة بشكل ممتاز للفهرسة في بحث الصور من جوجل.',
        impactAr: 'متوسط',
        fixGuideAr: 'عمل رائع في تهيئة وسائط الموقع!'
      });
    }

    // 10. Word Count
    if (wordCount < 300) {
      items.push({
        id: 'word_count_low',
        category: 'content',
        title: 'Low Word Count (Thin Content Risk)',
        titleAr: 'محتوى نصي قليل (مخاطر المحتوى الضعيف Thin Content)',
        status: 'warning',
        score: 50,
        currentValue: `${wordCount} كلمة فقط`,
        idealValue: 'أكثر من 600 كلمة للصفحات والمقالات العادية',
        descriptionAr: 'الصفحات ذات المحتوى النصي القليل قد تصنفها خوارزميات جوجل على أنها ضعيفة الفائدة (Thin Content).',
        impactAr: 'متوسط',
        fixGuideAr: 'أثري الصفحة بمزيد من الشروحات والمعلومات المفيدة التي تجيب على استفسارات الزائر.'
      });
    } else {
      items.push({
        id: 'word_count_pass',
        category: 'content',
        title: 'Good Word Count',
        titleAr: 'كثافة محتوى جيدة وغنية بالمعلومات',
        status: 'pass',
        score: 95,
        currentValue: `${wordCount} كلمة`,
        idealValue: 'أكثر من 500 كلمة',
        descriptionAr: 'الصفحة تحتوي على قدر كافٍ من المحتوى النصي لمساعدة محركات البحث في فهم سياقها بدقة.',
        impactAr: 'متوسط',
        fixGuideAr: 'المحتوى النصي كافٍ ومناسب للتصنيف.'
      });
    }

    // 10b. Keyword Density Audit Item
    const highDensityItems = keywordsAnalysis.topSingleKeywords.filter(k => k.status === 'high');
    const topKey = keywordsAnalysis.topSingleKeywords[0];
    if (highDensityItems.length > 0) {
      const stuffedWords = highDensityItems.map(k => `"${k.keyword}" (${k.density}%)`).join('، ');
      items.push({
        id: 'keyword_stuffing_warning',
        category: 'content',
        title: 'Excessive Keyword Density (Stuffing Risk)',
        titleAr: 'كثافة كلمات مفتاحية مرتفعة (مخاطر الحشو الزائد)',
        status: 'warning',
        score: 55,
        currentValue: `رصد حشو للكلمات: ${stuffedWords}`,
        idealValue: 'كثافة متوازنة بين 1.0% و 2.5% لكل كلمة رئيسية',
        descriptionAr: 'تكرار نفس الكلمات بنسب تفوق 3.5% يعرض الصفحة للتعثر أمام خوارزمية جوجل لجودة المحتوى (Helpful Content System).',
        impactAr: 'حرج',
        fixGuideAr: 'خفف تكرار الكلمات واستخدم مرادفات لغوية ومصطلحات LSI داعمة في متن المحتوى.'
      });
    } else if (topKey && topKey.density >= 0.8 && topKey.density <= 3.0) {
      items.push({
        id: 'keyword_density_optimal',
        category: 'content',
        title: 'Healthy Keyword Density',
        titleAr: 'توزيع وكثافة متوازنة للكلمات المفتاحية',
        status: 'pass',
        score: 95,
        currentValue: `الكلمة الأبرز "${topKey.keyword}" بنسبة ${topKey.density}%`,
        idealValue: 'بين 1.0% و 2.5% لتفادي الحشو',
        descriptionAr: 'معدل ظهور الكلمات المفتاحية طبيعي ومثالي لمطابقة نية الباحث دون أي حشو سلبي.',
        impactAr: 'متوسط',
        fixGuideAr: 'توزيع الكلمات متناسق ومطابق لمعايير السيو الحديثة.'
      });
    } else {
      items.push({
        id: 'keyword_density_low',
        category: 'content',
        title: 'Low Keyword Focus',
        titleAr: 'ضعف تركيز الكلمات المفتاحية في الصفحة',
        status: 'warning',
        score: 70,
        currentValue: 'لم يتم رصد تركيز كافٍ على كلمة مفتاحية محددة',
        idealValue: 'وجود كلمات أساسية بنسبة 1-2%',
        descriptionAr: 'المحتوى لا يبرز مصطلحات واضحة تتكرر بانتظام لتحديد نية البحث بدقة.',
        impactAr: 'متوسط',
        fixGuideAr: 'حدد الكلمات الرئيسية المستهدفة وأعد إدراجها بشكل سلس في فقرات المقال.'
      });
    }

    // 10b. Internal Linking Structure Analysis
    if (internalLinkingAnalysis.totalInternalLinks === 0) {
      items.push({
        id: 'internal_linking_none',
        category: 'content',
        title: 'No Internal Links Found',
        titleAr: 'غياب الروابط الداخلية في الصفحة',
        status: 'error',
        score: 25,
        currentValue: '0 روابط داخلية',
        idealValue: 'وجود شبكة روابط داخلية تعزز مسار الزائر وتمرر سلطة السيو',
        descriptionAr: 'الصفحة معزولة ولا تحتوي على أي روابط لصفحات الموقع الأخرى، مما يمنع زواحف البحث من استكشاف بقية الموقع.',
        impactAr: 'حرج',
        fixGuideAr: 'أضف روابط سياقية وتنقلية توجه الزائر إلى المقالات والأقسام ذات الصلة.'
      });
    } else if (internalLinkingAnalysis.linkHealthScore < 70) {
      items.push({
        id: 'internal_linking_needs_opt',
        category: 'content',
        title: 'Internal Linking Needs Optimization',
        titleAr: `هيكل الروابط الداخلية يحتاج تحسين (${internalLinkingAnalysis.linkHealthScore}/100)`,
        status: 'warning',
        score: internalLinkingAnalysis.linkHealthScore,
        currentValue: `${internalLinkingAnalysis.totalInternalLinks} رابط داخلي (${internalLinkingAnalysis.genericAnchorCount} نص رابط عام ضعيف)`,
        idealValue: 'روابط سياقية تحريرية بكلمات مفتاحية وصفية وتوزيع عنقودي',
        descriptionAr: `تم رصد ${internalLinkingAnalysis.genericAnchorCount} رابط بنصوص عامة (مثل "اضغط هنا" أو روابط فارغة) مع قلة الروابط السياقية في صلب المحتوى (${internalLinkingAnalysis.contextualLinksCount} رابط).`,
        impactAr: 'متوسط',
        fixGuideAr: 'استبدل النصوص العامة بكلمات دلالية وطبّق نموذج المجموعات العنقودية (Topic Clusters).'
      });
    } else {
      items.push({
        id: 'internal_linking_optimal',
        category: 'content',
        title: 'Strong Internal Linking Structure',
        titleAr: `هيكل الروابط الداخلية متميز (${internalLinkingAnalysis.totalInternalLinks} رابط)`,
        status: 'pass',
        score: internalLinkingAnalysis.linkHealthScore,
        currentValue: `${internalLinkingAnalysis.totalInternalLinks} رابط داخلي (${internalLinkingAnalysis.contextualLinksCount} سياقي في صلب النص)`,
        idealValue: 'ترابط عنقودي متكامل',
        descriptionAr: 'ترابط داخلي رائع يوزع قوة الصفحة (PageRank) على الصفحات الهامة والمقالات التكميلية بسلاسة.',
        impactAr: 'منخفض',
        fixGuideAr: 'استمر في تعزيز ترابط المقالات الجديدة عبر نموذج المجموعات العنقودية.'
      });
    }

    // 11. Schema Markup (Structured Data & Google Rich Results)
    if (schemaAnalysis.overallStatus === 'missing' || schemasFound.length === 0) {
      items.push({
        id: 'schema_missing',
        category: 'social',
        title: 'Structured Data Missing (Schema.org)',
        titleAr: 'البيانات المنظمة (Schema / JSON-LD) مفقودة',
        status: 'warning',
        score: 40,
        currentValue: 'لا يوجد ترميز Schema معتمد',
        idealValue: 'ترميز JSON-LD مطابق لنوع الموقع (Article / Product / WebSite)',
        descriptionAr: 'البيانات المنظمة تتيح لجوجل إبراز موقعك بنتائج منسقة غنية (Rich Snippets) مثل التقييمات وتفاصيل المقال وسعر المنتجات ومربع البحث.',
        impactAr: 'متوسط',
        fixGuideAr: 'أضف كود JSON-LD داخل الصفحة يعرف بنوع المحتوى لزيادة نسبة النقر إلى الظهور (CTR).',
        codeSnippet: `<script type="application/ld+json">\n{\n  "@context": "https://schema.org",\n  "@type": "WebSite",\n  "name": "${pageTitle || parsedUrl.hostname}",\n  "url": "${targetUrl}"\n}\n</script>`
      });
    } else if (schemaAnalysis.overallStatus === 'has_errors') {
      const errorMsg = schemaAnalysis.items.flatMap(it => it.issues.filter(i => i.severity === 'error')).map(i => i.messageAr).slice(0, 2).join(' · ');
      items.push({
        id: 'schema_structural_errors',
        category: 'social',
        title: 'Schema.org Structural Errors Detected',
        titleAr: `أخطاء هيكلية في بيانات Schema.org (${schemaAnalysis.errorCount} خطأ يمنع النتائج المنسقة)`,
        status: 'error',
        score: 35,
        currentValue: `${schemaAnalysis.errorCount} خطأ هيكلي في الترميزات: ${schemasFound.join(', ')}`,
        idealValue: 'ترميز سليم 100% بدون حقول مفقودة أو أخطاء صياغة',
        descriptionAr: `تم العثور على أخطاء هيكلية تمنع محرك بحث جوجل من تفعيل النتائج المنسقة الغنية: ${errorMsg || 'حقول إلزامية مفقودة أو خطأ برمجي'}.`,
        impactAr: 'حرج',
        fixGuideAr: 'افتح أداة فاحص Schema في قسم التواصل والبيانات المنظمة لتصحيح الحقول المفقودة واستبدال الكود.',
        codeSnippet: schemaAnalysis.items[0]?.rawJson
      });
    } else if (schemaAnalysis.overallStatus === 'has_warnings') {
      items.push({
        id: 'schema_warnings',
        category: 'social',
        title: 'Schema.org Detected with Improvements',
        titleAr: `تم الكشف عن ترميز Schema مع تحسينات موصى بها (${schemasFound.join(', ')})`,
        status: 'warning',
        score: 75,
        currentValue: `${schemaAnalysis.warningCount} ملاحظة تحسين في: ${schemasFound.join(', ')}`,
        idealValue: 'اكتمال الخصائص الموصى بها مثل الشعار والمؤلف وعروض الأسعار',
        descriptionAr: 'الترميز صالح هيكلياً ولكن ينقصه بعض الخصائص الموصى بها من جوجل لتعزيز المقتطفات الغنية وظهور لوحة المعرفة.',
        impactAr: 'متوسط',
        fixGuideAr: 'راجع التوصيات في أداة فاحص Schema أدناه لإضافة الخصائص التكميلية.'
      });
    } else {
      items.push({
        id: 'schema_pass',
        category: 'social',
        title: 'Structured Data Detected (Valid)',
        titleAr: `بيانات Schema.org سليمة 100% ومؤهلة للمقتطفات الغنية (${schemasFound.join(', ')})`,
        status: 'pass',
        score: 100,
        currentValue: schemasFound.join(' · '),
        idealValue: 'بيانات منظمة متوافقة ومعتمدة من جوجل',
        descriptionAr: 'الموقع يستخدم ترميزات Schema متكاملة وصالحة 100% مما يمنحه أفضلية للحصول على مقتطفات غنية في جوجل.',
        impactAr: 'متوسط',
        fixGuideAr: 'ممتاز! يمكنك أيضاً فحص الرابط مباشرة في أداة Google Rich Results Test للتأكد الإضافي.'
      });
    }

    // 12. OpenGraph / Social Sharing
    if (!social.ogTitle || !social.ogImage) {
      items.push({
        id: 'opengraph_incomplete',
        category: 'social',
        title: 'Incomplete Open Graph Tags',
        titleAr: 'وسوم المشاركة على منصات التواصل (Open Graph) غير مكتملة',
        status: 'warning',
        score: 55,
        currentValue: `${!social.ogTitle ? 'og:title مفقود · ' : ''}${!social.ogImage ? 'og:image مفقود' : ''}`,
        idealValue: 'og:title و og:image و og:description مكتملة',
        descriptionAr: 'غياب وسوم Open Graph يجعل الروابط تظهر بدون صورة أو عنوان جذاب عند مشاركتها على فيسبوك وتويتر وواتساب.',
        impactAr: 'متوسط',
        fixGuideAr: 'أضف وسوم Open Graph في ترويسة الصفحة لضمان بطاقة مشاركة احترافية.',
        codeSnippet: `<meta property="og:title" content="${pageTitle || ''}" />\n<meta property="og:description" content="${metaDescription || ''}" />\n<meta property="og:image" content="${parsedUrl.origin}/share-cover.jpg" />`
      });
    } else {
      items.push({
        id: 'opengraph_pass',
        category: 'social',
        title: 'Open Graph Tags Complete',
        titleAr: 'وسوم المشاركة الاجتماعية (Open Graph) مكتملة',
        status: 'pass',
        score: 100,
        currentValue: 'مكتملة ومجهزة بصورة وعنوان جذاب',
        idealValue: 'وسوم Open Graph صالحة',
        descriptionAr: 'الموقع مهيأ لعرض معاينات بصرية جذابة عند مشاركة الروابط في منصات التواصل.',
        impactAr: 'متوسط',
        fixGuideAr: 'البطاقات الاجتماعية مهيأة تماماً.'
      });
    }

    // 13. Speed / TTFB
    if (loadTimeMs > 1500) {
      items.push({
        id: 'ttfb_slow',
        category: 'performance',
        title: 'Slow Server Response Time',
        titleAr: 'زمن استجابة الخادم بطيء نسبياً',
        status: 'warning',
        score: 55,
        currentValue: `${loadTimeMs} مللي ثانية`,
        idealValue: 'أقل من 600 مللي ثانية',
        descriptionAr: 'بطء زمن استجابة الخادم يؤثر سلباً على تجربة المستخدم ومؤشرات أداء الويب الأساسية (Core Web Vitals).',
        impactAr: 'حرج',
        fixGuideAr: 'استخدم شبكة توزيع المحتوى CDN (مثل Cloudflare) وفعّل التخزين المؤقت للصفحات واستعلامات قاعدة البيانات.'
      });
    } else {
      items.push({
        id: 'ttfb_fast',
        category: 'performance',
        title: 'Fast Server Response',
        titleAr: 'زمن استجابة الخادم سريع ومثالي',
        status: 'pass',
        score: 95,
        currentValue: `${loadTimeMs} مللي ثانية`,
        idealValue: 'أقل من 600 مللي ثانية',
        descriptionAr: 'الخادم يستجيب بسرعة فائقة مما يدعم فهرسة صفحات الموقع بمرونة.',
        impactAr: 'متوسط',
        fixGuideAr: 'أداء الاستجابة متميز.'
      });
    }

    // 13b. Google Core Web Vitals - LCP
    items.push({
      id: 'cwv_lcp',
      category: 'performance',
      title: 'Largest Contentful Paint (LCP)',
      titleAr: 'أكبر رسم للمحتوى (LCP) - سرعة التحميل الأساسية',
      status: coreWebVitals.metrics.lcp.status === 'good' ? 'pass' : coreWebVitals.metrics.lcp.status === 'needs_improvement' ? 'warning' : 'error',
      score: coreWebVitals.metrics.lcp.status === 'good' ? 95 : coreWebVitals.metrics.lcp.status === 'needs_improvement' ? 65 : 40,
      currentValue: coreWebVitals.metrics.lcp.displayValue,
      idealValue: 'أقل من 2.5 ثانية',
      descriptionAr: coreWebVitals.metrics.lcp.descriptionAr,
      impactAr: 'حرج',
      fixGuideAr: 'قم بضغط وتنزيل صورة البانر مسبقاً (Preload Hero Image) مع تحويل الصور لصيغة WebP الحديثة واستخدام شبكة CDN.'
    });

    // 13c. Google Core Web Vitals - CLS
    items.push({
      id: 'cwv_cls',
      category: 'performance',
      title: 'Cumulative Layout Shift (CLS)',
      titleAr: 'التحول التراكمي للتخطيط (CLS) - الثبات البصري',
      status: coreWebVitals.metrics.cls.status === 'good' ? 'pass' : coreWebVitals.metrics.cls.status === 'needs_improvement' ? 'warning' : 'error',
      score: coreWebVitals.metrics.cls.status === 'good' ? 95 : coreWebVitals.metrics.cls.status === 'needs_improvement' ? 65 : 40,
      currentValue: coreWebVitals.metrics.cls.displayValue,
      idealValue: 'أقل من 0.1',
      descriptionAr: coreWebVitals.metrics.cls.descriptionAr,
      impactAr: 'حرج',
      fixGuideAr: 'حدد أبعاد width و height لجميع وسوم الصور ومقاطع الفيديو لمنع قفز العناصر أثناء التحميل وحجز مساحات للإعلانات.'
    });

    // 13d. Google Core Web Vitals - FID
    items.push({
      id: 'cwv_fid',
      category: 'performance',
      title: 'First Input Delay (FID)',
      titleAr: 'تأخير الإدخال الأول (FID) - سرعة التفاعل',
      status: coreWebVitals.metrics.fid.status === 'good' ? 'pass' : coreWebVitals.metrics.fid.status === 'needs_improvement' ? 'warning' : 'error',
      score: coreWebVitals.metrics.fid.status === 'good' ? 95 : coreWebVitals.metrics.fid.status === 'needs_improvement' ? 65 : 40,
      currentValue: coreWebVitals.metrics.fid.displayValue,
      idealValue: 'أقل من 100 مللي ثانية',
      descriptionAr: coreWebVitals.metrics.fid.descriptionAr,
      impactAr: 'متوسط',
      fixGuideAr: 'أجّل تحميل أكواد JavaScript غير الضرورية واستخدم سمات defer و async وتجزئة المهام الطويلة.'
    });

    // 14. Content Security Policy (CSP - XSS Protection)
    if (securityHeadersAnalysis.xssProtection.status === 'vulnerable') {
      items.push({
        id: 'csp_header_missing',
        category: 'security',
        title: 'Content Security Policy (CSP) Missing',
        titleAr: 'ترويسة أمان المحتوى (CSP) غير مفعلة - عرضة لهجمات XSS',
        status: 'error',
        score: 25,
        currentValue: 'ترويسة CSP مفقودة',
        idealValue: "default-src 'self'; script-src 'self' ...",
        descriptionAr: 'عدم تفعيل سياسة أمان المحتوى (CSP) يسمح بحقن ملفات برمجية خبيثة وسرقة ملفات تعريف الارتباط للزوار (Cross-Site Scripting).',
        impactAr: 'حرج',
        fixGuideAr: 'أضف ترويسة Content-Security-Policy في إعدادات الخادم لتقييد مصادر السكربتات الموثوقة فقط.'
      });
    } else if (securityHeadersAnalysis.xssProtection.status === 'partial') {
      items.push({
        id: 'csp_header_partial',
        category: 'security',
        title: 'Content Security Policy (CSP) Weak',
        titleAr: 'ترويسة CSP مفعلة ولكن تحتوي استثناءات خطرة (unsafe-inline)',
        status: 'warning',
        score: 65,
        currentValue: securityHeadersAnalysis.xssProtection.badgeAr,
        idealValue: 'سياسة صارمة بدون unsafe-inline أو نطاقات شاملة *',
        descriptionAr: 'ترويسة CSP مفعلة ولكنها تسمح بأكواد داخلية غير مقيدة (unsafe-inline) مما يقلل من فاعليتها أمام ثغرات XSS.',
        impactAr: 'متوسط',
        fixGuideAr: 'تخلص من وسوم unsafe-inline وانقل السكربتات لملفات خارجية أو استخدم Nonce/Hash.'
      });
    } else {
      items.push({
        id: 'csp_header_pass',
        category: 'security',
        title: 'Content Security Policy (CSP) Active',
        titleAr: 'ترويسة CSP مفعلة ومحصنة ضد هجمات XSS',
        status: 'pass',
        score: 95,
        currentValue: securityHeadersAnalysis.xssProtection.badgeAr,
        idealValue: 'سياسة CSP صارمة ومطابقة لأفضل الممارسات',
        descriptionAr: 'سياسة أمان المحتوى محكمة وتقيّد مصادر تحميل وتشغيل الأكواد البرمجية لحماية الزوار تماماً من XSS.',
        impactAr: 'منخفض',
        fixGuideAr: 'حالة الحماية ضد XSS ممتازة.'
      });
    }

    // 15. Strict Transport Security (HSTS - MitM Protection)
    if (securityHeadersAnalysis.mitmProtection.status === 'vulnerable') {
      items.push({
        id: 'hsts_header_missing',
        category: 'security',
        title: 'Strict-Transport-Security (HSTS) Missing',
        titleAr: 'ترويسة HSTS غير مفعلة - عرضة لهجمات MitM وتجريد SSL',
        status: 'error',
        score: 30,
        currentValue: 'ترويسة HSTS غير موجودة',
        idealValue: 'max-age=31536000; includeSubDomains; preload',
        descriptionAr: 'غياب HSTS يسمح للقراصنة في الشبكات المفتوحة بتجريد التشفير (SSL Stripping) والتنصت على بيانات المستخدمين.',
        impactAr: 'حرج',
        fixGuideAr: 'أضف ترويسة Strict-Transport-Security بمدة عام كامل (max-age=31536000).'
      });
    } else if (securityHeadersAnalysis.mitmProtection.status === 'partial') {
      items.push({
        id: 'hsts_header_partial',
        category: 'security',
        title: 'HSTS Needs Optimization',
        titleAr: `ترويسة HSTS مفعلة بمدة قصيرة (${securityHeadersAnalysis.mitmProtection.maxAgeDays || 0} يوم)`,
        status: 'warning',
        score: 70,
        currentValue: securityHeadersAnalysis.mitmProtection.badgeAr,
        idealValue: 'max-age=31536000 (سنة كاملة) مع includeSubDomains',
        descriptionAr: 'ترويسة HSTS مفعلة ولكن مدتها أقل من سنة كاملة أو تفتقر لتغطية النطاقات الفرعية (includeSubDomains).',
        impactAr: 'متوسط',
        fixGuideAr: 'ارفع مدة max-age إلى 31536000 ثانية واشمل النطاقات الفرعية.'
      });
    } else {
      items.push({
        id: 'hsts_header_pass',
        category: 'security',
        title: 'HSTS Active & Secure',
        titleAr: 'ترويسة HSTS مفعلة ومحصنة بالكامل ضد هجمات MitM',
        status: 'pass',
        score: 100,
        currentValue: securityHeadersAnalysis.mitmProtection.badgeAr,
        idealValue: 'max-age=31536000; includeSubDomains; preload',
        descriptionAr: 'الموقع يجبر المتصفحات على الاتصال المشفر دائماً بمدة عام كامل مع حماية كافة النطاقات الفرعية.',
        impactAr: 'منخفض',
        fixGuideAr: 'حالة الحماية ضد MitM مثالية.'
      });
    }

    // 16. Security Headers Overview
    const secHeadersCount = [hsts, xFrameOptions, csp, xContentType].filter(Boolean).length;
    if (secHeadersCount < 2) {
      items.push({
        id: 'security_headers_missing',
        category: 'security',
        title: 'Security Headers Missing',
        titleAr: 'ترويسات الحماية والأمان غير مفعلة بالكامل',
        status: 'warning',
        score: 50,
        currentValue: `مفعل ${secHeadersCount} من أصل 4 ترويسات أمان رئيسية`,
        idealValue: 'تفعيل HSTS, X-Frame-Options, X-Content-Type-Options, CSP',
        descriptionAr: 'حماية الموقع بترويسات HTTP قياسية تمنع محاولات تضمين الموقع في إطارات خبيثة وهجمات Clickjacking و XSS.',
        impactAr: 'متوسط',
        fixGuideAr: 'أضف ترويسات الأمان في خادمك (Nginx/Apache أو عبر Cloudflare).'
      });
    } else {
      items.push({
        id: 'security_headers_pass',
        category: 'security',
        title: 'Security Headers Active',
        titleAr: 'ترويسات الأمان مفعلة ومرضية',
        status: 'pass',
        score: 90,
        currentValue: `مفعل ${secHeadersCount} من 4 ترويسات أمان`,
        idealValue: 'ترويسات أمان قياسية',
        descriptionAr: 'الموقع يرسل ترويسات أمان قياسية لحماية المستخدمين من الثغرات الشائعة.',
        impactAr: 'منخفض',
        fixGuideAr: 'حالة الحماية جيدة.'
      });
    }

    // Category aggregation
    const calcCat = (catId: 'onpage' | 'technical' | 'content' | 'performance' | 'security' | 'social', name: string, nameAr: string, weight: number): CategoryScore => {
      const catItems = items.filter(it => it.category === catId);
      const passedCount = catItems.filter(it => it.status === 'pass').length;
      const warningCount = catItems.filter(it => it.status === 'warning').length;
      const errorCount = catItems.filter(it => it.status === 'error').length;
      const avgScore = catItems.length > 0 ? Math.round(catItems.reduce((acc, c) => acc + c.score, 0) / catItems.length) : 80;
      return {
        name,
        nameAr,
        score: avgScore,
        passedCount,
        warningCount,
        errorCount,
        weight
      };
    };

    const categories = {
      onpage: calcCat('onpage', 'On-Page SEO', 'السيو الداخلي', 25),
      technical: calcCat('technical', 'Technical SEO', 'السيو التقني', 20),
      content: calcCat('content', 'Content & Media', 'المحتوى والوسائط', 20),
      performance: calcCat('performance', 'Performance', 'السرعة والأداء', 15),
      security: calcCat('security', 'Security', 'الأمان والشهادات', 10),
      social: calcCat('social', 'Social & Schema', 'التواصل والبيانات المنظمة', 10)
    };

    // Calculate Overall Weighted Score
    const totalWeighted = (
      categories.onpage.score * 0.25 +
      categories.technical.score * 0.20 +
      categories.content.score * 0.20 +
      categories.performance.score * 0.15 +
      categories.security.score * 0.10 +
      categories.social.score * 0.10
    );
    const overallScore = Math.max(10, Math.min(100, Math.round(totalWeighted)));

    // Generate AI Advice if requested and possible
    let aiAdvice = undefined;
    if (enableAi && aiClient) {
      try {
        const errorSummaries = items
          .filter(it => it.status !== 'pass')
          .map(it => `- ${it.titleAr} (${it.impactAr}): ${it.currentValue}`)
          .join('\n');

        const prompt = `أنت خبير واستشاري سيو محترف (SEO Expert) متخصص في تدقيق المواقع والمدونات العربية والعالمية.
قم بتحليل نتائج الفحص التالية للموقع:
- الرابط: ${targetUrl}
- العنوان: ${pageTitle || 'مفقود'}
- الوصف: ${metaDescription || 'مفقود'}
- عدد الكلمات: ${wordCount}
- سرعة التحميل: ${loadTimeMs}ms
- عدد وسوم H1: ${headings.h1.length}
- صور بدون Alt: ${images.withoutAlt} من ${images.total}
- ملف Robots.txt: ${robotsTxtFound ? 'نعم' : 'لا'}
- خريطة الموقع: ${sitemapFound ? 'نعم' : 'لا'}
- بيانات Schema: ${schemasFound.join(', ') || 'لا يوجد'}

الأخطاء والتحذيرات المكتشفة:
${errorSummaries || 'لا توجد أخطاء جسيمة'}

المطلوب إرجاع رد بصيغة JSON حصراً بدون أي نصوص خارج الـ JSON بالشكل التالي:
{
  "summary": "فقرة موجزة من 3 إلى 4 أسطر تشخص حالة السيو للموقع بأسلوب استشاري راقٍ وعملي",
  "topPriorities": [
    "أولوية إصلاح أولى محددة وواضحة",
    "أولوية إصلاح ثانية محددة",
    "أولوية إصلاح ثالثة محددة"
  ],
  "keywordOpportunities": [
    "3 اقتراحات لكلمات مفتاحية ذهبية تناسب تخصص الموقع أو المدونة"
  ],
  "blogContentSuggestions": [
    "3 نصائح عملية لبناء وتطوير محتوى المدونة والمقالات للسيطرة على الصفحة الأولى في جوجل"
  ]
}`;

        // Strict timeout on Gemini AI consultation to never block the audit
        const aiTimeoutMs = turboMode ? 2200 : 4000;
        const aiTimeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('AI_TIMEOUT')), aiTimeoutMs)
        );

        const aiCallPromise = aiClient.models.generateContent({
          model: 'gemini-3.8-flash',
          contents: prompt
        });

        const aiResponse: any = await Promise.race([aiCallPromise, aiTimeoutPromise]);

        const aiText = aiResponse.text?.trim() || '';
        // Extract JSON
        const jsonMatch = aiText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiAdvice = JSON.parse(jsonMatch[0]);
        }
      } catch (aiErr) {
        // Fast fallback silently to instant smart rule-based advice
      }
    }

    // Fallback smart rule-based advice if AI is not enabled or failed
    if (!aiAdvice) {
      const urgentItems = items.filter(it => it.status === 'error');
      aiAdvice = {
        summary: `تم إكمال فحص الموقع بنجاح مع تحقيق نتيجة إجمالية ${overallScore} من 100. يمتلك الموقع بنية جيدة، ولكن يتطلب الانتباه العاجل لـ ${urgentItems.length} أخطاء حرجة تعيق أرشفته وتصدره للنتائج الأولى في محركات البحث.`,
        topPriorities: urgentItems.length > 0
          ? urgentItems.slice(0, 3).map(it => `معالجة ${it.titleAr}: ${it.fixGuideAr}`)
          : [
            'الاستمرار في تحديث خريطة الموقع ومراقبة الكلمات المفتاحية في Search Console.',
            'تحسين سرعة تحميل الصور باستخدام صيغ حديثة مثل WebP أو AVIF.',
            'توسيع شبكة الروابط الداخلية لدعم المقالات والصفحات العميقة.'
          ],
        keywordOpportunities: [
          `أفضل خدمات ${parsedUrl.hostname.replace('www.', '')}`,
          'دليل شامل ومراجعات مفصلة باللغة العربية',
          'نصائح تحسين محركات البحث وتجربة المستخدم'
        ],
        blogContentSuggestions: [
          'كتابة مقالات إرشادية مفصلة (Cornerstone Content) تغطي استفسارات الباحثين الرئيسية.',
          'استخدام عناوين فرعية H2 و H3 واضحة ومباشرة لتسهيل قراءة عناكب البحث للفقرات.',
          'تحديث التدوينات القديمة دورياً بمعلومات وأرقام السنة الحالية لزيادة معدل النقر CTR.'
        ]
      };
    }

    // 15. AI High-Intent Keywords Analysis (الكلمات الرئيسية ذات النية العالية لاستهدافها)
    const highIntentKeywords = generateHighIntentKeywords({
      url: targetUrl,
      title: pageTitle,
      description: metaDescription,
      headings: {
        h1: headings.h1,
        sampleHeadings: headings.sampleHeadings
      },
      bodyText,
      wordCount,
      topKeywords: (keywordsAnalysis?.topSingleKeywords || []).map(k => ({
        word: k.keyword,
        count: k.count,
        density: k.density
      }))
    });

    // 16. AI SEO 30-Day Execution Roadmap (خارطة طريق السيو 30 يوما)
    const roadmapPlan = generateSeoRoadmapPlan({
      url: targetUrl,
      overallScore,
      items
    });

    const auditResult: AuditResult = {
      url: targetUrl,
      analyzedAt: new Date().toISOString(),
      overallScore,
      loadTimeMs,
      statusCode,
      isHttps,
      pageTitle,
      metaDescription,
      canonicalUrl,
      lang,
      charset,
      wordCount,
      textToHtmlRatio,
      pageSizeKb,
      robotsTxtFound,
      sitemapFound,
      schemasFound,
      securityHeaders: {
        hsts,
        xFrameOptions,
        csp,
        xContentType
      },
      headings,
      images,
      links,
      social,
      categories,
      items,
      keywordsAnalysis,
      brokenLinksAnalysis,
      schemaAnalysis,
      coreWebVitals,
      internalLinkingAnalysis,
      securityHeadersAnalysis,
      highIntentKeywords,
      roadmapPlan,
      aiAdvice,
      isTurboMode: Boolean(turboMode)
    };

    // Cache result in in-memory cache (TTL: 5 min)
    auditCache.set(cacheKey, { data: auditResult, timestamp: Date.now() });

    return res.json({ success: true, data: auditResult });
  } catch (error: any) {
    console.error('Audit execution error:', error);
    return res.status(500).json({
      success: false,
      error: `تعذر الوصول للموقع أو فحصه (${error?.message || 'خطأ في الاتصال'}). يرجى التأكد من أن الرابط متاح على الإنترنت ولا يحجب عناكب الفحص.`
    });
  }
});

// API: Dedicated AI High-Intent Keywords Generation & Deep Refine
app.post('/api/ai/high-intent-keywords', async (req: Request, res: Response) => {
  try {
    const {
      url = '',
      pageTitle = '',
      metaDescription = '',
      headings = { h1: [], h2: [], h3: [] },
      bodyText = '',
      wordCount = 0,
      topKeywords = [],
      focusIntent = 'all',
      customFocus = ''
    } = req.body;

    // Baseline rule-based analysis
    const baseline = generateHighIntentKeywords({
      url,
      title: pageTitle,
      description: metaDescription,
      headings,
      bodyText,
      wordCount,
      topKeywords,
      focusIntent: focusIntent as any,
      customFocus
    });

    if (!aiClient) {
      return res.json({
        success: true,
        data: baseline,
        source: 'rule_based'
      });
    }

    try {
      const prompt = `أنت خبير واستشاري سيو عالمي متخصص في أبحاث الكلمات المفتاحية وتحليل نية البحث (Search Intent Optimization).
قم بتحليل محتوى الصفحة الحالي وتوليد قائمة استراتيجية بالكلمات الرئيسية ذات النية العالية (High-Intent Keywords) التي يجب استهدافها لتحقيق أعلى قفزة في الظهور العضوي (Organic Search Visibility) ونسب التحويل:

بيانات الصفحة:
- الرابط: ${url}
- العنوان (Title): ${pageTitle || 'غير محدد'}
- الوصف (Meta Description): ${metaDescription || 'غير محدد'}
- العناوين الرئيسية (H1): ${headings.h1?.join(' | ') || 'لا يوجد'}
- العناوين الفرعية (H2): ${headings.h2?.slice(0, 8).join(' | ') || 'لا يوجد'}
- عدد الكلمات: ${wordCount}
- عينة من نصوص ومحتوى الصفحة:
"${bodyText.slice(0, 1800)}"

خيارات التركيز والتخصيص:
- نية البحث المفضلة: ${focusIntent}
${customFocus ? `- تعليمات التركيز الإضافية: ${customFocus}` : ''}

المطلوب استخراج وتوليد قائمة من 6 إلى 8 كلمات مفتاحية ذات نية بحث عالية (تجارية استقصائية Commercial Investigation، أو شرائية إجرائية Transactional، أو معلوماتية متقدمة High Informational).
أرجع الرد بتنسيق JSON حصرياً وبالمخطط التالي:
{
  "targetTopicAr": "المجال أو التخصص الدقيق للصفحة",
  "pageSummaryAr": "ملخص تحليلي لمحتوى الصفحة والفرص العضوية المتاحة (سطرين)",
  "primaryGapAr": "تشخيص الفجوة الرئيسية في المحتوى الحالي مقارنة بنية الباحثين الأكثر ربحية",
  "keywords": [
    {
      "id": "hik_1",
      "keyword": "الكلمة المفتاحية المستهدفة بدقة",
      "intent": "commercial", // "commercial" أو "transactional" أو "informational_high"
      "intentLabelAr": "وصف النية باللغة العربية",
      "intentExplanationAr": "شرح سيكولوجية الباحث ولماذا هذه الكلمة تمتلك نية تحويل مرتفعة",
      "opportunityScore": 94, // رقم بين 60 و 99
      "difficulty": "easy", // "easy" أو "medium" أو "hard"
      "difficultyLabelAr": "سهل (تصدر سريع) | متوسط الصعوبة | منافسة قوية",
      "estimatedVolume": "3.5K - 7.2K / شهر",
      "cpcPotential": "premium", // "premium" أو "high" أو "medium"
      "cpcPotentialLabelAr": "عائد نقر استثنائي | عائد مرتفع | عائد معتدل",
      "contentGap": "missing", // "missing" أو "weak" أو "covered"
      "contentGapLabelAr": "فجوة محتوى (غير مغطاة) | مذكورة بضعف | مغطاة",
      "suggestedPlacement": "h2_heading", // "h2_heading" | "title_meta" | "first_paragraph" | "faq_schema" | "anchor_link"
      "suggestedPlacementLabelAr": "المكان المقترح بدقة في الصفحة",
      "actionableTipAr": "نصيحة سيو عملية ومباشرة لكيفية صياغة المحتوى لتخطي المنافسين",
      "readyHeadingAr": "عنوان مقترح جاهز للاستخدام الفوري كـ H2 في الصفحة",
      "searchQueries": ["بحث فرعي 1", "بحث فرعي 2", "بحث فرعي 3"]
    }
  ],
  "quickWinsAr": [
    "فرصة سريعة 1 جاهزة للتطبيق الفوري",
    "فرصة سريعة 2",
    "فرصة سريعة 3"
  ],
  "suggestedContentPlan": [
    {
      "titleAr": "عنوان مقال مقترح يستهدف الكلمة الأولى",
      "targetKeyword": "الكلمة المستهدفة",
      "h2Headings": ["عنوان H2 أول", "عنوان H2 ثاني", "عنوان H2 ثالث"],
      "faqQuestionAr": "سؤال شائع مع إجابته لوضعه في FAQ Schema"
    }
  ]
}`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = aiResponse.text?.trim() || '';
      const parsed = JSON.parse(responseText);

      const kws = Array.isArray(parsed.keywords) && parsed.keywords.length > 0 ? parsed.keywords : baseline.keywords;
      const comm = kws.filter((k: any) => k.intent === 'commercial').length;
      const trans = kws.filter((k: any) => k.intent === 'transactional').length;
      const info = kws.filter((k: any) => k.intent === 'informational_high' || k.intent === 'informational').length;

      const result: HighIntentKeywordsAnalysis = {
        generatedAt: new Date().toISOString(),
        pageSummaryAr: parsed.pageSummaryAr || baseline.pageSummaryAr,
        targetTopicAr: parsed.targetTopicAr || baseline.targetTopicAr,
        keywords: kws,
        intentDistribution: {
          commercial: comm,
          transactional: trans,
          informational: info
        },
        primaryGapAr: parsed.primaryGapAr || baseline.primaryGapAr,
        quickWinsAr: Array.isArray(parsed.quickWinsAr) ? parsed.quickWinsAr : baseline.quickWinsAr,
        suggestedContentPlan: Array.isArray(parsed.suggestedContentPlan) ? parsed.suggestedContentPlan : baseline.suggestedContentPlan
      };

      return res.json({
        success: true,
        data: result,
        source: 'gemini-3.8-flash'
      });
    } catch (aiErr: any) {
      console.warn('Gemini high-intent keywords error, using fallback:', aiErr?.message);
      return res.json({
        success: true,
        data: baseline,
        source: 'fallback'
      });
    }
  } catch (error: any) {
    console.error('High intent keywords endpoint error:', error);
    return res.status(500).json({ success: false, error: error?.message || 'فشل تحليل الكلمات المفتاحية' });
  }
});

// API: Check Broken External Links
app.post('/api/check-broken-links', async (req: Request, res: Response) => {
  try {
    const { links } = req.body;
    if (!Array.isArray(links) || links.length === 0) {
      return res.status(400).json({ success: false, error: 'يجب توفير قائمة بالروابط المراد فحصها.' });
    }

    const testList: LinkToTest[] = links.slice(0, 30).map((item: any) => ({
      url: typeof item === 'string' ? item : item.url,
      anchorText: typeof item === 'string' ? '' : item.anchorText,
      isNofollow: typeof item === 'string' ? false : !!item.isNofollow
    }));

    const resultsSettled = await Promise.allSettled(
      testList.map(item => checkExternalLink(item))
    );

    const results: ExternalLinkCheckResult[] = resultsSettled.map((r, i) => {
      if (r.status === 'fulfilled') return r.value;
      return {
        url: testList[i].url,
        anchorText: testList[i].anchorText || '',
        statusCode: 0,
        statusText: 'تعذر الاتصال',
        isBroken: true,
        errorType: 'network_error',
        responseTimeMs: 0,
        isNofollow: testList[i].isNofollow,
        checkedAt: new Date().toISOString()
      };
    });

    const brokenCount = results.filter(r => r.isBroken).length;
    const workingCount = results.filter(r => !r.isBroken).length;

    const analysis: BrokenLinksAnalysis = {
      totalExternalChecked: results.length,
      brokenCount,
      workingCount,
      warningCount: results.filter(l => l.statusCode === 403 || (l.statusCode && l.statusCode >= 300 && l.statusCode < 400)).length,
      links: results,
      summary: {
        brokenPercentage: results.length > 0 ? Math.round((brokenCount / results.length) * 100) : 0,
        hasBrokenLinks: brokenCount > 0,
        recommendationAr: brokenCount > 0
          ? `تم رصد ${brokenCount} روابط خارجية معطلة ترجع خطأ 404 أو غير متاحة. يوصى بإصلاحها فوراً.`
          : 'كافة الروابط التي تم فحصها تعمل وتستجيب بشكل سليم (200 OK).'
      }
    };

    return res.json({ success: true, results, analysis });
  } catch (error: any) {
    console.error('Error in check-broken-links:', error);
    return res.status(500).json({ success: false, error: 'حدث خطأ أثناء فحص الروابط' });
  }
});

// API: Validate custom Schema.org (JSON-LD)
app.post('/api/validate-schema', (req: Request, res: Response) => {
  try {
    const { jsonText } = req.body;
    if (!jsonText || typeof jsonText !== 'string') {
      return res.status(400).json({ success: false, error: 'يرجى إرسال كود JSON-LD نصي صالح للفحص.' });
    }
    const analysis = inspectJsonLdText(jsonText);
    return res.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error('Error in validate-schema:', error);
    return res.status(500).json({ success: false, error: error?.message || 'فشل فحص كود الـ Schema.' });
  }
});

// API: Simulate Core Web Vitals optimization scenarios
app.post('/api/simulate-cwv', (req: Request, res: Response) => {
  try {
    const {
      loadTimeMs,
      pageSizeKb,
      totalImages,
      imagesWithoutDimensions,
      scriptsCount,
      cssCount,
      domElementsCount,
      device
    } = req.body;

    const analysis = calculateCoreWebVitals({
      loadTimeMs: Number(loadTimeMs) || 350,
      pageSizeKb: Number(pageSizeKb) || 450,
      totalImages: Number(totalImages) || 0,
      imagesWithoutDimensions: Number(imagesWithoutDimensions) || 0,
      scriptsCount: Number(scriptsCount) || 6,
      cssCount: Number(cssCount) || 3,
      domElementsCount: Number(domElementsCount) || 800,
      device: device === 'desktop' ? 'desktop' : 'mobile'
    });

    return res.json({ success: true, data: analysis });
  } catch (error: any) {
    console.error('Error in simulate-cwv:', error);
    return res.status(500).json({ success: false, error: 'فشل محاكاة مؤشرات الأداء' });
  }
});

// API: Code generator for instant fixes
app.post('/api/generate-fix', (req: Request, res: Response) => {
  const { type, title, description, url, siteName } = req.body;
  const siteUrl = url || 'https://example.com';
  const name = siteName || 'اسم الموقع';

  let code = '';
  if (type === 'meta') {
    code = `<!-- وسوم السيو الأساسية -->
<title>${title || 'عنوان الصفحة المخصص | اسم الموقع'}</title>
<meta name="description" content="${description || 'الوصف التعريفي المخصص للموقع يوضح مميزاته في 120 إلى 155 حرفاً.'}" />
<link rel="canonical" href="${siteUrl}" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="index, follow" />

<!-- وسوم منصات التواصل (Open Graph) -->
<meta property="og:type" content="website" />
<meta property="og:title" content="${title || 'عنوان الموقع'}" />
<meta property="og:description" content="${description || 'وصف الموقع'}" />
<meta property="og:url" content="${siteUrl}" />
<meta property="og:site_name" content="${name}" />
<meta property="og:image" content="${siteUrl}/og-image.jpg" />

<!-- وسوم تويتر (Twitter Cards) -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title || 'عنوان الموقع'}" />
<meta name="twitter:description" content="${description || 'وصف الموقع'}" />
<meta name="twitter:image" content="${siteUrl}/og-image.jpg" />`;
  } else if (type === 'schema') {
    code = `<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "WebSite",
  "name": "${name}",
  "url": "${siteUrl}",
  "description": "${description || 'وصف الموقع'}",
  "potentialAction": {
    "@type": "SearchAction",
    "target": "${siteUrl}/search?q={search_term_string}",
    "query-input": "required name=search_term_string"
  }
}
</script>`;
  } else if (type === 'robots') {
    code = `# ملف Robots.txt قياسي متوافق مع معايير محركات البحث
User-agent: *
Allow: /

# استبعاد المسارات الإدارية والخاصة
Disallow: /admin/
Disallow: /wp-admin/
Disallow: /login/
Disallow: /cart/
Disallow: /checkout/

# رابط خريطة الموقع
Sitemap: ${siteUrl}/sitemap.xml`;
  }

  res.json({ success: true, code });
});

// In-memory store for Scheduled Audit Subscriptions
const scheduledSubscriptions: ScheduledAuditSubscription[] = [
  {
    id: 'sub_demo_1',
    email: 'admin@al-arabi-tech.blog',
    url: 'https://al-arabi-tech.blog',
    siteName: 'عالم التقنية والذكاء الاصطناعي',
    frequency: 'weekly',
    dayOfWeek: 1, // Monday
    timeOfDay: '09:00',
    alertOnScoreDrop: true,
    scoreThreshold: 80,
    includeCoreWebVitals: true,
    includeBrokenLinks: true,
    includeAiRecommendations: true,
    status: 'active',
    createdAt: new Date(Date.now() - 14 * 86400000).toISOString(),
    lastSentAt: new Date(Date.now() - 7 * 86400000).toISOString(),
    nextScheduledAt: new Date(Date.now() + 2 * 86400000).toISOString(),
    totalReportsSent: 2
  }
];

// API: Get active scheduled audits
app.get('/api/scheduled-audits', (req: Request, res: Response) => {
  const { url, email } = req.query;
  let list = scheduledSubscriptions;
  if (url && typeof url === 'string') {
    list = list.filter(s => s.url.toLowerCase() === url.toLowerCase());
  }
  if (email && typeof email === 'string') {
    list = list.filter(s => s.email.toLowerCase() === email.toLowerCase());
  }
  return res.json({ success: true, subscriptions: list });
});

// API: Create or update scheduled audit subscription
app.post('/api/scheduled-audits', (req: Request, res: Response) => {
  try {
    const {
      email,
      url,
      siteName,
      frequency = 'weekly',
      dayOfWeek = 1,
      timeOfDay = '09:00',
      alertOnScoreDrop = true,
      scoreThreshold = 80,
      includeCoreWebVitals = true,
      includeBrokenLinks = true,
      includeAiRecommendations = true
    } = req.body;

    if (!email || typeof email !== 'string' || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'يرجى إدخال عنوان بريد إلكتروني صالح.' });
    }

    if (!url || typeof url !== 'string') {
      return res.status(400).json({ success: false, error: 'يرجى إدخال رابط موقع صالح للمراقبة.' });
    }

    const existingIdx = scheduledSubscriptions.findIndex(
      s => s.email.toLowerCase() === email.toLowerCase() && s.url.toLowerCase() === url.toLowerCase()
    );

    let daysToAdd = 7;
    if (frequency === 'daily') daysToAdd = 1;
    else if (frequency === 'biweekly') daysToAdd = 14;
    else if (frequency === 'monthly') daysToAdd = 30;

    const nextScheduledAt = new Date(Date.now() + daysToAdd * 86400000).toISOString();

    let cleanName = siteName;
    if (!cleanName) {
      try {
        cleanName = new URL(url.startsWith('http') ? url : `https://${url}`).hostname;
      } catch {
        cleanName = url;
      }
    }

    const subscriptionItem: ScheduledAuditSubscription = {
      id: existingIdx >= 0 ? scheduledSubscriptions[existingIdx].id : `sub_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
      email: email.trim().toLowerCase(),
      url: url.trim(),
      siteName: cleanName,
      frequency,
      dayOfWeek: Number(dayOfWeek),
      timeOfDay: timeOfDay || '09:00',
      alertOnScoreDrop: Boolean(alertOnScoreDrop),
      scoreThreshold: Number(scoreThreshold) || 80,
      includeCoreWebVitals: Boolean(includeCoreWebVitals),
      includeBrokenLinks: Boolean(includeBrokenLinks),
      includeAiRecommendations: Boolean(includeAiRecommendations),
      status: 'active',
      createdAt: existingIdx >= 0 ? scheduledSubscriptions[existingIdx].createdAt : new Date().toISOString(),
      lastSentAt: existingIdx >= 0 ? scheduledSubscriptions[existingIdx].lastSentAt : undefined,
      nextScheduledAt,
      totalReportsSent: existingIdx >= 0 ? scheduledSubscriptions[existingIdx].totalReportsSent : 0
    };

    if (existingIdx >= 0) {
      scheduledSubscriptions[existingIdx] = subscriptionItem;
    } else {
      scheduledSubscriptions.unshift(subscriptionItem);
    }

    return res.json({
      success: true,
      message: 'تم حفظ اشتراك الجدولة الدورية بنجاح.',
      subscription: subscriptionItem
    });
  } catch (error: any) {
    console.error('Error creating scheduled audit:', error);
    return res.status(500).json({ success: false, error: error?.message || 'فشل حفظ الجدولة' });
  }
});

// API: Toggle subscription status (active/paused)
app.patch('/api/scheduled-audits/:id/toggle', (req: Request, res: Response) => {
  const { id } = req.params;
  const sub = scheduledSubscriptions.find(s => s.id === id);
  if (!sub) {
    return res.status(404).json({ success: false, error: 'الاشتراك غير موجود.' });
  }
  sub.status = sub.status === 'active' ? 'paused' : 'active';
  return res.json({ success: true, subscription: sub });
});

// API: Delete scheduled audit subscription
app.delete('/api/scheduled-audits/:id', (req: Request, res: Response) => {
  const { id } = req.params;
  const idx = scheduledSubscriptions.findIndex(s => s.id === id);
  if (idx === -1) {
    return res.status(404).json({ success: false, error: 'الاشتراك غير موجود.' });
  }
  const removed = scheduledSubscriptions.splice(idx, 1)[0];
  return res.json({ success: true, message: 'تم إلغاء الاشتراك المجدول بنجاح.', removed });
});

// API: Send test report email immediately
app.post('/api/scheduled-audits/test-send', (req: Request, res: Response) => {
  try {
    const { email, url, auditData } = req.body;
    if (!email || !email.includes('@')) {
      return res.status(400).json({ success: false, error: 'يرجى تقديم بريد إلكتروني صالح.' });
    }

    const target = url || (auditData?.url || 'https://example.com');
    const score = auditData?.overallScore || 85;
    const siteTitle = auditData?.pageTitle || target;

    const sub = scheduledSubscriptions.find(s => s.email.toLowerCase() === email.toLowerCase() && s.url.toLowerCase() === target.toLowerCase());
    if (sub) {
      sub.lastSentAt = new Date().toISOString();
      sub.totalReportsSent += 1;
    }

    const deliveryTimestamp = new Date().toISOString();
    const deliveryId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;

    return res.json({
      success: true,
      message: `تم إرسال ملخص تقرير السيو التجريبي بنجاح إلى ${email}`,
      delivery: {
        id: deliveryId,
        recipient: email,
        subject: `📊 ملخص تقرير السيو الدوري لـ ${siteTitle} (النتيجة: ${score}/100)`,
        sentAt: deliveryTimestamp,
        simulated: true
      }
    });
  } catch (error: any) {
    console.error('Error in test-send report:', error);
    return res.status(500).json({ success: false, error: error?.message || 'فشل إرسال التقرير التجريبي.' });
  }
});

// API: Export Scheduled Audit Calendar as .ics file
app.get('/api/scheduled-audits/export-ics', (req: Request, res: Response) => {
  try {
    const { url = 'https://example.com', siteName, frequency = 'weekly', dayOfWeek = '1', timeOfDay = '09:00' } = req.query;
    const cleanUrl = String(url);
    const displayName = siteName ? String(siteName) : cleanUrl;
    const freq = String(frequency);
    const day = parseInt(String(dayOfWeek), 10) || 1;
    const [h, m] = String(timeOfDay).split(':').map(v => parseInt(v, 10) || 0);

    const now = new Date();
    const startDate = new Date();
    startDate.setHours(h, m, 0, 0);

    const pad = (n: number) => (n < 10 ? `0${n}` : `${n}`);
    const formatIcs = (d: Date) =>
      d.getUTCFullYear() +
      pad(d.getUTCMonth() + 1) +
      pad(d.getUTCDate()) +
      'T' +
      pad(d.getUTCHours()) +
      pad(d.getUTCMinutes()) +
      pad(d.getUTCSeconds()) +
      'Z';

    const dayCodes = ['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'];
    const currentDay = startDate.getDay();
    let daysToAdd = (day - currentDay + 7) % 7;
    if (daysToAdd === 0 && startDate.getTime() <= now.getTime()) {
      daysToAdd = 7;
    }
    startDate.setDate(startDate.getDate() + daysToAdd);
    const endDate = new Date(startDate.getTime() + 30 * 60 * 1000);

    let rrule = `RRULE:FREQ=WEEKLY;INTERVAL=1;BYDAY=${dayCodes[day] || 'MO'}`;
    if (freq === 'daily') rrule = 'RRULE:FREQ=DAILY;INTERVAL=1';
    else if (freq === 'biweekly') rrule = `RRULE:FREQ=WEEKLY;INTERVAL=2;BYDAY=${dayCodes[day] || 'MO'}`;
    else if (freq === 'monthly') rrule = 'RRULE:FREQ=MONTHLY;INTERVAL=1';

    const icsLines = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//RasidSEO//Scheduled Audits Calendar//AR',
      'CALSCALE:GREGORIAN',
      'METHOD:PUBLISH',
      'X-WR-CALNAME:مواعيد فحص السيو الدورية',
      'BEGIN:VEVENT',
      `UID:audit-${Date.now()}@rasidseo.app`,
      `DTSTAMP:${formatIcs(now)}`,
      `DTSTART:${formatIcs(startDate)}`,
      `DTEND:${formatIcs(endDate)}`,
      rrule,
      `SUMMARY:[راصد السيو] فحص دوري لموقع ${displayName.replace(/[,;\\]/g, ' ')}`,
      `DESCRIPTION:موعد فحص السيو الدوري المجدول لموقع: ${cleanUrl}\\nتفقد مؤشرات Core Web Vitals والروابط المعطلة 404 وتوصيات الذكاء الاصطناعي.`,
      `LOCATION:${cleanUrl}`,
      'STATUS:CONFIRMED',
      'BEGIN:VALARM',
      'TRIGGER:-PT15M',
      'ACTION:DISPLAY',
      `DESCRIPTION:تذكير: موعد فحص السيو الدوري لموقع ${displayName.replace(/[,;\\]/g, ' ')}`,
      'END:VALARM',
      'END:VEVENT',
      'END:VCALENDAR'
    ];

    const host = cleanUrl.replace(/^https?:\/\//, '').replace(/[^a-zA-Z0-9_-]/g, '_').slice(0, 30) || 'website';
    res.setHeader('Content-Type', 'text/calendar; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="seo-audit-${host}.ics"`);
    return res.send(icsLines.join('\r\n'));
  } catch (err: any) {
    return res.status(500).json({ success: false, error: err?.message || 'فشل توليد ملف التقويم' });
  }
});

// API: Deep AI fix advice for a specific checklist item
app.post('/api/ai-item-tip', async (req: Request, res: Response) => {
  try {
    const { item, url, siteName } = req.body;
    if (!item) {
      return res.status(400).json({ success: false, error: 'بيانات المعيار مطلوبة.' });
    }

    if (aiClient && process.env.GEMINI_API_KEY) {
      const prompt = `أنت خبير سيو ومطور ويب خبير. لديك معيار السيو التالي الذي تم فحصه لموقع ${siteName || url || 'الموقع'}:
المعيار: ${item.titleAr || item.title}
الحالة: ${item.status === 'error' ? 'خطأ حرج' : item.status === 'warning' ? 'تحسين مطلوب' : 'ناجح'}
القيمة الحالية المرصودة في كود الموقع: ${item.currentValue || 'غير محدد'}
القيمة المثالية: ${item.idealValue || 'غير محدد'}
الوصف: ${item.descriptionAr || ''}
طريقة الإصلاح المبدئية: ${item.fixGuideAr || ''}

المطلوب: قدم نصيحة ذكاء اصطناعي محددة جداً ودقيقة للمطور لكيفية إصلاح هذا المعيار في كود الموقع بالتحديد.
قدم كوداً برمجياً دقيقاً جاهزاً للنسخ والتطبيق يحل المشكلة مباشرة (مثل قالب HTML مع alt للصور المفقودة، أو هيكل وسم meta، أو ترويسة أمان).
أعد النتيجة بصيغة JSON حصراً بهذا الهيكل:
{
  "headlineAr": "عنوان موجز ومباشر لطريقة الإصلاح",
  "codeContextAr": "تشخيص دقيق لما تم رصده في كود الصفحة",
  "stepByStepActionAr": "خطوات تنفيذية واضحة 1، 2، 3",
  "codeSnippet": "الكود البرمجي الرئيسي الجاهز للنسخ والتطبيق",
  "codeLanguage": "html أو css أو apache أو nginx أو json أو tsx",
  "whereToPutAr": "أين يوضع هذا الكود بالتحديد في ملفات الموقع",
  "expectedImpactAr": "الأثر المتوقع على السيو وترتيب جوجل",
  "proTipAr": "نصيحة ذهبية إضافية من خبرة سيو عملية",
  "solutions": [
    {
      "title": "قالب HTML 5 القياسي",
      "language": "html",
      "description": "تطبيق الكود في قالب HTML القياسي",
      "code": "كود HTML جاهز"
    },
    {
      "title": "Next.js / React",
      "language": "tsx",
      "description": "تطبيق الكود في بيئة React أو Next.js",
      "code": "كود Next.js أو React"
    }
  ]
}`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = aiResponse.text?.trim() || '';
      const parsed = JSON.parse(responseText);
      return res.json({ success: true, tip: parsed, source: 'gemini-3.8-flash' });
    }

    return res.json({ success: false, message: 'Gemini not configured' });
  } catch (err: any) {
    console.error('Error in /api/ai-item-tip:', err);
    return res.status(500).json({ success: false, error: err?.message || 'فشل توليد نصيحة الذكاء الاصطناعي' });
  }
});

// AI Auto-Categorize Endpoint for CustomCategoriesModal
app.post('/api/ai-auto-categorize', async (req: Request, res: Response) => {
  try {
    const { items, existingCategories, url } = req.body;
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'قائمة المعايير المراد تصنيفها مطلوبة.' });
    }

    if (aiClient && process.env.GEMINI_API_KEY) {
      const itemsBrief = items.map((i: any) => ({
        id: i.id,
        title: i.titleAr || i.title,
        status: i.status === 'error' ? 'خطأ حرج' : i.status === 'warning' ? 'تحسين' : 'ناجح',
        impact: i.impactAr || i.impact,
        category: i.category,
        description: i.descriptionAr
      }));

      const existingNames = (existingCategories || []).map((c: any) => c.name).join('، ');

      const prompt = `أنت خبير استشاري متقدم في هندسة السيو وإدارة مشاريع الويب وسير عمل فرق العمل (DevOps, Frontend, Content, Performance).
لديك قائمة بمعايير فحص السيو التالية لموقع ${url || 'الموقع'}:
${JSON.stringify(itemsBrief, null, 2)}

التصنيفات المخصصة الموجودة حالياً بالمشروع (إن وجدت): ${existingNames || 'لا يوجد بعد'}.

المطلوب:
حلل طبيعة الأخطاء والمعايير المذكورة وصنفها إلى مجموعات وتصنيفات ذكية مقترحة لتسهيل توزيع المهام على الفرق المتخصصة وتحديد أولويات الإصلاح.
صنف العناصر بناءً على طبيعة المشكلة (مثل: أخطاء تقنية وهيكلية، مشاكل محتوى وتحرير، معايير سرعة وأداء Core Web Vitals، أمان وتشفير، أو أولويات عاجلة Sprint).

أعد النتيجة بصيغة JSON حصراً بهذا الهيكل الدقيق:
{
  "suggestions": [
    {
      "id": "معرف فريد للتصنيف مثل cat-tech-1",
      "name": "اسم التصنيف بالعربية (مثل: فريق السيو التقني، فريق المحتوى، تحسينات الأداء، أولوية قصوى)",
      "type": "team أو priority أو custom",
      "color": "أحد الألوان التالية حصراً: indigo أو emerald أو amber أو rose أو purple أو cyan أو blue",
      "iconName": "أحد أسماء الأيقونات التالية حصراً: Users أو Code أو Server أو PenTool أو Flag أو Flame أو Target أو Sparkles",
      "description": "وصف موجز لطبيعة المهام المندرجة تحت هذا التصنيف",
      "reasoningAr": "تعليل سبب تصنيف الذكاء الاصطناعي لهذه العناصر معاً ومن الفريق أو الأولوية المناسبة لها",
      "itemIds": ["معرفات العناصر id المندرجة هنا"]
    }
  ]
}

تأكد من توزيع كافة العناصر المرسلة أو المعايير التي بحاجة لتدخل، مع إعطاء أولويات وألوان وأيقونات متناسقة.`;

      const aiResponse = await aiClient.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const responseText = aiResponse.text?.trim() || '';
      const parsed = JSON.parse(responseText);
      return res.json({
        success: true,
        suggestions: parsed.suggestions || [],
        source: 'gemini-3.8-flash'
      });
    }

    return res.json({ success: false, message: 'Gemini not configured' });
  } catch (err: any) {
    console.error('Error in /api/ai-auto-categorize:', err);
    return res.status(500).json({ success: false, error: err?.message || 'فشل التحليل الذكي للتصنيفات' });
  }
});

// Setup Vite or Static File Serving
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const vitePkg = 'vite';
    const { createServer } = await import(/* @vite-ignore */ vitePkg);
    const vite = await createServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.resolve(__dirnameResolved, 'dist')));
    app.get('*', (_req: Request, res: Response) => {
      res.sendFile(path.resolve(__dirnameResolved, 'dist', 'index.html'));
    });
  }

  app.listen(PORT, () => {
    console.log(`RasidSEO Auditor Server listening on http://0.0.0.0:${PORT}`);
  });
}

if (!process.env.VERCEL && !process.env.SERVERLESS) {
  startServer();
}

export { app };
export default app;
