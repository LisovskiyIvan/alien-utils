import type { Option } from "../option/option";
import { Some, None } from "../option/option";

/**
 * Битовая маска операций в pipeline для оптимизации
 */
const enum IterOp {
  Map       = 1 << 0,
  Filter    = 1 << 1,
  FlatMap   = 1 << 2,
  Flatten   = 1 << 3,
  Take      = 1 << 4,
  TakeWhile = 1 << 5,
  Skip      = 1 << 6,
  SkipWhile = 1 << 7,
  Enumerate = 1 << 8,
  Zip       = 1 << 9,
  Chain     = 1 << 10,
  StepBy    = 1 << 11,
  Inspect   = 1 << 12,
  Unique    = 1 << 13,
  UniqueBy  = 1 << 14,
}

/**
 * Типы операций в pipeline
 */
type OpType =
  | "map"
  | "filter"
  | "flatMap"
  | "flatten"
  | "take"
  | "takeWhile"
  | "skip"
  | "skipWhile"
  | "enumerate"
  | "zip"
  | "chain"
  | "stepBy"
  | "inspect"
  | "unique"
  | "uniqueBy";

/**
 * Операция в pipeline
 */
interface Op {
  type: OpType;
  fn: Function;
  param?: unknown; // Дополнительный параметр (для take, skip, stepBy и т.д.)
}

/**
 * Lazy iterator в стиле Rust с оптимизированным pipeline-based подходом.
 * Все промежуточные операции (map, filter, take и т.д.) не создают промежуточных массивов,
 * а формируют цепочку трансформаций, которая применяется при финальном потреблении.
 *
 * Оптимизации:
 * - Pipeline-based архитектура вместо вложенных итераторов
 * - Единый цикл выполнения для всех операций
 * - Fast paths для частых случаев
 * - Минимизация создания closures и объектов
 * - Оптимизация для массивов с прямым доступом
 *
 * @template T - Тип элементов в итераторе
 *
 * @example
 * ```ts
 * const result = Iter.from([1, 2, 3, 4, 5])
 *   .map(x => x * 2)
 *   .filter(x => x > 5)
 *   .take(2)
 *   .collect();
 * // [6, 8] - выполняется один проход, нет промежуточных массивов
 * ```
 */
export class Iter<T> implements Iterable<T> {
  /**
   * Исходный итерируемый объект
   */
  private readonly source: Iterable<T>;

  /**
   * Массив операций pipeline
   */
  private readonly ops: Op[];

  /**
   * Битовая маска операций для оптимизации
   */
  private readonly opsMask: number;

  /**
   * Создаёт новый Iter из итерируемого объекта.
   *
   * @param source - Исходный итерируемый объект
   * @param ops - Массив операций pipeline (внутреннее использование)
   */
  constructor(source: Iterable<T>, ops: Op[] = [], opsMask: number = 0) {
    this.source = source;
    this.ops = ops;
    this.opsMask = opsMask;
  }

  /**
   * Проверяет, является ли итерируемый объект массивом (для оптимизаций).
   */
  private get isArray(): boolean {
    return Array.isArray(this.source);
  }

  /**
   * Проверяет, является ли источник typed array для SIMD-оптимизаций.
   */
  private get isTypedArray(): boolean {
    return (
      this.source instanceof Int8Array ||
      this.source instanceof Uint8Array ||
      this.source instanceof Uint8ClampedArray ||
      this.source instanceof Int16Array ||
      this.source instanceof Uint16Array ||
      this.source instanceof Int32Array ||
      this.source instanceof Uint32Array ||
      this.source instanceof Float32Array ||
      this.source instanceof Float64Array
    );
  }

  /**
   * Создаёт Iter из итерируемого объекта.
   *
   * @template T - Тип элементов
   * @param iterable - Итерируемый объект
   * @returns Новый Iter
   *
   * @example
   * ```ts
   * const iter = Iter.from([1, 2, 3]);
   * const iter2 = Iter.from(new Set([1, 2, 3]));
   * const iter3 = Iter.from("abc"); // ['a', 'b', 'c']
   * ```
   */
  static from<T>(iterable: Iterable<T>): Iter<T> {
    return new Iter(iterable);
  }

  /**
   * Создаёт Iter из диапазона чисел [start, end).
   *
   * @param start - Начальное значение (включительно)
   * @param end - Конечное значение (не включительно)
   * @param step - Шаг (по умолчанию 1)
   * @returns Новый Iter с числами
   *
   * @example
   * ```ts
   * Iter.range(0, 5).collect(); // [0, 1, 2, 3, 4]
   * Iter.range(0, 10, 2).collect(); // [0, 2, 4, 6, 8]
   * ```
   */
  static range(start: number, end: number, step: number = 1): Iter<number> {
    return new Iter({
      *[Symbol.iterator]() {
        if (step > 0) {
          for (let i = start; i < end; i += step) {
            yield i;
          }
        } else if (step < 0) {
          for (let i = start; i > end; i += step) {
            yield i;
          }
        }
      },
    });
  }

  /**
   * Создаёт бесконечный Iter, который повторяет значение.
   *
   * @template T - Тип значения
   * @param value - Значение для повторения
   * @returns Бесконечный Iter
   *
   * @example
   * ```ts
   * Iter.repeat(42).take(3).collect(); // [42, 42, 42]
   * ```
   */
  static repeat<T>(value: T): Iter<T> {
    return new Iter({
      *[Symbol.iterator]() {
        while (true) {
          yield value;
        }
      },
    });
  }

  /**
   * Создаёт бесконечный Iter, генерируя значения функцией.
   *
   * @template T - Тип значений
   * @param fn - Функция генерации значений
   * @returns Бесконечный Iter
   *
   * @example
   * ```ts
   * let n = 0;
   * Iter.generate(() => n++).take(5).collect(); // [0, 1, 2, 3, 4]
   * ```
   */
  static generate<T>(fn: () => T): Iter<T> {
    return new Iter({
      *[Symbol.iterator]() {
        while (true) {
          yield fn();
        }
      },
    });
  }

  /**
   * Создаёт пустой Iter.
   *
   * @template T - Тип элементов
   * @returns Пустой Iter
   *
   * @example
   * ```ts
   * Iter.empty<number>().collect(); // []
   * ```
   */
  static empty<T>(): Iter<T> {
    return new Iter({
      *[Symbol.iterator]() {
        // пусто
      },
    });
  }

