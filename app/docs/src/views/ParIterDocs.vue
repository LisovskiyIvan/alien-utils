<script setup lang="ts">
import CodeBlock from '@/components/CodeBlock.vue'
import Section from '@/components/Section.vue'
import { Cpu, Zap, Activity } from 'lucide-vue-next'

const parIterCreatingCode = `// From any iterable with default configuration
import { ParIter } from '@dayme/alien-utils';

const parIter1 = ParIter.from([1, 2, 3, 4, 5]);

// With custom configuration
const parIter2 = ParIter.from(largeDataset, {
  workers: 4,           // Number of worker threads
  chunkSize: 10000,     // Size of data chunks
  strategy: "static",   // Chunking strategy: "static" | "dynamic"
  ordered: false,       // Preserve order of results
  allowSideEffects: false // Allow side-effect operations
});`

const parIterMapCode = `// Parallel map operation
const result = await ParIter.from([1, 2, 3, 4, 5])
  .map(x => x * 2)
  .collect(); // [2, 4, 6, 8, 10]`;

const parIterFilterCode = `// Parallel filter operation
const result = await ParIter.from([1, 2, 3, 4, 5, 6])
  .filter(x => x % 2 === 0)
  .collect(); // [2, 4, 6]`;

const parIterChainingCode = `// Chaining parallel operations
const result = await ParIter.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
  .map(x => x * 2)
  .filter(x => x > 10)
  .collect(); // [12, 14, 16, 18, 20]`;

const parIterReductionCode = `// Parallel reduction operations
const sum = await ParIter.from([1, 2, 3, 4, 5])
  .sum(); // 15

const count = await ParIter.from([1, 2, 3, 4, 5])
  .filter(x => x > 2)
  .count(); // 3

const customReduce = await ParIter.from([1, 2, 3, 4])
  .reduce((acc, val) => acc * val, 1); // 24`;

const parIterComparisonCode = `import { Iter, ParIter } from '@dayme/alien-utils';

// Sequential processing (good for small datasets)
const seqResult = Iter.from([1, 2, 3, 4, 5])
  .map(x => expensiveFunction(x))
  .filter(x => x > threshold)
  .collect();

// Parallel processing (better for large datasets with CPU-intensive operations)
const parResult = await ParIter.from(largeDataset)
  .map(x => expensiveFunction(x))
  .filter(x => x > threshold)
  .collect();`;

const parIterSafetyCode = `// Operations that CANNOT be parallelized (will throw errors)
try {
  ParIter.from([1, 2, 3, 4, 5]).take(3); // Throws error
} catch (e) {
  console.log(e.message); // "take operation cannot be parallelized"
}

try {
  ParIter.from([1, 2, 3], { allowSideEffects: false })
    .inspect(x => console.log(x)); // Throws error
} catch (e) {
  console.log(e.message); // "inspect operation is not allowed when allowSideEffects is false"
}`;
</script>

