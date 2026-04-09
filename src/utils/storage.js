function getLocalStorage() {
  return globalThis?.localStorage || null;
}

export function getStorageValue(key, fallback = null) {
  try {
    const storage = getLocalStorage();
    if (!storage) return fallback;
    const value = storage.getItem(key);
    return value ?? fallback;
  } catch {
    return fallback;
  }
}

export function getStorageJSON(key, fallback = null) {
  const raw = getStorageValue(key, null);
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

export function setStorageValue(key, value) {
  try {
    const storage = getLocalStorage();
    if (!storage) return false;
    storage.setItem(key, String(value));
    return true;
  } catch {
    return false;
  }
}

export function setStorageJSON(key, value) {
  try {
    return setStorageValue(key, JSON.stringify(value));
  } catch {
    return false;
  }
}

export function removeStorageValue(key) {
  try {
    const storage = getLocalStorage();
    if (!storage) return false;
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}
