import React, { useState } from 'react';
import { Smartphone, Monitor, ExternalLink } from 'lucide-react';

interface SerpPreviewProps {
  url: string;
  title?: string;
  description?: string;
}

export const SerpPreview: React.FC<SerpPreviewProps> = ({
  url,
  title = 'عنوان الصفحة غير محدد',
  description = 'لا يوجد وصف تعريفي للصفحة. ستقوم محركات البحث باختيار مقتطف عشوائي من محتوى الصفحة.'
}) => {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');

  let domain = 'example.com';
  try {
    domain = new URL(url).hostname;
  } catch {
    domain = url.replace(/^https?:\/\//, '').split('/')[0];
  }

  // Google display calculations
  const displayTitle = title.length > 60 ? title.substring(0, 58) + '...' : title;
  const displayDesc = description.length > 155 ? description.substring(0, 150) + '...' : description;

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">معاينة الظهور في نتائج بحث جوجل (Google SERP)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">شاهد كيف تبدو تدوينتك أو صفحتك للباحثين قبل النقر عليها</p>
        </div>

        {/* Device toggle segmented control */}
        <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-lg shrink-0">
          <button
            onClick={() => setDevice('desktop')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              device === 'desktop' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Monitor className="w-3.5 h-3.5" />
            <span>سطح المكتب</span>
          </button>
          <button
            onClick={() => setDevice('mobile')}
            className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
              device === 'mobile' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-xs' : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Smartphone className="w-3.5 h-3.5" />
            <span>الهاتف المحمول</span>
          </button>
        </div>
      </div>

      {/* Google Result Preview Box */}
      <div className={`mx-auto bg-white dark:bg-slate-950 rounded-lg p-4 border border-slate-200/80 dark:border-slate-800 transition-all ${
        device === 'mobile' ? 'max-w-md shadow-sm' : 'max-w-2xl'
      }`}>
        {/* Favicon & Breadcrumb */}
        <div className="flex items-center gap-2 mb-1">
          <div className="w-5 h-5 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-600 dark:text-slate-300 text-[10px] font-mono border border-slate-200 dark:border-slate-700">
            {domain[0]?.toUpperCase() || 'G'}
          </div>
          <div className="flex flex-col text-xs leading-tight">
            <span className="text-slate-900 dark:text-slate-200 font-medium text-[13px]">{domain}</span>
            <span className="text-slate-500 dark:text-slate-400 text-[11px] font-mono dir-ltr text-right" dir="ltr">
              {url}
            </span>
          </div>
        </div>

        {/* Title Link */}
        <div className="mt-1">
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[#1a0dab] dark:text-[#8ab4f8] hover:underline text-lg font-medium leading-snug line-clamp-1 flex items-center gap-1 group"
          >
            <span>{displayTitle}</span>
            <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-slate-400" />
          </a>
        </div>

        {/* Snippet Description */}
        <p className="mt-1.5 text-xs text-[#4d5156] dark:text-[#bdc1c6] leading-relaxed line-clamp-2">
          {displayDesc}
        </p>

        {/* Length Indicators */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-mono tabular-nums">
          <span>العنوان: {title.length} حرفاً {title.length > 60 ? '⚠️ (طويل)' : title.length < 30 ? '⚠️ (قصير)' : '✅ (مثالي)'}</span>
          <span>الوصف: {description.length} حرفاً {description.length > 160 ? '⚠️ (طويل)' : description.length < 80 ? '⚠️ (قصير)' : '✅ (مثالي)'}</span>
        </div>
      </div>
    </div>
  );
};
