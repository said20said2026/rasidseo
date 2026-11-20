export type AuditStatus = 'pass' | 'warning' | 'error';

export interface AuditorVoiceNote {
  itemId: string;
  text: string;
  audioUrl?: string;
  durationSeconds?: number;
  createdAt: string;
  isVoiceTranscribed?: boolean;
}

export interface AuditItem {
  id: string;
  category: 'onpage' | 'technical' | 'content' | 'performance' | 'security' | 'social';
  title: string;
  titleAr: string;
  status: AuditStatus;
  score: number; // 0 to 100
  currentValue?: string;
  idealValue?: string;
  descriptionAr: string;
  impactAr: 'حرج' | 'متوسط' | 'منخفض';
  fixGuideAr: string;
  codeSnippet?: string;
  auditorNote?: AuditorVoiceNote;
}

export interface CategoryScore {
  name: string;
  nameAr: string;
  score: number;
  passedCount: number;
  warningCount: number;
  errorCount: number;
  weight: number;
}

export interface HeadingsAnalysis {
  h1: string[];
  h2Count: number;
  h3Count: number;
  h4Count: number;
  h5Count?: number;
  h6Count?: number;
  sampleHeadings: { tag: string; text: string; position?: number }[];
}

export interface ImagesAnalysis {
  total: number;
  withAlt: number;
  withoutAlt: number;
  missingAltSamples: { src: string }[];
}

export interface LinksAnalysis {
  total: number;
  internal: number;
  external: number;
  nofollow: number;
}

export interface SocialTags {
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  ogType?: string;
  ogUrl?: string;
  twitterCard?: string;
  twitterTitle?: string;
  twitterDescription?: string;
  twitterImage?: string;
}

export interface KeywordItem {
  keyword: string;
  count: number;
  density: number; // percentage, e.g. 2.4%
  type: 'single' | 'phrase'; // 1-word or 2/3-word phrase
  status: 'optimal' | 'low' | 'high'; // optimal: 1% - 3%, low: < 1%, high: > 3.5%
  inTitle: boolean;
  inH1: boolean;
  inMetaDesc: boolean;
}

export interface KeywordDensityAnalysis {
  totalAnalyzedWords: number;
  uniqueWordsCount: number;
  topSingleKeywords: KeywordItem[];
  topPhrases: KeywordItem[];
  recommendations: {
    type: 'success' | 'warning' | 'info';
    titleAr: string;
    descriptionAr: string;
    actionAr?: string;
  }[];
}

export interface AiSeoAdvice {
  summary: string;
  topPriorities: string[];
  keywordOpportunities: string[];
  blogContentSuggestions: string[];
}

export interface ExternalLinkCheckResult {
  url: string;
  anchorText: string;
  statusCode?: number;
  statusText?: string;
  isBroken: boolean;
  errorType?: 'not_found' | 'server_error' | 'timeout' | 'network_error' | 'forbidden' | 'invalid_url';
  responseTimeMs?: number;
  isNofollow?: boolean;
  checkedAt?: string;
}

export interface BrokenLinksAnalysis {
  totalExternalChecked: number;
  brokenCount: number;
  workingCount: number;
  warningCount: number;
  links: ExternalLinkCheckResult[];
  summary: {
    brokenPercentage: number;
    hasBrokenLinks: boolean;
    recommendationAr: string;
  };
}

export interface SchemaIssue {
  severity: 'error' | 'warning' | 'info';
  property?: string;
  messageAr: string;
  fixGuideAr?: string;
  codeSnippet?: string;
}

export interface DetectedSchemaItem {
  id: string;
  type: string;
  context?: string;
  name?: string;
  isValid: boolean;
  hasWarnings: boolean;
  issues: SchemaIssue[];
  rawJson: string;
  parsedData?: Record<string, any>;
  richResultType?: string;
  recommendedFieldsMissing?: string[];
  requiredFieldsMissing?: string[];
}

export interface SchemaAnalysis {
  totalScriptsFound: number;
  totalEntitiesFound: number;
  validCount: number;
  warningCount: number;
  errorCount: number;
  detectedTypes: string[];
  items: DetectedSchemaItem[];
  rawScripts?: { index: number; rawText: string; isSyntacticallyValid: boolean; parseError?: string }[];
  summaryAr: string;
  overallStatus: 'valid' | 'has_warnings' | 'has_errors' | 'missing';
}

