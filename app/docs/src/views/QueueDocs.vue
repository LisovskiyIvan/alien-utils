<script setup lang="ts">
import CodeBlock from '@/components/CodeBlock.vue'
import Section from '@/components/Section.vue'

const queueCreatingCode = `// Create empty queue
const queue = new Queue<number>();

// Create with initial capacity
const queue2 = new Queue<number>(32);

// Create from iterable
const queue3 = Queue.from([1, 2, 3]);
const queue4 = Queue.from(new Set(['a', 'b', 'c']));`

const queueEnqueueDequeueCode = `const queue = new Queue<number>();
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);

// FIFO order: 1, 2, 3
queue.dequeue(); // Some(1)
queue.dequeue(); // Some(2)
queue.dequeue(); // Some(3)
queue.dequeue(); // None (queue is empty)`

const queuePeekCode = `const queue = new Queue<number>();
queue.enqueue(1);
queue.enqueue(2);

queue.peek(); // Some(1) - doesn't remove
queue.peek(); // Some(1) - still there
queue.dequeue(); // Some(1)
queue.peek();   // Some(2)`

const queueSizeCode = `const queue = new Queue<number>();
console.log(queue.size);      // 0
console.log(queue.isEmpty()); // true

queue.enqueue(1);
queue.enqueue(2);
console.log(queue.size);      // 2
console.log(queue.isEmpty()); // false`

const queueClearCode = `const queue = new Queue<number>();
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);

queue.clear();
console.log(queue.size);      // 0
console.log(queue.isEmpty()); // true`

const queueIterableCode = `const queue = new Queue<number>();
queue.enqueue(1);
queue.enqueue(2);
queue.enqueue(3);

// Iterate in FIFO order
for (const item of queue) {
  console.log(item); // 1, 2, 3
}

// Convert to array
const arr = Array.from(queue); // [1, 2, 3]

// Use with Iter
import { Iter } from '@dayme/utils';
Iter.from(queue).map(x => x * 2).collect(); // [2, 4, 6]`

const queuePerformanceCode = `// Queue uses a ring buffer implementation
// All operations are O(1)
// No expensive Array.shift() calls

const queue = new Queue<number>(4);
queue.enqueue(1);  // O(1)
queue.enqueue(2);  // O(1)
queue.dequeue();    // O(1)
queue.enqueue(3);  // O(1)

// Automatically resizes when full
for (let i = 0; i < 1000; i++) {
  queue.enqueue(i); // Still O(1) amortized
}`
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
    <h1 class="text-4xl font-bold text-white mb-8">Queue Documentation</h1>

    <Section title="Overview">
      <p class="text-gray-300 mb-4">
        A Queue is a FIFO (First-In-First-Out) data structure where elements are added at one end and removed from the other.
      </p>
      <p class="text-gray-300">
        Perfect for task scheduling, breadth-first search, and message processing.
      </p>
    </Section>

    <Section title="Creating Queues">
      <CodeBlock :code="queueCreatingCode" />
    </Section>

    <Section title="Enqueue and Dequeue">
      <p class="text-gray-300 mb-4">
        Use <code class="bg-gray-800 px-2 py-1 rounded">enqueue()</code> to add elements and <code class="bg-gray-800 px-2 py-1 rounded">dequeue()</code> to remove them.
      </p>
      <p class="text-gray-300 mb-4">
        Operations are O(1) and return <code class="bg-gray-800 px-2 py-1 rounded">Option&lt;T&gt;</code> for type safety.
      </p>
      <CodeBlock :code="queueEnqueueDequeueCode" />
    </Section>

    <Section title="Peek">
      <p class="text-gray-300 mb-4">
        Use <code class="bg-gray-800 px-2 py-1 rounded">peek()</code> to view the front element without removing it.
      </p>
      <CodeBlock :code="queuePeekCode" />
    </Section>

    <Section title="Size and IsEmpty">
      <p class="text-gray-300 mb-4">
        Check the queue size or if it's empty using properties and methods.
      </p>
      <CodeBlock :code="queueSizeCode" />
    </Section>

    <Section title="Clear">
      <p class="text-gray-300 mb-4">
        Remove all elements from the queue with <code class="bg-gray-800 px-2 py-1 rounded">clear()</code>.
      </p>
      <CodeBlock :code="queueClearCode" />
    </Section>

    <Section title="Iterable">
      <p class="text-gray-300 mb-4">
        Queue implements the <code class="bg-gray-800 px-2 py-1 rounded">Iterable</code> protocol, so it works with <code class="bg-gray-800 px-2 py-1 rounded">Iter</code> and all ES6 iteration constructs.
      </p>
      <CodeBlock :code="queueIterableCode" />
    </Section>

    <Section title="Performance">
      <p class="text-gray-300 mb-4">
        Queue uses a ring buffer (circular buffer) implementation for optimal O(1) performance on all operations.
      </p>
      <p class="text-gray-300 mb-4">
        It automatically resizes when full, maintaining O(1) amortized performance even with growing capacity.
      </p>
      <CodeBlock :code="queuePerformanceCode" />
    </Section>
  </div>
</template>
