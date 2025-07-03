import { fileURLToPath, URL } from 'node:url';

import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';
import dts from 'vite-plugin-dts';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';

  return {
    optimizeDeps: {
      // Stabilized in Vite 7.0 - skip automatic dependency discovery for faster builds
      noDiscovery: true,
      include: ['react', 'react-dom', 'lucide-react'],
    },
    plugins: [
      react({
        // Optimize React for production builds
        jsxRuntime: 'automatic',
      }),
      dts({
        tsconfigPath: './tsconfig.build.json',
        include: ['src/**/*'],
        exclude: ['src/**/*.test.*', 'src/**/*.spec.*'],
        insertTypesEntry: true,
        copyDtsFiles: false,
        rollupTypes: true,
        // Generate a single declaration file for better compatibility
        outDir: 'dist',
        entryRoot: 'src',
        // Better type generation for dual packages
        respectExternal: true,
      }),
    ],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        '@/components': fileURLToPath(new URL('./src/components', import.meta.url)),
        '@/utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
        '@/types': fileURLToPath(new URL('./src/types', import.meta.url)),
        '@/parser': fileURLToPath(new URL('./src/parser', import.meta.url)),
      },
    },
    css: {
      // PostCSS processing for CSS optimization
      postcss: {},
      // CSS code splitting - inline for library builds
      modules: false,
      // Enable parallel CSS preprocessing (Vite 7.0 feature)
      preprocessorMaxWorkers: true,
    },
    build: {
      lib: {
        entry: fileURLToPath(new URL('src/index.ts', import.meta.url)),
        name: 'PokerHandReplay',
      },
      rollupOptions: {
        external: ['react', 'react-dom', 'react/jsx-runtime'],
        output: [
          {
            // ESM build
            format: 'es',
            entryFileNames: 'index.esm.js',
            // Optimize for smaller bundles
            compact: true,
            // Ensure proper ESM exports
            exports: 'named',
          },
          {
            // CommonJS build
            format: 'cjs',
            entryFileNames: 'index.cjs.js',
            // Optimize for smaller bundles
            compact: true,
            // Ensure proper CJS exports
            exports: 'named',
            // Add interop helpers for better compatibility
            interop: 'auto',
          },
        ],
        // Enhanced tree shaking configuration
        treeshake: {
          moduleSideEffects: false,
          propertyReadSideEffects: false,
          tryCatchDeoptimization: false,
        },
      },
      // Production optimizations
      sourcemap: true,
      emptyOutDir: true,
      minify: isProduction ? 'terser' : false,
      target: 'baseline-widely-available',
      // Optimize bundle size in production
      ...(isProduction && {
        terserOptions: {
          compress: {
            drop_console: true,
            drop_debugger: true,
            pure_funcs: ['console.log', 'console.warn'],
            passes: 2,
          },
          mangle: {
            properties: {
              regex: /^_/,
            },
          },
          format: {
            comments: false,
          },
        },
      }),
      // Rollup-specific optimizations
      chunkSizeWarningLimit: 100,
    },
    // Development optimizations
    esbuild: {
      target: 'es2022',
      keepNames: false,
      minifyIdentifiers: true,
      minifySyntax: true,
    },
  };
});
