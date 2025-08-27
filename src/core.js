// Core Attributes library - loads modules based on HTML attributes
import './modules/mark-complete.js';

(function() {
  'use strict';

  // Module registry
  const modules = {};

  // Register a module
  function registerModule(name, initFunction) {
    modules[name] = initFunction;
  }

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
      if (modules[moduleName]) {
        try {
          modules[moduleName]();
        } catch (error) {
          console.error(`Error initializing module '${moduleName}':`, error);
        }
      } else {
        console.warn(`Module '${moduleName}' not found`);
      }
    });
  }

  // Export the register function for modules
  window.Attributes = {
    register: registerModule
  };

  // Auto-initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initModules);
  } else {
    initModules();
  }
})();
