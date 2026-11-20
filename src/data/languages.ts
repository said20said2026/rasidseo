export interface LanguageItem {
  code: string;
  name: string;
  nameAr: string;
  flag: string;
  dir: 'rtl' | 'ltr';
  region?: string;
}

export const WORLD_LANGUAGES: LanguageItem[] = [
  {
    code: 'ar',
    name: 'العربية',
    nameAr: 'العربية (الأصلية)',
    flag: '🇸🇦',
    dir: 'rtl',
    region: 'الشرق الأوسط وشمال أفريقيا'
  },
  {
    code: 'en',
    name: 'English',
    nameAr: 'الإنجليزية (العالمية)',
    flag: '🇺🇸',
    dir: 'ltr',
    region: 'أمريكا الشمالية / أوروبا'
  },
  {
    code: 'es',
    name: 'Español',
    nameAr: 'الإسبانية',
    flag: '🇪🇸',
    dir: 'ltr',
    region: 'أوروبا / أمريكا اللاتينية'
  },
  {
    code: 'fr',
    name: 'Français',
    nameAr: 'الفرنسية',
    flag: '🇫🇷',
    dir: 'ltr',
    region: 'أوروبا / أفريقيا'
  },
  {
    code: 'de',
    name: 'Deutsch',
    nameAr: 'الألمانية',
    flag: '🇩🇪',
    dir: 'ltr',
    region: 'أوروبا'
  },
  {
    code: 'zh-CN',
    name: '简体中文',
    nameAr: 'الصينية (المبسطة)',
    flag: '🇨🇳',
    dir: 'ltr',
    region: 'شرق آسيا'
  },
  {
    code: 'ja',
    name: '日本語',
    nameAr: 'اليابانية',
    flag: '🇯🇵',
    dir: 'ltr',
    region: 'شرق آسيا'
  },
  {
    code: 'ko',
    name: '한국어',
    nameAr: 'الكورية',
    flag: '🇰🇷',
    dir: 'ltr',
    region: 'شرق آسيا'
  },
  {
    code: 'tr',
    name: 'Türkçe',
    nameAr: 'التركية',
    flag: '🇹🇷',
    dir: 'ltr',
    region: 'أوراسيا'
  },
  {
    code: 'ru',
    name: 'Русский',
    nameAr: 'الروسية',
    flag: '🇷🇺',
    dir: 'ltr',
    region: 'أوراسيا'
  },
  {
    code: 'pt',
    name: 'Português',
    nameAr: 'البرتغالية (البرتغال)',
    flag: '🇵🇹',
    dir: 'ltr',
    region: 'أوروبا'
  },
  {
    code: 'pt-BR',
    name: 'Português (Brasil)',
    nameAr: 'البرتغالية (البرازيل)',
    flag: '🇧🇷',
    dir: 'ltr',
    region: 'أمريكا الجنوبية'
  },
  {
    code: 'it',
    name: 'Italiano',
    nameAr: 'الإيطالية',
    flag: '🇮🇹',
    dir: 'ltr',
    region: 'أوروبا'
  },
  {
    code: 'nl',
    name: 'Nederlands',
    nameAr: 'الهولندية',
    flag: '🇳🇱',
    dir: 'ltr',
    region: 'أوروبا'
  },
  {
    code: 'fa',
    name: 'فارسی',
    nameAr: 'الفارسية',
    flag: '🇮🇷',
    dir: 'rtl',
    region: 'الشرق الأوسط'
  },
  {
    code: 'ur',
    name: 'اردو',
    nameAr: 'الأردية',
    flag: '🇵🇰',
    dir: 'rtl',
    region: 'جنوب آسيا'
  },
  {
    code: 'hi',
    name: 'हिन्दी',
    nameAr: 'الهندية',
    flag: '🇮🇳',
    dir: 'ltr',
    region: 'جنوب آسيا'
  },
  {
    code: 'id',
    name: 'Bahasa Indonesia',
    nameAr: 'الإندونيسية',
    flag: '🇮🇩',
    dir: 'ltr',
    region: 'جنوب شرق آسيا'
  },
  {
    code: 'ms',
    name: 'Bahasa Melayu',
    nameAr: 'الماليزية',
    flag: '🇲🇾',
    dir: 'ltr',
    region: 'جنوب شرق آسيا'
  },
  {
    code: 'vi',
    name: 'Tiếng Việt',
    nameAr: 'الفيتنامية',
    flag: '🇻🇳',
    dir: 'ltr',
    region: 'جنوب شرق آسيا'
  },
  {
    code: 'th',
    name: 'ไทย',
    nameAr: 'التايلاندية',
    flag: '🇹🇭',
    dir: 'ltr',
    region: 'جنوب شرق آسيا'
  },
  {
    code: 'pl',
    name: 'Polski',
    nameAr: 'البولندية',
    flag: '🇵🇱',
    dir: 'ltr',
    region: 'أوروبا'
  },
  {
    code: 'sv',
    name: 'Svenska',
    nameAr: 'السويدية',
    flag: '🇸🇪',
    dir: 'ltr',
    region: 'شمال أوروبا'
  },
  {
    code: 'no',
    name: 'Norsk',
    nameAr: 'النرويجية',
    flag: '🇳🇴',
    dir: 'ltr',
    region: 'شمال أوروبا'
  },
  {
    code: 'da',
    name: 'Dansk',
    nameAr: 'الدنماركية',
    flag: '🇩🇰',
    dir: 'ltr',
    region: 'شمال أوروبا'
  },
  {
    code: 'fi',
    name: 'Suomi',
    nameAr: 'الفنلندية',
    flag: '🇫🇮',
    dir: 'ltr',
    region: 'شمال أوروبا'
  },
  {
    code: 'el',
    name: 'Ελληνικά',
    nameAr: 'اليونانية',
    flag: '🇬🇷',
    dir: 'ltr',
    region: 'أوروبا'
  },
  {
    code: 'cs',
    name: 'Čeština',
    nameAr: 'التشيكية',
    flag: '🇨🇿',
    dir: 'ltr',
    region: 'أوروبا'
  },
  {
    code: 'hu',
    name: 'Magyar',
    nameAr: 'المجرية',
    flag: '🇭🇺',
    dir: 'ltr',
    region: 'أوروبا'
  },
  {
    code: 'ro',
    name: 'Română',
    nameAr: 'الرومانية',
    flag: '🇷🇴',
    dir: 'ltr',
    region: 'أوروبا'
  },
  {
    code: 'uk',
    name: 'Українська',
    nameAr: 'الأوكرانية',
    flag: '🇺🇦',
    dir: 'ltr',
    region: 'أوروبا'
  },
  {
    code: 'he',
    name: 'עברית',
    nameAr: 'العبرية',
    flag: '🇮🇱',
    dir: 'rtl',
    region: 'الشرق الأوسط'
  },
  {
    code: 'bn',
    name: 'বাংলা',
    nameAr: 'البنغالية',
    flag: '🇧🇩',
    dir: 'ltr',
    region: 'جنوب آسيا'
  },
  {
    code: 'tl',
    name: 'Filipino',
    nameAr: 'الفلبينية (تاغالوغ)',
    flag: '🇵🇭',
    dir: 'ltr',
    region: 'جنوب شرق آسيا'
  },
  {
    code: 'sw',
    name: 'Kiswahili',
    nameAr: 'السواحلية',
    flag: '🇰🇪',
    dir: 'ltr',
    region: 'أفريقيا'
  },
  {
    code: 'sr',
    name: 'Српски',
    nameAr: 'الصربية',
    flag: '🇷🇸',
    dir: 'ltr',
    region: 'أوروبا'
  },
  {
    code: 'hr',
    name: 'Hrvatski',
    nameAr: 'الكرواتية',
    flag: '🇭🇷',
    dir: 'ltr',
    region: 'أوروبا'
  },
  {
    code: 'sk',
    name: 'Slovenčina',
    nameAr: 'السلوفاكية',
    flag: '🇸🇰',
    dir: 'ltr',
    region: 'أوروبا'
  },
  {
    code: 'bg',
    name: 'Български',
    nameAr: 'البلغارية',
    flag: '🇧🇬',
    dir: 'ltr',
    region: 'أوروبا'
  },
  {
    code: 'az',
    name: 'Azərbaycan dili',
    nameAr: 'الأذربيجانية',
    flag: '🇦🇿',
    dir: 'ltr',
    region: 'أوراسيا'
  },
  {
    code: 'zh-TW',
    name: '繁體中文',
    nameAr: 'الصينية (التقليدية)',
    flag: '🇹🇼',
    dir: 'ltr',
    region: 'شرق آسيا'
  },
  {
    code: 'ku',
    name: 'کوردی',
    nameAr: 'الكردية',
    flag: '🇮🇶',
    dir: 'rtl',
    region: 'الشرق الأوسط'
  },
  {
    code: 'ps',
    name: 'پښتو',
    nameAr: 'البشتوية',
    flag: '🇦🇫',
    dir: 'rtl',
    region: 'جنوب ووسط آسيا'
  },
  {
    code: 'am',
    name: 'አማርኛ',
    nameAr: 'الأمهرية',
    flag: '🇪🇹',
    dir: 'ltr',
    region: 'شرق أفريقيا'
  },
  {
    code: 'ta',
    name: 'தமிழ்',
    nameAr: 'التاميلية',
    flag: '🇱🇰',
    dir: 'ltr',
    region: 'جنوب آسيا'
  },
  {
    code: 'te',
    name: 'తెలుగు',
    nameAr: 'التيلوغوية',
    flag: '🇮🇳',
    dir: 'ltr',
    region: 'جنوب آسيا'
  },
  {
    code: 'mr',
    name: 'मराठी',
    nameAr: 'الماراثية',
    flag: '🇮🇳',
    dir: 'ltr',
    region: 'جنوب آسيا'
  },
  {
    code: 'pa',
    name: 'ਪੰਜਾਬੀ',
    nameAr: 'البنجابية',
    flag: '🇵🇰',
    dir: 'ltr',
    region: 'جنوب آسيا'
  },
  {
    code: 'gu',
    name: 'ગુજરાતી',
    nameAr: 'الغوجاراتية',
    flag: '🇮🇳',
    dir: 'ltr',
    region: 'جنوب آسيا'
  },
  {
    code: 'my',
    name: 'မြန်မာဘာသာ',
    nameAr: 'البورمية',
    flag: '🇲🇲',
    dir: 'ltr',
    region: 'جنوب شرق آسيا'
  },
  {
    code: 'km',
    name: 'ភាសាខ្មែរ',
    nameAr: 'الخميرية (كمبوديا)',
    flag: '🇰🇭',
    dir: 'ltr',
    region: 'جنوب شرق آسيا'
  },
  {
    code: 'uz',
    name: 'O‘zbek tili',
    nameAr: 'الأوزبكية',
    flag: '🇺🇿',
    dir: 'ltr',
    region: 'وسط آسيا'
  },
  {
    code: 'kk',
    name: 'Қазақ тілі',
    nameAr: 'الكازاخية',
    flag: '🇰🇿',
    dir: 'ltr',
    region: 'وسط آسيا'
  },
  {
    code: 'ka',
    name: 'ქართული',
    nameAr: 'الجورجية',
    flag: '🇬🇪',
    dir: 'ltr',
    region: 'القوقاز / أوراسيا'
  },
  {
    code: 'hy',
    name: 'Հայերեն',
    nameAr: 'الأرمنية',
    flag: '🇦🇲',
    dir: 'ltr',
    region: 'القوقاز / غرب آسيا'
  },
  {
    code: 'is',
    name: 'Íslenska',
    nameAr: 'الأيسلندية',
    flag: '🇮🇸',
    dir: 'ltr',
    region: 'شمال أوروبا'
  },
  {
    code: 'et',
    name: 'Eesti keel',
    nameAr: 'الإستونية',
    flag: '🇪🇪',
    dir: 'ltr',
    region: 'شمال أوروبا / البلطيق'
  },
  {
    code: 'lv',
    name: 'Latviešu',
    nameAr: 'اللاتفية',
    flag: '🇱🇻',
    dir: 'ltr',
    region: 'شمال أوروبا / البلطيق'
  },
  {
    code: 'lt',
    name: 'Lietuvių',
    nameAr: 'الليتوانية',
    flag: '🇱🇹',
    dir: 'ltr',
    region: 'شمال أوروبا / البلطيق'
  },
  {
    code: 'af',
    name: 'Afrikaans',
    nameAr: 'الأفريقانية',
    flag: '🇿🇦',
    dir: 'ltr',
    region: 'أفريقيا'
  }
];