  /**
   * Создаёт Iter из одного элемента.
   *
   * @template T - Тип элемента
   * @param value - Значение
   * @returns Iter с одним элементом
   *
   * @example
   * ```ts
   * Iter.once(42).collect(); // [42]
   * ```
   */
  static once<T>(value: T): Iter<T> {
    return new Iter({
      *[Symbol.iterator]() {
        yield value;
      },
    });
  }

  /**
   * Реализация Symbol.iterator для поддержки for..of и других итераций.
   * Выполняет все операции pipeline в едином цикле.
   *
   * @returns Iterator
   */
  [Symbol.iterator](): Iterator<T> {
    // Fast path: нет операций, возвращаем исходный итератор
    if (this.ops.length === 0) {
      return this.source[Symbol.iterator]();
    }

    // Выполняем pipeline
    return this.executePipeline();
  }

  /**
   * Выполняет все операции pipeline в едином цикле.
   * Это ключевая оптимизация - все операции выполняются за один проход.
   *
   * Оптимизации на основе битовой маски операций:
   * - Отсутствие Filter: пропускаем проверки фильтрации
   * - Fast path для Map-only: без фильтрации и сложных операций
   * - Уменьшение количества ветвлений в горячем коде
   */
  private *executePipeline(): Generator<T> {
    const hasFilter = (this.opsMask & IterOp.Filter) !== 0;
    const hasTake = (this.opsMask & IterOp.Take) !== 0;
    const hasTakeWhile = (this.opsMask & IterOp.TakeWhile) !== 0;
    const hasSkip = (this.opsMask & IterOp.Skip) !== 0;
    const hasSkipWhile = (this.opsMask & IterOp.SkipWhile) !== 0;
    const hasStepBy = (this.opsMask & IterOp.StepBy) !== 0;
    const hasInspect = (this.opsMask & IterOp.Inspect) !== 0;
    const hasUnique = (this.opsMask & IterOp.Unique) !== 0;
    const hasUniqueBy = (this.opsMask & IterOp.UniqueBy) !== 0;
    const hasMap = (this.opsMask & IterOp.Map) !== 0;
    const hasFlatMap = (this.opsMask & IterOp.FlatMap) !== 0;
    const hasFlatten = (this.opsMask & IterOp.Flatten) !== 0;

    // Fast path: только Map без фильтрации
    if (hasMap && !hasFilter && !hasFlatMap && !hasFlatten && !hasUnique && !hasUniqueBy) {
      yield* this.executeMapOnlyPipeline();
      return;
    }

    const iter = this.source[Symbol.iterator]();
    let index = 0;
    let takeCount = 0;
    let takeLimit: number | null = null;
    let skipCount = 0;
    let skipLimit: number | null = null;
    let stepByStep: number | null = null;
    let skipping = true;
    let skipWhileFn: ((value: T, index: number) => boolean) | null = null;
    let takeWhileFn: ((value: T, index: number) => boolean) | null = null;
    let seen: Set<any> | null = null;
    let uniqueByFn: ((value: T) => any) | null = null;

    // Предварительная обработка операций для оптимизации
    if (hasTake || hasSkip || hasStepBy || hasTakeWhile || hasSkipWhile || hasUnique || hasUniqueBy) {
      for (const op of this.ops) {
        if (op.type === "take" && typeof op.param === "number") {
          takeLimit = op.param;
        } else if (op.type === "skip" && typeof op.param === "number") {
          skipLimit = op.param;
        } else if (op.type === "stepBy" && typeof op.param === "number") {
          stepByStep = op.param;
        } else if (op.type === "takeWhile") {
          takeWhileFn = op.fn as (value: T, index: number) => boolean;
        } else if (op.type === "skipWhile") {
          skipWhileFn = op.fn as (value: T, index: number) => boolean;
        } else if (op.type === "unique") {
          seen = new Set();
        } else if (op.type === "uniqueBy") {
          seen = new Set();
          uniqueByFn = op.fn as (value: T) => any;
        }
      }
    }

    // Основной цикл выполнения pipeline
    mainLoop: while (true) {
      const next = iter.next();
      if (next.done) break;

      let value: any = next.value;
      let currentIndex = index++;

      // Skip: пропускаем первые N элементов (только если есть операция)
      if (hasSkip && skipLimit !== null) {
        if (skipCount < skipLimit) {
          skipCount++;
          continue;
        }
      }

      // SkipWhile: пропускаем пока предикат true (только если есть операция)
      if (hasSkipWhile && skipping && skipWhileFn) {
        if (skipWhileFn(value, currentIndex)) {
          continue;
        }
        skipping = false;
      }

      // StepBy: берём каждый N-ный элемент (только если есть операция)
      if (hasStepBy && stepByStep !== null) {
        if (currentIndex % stepByStep !== 0) {
          continue;
        }
      }

      // Применяем все операции pipeline
      for (let i = 0; i < this.ops.length; i++) {
        const op = this.ops[i];

        // Если встретили flatMap или flatten, обрабатываем их особо
        if (hasFlatMap && op.type === "flatMap") {
          const flatMapped = (
            op.fn as (value: T, index: number) => Iterable<any>
          )(value, currentIndex);
          // Применяем последующие операции к каждому развёрнутому элементу
          for (const flatValue of flatMapped) {
            let processedValue = flatValue;
            let shouldYield = true;

            // Применяем операции после flatMap
            for (let j = i + 1; j < this.ops.length; j++) {
              const nextOp = this.ops[j];
              switch (nextOp.type) {
                case "map":
                  processedValue = (
                    nextOp.fn as (value: any, index: number) => any
                  )(processedValue, currentIndex);
                  break;
                case "filter":
                  if (
                    !(nextOp.fn as (value: any, index: number) => boolean)(
                      processedValue,
                      currentIndex
                    )
                  ) {
                    shouldYield = false;
                    break;
                  }
                  break;
                case "inspect":
                  (nextOp.fn as (value: any, index: number) => void)(
                    processedValue,
                    currentIndex
                  );
                  break;
                case "unique":
                  if (seen!.has(processedValue)) {
                    shouldYield = false;
                    break;
                  }
                  seen!.add(processedValue);
                  break;
                case "uniqueBy":
                  if (uniqueByFn) {
                    const key = uniqueByFn(processedValue);
                    if (seen!.has(key)) {
                      shouldYield = false;
                      break;
                    }
                    seen!.add(key);
                  }
                  break;
              }
              if (!shouldYield) break;
            }

            if (shouldYield) {
              // Take: ограничиваем количество элементов
              if (hasTake && takeLimit !== null) {
                if (takeCount >= takeLimit) {
                  break mainLoop;
                }
                takeCount++;
              }
              yield processedValue;
            }
          }
          continue mainLoop;
        } else if (hasFlatten && op.type === "flatten") {
          // Применяем последующие операции к каждому развёрнутому элементу
          for (const flatValue of value as Iterable<any>) {
            let processedValue = flatValue;
            let shouldYield = true;

            // Применяем операции после flatten
            for (let j = i + 1; j < this.ops.length; j++) {
              const nextOp = this.ops[j];
              switch (nextOp.type) {
                case "map":
                  processedValue = (
                    nextOp.fn as (value: any, index: number) => any
                  )(processedValue, currentIndex);
                  break;
                case "filter":
                  if (
                    !(nextOp.fn as (value: any, index: number) => boolean)(
                      processedValue,
                      currentIndex
                    )
                  ) {
                    shouldYield = false;
                    break;
                  }
                  break;
                case "inspect":
                  (nextOp.fn as (value: any, index: number) => void)(
                    processedValue,
                    currentIndex
                  );
                  break;
                case "unique":
                  if (seen!.has(processedValue)) {
                    shouldYield = false;
                    break;
                  }
                  seen!.add(processedValue);
                  break;
                case "uniqueBy":
                  if (uniqueByFn) {
                    const key = uniqueByFn(processedValue);
                    if (seen!.has(key)) {
                      shouldYield = false;
                      break;
                    }
                    seen!.add(key);
                  }
                  break;
              }
              if (!shouldYield) break;
            }

            if (shouldYield) {
              // Take: ограничиваем количество элементов
              if (hasTake && takeLimit !== null) {
                if (takeCount >= takeLimit) {
                  break mainLoop;
                }
                takeCount++;
              }
              yield processedValue;
            }
          }
          continue mainLoop;
        }

        // Обычные операции
        switch (op.type) {
          case "map":
            value = (op.fn as (value: any, index: number) => any)(
              value,
              currentIndex
            );
            break;

          case "filter":
            // Эта ветка выполняется только если hasFilter === true
            if (
              !(op.fn as (value: T, index: number) => boolean)(
                value,
                currentIndex
              )
            ) {
              continue mainLoop; // Short-circuit для filter
            }
            break;

          case "take":
            // Уже обработано выше через takeLimit
            break;

          case "takeWhile":
            if (takeWhileFn && !takeWhileFn(value, currentIndex)) {
              break mainLoop; // Short-circuit для takeWhile
            }
            break;

          case "skip":
            // Уже обработано выше через skipLimit
            break;

          case "skipWhile":
            // Уже обработано выше через skipWhileFn
            break;

          case "enumerate":
            value = [currentIndex, value];
            break;

          case "zip":
            // zip требует специальной обработки с другим итератором
            // Это сложная операция, оставляем как есть
            break;

          case "chain":
            // chain требует специальной обработки
            break;

          case "inspect":
            if (hasInspect) {
              (op.fn as (value: T, index: number) => void)(value, currentIndex);
            }
            break;

          case "unique":
            if (hasUnique && seen!.has(value)) {
              continue mainLoop;
            }
            if (hasUnique) seen!.add(value);
            break;

          case "uniqueBy":
            if (hasUniqueBy && uniqueByFn) {
              const key = uniqueByFn(value);
              if (seen!.has(key)) {
                continue mainLoop;
              }
              seen!.add(key);
            }
            break;
        }
      }

      // Take: ограничиваем количество элементов (только если есть операция)
      if (hasTake && takeLimit !== null) {
        if (takeCount >= takeLimit) {
          break;
        }
        takeCount++;
      }

      yield value;
    }
  }

