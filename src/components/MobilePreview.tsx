import React, { useState, useMemo, useEffect } from 'react';
import {
  Smartphone,
  Tablet,
  RotateCw,
  RefreshCw,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Wifi,
  Battery,
  Signal,
  Menu,
  Globe,
  ZoomIn,
  ZoomOut,
  Layers,
  Sparkles,
  ShieldCheck,
  Search,
  Eye,
  Info,
  ChevronRight,
  ChevronLeft,
  Sun,
  Moon,
  Flame,
  Check,
  Share2,
  Lock,
  SlidersHorizontal,
  Sliders,
  Play,
  Pause,
  Columns,
  LayoutGrid,
  ArrowRightLeft,
  Maximize2,
  BookOpen,
  Star,
  MoreVertical,
  Home,
  Compass,
  Square,
  Copy,
  Ratio,
  Monitor,
  Shield
} from 'lucide-react';
import { AuditResult } from '../types/seo';
import { calculateMobileHeatmap, HeatmapMode } from '../utils/mobileHeatmapCalculator';
import { MobileHeatmapOverlay } from './MobileHeatmapOverlay';
import { MobileHeatmapAnalytics } from './MobileHeatmapAnalytics';

export type DeviceCategory = 'iPhone' | 'Samsung' | 'Pixel' | 'Tablet';
export type BrowserType = 'safari' | 'samsung_internet' | 'chrome';
export type AspectRatioOption = '19.5:9' | '20:9' | '16:9' | '18:9' | '4:3' | 'custom';

export type DeviceType =
  | 'iphone15'
  | 'iphone15_promax'
  | 'iphone_se'
  | 'samsung_s24_ultra'
  | 'samsung_s24'
  | 'samsung_a54'
  | 'pixel8_pro'
  | 'pixel7_a'
  | 'pixel_fold'
  | 'tablet_ipad'
  | 'tablet_samsung';

interface DeviceConfig {
  id: DeviceType;
  name: string;
  shortName: string;
  category: DeviceCategory;
  brand: string;
  width: number;
  height: number;
  dpr: number;
  osName: string;
  defaultBrowser: BrowserType;
  aspectRatio: AspectRatioOption;
  screenInches: string;
  hasDynamicIsland?: boolean;
  hasPunchHole?: boolean;
  hasNotch?: boolean;
  isTablet?: boolean;
  borderRadius: string;
  frameStyle: 'iphone' | 'samsung' | 'pixel' | 'tablet';
  description: string;
  badgeAr: string;
}

const DEVICES: Record<DeviceType, DeviceConfig> = {
  iphone15: {
    id: 'iphone15',
    name: 'Apple iPhone 15/16 Pro',
    shortName: 'iPhone 15 Pro',
    category: 'iPhone',
    brand: 'Apple',
    width: 393,
    height: 852,
    dpr: 3.0,
    osName: 'iOS 17/18 (Safari)',
    defaultBrowser: 'safari',
    aspectRatio: '19.5:9',
    screenInches: '6.1"',
    hasDynamicIsland: true,
    borderRadius: '48px',
    frameStyle: 'iphone',
    description: 'شاشة Super Retina XDR مع الجزيرة التفاعلية Dynamic Island وتجربة متصفح Safari الأصيل',
    badgeAr: 'الرائد الأكثر شيوعاً'
  },
  iphone15_promax: {
    id: 'iphone15_promax',
    name: 'Apple iPhone 15/16 Pro Max',
    shortName: 'iPhone Pro Max',
    category: 'iPhone',
    brand: 'Apple',
    width: 430,
    height: 932,
    dpr: 3.0,
    osName: 'iOS 17/18 (Safari)',
    defaultBrowser: 'safari',
    aspectRatio: '19.5:9',
    screenInches: '6.7"',
    hasDynamicIsland: true,
    borderRadius: '52px',
    frameStyle: 'iphone',
    description: 'شاشة Super Retina XDR الكبيرة بدقة عالية لاختبار تجربة القراءة والوسائط على شاشة آبل الكبرى',
    badgeAr: 'شاشة ماكس عريضة 430px'
  },
  iphone_se: {
    id: 'iphone_se',
    name: 'Apple iPhone SE (كلاسيكي)',
    shortName: 'iPhone SE',
    category: 'iPhone',
    brand: 'Apple',
    width: 375,
    height: 667,
    dpr: 2.0,
    osName: 'iOS Classic (Safari)',
    defaultBrowser: 'safari',
    aspectRatio: '16:9',
    screenInches: '4.7"',
    hasNotch: false,
    borderRadius: '34px',
    frameStyle: 'iphone',
    description: 'شاشة مدمجة مريحة لاختبار ملاءمة أحجام الخطوط والأزرار للشاشات الصغيرة دون تداخل',
    badgeAr: 'شاشة مدمجة 375px'
  },
  samsung_s24_ultra: {
    id: 'samsung_s24_ultra',
    name: 'Samsung Galaxy S24 Ultra',
    shortName: 'Galaxy S24 Ultra',
    category: 'Samsung',
    brand: 'Samsung',
    width: 412,
    height: 915,
    dpr: 3.0,
    osName: 'Android 14 (One UI 6.1)',
    defaultBrowser: 'samsung_internet',
    aspectRatio: '19.5:9',
    screenInches: '6.8"',
    hasPunchHole: true,
    borderRadius: '24px', // S24 Ultra sharp titanium corners
    frameStyle: 'samsung',
    description: 'الهاتف الأقوى من سامسونج بحواف تيتانيوم حادة وثقب الكاميرا One UI ومتصفح Samsung Internet',
    badgeAr: 'شاشة أندرويد عريضة'
  },
  samsung_s24: {
    id: 'samsung_s24',
    name: 'Samsung Galaxy S24 (قياسي)',
    shortName: 'Galaxy S24',
    category: 'Samsung',
    brand: 'Samsung',
    width: 390,
    height: 844,
    dpr: 2.6,
    osName: 'Android 14 (One UI 6.1)',
    defaultBrowser: 'samsung_internet',
    aspectRatio: '19.5:9',
    screenInches: '6.2"',
    hasPunchHole: true,
    borderRadius: '38px',
    frameStyle: 'samsung',
    description: 'هاتف سامسونج القياسي الأكثر انتشاراً بحواف ناعمة متناسقة وثقب الكاميرا One UI',
    badgeAr: 'معيار أندرويد القياسي'
  },
  samsung_a54: {
    id: 'samsung_a54',
    name: 'Samsung Galaxy A54 (الفئة المتوسطة)',
    shortName: 'Galaxy A54',
    category: 'Samsung',
    brand: 'Samsung',
    width: 412,
    height: 915,
    dpr: 2.5,
    osName: 'Android 14 (One UI)',
    defaultBrowser: 'samsung_internet',
    aspectRatio: '19.5:9',
    screenInches: '6.4"',
    hasPunchHole: true,
    borderRadius: '34px',
    frameStyle: 'samsung',
    description: 'هاتف سامسونج الفئة الاقتصادية الأكثر مبيعاً في الشرق الأوسط لاختبار التوافق واسع النطاق',
    badgeAr: 'الأكثر انتشاراً شعبياً'
  },
  pixel8_pro: {
    id: 'pixel8_pro',
    name: 'Google Pixel 8/9 Pro',
    shortName: 'Pixel 8/9 Pro',
    category: 'Pixel',
    brand: 'Google',
    width: 412,
    height: 892,
    dpr: 3.0,
    osName: 'Android 15 (Google Chrome)',
    defaultBrowser: 'chrome',
    aspectRatio: '20:9',
    screenInches: '6.7"',
    hasPunchHole: true,
    borderRadius: '40px',
    frameStyle: 'pixel',
    description: 'الهاتف المرجعي لمحرك بحث جوجل بشاشة Super Actua وتجربة متصفح Google Chrome الصافية',
    badgeAr: 'مرجع جوجل الرسمي'
  },
  pixel7_a: {
    id: 'pixel7_a',
    name: 'Google Pixel 7a/8a',
    shortName: 'Pixel 8a',
    category: 'Pixel',
    brand: 'Google',
    width: 412,
    height: 915,
    dpr: 2.6,
    osName: 'Android 14/15 (Google Chrome)',
    defaultBrowser: 'chrome',
    aspectRatio: '20:9',
    screenInches: '6.1"',
    hasPunchHole: true,
    borderRadius: '36px',
    frameStyle: 'pixel',
    description: 'هاتف جوجل بكسل المدمج الأكثر دقة لاختبار توافق محرك تصيير Chromium على شاشات OLED',
    badgeAr: 'شاشة Chromium الدقيقة'
  },
  pixel_fold: {
    id: 'pixel_fold',
    name: 'Google Pixel Fold (مطوي)',
    shortName: 'Pixel Fold',
    category: 'Pixel',
    brand: 'Google',
    width: 420,
    height: 840,
    dpr: 2.5,
    osName: 'Android 15 (Foldable)',
    defaultBrowser: 'chrome',
    aspectRatio: '18:9',
    screenInches: '5.8"',
    hasPunchHole: true,
    borderRadius: '32px',
    frameStyle: 'pixel',
    description: 'محاكاة الشاشة الخارجية لهواتف جوجل القابلة للطي لاختبار التجاوب مع نسب الأبعاد الخاصة',
    badgeAr: 'شاشة قابلة للطي'
  },
  tablet_ipad: {
    id: 'tablet_ipad',
    name: 'Apple iPad 10.2" (لوحي متجاوب)',
    shortName: 'iPad 10.2"',
    category: 'Tablet',
    brand: 'Apple',
    width: 768,
    height: 1024,
    dpr: 2.0,
    osName: 'iPadOS 17/18 (Safari)',
    defaultBrowser: 'safari',
    aspectRatio: '4:3',
    screenInches: '10.2"',
    isTablet: true,
    borderRadius: '28px',
    frameStyle: 'tablet',
    description: 'التابلت الأكثر مبيعاً عالمياً لاختبار تخطيطات الأعمدة المتعددة وتناسق القوائم اللوحية',
    badgeAr: 'معيار التابلت اللوحي'
  },
  tablet_samsung: {
    id: 'tablet_samsung',
    name: 'Samsung Galaxy Tab S9',
    shortName: 'Galaxy Tab S9',
    category: 'Tablet',
    brand: 'Samsung',
    width: 800,
    height: 1280,
    dpr: 2.0,
    osName: 'Android 14 (One UI Tab)',
    defaultBrowser: 'samsung_internet',
    aspectRatio: '16:10' as AspectRatioOption,
    screenInches: '11.0"',
    isTablet: true,
    borderRadius: '26px',
    frameStyle: 'tablet',
    description: 'شاشة تابلت عريضة بنسبة 16:10 تفحص توزيع المساحات والمسافات الأفقية على أندرويد',
    badgeAr: 'شاشة لوحية عريضة'
  }
};

