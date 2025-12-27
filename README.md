# @dayme/alien-utils

TypeScript utility library with functional programming data structures (Option, Result, Iter, Stack, Queue, Bimap, Match, Dispatch).

## Installation

```bash
npm install @dayme/alien-utils
# or
bun add @dayme/alien-utils
# or
pnpm add @dayme/alien-utils
```

## Usage

```typescript
import { Option, Result, Iter, Stack, Queue } from "@dayme/alien-utils";

// Option - Handle nullable values
const maybeValue = Option.from("hello");
const doubled = maybeValue.map(s => s.length * 2); // Some(10)

// Result - Handle errors
const result = Result.ok(42);
const value = result.unwrapOr(0); // 42

// Iter - Lazy transformations
Iter.from([1, 2, 3])
  .map(x => x * 2)
  .filter(x => x > 3)
  .collect(); // [4, 6]

// Stack - LIFO
const stack = new Stack<number>();
stack.push(1).push(2);
stack.pop(); // Some(2)

// Queue - FIFO
const queue = new Queue<number>();
queue.enqueue(1).enqueue(2);
queue.dequeue(); // Some(1)
```

## Documentation

**[View Documentation](https://lisovskiyivan.github.io/alien-utils/)**

## Development

```bash
# Install dependencies
bun install

# Build library
bun run build

# Watch mode (TypeScript + Vite)
bun run dev

# Run tests
bun test

# Run tests in watch mode
bun test --watch

# Playground for testing the package
# First build the package: bun run build
# Then run playground: bun run playground
bun run playground

# Development documentation
bun run docs:dev

# Build documentation
bun run docs:build

# Preview documentation
bun run docs:preview
```

## Testing

Tests are written using Bun's built-in test framework:

```bash
# Run all tests
bun test

# Run tests in watch mode
bun test --watch
```

Tests cover all methods of `Option` (Some/None), `Result` (Ok/Err), and other classes, including practical usage examples.

## License

MIT
