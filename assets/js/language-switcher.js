/**
 * Language Switcher for Labwyze
 * Handles language preference and URL redirection
 */

(function() {
  'use strict';
  
  // Map of page names to their equivalents
  const PAGE_MAP = {
    'index.html': { en: 'index.html', fr: 'fr/index.html' },
    'about.html': { en: 'about.html', fr: 'fr/about.html' },
    'portfolio.html': { en: 'portfolio.html', fr: 'fr/portfolio.html' },
    'resources.html': { en: 'resources.html', fr: 'fr/resources.html' },
    'team-members.html': { en: 'team-members.html', fr: 'fr/team-members.html' },
    'blog-full-width.html': { en: 'blog-full-width.html', fr: 'fr/blog-full-width.html' },
    'blog-single-full-width.html': { en: 'blog-single-full-width.html', fr: 'fr/blog-single-full-width.html' },
    'success.html': { en: 'success.html', fr: 'fr/success.html' },
    '404.html': { en: '404.html', fr: 'fr/404.html' }
  };
  
  // Pages that exist in both EN and FR
  const PLAYBOOK_PAGES = [
    'playbook-ai-delivery.html',
    'playbook-ai-delivery-merci.html',
    'playbook-ai-s4hana-acceleration.html',
    'playbook-ai-s4hana-acceleration-merci.html',
    'playbook-finance-ai-readiness.html',
    'playbook-finance-ai-readiness-merci.html',
    'playbook-s4hana-migration.html',
    'playbook-s4hana-migration-merci.html'
  ];
  
  PLAYBOOK_PAGES.forEach(function(p) {
    PAGE_MAP[p] = { en: p, fr: 'fr/' + p };
  });
  
  // Blog posts in /blog/ (EN) or /blog/fr/ (FR)
  const BLOG_PREFIX = 'blog/';
  
  /**
   * Get the current page filename from URL
   */
  function getCurrentFile() {
    var path = window.location.pathname;
    var filename = path.substring(path.lastIndexOf('/') + 1);
    if (!filename) filename = 'index.html';
    return filename;
  }
  
  /**
   * Detect current language from URL
   */
  function getCurrentLang() {
    var path = window.location.pathname;
    if (path.indexOf('/fr/') !== -1 || path.indexOf('/blog/fr/') !== -1) {
      return 'fr';
    }
    return 'en';
  }
  
  /**
   * Get the equivalent URL in another language
   */
  function getEquivalentUrl(targetLang) {
    var path = window.location.pathname;
    var currentLang = getCurrentLang();
    
    if (currentLang === targetLang) return path;
    
    // Handle blog posts
    if (path.indexOf('/blog/fr/') !== -1) {
      // FR blog -> EN blog
      var blogFile = path.substring(path.lastIndexOf('/fr/') + 4);
      return path.replace('/blog/fr/', '/blog/');
    }
    if (path.indexOf('/blog/') !== -1 && targetLang === 'fr') {
      // EN blog -> FR blog
      var blogFile = path.substring(path.lastIndexOf('/blog/') + 6);
      return path.replace('/blog/', '/blog/fr/');
    }
    
    // Handle main pages
    var filename = getCurrentFile();
    var mapping = PAGE_MAP[filename];
    
    if (mapping) {
      var targetFile = mapping[targetLang];
      if (currentLang === 'fr') {
        // From /fr/ to root
        return path.substring(0, path.indexOf('/fr/') + 1) + targetFile;
      } else {
        // From root to /fr/
        return path.substring(0, path.lastIndexOf('/') + 1) + targetFile;
      }
    }
    
    // Fallback: go to equivalent index
    return targetLang === 'fr' ? '/fr/index.html' : '/index.html';
  }
  
  /**
   * Switch to another language
   */
  function switchLanguage(targetLang) {
    var newUrl = getEquivalentUrl(targetLang);
    if (newUrl && newUrl !== window.location.pathname) {
      // Save preference
      try { localStorage.setItem('labwyze_lang', targetLang); } catch(e) {}
      window.location.href = newUrl;
    }
  }
  
  /**
   * Update all navigation links to point to equivalent pages in target language
   */
  function updateNavLinks(targetLang) {
    var currentLang = getCurrentLang();
    if (currentLang === targetLang) return;
    
    // Update all internal links
    document.querySelectorAll('a[href]').forEach(function(link) {
      var href = link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('http') || 
          href.startsWith('mailto:') || href.startsWith('tel:') || 
          href.startsWith('//')) return;
      
      // Skip language switcher links
      if (link.classList.contains('language-switcher') || 
          link.closest('.language-switcher')) return;
      
      // Compute equivalent path
      var newHref = computeLinkEquivalent(href, targetLang);
      if (newHref !== href) {
        link.setAttribute('href', newHref);
      }
    });
  }
  
  /**
   * Compute equivalent href for a given link
   */
  function computeLinkEquivalent(href, targetLang) {
    // Remove leading ../ if any
    var cleanHref = href;
    var prefix = '';
    if (href.startsWith('../')) {
      prefix = '../';
      cleanHref = href.substring(3);
    } else if (href.startsWith('./')) {
      prefix = './';
      cleanHref = href.substring(2);
    }
    
    // Handle #anchors
    var anchor = '';
    var hashIdx = cleanHref.indexOf('#');
    if (hashIdx !== -1) {
      anchor = cleanHref.substring(hashIdx);
      cleanHref = cleanHref.substring(0, hashIdx);
    }
    
    if (!cleanHref) return href;
    
    // Handle blog links
    if (cleanHref.startsWith('blog/')) {
      if (targetLang === 'fr' && !cleanHref.startsWith('blog/fr/')) {
        return prefix + 'blog/fr/' + cleanHref.substring(5) + anchor;
      }
      if (targetLang === 'en' && cleanHref.startsWith('blog/fr/')) {
        return prefix + 'blog/' + cleanHref.substring(8) + anchor;
      }
      return href;
    }
    
    // Handle main pages
    var mapping = PAGE_MAP[cleanHref];
    if (mapping) {
      var targetFile = mapping[targetLang];
      if (targetLang === 'fr') {
        return prefix + 'fr/' + targetFile + anchor;
      } else {
        return prefix + targetFile + anchor;
      }
    }
    
    return href;
  }
  
  /**
   * Initialize language switcher
   */
  function initLanguageSwitcher() {
    var currentLang = getCurrentLang();
    
    // Update active state on language links
    document.querySelectorAll('.language-switcher a, .language-switcher').forEach(function(el) {
      if (el.tagName === 'A') {
        var lang = el.getAttribute('data-lang');
        if (lang === currentLang) {
          el.classList.add('active');
        }
      }
    });
    
    // Add click handlers
    document.querySelectorAll('.language-switcher a[data-lang]').forEach(function(link) {
      link.addEventListener('click', function(e) {
        e.preventDefault();
        var targetLang = this.getAttribute('data-lang');
        switchLanguage(targetLang);
      });
    });
    
    // Auto-redirect suggestion for French browsers on first visit
    try {
      var hasPreference = localStorage.getItem('labwyze_lang');
      if (!hasPreference && currentLang === 'en' && 
          window.location.pathname === '/index.html' || window.location.pathname === '/') {
        var browserLang = navigator.language || navigator.userLanguage;
        if (browserLang && browserLang.toLowerCase().startsWith('fr')) {
          var lastPrompt = sessionStorage.getItem('labwyze_fr_prompted');
          if (!lastPrompt) {
            sessionStorage.setItem('labwyze_fr_prompted', '1');
            var confirmFR = confirm('Souhaitez-vous consulter ce site en français ?\n\nWould you like to view this site in French?');
            if (confirmFR) {
              switchLanguage('fr');
            }
          }
        }
      }
    } catch(e) {}
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
  } else {
    initLanguageSwitcher();
  }
  
  // Expose globally
  window.switchLanguage = switchLanguage;
  window.getEquivalentUrl = getEquivalentUrl;
  window.updateNavLinks = updateNavLinks;
})();