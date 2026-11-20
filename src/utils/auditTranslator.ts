import { AuditItem, CategoryScore, AiSeoAdvice } from '../types/seo';

export interface LocalizedAuditContent {
  title: string;
  description: string;
  impact: string;
  fixGuide: string;
  currentValue?: string;
  idealValue?: string;
}

interface ItemTranslation {
  title: Record<string, string>;
  description: Record<string, string>;
  fixGuide: Record<string, string>;
  currentValue?: Record<string, string>;
  idealValue?: Record<string, string>;
}

export const ITEM_TRANSLATIONS: Record<string, ItemTranslation> = {
  title_length: {
    title: {
      en: 'Page Title Tag Length',
      fr: 'Longueur de la balise Title',
      es: 'Longitud de la etiqueta Title',
      de: 'Länge des Title-Tags',
      tr: 'Sayfa Başlığı (Title Tag) Uzunluğu',
      'zh-CN': '页面标题 (Title Tag) 长度',
      ru: 'Длина тега заголовка (Title Tag)',
      ja: 'ページタイトル (Title Tag) の文字数'
    },
    description: {
      en: 'The page title length is optimal and appears completely in Google search results without truncation.',
      fr: 'La longueur du titre est optimale et s’affiche intégralement dans les résultats Google sans coupure.',
      es: 'La longitud del título es óptima y aparece completo en Google sin truncarse.',
      de: 'Die Titellänge ist optimal und wird in den Google-Suchergebnissen vollständig angezeigt.',
      tr: 'Sayfa başlığı uzunluğu mükemmeldir ve Google arama sonuçlarında kesilmeden tam olarak görünür.',
      'zh-CN': '页面标题长度非常适中，在谷歌搜索结果中可完整展示且无截断。',
      ru: 'Длина заголовка страницы оптимальна и отображается в Google полностью без обрезки.',
      ja: 'タイトルの長さは最適で、Google検索結果で省略されることなく完全に表示されます。'
    },
    fixGuide: {
      en: 'Title is ideal and includes the primary keywords for your site.',
      fr: 'Le titre est idéal et contient les mots-clés principaux de votre site.',
      es: 'El título es ideal y contiene las palabras clave principales.',
      de: 'Der Titel ist ideal und enthält die wichtigsten Suchbegriffe.',
      tr: 'Başlık idealdir ve sitenin ana odak anahtar kelimelerini içerir.',
      'zh-CN': '标题非常理想，并包含核心关键词。',
      ru: 'Заголовок идеален и содержит главные ключевые слова сайта.',
      ja: 'タイトルは理想的で、サイトのメインキーワードを含んでいます。'
    },
    currentValue: {
      en: '58 characters',
      fr: '58 caractères',
      es: '58 caracteres',
      de: '58 Zeichen',
      tr: '58 karakter',
      'zh-CN': '58个字符',
      ru: '58 символов',
      ja: '58文字'
    },
    idealValue: {
      en: '50 - 60 characters',
      fr: '50 - 60 caractères',
      es: '50 - 60 caracteres',
      de: '50 - 60 Zeichen',
      tr: '50 - 60 karakter',
      'zh-CN': '50 - 60个字符',
      ru: '50 - 60 символов',
      ja: '50 - 60文字'
    }
  },
  meta_description: {
    title: {
      en: 'Meta Description Tag',
      fr: 'Balise Meta Description',
      es: 'Etiqueta Meta Description',
      de: 'Meta-Description-Tag',
      tr: 'Meta Açıklama (Meta Description)',
      'zh-CN': '元描述标签 (Meta Description)',
      ru: 'Тег мета-описания (Meta Description)',
      ja: 'メタディスクリプション (Meta Description)'
    },
    description: {
      en: 'Engaging meta description with proper length, maximizing Google search click-through rate (CTR).',
      fr: 'Meta description attrayante de longueur adéquate, maximisant le taux de clic (CTR).',
      es: 'Meta descripción atractiva con longitud adecuada, maximizando la tasa de clics (CTR).',
      de: 'Ansprechende Meta-Description mit passender Länge für hohe Klickraten (CTR).',
      tr: 'Tıklama oranını (CTR) artıran uygun uzunlukta etkileyici meta açıklama.',
      'zh-CN': '具有吸引力且长度适中的元描述，可有效提升谷歌点击率 (CTR)。',
      ru: 'Привлекательное мета-описание оптимальной длины, повышающее кликабельность (CTR).',
      ja: 'クリック率 (CTR) を高める、適切な長さの魅力的なメタディスクリプションです。'
    },
    fixGuide: {
      en: 'Meta description accurately reflects the page content and invites readers to click.',
      fr: 'La description reflète fidèlement le contenu et incite à cliquer.',
      es: 'La descripción refleja el contenido con precisión e invita al clic.',
      de: 'Die Beschreibung fasst den Inhalt präzise zusammen und lädt zum Klicken ein.',
      tr: 'Açıklama sayfa içeriğini doğru bir şekilde yansıtır.',
      'zh-CN': '描述准确反映了页面内容并能吸引用户点击。',
      ru: 'Описание точно отражает тему страницы и привлекает пользователей.',
      ja: '記事の内容を的確に要約し、クリックを促す構成になっています。'
    },
    currentValue: {
      en: '138 characters',
      fr: '138 caractères',
      es: '138 caracteres',
      de: '138 Zeichen',
      tr: '138 karakter',
      'zh-CN': '138个字符',
      ru: '138 символов',
      ja: '138文字'
    },
    idealValue: {
      en: '120 - 160 characters',
      fr: '120 - 160 caractères',
      es: '120 - 160 caracteres',
      de: '120 - 160 Zeichen',
      tr: '120 - 160 karakter',
      'zh-CN': '120 - 160个字符',
      ru: '120 - 160 символов',
      ja: '120 - 160文字'
    }
  },
  h1_structure: {
    title: {
      en: 'H1 Main Heading Structure',
      fr: 'Structure de titre principal H1',
      es: 'Estructura de encabezado principal H1',
      de: 'H1-Hauptüberschriften-Struktur',
      tr: 'H1 Ana Başlık Yapısı',
      'zh-CN': 'H1 主标题层级结构',
      ru: 'Структура главного заголовка H1',
      ja: 'H1メイン見出し構造'
    },
    description: {
      en: 'Exactly one well-structured H1 tag found with strong semantic hierarchy.',
      fr: 'Une seule balise H1 correctement configurée avec une hiérarchie sémantique solide.',
      es: 'Se encontró exactamente una etiqueta H1 con fuerte jerarquía semántica.',
      de: 'Genau ein gut strukturierter H1-Tag mit klarer semantischer Hierarchie gefunden.',
      tr: 'Güçlü anlamsal hiyerarşiye sahip tam bir H1 etiketi bulundu.',
      'zh-CN': '检测到且仅包含一个结构严谨、具有强语义信息的 H1 标签。',
      ru: 'Обнаружен ровно один корректный тег H1 с сильной семантикой.',
      ja: '明確な意味を持つ適切なH1タグが1つだけ正しく検出されました。'
    },
    fixGuide: {
      en: 'No changes required. Maintain a single dominant H1 per page.',
      fr: 'Aucun changement requis. Conservez un seul H1 dominant par page.',
      es: 'No requiere cambios. Mantenga un único H1 por página.',
      de: 'Keine Änderungen erforderlich. Behalten Sie genau ein H1 pro Seite bei.',
      tr: 'Değişiklik gerekmez. Sayfa başına tek bir H1 etiketi koruyun.',
      'zh-CN': '无需更改，每页保持单一主要 H1 标签即可。',
      ru: 'Изменений не требуется. Рекомендуется сохранять один H1 на страницу.',
      ja: '修正は不要です。1ページにつき1つの主要なH1を維持してください。'
    },
    currentValue: {
      en: '1 H1 tag found',
      fr: '1 balise H1 trouvée',
      es: '1 etiqueta H1 encontrada',
      de: '1 H1-Tag gefunden',
      tr: '1 adet H1 etiketi bulundu',
      'zh-CN': '存在 1 个 H1 标签',
      ru: '1 тег H1 найден',
      ja: 'H1タグが1件検出'
    },
    idealValue: {
      en: 'Exactly 1 H1 per page',
      fr: 'Exactement 1 H1 par page',
      es: 'Exactamente 1 H1 por página',
      de: 'Genau 1 H1 pro Seite',
      tr: 'Sayfa başına tam 1 H1',
      'zh-CN': '每页仅限 1 个 H1 标签',
      ru: 'Ровно 1 тег H1 на страницу',
      ja: '1ページにつき1つのH1タグ'
    }
  },
  canonical: {
    title: {
      en: 'Canonical Link Tag',
      fr: 'Balise de lien Canonique',
      es: 'Etiqueta de enlace Canónico',
      de: 'Canonical-Tag',
      tr: 'Kanonik Bağlantı (Canonical URL)',
      'zh-CN': '规范链接标签 (Canonical URL)',
      ru: 'Канонический URL (Canonical)',
      ja: 'カノニカルタグ (Canonical URL)'
    },
    description: {
      en: 'A valid canonical tag is configured, preventing duplicate content penalties in search engines.',
      fr: 'Une balise canonique valide est configurée, évitant le contenu dupliqué.',
      es: 'Etiqueta canónica configurada correctamente, evitando contenido duplicado.',
      de: 'Ein gültiger Canonical-Tag verhindert Strafen für doppelten Inhalt.',
      tr: 'Arama motorlarında yinelenen içerik cezalarını önleyen geçerli kanonik URL.',
      'zh-CN': '已配置合规的规范链接，有效避免搜索引擎判定重复内容。',
      ru: 'Настроен корректный канонический URL, предотвращающий дублирование контента.',
      ja: '検索エンジンによる重複コンテンツペナルティを防ぐ正規URLが設定されています。'
    },
    fixGuide: {
      en: 'Canonical URL is correctly deployed in the HTML header.',
      fr: 'L’URL canonique est correctement déployée dans le header HTML.',
      es: 'La URL canónica está implementada correctamente en el header HTML.',
      de: 'Der Canonical-Link ist im HTML-Head korrekt implementiert.',
      tr: 'Kanonik etiket HTML başlığında doğru şekilde etkindir.',
      'zh-CN': '标签已在 HTML 头部正确部署。',
      ru: 'Канонический тег правильно внедрен в заголовок страницы.',
      ja: 'HTMLヘッダー内で正しく設定されています。'
    }
  },
  image_alt: {
    title: {
      en: 'Images Missing Alt Text',
      fr: 'Images sans attribut Alt',
      es: 'Imágenes sin atributo Alt',
      de: 'Bilder ohne Alt-Attribute',
      tr: 'Alt Metni Eksik Görseller (Alt Tag)',
      'zh-CN': '缺少替代文本 (Alt) 的图片',
      ru: 'Изображения без атрибута Alt',
      ja: 'Alt属性（代替テキスト）のない画像'
    },
    description: {
      en: 'Multiple images lack descriptive alt attributes, hurting Google Image Search and accessibility.',
      fr: 'Plusieurs images n’ont pas de texte alt, pénalisant le SEO d’images et l’accessibilité.',
      es: 'Varias imágenes carecen de texto alt, perjudicando el SEO de imágenes y accesibilidad.',
      de: 'Mehrere Bilder haben keinen Alt-Text, was Bildersuche und Barrierefreiheit beeinträchtigt.',
      tr: 'Birçok görselde alternatif metin eksik, bu da Google Görsel aramasını olumsuz etkiler.',
      'zh-CN': '检测到多张图片缺失 Alt 替代文本，严重影响谷歌图片搜索排名与无障碍访问。',
      ru: 'Некоторые изображения не имеют Alt-текста, что ухудшает поиск по картинкам.',
      ja: '複数の画像にAlt属性が設定されておらず、画像検索やアクセシビリティに悪影響があります。'
    },
    fixGuide: {
      en: 'Add meaningful, keyword-rich alt descriptions to all informative images.',
      fr: 'Ajoutez des descriptions alt claires avec vos mots-clés sur chaque image.',
      es: 'Agregue descripciones alt claras con palabras clave a cada imagen.',
      de: 'Fügen Sie allen Bildern aussagekräftige Alt-Texte mit relevanten Begriffen hinzu.',
      tr: 'Görsellerinize açıklayıcı ve anahtar kelime içeren alternatif metinler ekleyin.',
      'zh-CN': '为所有图片添加包含核心关键词的准确 Alt 描述。',
      ru: 'Добавьте осмысленные Alt-описания с ключевыми словами ко всем изображениям.',
      ja: 'すべての画像にキーワードを含む適切な代替テキストを追加してください。'
    },
    currentValue: {
      en: '3 images missing Alt',
      fr: '3 images sans Alt',
      es: '3 imágenes sin Alt',
      de: '3 Bilder ohne Alt',
      tr: '3 görselde Alt eksik',
      'zh-CN': '3张图片缺失 Alt',
      ru: '3 изображения без Alt',
      ja: '3枚の画像にAlt未設定'
    },
    idealValue: {
      en: '0 images without Alt (100% covered)',
      fr: '0 image sans Alt (100% couvert)',
      es: '0 imágenes sin Alt (100% cubierto)',
      de: '0 Bilder ohne Alt (100% Abdeckung)',
      tr: '0 eksik görsel (%100 kapsama)',
      'zh-CN': '0张图片缺失 Alt (100% 覆盖率)',
      ru: '0 изображений без Alt (100% покрытие)',
      ja: 'Alt未設定の画像 0枚 (100%カバレッジ)'
    }
  },
  ssl_certificate: {
    title: {
      en: 'HTTPS & SSL Security',
      fr: 'Sécurité HTTPS et Certificat SSL',
      es: 'Seguridad HTTPS y Certificado SSL',
      de: 'HTTPS- und SSL-Sicherheit',
      tr: 'HTTPS ve SSL Güvenlik Sertifikası',
      'zh-CN': 'HTTPS 加密与 SSL 安全证书',
      ru: 'HTTPS и сертификат безопасности SSL',
      ja: 'HTTPS暗号化とSSLセキュリティ証明書'
    },
    description: {
      en: 'Website is protected with valid HTTPS encryption, satisfying Google core security standards.',
      fr: 'Le site est protégé par un chiffrement HTTPS valide, répondant aux normes Google.',
      es: 'El sitio está protegido con HTTPS válido, cumpliendo los estándares de Google.',
      de: 'Die Website ist mit gültiger HTTPS-Verschlüsselung geschützt.',
      tr: 'Web sitesi geçerli HTTPS şifrelemesi ile korunmaktadır.',
      'zh-CN': '网站受合规的 HTTPS 加密保护，完全满足谷歌核心安全标杆。',
      ru: 'Сайт защищен действующим HTTPS-сертификатом, соответствуя стандартам безопасности Google.',
      ja: '有効なHTTPS暗号化で保護されており、Googleのセキュリティ基準を満たしています。'
    },
    fixGuide: {
      en: 'SSL certificate is active and properly redirecting HTTP to HTTPS.',
      fr: 'Le certificat SSL est actif et redirige correctement HTTP vers HTTPS.',
      es: 'El certificado SSL está activo y redirige HTTP a HTTPS.',
      de: 'Das SSL-Zertifikat ist aktiv und leitet HTTP zu HTTPS weiter.',
      tr: 'SSL sertifikası etkindir ve HTTP isteklerini HTTPS’ye yönlendirir.',
      'zh-CN': 'SSL 证书处于激活状态，且正确强制将 HTTP 重定向至 HTTPS。',
      ru: 'SSL-сертификат активен и корректно перенаправляет трафик с HTTP на HTTPS.',
      ja: 'SSL証明書が有効で、HTTPからHTTPSへのリダイレクトが正しく動作しています。'
    }
  },
  robots_txt: {
    title: {
      en: 'Robots.txt Crawl Directives',
      fr: 'Fichier Robots.txt',
      es: 'Archivo Robots.txt',
      de: 'Robots.txt-Steuerungsdatei',
      tr: 'Robots.txt Tarama Yönergeleri',
      'zh-CN': 'Robots.txt 爬虫指引文件',
      ru: 'Файл инструкций Robots.txt',
      ja: 'Robots.txt クロール制御ファイル'
    },
    description: {
      en: 'Robots.txt is found and accessible, properly directing search engine crawlers.',
      fr: 'Robots.txt trouvé et accessible, guidant correctement les robots d’indexation.',
      es: 'Robots.txt encontrado y accesible, guiando a los rastreadores correctamente.',
      de: 'Robots.txt ist erreichbar und steuert Suchmaschinen-Crawler korrekt.',
      tr: 'Robots.txt bulundu ve arama motoru botlarını doğru şekilde yönlendiriyor.',
      'zh-CN': '已找到并能够正常访问 Robots.txt，可正确引导搜索引擎蜘蛛抓取。',
      ru: 'Файл robots.txt найден и доступен, корректно управляя краулерами поисковых систем.',
      ja: 'Robots.txtが正常に検出され、クローラーを適切に誘導しています。'
    },
    fixGuide: {
      en: 'Keep robots.txt clean and ensure critical CSS/JS files are not blocked.',
      fr: 'Maintenez robots.txt propre sans bloquer les fichiers CSS et JS.',
      es: 'Mantenga robots.txt limpio y no bloquee archivos CSS/JS.',
      de: 'Stellen Sie sicher, dass wichtige CSS/JS-Dateien nicht blockiert werden.',
      tr: 'Kritik CSS/JS dosyalarının engellenmediğinden emin olun.',
      'zh-CN': '请确保未错误拦截关键 CSS 和 JavaScript 资源文件。',
      ru: 'Убедитесь, что важные CSS и JS файлы не заблокированы для краулеров.',
      ja: '重要なCSSやJSファイルがブロックされていないことを確認してください。'
    }
  },
  sitemap_xml: {
    title: {
      en: 'XML Sitemap',
      fr: 'Sitemap XML',
      es: 'Mapa del sitio Sitemap XML',
      de: 'XML-Sitemap',
      tr: 'XML Site Haritası (Sitemap.xml)',
      'zh-CN': 'XML 网站地图 (Sitemap.xml)',
      ru: 'Карта сайта (Sitemap XML)',
      ja: 'XMLサイトマップ (Sitemap.xml)'
    },
    description: {
      en: 'XML Sitemap is configured and easily discoverable by search engines.',
      fr: 'Le sitemap XML est configuré et facilement détectable par les moteurs de recherche.',
      es: 'El sitemap XML está configurado y es detectable por los motores de búsqueda.',
      de: 'Die XML-Sitemap ist vorhanden und für Suchmaschinen auffindbar.',
      tr: 'XML site haritası yapılandırılmış ve arama motorları tarafından taranabilir.',
      'zh-CN': 'XML 网站地图配置完备，极便于搜索引擎即时抓取新发布的网页。',
      ru: 'XML-карта сайта настроена и легко обнаруживается поисковиками.',
      ja: 'XMLサイトマップが正常に設定され、検索エンジンに検出可能です。'
    },
    fixGuide: {
      en: 'Submit this sitemap URL in Google Search Console for rapid indexing.',
      fr: 'Soumettez l’URL du sitemap dans Google Search Console.',
      es: 'Envíe la URL del sitemap en Google Search Console.',
      de: 'Reichen Sie die Sitemap-URL in der Google Search Console ein.',
      tr: 'Hızlı dizine ekleme için bu bağlantıyı Google Search Console’a gönderin.',
      'zh-CN': '建议在 Google Search Console 中提交该站点地图网址以加速收录。',
      ru: 'Отправьте URL карты сайта в Google Search Console для ускорения индексации.',
      ja: 'Google Search ConsoleにこのサイトマップURLを送信して迅速なインデックスを促してください。'
    }
  }
};

