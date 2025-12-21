import { describe, it, expect } from "bun:test";
import { Some, None, type Option } from "../src/package/option";

describe("Option", () => {
  describe("Some", () => {
    it("должен создавать Some с значением", () => {
      const some = new Some(42);
      expect(some.value).toBe(42);
      expect(some._tag).toBe("Some");
    });

    it("isSome() должен возвращать true", () => {
      const some = new Some(42);
      expect(some.isSome()).toBe(true);
    });

    it("isNone() должен возвращать false", () => {
      const some = new Some(42);
      expect(some.isNone()).toBe(false);
    });

    it("unwrap() должен возвращать значение", () => {
      const some = new Some(42);
      expect(some.unwrap()).toBe(42);
    });

    it("unwrapOr() должен возвращать значение, игнорируя defaultValue", () => {
      const some = new Some(42);
      expect(some.unwrapOr(100)).toBe(42);
    });

    it("unwrapOrElse() должен возвращать значение, игнорируя функцию", () => {
      const some = new Some(42);
      expect(some.unwrapOrElse(() => 100)).toBe(42);
    });

    it("map() должен применять функцию к значению", () => {
      const some = new Some(42);
      const mapped = some.map((x) => x * 2);
      expect(mapped.isSome()).toBe(true);
      expect(mapped.unwrap()).toBe(84);
    });

    it("map() должен сохранять тип Some", () => {
      const some = new Some("hello");
      const mapped = some.map((s) => s.toUpperCase());
      expect(mapped.isSome()).toBe(true);
      expect(mapped.unwrap()).toBe("HELLO");
    });

    it("andThen() должен применять функцию и возвращать Option", () => {
      const some = new Some(42);
      const result = some.andThen((x) => new Some(x * 2));
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe(84);
    });

    it("andThen() должен возвращать None если функция возвращает None", () => {
      const some = new Some(42);
      const result = some.andThen(() => new None());
      expect(result.isNone()).toBe(true);
    });

    it("match() должен вызывать Some обработчик", () => {
      const some = new Some(42);
      const result = some.match({
        Some: (value) => value * 2,
        None: 0,
      });
      expect(result).toBe(84);
    });

    it("toString() должен возвращать правильное представление", () => {
      const some = new Some(42);
      expect(some.toString()).toBe("Some(42)");
    });

    it("toString() должен работать со строками", () => {
      const some = new Some("hello");
      expect(some.toString()).toBe("Some(hello)");
    });

    it("toJSON() должен возвращать правильный объект", () => {
      const some = new Some(42);
      expect(some.toJSON()).toEqual({ some: true, value: 42 });
    });
  });

  describe("None", () => {
    it("должен создавать None", () => {
      const none = new None();
      expect(none._tag).toBe("None");
    });

    it("isSome() должен возвращать false", () => {
      const none = new None();
      expect(none.isSome()).toBe(false);
    });

    it("isNone() должен возвращать true", () => {
      const none = new None();
      expect(none.isNone()).toBe(true);
    });

    it("unwrap() должен выбрасывать ошибку", () => {
      const none = new None();
      expect(() => none.unwrap()).toThrow("Called unwrap() on None");
    });

    it("unwrapOr() должен возвращать defaultValue", () => {
      const none = new None();
      expect(none.unwrapOr(100)).toBe(100);
    });

    it("unwrapOrElse() должен вызывать функцию", () => {
      const none = new None();
      expect(none.unwrapOrElse(() => 100)).toBe(100);
    });

    it("map() должен возвращать None", () => {
      const none = new None();
      const mapped = none.map((x) => x * 2);
      expect(mapped.isNone()).toBe(true);
    });

    it("andThen() должен возвращать None", () => {
      const none = new None();
      const result = none.andThen((x) => new Some(x * 2));
      expect(result.isNone()).toBe(true);
    });

    it("match() должен вызывать None обработчик", () => {
      const none = new None();
      const result = none.match({
        Some: (value) => value * 2,
        None: 0,
      });
      expect(result).toBe(0);
    });

    it("toString() должен возвращать 'None'", () => {
      const none = new None();
      expect(none.toString()).toBe("None");
    });

    it("toJSON() должен возвращать правильный объект", () => {
      const none = new None();
      expect(none.toJSON()).toEqual({ none: true });
    });
  });

  describe("Практические примеры", () => {
    it("должен обрабатывать деление на ноль", () => {
      function divide(a: number, b: number): Option<number> {
        if (b === 0) {
          return new None();
        }
        return new Some(a / b);
      }

      const result1 = divide(10, 2);
      expect(result1.isSome()).toBe(true);
      expect(result1.unwrap()).toBe(5);

      const result2 = divide(10, 0);
      expect(result2.isNone()).toBe(true);
      expect(result2.unwrapOr(-1)).toBe(-1);
    });

    it("должен обрабатывать парсинг чисел", () => {
      function parseNumber(str: string): Option<number> {
        const num = Number(str);
        if (isNaN(num)) {
          return new None();
        }
        return new Some(num);
      }

      const result1 = parseNumber("42");
      expect(result1.isSome()).toBe(true);
      expect(result1.unwrap()).toBe(42);

      const result2 = parseNumber("not a number");
      expect(result2.isNone()).toBe(true);
    });

    it("должен работать с цепочкой операций", () => {
      function parseNumber(str: string): Option<number> {
        const num = Number(str);
        if (isNaN(num)) {
          return new None();
        }
        return new Some(num);
      }

      const result = parseNumber("16")
        .andThen((n) => (n > 0 ? new Some(n * 2) : new None()))
        .map((n) => n + 10);

      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe(42);
    });

    it("должен работать с цепочкой, которая возвращает None", () => {
      function parseNumber(str: string): Option<number> {
        const num = Number(str);
        if (isNaN(num)) {
          return new None();
        }
        return new Some(num);
      }

      const result = parseNumber("not a number")
        .andThen((n) => new Some(n * 2))
        .map((n) => n + 10);

      expect(result.isNone()).toBe(true);
    });
  });
});
