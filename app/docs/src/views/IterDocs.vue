<script setup lang="ts">
import CodeBlock from '@/components/CodeBlock.vue'
import Section from '@/components/Section.vue'

const iterCreatingCode = `// From an array
const iter1 = Iter.from([1, 2, 3, 4, 5]);

// From a range
const iter2 = Iter.range(0, 5); // [0, 1, 2, 3, 4]

// Repeating a value
const iter3 = Iter.repeat(42).take(3); // [42, 42, 42]

// Generating values
let n = 0;
const iter4 = Iter.generate(() => n++).take(5); // [0, 1, 2, 3, 4]`

const iterLazyCode = `const result = Iter.from([1, 2, 3, 4, 5])
  .map(x => x * 2)
  .filter(x => x > 5)
  .take(2)
  .collect(); // [6, 8]`

const iterMapCode = `Iter.from([1, 2, 3]).map(x => x * 2).collect(); // [2, 4, 6]`

const iterFilterCode = `Iter.from([1, 2, 3, 4]).filter(x => x % 2 === 0).collect(); // [2, 4]`

const iterFlatMapCode = `Iter.from([1, 2, 3]).flatMap(x => [x, x * 10]).collect(); // [1, 10, 2, 20, 3, 30]`

const iterFlattenCode = `Iter.from([[1, 2], [3, 4]]).flatten().collect(); // [1, 2, 3, 4]`

const iterTakeCode = `Iter.from([1, 2, 3, 4, 5]).take(3).collect(); // [1, 2, 3]
Iter.from([1, 2, 3, 4, 1, 2]).takeWhile(x => x < 4).collect(); // [1, 2, 3]`

const iterSkipCode = `Iter.from([1, 2, 3, 4, 5]).skip(2).collect(); // [3, 4, 5]
Iter.from([1, 2, 3, 4, 1, 2]).skipWhile(x => x < 3).collect(); // [3, 4, 1, 2]`

const iterEnumerateCode = `Iter.from(['a', 'b', 'c']).enumerate().collect(); // [[0, 'a'], [1, 'b'], [2, 'c']]`

const iterZipCode = `Iter.from([1, 2, 3]).zip(['a', 'b', 'c']).collect(); // [[1, 'a'], [2, 'b'], [3, 'c']]`

const iterChainCode = `Iter.from([1, 2]).chain([3, 4]).collect(); // [1, 2, 3, 4]`

const iterStepByCode = `Iter.from([1, 2, 3, 4, 5, 6]).stepBy(2).collect(); // [1, 3, 5]`

const iterUniqueCode = `Iter.from([1, 2, 2, 3, 1, 4]).unique().collect(); // [1, 2, 3, 4]
Iter.from([{id: 1, name: 'A'}, {id: 1, name: 'B'}, {id: 2, name: 'C'}])
  .uniqueBy(obj => obj.id).collect(); // [{id: 1, name: 'A'}, {id: 2, name: 'C'}]`

const iterInspectCode = `Iter.from([1, 2, 3])
  .inspect(x => console.log('processing:', x))
  .map(x => x * 2)
  .collect();`

const iterCollectCode = `Iter.from([1, 2, 3]).collect(); // [1, 2, 3]`

const iterFoldCode = `Iter.from([1, 2, 3, 4]).fold(0, (acc, x) => acc + x); // 10`

const iterReduceCode = `Iter.from([1, 2, 3, 4]).reduce((acc, x) => acc + x); // Some(10)
Iter.empty<number>().reduce((acc, x) => acc + x); // None`

const iterForEachCode = `Iter.from([1, 2, 3]).forEach(x => console.log(x));`

const iterCountCode = `Iter.from([1, 2, 3]).count(); // 3`

const iterFindCode = `Iter.from([1, 2, 3, 4]).find(x => x > 2); // Some(3)`

const iterFirstCode = `Iter.from([1, 2, 3]).first(); // Some(1)
Iter.from([1, 2, 3]).last(); // Some(3)
Iter.from(['a', 'b', 'c']).nth(1); // Some('b')`

const iterAllAnyCode = `Iter.from([2, 4, 6]).all(x => x % 2 === 0); // true
Iter.from([1, 2, 3]).any(x => x > 2); // true`