export type CWVStatus = 'good' | 'needs_improvement' | 'poor';

export interface CWVOptimizationGuide {
  titleAr: string;
  actionAr: string;
  difficulty: 'easy' | 'medium' | 'advanced';
  expectedGainAr: string;
  codeSnippet?: string;
}

export interface CoreWebVitalsMetric {
  id: 'lcp' | 'fid' | 'cls' | 'inp' | 'fcp' | 'ttfb';
  name: string;
  nameAr: string;
  fullNameEn: string;
  value: number;
  unit: 's' | 'ms' | '';
  displayValue: string;
  status: CWVStatus;
  thresholds: {
    good: number;
    needsImprovement: number;
  };
  category: 'loading' | 'interactivity' | 'visual_stability';
  categoryAr: string;
  descriptionAr: string;
  impactOnSeoAr: string;
  diagnosticsAr: string[];
  optimizationGuides: CWVOptimizationGuide[];
}

export interface CoreWebVitalsAnalysis {
  overallStatus: CWVStatus;
  overallScore: number;
  passedCount: number;
  warningCount: number;
  poorCount: number;
  device: 'mobile' | 'desktop';
  metrics: {
    lcp: CoreWebVitalsMetric;
    fid: CoreWebVitalsMetric;
    cls: CoreWebVitalsMetric;
    inp?: CoreWebVitalsMetric;
    fcp?: CoreWebVitalsMetric;
    ttfb?: CoreWebVitalsMetric;
  };
  summaryAr: string;
  recommendationsSummaryAr: string;
}

// Internal Linking Structure Analysis Types
export interface InternalLinkItem {
  url: string;
  path: string;
  anchorText: string;
  targetCategory: string; // e.g., 'مقالات ومدونة', 'منتجات وتسوق', 'خدمات', 'صفحة رئيسية', 'صفحات هامة', 'عام'
  isContextual: boolean; // inside paragraph/article/main content vs header/footer/nav
  isGenericAnchor: boolean; // e.g. "اضغط هنا", "اقرأ المزيد", "هنا"
  rel?: string;
}

export interface InternalLinkingCluster {
  category: string;
  count: number;
  percentage: number;
  sampleLinks: { path: string; anchorText: string }[];
}

export interface InternalLinkingSuggestion {
  id: string;
  type: 'hub_spoke' | 'anchor_optimization' | 'orphan_prevention' | 'depth_balance' | 'contextual_ratio';
  titleAr: string;
  priority: 'high' | 'medium' | 'low';
  descriptionAr: string;
  recommendationAr: string;
  exampleAr?: string;
}

export interface InternalLinkingAnalysis {
  totalInternalLinks: number;
  uniqueInternalUrls: number;
  contextualLinksCount: number;
  navigationalLinksCount: number;
  genericAnchorCount: number;
  emptyAnchorCount: number;
  linkHealthScore: number; // 0 - 100
  ratioPerThousandWords: number; // links per 1000 words
  clusters: InternalLinkingCluster[];
  topAnchors: { text: string; count: number; isGeneric: boolean }[];
  sampleLinks: InternalLinkItem[];
  suggestions: InternalLinkingSuggestion[];
}

// Security Headers (CSP & HSTS) In-depth Analysis Types
export interface CSPDirectiveItem {
  directive: string;
  values: string[];
  status: 'secure' | 'warning' | 'unsafe' | 'missing';
  descriptionAr: string;
}

export interface CSPRecommendationItem {
  id: string;
  category: 'critical' | 'important' | 'best_practice';
  titleAr: string;
  descriptionAr: string;
  impactAr: string; // أثرها المباشر في صد هجمات XSS
  recommendedDirective: string;
  codeSnippet?: string;
  priority: number; // 1 (أعلى أولوية) إلى 5
  isFulfilled: boolean;
  directiveName?: string;
  threatTypeAr: string;
}

