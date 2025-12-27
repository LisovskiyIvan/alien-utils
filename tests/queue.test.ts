import { describe, it, expect } from "bun:test";
import { Queue } from "../src/package/queue";
import { Some, None } from "../src/package/option";

describe("Queue", () => {
  describe("enqueue и dequeue", () => {
    it("должен добавлять и извлекать элементы в порядке FIFO", () => {
      const queue = new Queue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);

      expect(queue.dequeue()).toEqual(new Some(1));
      expect(queue.dequeue()).toEqual(new Some(2));
      expect(queue.dequeue()).toEqual(new Some(3));
      expect(queue.dequeue()).toEqual(None.instance());
    });

    it("dequeue() должен возвращать None для пустой очереди", () => {
      const queue = new Queue<number>();
      expect(queue.dequeue()).toEqual(None.instance());
    });
  });

  describe("peek", () => {
    it("должен возвращать первый элемент без его удаления", () => {
      const queue = new Queue<number>();
      queue.enqueue(1);
      queue.enqueue(2);

      expect(queue.peek()).toEqual(new Some(1));
      expect(queue.peek()).toEqual(new Some(1));
      expect(queue.dequeue()).toEqual(new Some(1));
      expect(queue.peek()).toEqual(new Some(2));
    });

    it("peek() должен возвращать None для пустой очереди", () => {
      const queue = new Queue<number>();
      expect(queue.peek()).toEqual(None.instance());
    });
  });

  describe("size и isEmpty", () => {
    it("должен правильно отслеживать размер", () => {
      const queue = new Queue<number>();
      expect(queue.size).toBe(0);
      expect(queue.isEmpty()).toBe(true);

      queue.enqueue(1);
      expect(queue.size).toBe(1);
      expect(queue.isEmpty()).toBe(false);

      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.size).toBe(3);
      expect(queue.isEmpty()).toBe(false);

      queue.dequeue();
      expect(queue.size).toBe(2);

      queue.clear();
      expect(queue.size).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe("clear", () => {
    it("должен очищать очередь", () => {
      const queue = new Queue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);

      queue.clear();

      expect(queue.size).toBe(0);
      expect(queue.isEmpty()).toBe(true);
      expect(queue.dequeue()).toEqual(None.instance());
      expect(queue.peek()).toEqual(None.instance());
    });
  });

  describe("Iterable", () => {
    it("должен поддерживать итерацию в порядке FIFO", () => {
      const queue = new Queue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);

      const values = Array.from(queue);
      expect(values).toEqual([1, 2, 3]);
    });

    it("должен быть пустым для пустой очереди", () => {
      const queue = new Queue<number>();
      const values = Array.from(queue);
      expect(values).toEqual([]);
    });

    it("должен поддерживать for..of", () => {
      const queue = new Queue<number>();
      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);

      const values: number[] = [];
      for (const value of queue) {
        values.push(value);
      }
      expect(values).toEqual([1, 2, 3]);
    });
  });

  describe("from", () => {
    it("должен создавать очередь из массива", () => {
      const queue = Queue.from([1, 2, 3]);
      expect(queue.size).toBe(3);
      expect(queue.dequeue()).toEqual(new Some(1));
      expect(queue.dequeue()).toEqual(new Some(2));
      expect(queue.dequeue()).toEqual(new Some(3));
    });

    it("должен создавать очередь из множества", () => {
      const queue = Queue.from(new Set([1, 2, 3]));
      expect(queue.size).toBe(3);
    });

    it("должен создавать пустую очередь из пустого итератора", () => {
      const queue = Queue.from([]);
      expect(queue.size).toBe(0);
      expect(queue.isEmpty()).toBe(true);
    });
  });

  describe("работа с типами", () => {
    it("должен работать со строками", () => {
      const queue = new Queue<string>();
      queue.enqueue("a");
      queue.enqueue("b");
      queue.enqueue("c");

      expect(queue.dequeue()).toEqual(new Some("a"));
      expect(queue.peek()).toEqual(new Some("b"));
    });

    it("должен работать с объектами", () => {
      interface Person {
        name: string;
        age: number;
      }

      const queue = new Queue<Person>();
      queue.enqueue({ name: "Alice", age: 30 });
      queue.enqueue({ name: "Bob", age: 25 });

      const result = queue.dequeue();
      expect(result.isSome()).toBe(true);
      expect(result.unwrap()).toEqual({ name: "Alice", age: 30 });
    });

    it("должен работать с null и undefined как значениями", () => {
      const queue = new Queue<number | null | undefined>();
      queue.enqueue(1);
      queue.enqueue(null);
      queue.enqueue(undefined);

      expect(queue.dequeue()).toEqual(new Some(1));
      expect(queue.dequeue()).toEqual(new Some(null));
      expect(queue.dequeue()).toEqual(new Some(undefined));
    });
  });

  describe("сложные сценарии", () => {
    it("должен обрабатывать большое количество операций", () => {
      const queue = new Queue<number>();
      const count = 1000;

      for (let i = 0; i < count; i++) {
        queue.enqueue(i);
      }

      expect(queue.size).toBe(count);

      for (let i = 0; i < count; i++) {
        expect(queue.dequeue()).toEqual(new Some(i));
      }

      expect(queue.isEmpty()).toBe(true);
    });

    it("должен корректно увеличивать размер при переполнении", () => {
      const queue = new Queue<number>(2);
      expect(queue.size).toBe(0);

      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      queue.enqueue(4);

      expect(queue.size).toBe(4);
      expect(queue.dequeue()).toEqual(new Some(1));
      expect(queue.dequeue()).toEqual(new Some(2));
      expect(queue.dequeue()).toEqual(new Some(3));
      expect(queue.dequeue()).toEqual(new Some(4));
    });

    it("должен правильно обрабатывать чередование enqueue/dequeue с переполнением", () => {
      const queue = new Queue<number>(2);

      queue.enqueue(1);
      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.dequeue()).toEqual(new Some(1));
      expect(queue.dequeue()).toEqual(new Some(2));
      queue.enqueue(4);
      queue.enqueue(5);

      expect(queue.size).toBe(3);
      expect(queue.dequeue()).toEqual(new Some(3));
      expect(queue.dequeue()).toEqual(new Some(4));
      expect(queue.dequeue()).toEqual(new Some(5));
    });

    it("должен поддерживать чередование операций", () => {
      const queue = new Queue<number>();

      queue.enqueue(1);
      expect(queue.dequeue()).toEqual(new Some(1));
      expect(queue.dequeue()).toEqual(None.instance());

      queue.enqueue(2);
      queue.enqueue(3);
      expect(queue.dequeue()).toEqual(new Some(2));

      queue.enqueue(4);
      expect(queue.dequeue()).toEqual(new Some(3));
      expect(queue.dequeue()).toEqual(new Some(4));
      expect(queue.dequeue()).toEqual(None.instance());
    });
  });

  describe("производительность", () => {
    it("должен использовать O(1) операции", () => {
      const queue = new Queue<number>(4);

      const start = Date.now();
      for (let i = 0; i < 10000; i++) {
        queue.enqueue(i);
        if (i % 2 === 0) {
          queue.dequeue();
        }
      }
      const end = Date.now();

      expect(end - start).toBeLessThan(100);
    });
  });
});
