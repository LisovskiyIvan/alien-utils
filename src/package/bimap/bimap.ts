export interface IBimap<K, V> {
  set(key: K, value: V): this;

  get(key: K): V | undefined;

  getReverse(value: V): K | undefined;

  has(key: K): boolean;

  hasValue(value: V): boolean;

  delete(key: K): boolean;

  deleteValue(value: V): boolean;

  clear(): void;

  get size(): number;

  keys(): K[];

  values(): V[];

  entries(): [K, V][];

  reverseEntries(): [V, K][];
}

export class Bimap<K, V> implements IBimap<K, V> {
  private _forward: Map<K, V>;
  private _reverse: Map<V, K>;

  constructor() {
    this._forward = new Map();
    this._reverse = new Map();
  }

  static from<K, V>(entries: Iterable<[K, V]>): Bimap<K, V> {
    const bimap = new Bimap<K, V>();
    for (const [key, value] of entries) {
      bimap.set(key, value);
    }
    return bimap;
  }

  static of<K, V>(...entries: [K, V][]): Bimap<K, V> {
    const bimap = new Bimap<K, V>();
    for (const [key, value] of entries) {
      bimap.set(key, value);
    }
    return bimap;
  }

  set(key: K, value: V): this {
    const existingValue = this._forward.get(key);
    if (existingValue !== undefined) {
      this._reverse.delete(existingValue);
    }

    const existingKey = this._reverse.get(value);
    if (existingKey !== undefined) {
      this._forward.delete(existingKey);
    }

    this._forward.set(key, value);
    this._reverse.set(value, key);
    return this;
  }

  get(key: K): V | undefined {
    return this._forward.get(key);
  }

  getReverse(value: V): K | undefined {
    return this._reverse.get(value);
  }

  has(key: K): boolean {
    return this._forward.has(key);
  }

  hasValue(value: V): boolean {
    return this._reverse.has(value);
  }

  delete(key: K): boolean {
    const value = this._forward.get(key);
    if (value === undefined) {
      return false;
    }
    this._forward.delete(key);
    this._reverse.delete(value);
    return true;
  }

  deleteValue(value: V): boolean {
    const key = this._reverse.get(value);
    if (key === undefined) {
      return false;
    }
    this._reverse.delete(value);
    this._forward.delete(key);
    return true;
  }

  clear(): void {
    this._forward.clear();
    this._reverse.clear();
  }

  get size(): number {
    return this._forward.size;
  }

  keys(): K[] {
    return Array.from(this._forward.keys());
  }

  values(): V[] {
    return Array.from(this._forward.values());
  }

  entries(): [K, V][] {
    return Array.from(this._forward.entries());
  }

  reverseEntries(): [V, K][] {
    return Array.from(this._reverse.entries());
  }

  forEach(callback: (value: V, key: K, bimap: Bimap<K, V>) => void): void {
    this._forward.forEach((value, key) => {
      callback(value, key, this);
    });
  }

  forEachReverse(callback: (key: K, value: V, bimap: Bimap<K, V>) => void): void {
    this._reverse.forEach((key, value) => {
      callback(key, value, this);
    });
  }

  clone(): Bimap<K, V> {
    const cloned = new Bimap<K, V>();
    this._forward.forEach((value, key) => {
      cloned.set(key, value);
    });
    return cloned;
  }

  toString(): string {
    const entries = this.entries()
      .map(([k, v]) => `${String(k)} => ${String(v)}`)
      .join(", ");
    return `Bimap { ${entries} }`;
  }

  toJSON(): { forward: [K, V][]; reverse: [V, K][] } {
    return {
      forward: this.entries(),
      reverse: this.reverseEntries(),
    };
  }
}
