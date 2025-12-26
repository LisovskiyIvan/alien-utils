<script setup lang="ts">
import { ref } from 'vue'
import CodeBlock from '@/components/CodeBlock.vue'
import { Home, RefreshCw, Diamond, CheckCircle, Target, ArrowRightLeft, ArrowUpDown, Check, Zap } from 'lucide-vue-next'

const activeSection = ref<'home' | 'iter' | 'option' | 'result' | 'match' | 'dispatch' | 'bimap'>('home')

const sections = [
  { id: 'home' as const, label: 'Home', icon: Home },
  { id: 'iter' as const, label: 'Iter', icon: RefreshCw },
  { id: 'option' as const, label: 'Option', icon: Diamond },
  { id: 'result' as const, label: 'Result', icon: CheckCircle },
  { id: 'match' as const, label: 'Match', icon: Target },
  { id: 'dispatch' as const, label: 'Dispatch', icon: ArrowRightLeft },
  { id: 'bimap' as const, label: 'Bimap', icon: ArrowUpDown },
]

// Iter code examples
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

// Option code examples
const optionCreatingCode = `// Create Some
const some = new Some(42);
const some2 = Some.of(42);

// Create None (singleton)
const none = None.instance();
const none2 = None.of();

// From potentially null/undefined values
function findUser(id: number): Option<User> {
  const user = users.find(u => u.id === id);
  return user ? new Some(user) : None.instance();
}`

const optionCheckCode = `const option = new Some(42);

if (option.isSome()) {
  console.log('Has value:', option.value); // 42
}

if (option.isNone()) {
  console.log('No value');
}`

const optionUnwrapCode = `const some = new Some(42);
some.unwrap(); // 42

const none = None.instance();
none.unwrap(); // throws Error`

const optionUnwrapOrCode = `const some = new Some(42);
some.unwrapOr(0); // 42

const none = None.instance();
none.unwrapOr(0); // 0`

const optionUnwrapOrElseCode = `const none = None.instance();
none.unwrapOrElse(() => computeDefault());`

const optionMapCode = `const some = new Some(42);
const mapped = some.map(x => x * 2); // Some(84)

const none = None.instance();
const mappedNone = none.map(x => x * 2); // None`

const optionAndThenCode = `function parseAge(value: string): Option<number> {
  const age = parseInt(value, 10);
  return isNaN(age) ? None.instance() : new Some(age);
}

const input = "25";
const result = parseAge(input).andThen(age => {
  return age >= 18 ? new Some("adult") : None.instance();
}); // Some("adult")`

const optionMatchCode = `const option = new Some(42);
const message = option.match({
  Some: (value) => \`Value is \${value}\`,
  None: "No value"
});
// "Value is 42"`

const optionCollectCode = `const options = [Some.of(1), Some.of(2), Some.of(3)];
Some.collect(options); // Some([1, 2, 3])

const options2 = [Some.of(1), None.instance(), Some.of(3)];
Some.collect(options2); // None`

const optionPartitionCode = `const options = [Some.of(1), None.instance(), Some.of(3)];
const [somes, nones] = Some.partition(options);
// somes: [Some(1), Some(3)]
// nones: [None, None]`

// Result code examples
const resultCreatingCode = `// Create Ok
const ok = new Ok(42);
const ok2 = Ok.of(42);

// Create Err
const err = new Err("Something went wrong");
const err2 = Err.of("Something went wrong");

// Example function returning Result
function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return new Err("Division by zero");
  }
  return new Ok(a / b);
}`

const resultCheckCode = `const result = new Ok(42);

if (result.isOk()) {
  console.log('Success:', result.value); // 42
}

if (result.isErr()) {
  console.log('Error:', result.error);
}`

const resultUnwrapCode = `const ok = new Ok(42);
ok.unwrap(); // 42

const err = new Err("Failed");
err.unwrap(); // throws Error`

const resultUnwrapOrCode = `const ok = new Ok(42);
ok.unwrapOr(0); // 42

const err = new Err("Failed");
err.unwrapOr(0); // 0`

