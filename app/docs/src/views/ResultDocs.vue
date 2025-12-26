<script setup lang="ts">
import CodeBlock from '@/components/CodeBlock.vue'
import Section from '@/components/Section.vue'

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
</script>

<template>
  <div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-20">
    <h1 class="text-4xl font-bold text-white mb-8">Result Documentation</h1>

    <Section title="Overview">
      <p class="text-gray-300 mb-4">
        The Result&lt;T, E&gt; type represents a result that can either succeed or fail.
      </p>
      <p class="text-gray-300">
        Ok&lt;T&gt; contains a success value, while Err&lt;E&gt; contains an error.
      </p>
    </Section>

    <Section title="Creating Results">
      <CodeBlock :code="resultCreatingCode" />
    </Section>

    <Section title="Checking State">
      <h3 class="text-xl font-semibold text-white mb-4">isOk & isErr</h3>
      <CodeBlock :code="resultCheckCode" />
    </Section>

    <Section title="Extracting Values">
      <h3 class="text-xl font-semibold text-white mb-4">unwrap</h3>
      <CodeBlock :code="resultUnwrapCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">unwrapOr</h3>
      <CodeBlock :code="resultUnwrapOrCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">unwrapOrElse</h3>
      <CodeBlock :code="resultUnwrapOrElseCode" />
    </Section>

    <Section title="Transforming Results">
      <h3 class="text-xl font-semibold text-white mb-4">map</h3>
      <CodeBlock :code="resultMapCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">mapErr</h3>
      <CodeBlock :code="resultMapErrCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">andThen</h3>
      <CodeBlock :code="resultAndThenCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">match</h3>
      <CodeBlock :code="resultMatchCode" />
    </Section>

    <Section title="Converting to Option">
      <h3 class="text-xl font-semibold text-white mb-4">ok</h3>
      <CodeBlock :code="resultToOptionOkCode" />

      <h3 class="text-xl font-semibold text-white mb-4 mt-8">err</h3>
      <CodeBlock :code="resultToOptionErrCode" />
    </Section>
  </div>
</template>