  /**
   * Fast path для pipeline с только Map операциями.
   * Это самый частый сценарий в реальном коде.
   * Оптимизация: никаких проверок фильтрации, только трансформация.
   */
  private *executeMapOnlyPipeline(): Generator<T> {
    const iter = this.source[Symbol.iterator]();
    let index = 0;
    let takeCount = 0;
    let takeLimit: number | null = null;
    let skipCount = 0;
    let skipLimit: number | null = null;
    let stepByStep: number | null = null;
    let skipping = true;
    let skipWhileFn: ((value: T, index: number) => boolean) | null = null;
    let takeWhileFn: ((value: T, index: number) => boolean) | null = null;

    // Предварительная обработка для take, skip и т.д.
    for (const op of this.ops) {
      if (op.type === "take" && typeof op.param === "number") {
        takeLimit = op.param;
      } else if (op.type === "skip" && typeof op.param === "number") {
        skipLimit = op.param;
      } else if (op.type === "stepBy" && typeof op.param === "number") {
        stepByStep = op.param;
      } else if (op.type === "takeWhile") {
        takeWhileFn = op.fn as (value: T, index: number) => boolean;
      } else if (op.type === "skipWhile") {
        skipWhileFn = op.fn as (value: T, index: number) => boolean;
      }
    }

    // Оптимизированный цикл без проверок фильтрации
    mainLoop: while (true) {
      const next = iter.next();
      if (next.done) break;

      let value: any = next.value;
      let currentIndex = index++;

      // Skip: пропускаем первые N элементов
      if (skipLimit !== null) {
        if (skipCount < skipLimit) {
          skipCount++;
          continue;
        }
      }

      // SkipWhile: пропускаем пока предикат true
      if (skipping && skipWhileFn) {
        if (skipWhileFn(value, currentIndex)) {
          continue;
        }
        skipping = false;
      }

      // StepBy: берём каждый N-ный элемент
      if (stepByStep !== null) {
        if (currentIndex % stepByStep !== 0) {
          continue;
        }
      }

      // Применяем только Map операции (нет filter проверок!)
      for (const op of this.ops) {
        switch (op.type) {
          case "map":
            value = (op.fn as (value: any, index: number) => any)(
              value,
              currentIndex
            );
            break;
          case "takeWhile":
            if (takeWhileFn && !takeWhileFn(value, currentIndex)) {
              break mainLoop;
            }
            break;
          case "enumerate":
            value = [currentIndex, value];
            break;
          case "inspect":
            (op.fn as (value: T, index: number) => void)(value, currentIndex);
            break;
        }
      }

      // Take: ограничиваем количество элементов
      if (takeLimit !== null) {
        if (takeCount >= takeLimit) {
          break;
        }
        takeCount++;
      }

      yield value;
    }
  }

  /**
   * Применяет функцию к каждому элементу (ленивая операция).
   *
   * @template U - Тип результата
   * @param fn - Функция трансформации
   * @returns Новый Iter с трансформированными элементами
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3])
   *   .map(x => x * 2)
   *   .collect(); // [2, 4, 6]
   * ```
   */
  map<U>(fn: (value: T, index: number) => U): Iter<U> {
    return new Iter(
      this.source,
      [...this.ops, { type: "map", fn }],
      this.opsMask | IterOp.Map
    ) as unknown as Iter<U>;
  }