const resultUnwrapOrElseCode = `const err = new Err("Failed");
err.unwrapOrElse((e) => parseInt(e.match(/\\d+/)?.[0] || '0'));`

const resultMapCode = `const ok = new Ok(42);
const mapped = ok.map(x => x * 2); // Ok(84)

const err = new Err("Failed");
const mappedErr = err.map(x => x * 2); // Err("Failed")`

const resultMapErrCode = `const err = new Err("Failed");
const mapped = err.mapErr(e => \`Error: \${e}\`); // Err("Error: Failed")`

const resultAndThenCode = `function divide(a: number, b: number): Result<number, string> {
  if (b === 0) return new Err("Division by zero");
  return new Ok(a / b);
}

function validatePositive(n: number): Result<number, string> {
  return n >= 0 ? new Ok(n) : new Err("Negative value");
}

const result = divide(10, 2).andThen(validatePositive); // Ok(5)
const result2 = divide(10, 0).andThen(validatePositive); // Err("Division by zero")`

const resultMatchCode = `const result = new Ok(42);
const message = result.match({
  Ok: (value) => \`Success: \${value}\`,
  Err: (error) => \`Error: \${error}\`
});
// "Success: 42"`

const resultToOptionOkCode = `new Ok(42).ok(); // Some(42)
new Err("Failed").ok(); // None`

const resultToOptionErrCode = `new Err("Failed").err(); // Some("Failed")
new Ok(42).err(); // None`

// Match code examples
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

const basicDispatchCode = `const stringify = dispatch()
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

const basicUsageCode = `import { Bimap } from '@your-org/utils';

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

const oneToOneCode = `const bimap = new Bimap<string, number>();

// Setting a new key with an existing value removes the old key
bimap.set('alice', 1);
bimap.set('bob', 1);  // alice is automatically removed

console.log(bimap.has('alice'));   // false
console.log(bimap.has('bob'));     // true
console.log(bimap.size);           // 1`

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

const quickStartCode = `import { Iter, Some, None, Ok, Err, match, dispatch, Bimap } from '@your-org/utils';

// Bimap
const bimap = new Bimap<string, number>();
bimap.set('alice', 1);
bimap.get('alice');    // 1
bimap.getReverse(1);   // 'alice'

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
stringify(123); // "123"`
</script>

