import { KeywordDensityAnalysis, KeywordItem } from '../types/seo';

// Common Arabic stop words to ignore when extracting keywords
const ARABIC_STOPWORDS = new Set([
  'في', 'من', 'على', 'إلى', 'عن', 'مع', 'هذا', 'هذه', 'تم', 'كان', 'كانت', 'يكون', 'أن', 'إن', 'هل',
  'لا', 'ما', 'ماذا', 'لم', 'لن', 'كل', 'بعض', 'غير', 'هو', 'هي', 'هم', 'هن', 'أو', 'ثم', 'حيث',
  'ذلك', 'تلك', 'التي', 'الذي', 'الذين', 'اللاتي', 'بين', 'حول', 'خلال', 'بعد', 'قبل', 'حتى',
  'عند', 'وقد', 'فقد', 'إذا', 'لو', 'كي', 'لكن', 'بل', 'أجل', 'نعم', 'كما', 'أيضا', 'أيضاً',
  'هناك', 'هنا', 'فقط', 'جدا', 'جداً', 'أكثر', 'أقل', 'كبير', 'أول', 'أخرى', 'آخر', 'نحو',
  'مثل', 'ضمن', 'لدى', 'بشكل', 'بصورة', 'كافة', 'جميع', 'أحد', 'إحدى', 'سواء', 'أم', 'ذات',
  'نفس', 'دون', 'علماً', 'حسب', 'بسبب', 'إذ', 'منذ', 'أثناء', 'عبر', 'تجاه', 'ضد', 'فوق', 'تحت'
]);

// Common English stop words
const ENGLISH_STOPWORDS = new Set([
  'the', 'be', 'to', 'of', 'and', 'a', 'in', 'that', 'have', 'i', 'it', 'for', 'not', 'on', 'with',
  'he', 'as', 'you', 'do', 'at', 'this', 'but', 'his', 'by', 'from', 'they', 'we', 'say', 'her',
  'she', 'or', 'an', 'will', 'my', 'one', 'all', 'would', 'there', 'their', 'what', 'so', 'up',
  'out', 'if', 'about', 'who', 'get', 'which', 'go', 'me', 'when', 'make', 'can', 'like', 'time',
  'no', 'just', 'him', 'know', 'take', 'people', 'into', 'year', 'your', 'good', 'some', 'could',
  'them', 'see', 'other', 'than', 'then', 'now', 'look', 'only', 'come', 'its', 'over', 'think',
  'also', 'back', 'after', 'use', 'two', 'how', 'our', 'work', 'first', 'well', 'way', 'even',
  'new', 'want', 'because', 'any', 'these', 'give', 'day', 'most', 'us', 'is', 'are', 'was', 'were'
]);

function cleanWord(w: string): string {
  return w
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]/gu, '') // Keep letters and numbers (supports Arabic script + Latin)
    .trim();
}

