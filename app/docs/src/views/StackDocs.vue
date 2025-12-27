<script setup lang="ts">
import CodeBlock from '@/components/CodeBlock.vue'
import Section from '@/components/Section.vue'

const stackCreatingCode = `// Create empty stack
const stack = new Stack<number>();

// Create from iterable
const stack2 = Stack.from([1, 2, 3]);
const stack3 = Stack.from(new Set(['a', 'b', 'c']));`

const stackPushPopCode = `const stack = new Stack<number>();
stack.push(1);
stack.push(2);
stack.push(3);

// LIFO order: 3, 2, 1
stack.pop(); // Some(3)
stack.pop(); // Some(2)
stack.pop(); // Some(1)
stack.pop(); // None (stack is empty)`

const stackPeekCode = `const stack = new Stack<number>();
stack.push(1);
stack.push(2);

stack.peek(); // Some(2) - doesn't remove
stack.peek(); // Some(2) - still there
stack.pop();  // Some(2)
stack.peek(); // Some(1)`

const stackSizeCode = `const stack = new Stack<number>();
console.log(stack.size);      // 0
console.log(stack.isEmpty()); // true

stack.push(1);
stack.push(2);
console.log(stack.size);      // 2
console.log(stack.isEmpty()); // false`

const stackClearCode = `const stack = new Stack<number>();
stack.push(1);
stack.push(2);
stack.push(3);

stack.clear();
console.log(stack.size);      // 0
console.log(stack.isEmpty()); // true`

const stackIterableCode = `const stack = new Stack<number>();
stack.push(1);
stack.push(2);
stack.push(3);

// Iterate in LIFO order
for (const item of stack) {
  console.log(item); // 3, 2, 1
}

// Convert to array
const arr = Array.from(stack); // [3, 2, 1]

// Use with Iter
import { Iter } from '@dayme/utils';
Iter.from(stack).map(x => x * 2).collect(); // [6, 4, 2]`

const stackChainingCode = `const stack = new Stack<number>();
stack.push(1).push(2).push(3);
console.log(stack.size); // 3`
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
    <h1 class="text-4xl font-bold text-white mb-8">Stack Documentation</h1>

    <Section title="Overview">
      <p class="text-gray-300 mb-4">
        A Stack is a LIFO (Last-In-First-Out) data structure where elements are added and removed from the same end.
      </p>
      <p class="text-gray-300">
        Perfect for undo/redo history, expression parsing, and backtracking algorithms.
      </p>
    </Section>

    <Section title="Creating Stacks">
      <CodeBlock :code="stackCreatingCode" />
    </Section>

    <Section title="Push and Pop">
      <p class="text-gray-300 mb-4">
        Use <code class="bg-gray-800 px-2 py-1 rounded">push()</code> to add elements and <code class="bg-gray-800 px-2 py-1 rounded">pop()</code> to remove them.
      </p>
      <p class="text-gray-300 mb-4">
        Operations are O(1) and return <code class="bg-gray-800 px-2 py-1 rounded">Option&lt;T&gt;</code> for type safety.
      </p>
      <CodeBlock :code="stackPushPopCode" />
    </Section>

    <Section title="Peek">
      <p class="text-gray-300 mb-4">
        Use <code class="bg-gray-800 px-2 py-1 rounded">peek()</code> to view the top element without removing it.
      </p>
      <CodeBlock :code="stackPeekCode" />
    </Section>

    <Section title="Size and IsEmpty">
      <p class="text-gray-300 mb-4">
        Check the stack size or if it's empty using properties and methods.
      </p>
      <CodeBlock :code="stackSizeCode" />
    </Section>

    <Section title="Clear">
      <p class="text-gray-300 mb-4">
        Remove all elements from the stack with <code class="bg-gray-800 px-2 py-1 rounded">clear()</code>.
      </p>
      <CodeBlock :code="stackClearCode" />
    </Section>

    <Section title="Iterable">
      <p class="text-gray-300 mb-4">
        Stack implements the <code class="bg-gray-800 px-2 py-1 rounded">Iterable</code> protocol, so it works with <code class="bg-gray-800 px-2 py-1 rounded">Iter</code> and all ES6 iteration constructs.
      </p>
      <CodeBlock :code="stackIterableCode" />
    </Section>

    <Section title="Chaining">
      <p class="text-gray-300 mb-4">
        The <code class="bg-gray-800 px-2 py-1 rounded">push()</code> method returns <code class="bg-gray-800 px-2 py-1 rounded">this</code> for method chaining.
      </p>
      <CodeBlock :code="stackChainingCode" />
    </Section>
  </div>
</template>
