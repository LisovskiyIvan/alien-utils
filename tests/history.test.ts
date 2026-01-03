import { describe, it, expect } from "bun:test";
import { History, PatchHistory } from "../src/package/history";

describe("History", () => {
  describe("Basic operations", () => {
    it("should create history with initial state", () => {
      const h = new History({ count: 0 });
      expect(h.state).toEqual({ count: 0 });
      expect(h.index).toBe(0);
      expect(h.length).toBe(1);
    });

    it("should set new state", () => {
      const h = new History({ count: 0 });
      h.set({ count: 1 });
      expect(h.state).toEqual({ count: 1 });
      expect(h.index).toBe(1);
      expect(h.length).toBe(2);
    });

    it("should update state with draft function", () => {
      const h = new History({ count: 0 });
      h.update(draft => ({ count: draft.count + 1 }));
      expect(h.state).toEqual({ count: 1 });
      expect(h.index).toBe(1);
    });

    it("should prevent duplicate states with default equals", () => {
      const h = new History(0);
      h.set(0);
      expect(h.length).toBe(1);
      expect(h.index).toBe(0);
    });

    it("should use custom equals function", () => {
      const h = new History(
        { count: 0, timestamp: 100 },
        { equals: (a, b) => a.count === b.count }
      );
      h.set({ count: 0, timestamp: 200 });
      expect(h.length).toBe(1);
    });
  });

  describe("Undo/Redo", () => {
    it("should support undo", () => {
      const h = new History(0);
      h.set(1);
      h.set(2);
      
      expect(h.canUndo).toBe(true);
      h.undo();
      expect(h.state).toBe(1);
      expect(h.index).toBe(1);
      
      h.undo();
      expect(h.state).toBe(0);
      expect(h.index).toBe(0);
    });

    it("should support redo", () => {
      const h = new History(0);
      h.set(1);
      h.set(2);
      h.undo();
      h.undo();
      
      expect(h.canRedo).toBe(true);
      h.redo();
      expect(h.state).toBe(1);
      expect(h.index).toBe(1);
      
      h.redo();
      expect(h.state).toBe(2);
      expect(h.index).toBe(2);
    });

    it("should not undo beyond initial state", () => {
      const h = new History(0);
      h.undo();
      expect(h.state).toBe(0);
      expect(h.canUndo).toBe(false);
    });

    it("should not redo beyond latest state", () => {
      const h = new History(0);
      h.set(1);
      h.redo();
      expect(h.state).toBe(1);
      expect(h.canRedo).toBe(false);
    });

    it("should truncate future states when setting new state after undo", () => {
      const h = new History(0);
      h.set(1);
      h.set(2);
      h.undo();
      h.set(3);
      
      expect(h.length).toBe(2);
      expect(h.state).toBe(3);
      expect(h.canRedo).toBe(false);
    });
  });

  describe("Limit", () => {
    it("should respect limit option", () => {
      const h = new History(0, { limit: 3 });
      h.set(1);
      h.set(2);
      h.set(3);
      h.set(4);
      
      expect(h.length).toBe(3);
      expect(h.state).toBe(4);
      expect(h.index).toBe(2);
    });

    it("should shift states when limit exceeded", () => {
      const h = new History(0, { limit: 3 });
      h.set(1);
      h.set(2);
      h.set(3);
      
      expect(h.state).toBe(3);
      expect(h.index).toBe(2);
      
      h.undo();
      expect(h.state).toBe(2);
      expect(h.index).toBe(1);
      
      h.undo();
      expect(h.state).toBe(1);
      expect(h.index).toBe(0);
      
      h.undo();
      expect(h.state).toBe(1);
      expect(h.index).toBe(0);
    });
  });

  describe("Subscriptions", () => {
    it("should notify subscribers on state change", () => {
      const h = new History(0);
      const states: number[] = [];
      
      h.subscribe(state => states.push(state));
      h.set(1);
      h.set(2);
      
      expect(states).toEqual([1, 2]);
    });

    it("should not notify on duplicate state", () => {
      const h = new History(0);
      const states: number[] = [];
      
      h.subscribe(state => states.push(state));
      h.set(0);
      
      expect(states).toEqual([]);
    });

    it("should notify on undo/redo", () => {
      const h = new History(0);
      const states: number[] = [];
      
      h.subscribe(state => states.push(state));
      h.set(1);
      h.set(2);
      h.undo();
      h.redo();
      
      expect(states).toEqual([1, 2, 1, 2]);
    });

    it("should return unsubscribe function", () => {
      const h = new History(0);
      const states: number[] = [];
      
      const unsubscribe = h.subscribe(state => states.push(state));
      h.set(1);
      unsubscribe();
      h.set(2);
      
      expect(states).toEqual([1]);
    });
  });

  describe("Transactions", () => {
    it("should batch multiple operations", () => {
      const h = new History({ a: 0, b: 0 });
      
      h.transaction(() => {
        h.update(draft => ({ ...draft, a: 1 }));
        h.update(draft => ({ ...draft, b: 2 }));
      });
      
      expect(h.state).toEqual({ a: 1, b: 2 });
      expect(h.length).toBe(2);
      expect(h.index).toBe(1);
    });

    it("should undo entire transaction", () => {
      const h = new History({ count: 0 });
      
      h.transaction(() => {
        h.update(draft => ({ count: draft.count + 1 }));
        h.update(draft => ({ count: draft.count + 1 }));
        h.update(draft => ({ count: draft.count + 1 }));
      });
      
      expect(h.state).toEqual({ count: 3 });
      
      h.undo();
      expect(h.state).toEqual({ count: 0 });
    });

    it("should notify once per transaction", () => {
      const h = new History(0);
      let notifyCount = 0;
      
      h.subscribe(() => notifyCount++);
      h.transaction(() => {
        h.set(1);
        h.set(2);
        h.set(3);
      });
      
      expect(notifyCount).toBe(1);
      expect(h.state).toBe(3);
    });

    it("should handle nested transactions", () => {
      const h = new History(0);
      const states: number[] = [];
      
      h.subscribe(state => states.push(state));
      
      h.transaction(() => {
        h.set(1);
        h.transaction(() => {
          h.set(2);
          h.set(3);
        });
      });
      
      expect(h.state).toBe(3);
      expect(states).toEqual([3]);
    });
  });

  describe("Clear", () => {
    it("should clear history keeping current state", () => {
      const h = new History(0);
      h.set(1);
      h.set(2);
      h.set(3);
      
      h.clear();
      
      expect(h.state).toBe(3);
      expect(h.length).toBe(1);
      expect(h.index).toBe(0);
      expect(h.canUndo).toBe(false);
      expect(h.canRedo).toBe(false);
    });
  });

  describe("Static from method", () => {
    it("should create history from iterable", () => {
      const h = History.from([0, 1, 2, 3]);
      expect(h.state).toBe(3);
      expect(h.length).toBe(4);
    });

    it("should throw on empty iterable", () => {
      expect(() => History.from([])).toThrow("Cannot create History from empty iterable");
    });

    it("should work with options", () => {
      const h = History.from([0, 1, 2, 3], { limit: 2 });
      expect(h.length).toBe(2);
      expect(h.state).toBe(3);
    });
  });

  describe("Type safety", () => {
    it("should work with different types", () => {
      const h1 = new History<string>("hello");
      const h2 = new History<number[]>([1, 2, 3]);
      const h3 = new History<{ name: string; age: number }>({ name: "Alice", age: 30 });
      
      expect(h1.state).toBe("hello");
      expect(h2.state).toEqual([1, 2, 3]);
      expect(h3.state).toEqual({ name: "Alice", age: 30 });
    });

    it("should work with complex nested objects", () => {
      interface State {
        user: {
          name: string;
          settings: {
            theme: string;
          };
        };
        items: string[];
      }
      
      const h = new History<State>({
        user: { name: "Alice", settings: { theme: "dark" } },
        items: []
      });
      
      h.update(draft => ({
        ...draft,
        user: {
          ...draft.user,
          settings: { theme: "light" }
        }
      }));
      
      expect(h.state.user.settings.theme).toBe("light");
    });
  });
});

