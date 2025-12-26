<script setup lang="ts">
import CodeBlock from '@/components/CodeBlock.vue'
import Section from '@/components/Section.vue'

const basicUsageCode = `import { Bimap } from '@dayme/utils';

const bimap = new Bimap<string, number>();

bimap.set('alice', 1);
bimap.set('bob', 2);
bimap.set('charlie', 3);

bimap.get('alice');         // 1
bimap.getReverse(2);         // 'bob'
bimap.has('charlie');       // true
bimap.hasValue(3);          // true`

const creationCode = `// From constructor
const bimap = new Bimap<string, number>();

// From static from
const bimap2 = Bimap.from([
  ['USD', 'US Dollar'],
  ['EUR', 'Euro'],
  ['GBP', 'British Pound']
]);

// From static of
const bimap3 = Bimap.of(
  ['active', 1],
  ['inactive', 2],
  ['pending', 3]
);`

const deleteCode = `const bimap = new Bimap<string, number>();
bimap.set('alice', 1);
bimap.set('bob', 2);

bimap.delete('alice');           // true, removes alice => 1
bimap.deleteValue(2);            // true, removes bob => 2
bimap.delete('unknown');         // false
bimap.deleteValue(999);          // false`

const iterationCode = `const bimap = Bimap.of(
  ['alice', 1],
  ['bob', 2],
  ['charlie', 3]
);

bimap.keys();              // ['alice', 'bob', 'charlie']
bimap.values();            // [1, 2, 3]
bimap.entries();           // [['alice', 1], ['bob', 2], ['charlie', 3]]
bimap.reverseEntries();    // [[1, 'alice'], [2, 'bob'], [3, 'charlie']]

bimap.forEach((value, key) => {
  console.log(\`\${key} => \${value}\`);
});

bimap.forEachReverse((key, value) => {
  console.log(\`\${value} => \${key}\`);
});`

const sizeCode = `const bimap = new Bimap<string, number>();
console.log(bimap.size);   // 0

bimap.set('a', 1);
console.log(bimap.size);   // 1

bimap.set('b', 2);
console.log(bimap.size);   // 2`

const clearCode = `const bimap = Bimap.of(['a', 1], ['b', 2], ['c', 3]);
console.log(bimap.size);   // 3

bimap.clear();
console.log(bimap.size);   // 0`

const cloneCode = `const bimap = Bimap.of(['a', 1], ['b', 2]);
const cloned = bimap.clone();

cloned.set('c', 3);

console.log(bimap.size);    // 2
console.log(cloned.size);    // 3`

const currencyCode = `type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY';
type CurrencyName = string;

const currencyMap = new Bimap<CurrencyCode, CurrencyName>();
currencyMap.set('USD', 'US Dollar');
currencyMap.set('EUR', 'Euro');
currencyMap.set('GBP', 'British Pound');
currencyMap.set('JPY', 'Japanese Yen');

currencyMap.get('EUR');           // 'Euro'
currencyMap.getReverse('US Dollar'); // 'USD'`

const enumCode = `enum Status {
  Active = 1,
  Inactive = 2,
  Pending = 3,
  Suspended = 4
}

const statusMap = new Bimap<Status, string>();
statusMap.set(Status.Active, 'active');
statusMap.set(Status.Inactive, 'inactive');
statusMap.set(Status.Pending, 'pending');
statusMap.set(Status.Suspended, 'suspended');

statusMap.get(Status.Active);           // 'active'
statusMap.getReverse('pending');       // Status.Pending`

const userMappingCode = `const userMap = new Bimap<number, string>();
userMap.set(1, 'alice@example.com');
userMap.set(2, 'bob@example.com');
userMap.set(3, 'charlie@example.com');

const userId = 1;
const email = userMap.get(userId);    // 'alice@example.com'

const lookupEmail = 'bob@example.com';
const foundId = userMap.getReverse(lookupEmail); // 2`

const configCode = `const config = new Bimap<string, number>();
config.set('timeout', 5000);
config.set('maxRetries', 3);
config.set('port', 8080);

config.get('timeout');          // 5000
config.getReverse(8080);        // 'port'

config.forEach((value, key) => {
  console.log(\`Config: \${key} = \${value}\`);
});`