  /**
   * Фильтрует элементы по предикату (ленивая операция).
   *
   * @param predicate - Функция-предикат
   * @returns Новый Iter только с элементами, прошедшими фильтр
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3, 4])
   *   .filter(x => x % 2 === 0)
   *   .collect(); // [2, 4]
   * ```
   */
  filter(predicate: (value: T, index: number) => boolean): Iter<T> {
    return new Iter(
      this.source,
      [...this.ops, { type: "filter", fn: predicate }],
      this.opsMask | IterOp.Filter
    );
  }

  /**
   * Применяет функцию и разворачивает результат (ленивая операция).
   * Аналог flatMap в JS или flat_map в Rust.
   *
   * @template U - Тип элементов результата
   * @param fn - Функция, возвращающая итерируемый объект
   * @returns Новый Iter с развёрнутыми элементами
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3])
   *   .flatMap(x => [x, x * 10])
   *   .collect(); // [1, 10, 2, 20, 3, 30]
   * ```
   */
  flatMap<U>(fn: (value: T, index: number) => Iterable<U>): Iter<U> {
    return new Iter(
      this.source,
      [...this.ops, { type: "flatMap", fn }],
      this.opsMask | IterOp.FlatMap
    ) as unknown as Iter<U>;
  }

  /**
   * Развёртывает вложенные итераторы на один уровень (ленивая операция).
   *
   * @template U - Тип элементов внутри T
   * @returns Новый Iter с развёрнутыми элементами
   *
   * @example
   * ```ts
   * Iter.from([[1, 2], [3, 4]])
   *   .flatten()
   *   .collect(); // [1, 2, 3, 4]
   * ```
   */
  flatten<U>(this: Iter<Iterable<U>>): Iter<U> {
    return new Iter(
      this.source,
      [...this.ops, { type: "flatten", fn: () => {} }],
      this.opsMask | IterOp.Flatten
    ) as unknown as Iter<U>;
  }

  /**
   * Берёт первые n элементов (ленивая операция).
   *
   * @param n - Количество элементов
   * @returns Новый Iter с первыми n элементами
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3, 4, 5])
   *   .take(3)
   *   .collect(); // [1, 2, 3]
   * ```
   */
  take(n: number): Iter<T> {
    return new Iter(
      this.source,
      [...this.ops, { type: "take", fn: () => {}, param: n }],
      this.opsMask | IterOp.Take
    );
  }

  /**
   * Берёт элементы пока предикат возвращает true (ленивая операция).
   *
   * @param predicate - Функция-предикат
   * @returns Новый Iter с элементами до первого false
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3, 4, 1, 2])
   *   .takeWhile(x => x < 4)
   *   .collect(); // [1, 2, 3]
   * ```
   */
  takeWhile(predicate: (value: T, index: number) => boolean): Iter<T> {
    return new Iter(
      this.source,
      [...this.ops, { type: "takeWhile", fn: predicate }],
      this.opsMask | IterOp.TakeWhile
    );
  }

  /**
   * Пропускает первые n элементов (ленивая операция).
   *
   * @param n - Количество элементов для пропуска
   * @returns Новый Iter без первых n элементов
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3, 4, 5])
   *   .skip(2)
   *   .collect(); // [3, 4, 5]
   * ```
   */
  skip(n: number): Iter<T> {
    return new Iter(
      this.source,
      [...this.ops, { type: "skip", fn: () => {}, param: n }],
      this.opsMask | IterOp.Skip
    );
  }

  /**
   * Пропускает элементы пока предикат возвращает true (ленивая операция).
   *
   * @param predicate - Функция-предикат
   * @returns Новый Iter без элементов до первого false
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3, 4, 1, 2])
   *   .skipWhile(x => x < 3)
   *   .collect(); // [3, 4, 1, 2]
   * ```
   */
  skipWhile(predicate: (value: T, index: number) => boolean): Iter<T> {
    return new Iter(
      this.source,
      [...this.ops, { type: "skipWhile", fn: predicate }],
      this.opsMask | IterOp.SkipWhile
    );
  }

  /**
   * Добавляет индекс к каждому элементу (ленивая операция).
   *
   * @returns Новый Iter с кортежами [индекс, значение]
   *
   * @example
   * ```ts
   * Iter.from(['a', 'b', 'c'])
   *   .enumerate()
   *   .collect(); // [[0, 'a'], [1, 'b'], [2, 'c']]
   * ```
   */
  enumerate(): Iter<[number, T]> {
    return new Iter(
      this.source,
      [...this.ops, { type: "enumerate", fn: () => {} }],
      this.opsMask | IterOp.Enumerate
    ) as unknown as Iter<[number, T]>;
  }

  /**
   * Объединяет два итератора в пары (ленивая операция).
   * Останавливается когда любой из итераторов заканчивается.
   *
   * @template U - Тип элементов второго итератора
   * @param other - Второй итератор
   * @returns Новый Iter с кортежами
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3])
   *   .zip(['a', 'b', 'c'])
   *   .collect(); // [[1, 'a'], [2, 'b'], [3, 'c']]
   * ```
   */
  zip<U>(other: Iterable<U>): Iter<[T, U]> {
    const source = this;
    return new Iter({
      *[Symbol.iterator]() {
        const iter1 = source[Symbol.iterator]();
        const iter2 = other[Symbol.iterator]();
        while (true) {
          const next1 = iter1.next();
          const next2 = iter2.next();
          if (next1.done || next2.done) break;
          yield [next1.value, next2.value];
        }
      },
    });
  }

  /**
   * Соединяет этот итератор с другим (ленивая операция).
   *
   * @param other - Второй итератор
   * @returns Новый Iter с элементами обоих итераторов
   *
   * @example
   * ```ts
   * Iter.from([1, 2])
   *   .chain([3, 4])
   *   .collect(); // [1, 2, 3, 4]
   * ```
   */
  chain(other: Iterable<T>): Iter<T> {
    const source = this;
    return new Iter({
      *[Symbol.iterator]() {
        yield* source;
        yield* other;
      },
    });
  }

  /**
   * Берёт каждый n-ный элемент (ленивая операция).
   *
   * @param step - Шаг
   * @returns Новый Iter с каждым n-ным элементом
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3, 4, 5, 6])
   *   .stepBy(2)
   *   .collect(); // [1, 3, 5]
   * ```
   */
  stepBy(step: number): Iter<T> {
    if (step <= 0) {
      throw new Error("step must be positive");
    }
    return new Iter(
      this.source,
      [...this.ops, { type: "stepBy", fn: () => {}, param: step }],
      this.opsMask | IterOp.StepBy
    );
  }

