import type { Option } from "../option/option";
import { Some, None } from "../option/option";

/**
 * Result type represents the result of an operation that can be either successful (Ok)
 * or contain an error (Err). This is an alternative to using exceptions for error handling.
 *
 * @template T - Type of the success value
 * @template E - Type of the error
 *
 * @example
 * ```ts
 * function divide(a: number, b: number): Result<number, string> {
 *   if (b === 0) {
 *     return new Err("Division by zero");
 *   }
 *   return new Ok(a / b);
 * }
 * ```
 */
export type Result<T, E> = Ok<T> | Err<E>;

/**
 * Interface for the Result type, defining all available methods.
 *
 * @template T - Type of the success value
 * @template E - Type of the error
 */
interface IResult<T, E> {
  /**
   * Checks if the result is successful (Ok).
   *
   * @returns true if the result is Ok, otherwise false
   */
  isOk(): this is Ok<T>;

  /**
   * Checks if the result is an error (Err).
   *
   * @returns true if the result is Err, otherwise false
   */
  isErr(): this is Err<E>;

  /**
   * Extracts the value from Ok. Throws an error if called on Err.
   *
   * @throws {Error} If called on Err
   * @returns Value of type T
   */
  unwrap(): T;

  /**
   * Extracts the error from Err. Throws an error if called on Ok.
   *
   * @throws {Error} If called on Ok
   * @returns Error of type E
   */
  unwrapErr(): E;

  /**
   * Extracts the value from Ok or returns the default value for Err.
   *
   * @param defaultValue - Default value
   * @returns Value of type T
   */
  unwrapOr(defaultValue: T): T;

  /**
   * Extracts the value from Ok or computes a default value from the error for Err.
   *
   * @param fn - Function that takes an error and returns a default value
   * @returns Value of type T
   */
  unwrapOrElse(fn: (error: E) => T): T;

  /**
   * Applies a function to the Ok value, leaving Err unchanged.
   *
   * @template U - Type of the transformation result
   * @param fn - Transformation function
   * @returns New Result with transformed value
   */
  map<U>(fn: (value: T) => U): Result<U, E>;

  /**
   * Applies a function to the Err error, leaving Ok unchanged.
   *
   * @template F - Type of the new error
   * @param fn - Error transformation function
   * @returns New Result with transformed error
   */
  mapErr<F>(fn: (error: E) => F): Result<T, F>;

  /**
   * Applies a function that returns a Result to the Ok value.
   * If the result is Ok, applies the function; if Err, returns Err unchanged.
   *
   * @template U - Type of the new Result value
   * @template F - Type of the new Result error (defaults to E)
   * @param fn - Function that takes a value and returns a Result
   * @returns New Result
   */
  andThen<U, F = E>(fn: (value: T) => Result<U, F>): Result<U, E | F>;

  /**
   * Matches the Result with handlers for Ok and Err.
   *
   * @template U - Type of the return value
   * @param handlers - Object with handlers for Ok and Err
   * @returns Result of the handling
   */
  match<U>(handlers: { Ok(value: T): U; Err(error: E): U }): U;

  /**
   * Executes a function for the Ok value (for side-effects), returning the original Result.
   *
   * @param fn - Function to execute with the value
   * @returns Original Result unchanged
   */
  inspect(fn: (value: T) => void): Result<T, E>;

  /**
   * Executes a function for the Err error (for side-effects), returning the original Result.
   *
   * @param fn - Function to execute with the error
   * @returns Original Result unchanged
   */
  inspectErr(fn: (error: E) => void): Result<T, E>;

  /**
   * Extracts the value from Ok or throws an error with the specified message for Err.
   *
   * @param message - Error message
   * @throws {Error} If called on Err
   * @returns Value of type T
   */
  expect(message: string): T;

  /**
   * Extracts the error from Err or throws an error with the specified message for Ok.
   *
   * @param message - Error message
   * @throws {Error} If called on Ok
   * @returns Error of type E
   */
  expectErr(message: string): E;