export function analyzeKeywordDensity(
  text: string,
  meta?: { title?: string; h1?: string[]; description?: string }
): KeywordDensityAnalysis {
  if (!text || text.trim().length === 0) {
    return {
      totalAnalyzedWords: 0,
      uniqueWordsCount: 0,
      topSingleKeywords: [],
      topPhrases: [],
      recommendations: []
    };
  }

  // Tokenize
  const rawTokens = text.split(/\s+/);
  const cleanedTokens: string[] = [];
  
  for (const token of rawTokens) {
    const cleaned = cleanWord(token);
    if (cleaned.length >= 3 && !/^\d+$/.test(cleaned)) {
      cleanedTokens.push(cleaned);
    }
  }

  const totalAnalyzedWords = cleanedTokens.length;
  if (totalAnalyzedWords === 0) {
    return {
      totalAnalyzedWords: 0,
      uniqueWordsCount: 0,
      topSingleKeywords: [],
      topPhrases: [],
      recommendations: []
    };
  }

  const titleLower = (meta?.title || '').toLowerCase();
  const h1Combined = (meta?.h1 || []).join(' ').toLowerCase();
  const descLower = (meta?.description || '').toLowerCase();

  // 1. Single Word Frequencies (excluding stop words)
  const singleFreq: Record<string, number> = {};
  for (const word of cleanedTokens) {
    if (ARABIC_STOPWORDS.has(word) || ENGLISH_STOPWORDS.has(word)) {
      continue;
    }
    // Also skip 1-2 character tokens
    if (word.length <= 2) continue;

    singleFreq[word] = (singleFreq[word] || 0) + 1;
  }

  // 2. Two-word phrase frequencies (bigrams)
  const phraseFreq: Record<string, number> = {};
  for (let i = 0; i < cleanedTokens.length - 1; i++) {
    const w1 = cleanedTokens[i];
    const w2 = cleanedTokens[i + 1];

    // Don't form phrases where both are stop words
    const w1IsStop = ARABIC_STOPWORDS.has(w1) || ENGLISH_STOPWORDS.has(w1);
    const w2IsStop = ARABIC_STOPWORDS.has(w2) || ENGLISH_STOPWORDS.has(w2);
    if (w1IsStop && w2IsStop) continue;

    const phrase = `${w1} ${w2}`;
    phraseFreq[phrase] = (phraseFreq[phrase] || 0) + 1;
  }

  // Calculate single keywords
  const topSingleKeywords: KeywordItem[] = Object.entries(singleFreq)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 15)
    .map(([keyword, count]) => {
      const density = Math.round((count / totalAnalyzedWords) * 1000) / 10; // e.g. 2.4%
      let status: 'optimal' | 'low' | 'high' = 'optimal';
      if (density > 3.5) status = 'high';
      else if (density < 1.0) status = 'low';

      return {
        keyword,
        count,
        density,
        type: 'single',
        status,
        inTitle: titleLower.includes(keyword),
        inH1: h1Combined.includes(keyword),
        inMetaDesc: descLower.includes(keyword)
      };
    });

  // Calculate top phrases
  const topPhrases: KeywordItem[] = Object.entries(phraseFreq)
    .filter(([_, count]) => count >= 2)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([keyword, count]) => {
      // Density for phrases based on total tokens
      const density = Math.round((count / totalAnalyzedWords) * 1000) / 10;
      let status: 'optimal' | 'low' | 'high' = 'optimal';
      if (density > 2.5) status = 'high';
      else if (density < 0.5) status = 'low';

      return {
        keyword,
        count,
        density,
        type: 'phrase',
        status,
        inTitle: titleLower.includes(keyword),
        inH1: h1Combined.includes(keyword),
        inMetaDesc: descLower.includes(keyword)
      };
    });

  const uniqueWordsCount = Object.keys(singleFreq).length;

  // Generate actionable recommendations
  const recommendations: KeywordDensityAnalysis['recommendations'] = [];

  // Check for keyword stuffing
  const highDensityKeywords = topSingleKeywords.filter(k => k.status === 'high');
  if (highDensityKeywords.length > 0) {
    const wordsList = highDensityKeywords.map(k => `"${k.keyword}" (${k.density}%)`).join('، ');
    recommendations.push({
      type: 'warning',
      titleAr: 'تنبيه من حشو الكلمات (Keyword Stuffing)',
      descriptionAr: `تم رصد كثافة مرتفعة تتجاوز 3.5% للكلمات: ${wordsList}. التكرار الزائد قد يُعرّض الصفحة لعقوبة خوارزميات جوجل لجودة المحتوى (Google Helpful Content).`,
      actionAr: 'استبدل بعض تكرارات هذه الكلمات بمرادفات لغوية أو عبارات دلالية مرتبطة (LSI Keywords) لجعل الصياغة طبيعية وأكثر سلاسة للقارئ.'
    });
  } else {
    recommendations.push({
      type: 'success',
      titleAr: 'توزيع طبيعي وخالٍ من حشو الكلمات',
      descriptionAr: 'لا توجد كلمات ذات كثافة مفرطة في الصفحة. صياغة المحتوى متوازنة ومريحة للقراءة وفهرسة محركات البحث.'
    });
  }

  // Check title & H1 synergy with top keywords
  const topKeyword = topSingleKeywords[0];
  if (topKeyword) {
    if (!topKeyword.inTitle && !topKeyword.inH1) {
      recommendations.push({
        type: 'warning',
        titleAr: 'غياب الكلمة الأكثر تكراراً عن العناوين الرئيسية',
        descriptionAr: `الكلمة الأكثر استخداماً في النص هي "${topKeyword.keyword}" (${topKeyword.count} مرات)، ولكنها غير متواجدة في عنوان الصفحة (Title) أو العنوان الرئيسي (H1).`,
        actionAr: `تأكد من إدراج "${topKeyword.keyword}" أو مرادفها الأساسي في وسم H1 وعنوان الصفحة Title لتعزيز التطابق الدلالي.`
      });
    } else if (topKeyword.inTitle && topKeyword.inH1) {
      recommendations.push({
        type: 'success',
        titleAr: 'تطابق استراتيجي مثالي بين العنوان والمحتوى',
        descriptionAr: `الكلمة الرئيسية "${topKeyword.keyword}" مدمجة بذكاء في عنوان الصفحة وعنوان H1 مع توزيع متناسق في صلب النص (${topKeyword.density}%).`
      });
    }
  }

  // Check top 2-word phrase usage in meta description
  const topPhrase = topPhrases[0];
  if (topPhrase && !topPhrase.inMetaDesc) {
    recommendations.push({
      type: 'info',
      titleAr: 'فرصة تحسين الوصف التعريفي (Meta Description)',
      descriptionAr: `العبارة المفتاحية الثنائية الأكثر صلة بالموضوع هي "${topPhrase.keyword}". تضمينها في الوصف التعريفي يزيد نسبة النقر للظهور (CTR).`,
      actionAr: `أضف العبارة "${topPhrase.keyword}" في جملة مفيدة وجذابة داخل وسم meta description.`
    });
  }

  // Variety and vocabulary depth
  if (totalAnalyzedWords > 300) {
    const varietyRatio = Math.round((uniqueWordsCount / totalAnalyzedWords) * 100);
    if (varietyRatio > 35) {
      recommendations.push({
        type: 'success',
        titleAr: 'ثراء لغوي ومصطلحي متقدم',
        descriptionAr: `تنوع الكلمات الفريدة يبلغ ${varietyRatio}%، مما يشير إلى محتوى غني بالمعلومات يغطي جوانب الموضوع بتفصيل واحترافية.`
      });
    } else {
      recommendations.push({
        type: 'info',
        titleAr: 'تنويع المصطلحات والعبارات المتخصصة',
        descriptionAr: 'يُنصح بتوسيع المعجم المستخدم في المقال واستخدام مفاهيم داعمة للموضوع لتعزيز تغطية نية البحث (Search Intent).'
      });
    }
  }

  return {
    totalAnalyzedWords,
    uniqueWordsCount,
    topSingleKeywords,
    topPhrases,
    recommendations
  };
}