  /**
   * Выполняет действие для каждого элемента без изменения (ленивая операция).
   * Полезно для отладки или побочных эффектов.
   *
   * @param fn - Функция для выполнения
   * @returns Тот же Iter
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3])
   *   .inspect(x => console.log('processing:', x))
   *   .map(x => x * 2)
   *   .collect();
   * ```
   */
  inspect(fn: (value: T, index: number) => void): Iter<T> {
    return new Iter(
      this.source,
      [...this.ops, { type: "inspect", fn }],
      this.opsMask | IterOp.Inspect
    );
  }

  /**
   * Удаляет дубликаты (ленивая операция).
   * Использует Set для отслеживания уникальности.
   *
   * @returns Новый Iter без дубликатов
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 2, 3, 1, 4])
   *   .unique()
   *   .collect(); // [1, 2, 3, 4]
   * ```
   */
  unique(): Iter<T> {
    return new Iter(
      this.source,
      [...this.ops, { type: "unique", fn: () => {} }],
      this.opsMask | IterOp.Unique
    );
  }

  /**
   * Удаляет дубликаты по ключу (ленивая операция).
   *
   * @template K - Тип ключа
   * @param keyFn - Функция получения ключа
   * @returns Новый Iter без дубликатов по ключу
   *
   * @example
   * ```ts
   * Iter.from([{id: 1, name: 'A'}, {id: 1, name: 'B'}, {id: 2, name: 'C'}])
   *   .uniqueBy(obj => obj.id)
   *   .collect(); // [{id: 1, name: 'A'}, {id: 2, name: 'C'}]
   * ```
   */
  uniqueBy<K>(keyFn: (value: T) => K): Iter<T> {
    return new Iter(
      this.source,
      [...this.ops, { type: "uniqueBy", fn: keyFn }],
      this.opsMask | IterOp.UniqueBy
    );
  }

  // ============ ПОТРЕБЛЯЮЩИЕ ОПЕРАЦИИ (collecting operations) ============

  /**
   * Собирает все элементы в массив (потребляющая операция).
   *
   * @returns Массив со всеми элементами
   *
   * @example
   * ```ts
   * const arr = Iter.from([1, 2, 3]).collect();
   * ```
   */
  collect(): T[] {
    // Fast path 1: нет операций и это массив - возвращаем копию
    if (this.ops.length === 0 && this.isArray) {
      return (this.source as T[]).slice();
    }

    // Fast path 2: только map на typed array - прямой доступ с трансформацией
    if (
      this.isTypedArray &&
      (this.opsMask & IterOp.Map) !== 0 &&
      (this.opsMask & ~IterOp.Map & ~IterOp.Take & ~IterOp.Skip & ~IterOp.StepBy & ~IterOp.TakeWhile & ~IterOp.SkipWhile) === 0
    ) {
      return this.collectTypedArrayMapOnly();
    }

    // Оптимизация: если есть take, предсказываем размер
    let estimatedSize: number | null = null;
    for (const op of this.ops) {
      if (op.type === "take" && typeof op.param === "number") {
        estimatedSize = op.param;
        break;
      }
    }

    const result: T[] = estimatedSize !== null ? [] : [];
    if (estimatedSize !== null && estimatedSize > 0) {
      result.length = estimatedSize;
    }

    let i = 0;
    for (const value of this) {
      if (estimatedSize !== null && i < estimatedSize) {
        result[i++] = value;
      } else {
        result.push(value);
      }
    }

    if (estimatedSize !== null && i < estimatedSize) {
      result.length = i;
    }

    return result;
  }

  /**
   * Fast path для typed array с только map операциями.
   * Прямой доступ без iterator overhead.
   */
  private collectTypedArrayMapOnly(): T[] {
    const source = this.source as unknown as ArrayLike<number>;
    const len = source.length;
    let takeCount = 0;
    let takeLimit: number | null = null;
    let skipCount = 0;
    let skipLimit: number | null = null;
    let stepByStep: number | null = null;
    let stepCounter = 0;

    // Извлекаем параметры из операций
    for (const op of this.ops) {
      if (op.type === "take" && typeof op.param === "number") {
        takeLimit = op.param;
      } else if (op.type === "skip" && typeof op.param === "number") {
        skipLimit = op.param;
      } else if (op.type === "stepBy" && typeof op.param === "number") {
        stepByStep = op.param;
      }
    }

    const result: T[] = [];
    let i = 0;

    for (; i < len; i++) {
      if (skipLimit !== null && skipCount < skipLimit) {
        skipCount++;
        continue;
      }

      if (stepByStep !== null) {
        if (stepCounter++ % stepByStep !== 0) {
          continue;
        }
      }

      if (takeLimit !== null && takeCount >= takeLimit) {
        break;
      }

      let value: any = source[i];
      for (const op of this.ops) {
        if (op.type === "map") {
          const mapFn = op.fn as (value: any, index: number) => any;
          value = mapFn(value, i);
        }
      }

      result[takeCount++] = value;
    }

    return result;
  }

  /**
   * Свёртывает итератор в одно значение слева направо (потребляющая операция).
   * Аналог reduce в JS или fold в Rust.
   *
   * @template U - Тип аккумулятора
   * @param initial - Начальное значение аккумулятора
   * @param fn - Функция свёртки
   * @returns Финальное значение аккумулятора
   *
   * @example
   * ```ts
   * const sum = Iter.from([1, 2, 3, 4])
   *   .fold(0, (acc, x) => acc + x); // 10
   * ```
   */
  fold<U>(initial: U, fn: (acc: U, value: T, index: number) => U): U {
    // Fast path: нет операций и это массив - прямой доступ
    if (this.ops.length === 0 && this.isArray) {
      const arr = this.source as T[];
      const len = arr.length;
      let acc = initial;
      for (let i = 0; i < len; i++) {
        acc = fn(acc, arr[i], i);
      }
      return acc;
    }

    // Общий случай: выполняем pipeline и свёртываем
    let acc = initial;
    let index = 0;
    for (const value of this) {
      acc = fn(acc, value, index++);
    }
    return acc;
  }

