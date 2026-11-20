import React, { useState } from 'react';
import { Code2, Copy, Check, Sparkles, FileCode2, Globe, Shield } from 'lucide-react';

interface CodeGeneratorSectionProps {
  initialUrl?: string;
  initialTitle?: string;
  initialDesc?: string;
}

export const CodeGeneratorSection: React.FC<CodeGeneratorSectionProps> = ({
  initialUrl = '',
  initialTitle = '',
  initialDesc = ''
}) => {
  const [activeTab, setActiveTab] = useState<'meta' | 'schema' | 'robots' | 'redirects' | 'images'>('meta');
  const [siteUrl, setSiteUrl] = useState(initialUrl || 'https://mywebsite.com');
  const [title, setTitle] = useState(initialTitle || 'أفضل مدونة تقنية | دليل الذكاء الاصطناعي');
  const [desc, setDesc] = useState(initialDesc || 'دليلك الشامل لتعلم أحدث تقنيات البرمجة والذكاء الاصطناعي مع مقالات حصرية وشروحات تطبيقية.');
  const [imageSrc, setImageSrc] = useState('pic.gif');
  const [imageAlt, setImageAlt] = useState('نص الكلمات المفتاحية الدقيق والوصفي الذي يمثل الصورة.');
  const [schemaType, setSchemaType] = useState<'Article' | 'WebSite' | 'BlogPosting' | 'Organization'>('BlogPosting');
  const [copied, setCopied] = useState(false);

  // Generate codes dynamically
  const generateMetaCode = () => {
    return `<!-- ==============================================
     وسوم السيو والميتا الموصى بها - صالحة للنسخ
     توضع داخل وسم <head> في موقعك أو مدونتك
     ============================================== -->
<title>${title}</title>
<meta name="description" content="${desc}" />
<link rel="canonical" href="${siteUrl}" />
<meta name="viewport" content="width=device-width, initial-scale=1.0" />
<meta name="robots" content="index, follow, max-image-preview:large" />

<!-- وسوم منصات التواصل (Open Graph / Facebook / WhatsApp) -->
<meta property="og:locale" content="ar_AR" />
<meta property="og:type" content="website" />
<meta property="og:title" content="${title}" />
<meta property="og:description" content="${desc}" />
<meta property="og:url" content="${siteUrl}" />
<meta property="og:site_name" content="${title.split('|')[0]?.trim() || 'اسم الموقع'}" />
<meta property="og:image" content="${siteUrl}/assets/social-cover.jpg" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />

<!-- وسوم منصة تويتر (X Cards) -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${title}" />
<meta name="twitter:description" content="${desc}" />
<meta name="twitter:image" content="${siteUrl}/assets/social-cover.jpg" />`;
  };

  const generateSchemaCode = () => {
    const jsonLd = {
      "@context": "https://schema.org",
      "@type": schemaType,
      "mainEntityOfPage": {
        "@type": "WebPage",
        "@id": siteUrl
      },
      "headline": title,
      "description": desc,
      "image": `${siteUrl}/assets/featured-image.jpg`,
      "author": {
        "@type": "Person",
        "name": "اسم الكاتب / المؤلف"
      },
      "publisher": {
        "@type": "Organization",
        "name": title.split('|')[0]?.trim() || 'اسم الموقع',
        "logo": {
          "@type": "ImageObject",
          "url": `${siteUrl}/assets/logo.png`
        }
      },
      "datePublished": new Date().toISOString().split('T')[0],
      "dateModified": new Date().toISOString().split('T')[0]
    };
    return `<script type="application/ld+json">
${JSON.stringify(jsonLd, null, 2)}
</script>`;
  };

  const generateRobotsCode = () => {
    let domain = siteUrl;
    try {
      domain = new URL(siteUrl).origin;
    } catch {
      domain = 'https://mywebsite.com';
    }
    return `# ملف توجيه عناكب محركات البحث (Robots.txt)
# يوضع في المجلد الرئيسي لموقعك مباشرة (root directory)

User-agent: *
Allow: /

# حظر المسارات الحساسة ولوحات التحكم الشائعة
Disallow: /admin/
Disallow: /wp-admin/
Disallow: /login/
Disallow: /checkout/
Disallow: /search/
Disallow: /cgi-bin/

# السماح لملفات التنسيق والجافاسكربت المهمة للفهرسة
Allow: /wp-admin/admin-ajax.php

# مسار خريطة الموقع البرمجية
Sitemap: ${domain}/sitemap.xml`;
  };

  const generateRedirectsCode = () => {
    return `# إعدادات توجيه السيو لملف .htaccess (خوادم Apache / LiteSpeed)

# 1. إجبار بروتوكول التشفير HTTPS لجميع الزوار
<IfModule mod_rewrite.c>
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# 2. إزالة الشرطة المائلة الأخيرة المزدوجة لمنع تكرار المحتوى
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_URI} (.+)/$
RewriteRule ^ %1 [R=301,L]
</IfModule>

# 3. تفعيل ضغط GZIP لتسريع الموقع
<IfModule mod_deflate.c>
AddOutputFilterByType DEFLATE text/html text/plain text/xml text/css application/javascript application/json
</IfModule>`;
  };

  const generateImageCode = () => {
    return `<!-- ==============================================
     وسم الصورة الموصى به للسيو مع النص البديل الوصفي <img alt>
     يدعم الظهور في بحث صور جوجل (Google Images) والتحميل السريع
     ============================================== -->
<img 
  src="${imageSrc || 'pic.gif'}" 
  alt="${imageAlt || 'نص الكلمات المفتاحية الدقيق والوصفي الذي يمثل الصورة.'}" 
  loading="lazy" 
  decoding="async" 
/>`;
  };

  const getCode = () => {
    switch (activeTab) {
      case 'meta':
        return generateMetaCode();
      case 'schema':
        return generateSchemaCode();
      case 'robots':
        return generateRobotsCode();
      case 'redirects':
        return generateRedirectsCode();
      case 'images':
        return generateImageCode();
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(getCode());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div id="tools-section" className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-6 sm:p-8 shadow-xs transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400">
              <Code2 className="w-5 h-5" />
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 dark:text-white">
              مولد أكواد السيو الجاهزة (SEO Code Generator)
            </h3>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            أنشئ فوراً وسوم الميتا، وترميز Schema.org، وملف Robots.txt لإصلاح أخطاء موقعك بضغطة زر
          </p>
        </div>

        {/* Tab switchers */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl overflow-x-auto shrink-0">
          <button
            onClick={() => setActiveTab('meta')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'meta'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            وسوم Meta Tags
          </button>
          <button
            onClick={() => setActiveTab('schema')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'schema'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            بيانات Schema.org
          </button>
          <button
            onClick={() => setActiveTab('robots')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'robots'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            ملف Robots.txt
          </button>
          <button
            onClick={() => setActiveTab('redirects')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'redirects'
                ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            إعدادات .htaccess
          </button>
          <button
            onClick={() => setActiveTab('images')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'images'
                ? 'bg-white dark:bg-slate-700 text-emerald-600 dark:text-emerald-400 shadow-xs font-bold'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            وسم الصور &lt;img alt&gt;
          </button>
        </div>
      </div>

      {/* Inputs Form */}
      {activeTab === 'images' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              مسار أو اسم ملف الصورة (source / src):
            </label>
            <input
              type="text"
              value={imageSrc}
              onChange={(e) => setImageSrc(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              placeholder="pic.gif أو /assets/my-image.webp"
            />
            <span className="text-[10px] text-slate-400 mt-1 block">مثال: pic.gif أو /images/chart.png</span>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
              النص الوصفي والكلمات المفتاحية الممثلة للصورة (alt attribute):
            </label>
            <input
              type="text"
              value={imageAlt}
              onChange={(e) => setImageAlt(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white font-medium"
              placeholder="نص الكلمات المفتاحية الدقيق والوصفي الذي يمثل الصورة."
            />
            <span className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1 block">
              نص وصفي غني ودقيق يُسهّل على خوارزميات جوجل فهرسة الصورة في Google Images.
            </span>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">رابط الموقع أو التدوينة (URL):</label>
            <input
              type="url"
              value={siteUrl}
              onChange={(e) => setSiteUrl(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              placeholder="https://example.com"
            />
          </div>

          {activeTab === 'schema' ? (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">نوع ترميز Schema (Type):</label>
              <select
                value={schemaType}
                onChange={(e) => setSchemaType(e.target.value as any)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
              >
                <option value="BlogPosting">BlogPosting (مقال أو تدوينة)</option>
                <option value="Article">Article (مقال صحفي أو عام)</option>
                <option value="WebSite">WebSite (موقع إلكتروني)</option>
                <option value="Organization">Organization (شركة / جهة)</option>
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">عنوان الصفحة (Title Tag):</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                placeholder="عنوان جذاب يحتوي الكلمة المفتاحية"
              />
            </div>
          )}

          {(activeTab === 'meta' || activeTab === 'schema') && (
            <div className="md:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">الوصف التعريفي (Meta Description):</label>
              <textarea
                rows={2}
                value={desc}
                onChange={(e) => setDesc(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 bg-white dark:bg-slate-950 text-slate-900 dark:text-white"
                placeholder="وصف شيق وموجز يشجع على النقر"
              />
            </div>
          )}
        </div>
      )}

      {/* Code Preview Box */}
      <div className="relative rounded-xl overflow-hidden border border-slate-800">
        <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800 text-xs">
          <div className="flex items-center gap-2 text-slate-300 font-mono">
            <FileCode2 className="w-4 h-4 text-indigo-400" />
            <span>
              {activeTab === 'meta' && 'meta-tags-head.html'}
              {activeTab === 'schema' && 'schema-structured-data.html'}
              {activeTab === 'robots' && 'robots.txt'}
              {activeTab === 'redirects' && '.htaccess'}
              {activeTab === 'images' && 'responsive-image-seo.html'}
            </span>
          </div>

          <button
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-semibold transition-colors cursor-pointer"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5" />
                <span>تم النسخ بنجاح!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>نسخ الكود بالكامل</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 bg-slate-950 text-emerald-400 font-mono text-xs overflow-x-auto max-h-72 leading-relaxed whitespace-pre dir-ltr text-left" dir="ltr">
          <code>{getCode()}</code>
        </pre>
      </div>
    </div>
  );
};