describe("PatchHistory", () => {
  // Simple diff/apply/invert for testing
  const simpleDiff = (oldObj: any, newObj: any): any[] => {
    const patches: any[] = [];
    for (const key in newObj) {
      if (oldObj[key] !== newObj[key]) {
        patches.push({ op: "replace", path: key, value: newObj[key], oldValue: oldObj[key] });
      }
    }
    return patches;
  };

  const simpleApply = (state: any, patches: any[]): any => {
    let newState = { ...state };
    for (const patch of patches) {
      if (patch.op === "replace") {
        newState[patch.path] = patch.value;
      }
    }
    return newState;
  };

  const simpleInvert = (patches: any[]): any[] => {
    return patches.map(p => ({
      op: "replace",
      path: p.path,
      value: p.oldValue,
      oldValue: p.value
    }));
  };

  describe("Basic operations", () => {
    it("should create patch history with initial state", () => {
      const h = new PatchHistory({ count: 0 }, {
        diff: simpleDiff,
        apply: simpleApply,
        invert: simpleInvert
      });
      
      expect(h.state).toEqual({ count: 0 });
      expect(h.index).toBe(0);
    });

    it("should set new state with patches", () => {
      const h = new PatchHistory({ count: 0 }, {
        diff: simpleDiff,
        apply: simpleApply,
        invert: simpleInvert
      });
      
      h.set({ count: 1 });
      expect(h.state).toEqual({ count: 1 });
      expect(h.index).toBe(1);
    });

    it("should update state with draft function", () => {
      const h = new PatchHistory({ count: 0 }, {
        diff: simpleDiff,
        apply: simpleApply,
        invert: simpleInvert
      });
      
      h.update(draft => ({ count: draft.count + 1 }));
      expect(h.state).toEqual({ count: 1 });
    });

    it("should skip empty patches", () => {
      const h = new PatchHistory({ count: 0 }, {
        diff: simpleDiff,
        apply: simpleApply,
        invert: simpleInvert
      });
      
      h.set({ count: 0 });
      expect(h.length).toBe(1);
      expect(h.index).toBe(0);
    });
  });

  describe("Undo/Redo", () => {
    it("should undo using inverted patches", () => {
      const h = new PatchHistory({ count: 0 }, {
        diff: simpleDiff,
        apply: simpleApply,
        invert: simpleInvert
      });
      
      h.set({ count: 1 });
      h.set({ count: 2 });
      
      expect(h.state).toEqual({ count: 2 });
      h.undo();
      expect(h.state).toEqual({ count: 1 });
      h.undo();
      expect(h.state).toEqual({ count: 0 });
    });

    it("should redo using patches", () => {
      const h = new PatchHistory({ count: 0 }, {
        diff: simpleDiff,
        apply: simpleApply,
        invert: simpleInvert
      });
      
      h.set({ count: 1 });
      h.undo();
      
      expect(h.state).toEqual({ count: 0 });
      h.redo();
      expect(h.state).toEqual({ count: 1 });
    });

    it("should support canUndo/canRedo", () => {
      const h = new PatchHistory({ count: 0 }, {
        diff: simpleDiff,
        apply: simpleApply,
        invert: simpleInvert
      });
      
      expect(h.canUndo).toBe(false);
      expect(h.canRedo).toBe(false);
      
      h.set({ count: 1 });
      expect(h.canUndo).toBe(true);
      expect(h.canRedo).toBe(false);
      
      h.undo();
      expect(h.canUndo).toBe(false);
      expect(h.canRedo).toBe(true);
    });
  });

  describe("Limit", () => {
    it("should respect limit and apply inverted patches", () => {
      const h = new PatchHistory({ count: 0 }, {
        diff: simpleDiff,
        apply: simpleApply,
        invert: simpleInvert,
        limit: 2
      });
      
      h.set({ count: 1 });
      h.set({ count: 2 });
      h.set({ count: 3 });
      
      expect(h.length).toBe(2);
      expect(h.state).toEqual({ count: 3 });
    });
  });

  describe("Subscriptions", () => {
    it("should notify subscribers", () => {
      const h = new PatchHistory({ count: 0 }, {
        diff: simpleDiff,
        apply: simpleApply,
        invert: simpleInvert
      });
      
      const states: any[] = [];
      h.subscribe(state => states.push(state));
      
      h.set({ count: 1 });
      h.set({ count: 2 });
      
      expect(states).toEqual([{ count: 1 }, { count: 2 }]);
    });

    it("should notify on undo/redo", () => {
      const h = new PatchHistory({ count: 0 }, {
        diff: simpleDiff,
        apply: simpleApply,
        invert: simpleInvert
      });
      
      const states: any[] = [];
      h.subscribe(state => states.push(state));
      
      h.set({ count: 1 });
      h.undo();
      h.redo();
      
      expect(states).toEqual([{ count: 1 }, { count: 0 }, { count: 1 }]);
    });
  });

  describe("Transactions", () => {
    it("should batch operations in transaction", () => {
      const h = new PatchHistory({ a: 0, b: 0 }, {
        diff: simpleDiff,
        apply: simpleApply,
        invert: simpleInvert
      });
      
      h.transaction(() => {
        h.update(draft => ({ ...draft, a: 1 }));
        h.update(draft => ({ ...draft, b: 2 }));
      });
      
      expect(h.state).toEqual({ a: 1, b: 2 });
      expect(h.length).toBe(2);
    });

    it("should undo entire transaction", () => {
      const h = new PatchHistory({ count: 0 }, {
        diff: simpleDiff,
        apply: simpleApply,
        invert: simpleInvert
      });
      
      h.transaction(() => {
        h.update(draft => ({ count: draft.count + 1 }));
        h.update(draft => ({ count: draft.count + 1 }));
      });
      
      expect(h.state).toEqual({ count: 2 });
      h.undo();
      expect(h.state).toEqual({ count: 0 });
    });
  });

  describe("Clear", () => {
    it("should clear patches keeping current state", () => {
      const h = new PatchHistory({ count: 0 }, {
        diff: simpleDiff,
        apply: simpleApply,
        invert: simpleInvert
      });
      
      h.set({ count: 1 });
      h.set({ count: 2 });
      h.clear();
      
      expect(h.state).toEqual({ count: 2 });
      expect(h.length).toBe(1);
      expect(h.canUndo).toBe(false);
    });
  });

  describe("Static withPatches method", () => {
    it("should create patch history using static method", () => {
      const h = History.withPatches({ count: 0 }, {
        diff: simpleDiff,
        apply: simpleApply,
        invert: simpleInvert
      });
      
      expect(h.state).toEqual({ count: 0 });
      h.set({ count: 1 });
      expect(h.state).toEqual({ count: 1 });
    });
  });
});