  /**
   * Свёртывает итератор справа налево (потребляющая операция).
   * Требует полной материализации в память.
   *
   * @template U - Тип аккумулятора
   * @param initial - Начальное значение аккумулятора
   * @param fn - Функция свёртки
   * @returns Финальное значение аккумулятора
   *
   * @example
   * ```ts
   * const result = Iter.from(['a', 'b', 'c'])
   *   .foldRight('', (acc, x) => acc + x); // "cba"
   * ```
   */
  foldRight<U>(initial: U, fn: (acc: U, value: T, index: number) => U): U {
    const arr = this.collect();
    let acc = initial;
    for (let i = arr.length - 1; i >= 0; i--) {
      acc = fn(acc, arr[i], i);
    }
    return acc;
  }

  /**
   * Свёртывает непустой итератор, используя первый элемент как начальное значение.
   * Возвращает None если итератор пустой.
   *
   * @param fn - Функция свёртки
   * @returns Option со значением или None
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3, 4])
   *   .reduce((acc, x) => acc + x); // Some(10)
   * Iter.empty<number>()
   *   .reduce((acc, x) => acc + x); // None
   * ```
   */
  reduce(fn: (acc: T, value: T, index: number) => T): Option<T> {
    // Fast path: нет операций и это массив - прямой доступ
    if (this.ops.length === 0 && this.isArray) {
      const arr = this.source as T[];
      const len = arr.length;
      if (len === 0) {
        return None.instance();
      }
      let acc = arr[0];
      for (let i = 1; i < len; i++) {
        acc = fn(acc, arr[i], i);
      }
      return new Some(acc);
    }

    // Общий случай
    const iter = this[Symbol.iterator]();
    const first = iter.next();
    if (first.done) {
      return None.instance();
    }
    let acc = first.value;
    let index = 1;
    while (true) {
      const next = iter.next();
      if (next.done) break;
      acc = fn(acc, next.value, index++);
    }
    return new Some(acc);
  }

  /**
   * Выполняет функцию для каждого элемента (потребляющая операция).
   *
   * @param fn - Функция для выполнения
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3]).forEach(x => console.log(x));
   * ```
   */
  forEach(fn: (value: T, index: number) => void): void {
    // Fast path: нет операций и это массив - прямой доступ
    if (this.ops.length === 0 && this.isArray) {
      const arr = this.source as T[];
      const len = arr.length;
      for (let i = 0; i < len; i++) {
        fn(arr[i], i);
      }
      return;
    }

    let index = 0;
    for (const value of this) {
      fn(value, index++);
    }
  }

  /**
   * Считает количество элементов (потребляющая операция).
   *
   * @returns Количество элементов
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3]).count(); // 3
   * ```
   */
  count(): number {
    // Fast path: нет операций и это массив - используем length
    if (this.ops.length === 0 && this.isArray) {
      return (this.source as T[]).length;
    }

    let count = 0;
    for (const _ of this) {
      count++;
    }
    return count;
  }

  /**
   * Находит первый элемент, удовлетворяющий предикату (потребляющая операция).
   *
   * @param predicate - Функция-предикат
   * @returns Option с найденным элементом или None
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3, 4])
   *   .find(x => x > 2); // Some(3)
   * ```
   */
  find(predicate: (value: T, index: number) => boolean): Option<T> {
    // Fast path: нет операций и это массив - прямой доступ
    if (this.ops.length === 0 && this.isArray) {
      const arr = this.source as T[];
      const len = arr.length;
      for (let i = 0; i < len; i++) {
        if (predicate(arr[i], i)) {
          return new Some(arr[i]);
        }
      }
      return None.instance();
    }

    // Общий случай
    let index = 0;
    for (const value of this) {
      if (predicate(value, index++)) {
        return new Some(value);
      }
    }
    return None.instance();
  }

  /**
   * Находит первый элемент, удовлетворяющий предикату (потребляющая операция).
   * Аналог find в JS массивах.
   *
   * @param predicate - Функция-предикат
   * @returns Найденный элемент или undefined если не найден
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3, 4]).findJS(x => x > 2); // 3
   * Iter.from([1, 2, 3, 4]).findJS(x => x > 10); // undefined
   * ```
   */
  findJS(predicate: (value: T, index: number) => boolean): T | undefined {
    const result = this.find(predicate);
    return result.isSome() ? result.unwrap() : undefined;
  }

  /**
   * Находит позицию первого элемента, удовлетворяющего предикату (потребляющая операция).
   *
   * @param predicate - Функция-предикат
   * @returns Option с индексом или None
   *
   * @example
   * ```ts
   * Iter.from(['a', 'b', 'c'])
   *   .position(x => x === 'b'); // Some(1)
   * ```
   */
  position(predicate: (value: T, index: number) => boolean): Option<number> {
    // Fast path: нет операций и это массив - прямой доступ
    if (this.ops.length === 0 && this.isArray) {
      const arr = this.source as T[];
      const len = arr.length;
      for (let i = 0; i < len; i++) {
        if (predicate(arr[i], i)) {
          return new Some(i);
        }
      }
      return None.instance();
    }

    let index = 0;
    for (const value of this) {
      if (predicate(value, index)) {
        return new Some(index);
      }
      index++;
    }
    return None.instance();
  }

  /**
   * Находит индекс первого элемента, удовлетворяющего предикату (потребляющая операция).
   * Аналог findIndex в JS массивах.
   *
   * @param predicate - Функция-предикат
   * @returns Индекс найденного элемента или -1 если не найден
   *
   * @example
   * ```ts
   * Iter.from(['a', 'b', 'c']).findIndex(x => x === 'b'); // 1
   * Iter.from(['a', 'b', 'c']).findIndex(x => x === 'd'); // -1
   * ```
   */
  findIndex(predicate: (value: T, index: number) => boolean): number {
    const result = this.position(predicate);
    return result.isSome() ? result.unwrap() : -1;
  }

  /**
   * Проверяет, что все элементы удовлетворяют предикату (потребляющая операция).
   *
   * @param predicate - Функция-предикат
   * @returns true если все элементы удовлетворяют предикату
   *
   * @example
   * ```ts
   * Iter.from([2, 4, 6]).all(x => x % 2 === 0); // true
   * Iter.from([2, 3, 6]).all(x => x % 2 === 0); // false
   * ```
   */
  all(predicate: (value: T, index: number) => boolean): boolean {
    // Fast path: нет операций и это массив - прямой доступ
    if (this.ops.length === 0 && this.isArray) {
      const arr = this.source as T[];
      const len = arr.length;
      for (let i = 0; i < len; i++) {
        if (!predicate(arr[i], i)) {
          return false;
        }
      }
      return true;
    }

    let index = 0;
    for (const value of this) {
      if (!predicate(value, index++)) {
        return false;
      }
    }
    return true;
  }

