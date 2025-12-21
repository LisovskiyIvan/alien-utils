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
      const result = some.andThen(() => None.instance());
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
      const none = None.instance();
      expect(none._tag).toBe("None");
    });

    it("должен быть синглтоном", () => {
      const none1 = None.instance();
      const none2 = None.instance();
      expect(none1).toBe(none2);
    });

    it("isSome() должен возвращать false", () => {
      const none = None.instance();
      expect(none.isSome()).toBe(false);
    });

    it("isNone() должен возвращать true", () => {
      const none = None.instance();
      expect(none.isNone()).toBe(true);
    });

    it("unwrap() должен выбрасывать ошибку", () => {
      const none = None.instance();
      expect(() => none.unwrap()).toThrow("Called unwrap() on None");
    });

    it("unwrapOr() должен возвращать defaultValue", () => {
      const none = None.instance();
      expect(none.unwrapOr(100)).toBe(100);
    });

    it("unwrapOrElse() должен вызывать функцию", () => {
      const none = None.instance();
      expect(none.unwrapOrElse(() => 100)).toBe(100);
    });

    it("map() должен возвращать None", () => {
      const none = None.instance();
      const mapped = none.map((x) => x * 2);
      expect(mapped.isNone()).toBe(true);
    });

    it("andThen() должен возвращать None", () => {
      const none = None.instance();
      const result = none.andThen((x) => new Some(x * 2));
      expect(result.isNone()).toBe(true);
    });

    it("match() должен вызывать None обработчик", () => {
      const none = None.instance();
      const result = none.match({
        Some: (value) => value * 2,
        None: 0,
      });
      expect(result).toBe(0);
    });

    it("toString() должен возвращать 'None'", () => {
      const none = None.instance();
      expect(none.toString()).toBe("None");
    });

    it("toJSON() должен возвращать правильный объект", () => {
      const none = None.instance();
      expect(none.toJSON()).toEqual({ none: true });
    });
  });

  describe("Практические примеры", () => {
    it("должен обрабатывать деление на ноль", () => {
      function divide(a: number, b: number): Option<number> {
        if (b === 0) {
          return None.instance();
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
          return None.instance();
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
          return None.instance();
        }
        return new Some(num);
      }

      const result = parseNumber("16")
        .andThen((n) => (n > 0 ? new Some(n * 2) : None.instance()))
        .map((n) => n + 10);

      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toBe(42);
    });

    it("должен работать с цепочкой, которая возвращает None", () => {
      function parseNumber(str: string): Option<number> {
        const num = Number(str);
        if (isNaN(num)) {
          return None.instance();
        }
        return new Some(num);
      }

      const result = parseNumber("not a number")
        .andThen((n) => new Some(n * 2))
        .map((n) => n + 10);

      expect(result.isNone()).toBe(true);
    });
  });

  describe("Статические методы", () => {
    it("Some.of() должен создавать Some", () => {
      const some = Some.of(42);
      expect(some.isSome()).toBe(true);
      expect(some.unwrap()).toBe(42);
    });

    it("None.of() должен возвращать синглтон", () => {
      const none1 = None.of();
      const none2 = None.of();
      expect(none1).toBe(none2);
      expect(none1.isNone()).toBe(true);
    });
  });

  describe("Новые методы", () => {
    describe("or", () => {
      it("Some.or() должен возвращать себя", () => {
        const some = new Some(42);
        const other = new Some(100);
        expect(some.or(other)).toBe(some);
      });

      it("None.or() должен возвращать другой Option", () => {
        const none = None.instance();
        const other = new Some(100);
        expect(none.or(other)).toBe(other);
      });
    });

    describe("orElse", () => {
      it("Some.orElse() должен возвращать себя", () => {
        const some = new Some(42);
        expect(some.orElse(() => new Some(100))).toBe(some);
      });

      it("None.orElse() должен вызывать функцию", () => {
        const none = None.instance();
        const result = none.orElse(() => new Some(100));
        expect(result.isSome()).toBe(true);
        expect(result.unwrap()).toBe(100);
      });
    });

    describe("filter", () => {
      it("Some.filter() должен возвращать Some если предикат true", () => {
        const some = new Some(42);
        const filtered = some.filter((x) => x > 0);
        expect(filtered.isSome()).toBe(true);
        expect(filtered.unwrap()).toBe(42);
      });

      it("Some.filter() должен возвращать None если предикат false", () => {
        const some = new Some(42);
        const filtered = some.filter((x) => x < 0);
        expect(filtered.isNone()).toBe(true);
      });

      it("None.filter() должен возвращать None", () => {
        const none = None.instance();
        const filtered = none.filter(() => true);
        expect(filtered.isNone()).toBe(true);
      });
    });

    describe("collect", () => {
      it("Some.collect() должен собирать все Some в массив", () => {
        const options = [new Some(1), new Some(2), new Some(3)];
        const result = Some.collect(options);
        expect(result.isSome()).toBe(true);
        expect(result.unwrap()).toEqual([1, 2, 3]);
      });

      it("Some.collect() должен возвращать None если есть хотя бы один None", () => {
        const options = [new Some(1), None.instance(), new Some(3)];
        const result = Some.collect(options);
        expect(result.isNone()).toBe(true);
      });

      it("Some.collect() должен возвращать Some([]) для пустого массива", () => {
        const result = Some.collect([]);
        expect(result.isSome()).toBe(true);
        expect(result.unwrap()).toEqual([]);
      });
    });

    describe("partition", () => {
      it("Some.partition() должен разделять Some и None", () => {
        const options = [
          new Some(1),
          None.instance(),
          new Some(3),
          None.instance(),
        ];
        const [somes, nones] = Some.partition(options);
        expect(somes.length).toBe(2);
        expect(nones.length).toBe(2);
        expect(somes[0].unwrap()).toBe(1);
        expect(somes[1].unwrap()).toBe(3);
      });

      it("Some.partition() должен возвращать пустые массивы для пустого массива", () => {
        const [somes, nones] = Some.partition([]);
        expect(somes.length).toBe(0);
        expect(nones.length).toBe(0);
      });
    });
  });
});
