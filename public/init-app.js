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

    // Activate deferred non-blocking stylesheets cleanly without inline onload handlers (CSP-safe)
    function activateDeferredStyles() {
      var links = document.querySelectorAll('link[data-defer-style="true"]');
      for (var i = 0; i < links.length; i++) {
        var link = links[i];
        if (link.rel === 'preload') {
          link.rel = 'stylesheet';
        }
      }
    }

    var preloadLinks = document.querySelectorAll('link[data-defer-style="true"]');
    for (var j = 0; j < preloadLinks.length; j++) {
      (function (lnk) {
        lnk.addEventListener('load', function () {
          lnk.rel = 'stylesheet';
        });
      })(preloadLinks[j]);
    }

    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', activateDeferredStyles);
    } else {
      activateDeferredStyles();
    }
    window.addEventListener('load', activateDeferredStyles);
  } catch (e) {}
})();
