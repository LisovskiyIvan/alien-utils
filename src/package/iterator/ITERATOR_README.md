# Iter - Blazing Fast Lazy Iterator for TypeScript

A high-performance lazy iterator library inspired by Rust's iterator design, with **up to 53.72x speedup** over native JavaScript array methods for complex operations.

## 🚀 Key Features

- **Lazy evaluation** - operations execute only when consumed
- **Iterator fusion** - single-pass execution for chained operations
- **Bit mask optimization** - skip unnecessary branches (2-6x faster)
- **Typed array fast paths** - direct indexed access (3-5x faster)
- **Early termination** - `take()`, `find()`, `first()` stop when satisfied
- **Memory efficient** - no intermediate arrays
- **Infinite sequences** - `range()`, `repeat()`, `generate()`
- **Full TypeScript support** - type-safe with excellent inference

## 📊 Benchmarks

### Performance Comparison

| Operation | Native JS | Iter (lazy) | Speedup |
|-----------|-----------|--------------|---------|
| **Single Operations** ||||
| `map(x => x * 2)` | 7.91ms | 43.47ms | 0.18x ❌ |
| `filter(x % 2 === 0)` | 8.15ms | 32.29ms | 0.25x ❌ |
| `take(100)` | 3.56ms | 3.45ms | 1.03x ✅ |
| `reduce((acc, x) => acc + x, 0)` | 7.40ms | 4.36ms | 1.70x ✅ |
| `sum()` | 8.84ms | 4.41ms | 2.00x ✅ |
| **Iterator Fusion** ||||
| 3x `map()` chain | 21.11ms | 3.07ms | **6.88x** ✅ |
| 3x `filter()` chain | 22.81ms | 3.56ms | **6.40x** ✅ |
| map + filter + take | 43.29ms | 2.74ms | **15.81x** ✅ |
| **Special Scenarios** ||||
| CPU-bound operations | 179.83ms | 3.35ms | **53.72x** ✅ |
| GC-bound operations | 21.89ms | 2.71ms | 8.08x ✅ |
| Generator functions | 18.58ms | 2.92ms | **6.37x** ✅ |
| **Complex Chains** ||||
| map().filter().take().map() | 19.93ms | 2.87ms | 6.94x ✅ |
| filter().map().filter().take() | 15.12ms | 3.06ms | 4.93x ✅ |
| map().unique().take() | 22.24ms | 2.65ms | **8.40x** ✅ |
| map().filter().find() | 27.94ms | 2.61ms | **10.69x** ✅ |

### Memory Efficiency

| Scenario | Native Memory | Iter Memory | Savings |
|----------|---------------|-------------|----------|
| Native (3x map) | +95.38 MB | +7.65 MB | **87%** |
| Native (3x filter) | +60.06 MB | +20.31 MB | **66%** |
| Native (map/filter) | +50.01 MB | +19.09 MB | **62%** |
| Native (5 operations) | +111.12 MB | Minimal | **~100%** |

### When to Use Iter

✅ **Use Iter when:**
- Long operation chains with `take()`
- Need memory efficiency (large datasets)
- Working with infinite sequences
- Complex transformations with filters
- CPU-bound operations
- Need early termination (`find()`, `first()`, `take()`)

❌ **Use native JS when:**
- Very small arrays (< 100 elements)
- Simple single operations
- No chaining or filtering needed
- Need maximum raw speed for simple loops

## 📦 Installation

```bash
npm install @dayme/utils
# or
yarn add @dayme/utils
# or
bun add @dayme/utils
```

## 🚀 Quick Start

```typescript
import { Iter } from '@dayme/utils/iterator';

// Basic usage
const result = Iter.from([1, 2, 3, 4, 5])
  .map(x => x * 2)
  .filter(x => x > 5)
  .take(2)
  .collect();

// result: [6, 8]
```

## 📚 API Reference

### Creating Iterators

#### `Iter.from(iterable: Iterable<T>): Iter<T>`

Creates an iterator from any iterable (arrays, sets, maps, strings, etc.).

```typescript
Iter.from([1, 2, 3]);                 // [1, 2, 3]
Iter.from(new Set([1, 2, 3]));         // [1, 2, 3]
Iter.from("hello");                     // ['h', 'e', 'l', 'l', 'o']
```

