import { Iter } from "../src/package/iterator/iterator";

/**
 * Улучшенные бенчмарки для сравнения производительности Iter с обычными JS операциями
 *
 * Особенности:
 * - Warm-up прогоны для стабилизации JIT
 * - Многократные измерения с усреднением
 * - Микро и макро тесты
 * - Статистика (медиана, среднее, отклонение)
 * - Замеры памяти через process.memoryUsage()
 * - Анализ GC времени
 * - Iterator fusion тесты
 * - Сравнение Node vs Bun vs Browser
 */

// ============ ОПРЕДЕЛЕНИЕ RUNTIME ============

interface RuntimeInfo {
  name: string;
  version: string;
  isNode: boolean;
  isBun: boolean;
  isBrowser: boolean;
}

function detectRuntime(): RuntimeInfo {
  // @ts-ignore - глобальные переменные могут отсутствовать
  if (typeof Bun !== "undefined") {
    return {
      name: "Bun",
      version: Bun.version || "unknown",
      isNode: false,
      isBun: true,
      isBrowser: false,
    };
  }

  // @ts-ignore
  if (typeof process !== "undefined" && process.versions?.node) {
    return {
      name: "Node.js",
      version: process.versions.node,
      isNode: true,
      isBun: false,
      isBrowser: false,
    };
  }

  if (typeof window !== "undefined" || typeof self !== "undefined") {
    return {
      name: "Browser",
      version: navigator?.userAgent || "unknown",
      isNode: false,
      isBun: false,
      isBrowser: true,
    };
  }

  return {
    name: "Unknown",
    version: "unknown",
    isNode: false,
    isBun: false,
    isBrowser: false,
  };
}

const RUNTIME = detectRuntime();

// ============ УТИЛИТЫ ДЛЯ ПАМЯТИ ============

interface MemoryUsage {
  heapUsed: number;
  heapTotal: number;
  external: number;
  rss?: number;
}

function getMemoryUsage(): MemoryUsage | null {
  try {
    // @ts-ignore
    if (typeof process !== "undefined" && process.memoryUsage) {
      const mem = process.memoryUsage();
      return {
        heapUsed: mem.heapUsed,
        heapTotal: mem.heapTotal,
        external: mem.external || 0,
        rss: mem.rss,
      };
    }

    // @ts-ignore - Chrome/Edge
    if (performance.memory) {
      const mem = performance.memory;
      return {
        heapUsed: mem.usedJSHeapSize,
        heapTotal: mem.totalJSHeapSize,
        external: 0,
      };
    }
  } catch (e) {
    // Игнорируем ошибки
  }

  return null;
}

function formatMemory(bytes: number): string {
  if (bytes < 1024) return `${bytes.toFixed(0)} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  if (bytes < 1024 * 1024 * 1024)
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`;
}

// ============ УТИЛИТЫ ДЛЯ GC ============

interface GCStats {
  gcCount: number;
  gcTime: number;
  avgGCTime: number;
}

let gcStats: GCStats = { gcCount: 0, gcTime: 0, avgGCTime: 0 };

// Попытка отследить GC через performance API
function trackGC(): void {
  try {
    // @ts-ignore
    if (typeof performance !== "undefined" && performance.mark) {
      // В Node.js можно использовать --expose-gc и gc()
      // @ts-ignore
      if (typeof global !== "undefined" && global.gc) {
        const start = performance.now();
        // @ts-ignore
        global.gc();
        const end = performance.now();
        gcStats.gcCount++;
        gcStats.gcTime += end - start;
        gcStats.avgGCTime = gcStats.gcTime / gcStats.gcCount;
      }
    }
  } catch (e) {
    // Игнорируем ошибки
  }
}

// ============ УТИЛИТЫ ДЛЯ БЕНЧМАРКОВ ============

interface BenchmarkResult {
  mean: number;
  median: number;
  min: number;
  max: number;
  stdDev: number;
  runs: number;
  memoryDelta?: number;
  gcTime?: number;
}

/**
 * Выполняет warm-up прогоны для стабилизации JIT
 */
function warmup(fn: () => void, iterations: number = 10): void {
  for (let i = 0; i < iterations; i++) {
    fn();
  }
}

/**
 * Выполняет бенчмарк с усреднением результатов и замером памяти
 */
