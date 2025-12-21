/**
 * Option type represents a value that may be present (Some) or absent (None).
 * This is an alternative to using null or undefined to represent missing values.
 *
 * @template T - Type of the value
 *
 * @example
 * ```ts
 * function findUser(id: number): Option<User> {
 *   const user = users.find(u => u.id === id);
 *   return user ? new Some(user) : None.instance();
 * }
 * ```
 */
export type Option<T> = Some<T> | None;

/**
 * Interface for the Option type, defining all available methods.
 *
 * @template T - Type of the value
 */
interface IOption<T> {
  /**
   * Checks if the Option is Some (contains a value).
   *
   * @returns true if the Option is Some, otherwise false
   */
  isSome(): this is Some<T>;

  /**
   * Checks if the Option is None (does not contain a value).
   *
   * @returns true if the Option is None, otherwise false
   */
  isNone(): this is None;

  /**
   * Extracts the value from Some. Throws an error if called on None.
   *
   * @throws {Error} If called on None
   * @returns Value of type T
   */
  unwrap(): T;

  /**
   * Extracts the value from Some or returns the default value for None.
   *
   * @param defaultValue - Default value
   * @returns Value of type T
   */
  unwrapOr(defaultValue: T): T;

  /**
   * Extracts the value from Some or computes a default value for None.
   *
   * @param fn - Function that returns a default value
   * @returns Value of type T
   */
  unwrapOrElse(fn: () => T): T;

  /**
   * Applies a function to the Some value, leaving None unchanged.
   *
   * @template U - Type of the transformation result
   * @param fn - Transformation function
   * @returns New Option with transformed value
   */
  map<U>(fn: (value: T) => U): Option<U>;

  /**
   * Applies a function that returns an Option to the Some value.
   * If the Option is Some, applies the function; if None, returns None unchanged.
   *
   * @template U - Type of the new Option value
   * @param fn - Function that takes a value and returns an Option
   * @returns New Option
   */
  andThen<U>(fn: (value: T) => Option<U>): Option<U>;

  /**
   * Matches the Option with handlers for Some and None.
   *
   * @template U - Type of the return value
   * @param handlers - Object with handlers for Some and None
   * @returns Result of the handling
   */
  match<U>(handlers: { Some(value: T): U; None: U }): U;

  /**
   * Returns Some if this is Some, otherwise returns another Option.
   *
   * @param other - Alternative Option
   * @returns Some if this is Some, otherwise other
   */
  or(other: Option<T>): Option<T>;

  /**
   * Returns Some if this is Some, otherwise calls a function to get an alternative Option.
   *
   * @param fn - Function that returns an Option
   * @returns Some if this is Some, otherwise the result of the function
   */
  orElse(fn: () => Option<T>): Option<T>;

  /**
   * Filters the Some value by a predicate. Returns None if the predicate returns false.
   *
   * @param predicate - Predicate function to test the value
   * @returns Some if the predicate returns true, otherwise None
   */
  filter(predicate: (value: T) => boolean): Option<T>;
}

/**
 * Class representing an Option with a present value.
 *
 * @template T - Type of the value
 *
 * @example
 * ```ts
 * const option = new Some(42);
 * if (option.isSome()) {
 *   console.log(option.value); // 42
 * }
 * ```
 */
export class Some<T> implements IOption<T> {
  readonly _tag = "Some" as const;

  /**
   * Creates a new Some instance with the specified value.
   *
   * @param value - Value
   */
  constructor(public readonly value: T) {}

  /**
   * Static constructor for creating Some.
   *
   * @template T - Type of the value
   * @param value - Value
   * @returns New Some instance
   *
   * @example
   * ```ts
   * const option = Some.of(42);
   * ```
   */
  static of<T>(value: T): Some<T> {
    return new Some(value);
  }

  /**
   * Collects an array of Options into a single Option with an array of values.
   * If at least one Option is None, returns None.
   *
   * @template T - Type of the values
   * @param options - Array of Options to collect
   * @returns Option with array of values or None
   *
   * @example
   * ```ts
   * const options = [Some.of(1), Some.of(2), Some.of(3)];
   * const collected = Some.collect(options); // Some([1, 2, 3])
   * ```
   */
  static collect<T>(options: Option<T>[]): Option<T[]> {
    const values: T[] = [];
    for (const option of options) {
      if (option.isNone()) {
        return None.instance();
      }
      values.push(option.unwrap());
    }
    return new Some(values);
  }

