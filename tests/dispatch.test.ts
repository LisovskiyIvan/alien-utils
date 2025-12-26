import { dispatch, isNumber, isString, isArray, isObject } from '../src/package/dispatch';
import { test, expect } from 'bun:test';

test('dispatch should route by type', () => {
  const stringify = dispatch<string | number | any[], string>()
    .on(isNumber, n => n.toString())
    .on(isString, s => s)
    .on(isArray, a => a.join(','));

  expect(stringify(123)).toBe('123');
  expect(stringify('hello')).toBe('hello');
  expect(stringify(['a', 'b'])).toBe('a,b');
});

test('dispatch should use default handler', () => {
  const describe = dispatch<unknown, string>()
    .on(isNumber, n => `Number: ${n}`)
    .default(v => `Unknown: ${typeof v}`);

  expect(describe(42)).toBe('Number: 42');
  expect(describe('hello')).toBe('Unknown: string');
  expect(describe(true)).toBe('Unknown: boolean');
});

test('dispatch should throw without default', () => {
  const stringify = dispatch<unknown, string>()
    .on(isNumber, n => n.toString());

  expect(() => stringify('hello')).toThrow();
});

test('dispatch should work with custom type guards', () => {
  interface User { id: number; name: string }
  interface Product { id: number; price: number }

  const isUser = (v: unknown): v is User => 
    isObject(v) && 'name' in v && typeof v.name === 'string';

  const isProduct = (v: unknown): v is Product => 
    isObject(v) && 'price' in v && typeof v.price === 'number';

  const getType = dispatch<User | Product, string>()
    .on(isUser, u => `User: ${u.name}`)
    .on(isProduct, p => `Product: $${p.price}`);

  expect(getType({ id: 1, name: 'Alice' })).toBe('User: Alice');
  expect(getType({ id: 2, price: 99.99 })).toBe('Product: $99.99');
});

test('dispatch should work with array of Options', () => {
  interface Option { type: string }
  interface SomeOption extends Option { value: string }
  interface NoneOption extends Option { value?: never }

  const isSome = (v: unknown): v is SomeOption => 
    isObject(v) && v.type === 'Some' && 'value' in v;
  const isNone = (v: unknown): v is NoneOption => 
    isObject(v) && v.type === 'None';

  const getValue = dispatch<SomeOption | NoneOption, string>()
    .on(isSome, s => s.value)
    .on(isNone, () => 'No value');

  expect(getValue({ type: 'Some', value: 'hello' })).toBe('hello');
  expect(getValue({ type: 'None' })).toBe('No value');
});

test('dispatch should preserve type narrowing', () => {
  const process = dispatch<unknown, number>()
    .on(isString, s => s.length)
    .on(isNumber, n => n * 2)
    .on(isArray, a => a.length);

  expect(process('hello')).toBe(5);
  expect(process(21)).toBe(42);
  expect(process([1, 2, 3])).toBe(3);
});

test('dispatch should support nested dispatch', () => {
  const inner = dispatch<unknown, string>()
    .on(isNumber, n => n.toString())
    .default(() => 'other');

  const outer = dispatch<unknown, string>()
    .on(isArray, a => a.map(inner).join('|'))
    .default(() => 'not array');

  expect(outer([1, 2, 'a'])).toBe('1|2|other');
  expect(outer('hello')).toBe('not array');
});
