import type { Option } from "../option/option";
import { Some, None } from "../option/option";
import { Iter } from "./iterator";

/**
 * Типы операций в pipeline для ParIter
 */
type ParOpType =
  | "map"
  | "filter"
  | "reduce"
  | "sum"
  | "count"
  | "groupBy"
  | "take"
  | "takeWhile"
  | "find"
  | "first"
  | "scan"
  | "inspect";

/**
 * Операция в pipeline ParIter
 */
interface ParOp {
  type: ParOpType;
  fn: Function;
  param?: unknown;
}

/**
 * Конфигурация для ParIter
 */
export interface ParIterConfig {
  workers?: number;
  chunkSize?: number;
  strategy?: "static" | "dynamic";
  ordered?: boolean;
  allowSideEffects?: boolean;
}


/**
 * Тип для передачи данных в worker
 */
interface WorkerData {
  chunk: any[];
  pipeline: ParOp[];
  chunkIndex: number;
}

/**
 * Тип для результата из worker
 */
interface WorkerResult {
  chunkIndex: number;
  result: any[];
}

/**
 * Параллельный итератор для data-parallel execution с deterministic reduction.
 * 
 * ParIter = data-parallel execution + deterministic reduction
 * 
 * Основные принципы:
 * - Разбиение источника (split)
 * - Параллельная обработка чанков
 * - Контролируемая агрегация (reduce / collect / fold)
 * - Не все операции можно параллелизировать
 * - lazy-chain → eager-execution boundary
 */
export class ParIter<T> {
  private readonly source: Iterable<T>;
  private readonly ops: ParOp[];
  private readonly config: ParIterConfig;
  private readonly opsMask: number;

  constructor(
    source: Iterable<T>,
    ops: ParOp[] = [],
    config: ParIterConfig = {}
  ) {
    this.source = source;
    this.ops = ops;
    
    // Установим конфигурацию по умолчанию
    this.config = {
      workers: config.workers || navigator.hardwareConcurrency || 4,
      chunkSize: config.chunkSize || 10000,
      strategy: config.strategy || "static",
      ordered: config.ordered ?? false,
      allowSideEffects: config.allowSideEffects ?? false,
    };
    
    // Подсчитаем битовую маску операций
    let mask = 0;
    for (const op of ops) {
      switch (op.type) {
        case "map": mask |= 1 << 0; break;
        case "filter": mask |= 1 << 1; break;
        case "reduce": mask |= 1 << 2; break;
        case "sum": mask |= 1 << 3; break;
        case "count": mask |= 1 << 4; break;
        case "groupBy": mask |= 1 << 5; break;
      }
    }
    this.opsMask = mask;
  }

  /**
   * Создаёт ParIter из итерируемого объекта
   */
  static from<T>(iterable: Iterable<T>, config: ParIterConfig = {}): ParIter<T> {
    return new ParIter(iterable, [], config);
  }

  /**
   * Альтернативный способ создания ParIter с явной конфигурацией
   */
  static create<T>(iterable: Iterable<T>, config: ParIterConfig = {}): ParIter<T> {
    return new ParIter(iterable, [], {
      workers: config.workers || navigator.hardwareConcurrency || 4,
      chunkSize: config.chunkSize || 10000,
      strategy: config.strategy || "static",
      ordered: config.ordered ?? false,
      allowSideEffects: config.allowSideEffects ?? false,
    });
  }

  /**
   * Применяет функцию к каждому элементу (параллелизируемая операция)
   */
  map<U>(fn: (value: T, index: number) => U): ParIter<U> {
    // Проверяем, что операция может быть параллелизована
    if (this.hasUnsafeOps()) {
      throw new Error("Cannot apply map after operations that cannot be parallelized");
    }
    
    return new ParIter(
      this.source,
      [...this.ops, { type: "map", fn }],
      this.config
    ) as unknown as ParIter<U>;
  }

  /**
   * Фильтрует элементы по предикату (параллелизируемая операция)
   */
  filter(predicate: (value: T, index: number) => boolean): ParIter<T> {
    // Проверяем, что операция может быть параллелизована
    if (this.hasUnsafeOps()) {
      throw new Error("Cannot apply filter after operations that cannot be parallelized");
    }
    
    return new ParIter(
      this.source,
      [...this.ops, { type: "filter", fn: predicate }],
      this.config
    );
  }

  /**
   * Суммирует элементы (операция редукции)
   */
  async sum(): Promise<number> {
    if (this.hasUnsafeOps()) {
      throw new Error("Cannot perform sum after operations that cannot be parallelized");
    }

    // Добавляем операцию суммы в pipeline
    const ops: ParOp[] = [...this.ops, { type: "sum", fn: (a: number, b: number) => a + b }];
    return await this.executeReduction(ops, (partialResults: number[]) =>
      partialResults.reduce((acc, val) => acc + val, 0)
    );
  }