export interface SecurityHeadersAnalysis {
  score: number; // 0 - 100
  grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
  xssProtection: {
    status: 'protected' | 'partial' | 'vulnerable';
    badgeAr: string;
    descriptionAr: string;
    cspHeaderFound: boolean;
    rawHeader?: string;
    hasUnsafeInline: boolean;
    hasUnsafeEval: boolean;
    hasWildcard: boolean;
    hasNonce: boolean;
    hasHash: boolean;
    hasStrictDynamic: boolean;
    hasObjectSrcNone: boolean;
    hasBaseUriSelf: boolean;
    hasFrameAncestors: boolean;
    hasRequireTrustedTypes: boolean;
    hasViolationReporting: boolean;
    score: number; // 0 - 100 specifically for CSP XSS defense
    grade: 'A+' | 'A' | 'B' | 'C' | 'D' | 'F';
    directives: CSPDirectiveItem[];
    risksAr: string[];
    recommendations: CSPRecommendationItem[];
    fixGuideAr: string;
  };
  mitmProtection: {
    status: 'protected' | 'partial' | 'vulnerable';
    badgeAr: string;
    descriptionAr: string;
    hstsHeaderFound: boolean;
    rawHeader?: string;
    maxAgeSeconds?: number;
    maxAgeDays?: number;
    includeSubDomains: boolean;
    preload: boolean;
    isOptimalMaxAge: boolean; // >= 1 year (31536000s)
    maxAgeYears?: number;
    subdomainsScopeAr?: string;
    preloadStatusAr?: string;
    validityEvaluationAr?: string;
    risksAr: string[];
    fixGuideAr: string;
  };
  otherHeaders: {
    xFrameOptions?: { present: boolean; value?: string; status: 'secure' | 'warning' | 'missing' };
    xContentTypeOptions?: { present: boolean; value?: string; status: 'secure' | 'missing' };
    referrerPolicy?: { present: boolean; value?: string; status: 'secure' | 'warning' | 'missing' };
    permissionsPolicy?: { present: boolean; value?: string; status: 'secure' | 'missing' };
  };
  serverFixConfigs: {
    nginx: string;
    apache: string;
    cloudflare: string;
    express: string;
    nextjs: string;
  };
  summaryAr: string;
}

// AI High-Intent Keywords Analysis Types (الكلمات الرئيسية ذات النية العالية للظهور العضوي)
export type SearchIntentType = 'commercial' | 'transactional' | 'informational_high' | 'navigational';

export interface HighIntentKeywordItem {
  id: string;
  keyword: string;
  intent: SearchIntentType;
  intentLabelAr: string;
  intentExplanationAr: string;
  opportunityScore: number; // 0 - 100
  difficulty: 'easy' | 'medium' | 'hard';
  difficultyLabelAr: string;
  estimatedVolume: string; // e.g. "1.5K - 3.8K / شهر"
  cpcPotential: 'high' | 'medium' | 'premium';
  cpcPotentialLabelAr: string;
  contentGap: 'missing' | 'weak' | 'covered';
  contentGapLabelAr: string;
  suggestedPlacement: 'h2_heading' | 'title_meta' | 'first_paragraph' | 'faq_schema' | 'anchor_link';
  suggestedPlacementLabelAr: string;
  actionableTipAr: string;
  readyHeadingAr: string; // e.g. "أفضل 7 استراتيجيات سيو لتصدر نتائج البحث في 2026"
  searchQueries: string[]; // Related high-intent LSI queries
}

export interface HighIntentKeywordsAnalysis {
  generatedAt: string;
  pageSummaryAr: string;
  targetTopicAr: string;
  keywords: HighIntentKeywordItem[];
  intentDistribution: {
    commercial: number;
    transactional: number;
    informational: number;
  };
  primaryGapAr: string;
  quickWinsAr: string[];
  suggestedContentPlan: {
    titleAr: string;
    targetKeyword: string;
    h2Headings: string[];
    faqQuestionAr: string;
  }[];
}

