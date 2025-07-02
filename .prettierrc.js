/**
 * Prettier configuration for consistent code formatting
 * @see https://prettier.io/docs/en/configuration.html
 */
module.exports = {
  // Basic formatting options
  semi: true,
  trailingComma: 'es5',
  singleQuote: true,

  // Indentation and wrapping
  tabWidth: 2,
  useTabs: false,
  printWidth: 100,

  // JSX specific options
  jsxSingleQuote: false,
  jsxBracketSameLine: false,

  // Array and object formatting
  bracketSpacing: true,
  arrowParens: 'avoid',

  // End of line handling
  endOfLine: 'lf',

  // File patterns to format
  overrides: [
    {
      files: '*.{ts,tsx}',
      options: {
        parser: 'typescript',
      },
    },
    {
      files: '*.{js,jsx}',
      options: {
        parser: 'babel',
      },
    },
    {
      files: '*.json',
      options: {
        parser: 'json',
        tabWidth: 2,
      },
    },
    {
      files: '*.md',
      options: {
        parser: 'markdown',
        printWidth: 80,
        proseWrap: 'always',
      },
    },
    {
      files: '*.{yaml,yml}',
      options: {
        parser: 'yaml',
        tabWidth: 2,
      },
    },
  ],
};
