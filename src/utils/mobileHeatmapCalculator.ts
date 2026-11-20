import { AuditResult } from '../types/seo';

export type HeatmapMode = 'density' | 'zones' | 'thumb_zone';

export interface HotspotItem {
  id: string;
  name: string;
  category: 'nav' | 'cta' | 'headline' | 'visual' | 'content' | 'footer';
  topPercent: number; // percentage from top of simulated scrollable viewport
  leftPercent: number; // percentage from left
  radiusPx: number; // radius for heat circle
  clickSharePercent: number; // estimated % of all mobile clicks (0-100)
  attractionScore: number; // 0-100 score of visual attention
  heatIntensity: 'extreme' | 'high' | 'medium' | 'low';
  thumbZoneSuitability: 'optimal' | 'stretch' | 'hard';
  description: string;
  recommendation: string;
}

export interface ThumbZoneConfig {
  naturalCoveragePercent: number; // % of critical elements in easy zone
  stretchCoveragePercent: number;
  hardReachCoveragePercent: number;
  overallErgonomicScore: number; // 0-100
}

export interface MobileHeatmapAnalysis {
  hotspots: HotspotItem[];
  aboveFoldClickShare: number; // typically 65-80%
  topClickMagnet: HotspotItem;
  thumbErgonomics: ThumbZoneConfig;
  mobileUsabilityScore: number;
  optimizationTips: {
    type: 'positive' | 'warning' | 'recommendation';
    title: string;
    detail: string;
  }[];
}

/**
 * Calculates predictive mobile click heatmap hotspots and thumb ergonomics
 * based on the audited page structure, headings, images, CTA indicators, and mobile metrics.
 */
