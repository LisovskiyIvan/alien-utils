import { describe, it, expect } from "bun:test";
import { Bimap } from "../src/package/bimap";

describe("Bimap", () => {
  describe("constructor", () => {
    it("должен создавать пустой Bimap", () => {
      const bimap = new Bimap<string, number>();
      expect(bimap.size).toBe(0);
    });
  });

  describe("set", () => {
    it("должен добавлять пару ключ-значение", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      expect(bimap.size).toBe(1);
      expect(bimap.get("a")).toBe(1);
    });

    it("должен обновлять существующий ключ", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      bimap.set("a", 2);
      expect(bimap.size).toBe(1);
      expect(bimap.get("a")).toBe(2);
      expect(bimap.getReverse(1)).toBeUndefined();
    });

    it("должен удалять старое значение при обновлении", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      bimap.set("a", 2);
      expect(bimap.hasValue(1)).toBe(false);
      expect(bimap.hasValue(2)).toBe(true);
    });

    it("должен удалять старый ключ при использовании значения", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      bimap.set("b", 1);
      expect(bimap.has("a")).toBe(false);
      expect(bimap.has("b")).toBe(true);
    });

    it("должен поддерживать цепочку вызовов", () => {
      const bimap = new Bimap<string, number>();
      const result = bimap.set("a", 1).set("b", 2).set("c", 3);
      expect(result).toBe(bimap);
      expect(bimap.size).toBe(3);
    });
  });

  describe("get", () => {
    it("должен возвращать значение по ключу", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      expect(bimap.get("a")).toBe(1);
    });

    it("должен возвращать undefined для несуществующего ключа", () => {
      const bimap = new Bimap<string, number>();
      expect(bimap.get("a")).toBeUndefined();
    });
  });

  describe("getReverse", () => {
    it("должен возвращать ключ по значению", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      expect(bimap.getReverse(1)).toBe("a");
    });

    it("должен возвращать undefined для несуществующего значения", () => {
      const bimap = new Bimap<string, number>();
      expect(bimap.getReverse(1)).toBeUndefined();
    });
  });

  describe("has", () => {
    it("должен возвращать true для существующего ключа", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      expect(bimap.has("a")).toBe(true);
    });

    it("должен возвращать false для несуществующего ключа", () => {
      const bimap = new Bimap<string, number>();
      expect(bimap.has("a")).toBe(false);
    });
  });

  describe("hasValue", () => {
    it("должен возвращать true для существующего значения", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      expect(bimap.hasValue(1)).toBe(true);
    });

    it("должен возвращать false для несуществующего значения", () => {
      const bimap = new Bimap<string, number>();
      expect(bimap.hasValue(1)).toBe(false);
    });
  });

  describe("delete", () => {
    it("должен удалять пару по ключу", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      const result = bimap.delete("a");
      expect(result).toBe(true);
      expect(bimap.size).toBe(0);
      expect(bimap.has("a")).toBe(false);
      expect(bimap.hasValue(1)).toBe(false);
    });

    it("должен возвращать false при удалении несуществующего ключа", () => {
      const bimap = new Bimap<string, number>();
      const result = bimap.delete("a");
      expect(result).toBe(false);
    });
  });

  describe("deleteValue", () => {
    it("должен удалять пару по значению", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      const result = bimap.deleteValue(1);
      expect(result).toBe(true);
      expect(bimap.size).toBe(0);
      expect(bimap.has("a")).toBe(false);
      expect(bimap.hasValue(1)).toBe(false);
    });

    it("должен возвращать false при удалении несуществующего значения", () => {
      const bimap = new Bimap<string, number>();
      const result = bimap.deleteValue(1);
      expect(result).toBe(false);
    });
  });

  describe("clear", () => {
    it("должен очищать Bimap", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      bimap.set("b", 2);
      bimap.clear();
      expect(bimap.size).toBe(0);
      expect(bimap.has("a")).toBe(false);
      expect(bimap.hasValue(1)).toBe(false);
    });
  });

  describe("size", () => {
    it("должен возвращать правильный размер", () => {
      const bimap = new Bimap<string, number>();
      expect(bimap.size).toBe(0);
      bimap.set("a", 1);
      expect(bimap.size).toBe(1);
      bimap.set("b", 2);
      expect(bimap.size).toBe(2);
      bimap.delete("a");
      expect(bimap.size).toBe(1);
    });
  });

  describe("keys", () => {
    it("должен возвращать массив ключей", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      bimap.set("b", 2);
      bimap.set("c", 3);
      const keys = bimap.keys();
      expect(keys).toEqual(expect.arrayContaining(["a", "b", "c"]));
      expect(keys.length).toBe(3);
    });

    it("должен возвращать пустой массив для пустого Bimap", () => {
      const bimap = new Bimap<string, number>();
      expect(bimap.keys()).toEqual([]);
    });
  });

  describe("values", () => {
    it("должен возвращать массив значений", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      bimap.set("b", 2);
      bimap.set("c", 3);
      const values = bimap.values();
      expect(values).toEqual(expect.arrayContaining([1, 2, 3]));
      expect(values.length).toBe(3);
    });

    it("должен возвращать пустой массив для пустого Bimap", () => {
      const bimap = new Bimap<string, number>();
      expect(bimap.values()).toEqual([]);
    });
  });

  describe("entries", () => {
    it("должен возвращать массив пар [key, value]", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      bimap.set("b", 2);
      const entries = bimap.entries();
      expect(entries).toEqual(expect.arrayContaining([
        ["a", 1],
        ["b", 2],
      ]));
      expect(entries.length).toBe(2);
    });

    it("должен возвращать пустой массив для пустого Bimap", () => {
      const bimap = new Bimap<string, number>();
      expect(bimap.entries()).toEqual([]);
    });
  });

  describe("reverseEntries", () => {
    it("должен возвращать массив пар [value, key]", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      bimap.set("b", 2);
      const entries = bimap.reverseEntries();
      expect(entries).toEqual(expect.arrayContaining([
        [1, "a"],
        [2, "b"],
      ]));
      expect(entries.length).toBe(2);
    });

    it("должен возвращать пустой массив для пустого Bimap", () => {
      const bimap = new Bimap<string, number>();
      expect(bimap.reverseEntries()).toEqual([]);
    });
  });

  describe("forEach", () => {
    it("должен выполнять callback для каждой пары", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      bimap.set("b", 2);
      const pairs: [number, string][] = [];
      bimap.forEach((value, key) => {
        pairs.push([value, key]);
      });
      expect(pairs).toEqual(expect.arrayContaining([
        [1, "a"],
        [2, "b"],
      ]));
    });
  });

  describe("forEachReverse", () => {
    it("должен выполнять callback для каждой пары в обратном порядке", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      bimap.set("b", 2);
      const pairs: [string, number][] = [];
      bimap.forEachReverse((key, value) => {
        pairs.push([key, value]);
      });
      expect(pairs).toEqual(expect.arrayContaining([
        ["a", 1],
        ["b", 2],
      ]));
    });
  });

  describe("clone", () => {
    it("должен создавать копию Bimap", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      bimap.set("b", 2);
      const cloned = bimap.clone();
      expect(cloned.size).toBe(2);
      expect(cloned.get("a")).toBe(1);
      expect(cloned.get("b")).toBe(2);
      expect(cloned).not.toBe(bimap);
    });

    it("изменения в копии не должны влиять на оригинал", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      const cloned = bimap.clone();
      cloned.set("b", 2);
      expect(bimap.size).toBe(1);
      expect(cloned.size).toBe(2);
    });
  });

  describe("toString", () => {
    it("должен возвращать строковое представление", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      bimap.set("b", 2);
      const str = bimap.toString();
      expect(str).toContain("a => 1");
      expect(str).toContain("b => 2");
    });

    it("должен возвращать пустое представление для пустого Bimap", () => {
      const bimap = new Bimap<string, number>();
      const str = bimap.toString();
      expect(str).toBe("Bimap {  }");
    });
  });

  describe("toJSON", () => {
    it("должен возвращать JSON представление", () => {
      const bimap = new Bimap<string, number>();
      bimap.set("a", 1);
      bimap.set("b", 2);
      const json = bimap.toJSON();
      expect(json.forward).toEqual(expect.arrayContaining([
        ["a", 1],
        ["b", 2],
      ]));
      expect(json.reverse).toEqual(expect.arrayContaining([
        [1, "a"],
        [2, "b"],
      ]));
    });
  });

  describe("static from", () => {
    it("должен создавать Bimap из итератора", () => {
      const bimap = Bimap.from([
        ["a", 1],
        ["b", 2],
        ["c", 3],
      ]);
      expect(bimap.size).toBe(3);
      expect(bimap.get("a")).toBe(1);
      expect(bimap.get("b")).toBe(2);
      expect(bimap.get("c")).toBe(3);
      expect(bimap.getReverse(1)).toBe("a");
    });

    it("должен обрабатывать дубликаты значений", () => {
      const bimap = Bimap.from([
        ["a", 1],
        ["b", 1],
      ]);
      expect(bimap.size).toBe(1);
      expect(bimap.get("b")).toBe(1);
      expect(bimap.has("a")).toBe(false);
    });
  });

  describe("static of", () => {
    it("должен создавать Bimap из пар", () => {
      const bimap = Bimap.of(["a", 1], ["b", 2], ["c", 3]);
      expect(bimap.size).toBe(3);
      expect(bimap.get("a")).toBe(1);
      expect(bimap.get("b")).toBe(2);
      expect(bimap.get("c")).toBe(3);
    });

    it("должен работать с одной парой", () => {
      const bimap = Bimap.of(["a", 1]);
      expect(bimap.size).toBe(1);
      expect(bimap.get("a")).toBe(1);
    });
  });

  describe("Практические примеры", () => {
    it("должен работать как кэш для двух направлений", () => {
      type CurrencyCode = "USD" | "EUR" | "GBP";
      type CurrencyName = "US Dollar" | "Euro" | "British Pound";

      const currencyMap = new Bimap<CurrencyCode, CurrencyName>();
      currencyMap.set("USD", "US Dollar");
      currencyMap.set("EUR", "Euro");
      currencyMap.set("GBP", "British Pound");

      expect(currencyMap.get("USD")).toBe("US Dollar");
      expect(currencyMap.getReverse("Euro")).toBe("EUR");
    });

    it("должен работать для ID и имен", () => {
      const users = new Bimap<number, string>();
      users.set(1, "Alice");
      users.set(2, "Bob");
      users.set(3, "Charlie");

      expect(users.get(1)).toBe("Alice");
      expect(users.getReverse("Bob")).toBe(2);
    });

    it("должен работать для отображения enum", () => {
      enum Status {
        Active = 1,
        Inactive = 2,
        Pending = 3,
      }

      const statusMap = new Bimap<Status, string>();
      statusMap.set(Status.Active, "active");
      statusMap.set(Status.Inactive, "inactive");
      statusMap.set(Status.Pending, "pending");

      expect(statusMap.get(Status.Active)).toBe("active");
      expect(statusMap.getReverse("pending")).toBe(Status.Pending);
    });

    it("должен поддерживать двусторонний поиск в конфигурации", () => {
      const config = new Bimap<string, number>();
      config.set("timeout", 5000);
      config.set("retries", 3);
      config.set("port", 8080);

      expect(config.get("timeout")).toBe(5000);
      expect(config.getReverse(8080)).toBe("port");
    });
  });
});
