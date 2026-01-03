export interface HistoryOptions<T> {
  limit?: number;
  equals?: (a: T, b: T) => boolean;
}

export interface Patch {
  op: "add" | "remove" | "replace";
  path: string;
  value?: unknown;
  oldValue?: unknown;
}

export interface PatchHistoryOptions<T> {
  limit?: number;
  diff: (oldValue: T, newValue: T) => Patch[];
  apply: (state: T, patches: Patch[]) => T;
  invert: (patches: Patch[]) => Patch[];
}

type Subscriber<T> = (state: T) => void;
type TransactionFn = () => void;

export class History<T> {
  private states: T[];
  private currentIndex: number;
  private limit: number;
  private equals: (a: T, b: T) => boolean;
  private subscribers: Set<Subscriber<T>>;
  private inTransaction: boolean;
  private transactionQueue: (() => void)[];
  private transactionStates: T[];

  constructor(initial: T, options: HistoryOptions<T> = {}) {
    this.states = [initial];
    this.currentIndex = 0;
    this.limit = options.limit ?? Infinity;
    this.equals = options.equals ?? Object.is;
    this.subscribers = new Set();
    this.inTransaction = false;
    this.transactionQueue = [];
    this.transactionStates = [];
  }

  get state(): T {
    if (this.inTransaction && this.transactionStates.length > 0) {
      return this.transactionStates[this.transactionStates.length - 1];
    }
    return this.states[this.currentIndex];
  }

  get index(): number {
    return this.currentIndex;
  }

  get length(): number {
    return this.states.length;
  }

  set(next: T): void {
    if (this.inTransaction) {
      this.transactionQueue.push(() => this._set(next));
      return;
    }
    this._set(next);
  }

  private _addToHistory(next: T): void {
    if (this.equals(this.state, next)) {
      return;
    }

    if (this.currentIndex < this.states.length - 1) {
      this.states[this.currentIndex] = next;
      this.states = this.states.slice(0, this.currentIndex + 1);
    } else {
      this.states.push(next);
      this.currentIndex++;
    }

    if (this.states.length > this.limit) {
      this.states.shift();
      if (this.currentIndex > 0) {
        this.currentIndex--;
      }
    }

    this._notify();
  }

  private _set(next: T): void {
    if (this.inTransaction) {
      this.transactionStates.push(next);
      return;
    }
    
    this._addToHistory(next);
  }

  update(draft: (state: T) => T): void {
    if (this.inTransaction) {
      this.transactionQueue.push(() => this._update(draft));
      return;
    }
    this._update(draft);
  }

  private _update(draft: (state: T) => T): void {
    const next = draft(this.state);
    this._set(next);
  }

  undo(): void {
    if (this.inTransaction) {
      this.transactionQueue.push(() => this._undo());
      return;
    }
    this._undo();
  }

  private _undo(): void {
    if (this.currentIndex > 0) {
      this.currentIndex--;
      this._notify();
    }
  }

  redo(): void {
    if (this.inTransaction) {
      this.transactionQueue.push(() => this._redo());
      return;
    }
    this._redo();
  }

  private _redo(): void {
    if (this.currentIndex < this.states.length - 1) {
      this.currentIndex++;
      this._notify();
    }
  }

  get canUndo(): boolean {
    return this.currentIndex > 0;
  }

  get canRedo(): boolean {
    return this.currentIndex < this.states.length - 1;
  }

  subscribe(subscriber: Subscriber<T>): () => void {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private _notify(): void {
    for (const subscriber of this.subscribers) {
      subscriber(this.state);
    }
  }

  transaction(fn: TransactionFn): void {
    if (this.inTransaction) {
      fn();
      return;
    }

    this.inTransaction = true;
    this.transactionQueue = [];
    this.transactionStates = [];

    try {
      fn();
      
      for (const action of this.transactionQueue) {
        action();
      }
    } finally {
      this.inTransaction = false;
      
      if (this.transactionStates.length > 0) {
        const finalState = this.transactionStates[this.transactionStates.length - 1];
        this._addToHistory(finalState);
      }
      
      this.transactionQueue = [];
      this.transactionStates = [];
    }
  }

  clear(): void {
    this.states = [this.states[this.currentIndex]];
    this.currentIndex = 0;
  }

  static from<T>(iterable: Iterable<T>, options?: HistoryOptions<T>): History<T> {
    const arr = Array.from(iterable);
    if (arr.length === 0) {
      throw new Error("Cannot create History from empty iterable");
    }
    const history = new History(arr[0], options);
    for (let i = 1; i < arr.length; i++) {
      history._set(arr[i]);
    }
    return history;
  }

  static withPatches<T>(
    initial: T,
    options: PatchHistoryOptions<T>
  ): PatchHistory<T> {
    return new PatchHistory(initial, options);
  }
}

export class PatchHistory<T> {
  private currentState: T;
  private patches: Patch[][];
  private currentIndex: number;
  private limit: number;
  private diff: (oldValue: T, newValue: T) => Patch[];
  private apply: (state: T, patches: Patch[]) => T;
  private invert: (patches: Patch[]) => Patch[];
  private subscribers: Set<Subscriber<T>>;
  private inTransaction: boolean;
  private transactionQueue: (() => void)[];
  private transactionStates: T[];

