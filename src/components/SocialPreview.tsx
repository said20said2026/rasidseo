import React from 'react';
import { Share2, Image as ImageIcon } from 'lucide-react';
import { SocialTags } from '../types/seo';

interface SocialPreviewProps {
  url: string;
  social: SocialTags;
  pageTitle?: string;
  metaDescription?: string;
}

export const SocialPreview: React.FC<SocialPreviewProps> = ({
  url,
  social,
  pageTitle,
  metaDescription
}) => {
  const displayTitle = social.ogTitle || social.twitterTitle || pageTitle || 'عنوان غير محدد';
  const displayDesc = social.ogDescription || social.twitterDescription || metaDescription || 'وصف المشاركة الاجتماعية غير متوفر';
  const displayImage = social.ogImage || social.twitterImage;

  let domain = 'example.com';
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = url;
  }

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">معاينة بطاقة المشاركة في منصات التواصل (Social Card)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">كيف ستظهر التدوينة عند إرسال الرابط في واتساب، تويتر (X)، وفيسبوك</p>
        </div>
        <Share2 className="w-4 h-4 text-slate-400" />
      </div>

      <div className="max-w-md mx-auto bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden shadow-xs">
        {/* Image Preview or Fallback */}
        <div className="h-44 bg-slate-200 dark:bg-slate-800 relative overflow-hidden flex items-center justify-center">
          {displayImage ? (
            <img
              src={displayImage}
              alt="Social preview"
              referrerPolicy="no-referrer"
              className="w-full h-full object-cover"
              onError={(e) => {
                // fallback if image fails to load
                (e.target as HTMLElement).style.display = 'none';
              }}
            />
          ) : (
            <div className="flex flex-col items-center gap-2 text-slate-400 px-4 text-center">
              <ImageIcon className="w-8 h-8 stroke-1" />
              <span className="text-xs">لم يتم الكشف عن صورة مخصصة (og:image / twitter:image)</span>
            </div>
          )}
        </div>

        {/* Text Content */}
        <div className="p-4 bg-white dark:bg-slate-900">
          <span className="text-[11px] font-mono text-slate-400 uppercase tracking-wider block mb-1">
            {domain}
          </span>
          <h4 className="text-sm font-bold text-slate-900 dark:text-white line-clamp-1 leading-snug">
            {displayTitle}
          </h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 line-clamp-2 leading-relaxed">
            {displayDesc}
          </p>
        </div>
      </div>

      <div className="mt-3 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono flex-wrap gap-2">
        <span>نوع البطاقة: {social.twitterCard || 'summary'}</span>
        <span>{displayImage ? '✅ صورة المشاركة متوفرة' : '⚠️ تفتقر لصورة og:image'}</span>
      </div>

      <div className="mt-3 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
        <span className="text-xs text-slate-500 dark:text-slate-400">
          هل تريد فحص ترميز الـ Schema.org (JSON-LD) المطبق وكشف الأخطاء الهيكلية؟
        </span>
        <button
          type="button"
          onClick={() => document.getElementById('social-schema-inspector')?.scrollIntoView({ behavior: 'smooth' })}
          className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span>الانتقال لفاحص الـ Schema</span>
          <span>&darr;</span>
        </button>
      </div>
    </div>
  );
};