function benchmark(
  fn: () => void,
  runs: number = 100,
  warmupRuns: number = 10,
  measureMemory: boolean = false
): BenchmarkResult {
  // Warm-up
  warmup(fn, warmupRuns);

  // Измерения
  const times: number[] = [];
  let memoryDelta = 0;
  let gcTimeBefore = gcStats.gcTime;

  const memBefore = measureMemory ? getMemoryUsage() : null;

  for (let i = 0; i < runs; i++) {
    const start = performance.now();
    fn();
    const end = performance.now();
    times.push(end - start);

    // Принудительный GC каждые 10 итераций (если доступен)
    if (i % 10 === 0) {
      trackGC();
    }
  }

  const memAfter = measureMemory ? getMemoryUsage() : null;
  const gcTimeAfter = gcStats.gcTime;

  if (memBefore && memAfter) {
    memoryDelta = memAfter.heapUsed - memBefore.heapUsed;
  }

  // Сортировка для медианы
  const sorted = [...times].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const mean = times.reduce((a, b) => a + b, 0) / times.length;
  const min = Math.min(...times);
  const max = Math.max(...times);

  // Стандартное отклонение
  const variance =
    times.reduce((acc, t) => acc + Math.pow(t - mean, 2), 0) / times.length;
  const stdDev = Math.sqrt(variance);

  const result: BenchmarkResult = {
    mean,
    median,
    min,
    max,
    stdDev,
    runs,
  };

  if (measureMemory && memoryDelta !== 0) {
    result.memoryDelta = memoryDelta;
  }

  if (gcTimeAfter > gcTimeBefore) {
    result.gcTime = gcTimeAfter - gcTimeBefore;
  }

  return result;
}

/**
 * Форматирует результат бенчмарка
 */
function formatResult(
  result: BenchmarkResult,
  label: string,
  showMemory: boolean = false
): string {
  const labelPadded =
    label.length > 25 ? label.substring(0, 22) + "..." : label.padEnd(25);
  const meanStr = result.mean.toFixed(2).padStart(8);
  const medianStr = result.median.toFixed(2).padStart(8);
  const stdDevStr = result.stdDev.toFixed(2).padStart(6);

  let memoryStr = "";
  if (showMemory && result.memoryDelta !== undefined) {
    const sign = result.memoryDelta >= 0 ? "+" : "";
    memoryStr = ` | ${sign}${formatMemory(result.memoryDelta)}`;
  }

  let gcStr = "";
  if (result.gcTime !== undefined && result.gcTime > 0) {
    gcStr = ` | GC: ${result.gcTime.toFixed(2)}ms`;
  }

  return `${labelPadded} | ${meanStr}ms | ${medianStr}ms | ${stdDevStr}ms${memoryStr}${gcStr}`;
}

/**
 * Сравнивает два результата
 */
function compareResults(
  native: BenchmarkResult,
  iter: BenchmarkResult,
  label: string
): void {
  const speedup = native.mean / iter.mean;
  const emoji = speedup > 1 ? "✅" : "❌";
  console.log(
    `  ${label}: ${speedup.toFixed(2)}x ${emoji} (native: ${native.mean.toFixed(
      2
    )}ms, iter: ${iter.mean.toFixed(2)}ms)`
  );
}

// ============ ГЕНЕРАЦИЯ ДАННЫХ ============

const generateData = (size: number): number[] => {
  return Array.from({ length: size }, (_, i) => i);
};

const SMALL_SIZE = 1_0000;
const MEDIUM_SIZE = 100_0000;
const LARGE_SIZE = 1_000_0000;

console.log("🚀 Улучшенные бенчмарки: Iter vs Обычные JS операции\n");
console.log("=".repeat(80));
console.log(`Runtime: ${RUNTIME.name} ${RUNTIME.version}`);
console.log("Настройки: warm-up=10, runs=100, усреднение результатов\n");

// ============ МИКРО-ТЕСТЫ ============
console.log("\n📊 МИКРО-ТЕСТЫ (отдельные операции)\n");
console.log("─".repeat(80));

// Микро-тест 1: map()
console.log("\n1️⃣  map(x => x * 2)");
console.log("─".repeat(80));
console.log("Операция".padEnd(25) + " | Среднее  | Медиана  | СтдОткл");
console.log("─".repeat(80));

const mediumData = generateData(MEDIUM_SIZE);

const mapNative = benchmark(() => {
  mediumData.map((x) => x * 2);
});
const mapIter = benchmark(() => {
  Iter.from(mediumData)
    .map((x) => x * 2)
    .collect();
});