<template>
  <div class="min-h-screen bg-gray-950 text-gray-100 flex">
    <!-- Sidebar -->
    <aside class="w-64 bg-gray-900 border-r border-gray-800 flex flex-col sticky top-0 h-screen overflow-y-auto">
      <div class="p-6 border-b border-gray-800">
        <h1 class="text-2xl font-bold bg-gradient-to-r from-pink-500 to-purple-500 bg-clip-text text-transparent">
          Utils Library
        </h1>
        <p class="text-sm text-gray-400 mt-1">TypeScript Utilities</p>
      </div>

      <nav class="flex-1 p-4">
        <ul class="space-y-2">
          <li v-for="section in sections" :key="section.id">
            <button
              @click="activeSection = section.id"
              class="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left transition-all duration-200"
              :class="activeSection === section.id
                ? 'bg-gradient-to-r from-pink-500/20 to-purple-500/20 text-white border border-pink-500/50'
                : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'"
            >
              <component :is="section.icon" class="w-5 h-5" />
              <span class="font-medium">{{ section.label }}</span>
            </button>
          </li>
        </ul>
      </nav>

      <div class="p-4 border-t border-gray-800">
        <p class="text-xs text-gray-500 text-center">
          Rust-inspired TypeScript utilities
        </p>
      </div>
    </aside>

    <!-- Main Content -->
    <main class="flex-1 overflow-y-auto">
      <!-- Home Section -->
      <div v-if="activeSection === 'home'" class="max-w-4xl mx-auto px-8 py-12">
        <div class="text-center mb-12">
          <h2 class="text-5xl font-bold text-white mb-6">Welcome to Utils</h2>
          <p class="text-xl text-gray-400 max-w-2xl mx-auto">
            A Rust-inspired TypeScript utility library for safe, expressive code with lazy iterators, pattern matching, and type-safe result handling.
          </p>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          <div class="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-pink-500/50 transition-colors cursor-pointer" @click="activeSection = 'iter'">
            <h3 class="text-2xl font-semibold text-pink-400 mb-3">Iter</h3>
            <p class="text-gray-400">Lazy iterator with pipeline-based optimizations. Chain operations without creating intermediate arrays.</p>
          </div>
          <div class="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-blue-500/50 transition-colors cursor-pointer" @click="activeSection = 'option'">
            <h3 class="text-2xl font-semibold text-blue-400 mb-3">Option</h3>
            <p class="text-gray-400">Some/None type for nullable values. A type-safe alternative to null/undefined.</p>
          </div>
          <div class="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-green-500/50 transition-colors cursor-pointer" @click="activeSection = 'result'">
            <h3 class="text-2xl font-semibold text-green-400 mb-3">Result</h3>
            <p class="text-gray-400">Ok/Err type for error handling. Explicit error handling without exceptions.</p>
          </div>
          <div class="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-purple-500/50 transition-colors cursor-pointer" @click="activeSection = 'match'">
            <h3 class="text-2xl font-semibold text-purple-400 mb-3">Match</h3>
            <p class="text-gray-400">Pattern matching function. Rust-like pattern matching for TypeScript.</p>
          </div>
          <div class="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-orange-500/50 transition-colors cursor-pointer" @click="activeSection = 'dispatch'">
            <h3 class="text-2xl font-semibold text-orange-400 mb-3">Dispatch</h3>
            <p class="text-gray-400">Type-based function overloading. A multimethod pattern for type-safe dispatch.</p>
          </div>
          <div class="bg-gray-900 p-6 rounded-lg border border-gray-800 hover:border-cyan-500/50 transition-colors cursor-pointer" @click="activeSection = 'bimap'">
            <h3 class="text-2xl font-semibold text-cyan-400 mb-3">Bimap</h3>
            <p class="text-gray-400">Bidirectional map for two-way lookups. Map keys to values and values back to keys.</p>
          </div>
        </div>

        <div class="bg-gray-900 rounded-lg p-8 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Quick Start</h3>
          <CodeBlock :code="quickStartCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-6">Features</h3>
          <ul class="space-y-4 text-gray-300">
            <li class="flex items-start gap-3">
              <Check class="text-pink-400 w-5 h-5 flex-shrink-0 mt-0.5" />
              <span><strong>Lazy Evaluation:</strong> Iterator operations are lazy and execute in a single pass</span>
            </li>
            <li class="flex items-start gap-3">
              <Check class="text-blue-400 w-5 h-5 flex-shrink-0 mt-0.5" />
              <span><strong>Type Safety:</strong> Full TypeScript support with type guards</span>
            </li>
            <li class="flex items-start gap-3">
              <Check class="text-green-400 w-5 h-5 flex-shrink-0 mt-0.5" />
              <span><strong>Error Handling:</strong> Result type for explicit error handling without exceptions</span>
            </li>
            <li class="flex items-start gap-3">
              <Check class="text-purple-400 w-5 h-5 flex-shrink-0 mt-0.5" />
              <span><strong>Null Safety:</strong> Option type for nullable values</span>
            </li>
            <li class="flex items-start gap-3">
              <Check class="text-yellow-400 w-5 h-5 flex-shrink-0 mt-0.5" />
              <span><strong>Pattern Matching:</strong> Rust-like pattern matching</span>
            </li>
            <li class="flex items-start gap-3">
              <Check class="text-cyan-400 w-5 h-5 flex-shrink-0 mt-0.5" />
              <span><strong>Performance:</strong> Optimized pipeline-based architecture</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Iter Section -->
      <div v-if="activeSection === 'iter'" class="max-w-4xl mx-auto px-8 py-12">
        <h2 class="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <RefreshCw class="text-pink-400 w-10 h-10" />
          Iter Documentation
        </h2>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Overview</h3>
          <p class="text-gray-300">
            The Iter class provides a lazy, Rust-style iterator with pipeline-based optimizations.
          </p>
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Creating Iterators</h3>
          <CodeBlock :code="iterCreatingCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Lazy Operations</h3>
          <p class="text-gray-300 mb-4">These operations are lazy and don't execute until a consuming operation is called:</p>
          <CodeBlock :code="iterLazyCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">map</h4>
          <CodeBlock :code="iterMapCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">filter</h4>
          <CodeBlock :code="iterFilterCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">flatMap</h4>
          <CodeBlock :code="iterFlatMapCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">flatten</h4>
          <CodeBlock :code="iterFlattenCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">take & takeWhile</h4>
          <CodeBlock :code="iterTakeCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">skip & skipWhile</h4>
          <CodeBlock :code="iterSkipCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">enumerate</h4>
          <CodeBlock :code="iterEnumerateCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">zip</h4>
          <CodeBlock :code="iterZipCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">chain</h4>
          <CodeBlock :code="iterChainCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">stepBy</h4>
          <CodeBlock :code="iterStepByCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">unique & uniqueBy</h4>
          <CodeBlock :code="iterUniqueCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">inspect</h4>
          <CodeBlock :code="iterInspectCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Consuming Operations</h3>
          <p class="text-gray-300 mb-4">These operations trigger execution of lazy pipeline:</p>

          <h4 class="text-xl font-semibold text-white mb-4">collect</h4>
          <CodeBlock :code="iterCollectCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">fold</h4>
          <CodeBlock :code="iterFoldCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">reduce</h4>
          <CodeBlock :code="iterReduceCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">forEach</h4>
          <CodeBlock :code="iterForEachCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">count</h4>
          <CodeBlock :code="iterCountCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">find</h4>
          <CodeBlock :code="iterFindCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">first, last, nth</h4>
          <CodeBlock :code="iterFirstCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">all & any</h4>
          <CodeBlock :code="iterAllAnyCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">partition</h4>
          <CodeBlock :code="iterPartitionCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">min, max, minBy, maxBy</h4>
          <CodeBlock :code="iterMinMaxCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">sum, product, join</h4>
          <CodeBlock :code="iterSumProductJoinCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">toSet, toMap, groupBy</h4>
          <CodeBlock :code="iterToSetCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">sort, sortBy, reverse</h4>
          <CodeBlock :code="iterSortCode" />
        </div>
      </div>

      <!-- Option Section -->
      <div v-if="activeSection === 'option'" class="max-w-4xl mx-auto px-8 py-12">
        <h2 class="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <Diamond class="text-blue-400 w-10 h-10" />
          Option Documentation
        </h2>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Overview</h3>
          <p class="text-gray-300 mb-4">
            The Option&lt;T&gt; type represents a value that may be present or absent.
          </p>
          <p class="text-gray-300">
            Some&lt;T&gt; contains a value, while None represents absence.
          </p>
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Creating Options</h3>
          <CodeBlock :code="optionCreatingCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Checking State</h3>
          <h4 class="text-xl font-semibold text-white mb-4">isSome & isNone</h4>
          <CodeBlock :code="optionCheckCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Extracting Values</h3>
          <h4 class="text-xl font-semibold text-white mb-4">unwrap</h4>
          <CodeBlock :code="optionUnwrapCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">unwrapOr</h4>
          <CodeBlock :code="optionUnwrapOrCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">unwrapOrElse</h4>
          <CodeBlock :code="optionUnwrapOrElseCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Transforming Options</h3>
          <h4 class="text-xl font-semibold text-white mb-4">map</h4>
          <CodeBlock :code="optionMapCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">andThen</h4>
          <CodeBlock :code="optionAndThenCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">match</h4>
          <CodeBlock :code="optionMatchCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Working with Arrays</h3>
          <h4 class="text-xl font-semibold text-white mb-4">collect</h4>
          <CodeBlock :code="optionCollectCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">partition</h4>
          <CodeBlock :code="optionPartitionCode" />
        </div>
      </div>

      <!-- Result Section -->
      <div v-if="activeSection === 'result'" class="max-w-4xl mx-auto px-8 py-12">
        <h2 class="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <CheckCircle class="text-green-400 w-10 h-10" />
          Result Documentation
        </h2>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Overview</h3>
          <p class="text-gray-300 mb-4">
            The Result&lt;T, E&gt; type represents a result that can either succeed or fail.
          </p>
          <p class="text-gray-300">
            Ok&lt;T&gt; contains a success value, while Err&lt;E&gt; contains an error.
          </p>
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Creating Results</h3>
          <CodeBlock :code="resultCreatingCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Checking State</h3>
          <h4 class="text-xl font-semibold text-white mb-4">isOk & isErr</h4>
          <CodeBlock :code="resultCheckCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Extracting Values</h3>
          <h4 class="text-xl font-semibold text-white mb-4">unwrap</h4>
          <CodeBlock :code="resultUnwrapCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">unwrapOr</h4>
          <CodeBlock :code="resultUnwrapOrCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">unwrapOrElse</h4>
          <CodeBlock :code="resultUnwrapOrElseCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Transforming Results</h3>
          <h4 class="text-xl font-semibold text-white mb-4">map</h4>
          <CodeBlock :code="resultMapCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">mapErr</h4>
          <CodeBlock :code="resultMapErrCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">andThen</h4>
          <CodeBlock :code="resultAndThenCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">match</h4>
          <CodeBlock :code="resultMatchCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Converting to Option</h3>
          <h4 class="text-xl font-semibold text-white mb-4">ok</h4>
          <CodeBlock :code="resultToOptionOkCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">err</h4>
          <CodeBlock :code="resultToOptionErrCode" />
        </div>
      </div>

      <!-- Match Section -->
      <div v-if="activeSection === 'match'" class="max-w-4xl mx-auto px-8 py-12">
        <h2 class="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <Target class="text-purple-400 w-10 h-10" />
          Match Documentation
        </h2>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Overview</h3>
          <p class="text-gray-300 mb-4">
            The match function provides a Rust-like pattern matching mechanism.
          </p>
          <p class="text-gray-300">
            Patterns are defined as an object where keys are pattern values. The _ key serves as default/wildcard case.
          </p>
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Basic Usage</h3>
          <h4 class="text-xl font-semibold text-white mb-4">Number Matching</h4>
          <CodeBlock :code="matchNumberCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">String Matching</h3>
          <CodeBlock :code="matchStringCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Complex Examples</h3>
          <h4 class="text-xl font-semibold text-white mb-4">HTTP Status Codes</h4>
          <CodeBlock :code="matchHttpStatusCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">Calculation Operations</h4>
          <CodeBlock :code="matchCalculateCode" />
        </div>
      </div>

      <!-- Dispatch Section -->
      <div v-if="activeSection === 'dispatch'" class="max-w-4xl mx-auto px-8 py-12">
        <h2 class="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <ArrowRightLeft class="text-orange-400 w-10 h-10" />
          Dispatch Documentation
        </h2>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Overview</h3>
          <p class="text-gray-300 mb-4">
            The dispatch function provides a multimethod pattern for type-based function overloading,
            similar to Python's singledispatch or CLOS.
          </p>
          <p class="text-gray-300">
            Unlike match which works at the expression level with exact values, dispatch routes function
            calls based on type guards, making it perfect for serialization, visitors, AST processing,
            and domain APIs.
          </p>
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Basic Usage</h3>
          <p class="text-gray-300 mb-4">
            Create a dispatch function and register handlers for different types using type guards:
          </p>
          <CodeBlock :code="basicDispatchCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Default Handler</h3>
          <p class="text-gray-300 mb-4">
            Use <code class="bg-gray-800 px-2 py-1 rounded text-pink-400">.default()</code> to handle
            unmatched types. Without a default handler, dispatch will throw an error for unhandled
            values:
          </p>
          <CodeBlock :code="defaultHandlerCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Custom Type Guards</h3>
          <p class="text-gray-300 mb-4">
            Create custom type guards to handle domain-specific types. The dispatch function preserves
            type narrowing for type-safe handlers:
          </p>
          <CodeBlock :code="customTypeGuardCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Complex Examples</h3>
          <h4 class="text-xl font-semibold text-white mb-4">AST Visitor Pattern</h4>
          <p class="text-gray-300 mb-4">
            Dispatch is excellent for implementing visitor patterns on AST nodes:
          </p>
          <CodeBlock :code="astVisitorCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">Nested Dispatch</h4>
          <p class="text-gray-300 mb-4">
            Dispatch functions can be composed and nested for complex scenarios:
          </p>
          <CodeBlock :code="nestedDispatchCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Built-in Type Guards</h3>
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
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Use Cases</h3>
          <ul class="space-y-4 text-gray-300">
            <li class="flex items-start gap-3">
              <Zap class="text-orange-400 w-5 h-5 flex-shrink-0 mt-0.5" />
              <span><strong>Serialization:</strong> Convert different data types to string representations</span>
            </li>
            <li class="flex items-start gap-3">
              <Zap class="text-orange-400 w-5 h-5 flex-shrink-0 mt-0.5" />
              <span><strong>Visitors:</strong> Implement visitor pattern for traversing complex data structures</span>
            </li>
            <li class="flex items-start gap-3">
              <Zap class="text-orange-400 w-5 h-5 flex-shrink-0 mt-0.5" />
              <span><strong>AST Processing:</strong> Process abstract syntax trees with type-specific handlers</span>
            </li>
            <li class="flex items-start gap-3">
              <Zap class="text-orange-400 w-5 h-5 flex-shrink-0 mt-0.5" />
              <span><strong>Domain APIs:</strong> Create type-safe APIs for domain objects</span>
            </li>
          </ul>
        </div>
      </div>

      <!-- Bimap Section -->
      <div v-if="activeSection === 'bimap'" class="max-w-4xl mx-auto px-8 py-12">
        <h2 class="text-4xl font-bold text-white mb-8 flex items-center gap-3">
          <ArrowUpDown class="text-cyan-400 w-10 h-10" />
          Bimap Documentation
        </h2>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Overview</h3>
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
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Basic Usage</h3>
          <p class="text-gray-300 mb-4">
            Create a Bimap and add key-value pairs using <code class="bg-gray-800 px-2 py-1 rounded text-pink-400">.set()</code>:
          </p>
          <CodeBlock :code="basicUsageCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Creating a Bimap</h3>
          <p class="text-gray-300 mb-4">
            There are three ways to create a Bimap:
          </p>
          <CodeBlock :code="creationCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Bidirectional Lookup</h3>
          <p class="text-gray-300 mb-4">
            Use <code class="bg-gray-800 px-2 py-1 rounded text-pink-400">.get()</code> to find a value by
            key, and <code class="bg-gray-800 px-2 py-1 rounded text-pink-400">.getReverse()</code> to find a
            key by value:
          </p>
          <CodeBlock :code="basicUsageCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">One-to-One Mapping</h3>
          <p class="text-gray-300 mb-4">
            A Bimap enforces a one-to-one mapping. When you set a key to a value that already exists,
            the old key-value pair is automatically removed:
          </p>
          <CodeBlock :code="oneToOneCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Deleting Entries</h3>
          <p class="text-gray-300 mb-4">
            Remove entries by key or by value:
          </p>
          <CodeBlock :code="deleteCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Iteration</h3>
          <p class="text-gray-300 mb-4">
            Iterate over keys, values, entries, or reverse entries:
          </p>
          <CodeBlock :code="iterationCode" />
        </div>

        <div class="bg-gray-900 rounded-lg p-6 mb-8 border border-gray-800">
          <h3 class="text-2xl font-bold text-white mb-4">Use Cases</h3>
          <h4 class="text-xl font-semibold text-white mb-4">Currency Mapping</h4>
          <p class="text-gray-300 mb-4">
            Map currency codes to their names bidirectionally:
          </p>
          <CodeBlock :code="currencyCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">Enum to String Mapping</h4>
          <p class="text-gray-300 mb-4">
            Convert between enum values and their string representations:
          </p>
          <CodeBlock :code="enumCode" />

          <h4 class="text-xl font-semibold text-white mb-4 mt-8">User ID to Email Mapping</h4>
          <p class="text-gray-300 mb-4">
            Maintain a bidirectional mapping between user IDs and their emails:
          </p>
          <CodeBlock :code="userMappingCode" />
        </div>
      </div>
    </main>
  </div>
</template>
