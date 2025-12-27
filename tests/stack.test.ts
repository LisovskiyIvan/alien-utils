import { describe, it, expect } from "bun:test";
import { Stack } from "../src/package/stack";
import { Some, None } from "../src/package/option";

describe("Stack", () => {
  describe("push и pop", () => {
    it("должен добавлять и извлекать элементы в порядке LIFO", () => {
      const stack = new Stack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);

      expect(stack.pop()).toEqual(new Some(3));
      expect(stack.pop()).toEqual(new Some(2));
      expect(stack.pop()).toEqual(new Some(1));
      expect(stack.pop()).toEqual(None.instance());
    });

    it("pop() должен возвращать None для пустого стека", () => {
      const stack = new Stack<number>();
      expect(stack.pop()).toEqual(None.instance());
    });
  });

  describe("peek", () => {
    it("должен возвращать верхний элемент без его удаления", () => {
      const stack = new Stack<number>();
      stack.push(1);
      stack.push(2);

      expect(stack.peek()).toEqual(new Some(2));
      expect(stack.peek()).toEqual(new Some(2));
      expect(stack.pop()).toEqual(new Some(2));
      expect(stack.peek()).toEqual(new Some(1));
    });

    it("peek() должен возвращать None для пустого стека", () => {
      const stack = new Stack<number>();
      expect(stack.peek()).toEqual(None.instance());
    });
  });

  describe("size и isEmpty", () => {
    it("должен правильно отслеживать размер", () => {
      const stack = new Stack<number>();
      expect(stack.size).toBe(0);
      expect(stack.isEmpty()).toBe(true);

      stack.push(1);
      expect(stack.size).toBe(1);
      expect(stack.isEmpty()).toBe(false);

      stack.push(2);
      stack.push(3);
      expect(stack.size).toBe(3);
      expect(stack.isEmpty()).toBe(false);

      stack.pop();
      expect(stack.size).toBe(2);

      stack.clear();
      expect(stack.size).toBe(0);
      expect(stack.isEmpty()).toBe(true);
    });
  });

  describe("clear", () => {
    it("должен очищать стек", () => {
      const stack = new Stack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);

      stack.clear();

      expect(stack.size).toBe(0);
      expect(stack.isEmpty()).toBe(true);
      expect(stack.pop()).toEqual(None.instance());
      expect(stack.peek()).toEqual(None.instance());
    });
  });

  describe("Iterable", () => {
    it("должен поддерживать итерацию в порядке LIFO", () => {
      const stack = new Stack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);

      const values = Array.from(stack);
      expect(values).toEqual([3, 2, 1]);
    });

    it("должен быть пустым для пустого стека", () => {
      const stack = new Stack<number>();
      const values = Array.from(stack);
      expect(values).toEqual([]);
    });

    it("должен поддерживать for..of", () => {
      const stack = new Stack<number>();
      stack.push(1);
      stack.push(2);
      stack.push(3);

      const values: number[] = [];
      for (const value of stack) {
        values.push(value);
      }
      expect(values).toEqual([3, 2, 1]);
    });
  });

  describe("from", () => {
    it("должен создавать стек из массива", () => {
      const stack = Stack.from([1, 2, 3]);
      expect(stack.size).toBe(3);
      expect(stack.pop()).toEqual(new Some(3));
      expect(stack.pop()).toEqual(new Some(2));
      expect(stack.pop()).toEqual(new Some(1));
    });

    it("должен создавать стек из множества", () => {
      const stack = Stack.from(new Set([1, 2, 3]));
      expect(stack.size).toBe(3);
    });

    it("должен создавать пустой стек из пустого итератора", () => {
      const stack = Stack.from([]);
      expect(stack.size).toBe(0);
      expect(stack.isEmpty()).toBe(true);
    });
  });

  describe("работа с типами", () => {
    it("должен работать со строками", () => {
      const stack = new Stack<string>();
      stack.push("a");
      stack.push("b");
      stack.push("c");

      expect(stack.pop()).toEqual(new Some("c"));
      expect(stack.peek()).toEqual(new Some("b"));
    });

    it("должен работать с объектами", () => {
      interface Person {
        name: string;
        age: number;
      }

      const stack = new Stack<Person>();
      stack.push({ name: "Alice", age: 30 });
      stack.push({ name: "Bob", age: 25 });

      const result = stack.pop();
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual({ name: "Bob", age: 25 });
    });

    it("должен работать с null и undefined как значениями", () => {
      const stack = new Stack<number | null | undefined>();
      stack.push(1);
      stack.push(null);
      stack.push(undefined);

      expect(stack.pop()).toEqual(new Some(undefined));
      expect(stack.pop()).toEqual(new Some(null));
      expect(stack.pop()).toEqual(new Some(1));
    });
  });

  describe("сложные сценарии", () => {
    it("должен обрабатывать большое количество операций", () => {
      const stack = new Stack<number>();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        stack.push(i);
      }

      expect(stack.size).toBe(count);

      for (let i = count - 1; i >= 0; i--) {
        expect(stack.pop()).toEqual(new Some(i));
      }

      expect(stack.isEmpty()).toBe(true);
    });

    it("должен поддерживать цепочки push", () => {
      const stack = new Stack<number>();
      stack.push(1).push(2).push(3);
      expect(stack.size).toBe(3);

      expect(stack.pop()).toEqual(new Some(3));
      expect(stack.pop()).toEqual(new Some(2));
      expect(stack.pop()).toEqual(new Some(1));
    });
  });
});
