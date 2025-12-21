export type Result<T, E> = Ok<T> | Err<E>;

interface IResult<T, E> {
  isOk(): this is Ok<T>;
  isErr(): this is Err<E>;
  unwrap(): T;
  unwrapErr(): E;
  unwrapOr(defaultValue: T): T;
  unwrapOrElse(fn: (error: E) => T): T;
  map<U>(fn: (value: T) => U): Result<U, E>;
  mapErr<F>(fn: (error: E) => F): Result<T, F>;
  andThen<U, F = E>(fn: (value: T) => Result<U, F>): Result<U, E | F>;
  match<U>(handlers: { Ok(value: T): U; Err(error: E): U }): U;
}

export class Ok<T> implements IResult<T, never> {
  readonly _tag = "Ok" as const;
  constructor(public readonly value: T) {}

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

  andThen<U, F = never>(fn: (value: T) => Result<U, F>): Result<U, F> {
    return fn(this.value);
  }

  match<U>(handlers: { Ok(value: T): U; Err(error: never): U }): U {
    return handlers.Ok(this.value);
  }

  toString() {
    return `Ok(${String(this.value)})`;
  }

  toJSON() {
    return { ok: true, value: this.value };
  }
}

export class Err<E> implements IResult<never, E> {
  readonly _tag = "Err" as const;
  constructor(public readonly error: E) {}

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

  toString() {
    return `Err(${String(this.error)})`;
  }

  toJSON() {
    return { ok: false, error: this.error };
  }
}
