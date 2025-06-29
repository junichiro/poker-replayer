# TypeScript Configuration Guide

This project uses a sophisticated TypeScript configuration setup with multiple specialized configurations for different environments and use cases.

## Configuration Files Overview

### `tsconfig.base.json` - Base Configuration
The foundation configuration that defines core TypeScript settings shared across all environments:

- **Strict Type Checking**: Enabled all strict mode options for maximum type safety
- **Path Aliases**: Configured `@/*` aliases for cleaner imports
- **Advanced Type Checking**: Includes `noUncheckedIndexedAccess`, `exactOptionalPropertyTypes`
- **Modern JavaScript Target**: ES2020 with DOM libraries
- **Module System**: ESNext modules with Node.js resolution

### `tsconfig.json` - Main Configuration
The default configuration used by IDEs and development tools:

- Extends base configuration
- Configured for development with `noEmit: true`
- Uses project references for composite builds
- Enables incremental compilation for performance

### `tsconfig.build.json` - Build Configuration
Optimized for production library builds:

- Generates declaration files and source maps
- Optimized for library distribution
- Removes comments and internal APIs
- Outputs to `dist/` directory
- Used by Vite for building the package

### `tsconfig.dev.json` - Development Configuration
Optimized for development experience:

- Fast compilation with relaxed unused variable checking
- Enhanced debugging with inline sources
- Incremental compilation for faster rebuilds
- Includes test files for development

### `tsconfig.test.json` - Test Configuration
Specialized for Jest testing environment:

- CommonJS modules for Jest compatibility
- Includes Jest type definitions
- Allows test files and utilities
- Optimized for test environments

## Path Aliases

All configurations support the following path aliases:

```typescript
import { Component } from '@/components/Component';     // src/components/Component
import { utility } from '@/utils/utility';             // src/utils/utility
import { Type } from '@/types/Type';                   // src/types/Type
import { Parser } from '@/parser/Parser';              // src/parser/Parser
```

## Development Workflow

### Type Checking Commands

```bash
# Check all files (default configuration)
npm run typecheck

# Check build configuration
npm run typecheck:build

# Check test configuration  
npm run typecheck:test
```

### IDE Configuration

Your IDE should automatically use the main `tsconfig.json` which is optimized for development with:

- Fast incremental compilation
- Enhanced error reporting
- Support for path aliases
- Integration with project references

### Build Process

When building the library, Vite uses `tsconfig.build.json` which:

- Generates optimized JavaScript output
- Creates TypeScript declaration files
- Includes source maps for debugging
- Removes development-only code

### Testing

Jest is configured to use `tsconfig.test.json` which:

- Supports CommonJS modules for Jest compatibility
- Includes test-specific type definitions
- Enables path alias resolution in tests
- Allows testing utilities and mocks

## Strict Type Checking

This project uses strict TypeScript settings for maximum type safety:

### Enabled Strict Options

- `strict: true` - Enables all strict type checking options
- `noImplicitAny: true` - Error on expressions with implied `any` type
- `noImplicitReturns: true` - Error when function doesn't return a value
- `noImplicitThis: true` - Error on `this` expressions with implied `any`
- `noImplicitOverride: true` - Ensures override modifier on overridden methods
- `noUncheckedIndexedAccess: true` - Include `undefined` in index signature results
- `noUnusedLocals: true` - Error on unused local variables
- `noUnusedParameters: true` - Error on unused parameters
- `exactOptionalPropertyTypes: true` - Exact optional property types

### Type Safety Features

- Consistent file naming enforcement
- Isolated modules for better tree-shaking
- Comprehensive library type definitions
- Enhanced null safety checks

## Performance Optimizations

### Incremental Compilation

All configurations use incremental compilation:

- Build information cached in `.tsbuildinfo` files
- Faster subsequent builds
- Reduced compilation time during development

### Selective Compilation

- Separate configurations avoid unnecessary compilation
- Build-only files excluded from development checks
- Test files excluded from production builds

### Skip Library Checks

- `skipLibCheck: true` for faster compilation
- Assumes library types are correct
- Focuses type checking on project code

## Integration with Build Tools

### Vite Integration

- Uses `tsconfig.build.json` for library builds
- Supports path aliases in bundling
- Generates TypeScript declaration files
- Creates source maps for debugging

### Jest Integration

- Custom TypeScript configuration for tests
- Path alias resolution in test files
- Support for TypeScript in test utilities
- Proper module resolution for testing

### ESLint Integration

ESLint automatically uses the appropriate TypeScript configuration:

- Parses TypeScript with project references
- Supports path aliases in linting rules
- Integrates with TypeScript type information

## Best Practices

### Import Conventions

Use path aliases for internal imports:

```typescript
// ✅ Good - using path aliases
import { PokerHandReplay } from '@/components/PokerHandReplay';
import { useRetry } from '@/utils/retry';
import { PokerHand } from '@/types';

// ❌ Bad - relative imports
import { PokerHandReplay } from '../components/PokerHandReplay';
import { useRetry } from '../../utils/retry';
```

### Type Definitions

Define comprehensive types for all public APIs:

```typescript
// ✅ Good - explicit types
interface Props {
  handHistory: string;
  onActionChange?: (action: Action, index: number) => void;
}

// ❌ Bad - implicit any
function component(props) {
  // TypeScript can't infer prop types
}
```

### Error Handling

Use type guards for unknown data:

```typescript
// ✅ Good - type guard
function isParserError(error: unknown): error is ParserError {
  return typeof error === 'object' && error !== null && 'line' in error;
}

// Usage
if (isParserError(unknownError)) {
  console.log(unknownError.line); // Type-safe access
}
```

## Troubleshooting

### Common Issues

1. **Path alias not resolving**: Ensure the alias is defined in all relevant configs
2. **Test files not compiling**: Check `tsconfig.test.json` includes the test files
3. **Build errors**: Use `npm run typecheck:build` to check build-specific issues
4. **IDE not recognizing types**: Restart TypeScript service in your IDE

### Debug Commands

```bash
# Show TypeScript compiler configuration
npx tsc --showConfig

# Show configuration for build
npx tsc --showConfig --project tsconfig.build.json

# Trace module resolution
npx tsc --traceResolution --noEmit
```

## Maintenance

### Updating TypeScript

When updating TypeScript versions:

1. Update `typescript` package in `devDependencies`
2. Check for new compiler options in [TypeScript releases](https://www.typescriptlang.org/docs/handbook/release-notes/overview.html)
3. Run all type checking commands to ensure compatibility
4. Update this documentation if configurations change

### Configuration Changes

When modifying TypeScript configurations:

1. Test all environments: development, build, and test
2. Verify IDE integration still works
3. Check that build output remains correct
4. Update documentation and examples