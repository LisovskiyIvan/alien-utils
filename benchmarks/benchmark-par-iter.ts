import { Iter } from '../src/package/iterator/iterator';
import { ParIter } from '../src/package/iterator/par-iter';

// Benchmark function
function benchmark(name: string, fn: () => Promise<any>): Promise<number> {
  const start = performance.now();
  return fn().then(() => {
    const end = performance.now();
    const duration = end - start;
    console.log(`${name}: ${duration.toFixed(2)}ms`);
    return duration;
  });
}

// Heavy computation function to test parallelization
function heavyComputation(x: number): number {
  let result = x;
  for (let i = 0; i < 1000; i++) {
    result = Math.sqrt(result * result + 1);
  }
  return result;
}

async function runBenchmark() {
  console.log('Starting ParIter vs Iter benchmark...\n');
  
  // Create test data
  const dataSize = 100000;
  const testData = Array.from({ length: dataSize }, (_, i) => i + 1);
  
  console.log(`Testing with ${dataSize.toLocaleString()} elements\n`);
  
  // Benchmark 1: Map operation
  console.log('1. Map operation (heavy computation):');
  const iterMapTime = await benchmark('Iter.map', async () => {
    return Iter.from(testData)
      .map(heavyComputation)
      .collect();
  });
  
  const parIterMapTime = await benchmark('ParIter.map', async () => {
    return await ParIter.from(testData)
      .map(heavyComputation)
      .collect();
  });
  
  console.log(`Speedup: ${(iterMapTime / parIterMapTime).toFixed(2)}x\n`);
  
  // Benchmark 2: Map + Filter operations
  console.log('2. Map + Filter operations:');
  const iterMapFilterTime = await benchmark('Iter.map + filter', async () => {
    return Iter.from(testData)
      .map(x => x * 2)
      .filter(x => x % 3 === 0)
      .collect();
  });
  
  const parIterMapFilterTime = await benchmark('ParIter.map + filter', async () => {
    return await ParIter.from(testData)
      .map(x => x * 2)
      .filter(x => x % 3 === 0)
      .collect();
  });
  
  console.log(`Speedup: ${(iterMapFilterTime / parIterMapFilterTime).toFixed(2)}x\n`);
  
  // Benchmark 3: Sum reduction
  console.log('3. Sum reduction (with heavy computation):');
  const iterSumTime = await benchmark('Iter.map + sum', async () => {
    return Iter.from(testData)
      .map(heavyComputation)
      .reduce((a, b) => a + b, 0);
  });
  
  const parIterSumTime = await benchmark('ParIter.map + sum', async () => {
    return await ParIter.from(testData)
      .map(heavyComputation)
      .sum();
  });
  
  console.log(`Speedup: ${(iterSumTime / parIterSumTime).toFixed(2)}x\n`);
  
  // Benchmark 4: Count operation
  console.log('4. Count operation (with filter):');
  const iterCountTime = await benchmark('Iter.filter + count', async () => {
    return Iter.from(testData)
      .filter(x => x % 2 === 0)
      .count();
  });
  
  const parIterCountTime = await benchmark('ParIter.filter + count', async () => {
    return await ParIter.from(testData)
      .filter(x => x % 2 === 0)
      .count();
  });
  
  console.log(`Speedup: ${(iterCountTime / parIterCountTime).toFixed(2)}x\n`);
  
  // Benchmark 5: Large dataset with simple operations
  console.log('5. Large dataset with simple operations (1M elements):');
  const largeDataSize = 1000000;
  const largeTestData = Array.from({ length: largeDataSize }, (_, i) => i + 1);
  
  const iterLargeTime = await benchmark('Iter (1M elements)', async () => {
    return Iter.from(largeTestData)
      .map(x => x * 2)
      .filter(x => x > 1000)
      .count();
  });
  
  const parIterLargeTime = await benchmark('ParIter (1M elements)', async () => {
    return await ParIter.from(largeTestData)
      .map(x => x * 2)
      .filter(x => x > 1000)
      .count();
  });
  
  console.log(`Speedup: ${(iterLargeTime / parIterLargeTime).toFixed(2)}x\n`);
  
  console.log('Benchmark completed!');
}

// Run the benchmark
runBenchmark().catch(console.error);