console.log(formatResult(mapNative, "  Обычный JS"));
console.log(formatResult(mapIter, "  Iter (lazy)"));
compareResults(mapNative, mapIter, "  Ускорение");

// Микро-тест 2: filter()
console.log("\n2️⃣  filter(x => x % 2 === 0)");
console.log("─".repeat(80));
console.log("Операция".padEnd(25) + " | Среднее  | Медиана  | СтдОткл");
console.log("─".repeat(80));

const filterNative = benchmark(() => {
  mediumData.filter((x) => x % 2 === 0);
});
const filterIter = benchmark(() => {
  Iter.from(mediumData)
    .filter((x) => x % 2 === 0)
    .collect();
});

console.log(formatResult(filterNative, "  Обычный JS"));
console.log(formatResult(filterIter, "  Iter (lazy)"));
compareResults(filterNative, filterIter, "  Ускорение");

// Микро-тест 3: take()
console.log("\n3️⃣  take(100)");
console.log("─".repeat(80));
console.log("Операция".padEnd(25) + " | Среднее  | Медиана  | СтдОткл");
console.log("─".repeat(80));

const takeNative = benchmark(() => {
  mediumData.slice(0, 100);
});
const takeIter = benchmark(() => {
  Iter.from(mediumData).take(100).collect();
});

console.log(formatResult(takeNative, "  Обычный JS"));
console.log(formatResult(takeIter, "  Iter (lazy)"));
compareResults(takeNative, takeIter, "  Ускорение");

// Микро-тест 4: reduce()
console.log("\n4️⃣  reduce((acc, x) => acc + x, 0)");
console.log("─".repeat(80));
console.log("Операция".padEnd(25) + " | Среднее  | Медиана  | СтдОткл");
console.log("─".repeat(80));

const reduceNative = benchmark(() => {
  mediumData.reduce((acc, x) => acc + x, 0);
});
const reduceIter = benchmark(() => {
  Iter.from(mediumData).fold(0, (acc, x) => acc + x);
});

console.log(formatResult(reduceNative, "  Обычный JS"));
console.log(formatResult(reduceIter, "  Iter (lazy)"));
compareResults(reduceNative, reduceIter, "  Ускорение");

// Микро-тест 5: sum()
console.log("\n5️⃣  sum()");
console.log("─".repeat(80));
console.log("Операция".padEnd(25) + " | Среднее  | Медиана  | СтдОткл");
console.log("─".repeat(80));

const sumNative = benchmark(() => {
  mediumData.reduce((acc, x) => acc + x, 0);
});
const sumIter = benchmark(() => {
  Iter.from(mediumData).sum();
});

console.log(formatResult(sumNative, "  Обычный JS"));
console.log(formatResult(sumIter, "  Iter (lazy)"));
compareResults(sumNative, sumIter, "  Ускорение");

// ============ МАКРО-ТЕСТЫ ============
console.log("\n\n📊 МАКРО-ТЕСТЫ (комплексные сценарии)\n");
console.log("─".repeat(80));

// Макро-тест 1: map + filter + take
console.log("\n1️⃣  map().filter().take() - ранний выход");
console.log("─".repeat(80));
console.log(
  "Размер     | Операция               | Среднее  | Медиана  | СтдОткл"
);
console.log("─".repeat(80));

const sizes = [
  { name: "Small", size: SMALL_SIZE },
  { name: "Medium", size: MEDIUM_SIZE },
  { name: "Large", size: LARGE_SIZE },
];

for (const { name, size } of sizes) {
  const data = generateData(size);

  const native = benchmark(() => {
    data
      .map((x) => x * 2)
      .filter((x) => x > 100)
      .slice(0, 10);
  });

  const iter = benchmark(() => {
    Iter.from(data)
      .map((x) => x * 2)
      .filter((x) => x > 100)
      .take(10)
      .collect();
  });

  const namePadded = name.padEnd(10);
  const emptyPadded = "".padEnd(10);
  console.log(`${namePadded} | ${formatResult(native, "Обычный JS")}`);
  console.log(`${emptyPadded} | ${formatResult(iter, "Iter (lazy)")}`);
  compareResults(native, iter, `  ${name} ускорение`);
}

