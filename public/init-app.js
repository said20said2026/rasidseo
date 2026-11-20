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
    var rtlLangs = ['ar', 'fa', 'ur', 'he', 'ku', 'ps'];
    if (rtlLangs.indexOf(savedLang) !== -1) {
      document.documentElement.dir = 'rtl';
    } else {
      document.documentElement.dir = 'ltr';
    }
    document.documentElement.lang = savedLang;

    // Clear any stale legacy googtrans cookies so no legacy widget banner lingers
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;';
    document.cookie = 'googtrans=; expires=Thu, 01 Jan 1970 00:00:00 UTC; domain=' + window.location.hostname + '; path=/;';
  } catch (e) {}
})();
