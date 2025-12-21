import { describe, it, expect } from "bun:test";
import { Ok, Err, type Result } from "../src/package/result";

describe("Result", () => {
  describe("Ok", () => {
    it("должен создавать Ok с значением", () => {
      const ok = new Ok(42);
      expect(ok.value).toBe(42);
      expect(ok._tag).toBe("Ok");
    });

    it("isOk() должен возвращать true", () => {
      const ok = new Ok(42);
      expect(ok.isOk()).toBe(true);
    });

    it("isErr() должен возвращать false", () => {
      const ok = new Ok(42);
      expect(ok.isErr()).toBe(false);
    });

    it("unwrap() должен возвращать значение", () => {
      const ok = new Ok(42);
      expect(ok.unwrap()).toBe(42);
    });

    it("unwrapErr() должен выбрасывать ошибку", () => {
      const ok = new Ok(42);
      expect(() => ok.unwrapErr()).toThrow("Called unwrapErr() on Ok");
    });

    it("unwrapOr() должен возвращать значение, игнорируя defaultValue", () => {
      const ok = new Ok(42);
      expect(ok.unwrapOr(100)).toBe(42);
    });

    it("unwrapOrElse() должен возвращать значение, игнорируя функцию", () => {
      const ok = new Ok(42);
      expect(ok.unwrapOrElse(() => 100)).toBe(42);
    });

    it("map() должен применять функцию к значению", () => {
      const ok = new Ok(42);
      const mapped = ok.map((x) => x * 2);
      expect(mapped.isOk()).toBe(true);
      expect(mapped.unwrap()).toBe(84);
    });

    it("map() должен сохранять тип Ok", () => {
      const ok = new Ok("hello");
      const mapped = ok.map((s) => s.toUpperCase());
      expect(mapped.isOk()).toBe(true);
      expect(mapped.unwrap()).toBe("HELLO");
    });

    it("mapErr() не должен изменять Ok", () => {
      const ok = new Ok(42);
      const mapped = ok.mapErr((e) => `Error: ${e}`);
      expect(mapped.isOk()).toBe(true);
      expect(mapped.unwrap()).toBe(42);
    });

    it("andThen() должен применять функцию и возвращать Result", () => {
      const ok = new Ok(42);
      const result = ok.andThen((x) => new Ok(x * 2));
      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(84);
    });

    it("andThen() должен возвращать Err если функция возвращает Err", () => {
      const ok = new Ok(42);
      const result = ok.andThen(() => new Err("error"));
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe("error");
    });

    it("match() должен вызывать Ok обработчик", () => {
      const ok = new Ok(42);
      const result = ok.match({
        Ok: (value) => value * 2,
        Err: () => 0,
      });
      expect(result).toBe(84);
    });

    it("toString() должен возвращать правильное представление", () => {
      const ok = new Ok(42);
      expect(ok.toString()).toBe("Ok(42)");
    });

    it("toString() должен работать со строками", () => {
      const ok = new Ok("hello");
      expect(ok.toString()).toBe("Ok(hello)");
    });

    it("toJSON() должен возвращать правильный объект", () => {
      const ok = new Ok(42);
      expect(ok.toJSON()).toEqual({ ok: true, value: 42 });
    });
  });

  describe("Err", () => {
    it("должен создавать Err с ошибкой", () => {
      const err = new Err("error message");
      expect(err.error).toBe("error message");
      expect(err._tag).toBe("Err");
    });

    it("isOk() должен возвращать false", () => {
      const err = new Err("error");
      expect(err.isOk()).toBe(false);
    });

    it("isErr() должен возвращать true", () => {
      const err = new Err("error");
      expect(err.isErr()).toBe(true);
    });

    it("unwrap() должен выбрасывать ошибку", () => {
      const err = new Err("error");
      expect(() => err.unwrap()).toThrow("Called unwrap() on Err");
    });

    it("unwrapErr() должен возвращать ошибку", () => {
      const err = new Err("error message");
      expect(err.unwrapErr()).toBe("error message");
    });

    it("unwrapOr() должен возвращать defaultValue", () => {
      const err = new Err("error");
      expect(err.unwrapOr(100)).toBe(100);
    });

    it("unwrapOrElse() должен вызывать функцию с ошибкой", () => {
      const err = new Err("error");
      expect(err.unwrapOrElse((e) => e.length)).toBe(5);
    });

    it("map() должен возвращать Err", () => {
      const err = new Err("error");
      const mapped = err.map((x) => x * 2);
      expect(mapped.isErr()).toBe(true);
      expect(mapped.unwrapErr()).toBe("error");
    });

    it("mapErr() должен применять функцию к ошибке", () => {
      const err = new Err(404);
      const mapped = err.mapErr((code) => `HTTP Error ${code}`);
      expect(mapped.isErr()).toBe(true);
      expect(mapped.unwrapErr()).toBe("HTTP Error 404");
    });

    it("andThen() должен возвращать Err", () => {
      const err = new Err("error");
      const result = err.andThen((x) => new Ok(x * 2));
      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe("error");
    });

    it("match() должен вызывать Err обработчик", () => {
      const err = new Err("error");
      const result = err.match({
        Ok: (value) => value * 2,
        Err: (error) => error.length,
      });
      expect(result).toBe(5);
    });

    it("toString() должен возвращать правильное представление", () => {
      const err = new Err("error");
      expect(err.toString()).toBe("Err(error)");
    });

    it("toString() должен работать с числами", () => {
      const err = new Err(404);
      expect(err.toString()).toBe("Err(404)");
    });

    it("toJSON() должен возвращать правильный объект", () => {
      const err = new Err("error");
      expect(err.toJSON()).toEqual({ ok: false, error: "error" });
    });
  });

  describe("Практические примеры", () => {
    it("должен обрабатывать валидацию email", () => {
      function validateEmail(email: string): Result<string, string> {
        if (!email.includes("@")) {
          return new Err("Email должен содержать @");
        }
        if (!email.includes(".")) {
          return new Err("Email должен содержать точку");
        }
        return new Ok(email);
      }

      const result1 = validateEmail("user@example.com");
      expect(result1.isOk()).toBe(true);
      expect(result1.unwrap()).toBe("user@example.com");

      const result2 = validateEmail("invalid-email");
      expect(result2.isErr()).toBe(true);
      expect(result2.unwrapErr()).toBe("Email должен содержать @");
    });

    it("должен обрабатывать парсинг чисел", () => {
      function parseNumber(str: string): Result<number, string> {
        const num = Number(str);
        if (isNaN(num)) {
          return new Err(`Не удалось распарсить число: ${str}`);
        }
        return new Ok(num);
      }

      const result1 = parseNumber("42");
      expect(result1.isOk()).toBe(true);
      expect(result1.unwrap()).toBe(42);

      const result2 = parseNumber("not a number");
      expect(result2.isErr()).toBe(true);
      expect(result2.unwrapErr()).toContain("Не удалось распарсить число");
    });

    it("должен работать с цепочкой операций", () => {
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

      const result = parseNumber("16")
        .andThen(sqrt)
        .map((n) => n * 2);

      expect(result.isOk()).toBe(true);
      expect(result.unwrap()).toBe(8);
    });

    it("должен работать с цепочкой, которая возвращает Err", () => {
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

      const result = parseNumber("-16")
        .andThen(sqrt)
        .map((n) => n * 2);

      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe(
        "Нельзя извлечь корень из отрицательного числа"
      );
    });

    it("должен работать с mapErr для преобразования ошибок", () => {
      function parseNumber(str: string): Result<number, number> {
        const num = Number(str);
        if (isNaN(num)) {
          return new Err(400);
        }
        return new Ok(num);
      }

      const result = parseNumber("not a number").mapErr(
        (code) => `HTTP Error ${code}`
      );

      expect(result.isErr()).toBe(true);
      expect(result.unwrapErr()).toBe("HTTP Error 400");
    });
  });

  describe("Статические методы", () => {
    it("Ok.of() должен создавать Ok", () => {
      const ok = Ok.of(42);
      expect(ok.isOk()).toBe(true);
      expect(ok.unwrap()).toBe(42);
    });

    it("Err.of() должен создавать Err", () => {
      const err = Err.of("error");
      expect(err.isErr()).toBe(true);
      expect(err.unwrapErr()).toBe("error");
    });
  });

  describe("Новые методы", () => {
    describe("inspect", () => {
      it("Ok.inspect() должен вызывать функцию и возвращать себя", () => {
        const ok = new Ok(42);
        let called = false;
        const result = ok.inspect((value) => {
          expect(value).toBe(42);
          called = true;
        });
        expect(called).toBe(true);
        expect(result).toBe(ok);
      });

      it("Err.inspect() не должен вызывать функцию", () => {
        const err = new Err("error");
        let called = false;
        const result = err.inspect(() => {
          called = true;
        });
        expect(called).toBe(false);
        expect(result).toBe(err);
      });
    });

    describe("inspectErr", () => {
      it("Ok.inspectErr() не должен вызывать функцию", () => {
        const ok = new Ok(42);
        let called = false;
        const result = ok.inspectErr(() => {
          called = true;
        });
        expect(called).toBe(false);
        expect(result).toBe(ok);
      });

      it("Err.inspectErr() должен вызывать функцию и возвращать себя", () => {
        const err = new Err("error");
        let called = false;
        const result = err.inspectErr((error) => {
          expect(error).toBe("error");
          called = true;
        });
        expect(called).toBe(true);
        expect(result).toBe(err);
      });
    });

    describe("expect", () => {
      it("Ok.expect() должен возвращать значение", () => {
        const ok = new Ok(42);
        expect(ok.expect("should not fail")).toBe(42);
      });

      it("Err.expect() должен выбрасывать ошибку с сообщением", () => {
        const err = new Err("error");
        expect(() => err.expect("custom message")).toThrow("custom message");
      });
    });

    describe("expectErr", () => {
      it("Ok.expectErr() должен выбрасывать ошибку с сообщением", () => {
        const ok = new Ok(42);
        expect(() => ok.expectErr("custom message")).toThrow("custom message");
      });

      it("Err.expectErr() должен возвращать ошибку", () => {
        const err = new Err("error");
        expect(err.expectErr("should not fail")).toBe("error");
      });
    });

    describe("or", () => {
      it("Ok.or() должен возвращать себя", () => {
        const ok = new Ok(42);
        const other = new Ok(100);
        expect(ok.or(other)).toBe(ok);
      });

      it("Err.or() должен возвращать другой Result", () => {
        const err = new Err("error");
        const other = new Ok(100);
        const result = err.or(other);
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe(100);
      });
    });

    describe("orElse", () => {
      it("Ok.orElse() должен возвращать себя", () => {
        const ok = new Ok(42);
        expect(ok.orElse(() => new Ok(100))).toBe(ok);
      });

      it("Err.orElse() должен вызывать функцию", () => {
        const err = new Err("error");
        const result = err.orElse(() => new Ok(100));
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toBe(100);
      });
    });

    describe("ok и err", () => {
      it("Ok.ok() должен возвращать Some", () => {
        const ok = new Ok(42);
        const option = ok.ok();
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toBe(42);
      });

      it("Ok.err() должен возвращать None", () => {
        const ok = new Ok(42);
        const option = ok.err();
        expect(option.isNone()).toBe(true);
      });

      it("Err.ok() должен возвращать None", () => {
        const err = new Err("error");
        const option = err.ok();
        expect(option.isNone()).toBe(true);
      });

      it("Err.err() должен возвращать Some", () => {
        const err = new Err("error");
        const option = err.err();
        expect(option.isSome()).toBe(true);
        expect(option.unwrap()).toBe("error");
      });
    });

    describe("collect", () => {
      it("Ok.collect() должен собирать все Ok в массив", () => {
        const results = [new Ok(1), new Ok(2), new Ok(3)];
        const result = Ok.collect(results);
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toEqual([1, 2, 3]);
      });

      it("Ok.collect() должен возвращать Err если есть хотя бы один Err", () => {
        const results = [new Ok(1), new Err("error"), new Ok(3)];
        const result = Ok.collect(results);
        expect(result.isErr()).toBe(true);
        expect(result.unwrapErr()).toBe("error");
      });

      it("Ok.collect() должен возвращать Ok([]) для пустого массива", () => {
        const result = Ok.collect([]);
        expect(result.isOk()).toBe(true);
        expect(result.unwrap()).toEqual([]);
      });
    });

    describe("partition", () => {
      it("Ok.partition() должен разделять Ok и Err", () => {
        const results = [
          new Ok(1),
          new Err("error1"),
          new Ok(3),
          new Err("error2"),
        ];
        const [oks, errs] = Ok.partition(results);
        expect(oks.length).toBe(2);
        expect(errs.length).toBe(2);
        expect(oks[0].unwrap()).toBe(1);
        expect(oks[1].unwrap()).toBe(3);
        expect(errs[0].unwrapErr()).toBe("error1");
        expect(errs[1].unwrapErr()).toBe("error2");
      });

      it("Ok.partition() должен возвращать пустые массивы для пустого массива", () => {
        const [oks, errs] = Ok.partition([]);
        expect(oks.length).toBe(0);
        expect(errs.length).toBe(0);
      });
    });
  });
});