  /**
   * Подсчитывает количество элементов (операция редукции)
   */
  async count(): Promise<number> {
    if (this.hasUnsafeOps()) {
      throw new Error("Cannot perform count after operations that cannot be parallelized");
    }

    // Для подсчёта нужно сначала применить все предыдущие операции, затем посчитать
    return await this.executeReduction([], (partialResults: any[][]) =>
      partialResults.reduce((acc, chunk) => acc + chunk.length, 0)
    );
  }

  /**
   * Выполняет редукцию с ассоциативной функцией (операция редукции)
   */
  async reduce<U>(reducer: (acc: U, value: T) => U, initial?: U): Promise<U> {
    if (this.hasUnsafeOps()) {
      throw new Error("Cannot perform reduce after operations that cannot be parallelized");
    }

    // Добавляем операцию редукции в pipeline
    const ops: ParOp[] = [...this.ops, { type: "reduce", fn: reducer }];
    return await this.executeReduction(ops, (partialResults: U[]) => {
      if (partialResults.length === 0 && initial !== undefined) {
        return initial;
      }
      return partialResults.reduce((acc, val) => reducer(acc, val), initial as U);
    });
  }

  /**
   * Проверяет, есть ли в pipeline операции, которые нельзя параллелизировать
   */
  private hasUnsafeOps(): boolean {
    // Проверяем, есть ли в текущих операциях unsafe операции
    // согласно списку из design document:
    // ❌ Не параллелятся: take, takeWhile, find, first, scan, inspect, операции, зависящие от порядка

    for (const op of this.ops) {
      switch (op.type) {
        case "take":
        case "takeWhile":
        case "find":
        case "first":
        case "scan":
        case "inspect":
          return true;
        default:
          // Другие операции безопасны для параллелизации
          break;
      }
    }

    return false;
  }

  /**
   * Проверяет, разрешены ли побочные эффекты
   */
  private checkSideEffectsAllowed(): void {
    if (!this.config.allowSideEffects) {
      for (const op of this.ops) {
        if (op.type === "inspect") {
          throw new Error("Inspect operations are not allowed when allowSideEffects is false");
        }
      }
    }
  }

  /**
   * Выполняет редукцию параллельно
   */
  private async executeReduction<U>(ops: ParOp[], finalReducer: (partialResults: any[]) => U): Promise<U> {
    // Преобразуем источник в массив для разбиения на чанки
    const array = Array.from(this.source);

    // Разбиваем на чанки
    const chunks = this.splitIntoChunks(array);

    // Выполняем операции в каждом чанке параллельно
    const partialResults = await this.processChunksParallel(chunks, ops);

    // Собираем результаты
    return finalReducer(partialResults);
  }

  /**
   * Разбивает данные на чанки в зависимости от стратегии
   */
  private splitIntoChunks(data: T[]): T[][] {
    if (this.config.strategy === "static") {
      return this.staticChunking(data);
    } else {
      // По умолчанию используем статическое разбиение
      return this.staticChunking(data);
    }
  }

  /**
   * Статическое разбиение на чанки
   */
  private staticChunking(data: T[]): T[][] {
    const chunks: T[][] = [];
    const chunkSize = Math.max(1, this.config.chunkSize!);
    const numWorkers = Math.min(this.config.workers!, data.length);

    // Если у нас больше воркеров, чем элементов, уменьшаем размер чанка
    const effectiveChunkSize = Math.max(1, Math.ceil(data.length / numWorkers));
    const finalChunkSize = Math.min(chunkSize, effectiveChunkSize);

    for (let i = 0; i < data.length; i += finalChunkSize) {
      chunks.push(data.slice(i, i + finalChunkSize));
    }

    return chunks;
  }

  /**
   * Обрабатывает чанки параллельно с использованием Web Workers
   */
  private async processChunksParallel(chunks: T[][], ops: ParOp[]): Promise<any[]> {
    // В браузере используем Web Workers, в Node.js/Bun - другой подход
    // Для упрощения в этой версии будем использовать синхронную обработку
    // Реализация с настоящими воркерами потребует дополнительной настройки

    // Для Bun/Node.js реализации нужно будет использовать соответствующие API
    if (typeof Worker !== 'undefined') {
      return this.processWithWebWorkers(chunks, ops);
    } else {
      // В Node.js/Bun используем альтернативный подход
      return this.processWithBunWorkers(chunks, ops);
    }
  }

