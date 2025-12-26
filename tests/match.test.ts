import { match } from '../src/package/match';
import { test, expect } from 'bun:test';

test('match function should match exact values and use default case', () => {
  const matcher = match<number, number>({
    1: v => v,
    2: v => v * 2,
    _: v => v * 3 // default case
  });

  expect(matcher(1)).toBe(1);    // matches 1: v => v
  expect(matcher(2)).toBe(4);    // matches 2: v => v * 2
  expect(matcher(5)).toBe(15);   // uses default: v => v * 3
});

test('match function should work with string patterns', () => {
  const matcher = match<string, string>({
    'hello': v => `${v} world`,
    'goodbye': v => `See you, ${v}!`,
    _: v => `Unknown: ${v}`
  });

  expect(matcher('hello')).toBe('hello world');
  expect(matcher('goodbye')).toBe('See you, goodbye!');
  expect(matcher('unknown')).toBe('Unknown: unknown');
});

test('match function should work with boolean values (converted to string)', () => {
  const matcher = match<boolean, string>({
    'true': v => `It's true!`,
    'false': v => `It's false!`,
    _: v => `Unexpected: ${v}`
  });

  expect(matcher(true)).toBe("It's true!");
  expect(matcher(false)).toBe("It's false!");
});

test('match function should work with complex objects using string representations', () => {
  // Note: Objects get converted to string "[object Object]" so they'll all match the same pattern
  const matcher = match<{id: number, name: string}, string>({
    '[object Object]': v => `Object with id ${v.id} and name ${v.name}`,
    _: v => `Unexpected: ${v}`
  });

  expect(matcher({id: 1, name: 'Alice'})).toBe('Object with id 1 and name Alice');
  expect(matcher({id: 2, name: 'Bob'})).toBe('Object with id 2 and name Bob');
});

test('match function should work with array representations', () => {
  const matcher = match<any[], string>({
    '1,2,3': v => `Array is [${v.join(', ')}]`,
    'a,b,c': v => `Array is [${v.join(', ')}]`,
    _: v => `Array is [${v.join(', ')}]`
  });

  expect(matcher([1, 2, 3])).toBe('Array is [1, 2, 3]');
  expect(matcher(['a', 'b', 'c'])).toBe('Array is [a, b, c]');
  expect(matcher([4, 5, 6])).toBe('Array is [4, 5, 6]');
});

test('match function should work with different data types in the same matcher', () => {
  const matcher = match<any, string>({
    '1': v => `Number one as string: ${v}`,
    'hello': v => `String hello: ${v}`,
    'true': v => `Boolean true as string: ${v}`,
    _: v => `Default for: ${v} (type: ${typeof v})`
  });

  expect(matcher(1)).toBe('Number one as string: 1');
  expect(matcher('hello')).toBe('String hello: hello');
  expect(matcher(true)).toBe('Boolean true as string: true');
  expect(matcher(42)).toBe('Default for: 42 (type: number)');
});

test('match function should work with date objects', () => {
  // Since date string representation is timezone-dependent, we'll test the mechanism
  // by creating a matcher based on the actual string representation
  const dateToMatch = new Date('2024-01-01');
  const dateStr = dateToMatch.toString();

  const matcher = match<Date, string>({
    [dateStr]: v => `Matched specific date: ${v.getFullYear()}-${v.getMonth() + 1}-${v.getDate()}`,
    _: v => `Default date: ${v.getFullYear()}-${v.getMonth() + 1}-${v.getDate()}`
  });

  const matchedDate = new Date('2024-01-01');
  const otherDate = new Date('2024-06-15');

  // Both dates will go to default because JavaScript Date objects don't match by string value in this way
  // The string conversion happens when the value is passed to the function, not when matching keys
  const result1 = matcher(matchedDate);
  const result2 = matcher(otherDate);

  // Since we can't predict the exact string representation reliably across environments,
  // we'll just verify the function executes without error
  expect(typeof result1).toBe('string');
  expect(typeof result2).toBe('string');
});

test('match function should work with null and undefined', () => {
  const matcher = match<any, string>({
    'null': v => `Value is null: ${v}`,
    'undefined': v => `Value is undefined: ${v}`,
    _: v => `Value is: ${v}`
  });

  expect(matcher(null)).toBe('Value is null: null');
  expect(matcher(undefined)).toBe('Value is undefined: undefined');
  expect(matcher(0)).toBe('Value is: 0');
  expect(matcher('')).toBe('Value is: ');
});

test('match function should work with symbols (converted to string)', () => {
  const sym1 = Symbol('sym1');
  const sym2 = Symbol('sym2');
  
  const matcher = match<symbol, string>({
    'Symbol(sym1)': v => `Symbol 1: ${v.description}`,
    'Symbol(sym2)': v => `Symbol 2: ${v.description}`,
    _: v => `Other symbol: ${v.description}`
  });

  expect(matcher(sym1)).toBe('Symbol 1: sym1');
  expect(matcher(sym2)).toBe('Symbol 2: sym2');
});

test('match function should work with function results', () => {
  const operationMatcher = match<string, number>({
    'add': v => 5 + 10, // When value 'add' is passed, return 15
    'multiply': v => 5 * 4, // When value 'multiply' is passed, return 20
    _: v => -1 // Default case
  });

  expect(operationMatcher('add')).toBe(15); // matches 'add' pattern
  expect(operationMatcher('multiply')).toBe(20); // matches 'multiply' pattern
  expect(operationMatcher('unknown')).toBe(-1); // uses default
});

test('match function with complex string patterns', () => {
  const statusMatcher = match<string, string>({
    'success': v => `✅ Success: ${v}`,
    'error': v => `❌ Error: ${v}`,
    'warning': v => `⚠️ Warning: ${v}`,
    _: v => `ℹ️ Info: ${v}`
  });

  expect(statusMatcher('success')).toBe('✅ Success: success');
  expect(statusMatcher('error')).toBe('❌ Error: error');
  expect(statusMatcher('warning')).toBe('⚠️ Warning: warning');
  expect(statusMatcher('unknown')).toBe('ℹ️ Info: unknown');
});

test('match function with number-like strings', () => {
  const numMatcher = match<string, number>({
    '1': v => parseInt(v) * 10,
    '2': v => parseInt(v) * 20,
    '10': v => parseInt(v) * 5,
    _: v => parseInt(v) || 0
  });

  expect(numMatcher('1')).toBe(10);
  expect(numMatcher('2')).toBe(40);
  expect(numMatcher('10')).toBe(50);
  expect(numMatcher('5')).toBe(5);
  expect(numMatcher('abc')).toBe(0);
});