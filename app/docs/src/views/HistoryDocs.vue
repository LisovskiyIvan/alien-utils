<script setup lang="ts">
import CodeBlock from '@/components/CodeBlock.vue'
import Section from '@/components/Section.vue'

const historyCreatingCode = `// Create with initial state and options
import { History } from '@dayme/alien-utils';

const h = new History({ count: 0 }, {
  limit: 100,
  equals: Object.is
})`

const historyStateCode = `console.log(h.state);   // Current state
console.log(h.index);   // Current index
console.log(h.length);   // History length`

const historySetCode = `h.set({ count: 1 });
h.set({ count: 2 });
h.set({ count: 3 });`

const historyUpdateCode = `h.update(draft => ({
  count: draft.count + 1
}))`

const historyUndoRedoCode = `h.undo();
h.redo();`

const historyCanUndoRedoCode = `console.log(h.canUndo); // true
console.log(h.canRedo); // false`

const historySubscribeCode = `const unsubscribe = h.subscribe(state => {
  console.log('State changed:', state);
});

unsubscribe(); // Unsubscribe when done`

const historyTransactionCode = `h.transaction(() => {
  h.update(draft => ({ ...draft, field1: 'value1' }));
  h.update(draft => ({ ...draft, field2: 'value2' }));
  h.update(draft => ({ ...draft, field3: 'value3' }));
});
// Single undo reverts all changes`

const historyClearCode = `h.clear();`

const historyFromCode = `const h = History.from([
  { count: 0 },
  { count: 1 },
  { count: 2 }
]);`

const patchHistoryCreatingCode = `// For large objects, use PatchHistory for better memory
import { History } from '@dayme/alien-utils';

const h = History.withPatches(
  { count: 0, name: 'initial' },
  {
    limit: 100,
    diff: (old, next) => {
      const patches = [];
      for (const key in next) {
        if (old[key as string] !== next[key]) {
          patches.push({
            op: 'replace',
            path: key,
            value: next[key],
            oldValue: old[key as string]
          });
        }
      }
      return patches;
    },
    apply: (state, patches) => {
      let newState = { ...state };
      for (const patch of patches) {
        if (patch.op === 'replace') {
          newState[patch.path as string] = patch.value as any;
        }
      }
      return newState;
    },
    invert: (patches) => {
      return patches.map(p => ({
        ...p,
        value: p.oldValue,
        oldValue: p.value
      }));
    }
  }
)`

const reactFormCode = `// React form with History
import { useState, useEffect } from 'react';
import { History } from '@dayme/alien-utils';

export function useForm<T>(initial: T) {
  const [form, setForm] = useState<T>(initial);
  const history = useRef(new History(initial));

  const setField = <K extends keyof T>(key: K, value: T[K]) => {
    const next = { ...form, [key]: value };
    setForm(next);
    history.current.set(next);
  };

  const undo = () => {
    history.current.undo();
    setForm(history.current.state);
  };

  const redo = () => {
    history.current.redo();
    setForm(history.current.state);
  };

  useEffect(() => {
    const unsubscribe = history.current.subscribe(state => {
      setForm(state);
    });
    return unsubscribe;
  }, []);

  return { form, setField, undo, redo, canUndo: history.current.canUndo, canRedo: history.current.canRedo };
}`

const vuePiniaCode = `// Vue Pinia store with History
import { defineStore } from 'pinia';
import { History } from '@dayme/alien-utils';

export const useFormStore = defineStore('form', () => {
  const history = new History({ count: 0 });

  return {
    state: computed(() => history.state),
    setField: (field: string, value: any) => {
      const next = { ...history.state, [field]: value };
      history.set(next);
    },
    undo: () => {
      history.undo();
    },
    redo: () => {
      history.redo();
    },
    canUndo: computed(() => history.canUndo),
    canRedo: computed(() => history.canRedo)
  };
})`