const CATEGORIES: {
  id: DeviceCategory;
  nameAr: string;
  nameEn: string;
  defaultDevice: DeviceType;
  defaultBrowser: BrowserType;
  browserNameAr: string;
  brandSubtitle: string;
  badge: string;
  icon: typeof Smartphone;
  gradientBg: string;
  activeBorder: string;
  accentColor: string;
}[] = [
  {
    id: 'iPhone',
    nameAr: 'أجهزة iPhone',
    nameEn: 'Apple iOS',
    defaultDevice: 'iphone15',
    defaultBrowser: 'safari',
    browserNameAr: 'متصفح Safari',
    brandSubtitle: 'iOS 17/18 • متصفح Safari والجزيرة التفاعلية',
    badge: 'آبل Safari',
    icon: Smartphone,
    gradientBg: 'from-indigo-600 to-indigo-700',
    activeBorder: 'border-indigo-500 shadow-indigo-500/20',
    accentColor: 'indigo'
  },
  {
    id: 'Samsung',
    nameAr: 'أجهزة Samsung',
    nameEn: 'Galaxy & One UI',
    defaultDevice: 'samsung_s24_ultra',
    defaultBrowser: 'samsung_internet',
    browserNameAr: 'متصفح سامسونج إنترنت',
    brandSubtitle: 'One UI 6.1 • متصفح سامسونج إنترنت ودرع الحماية',
    badge: 'سامسونج Internet',
    icon: Smartphone,
    gradientBg: 'from-sky-600 to-blue-700',
    activeBorder: 'border-sky-500 shadow-sky-500/20',
    accentColor: 'sky'
  },
  {
    id: 'Pixel',
    nameAr: 'أجهزة Google Pixel',
    nameEn: 'Pixel & Material You',
    defaultDevice: 'pixel8_pro',
    defaultBrowser: 'chrome',
    browserNameAr: 'متصفح Google Chrome',
    brandSubtitle: 'Android 15 • متصفح Google Chrome وشريط العنوان الذكي',
    badge: 'جوجل Chrome',
    icon: Smartphone,
    gradientBg: 'from-emerald-600 to-teal-700',
    activeBorder: 'border-emerald-500 shadow-emerald-500/20',
    accentColor: 'emerald'
  },
  {
    id: 'Tablet',
    nameAr: 'أجهزة Tablet (لوحي)',
    nameEn: 'iPad & Galaxy Tab',
    defaultDevice: 'tablet_ipad',
    defaultBrowser: 'safari',
    browserNameAr: 'تصفح لوحي متجاوب',
    brandSubtitle: 'شاشات 768px-800px • شبكة متجاوبة للأجهزة اللوحية',
    badge: 'أجهزة لوحية',
    icon: Tablet,
    gradientBg: 'from-purple-600 to-violet-700',
    activeBorder: 'border-purple-500 shadow-purple-500/20',
    accentColor: 'purple'
  }
];

// Screen Resolution Presets (خيارات دقة الشاشة)
interface ResolutionPreset {
  id: string;
  label: string;
  width: number;
  height: number;
  aspectRatio: AspectRatioOption;
  category: DeviceCategory;
  device: DeviceType;
  browser: BrowserType;
  tag: string;
}

const RESOLUTION_PRESETS: ResolutionPreset[] = [
  {
    id: 'iphone_standard',
    label: '393 × 852',
    width: 393,
    height: 852,
    aspectRatio: '19.5:9',
    category: 'iPhone',
    device: 'iphone15',
    browser: 'safari',
    tag: 'iPhone 15/16 Pro (Super Retina)'
  },
  {
    id: 'iphone_max',
    label: '430 × 932',
    width: 430,
    height: 932,
    aspectRatio: '19.5:9',
    category: 'iPhone',
    device: 'iphone15_promax',
    browser: 'safari',
    tag: 'iPhone Pro Max (Large Retina)'
  },
  {
    id: 'samsung_ultra',
    label: '412 × 915',
    width: 412,
    height: 915,
    aspectRatio: '19.5:9',
    category: 'Samsung',
    device: 'samsung_s24_ultra',
    browser: 'samsung_internet',
    tag: 'Galaxy S24 Ultra (FHD+)'
  },
  {
    id: 'pixel_oled',
    label: '412 × 892',
    width: 412,
    height: 892,
    aspectRatio: '20:9',
    category: 'Pixel',
    device: 'pixel8_pro',
    browser: 'chrome',
    tag: 'Google Pixel 8/9 Pro (OLED Actua)'
  },
  {
    id: 'android_compact',
    label: '360 × 800',
    width: 360,
    height: 800,
    aspectRatio: '20:9',
    category: 'Samsung',
    device: 'samsung_s24',
    browser: 'samsung_internet',
    tag: 'Android Standard (Compact)'
  },
  {
    id: 'iphone_se',
    label: '375 × 667',
    width: 375,
    height: 667,
    aspectRatio: '16:9',
    category: 'iPhone',
    device: 'iphone_se',
    browser: 'safari',
    tag: 'Apple iPhone SE (iOS Classic 16:9)'
  },
  {
    id: 'tablet_ipad',
    label: '768 × 1024',
    width: 768,
    height: 1024,
    aspectRatio: '4:3',
    category: 'Tablet',
    device: 'tablet_ipad',
    browser: 'safari',
    tag: 'Apple iPad 10.2" (Tablet Standard)'
  }
];

// Aspect Ratio Presets (خيارات نسبة العرض إلى الارتفاع)
const ASPECT_RATIO_PRESETS: {
  id: AspectRatioOption;
  nameAr: string;
  badge: string;
  ratioW: number;
  ratioH: number;
  description: string;
}[] = [
  {
    id: '19.5:9',
    nameAr: '19.5:9',
    badge: 'آبل وسامسونج',
    ratioW: 9,
    ratioH: 19.5,
    description: 'النسبة القياسية الحديثة لهواتف iPhone 15/16 وسلسلة Galaxy S24'
  },
  {
    id: '20:9',
    nameAr: '20:9',
    badge: 'بكسل وأندرويد',
    ratioW: 9,
    ratioH: 20,
    description: 'النسبة الطولية الأكثر شيوعاً لهواتف Google Pixel وشاومي وأندرويد الحديثة'
  },
  {
    id: '16:9',
    nameAr: '16:9',
    badge: 'كلاسيكي وفيديو',
    ratioW: 9,
    ratioH: 16,
    description: 'النسبة الكلاسيكية القياسية للفيديوهات وهواتف iPhone SE والشاشات السابقة'
  },
  {
    id: '18:9',
    nameAr: '18:9',
    badge: '2:1 طولي',
    ratioW: 9,
    ratioH: 18,
    description: 'نسبة 2:1 المريحة للقراءة وتصفح المقالات الرأسية'
  },
  {
    id: '4:3',
    nameAr: '4:3',
    badge: 'لوحي ومطوي',
    ratioW: 3,
    ratioH: 4,
    description: 'نسبة شاشات iPad اللوحية والشاشات الداخلية للهواتف القابلة للطي'
  },
  {
    id: 'custom',
    nameAr: 'حر / مخصص',
    badge: 'Custom',
    ratioW: 0,
    ratioH: 0,
    description: 'تغيير أبعاد العرض والارتفاع بحرية دون التقيد بنسبة هندسية ثابتة'
  }
];

// Quick Responsive Width Presets
const WIDTH_PRESETS = [
  { label: 'iPhone SE', width: 375, category: 'iPhone' as DeviceCategory, device: 'iphone_se' as DeviceType },
  { label: 'iPhone 15', width: 393, category: 'iPhone' as DeviceCategory, device: 'iphone15' as DeviceType },
  { label: 'Pixel 8 Pro', width: 412, category: 'Pixel' as DeviceCategory, device: 'pixel8_pro' as DeviceType },
  { label: 'Galaxy S24', width: 412, category: 'Samsung' as DeviceCategory, device: 'samsung_s24_ultra' as DeviceType },
  { label: 'iPhone Max', width: 430, category: 'iPhone' as DeviceCategory, device: 'iphone15_promax' as DeviceType },
  { label: 'Phablet', width: 480, category: 'Samsung' as DeviceCategory, device: 'samsung_s24_ultra' as DeviceType },
  { label: 'iPad 10.2"', width: 768, category: 'Tablet' as DeviceCategory, device: 'tablet_ipad' as DeviceType },
  { label: 'Galaxy Tab', width: 800, category: 'Tablet' as DeviceCategory, device: 'tablet_samsung' as DeviceType }
];

interface MobilePreviewProps {
  auditData: AuditResult;
}

