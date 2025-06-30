import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dts from 'vite-plugin-dts';
import { resolve } from 'path';

export default defineConfig(({ mode }) => {
  const isProduction = mode === 'production';
  
  return {
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
    }),
  ],
  resolve: {
    alias: {
      '@': resolve(__dirname, './src'),
      '@/components': resolve(__dirname, './src/components'),
      '@/utils': resolve(__dirname, './src/utils'),
      '@/types': resolve(__dirname, './src/types'),
      '@/parser': resolve(__dirname, './src/parser'),
    },
  },
  css: {
    // PostCSS processing for CSS optimization
    postcss: {},
    // CSS code splitting - inline for library builds
    modules: false,
  },
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.ts'),
      name: 'PokerHandReplay',
      formats: ['es', 'cjs'],
      fileName: (format) => `index.${format === 'es' ? 'esm' : format}.js`,
    },
    rollupOptions: {
      external: ['react', 'react-dom', 'react/jsx-runtime'],
      output: {
        globals: {
          react: 'React',
          'react-dom': 'ReactDOM',
          'react/jsx-runtime': 'React',
        },
        // Optimize chunk splitting for better tree shaking
        manualChunks: undefined,
        // Preserve module structure for better tree shaking
        preserveModules: false,
        // Optimize for smaller bundles
        compact: true,
      },
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
    target: 'es2020',
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
    target: 'es2020',
    keepNames: false,
    minifyIdentifiers: true,
    minifySyntax: true,
  },
  };
});