#### `Iter.range(start: number, end: number, step?: number): Iter<number>`

Creates an iterator over a numeric range.

```typescript
Iter.range(0, 5).collect();            // [0, 1, 2, 3, 4]
Iter.range(0, 10, 2).collect();         // [0, 2, 4, 6, 8]
Iter.range(10, 0, -1).collect();        // [10, 9, 8, 7, 6, 5, 4, 3, 2, 1]
```

#### `Iter.repeat<T>(value: T): Iter<T>`

Creates an infinite iterator that repeats a value.

```typescript
Iter.repeat(42).take(3).collect();      // [42, 42, 42]
```

#### `Iter.generate<T>(fn: () => T): Iter<T>`

Creates an infinite iterator generating values from a function.

```typescript
let n = 0;
Iter.generate(() => n++).take(5).collect();  // [0, 1, 2, 3, 4]
```

#### `Iter.empty<T>(): Iter<T>`

Creates an empty iterator.

```typescript
Iter.empty<number>().collect();          // []
```

#### `Iter.once<T>(value: T): Iter<T>`

Creates an iterator with a single element.

```typescript
Iter.once(42).collect();                // [42]
```

---

### Lazy Operations (Intermediate)

These operations return a new iterator and don't execute immediately.

#### `map<U>(fn: (value: T, index: number) => U): Iter<U>`

Transforms each element.

```typescript
Iter.from([1, 2, 3]).map(x => x * 2).collect();
// [2, 4, 6]

Iter.from(['a', 'b', 'c']).map((x, i) => `${i}:${x}`).collect();
// ['0:a', '1:b', '2:c']
```

#### `filter(predicate: (value: T, index: number) => boolean): Iter<T>`

Filters elements by predicate.

```typescript
Iter.from([1, 2, 3, 4, 5]).filter(x => x % 2 === 0).collect();
// [2, 4]

Iter.from([1, 2, 3, 4, 5]).filter((x, i) => i % 2 === 0).collect();
// [1, 3, 5]
```

#### `flatMap<U>(fn: (value: T, index: number) => Iterable<U>): Iter<U>`

Transforms and flattens one level.

```typescript
Iter.from([1, 2, 3]).flatMap(x => [x, x * 10]).collect();
// [1, 10, 2, 20, 3, 30]

Iter.from([[1, 2], [3, 4]]).flatMap(x => x).collect();
// [1, 2, 3, 4]
```

#### `flatten<U>(this: Iter<Iterable<U>>): Iter<U>`

Flattens one level of nested iterables.

```typescript
Iter.from([[1, 2], [3, 4]]).flatten().collect();
// [1, 2, 3, 4]

Iter.from(['hello', 'world']).flatten().collect();
// ['h', 'e', 'l', 'l', 'o', 'w', 'o', 'r', 'l', 'd']
```

#### `take(n: number): Iter<T>`

Takes the first n elements.

```typescript
Iter.from([1, 2, 3, 4, 5]).take(3).collect();
// [1, 2, 3]

Iter.range(0, Infinity).take(5).collect();
// [0, 1, 2, 3, 4]
```

#### `takeWhile(predicate: (value: T, index: number) => boolean): Iter<T>`

Takes elements while predicate is true.

```typescript
Iter.from([1, 2, 3, 4, 1, 2]).takeWhile(x => x < 4).collect();
// [1, 2, 3]
```

#### `skip(n: number): Iter<T>`

Skips the first n elements.

```typescript
Iter.from([1, 2, 3, 4, 5]).skip(2).collect();
// [3, 4, 5]
```

#### `skipWhile(predicate: (value: T, index: number) => boolean): Iter<T>`

Skips elements while predicate is true.

```typescript
Iter.from([1, 2, 3, 4, 1, 2]).skipWhile(x => x < 3).collect();
// [3, 4, 1, 2]
```

#### `enumerate(): Iter<[number, T]>`

Adds index to each element.

```typescript
Iter.from(['a', 'b', 'c']).enumerate().collect();
// [[0, 'a'], [1, 'b'], [2, 'c']]
```

#### `zip<U>(other: Iterable<U>): Iter<[T, U]>`

Combines two iterators into pairs.

```typescript
Iter.from([1, 2, 3]).zip(['a', 'b', 'c']).collect();
// [[1, 'a'], [2, 'b'], [3, 'c']]
```

