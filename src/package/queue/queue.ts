import type { Option } from "../option/option";
import { Some, None } from "../option/option";

export class Queue<T> implements Iterable<T> {
  private buffer: (T | undefined)[];
  private head: number = 0;
  private tail: number = 0;
  private count: number = 0;

  constructor(initialCapacity: number = 16) {
    if (initialCapacity < 1) {
      throw new Error("Initial capacity must be at least 1");
    }
    this.buffer = Array.from({ length: initialCapacity }) as (T | undefined)[];
  }

  enqueue(value: T): void {
    if (this.count === this.buffer.length) {
      this.resize();
    }
    this.buffer[this.tail] = value;
    this.tail = (this.tail + 1) % this.buffer.length;
    this.count++;
  }

  dequeue(): Option<T> {
    if (this.isEmpty()) {
      return None.instance();
    }
    const value = this.buffer[this.head];
    this.buffer[this.head] = undefined;
    this.head = (this.head + 1) % this.buffer.length;
    this.count--;
    return new Some(value!);
  }

  peek(): Option<T> {
    if (this.isEmpty()) {
      return None.instance();
    }
    return new Some(this.buffer[this.head]!);
  }

  get size(): number {
    return this.count;
  }

  isEmpty(): boolean {
    return this.count === 0;
  }

  clear(): void {
    this.buffer.fill(undefined);
    this.head = 0;
    this.tail = 0;
    this.count = 0;
  }

  private resize(): void {
    const newBuffer = Array.from({ length: this.buffer.length * 2 }) as (T | undefined)[];
    for (let i = 0; i < this.count; i++) {
      newBuffer[i] = this.buffer[(this.head + i) % this.buffer.length];
    }
    this.buffer = newBuffer;
    this.head = 0;
    this.tail = this.count;
  }

  [Symbol.iterator](): Iterator<T> {
    let index = 0;
    return {
      next: () => {
        if (index >= this.count) {
          return { value: undefined, done: true };
        }
        const value = this.buffer[(this.head + index) % this.buffer.length];
        index++;
        return { value: value!, done: false };
      },
    };
  }

  static from<T>(iterable: Iterable<T>): Queue<T> {
    const queue = new Queue<T>();
    for (const item of iterable) {
      queue.enqueue(item);
    }
    return queue;
  }
}
