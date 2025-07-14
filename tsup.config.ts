import { defineConfig } from 'tsup';

export default defineConfig([
  // Main entries
  {
    entry: {
      index: 'src/index.ts',
      loader: 'src/loader.ts',
      plugin: 'src/plugin.ts',
      vite: 'src/vite.ts',
      next: 'src/next.ts',
      'universal-plugin': 'src/universal-plugin.ts',
      'auto-setup': 'src/auto-setup.ts',
      templates: 'src/templates.ts',
    },
    format: ['esm'],
    dts: true,
    clean: true,
    splitting: false,
    sourcemap: true,
    target: 'es2022',
    platform: 'node',
  },
  // CLI entry with shebang
  {
    entry: {
      cli: 'src/cli.ts',
    },
    format: ['cjs'],
    dts: true,
    splitting: false,
    sourcemap: true,
    target: 'es2022',
    platform: 'node',
    banner: {
      js: '#!/usr/bin/env node',
    },
  },
]);