  /**
   * Returns Ok if this is Ok, otherwise returns another Result.
   *
   * @template U - Type of the other Result value
   * @template F - Type of the other Result error
   * @param other - Alternative Result
   * @returns Ok if this is Ok, otherwise other
   */
  or<U, F>(other: Result<U, F>): Result<T | U, F>;

  /**
   * Returns Ok if this is Ok, otherwise calls a function to get an alternative Result.
   *
   * @template U - Type of the alternative Result value
   * @template F - Type of the alternative Result error
   * @param fn - Function that takes an error and returns a Result
   * @returns Ok if this is Ok, otherwise the result of the function
   */
  orElse<U, F>(fn: (error: E) => Result<U, F>): Result<T | U, F>;

  /**
   * Converts Result to Option: Ok becomes Some, Err becomes None.
   *
   * @returns Option with value if this is Ok, otherwise None
   */
  ok(): Option<T>;

  /**
   * Converts Result to Option: Err becomes Some, Ok becomes None.
   *
   * @returns Option with error if this is Err, otherwise None
   */
  err(): Option<E>;
}

/**
 * Class representing a successful operation result.
 *
 * @template T - Type of the success value
 *
 * @example
 * ```ts
 * const result = new Ok(42);
 * if (result.isOk()) {
 *   console.log(result.value); // 42
 * }
 * ```
 */
export class Ok<T> implements IResult<T, never> {
  readonly _tag = "Ok" as const;

  /**
   * Creates a new Ok instance with the specified value.
   *
   * @param value - Success value
   */
  constructor(public readonly value: T) {}

  /**
   * Static constructor for creating Ok.
   *
   * @template T - Type of the value
   * @param value - Success value
   * @returns New Ok instance
   *
   * @example
   * ```ts
   * const result = Ok.of(42);
   * ```
   */
  static of<T>(value: T): Ok<T> {
    return new Ok(value);
  }

  /**
   * Collects an array of Results into a single Result with an array of values.
   * If at least one Result is Err, returns the first Err.
   *
   * @template T - Type of the values
   * @template E - Type of the error
   * @param results - Array of Results to collect
   * @returns Result with array of values or the first Err
   *
   * @example
   * ```ts
   * const results = [Ok.of(1), Ok.of(2), Ok.of(3)];
   * const collected = Ok.collect(results); // Ok([1, 2, 3])
   * ```
   */
  static collect<T, E>(results: Result<T, E>[]): Result<T[], E> {
    const values: T[] = [];
    for (const result of results) {
      if (result.isErr()) {
        return result as Err<E>;
      }
      values.push(result.unwrap());
    }
    return new Ok(values);
  }

  /**
   * Partitions an array of Results into two arrays: one with Ok, another with Err.
   *
   * @template T - Type of the values
   * @template E - Type of the error
   * @param results - Array of Results to partition
   * @returns Tuple of two arrays: [Ok[], Err[]]
   *
   * @example
   * ```ts
   * const results = [Ok.of(1), Err.of("error"), Ok.of(3)];
   * const [oks, errs] = Ok.partition(results);
   * // oks: [Ok(1), Ok(3)]
   * // errs: [Err("error")]
   * ```
   */
  static partition<T, E>(results: Result<T, E>[]): [Ok<T>[], Err<E>[]] {
    const oks: Ok<T>[] = [];
    const errs: Err<E>[] = [];
    for (const result of results) {
      if (result.isOk()) {
        oks.push(result as Ok<T>);
      } else {
        errs.push(result as Err<E>);
      }
    }
    return [oks, errs];
  }

  isOk(): this is Ok<T> {
    return true;
  }

  isErr(): this is Err<never> {
    return false;
  }

  unwrap(): T {
    return this.value;
  }

  unwrapErr(): never {
    throw new Error("Called unwrapErr() on Ok");
  }

  unwrapOr(_defaultValue: T): T {
    return this.value;
  }

  unwrapOrElse(_fn: (error: never) => T): T {
    return this.value;
  }

  map<U>(fn: (value: T) => U): Result<U, never> {
    return new Ok(fn(this.value));
  }

  mapErr<F>(_fn: (error: never) => F): Result<T, F> {
    return new Ok(this.value);
  }

