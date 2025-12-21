export type Option<T> = Some<T> | None;

interface IOption<T> {
  isSome(): this is Some<T>;
  isNone(): this is None;
  unwrap(): T;
  unwrapOr(defaultValue: T): T;
  unwrapOrElse(fn: (value: T) => T): T;
  map<U>(fn: (value: T) => U): Option<U>;
  andThen<U>(fn: (value: T) => Option<U>): Option<U>;
}

export class Some<T> implements IOption<T> {
  readonly _tag = "Some" as const;
  constructor(public readonly value: T) {}

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

  toString() {
    return `Some(${String(this.value)})`;
  }

  toJSON() {
    return { some: true, value: this.value };
  }
}

export class None implements IOption<never> {
  readonly _tag = "None" as const;
  constructor() {}

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

  unwrapOrElse<T>(fn: (value: never) => T): T {
    return fn(undefined as never);
  }

  andThen<U>(_fn: (value: never) => Option<U>): None {
    return new None();
  }

  map<U>(_fn: (value: never) => U): None {
    return new None();
  }

  match<U>(handlers: { Some(value: never): U; None: U }): U {
    return handlers.None;
  }

  toString() {
    return "None";
  }

  toJSON() {
    return { none: true };
  }
}
