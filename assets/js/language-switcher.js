/**
 * Language Switcher for Labwyze
 * Handles language preference and URL redirection
 */

(function() {
  'use strict';
  
  // Detect current language from URL
  function getCurrentLang() {
    const path = window.location.pathname;
    if (path.startsWith('/fr/')) {
      return 'fr';
    }
    return 'en';
  }
  
  // Set language preference in localStorage
  function setLanguagePreference(lang) {
    localStorage.setItem('labwyze_lang', lang);
  }
  
  // Get stored language preference
  function getLanguagePreference() {
    return localStorage.getItem('labwyze_lang') || 'en';
  }
  
  // Switch to another language
  function switchLanguage(targetLang) {
    const currentPath = window.location.pathname;
    const currentLang = getCurrentLang();
    
    if (currentLang === targetLang) {
      return; // Already on target language
    }
    
    let newPath;
    if (targetLang === 'fr') {
      // Switching to French
      if (currentPath === '/' || currentPath === '/index.html') {
        newPath = '/fr/index.html';
      } else if (currentPath.startsWith('/blog/')) {
        newPath = currentPath.replace('/blog/', '/blog/fr/');
      } else if (currentPath.endsWith('.html')) {
        newPath = '/fr' + currentPath;
      } else {
        newPath = '/fr/' + currentPath.replace(/^\//, '') + 'index.html';
      }
    } else {
      // Switching to English
      if (currentPath.startsWith('/fr/')) {
        newPath = currentPath.replace('/fr/', '/');
      } else if (currentPath.startsWith('/blog/fr/')) {
        newPath = currentPath.replace('/blog/fr/', '/blog/');
      }
    }
    
    // Save preference and redirect
    setLanguagePreference(targetLang);
    window.location.href = newPath;
  }
  
  // Initialize language switcher on page load
  function initLanguageSwitcher() {
    const currentLang = getCurrentLang();
    
    // Update active state on language links
    document.querySelectorAll('.language-switcher a').forEach(function(link) {
      const lang = link.getAttribute('data-lang');
      if (lang === currentLang) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
      
      // Add click handler
      link.addEventListener('click', function(e) {
        e.preventDefault();
        const targetLang = this.getAttribute('data-lang');
        switchLanguage(targetLang);
      });
    });
    
    // Auto-redirect based on browser language for first-time visitors
    const hasPreference = localStorage.getItem('labwyze_lang');
    if (!hasPreference && getCurrentLang() === 'en') {
      const browserLang = navigator.language || navigator.userLanguage;
      if (browserLang && browserLang.startsWith('fr')) {
        // Suggest French to French browser users
        const confirmFR = confirm('Souhaitez-vous consulter ce site en français ?\n\nWould you like to view this site in French?');
        if (confirmFR) {
          switchLanguage('fr');
        }
      }
    }
  }
  
  // Run on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initLanguageSwitcher);
  } else {
    initLanguageSwitcher();
  }
  
  // Expose switchLanguage globally for manual triggers
  window.switchLanguage = switchLanguage;
})();
