import { describe, expect, it, beforeEach } from "vitest";
import { createLocalStorageAdapter } from "./localStorageAdapter";

const storage = new Map<string, string>();
const localStorageMock: Storage = {
  getItem: (key) => storage.get(key) ?? null,
  setItem: (key, value) => { storage.set(key, value); },
  removeItem: (key) => { storage.delete(key); },
  clear: () => { storage.clear(); },
  key: (index) => [...storage.keys()][index] ?? null,
  get length() { return storage.size; },
};

describe("localStorage adapter", () => {
  beforeEach(() => storage.clear());

  it("saves, loads and removes validated values", () => {
    Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: localStorageMock } });
    const adapter = createLocalStorageAdapter<number[]>({ key: "numbers", isValue: (value): value is number[] => Array.isArray(value) && value.every((item) => typeof item === "number") });
    expect(adapter.save([1, 2])).toBe(true);
    expect(adapter.load()).toEqual([1, 2]);
    expect(adapter.remove()).toBe(true);
    expect(adapter.load()).toBeNull();
  });

  it("returns null for malformed or invalid data", () => {
    Object.defineProperty(globalThis, "window", { configurable: true, value: { localStorage: localStorageMock } });
    storage.set("numbers", "not-json");
    const adapter = createLocalStorageAdapter<number[]>({ key: "numbers", isValue: Array.isArray });
    expect(adapter.load()).toBeNull();
    storage.set("numbers", JSON.stringify({ value: 1 }));
    expect(adapter.load()).toBeNull();
  });
});