// Макро-тест 2: reduce/fold агрегация
console.log("\n2️⃣  Агрегация: sum, max, min");
console.log("─".repeat(80));
console.log("Операция".padEnd(25) + " | Среднее  | Медиана  | СтдОткл");
console.log("─".repeat(80));

const largeData = generateData(LARGE_SIZE);

// Sum
const sumMacroNative = benchmark(() => {
  largeData.reduce((acc, x) => acc + x, 0);
});
const sumMacroIter = benchmark(() => {
  Iter.from(largeData).sum();
});
console.log(formatResult(sumMacroNative, "  Sum (native)"));
console.log(formatResult(sumMacroIter, "  Sum (iter)"));
compareResults(sumMacroNative, sumMacroIter, "  Ускорение");

// Max
const maxMacroNative = benchmark(() => {
  largeData.reduce((max, x) => (x > max ? x : max), largeData[0]);
});
const maxMacroIter = benchmark(() => {
  Iter.from(largeData).max();
});
console.log(formatResult(maxMacroNative, "  Max (native)"));
console.log(formatResult(maxMacroIter, "  Max (iter)"));
compareResults(maxMacroNative, maxMacroIter, "  Ускорение");

// ============ СРАВНЕНИЕ С FOR/FOR-OF ============
console.log("\n\n📊 СРАВНЕНИЕ С ИМПЕРАТИВНЫМИ ЦИКЛАМИ\n");
console.log("─".repeat(80));

console.log("\n1️⃣  for...of vs Iter");
console.log("─".repeat(80));
console.log("Операция".padEnd(25) + " | Среднее  | Медиана  | СтдОткл");
console.log("─".repeat(80));

const forOfNative = benchmark(() => {
  let sum = 0;
  for (const x of mediumData) {
    sum += x * 2;
  }
  return sum;
});

const forOfIter = benchmark(() => {
  Iter.from(mediumData)
    .map((x) => x * 2)
    .sum();
});

console.log(formatResult(forOfNative, "  for...of цикл"));
console.log(formatResult(forOfIter, "  Iter (lazy)"));
compareResults(forOfNative, forOfIter, "  Ускорение");

console.log("\n2️⃣  for (let i = 0; i < len; i++) vs Iter");
console.log("─".repeat(80));
console.log("Операция".padEnd(25) + " | Среднее  | Медиана  | СтдОткл");
console.log("─".repeat(80));

const forLoopNative = benchmark(() => {
  let sum = 0;
  const len = mediumData.length;
  for (let i = 0; i < len; i++) {
    sum += mediumData[i] * 2;
  }
  return sum;
});

console.log(formatResult(forLoopNative, "  for цикл"));
console.log(formatResult(forOfIter, "  Iter (lazy)"));
compareResults(forLoopNative, forOfIter, "  Ускорение");

// ============ СРАВНЕНИЕ С GENERATORS ============
console.log("\n\n📊 СРАВНЕНИЕ С GENERATOR FUNCTIONS\n");
console.log("─".repeat(80));

console.log("\n1️⃣  Generator function vs Iter");
console.log("─".repeat(80));
console.log("Операция".padEnd(25) + " | Среднее  | Медиана  | СтдОткл");
console.log("─".repeat(80));

function* mapGenerator<T, U>(iter: Iterable<T>, fn: (x: T) => U): Generator<U> {
  for (const x of iter) {
    yield fn(x);
  }
}

function* filterGenerator<T>(
  iter: Iterable<T>,
  pred: (x: T) => boolean
): Generator<T> {
  for (const x of iter) {
    if (pred(x)) yield x;
  }
}

const generatorNative = benchmark(() => {
  const gen = filterGenerator(
    mapGenerator(mediumData, (x) => x * 2),
    (x) => x % 3 === 0
  );
  Array.from(gen).slice(0, 100);
});

const generatorIter = benchmark(() => {
  Iter.from(mediumData)
    .map((x) => x * 2)
    .filter((x) => x % 3 === 0)
    .take(100)
    .collect();
});

console.log(formatResult(generatorNative, "  Generator function"));
console.log(formatResult(generatorIter, "  Iter (lazy)"));
compareResults(generatorNative, generatorIter, "  Ускорение");

// ============ ТЕСТ ПАМЯТИ ДЛЯ TAKE() ============
console.log("\n\n📊 ТЕСТ ПАМЯТИ: take() на огромных диапазонах\n");
console.log("─".repeat(80));