#### `chain(other: Iterable<T>): Iter<T>`

Concatenates this iterator with another.

```typescript
Iter.from([1, 2]).chain([3, 4]).collect();
// [1, 2, 3, 4]
```

#### `stepBy(step: number): Iter<T>`

Takes every nth element.

```typescript
Iter.from([1, 2, 3, 4, 5, 6]).stepBy(2).collect();
// [1, 3, 5]
```

#### `inspect(fn: (value: T, index: number) => void): Iter<T>`

Executes a side effect without modifying elements.

```typescript
Iter.from([1, 2, 3])
  .inspect(x => console.log('processing:', x))
  .map(x => x * 2)
  .collect();
// Logs: processing: 1, processing: 2, processing: 3
// Returns: [2, 4, 6]
```

#### `unique(): Iter<T>`

Removes consecutive duplicates.

```typescript
Iter.from([1, 2, 2, 3, 1, 4]).unique().collect();
// [1, 2, 3, 4]
```

#### `uniqueBy<K>(keyFn: (value: T) => K): Iter<T>`

Removes duplicates by key function.

```typescript
Iter.from([{id: 1, name: 'A'}, {id: 1, name: 'B'}, {id: 2, name: 'C'}])
  .uniqueBy(obj => obj.id)
  .collect();
// [{id: 1, name: 'A'}, {id: 2, name: 'C'}]
```

---

### Consuming Operations (Terminal)

These operations execute the lazy chain and return a value.

#### `collect(): T[]`

Collects all elements into an array.

```typescript
Iter.from([1, 2, 3]).collect();
// [1, 2, 3]

Iter.from([1, 2, 3]).map(x => x * 2).collect();
// [2, 4, 6]
```

#### `fold<U>(initial: U, fn: (acc: U, value: T, index: number) => U): U`

Reduces iterator to single value (left-to-right).

```typescript
Iter.from([1, 2, 3, 4]).fold(0, (acc, x) => acc + x);
// 10

Iter.from(['a', 'b', 'c']).fold('', (acc, x) => acc + x);
// "abc"
```

#### `foldRight<U>(initial: U, fn: (acc: U, value: T, index: number) => U): U`

Reduces iterator to single value (right-to-left).

```typescript
Iter.from(['a', 'b', 'c']).foldRight('', (acc, x) => acc + x);
// "cba"
```

#### `reduce(fn: (acc: T, value: T, index: number) => T): Option<T>`

Reduces iterator using first element as initial value. Returns `None` if empty.

```typescript
Iter.from([1, 2, 3, 4]).reduce((acc, x) => acc + x);
// Some(10)

Iter.empty<number>().reduce((acc, x) => acc + x);
// None
```

#### `forEach(fn: (value: T, index: number) => void): void`

Executes function for each element.

```typescript
Iter.from([1, 2, 3]).forEach(x => console.log(x));
// Logs: 1, 2, 3
```

#### `count(): number`

Counts elements.

```typescript
Iter.from([1, 2, 3]).count();
// 3

Iter.from([1, 2, 3, 4, 5]).filter(x => x % 2 === 0).count();
// 2
```

#### `find(predicate: (value: T, index: number) => boolean): Option<T>`

Finds first element matching predicate. Returns `None` if not found.

```typescript
Iter.from([1, 2, 3, 4]).find(x => x > 2);
// Some(3)

Iter.from([1, 2, 3]).find(x => x > 10);
// None
```

#### `findJS(predicate: (value: T, index: number) => boolean): T | undefined`

JavaScript-style find (returns undefined if not found).

```typescript
Iter.from([1, 2, 3, 4]).findJS(x => x > 2);
// 3

Iter.from([1, 2, 3]).findJS(x => x > 10);
// undefined
```

#### `position(predicate: (value: T, index: number) => boolean): Option<number>`

Finds index of first element matching predicate.

```typescript
Iter.from(['a', 'b', 'c']).position(x => x === 'b');
// Some(1)

Iter.from(['a', 'b', 'c']).position(x => x === 'd');
// None
```

#### `findIndex(predicate: (value: T, index: number) => boolean): number`

JavaScript-style findIndex (returns -1 if not found).

