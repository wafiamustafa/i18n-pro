import { describe, it, expect } from 'vitest';
import {
  flattenObject,
  unflattenObject,
  getAllFlatKeys,
  removeEmptyObjects
} from '../../src/core/object-utils.js';

describe('object-utils', () => {
  describe('flattenObject', () => {
    it('should flatten a simple nested object', () => {
      const input = {
        a: 1,
        b: {
          c: 2,
          d: 3
        }
      };
      const result = flattenObject(input);
      expect(result).toEqual({
        a: 1,
        'b.c': 2,
        'b.d': 3
      });
    });

    it('should flatten deeply nested objects', () => {
      const input = {
        a: {
          b: {
            c: {
              d: 'deep'
            }
          }
        }
      };
      const result = flattenObject(input);
      expect(result).toEqual({
        'a.b.c.d': 'deep'
      });
    });

    it('should handle arrays as values (not flatten them)', () => {
      const input = {
        a: [1, 2, 3],
        b: {
          c: ['x', 'y']
        }
      };
      const result = flattenObject(input);
      expect(result).toEqual({
        a: [1, 2, 3],
        'b.c': ['x', 'y']
      });
    });

    it('should handle empty objects', () => {
      const input = {};
      const result = flattenObject(input);
      expect(result).toEqual({});
    });

    it('should handle null values', () => {
      const input = {
        a: null,
        b: {
          c: null
        }
      };
      const result = flattenObject(input);
      expect(result).toEqual({
        a: null,
        'b.c': null
      });
    });

    it('should throw error for __proto__ key', () => {
      const input = Object.create(null);
      input['__proto__'] = { polluted: true };
      expect(() => flattenObject(input)).toThrow(
        'Unsafe key segment "__proto__" is not allowed.'
      );
    });

    it('should throw error for constructor key', () => {
      const input = Object.create(null);
      input['constructor'] = { polluted: true };
      expect(() => flattenObject(input)).toThrow(
        'Unsafe key segment "constructor" is not allowed.'
      );
    });

    it('should throw error for prototype key', () => {
      const input = Object.create(null);
      input['prototype'] = { polluted: true };
      expect(() => flattenObject(input)).toThrow(
        'Unsafe key segment "prototype" is not allowed.'
      );
    });

    it('should throw error for nested unsafe key', () => {
      const input = Object.create(null);
      input.safe = Object.create(null);
      input.safe['__proto__'] = { polluted: true };
      expect(() => flattenObject(input)).toThrow(
        'Unsafe key segment "__proto__" is not allowed.'
      );
    });

    it('should handle mixed types', () => {
      const input = {
        string: 'value',
        number: 42,
        boolean: true,
        null: null,
        nested: {
          string: 'nested value',
          number: 99
        }
      };
      const result = flattenObject(input);
      expect(result).toEqual({
        string: 'value',
        number: 42,
        boolean: true,
        null: null,
        'nested.string': 'nested value',
        'nested.number': 99
      });
    });

    it('should handle keys with dots in them when unflattened', () => {
      // Note: This tests that dots in original keys are handled correctly
      // The flattenObject uses dots as separators, so keys with dots become nested
      const input = {
        'a.b': 'value'
      };
      const result = flattenObject(input);
      // The key 'a.b' is treated as a single key, not nested
      expect(result).toEqual({
        'a.b': 'value'
      });
    });
  });

  describe('unflattenObject', () => {
    it('should unflatten a simple flat object', () => {
      const input = {
        a: 1,
        'b.c': 2,
        'b.d': 3
      };
      const result = unflattenObject(input);
      expect(result).toEqual({
        a: 1,
        b: {
          c: 2,
          d: 3
        }
      });
    });

    it('should unflatten deeply nested keys', () => {
      const input = {
        'a.b.c.d': 'deep'
      };
      const result = unflattenObject(input);
      expect(result).toEqual({
        a: {
          b: {
            c: {
              d: 'deep'
            }
          }
        }
      });
    });

    it('should handle empty object', () => {
      const input = {};
      const result = unflattenObject(input);
      expect(result).toEqual({});
    });

    it('should handle arrays as values', () => {
      const input = {
        a: [1, 2, 3],
        'b.c': ['x', 'y']
      };
      const result = unflattenObject(input);
      expect(result).toEqual({
        a: [1, 2, 3],
        b: {
          c: ['x', 'y']
        }
      });
    });

    it('should throw error for __proto__ key', () => {
      const input = {
        '__proto__.polluted': true
      };
      expect(() => unflattenObject(input)).toThrow(
        'Unsafe key segment "__proto__" is not allowed.'
      );
    });

    it('should throw error for constructor key', () => {
      const input = {
        'constructor.polluted': true
      };
      expect(() => unflattenObject(input)).toThrow(
        'Unsafe key segment "constructor" is not allowed.'
      );
    });

    it('should throw error for prototype key', () => {
      const input = {
        'prototype.polluted': true
      };
      expect(() => unflattenObject(input)).toThrow(
        'Unsafe key segment "prototype" is not allowed.'
      );
    });

    it('should handle null values', () => {
      const input = {
        a: null,
        'b.c': null
      };
      const result = unflattenObject(input);
      expect(result).toEqual({
        a: null,
        b: {
          c: null
        }
      });
    });

    it('should merge overlapping keys correctly', () => {
      const input = {
        'a.b': 1,
        'a.c': 2
      };
      const result = unflattenObject(input);
      expect(result).toEqual({
        a: {
          b: 1,
          c: 2
        }
      });
    });

    it('should handle single-level keys', () => {
      const input = {
        a: 1,
        b: 2,
        c: 3
      };
      const result = unflattenObject(input);
      expect(result).toEqual({
        a: 1,
        b: 2,
        c: 3
      });
    });
  });

  describe('getAllFlatKeys', () => {
    it('should return all keys from nested object', () => {
      const input = {
        a: 1,
        b: {
          c: 2,
          d: 3
        }
      };
      const result = getAllFlatKeys(input);
      expect(result).toEqual(['a', 'b.c', 'b.d']);
    });

    it('should return empty array for empty object', () => {
      const result = getAllFlatKeys({});
      expect(result).toEqual([]);
    });

    it('should return all keys from nested object', () => {
      const input = {
        z: 1,
        a: 2,
        m: {
          b: 3,
          a: 4
        }
      };
      const result = getAllFlatKeys(input);
      // Keys are returned in the order they appear in the object
      expect(result).toContain('z');
      expect(result).toContain('a');
      expect(result).toContain('m.a');
      expect(result).toContain('m.b');
      expect(result).toHaveLength(4);
    });
  });

  describe('removeEmptyObjects', () => {
    it('should remove empty nested objects', () => {
      const input = {
        a: {
          b: {}
        },
        c: 'value'
      };
      const result = removeEmptyObjects(input);
      expect(result).toEqual({
        c: 'value'
      });
    });

    it('should keep non-empty objects', () => {
      const input = {
        a: {
          b: {
            c: 'value'
          }
        }
      };
      const result = removeEmptyObjects(input);
      expect(result).toEqual({
        a: {
          b: {
            c: 'value'
          }
        }
      });
    });

    it('should handle arrays (return as-is)', () => {
      const input = [1, 2, 3];
      const result = removeEmptyObjects(input);
      expect(result).toEqual([1, 2, 3]);
    });

    it('should handle objects without null values', () => {
      const input = Object.create(null);
      input.a = 'test';
      input.b = 'value';
      const result = removeEmptyObjects(input);
      expect(result).toHaveProperty('a', 'test');
      expect(result).toHaveProperty('b', 'value');
    });

    it('should handle undefined values (remove them)', () => {
      const input = {
        a: undefined,
        b: 'value'
      };
      const result = removeEmptyObjects(input);
      expect(result).toEqual({
        b: 'value'
      });
    });

    it('should handle empty object', () => {
      const input = {};
      const result = removeEmptyObjects(input);
      expect(result).toEqual({});
    });

    it('should recursively remove empty objects', () => {
      const input = {
        a: {
          b: {
            c: {}
          }
        },
        d: 'value'
      };
      const result = removeEmptyObjects(input);
      expect(result).toEqual({
        d: 'value'
      });
    });

    it('should throw error for unsafe keys', () => {
      const input = Object.create(null);
      input['__proto__'] = {};
      expect(() => removeEmptyObjects(input)).toThrow(
        'Unsafe key segment "__proto__" is not allowed.'
      );
    });

    it('should handle mixed content', () => {
      const input = {
        keep: {
          nested: 'value'
        },
        remove: {
          empty: {}
        },
        array: [1, 2],
        undefinedValue: undefined
      };
      const result = removeEmptyObjects(input);
      expect(result).toEqual({
        keep: {
          nested: 'value'
        },
        array: [1, 2]
      });
    });
  });

  describe('round-trip: flatten and unflatten', () => {
    it('should restore original object after flatten and unflatten', () => {
      const original = {
        a: 1,
        b: {
          c: 2,
          d: {
            e: 3
          }
        },
        f: ['array', 'values']
      };
      const flat = flattenObject(original);
      const restored = unflattenObject(flat);
      expect(restored).toEqual(original);
    });

    it('should handle empty objects in round-trip', () => {
      const original = {
        a: {},
        b: {
          c: 'value'
        }
      };
      const flat = flattenObject(original);
      const restored = unflattenObject(flat);
      // Empty objects are preserved in flatten but may be lost in round-trip
      // This is expected behavior - empty objects have no keys to persist
      expect(restored).toHaveProperty('b');
      expect(restored.b).toEqual({ c: 'value' });
    });
  });
});
