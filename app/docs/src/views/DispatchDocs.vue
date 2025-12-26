<script setup lang="ts">
import CodeBlock from '@/components/CodeBlock.vue'
import Section from '@/components/Section.vue'

const basicDispatchCode = `import { dispatch, isNumber, isString, isArray } from '@dayme/utils';

const stringify = dispatch()
  .on(isNumber, n => n.toString())
  .on(isString, s => s)
  .on(isArray, a => a.join(','));

stringify(123);         // "123"
stringify('hello');     // "hello"
stringify(['a', 'b']);  // "a,b"`

const defaultHandlerCode = `const describe = dispatch()
  .on(isNumber, n => \`Number: \${n}\`)
  .default(v => \`Unknown: \${typeof v}\`);

describe(42);       // "Number: 42"
describe('hello');  // "Unknown: string"
describe(true);     // "Unknown: boolean"`

const customTypeGuardCode = `interface User { id: number; name: string }
interface Product { id: number; price: number }

const isUser = (v: unknown): v is User =>
  typeof v === 'object' && v !== null && 'name' in v;

const isProduct = (v: unknown): v is Product =>
  typeof v === 'object' && v !== null && 'price' in v;

const getType = dispatch()
  .on(isUser, u => \`User: \${u.name}\`)
  .on(isProduct, p => \`Product: $\${p.price}\`);

getType({ id: 1, name: 'Alice' });     // "User: Alice"
getType({ id: 2, price: 99.99 });      // "Product: $99.99"`

const astVisitorCode = `interface BinaryNode { type: 'binary'; left: Node; right: Node; op: string }
interface LiteralNode { type: 'literal'; value: number }
interface VariableNode { type: 'variable'; name: string }
type Node = BinaryNode | LiteralNode | VariableNode;

const isBinary = (v: unknown): v is BinaryNode =>
  typeof v === 'object' && v !== null && (v as any).type === 'binary';
const isLiteral = (v: unknown): v is LiteralNode =>
  typeof v === 'object' && v !== null && (v as any).type === 'literal';
const isVariable = (v: unknown): v is VariableNode =>
  typeof v === 'object' && v !== null && (v as any).type === 'variable';

const evaluate = dispatch()
  .on(isBinary, b => \`(\${evaluate(b.left)} \${b.op} \${evaluate(b.right)})\`)
  .on(isLiteral, l => l.value.toString())
  .on(isVariable, v => v.name);

const ast: Node = {
  type: 'binary',
  left: { type: 'literal', value: 42 },
  right: { type: 'variable', name: 'x' },
  op: '+'
};

evaluate(ast); // "(42 + x)"`

const nestedDispatchCode = `const inner = dispatch()
  .on(isNumber, n => n.toString())
  .default(() => 'other');

const outer = dispatch()
  .on(isArray, a => a.map(inner).join('|'))
  .default(() => 'not array');

outer([1, 2, 'a']);    // "1|2|other"
outer('hello');        // "not array"`
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
    <h1 class="text-4xl font-bold text-white mb-8">Dispatch Documentation</h1>

    <Section title="Overview">
      <p class="text-gray-300 mb-4">
        The dispatch function provides a multimethod pattern for type-based function overloading,
        similar to Python's singledispatch or CLOS.
      </p>
      <p class="text-gray-300">
        Unlike match which works at the expression level with exact values, dispatch routes function
        calls based on type guards, making it perfect for serialization, visitors, AST processing,
        and domain APIs.
      </p>
    </Section>

    <Section title="Basic Usage">
      <p class="text-gray-300 mb-4">
        Create a dispatch function and register handlers for different types using type guards:
      </p>
      <CodeBlock :code="basicDispatchCode" />
    </Section>

    <Section title="Default Handler">
      <p class="text-gray-300 mb-4">
        Use <code class="bg-gray-800 px-2 py-1 rounded text-pink-400">.default()</code> to handle
        unmatched types. Without a default handler, dispatch will throw an error for unhandled
        values:
      </p>
      <CodeBlock :code="defaultHandlerCode" />
    </Section>

    <Section title="Custom Type Guards">
      <p class="text-gray-300 mb-4">
        Create custom type guards to handle domain-specific types. The dispatch function preserves
        type narrowing for type-safe handlers:
      </p>
      <CodeBlock :code="customTypeGuardCode" />
    </Section>

    <Section title="Complex Examples">
      <h3 class="text-xl font-semibold text-white mb-4">AST Visitor Pattern</h3>
      <p class="text-gray-300 mb-4">
        Dispatch is excellent for implementing visitor patterns on AST nodes:
      </p>
      <CodeBlock :code="astVisitorCode" />

      <h3 class="text-xl font-semibold text-white mt-8 mb-4">Nested Dispatch</h3>
      <p class="text-gray-300 mb-4">
        Dispatch functions can be composed and nested for complex scenarios:
      </p>
      <CodeBlock :code="nestedDispatchCode" />
    </Section>

    <Section title="Built-in Type Guards">
      <p class="text-gray-300 mb-4">The library includes common type guards for convenience:</p>
      <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
        <div class="bg-gray-800 p-3 rounded border border-gray-700">
          <code class="text-pink-400">isNumber</code>
        </div>
        <div class="bg-gray-800 p-3 rounded border border-gray-700">
          <code class="text-pink-400">isString</code>
        </div>
        <div class="bg-gray-800 p-3 rounded border border-gray-700">
          <code class="text-pink-400">isArray</code>
        </div>
        <div class="bg-gray-800 p-3 rounded border border-gray-700">
          <code class="text-pink-400">isBoolean</code>
        </div>
        <div class="bg-gray-800 p-3 rounded border border-gray-700">
          <code class="text-pink-400">isNull</code>
        </div>
        <div class="bg-gray-800 p-3 rounded border border-gray-700">
          <code class="text-pink-400">isUndefined</code>
        </div>
        <div class="bg-gray-800 p-3 rounded border border-gray-700">
          <code class="text-pink-400">isObject</code>
        </div>
        <div class="bg-gray-800 p-3 rounded border border-gray-700">
          <code class="text-pink-400">isFunction</code>
        </div>
      </div>
    </Section>

    <Section title="Use Cases">
      <ul class="space-y-3 text-gray-300">
        <li class="flex items-start">
          <span class="text-cyan-400 mr-2">🔥</span>
          <span
            ><strong>Serialization:</strong> Convert different data types to string
            representations</span
          >
        </li>
        <li class="flex items-start">
          <span class="text-cyan-400 mr-2">🔥</span>
          <span
            ><strong>Visitors:</strong> Implement visitor pattern for traversing complex data
            structures</span
          >
        </li>
        <li class="flex items-start">
          <span class="text-cyan-400 mr-2">🔥</span>
          <span
            ><strong>AST Processing:</strong> Process abstract syntax trees with type-specific
            handlers</span
          >
        </li>
        <li class="flex items-start">
          <span class="text-cyan-400 mr-2">🔥</span>
          <span><strong>Domain APIs:</strong> Create type-safe APIs for domain objects</span>
        </li>
      </ul>
    </Section>
  </div>
</template>