export function calculateMobileHeatmap(auditData: AuditResult): MobileHeatmapAnalysis {
  const hasH1 = auditData.headings.h1.length > 0;
  const hasOgImage = !!auditData.social.ogImage;
  const headingsCount = auditData.headings.sampleHeadings.length;
  const metaDescLength = auditData.metaDescription?.length || 0;
  
  // Calculate relative weightings
  const baseCtaShare = 32;
  const baseNavShare = 18;
  const baseH1Share = hasH1 ? 22 : 12;
  const baseImageShare = hasOgImage ? 16 : 8;
  const baseContentShare = Math.min(25, Math.max(10, headingsCount * 4));
  const baseFooterShare = 4;

  const totalRaw = baseCtaShare + baseNavShare + baseH1Share + baseImageShare + baseContentShare + baseFooterShare;
  const normalize = (val: number) => Math.round((val / totalRaw) * 100);

  const ctaShare = normalize(baseCtaShare);
  const navShare = normalize(baseNavShare);
  const h1Share = normalize(baseH1Share);
  const imageShare = normalize(baseImageShare);
  const contentShare = normalize(baseContentShare);
  const footerShare = Math.max(2, 100 - (ctaShare + navShare + h1Share + imageShare + contentShare));

  const hotspots: HotspotItem[] = [
    {
      id: 'hotspot-nav-menu',
      name: 'زر القائمة المتجاوبة (Hamburger Menu)',
      category: 'nav',
      topPercent: 3.5,
      leftPercent: 12,
      radiusPx: 52,
      clickSharePercent: navShare,
      attractionScore: 84,
      heatIntensity: 'high',
      thumbZoneSuitability: 'hard',
      description: 'أحد أكثر العناصر استهدافاً في الثواني الأولى للبحث عن أقسام الموقع أو المنتجات.',
      recommendation: 'يقع في أقصى الجزء العلوي الأيسر، ما يتطلب حركة يد ثانية أو تمديد الإبهام على الشاشات الكبيرة.'
    },
    {
      id: 'hotspot-primary-cta',
      name: 'زر التفاعل والدعوة للإجراء (Primary CTA)',
      category: 'cta',
      topPercent: 28,
      leftPercent: 50,
      radiusPx: 75,
      clickSharePercent: ctaShare,
      attractionScore: 95,
      heatIntensity: 'extreme',
      thumbZoneSuitability: 'optimal',
      description: 'المنطقة الأكثر تركيزاً للنقرات بهدف الشراء، التسجيل أو التحويل السريع.',
      recommendation: 'حافظ على تباين لوني ساطع مع شاشة اللمس ومساحة نقر لا تقل عن 48x48 بكسل لمنع النقرات الخاطئة.'
    },
    {
      id: 'hotspot-h1-title',
      name: 'العنوان الرئيسي وعنوان المقال (H1 Headline)',
      category: 'headline',
      topPercent: 18,
      leftPercent: 50,
      radiusPx: 60,
      clickSharePercent: h1Share,
      attractionScore: 89,
      heatIntensity: 'high',
      thumbZoneSuitability: 'stretch',
      description: 'نقطة التثبيت البصري الأولى لعين الزائر (Eye-tracking fixation spot) مع محاولات نسخ أو نقر الروابط التابعة.',
      recommendation: 'احرص على أن تكون الكلمة المفتاحية في أول 3 كلمات من العنوان لتثبيت اهتمام متصفحي الجوال.'
    },
    {
      id: 'hotspot-hero-media',
      name: 'البانر التفاعلي والصورة البارزة (Hero Visual)',
      category: 'visual',
      topPercent: hasOgImage ? 38 : 34,
      leftPercent: 50,
      radiusPx: 68,
      clickSharePercent: imageShare,
      attractionScore: 78,
      heatIntensity: 'medium',
      thumbZoneSuitability: 'optimal',
      description: 'يجذب الانتباه البصري التلقائي ويشهد نقرات فضولية لتكبير الصورة أو فتح المعرض.',
      recommendation: 'اربط الصورة البارزة برابط المقال أو زر إجراء سريع للاستفادة من نقرات الفضول العفوية.'
    },
    {
      id: 'hotspot-headings-links',
      name: 'بطاقات العناوين الفرعية والمحتوى (H2/H3 Links)',
      category: 'content',
      topPercent: hasOgImage ? 56 : 50,
      leftPercent: 50,
      radiusPx: 65,
      clickSharePercent: contentShare,
      attractionScore: 71,
      heatIntensity: 'medium',
      thumbZoneSuitability: 'optimal',
      description: 'يتفاعل معها الزوار المتمرسون للقفز إلى الفقرات ذات الصلة باحتياجهم المباشر.',
      recommendation: 'استخدم جدول محتويات تفاعلي أو أسهم واضحة لتسهيل القفز بين أقسام الصفحة الطويلة.'
    },
    {
      id: 'hotspot-footer-bottom',
      name: 'تذييل الصفحة والروابط القانونية (Footer)',
      category: 'footer',
      topPercent: 92,
      leftPercent: 50,
      radiusPx: 45,
      clickSharePercent: footerShare,
      attractionScore: 35,
      heatIntensity: 'low',
      thumbZoneSuitability: 'optimal',
      description: 'يصل إليها 10% إلى 18% فقط من الزوار الذين يقومون بالتمرير الكامل لنهاية الصفحة.',
      recommendation: 'ركز في التذييل على روابط سياسة الخصوصية، التواصل وأيقونات التواصل الاجتماعي.'
    }
  ];

  // Sort by click share descending to easily find top magnet
  const sorted = [...hotspots].sort((a, b) => b.clickSharePercent - a.clickSharePercent);
  const topClickMagnet = sorted[0];

  // Calculate Above-The-Fold click share (elements in top 50% of page height)
  const aboveFoldItems = hotspots.filter(h => h.topPercent <= 50);
  const aboveFoldClickShare = aboveFoldItems.reduce((acc, curr) => acc + curr.clickSharePercent, 0);

  // Calculate Thumb Zone Distribution
  const optimalItems = hotspots.filter(h => h.thumbZoneSuitability === 'optimal');
  const stretchItems = hotspots.filter(h => h.thumbZoneSuitability === 'stretch');
  const hardItems = hotspots.filter(h => h.thumbZoneSuitability === 'hard');

  const naturalCoveragePercent = Math.round((optimalItems.length / hotspots.length) * 100);
  const stretchCoveragePercent = Math.round((stretchItems.length / hotspots.length) * 100);
  const hardReachCoveragePercent = 100 - (naturalCoveragePercent + stretchCoveragePercent);

  // Overall ergonomics score out of 100
  const overallErgonomicScore = Math.min(100, Math.round(
    (optimalItems.reduce((sum, h) => sum + h.clickSharePercent, 0) * 1.0) +
    (stretchItems.reduce((sum, h) => sum + h.clickSharePercent, 0) * 0.7) +
    (hardItems.reduce((sum, h) => sum + h.clickSharePercent, 0) * 0.4)
  ));

  // Mobile Usability Score
  const mobileUsabilityScore = Math.min(100, Math.round(
    (overallErgonomicScore * 0.45) +
    (auditData.categories.technical.score * 0.3) +
    (auditData.categories.performance.score * 0.25)
  ));

  const optimizationTips: MobileHeatmapAnalysis['optimizationTips'] = [
    {
      type: 'positive',
      title: 'تركز عالي للنقرات في النصف العلوي (Above the Fold)',
      detail: `${aboveFoldClickShare}% من إجمالي التفاعلات تتركز قبل الحاجة للتمرير، وهو معدل ممتاز يحقق كفاءة تحويل سريعة.`
    },
    {
      type: overallErgonomicScore >= 75 ? 'positive' : 'warning',
      title: overallErgonomicScore >= 75 ? 'توزيع مريح ضمن نطاق الإبهام الطبيعي' : 'بعض الأزرار الحيوية تقع في زوايا صعبة الوصول',
      detail: `سجل مؤشر سهولة الوصول بالإبهام ${overallErgonomicScore}/100. العناصر الأكثر نقراً تقع في متناول يد واحدة دون إجهاد لمعصم المستخدم.`
    },
    {
      type: 'recommendation',
      title: 'تعزيز مساحة النقر (Tap Target Padding)',
      detail: 'تأكد من إضافة هوامش آمنة لا تقل عن 8 بكسل حول الروابط المتجاورة في قائمة الهيدر والفقرات لمنع النقرات العرضية.'
    }
  ];

  if (!hasOgImage) {
    optimizationTips.push({
      type: 'warning',
      title: 'غياب الصورة البارزة يقلل نقاط التثبيت البصري',
      detail: 'إضافة صورة أو وسائط متجاوبة في بداية المقال يرفع من مدة بقاء المستخدم (Dwell Time) بنسبة تفوق 35% على الهواتف.'
    });
  }

  return {
    hotspots,
    aboveFoldClickShare,
    topClickMagnet,
    thumbErgonomics: {
      naturalCoveragePercent,
      stretchCoveragePercent,
      hardReachCoveragePercent,
      overallErgonomicScore
    },
    mobileUsabilityScore,
    optimizationTips
  };
}
