<script setup lang="ts">
import Section from '@/components/Section.vue'
import CodeBlock from '@/components/CodeBlock.vue'
import { ArrowRight, History } from 'lucide-vue-next'

const quickStartCode = `import { Iter, ParIter, Some, None, Ok, Err, match, dispatch, isNumber, isString, Bimap, Stack, Queue, History } from '@dayme/alien-utils';

// Sequential Iterator
const result = Iter.from([1, 2, 3, 4, 5])
  .map(x => x * 2)
  .filter(x => x > 5)
  .collect(); // [6, 8, 10]

// Parallel Iterator (for large datasets with CPU-intensive operations)
const parallelResult = await ParIter.from(largeDataset)
  .map(x => expensiveComputation(x))
  .filter(x => x > threshold)
  .sum(); // Parallel reduction

// Option
const option = new Some(42);
option.unwrap(); // 42

// Result
const ok = divide(10, 2); // Ok(5)
const err = divide(10, 0); // Err("Division by zero")

// Match
const matcher = match({
  1: v => v,
  2: v => v * 2,
  _: v => v * 3
});
matcher(5); // 15

// Dispatch
const stringify = dispatch()
  .on(isNumber, n => n.toString())
  .on(isString, s => s);
stringify(42); // "42"
stringify("hello"); // "hello"

// Bimap
const bimap = new Bimap();
bimap.set('alice', 1);
bimap.get('alice');    // 1
bimap.getReverse(1);   // 'alice'

// Stack
const stack = new Stack<number>();
stack.push(1).push(2).push(3);
stack.pop(); // Some(3)

// Queue
const queue = Queue.from([1, 2, 3]);
queue.dequeue(); // Some(1)

// History
const h = new History({ text: '' });
console.log(h.state); // ''
h.set('hello');
h.set('world');
h.undo();`
</script>

<template>
  <div class="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
    <div class="text-center mb-16">
      <h1 class="text-6xl h-18 font-bold mb-6 bg-linear-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
        Utils Library
      </h1>
      <p class="text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
        A Rust-inspired TypeScript utility library for safe, expressive code with lazy iterators, pattern matching, and type-safe result handling.
      </p>
      <router-link
        to="/docs"
        class="inline-flex items-center gap-2 mt-8 px-8 py-4 bg-linear-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-200"
      >
        Read Documentation
        <ArrowRight class="w-5 h-5" />
      </router-link>
    </div>

    <Section title="Features">
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div class="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-pink-500/50 transition-colors">
          <h3 class="text-xl font-semibold text-pink-400 mb-2">Iter</h3>
          <p class="text-gray-400">Lazy iterator with pipeline-based optimizations. Chain operations without creating intermediate arrays.</p>
        </div>
        <div class="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-indigo-500/50 transition-colors">
          <h3 class="text-xl font-semibold text-indigo-400 mb-2">ParIter</h3>
          <p class="text-gray-400">Parallel iterator for data-parallel execution. Leverage multiple CPU cores for large datasets.</p>
        </div>
        <div class="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-blue-500/50 transition-colors">
          <h3 class="text-xl font-semibold text-blue-400 mb-2">Option</h3>
          <p class="text-gray-400">Some/None type for nullable values. A type-safe alternative to null/undefined.</p>
        </div>
        <div class="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-green-500/50 transition-colors">
          <h3 class="text-xl font-semibold text-green-400 mb-2">Result</h3>
          <p class="text-gray-400">Ok/Err type for error handling. Explicit error handling without exceptions.</p>
        </div>
        <div class="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-purple-500/50 transition-colors">
          <h3 class="text-xl font-semibold text-purple-400 mb-2">Match</h3>
          <p class="text-gray-400">Pattern matching function. Rust-like pattern matching for TypeScript.</p>
        </div>
        <div class="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-orange-500/50 transition-colors">
          <h3 class="text-xl font-semibold text-orange-400 mb-2">Dispatch</h3>
          <p class="text-gray-400">Type-based function overloading. A multimethod pattern for type-safe dispatch.</p>
        </div>
        <div class="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-cyan-500/50 transition-colors">
          <h3 class="text-xl font-semibold text-cyan-400 mb-2">Bimap</h3>
          <p class="text-gray-400">Bidirectional map for two-way lookups. Map keys to values and values back to keys.</p>
        </div>
        <div class="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-rose-500/50 transition-colors">
          <h3 class="text-xl font-semibold text-rose-400 mb-2">Stack</h3>
          <p class="text-gray-400">LIFO data structure with O(1) operations. Perfect for undo/redo and backtracking.</p>
        </div>
        <div class="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-yellow-500/50 transition-colors">
          <h3 class="text-xl font-semibold text-yellow-400 mb-2">Queue</h3>
          <p class="text-gray-400">FIFO data structure with ring buffer. O(1) operations for task scheduling and BFS.</p>
        </div>
        <div class="bg-gray-800 p-6 rounded-lg border border-gray-700 hover:border-indigo-500/50 transition-colors">
          <h3 class="text-xl font-semibold text-indigo-400 mb-2">History</h3>
          <p class="text-gray-400">Undo/redo with controlled memory. Perfect for forms, editors, and state management.</p>
        </div>
      </div>
    </Section>

    <Section title="Quick Start">
      <CodeBlock :code="quickStartCode" />
    </Section>

    <Section title="Why Use This Library?">
      <ul class="space-y-4 text-gray-300">
        <li class="flex items-start gap-3">
          <span class="text-pink-400 text-xl mt-0.5">✓</span>
          <span><strong class="text-white">Lazy Evaluation:</strong> Iterator operations are lazy and execute in a single pass, avoiding intermediate arrays</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-blue-400 text-xl mt-0.5">✓</span>
          <span><strong class="text-white">Type Safety:</strong> Full TypeScript support with type guards and type narrowing</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-green-400 text-xl mt-0.5">✓</span>
          <span><strong class="text-white">Error Handling:</strong> Result type for explicit error handling without exceptions</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-purple-400 text-xl mt-0.5">✓</span>
          <span><strong class="text-white">Null Safety:</strong> Option type for nullable values eliminates null/undefined errors</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-orange-400 text-xl mt-0.5">✓</span>
          <span><strong class="text-white">Pattern Matching:</strong> Rust-like pattern matching for expressive code</span>
        </li>
        <li class="flex items-start gap-3">
          <span class="text-cyan-400 text-xl mt-0.5">✓</span>
          <span><strong class="text-white">Performance:</strong> Optimized pipeline-based architecture with 6-15x faster complex operations</span>
        </li>
      </ul>
    </Section>

    <Section title="Get Started">
      <div class="text-center">
        <p class="text-gray-300 mb-6 text-lg">Ready to dive in? Check out the full documentation.</p>
        <router-link
          to="/docs"
          class="inline-flex items-center gap-2 px-8 py-4 bg-linear-to-r from-pink-500 to-purple-500 hover:from-pink-600 hover:to-purple-600 text-white font-semibold rounded-lg transition-all duration-200"
        >
          View Documentation
          <ArrowRight class="w-5 h-5" />
        </router-link>
      </div>
    </Section>
  </div>
</template>