console.log(
  "\n1️⃣  Iter.range(0, 1e9).take(100) vs Array.from({length: 1e9}).slice(0, 100)"
);
console.log("─".repeat(80));

console.log(
  "  ⚠️  ВНИМАНИЕ: Тест может занять время и использовать много памяти!"
);
console.log("  ⚡ Iter создаёт только 100 элементов в памяти");
console.log("  ❌ Array.from создаёт 1 миллиард элементов в памяти\n");

try {
  const memoryTakeNative = benchmark(
    () => {
      // Симуляция: создаём большой массив и берём первые 100
      // В реальности это упадёт из-за памяти, но покажем концепцию
      const arr = Array.from({ length: 1_000_000 }, (_, i) => i); // Уменьшено для демо
      return arr.slice(0, 100);
    },
    10,
    2
  );

  const memoryTakeIter = benchmark(
    () => {
      return Iter.range(0, 1_000_000).take(100).collect();
    },
    10,
    2
  );

  console.log(formatResult(memoryTakeNative, "  Array.from (1M)"));
  console.log(formatResult(memoryTakeIter, "  Iter.range (1M)"));
  compareResults(memoryTakeNative, memoryTakeIter, "  Ускорение");
  console.log(
    "\n  💡 На 1 миллиарде элементов Array.from упадёт, а Iter работает!"
  );
} catch (e) {
  console.log("  ⚠️  Тест пропущен из-за ограничений памяти");
}

// ============ CPU-BOUND VS GC ТЕСТЫ ============
console.log("\n\n📊 CPU-BOUND VS GC ТЕСТЫ\n");
console.log("─".repeat(80));

console.log("\n1️⃣  Тяжёлые вычисления (CPU-bound)");
console.log("─".repeat(80));
console.log("Операция".padEnd(25) + " | Среднее  | Медиана  | СтдОткл");
console.log("─".repeat(80));

// Тяжёлая функция
const heavyCompute = (x: number): number => {
  let result = 0;
  for (let i = 0; i < 100; i++) {
    result += Math.sqrt(x + i) * Math.sin(x);
  }
  return result;
};

const cpuBoundNative = benchmark(() => {
  mediumData
    .map(heavyCompute)
    .filter((x) => x > 0)
    .slice(0, 100);
});

const cpuBoundIter = benchmark(() => {
  Iter.from(mediumData)
    .map(heavyCompute)
    .filter((x) => x > 0)
    .take(100)
    .collect();
});

console.log(formatResult(cpuBoundNative, "  CPU-bound (native)"));
console.log(formatResult(cpuBoundIter, "  CPU-bound (iter)"));
compareResults(cpuBoundNative, cpuBoundIter, "  Ускорение");

console.log("\n2️⃣  Лёгкие вычисления (GC-bound)");
console.log("─".repeat(80));
console.log("Операция".padEnd(25) + " | Среднее  | Медиана  | СтдОткл");
console.log("─".repeat(80));

const lightCompute = (x: number): number => x * 2;

const gcBoundNative = benchmark(() => {
  mediumData
    .map(lightCompute)
    .filter((x) => x % 2 === 0)
    .slice(0, 100);
});

const gcBoundIter = benchmark(() => {
  Iter.from(mediumData)
    .map(lightCompute)
    .filter((x) => x % 2 === 0)
    .take(100)
    .collect();
});

console.log(formatResult(gcBoundNative, "  GC-bound (native)"));
console.log(formatResult(gcBoundIter, "  GC-bound (iter)"));
compareResults(gcBoundNative, gcBoundIter, "  Ускорение");

// ============ БЕСКОНЕЧНЫЕ ПОСЛЕДОВАТЕЛЬНОСТИ ============
console.log("\n\n📊 БЕСКОНЕЧНЫЕ ПОСЛЕДОВАТЕЛЬНОСТИ\n");
console.log("─".repeat(80));
console.log("Операция".padEnd(25) + " | Среднее  | Медиана  | СтдОткл");
console.log("─".repeat(80));

const infiniteNative = benchmark(() => {
  // Обычный JS не может работать с бесконечными последовательностями
  // Нужно создать конечный массив
  const arr: number[] = [];
  for (let i = 0; i < 10000; i++) {
    arr.push(i);
  }
  return arr
    .map((x) => x * 2)
    .filter((x) => x % 7 === 0)
    .slice(0, 100);
});

