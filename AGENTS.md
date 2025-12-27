# @dayme/utils Development Rules

This document outlines the development rules and environment setup for contributors working on this project.

## Development Environment

- **Operating System**: Windows
- **Package Manager**: Bun
- **Build Tool**: Vite
- **Frontend Framework**: Vue 3
- **Styling**: TailwindCSS

## Project Structure

```
/
├── src/
│   └── package/           # Main library source code
│       ├── index.ts       # Main entry point with exports
│       ├── option/        # Option<T> type (Some/None)
│       ├── result/        # Result<T, E> type (Ok/Err)
│       ├── iterator/      # Iter<T> lazy iterator
│       ├── match/         # Match function for pattern matching
│       ├── dispatch/      # Type-based function overloading
│       ├── bimap/         # Bidirectional map
│       ├── stack/         # Stack<T> LIFO data structure
│       └── queue/         # Queue<T> FIFO data structure
│
├── tests/                # Test files using Bun test
│   ├── option.test.ts
│   ├── result.test.ts
│   ├── iterator.test.ts
│   ├── match.test.ts
│   ├── dispatch.test.ts
│   ├── bimap.test.ts
│   ├── stack.test.ts
│   └── queue.test.ts
│
├── app/
│   └── docs/           # Documentation site (Vue + Vite)
│       └── src/
│           ├── views/    # Documentation pages (Vue components)
│           ├── components/ # Reusable components
│           ├── layouts/   # Page layouts
│           └── router/    # Vue Router configuration
│
├── package.json
├── tsconfig.json
├── vite.config.ts
└── README.md
```

## Development Commands

### Core Development

```bash
# Install dependencies
bun install

# Build the library
bun run build

# Run tests
bun test

# Run tests in watch mode
bun test --watch

# Run linter
bun run lint
```

### Documentation Development

```bash
# Navigate to docs directory
cd app/docs

# Install docs dependencies (if not already installed)
bun install

# Start documentation dev server
bun run dev

# Build documentation
bun run build

# Preview documentation build
bun run preview
```

## Coding Standards

### TypeScript

- **Strict Mode**: Always use strict TypeScript types
- **No `any`**: Avoid using `any` type
- **Type Safety**: Leverage the library's own types (Option, Result, etc.)
- **Generics**: Use generics properly for reusable components
- **Export Type**: Export types alongside implementations

### Code Style

- **No Comments**: Do not add comments to the code (as per instructions)
- **Concise Code**: Keep implementations focused and minimal
- **Method Chaining**: Support method chaining where appropriate (e.g., `push()` returns `this`)
- **Option-based APIs**: Return `Option<T>` instead of `T | undefined` for methods that may fail
- **Iterable Protocol**: Implement `Iterable<T>` for data structures that work with Iter

### Naming Conventions

- **File Names**: PascalCase for components/types (e.g., `StackDocs.vue`, `Option.ts`)
- **Variable Names**: camelCase (e.g., `stack`, `queue`, `iter`)
- **Type Parameters**: Single capital letter (e.g., `T`, `E`, `K`, `V`)
- **Method Names**: camelCase (e.g., `push`, `pop`, `enqueue`, `dequeue`)
- **Component Files**: PascalCase with `Docs` suffix (e.g., `StackDocs.vue`)

## Library Design Principles

### Level 2 (Minimum Implementation)

All data structures must:
- Return `Option<T>` for operations that may fail (pop, dequeue, peek, etc.)
- Provide `size` property and `isEmpty()` method
- Implement `clear()` method
- Implement `Iterable<T>` protocol
- Have O(1) core operations
- Provide `static from<T>(iterable): Self` factory method

### Module Integration

- **Iter Integration**: All iterables must work seamlessly with `Iter.from()`
- **Option Integration**: Use Option for nullable returns
- **Result Integration**: Use Result for operations that can have errors (e.g., bounded queue)
- **Type Safety**: Never return `null` or `undefined` in public APIs

## Performance Guidelines

### Iter Optimizations

- **Single Pass**: Ensure operations don't create intermediate arrays
- **Early Termination**: Support early termination in `take()`, `find()`, `first()`
- **Fast Paths**: Detect typed arrays and use direct indexed access (3-5x faster)
- **Bit Mask**: Use bit masks for operation type checking (2-6x faster)
- **Map-Only Path**: Specialized loop for map-only chains (no filter checks)