<template>
  <div class="max-w-4xl mx-auto px-4 py-8">
    <Section title="ParIter - Parallel Iterator">
      <div class="flex items-center gap-3 mb-6">
        <div class="p-2 bg-gradient-to-r from-purple-600 to-indigo-600 rounded-lg">
          <Cpu class="w-6 h-6 text-white" />
        </div>
        <h1 class="text-3xl font-bold text-white">ParIter - Parallel Iterator</h1>
      </div>
      
      <p class="text-gray-300 mb-6">
        ParIter is a parallel iterator implementation for data-parallel execution with deterministic reduction.
        Unlike the sequential Iter, ParIter leverages multiple CPU cores to process large datasets more efficiently.
      </p>
      
      <div class="bg-blue-900/30 border border-blue-700 rounded-lg p-4 mb-8">
        <div class="flex items-start gap-2">
          <Activity class="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" />
          <p class="text-blue-200">
            <strong>Key Concept:</strong> ParIter = data-parallel execution + deterministic reduction.
            It splits data into chunks, processes them in parallel across multiple workers, then merges results deterministically.
          </p>
        </div>
      </div>
    </Section>

    <Section title="Creating ParIter">
      <p class="text-gray-300 mb-4">
        Create a ParIter from any iterable with optional configuration:
      </p>
      <CodeBlock :code="parIterCreatingCode" language="typescript" />
    </Section>

    <Section title="Map Operation">
      <p class="text-gray-300 mb-4">
        Apply transformations in parallel across multiple workers:
      </p>
      <CodeBlock :code="parIterMapCode" language="typescript" />
    </Section>

    <Section title="Filter Operation">
      <p class="text-gray-300 mb-4">
        Filter elements in parallel across multiple workers:
      </p>
      <CodeBlock :code="parIterFilterCode" language="typescript" />
    </Section>

    <Section title="Chaining Operations">
      <p class="text-gray-300 mb-4">
        Chain multiple operations that will be applied in parallel:
      </p>
      <CodeBlock :code="parIterChainingCode" language="typescript" />
    </Section>

    <Section title="Reduction Operations">
      <p class="text-gray-300 mb-4">
        Perform parallel reductions for aggregating results:
      </p>
      <CodeBlock :code="parIterReductionCode" language="typescript" />
      
      <div class="mt-6 p-4 bg-purple-900/20 border border-purple-700 rounded-lg">
        <div class="flex items-center gap-2 mb-2">
          <Zap class="w-4 h-4 text-purple-400" />
          <h3 class="font-semibold text-purple-200">Performance Note</h3>
        </div>
        <p class="text-purple-200">
          Reduction operations trigger parallel execution across all chunks. 
          The results from each chunk are then combined using the reduction function.
        </p>
      </div>
    </Section>

    <Section title="Iter vs ParIter Comparison">
      <p class="text-gray-300 mb-4">
        Choose the right iterator for your use case:
      </p>
      <CodeBlock :code="parIterComparisonCode" language="typescript" />
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
        <div class="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h3 class="font-semibold text-green-400 mb-2">Use Iter When:</h3>
          <ul class="text-gray-300 space-y-1 text-sm">
            <li>• Small to medium datasets (&lt; 10,000 elements)</li>
            <li>• Need operations requiring order preservation</li>
            <li>• Performing I/O-bound operations</li>
            <li>• Need all iterator operations (take, find, etc.)</li>
            <li>• Lower memory overhead is important</li>
          </ul>
        </div>
        
        <div class="bg-gray-800/50 p-4 rounded-lg border border-gray-700">
          <h3 class="font-semibold text-purple-400 mb-2">Use ParIter When:</h3>
          <ul class="text-gray-300 space-y-1 text-sm">
            <li>• Large datasets (&gt; 100,000 elements)</li>
            <li>• CPU-intensive computations</li>
            <li>• Only need parallelizable operations</li>
            <li>• Multiple CPU cores are available</li>
            <li>• Maximum throughput is needed</li>
          </ul>
        </div>
      </div>
    </Section>

    <Section title="Safety and Limitations">
      <p class="text-gray-300 mb-4">
        ParIter has specific limitations to ensure parallelizability:
      </p>
      <CodeBlock :code="parIterSafetyCode" language="typescript" />
      
      <div class="mt-6 bg-red-900/20 border border-red-700 rounded-lg p-4">
        <h3 class="font-semibold text-red-300 mb-2">Non-Parallelizable Operations</h3>
        <ul class="text-red-200 space-y-1 text-sm">
          <li>• <code class="bg-red-900/50 px-1 rounded">take(n)</code> - Order-dependent</li>
          <li>• <code class="bg-red-900/50 px-1 rounded">takeWhile()</code> - Order-dependent</li>
          <li>• <code class="bg-red-900/50 px-1 rounded">find()</code> - Order-dependent</li>
          <li>• <code class="bg-red-900/50 px-1 rounded">first()</code> - Order-dependent</li>
          <li>• <code class="bg-red-900/50 px-1 rounded">scan()</code> - Cumulative operation</li>
          <li>• <code class="bg-red-900/50 px-1 rounded">inspect()</code> - Side effects (unless enabled)</li>
        </ul>
      </div>
    </Section>

    <Section title="Configuration Options">
      <div class="overflow-x-auto">
        <table class="w-full text-sm text-left text-gray-400">
          <thead class="text-xs text-white uppercase bg-gray-700">
            <tr>
              <th class="px-4 py-3">Option</th>
              <th class="px-4 py-3">Type</th>
              <th class="px-4 py-3">Default</th>
              <th class="px-4 py-3">Description</th>
            </tr>
          </thead>
          <tbody class="bg-gray-800/50 border border-gray-700">
            <tr class="border-b border-gray-700">
              <td class="px-4 py-3 font-medium text-white">workers</td>
              <td class="px-4 py-3">number</td>
              <td class="px-4 py-3">navigator.hardwareConcurrency || 4</td>
              <td class="px-4 py-3 text-gray-300">Number of worker threads to use</td>
            </tr>
            <tr class="border-b border-gray-700">
              <td class="px-4 py-3 font-medium text-white">chunkSize</td>
              <td class="px-4 py-3">number</td>
              <td class="px-4 py-3">10000</td>
              <td class="px-4 py-3 text-gray-300">Size of data chunks for parallel processing</td>
            </tr>
            <tr class="border-b border-gray-700">
              <td class="px-4 py-3 font-medium text-white">strategy</td>
              <td class="px-4 py-3">"static" | "dynamic"</td>
              <td class="px-4 py-3">"static"</td>
              <td class="px-4 py-3 text-gray-300">Chunking strategy for load balancing</td>
            </tr>
            <tr class="border-b border-gray-700">
              <td class="px-4 py-3 font-medium text-white">ordered</td>
              <td class="px-4 py-3">boolean</td>
              <td class="px-4 py-3">false</td>
              <td class="px-4 py-3 text-gray-300">Preserve order of results from chunks</td>
            </tr>
            <tr>
              <td class="px-4 py-3 font-medium text-white">allowSideEffects</td>
              <td class="px-4 py-3">boolean</td>
              <td class="px-4 py-3">false</td>
              <td class="px-4 py-3 text-gray-300">Allow operations with side effects like inspect</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Section>
  </div>
</template>
