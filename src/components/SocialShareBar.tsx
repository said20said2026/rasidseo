import React, { useState } from 'react';
import { Share2, Check, Copy, ExternalLink } from 'lucide-react';

interface SocialShareBarProps {
  url?: string;
  title?: string;
}

export const SocialShareBar: React.FC<SocialShareBarProps> = ({
  url,
  title = 'راصد سيو (RasidSEO) - فاحص وتدقيق أخطاء المواقع والمدونات الشامل'
}) => {
  const [copiedType, setCopiedType] = useState<string | null>(null);

  const shareUrl = url || (typeof window !== 'undefined' ? window.location.href : 'https://rasidseo.com');
  const encodedUrl = encodeURIComponent(shareUrl);
  const encodedTitle = encodeURIComponent(`${title} - افحص موقعك واكتشف أخطاء السيو مجاناً:`);

  const handleCopyAndOpen = (platformKey: string, targetUrl?: string) => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      setCopiedType(platformKey);
      setTimeout(() => setCopiedType(null), 3500);
      if (targetUrl) {
        window.open(targetUrl, '_blank', 'noopener,noreferrer');
      }
    }
  };

  const platforms = [
    {
      id: 'facebook',
      name: 'فيسبوك',
      enName: 'Facebook',
      href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: 'hover:bg-[#1877F2] hover:text-white',
      border: 'border-blue-900/60 text-blue-400 bg-blue-950/40 hover:border-[#1877F2]',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )
    },
    {
      id: 'twitter',
      name: 'تويتر (X)',
      enName: 'Twitter / X',
      href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`,
      bg: 'hover:bg-white hover:text-black',
      border: 'border-slate-700 text-slate-200 bg-slate-900/80 hover:border-white',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      )
    },
    {
      id: 'whatsapp',
      name: 'واتساب',
      enName: 'WhatsApp',
      href: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      bg: 'hover:bg-[#25D366] hover:text-white',
      border: 'border-emerald-900/60 text-emerald-400 bg-emerald-950/40 hover:border-[#25D366]',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
        </svg>
      )
    },
    {
      id: 'messenger',
      name: 'ماسنجر',
      enName: 'Messenger',
      href: `https://www.facebook.com/dialog/send?link=${encodedUrl}&app_id=291494419194&redirect_uri=${encodedUrl}`,
      bg: 'hover:bg-[#0084FF] hover:text-white',
      border: 'border-sky-900/60 text-sky-400 bg-sky-950/40 hover:border-[#0084FF]',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 4.974 0 11.111c0 3.498 1.744 6.614 4.469 8.654V24l4.088-2.242c1.077.299 2.219.463 3.443.463 6.627 0 12-4.975 12-11.11C24 4.975 18.627 0 12 0zm1.191 14.963l-3.056-3.259-5.963 3.259 6.559-6.963 3.13 3.259 5.889-3.259-6.559 6.963z"/>
        </svg>
      )
    },
    {
      id: 'telegram',
      name: 'تلجرام',
      enName: 'Telegram',
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      bg: 'hover:bg-[#229ED9] hover:text-white',
      border: 'border-sky-900/60 text-sky-300 bg-sky-950/40 hover:border-[#229ED9]',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.942z"/>
        </svg>
      )
    },
    {
      id: 'instagram',
      name: 'انستجرام',
      enName: 'Instagram',
      isCopy: true,
      targetWeb: 'https://www.instagram.com',
      bg: 'hover:bg-gradient-to-tr hover:from-amber-600 hover:via-rose-600 hover:to-purple-600 hover:text-white',
      border: 'border-pink-900/60 text-pink-400 bg-pink-950/40 hover:border-pink-500',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      )
    },
    {
      id: 'pinterest',
      name: 'بينترست',
      enName: 'Pinterest',
      href: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedTitle}`,
      bg: 'hover:bg-[#E60023] hover:text-white',
      border: 'border-rose-900/60 text-rose-400 bg-rose-950/40 hover:border-[#E60023]',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.69 0 1.029-.655 2.568-.994 3.995-.283 1.194.599 2.169 1.777 2.169 2.133 0 3.772-2.249 3.772-5.495 0-2.873-2.064-4.882-5.012-4.882-3.414 0-5.418 2.561-5.418 5.207 0 1.031.397 2.138.893 2.738a.36.36 0 01.083.345l-.333 1.36c-.053.22-.174.267-.402.161-1.499-.698-2.436-2.889-2.436-4.649 0-3.785 2.75-7.262 7.929-7.262 4.163 0 7.398 2.967 7.398 6.931 0 4.136-2.607 7.464-6.227 7.464-1.216 0-2.359-.631-2.75-1.378l-.748 2.853c-.271 1.043-1.002 2.35-1.492 3.146 1.124.347 2.317.535 3.554.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z"/>
        </svg>
      )
    },
    {
      id: 'snapchat',
      name: 'سناب شات',
      enName: 'Snapchat',
      href: `https://www.snapchat.com/scan?attachmentUrl=${encodedUrl}`,
      isSnap: true,
      bg: 'hover:bg-[#FFFC00] hover:text-black',
      border: 'border-yellow-900/60 text-yellow-300 bg-yellow-950/40 hover:border-[#FFFC00]',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M12.03 2.002c-4.437 0-7.03 3.32-7.03 6.002 0 .973.34 2.158.78 2.945.163.29.176.435.039.697-.17.327-.58.917-1.088 1.639-.327.465-.638.932-.424 1.488.244.634.939.813 1.688.665.418-.083.844-.265 1.242-.452.327-.154.535-.11.758.117.818.835 2.15 1.583 3.992 1.583.02 0 .046-.002.066-.002.02.001.046.002.067.002 1.841 0 3.174-.748 3.991-1.583.223-.227.432-.271.759-.117.398.187.824.369 1.241.452.75.148 1.445-.031 1.689-.665.214-.556-.097-1.023-.424-1.488-.508-.722-.918-1.312-1.088-1.639-.137-.262-.124-.407.039-.697.44-.787.78-1.972.78-2.945 0-2.682-2.593-6.002-7.03-6.002zm-.008 1.625c3.293 0 5.405 2.378 5.405 4.377 0 .805-.282 1.841-.664 2.524-.469.839-.427 1.343.143 2.156.402.573.742 1.058.824 1.311-.082.024-.268.026-.531-.027-.549-.11-1.11-.354-1.61-.59-1.002-.47-1.748-.28-2.316.3-.68.694-1.741 1.261-3.242 1.261-.016 0-.036-.001-.052-.001-.016 0-.036.001-.052.001-1.5 0-2.562-.567-3.242-1.261-.568-.58-1.314-.77-2.316-.3-.5.236-1.061.48-1.61.59-.263.053-.449.051-.531.027.082-.253.422-.738.824-1.311.57-.813.612-1.317.143-2.156-.382-.683-.664-1.719-.664-2.524 0-1.999 2.112-4.377 5.405-4.377z"/>
        </svg>
      )
    },
    {
      id: 'tiktok',
      name: 'تيك توك',
      enName: 'TikTok',
      isCopy: true,
      targetWeb: 'https://www.tiktok.com',
      bg: 'hover:bg-slate-100 hover:text-slate-900',
      border: 'border-slate-700 text-slate-200 bg-slate-900/80 hover:border-teal-400',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.29 1.76-.32 1.07-.06 2.3.69 3.09.73.83 1.88 1.25 2.97 1.09 1.1-.11 2.09-.85 2.51-1.87.21-.51.28-1.07.28-1.62V.02h-.07z"/>
        </svg>
      )
    },
    {
      id: 'linkedin',
      name: 'لينكد إن',
      enName: 'LinkedIn',
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      bg: 'hover:bg-[#0A66C2] hover:text-white',
      border: 'border-blue-900/60 text-blue-300 bg-blue-950/40 hover:border-[#0A66C2]',
      icon: (
        <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
          <path d="M19 0h-14c-2.761 0-5 2.239-5 5v14c0 2.761 2.239 5 5 5h14c2.762 0 5-2.239 5-5v-14c0-2.761-2.238-5-5-5zm-11 19h-3v-11h3v11zm-1.5-12.268c-.966 0-1.75-.79-1.75-1.764s.784-1.764 1.75-1.764 1.75.79 1.75 1.764-.783 1.764-1.75 1.764zm13.5 12.268h-3v-5.604c0-3.368-4-3.113-4 0v5.604h-3v-11h3v1.765c1.396-2.586 7-2.777 7 2.476v6.759z"/>
        </svg>
      )
    }
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 sm:p-7 shadow-lg text-white">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-5 pb-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 flex items-center justify-center shrink-0">
            <Share2 className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm sm:text-base font-bold text-white flex items-center gap-2">
              <span>شارك منصة راصد سيو عبر وسائل التواصل الاجتماعي</span>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                10 منصات
              </span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">
              انشر رابط المنصة أو تقرير الفحص بنقرة واحدة عبر قنواتك المفضلة
            </p>
          </div>
        </div>

        {/* Copy Direct Link Button */}
        <button
          onClick={() => handleCopyAndOpen('direct')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors cursor-pointer self-start md:self-auto shrink-0"
        >
          {copiedType === 'direct' ? (
            <>
              <Check className="w-4 h-4 text-emerald-400" />
              <span className="text-emerald-400 font-bold">تم نسخ الرابط!</span>
            </>
          ) : (
            <>
              <Copy className="w-4 h-4 text-slate-400" />
              <span>نسخ الرابط المباشر</span>
            </>
          )}
        </button>
      </div>

      {/* 10 Social Media Platforms Grid */}
      <div className="pt-5 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
        {platforms.map((p) => {
          if (p.isCopy) {
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => handleCopyAndOpen(p.id, p.targetWeb)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${p.border} ${p.bg}`}
                title={`نسخ رابط الفحص والمشاركة على ${p.name}`}
              >
                {p.icon}
                <span>{p.name}</span>
                <Copy className="w-3 h-3 opacity-60 ml-0.5" />
              </button>
            );
          }

          return (
            <a
              key={p.id}
              href={p.href}
              target="_blank"
              rel="noopener noreferrer"
              className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl border text-xs font-bold transition-all cursor-pointer ${p.border} ${p.bg}`}
              title={`مشاركة فورية على ${p.name}`}
            >
              {p.icon}
              <span>{p.name}</span>
              <ExternalLink className="w-3 h-3 opacity-50 ml-0.5" />
            </a>
          );
        })}
      </div>

      {/* Notification Toast for Copy Actions */}
      {copiedType && copiedType !== 'direct' && (
        <div className="mt-4 p-3 bg-indigo-950/80 border border-indigo-500/40 rounded-xl text-indigo-200 text-xs flex items-center justify-between animate-in fade-in duration-200">
          <span className="flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>
              تم نسخ رابط التقرير بنجاح! تم فتح تطبيق <strong>{platforms.find((p) => p.id === copiedType)?.name}</strong> للصق الرابط في منشورك أو قصتك (Story).
            </span>
          </span>
          <span className="text-[10px] text-indigo-300 font-mono bg-indigo-900/60 px-2 py-0.5 rounded">
            جاهز للصق
          </span>
        </div>
      )}
    </div>
  );
};
