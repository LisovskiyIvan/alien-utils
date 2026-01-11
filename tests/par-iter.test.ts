import { ParIter } from '../src/package/iterator/par-iter';
import { Iter } from '../src/package/iterator/iterator';

describe('ParIter', () => {
  describe('creation', () => {
    it('should create ParIter from array', () => {
      const parIter = ParIter.from([1, 2, 3, 4, 5]);
      expect(parIter).toBeDefined();
    });

    it('should create ParIter with custom config', () => {
      const parIter = ParIter.from([1, 2, 3, 4, 5], { workers: 2, chunkSize: 1000 });
      expect(parIter).toBeDefined();
    });
  });

  describe('map operation', () => {
    it('should map values correctly', async () => {
      const result = await ParIter.from([1, 2, 3, 4, 5])
        .map(x => x * 2)
        .collect();
      
      expect(result.sort()).toEqual([2, 4, 6, 8, 10].sort());
    });

    it('should handle large arrays with mapping', async () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => i);
      const result = await ParIter.from(largeArray)
        .map(x => x * 2)
        .collect();
      
      expect(result.length).toBe(10000);
      expect(result[0]).toBe(0);
      expect(result[9999]).toBe(19998);
    });
  });

  describe('filter operation', () => {
    it('should filter values correctly', async () => {
      const result = await ParIter.from([1, 2, 3, 4, 5, 6])
        .filter(x => x % 2 === 0)
        .collect();
      
      expect(result.sort()).toEqual([2, 4, 6].sort());
    });

    it('should handle filtering with large arrays', async () => {
      const largeArray = Array.from({ length: 10000 }, (_, i) => i);
      const result = await ParIter.from(largeArray)
        .filter(x => x % 2 === 0)
        .collect();
      
      expect(result.length).toBe(5000);
    });
  });

  describe('chaining operations', () => {
    it('should chain map and filter operations', async () => {
      const result = await ParIter.from([1, 2, 3, 4, 5, 6, 7, 8, 9, 10])
        .map(x => x * 2)
        .filter(x => x > 10)
        .collect();
      
      expect(result.sort()).toEqual([12, 14, 16, 18, 20].sort());
    });
  });

  describe('reduction operations', () => {
    it('should calculate sum correctly', async () => {
      const result = await ParIter.from([1, 2, 3, 4, 5])
        .sum();
      
      expect(result).toBe(15);
    });

    it('should calculate count correctly', async () => {
      const result = await ParIter.from([1, 2, 3, 4, 5])
        .filter(x => x > 2)
        .count();
      
      expect(result).toBe(3);
    });

    it('should perform reduce operation correctly', async () => {
      const result = await ParIter.from([1, 2, 3, 4, 5])
        .reduce((acc, val) => acc + val, 0);
      
      expect(result).toBe(15);
    });

    it('should perform reduce with multiplication', async () => {
      const result = await ParIter.from([1, 2, 3, 4])
        .reduce((acc, val) => acc * val, 1);
      
      expect(result).toBe(24);
    });
  });

  describe('integration with Iter', () => {
    it('should work with data from Iter by collecting first', async () => {
      const iterData = Iter.from([1, 2, 3, 4, 5])
        .map(x => x * 2)
        .filter(x => x > 4)
        .collect();

      const result = await ParIter.from(iterData)
        .collect();

      expect(result.sort()).toEqual([6, 8, 10].sort());
    });
  });

  describe('safety checks', () => {
    it('should throw error when using take operation', () => {
      expect(() => {
        ParIter.from([1, 2, 3]).take(2);
      }).toThrow('take operation cannot be parallelized');
    });

    it('should throw error when using takeWhile operation', () => {
      expect(() => {
        ParIter.from([1, 2, 3]).takeWhile(x => x < 3);
      }).toThrow('takeWhile operation cannot be parallelized');
    });

    it('should throw error when using find operation', () => {
      expect(() => {
        ParIter.from([1, 2, 3]).find(x => x === 2);
      }).toThrow('find operation cannot be parallelized');
    });

    it('should throw error when using inspect without allowSideEffects', () => {
      expect(() => {
        ParIter.from([1, 2, 3]).inspect(console.log);
      }).toThrow('inspect operation is not allowed when allowSideEffects is false');
    });

    it('should allow inspect when allowSideEffects is true', () => {
      expect(() => {
        ParIter.from([1, 2, 3], { allowSideEffects: true }).inspect(console.log);
      }).not.toThrow();
    });
  });

  describe('configuration options', () => {
    it('should work with custom worker count', async () => {
      const result = await ParIter.from([1, 2, 3, 4, 5], { workers: 2 })
        .map(x => x * 2)
        .collect();
      
      expect(result.sort()).toEqual([2, 4, 6, 8, 10].sort());
    });

    it('should work with custom chunk size', async () => {
      const result = await ParIter.from([1, 2, 3, 4, 5], { chunkSize: 2 })
        .map(x => x * 2)
        .collect();
      
      expect(result.sort()).toEqual([2, 4, 6, 8, 10].sort());
    });
  });
});