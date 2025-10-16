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

  // Import modules after Attributes object is created
  import('./modules/course.js').then(() => {
    // Find the script tag that loaded this library
    function findScriptTag() {
      // Try currentScript first (works during script execution)
      if (document.currentScript) {
        return document.currentScript;
      }
      
      // Fallback: find script by src attribute (look for core.js)
      const scripts = document.querySelectorAll('script[src*="core.js"]');
      
      if (scripts.length > 0) {
        // Return the last one (most recently loaded)
        return scripts[scripts.length - 1];
      }
      
      // Additional fallback: look for any script with our modules as attributes
      const allScripts = document.querySelectorAll('script');
      for (let script of allScripts) {
        const hasModuleAttribute = Array.from(script.attributes).some(attr => 
          attr.name !== 'src' && 
          attr.name !== 'async' && 
          attr.name !== 'type' && 
          attr.name !== 'defer' &&
          (attr.name === 'o-course' || attr.name === 'form-validator' || attr.name === 'user-tracking')
        );
        
        if (hasModuleAttribute) {
          console.log('Found script via attribute detection:', script.src);
          return script;
        }
      }
      
      return null;
    }

    // Initialize modules based on attributes
    function initModules() {
      const script = findScriptTag();
      if (!script) {
        console.error('Could not find script tag for Attributes library');
        return;
      }

      // Get all attributes that could be module names
      const attributes = Array.from(script.attributes);
      const moduleNames = attributes
        .map(attr => attr.name)
        .filter(name => name !== 'src' && name !== 'async' && name !== 'type' && name !== 'defer');

      console.log('Detected modules to load:', moduleNames);

      // Load and initialize requested modules
      moduleNames.forEach(moduleName => {
        if (window.Attributes.modules && window.Attributes.modules[moduleName]) {
          try {
            console.log(`Initializing module: ${moduleName}`);
            window.Attributes.modules[moduleName]();
          } catch (error) {
            console.error(`Error initializing module '${moduleName}':`, error);
          }
        } else {
          console.error(`Module '${moduleName}' not found`);
        }
      });
    }

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