  /**
   * Обработка с использованием Web Workers (браузер)
   */
  private async processWithWebWorkers(chunks: T[][], ops: ParOp[]): Promise<any[]> {
    const results: any[] = new Array(chunks.length);
    const workers: Worker[] = [];
    const promises: Promise<void>[] = [];

    // Создаем воркеры
    for (let i = 0; i < Math.min(chunks.length, this.config.workers!); i++) {
      // В реальной реализации нужно будет правильно указать путь к воркеру
      // const worker = new Worker(new URL('./par-worker.ts', import.meta.url));

      // Для этой реализации будем использовать синхронную обработку
      // так как создание реальных воркеров требует специфической настройки
      const chunkIdx = i;
      const processPromise = (async () => {
        for (let j = chunkIdx; j < chunks.length; j += this.config.workers!) {
          const processed = await this.processChunk(chunks[j], ops);
          results[j] = processed;
        }
      })();
      promises.push(processPromise);
    }

    await Promise.all(promises);
    return results;
  }

  /**
   * Обработка с использованием Bun Workers (Bun runtime)
   */
  private async processWithBunWorkers(chunks: T[][], ops: ParOp[]): Promise<any[]> {
    // В Bun можно использовать Worker API напрямую
    // Но для этой реализации будем использовать синхронную обработку
    // так как реальные воркеры требуют специфической настройки

    const results: any[] = [];

    // Обрабатываем каждый чанк
    for (const chunk of chunks) {
      const processed = await this.processChunk(chunk, ops);
      results.push(processed);
    }

    return results;
  }

  /**
   * Обрабатывает один чанк с применением pipeline
   */
  private async processChunk(chunk: T[], ops: ParOp[]): Promise<any> {
    let result = [...chunk] as any[];

    for (const op of ops) {
      switch (op.type) {
        case "map":
          result = result.map((item, idx) =>
            (op.fn as (value: T, index: number) => any)(item, idx)
          );
          break;
        case "filter":
          result = result.filter((item, idx) =>
            (op.fn as (value: T, index: number) => boolean)(item, idx)
          );
          break;
        case "sum":
          // Суммируем числа в чанке
          result = [result.reduce((acc, val) => acc + Number(val), 0)];
          break;
        case "count":
          // Возвращаем количество элементов в чанке
          result = [result.length];
          break;
        case "reduce":
          // Применяем редукцию к чанку
          if (result.length > 0) {
            const reducer = op.fn as (acc: any, value: any) => any;
            const reduced = result.reduce(reducer);
            result = [reduced];
          } else {
            result = [];
          }
          break;
      }
    }

    return result[0] !== undefined ? result[0] : result;
  }

  /**
   * Собирает результаты в массив (операция редукции)
   */
  async collect(): Promise<T[]> {
    if (this.hasUnsafeOps()) {
      throw new Error("Cannot collect after operations that cannot be parallelized");
    }

    // Выполняем все операции и собираем результаты
    return await this.executeReduction(this.ops, (partialResults: any[][]) => {
      // Объединяем все частичные результаты
      const result: any[] = [];
      for (const partial of partialResults) {
        if (Array.isArray(partial)) {
          result.push(...partial);
        } else {
          result.push(partial);
        }
      }
      return result;
    });
  }

  /**
   * Берёт первые n элементов - НЕЛЬЗЯ параллелить
   */
  take(n: number): never {
    throw new Error("take operation cannot be parallelized");
  }

  /**
   * Берёт элементы пока предикат возвращает true - НЕЛЬЗЯ параллелить
   */
  takeWhile(predicate: (value: T, index: number) => boolean): never {
    throw new Error("takeWhile operation cannot be parallelized");
  }

  /**
   * Находит элемент - НЕЛЬЗЯ параллелить
   */
  find(predicate: (value: T, index: number) => boolean): never {
    throw new Error("find operation cannot be parallelized");
  }

  /**
   * Получает первый элемент - НЕЛЬЗЯ параллелить
   */
  first(): never {
    throw new Error("first operation cannot be parallelized");
  }

  /**
   * Сканирует элементы - НЕЛЬЗЯ параллелить
   */
  scan<U>(initial: U, accumulator: (acc: U, value: T) => U): never {
    throw new Error("scan operation cannot be parallelized");
  }

  /**
   * Инспектирует элементы - НЕЛЬЗЯ параллелить без разрешения
   */
  inspect(fn: (value: T, index: number) => void): ParIter<T> {
    if (!this.config.allowSideEffects) {
      throw new Error("inspect operation is not allowed when allowSideEffects is false");
    }

    // Добавляем операцию инспекции в pipeline
    return new ParIter(
      this.source,
      [...this.ops, { type: "inspect", fn }],
      this.config
    );
  }
}