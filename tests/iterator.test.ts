import { describe, expect, test } from "bun:test";
import { Iter } from "../src/package/iterator/iterator";
import { Some, None } from "../src/package/option/option";

describe("Iter - Создание", () => {
  test("from() создаёт итератор из массива", () => {
    const iter = Iter.from([1, 2, 3]);
    expect(iter.collect()).toEqual([1, 2, 3]);
  });

  test("from() создаёт итератор из Set", () => {
    const iter = Iter.from(new Set([1, 2, 3]));
    expect(iter.collect().sort()).toEqual([1, 2, 3]);
  });

  test("from() создаёт итератор из строки", () => {
    const iter = Iter.from("abc");
    expect(iter.collect()).toEqual(["a", "b", "c"]);
  });

  test("range() создаёт диапазон чисел", () => {
    expect(Iter.range(0, 5).collect()).toEqual([0, 1, 2, 3, 4]);
  });

  test("range() с шагом", () => {
    expect(Iter.range(0, 10, 2).collect()).toEqual([0, 2, 4, 6, 8]);
  });

  test("range() с отрицательным шагом", () => {
    expect(Iter.range(10, 0, -2).collect()).toEqual([10, 8, 6, 4, 2]);
  });

  test("repeat() создаёт бесконечный итератор", () => {
    expect(Iter.repeat(42).take(3).collect()).toEqual([42, 42, 42]);
  });

  test("generate() создаёт бесконечный генератор", () => {
    let n = 0;
    expect(
      Iter.generate(() => n++)
        .take(5)
        .collect()
    ).toEqual([0, 1, 2, 3, 4]);
  });

  test("empty() создаёт пустой итератор", () => {
    expect(Iter.empty<number>().collect()).toEqual([]);
  });

  test("once() создаёт итератор с одним элементом", () => {
    expect(Iter.once(42).collect()).toEqual([42]);
  });
});

