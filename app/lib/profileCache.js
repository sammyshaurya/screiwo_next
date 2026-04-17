"use client";

const PROFILE_CACHE_PREFIX = "screiwo:profile:";
const PUBLIC_PROFILE_CACHE_PREFIX = "screiwo:public-profile:";

function safeStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function readCache(key) {
  const storage = safeStorage();
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return null;
    }

    return JSON.parse(raw).data || null;
  } catch (error) {
    console.error("Failed to read profile cache:", error);
    storage.removeItem(key);
    return null;
  }
}

function writeCache(key, data) {
  const storage = safeStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(
      key,
      JSON.stringify({
        cachedAt: Date.now(),
        data,
      })
    );
  } catch (error) {
    console.error("Failed to write profile cache:", error);
  }
}

function removeByPrefix(prefix) {
  const storage = safeStorage();
  if (!storage) {
    return;
  }

  Object.keys(storage)
    .filter((key) => key.startsWith(prefix))
    .forEach((key) => storage.removeItem(key));
}

export function getOwnProfileCache(userId) {
  if (!userId) {
    return null;
  }

  return readCache(`${PROFILE_CACHE_PREFIX}${userId}`);
}

export function setOwnProfileCache(userId, data) {
  if (!userId) {
    return;
  }

  writeCache(`${PROFILE_CACHE_PREFIX}${userId}`, data);
}

export function clearOwnProfileCache(userId) {
  const storage = safeStorage();
  if (!storage) {
    return;
  }

  if (userId) {
    storage.removeItem(`${PROFILE_CACHE_PREFIX}${userId}`);
    return;
  }

  removeByPrefix(PROFILE_CACHE_PREFIX);
}

export function getPublicProfileCache(username) {
  if (!username) {
    return null;
  }

  return readCache(`${PUBLIC_PROFILE_CACHE_PREFIX}${username}`);
}

export function setPublicProfileCache(username, data) {
  if (!username) {
    return;
  }

  writeCache(`${PUBLIC_PROFILE_CACHE_PREFIX}${username}`, data);
}

export function clearPublicProfileCache(username) {
  const storage = safeStorage();
  if (!storage) {
    return;
  }

  if (username) {
    storage.removeItem(`${PUBLIC_PROFILE_CACHE_PREFIX}${username}`);
    return;
  }

  removeByPrefix(PUBLIC_PROFILE_CACHE_PREFIX);
}

export function clearProfileCaches() {
  clearOwnProfileCache();
  clearPublicProfileCache();
}