  constructor(initial: T, options: PatchHistoryOptions<T>) {
    this.currentState = initial;
    this.patches = [[]];
    this.currentIndex = 0;
    this.limit = options.limit ?? Infinity;
    this.diff = options.diff;
    this.apply = options.apply;
    this.invert = options.invert;
    this.subscribers = new Set();
    this.inTransaction = false;
    this.transactionQueue = [];
    this.transactionStates = [];
  }

  get state(): T {
    if (this.inTransaction && this.transactionStates.length > 0) {
      return this.transactionStates[this.transactionStates.length - 1];
    }
    return this.currentState;
  }

  get index(): number {
    return this.currentIndex;
  }

  get length(): number {
    return this.patches.length;
  }

  set(next: T): void {
    if (this.inTransaction) {
      this.transactionQueue.push(() => this._set(next));
      return;
    }
    this._set(next);
  }

  private _addToHistory(next: T): void {
    const patch = this.diff(this.currentState, next);
    
    if (patch.length === 0) {
      return;
    }

    if (this.currentIndex < this.patches.length - 1) {
      this.patches[this.currentIndex] = patch;
      this.patches = this.patches.slice(0, this.currentIndex + 1);
      this.currentState = next;
    } else {
      if (this.patches.length === this.limit) {
        const removed = this.patches.shift()!;
        if (this.currentIndex > 0) {
          this.currentIndex--;
        }
        if (removed.length > 0) {
          this.currentState = this.apply(this.currentState, this.invert(removed));
        }
      }
      this.patches.push(patch);
      this.currentIndex++;
      this.currentState = next;
    }

    this._notify();
  }

  private _set(next: T): void {
    if (this.inTransaction) {
      this.transactionStates.push(next);
      return;
    }
    
    this._addToHistory(next);
  }

  update(draft: (state: T) => T): void {
    if (this.inTransaction) {
      this.transactionQueue.push(() => this._update(draft));
      return;
    }
    this._update(draft);
  }

  private _update(draft: (state: T) => T): void {
    const next = draft(this.state);
    this._set(next);
  }

  undo(): void {
    if (this.inTransaction) {
      this.transactionQueue.push(() => this._undo());
      return;
    }
    this._undo();
  }

  private _undo(): void {
    if (this.currentIndex > 0) {
      const patchesToUndo = this.patches[this.currentIndex];
      this.currentState = this.apply(this.currentState, this.invert(patchesToUndo));
      this.currentIndex--;
      this._notify();
    }
  }

  redo(): void {
    if (this.inTransaction) {
      this.transactionQueue.push(() => this._redo());
      return;
    }
    this._redo();
  }

  private _redo(): void {
    if (this.currentIndex < this.patches.length - 1) {
      this.currentIndex++;
      const patchesToApply = this.patches[this.currentIndex];
      this.currentState = this.apply(this.currentState, patchesToApply);
      this._notify();
    }
  }

  get canUndo(): boolean {
    return this.currentIndex > 0;
  }

  get canRedo(): boolean {
    return this.currentIndex < this.patches.length - 1;
  }

  subscribe(subscriber: Subscriber<T>): () => void {
    this.subscribers.add(subscriber);
    return () => {
      this.subscribers.delete(subscriber);
    };
  }

  private _notify(): void {
    for (const subscriber of this.subscribers) {
      subscriber(this.state);
    }
  }

  transaction(fn: TransactionFn): void {
    if (this.inTransaction) {
      fn();
      return;
    }

    this.inTransaction = true;
    this.transactionQueue = [];
    this.transactionStates = [];

    try {
      fn();
      
      for (const action of this.transactionQueue) {
        action();
      }
    } finally {
      this.inTransaction = false;
      
      if (this.transactionStates.length > 0) {
        const finalState = this.transactionStates[this.transactionStates.length - 1];
        this._addToHistory(finalState);
      }
      
      this.transactionQueue = [];
      this.transactionStates = [];
    }
  }

  clear(): void {
    this.patches = [this.patches[this.currentIndex]];
    this.currentIndex = 0;
  }
}

