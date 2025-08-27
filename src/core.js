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

  // Module registry
  const modules = {};

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

  // Import modules after Attributes object is created
  import('./modules/mark-complete.js').then(() => {
    // Auto-initialize when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initModules);
    } else {
      initModules();
    }
  }).catch(error => {
    console.error('Error loading modules:', error);
  });
})();
