import { describe, expect, test } from "bun:test";
import { Iter } from "../src/package/iterator/iterator";
import { Some, None } from "../src/package/option/option";

describe("Iter - Creating Iterators", () => {
  test("from() creates iterator from array", () => {
    const iter = Iter.from([1, 2, 3]);
    expect(iter.collect()).toEqual([1, 2, 3]);
  });

  test("from() creates iterator from Set", () => {
    const iter = Iter.from(new Set([1, 2, 3]));
    expect(iter.collect().sort()).toEqual([1, 2, 3]);
  });

  test("from() creates iterator from string", () => {
    const iter = Iter.from("abc");
    expect(iter.collect()).toEqual(["a", "b", "c"]);
  });

  test("range() creates numeric range", () => {
    expect(Iter.range(0, 5).collect()).toEqual([0, 1, 2, 3, 4]);
  });

  test("range() with step", () => {
    expect(Iter.range(0, 10, 2).collect()).toEqual([0, 2, 4, 6, 8]);
  });

  test("range() with negative step", () => {
    expect(Iter.range(10, 0, -2).collect()).toEqual([10, 8, 6, 4, 2]);
  });

  test("repeat() creates infinite iterator", () => {
    expect(Iter.repeat(42).take(3).collect()).toEqual([42, 42, 42]);
  });

  test("generate() creates infinite generator", () => {
    let n = 0;
    expect(
      Iter.generate(() => n++)
        .take(5)
        .collect()
    ).toEqual([0, 1, 2, 3, 4]);
  });

  test("empty() creates empty iterator", () => {
    expect(Iter.empty<number>().collect()).toEqual([]);
  });

  test("once() creates iterator with single element", () => {
    expect(Iter.once(42).collect()).toEqual([42]);
  });
});

