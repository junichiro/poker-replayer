module.exports = {
  plugins: {
    // Auto-prefix CSS for better browser compatibility
    autoprefixer: {},
    // Optimize CSS for production
    'postcss-preset-env': {
      stage: 1,
      features: {
        'nesting-rules': true,
        'custom-properties': true,
        'color-function': true,
      },
    },
    // Remove unused CSS (helpful for tree shaking CSS)
    ...(process.env.NODE_ENV === 'production' && {
      cssnano: {
        preset: ['default', {
          discardComments: {
            removeAll: true,
          },
          minifySelectors: true,
          minifyParams: true,
          normalizeWhitespace: true,
          discardUnused: false, // Keep false for library builds
        }],
      },
    }),
  },
};