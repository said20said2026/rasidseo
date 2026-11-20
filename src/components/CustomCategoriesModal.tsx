import React, { useState, useMemo } from 'react';
import {
  X,
  Plus,
  Trash2,
  Edit2,
  Users,
  Code,
  Server,
  PenTool,
  Flag,
  Flame,
  Target,
  Sparkles,
  Check,
  CheckSquare,
  Square,
  RotateCcw,
  Tag,
  Layers,
  Bot,
  RefreshCw,
  AlertCircle,
  HelpCircle,
  CheckCircle2,
  ArrowRight
} from 'lucide-react';
import {
  CustomCategory,
  CustomCategoryType,
  getCategoryColorClasses,
  getDefaultPresetCategories
} from '../utils/customCategoriesStorage';
import {
  AutoCategorizeSuggestion,
  getUnassignedItems,
  requestAiAutoCategorize
} from '../utils/aiAutoCategorize';
import { AuditItem } from '../types/seo';

interface CustomCategoriesModalProps {
  isOpen: boolean;
  onClose: () => void;
  categories: CustomCategory[];
  onSaveCategories: (categories: CustomCategory[]) => void;
  auditItems: AuditItem[];
  onSelectCategoryFilter?: (categoryId: string) => void;
  siteUrl?: string;
}

const AVAILABLE_COLORS: CustomCategory['color'][] = [
  'indigo',
  'emerald',
  'amber',
  'rose',
  'purple',
  'cyan',
  'blue'
];

const AVAILABLE_ICONS: { name: CustomCategory['iconName']; labelAr: string; icon: any }[] = [
  { name: 'Users', labelAr: 'فريق', icon: Users },
  { name: 'Code', labelAr: 'تطوير', icon: Code },
  { name: 'Server', labelAr: 'خادم', icon: Server },
  { name: 'PenTool', labelAr: 'محتوى', icon: PenTool },
  { name: 'Flame', labelAr: 'عاجل', icon: Flame },
  { name: 'Flag', labelAr: 'أولوية', icon: Flag },
  { name: 'Target', labelAr: 'هدف', icon: Target },
  { name: 'Sparkles', labelAr: 'مميز', icon: Sparkles }
];