export interface AuditResult {
  url: string;
  analyzedAt: string;
  overallScore: number;
  loadTimeMs: number;
  statusCode: number;
  isHttps: boolean;
  pageTitle?: string;
  metaDescription?: string;
  canonicalUrl?: string;
  lang?: string;
  charset?: string;
  wordCount: number;
  textToHtmlRatio: number;
  pageSizeKb: number;
  robotsTxtFound: boolean;
  sitemapFound: boolean;
  schemasFound: string[];
  securityHeaders: {
    hsts: boolean;
    xFrameOptions: boolean;
    csp: boolean;
    xContentType: boolean;
  };
  headings: HeadingsAnalysis;
  images: ImagesAnalysis;
  links: LinksAnalysis;
  social: SocialTags;
  categories: {
    onpage: CategoryScore;
    technical: CategoryScore;
    content: CategoryScore;
    performance: CategoryScore;
    security: CategoryScore;
    social: CategoryScore;
  };
  items: AuditItem[];
  keywordsAnalysis?: KeywordDensityAnalysis;
  brokenLinksAnalysis?: BrokenLinksAnalysis;
  schemaAnalysis?: SchemaAnalysis;
  coreWebVitals?: CoreWebVitalsAnalysis;
  internalLinkingAnalysis?: InternalLinkingAnalysis;
  securityHeadersAnalysis?: SecurityHeadersAnalysis;
  highIntentKeywords?: HighIntentKeywordsAnalysis;
  roadmapPlan?: SeoRoadmapPlan;
  aiAdvice?: AiSeoAdvice;
  isCached?: boolean;
  cachedAgeSeconds?: number;
  isTurboMode?: boolean;
}

// Scheduled Audit & Email Reports Types
export type ScheduledAuditFrequency = 'daily' | 'weekly' | 'biweekly' | 'monthly';

export interface ScheduledAuditSubscription {
  id: string;
  email: string;
  url: string;
  siteName?: string;
  frequency: ScheduledAuditFrequency;
  dayOfWeek: number; // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
  timeOfDay: string; // e.g. "09:00"
  alertOnScoreDrop: boolean;
  scoreThreshold: number; // e.g. 80
  includeCoreWebVitals: boolean;
  includeBrokenLinks: boolean;
  includeAiRecommendations: boolean;
  status: 'active' | 'paused';
  createdAt: string;
  lastSentAt?: string;
  nextScheduledAt: string;
  totalReportsSent: number;
}

export interface EmailReportPreviewData {
  recipientEmail: string;
  subject: string;
  previewText: string;
  auditUrl: string;
  pageTitle: string;
  overallScore: number;
  scoreStatus: 'excellent' | 'good' | 'needs_improvement' | 'critical';
  frequencyLabelAr: string;
  stats: {
    passed: number;
    warnings: number;
    criticalErrors: number;
    loadTimeMs: number;
    wordCount: number;
  };
  cwvSummary?: {
    lcp: string;
    fid: string;
    cls: string;
  };
  topPriorities: string[];
  generatedAt: string;
}

// SEO 30-Day Execution Roadmap Types
export type RoadmapPhaseId = 'phase_1' | 'phase_2' | 'phase_3' | 'phase_4';
export type RoadmapTaskPriority = 'critical' | 'high' | 'medium';
export type RoadmapTaskDifficulty = 'easy' | 'medium' | 'hard';
export type RoadmapTaskStatus = 'todo' | 'in_progress' | 'completed';

export interface RoadmapSubStep {
  id: string;
  textAr: string;
  done: boolean;
}

export interface RoadmapTask {
  id: string;
  phaseId: RoadmapPhaseId;
  dayNumber: number; // Day 1 to 30
  weekNumber: number; // 1, 2, 3, or 4
  titleAr: string;
  descriptionAr: string;
  category: 'technical' | 'onpage' | 'content' | 'performance' | 'security' | 'social';
  priority: RoadmapTaskPriority;
  difficulty: RoadmapTaskDifficulty;
  estimatedMinutes: number;
  whyThisDayAr: string;
  expectedImpactAr: string;
  subSteps: RoadmapSubStep[];
  codeSnippet?: string;
  originalAuditItemId?: string;
  status: RoadmapTaskStatus;
  completedAt?: string;
}

export interface RoadmapPhase {
  id: RoadmapPhaseId;
  phaseNumber: number;
  weekLabelAr: string;
  titleAr: string;
  focusDescriptionAr: string;
  goalAr: string;
  targetMetricAr: string;
  tasks: RoadmapTask[];
}

export interface SeoRoadmapPlan {
  id: string;
  generatedAt: string;
  url: string;
  targetDomain: string;
  overallHealthScore: number;
  projectedScoreAfter30Days: number;
  totalPendingItems: number;
  estimatedTotalHours: number;
  executiveSummaryAr: string;
  targetGrowthImpactAr: string;
  phases: RoadmapPhase[];
  keyMilestonesAr: {
    day: number;
    milestoneAr: string;
  }[];
}