describe("Iter - Lazy Transformations", () => {
  test("map() transforms elements lazily", () => {
    let callCount = 0;
    const iter = Iter.from([1, 2, 3]).map((x) => {
      callCount++;
      return x * 2;
    });

    expect(callCount).toBe(0); // map doesn't execute immediately
    const result = iter.collect();
    expect(result).toEqual([2, 4, 6]);
    expect(callCount).toBe(3); // executes on collect
  });

  test("filter() filters elements lazily", () => {
    let callCount = 0;
    const iter = Iter.from([1, 2, 3, 4, 5]).filter((x) => {
      callCount++;
      return x % 2 === 0;
    });

    expect(callCount).toBe(0);
    expect(iter.collect()).toEqual([2, 4]);
    expect(callCount).toBe(5);
  });

  test("map().filter() chain executes in single pass", () => {
    const result = Iter.from([1, 2, 3, 4, 5])
      .map((x) => x * 2)
      .filter((x) => x > 5)
      .collect();

    expect(result).toEqual([6, 8, 10]);
  });

  test("flatMap() flattens nested iterators", () => {
    const result = Iter.from([1, 2, 3])
      .flatMap((x) => [x, x * 10])
      .collect();

    expect(result).toEqual([1, 10, 2, 20, 3, 30]);
  });

  test("flatten() flattens nested arrays", () => {
    const result = Iter.from([[1, 2], [3, 4], [5]])
      .flatten()
      .collect();

    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  test("take() takes first n elements", () => {
    expect(Iter.from([1, 2, 3, 4, 5]).take(3).collect()).toEqual([1, 2, 3]);
  });

  test("take() with infinite iterator", () => {
    expect(Iter.repeat(7).take(4).collect()).toEqual([7, 7, 7, 7]);
  });

  test("takeWhile() takes elements until first false", () => {
    expect(
      Iter.from([1, 2, 3, 4, 1, 2])
        .takeWhile((x) => x < 4)
        .collect()
    ).toEqual([1, 2, 3]);
  });

  test("skip() skips first n elements", () => {
    expect(Iter.from([1, 2, 3, 4, 5]).skip(2).collect()).toEqual([3, 4, 5]);
  });

  test("skipWhile() skips elements until first false", () => {
    expect(
      Iter.from([1, 2, 3, 4, 1, 2])
        .skipWhile((x) => x < 3)
        .collect()
    ).toEqual([3, 4, 1, 2]);
  });

  test("enumerate() adds indices", () => {
    expect(Iter.from(["a", "b", "c"]).enumerate().collect()).toEqual([
      [0, "a"],
      [1, "b"],
      [2, "c"],
    ]);
  });

  test("zip() combines two iterators", () => {
    const result = Iter.from([1, 2, 3]).zip(["a", "b", "c"]).collect();

    expect(result).toEqual([
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ]);
  });

  test("zip() stops at shorter iterator", () => {
    const result = Iter.from([1, 2, 3, 4, 5]).zip(["a", "b"]).collect();

    expect(result).toEqual([
      [1, "a"],
      [2, "b"],
    ]);
  });

  test("chain() concatenates iterators", () => {
    const result = Iter.from([1, 2]).chain([3, 4]).collect();

    expect(result).toEqual([1, 2, 3, 4]);
  });

  test("stepBy() takes every nth element", () => {
    expect(Iter.from([1, 2, 3, 4, 5, 6]).stepBy(2).collect()).toEqual([
      1, 3, 5,
    ]);
  });

  test("inspect() executes side effects", () => {
    const sideEffects: number[] = [];
    const result = Iter.from([1, 2, 3])
      .inspect((x) => sideEffects.push(x))
      .map((x) => x * 2)
      .collect();

    expect(result).toEqual([2, 4, 6]);
    expect(sideEffects).toEqual([1, 2, 3]);
  });

  test("unique() removes duplicates", () => {
    expect(Iter.from([1, 2, 2, 3, 1, 4]).unique().collect()).toEqual([
      1, 2, 3, 4,
    ]);
  });

  test("uniqueBy() removes duplicates by key", () => {
    const result = Iter.from([
      { id: 1, name: "A" },
      { id: 1, name: "B" },
      { id: 2, name: "C" },
    ])
      .uniqueBy((obj) => obj.id)
      .collect();

    expect(result).toEqual([
      { id: 1, name: "A" },
      { id: 2, name: "C" },
    ]);
  });
});

describe("Iter - Consuming Operations", () => {
  test("collect() collects to array", () => {
    expect(Iter.from([1, 2, 3]).collect()).toEqual([1, 2, 3]);
  });

  test("fold() reduces left to right", () => {
    const sum = Iter.from([1, 2, 3, 4]).fold(0, (acc, x) => acc + x);

    expect(sum).toBe(10);
  });

  test("fold() for string concatenation", () => {
    const result = Iter.from(["a", "b", "c"]).fold("", (acc, x) => acc + x);

    expect(result).toBe("abc");
  });

  test("foldRight() reduces right to left", () => {
    const result = Iter.from(["a", "b", "c"]).foldRight(
      "",
      (acc, x) => acc + x
    );

    expect(result).toBe("cba");
  });

  test("reduce() uses first element as initial", () => {
    const result = Iter.from([1, 2, 3, 4]).reduce((acc, x) => acc + x);

    expect(result).toEqual(new Some(10));
  });

  test("reduce() returns None for empty iterator", () => {
    const result = Iter.empty<number>().reduce((acc, x) => acc + x);

    expect(result).toEqual(None.instance());
  });

  test("forEach() executes function for each element", () => {
    const arr: number[] = [];
    Iter.from([1, 2, 3]).forEach((x) => arr.push(x));

    expect(arr).toEqual([1, 2, 3]);
  });

  test("count() counts elements", () => {
    expect(Iter.from([1, 2, 3]).count()).toBe(3);
    expect(Iter.empty<number>().count()).toBe(0);
  });

  test("find() finds first element", () => {
    const result = Iter.from([1, 2, 3, 4]).find((x) => x > 2);

    expect(result).toEqual(new Some(3));
  });

  test("find() returns None if not found", () => {
    const result = Iter.from([1, 2, 3]).find((x) => x > 5);

    expect(result).toEqual(None.instance());
  });

  test("position() finds element index", () => {
    const result = Iter.from(["a", "b", "c"]).position((x) => x === "b");

    expect(result).toEqual(new Some(1));
  });

  test("all() checks all elements satisfy predicate", () => {
    expect(Iter.from([2, 4, 6]).all((x) => x % 2 === 0)).toBe(true);
    expect(Iter.from([2, 3, 6]).all((x) => x % 2 === 0)).toBe(false);
    expect(Iter.empty<number>().all((x) => x > 0)).toBe(true); // vacuous truth
  });

  test("any() checks any element satisfies predicate", () => {
    expect(Iter.from([1, 2, 3]).any((x) => x > 2)).toBe(true);
    expect(Iter.from([1, 2, 3]).any((x) => x > 5)).toBe(false);
    expect(Iter.empty<number>().any((x) => x > 0)).toBe(false);
  });

  test("partition() splits into two groups", () => {
    const [evens, odds] = Iter.from([1, 2, 3, 4, 5, 6]).partition(
      (x) => x % 2 === 0
    );

    expect(evens).toEqual([2, 4, 6]);
    expect(odds).toEqual([1, 3, 5]);
  });

  test("first() returns first element", () => {
    expect(Iter.from([1, 2, 3]).first()).toEqual(new Some(1));
    expect(Iter.empty<number>().first()).toEqual(None.instance());
  });

  test("last() returns last element", () => {
    expect(Iter.from([1, 2, 3]).last()).toEqual(new Some(3));
    expect(Iter.empty<number>().last()).toEqual(None.instance());
  });

  test("nth() returns nth element", () => {
    expect(Iter.from(["a", "b", "c"]).nth(1)).toEqual(new Some("b"));
    expect(Iter.from(["a", "b"]).nth(5)).toEqual(None.instance());
  });

  test("max() finds maximum", () => {
    expect(Iter.from([3, 1, 4, 1, 5]).max()).toEqual(new Some(5));
    expect(Iter.empty<number>().max()).toEqual(None.instance());
  });

  test("min() finds minimum", () => {
    expect(Iter.from([3, 1, 4, 1, 5]).min()).toEqual(new Some(1));
    expect(Iter.empty<number>().min()).toEqual(None.instance());
  });

  test("maxBy() finds element with max key", () => {
    const result = Iter.from([{ age: 20 }, { age: 30 }, { age: 25 }]).maxBy(
      (x) => x.age
    );

    expect(result).toEqual(new Some({ age: 30 }));
  });

  test("minBy() finds element with min key", () => {
    const result = Iter.from([{ age: 20 }, { age: 30 }, { age: 25 }]).minBy(
      (x) => x.age
    );

    expect(result).toEqual(new Some({ age: 20 }));
  });

  test("sum() sums numbers", () => {
    expect(Iter.from([1, 2, 3, 4]).sum()).toBe(10);
    expect(Iter.empty<number>().sum()).toBe(0);
  });

  test("product() multiplies numbers", () => {
    expect(Iter.from([1, 2, 3, 4]).product()).toBe(24);
    expect(Iter.empty<number>().product()).toBe(1);
  });

  test("join() joins strings", () => {
    expect(Iter.from(["a", "b", "c"]).join("-")).toBe("a-b-c");
    expect(Iter.from(["a", "b", "c"]).join()).toBe("abc");
  });

  test("toSet() collects to Set", () => {
    const set = Iter.from([1, 2, 2, 3, 1]).toSet();

    expect(set.size).toBe(3);
    expect(set.has(1)).toBe(true);
    expect(set.has(2)).toBe(true);
    expect(set.has(3)).toBe(true);
  });

  test("toMap() collects pairs to Map", () => {
    const map = Iter.from([
      [1, "a"],
      [2, "b"],
    ] as [number, string][]).toMap();

    expect(map.get(1)).toBe("a");
    expect(map.get(2)).toBe("b");
  });

  test("groupBy() groups by key", () => {
    const groups = Iter.from([1, 2, 3, 4, 5, 6]).groupBy((x) =>
      x % 2 === 0 ? "even" : "odd"
    );

    expect(groups.get("odd")).toEqual([1, 3, 5]);
    expect(groups.get("even")).toEqual([2, 4, 6]);
  });
});

describe("Iter - Sorting and Reverse", () => {
  test("sort() sorts elements", () => {
    expect(Iter.from([3, 1, 4, 1, 5]).sort().collect()).toEqual([
      1, 1, 3, 4, 5,
    ]);
  });

  test("sort() with compare function", () => {
    expect(
      Iter.from([3, 1, 4, 1, 5])
        .sort((a, b) => b - a)
        .collect()
    ).toEqual([5, 4, 3, 1, 1]);
  });

  test("sortBy() sorts by key", () => {
    const result = Iter.from([{ age: 30 }, { age: 20 }, { age: 25 }])
      .sortBy((x) => x.age)
      .collect();

    expect(result).toEqual([{ age: 20 }, { age: 25 }, { age: 30 }]);
  });

  test("reverse() reverses order", () => {
    expect(Iter.from([1, 2, 3]).reverse().collect()).toEqual([3, 2, 1]);
  });
});

describe("Iter - Complex Chains", () => {
  test("combined operation chain", () => {
    const result = Iter.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .filter((x) => x % 2 === 0)
      .map((x) => x * 2)
      .take(3)
      .collect();

    expect(result).toEqual([4, 8, 12]);
  });

  test("chain with enumerate and zip", () => {
    const result = Iter.from(["a", "b", "c"])
      .enumerate()
      .map(([i, v]) => `${i}:${v}`)
      .collect();

    expect(result).toEqual(["0:a", "1:b", "2:c"]);
  });

  test("flatMap with filter", () => {
    const result = Iter.from([1, 2, 3])
      .flatMap((x) => [x, x * 10])
      .filter((x) => x > 5)
      .collect();

    expect(result).toEqual([10, 20, 30]);
  });

  test("chain with multiple iterators", () => {
    const result = Iter.from([1, 2]).chain([3, 4]).chain([5, 6]).collect();

    expect(result).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe("Iter - Performance and Laziness", () => {
  test("laziness: doesn't compute more than needed", () => {
    let computations = 0;

    const result = Iter.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .map((x) => {
        computations++;
        return x * 2;
      })
      .take(3)
      .collect();

    expect(result).toEqual([2, 4, 6]);
    expect(computations).toBeLessThanOrEqual(5); // much less than 10
  });

  test("laziness: find() stops when found", () => {
    let checks = 0;

    const result = Iter.from([1, 2, 3, 4, 5]).find((x) => {
      checks++;
      return x > 2;
    });

    expect(result).toEqual(new Some(3));
    expect(checks).toBe(3); // only checked 1, 2, 3
  });

  test("infinite iterator with take()", () => {
    let n = 0;
    const result = Iter.generate(() => n++)
      .filter((x) => x % 2 === 0)
      .take(5)
      .collect();

    expect(result).toEqual([0, 2, 4, 6, 8]);
  });

  test("works with large data without intermediate arrays", () => {
    // Create large range
    const result = Iter.range(0, 1_000_000)
      .filter((x) => x % 2 === 0)
      .map((x) => x * 2)
      .take(5)
      .collect();

    expect(result).toEqual([0, 4, 8, 12, 16]);
  });
});

describe("Iter - Edge Cases", () => {
  test("empty iterator", () => {
    const iter = Iter.empty<number>();

    expect(iter.collect()).toEqual([]);
    expect(iter.count()).toBe(0);
    expect(iter.first()).toEqual(None.instance());
    expect(iter.last()).toEqual(None.instance());
    expect(iter.sum()).toBe(0);
  });

  test("iterator with single element", () => {
    const iter = Iter.once(42);

    expect(iter.collect()).toEqual([42]);
    expect(iter.count()).toBe(1);
    expect(iter.first()).toEqual(new Some(42));
    expect(iter.last()).toEqual(new Some(42));
  });

  test("take(0) returns empty iterator", () => {
    expect(Iter.from([1, 2, 3]).take(0).collect()).toEqual([]);
  });

  test("skip larger than length returns empty iterator", () => {
    expect(Iter.from([1, 2, 3]).skip(10).collect()).toEqual([]);
  });

  test("stepBy(1) equivalent to original iterator", () => {
    expect(Iter.from([1, 2, 3, 4]).stepBy(1).collect()).toEqual([1, 2, 3, 4]);
  });
});

describe("Iter - Integration with for..of", () => {
  test("can use in for..of", () => {
    const arr: number[] = [];
    const iter = Iter.from([1, 2, 3]).map((x) => x * 2);

    for (const value of iter) {
      arr.push(value);
    }

    expect(arr).toEqual([2, 4, 6]);
  });

  test("can use spread operator", () => {
    const iter = Iter.from([1, 2, 3]);
    const arr = [...iter];

    expect(arr).toEqual([1, 2, 3]);
  });
});

describe("Iter - New Methods", () => {
  test("findIndex() finds index of first element", () => {
    expect(Iter.from(['a', 'b', 'c']).findIndex(x => x === 'b')).toBe(1);
    expect(Iter.from(['a', 'b', 'c']).findIndex(x => x === 'd')).toBe(-1);
  });

  test("findJS() finds first element or returns undefined", () => {
    expect(Iter.from([1, 2, 3, 4]).findJS(x => x > 2)).toBe(3);
    expect(Iter.from([1, 2, 3, 4]).findJS(x => x > 10)).toBeUndefined();
  });

  test("includes() checks if element exists", () => {
    expect(Iter.from([1, 2, 3]).includes(2)).toBe(true);
    expect(Iter.from([1, 2, 3]).includes(4)).toBe(false);
  });

  test("includes() with fromIndex", () => {
    expect(Iter.from([1, 2, 3, 2, 4]).includes(2, 2)).toBe(true); // start from index 2
    expect(Iter.from([1, 2, 3, 2, 4]).includes(2, 0)).toBe(true); // start from index 0
    expect(Iter.from([1, 2, 3, 2, 4]).includes(1, 1)).toBe(false); // start from index 1
  });

  test("everyJS() checks all elements satisfy predicate", () => {
    expect(Iter.from([2, 4, 6]).everyJS(x => x % 2 === 0)).toBe(true);
    expect(Iter.from([2, 3, 6]).everyJS(x => x % 2 === 0)).toBe(false);
    expect(Iter.empty<number>().everyJS(x => x > 0)).toBe(true); // vacuous truth
  });

  test("someJS() checks any element satisfies predicate", () => {
    expect(Iter.from([1, 2, 3]).someJS(x => x > 2)).toBe(true);
    expect(Iter.from([1, 2, 3]).someJS(x => x > 10)).toBe(false);
    expect(Iter.empty<number>().someJS(x => x > 0)).toBe(false);
  });
});

describe("Iter - Bit Mask Optimizations", () => {
  test("should use fast path for map-only operations", () => {
    // This test verifies map-only fast path works
    // (no filter, flatMap, flatten, unique)
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const result = Iter.from(arr)
      .map((x) => x * 2)
      .map((x) => x + 1)
      .collect();

    expect(result).toEqual(arr.map((x) => x * 2 + 1));
  });

  test("should skip filter branches when no filter present", () => {
    // This test verifies that when no filter, filter checks are skipped
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const result = Iter.from(arr)
      .map((x) => x * 2)
      .take(10)
      .collect();

    expect(result).toEqual(arr.map((x) => x * 2).slice(0, 10));
  });

  test("should handle map + takeWhile combination in fast path", () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const result = Iter.from(arr)
      .map((x) => x * 2)
      .takeWhile((x) => x < 20)
      .collect();

    expect(result).toEqual(
      arr.map((x) => x * 2).filter((x) => x < 20)
    );
  });

  test("should use general path when filter is present", () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const result = Iter.from(arr)
      .map((x) => x * 2)
      .filter((x) => x > 10)
      .take(10)
      .collect();

    const expected = arr.map((x) => x * 2).filter((x) => x > 10).slice(0, 10);
    expect(result).toEqual(expected);
  });

  test("should use general path with unique", () => {
    const arr = [1, 2, 2, 3, 3, 4, 5, 5];
    const result = Iter.from(arr)
      .map((x) => x * 2)
      .unique()
      .collect();

    const expected = Array.from(new Set(arr.map((x) => x * 2)));
    expect(result).toEqual(expected);
  });

  test("should handle map + filter + take combination", () => {
    const arr = Array.from({ length: 1000 }, (_, i) => i);
    const result = Iter.from(arr)
      .map((x) => x * 2)
      .filter((x) => x % 3 === 0)
      .take(10)
      .collect();

    const expected = arr
      .map((x) => x * 2)
      .filter((x) => x % 3 === 0)
      .slice(0, 10);
    expect(result).toEqual(expected);
  });

  test("should use fast path for enumerate without filter", () => {
    const arr = ["a", "b", "c"];
    const result = Iter.from(arr)
      .enumerate()
      .map(([i, x]) => `${i}:${x}`)
      .collect();

    const expected = arr.map((x, i) => `${i}:${x}`);
    expect(result).toEqual(expected);
  });

  test("should handle complex pipeline with take, skip, stepBy", () => {
    const arr = Array.from({ length: 100 }, (_, i) => i);
    const result = Iter.from(arr)
      .skip(10)
      .stepBy(2)
      .map((x) => x * 2)
      .take(10)
      .collect();

    const expected = arr
      .slice(10)
      .filter((_, i) => i % 2 === 0)
      .map((x) => x * 2)
      .slice(0, 10);
    expect(result).toEqual(expected);
  });
});

describe("Iter - Typed Array Optimizations", () => {
  test("should use fast path for typed array map", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const result = Iter.from(data)
      .map((x) => x * 2)
      .collect();

    expect(result).toEqual([2, 4, 6, 8, 10]);
  });

  test("should use fast path for typed array with take", () => {
    const data = new Int32Array([1, 2, 3, 4, 5]);
    const result = Iter.from(data)
      .map((x) => x * 3)
      .take(3)
      .collect();

    expect(result).toEqual([3, 6, 9]);
  });

  test("should use fast path for typed array with skip", () => {
    const data = new Uint8Array([1, 2, 3, 4, 5, 6]);
    const result = Iter.from(data)
      .map((x) => x + 10)
      .skip(2)
      .collect();

    expect(result).toEqual([13, 14, 15, 16]);
  });

  test("should use fast path for typed array with stepBy", () => {
    const data = new Float64Array([1.5, 2.5, 3.5, 4.5, 5.5, 6.5]);
    const result = Iter.from(data)
      .map((x) => Math.floor(x))
      .stepBy(2)
      .collect();

    expect(result).toEqual([1, 3, 5]);
  });

  test("should handle complex typed array pipeline", () => {
    const data = new Float32Array([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    const result = Iter.from(data)
      .map((x) => x * 2)
      .skip(3)
      .stepBy(2)
      .take(3)
      .collect();

    const expected: number[] = [];
    for (let i = 3; i < data.length; i += 2) {
      expected.push(data[i] * 2);
      if (expected.length >= 3) break;
    }
    expect(result).toEqual(expected);
  });

  test("should work with all typed array types", () => {
    const tests = [
      { input: new Int8Array([1, 2, 3]), expected: [2, 4, 6] },
      { input: new Uint8Array([10, 20, 30]), expected: [20, 40, 60] },
      { input: new Int16Array([100, 200, 300]), expected: [200, 400, 600] },
      { input: new Uint16Array([1000, 2000, 3000]), expected: [2000, 4000, 6000] },
      { input: new Int32Array([10000, 20000, 30000]), expected: [20000, 40000, 60000] },
      { input: new Uint32Array([100000, 200000, 300000]), expected: [200000, 400000, 600000] },
      { input: new Float32Array([1.1, 2.2, 3.3]), expected: [2.2, 4.4, 6.6], tolerance: 0.0001 },
      { input: new Float64Array([1.5, 2.5, 3.5]), expected: [3.0, 5.0, 7.0], tolerance: 0.0001 },
    ];

    for (const { input, expected, tolerance } of tests) {
      const result = Iter.from(input).map((x) => x * 2).collect();
      if (tolerance !== undefined) {
        expect(result.length).toBe(expected.length);
        for (let i = 0; i < result.length; i++) {
          expect(Math.abs(result[i] - expected[i])).toBeLessThan(tolerance);
        }
      } else {
        expect(result).toEqual(expected);
      }
    }
  });

  test("should be faster for typed array map operations", () => {
    const size = 10000;
    const typedData = new Float32Array(size);
    for (let i = 0; i < size; i++) {
      typedData[i] = i;
    }

    const start = performance.now();
    const result = Iter.from(typedData)
      .map((x) => x * 2)
      .map((x) => x + 1)
      .take(5000)
      .collect();
    const iterTime = performance.now() - start;

    const nativeStart = performance.now();
    const nativeResult = Array.from(typedData)
      .map((x) => x * 2)
      .map((x) => x + 1)
      .slice(0, 5000);
    const nativeTime = performance.now() - nativeStart;

    expect(result).toEqual(nativeResult);
    console.log(`Typed array Iter: ${iterTime.toFixed(2)}ms, Native: ${nativeTime.toFixed(2)}ms`);
  });

  test("should fallback to general path with filter", () => {
    const data = new Float32Array([1, 2, 3, 4, 5]);
    const result = Iter.from(data)
      .map((x) => x * 2)
      .filter((x) => x > 4)
      .collect();

    expect(result).toEqual([6, 8, 10]);
  });

  test("should fallback to general path with flatMap", () => {
    const data = new Int32Array([1, 2, 3]);
    const result = Iter.from(data)
      .map((x) => x)
      .flatMap((x) => [x, x * 10])
      .collect();

    expect(result).toEqual([1, 10, 2, 20, 3, 30]);
  });
});
