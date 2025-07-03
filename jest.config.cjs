/** @type {import('jest').Config} */
const config = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/src/setupTests.ts'],
  
  // Performance optimizations  
  maxWorkers: '50%', // Use half of available CPU cores
  cache: true,
  clearMocks: true,
  resetMocks: false,
  restoreMocks: false,
  
  // Parallel execution settings
  maxConcurrency: 5,
  
  // Transform configuration
  transform: {
    '^.+\\.tsx?$': [
      'ts-jest',
      {
        tsconfig: 'tsconfig.test.json',
        isolatedModules: true, // Faster compilation
      }
    ]
  },
  
  // Test file discovery
  roots: ['<rootDir>/src', '<rootDir>/tests'],
  testMatch: [
    '**/__tests__/**/*.ts',
    '**/__tests__/**/*.tsx',
    '**/?(*.)+(spec|test).ts',
    '**/?(*.)+(spec|test).tsx'
  ],
  
  // Coverage configuration
  collectCoverageFrom: [
    'src/**/*.ts', 
    'src/**/*.tsx', 
    '!src/**/*.d.ts', 
    '!src/**/index.ts'
  ],
  coverageDirectory: 'coverage',
  coverageReporters: ['text', 'lcov', 'html'],
  coverageThreshold: {
    global: {
      branches: 88,
      functions: 90,
      lines: 90,
      statements: 90
    }
  },
  
  // Module resolution
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/utils/(.*)$': '<rootDir>/src/utils/$1',
    '^@/types/(.*)$': '<rootDir>/src/types/$1',
    '^@/parser/(.*)$': '<rootDir>/src/parser/$1'
  },
  
  // Performance monitoring
  verbose: false, // Reduce console output for faster execution
  silent: false,
  
  // Default timeout
  testTimeout: 30000
};

module.exports = config;