```typescript
Iter.from(['a', 'b', 'c']).findIndex(x => x === 'b');
// 1

Iter.from(['a', 'b', 'c']).findIndex(x => x === 'd');
// -1
```

#### `all(predicate: (value: T, index: number) => boolean): boolean`

Checks if all elements satisfy predicate.

```typescript
Iter.from([2, 4, 6]).all(x => x % 2 === 0);
// true

Iter.from([2, 3, 6]).all(x => x % 2 === 0);
// false
```

#### `everyJS(predicate: (value: T, index: number) => boolean): boolean`

JavaScript-style every (alias for `all`).

```typescript
Iter.from([2, 4, 6]).everyJS(x => x % 2 === 0);
// true
```

#### `any(predicate: (value: T, index: number) => boolean): boolean`

Checks if any element satisfies predicate.

```typescript
Iter.from([1, 2, 3]).any(x => x > 2);
// true

Iter.from([1, 2, 3]).any(x => x > 5);
// false
```

#### `someJS(predicate: (value: T, index: number) => boolean): boolean`

JavaScript-style some (alias for `any`).

```typescript
Iter.from([1, 2, 3]).someJS(x => x > 2);
// true
```

#### `partition(predicate: (value: T, index: number) => boolean): [T[], T[]]`

Splits iterator into two groups.

```typescript
const [evens, odds] = Iter.from([1, 2, 3, 4]).partition(x => x % 2 === 0);
// evens: [2, 4]
// odds: [1, 3]
```

#### `first(): Option<T>`

Gets first element. Returns `None` if empty.

```typescript
Iter.from([1, 2, 3]).first();
// Some(1)

Iter.empty<number>().first();
// None
```

#### `last(): Option<T>`

Gets last element. Returns `None` if empty.

```typescript
Iter.from([1, 2, 3]).last();
// Some(3)

Iter.empty<number>().last();
// None
```

#### `nth(n: number): Option<T>`

Gets nth element (0-indexed). Returns `None` if out of bounds.

```typescript
Iter.from(['a', 'b', 'c']).nth(1);
// Some('b')

Iter.from(['a', 'b']).nth(5);
// None
```

#### `includes(searchElement: T, fromIndex?: number): boolean`

Checks if element exists.

```typescript
Iter.from([1, 2, 3]).includes(2);
// true

Iter.from([1, 2, 3]).includes(4);
// false
```

#### `max(): Option<T>`

Finds maximum element.

```typescript
Iter.from([3, 1, 4, 1, 5]).max();
// Some(5)

Iter.empty<number>().max();
// None
```

#### `min(): Option<T>`

Finds minimum element.

```typescript
Iter.from([3, 1, 4, 1, 5]).min();
// Some(1)
```

#### `maxBy<K>(keyFn: (value: T) => K): Option<T>`

Finds maximum element by key function.

```typescript
Iter.from([{age: 20}, {age: 30}, {age: 25}]).maxBy(x => x.age);
// Some({age: 30})
```

#### `minBy<K>(keyFn: (value: T) => K): Option<T>`

Finds minimum element by key function.

```typescript
Iter.from([{age: 20}, {age: 30}, {age: 25}]).minBy(x => x.age);
// Some({age: 20})
```

#### `sum(this: Iter<number>): number`

Sums numeric elements.

```typescript
Iter.from([1, 2, 3, 4]).sum();
// 10
```

#### `product(this: Iter<number>): number`

Multiplies numeric elements.

```typescript
Iter.from([1, 2, 3, 4]).product();
// 24
```

#### `join(this: Iter<string>, separator?: string): string`

Joins string elements.

```typescript
Iter.from(['a', 'b', 'c']).join('-');
// "a-b-c"
```

#### `toSet(): Set<T>`

Collects elements into a Set.

```typescript
Iter.from([1, 2, 2, 3, 1]).toSet();
// Set {1, 2, 3}
```

#### `toMap<K, V>(this: Iter<[K, V]>): Map<K, V>`

Collects key-value pairs into a Map.

```typescript
Iter.from([[1, 'a'], [2, 'b']]).toMap();
// Map {1 => 'a', 2 => 'b'}
```

#### `groupBy<K>(keyFn: (value: T) => K): Map<K, T[]>`

Groups elements by key.