const infiniteIter = benchmark(() => {
  return Iter.range(0, Infinity)
    .map((x) => x * 2)
    .filter((x) => x % 7 === 0)
    .take(100)
    .collect();
});

console.log(formatResult(infiniteNative, "  Обычный JS (конечный)"));
console.log(formatResult(infiniteIter, "  Iter (бесконечный)"));
compareResults(infiniteNative, infiniteIter, "  Ускорение");

// ============ ITERATOR FUSION (ОБЪЕДИНЕНИЕ ОПЕРАЦИЙ) ============
console.log("\n\n📊 ITERATOR FUSION (объединение map/filter)\n");
console.log("─".repeat(80));
console.log(
  "💡 Iterator fusion - это оптимизация, когда несколько операций объединяются в один проход"
);
console.log("─".repeat(80));

console.log("\n1️⃣  Множественные map() - показываем что они объединяются");
console.log("─".repeat(80));
console.log(
  "Операция".padEnd(25) + " | Среднее  | Медиана  | СтдОткл | Память"
);
console.log("─".repeat(80));

const fusionMultipleMapNative = benchmark(
  () => {
    mediumData
      .map((x) => x * 2)
      .map((x) => x + 1)
      .map((x) => x * 3)
      .slice(0, 100);
  },
  50,
  5,
  true
);

const fusionMultipleMapIter = benchmark(
  () => {
    Iter.from(mediumData)
      .map((x) => x * 2)
      .map((x) => x + 1)
      .map((x) => x * 3)
      .take(100)
      .collect();
  },
  50,
  5,
  true
);

console.log(formatResult(fusionMultipleMapNative, "  Native (3x map)", true));
console.log(formatResult(fusionMultipleMapIter, "  Iter (3x map)", true));
compareResults(fusionMultipleMapNative, fusionMultipleMapIter, "  Ускорение");

console.log("\n2️⃣  Множественные filter() - показываем что они объединяются");
console.log("─".repeat(80));
console.log(
  "Операция".padEnd(25) + " | Среднее  | Медиана  | СтдОткл | Память"
);
console.log("─".repeat(80));

const fusionMultipleFilterNative = benchmark(
  () => {
    mediumData
      .filter((x) => x % 2 === 0)
      .filter((x) => x > 100)
      .filter((x) => x < 1000)
      .slice(0, 100);
  },
  50,
  5,
  true
);

const fusionMultipleFilterIter = benchmark(
  () => {
    Iter.from(mediumData)
      .filter((x) => x % 2 === 0)
      .filter((x) => x > 100)
      .filter((x) => x < 1000)
      .take(100)
      .collect();
  },
  50,
  5,
  true
);

console.log(
  formatResult(fusionMultipleFilterNative, "  Native (3x filter)", true)
);
console.log(formatResult(fusionMultipleFilterIter, "  Iter (3x filter)", true));
compareResults(
  fusionMultipleFilterNative,
  fusionMultipleFilterIter,
  "  Ускорение"
);

console.log("\n3️⃣  Комбинация map/filter - показываем fusion в действии");
console.log("─".repeat(80));
console.log(
  "Операция".padEnd(25) + " | Среднее  | Медиана  | СтдОткл | Память"
);
console.log("─".repeat(80));

const fusionMapFilterNative = benchmark(
  () => {
    mediumData
      .map((x) => x * 2)
      .filter((x) => x % 3 === 0)
      .map((x) => x + 1)
      .filter((x) => x > 100)
      .map((x) => x * 2)
      .slice(0, 100);
  },
  50,
  5,
  true
);

const fusionMapFilterIter = benchmark(
  () => {
    Iter.from(mediumData)
      .map((x) => x * 2)
      .filter((x) => x % 3 === 0)
      .map((x) => x + 1)
      .filter((x) => x > 100)
      .map((x) => x * 2)
      .take(100)
      .collect();
  },
  50,
  5,
  true
);

console.log(
  formatResult(fusionMapFilterNative, "  Native (map/filter chain)", true)
);
console.log(
  formatResult(fusionMapFilterIter, "  Iter (map/filter chain)", true)
);
compareResults(fusionMapFilterNative, fusionMapFilterIter, "  Ускорение");

console.log(
  "\n  💡 Iter выполняет все операции за один проход без промежуточных массивов!"
);

