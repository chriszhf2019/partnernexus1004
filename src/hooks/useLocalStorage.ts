import { useState, useEffect } from "react";

export function useLocalStorage<T>(key: string, initialValue: T | (() => T)) {
  const [value, setValue] = useState<T>(() => {
    try {
      const saved = localStorage.getItem(key);
      if (saved !== null) {
        return JSON.parse(saved) as T;
      }
    } catch (e) {
      console.error(`useLocalStorage: Failed to parse "${key}"`, e);
    }
    return typeof initialValue === "function"
      ? (initialValue as () => T)()
      : initialValue;
  });

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`useLocalStorage: Failed to save "${key}"`, e);
    }
  }, [key, value]);

  return [value, setValue] as const;
}
