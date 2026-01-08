import { Iter } from '../src/package/iterator/iterator';
import { ParIter } from '../src/package/iterator/par-iter';

console.log('=== COMPREHENSIVE FUNCTIONALITY COMPARISON: Iter vs ParIter ===\n');

// Test data
const testData = Array.from({ length: 1000 }, (_, i) => i + 1);
const stringData = ['apple', 'banana', 'cherry', 'date', 'elderberry', 'fig', 'grape'];

console.log('1. BASIC CREATION AND ITERATION');
console.log('Iter.from([1,2,3]):', Iter.from([1, 2, 3]).collect());
console.log('ParIter.from([1,2,3]):', await ParIter.from([1, 2, 3]).collect());
console.log('');

console.log('2. MAP OPERATION');
console.log('Iter.map(x => x * 2):', Iter.from([1, 2, 3, 4, 5]).map(x => x * 2).collect());
console.log('ParIter.map(x => x * 2):', await ParIter.from([1, 2, 3, 4, 5]).map(x => x * 2).collect());
console.log('');

console.log('3. FILTER OPERATION');
console.log('Iter.filter(x => x % 2 === 0):', Iter.from([1, 2, 3, 4, 5, 6]).filter(x => x % 2 === 0).collect());
console.log('ParIter.filter(x => x % 2 === 0):', await ParIter.from([1, 2, 3, 4, 5, 6]).filter(x => x % 2 === 0).collect());
console.log('');

console.log('4. CHAINING OPERATIONS');
console.log('Iter: map + filter', Iter.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).map(x => x * 2).filter(x => x > 10).collect());
console.log('ParIter: map + filter', await ParIter.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]).map(x => x * 2).filter(x => x > 10).collect());
console.log('');

console.log('5. REDUCTION OPERATIONS');

// Iter reductions
const iterSum = Iter.from([1, 2, 3, 4, 5]).reduce((a, b) => a + b, 0);
const iterCount = Iter.from([1, 2, 3, 4, 5]).count();
console.log('Iter.sum (via reduce):', iterSum);
console.log('Iter.count:', iterCount);

// ParIter reductions
const parIterSum = await ParIter.from([1, 2, 3, 4, 5]).sum();
const parIterCount = await ParIter.from([1, 2, 3, 4, 5]).count();
console.log('ParIter.sum:', parIterSum);
console.log('ParIter.count:', parIterCount);
console.log('');

console.log('6. COLLECT OPERATION');
console.log('Iter.collect():', Iter.from([1, 2, 3, 4, 5]).collect());
console.log('ParIter.collect():', await ParIter.from([1, 2, 3, 4, 5]).collect());
console.log('');

console.log('7. LAZY VS EAGER EVALUATION');
console.log('Iter is lazy - operations are chained until consumed');
const iterLazy = Iter.from([1, 2, 3, 4, 5]).map(x => {
  console.log('Iter processing:', x); // This will be called during iteration
  return x * 2;
});
console.log('Iter pipeline created, no processing yet');
const iterResult = iterLazy.collect();
console.log('Iter result:', iterResult);

console.log('\nParIter is eager for reductions - operations are distributed and processed in parallel');
const parIterResult = await ParIter.from([1, 2, 3, 4, 5]).map(x => x * 2).collect();
console.log('ParIter result:', parIterResult);
console.log('');

console.log('8. CONFIGURATION OPTIONS');
console.log('ParIter supports: workers count, chunk size, strategy, ordering, side effects');
try {
  const configuredResult = await ParIter.from([1, 2, 3, 4, 5], { workers: 2, chunkSize: 100 }).map(x => x * 2).collect();
  console.log('Configured ParIter result:', configuredResult);
} catch (e) {
  console.log('Configured ParIter error:', e.message);
}
console.log('');

console.log('9. OPERATIONS SUPPORTED BY ITER BUT NOT PARITER:');
console.log('- take(n): Takes first n elements (order-dependent)');
try {
  Iter.from([1, 2, 3, 4, 5]).take(3).collect();
  console.log('  ✓ Iter.take(3) works');
} catch (e) {
  console.log('  ✗ Iter.take(3) failed:', e.message);
}

try {
  await ParIter.from([1, 2, 3, 4, 5]).take(3);
  console.log('  ✗ ParIter.take(3) should not work');
} catch (e) {
  console.log('  ✓ ParIter.take(3) correctly throws:', e.message);
}

console.log('- takeWhile(predicate): Takes elements while predicate is true (order-dependent)');
try {
  Iter.from([1, 2, 3, 4, 5]).takeWhile(x => x < 4).collect();
  console.log('  ✓ Iter.takeWhile(x => x < 4) works');
} catch (e) {
  console.log('  ✗ Iter.takeWhile(x => x < 4) failed:', e.message);
}

