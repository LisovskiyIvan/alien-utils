import { Some, None, type Option, Ok, Err, type Result } from "@dayme/utils";

// Функция для вывода результатов на страницу
function createExample(
  title: string,
  output: string,
  type: "success" | "error" | "info" = "info"
) {
  const div = document.createElement("div");
  div.className = "example";

  const h3 = document.createElement("h3");
  h3.textContent = title;
  div.appendChild(h3);

  const outputDiv = document.createElement("div");
  outputDiv.className = `output ${type}`;
  outputDiv.textContent = output;
  div.appendChild(outputDiv);

  return div;
}

// Примеры использования Option
function demonstrateOption() {
  const container = document.getElementById("option-examples");
  if (!container) return;

  // Пример 1: Some
  const someValue = new Some(42);
  const someOutput = [
    `const someValue = new Some(42);`,
    `someValue.isSome(): ${someValue.isSome()}`,
    `someValue.isNone(): ${someValue.isNone()}`,
    `someValue.unwrap(): ${someValue.unwrap()}`,
    `someValue.map(x => x * 2).unwrap(): ${someValue
      .map((x) => x * 2)
      .unwrap()}`,
    `someValue.toString(): ${someValue.toString()}`,
  ].join("\n");
  container.appendChild(createExample("Some(42)", someOutput, "success"));

  // Пример 2: None
  const noneValue = new None();
  const noneOutput = [
    `const noneValue = new None();`,
    `noneValue.isSome(): ${noneValue.isSome()}`,
    `noneValue.isNone(): ${noneValue.isNone()}`,
    `noneValue.unwrapOr(100): ${noneValue.unwrapOr(100)}`,
    `noneValue.map(x => x * 2).isNone(): ${noneValue
      .map((x) => x * 2)
      .isNone()}`,
    `noneValue.toString(): ${noneValue.toString()}`,
  ].join("\n");
  container.appendChild(createExample("None", noneOutput, "info"));

  // Пример 3: Практическое использование
  function divide(a: number, b: number): Option<number> {
    if (b === 0) {
      return new None();
    }
    return new Some(a / b);
  }

  const divideResult1 = divide(10, 2);
  const divideOutput1 = [
    `function divide(a: number, b: number): Option<number> {`,
    `  if (b === 0) return new None();`,
    `  return new Some(a / b);`,
    `}`,
    ``,
    `divide(10, 2):`,
    `  isSome(): ${divideResult1.isSome()}`,
    `  unwrap(): ${divideResult1.isSome() ? divideResult1.unwrap() : "N/A"}`,
  ].join("\n");
  container.appendChild(
    createExample(
      "Практический пример: деление (10 / 2)",
      divideOutput1,
      "success"
    )
  );

  const divideResult2 = divide(10, 0);
  const divideOutput2 = [
    `divide(10, 0):`,
    `  isSome(): ${divideResult2.isSome()}`,
    `  isNone(): ${divideResult2.isNone()}`,
    `  unwrapOr(-1): ${divideResult2.unwrapOr(-1)}`,
  ].join("\n");
  container.appendChild(
    createExample(
      "Практический пример: деление на ноль (10 / 0)",
      divideOutput2,
      "error"
    )
  );

  // Пример 4: andThen (flatMap)
  function parseNumber(str: string): Option<number> {
    const num = Number(str);
    if (isNaN(num)) {
      return new None();
    }
    return new Some(num);
  }

  const parseResult = parseNumber("42");
  const andThenResult = parseResult.andThen((n) =>
    n > 0 ? new Some(n * 2) : new None()
  );
  const andThenOutput = [
    `parseNumber("42").andThen(n => n > 0 ? new Some(n * 2) : new None()):`,
    `  isSome(): ${andThenResult.isSome()}`,
    `  unwrap(): ${andThenResult.isSome() ? andThenResult.unwrap() : "N/A"}`,
  ].join("\n");
  container.appendChild(
    createExample("andThen (flatMap)", andThenOutput, "success")
  );
}

