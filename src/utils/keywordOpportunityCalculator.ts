import { AuditResult, HighIntentKeywordsAnalysis, KeywordDensityAnalysis, SearchIntentType } from '../types/seo';
import { generateHighIntentKeywords } from './highIntentKeywordsAnalyzer';

export interface KeywordOpportunityCloudItem {
  id: string;
  keyword: string;
  gapStatus: 'missing' | 'weak' | 'covered';
  gapStatusLabelAr: string;
  opportunityScore: number; // 0 to 100
  estimatedSearchVolume: string;
  numericalVolume: number;
  currentDensity: number; // percentage
  inTitle: boolean;
  inH1: boolean;
  inMetaDesc: boolean;
  intent: SearchIntentType;
  intentLabelAr: string;
  fontSizeRem: number; // Calculated font size for Word Cloud: 0.85rem to 2.2rem
  suggestedPlacementAr: string;
  actionableTipAr: string;
  cpcPotential: 'high' | 'medium' | 'premium';
}

export interface KeywordOpportunityAnalysis {
  items: KeywordOpportunityCloudItem[];
  missingCount: number;
  weakCount: number;
  coveredCount: number;
  totalCount: number;
  missingVolumePercentage: number;
  weakVolumePercentage: number;
  coveredVolumePercentage: number;
  untappedPotentialTrafficAr: string;
  highestValueKeyword: KeywordOpportunityCloudItem | null;
  overallOpportunityScore: number;
}