  andThen<U, F = never>(fn: (value: T) => Result<U, F>): Result<U, never | F> {
    return fn(this.value);
  }

  match<U>(handlers: { Ok(value: T): U; Err(error: never): U }): U {
    return handlers.Ok(this.value);
  }

  inspect(fn: (value: T) => void): Result<T, never> {
    fn(this.value);
    return this;
  }

  inspectErr(_fn: (error: never) => void): Result<T, never> {
    return this;
  }

  expect(_message: string): T {
    return this.value;
  }

  expectErr(message: string): never {
    throw new Error(message);
  }

  or<U, F>(_other: Result<U, F>): Result<T | U, F> {
    return this as Result<T | U, F>;
  }

  orElse<U, F>(_fn: (error: never) => Result<U, F>): Result<T | U, F> {
    return this as Result<T | U, F>;
  }

  ok(): Option<T> {
    return new Some(this.value);
  }

  err(): Option<never> {
    return None.instance();
  }

  /**
   * Returns a string representation of Ok.
   *
   * @returns String in the format "Ok(value)"
   */
  toString() {
    return `Ok(${String(this.value)})`;
  }

  /**
   * Converts Ok to a JSON-compatible object.
   *
   * @returns Object with fields ok: true and value
   */
  toJSON() {
    return { ok: true, value: this.value };
  }
}

/**
 * Class representing an error in an operation result.
 *
 * @template E - Type of the error
 *
 * @example
 * ```ts
 * const result = new Err("Something went wrong");
 * if (result.isErr()) {
 *   console.log(result.error); // "Something went wrong"
 * }
 * ```
 */
export class Err<E> implements IResult<never, E> {
  readonly _tag = "Err" as const;

  /**
   * Creates a new Err instance with the specified error.
   *
   * @param error - Error
   */
  constructor(public readonly error: E) {}

  /**
   * Static constructor for creating Err.
   *
   * @template E - Type of the error
   * @param error - Error
   * @returns New Err instance
   *
   * @example
   * ```ts
   * const result = Err.of("Error message");
   * ```
   */
  static of<E>(error: E): Err<E> {
    return new Err(error);
  }

  isOk(): this is Ok<never> {
    return false;
  }

  isErr(): this is Err<E> {
    return true;
  }

  unwrap(): never {
    throw new Error("Called unwrap() on Err");
  }

  unwrapErr(): E {
    return this.error;
  }

  unwrapOr<T>(defaultValue: T): T {
    return defaultValue;
  }

  unwrapOrElse<T>(fn: (error: E) => T): T {
    return fn(this.error);
  }

  map<U>(_fn: (value: never) => U): Result<U, E> {
    return new Err(this.error);
  }

  mapErr<F>(fn: (error: E) => F): Result<never, F> {
    return new Err(fn(this.error));
  }

  andThen<U, F = E>(_fn: (value: never) => Result<U, F>): Result<U, E | F> {
    return new Err(this.error) as Result<U, E | F>;
  }

  match<U>(handlers: { Ok(value: never): U; Err(error: E): U }): U {
    return handlers.Err(this.error);
  }

  inspect(_fn: (value: never) => void): Result<never, E> {
    return this;
  }

  inspectErr(fn: (error: E) => void): Result<never, E> {
    fn(this.error);
    return this;
  }

  expect(message: string): never {
    throw new Error(message);
  }

  expectErr(_message: string): E {
    return this.error;
  }

  or<U, F>(other: Result<U, F>): Result<U, F> {
    return other;
  }

  orElse<U, F>(fn: (error: E) => Result<U, F>): Result<U, F> {
    return fn(this.error);
  }

  ok(): Option<never> {
    return None.instance();
  }

  err(): Option<E> {
    return new Some(this.error);
  }

  /**
   * Returns a string representation of Err.
   *
   * @returns String in the format "Err(error)"
   */
  toString() {
    return `Err(${String(this.error)})`;
  }

  /**
   * Converts Err to a JSON-compatible object.
   *
   * @returns Object with fields ok: false and error
   */
  toJSON() {
    return { ok: false, error: this.error };
  }
}