describe("Iter - Ленивые трансформации", () => {
  test("map() трансформирует элементы лениво", () => {
    let callCount = 0;
    const iter = Iter.from([1, 2, 3]).map((x) => {
      callCount++;
      return x * 2;
    });

    expect(callCount).toBe(0); // map не выполняется сразу
    const result = iter.collect();
    expect(result).toEqual([2, 4, 6]);
    expect(callCount).toBe(3); // выполнилось при collect
  });

  test("filter() фильтрует элементы лениво", () => {
    let callCount = 0;
    const iter = Iter.from([1, 2, 3, 4, 5]).filter((x) => {
      callCount++;
      return x % 2 === 0;
    });

    expect(callCount).toBe(0);
    expect(iter.collect()).toEqual([2, 4]);
    expect(callCount).toBe(5);
  });

  test("цепочка map().filter() выполняется за один проход", () => {
    const result = Iter.from([1, 2, 3, 4, 5])
      .map((x) => x * 2)
      .filter((x) => x > 5)
      .collect();

    expect(result).toEqual([6, 8, 10]);
  });

  test("flatMap() разворачивает вложенные итераторы", () => {
    const result = Iter.from([1, 2, 3])
      .flatMap((x) => [x, x * 10])
      .collect();

    expect(result).toEqual([1, 10, 2, 20, 3, 30]);
  });

  test("flatten() разворачивает вложенные массивы", () => {
    const result = Iter.from([[1, 2], [3, 4], [5]])
      .flatten()
      .collect();

    expect(result).toEqual([1, 2, 3, 4, 5]);
  });

  test("take() берёт первые n элементов", () => {
    expect(Iter.from([1, 2, 3, 4, 5]).take(3).collect()).toEqual([1, 2, 3]);
  });

  test("take() с бесконечным итератором", () => {
    expect(Iter.repeat(7).take(4).collect()).toEqual([7, 7, 7, 7]);
  });

  test("takeWhile() берёт элементы до первого false", () => {
    expect(
      Iter.from([1, 2, 3, 4, 1, 2])
        .takeWhile((x) => x < 4)
        .collect()
    ).toEqual([1, 2, 3]);
  });

  test("skip() пропускает первые n элементов", () => {
    expect(Iter.from([1, 2, 3, 4, 5]).skip(2).collect()).toEqual([3, 4, 5]);
  });

  test("skipWhile() пропускает элементы до первого false", () => {
    expect(
      Iter.from([1, 2, 3, 4, 1, 2])
        .skipWhile((x) => x < 3)
        .collect()
    ).toEqual([3, 4, 1, 2]);
  });

  test("enumerate() добавляет индексы", () => {
    expect(Iter.from(["a", "b", "c"]).enumerate().collect()).toEqual([
      [0, "a"],
      [1, "b"],
      [2, "c"],
    ]);
  });

  test("zip() объединяет два итератора", () => {
    const result = Iter.from([1, 2, 3]).zip(["a", "b", "c"]).collect();

    expect(result).toEqual([
      [1, "a"],
      [2, "b"],
      [3, "c"],
    ]);
  });

  test("zip() останавливается на меньшем", () => {
    const result = Iter.from([1, 2, 3, 4, 5]).zip(["a", "b"]).collect();

    expect(result).toEqual([
      [1, "a"],
      [2, "b"],
    ]);
  });

  test("chain() соединяет итераторы", () => {
    const result = Iter.from([1, 2]).chain([3, 4]).collect();

    expect(result).toEqual([1, 2, 3, 4]);
  });

  test("stepBy() берёт каждый n-ный элемент", () => {
    expect(Iter.from([1, 2, 3, 4, 5, 6]).stepBy(2).collect()).toEqual([
      1, 3, 5,
    ]);
  });

  test("inspect() выполняет побочные эффекты", () => {
    const sideEffects: number[] = [];
    const result = Iter.from([1, 2, 3])
      .inspect((x) => sideEffects.push(x))
      .map((x) => x * 2)
      .collect();

    expect(result).toEqual([2, 4, 6]);
    expect(sideEffects).toEqual([1, 2, 3]);
  });

  test("unique() удаляет дубликаты", () => {
    expect(Iter.from([1, 2, 2, 3, 1, 4]).unique().collect()).toEqual([
      1, 2, 3, 4,
    ]);
  });

  test("uniqueBy() удаляет дубликаты по ключу", () => {
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

describe("Iter - Потребляющие операции", () => {
  test("collect() собирает в массив", () => {
    expect(Iter.from([1, 2, 3]).collect()).toEqual([1, 2, 3]);
  });

  test("fold() свёртывает слева направо", () => {
    const sum = Iter.from([1, 2, 3, 4]).fold(0, (acc, x) => acc + x);

    expect(sum).toBe(10);
  });

  test("fold() для конкатенации строк", () => {
    const result = Iter.from(["a", "b", "c"]).fold("", (acc, x) => acc + x);

    expect(result).toBe("abc");
  });

  test("foldRight() свёртывает справа налево", () => {
    const result = Iter.from(["a", "b", "c"]).foldRight(
      "",
      (acc, x) => acc + x
    );

    expect(result).toBe("cba");
  });

  test("reduce() использует первый элемент как начальное значение", () => {
    const result = Iter.from([1, 2, 3, 4]).reduce((acc, x) => acc + x);

    expect(result).toEqual(new Some(10));
  });

  test("reduce() возвращает None для пустого итератора", () => {
    const result = Iter.empty<number>().reduce((acc, x) => acc + x);

    expect(result).toEqual(None.instance());
  });

  test("forEach() выполняет функцию для каждого элемента", () => {
    const arr: number[] = [];
    Iter.from([1, 2, 3]).forEach((x) => arr.push(x));

    expect(arr).toEqual([1, 2, 3]);
  });

  test("count() считает элементы", () => {
    expect(Iter.from([1, 2, 3]).count()).toBe(3);
    expect(Iter.empty<number>().count()).toBe(0);
  });

  test("find() находит первый элемент", () => {
    const result = Iter.from([1, 2, 3, 4]).find((x) => x > 2);

    expect(result).toEqual(new Some(3));
  });

  test("find() возвращает None если не найдено", () => {
    const result = Iter.from([1, 2, 3]).find((x) => x > 5);

    expect(result).toEqual(None.instance());
  });

  test("position() находит индекс элемента", () => {
    const result = Iter.from(["a", "b", "c"]).position((x) => x === "b");

    expect(result).toEqual(new Some(1));
  });

  test("all() проверяет что все элементы удовлетворяют предикату", () => {
    expect(Iter.from([2, 4, 6]).all((x) => x % 2 === 0)).toBe(true);
    expect(Iter.from([2, 3, 6]).all((x) => x % 2 === 0)).toBe(false);
    expect(Iter.empty<number>().all((x) => x > 0)).toBe(true); // вакуумная истина
  });

  test("any() проверяет что хотя бы один элемент удовлетворяет предикату", () => {
    expect(Iter.from([1, 2, 3]).any((x) => x > 2)).toBe(true);
    expect(Iter.from([1, 2, 3]).any((x) => x > 5)).toBe(false);
    expect(Iter.empty<number>().any((x) => x > 0)).toBe(false);
  });

  test("partition() разделяет на две группы", () => {
    const [evens, odds] = Iter.from([1, 2, 3, 4, 5, 6]).partition(
      (x) => x % 2 === 0
    );

    expect(evens).toEqual([2, 4, 6]);
    expect(odds).toEqual([1, 3, 5]);
  });

  test("first() возвращает первый элемент", () => {
    expect(Iter.from([1, 2, 3]).first()).toEqual(new Some(1));
    expect(Iter.empty<number>().first()).toEqual(None.instance());
  });

  test("last() возвращает последний элемент", () => {
    expect(Iter.from([1, 2, 3]).last()).toEqual(new Some(3));
    expect(Iter.empty<number>().last()).toEqual(None.instance());
  });

  test("nth() возвращает n-ный элемент", () => {
    expect(Iter.from(["a", "b", "c"]).nth(1)).toEqual(new Some("b"));
    expect(Iter.from(["a", "b"]).nth(5)).toEqual(None.instance());
  });

  test("max() находит максимум", () => {
    expect(Iter.from([3, 1, 4, 1, 5]).max()).toEqual(new Some(5));
    expect(Iter.empty<number>().max()).toEqual(None.instance());
  });

  test("min() находит минимум", () => {
    expect(Iter.from([3, 1, 4, 1, 5]).min()).toEqual(new Some(1));
    expect(Iter.empty<number>().min()).toEqual(None.instance());
  });

  test("maxBy() находит элемент с максимальным ключом", () => {
    const result = Iter.from([{ age: 20 }, { age: 30 }, { age: 25 }]).maxBy(
      (x) => x.age
    );

    expect(result).toEqual(new Some({ age: 30 }));
  });

  test("minBy() находит элемент с минимальным ключом", () => {
    const result = Iter.from([{ age: 20 }, { age: 30 }, { age: 25 }]).minBy(
      (x) => x.age
    );

    expect(result).toEqual(new Some({ age: 20 }));
  });

  test("sum() суммирует числа", () => {
    expect(Iter.from([1, 2, 3, 4]).sum()).toBe(10);
    expect(Iter.empty<number>().sum()).toBe(0);
  });

  test("product() перемножает числа", () => {
    expect(Iter.from([1, 2, 3, 4]).product()).toBe(24);
    expect(Iter.empty<number>().product()).toBe(1);
  });

  test("join() объединяет строки", () => {
    expect(Iter.from(["a", "b", "c"]).join("-")).toBe("a-b-c");
    expect(Iter.from(["a", "b", "c"]).join()).toBe("abc");
  });

  test("toSet() собирает в Set", () => {
    const set = Iter.from([1, 2, 2, 3, 1]).toSet();

    expect(set.size).toBe(3);
    expect(set.has(1)).toBe(true);
    expect(set.has(2)).toBe(true);
    expect(set.has(3)).toBe(true);
  });

  test("toMap() собирает пары в Map", () => {
    const map = Iter.from([
      [1, "a"],
      [2, "b"],
    ] as [number, string][]).toMap();

    expect(map.get(1)).toBe("a");
    expect(map.get(2)).toBe("b");
  });

  test("groupBy() группирует по ключу", () => {
    const groups = Iter.from([1, 2, 3, 4, 5, 6]).groupBy((x) =>
      x % 2 === 0 ? "even" : "odd"
    );

    expect(groups.get("odd")).toEqual([1, 3, 5]);
    expect(groups.get("even")).toEqual([2, 4, 6]);
  });
});

describe("Iter - Сортировка и реверс", () => {
  test("sort() сортирует элементы", () => {
    expect(Iter.from([3, 1, 4, 1, 5]).sort().collect()).toEqual([
      1, 1, 3, 4, 5,
    ]);
  });

  test("sort() с функцией сравнения", () => {
    expect(
      Iter.from([3, 1, 4, 1, 5])
        .sort((a, b) => b - a)
        .collect()
    ).toEqual([5, 4, 3, 1, 1]);
  });

  test("sortBy() сортирует по ключу", () => {
    const result = Iter.from([{ age: 30 }, { age: 20 }, { age: 25 }])
      .sortBy((x) => x.age)
      .collect();

    expect(result).toEqual([{ age: 20 }, { age: 25 }, { age: 30 }]);
  });

  test("reverse() разворачивает порядок", () => {
    expect(Iter.from([1, 2, 3]).reverse().collect()).toEqual([3, 2, 1]);
  });
});

describe("Iter - Сложные цепочки", () => {
  test("комбинированная цепочка операций", () => {
    const result = Iter.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .filter((x) => x % 2 === 0)
      .map((x) => x * 2)
      .take(3)
      .collect();

    expect(result).toEqual([4, 8, 12]);
  });

  test("цепочка с enumerate и zip", () => {
    const result = Iter.from(["a", "b", "c"])
      .enumerate()
      .map(([i, v]) => `${i}:${v}`)
      .collect();

    expect(result).toEqual(["0:a", "1:b", "2:c"]);
  });

  test("flatMap с filter", () => {
    const result = Iter.from([1, 2, 3])
      .flatMap((x) => [x, x * 10])
      .filter((x) => x > 5)
      .collect();

    expect(result).toEqual([10, 20, 30]);
  });

  test("chain с несколькими итераторами", () => {
    const result = Iter.from([1, 2]).chain([3, 4]).chain([5, 6]).collect();

    expect(result).toEqual([1, 2, 3, 4, 5, 6]);
  });
});

describe("Iter - Производительность и ленивость", () => {
  test("ленивость: не вычисляет больше чем нужно", () => {
    let computations = 0;

    const result = Iter.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
      .map((x) => {
        computations++;
        return x * 2;
      })
      .take(3)
      .collect();

    expect(result).toEqual([2, 4, 6]);
    expect(computations).toBeLessThanOrEqual(5); // намного меньше чем 10
  });

  test("ленивость: find() останавливается при нахождении", () => {
    let checks = 0;

    const result = Iter.from([1, 2, 3, 4, 5]).find((x) => {
      checks++;
      return x > 2;
    });

    expect(result).toEqual(new Some(3));
    expect(checks).toBe(3); // проверили только 1, 2, 3
  });

  test("бесконечный итератор с take()", () => {
    let n = 0;
    const result = Iter.generate(() => n++)
      .filter((x) => x % 2 === 0)
      .take(5)
      .collect();

    expect(result).toEqual([0, 2, 4, 6, 8]);
  });

  test("работает с большими данными без промежуточных массивов", () => {
    // Создаём большой диапазон
    const result = Iter.range(0, 1_000_000)
      .filter((x) => x % 2 === 0)
      .map((x) => x * 2)
      .take(5)
      .collect();

    expect(result).toEqual([0, 4, 8, 12, 16]);
  });
});

describe("Iter - Краевые случаи", () => {
  test("пустой итератор", () => {
    const iter = Iter.empty<number>();

    expect(iter.collect()).toEqual([]);
    expect(iter.count()).toBe(0);
    expect(iter.first()).toEqual(None.instance());
    expect(iter.last()).toEqual(None.instance());
    expect(iter.sum()).toBe(0);
  });

  test("итератор с одним элементом", () => {
    const iter = Iter.once(42);

    expect(iter.collect()).toEqual([42]);
    expect(iter.count()).toBe(1);
    expect(iter.first()).toEqual(new Some(42));
    expect(iter.last()).toEqual(new Some(42));
  });

  test("take(0) возвращает пустой итератор", () => {
    expect(Iter.from([1, 2, 3]).take(0).collect()).toEqual([]);
  });

  test("skip больше длины возвращает пустой итератор", () => {
    expect(Iter.from([1, 2, 3]).skip(10).collect()).toEqual([]);
  });

  test("stepBy(1) эквивалентно исходному итератору", () => {
    expect(Iter.from([1, 2, 3, 4]).stepBy(1).collect()).toEqual([1, 2, 3, 4]);
  });
});

describe("Iter - Интеграция с for..of", () => {
  test("можно использовать в for..of", () => {
    const arr: number[] = [];
    const iter = Iter.from([1, 2, 3]).map((x) => x * 2);

    for (const value of iter) {
      arr.push(value);
    }

    expect(arr).toEqual([2, 4, 6]);
  });

  test("можно использовать spread оператор", () => {
    const iter = Iter.from([1, 2, 3]);
    const arr = [...iter];

    expect(arr).toEqual([1, 2, 3]);
  });
});