// Примеры использования Result
function demonstrateResult() {
  const container = document.getElementById("result-examples");
  if (!container) return;

  // Пример 1: Ok
  const okValue = new Ok("Успех!");
  const okOutput = [
    `const okValue = new Ok("Успех!");`,
    `okValue.isOk(): ${okValue.isOk()}`,
    `okValue.isErr(): ${okValue.isErr()}`,
    `okValue.unwrap(): ${okValue.unwrap()}`,
    `okValue.map(s => s.toUpperCase()).unwrap(): ${okValue
      .map((s) => s.toUpperCase())
      .unwrap()}`,
    `okValue.toString(): ${okValue.toString()}`,
  ].join("\n");
  container.appendChild(createExample('Ok("Успех!")', okOutput, "success"));

  // Пример 2: Err
  const errValue = new Err("Ошибка!");
  const errOutput = [
    `const errValue = new Err("Ошибка!");`,
    `errValue.isOk(): ${errValue.isOk()}`,
    `errValue.isErr(): ${errValue.isErr()}`,
    `errValue.unwrapErr(): ${errValue.unwrapErr()}`,
    `errValue.unwrapOr("Значение по умолчанию"): ${errValue.unwrapOr(
      "Значение по умолчанию"
    )}`,
    `errValue.toString(): ${errValue.toString()}`,
  ].join("\n");
  container.appendChild(createExample('Err("Ошибка!")', errOutput, "error"));

  // Пример 3: Практическое использование - валидация
  function validateEmail(email: string): Result<string, string> {
    if (!email.includes("@")) {
      return new Err("Email должен содержать @");
    }
    if (!email.includes(".")) {
      return new Err("Email должен содержать точку");
    }
    return new Ok(email);
  }

  const validEmail = validateEmail("user@example.com");
  const validEmailOutput = [
    `function validateEmail(email: string): Result<string, string> {`,
    `  if (!email.includes("@")) return new Err("Email должен содержать @");`,
    `  if (!email.includes(".")) return new Err("Email должен содержать точку");`,
    `  return new Ok(email);`,
    `}`,
    ``,
    `validateEmail("user@example.com"):`,
    `  isOk(): ${validEmail.isOk()}`,
    `  unwrap(): ${validEmail.isOk() ? validEmail.unwrap() : "N/A"}`,
  ].join("\n");
  container.appendChild(
    createExample("Валидация email (успех)", validEmailOutput, "success")
  );

  const invalidEmail = validateEmail("invalid-email");
  const invalidEmailOutput = [
    `validateEmail("invalid-email"):`,
    `  isOk(): ${invalidEmail.isOk()}`,
    `  isErr(): ${invalidEmail.isErr()}`,
    `  unwrapErr(): ${invalidEmail.isErr() ? invalidEmail.unwrapErr() : "N/A"}`,
    `  unwrapOr("default@example.com"): ${invalidEmail.unwrapOr(
      "default@example.com"
    )}`,
  ].join("\n");
  container.appendChild(
    createExample("Валидация email (ошибка)", invalidEmailOutput, "error")
  );

  // Пример 4: mapErr
  const errorResult = new Err(404);
  const mappedError = errorResult.mapErr((code) => `HTTP Error ${code}`);
  const mapErrOutput = [
    `new Err(404).mapErr(code => \`HTTP Error \${code}\`):`,
    `  unwrapErr(): ${mappedError.unwrapErr()}`,
  ].join("\n");
  container.appendChild(createExample("mapErr", mapErrOutput, "error"));

  // Пример 5: andThen (flatMap)
  function parseNumber(str: string): Result<number, string> {
    const num = Number(str);
    if (isNaN(num)) {
      return new Err(`Не удалось распарсить число: ${str}`);
    }
    return new Ok(num);
  }

  function sqrt(num: number): Result<number, string> {
    if (num < 0) {
      return new Err("Нельзя извлечь корень из отрицательного числа");
    }
    return new Ok(Math.sqrt(num));
  }

  const chainResult = parseNumber("16").andThen(sqrt);
  const chainOutput = [
    `parseNumber("16").andThen(sqrt):`,
    `  isOk(): ${chainResult.isOk()}`,
    `  unwrap(): ${chainResult.isOk() ? chainResult.unwrap() : "N/A"}`,
  ].join("\n");
  container.appendChild(
    createExample("Цепочка операций (andThen)", chainOutput, "success")
  );

  const chainErrorResult = parseNumber("-16").andThen(sqrt);
  const chainErrorOutput = [
    `parseNumber("-16").andThen(sqrt):`,
    `  isErr(): ${chainErrorResult.isErr()}`,
    `  unwrapErr(): ${
      chainErrorResult.isErr() ? chainErrorResult.unwrapErr() : "N/A"
    }`,
  ].join("\n");
  container.appendChild(
    createExample("Цепочка операций с ошибкой", chainErrorOutput, "error")
  );
}

// Запуск демонстраций
document.addEventListener("DOMContentLoaded", () => {
  console.log("🚀 Playground загружен!");
  console.log("Тестирование @dayme/utils...");

  demonstrateOption();
  demonstrateResult();

  console.log("✅ Все примеры загружены!");
});
