/**
 * Navigation Link Translator
 * Automatically rewrites internal links to point to the same page in the current language
 * Works on both EN and FR pages
 */

(function() {
  'use strict';
  
  // Same page map as language-switcher.js
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
  
  function getCurrentLang() {
    var path = window.location.pathname;
    if (path.indexOf('/fr/') !== -1 || path.indexOf('/blog/fr/') !== -1) {
      return 'fr';
    }
    return 'en';
  }
  
  function getBasePrefix() {
    var path = window.location.pathname;
    // If in /fr/ or /blog/fr/, we need ../ prefix for sibling pages
    if (path.indexOf('/fr/') !== -1) {
      // Count /fr/ occurrences
      var frCount = (path.match(/\/fr\//g) || []).length;
      if (frCount > 0) return '../'.repeat(frCount);
    }
    return '';
  }
  
  function rewriteLink(href, targetLang, basePrefix) {
    if (!href) return href;
    
    // Skip external, anchor-only, mailto, tel
    if (href.startsWith('#') || href.startsWith('http') || 
        href.startsWith('mailto:') || href.startsWith('tel:') ||
        href.startsWith('//') || href.startsWith('javascript:')) {
      return href;
    }
    
    // Extract prefix (../) from original href
    var prefixMatch = href.match(/^(\.\.\/)*/);
    var originalPrefix = prefixMatch ? prefixMatch[0] : '';
    var cleanHref = href.substring(originalPrefix.length);
    
    // Extract anchor
    var anchor = '';
    var hashIdx = cleanHref.indexOf('#');
    if (hashIdx !== -1) {
      anchor = cleanHref.substring(hashIdx);
      cleanHref = cleanHref.substring(0, hashIdx);
    }
    
    if (!cleanHref) return href;
    
    // Blog posts: blog/xxx.html <-> blog/fr/xxx.html
    if (cleanHref.startsWith('blog/')) {
      if (targetLang === 'fr' && !cleanHref.startsWith('blog/fr/')) {
        return originalPrefix + 'blog/fr/' + cleanHref.substring(5) + anchor;
      }
      if (targetLang === 'en' && cleanHref.startsWith('blog/fr/')) {
        return originalPrefix + 'blog/' + cleanHref.substring(8) + anchor;
      }
      return href;
    }
    
    // Main pages
    if (PAGE_MAP[cleanHref]) {
      var targetFile = PAGE_MAP[cleanHref][targetLang];
      // Compute correct prefix based on target location
      var newPrefix = '';
      if (targetLang === 'fr' && !originalPrefix.includes('../')) {
        // Going from root to /fr/ - need to add ../
        // But only if current page is in root
        var path = window.location.pathname;
        if (!path.includes('/fr/') && !path.includes('/blog/')) {
          // Current page is in root, going to fr/ - no prefix needed from /fr/ perspective
          // But fr/ pages use ../ to reference root assets
          // For navigation TO fr/ page from root, the href should be 'fr/index.html'
          // However we're computing FROM root perspective, so:
          newPrefix = 'fr/';
          return newPrefix + targetFile.split('/').pop() + anchor;
        }
      }
      return originalPrefix + targetFile + anchor;
    }
    
    return href;
  }
  
  function rewriteAllLinks() {
    var lang = getCurrentLang();
    var links = document.querySelectorAll('a[href]');
    var count = 0;
    
    links.forEach(function(link) {
      // Skip language switcher itself
      if (link.closest('.language-switcher')) return;
      
      var href = link.getAttribute('href');
      if (!href) return;
      
      var newHref = rewriteLink(href, lang);
      if (newHref !== href) {
        link.setAttribute('href', newHref);
        count++;
      }
    });
    
    if (count > 0 && window.console) {
      console.log('[Labwyze i18n] Rewrote ' + count + ' navigation links for language: ' + lang);
    }
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', rewriteAllLinks);
  } else {
    rewriteAllLinks();
  }
})();