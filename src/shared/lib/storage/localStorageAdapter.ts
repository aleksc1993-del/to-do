export interface StorageAdapter<Value> {
  readonly load: () => Value | null;
  readonly save: (value: Value) => boolean;
  readonly remove: () => boolean;
}

interface LocalStorageAdapterOptions<Value> {
  readonly key: string;
  readonly isValue: (value: unknown) => value is Value;
}

/** Безопасная типизированная обёртка над localStorage. */
export function createLocalStorageAdapter<Value>({ key, isValue }: LocalStorageAdapterOptions<Value>): StorageAdapter<Value> {
  return {
    load: () => {
      try {
        const rawValue = window.localStorage.getItem(key);
        if (rawValue === null) return null;
        const parsedValue: unknown = JSON.parse(rawValue);
        return isValue(parsedValue) ? parsedValue : null;
      } catch {
        return null;
      }
    },
    save: (value) => {
      try {
        window.localStorage.setItem(key, JSON.stringify(value));
        return true;
      } catch {
        return false;
      }
    },
    remove: () => {
      try {
        window.localStorage.removeItem(key);
        return true;
      } catch {
        return false;
      }
    },
  };
}
