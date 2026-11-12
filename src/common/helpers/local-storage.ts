import AsyncStorage from "@react-native-async-storage/async-storage";

// AsyncStorage is async only. The app reads a handful of small values during
// the first render (language, first run, chosen city), so every key is loaded
// into memory once at startup and reads after that are synchronous.

export const StorageKeys = {
  language: "nontonin.language",
  firstRun: "nontonin.first-run-done",
  city: "nontonin.city",
  bookings: "nontonin.bookings",
  locationAsked: "nontonin.location-asked",
  promoSeen: "nontonin.promo-seen",
  preview3d: "nontonin.preview-3d",
} as const;

type Key = (typeof StorageKeys)[keyof typeof StorageKeys];

const cache = new Map<string, string>();

export const localStorage = {
  async hydrate() {
    const keys = Object.values(StorageKeys);
    const pairs = await AsyncStorage.multiGet(keys);
    pairs.forEach(([k, v]) => v != null && cache.set(k, v));
  },
  getItem(key: Key): string | null {
    return cache.get(key) ?? null;
  },
  setItem(key: Key, value: string) {
    cache.set(key, value);
    AsyncStorage.setItem(key, value).catch(() => {});
  },
  removeItem(key: Key) {
    cache.delete(key);
    AsyncStorage.removeItem(key).catch(() => {});
  },
  getJSON<T>(key: Key, fallback: T): T {
    const raw = cache.get(key);
    if (raw == null) return fallback;
    try {
      return JSON.parse(raw) as T;
    } catch {
      return fallback;
    }
  },
  setJSON(key: Key, value: unknown) {
    localStorage.setItem(key, JSON.stringify(value));
  },
  async clearAll() {
    cache.clear();
    await AsyncStorage.multiRemove(Object.values(StorageKeys));
  },
};

export const FirstRun = {
  isFirstRun: () => localStorage.getItem(StorageKeys.firstRun) !== "1",
  done: () => localStorage.setItem(StorageKeys.firstRun, "1"),
};
