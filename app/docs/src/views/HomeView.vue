<script setup lang="ts">
import Section from '@/components/Section.vue'
import CodeBlock from '@/components/CodeBlock.vue'

const quickStartCode = `import { Iter, Some, None, Ok, Err, match, dispatch, isNumber, isString } from '@your-org/utils';

// Iterator
const result = Iter.from([1, 2, 3, 4, 5])
  .map(x => x * 2)
  .filter(x => x > 5)
  .collect(); // [6, 8, 10]

// Option
const option = new Some(42);
option.unwrap(); // 42

// Result
const result = divide(10, 2); // Ok(5)
const result = divide(10, 0); // Err("Division by zero")

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
stringify("hello"); // "hello"`
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
    <div class="text-center mb-12">
      <h1
        class="text-5xl font-bold text-white mb-4 bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent"
      >
        Utils Library
      </h1>
      <p class="text-xl text-gray-400">
        A Rust-inspired TypeScript utility library for safe, expressive code
      </p>
    </div>

    <Section title="Overview">
      <p class="text-gray-300 mb-4">
        This library provides functional programming utilities inspired by Rust, including lazy
        iterators, pattern matching, and type-safe result handling.
      </p>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
        <router-link
          to="/iter"
          class="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg transition-colors border border-gray-700"
        >
          <h3 class="text-xl font-semibold text-pink-400 mb-2">Iter</h3>
          <p class="text-gray-400">Lazy iterator with pipeline-based optimizations</p>
        </router-link>
        <router-link
          to="/option"
          class="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg transition-colors border border-gray-700"
        >
          <h3 class="text-xl font-semibold text-blue-400 mb-2">Option</h3>
          <p class="text-gray-400">Some/None type for nullable values</p>
        </router-link>
        <router-link
          to="/result"
          class="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg transition-colors border border-gray-700"
        >
          <h3 class="text-xl font-semibold text-green-400 mb-2">Result</h3>
          <p class="text-gray-400">Ok/Err type for error handling</p>
        </router-link>
        <router-link
          to="/match"
          class="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg transition-colors border border-gray-700"
        >
          <h3 class="text-xl font-semibold text-purple-400 mb-2">Match</h3>
          <p class="text-gray-400">Pattern matching function</p>
        </router-link>
        <router-link
          to="/dispatch"
          class="bg-gray-800 hover:bg-gray-700 p-6 rounded-lg transition-colors border border-gray-700"
        >
          <h3 class="text-xl font-semibold text-cyan-400 mb-2">Dispatch</h3>
          <p class="text-gray-400">Type-based function overloading</p>
        </router-link>
      </div>
    </Section>

    <Section title="Quick Start">
      <CodeBlock :code="quickStartCode" />
    </Section>

    <Section title="Features">
      <ul class="space-y-3 text-gray-300">
        <li class="flex items-start">
          <span class="text-pink-400 mr-2">✓</span>
          <span
            ><strong>Lazy Evaluation:</strong> Iterator operations are lazy and execute in a single
            pass</span
          >
        </li>
        <li class="flex items-start">
          <span class="text-blue-400 mr-2">✓</span>
          <span><strong>Type Safety:</strong> Full TypeScript support with type guards</span>
        </li>
        <li class="flex items-start">
          <span class="text-green-400 mr-2">✓</span>
          <span
            ><strong>Error Handling:</strong> Result type for explicit error handling without
            exceptions</span
          >
        </li>
        <li class="flex items-start">
          <span class="text-purple-400 mr-2">✓</span>
          <span><strong>Null Safety:</strong> Option type for nullable values</span>
        </li>
        <li class="flex items-start">
          <span class="text-yellow-400 mr-2">✓</span>
          <span><strong>Pattern Matching:</strong> Rust-like pattern matching</span>
        </li>
        <li class="flex items-start">
          <span class="text-cyan-400 mr-2">✓</span>
          <span><strong>Multimethod:</strong> Type-based function overloading with dispatch</span>
        </li>
        <li class="flex items-start">
          <span class="text-pink-400 mr-2">✓</span>
          <span><strong>Performance:</strong> Optimized pipeline-based architecture</span>
        </li>
      </ul>
    </Section>
  </div>
</template>
