# @dayme/utils

Utility functions library built with TypeScript, Vite, and Bun.

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
import { exampleUtil, isDefined } from "@dayme/utils";

const result = exampleUtil("hello");
console.log(result); // "HELLO"

if (isDefined(value)) {
  // value is now typed as non-nullable
}
```

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
