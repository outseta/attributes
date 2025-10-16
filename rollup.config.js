import { nodeResolve } from '@rollup/plugin-node-resolve';
import { glob } from 'glob';
import path from 'path';

// Dynamically find all modules
const moduleFiles = glob.sync('src/modules/*.js');
const moduleEntries = {};

// Add core entry
moduleEntries['core'] = 'src/core.js';

// Add module entries
moduleFiles.forEach(file => {
  const moduleName = path.basename(file, '.js');
  moduleEntries[`modules/${moduleName}`] = file;
});

export default {
  input: moduleEntries,
  output: {
    dir: 'dist',
    format: 'es',
    sourcemap: true,
    entryFileNames: '[name].js'
  },
  plugins: [nodeResolve()],
  external: ['Outseta'] // Keep Outseta as external dependency
};