```typescript
Iter.from([1, 2, 3, 4, 5, 6]).groupBy(x => x % 2 === 0 ? 'even' : 'odd');
// Map {'odd' => [1, 3, 5], 'even' => [2, 4, 6]}
```

#### `sort(compareFn?: (a: T, b: T) => number): Iter<T>`

Sorts elements (requires full materialization).

```typescript
Iter.from([3, 1, 4, 1, 5]).sort().collect();
// [1, 1, 3, 4, 5]

Iter.from([{age: 30}, {age: 20}]).sort((a, b) => a.age - b.age).collect();
// [{age: 20}, {age: 30}]
```

#### `sortBy<K>(keyFn: (value: T) => K): Iter<T>`

Sorts elements by key function.

```typescript
Iter.from([{age: 30}, {age: 20}, {age: 25}]).sortBy(x => x.age).collect();
// [{age: 20}, {age: 25}, {age: 30}]
```

#### `reverse(): Iter<T>`

Reverses element order (requires full materialization).

```typescript
Iter.from([1, 2, 3]).reverse().collect();
// [3, 2, 1]
```

---

## 💡 Use Cases

### 1. Data Processing Pipelines

```typescript
// Process large dataset efficiently
const processedData = Iter.from(rawData)
  .map(row => ({
    ...row,
    price: row.price * 1.2,  // Add tax
    discounted: row.price > 100
  }))
  .filter(item => item.active)
  .take(1000)  // Early termination!
  .collect();

// Memory efficient - only processes first 1000 matching items
```

### 2. Pagination

```typescript
function getPaginatedResults(page: number, pageSize: number) {
  return Iter.from(allData)
    .filter(item => item.published)
    .sort((a, b) => a.date - b.date)
    .skip(page * pageSize)
    .take(pageSize)
    .collect();
}

// Only processes current page, not entire dataset
```

### 3. Infinite Sequences

```typescript
// Generate Fibonacci sequence
function* fibonacci(): Generator<number> {
  let [a, b] = [0, 1];
  while (true) {
    yield a;
    [a, b] = [b, a + b];
  }
}

// Take first 10 Fibonacci numbers
const fib = Iter.from(fibonacci()).take(10).collect();
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

### 4. Data Transformation

```typescript
// Transform nested data structure
const flattened = Iter.from(nestedData)
  .flatMap(category =>
    category.items.map(item => ({
      category: category.name,
      itemName: item.name,
      price: item.price
    }))
  )
  .filter(item => item.price > 0)
  .collect();
```

### 5. Search and Filtering

```typescript
// Find first matching item efficiently
const result = Iter.from(items)
  .filter(item => item.type === 'product')
  .filter(item => item.inStock)
  .find(item => item.price < 50);

// Stops as soon as first match found - no unnecessary processing
```

### 6. Aggregation

```typescript
// Calculate statistics efficiently
const stats = Iter.from(salesData)
  .filter(sale => sale.completed)
  .fold(
    { total: 0, count: 0 },
    (acc, sale) => ({
      total: acc.total + sale.amount,
      count: acc.count + 1
    })
  );

const average = stats.total / stats.count;
```

### 7. Data Validation

```typescript
// Validate all items in collection
const isValid = Iter.from(userInput)
  .all(item => {
    return item.id &&
           item.name &&
           item.name.length >= 3;
  });

// Short-circuits on first invalid item
```

### 8. Chunk Processing

```typescript
// Process data in chunks without loading all into memory
for (const chunk of Iter.from(largeDataSource).chunk(1000)) {
  processBatch(chunk);
}
```

### 9. Numeric Data Processing

```typescript
// Fast numeric processing with typed arrays
const numbers = new Float32Array([1.1, 2.2, 3.3, 4.4, 5.5]);
const result = Iter.from(numbers)
  .map(x => x * 2)
  .filter(x => x > 5)
  .collect();

// Uses direct indexed access - 3-5x faster than regular arrays
```

### 10. Streaming Data

```typescript
// Process stream of data as it arrives
const processedStream = Iter.from(dataStream)
  .map(parseData)
  .filter(validateData)
  .map(enrichData)
  .take(100);  // Stop after 100 valid items

// Only creates 100 items in memory regardless of stream size
```

---

## 🎯 Performance Tips

### 1. Use `take()` for Early Exit

```typescript
// Bad: Processes all 1M items
Iter.from(oneMillionItems).map(expensiveFn).collect();

