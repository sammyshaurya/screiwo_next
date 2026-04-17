"use client";

const UI_PREFS_KEY = "screiwo:ui-preferences";

function safeStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function getUiPreferences() {
  const storage = safeStorage();
  if (!storage) {
    return {};
  }

  try {
    const raw = storage.getItem(UI_PREFS_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch (error) {
    console.error("Failed to read UI preferences:", error);
    return {};
  }
}

export function setUiPreferences(nextPreferences = {}) {
  const storage = safeStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(UI_PREFS_KEY, JSON.stringify(nextPreferences));
  } catch (error) {
    console.error("Failed to write UI preferences:", error);
  }
}

export function clearUiPreferences() {
  const storage = safeStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(UI_PREFS_KEY);
}
