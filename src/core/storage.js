/* Preset persistence: window.storage when available, else localStorage. */

const PRESET_KEY = "primevisuals:presets";

export async function loadPresets() {
  if (typeof window === "undefined") return null;
  if (window.storage?.get) return window.storage.get(PRESET_KEY);
  if (window.localStorage) {
    const value = window.localStorage.getItem(PRESET_KEY);
    return value ? { value } : null;
  }
  throw new Error("persistent storage unavailable");
}

export async function savePresets(list) {
  const value = JSON.stringify(list);
  if (typeof window === "undefined") return;
  if (window.storage?.set) {
    await window.storage.set(PRESET_KEY, value);
    return;
  }
  if (window.localStorage) {
    window.localStorage.setItem(PRESET_KEY, value);
    return;
  }
  throw new Error("persistent storage unavailable");
}