  /**
   * Partitions an array of Options into two arrays: one with Some, another with None.
   *
   * @template T - Type of the values
   * @param options - Array of Options to partition
   * @returns Tuple of two arrays: [Some[], None[]]
   *
   * @example
   * ```ts
   * const options = [Some.of(1), None.instance(), Some.of(3)];
   * const [somes, nones] = Some.partition(options);
   * // somes: [Some(1), Some(3)]
   * // nones: [None, None]
   * ```
   */
  static partition<T>(options: Option<T>[]): [Some<T>[], None[]] {
    const somes: Some<T>[] = [];
    const nones: None[] = [];
    for (const option of options) {
      if (option.isSome()) {
        somes.push(option as Some<T>);
      } else {
        nones.push(None.instance());
      }
    }
    return [somes, nones];
  }

  isSome(): this is Some<T> {
    return true;
  }

  isNone(): this is None {
    return false;
  }

  unwrap(): T {
    return this.value;
  }

  unwrapOr(_defaultValue: T): T {
    return this.value;
  }

  unwrapOrElse(_fn: (value: T) => T): T {
    return this.value;
  }

  map<U>(fn: (value: T) => U): Option<U> {
    return new Some<U>(fn(this.value));
  }

  andThen<U>(fn: (value: T) => Option<U>): Option<U> {
    return fn(this.value);
  }

  match<U>(handlers: { Some(value: T): U; None: U }): U {
    return handlers.Some(this.value);
  }

  or(_other: Option<T>): Option<T> {
    return this;
  }

  orElse(_fn: () => Option<T>): Option<T> {
    return this;
  }

  filter(predicate: (value: T) => boolean): Option<T> {
    return predicate(this.value) ? this : None.instance();
  }

  /**
   * Returns a string representation of Some.
   *
   * @returns String in the format "Some(value)"
   */
  toString() {
    return `Some(${String(this.value)})`;
  }

  /**
   * Converts Some to a JSON-compatible object.
   *
   * @returns Object with fields some: true and value
   */
  toJSON() {
    return { some: true, value: this.value };
  }
}

/**
 * Class representing an Option without a value (missing value).
 * Implemented as a singleton for memory optimization.
 *
 * @example
 * ```ts
 * const option = None.instance();
 * if (option.isNone()) {
 *   console.log("Value is missing");
 * }
 * ```
 */
export class None implements IOption<never> {
  readonly _tag = "None" as const;
  private static _instance: None | null = null;

  /**
   * Private constructor for implementing the singleton pattern.
   */
  private constructor() {}

  /**
   * Returns the single None instance (singleton).
   *
   * @returns None instance
   *
   * @example
   * ```ts
   * const none1 = None.instance();
   * const none2 = None.instance();
   * console.log(none1 === none2); // true
   * ```
   */
  static instance(): None {
    if (None._instance === null) {
      None._instance = new None();
    }
    return None._instance;
  }

  /**
   * Static constructor for creating None (returns singleton).
   *
   * @returns None instance
   *
   * @example
   * ```ts
   * const option = None.of();
   * ```
   */
  static of(): None {
    return None.instance();
  }

  isSome(): this is Some<never> {
    return false;
  }

  isNone(): this is None {
    return true;
  }

  unwrap(): never {
    throw new Error("Called unwrap() on None");
  }

  unwrapOr<T>(defaultValue: T): T {
    return defaultValue;
  }

  unwrapOrElse<T>(fn: () => T): T {
    return fn();
  }

  andThen<U>(_fn: (value: never) => Option<U>): None {
    return None.instance();
  }

  map<U>(_fn: (value: never) => U): None {
    return None.instance();
  }

  match<U>(handlers: { Some(value: never): U; None: U }): U {
    return handlers.None;
  }

  or<T>(other: Option<T>): Option<T> {
    return other;
  }

  orElse<T>(fn: () => Option<T>): Option<T> {
    return fn();
  }

  filter(_predicate: (value: never) => boolean): None {
    return None.instance();
  }

  /**
   * Returns a string representation of None.
   *
   * @returns String "None"
   */
  toString() {
    return "None";
  }

  /**
   * Converts None to a JSON-compatible object.
   *
   * @returns Object with field none: true
   */
  toJSON() {
    return { none: true };
  }
}
