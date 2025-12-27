# @dayme/utils

TypeScript utility library with functional programming data structures (Option, Result, Iter, Stack, Queue, Bimap, Match, Dispatch).

## Installation

```bash
npm install @dayme/utils
# or
bun add @dayme/utils
# or
pnpm add @dayme/utils
```

## Usage

```typescript
import { Option, Result, Iter, Stack, Queue } from "@dayme/utils";

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

# Запустить тесты
bun run test

# Запустить тесты в watch mode
bun run test:watch

# Playground для тестирования пакета
# Сначала соберите пакет: bun run build
# Затем запустите playground: bun run playground
bun run playground

# Development documentation
bun run docs:dev

# Build documentation
bun run docs:build

# Preview documentation
bun run docs:preview
```

## Testing

Тесты написаны с использованием встроенного тестового фреймворка Bun:

```bash
# Запустить все тесты
bun run test

# Запустить тесты в watch mode
bun run test:watch
```

Тесты покрывают все методы классов `Option` (Some/None) и `Result` (Ok/Err), включая практические примеры использования.

## Documentation

Documentation is available in `app/docs` directory. To view it locally:

```bash
bun run docs:dev
```

## License

MIT
