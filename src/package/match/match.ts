/**
 * A Rust-like pattern matching function
 * Usage:
 * const matcher = match({
 *   1: v => v,
 *   2: v => v * 2,
 *   _: v => v * 3 // default case
 * });
 *
 * matcher(5); // will use the default case and return 5 * 3 = 15
 * matcher(1); // will use the 1 case and return 1
 */

export type Matcher<T, R> = Record<string | number, (value: T) => R> & { _: (value: T) => R };

export function match<T, R>(patterns: Matcher<T, R>): (value: T) => R {
  return function(value: T): R {
    // Check if the string representation of the value exists as a key in patterns
    const valueStr = String(value);

    if (valueStr in patterns) {
      return patterns[valueStr as keyof typeof patterns](value);
    }

    // Use default case
    return patterns._(value);
  };
}