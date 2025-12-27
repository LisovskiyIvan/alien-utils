import type { Option } from "../option/option";
import { Some, None } from "../option/option";

export class Stack<T> implements Iterable<T> {
  private items: T[] = [];

  push(value: T): this {
    this.items.push(value);
    return this;
  }

  pop(): Option<T> {
    if (this.isEmpty()) {
      return None.instance();
    }
    return new Some(this.items.pop()!);
  }

  peek(): Option<T> {
    if (this.isEmpty()) {
      return None.instance();
    }
    return new Some(this.items[this.items.length - 1]);
  }

  get size(): number {
    return this.items.length;
  }

  isEmpty(): boolean {
    return this.items.length === 0;
  }

  clear(): void {
    this.items = [];
  }

  [Symbol.iterator](): Iterator<T> {
    let index = this.items.length - 1;
    return {
      next: () => {
        if (index < 0) {
          return { value: undefined, done: true };
        }
        return { value: this.items[index--], done: false };
      },
    };
  }

  static from<T>(iterable: Iterable<T>): Stack<T> {
    const stack = new Stack<T>();
    for (const item of iterable) {
      stack.push(item);
    }
    return stack;
  }
}
