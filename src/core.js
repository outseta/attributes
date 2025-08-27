// Core Attributes library - loads modules based on HTML attributes

(function() {
  'use strict';

  // Create the Attributes object first
  window.Attributes = {
    register: function(name, initFunction) {
      this.modules = this.modules || {};
      this.modules[name] = initFunction;
    }
  };

  // Find the script tag that loaded this library
  function findScriptTag() {
    // Try currentScript first (works during script execution)
    if (document.currentScript) {
      return document.currentScript;
    }
    
    // Fallback: find script by src attribute
    const scripts = document.querySelectorAll('script[src*="attributes.js"]');
    
    if (scripts.length > 0) {
      // Return the last one (most recently loaded)
      return scripts[scripts.length - 1];
    }
    
    return null;
  }

  // Initialize modules based on attributes
  function initModules() {
    const script = findScriptTag();
    if (!script) {
      return;
    }

    // Get all attributes that could be module names
    const attributes = Array.from(script.attributes);
    const moduleNames = attributes
      .map(attr => attr.name)
      .filter(name => name !== 'src' && name !== 'async' && name !== 'type' && name !== 'defer');

    // Load and initialize requested modules
    moduleNames.forEach(moduleName => {
      if (window.Attributes.modules && window.Attributes.modules[moduleName]) {
        try {
          window.Attributes.modules[moduleName]();
        } catch (error) {
          console.error(`Error initializing module '${moduleName}':`, error);
        }
      }
    });
  }

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModules);
  } else {
    initModules();
  }
})();

// Mark Complete module - handles lesson completion tracking
Attributes.register('mark-complete', function() {
  // Add CSS to hide buttons by default
  if (!document.getElementById('attributes-mark-complete-styles')) {
    const style = document.createElement('style');
    style.id = 'attributes-mark-complete-styles';
    style.textContent = `
      [data-o-lesson-action] {
        display: none;
      }
    `;
    document.head.appendChild(style);
  }

  Outseta.getUser().then(function(user) {
    const wrapper = document.querySelector('[data-o-lesson-id]');
    if (!wrapper) return;

    const lessonId = wrapper.getAttribute('data-o-lesson-id');
    const markBtn = wrapper.querySelector('[data-o-lesson-action="mark"]');
    const unmarkBtn = wrapper.querySelector('[data-o-lesson-action="unmark"]');

    // Get the property name from the wrapper or use default
    const propertyName = wrapper.getAttribute('data-o-property') || 'CompletedLessons';

    const data = JSON.parse(user[propertyName] || '[]');

    const setComplete = () => {
      if (markBtn) markBtn.style.display = 'none';
      if (unmarkBtn) unmarkBtn.style.display = 'inline-flex';
    };

    const unsetComplete = () => {
      if (markBtn) markBtn.style.display = 'inline-flex';
      if (unmarkBtn) unmarkBtn.style.display = 'none';
    };

    // Initial state
    if (data.includes(lessonId)) {
      setComplete();
    } else {
      unsetComplete();
    }

    // Mark complete
    markBtn?.addEventListener('click', () => {
      if (!data.includes(lessonId)) {
        data.push(lessonId);
        user.update({ [propertyName]: JSON.stringify(data) })
            .then(setComplete);
      }
    });

    // Unmark complete
    unmarkBtn?.addEventListener('click', () => {
      const idx = data.indexOf(lessonId);
      if (idx !== -1) {
        data.splice(idx, 1);
        user.update({ [propertyName]: JSON.stringify(data) })
            .then(unsetComplete);
      }
    });
  });
});