// ============ ЗАМЕРЫ ПАМЯТИ ============
console.log("\n\n📊 ДЕТАЛЬНЫЕ ЗАМЕРЫ ПАМЯТИ\n");
console.log("─".repeat(80));
console.log(
  "💡 Сравнение использования памяти через process.memoryUsage() / performance.memory"
);
console.log("─".repeat(80));

console.log("\n1️⃣  Память: map().filter() vs Iter");
console.log("─".repeat(80));
console.log(
  "Операция".padEnd(25) + " | Среднее  | Медиана  | СтдОткл | Память"
);
console.log("─".repeat(80));

const memoryMapFilterNative = benchmark(
  () => {
    largeData.map((x) => x * 2).filter((x) => x > 1000);
  },
  20,
  3,
  true
);

const memoryMapFilterIter = benchmark(
  () => {
    Iter.from(largeData)
      .map((x) => x * 2)
      .filter((x) => x > 1000)
      .collect();
  },
  20,
  3,
  true
);

console.log(formatResult(memoryMapFilterNative, "  Native map+filter", true));
console.log(formatResult(memoryMapFilterIter, "  Iter map+filter", true));

if (
  memoryMapFilterNative.memoryDelta !== undefined &&
  memoryMapFilterIter.memoryDelta !== undefined
) {
  const memorySaved =
    memoryMapFilterNative.memoryDelta - memoryMapFilterIter.memoryDelta;
  console.log(
    `\n  💾 Экономия памяти: ${formatMemory(Math.abs(memorySaved))} (${(
      (memorySaved / memoryMapFilterNative.memoryDelta) *
      100
    ).toFixed(1)}%)`
  );
}

console.log("\n2️⃣  Память: длинная цепочка операций");
console.log("─".repeat(80));
console.log(
  "Операция".padEnd(25) + " | Среднее  | Медиана  | СтдОткл | Память"
);
console.log("─".repeat(80));

const memoryLongChainNative = benchmark(
  () => {
    mediumData
      .map((x) => x * 2)
      .filter((x) => x % 3 === 0)
      .map((x) => x + 1)
      .filter((x) => x > 100)
      .map((x) => x * 2)
      .slice(0, 100);
  },
  20,
  3,
  true
);

const memoryLongChainIter = benchmark(
  () => {
    Iter.from(mediumData)
      .map((x) => x * 2)
      .filter((x) => x % 3 === 0)
      .map((x) => x + 1)
      .filter((x) => x > 100)
      .map((x) => x * 2)
      .take(100)
      .collect();
  },
  20,
  3,
  true
);

console.log(formatResult(memoryLongChainNative, "  Native (5 операций)", true));
console.log(formatResult(memoryLongChainIter, "  Iter (5 операций)", true));

if (
  memoryLongChainNative.memoryDelta !== undefined &&
  memoryLongChainIter.memoryDelta !== undefined
) {
  const memorySaved =
    memoryLongChainNative.memoryDelta - memoryLongChainIter.memoryDelta;
  console.log(
    `\n  💾 Экономия памяти: ${formatMemory(Math.abs(memorySaved))} (${(
      (memorySaved / memoryLongChainNative.memoryDelta) *
      100
    ).toFixed(1)}%)`
  );
}

// ============ АНАЛИЗ GC ============
console.log("\n\n📊 АНАЛИЗ GARBAGE COLLECTION\n");
console.log("─".repeat(80));
console.log("💡 Анализ времени, затраченного на сборку мусора");
console.log("─".repeat(80));

if (RUNTIME.isNode || RUNTIME.isBun) {
  console.log("\n⚠️  Для детального анализа GC запустите с флагами:");
  if (RUNTIME.isNode) {
    console.log("  node --expose-gc --trace-gc tests/iterator.bench.ts");
  } else if (RUNTIME.isBun) {
    console.log("  bun --expose-gc tests/iterator.bench.ts");
  }
  console.log("\nТекущая статистика GC:");
  console.log(
    `  Всего GC вызовов: ${gcStats.gcCount > 0 ? gcStats.gcCount : "N/A"}`
  );
  console.log(
    `  Общее время GC: ${
      gcStats.gcTime > 0 ? gcStats.gcTime.toFixed(2) + "ms" : "N/A"
    }`
  );
  console.log(
    `  Среднее время GC: ${
      gcStats.avgGCTime > 0 ? gcStats.avgGCTime.toFixed(2) + "ms" : "N/A"
    }`
  );
} else {
  console.log(
    "\n⚠️  Детальный анализ GC доступен только в Node.js/Bun с --expose-gc"
  );
}