  /**
   * Проверяет, что все элементы удовлетворяют предикату (потребляющая операция).
   * Аналог every в JS массивах.
   *
   * @param predicate - Функция-предикат
   * @returns true если все элементы удовлетворяют предикату
   *
   * @example
   * ```ts
   * Iter.from([2, 4, 6]).everyJS(x => x % 2 === 0); // true
   * Iter.from([2, 3, 6]).everyJS(x => x % 2 === 0); // false
   * ```
   */
  everyJS(predicate: (value: T, index: number) => boolean): boolean {
    return this.all(predicate);
  }

  /**
   * Проверяет, что хотя бы один элемент удовлетворяет предикату (потребляющая операция).
   *
   * @param predicate - Функция-предикат
   * @returns true если хотя бы один элемент удовлетворяет предикату
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3]).any(x => x > 2); // true
   * Iter.from([1, 2, 3]).any(x => x > 5); // false
   * ```
   */
  any(predicate: (value: T, index: number) => boolean): boolean {
    // Fast path: нет операций и это массив - прямой доступ
    if (this.ops.length === 0 && this.isArray) {
      const arr = this.source as T[];
      const len = arr.length;
      for (let i = 0; i < len; i++) {
        if (predicate(arr[i], i)) {
          return true;
        }
      }
      return false;
    }

    let index = 0;
    for (const value of this) {
      if (predicate(value, index++)) {
        return true;
      }
    }
    return false;
  }

  /**
   * Проверяет, что хотя бы один элемент удовлетворяет предикату (потребляющая операция).
   * Аналог some в JS массивах.
   *
   * @param predicate - Функция-предикат
   * @returns true если хотя бы один элемент удовлетворяет предикату
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3]).someJS(x => x > 2); // true
   * Iter.from([1, 2, 3]).someJS(x => x > 5); // false
   * ```
   */
  someJS(predicate: (value: T, index: number) => boolean): boolean {
    return this.any(predicate);
  }

  /**
   * Разделяет итератор на две группы по предикату (потребляющая операция).
   *
   * @param predicate - Функция-предикат
   * @returns Кортеж [элементы true, элементы false]
   *
   * @example
   * ```ts
   * const [evens, odds] = Iter.from([1, 2, 3, 4])
   *   .partition(x => x % 2 === 0);
   * // evens: [2, 4], odds: [1, 3]
   * ```
   */
  partition(predicate: (value: T, index: number) => boolean): [T[], T[]] {
    const truthy: T[] = [];
    const falsy: T[] = [];
    let index = 0;
    for (const value of this) {
      if (predicate(value, index++)) {
        truthy.push(value);
      } else {
        falsy.push(value);
      }
    }
    return [truthy, falsy];
  }

  /**
   * Находит первый элемент (потребляющая операция).
   *
   * @returns Option с первым элементом или None
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3]).first(); // Some(1)
   * Iter.empty<number>().first(); // None
   * ```
   */
  first(): Option<T> {
    // Fast path: нет операций и это массив - прямой доступ
    if (this.ops.length === 0 && this.isArray) {
      const arr = this.source as T[];
      return arr.length > 0 ? new Some(arr[0]) : None.instance();
    }

    for (const value of this) {
      return new Some(value);
    }
    return None.instance();
  }

  /**
   * Находит последний элемент (потребляющая операция).
   *
   * @returns Option с последним элементом или None
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3]).last(); // Some(3)
   * Iter.empty<number>().last(); // None
   * ```
   */
  last(): Option<T> {
    // Fast path: нет операций и это массив - прямой доступ
    if (this.ops.length === 0 && this.isArray) {
      const arr = this.source as T[];
      const len = arr.length;
      return len > 0 ? new Some(arr[len - 1]) : None.instance();
    }

    let last: Option<T> = None.instance();
    for (const value of this) {
      last = new Some(value);
    }
    return last;
  }

  /**
   * Находит n-ный элемент (потребляющая операция).
   *
   * @param n - Индекс элемента
   * @returns Option с n-ным элементом или None
   *
   * @example
   * ```ts
   * Iter.from(['a', 'b', 'c']).nth(1); // Some('b')
   * Iter.from(['a', 'b']).nth(5); // None
   * ```
   */
  nth(n: number): Option<T> {
    // Fast path: нет операций и это массив - прямой доступ
    if (this.ops.length === 0 && this.isArray) {
      const arr = this.source as T[];
      return n >= 0 && n < arr.length ? new Some(arr[n]) : None.instance();
    }

    let index = 0;
    for (const value of this) {
      if (index === n) {
        return new Some(value);
      }
      index++;
    }
    return None.instance();
  }

  /**
   * Проверяет, содержит ли итератор указанный элемент (потребляющая операция).
   * Аналог includes в JS массивах.
   *
   * @param searchElement - Искомый элемент
   * @param fromIndex - Индекс начала поиска (опционально)
   * @returns true если элемент найден, иначе false
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3]).includes(2); // true
   * Iter.from([1, 2, 3]).includes(4); // false
   * ```
   */
  includes(searchElement: T, fromIndex?: number): boolean {
    let index = 0;
    for (const value of this) {
      if (fromIndex !== undefined && index < fromIndex) {
        index++;
        continue;
      }
      if (value === searchElement) {
        return true;
      }
      index++;
    }
    return false;
  }

  /**
   * Находит максимальный элемент (потребляющая операция).
   *
   * @returns Option с максимальным элементом или None
   *
   * @example
   * ```ts
   * Iter.from([3, 1, 4, 1, 5]).max(); // Some(5)
   * Iter.empty<number>().max(); // None
   * ```
   */
  max(): Option<T> {
    let max: Option<T> = None.instance();
    for (const value of this) {
      if (max.isNone()) {
        max = new Some(value);
      } else if (value > max.unwrap()) {
        max = new Some(value);
      }
    }
    return max;
  }

  /**
   * Находит минимальный элемент (потребляющая операция).
   *
   * @returns Option с минимальным элементом или None
   *
   * @example
   * ```ts
   * Iter.from([3, 1, 4, 1, 5]).min(); // Some(1)
   * Iter.empty<number>().min(); // None
   * ```
   */
  min(): Option<T> {
    let min: Option<T> = None.instance();
    for (const value of this) {
      if (min.isNone()) {
        min = new Some(value);
      } else if (value < min.unwrap()) {
        min = new Some(value);
      }
    }
    return min;
  }

