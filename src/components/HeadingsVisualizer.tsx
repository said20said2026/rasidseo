import React, { useRef, useEffect, useState, useMemo } from 'react';
import {
  Heading,
  AlertCircle,
  CheckCircle2,
  Flame,
  ListTree,
  Download,
  Info,
  Maximize2
} from 'lucide-react';
import { HeadingsAnalysis } from '../types/seo';
import { useLanguage } from '../context/LanguageContext';

interface HeadingsVisualizerProps {
  headings: HeadingsAnalysis;
}

interface ProcessedHeading {
  tag: string;
  level: number;
  text: string;
  positionPercent: number; // 0 to 100
  yCoord?: number;
}

const TAG_COLORS: Record<string, { bg: string; border: string; text: string; fill: string; glow: string }> = {
  h1: { bg: '#6366f1', border: '#4f46e5', text: '#ffffff', fill: 'rgba(99, 102, 241, 0.85)', glow: 'rgba(99, 102, 241, 0.35)' },
  h2: { bg: '#10b981', border: '#059669', text: '#ffffff', fill: 'rgba(16, 185, 129, 0.85)', glow: 'rgba(16, 185, 129, 0.35)' },
  h3: { bg: '#0ea5e9', border: '#0284c7', text: '#ffffff', fill: 'rgba(14, 165, 233, 0.85)', glow: 'rgba(14, 165, 233, 0.35)' },
  h4: { bg: '#f59e0b', border: '#d97706', text: '#ffffff', fill: 'rgba(245, 158, 11, 0.85)', glow: 'rgba(245, 158, 11, 0.35)' },
  h5: { bg: '#f97316', border: '#ea580c', text: '#ffffff', fill: 'rgba(249, 115, 22, 0.85)', glow: 'rgba(249, 115, 22, 0.35)' },
  h6: { bg: '#ec4899', border: '#db2777', text: '#ffffff', fill: 'rgba(236, 72, 153, 0.85)', glow: 'rgba(236, 72, 153, 0.35)' }
};