const oneToOneCode = `const bimap = new Bimap<string, number>();

// Setting a new key with an existing value removes the old key
bimap.set('alice', 1);
bimap.set('bob', 1);  // alice is automatically removed

console.log(bimap.has('alice'));   // false
console.log(bimap.has('bob'));     // true
console.log(bimap.size);           // 1`

const serializationCode = `const bimap = Bimap.of(['a', 1], ['b', 2]);

const str = bimap.toString();
console.log(str); // Bimap { a => 1, b => 2 }

const json = bimap.toJSON();
console.log(json);
// { forward: [['a', 1], ['b', 2]], reverse: [[1, 'a'], [2, 'b']] }`
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
    <h1 class="text-4xl font-bold text-white mb-8">Bimap Documentation</h1>

    <Section title="Overview">
      <p class="text-gray-300 mb-4">
        A Bimap (Bidirectional Map) is a data structure that allows bidirectional lookup - you can find
        values by keys and keys by values with equal efficiency.
      </p>
      <p class="text-gray-300 mb-4">
        Unlike a regular Map where you can only lookup values by keys, a Bimap maintains a one-to-one
        mapping where each key maps to exactly one value and each value maps to exactly one key.
      </p>
      <p class="text-gray-300">
        This makes it perfect for bidirectional mappings like ID ↔ email, enum ↔ string, or any
        scenario where you need to lookup in both directions.
      </p>
    </Section>

    <Section title="Basic Usage">
      <p class="text-gray-300 mb-4">
        Create a Bimap and add key-value pairs using <code class="bg-gray-800 px-2 py-1 rounded text-pink-400">.set()</code>:
      </p>
      <CodeBlock :code="basicUsageCode" />
    </Section>

    <Section title="Creating a Bimap">
      <p class="text-gray-300 mb-4">
        There are three ways to create a Bimap:
      </p>
      <CodeBlock :code="creationCode" />
    </Section>

    <Section title="One-to-One Mapping">
      <p class="text-gray-300 mb-4">
        A Bimap enforces a one-to-one mapping. When you set a key to a value that already exists,
        the old key-value pair is automatically removed:
      </p>
      <CodeBlock :code="oneToOneCode" />
    </Section>

    <Section title="Bidirectional Lookup">
      <p class="text-gray-300 mb-4">
        Use <code class="bg-gray-800 px-2 py-1 rounded text-pink-400">.get()</code> to find a value by
        key, and <code class="bg-gray-800 px-2 py-1 rounded text-pink-400">.getReverse()</code> to find a
        key by value:
      </p>
      <CodeBlock :code="basicUsageCode" />
    </Section>

    <Section title="Checking Existence">
      <p class="text-gray-300 mb-4">
        Use <code class="bg-gray-800 px-2 py-1 rounded text-pink-400">.has()</code> to check if a key
        exists, and <code class="bg-gray-800 px-2 py-1 rounded text-pink-400">.hasValue()</code> to
        check if a value exists:
      </p>
      <CodeBlock :code="basicUsageCode" />
    </Section>

    <Section title="Deleting Entries">
      <p class="text-gray-300 mb-4">
        Remove entries by key or by value:
      </p>
      <CodeBlock :code="deleteCode" />
    </Section>

    <Section title="Iteration">
      <p class="text-gray-300 mb-4">
        Iterate over keys, values, entries, or reverse entries:
      </p>
      <CodeBlock :code="iterationCode" />
    </Section>

    <Section title="Size">
      <p class="text-gray-300 mb-4">
        Get the number of entries using the <code class="bg-gray-800 px-2 py-1 rounded text-pink-400">.size</code> property:
      </p>
      <CodeBlock :code="sizeCode" />
    </Section>

    <Section title="Clear">
      <p class="text-gray-300 mb-4">
        Remove all entries from the Bimap:
      </p>
      <CodeBlock :code="clearCode" />
    </Section>

    <Section title="Clone">
      <p class="text-gray-300 mb-4">
        Create a shallow copy of the Bimap:
      </p>
      <CodeBlock :code="cloneCode" />
    </Section>

    <Section title="Serialization">
      <p class="text-gray-300 mb-4">
        Convert a Bimap to string or JSON:
      </p>
      <CodeBlock :code="serializationCode" />
    </Section>

    <Section title="Use Cases">
      <h3 class="text-xl font-semibold text-white mb-4">Currency Mapping</h3>
      <p class="text-gray-300 mb-4">
        Map currency codes to their names bidirectionally:
      </p>
      <CodeBlock :code="currencyCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">Enum to String Mapping</h3>
      <p class="text-gray-300 mb-4">
        Convert between enum values and their string representations:
      </p>
      <CodeBlock :code="enumCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">User ID to Email Mapping</h3>
      <p class="text-gray-300 mb-4">
        Maintain a bidirectional mapping between user IDs and their emails:
      </p>
      <CodeBlock :code="userMappingCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">Configuration Keys</h3>
      <p class="text-gray-300 mb-4">
        Map configuration keys to their numeric values:
      </p>
      <CodeBlock :code="configCode" />
    </Section>

    <Section title="API Reference">
      <div class="space-y-4">
        <div class="bg-gray-800 p-4 rounded border border-gray-700">
          <h4 class="text-lg font-semibold text-white mb-2">Constructor</h4>
          <code class="text-pink-400">new Bimap&lt;K, V&gt;()</code>
        </div>

        <div class="bg-gray-800 p-4 rounded border border-gray-700">
          <h4 class="text-lg font-semibold text-white mb-2">Static Methods</h4>
          <ul class="space-y-2 text-gray-300">
            <li><code class="text-pink-400">Bimap.from(entries)</code> - Create from iterable of [K, V] pairs</li>
            <li><code class="text-pink-400">Bimap.of(...entries)</code> - Create from [K, V] pair arguments</li>
          </ul>
        </div>

        <div class="bg-gray-800 p-4 rounded border border-gray-700">
          <h4 class="text-lg font-semibold text-white mb-2">Instance Methods</h4>
          <ul class="space-y-2 text-gray-300">
            <li><code class="text-pink-400">.set(key, value)</code> - Add or update a key-value pair</li>
            <li><code class="text-pink-400">.get(key)</code> - Get value by key</li>
            <li><code class="text-pink-400">.getReverse(value)</code> - Get key by value</li>
            <li><code class="text-pink-400">.has(key)</code> - Check if key exists</li>
            <li><code class="text-pink-400">.hasValue(value)</code> - Check if value exists</li>
            <li><code class="text-pink-400">.delete(key)</code> - Delete by key</li>
            <li><code class="text-pink-400">.deleteValue(value)</code> - Delete by value</li>
            <li><code class="text-pink-400">.clear()</code> - Clear all entries</li>
            <li><code class="text-pink-400">.keys()</code> - Get array of keys</li>
            <li><code class="text-pink-400">.values()</code> - Get array of values</li>
            <li><code class="text-pink-400">.entries()</code> - Get array of [K, V] pairs</li>
            <li><code class="text-pink-400">.reverseEntries()</code> - Get array of [V, K] pairs</li>
            <li><code class="text-pink-400">.forEach(callback)</code> - Iterate over entries</li>
            <li><code class="text-pink-400">.forEachReverse(callback)</code> - Iterate in reverse</li>
            <li><code class="text-pink-400">.clone()</code> - Create a shallow copy</li>
            <li><code class="text-pink-400">.toString()</code> - String representation</li>
            <li><code class="text-pink-400">.toJSON()</code> - JSON representation</li>
          </ul>
        </div>

        <div class="bg-gray-800 p-4 rounded border border-gray-700">
          <h4 class="text-lg font-semibold text-white mb-2">Properties</h4>
          <ul class="space-y-2 text-gray-300">
            <li><code class="text-pink-400">.size</code> - Number of entries</li>
          </ul>
        </div>
      </div>
    </Section>
  </div>
</template>
