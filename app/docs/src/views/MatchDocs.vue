<script setup lang="ts">
import CodeBlock from '@/components/CodeBlock.vue'
import Section from '@/components/Section.vue'

const matchNumberCode = `const numberMatcher = match<number, number>({
  1: v => v,
  2: v => v * 2,
  3: v => v * 3,
  _: v => v * 10 // default case
});

numberMatcher(1); // 1
numberMatcher(2); // 4
numberMatcher(3); // 9
numberMatcher(5); // 50 (uses default)`

const matchStringCode = `const stringMatcher = match<string, string>({
  'hello': v => \`\${v} world\`,
  'goodbye': v => \`See you, \${v}!\`,
  'morning': v => \`Good \${v}!\`,
  _: v => \`Unknown: \${v}\`
});

stringMatcher('hello');    // "hello world"
stringMatcher('goodbye');  // "See you, goodbye!"
stringMatcher('test');     // "Unknown: test"`

const matchHttpStatusCode = `const getStatusMessage = match<number, string>({
  200: () => "OK",
  201: () => "Created",
  204: () => "No Content",
  400: () => "Bad Request",
  401: () => "Unauthorized",
  403: () => "Forbidden",
  404: () => "Not Found",
  500: () => "Internal Server Error",
  503: () => "Service Unavailable",
  _: (code) => \`Unknown status: \${code}\`
});

getStatusMessage(200); // "OK"
getStatusMessage(404); // "Not Found"
getStatusMessage(999); // "Unknown status: 999"`

const matchCalculateCode = `const calculate = match<string, (a: number, b: number) => number>({
  'add': () => (a, b) => a + b,
  'subtract': () => (a, b) => a - b,
  'multiply': () => (a, b) => a * b,
  'divide': () => (a, b) => b !== 0 ? a / b : NaN,
  'power': () => (a, b) => Math.pow(a, b),
  _: () => (a, b) => NaN
});

const operation = 'multiply';
const fn = calculate(operation);
fn(5, 3); // 15`
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
    <h1 class="text-4xl font-bold text-white mb-8">Match Documentation</h1>

    <Section title="Overview">
      <p class="text-gray-300 mb-4">
        The match function provides a Rust-like pattern matching mechanism.
      </p>
      <p class="text-gray-300">
        Patterns are defined as an object where keys are pattern values. The _ key serves as default/wildcard case.
      </p>
    </Section>

    <Section title="Basic Usage">
      <h3 class="text-xl font-semibold text-white mb-4">Number Matching</h3>
      <CodeBlock :code="matchNumberCode" />
    </Section>

    <Section title="String Matching">
      <CodeBlock :code="matchStringCode" />
    </Section>

    <Section title="Complex Examples">
      <h3 class="text-xl font-semibold text-white mb-4">HTTP Status Codes</h3>
      <CodeBlock :code="matchHttpStatusCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">Calculation Operations</h3>
      <CodeBlock :code="matchCalculateCode" />
    </Section>
  </div>
</template>