  /**
   * Находит максимальный элемент по ключу (потребляющая операция).
   *
   * @template K - Тип ключа для сравнения
   * @param keyFn - Функция получения ключа
   * @returns Option с элементом, имеющим максимальный ключ, или None
   *
   * @example
   * ```ts
   * Iter.from([{age: 20}, {age: 30}, {age: 25}])
   *   .maxBy(x => x.age); // Some({age: 30})
   * ```
   */
  maxBy<K>(keyFn: (value: T) => K): Option<T> {
    let max: Option<[T, K]> = None.instance();
    for (const value of this) {
      const key = keyFn(value);
      if (max.isNone()) {
        max = new Some<[T, K]>([value, key]);
      } else {
        const [, maxKey] = max.unwrap();
        if (key > maxKey) {
          max = new Some<[T, K]>([value, key]);
        }
      }
    }
    return max.map(([value]) => value);
  }

  /**
   * Находит минимальный элемент по ключу (потребляющая операция).
   *
   * @template K - Тип ключа для сравнения
   * @param keyFn - Функция получения ключа
   * @returns Option с элементом, имеющим минимальный ключ, или None
   *
   * @example
   * ```ts
   * Iter.from([{age: 20}, {age: 30}, {age: 25}])
   *   .minBy(x => x.age); // Some({age: 20})
   * ```
   */
  minBy<K>(keyFn: (value: T) => K): Option<T> {
    let min: Option<[T, K]> = None.instance();
    for (const value of this) {
      const key = keyFn(value);
      if (min.isNone()) {
        min = new Some<[T, K]>([value, key]);
      } else {
        const [, minKey] = min.unwrap();
        if (key < minKey) {
          min = new Some<[T, K]>([value, key]);
        }
      }
    }
    return min.map(([value]) => value);
  }

  /**
   * Суммирует числовые элементы (потребляющая операция).
   *
   * @returns Сумма всех элементов
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3, 4]).sum(); // 10
   * ```
   */
  sum(this: Iter<number>): number {
    // Fast path: нет операций и это массив - прямой доступ
    if (this.ops.length === 0 && this.isArray) {
      const arr = this.source as number[];
      const len = arr.length;
      let sum = 0;
      for (let i = 0; i < len; i++) {
        sum += arr[i];
      }
      return sum;
    }
    return this.fold(0, (acc, x) => acc + x);
  }

  /**
   * Перемножает числовые элементы (потребляющая операция).
   *
   * @returns Произведение всех элементов
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3, 4]).product(); // 24
   * ```
   */
  product(this: Iter<number>): number {
    return this.fold(1, (acc, x) => acc * x);
  }

  /**
   * Объединяет строковые элементы в одну строку (потребляющая операция).
   *
   * @param separator - Разделитель (по умолчанию '')
   * @returns Объединённая строка
   *
   * @example
   * ```ts
   * Iter.from(['a', 'b', 'c']).join('-'); // "a-b-c"
   * ```
   */
  join(this: Iter<string>, separator: string = ""): string {
    return this.collect().join(separator);
  }

  /**
   * Собирает элементы в Set (потребляющая операция).
   *
   * @returns Set со всеми элементами
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 2, 3, 1]).toSet(); // Set {1, 2, 3}
   * ```
   */
  toSet(): Set<T> {
    return new Set(this);
  }

  /**
   * Собирает пары ключ-значение в Map (потребляющая операция).
   *
   * @template K - Тип ключа
   * @template V - Тип значения
   * @returns Map со всеми парами
   *
   * @example
   * ```ts
   * Iter.from([[1, 'a'], [2, 'b']]).toMap();
   * // Map {1 => 'a', 2 => 'b'}
   * ```
   */
  toMap<K, V>(this: Iter<[K, V]>): Map<K, V> {
    return new Map(this);
  }

  /**
   * Группирует элементы по ключу (потребляющая операция).
   *
   * @template K - Тип ключа
   * @param keyFn - Функция получения ключа
   * @returns Map с группами элементов
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3, 4, 5, 6])
   *   .groupBy(x => x % 2 === 0 ? 'even' : 'odd');
   * // Map {'odd' => [1, 3, 5], 'even' => [2, 4, 6]}
   * ```
   */
  groupBy<K>(keyFn: (value: T) => K): Map<K, T[]> {
    const map = new Map<K, T[]>();
    for (const value of this) {
      const key = keyFn(value);
      const group = map.get(key);
      if (group) {
        group.push(value);
      } else {
        map.set(key, [value]);
      }
    }
    return map;
  }

  /**
   * Сортирует элементы (потребляющая операция).
   * Требует полной материализации в память.
   *
   * @param compareFn - Функция сравнения (опциональная)
   * @returns Новый Iter с отсортированными элементами
   *
   * @example
   * ```ts
   * Iter.from([3, 1, 4, 1, 5])
   *   .sort()
   *   .collect(); // [1, 1, 3, 4, 5]
   * ```
   */
  sort(compareFn?: (a: T, b: T) => number): Iter<T> {
    return new Iter(this.collect().sort(compareFn));
  }

  /**
   * Сортирует элементы по ключу (потребляющая операция).
   * Требует полной материализации в память.
   *
   * @template K - Тип ключа для сортировки
   * @param keyFn - Функция получения ключа
   * @returns Новый Iter с отсортированными элементами
   *
   * @example
   * ```ts
   * Iter.from([{age: 30}, {age: 20}, {age: 25}])
   *   .sortBy(x => x.age)
   *   .collect(); // [{age: 20}, {age: 25}, {age: 30}]
   * ```
   */
  sortBy<K>(keyFn: (value: T) => K): Iter<T> {
    return new Iter(
      this.collect().sort((a, b) => {
        const keyA = keyFn(a);
        const keyB = keyFn(b);
        if (keyA < keyB) return -1;
        if (keyA > keyB) return 1;
        return 0;
      })
    );
  }

  /**
   * Разворачивает порядок элементов (потребляющая операция).
   * Требует полной материализации в память.
   *
   * @returns Новый Iter с элементами в обратном порядке
   *
   * @example
   * ```ts
   * Iter.from([1, 2, 3])
   *   .reverse()
   *   .collect(); // [3, 2, 1]
   * ```
   */
  reverse(): Iter<T> {
    return new Iter(this.collect().reverse());
  }

  /**
   * Преобразует Iter в ParIter для параллельной обработки
   *
   * @param config - Конфигурация параллельного выполнения
   * @returns ParIter для параллельной обработки
   *
   * @example
   * ```ts
   * Iter.from(data)
   *   .map(x => heavy(x))
   *   .filter(x => x > 0)
   *   .par({ workers: 4, chunkSize: 10_000 })
   *   .reduce((a, b) => a + b)
   * ```
   */
}