const iterPartitionCode = `const [evens, odds] = Iter.from([1, 2, 3, 4]).partition(x => x % 2 === 0);
// evens: [2, 4], odds: [1, 3]`

const iterMinMaxCode = `Iter.from([3, 1, 4, 1, 5]).max(); // Some(5)
Iter.from([3, 1, 4, 1, 5]).min(); // Some(1)
Iter.from([{age: 20}, {age: 30}, {age: 25}]).maxBy(x => x.age); // Some({age: 30})
Iter.from([{age: 20}, {age: 30}, {age: 25}]).minBy(x => x.age); // Some({age: 20})`

const iterSumProductJoinCode = `Iter.from([1, 2, 3, 4]).sum(); // 10
Iter.from([1, 2, 3, 4]).product(); // 24
Iter.from(['a', 'b', 'c']).join('-'); // 'a-b-c'`

const iterToSetCode = `Iter.from([1, 2, 2, 3, 1]).toSet(); // Set {1, 2, 3}
Iter.from([[1, 'a'], [2, 'b']]).toMap(); // Map {1 => 'a', 2 => 'b'}
Iter.from([1, 2, 3, 4, 5, 6]).groupBy(x => x % 2 === 0 ? 'even' : 'odd');`

const iterSortCode = `Iter.from([3, 1, 4, 1, 5]).sort().collect(); // [1, 1, 3, 4, 5]
Iter.from([{age: 30}, {age: 20}, {age: 25}]).sortBy(x => x.age).collect(); // [{age: 20}, {age: 25}, {age: 30}]
Iter.from([1, 2, 3]).reverse().collect(); // [3, 2, 1]`
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
    <h1 class="text-4xl font-bold text-white mb-8">Iter Documentation</h1>

    <Section title="Overview">
      <p class="text-gray-300 mb-4">
        The <span class="bg-gray-800 px-2 py-1 rounded text-pink-400 font-mono">Iter</span> class provides a lazy, Rust-style iterator with pipeline-based optimizations.
      </p>
    </Section>

    <Section title="Creating Iterators">
      <CodeBlock :code="iterCreatingCode" />
    </Section>

    <Section title="Lazy Operations">
      <p class="text-gray-300 mb-4">These operations are lazy and don't execute until a consuming operation is called:</p>
      <CodeBlock :code="iterLazyCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">map</h3>
      <CodeBlock :code="iterMapCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">filter</h3>
      <CodeBlock :code="iterFilterCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">flatMap</h3>
      <CodeBlock :code="iterFlatMapCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">flatten</h3>
      <CodeBlock :code="iterFlattenCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">take & takeWhile</h3>
      <CodeBlock :code="iterTakeCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">skip & skipWhile</h3>
      <CodeBlock :code="iterSkipCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">enumerate</h3>
      <CodeBlock :code="iterEnumerateCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">zip</h3>
      <CodeBlock :code="iterZipCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">chain</h3>
      <CodeBlock :code="iterChainCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">stepBy</h3>
      <CodeBlock :code="iterStepByCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">unique & uniqueBy</h3>
      <CodeBlock :code="iterUniqueCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">inspect</h3>
      <CodeBlock :code="iterInspectCode" />
    </Section>

    <Section title="Consuming Operations">
      <p class="text-gray-300 mb-4">These operations trigger execution of lazy pipeline:</p>

      <h3 class="text-xl font-semibold text-white mb-4">collect</h3>
      <CodeBlock :code="iterCollectCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">fold</h3>
      <CodeBlock :code="iterFoldCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">reduce</h3>
      <CodeBlock :code="iterReduceCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">forEach</h3>
      <CodeBlock :code="iterForEachCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">count</h3>
      <CodeBlock :code="iterCountCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">find</h3>
      <CodeBlock :code="iterFindCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">first, last, nth</h3>
      <CodeBlock :code="iterFirstCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">all & any</h3>
      <CodeBlock :code="iterAllAnyCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">partition</h3>
      <CodeBlock :code="iterPartitionCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">min, max, minBy, maxBy</h3>
      <CodeBlock :code="iterMinMaxCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">sum, product, join</h3>
      <CodeBlock :code="iterSumProductJoinCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">toSet, toMap, groupBy</h3>
      <CodeBlock :code="iterToSetCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">sort, sortBy, reverse</h3>
      <CodeBlock :code="iterSortCode" />
    </Section>
  </div>
</template>