/**
 * Returns localized title, description, impact, and fix guide for any audit item.
 * Automatically falls back to English for non-Arabic, and Arabic when Arabic is selected.
 */
export function getLocalizedAuditItem(
  item: AuditItem,
  langCode: string
): LocalizedAuditContent {
  const isArabic = langCode === 'ar';

  if (isArabic) {
    return {
      title: item.titleAr,
      description: item.descriptionAr,
      impact: `تأثير ${item.impactAr}`,
      fixGuide: item.fixGuideAr,
      currentValue: item.currentValue,
      idealValue: item.idealValue
    };
  }

  // Non-Arabic: Check dictionary
  const dict = ITEM_TRANSLATIONS[item.id];
  const impactLabel = item.impactAr === 'حرج' ? 'Critical' : item.impactAr === 'متوسط' ? 'Medium' : 'Low';

  if (dict) {
    const lang = dict.title[langCode] ? langCode : 'en';
    return {
      title: dict.title[lang] || item.title || item.titleAr,
      description: dict.description[lang] || item.descriptionAr,
      impact: `Impact: ${impactLabel}`,
      fixGuide: dict.fixGuide[lang] || item.fixGuideAr,
      currentValue: dict.currentValue?.[lang] || item.currentValue,
      idealValue: dict.idealValue?.[lang] || item.idealValue
    };
  }

  // Fallback for items without specific dict entries
  return {
    title: item.title || item.titleAr,
    description: item.descriptionAr,
    impact: `Impact: ${impactLabel}`,
    fixGuide: item.fixGuideAr,
    currentValue: item.currentValue,
    idealValue: item.idealValue
  };
}