export const CustomCategoriesModal: React.FC<CustomCategoriesModalProps> = ({
  isOpen,
  onClose,
  categories,
  onSaveCategories,
  auditItems,
  onSelectCategoryFilter,
  siteUrl
}) => {
  const [activeTab, setActiveTab] = useState<'list' | 'create' | 'auto'>('list');
  const [editingCategoryId, setEditingCategoryId] = useState<string | null>(null);

  // New Category form state
  const [name, setName] = useState('');
  const [type, setType] = useState<CustomCategoryType>('team');
  const [color, setColor] = useState<CustomCategory['color']>('indigo');
  const [iconName, setIconName] = useState<CustomCategory['iconName']>('Users');
  const [description, setDescription] = useState('');
  const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);

  // Task assignment sub-view
  const [managingCategory, setManagingCategory] = useState<CustomCategory | null>(null);

  // AI Auto-Categorize State
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiSuggestions, setAiSuggestions] = useState<AutoCategorizeSuggestion[]>([]);
  const [selectedSuggestionIds, setSelectedSuggestionIds] = useState<string[]>([]);
  const [suggestionItemToggles, setSuggestionItemToggles] = useState<Record<string, string[]>>({});
  const [aiSuccessMessage, setAiSuccessMessage] = useState<string | null>(null);
  const [aiEngineSource, setAiEngineSource] = useState<string>('gemini-3.8-flash');

  // Compute unassigned items
  const unassignedItems = useMemo(() => {
    return getUnassignedItems(auditItems, categories);
  }, [auditItems, categories]);

  if (!isOpen) return null;

  const handleStartCreate = () => {
    setName('');
    setType('team');
    setColor('indigo');
    setIconName('Users');
    setDescription('');
    setSelectedItemIds([]);
    setEditingCategoryId(null);
    setActiveTab('create');
    setManagingCategory(null);
  };

  const handleStartEdit = (cat: CustomCategory) => {
    setEditingCategoryId(cat.id);
    setName(cat.name);
    setType(cat.type);
    setColor(cat.color);
    setIconName(cat.iconName);
    setDescription(cat.description || '');
    setSelectedItemIds([...cat.itemIds]);
    setActiveTab('create');
    setManagingCategory(null);
  };

  const handleSaveCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    if (editingCategoryId) {
      // Update existing
      const updated = categories.map((c) => {
        if (c.id === editingCategoryId) {
          return {
            ...c,
            name: name.trim(),
            type,
            color,
            iconName,
            description: description.trim() || undefined,
            itemIds: selectedItemIds
          };
        }
        return c;
      });
      onSaveCategories(updated);
    } else {
      // Create new
      const newCat: CustomCategory = {
        id: `cat-custom-${Date.now()}`,
        name: name.trim(),
        type,
        color,
        iconName,
        description: description.trim() || undefined,
        itemIds: selectedItemIds,
        createdAt: Date.now()
      };
      onSaveCategories([...categories, newCat]);
    }

    setActiveTab('list');
    setEditingCategoryId(null);
  };

  const handleDeleteCategory = (catId: string) => {
    if (confirm('هل أنت متأكد من حذف هذا التصنيف المخصص؟ لن يتم حذف أي من معايير الفحص.')) {
      onSaveCategories(categories.filter((c) => c.id !== catId));
      if (managingCategory?.id === catId) {
        setManagingCategory(null);
      }
    }
  };

  const handleRestoreDefaults = () => {
    if (confirm('هل تريد استعادة التصنيفات الافتراضية المقترحة لفرق العمل والأولويات؟')) {
      const defaults = getDefaultPresetCategories(auditItems);
      onSaveCategories(defaults);
      setActiveTab('list');
    }
  };

  const handleToggleItemInManaging = (itemId: string) => {
    if (!managingCategory) return;
    const exists = managingCategory.itemIds.includes(itemId);
    const newItemIds = exists
      ? managingCategory.itemIds.filter((id) => id !== itemId)
      : [...managingCategory.itemIds, itemId];

    const updatedCategory = { ...managingCategory, itemIds: newItemIds };
    setManagingCategory(updatedCategory);

    const nextCategories = categories.map((c) => (c.id === managingCategory.id ? updatedCategory : c));
    onSaveCategories(nextCategories);
  };

  // Run AI Auto-Categorization
  const handleTriggerAutoCategorize = async (reanalyze: boolean = false) => {
    if (aiSuggestions.length > 0 && !reanalyze) {
      setActiveTab('auto');
      return;
    }

    setIsAiAnalyzing(true);
    setActiveTab('auto');
    setManagingCategory(null);
    setAiSuccessMessage(null);

    try {
      const result = await requestAiAutoCategorize(auditItems, categories, siteUrl);
      if (result.success && result.suggestions.length > 0) {
        setAiSuggestions(result.suggestions);
        setAiEngineSource(result.source);
        // Pre-select all suggestions
        setSelectedSuggestionIds(result.suggestions.map((s) => s.id));
        // Initialize item toggles
        const initialToggles: Record<string, string[]> = {};
        result.suggestions.forEach((s) => {
          initialToggles[s.id] = [...s.itemIds];
        });
        setSuggestionItemToggles(initialToggles);
      }
    } catch (err) {
      console.error('Error during AI auto categorization:', err);
    } finally {
      setIsAiAnalyzing(false);
    }
  };

  // Toggle selection of whole suggestion card
  const handleToggleSuggestion = (sugId: string) => {
    if (selectedSuggestionIds.includes(sugId)) {
      setSelectedSuggestionIds(selectedSuggestionIds.filter((id) => id !== sugId));
    } else {
      setSelectedSuggestionIds([...selectedSuggestionIds, sugId]);
    }
  };

  // Toggle individual item within a suggestion
  const handleToggleItemInSuggestion = (sugId: string, itemId: string) => {
    setSuggestionItemToggles((prev) => {
      const current = prev[sugId] || [];
      const updated = current.includes(itemId)
        ? current.filter((id) => id !== itemId)
        : [...current, itemId];
      return { ...prev, [sugId]: updated };
    });
  };

  // Apply chosen AI suggestions into custom categories
  const handleApplyAiSuggestions = () => {
    const selectedSuggestions = aiSuggestions.filter((s) => selectedSuggestionIds.includes(s.id));
    if (selectedSuggestions.length === 0) return;

    let updatedCategories = [...categories];

    selectedSuggestions.forEach((sug, idx) => {
      const finalItemIds = suggestionItemToggles[sug.id] || sug.itemIds;
      if (finalItemIds.length === 0) return;

      // Check if a category with same name already exists
      const existingIdx = updatedCategories.findIndex(
        (c) => c.name.trim().toLowerCase() === sug.name.trim().toLowerCase()
      );

      if (existingIdx >= 0) {
        // Merge items into existing category
        const existingCat = updatedCategories[existingIdx];
        const mergedSet = new Set([...existingCat.itemIds, ...finalItemIds]);
        updatedCategories[existingIdx] = {
          ...existingCat,
          itemIds: Array.from(mergedSet)
        };
      } else {
        // Create new category
        const newCat: CustomCategory = {
          id: `cat-ai-${Date.now()}-${idx}`,
          name: sug.name,
          type: sug.type,
          color: sug.color,
          iconName: sug.iconName,
          description: sug.description,
          itemIds: finalItemIds,
          createdAt: Date.now()
        };
        updatedCategories.push(newCat);
      }
    });

    onSaveCategories(updatedCategories);
    setAiSuccessMessage(`تم بنجاح تطبيق التصنيف الذكي وإسناد المهام إلى التصنيفات المخصصة!`);
    setTimeout(() => {
      setActiveTab('list');
      setAiSuccessMessage(null);
    }, 1800);
  };

  const renderIcon = (name: CustomCategory['iconName'], className: string = 'w-4 h-4') => {
    const item = AVAILABLE_ICONS.find((i) => i.name === name);
    const IconComp = item ? item.icon : Users;
    return <IconComp className={className} />;
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 text-right font-sans animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl w-full max-w-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Modal Header */}
        <div className="p-4 sm:p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3 bg-slate-50 dark:bg-slate-950/60 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-indigo-500 text-white flex items-center justify-center shadow-xs shadow-indigo-200 dark:shadow-indigo-950 shrink-0">
              <Tag className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">
                  إدارة وتصنيف مهام السيو المخصصة (Custom Categories)
                </h3>
                <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300">
                  {categories.length} تصنيفات
                </span>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                توزيع مهام الفحص حسب فرق العمل (Frontend / Backend / Content) أو حسب أولوية المشروع (Sprint)
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs Bar */}
        <div className="px-5 pt-3 pb-0 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between gap-2 bg-white dark:bg-slate-900 shrink-0 flex-wrap">
          <div className="flex items-center gap-1.5 text-xs font-bold overflow-x-auto">
            <button
              onClick={() => {
                setActiveTab('list');
                setManagingCategory(null);
              }}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'list' && !managingCategory
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>التصنيفات الحالية ({categories.length})</span>
            </button>

            {/* Auto-Categorize AI Tab */}
            <button
              onClick={() => handleTriggerAutoCategorize(false)}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'auto'
                  ? 'border-purple-600 text-purple-600 dark:text-purple-400 font-black'
                  : 'border-transparent text-purple-600 dark:text-purple-400 hover:text-purple-700 font-bold'
              }`}
            >
              <Sparkles className="w-4 h-4 text-purple-500 animate-pulse" />
              <span>التصنيف الذكي بالذكاء الاصطناعي (Auto-Categorize)</span>
              {unassignedItems.length > 0 && (
                <span className="px-1.5 py-0.2 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-700 dark:text-amber-300 text-[10px] font-mono">
                  {unassignedItems.length} معيار غير مصنف
                </span>
              )}
            </button>

            <button
              onClick={handleStartCreate}
              className={`pb-2.5 px-3 border-b-2 transition-all cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'create'
                  ? 'border-indigo-600 text-indigo-600 dark:text-indigo-400'
                  : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
            >
              <Plus className="w-4 h-4" />
              <span>{editingCategoryId ? 'تعديل التصنيف' : 'تصنيف يدوي جديد'}</span>
            </button>

            {managingCategory && (
              <span className="pb-2.5 px-3 border-b-2 border-emerald-600 text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5 whitespace-nowrap">
                <CheckSquare className="w-4 h-4" />
                <span>إسناد المهام: {managingCategory.name}</span>
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={handleRestoreDefaults}
            className="text-[11px] font-semibold text-slate-500 hover:text-indigo-600 dark:hover:text-indigo-400 flex items-center gap-1 pb-2 cursor-pointer shrink-0"
            title="استعادة التصنيفات الافتراضية الجاهزة"
          >
            <RotateCcw className="w-3 h-3" />
            <span className="hidden sm:inline">القوالب الجاهزة</span>
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {/* Success Banner */}
          {aiSuccessMessage && (
            <div className="p-3.5 bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-200 dark:border-emerald-800 rounded-xl flex items-center gap-2.5 text-xs text-emerald-800 dark:text-emerald-200 font-bold animate-in fade-in">
              <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
              <span>{aiSuccessMessage}</span>
            </div>
          )}

          {managingCategory ? (
            /* Sub-View: Assign tasks to managingCategory */
            <div className="space-y-4 animate-in fade-in duration-150">
              <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white ${getCategoryColorClasses(managingCategory.color).badge}`}>
                    {renderIcon(managingCategory.iconName, 'w-4 h-4')}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      إسناد مهام الفحص إلى: {managingCategory.name}
                    </h4>
                    <span className="text-[11px] text-slate-500">
                      تم تحديد {managingCategory.itemIds.length} من أصل {auditItems.length} مهمة
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => setManagingCategory(null)}
                  className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg hover:bg-slate-100 cursor-pointer"
                >
                  حفظ والعودة
                </button>
              </div>

              {/* Task Checklist Items */}
              <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
                {auditItems.map((item) => {
                  const isChecked = managingCategory.itemIds.includes(item.id);
                  return (
                    <div
                      key={item.id}
                      onClick={() => handleToggleItemInManaging(item.id)}
                      className={`p-3 rounded-xl border text-xs flex items-center justify-between gap-3 cursor-pointer transition-all ${
                        isChecked
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-300 dark:border-indigo-800 font-bold'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                          isChecked
                            ? 'bg-indigo-600 border-indigo-600 text-white'
                            : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                        }`}>
                          {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                        </div>
                        <div className="min-w-0">
                          <span className="truncate block text-slate-900 dark:text-slate-100">
                            {item.titleAr || item.title}
                          </span>
                          <span className="text-[10px] text-slate-400 block font-normal">
                            القسم: {item.category} · الأثر: {item.impactAr}
                          </span>
                        </div>
                      </div>

                      <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold shrink-0 ${
                        item.status === 'error'
                          ? 'bg-rose-100 text-rose-700 dark:bg-rose-950 text-[10px]'
                          : item.status === 'warning'
                          ? 'bg-amber-100 text-amber-800 dark:bg-amber-950'
                          : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950'
                      }`}>
                        {item.status === 'error' ? 'خطأ حرج' : item.status === 'warning' ? 'تحسين' : 'ناجح'}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : activeTab === 'auto' ? (
            /* View 3: AI Auto-Categorize (Smart Categorization with Gemini) */
            <div className="space-y-4 animate-in fade-in duration-200">
              {/* AI Auto-Categorize Header Banner */}
              <div className="p-4 rounded-2xl bg-gradient-to-r from-purple-500/10 via-indigo-500/10 to-transparent border border-purple-200 dark:border-purple-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center shadow-xs shadow-purple-300 dark:shadow-purple-950 shrink-0">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                        التصنيف الذكي لمعايير السيو (AI Auto-Categorize)
                      </h4>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded-full bg-purple-100 dark:bg-purple-950 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800">
                        {aiEngineSource === 'gemini-3.8-flash' ? 'Gemini 3.8 Flash' : 'محرك القواعد الذكي'}
                      </span>
                    </div>
                    <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5">
                      يحلل الذكاء الاصطناعي المعايير غير المصنفة وطبيعة الأخطاء لتوزيعها على تصنيفات ذكية (أخطاء تقنية، محتوى، أداء، وأولويات).
                    </p>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleTriggerAutoCategorize(true)}
                  disabled={isAiAnalyzing}
                  className="px-3.5 py-2 text-xs font-bold rounded-xl bg-purple-600 hover:bg-purple-700 text-white disabled:opacity-60 flex items-center gap-2 transition-all shadow-xs cursor-pointer shrink-0"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAiAnalyzing ? 'animate-spin' : ''}`} />
                  <span>{isAiAnalyzing ? 'جاري التحليل...' : 'إعادة التحليل بالذكاء الاصطناعي'}</span>
                </button>
              </div>

              {/* Status info strip */}
              <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-700 dark:text-slate-300">
                    المعايير المكتشفة للتصنيف:
                  </span>
                  <span className="font-mono font-bold text-indigo-600 dark:text-indigo-400">
                    {unassignedItems.length > 0 ? `${unassignedItems.length} معيار غير مصنف` : `كافة معايير الموقع (${auditItems.length})`}
                  </span>
                </div>
                <span className="text-[11px]">
                  التصنيفات المقترحة: {aiSuggestions.length}
                </span>
              </div>

              {/* Loading State */}
              {isAiAnalyzing ? (
                <div className="p-12 text-center border border-slate-200 dark:border-slate-800 rounded-2xl bg-slate-50/50 dark:bg-slate-950/50 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-950/80 text-purple-600 dark:text-purple-400 flex items-center justify-center mx-auto animate-bounce">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h5 className="text-sm font-bold text-slate-800 dark:text-slate-200">
                      جاري تحليل الأخطاء وتوزيعها بواسطة الذكاء الاصطناعي...
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto leading-relaxed">
                      يتم فحص أكواد الصفحة، ومشاكل الـ Schema، وترويسات الأمان، وزمن استجابة الخادم لربط كل معيار بالفريق الهندسي أو الأولوية المناسبة.
                    </p>
                  </div>
                </div>
              ) : aiSuggestions.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <Sparkles className="w-8 h-8 text-purple-400 mx-auto" />
                  <p className="text-xs text-slate-500">
                    اضغط على زر التحليل الذكي للبدء في استخراج واقتراح التصنيفات المناسبة.
                  </p>
                  <button
                    type="button"
                    onClick={() => handleTriggerAutoCategorize(true)}
                    className="px-4 py-2 bg-purple-600 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    بدء التصنيف الذكي الآن
                  </button>
                </div>
              ) : (
                /* Suggestions Cards List */
                <div className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
                  {aiSuggestions.map((sug) => {
                    const isSelected = selectedSuggestionIds.includes(sug.id);
                    const colorStyle = getCategoryColorClasses(sug.color);
                    const activeItemIds = suggestionItemToggles[sug.id] || sug.itemIds;

                    return (
                      <div
                        key={sug.id}
                        className={`p-4 rounded-xl border transition-all ${
                          isSelected
                            ? 'bg-white dark:bg-slate-900 border-purple-300 dark:border-purple-800 shadow-sm'
                            : 'bg-slate-50/70 dark:bg-slate-950/40 border-slate-200 dark:border-slate-800 opacity-60'
                        }`}
                      >
                        {/* Suggestion Card Header */}
                        <div className="flex items-start justify-between gap-3 mb-2.5">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <button
                              type="button"
                              onClick={() => handleToggleSuggestion(sug.id)}
                              className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all cursor-pointer shrink-0 ${
                                isSelected
                                  ? 'bg-purple-600 border-purple-600 text-white'
                                  : 'border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-800'
                              }`}
                            >
                              {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </button>

                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center border ${colorStyle.badge} shrink-0`}>
                              {renderIcon(sug.iconName, 'w-4 h-4')}
                            </div>

                            <div className="min-w-0">
                              <div className="flex items-center gap-2 flex-wrap">
                                <h5 className="text-xs font-black text-slate-900 dark:text-white">
                                  {sug.name}
                                </h5>
                                <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${colorStyle.badge}`}>
                                  {sug.type === 'team' ? 'فريق عمل' : sug.type === 'priority' ? 'أولوية مشروع' : 'مخصص'}
                                </span>
                                <span className="text-[11px] font-mono text-slate-500 font-bold">
                                  ({activeItemIds.length} مهام)
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                                {sug.description}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* AI Reasoning Box */}
                        {sug.reasoningAr && (
                          <div className="p-2.5 my-2.5 rounded-lg bg-purple-50/60 dark:bg-purple-950/40 border border-purple-200/60 dark:border-purple-800/40 text-xs text-purple-900 dark:text-purple-200 flex items-start gap-2 leading-relaxed">
                            <Sparkles className="w-3.5 h-3.5 text-purple-500 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold block text-[11px] text-purple-700 dark:text-purple-300">
                                تعليل الذكاء الاصطناعي لهذا التصنيف:
                              </span>
                              <span className="text-[11px]">{sug.reasoningAr}</span>
                            </div>
                          </div>
                        )}

                        {/* Items under this suggestion */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100 dark:border-slate-800/80">
                          <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 block mb-1">
                            المهام والمعايير المندرجة تحت هذا التصنيف:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                            {sug.itemIds.map((itemId) => {
                              const item = auditItems.find((i) => i.id === itemId);
                              const isItemChecked = activeItemIds.includes(itemId);
                              if (!item) return null;

                              return (
                                <div
                                  key={itemId}
                                  onClick={() => isSelected && handleToggleItemInSuggestion(sug.id, itemId)}
                                  className={`p-2 rounded-lg border text-[11px] flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                                    isItemChecked && isSelected
                                      ? 'bg-slate-50 dark:bg-slate-800/80 border-slate-200 dark:border-slate-700'
                                      : 'opacity-50 line-through bg-slate-100/50 dark:bg-slate-900 border-transparent'
                                  }`}
                                >
                                  <div className="flex items-center gap-1.5 min-w-0">
                                    <div className={`w-3.5 h-3.5 rounded flex items-center justify-center border shrink-0 ${
                                      isItemChecked && isSelected
                                        ? 'bg-purple-600 border-purple-600 text-white'
                                        : 'border-slate-400'
                                    }`}>
                                      {isItemChecked && isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                                    </div>
                                    <span className="truncate text-slate-800 dark:text-slate-200 font-medium">
                                      {item.titleAr || item.title}
                                    </span>
                                  </div>

                                  <span className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-bold shrink-0 ${
                                    item.status === 'error'
                                      ? 'bg-rose-100 text-rose-700 dark:bg-rose-950'
                                      : item.status === 'warning'
                                      ? 'bg-amber-100 text-amber-800 dark:bg-amber-950'
                                      : 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950'
                                  }`}>
                                    {item.status === 'error' ? 'حرج' : item.status === 'warning' ? 'تحسين' : 'ناجح'}
                                  </span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Action buttons for AI Suggestions */}
              {aiSuggestions.length > 0 && !isAiAnalyzing && (
                <div className="pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between gap-3">
                  <button
                    type="button"
                    onClick={() => setActiveTab('list')}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                  >
                    إلغاء والعودة
                  </button>

                  <button
                    type="button"
                    onClick={handleApplyAiSuggestions}
                    disabled={selectedSuggestionIds.length === 0}
                    className="px-5 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700 text-white shadow-md disabled:opacity-50 cursor-pointer flex items-center gap-2"
                  >
                    <Check className="w-4 h-4" />
                    <span>تطبيق واعتماد التصنيفات المقترحة ({selectedSuggestionIds.length})</span>
                  </button>
                </div>
              )}
            </div>
          ) : activeTab === 'list' ? (
            /* View 1: Categories List */
            <div className="space-y-3">
              {/* Unassigned Items Banner with Quick Auto-Categorize Action */}
              {unassignedItems.length > 0 && (
                <div className="p-3.5 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/40 dark:to-indigo-950/40 border border-purple-200 dark:border-purple-800/60 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-purple-600 dark:text-purple-400 shrink-0" />
                    <p className="text-xs text-slate-700 dark:text-slate-300">
                      لديك <strong className="font-mono text-purple-700 dark:text-purple-300 font-bold">{unassignedItems.length}</strong> معايير فحص غير مسندة لأي تصنيف حتى الآن.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleTriggerAutoCategorize(true)}
                    className="px-3 py-1.5 rounded-lg bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold flex items-center gap-1.5 transition-colors shadow-2xs cursor-pointer shrink-0 self-end sm:self-auto"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>التصنيف الذكي (Auto-Categorize)</span>
                  </button>
                </div>
              )}

              {categories.length === 0 ? (
                <div className="p-8 text-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-2xl space-y-3">
                  <Tag className="w-8 h-8 text-slate-400 mx-auto" />
                  <p className="text-xs text-slate-500">لا توجد تصنيفات مخصصة حتى الآن.</p>
                  <div className="flex items-center justify-center gap-2 flex-wrap">
                    <button
                      onClick={() => handleTriggerAutoCategorize(true)}
                      className="px-4 py-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl text-xs font-bold cursor-pointer flex items-center gap-1.5"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>التصنيف التلقائي بالذكاء الاصطناعي</span>
                    </button>
                    <button
                      onClick={handleStartCreate}
                      className="px-4 py-2 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 rounded-xl text-xs font-bold cursor-pointer"
                    >
                      إنشاء تصنيف يدوي
                    </button>
                  </div>
                </div>
              ) : (
                categories.map((cat) => {
                  const colorStyle = getCategoryColorClasses(cat.color);
                  const assignedCount = cat.itemIds.length;

                  return (
                    <div
                      key={cat.id}
                      className="p-3.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900/80 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-start gap-3 min-w-0">
                        <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 border ${colorStyle.badge}`}>
                          {renderIcon(cat.iconName, 'w-4 h-4')}
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-xs font-black text-slate-900 dark:text-white">
                              {cat.name}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.2 rounded-full border ${colorStyle.badge}`}>
                              {cat.type === 'team' ? 'فريق عمل' : cat.type === 'priority' ? 'أولوية' : 'مخصص'}
                            </span>
                            <span className="text-[11px] font-mono font-bold text-slate-500 dark:text-slate-400">
                              {assignedCount} مهام مسندة
                            </span>
                          </div>

                          {cat.description && (
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-md">
                              {cat.description}
                            </p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-1.5 self-end sm:self-center shrink-0">
                        {/* Filter by this category */}
                        {onSelectCategoryFilter && (
                          <button
                            type="button"
                            onClick={() => {
                              onSelectCategoryFilter(cat.id);
                              onClose();
                            }}
                            className="px-2.5 py-1 text-xs font-bold rounded-lg bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 transition-colors cursor-pointer"
                            title="تصفية قائمة التحقق بهذا التصنيف فوراً"
                          >
                            تصفية المهام
                          </button>
                        )}

                        {/* Assign tasks */}
                        <button
                          type="button"
                          onClick={() => setManagingCategory(cat)}
                          className="px-2.5 py-1 text-xs font-semibold rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 transition-colors cursor-pointer"
                          title="تحديد المهام المسندة لهذا التصنيف"
                        >
                          إسناد المهام ({assignedCount})
                        </button>

                        {/* Edit */}
                        <button
                          type="button"
                          onClick={() => handleStartEdit(cat)}
                          className="p-1.5 text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
                          title="تعديل التصنيف"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>

                        {/* Delete */}
                        <button
                          type="button"
                          onClick={() => handleDeleteCategory(cat.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/80 rounded-lg transition-colors cursor-pointer"
                          title="حذف التصنيف"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            /* View 2: Create / Edit Category Form */
            <form onSubmit={handleSaveCategory} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  اسم التصنيف المخصص:
                </label>
                <input
                  type="text"
                  required
                  placeholder="مثال: فريق تطوير الواجهات أو أولوية الإطلاق"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              {/* Type selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  نوع التصنيف:
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setType('team')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      type === 'team'
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-indigo-500 shadow-2xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <Users className="w-3.5 h-3.5" />
                    <span>فريق عمل</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('priority')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      type === 'priority'
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-indigo-500 shadow-2xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <Flag className="w-3.5 h-3.5" />
                    <span>أولوية مشروع</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setType('custom')}
                    className={`p-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                      type === 'custom'
                        ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-indigo-500 shadow-2xs'
                        : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>تصنيف مخصص</span>
                  </button>
                </div>
              </div>

              {/* Color selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  لون التصنيف:
                </label>
                <div className="flex items-center gap-2 flex-wrap">
                  {AVAILABLE_COLORS.map((c) => {
                    const style = getCategoryColorClasses(c);
                    const isSelected = color === c;
                    return (
                      <button
                        key={c}
                        type="button"
                        onClick={() => setColor(c)}
                        className={`w-7 h-7 rounded-full flex items-center justify-center transition-all cursor-pointer border-2 ${style.dot} ${
                          isSelected ? 'scale-110 ring-2 ring-offset-2 ring-indigo-500' : 'opacity-80 hover:opacity-100'
                        }`}
                      >
                        {isSelected && <Check className="w-3.5 h-3.5 text-white stroke-[3]" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Icon selection */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1.5">
                  أيقونة التصنيف:
                </label>
                <div className="grid grid-cols-4 sm:grid-cols-8 gap-2">
                  {AVAILABLE_ICONS.map((i) => {
                    const IconComp = i.icon;
                    const isSelected = iconName === i.name;
                    return (
                      <button
                        key={i.name}
                        type="button"
                        onClick={() => setIconName(i.name)}
                        className={`p-2 rounded-xl border flex flex-col items-center justify-center gap-1 transition-all cursor-pointer ${
                          isSelected
                            ? 'bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 border-indigo-500 shadow-2xs font-bold'
                            : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-300'
                        }`}
                      >
                        <IconComp className="w-4 h-4" />
                        <span className="text-[10px]">{i.labelAr}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  الوصف أو ملاحظات الفريق (اختياري):
                </label>
                <input
                  type="text"
                  placeholder="وصف مختصر لأهداف هذا التصنيف ونطاق العمل"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white"
                />
              </div>

              {/* Task Pre-assignment Selection */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300">
                    إسناد مهام الفحص الحالية ({selectedItemIds.length} محددة):
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      if (selectedItemIds.length === auditItems.length) {
                        setSelectedItemIds([]);
                      } else {
                        setSelectedItemIds(auditItems.map((i) => i.id));
                      }
                    }}
                    className="text-[11px] font-semibold text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
                  >
                    {selectedItemIds.length === auditItems.length ? 'إلغاء تحديد الكل' : 'تحديد كافة المهام'}
                  </button>
                </div>

                <div className="max-h-48 overflow-y-auto space-y-1.5 p-2 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-200 dark:border-slate-800">
                  {auditItems.map((item) => {
                    const isChecked = selectedItemIds.includes(item.id);
                    return (
                      <div
                        key={item.id}
                        onClick={() => {
                          if (isChecked) {
                            setSelectedItemIds(selectedItemIds.filter((id) => id !== item.id));
                          } else {
                            setSelectedItemIds([...selectedItemIds, item.id]);
                          }
                        }}
                        className={`p-2 rounded-lg text-xs flex items-center justify-between gap-2 cursor-pointer transition-colors ${
                          isChecked
                            ? 'bg-indigo-50 dark:bg-indigo-950/60 font-bold text-indigo-900 dark:text-indigo-200'
                            : 'hover:bg-white dark:hover:bg-slate-900 text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className={`w-4 h-4 rounded flex items-center justify-center border shrink-0 ${
                            isChecked ? 'bg-indigo-600 border-indigo-600 text-white' : 'border-slate-400'
                          }`}>
                            {isChecked && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                          <span className="truncate">{item.titleAr || item.title}</span>
                        </div>
                        <span className="text-[10px] text-slate-400 font-normal shrink-0">
                          {item.category}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Form buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveTab('list')}
                  className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer"
                >
                  إلغاء
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-sm cursor-pointer"
                >
                  {editingCategoryId ? 'حفظ التعديلات' : 'إنشاء التصنيف المخصص'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