export function calculateKeywordOpportunities(auditData: AuditResult): KeywordOpportunityAnalysis {
  // Ensure we have highIntentKeywords
  let highIntentData: HighIntentKeywordsAnalysis =
    auditData.highIntentKeywords ||
    generateHighIntentKeywords({
      url: auditData.url,
      title: auditData.pageTitle,
      description: auditData.metaDescription,
      headings: auditData.headings,
      wordCount: auditData.wordCount,
      topKeywords: auditData.keywordsAnalysis?.topSingleKeywords.map((k) => ({
        word: k.keyword,
        count: k.count,
        density: k.density
      }))
    });

  const densityMap = new Map<string, { density: number; inTitle: boolean; inH1: boolean; inMetaDesc: boolean }>();
  if (auditData.keywordsAnalysis) {
    for (const item of [...auditData.keywordsAnalysis.topSingleKeywords, ...auditData.keywordsAnalysis.topPhrases]) {
      densityMap.set(item.keyword.toLowerCase().trim(), {
        density: item.density,
        inTitle: item.inTitle,
        inH1: item.inH1,
        inMetaDesc: item.inMetaDesc
      });
    }
  }

  // Parse volume string to numerical e.g. "3.5K - 7.2K / شهر" -> 5350
  const parseVolume = (volStr: string): number => {
    try {
      const match = volStr.match(/([\d.]+)\s*K/);
      if (match) {
        return Math.round(parseFloat(match[1]) * 1000);
      }
      const numMatch = volStr.match(/(\d+)/);
      if (numMatch) {
        return parseInt(numMatch[1], 10);
      }
    } catch {
      // fallback
    }
    return 1200;
  };

  const cloudItems: KeywordOpportunityCloudItem[] = [];
  const processedWords = new Set<string>();

  // 1. Process High-Intent Opportunities
  for (const hi of highIntentData.keywords) {
    const norm = hi.keyword.toLowerCase().trim();
    processedWords.add(norm);

    const existingDensity = densityMap.get(norm);
    const numericalVol = parseVolume(hi.estimatedVolume);

    // Font size calculation: based on opportunity score and volume
    // High opportunity missing keywords will be significantly larger (1.4rem - 2.2rem)
    let fontSize = 1.0;
    if (hi.contentGap === 'missing') {
      fontSize = 1.4 + (hi.opportunityScore / 100) * 0.8; // 1.4rem - 2.2rem
    } else if (hi.contentGap === 'weak') {
      fontSize = 1.1 + (hi.opportunityScore / 100) * 0.4; // 1.1rem - 1.5rem
    } else {
      fontSize = 0.9 + (hi.opportunityScore / 100) * 0.3; // 0.9rem - 1.2rem
    }

    cloudItems.push({
      id: `cloud-${hi.id}`,
      keyword: hi.keyword,
      gapStatus: hi.contentGap,
      gapStatusLabelAr:
        hi.contentGap === 'missing'
          ? 'فرصة مفقودة تماماً (تفتقر لها الصفحة)'
          : hi.contentGap === 'weak'
          ? 'تغطية ضعيفة تحتاج تعزيز'
          : 'مغطاة بنجاح في الصفحة',
      opportunityScore: hi.opportunityScore,
      estimatedSearchVolume: hi.estimatedVolume,
      numericalVolume: numericalVol,
      currentDensity: existingDensity ? existingDensity.density : hi.contentGap === 'missing' ? 0 : 0.8,
      inTitle: existingDensity?.inTitle || false,
      inH1: existingDensity?.inH1 || false,
      inMetaDesc: existingDensity?.inMetaDesc || false,
      intent: hi.intent,
      intentLabelAr: hi.intentLabelAr,
      fontSizeRem: Math.round(fontSize * 100) / 100,
      suggestedPlacementAr: hi.suggestedPlacementLabelAr,
      actionableTipAr: hi.actionableTipAr,
      cpcPotential: hi.cpcPotential
    });
  }

  // 2. Add Top existing covered keywords from KeywordDensityAnalysis if not already in pool
  if (auditData.keywordsAnalysis?.topSingleKeywords) {
    for (const kw of auditData.keywordsAnalysis.topSingleKeywords.slice(0, 10)) {
      const norm = kw.keyword.toLowerCase().trim();
      if (!processedWords.has(norm) && norm.length > 2) {
        processedWords.add(norm);
        cloudItems.push({
          id: `cloud-existing-${norm}`,
          keyword: kw.keyword,
          gapStatus: kw.status === 'low' ? 'weak' : 'covered',
          gapStatusLabelAr: kw.status === 'low' ? 'تغطية ضعيفة في الصفحة' : 'مغطاة حالياً في الصفحة',
          opportunityScore: kw.status === 'low' ? 68 : 50,
          estimatedSearchVolume: `${Math.round(kw.count * 180 + 400)} / شهر`,
          numericalVolume: kw.count * 180 + 400,
          currentDensity: kw.density,
          inTitle: kw.inTitle,
          inH1: kw.inH1,
          inMetaDesc: kw.inMetaDesc,
          intent: 'informational_high',
          intentLabelAr: 'نية استكشافية ومعلوماتية',
          fontSizeRem: 0.95 + Math.min(kw.density * 0.15, 0.4),
          suggestedPlacementAr: 'موزعة في نصوص وفقرات المقال',
          actionableTipAr: `الكلمة متكررة ${kw.count} مرات بنسبة ${kw.density}%. حافظ على هذا المستوى لمنع حشو الكلمات.`,
          cpcPotential: 'medium'
        });
      }
    }
  }

  // Sort: High opportunity missing keywords first, then by numerical volume
  cloudItems.sort((a, b) => {
    if (a.gapStatus === 'missing' && b.gapStatus !== 'missing') return -1;
    if (b.gapStatus === 'missing' && a.gapStatus !== 'missing') return 1;
    return b.opportunityScore - a.opportunityScore;
  });

  const missingCount = cloudItems.filter((i) => i.gapStatus === 'missing').length;
  const weakCount = cloudItems.filter((i) => i.gapStatus === 'weak').length;
  const coveredCount = cloudItems.filter((i) => i.gapStatus === 'covered').length;
  const totalCount = cloudItems.length;

  const totalVol = cloudItems.reduce((acc, curr) => acc + curr.numericalVolume, 0) || 1;
  const missingVol = cloudItems.filter((i) => i.gapStatus === 'missing').reduce((acc, curr) => acc + curr.numericalVolume, 0);
  const weakVol = cloudItems.filter((i) => i.gapStatus === 'weak').reduce((acc, curr) => acc + curr.numericalVolume, 0);
  const coveredVol = cloudItems.filter((i) => i.gapStatus === 'covered').reduce((acc, curr) => acc + curr.numericalVolume, 0);

  const missingVolumePercentage = Math.round((missingVol / totalVol) * 100);
  const weakVolumePercentage = Math.round((weakVol / totalVol) * 100);
  const coveredVolumePercentage = 100 - missingVolumePercentage - weakVolumePercentage;

  const potentialTrafficNum = missingVol + Math.round(weakVol * 0.5);
  const untappedPotentialTrafficAr = `+${(potentialTrafficNum >= 1000 ? (potentialTrafficNum / 1000).toFixed(1) + 'K' : potentialTrafficNum)} زيارة شهرية محتملة`;

  const highestValueKeyword = cloudItems.find((i) => i.gapStatus === 'missing') || cloudItems[0] || null;

  const overallOpportunityScore = Math.round(
    cloudItems.reduce((acc, c) => acc + (c.gapStatus === 'missing' ? c.opportunityScore : c.opportunityScore * 0.4), 0) /
      (cloudItems.length || 1)
  );

  return {
    items: cloudItems,
    missingCount,
    weakCount,
    coveredCount,
    totalCount,
    missingVolumePercentage,
    weakVolumePercentage,
    coveredVolumePercentage,
    untappedPotentialTrafficAr,
    highestValueKeyword,
    overallOpportunityScore
  };
}
