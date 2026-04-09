import { beforeEach, describe, expect, it } from 'vitest';
import {
  getStorageJSON,
  getStorageValue,
  removeStorageValue,
  setStorageJSON,
  setStorageValue,
} from '../utils/storage';

function createStorage() {
  const store = new Map();
  return {
    getItem(key) {
      return store.has(key) ? store.get(key) : null;
    },
    setItem(key, value) {
      store.set(key, String(value));
    },
    removeItem(key) {
      store.delete(key);
    },
  };
}

describe('storage utils', () => {
  beforeEach(() => {
    globalThis.localStorage = createStorage();
  });

  it('reads and writes plain string values safely', () => {
    expect(setStorageValue('theme', 'dark')).toBe(true);
    expect(getStorageValue('theme', 'light')).toBe('dark');
  });

  it('reads and writes JSON values safely', () => {
    expect(setStorageJSON('draft', { mode: 'form', step: 2 })).toBe(true);
    expect(getStorageJSON('draft', null)).toEqual({ mode: 'form', step: 2 });
  });

  it('falls back when JSON is invalid', () => {
    globalThis.localStorage.setItem('draft', '{bad json');
    expect(getStorageJSON('draft', { mode: 'safe' })).toEqual({ mode: 'safe' });
  });

  it('removes values safely', () => {
    setStorageValue('theme', 'dark');
    expect(removeStorageValue('theme')).toBe(true);
    expect(getStorageValue('theme', 'light')).toBe('light');
  });
});