try {
  await ParIter.from([1, 2, 3, 4, 5]).takeWhile(x => x < 4);
  console.log('  ✗ ParIter.takeWhile(x => x < 4) should not work');
} catch (e) {
  console.log('  ✓ ParIter.takeWhile(x => x < 4) correctly throws:', e.message);
}

console.log('- find(predicate): Finds first matching element (order-dependent)');
try {
  const found = Iter.from([1, 2, 3, 4, 5]).find(x => x === 3);
  console.log('  ✓ Iter.find(x => x === 3) works:', found);
} catch (e) {
  console.log('  ✗ Iter.find(x => x === 3) failed:', e.message);
}

try {
  await ParIter.from([1, 2, 3, 4, 5]).find(x => x === 3);
  console.log('  ✗ ParIter.find(x => x === 3) should not work');
} catch (e) {
  console.log('  ✓ ParIter.find(x => x === 3) correctly throws:', e.message);
}

console.log('- first(): Gets first element (order-dependent)');
try {
  const first = Iter.from([1, 2, 3, 4, 5]).first();
  console.log('  ✓ Iter.first() works:', first);
} catch (e) {
  console.log('  ✗ Iter.first() failed:', e.message);
}

try {
  await ParIter.from([1, 2, 3, 4, 5]).first();
  console.log('  ✗ ParIter.first() should not work');
} catch (e) {
  console.log('  ✓ ParIter.first() correctly throws:', e.message);
}

console.log('- scan(accumulator): Cumulative operation (order-dependent)');
try {
  const scanResult = Iter.from([1, 2, 3, 4]).scan(0, (acc, x) => acc + x).collect();
  console.log('  ✓ Iter.scan works:', scanResult);
} catch (e) {
  console.log('  ✗ Iter.scan failed:', e.message);
}

try {
  await ParIter.from([1, 2, 3, 4]).scan(0, (acc, x) => acc + x);
  console.log('  ✗ ParIter.scan should not work');
} catch (e) {
  console.log('  ✓ ParIter.scan correctly throws:', e.message);
}
console.log('');

console.log('10. PERFORMANCE CHARACTERISTICS');
console.log('- Iter: Single-threaded, lazy evaluation, low overhead for small datasets');
console.log('- ParIter: Multi-threaded, eager evaluation for reductions, better for CPU-intensive operations on large datasets');
console.log('');

console.log('11. SIDE EFFECTS HANDLING');
console.log('Iter: Allows side effects in operations like inspect');
Iter.from([1, 2, 3]).inspect(x => console.log('Iter inspect:', x)).collect();

console.log('ParIter: Side effects disabled by default');
try {
  await ParIter.from([1, 2, 3]).inspect(x => console.log('ParIter inspect:', x));
  console.log('  ✗ ParIter.inspect should not work by default');
} catch (e) {
  console.log('  ✓ ParIter.inspect correctly restricted:', e.message);
}

try {
  const result = await ParIter.from([1, 2, 3], { allowSideEffects: true })
    .inspect(x => console.log('ParIter inspect with permission:', x))
    .collect();
  console.log('  ✓ ParIter.inspect works with allowSideEffects=true:', result);
} catch (e) {
  console.log('  ✗ ParIter.inspect with allowSideEffects=true failed:', e.message);
}
console.log('');

console.log('12. USE CASES');
console.log('Iter is best for:');
console.log('  - Small to medium datasets');
console.log('  - Operations requiring order preservation (take, find, etc.)');
console.log('  - Lazy evaluation scenarios');
console.log('  - Sequential processing');
console.log('  - When side effects are needed');
console.log('');

console.log('ParIter is best for:');
console.log('  - Large datasets');
console.log('  - CPU-intensive transformations');
console.log('  - Operations that can be parallelized (map, filter, sum, count)');
console.log('  - When order doesn\'t matter or can be handled separately');
console.log('  - Data-parallel algorithms');
console.log('');

console.log('13. MEMORY USAGE');
console.log('Iter: Generally lower memory usage due to lazy evaluation');
console.log('ParIter: Higher memory usage due to chunking and parallel processing');
console.log('');

console.log('14. ERROR HANDLING');
console.log('Both support error handling, but ParIter processes chunks in parallel');
try {
  const result = Iter.from([1, 2, 3]).map(x => {
    if (x === 2) throw new Error('Error in Iter');
    return x * 2;
  }).collect();
  console.log('Iter result:', result);
} catch (e) {
  console.log('Iter error caught:', e.message);
}

try {
  const result = await ParIter.from([1, 2, 3]).map(x => {
    if (x === 2) throw new Error('Error in ParIter');
    return x * 2;
  }).collect();
  console.log('ParIter result:', result);
} catch (e) {
  console.log('ParIter error caught:', e.message);
}
console.log('');

console.log('=== SUMMARY ===');
console.log('Iter: General-purpose, lazy, supports all operations, good for sequential processing');
console.log('ParIter: Specialized for parallel processing, restricted operations, good for large-scale data transformations');