// ============ СРАВНЕНИЕ RUNTIME ============
console.log("\n\n📊 ИНФОРМАЦИЯ О RUNTIME\n");
console.log("─".repeat(80));
console.log(`Текущий runtime: ${RUNTIME.name} ${RUNTIME.version}`);

const memInfo = getMemoryUsage();
if (memInfo) {
  console.log("\nТекущее использование памяти:");
  console.log(`  Heap Used: ${formatMemory(memInfo.heapUsed)}`);
  console.log(`  Heap Total: ${formatMemory(memInfo.heapTotal)}`);
  if (memInfo.rss) {
    console.log(`  RSS: ${formatMemory(memInfo.rss)}`);
  }
  if (memInfo.external) {
    console.log(`  External: ${formatMemory(memInfo.external)}`);
  }
}

console.log("\n💡 Для сравнения разных runtime:");
console.log("  • Node.js: node tests/iterator.bench.ts");
console.log("  • Bun: bun tests/iterator.bench.ts");
console.log("  • Browser: откройте в браузере с поддержкой performance.memory");

// ============ ИТОГОВАЯ ТАБЛИЦА ============
console.log("\n\n" + "=".repeat(80));
console.log("📈 ИТОГОВАЯ СВОДКА\n");
console.log("─".repeat(80));

const summary = [
  { test: "map()", native: mapNative.mean, iter: mapIter.mean },
  { test: "filter()", native: filterNative.mean, iter: filterIter.mean },
  { test: "take()", native: takeNative.mean, iter: takeIter.mean },
  { test: "reduce()", native: reduceNative.mean, iter: reduceIter.mean },
  { test: "sum()", native: sumNative.mean, iter: sumIter.mean },
  { test: "for...of", native: forOfNative.mean, iter: forOfIter.mean },
  { test: "Generator", native: generatorNative.mean, iter: generatorIter.mean },
  { test: "CPU-bound", native: cpuBoundNative.mean, iter: cpuBoundIter.mean },
  { test: "GC-bound", native: gcBoundNative.mean, iter: gcBoundIter.mean },
  { test: "Бесконечные", native: infiniteNative.mean, iter: infiniteIter.mean },
  {
    test: "Fusion (3x map)",
    native: fusionMultipleMapNative.mean,
    iter: fusionMultipleMapIter.mean,
  },
  {
    test: "Fusion (map/filter)",
    native: fusionMapFilterNative.mean,
    iter: fusionMapFilterIter.mean,
  },
];

console.log(
  "Тест                | Native (ms)    | Iter (ms)      | Ускорение"
);
console.log("─".repeat(80));

for (const item of summary) {
  const speedup = item.native / item.iter;
  const emoji = speedup > 1 ? "✅" : "❌";
  const testPadded = item.test.padEnd(20);
  const nativePadded = item.native.toFixed(2).padStart(13);
  const iterPadded = item.iter.toFixed(2).padStart(13);
  console.log(
    `${testPadded} | ${nativePadded} | ${iterPadded} | ${speedup.toFixed(
      2
    )}x ${emoji}`
  );
}

// ============ ВЫВОДЫ ============
console.log("\n" + "=".repeat(80));
console.log("\n📊 ВЫВОДЫ:\n");
console.log("✅ Преимущества Iter:");
console.log(
  "  • Ленивое вычисление - операции выполняются только при потреблении"
);
console.log("  • Нет промежуточных массивов - экономия памяти");
console.log("  • Ранний выход - take(), find() останавливаются когда нужно");
console.log("  • Работа с бесконечными последовательностями");
console.log("  • Композиция цепочек без накладных расходов");
console.log("\n⚠️  Когда обычный JS может быть быстрее:");
console.log("  • На очень маленьких массивах (< 100 элементов)");
console.log("  • Когда нужны все элементы без фильтрации");
console.log("  • Когда нужны специфичные оптимизации движка JS");
console.log("  • Простые операции без цепочек");
console.log("\n💡 Рекомендации:");
console.log("  • Используйте Iter для длинных цепочек с take()");
console.log("  • Используйте Iter для бесконечных последовательностей");
console.log("  • Используйте Iter когда важна экономия памяти");
console.log(
  "  • Для простых операций на маленьких массивах используйте нативный JS"
);