### Data Structure Choices

- **Queue**: Use ring buffer (circular buffer) instead of two-stack or linked list
  - Better memory locality
  - O(1) operations for enqueue/dequeue
  - No `Array.shift()` which is O(n)
- **Stack**: Simple array-based is optimal
  - O(1) push/pop
  - Good memory locality
  - Fast iteration

### Lint Compliance

- **Typed Array Initialization**: Use `Array.from({ length: n })` instead of `new Array(n)` to avoid ambiguity
- **No Unused Variables**: Prefix unused variables with underscore `_`
- **Type Safety**: Handle `unknown` types in object access with helper functions or type guards

## Testing Guidelines

### Test Organization

- **File Naming**: `<module>.test.ts` (e.g., `stack.test.ts`)
- **Test Framework**: Bun test (built-in)
- **Coverage**: Aim for comprehensive coverage of all public APIs

### Test Categories

1. **Basic Operations**: Test fundamental functionality (push, pop, enqueue, dequeue)
2. **Edge Cases**: Test empty state, single element, boundary conditions
3. **Type Safety**: Test with different types (numbers, strings, objects, null, undefined)
4. **Iterable Protocol**: Test that structures work with `Iter.from()` and `for...of`
5. **Performance**: Test large datasets (e.g., 1000 elements)
6. **Complex Scenarios**: Test alternating operations, enqueue/dequeue with resize, etc.

### Test Assertions

- **Option Equality**: Use `expect(result).toEqual(new Some(value))` or `expect(result).toEqual(None.instance())`
- **Boolean Checks**: `expect(stack.isEmpty()).toBe(true/false)`
- **Size Checks**: `expect(stack.size).toBe(3)`
- **Iteration**: Test `Array.from(structure)` and `for...of` loops

## Documentation Guidelines

### Vue Components

- **Component Structure**: `<script setup lang="ts">` for composition API
- **Code Examples**: Use `CodeBlock` component for all code snippets
- **Sectioning**: Use `Section` component for major sections
- **Code Strings**: Define code examples as template variables in `<script setup>` section

### Code Example Format

```typescript
const methodNameCode = `// Brief description
const example = new Stack<number>();
example.push(1).push(2);
example.pop(); // Some(2)`
```

### Documentation Sections

Each module docs should include:
1. **Overview**: What is this module and when to use it
2. **Creating**: How to create instances (from arrays, empty, factory methods)
3. **API Documentation**: Each method with description and examples
4. **Performance**: Any performance notes or optimizations
5. **Integration**: How it works with other modules (Iter, Option, etc.)

### Color Coding

Use consistent colors for different modules:
- **Iter**: Pink
- **Option**: Blue
- **Result**: Green
- **Match**: Purple
- **Dispatch**: Orange
- **Bimap**: Cyan
- **Stack**: Rose
- **Queue**: Yellow

## Build Process

### Library Build

```bash
# Type check and build library
bun run build

# Output: dist/ directory with compiled JS and type definitions
```

### Documentation Build

```bash
cd app/docs
bun run build

# Output: app/docs/dist/ directory with static site
```

## Pre-Commit Workflow

### Before Committing

1. **Run Tests**: `bun test` - ensure all tests pass
2. **Build Library**: `bun run build` - ensure no TypeScript errors
3. **Lint Code**: `bun run lint` - ensure code style compliance
4. **Build Docs**: `cd app/docs && bun run build` - ensure docs build successfully

### Commit Message Format

```
<type>(<scope>): <description>

Examples:
feat(stack): add clear() method
fix(queue): resolve ring buffer resize issue
docs(iter): add typed arrays section
test(stack): add edge case tests
```

## Common Patterns

### Working with Iter

```typescript
// Good: Use Iter for complex transformations
Iter.from(array)
  .map(x => x * 2)
  .filter(x => x > 5)
  .collect();

// Bad: Create intermediate arrays
array
  .map(x => x * 2)
  .filter(x => x > 5);
```

### Working with Option

```typescript
// Good: Type-safe Option chaining
result.pop()
  .map(x => x * 2)
  .unwrapOr(0);

