<script setup lang="ts">
import CodeBlock from '@/components/CodeBlock.vue'
import Section from '@/components/Section.vue'

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
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
    <h1 class="text-4xl font-bold text-white mb-8">Option Documentation</h1>

    <Section title="Overview">
      <p class="text-gray-300 mb-4">
        The Option&lt;T&gt; type represents a value that may be present or absent.
      </p>
      <p class="text-gray-300">
        Some&lt;T&gt; contains a value, while None represents absence.
      </p>
    </Section>

    <Section title="Creating Options">
      <CodeBlock :code="optionCreatingCode" />
    </Section>

    <Section title="Checking State">
      <h3 class="text-xl font-semibold text-white mb-4">isSome & isNone</h3>
      <CodeBlock :code="optionCheckCode" />
    </Section>

    <Section title="Extracting Values">
      <h3 class="text-xl font-semibold text-white mb-4">unwrap</h3>
      <CodeBlock :code="optionUnwrapCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">unwrapOr</h3>
      <CodeBlock :code="optionUnwrapOrCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">unwrapOrElse</h3>
      <CodeBlock :code="optionUnwrapOrElseCode" />
    </Section>

    <Section title="Transforming Options">
      <h3 class="text-xl font-semibold text-white mb-4">map</h3>
      <CodeBlock :code="optionMapCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">andThen</h3>
      <CodeBlock :code="optionAndThenCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">match</h3>
      <CodeBlock :code="optionMatchCode" />
    </Section>

    <Section title="Working with Arrays">
      <h3 class="text-xl font-semibold text-white mb-4">collect</h3>
      <CodeBlock :code="optionCollectCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">partition</h3>
      <CodeBlock :code="optionPartitionCode" />
    </Section>
  </div>
</template>