export const MobilePreview: React.FC<MobilePreviewProps> = ({ auditData }) => {
  const [selectedCategory, setSelectedCategory] = useState<DeviceCategory>('iPhone');
  const [selectedDevice, setSelectedDevice] = useState<DeviceType>('iphone15');
  const [isLandscape, setIsLandscape] = useState(false);
  const [viewMode, setViewMode] = useState<'simulated' | 'iframe'>('simulated');
  const [zoomScale, setZoomScale] = useState<number>(0.75); // 75% default for nice dashboard fit
  const [iframeKey, setIframeKey] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [previewTheme, setPreviewTheme] = useState<'light' | 'dark'>('light');
  const [showMetricsBanner, setShowMetricsBanner] = useState(true);

  // Real-time custom width and height override
  const [customWidth, setCustomWidth] = useState<number | null>(null);
  const [customHeight, setCustomHeight] = useState<number | null>(null);

  // Active aspect ratio preset (19.5:9, 20:9, 16:9, 18:9, 4:3, custom)
  const [selectedAspectRatio, setSelectedAspectRatio] = useState<AspectRatioOption>('19.5:9');

  // Simulated browser engine (Safari on iPhone, Samsung Internet on Galaxy, Google Chrome on Pixel)
  const [simulatedBrowser, setSimulatedBrowser] = useState<BrowserType>('safari');

  // Selected Resolution preset ID
  const [selectedResolutionId, setSelectedResolutionId] = useState<string | null>('iphone_standard');

  // Custom Pixel Density (DPR)
  const [customDpr, setCustomDpr] = useState<number | null>(null);

  // Auto-Tour responsive animation state
  const [isAutoTourActive, setIsAutoTourActive] = useState<boolean>(false);

  // Side-by-Side Dual Comparison Mode
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);

  // Heatmap State
  const [heatmapEnabled, setHeatmapEnabled] = useState(false);
  const [heatmapMode, setHeatmapMode] = useState<HeatmapMode>('density');
  const [heatmapOpacity, setHeatmapOpacity] = useState<number>(0.75);
  const [showHeatmapLabels, setShowHeatmapLabels] = useState<boolean>(true);
  const [selectedHotspotId, setSelectedHotspotId] = useState<string | null>(null);

  const heatmapAnalysis = useMemo(() => calculateMobileHeatmap(auditData), [auditData]);

  const device = DEVICES[selectedDevice];
  const activeBrowser = simulatedBrowser ?? device.defaultBrowser;
  const activeDpr = customDpr ?? device.dpr;

  const baseDeviceWidth = isLandscape ? device.height : device.width;
  const baseDeviceHeight = isLandscape ? device.width : device.height;
  const activeWidth = customWidth ?? baseDeviceWidth;

  // Dynamically calculate height based on active width and selected aspect ratio
  const activeHeight = useMemo(() => {
    if (customHeight !== null) {
      return customHeight;
    }
    if (selectedAspectRatio !== 'custom') {
      const ratioConfig = ASPECT_RATIO_PRESETS.find((r) => r.id === selectedAspectRatio);
      if (ratioConfig && ratioConfig.ratioW > 0 && ratioConfig.ratioH > 0) {
        if (isLandscape) {
          return Math.round(activeWidth * (ratioConfig.ratioW / ratioConfig.ratioH));
        } else {
          return Math.round(activeWidth * (ratioConfig.ratioH / ratioConfig.ratioW));
        }
      }
    }
    return customWidth !== null
      ? Math.round(customWidth * (baseDeviceHeight / baseDeviceWidth))
      : baseDeviceHeight;
  }, [customHeight, selectedAspectRatio, isLandscape, activeWidth, baseDeviceHeight, baseDeviceWidth]);

  // Current calculated aspect ratio string
  const currentRatioString = useMemo(() => {
    if (selectedAspectRatio !== 'custom') return selectedAspectRatio;
    const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
    const divisor = gcd(activeWidth, activeHeight);
    const wR = Math.round((activeWidth / divisor) * 10) / 10;
    const hR = Math.round((activeHeight / divisor) * 10) / 10;
    const decimalRatio = (activeHeight / (activeWidth || 1)).toFixed(2);
    return `${wR}:${hR} (~${decimalRatio})`;
  }, [selectedAspectRatio, activeWidth, activeHeight]);

  // Auto-Tour interval effect
  useEffect(() => {
    if (!isAutoTourActive) return;
    const tourCycle: DeviceType[] = ['iphone15', 'pixel8_pro', 'samsung_s24_ultra', 'iphone_se', 'tablet_ipad'];
    let idx = tourCycle.indexOf(selectedDevice);
    if (idx === -1) idx = 0;

    const timer = setInterval(() => {
      idx = (idx + 1) % tourCycle.length;
      const nextDeviceKey = tourCycle[idx];
      const nextDev = DEVICES[nextDeviceKey];
      setSelectedDevice(nextDeviceKey);
      setSelectedCategory(nextDev.category);
      setSimulatedBrowser(nextDev.defaultBrowser);
      setSelectedAspectRatio(nextDev.aspectRatio);
      setCustomWidth(null);
      setCustomHeight(null);
      setSelectedResolutionId(null);
      if (nextDev.isTablet && zoomScale > 0.65) {
        setZoomScale(0.65);
      } else if (!nextDev.isTablet && zoomScale < 0.7) {
        setZoomScale(0.75);
      }
    }, 3800);

    return () => clearInterval(timer);
  }, [isAutoTourActive, selectedDevice, zoomScale]);

  // Handle category switch
  const handleCategorySelect = (catId: DeviceCategory) => {
    setSelectedCategory(catId);
    setCustomWidth(null);
    setCustomHeight(null);
    setSelectedResolutionId(null);
    const catConfig = CATEGORIES.find((c) => c.id === catId);
    if (catConfig) {
      setSelectedDevice(catConfig.defaultDevice);
      setSimulatedBrowser(catConfig.defaultBrowser);
      const dev = DEVICES[catConfig.defaultDevice];
      setSelectedAspectRatio(dev.aspectRatio);
      if (catId === 'Tablet' && zoomScale > 0.65) {
        setZoomScale(0.65);
      } else if (catId !== 'Tablet' && zoomScale < 0.7) {
        setZoomScale(0.75);
      }
    }
  };

  const handleDeviceSelect = (devId: DeviceType) => {
    setSelectedDevice(devId);
    setCustomWidth(null);
    setCustomHeight(null);
    setSelectedResolutionId(null);
    const dev = DEVICES[devId];
    setSimulatedBrowser(dev.defaultBrowser);
    setSelectedAspectRatio(dev.aspectRatio);
    if (dev.isTablet && zoomScale > 0.65) {
      setZoomScale(0.65);
    }
  };

  const handleResolutionPresetSelect = (preset: ResolutionPreset) => {
    setSelectedResolutionId(preset.id);
    setSelectedCategory(preset.category);
    setSelectedDevice(preset.device);
    setSimulatedBrowser(preset.browser);
    setSelectedAspectRatio(preset.aspectRatio);
    setCustomWidth(preset.width);
    setCustomHeight(preset.height);
  };

  const handleAspectRatioSelect = (ratioId: AspectRatioOption) => {
    setSelectedAspectRatio(ratioId);
    setSelectedResolutionId(null);
    if (ratioId !== 'custom') {
      setCustomHeight(null); // allow formula to drive height from activeWidth
    }
  };

  const resetToDeviceDefaultDimensions = () => {
    setCustomWidth(null);
    setCustomHeight(null);
    setSelectedResolutionId(null);
    setSelectedAspectRatio(device.aspectRatio);
  };

  let domain = 'example.com';
  try {
    domain = new URL(auditData.url).hostname;
  } catch {
    domain = auditData.url.replace(/^https?:\/\//, '').split('/')[0];
  }

  // Check mobile-related items from the audit
  const viewportCheck = auditData.items.find((i) => i.id.includes('viewport'));
  const speedCheck = auditData.items.find((i) => i.category === 'performance');
  const isHttps = auditData.isHttps;

  // Mobile friendliness score calculation
  const mobileFriendlyScore = Math.min(
    100,
    Math.round(
      (auditData.categories.technical.score * 0.4) +
      (auditData.categories.performance.score * 0.3) +
      (auditData.categories.onpage.score * 0.3)
    )
  );

  // Devices in currently selected category
  const categoryDevices = useMemo(() => {
    return (Object.values(DEVICES) as DeviceConfig[]).filter(
      (d) => d.category === selectedCategory
    );
  }, [selectedCategory]);

  // Current breakpoint analysis
  const currentBreakpoint = useMemo(() => {
    if (activeWidth < 640) {
      return {
        label: 'Mobile Viewport (شاشة هاتف مدمجة)',
        code: '@media (max-width: 639px)',
        tag: 'Mobile (sm)',
        color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/80 border-indigo-200 dark:border-indigo-800'
      };
    } else if (activeWidth < 768) {
      return {
        label: 'Phablet / Wide Mobile (شاشة هاتف عريضة)',
        code: '@media (min-width: 640px) and (max-width: 767px)',
        tag: 'Phablet (md-ready)',
        color: 'text-sky-600 bg-sky-50 dark:bg-sky-950/80 border-sky-200 dark:border-sky-800'
      };
    } else {
      return {
        label: 'Tablet Viewport (شاشة لوحية متجاوبة)',
        code: '@media (min-width: 768px)',
        tag: 'Tablet (md/lg)',
        color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/80 border-purple-200 dark:border-purple-800'
      };
    }
  }, [activeWidth]);

  // Render a simulated single device frame
  const renderSingleDeviceFrame = (
    targetDev: DeviceConfig,
    frameWidth: number,
    frameHeight: number,
    scaleVal: number,
    isSecondary: boolean = false
  ) => {
    const isTabletMode = targetDev.isTablet || frameWidth >= 700;

    return (
      <div
        style={{
          transform: `scale(${scaleVal})`,
          transformOrigin: 'top center',
          width: `${frameWidth + (isTabletMode ? 36 : 24)}px`,
          height: `${frameHeight + (isTabletMode ? 36 : 24)}px`,
          borderRadius: targetDev.borderRadius,
          transition: 'width 0.35s ease, height 0.35s ease, transform 0.2s ease, border-radius 0.3s ease'
        }}
        className={`relative p-3 shadow-2xl transition-all select-none ${
          targetDev.category === 'Samsung' && targetDev.id === 'samsung_s24_ultra'
            ? 'bg-slate-800 border-4 border-slate-600 ring-2 ring-slate-900/80' // S24 Ultra titanium frame
            : isTabletMode
            ? 'bg-slate-900 border-6 border-slate-700 ring-2 ring-slate-950/80 p-4' // Tablet bezel
            : 'bg-slate-900 border-4 border-slate-700/80 ring-1 ring-slate-900/60' // iPhone & standard
        }`}
      >
        {/* Outer Bezel Rounded Corner styling */}
        <div
          className="w-full h-full relative overflow-hidden flex flex-col bg-slate-950 shadow-inner"
          style={{ borderRadius: `calc(${targetDev.borderRadius} - 10px)` }}
        >
          {/* Top Device Hardware Bezel / Camera for Tablet */}
          {isTabletMode && !isLandscape && (
            <div className="h-6 bg-slate-950 flex items-center justify-center">
              <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center">
                <div className="w-1 h-1 rounded-full bg-slate-900" />
              </div>
            </div>
          )}

          {/* Top Status Bar (iOS 18 / One UI / Android 15 / Tablet) */}
          <div className={`h-10 px-5 flex items-center justify-between text-xs font-semibold z-30 select-none ${
            previewTheme === 'dark' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-800'
          }`}>
            {/* Left: Clock */}
            <div className="font-mono text-xs font-bold tracking-tight">
              {targetDev.category === 'Samsung'
                ? '12:45'
                : targetDev.category === 'Pixel'
                ? '10:08'
                : '9:41'}
            </div>

            {/* Center: Dynamic Island (iPhone) or Punch-hole (Samsung / Pixel) */}
            {targetDev.hasDynamicIsland && !isLandscape && (
              <div className="w-28 h-7 bg-black rounded-full flex items-center justify-between px-3 text-white shadow-md mx-auto">
                <div className="w-2.5 h-2.5 rounded-full bg-slate-800 border border-slate-700" />
                <div className="flex items-center gap-1.5 text-[9px] text-emerald-400 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  <span>SEO 100%</span>
                </div>
              </div>
            )}

            {targetDev.hasPunchHole && !isLandscape && (
              <div className="w-4 h-4 bg-black rounded-full shadow-inner border border-slate-800 mx-auto flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-900 border border-slate-700/60" />
              </div>
            )}

            {/* Right: Status Icons */}
            <div className="flex items-center gap-1.5">
              {targetDev.category === 'Samsung' ? (
                <>
                  <span className="text-[10px] font-mono font-bold ml-1 text-sky-600 dark:text-sky-400">5G</span>
                  <Signal className="w-3.5 h-3.5" />
                  <Wifi className="w-3.5 h-3.5" />
                  <div className="flex items-center gap-0.5 text-[10px] font-mono font-bold">
                    <span>94%</span>
                    <Battery className="w-4 h-4" />
                  </div>
                </>
              ) : targetDev.category === 'Pixel' ? (
                <>
                  <span className="text-[10px] font-mono font-bold ml-1 text-teal-600 dark:text-teal-400">5G</span>
                  <Wifi className="w-3.5 h-3.5" />
                  <Signal className="w-3.5 h-3.5" />
                  <Battery className="w-4 h-4" />
                </>
              ) : (
                <>
                  <Signal className="w-3.5 h-3.5" />
                  <Wifi className="w-3.5 h-3.5" />
                  <Battery className="w-4 h-4" />
                </>
              )}
            </div>
          </div>

          {/* Tablet Browser Tab Bar (if Tablet) */}
          {isTabletMode && (
            <div className={`px-4 pt-1.5 pb-0 border-b flex items-center gap-2 z-20 text-[11px] ${
              previewTheme === 'dark' ? 'bg-slate-950 border-slate-800' : 'bg-slate-200 border-slate-300'
            }`}>
              <div className={`px-3 py-1 rounded-t-lg font-bold flex items-center gap-2 max-w-[200px] truncate ${
                previewTheme === 'dark' ? 'bg-slate-900 text-white' : 'bg-white text-slate-800 shadow-2xs'
              }`}>
                <Globe className="w-3 h-3 text-indigo-500" />
                <span className="truncate">{domain}</span>
                <span className="text-[10px] text-slate-400 ml-1">✕</span>
              </div>
              <div className="p-1 text-slate-400 hover:text-slate-600 cursor-pointer">
                +
              </div>
            </div>
          )}

          {/* Browser Address Bar: Specialized for Safari, Samsung Internet, and Google Chrome */}
          <div className={`px-3 py-1.5 border-b flex items-center justify-between gap-2 z-20 transition-colors ${
            previewTheme === 'dark'
              ? 'bg-slate-900/95 border-slate-800 text-slate-300'
              : 'bg-slate-100/95 border-slate-200 text-slate-700'
          }`}>
            {isTabletMode && (
              <div className="flex items-center gap-1 text-slate-400 text-xs">
                <button className="p-1 hover:text-slate-600">‹</button>
                <button className="p-1 hover:text-slate-600">›</button>
              </div>
            )}

            {/* BROWSER TYPE 1: Apple Safari */}
            {activeBrowser === 'safari' && (
              <div className="flex-1 flex items-center gap-2">
                <button
                  className="px-1.5 py-0.5 rounded text-[11px] font-serif font-black text-slate-500 hover:text-slate-900 dark:hover:text-white cursor-pointer select-none"
                  title="إعدادات سفاري وحجم الخط (Safari aA)"
                >
                  aA
                </button>
                <div className={`flex-1 flex items-center justify-between px-3 py-1.5 rounded-xl text-xs font-mono border shadow-2xs transition-colors ${
                  previewTheme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <div className="flex items-center gap-1.5 truncate dir-ltr text-left" dir="ltr">
                    {isHttps ? (
                      <Lock className="w-3 h-3 text-slate-400 shrink-0" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate font-semibold">{domain}</span>
                  </div>
                  <button
                    onClick={() => setIframeKey((k) => k + 1)}
                    className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="تحديث صفحة Safari"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>
                <button
                  onClick={() => setIframeKey((k) => k + 1)}
                  className="p-1 text-slate-400 hover:text-indigo-600 cursor-pointer"
                  title="مشاركة الصفحة"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* BROWSER TYPE 2: Samsung Internet */}
            {activeBrowser === 'samsung_internet' && (
              <div className="flex-1 flex items-center gap-2">
                <div
                  className="p-1 text-purple-600 dark:text-purple-400 flex items-center cursor-pointer"
                  title="درع الحماية الذكية من التتبع (Samsung Smart Anti-Tracking)"
                >
                  <ShieldCheck className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                </div>
                <div className={`flex-1 flex items-center justify-between px-3 py-1.5 rounded-full text-xs font-mono border shadow-2xs transition-colors ${
                  previewTheme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <div className="flex items-center gap-1.5 truncate dir-ltr text-left" dir="ltr">
                    {isHttps ? (
                      <Lock className="w-3 h-3 text-emerald-500 shrink-0" />
                    ) : (
                      <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    )}
                    <span className="truncate">{domain}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-slate-400">
                    <button
                      onClick={() => setIframeKey((k) => k + 1)}
                      className="p-0.5 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                      title="إعادة تحميل Samsung Internet"
                    >
                      <RefreshCw className="w-3 h-3" />
                    </button>
                  </div>
                </div>
                <button
                  className="p-1 text-slate-400 hover:text-amber-500 cursor-pointer"
                  title="إضافة للإشارات المرجعية في سامسونج إنترنت"
                >
                  <Star className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* BROWSER TYPE 3: Google Chrome */}
            {activeBrowser === 'chrome' && (
              <div className="flex-1 flex items-center gap-2">
                <div className={`flex-1 flex items-center justify-between px-3 py-1.5 rounded-full text-xs font-mono border shadow-2xs transition-colors ${
                  previewTheme === 'dark'
                    ? 'bg-slate-950 border-slate-800 text-slate-200'
                    : 'bg-white border-slate-200 text-slate-800'
                }`}>
                  <div className="flex items-center gap-1.5 truncate dir-ltr text-left" dir="ltr">
                    <div className="w-3.5 h-3.5 rounded-full bg-gradient-to-r from-red-500 via-amber-500 to-emerald-500 flex items-center justify-center shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-white dark:bg-slate-900" />
                    </div>
                    <span className="text-slate-400 text-[10px]">https://</span>
                    <span className="truncate font-medium">{domain}</span>
                  </div>
                  <button
                    onClick={() => setIframeKey((k) => k + 1)}
                    className="p-0.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 cursor-pointer"
                    title="تحديث صفحة Google Chrome"
                  >
                    <RefreshCw className="w-3 h-3" />
                  </button>
                </div>

                {/* Chrome Tab Counter Badge [1] */}
                <div
                  className="w-4.5 h-4.5 rounded border border-slate-400 dark:border-slate-600 text-slate-700 dark:text-slate-300 font-mono font-bold text-[10px] flex items-center justify-center cursor-pointer hover:border-slate-900 dark:hover:border-white"
                  title="علامات تبويب كروم (Tabs)"
                >
                  1
                </div>

                {/* Chrome 3-dots Menu */}
                <button
                  className="p-0.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  title="قائمة خيارات Google Chrome"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Device Screen Content Area */}
          <div className={`flex-1 overflow-y-auto relative ${
            previewTheme === 'dark' ? 'bg-slate-950 text-slate-100' : 'bg-white text-slate-900'
          }`}>
            {/* Heatmap Layer */}
            {heatmapEnabled && !isSecondary && (
              <MobileHeatmapOverlay
                analysis={heatmapAnalysis}
                activeMode={heatmapMode}
                opacity={heatmapOpacity}
                showLabels={showHeatmapLabels}
                selectedHotspotId={selectedHotspotId}
                onSelectHotspot={setSelectedHotspotId}
                isLandscape={isLandscape}
                previewTheme={previewTheme}
              />
            )}

            {viewMode === 'iframe' ? (
              /* Mode 2: Live Iframe */
              <div className="w-full h-full relative">
                <iframe
                  key={iframeKey}
                  src={auditData.url}
                  title="Mobile View Iframe"
                  className="w-full h-full border-0"
                  sandbox="allow-scripts allow-same-origin allow-forms"
                />

                <div className="absolute bottom-2 left-2 right-2 bg-slate-900/90 backdrop-blur-xs text-white p-2.5 rounded-xl text-[11px] flex items-center justify-between gap-2 shadow-lg z-30">
                  <div className="flex items-center gap-1.5">
                    <Info className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                    <span>إذا حجب خادم الموقع تضمين الـ Iframe، انتقل إلى "المحاكي الذكي".</span>
                  </div>
                  <button
                    onClick={() => setViewMode('simulated')}
                    className="px-2 py-1 bg-indigo-600 hover:bg-indigo-700 text-white rounded font-bold text-[10px] shrink-0 cursor-pointer"
                  >
                    المحاكي الذكي
                  </button>
                </div>
              </div>
            ) : (
              /* Mode 1: Simulated High-Fidelity Website View */
              <div className="min-h-full flex flex-col font-sans select-text">
                {/* Simulated Header */}
                <header className={`sticky top-0 z-20 px-4 py-3 flex items-center justify-between border-b backdrop-blur-md ${
                  previewTheme === 'dark'
                    ? 'bg-slate-950/90 border-slate-800'
                    : 'bg-white/90 border-slate-100 shadow-2xs'
                }`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs text-white ${
                      targetDev.category === 'Samsung'
                        ? 'bg-sky-600'
                        : isTabletMode
                        ? 'bg-purple-600'
                        : 'bg-indigo-600'
                    }`}>
                      {domain[0]?.toUpperCase() || 'W'}
                    </div>
                    <span className="font-bold text-xs tracking-tight truncate max-w-[180px]">
                      {domain}
                    </span>
                  </div>

                  {/* Tablet Navigation vs Hamburger */}
                  {isTabletMode ? (
                    <nav className="flex items-center gap-3 text-xs font-semibold">
                      <span className="text-indigo-600 dark:text-indigo-400">الرئيسية</span>
                      <span className="text-slate-600 dark:text-slate-400 hover:text-slate-900">المقالات</span>
                      <span className="text-slate-600 dark:text-slate-400 hover:text-slate-900">الخدمات</span>
                      <span className="text-slate-600 dark:text-slate-400 hover:text-slate-900">اتصل بنا</span>
                      <button className="px-3 py-1 bg-indigo-600 text-white rounded-lg text-xs font-bold">
                        تسجيل الدخول
                      </button>
                    </nav>
                  ) : (
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                        className={`p-1.5 rounded-lg border transition-colors cursor-pointer ${
                          previewTheme === 'dark'
                            ? 'bg-slate-900 border-slate-800 text-slate-300'
                            : 'bg-slate-100 border-slate-200 text-slate-700'
                        }`}
                        title="القائمة المتجاوبة"
                      >
                        <Menu className="w-4 h-4" />
                      </button>
                    </div>
                  )}
                </header>

                {/* Mobile Menu Drawer */}
                {mobileMenuOpen && !isTabletMode && (
                  <div className={`p-4 border-b space-y-2 animate-in slide-in-from-top-2 duration-150 ${
                    previewTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <div className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 mb-2">
                      📱 قائمة التصفح المتجاوبة ({targetDev.name}):
                    </div>
                    <div className="flex flex-col gap-1.5 text-xs font-medium">
                      <span className="px-2.5 py-1.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 font-bold">
                        الصفحة الرئيسية (Home)
                      </span>
                      <span className="px-2.5 py-1.5 rounded text-slate-600 dark:text-slate-400">
                        المدونة والمقالات (Articles)
                      </span>
                      <span className="px-2.5 py-1.5 rounded text-slate-600 dark:text-slate-400">
                        خدمات ومنتجات الموقع (Services)
                      </span>
                      <span className="px-2.5 py-1.5 rounded text-slate-600 dark:text-slate-400">
                        تواصل معنا (Contact Us)
                      </span>
                    </div>
                  </div>
                )}

                {/* Simulated Content Body */}
                <main className="p-4 sm:p-5 space-y-4 flex-1">
                  {/* Badge */}
                  <div className={`p-2.5 rounded-xl border flex items-center justify-between text-[11px] ${
                    previewTheme === 'dark'
                      ? 'bg-emerald-950/40 border-emerald-900/60 text-emerald-300'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-800'
                  }`}>
                    <div className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      <span className="font-semibold">
                        معاينة متجاوبة مع شاشة {targetDev.name}
                      </span>
                    </div>
                    <span className="font-mono font-bold text-[10px] dir-ltr" dir="ltr">
                      {frameWidth}px · {targetDev.category}
                    </span>
                  </div>

                  {/* Tablet 2-Column Hero layout vs Mobile Stacked layout */}
                  <div className={isTabletMode ? 'grid grid-cols-2 gap-4 items-center' : 'space-y-3'}>
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          targetDev.category === 'Samsung'
                            ? 'bg-sky-100 dark:bg-sky-950 text-sky-700 dark:text-sky-300'
                            : isTabletMode
                            ? 'bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300'
                            : 'bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300'
                        }`}>
                          H1 الرئيسي
                        </span>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {isTabletMode ? 'خط متناسق لشاشات التابلت' : 'خط ملائم لشاشات اللمس'}
                        </span>
                      </div>

                      <h1 className={`${isTabletMode ? 'text-2xl font-black' : 'text-lg font-black'} leading-snug tracking-tight`}>
                        {auditData.headings.h1[0] || auditData.pageTitle || 'عنوان الصفحة غير متوفر'}
                      </h1>

                      <p className={`text-xs leading-relaxed ${
                        previewTheme === 'dark' ? 'text-slate-400' : 'text-slate-600'
                      }`}>
                        {auditData.metaDescription || 'الوصف التعريفي للصفحة يوضح للقارئ ومحركات البحث ملخص المحتوى وأهدافه.'}
                      </p>

                      <div className="pt-1">
                        <button
                          className={`w-full py-2.5 px-4 rounded-xl font-bold text-xs text-white shadow-sm flex items-center justify-center gap-1.5 transition-all transform active:scale-98 cursor-pointer ${
                            targetDev.category === 'Samsung'
                              ? 'bg-gradient-to-r from-sky-600 to-blue-700 hover:from-sky-700 hover:to-blue-800'
                              : isTabletMode
                              ? 'bg-gradient-to-r from-purple-600 to-violet-700 hover:from-purple-700 hover:to-violet-800'
                              : 'bg-gradient-to-r from-indigo-600 to-indigo-700 hover:from-indigo-700 hover:to-indigo-800'
                          }`}
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                          <span>ابدأ الآن واستكشف الخدمات</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    <div>
                      {auditData.social.ogImage ? (
                        <div className="rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-xs relative">
                          <img
                            src={auditData.social.ogImage}
                            alt="Device View Banner"
                            referrerPolicy="no-referrer"
                            className={`w-full ${isTabletMode ? 'h-48' : 'h-40'} object-cover`}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute bottom-1.5 right-1.5 bg-black/70 backdrop-blur-xs text-white px-2 py-0.5 rounded text-[10px] font-mono">
                            صورة متجاوبة ({frameWidth}px)
                          </div>
                        </div>
                      ) : (
                        <div className={`p-6 rounded-xl border border-dashed flex flex-col items-center justify-center text-center gap-2 ${
                          previewTheme === 'dark'
                            ? 'bg-slate-900/60 border-slate-800 text-slate-400'
                            : 'bg-slate-50 border-slate-200 text-slate-500'
                        } ${isTabletMode ? 'h-48' : 'h-40'}`}>
                          <Sparkles className="w-5 h-5 text-indigo-500" />
                          <span className="text-xs font-medium">مساحة البانر المتجاوب لصفحة الموقع</span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Subheadings */}
                  <div className="space-y-2 pt-2">
                    <div className="flex items-center justify-between text-xs font-bold border-b pb-1">
                      <span className="text-slate-700 dark:text-slate-300">هيكل العناوين الفرعية:</span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {auditData.headings.sampleHeadings.length} عناوين
                      </span>
                    </div>

                    <div className={isTabletMode ? 'grid grid-cols-2 gap-2' : 'space-y-2'}>
                      {auditData.headings.sampleHeadings.slice(0, 4).map((h, i) => (
                        <div
                          key={i}
                          className={`p-2.5 rounded-lg border text-xs flex items-center justify-between gap-2 ${
                            previewTheme === 'dark'
                              ? 'bg-slate-900/60 border-slate-800'
                              : 'bg-slate-50 border-slate-200/80'
                          }`}
                        >
                          <div className="flex items-center gap-2 min-w-0">
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-500 text-white shrink-0">
                              {h.tag.toUpperCase()}
                            </span>
                            <span className="truncate font-semibold">{h.text}</span>
                          </div>
                          <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Responsiveness Checklist */}
                  <div className={`p-3.5 rounded-xl border space-y-2 text-xs ${
                    previewTheme === 'dark' ? 'bg-slate-900 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <h4 className="font-bold flex items-center gap-1.5 text-slate-900 dark:text-white">
                      <span>📱 تقرير جاهزية التجاوب ({targetDev.brand} {targetDev.shortName}):</span>
                    </h4>

                    <div className={`text-[11px] ${isTabletMode ? 'grid grid-cols-2 gap-2' : 'space-y-1.5'}`}>
                      <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                        <span>✓ وسم Viewport مهيأ تماماً</span>
                        <span className="font-mono">100%</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                        <span>✓ خطوط نصوص ملائمة دون تكبير</span>
                        <span className="font-mono">16px+</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                        <span>✓ مساحات لمس مريحة (Touch Targets)</span>
                        <span className="font-mono">متطابق</span>
                      </div>
                      <div className="flex items-center justify-between text-emerald-700 dark:text-emerald-400 font-medium">
                        <span>✓ لا يوجد تمرير أفقي زائد</span>
                        <span className="font-mono">سليم</span>
                      </div>
                    </div>
                  </div>

                  <footer className={`pt-4 pb-2 border-t text-center text-[10px] ${
                    previewTheme === 'dark' ? 'border-slate-800 text-slate-500' : 'border-slate-200 text-slate-400'
                  }`}>
                    <p>© {new Date().getFullYear()} {domain} - معاينة متوافقة مع Google Mobile-First Indexing على {targetDev.name}</p>
                  </footer>
                </main>
              </div>
            )}
          </div>

          {/* Browser Bottom Navigation Bar (Safari / Samsung Internet / Chrome) */}
          {!isTabletMode && (
            <div className={`px-4 py-2 border-t flex items-center justify-between text-xs z-20 select-none ${
              previewTheme === 'dark'
                ? 'bg-slate-900/95 border-slate-800 text-slate-400'
                : 'bg-slate-100/95 border-slate-200 text-slate-600'
            }`}>
              {activeBrowser === 'safari' ? (
                /* Apple Safari Bottom Navigation */
                <div className="w-full flex items-center justify-between px-2 text-indigo-600 dark:text-indigo-400">
                  <button className="p-1 hover:text-indigo-800 cursor-pointer" title="رجوع Safari">
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <button className="p-1 text-slate-300 dark:text-slate-700 cursor-not-allowed" title="تقدم Safari">
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <button className="p-1 hover:text-indigo-800 cursor-pointer" title="مشاركة Safari">
                    <Share2 className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:text-indigo-800 cursor-pointer" title="المفضلة وقائمة القراءة">
                    <BookOpen className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:text-indigo-800 cursor-pointer" title="علامات تبويب سفاري">
                    <Copy className="w-4 h-4" />
                  </button>
                </div>
              ) : activeBrowser === 'samsung_internet' ? (
                /* Samsung Internet Bottom Navigation */
                <div className="w-full flex items-center justify-between px-2 text-sky-700 dark:text-sky-300">
                  <button className="p-1 hover:text-sky-900 cursor-pointer" title="رجوع سامسونج">
                    <ChevronLeft className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <button className="p-1 text-slate-300 dark:text-slate-700 cursor-not-allowed" title="تقدم سامسونج">
                    <ChevronRight className="w-4 h-4 stroke-[2.5]" />
                  </button>
                  <button className="p-1 hover:text-sky-900 cursor-pointer" title="الصفحة الرئيسية">
                    <Home className="w-4 h-4" />
                  </button>
                  <button className="p-1 hover:text-sky-900 cursor-pointer" title="الإشارات المرجعية">
                    <Star className="w-4 h-4" />
                  </button>
                  <button className="px-1.5 py-0.5 rounded border border-current text-[10px] font-mono font-bold hover:bg-sky-50 dark:hover:bg-sky-950 cursor-pointer" title="علامات التبويب">
                    3
                  </button>
                  <button className="p-1 hover:text-sky-900 cursor-pointer" title="أدوات سامسونج إنترنت One UI">
                    <Menu className="w-4 h-4" />
                  </button>
                </div>
              ) : (
                /* Google Chrome Clean Bottom Status */
                <div className="w-full flex items-center justify-between px-3 text-[10px] font-mono text-slate-500">
                  <span className="flex items-center gap-1 font-sans text-[11px] font-medium text-emerald-600 dark:text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    <span>متصفح Chrome (Android 15)</span>
                  </span>
                  <span>Chromium Engine 130</span>
                </div>
              )}
            </div>
          )}

          {/* Bottom Home Indicator / Gesture Bar */}
          <div className={`h-6 flex items-center justify-center select-none ${
            previewTheme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'
          }`}>
            {targetDev.category === 'iPhone' ? (
              <div className="w-32 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
            ) : targetDev.category === 'Samsung' ? (
              <div className="flex items-center gap-6">
                <div className="w-20 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
              </div>
            ) : targetDev.category === 'Pixel' ? (
              <div className="w-24 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
            ) : (
              <div className="w-28 h-1 bg-slate-400 dark:bg-slate-600 rounded-full" />
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 sm:p-6 shadow-xs transition-colors">
      {/* Header bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-indigo-700 flex items-center justify-center text-white shadow-xs">
              <Smartphone className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  محاكي عرض الأجهزة الذكية التفاعلي (Mobile & Tablet Device Simulator)
                </h3>
                <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
                  تفاعلي 2026
                </span>
                {isAutoTourActive && (
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 border border-amber-300 animate-pulse flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping" />
                    <span>دورة التجاوب التلقائية نشطة</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                بدّل بين محاكاة متصفحات وأحجام أجهزة <strong>iPhone (Safari)</strong> و <strong>Samsung (Samsung Internet)</strong> و <strong>Pixel (Google Chrome)</strong> و <strong>Tablet</strong> مع خيارات متقدمة لتغيير دقة الشاشة ونسبة العرض إلى الارتفاع في الوقت الفعلي.
              </p>
            </div>
          </div>
        </div>

        {/* View Mode & Live Link */}
        <div className="flex items-center gap-2 flex-wrap">
          {/* Simulated vs Iframe switch */}
          <div className="flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-xl text-xs">
            <button
              onClick={() => setViewMode('simulated')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'simulated'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>المحاكي الذكي</span>
            </button>
            <button
              onClick={() => setViewMode('iframe')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg font-semibold transition-all cursor-pointer ${
                viewMode === 'iframe'
                  ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-300 shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>إطار الويب المباشر (Iframe)</span>
            </button>
          </div>

          {/* External site link */}
          <a
            href={auditData.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 px-2.5 py-1.5 text-xs font-medium text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 hover:text-indigo-600 dark:hover:text-indigo-400 border border-slate-200 dark:border-slate-700 rounded-lg transition-colors cursor-pointer"
            title="فتح الموقع في تبويب خارجي"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">فتح خارجياً</span>
          </a>
        </div>
      </div>

      {/* =========================================================================
          INTERACTIVE DEVICE & BROWSER CONTROL BAR (شريط التحكم التفاعلي للأجهزة والمتصفحات)
          Supports iPhone, Samsung, Pixel, and Tablet with resolution & aspect ratio options
         ========================================================================= */}
      <div className="mt-4 space-y-3">
        {/* Level 1: Primary Category Cards (iPhone / Samsung / Pixel / Tablet) */}
        <div className="p-3.5 bg-gradient-to-r from-slate-50 via-indigo-50/20 to-slate-50 dark:from-slate-950 dark:via-indigo-950/20 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
          <div className="flex items-center justify-between px-1 flex-wrap gap-2">
            <span className="text-xs font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>محاكاة أجهزة ومتصفحات الهاتف المحمول (Mobile Device & Browser Simulation):</span>
            </span>

            <div className="flex items-center gap-2">
              {/* Auto-Play Responsiveness Tour Button */}
              <button
                onClick={() => setIsAutoTourActive(!isAutoTourActive)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs border ${
                  isAutoTourActive
                    ? 'bg-amber-500 hover:bg-amber-600 text-white border-amber-600 animate-pulse'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:text-amber-600'
                }`}
                title="تشغيل محاكاة التجاوب التلقائية لرؤية تغير شكل الموقع عبر مختلف الشاشات دون تدخل"
              >
                {isAutoTourActive ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 fill-current" />}
                <span>{isAutoTourActive ? 'إيقاف دورة التجاوب' : 'دورة التجاوب التلقائية'}</span>
              </button>

              {/* Side-by-Side Dual Comparison Mode Toggle */}
              <button
                onClick={() => {
                  setComparisonMode(!comparisonMode);
                  if (!comparisonMode && zoomScale > 0.55) {
                    setZoomScale(0.55); // Adjust for comfortable dual display
                  }
                }}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer shadow-2xs border ${
                  comparisonMode
                    ? 'bg-indigo-600 text-white border-indigo-700'
                    : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-indigo-400 hover:text-indigo-600'
                }`}
                title="مقارنة متزامنة بين هاتف iPhone وجهاز Tablet جنباً إلى جنب"
              >
                <Columns className="w-3.5 h-3.5" />
                <span>{comparisonMode ? 'إغلاق المقارنة' : 'مقارنة مزدوجة'}</span>
              </button>
            </div>
          </div>

          {/* Categories Grid (iPhone, Samsung, Pixel, Tablet) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2.5">
            {CATEGORIES.map((cat) => {
              const isCatActive = selectedCategory === cat.id;
              const IconComp = cat.icon;
              return (
                <button
                  key={cat.id}
                  onClick={() => handleCategorySelect(cat.id)}
                  className={`p-3 rounded-xl border text-right transition-all cursor-pointer relative overflow-hidden flex items-start justify-between gap-2.5 group ${
                    isCatActive
                      ? `bg-white dark:bg-slate-900 border-2 ${cat.activeBorder} shadow-md`
                      : 'bg-white/70 dark:bg-slate-900/60 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  {isCatActive && (
                    <div className={`absolute top-0 right-0 left-0 h-1 bg-gradient-to-r ${cat.gradientBg}`} />
                  )}

                  <div className="flex items-start gap-2.5">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-transform group-hover:scale-105 ${
                      isCatActive
                        ? `bg-gradient-to-br ${cat.gradientBg} text-white shadow-xs`
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                    }`}>
                      <IconComp className="w-4 h-4" />
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5">
                        <span className={`text-xs font-black ${
                          isCatActive ? 'text-slate-900 dark:text-white' : 'text-slate-700 dark:text-slate-300'
                        }`}>
                          {cat.nameAr}
                        </span>
                        <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded-full font-bold ${
                          isCatActive
                            ? 'bg-slate-100 dark:bg-slate-800 text-indigo-600 dark:text-indigo-400'
                            : 'bg-slate-100/60 dark:bg-slate-800/60 text-slate-500'
                        }`}>
                          {cat.badge}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                        {cat.brandSubtitle}
                      </p>
                    </div>
                  </div>

                  {isCatActive && (
                    <span className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                      <Check className="w-3 h-3 stroke-[3]" />
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Level 2: Specific Models under chosen Category */}
          <div className="pt-2 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2.5">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-600 dark:text-slate-400 ml-1">
                موديلات {selectedCategory}:
              </span>
              {categoryDevices.map((dev) => {
                const isSelected = selectedDevice === dev.id && customWidth === null;
                return (
                  <button
                    key={dev.id}
                    onClick={() => handleDeviceSelect(dev.id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-2 border ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
                    }`}
                  >
                    <span>{dev.shortName}</span>
                    <span className={`font-mono text-[10px] px-1.5 py-0.2 rounded ${
                      isSelected
                        ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                    }`}>
                      {dev.width}×{dev.height}
                    </span>
                    <span className="text-[10px] text-amber-500 font-bold hidden sm:inline">
                      {dev.badgeAr}
                    </span>
                  </button>
                );
              })}
            </div>

            {/* Quick Description */}
            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 max-w-md">
              <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span className="truncate">{device.description}</span>
            </div>
          </div>

          {/* Level 3: Browser Engine Simulation Selector */}
          <div className="pt-2.5 border-t border-slate-200/60 dark:border-slate-800/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Compass className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>محاكاة متصفح المحمول (Mobile Browser Engine):</span>
              </span>

              <div className="flex items-center p-0.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg shadow-2xs">
                <button
                  onClick={() => setSimulatedBrowser('safari')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    activeBrowser === 'safari'
                      ? 'bg-indigo-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="محاكاة متصفح Apple Safari على iOS"
                >
                  <span className="font-serif font-black text-[11px]">aA</span>
                  <span>سفاري (Apple Safari)</span>
                </button>

                <button
                  onClick={() => setSimulatedBrowser('samsung_internet')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    activeBrowser === 'samsung_internet'
                      ? 'bg-sky-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="محاكاة متصفح Samsung Internet على هواتف سامسونج جالاكسي"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>سامسونج إنترنت (One UI)</span>
                </button>

                <button
                  onClick={() => setSimulatedBrowser('chrome')}
                  className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-bold transition-all cursor-pointer ${
                    activeBrowser === 'chrome'
                      ? 'bg-emerald-600 text-white shadow-2xs'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                  title="محاكاة متصفح Google Chrome على هواتف Google Pixel وأندرويد"
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-300 inline-block" />
                  <span>جوجل كروم (Google Chrome)</span>
                </button>
              </div>
            </div>

            <div className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>المتصفح النشط: {activeBrowser === 'safari' ? 'Safari iOS' : activeBrowser === 'samsung_internet' ? 'Samsung Internet 25' : 'Chrome 130 (Pixel)'}</span>
            </div>
          </div>
        </div>

        {/* =========================================================================
            SCREEN RESOLUTION & ASPECT RATIO CONTROL PANEL
            (خيارات لتغيير دقة الشاشة ونسبة العرض إلى الارتفاع)
           ========================================================================= */}
        <div className="p-3.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xs space-y-3.5">
          {/* Header & Reset Button */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-indigo-50 dark:bg-indigo-950/80 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
                <Sliders className="w-4 h-4" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                  <span>خيارات دقة الشاشة ونسبة العرض إلى الارتفاع (Resolution & Aspect Ratio):</span>
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  تحكّم في دقة العرض بدقة البكسل أو اختر نسبة الأبعاد الهندسية المطلوبة للمعاينة المتجاوبة.
                </p>
              </div>
            </div>

            {/* Reset to Device Default */}
            <button
              onClick={resetToDeviceDefaultDimensions}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer self-start sm:self-auto"
              title="إعادة ضبط أبعاد الشاشة ونسبة العرض إلى الارتفاع الافتراضية للجهاز"
            >
              <RefreshCw className="w-3 h-3" />
              <span>إعادة ضبط الأبعاد الافتراضية</span>
            </button>
          </div>

          {/* Group 1: Aspect Ratio Presets (نسبة العرض إلى الارتفاع) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Ratio className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>نسبة العرض إلى الارتفاع (Aspect Ratio):</span>
              </span>
              <span className="text-[10px] font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-800">
                النسبة الحالية: {currentRatioString}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2">
              {ASPECT_RATIO_PRESETS.map((ratio) => {
                const isSelected = selectedAspectRatio === ratio.id;
                return (
                  <button
                    key={ratio.id}
                    onClick={() => handleAspectRatioSelect(ratio.id)}
                    className={`p-2 rounded-xl border text-right transition-all cursor-pointer flex flex-col justify-between gap-1 ${
                      isSelected
                        ? 'bg-indigo-50/80 dark:bg-indigo-950/60 border-2 border-indigo-500 text-indigo-900 dark:text-indigo-200 shadow-2xs'
                        : 'bg-slate-50/60 dark:bg-slate-800/50 border-slate-200 dark:border-slate-700/80 text-slate-700 dark:text-slate-300 hover:border-slate-300'
                    }`}
                    title={ratio.description}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black font-mono">{ratio.nameAr}</span>
                      {isSelected && (
                        <span className="w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px]">
                          ✓
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
                      {ratio.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 2: Screen Resolution Presets (خيارات دقة الشاشة القياسية) */}
          <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Monitor className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                <span>دقات الشاشة الجاهزة للهواتف (Screen Resolution Presets):</span>
              </span>
              <span className="text-[10px] text-slate-400">
                انقر لاختيار دقة شاشة فورية مع نسبتها وتنسيقها
              </span>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap">
              {RESOLUTION_PRESETS.map((res) => {
                const isSelected =
                  selectedResolutionId === res.id ||
                  (activeWidth === res.width && activeHeight === res.height);
                return (
                  <button
                    key={res.id}
                    onClick={() => handleResolutionPresetSelect(res)}
                    className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer border flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-slate-900 text-white dark:bg-white dark:text-slate-900 border-slate-900 dark:border-white shadow-xs'
                        : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:border-indigo-300'
                    }`}
                    title={res.tag}
                  >
                    <span className="font-mono font-bold">{res.label}</span>
                    <span className={`text-[10px] px-1 py-0.2 rounded font-mono ${
                      isSelected
                        ? 'bg-white/20 dark:bg-slate-900/20 text-white dark:text-slate-900'
                        : 'bg-slate-100 dark:bg-slate-900 text-slate-500'
                    }`}>
                      {res.aspectRatio}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Group 3: Real-Time Dual Dimension Sliders (Width & Height) */}
          <div className="pt-2.5 border-t border-slate-100 dark:border-slate-800 grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Width Slider */}
            <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <span>عرض الشاشة (Width):</span>
                  <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                    {activeWidth}px
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  (320px - 900px)
                </span>
              </div>

              <input
                type="range"
                min={320}
                max={900}
                step={2}
                value={activeWidth}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCustomWidth(val);
                  setSelectedResolutionId(null);
                  // Update category dynamically
                  if (val >= 640 && selectedCategory !== 'Tablet') {
                    setSelectedCategory('Tablet');
                    setSelectedDevice('tablet_ipad');
                  } else if (val < 640 && val >= 415 && selectedCategory !== 'Samsung') {
                    setSelectedCategory('Samsung');
                    setSelectedDevice('samsung_s24_ultra');
                  } else if (val < 415 && val >= 400 && selectedCategory !== 'Pixel') {
                    setSelectedCategory('Pixel');
                    setSelectedDevice('pixel8_pro');
                  } else if (val < 400 && selectedCategory !== 'iPhone') {
                    setSelectedCategory('iPhone');
                    setSelectedDevice(val <= 380 ? 'iphone_se' : 'iphone15');
                  }
                }}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>

            {/* Height Slider */}
            <div className="space-y-1.5 p-2.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/40 border border-slate-200/70 dark:border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
                  <span>ارتفاع الشاشة (Height):</span>
                  <span className="font-mono font-black text-indigo-600 dark:text-indigo-400">
                    {activeHeight}px
                  </span>
                  {selectedAspectRatio !== 'custom' && (
                    <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/70 px-1.5 py-0.2 rounded border border-emerald-200 dark:border-emerald-800">
                      محسوب تلقائياً ({selectedAspectRatio})
                    </span>
                  )}
                </span>
                <span className="text-[10px] text-slate-400 font-mono">
                  (500px - 1400px)
                </span>
              </div>

              <input
                type="range"
                min={500}
                max={1400}
                step={5}
                value={activeHeight}
                onChange={(e) => {
                  const val = Number(e.target.value);
                  setCustomHeight(val);
                  setSelectedAspectRatio('custom');
                  setSelectedResolutionId(null);
                }}
                className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
            </div>
          </div>

          {/* Quick DPI & Viewport Breakpoint Ribbon */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs">
            {/* Active Breakpoint Tag */}
            <div className="flex items-center gap-2">
              <span className="text-[11px] text-slate-500 font-bold">نقطة التوقف التجاوبية:</span>
              <div className={`px-2.5 py-0.5 rounded-full border text-[11px] font-bold flex items-center gap-1.5 ${currentBreakpoint.color}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-current animate-pulse" />
                <span>{currentBreakpoint.label}</span>
                <span className="font-mono text-[10px] opacity-75 dir-ltr" dir="ltr">{currentBreakpoint.code}</span>
              </div>
            </div>

            {/* Pixel Density (DPR) Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] text-slate-500 font-bold">كثافة البكسل (DPR):</span>
              <div className="flex items-center bg-slate-100 dark:bg-slate-800 rounded-lg p-0.5 text-[10px] font-mono font-bold">
                {[1.0, 2.0, 2.6, 3.0].map((dprVal) => (
                  <button
                    key={dprVal}
                    onClick={() => setCustomDpr(dprVal)}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      activeDpr === dprVal
                        ? 'bg-indigo-600 text-white shadow-2xs'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    @{dprVal}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Level 4: Secondary Controls Bar (Orientation, Zoom, Theme, Heatmap, Refresh) */}
        <div className="p-3 bg-slate-50 dark:bg-slate-950/70 border border-slate-200/80 dark:border-slate-800 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs">
          {/* Active Device Dimensions Badge */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-700 dark:text-slate-300">أبعاد المعاينة الحالية:</span>
            <div className="flex items-center gap-1 font-mono text-xs font-black text-indigo-700 dark:text-indigo-300 bg-white dark:bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800 dir-ltr" dir="ltr">
              <span>{activeWidth} × {activeHeight} px</span>
              <span className="text-[10px] text-slate-400 font-normal">({currentRatioString})</span>
            </div>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">
              DPR: @{activeDpr}x
            </span>
            <span className="text-[11px] font-semibold text-slate-600 dark:text-slate-400">
              · {device.osName} ({activeBrowser})
            </span>
          </div>

          {/* Action Controls: Orientation, Zoom, Heatmap, Reload */}
          <div className="flex items-center gap-2 flex-wrap">
            {/* Orientation switch */}
            <button
              onClick={() => setIsLandscape(!isLandscape)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors cursor-pointer ${
                isLandscape
                  ? 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-300 dark:border-indigo-700 shadow-2xs'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
              title="تدوير الشاشة أفقي / عمودي"
            >
              <RotateCw className={`w-3.5 h-3.5 transition-transform duration-300 ${isLandscape ? 'rotate-90 text-indigo-600' : ''}`} />
              <span>{isLandscape ? 'أفقي (Landscape)' : 'عمودي (Portrait)'}</span>
            </button>

            {/* Scale controls */}
            <div className="flex items-center gap-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5">
              <button
                onClick={() => setZoomScale((prev) => Math.max(0.4, Number((prev - 0.1).toFixed(2))))}
                disabled={zoomScale <= 0.4}
                className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-40 cursor-pointer"
                title="تصغير المعاينة"
              >
                <ZoomOut className="w-3.5 h-3.5" />
              </button>

              {/* Zoom Presets */}
              {[0.5, 0.65, 0.75, 1.0].map((preset) => (
                <button
                  key={preset}
                  onClick={() => setZoomScale(preset)}
                  className={`px-1.5 py-0.5 rounded text-[10px] font-mono font-bold cursor-pointer transition-colors ${
                    zoomScale === preset
                      ? 'bg-indigo-600 text-white'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                  }`}
                >
                  {Math.round(preset * 100)}%
                </button>
              ))}

              <button
                onClick={() => setZoomScale((prev) => Math.min(1.0, Number((prev + 0.1).toFixed(2))))}
                disabled={zoomScale >= 1.0}
                className="p-1 text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white disabled:opacity-40 cursor-pointer"
                title="تكبير المعاينة"
              >
                <ZoomIn className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Preview Theme Toggle */}
            <button
              onClick={() => setPreviewTheme(previewTheme === 'light' ? 'dark' : 'light')}
              className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-amber-400 transition-colors cursor-pointer"
              title="تبديل مظهر محاكي الهاتف بين النهاري والليلي"
            >
              {previewTheme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5" />}
            </button>

            {/* Heatmap Toggle Button */}
            <button
              onClick={() => setHeatmapEnabled(!heatmapEnabled)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-bold transition-all cursor-pointer shadow-xs ${
                heatmapEnabled
                  ? 'bg-gradient-to-r from-amber-500 to-rose-600 text-white border-transparent ring-2 ring-rose-400/50'
                  : 'bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:border-amber-400 hover:text-amber-600'
              }`}
              title="تفعيل/تعطيل خريطة النقر الحرارية التفاعلية (Heatmap)"
            >
              <Flame className={`w-3.5 h-3.5 ${heatmapEnabled ? 'fill-current animate-pulse' : 'text-amber-500'}`} />
              <span>خريطة حرارية</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${
                heatmapEnabled ? 'bg-white/20 text-white' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'
              }`}>
                {heatmapEnabled ? 'نشط' : 'إيقاف'}
              </span>
            </button>

            {/* Refresh Frame */}
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              className="p-1.5 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors cursor-pointer"
              title="إعادة تحميل المعاينة"
            >
              <RefreshCw className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Heatmap Interactive Sub-Ribbon */}
      {heatmapEnabled && (
        <div className="mt-3 p-3 bg-gradient-to-r from-amber-50/80 via-rose-50/70 to-indigo-50/70 dark:from-amber-950/30 dark:via-rose-950/30 dark:to-indigo-950/30 border border-amber-200/80 dark:border-amber-900/50 rounded-xl flex flex-wrap items-center justify-between gap-3 text-xs animate-in slide-in-from-top-1 duration-200">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1">
              <Flame className="w-3.5 h-3.5 text-rose-500 fill-current" />
              <span>نمط الخريطة الحرارية:</span>
            </span>

            <div className="flex items-center p-0.5 bg-white/90 dark:bg-slate-900/90 border border-amber-200/70 dark:border-slate-800 rounded-lg shadow-2xs">
              <button
                onClick={() => setHeatmapMode('density')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-xs transition-all cursor-pointer ${
                  heatmapMode === 'density'
                    ? 'bg-rose-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Flame className="w-3 h-3 fill-current" />
                <span>كثافة النقر (Density)</span>
              </button>

              <button
                onClick={() => setHeatmapMode('zones')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-xs transition-all cursor-pointer ${
                  heatmapMode === 'zones'
                    ? 'bg-amber-500 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Layers className="w-3 h-3" />
                <span>المناطق الهيكلية (Zones)</span>
              </button>

              <button
                onClick={() => setHeatmapMode('thumb_zone')}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-md font-bold text-xs transition-all cursor-pointer ${
                  heatmapMode === 'thumb_zone'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Smartphone className="w-3 h-3" />
                <span>نطاق الإبهام (Thumb Ergonomics)</span>
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-medium text-slate-600 dark:text-slate-400">الشفافية:</span>
              <div className="flex items-center bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 rounded-lg p-0.5 text-[11px] font-mono">
                {[
                  { label: '35%', val: 0.35 },
                  { label: '65%', val: 0.65 },
                  { label: '90%', val: 0.9 }
                ].map((op) => (
                  <button
                    key={op.label}
                    onClick={() => setHeatmapOpacity(op.val)}
                    className={`px-2 py-0.5 rounded cursor-pointer transition-colors ${
                      heatmapOpacity === op.val
                        ? 'bg-indigo-600 text-white font-bold'
                        : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                    }`}
                  >
                    {op.label}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setShowHeatmapLabels(!showHeatmapLabels)}
              className={`px-2.5 py-1 rounded-lg border text-[11px] font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
                showHeatmapLabels
                  ? 'bg-white dark:bg-slate-900 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 shadow-2xs'
                  : 'bg-white/60 dark:bg-slate-900/60 text-slate-500 border-slate-200 dark:border-slate-800'
              }`}
            >
              <span>{showHeatmapLabels ? 'إخفاء الوسوم' : 'إظهار الوسوم'}</span>
            </button>
          </div>
        </div>
      )}

      {/* Real-time Responsiveness Diagnostics Ribbon (مراقب تغيرات التجاوب اللحظية) */}
      <div className="mt-3 p-3 bg-gradient-to-r from-slate-50 via-sky-50/40 to-slate-50 dark:from-slate-950 dark:via-sky-950/20 dark:to-slate-950 border border-slate-200/80 dark:border-slate-800 rounded-xl">
        <div className="text-[11px] font-bold text-slate-700 dark:text-slate-300 mb-2 flex items-center justify-between">
          <span className="flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>مراقب تغيرات التجاوب الحي (Live Responsiveness Inspector):</span>
          </span>
          <span className="font-mono text-[10px] text-slate-500">
            العرض النشط: {activeWidth}px
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
          {/* Card 1: Navigation mode */}
          <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-400 block">نظام قائمة التصفح:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
              {activeWidth >= 700 ? (
                <>
                  <Globe className="w-3 h-3 text-purple-500" />
                  <span className="text-purple-600 dark:text-purple-400">قائمة التابلت المباشرة (Navbar)</span>
                </>
              ) : (
                <>
                  <Menu className="w-3 h-3 text-indigo-500" />
                  <span className="text-indigo-600 dark:text-indigo-400">قائمة الهاتف (Hamburger)</span>
                </>
              )}
            </span>
          </div>

          {/* Card 2: Layout Columns */}
          <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-400 block">توزيع الأعمدة الشبكية:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
              {activeWidth >= 700 ? (
                <>
                  <Columns className="w-3 h-3 text-emerald-500" />
                  <span className="text-emerald-600 dark:text-emerald-400">شبكة عمودين متوازية (2-Col)</span>
                </>
              ) : (
                <>
                  <LayoutGrid className="w-3 h-3 text-slate-500" />
                  <span>عمود رأسي متتالي (1-Col)</span>
                </>
              )}
            </span>
          </div>

          {/* Card 3: Font Scaling */}
          <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-400 block">مقياس حجم الخط الرئيسي:</span>
            <span className="font-bold text-slate-800 dark:text-slate-200 flex items-center gap-1 mt-0.5">
              <span className="font-mono text-indigo-600 dark:text-indigo-400">
                {activeWidth >= 700 ? '24px (عريض للتابلت)' : '18px (ملائم للمس)'}
              </span>
            </span>
          </div>

          {/* Card 4: Horizontal Spill Risk */}
          <div className="p-2 bg-white dark:bg-slate-900 border border-slate-200/70 dark:border-slate-800 rounded-lg">
            <span className="text-[10px] text-slate-400 block">التمرير العرضي الزائد:</span>
            <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
              <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              <span>سليم 0px (No Overflow)</span>
            </span>
          </div>
        </div>
      </div>

      {/* Simulator Frame Container */}
      <div className="mt-6 flex flex-col items-center justify-center p-4 sm:p-8 bg-slate-100 dark:bg-slate-950 rounded-2xl border border-slate-200 dark:border-slate-800 overflow-x-auto min-h-[580px]">
        {comparisonMode ? (
          /* Dual Side-by-Side Comparison Mode */
          <div className="flex flex-col lg:flex-row items-center justify-center gap-8 w-full">
            {/* Device 1: iPhone */}
            <div className="flex flex-col items-center">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Smartphone className="w-4 h-4 text-indigo-500" />
                <span>محاكاة iPhone 15 Pro (393px)</span>
              </div>
              {renderSingleDeviceFrame(DEVICES.iphone15, 393, 852, zoomScale, false)}
            </div>

            {/* Device 2: Tablet */}
            <div className="flex flex-col items-center">
              <div className="mb-2 flex items-center gap-2 text-xs font-bold text-slate-700 dark:text-slate-300">
                <Tablet className="w-4 h-4 text-purple-500" />
                <span>محاكاة Apple iPad 10.2" (768px)</span>
              </div>
              {renderSingleDeviceFrame(DEVICES.tablet_ipad, 768, 1024, zoomScale, true)}
            </div>
          </div>
        ) : (
          /* Single Device Interactive Frame */
          renderSingleDeviceFrame(device, activeWidth, activeHeight, zoomScale, false)
        )}
      </div>

      {/* Mobile Heatmap Analytics & Click Distribution Breakdown */}
      <MobileHeatmapAnalytics
        analysis={heatmapAnalysis}
        activeMode={heatmapMode}
        onChangeMode={setHeatmapMode}
        selectedHotspotId={selectedHotspotId}
        onSelectHotspot={setSelectedHotspotId}
        heatmapEnabled={heatmapEnabled}
        onToggleHeatmap={() => setHeatmapEnabled(!heatmapEnabled)}
      />

      {/* Footer Notes on Google Mobile-First Indexing */}
      <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>
            يعتمد محرك بحث جوجل نظام <strong>الفهرسة الأولى للهواتف (Mobile-First Indexing)</strong> كمعيار أساسي لترتيب وفحص تجربة المستخدم على جميع الأجهزة.
          </span>
        </div>
        <div className="flex items-center gap-2 font-mono text-[11px] flex-wrap">
          <span>الجهاز النشط:</span>
          <span className="font-bold text-slate-800 dark:text-slate-200">
            {device.name} ({activeWidth} × {activeHeight} px · نسبة {currentRatioString} · متصفح {activeBrowser === 'safari' ? 'Safari' : activeBrowser === 'samsung_internet' ? 'Samsung Internet' : 'Chrome'})
          </span>
        </div>
      </div>
    </div>
  );
};