const jotaiAtomCode = `// Jotai atom with History
import { atom, useAtom } from 'jotai';
import { History } from '@dayme/alien-utils';

const createHistoryAtom = <T>(initial: T) => {
  const history = new History(initial);

  const historyAtom = atom(history.state);

  return [
    historyAtom,
    {
      set: (next: T) => {
        history.set(next);
      },
      undo: () => history.undo(),
      redo: () => history.redo(),
      canUndo: () => history.canUndo,
      canRedo: () => history.canRedo,
      get: () => history.state
    }
  ];
};

const [, useHistory] = createHistoryAtom({ count: 0 });`
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
    <h1 class="text-4xl font-bold text-white mb-8">History Documentation</h1>

    <Section title="Overview">
      <p class="text-gray-300 mb-4">
        History provides undo/redo functionality with controlled memory usage and subscription
        support. Perfect for form management, editor state, and any UI requiring history tracking.
      </p>
      <p class="text-gray-300">
        Two implementations:
        <span class="text-indigo-400 font-semibold">History&lt;T&gt;</span> (stores full states) and
        <span class="text-indigo-400 font-semibold">PatchHistory&lt;T&gt;</span> (stores patches for
        better memory efficiency with large objects).
      </p>
    </Section>

    <Section title="Performance Notes">
      <p class="text-gray-300 mb-4">
        Key performance characteristics of the History implementation:
      </p>
      <ul class="space-y-2 text-gray-300 list-disc list-inside ml-6">
        <li>
          <strong class="text-indigo-400">O(1) Operations:</strong> All state operations are
          constant time.
        </li>
        <li>
          <strong class="text-indigo-400">Memory Controlled:</strong> Limit option automatically
          manages memory by removing old states.
        </li>
        <li>
          <strong class="text-indigo-400">Transaction Optimization:</strong> Multiple updates in a
          transaction create only one history entry.
        </li>
        <li>
          <strong class="text-indigo-400">Patch History:</strong> For large objects, patches use
          significantly less memory than full state storage.
        </li>
        <li>
          <strong class="text-indigo-400">Subscription Efficient:</strong> Subscribers are called
          once per actual state change, not per internal operation.
        </li>
      </ul>
    </Section>

    <Section title="Use Cases">
      <h3 class="text-xl font-semibold text-indigo-400 mb-4">Form State Management</h3>
      <p class="text-gray-300 mb-4">
        Track form state and allow users to undo changes. Each field update creates a new state.
      </p>

      <h3 class="text-xl font-semibold text-indigo-400 mb-4">Editor State</h3>
      <p class="text-gray-300 mb-4">
        Track document changes, text editor state, or canvas modifications.
      </p>

      <h3 class="text-xl font-semibold text-indigo-400 mb-4">Drag and Drop</h3>
      <p class="text-gray-300 mb-4">
        Use transactions to batch multiple drag operations into a single undoable action.
      </p>

      <h3 class="text-xl font-semibold text-indigo-400 mb-4">Settings Panel</h3>
      <p class="text-gray-300 mb-4">
        Track setting changes with undo capability. Use PatchHistory for complex settings objects.
      </p>
    </Section>

    <Section title="Best Practices">
      <ul class="space-y-2 text-gray-300 list-disc list-inside ml-6">
        <li>
          Use <code class="bg-gray-800 px-2 py-1 rounded">transaction()</code> for multi-step
          operations like form submissions or drag operations
        </li>
        <li>
          Set a reasonable <code class="bg-gray-800 px-2 py-1 rounded">limit</code> (typically
          50-100) to control memory usage
        </li>
        <li>
          Use <code class="bg-gray-800 px-2 py-1 rounded">PatchHistory</code> for large state
          objects or high-frequency updates
        </li>
        <li>
          Custom <code class="bg-gray-800 px-2 py-1 rounded">equals</code> for deep equality when
          using object-based state
        </li>
        <li>
          Subscribe to history in component mount and unsubscribe on unmount to avoid memory leaks
        </li>
        <li>
          Use <code class="bg-gray-800 px-2 py-1 rounded">canUndo</code> and
          <code class="bg-gray-800 px-2 py-1 rounded">canRedo</code> to disable/enable undo/redo
          buttons
        </li>
      </ul>
    </Section>

    <Section title="Creating">
      <p class="text-gray-300 mb-4">
        Create a History instance with initial state and optional configuration.
      </p>
      <CodeBlock :code="historyCreatingCode" />
    </Section>

    <Section title="Options">
      <p class="text-gray-300 mb-4">Configure History behavior with these options:</p>
      <ul class="space-y-2 text-gray-300 mb-4 list-disc list-inside ml-6">
        <li>
          <code class="bg-gray-800 px-2 py-1 rounded">limit?: number</code> - Maximum number of
          states to keep. When exceeded, oldest states are automatically removed. Default:
          <span class="text-indigo-400">Infinity</span>
        </li>
        <li>
          <code class="bg-gray-800 px-2 py-1 rounded">equals?: (a: T, b: T) => boolean</code> -
          Custom equality function to prevent duplicate states. Default:
          <span class="text-indigo-400">Object.is</span> (uses reference equality). For deep
          equality, provide a custom function or use PatchHistory.
        </li>
      </ul>
    </Section>

    <Section title="Reading State">
      <p class="text-gray-300 mb-4">
        Access current state and history information synchronously - no Option types needed for UI.
      </p>
      <CodeBlock :code="historyStateCode" />
    </Section>

    <Section title="Modifying State">
      <p class="text-gray-300 mb-4">
        Use <code class="bg-gray-800 px-2 py-1 rounded">set()</code> to replace state or
        <code class="bg-gray-800 px-2 py-1 rounded">update()</code> with a draft function.
      </p>
      <CodeBlock :code="historySetCode" />
      <CodeBlock :code="historyUpdateCode" />
      <p class="text-gray-300 mt-4">
        The <code class="bg-gray-800 px-2 py-1 rounded">update()</code> method is the killer feature
        for UI - allows incremental state modifications with a single method call.
      </p>
    </Section>

    <Section title="Undo / Redo">
      <p class="text-gray-300 mb-4">
        Navigate through history with simple methods. UI-friendly - no return values, just call and
        react to state changes.
      </p>
      <CodeBlock :code="historyUndoRedoCode" />
      <CodeBlock :code="historyCanUndoRedoCode" />
    </Section>

    <Section title="Subscriptions">
      <p class="text-gray-300 mb-4">
        Subscribe to state changes for reactive updates. Called only when state actually changes.
      </p>
      <CodeBlock :code="historySubscribeCode" />
      <p class="text-gray-300 mt-4">
        Perfect for React components, Vue stores, Zustand, Jotai, or any reactive system.
      </p>
    </Section>

    <Section title="Transactions">
      <p class="text-gray-300 mb-4">
        Batch multiple state changes into a single history entry. Undo reverts all changes at once.
      </p>
      <p class="text-gray-300">
        Must-have for forms, drag operations, sliders, and any multi-step interactions.
      </p>
      <CodeBlock :code="historyTransactionCode" />
    </Section>

    <Section title="Clear">
      <p class="text-gray-300 mb-4">
        Remove all history except for current state. Useful for resetting or starting fresh.
      </p>
      <CodeBlock :code="historyClearCode" />
    </Section>

    <Section title="Patch History (Memory Optimized)">
      <p class="text-gray-300 mb-4">
        For large objects or frequent updates, use PatchHistory to store only differences instead of
        full states.
      </p>
      <ul class="space-y-2 text-gray-300 mb-4 list-disc list-inside ml-6">
        <li>Less memory usage for large state objects</li>
        <li>Faster undo operations - only applies patch diffs</li>
        <li>Better garbage collection - fewer large object allocations</li>
      </ul>
      <p class="text-gray-300">
        Requires providing diff, apply, and invert functions for your state structure.
      </p>
      <CodeBlock :code="patchHistoryCreatingCode" />
    </Section>

    <Section title="Static Methods">
      <p class="text-gray-300 mb-4">
        Create History from existing data using static factory methods.
      </p>
      <CodeBlock :code="historyFromCode" />
    </Section>

    <Section title="Framework Integration">
      <p class="text-gray-300 mb-4">
        History integrates seamlessly with popular state management libraries. Here are common
        patterns:
      </p>
      <h3 class="text-xl font-semibold text-indigo-400 mb-4">React with useState</h3>
      <p class="text-gray-300 mb-4">Use a ref for History and sync state via subscriptions.</p>
      <CodeBlock :code="reactFormCode" />

      <h3 class="text-xl font-semibold text-indigo-400 my-4">Vue with Pinia</h3>
      <p class="text-gray-300 mb-4">Combine History with computed properties for reactive state.</p>
      <CodeBlock :code="vuePiniaCode" />

      <h3 class="text-xl font-semibold text-indigo-400 my-4">Jotai</h3>
      <p class="text-gray-300 mb-4">Create an atom wrapper that syncs with History.</p>
      <CodeBlock :code="jotaiAtomCode" />

      <h3 class="text-xl font-semibold text-indigo-400 my-4">Zustand</h3>
      <p class="text-gray-300 mb-4">Create a store with history middleware or use a custom hook.</p>
      <CodeBlock
        :code="`const createHistoryStore = <T>(initial: T) => {
  const history = new History(initial);

  return create((set) => ({
    state: history.state,
    setState: (next: T) => {
      history.set(next);
      set({ state: history.state });
    },
    undo: () => {
      history.undo();
      set({ state: history.state });
    },
    redo: () => {
      history.redo();
      set({ state: history.state });
    }
  }));
};`"
      />
    </Section>
  </div>
</template>