export const HeadingsVisualizer: React.FC<HeadingsVisualizerProps> = ({ headings }) => {
  const { isRtl } = useLanguage();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [activeView, setActiveView] = useState<'heatmap' | 'outline'>('heatmap');
  const [selectedTagFilter, setSelectedTagFilter] = useState<string>('all');
  const [hoveredHeading, setHoveredHeading] = useState<ProcessedHeading | null>(null);
  const [hoverPos, setHoverPos] = useState<{ x: number; y: number } | null>(null);
  const [downloadSuccess, setDownloadSuccess] = useState(false);

  const isH1Healthy = headings.h1.length === 1;

  // Process sample headings with calculated vertical distribution
  const processedHeadings: ProcessedHeading[] = useMemo(() => {
    const rawList = headings.sampleHeadings || [];
    if (rawList.length === 0) return [];

    const total = rawList.length;
    return rawList.map((item, index) => {
      const tagLower = item.tag.toLowerCase();
      const level = parseInt(tagLower.replace('h', ''), 10) || 2;
      
      // Calculate realistic vertical position along the document
      // H1 is generally in the top 5-15% of the page
      let pos = (index + 0.5) / total * 90 + 5;
      if (index === 0 && tagLower === 'h1') {
        pos = 8;
      }

      return {
        tag: tagLower,
        level,
        text: item.text,
        positionPercent: Math.min(Math.max(pos, 5), 95)
      };
    });
  }, [headings.sampleHeadings]);

  // Filtered list
  const filteredHeadings = useMemo(() => {
    if (selectedTagFilter === 'all') return processedHeadings;
    return processedHeadings.filter((h) => h.tag === selectedTagFilter);
  }, [processedHeadings, selectedTagFilter]);

  // Render HTML5 Canvas Heatmap
  useEffect(() => {
    if (activeView !== 'heatmap') return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Retina display scaling
    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    const width = rect.width || 560;
    const height = 340;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    // Clear canvas
    ctx.clearRect(0, 0, width, height);

    const isDarkMode = document.documentElement.classList.contains('dark');
    const bgColor = isDarkMode ? '#090d16' : '#f8fafc';
    const borderColor = isDarkMode ? '#1e293b' : '#e2e8f0';
    const textColor = isDarkMode ? '#94a3b8' : '#64748b';
    const gridLineColor = isDarkMode ? '#172033' : '#edf2f7';

    // 1. Draw Page Silhouette Container (Right-to-left layout friendly)
    const marginX = 65;
    const pageWidth = width - marginX - 55;
    const pageX = 55;
    const pageY = 25;
    const pageHeight = height - 50;

    // Draw page background
    ctx.fillStyle = bgColor;
    ctx.strokeStyle = borderColor;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.roundRect(pageX, pageY, pageWidth, pageHeight, 8);
    ctx.fill();
    ctx.stroke();

    // Draw document grid lines representing text paragraphs
    ctx.strokeStyle = gridLineColor;
    ctx.lineWidth = 1;
    const gridRows = 10;
    for (let r = 1; r < gridRows; r++) {
      const y = pageY + (pageHeight / gridRows) * r;
      ctx.beginPath();
      ctx.setLineDash([4, 4]);
      ctx.moveTo(pageX + 10, y);
      ctx.lineTo(pageX + pageWidth - 10, y);
      ctx.stroke();
      ctx.setLineDash([]);
      
      // Percentage indicator on the left
      ctx.fillStyle = textColor;
      ctx.font = '9px monospace';
      ctx.textAlign = 'right';
      ctx.fillText(`${r * 10}%`, pageX - 8, y + 3);
    }

    // Top indicator (0% Start) & Bottom (100% Footer)
    ctx.fillStyle = isDarkMode ? '#64748b' : '#94a3b8';
    ctx.font = 'bold 9px sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText('أعلى الصفحة 0%', pageX - 8, pageY + 8);
    ctx.fillText('أسفل الصفحة 100%', pageX - 8, pageY + pageHeight);

    // 2. Draw Heatmap Density Strip on the Right side
    const heatmapStripX = pageX + pageWidth + 12;
    const heatmapStripWidth = 14;

    // Draw strip background
    ctx.fillStyle = isDarkMode ? '#0f172a' : '#e2e8f0';
    ctx.beginPath();
    ctx.roundRect(heatmapStripX, pageY, heatmapStripWidth, pageHeight, 6);
    ctx.fill();

    // Draw heat spots on the strip for all headings
    processedHeadings.forEach((h) => {
      const y = pageY + (h.positionPercent / 100) * pageHeight;
      const color = TAG_COLORS[h.tag] || TAG_COLORS.h2;

      const grad = ctx.createRadialGradient(
        heatmapStripX + heatmapStripWidth / 2,
        y,
        1,
        heatmapStripX + heatmapStripWidth / 2,
        y,
        18
      );
      grad.addColorStop(0, color.bg);
      grad.addColorStop(0.5, color.glow);
      grad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(heatmapStripX + heatmapStripWidth / 2, y, 16, 0, Math.PI * 2);
      ctx.fill();
    });

    // 3. Draw Heading Bands & Nodes inside Page Representation
    filteredHeadings.forEach((h) => {
      const y = pageY + (h.positionPercent / 100) * pageHeight;
      const color = TAG_COLORS[h.tag] || TAG_COLORS.h2;
      const isHovered = hoveredHeading?.text === h.text;

      // Glow behind heading bar
      const glowGrad = ctx.createLinearGradient(pageX, y, pageX + pageWidth, y);
      glowGrad.addColorStop(0, color.glow);
      glowGrad.addColorStop(0.3, isHovered ? color.fill : color.glow);
      glowGrad.addColorStop(1, 'rgba(0,0,0,0)');

      ctx.fillStyle = glowGrad;
      ctx.fillRect(pageX + 4, y - (isHovered ? 12 : 8), pageWidth - 8, isHovered ? 24 : 16);

      // Main heading horizontal line indicator
      ctx.strokeStyle = isHovered ? color.border : color.bg;
      ctx.lineWidth = h.tag === 'h1' ? 3 : isHovered ? 2.5 : 1.8;
      ctx.beginPath();
      ctx.moveTo(pageX + 8, y);
      ctx.lineTo(pageX + pageWidth - 8, y);
      ctx.stroke();

      // Heading Tag Badge on Left
      const badgeWidth = 28;
      const badgeHeight = 16;
      const badgeX = pageX + 10;
      const badgeY = y - badgeHeight / 2;

      ctx.fillStyle = color.bg;
      ctx.beginPath();
      ctx.roundRect(badgeX, badgeY, badgeWidth, badgeHeight, 4);
      ctx.fill();

      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 9px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(h.tag.toUpperCase(), badgeX + badgeWidth / 2, badgeY + 11.5);

      // Heading Text snippet preview
      ctx.fillStyle = isDarkMode ? (isHovered ? '#ffffff' : '#cbd5e1') : (isHovered ? '#0f172a' : '#334155');
      ctx.font = h.tag === 'h1' ? 'bold 11px sans-serif' : '10px sans-serif';
      ctx.textAlign = 'right';
      
      const maxTextWidth = pageWidth - badgeWidth - 40;
      let displayText = h.text;
      if (displayText.length > 40) {
        displayText = displayText.slice(0, 38) + '...';
      }
      ctx.fillText(displayText, pageX + pageWidth - 16, y + 4);

      // If hovered, draw glowing ring around the node
      if (isHovered) {
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.5;
        ctx.strokeRect(badgeX - 2, badgeY - 2, badgeWidth + 4, badgeHeight + 4);
      }
    });

  }, [activeView, filteredHeadings, hoveredHeading, processedHeadings]);

  // Handle canvas mouse move for interactive inspection
  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const mouseY = e.clientY - rect.top;
    const height = 340;
    const pageY = 25;
    const pageHeight = height - 50;

    // Relative percentage of page
    const relativePercent = ((mouseY - pageY) / pageHeight) * 100;

    // Find nearest heading within threshold (+/- 6%)
    let nearest: ProcessedHeading | null = null;
    let minDiff = 8; // threshold

    filteredHeadings.forEach((h) => {
      const diff = Math.abs(h.positionPercent - relativePercent);
      if (diff < minDiff) {
        minDiff = diff;
        nearest = h;
      }
    });

    if (nearest) {
      setHoveredHeading(nearest);
      setHoverPos({ x: e.clientX - rect.left, y: e.clientY - rect.top });
    } else {
      setHoveredHeading(null);
      setHoverPos(null);
    }
  };

  const handleCanvasMouseLeave = () => {
    setHoveredHeading(null);
    setHoverPos(null);
  };

  // Download Canvas Heatmap as PNG
  const handleDownloadHeatmap = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    try {
      const imageUri = canvas.toDataURL('image/png');
      const link = document.createElement('a');
      link.download = `rasid-seo-headings-heatmap-${Date.now()}.png`;
      link.href = imageUri;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      setDownloadSuccess(true);
      setTimeout(() => setDownloadSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to export heatmap canvas:', err);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-5 shadow-xs transition-colors">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800 flex-wrap">
        <div>
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">
              {isRtl ? 'هيكل العناوين والخريطة الحرارية (Headings Canvas Heatmap)' : 'Headings Structure & Canvas Heatmap'}
            </h3>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800">
              HTML5 Canvas
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            {isRtl ? 'عرض بصري تفاعلي لتوزيع وسوم H1 - H6 وتوازن فقرات المحتوى من رأس الصفحة حتى نهايتها' : 'Interactive visual distribution of H1 - H6 tags throughout document body'}
          </p>
        </div>

        {/* View switcher tabs */}
        <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
          <button
            onClick={() => setActiveView('heatmap')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeView === 'heatmap'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <Flame className="w-3.5 h-3.5" />
            <span>{isRtl ? 'الخريطة الحرارية' : 'Heatmap'}</span>
          </button>
          <button
            onClick={() => setActiveView('outline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all cursor-pointer ${
              activeView === 'outline'
                ? 'bg-white dark:bg-slate-900 text-indigo-600 dark:text-indigo-400 shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <ListTree className="w-3.5 h-3.5" />
            <span>{isRtl ? 'المخطط الشجري' : 'Outline Tree'}</span>
          </button>
        </div>
      </div>

      {/* Stats row with tooltips */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 mb-4">
        <div
          data-tooltip-id="seo-tooltip"
          data-tooltip-content={isRtl ? "العنوان الرئيسي H1: يجب أن يوجد وسم واحد فقط لكل صفحة لتعريف محركات البحث بموضوع المقال الأساسي." : "Main H1 heading: exactly one should exist per page for optimal search indexing."}
          className={`p-2.5 rounded-lg border text-center cursor-help transition-all ${
            isH1Healthy
              ? 'bg-emerald-50/50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800/60'
              : 'bg-rose-50/50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800/60'
          }`}
        >
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-indigo-500 inline-block" />
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{isRtl ? 'وسم H1' : 'H1 Tag'}</span>
          </div>
          <span className="font-mono text-lg font-bold text-slate-900 dark:text-white tabular-nums">
            {headings.h1.length}
          </span>
          <span className="text-[10px] block mt-0.5 text-slate-500 dark:text-slate-400">
            {isH1Healthy ? (isRtl ? 'سليم (1)' : 'Valid (1)') : headings.h1.length === 0 ? (isRtl ? 'مفقود (0)' : 'Missing (0)') : (isRtl ? 'متكرر' : 'Duplicate')}
          </span>
        </div>

        <div
          data-tooltip-id="seo-tooltip"
          data-tooltip-content={isRtl ? "عناوين H2: تُستخدم لتقسيم المقال لأقسام ومحاور رئيسية يسهل على عناكب البحث والقراء تتبعها." : "H2 headings: split content into major logical topics."}
          className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 text-center cursor-help"
        >
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" />
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{isRtl ? 'عناوين H2' : 'H2 Headings'}</span>
          </div>
          <span className="font-mono text-lg font-bold text-slate-900 dark:text-white tabular-nums">
            {headings.h2Count}
          </span>
          <span className="text-[10px] block mt-0.5 text-slate-500 dark:text-slate-400">{isRtl ? 'محاور رئيسية' : 'Main Topics'}</span>
        </div>

        <div
          data-tooltip-id="seo-tooltip"
          data-tooltip-content={isRtl ? "عناوين H3: نقاط وتفريعات تفصيلية تحت كل عنوان H2 لتنسيق شروحات المحتوى بعمق." : "H3 headings: sub-sections nested under H2 headings."}
          className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 text-center cursor-help"
        >
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-sky-500 inline-block" />
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{isRtl ? 'عناوين H3' : 'H3 Headings'}</span>
          </div>
          <span className="font-mono text-lg font-bold text-slate-900 dark:text-white tabular-nums">
            {headings.h3Count}
          </span>
          <span className="text-[10px] block mt-0.5 text-slate-500 dark:text-slate-400">{isRtl ? 'تفريعات المحتوى' : 'Sub-sections'}</span>
        </div>

        <div
          data-tooltip-id="seo-tooltip"
          data-tooltip-content={isRtl ? "عناوين H4-H6: مستويات فرعية إضافية تُستخدم في القوائم والمواصفات الفنية." : "H4-H6 headings: deeper sub-points and technical specifications."}
          className="p-2.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/60 text-center cursor-help"
        >
          <div className="flex items-center justify-center gap-1 mb-0.5">
            <span className="w-2 h-2 rounded-full bg-amber-500 inline-block" />
            <span className="text-[11px] font-medium text-slate-500 dark:text-slate-400">{isRtl ? 'عناوين H4+' : 'H4+ Headings'}</span>
          </div>
          <span className="font-mono text-lg font-bold text-slate-900 dark:text-white tabular-nums">
            {(headings.h4Count || 0) + (headings.h5Count || 0) + (headings.h6Count || 0)}
          </span>
          <span className="text-[10px] block mt-0.5 text-slate-500 dark:text-slate-400">{isRtl ? 'نقاط تفصيلية' : 'Details'}</span>
        </div>
      </div>

      {/* View 1: Canvas Heatmap */}
      {activeView === 'heatmap' && (
        <div className="space-y-3">
          {/* Controls Bar */}
          <div className="flex items-center justify-between gap-3 text-xs flex-wrap">
            {/* Tag Filter Pills */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-slate-400 dark:text-slate-500 text-[11px] ml-1">{isRtl ? 'تصفية الوسوم:' : 'Filter tags:'}</span>
              {[
                { id: 'all', label: isRtl ? 'الكل' : 'All' },
                { id: 'h1', label: 'H1' },
                { id: 'h2', label: 'H2' },
                { id: 'h3', label: 'H3' }
              ].map((btn) => (
                <button
                  key={btn.id}
                  onClick={() => setSelectedTagFilter(btn.id)}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-colors cursor-pointer ${
                    selectedTagFilter === btn.id
                      ? 'bg-indigo-600 text-white shadow-xs'
                      : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                  }`}
                >
                  {btn.label}
                </button>
              ))}
            </div>

            {/* Heatmap Actions */}
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownloadHeatmap}
                className="flex items-center gap-1 text-[11px] font-medium text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 bg-slate-50 dark:bg-slate-800/80 px-2.5 py-1 rounded border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
                title="تصدير صورة الخريطة الحرارية PNG"
              >
                <Download className="w-3 h-3" />
                <span>{downloadSuccess ? 'تم الحفظ!' : 'حفظ كصورة'}</span>
              </button>
            </div>
          </div>

          {/* Interactive Canvas Container */}
          <div className="relative border border-slate-200 dark:border-slate-800 rounded-xl overflow-hidden bg-slate-50/50 dark:bg-slate-950/50 p-2">
            <canvas
              ref={canvasRef}
              onMouseMove={handleCanvasMouseMove}
              onMouseLeave={handleCanvasMouseLeave}
              className="w-full h-[340px] block cursor-crosshair"
            />

            {/* Canvas Hover Inspection Popover */}
            {hoveredHeading && hoverPos && (
              <div
                className="absolute z-20 pointer-events-none bg-slate-900/95 dark:bg-black/95 text-white p-2.5 rounded-lg shadow-xl border border-slate-700 text-xs max-w-xs transition-all backdrop-blur-xs"
                style={{
                  top: Math.min(Math.max(hoverPos.y - 45, 10), 260),
                  right: Math.min(Math.max(hoverPos.x - 120, 10), 320)
                }}
              >
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className="px-1.5 py-0.5 rounded text-[10px] font-bold font-mono text-white"
                    style={{ backgroundColor: TAG_COLORS[hoveredHeading.tag]?.bg || '#6366f1' }}
                  >
                    {hoveredHeading.tag.toUpperCase()}
                  </span>
                  <span className="text-[11px] font-medium text-slate-300">
                    موقع: {Math.round(hoveredHeading.positionPercent)}% من طول الصفحة
                  </span>
                </div>
                <p className="font-semibold text-slate-100 line-clamp-2 leading-relaxed">
                  {hoveredHeading.text}
                </p>
              </div>
            )}
          </div>

          {/* Heatmap Legend & Explanation */}
          <div className="flex items-center justify-between gap-3 pt-2 text-[11px] text-slate-500 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 flex-wrap">
            <div className="flex items-center gap-3">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500 inline-block" />
                <span>H1 (رئيسي)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500 inline-block" />
                <span>H2 (محاور)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-sky-500 inline-block" />
                <span>H3 (تفريعات)</span>
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-500 inline-block" />
                <span>H4+ (فرعي)</span>
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-slate-400">
              <Info className="w-3 h-3" />
              <span>حرك الفأرة على الخريطة لفحص تفاصيل أي وسم بالترتيب</span>
            </div>
          </div>
        </div>
      )}

      {/* View 2: Outline View */}
      {activeView === 'outline' && (
        <div className="mt-1">
          <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
            مخطط العناوين المكتشفة في الصفحة بالترتيب التسلسلي:
          </h4>
          {headings.sampleHeadings.length === 0 ? (
            <div className="p-4 bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800/60 rounded-lg text-xs text-amber-800 dark:text-amber-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>لم يتم العثور على أي عناوين H1 أو H2 أو H3 في محتوى هذه الصفحة!</span>
            </div>
          ) : (
            <div className="space-y-1.5 max-h-72 overflow-y-auto pr-1">
              {headings.sampleHeadings.map((head, idx) => {
                const tag = head.tag.toLowerCase();
                const isH1 = tag === 'h1';
                const isH2 = tag === 'h2';
                const isH3 = tag === 'h3';
                const color = TAG_COLORS[tag] || TAG_COLORS.h2;

                return (
                  <div
                    key={idx}
                    className={`flex items-start gap-2.5 p-2 rounded-lg text-xs transition-colors ${
                      isH1
                        ? 'bg-indigo-50/70 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800/60 font-bold text-slate-900 dark:text-white'
                        : isH2
                        ? 'bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-700 font-medium text-slate-800 dark:text-slate-200 mr-3'
                        : 'bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-400 mr-6'
                    }`}
                  >
                    <span
                      className="px-1.5 py-0.5 rounded text-[10px] font-mono shrink-0 text-white font-bold"
                      style={{ backgroundColor: color.bg }}
                    >
                      {tag.toUpperCase()}
                    </span>
                    <span className="line-clamp-2 leading-relaxed">{head.text}</span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