// Bad: Use undefined/default values
const value = result.pop();
return value !== undefined ? value * 2 : 0;
```

### Creating Static Factory Methods

```typescript
// Pattern for all data structures
export class Stack<T> implements Iterable<T> {
  private items: T[] = [];

  // ... other methods

  static from<T>(iterable: Iterable<T>): Stack<T> {
    const stack = new Stack<T>();
    for (const item of iterable) {
      stack.push(item);
    }
    return stack;
  }
}
```

## Troubleshooting

### Common Issues

**Issue**: "Type 'unknown[]' is not assignable to type '(T | undefined)[]'"
- **Solution**: Use type assertion `as (T | undefined)[]` when creating arrays with `Array.from()`

**Issue**: "Property 'push' does not exist on type 'void'"
- **Solution**: Ensure methods return `this` for chaining, or adjust API to not chain

**Issue**: "Object is possibly 'undefined'"
- **Solution**: Use `getColorClass(color)` helper function with default value, or add proper type guards

**Issue**: Tests failing with "Expected 3, received 4"
- **Solution**: Check if you're using 0-based or 1-based indexing consistently

### Performance Debugging

```bash
# Run specific test to debug performance
bun test tests/queue.test.ts

# Use console.log to track execution time
const start = Date.now();
// ... operation
const end = Date.now();
console.log(`Took: ${end - start}ms`);
```

## Environment-Specific Notes

### Windows

- **Paths**: Use forward slashes in import paths (`import from './file.ts'`)
- **Line Endings**: Ensure files use LF (Unix-style) line endings
- **File Case**: File names are case-sensitive (e.g., `Stack.ts` vs `stack.ts`)

### Bun

- **Test Runner**: Use `bun test` instead of `jest` or other runners
- **Speed**: Leverage Bun's fast execution for test files
- **Built-ins**: Use Bun's test assertions (`expect()`) and matchers

### Vite

- **Config**: Use `vite.config.ts` in project root for library
- **Library Mode**: Use library mode in `vite.config.ts` for proper builds
- **HMR**: Hot Module Replacement works automatically in dev mode

### Vue 3

- **Composition API**: Use `<script setup lang="ts">` for all components
- **Reactive State**: Use `ref` and `computed` from Vue
- **Router**: Use Vue Router 4 with programmatic routing

### TailwindCSS

- **Utility Classes**: Use Tailwind utility classes for styling
- **Config**: Located in `tailwind.config.js` (if custom config needed)
- **Responsive**: Use `sm:`, `md:`, `lg:` prefixes for responsive design

## Getting Started for New Contributors

1. **Clone Repository**: `git clone <repo-url>`
2. **Install Dependencies**: `bun install`
3. **Install Docs Dependencies**: `cd app/docs && npm install`
4. **Run Tests**: `bun test` to verify setup
5. **Start Dev**: Choose library dev or docs dev based on what you're working on
6. **Follow Guidelines**: Use this file for all code style and architectural decisions

## Module Development Checklist

When adding a new module (e.g., `Deque`, `HashMap`):

- [ ] Implement the module in `src/package/<module>/`
- [ ] Create comprehensive tests in `tests/<module>.test.ts`
- [ ] Add exports to `src/package/index.ts`
- [ ] Create documentation page in `app/docs/src/views/<Module>Docs.vue`
- [ ] Add route in `app/docs/src/router/index.ts`
- [ ] Update navigation in `app/docs/src/layouts/DocsLayout.vue`
- [ ] Add feature card to `app/docs/src/views/HomeView.vue`
- [ ] Run all tests: `bun test`
- [ ] Build library: `bun run build`
- [ ] Build docs: `cd app/docs && npm run build`
- [ ] Update README.md if needed
- [ ] Commit changes with proper message

## Important Reminders

1. **No Comments in Code**: The library code should not contain comments (as per project rules)
2. **Performance First**: Always consider performance implications of implementation choices
3. **Type Safety**: Leverage TypeScript for compile-time safety
4. **Test Coverage**: Aim for comprehensive test coverage of all public APIs
5. **Documentation First**: Update documentation alongside code changes
6. **Follow Existing Patterns**: Look at existing modules (Iter, Option, etc.) for patterns to follow