// Good: Stops after 100 items
Iter.from(oneMillionItems).map(expensiveFn).take(100).collect();
```

### 2. Use Typed Arrays for Numeric Data

```typescript
// Slower: Regular array
Iter.from([1, 2, 3]).map(x => x * 2).collect();

// Faster: Typed array
Iter.from(new Float32Array([1, 2, 3])).map(x => x * 2).collect();
```

### 3. Use Appropriate Terminal Operations

```typescript
// Bad: Collects entire array
Iter.from(data).filter(x => x > 10).collect()[0];

// Good: Stops at first match
Iter.from(data).filter(x => x > 10).first();
```

### 4. Combine Operations

```typescript
// Slower: Multiple passes
Iter.from(data).map(x => x * 2).map(x => x + 1).map(x => Math.floor(x)).collect();

// Faster: Single pass
Iter.from(data).map(x => Math.floor(x * 2 + 1)).collect();
```

### 5. Avoid Unnecessary `.collect()`

```typescript
// Bad: Collects then iterates
const results = Iter.from(data).map(x => x * 2).collect();
for (const item of results) { process(item); }

// Good: Iterate directly
for (const item of Iter.from(data).map(x => x * 2)) { process(item); }
```

---

## 🔧 Advanced Features

### Bit Mask Optimization

Iter uses a bit mask to track operations and skip unnecessary branches:

```typescript
// Operations tracked as bit flags:
// Map = 1, Filter = 2, Take = 4, Skip = 8, etc.

// When filter is absent, filter checks are skipped entirely
// This provides 2-6x speedup for common patterns
```

### Typed Array Fast Paths

For numeric data in typed arrays, Iter uses direct indexed access:

```typescript
// Typed arrays get direct indexing (no iterator protocol overhead)
const floats = new Float32Array([1, 2, 3, 4, 5]);
Iter.from(floats).map(x => x * 2).collect();

// This is 3-5x faster than regular arrays
```

### Map-Only Fast Path

Specialized code path for map-only chains without filters:

```typescript
// When only map operations are present, Iter uses simplified loop
Iter.from(data)
  .map(x => x * 2)
  .map(x => x + 1)
  .map(x => x.toString())
  .collect();

// 6.88x faster than native JavaScript for this pattern
```

---

## 📖 Additional Documentation

- **[BLAZE.md](./BLAZE.md)** - Complete optimization guide with 20+ strategies
- **[OPTIMIZATION.md](./OPTIMIZATION.md)** - Bit mask optimization deep dive
- **[QUICK_START_BLAZE.md](./QUICK_START_BLAZE.md)** - Practical performance tips
- **[ITERATOR_BLAZE.md](./ITERATOR_BLAZE.md)** - Recent blazing updates

---

## 🧪 Testing

```bash
# Run all tests
npm test

# Run specific test file
npm test -- iterator.test

# Run benchmarks
npm run bench
```

---

## 📜 License

MIT

---

## 🤝 Contributing

Contributions welcome! Please read our contributing guidelines first.

---

## ⚠️ Trade-offs

### When Iter is Slower

- **Very small arrays** (< 100 elements): Native JS is faster due to overhead
- **Single simple operations**: Direct array access beats iterator protocol
- **No chaining**: Simple `for` loops are fastest

### When Iter Shines

- **Complex chains**: 6-15x speedup from iterator fusion
- **Early termination**: Infinite speedup with `take()`, `find()`, `first()`
- **Memory efficiency**: No intermediate arrays save gigabytes
- **CPU-bound operations**: 53.72x speedup for expensive computations

---

## 🎓 Design Philosophy

Inspired by Rust's iterator design:

1. **Lazy by default** - Operations compose without executing
2. **Single pass** - All operations execute in one loop
3. **Zero-cost abstractions** - No runtime overhead when not used
4. **Composable** - Build complex transformations from simple operations
5. **Type-safe** - Full TypeScript support with excellent inference

---

## 📞 Support

- **GitHub Issues**: Report bugs and request features
- **Documentation**: See `/docs` directory for detailed guides
- **Examples**: Check test files for usage examples

---

**Made with 🔥 for performance-conscious developers**
