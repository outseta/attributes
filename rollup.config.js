import { nodeResolve } from '@rollup/plugin-node-resolve';

export default {
  input: 'src/core.js',
  output: {
    file: 'dist/attributes.js',
    format: 'es',
    sourcemap: true,
    inlineDynamicImports: true
  },
  plugins: [nodeResolve()],
  external: ['Outseta'] // Keep Outseta as external dependency
};
