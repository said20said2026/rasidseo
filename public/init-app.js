(function () {
  try {
    var savedTheme = localStorage.getItem('rasid_theme');
    var systemDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (savedTheme === 'dark' || ((!savedTheme || savedTheme === 'system') && systemDark)) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }

    var savedLang = localStorage.getItem('rasid_selected_language') || 'ar';
    var rtlLangs = ['ar', 'fa', 'ur', 'he'];
    if (rtlLangs.indexOf(savedLang) !== -1) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
    document.documentElement.lang = savedLang;
  } catch (e) {}

  window.googleTranslateElementInit = function () {
    if (window.google && window.google.translate) {
      try {
        new window.google.translate.TranslateElement(
          {
            pageLanguage: 'ar',
            includedLanguages:
              'ar,en,es,fr,de,zh-CN,ja,ko,tr,ru,pt,it,nl,fa,ur,hi,id,ms,vi,th,pl,sv,no,da,fi,el,cs,hu,ro,uk,iw,bn,tl,sw,sr,hr,sk,bg,az',
            autoDisplay: false
          },
          'google_translate_element'
        );
      } catch (e) {}
    }
  };
})();
