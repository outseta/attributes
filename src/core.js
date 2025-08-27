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

  // Initialize modules based on attributes
  function initModules() {
    const script = document.currentScript;
    if (!script) return;

    // Get all attributes that start with our prefix
    const attributes = Array.from(script.attributes);
    const moduleNames = attributes
      .map(attr => attr.name)
      .filter(name => name.startsWith('o-') || name === 'o')
      .map(name => name.replace('o-', ''));

    // Load and initialize requested modules
    moduleNames.forEach(moduleName => {
      if (window.Attributes.modules && window.Attributes.modules[moduleName]) {
        try {
          window.Attributes.modules[moduleName]();
        } catch (error) {
          console.error(`Error initializing module '${moduleName}':`, error);
        }
      } else {
        console.warn(`Module '${moduleName}' not found`);
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

    const data = JSON.parse(user.CompletedLessons || '[]');

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
        user.update({ CompletedLessons: JSON.stringify(data) })
            .then(setComplete);
      }
    });

    // Unmark complete
    unmarkBtn?.addEventListener('click', () => {
      const idx = data.indexOf(lessonId);
      if (idx !== -1) {
        data.splice(idx, 1);
        user.update({ CompletedLessons: JSON.stringify(data) })
            .then(unsetComplete);
      }
    });
  });
});
