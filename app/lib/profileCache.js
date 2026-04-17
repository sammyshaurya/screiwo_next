"use client";

const PROFILE_CACHE_PREFIX = "screiwo:profile:";
const PUBLIC_PROFILE_CACHE_PREFIX = "screiwo:public-profile:";
const DEFAULT_TTL_MS = 10 * 60 * 1000;

const memoryCache = new Map();
const listeners = new Map();

function safeStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

function isPlainObject(value) {
  return value && typeof value === "object" && !Array.isArray(value);
}

function normalizeEntry(entry) {
  if (!isPlainObject(entry)) {
    return null;
  }

  if (entry.data !== undefined) {
    return {
      version: entry.version || 1,
      cachedAt: entry.cachedAt || Date.now(),
      updatedAt: entry.updatedAt || entry.cachedAt || Date.now(),
      ttlMs: entry.ttlMs || DEFAULT_TTL_MS,
      data: entry.data,
    };
  }

  return {
    version: 1,
    cachedAt: entry.cachedAt || Date.now(),
    updatedAt: entry.updatedAt || entry.cachedAt || Date.now(),
    ttlMs: entry.ttlMs || DEFAULT_TTL_MS,
    data: entry,
  };
}

function cacheKey(prefix, value) {
  return `${prefix}${value}`;
}

function readStoredEntry(key) {
  const storage = safeStorage();
  if (!storage) {
    return null;
  }

  try {
    const raw = storage.getItem(key);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);
    const entry = normalizeEntry(parsed);
    if (!entry) {
      storage.removeItem(key);
      return null;
    }

    return entry;
  } catch (error) {
    console.error("Failed to read profile cache:", error);
    storage.removeItem(key);
    return null;
  }
}

function setStoredEntry(key, entry) {
  const storage = safeStorage();
  if (!storage) {
    return;
  }

  try {
    storage.setItem(key, JSON.stringify(entry));
  } catch (error) {
    console.error("Failed to write profile cache:", error);
  }
}

function removeStoredEntry(key) {
  const storage = safeStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(key);
}

function notify(key, entry) {
  const subscribers = listeners.get(key);
  if (!subscribers || subscribers.size === 0) {
    return;
  }

  subscribers.forEach((listener) => {
    try {
      listener(entry?.data || null, entry || null);
    } catch (error) {
      console.error("Profile cache subscriber failed:", error);
    }
  });
}

function setMemoryEntry(key, entry) {
  if (entry) {
    memoryCache.set(key, entry);
  } else {
    memoryCache.delete(key);
  }
}

function getEntry(key) {
  if (memoryCache.has(key)) {
    return memoryCache.get(key);
  }

  const entry = readStoredEntry(key);
  if (entry) {
    memoryCache.set(key, entry);
  }

  return entry;
}

function setEntry(key, data, { ttlMs = DEFAULT_TTL_MS } = {}) {
  const entry = {
    version: 1,
    cachedAt: Date.now(),
    updatedAt: Date.now(),
    ttlMs,
    data,
  };

  setMemoryEntry(key, entry);
  setStoredEntry(key, entry);
  notify(key, entry);
  return entry;
}

function clearEntry(key) {
  setMemoryEntry(key, null);
  removeStoredEntry(key);
  notify(key, null);
}

function subscribeKey(key, callback) {
  if (!listeners.has(key)) {
    listeners.set(key, new Set());
  }

  const bucket = listeners.get(key);
  bucket.add(callback);

  return () => {
    const currentBucket = listeners.get(key);
    if (!currentBucket) {
      return;
    }

    currentBucket.delete(callback);
    if (currentBucket.size === 0) {
      listeners.delete(key);
    }
  };
}

function isFresh(entry, ttlMs = DEFAULT_TTL_MS) {
  if (!entry) {
    return false;
  }

  return Date.now() - (entry.cachedAt || 0) < (entry.ttlMs || ttlMs);
}

function replaceCachedPost(posts = [], post) {
  const nextPosts = Array.isArray(posts) ? [...posts] : [];
  const postId = post?._id?.toString?.() || post?._id;

  if (!postId) {
    return nextPosts;
  }

  const index = nextPosts.findIndex((item) => item?._id?.toString?.() === postId);
  if (index >= 0) {
    nextPosts[index] = post;
    return nextPosts;
  }

  nextPosts.unshift(post);
  return nextPosts;
}

function installStorageListener() {
  if (typeof window === "undefined") {
    return;
  }

  if (window.__screiwoProfileCacheListenerInstalled) {
    return;
  }

  window.__screiwoProfileCacheListenerInstalled = true;

  window.addEventListener("storage", (event) => {
    if (!event.key) {
      return;
    }

    if (
      !event.key.startsWith(PROFILE_CACHE_PREFIX) &&
      !event.key.startsWith(PUBLIC_PROFILE_CACHE_PREFIX)
    ) {
      return;
    }

    if (event.newValue === null) {
      memoryCache.delete(event.key);
      notify(event.key, null);
      return;
    }

    try {
      const parsed = normalizeEntry(JSON.parse(event.newValue));
      if (!parsed) {
        return;
      }

      memoryCache.set(event.key, parsed);
      notify(event.key, parsed);
    } catch (error) {
      console.error("Failed to sync profile cache:", error);
    }
  });
}

installStorageListener();

export function getOwnProfileCacheEntry(userId) {
  if (!userId) {
    return null;
  }

  return getEntry(cacheKey(PROFILE_CACHE_PREFIX, userId));
}

export function getOwnProfileCache(userId) {
  return getOwnProfileCacheEntry(userId)?.data || null;
}

export function setOwnProfileCache(userId, data, options = {}) {
  if (!userId) {
    return null;
  }

  return setEntry(cacheKey(PROFILE_CACHE_PREFIX, userId), data, options);
}

export function updateOwnProfileCache(userId, updater, options = {}) {
  if (!userId || typeof updater !== "function") {
    return null;
  }

  const current = getOwnProfileCache(userId);
  const next = updater(current);
  if (!next) {
    return null;
  }

  return setOwnProfileCache(userId, next, options);
}

export function subscribeOwnProfileCache(userId, callback) {
  if (!userId || typeof callback !== "function") {
    return () => {};
  }

  return subscribeKey(cacheKey(PROFILE_CACHE_PREFIX, userId), callback);
}

export function isOwnProfileCacheFresh(userId, ttlMs = DEFAULT_TTL_MS) {
  return isFresh(getOwnProfileCacheEntry(userId), ttlMs);
}

export function clearOwnProfileCache(userId) {
  if (userId) {
    clearEntry(cacheKey(PROFILE_CACHE_PREFIX, userId));
    return;
  }

  Array.from(memoryCache.keys())
    .filter((key) => key.startsWith(PROFILE_CACHE_PREFIX))
    .forEach((key) => clearEntry(key));
}

export function getPublicProfileCacheEntry(username) {
  if (!username) {
    return null;
  }

  return getEntry(cacheKey(PUBLIC_PROFILE_CACHE_PREFIX, username));
}

export function getPublicProfileCache(username) {
  return getPublicProfileCacheEntry(username)?.data || null;
}

export function setPublicProfileCache(username, data, options = {}) {
  if (!username) {
    return null;
  }

  return setEntry(cacheKey(PUBLIC_PROFILE_CACHE_PREFIX, username), data, options);
}

export function updatePublicProfileCache(username, updater, options = {}) {
  if (!username || typeof updater !== "function") {
    return null;
  }

  const current = getPublicProfileCache(username);
  const next = updater(current);
  if (!next) {
    return null;
  }

  return setPublicProfileCache(username, next, options);
}

export function syncProfilePostInCaches(profile = {}, post = null) {
  if (!profile || !post) {
    return;
  }

  if (profile.userid) {
    updateOwnProfileCache(profile.userid, (cached) => {
      if (!cached) {
        return cached;
      }

      return {
        ...cached,
        profile: {
          ...(cached.profile || {}),
          ...profile,
        },
        posts: replaceCachedPost(cached.posts, post),
      };
    });
  }

  if (profile.username) {
    updatePublicProfileCache(profile.username, (cached) => {
      if (!cached) {
        return cached;
      }

      return {
        ...cached,
        userProfile: {
          ...(cached.userProfile || {}),
          ...profile,
        },
        posts: replaceCachedPost(cached.posts, post),
      };
    });
  }
}

export function subscribePublicProfileCache(username, callback) {
  if (!username || typeof callback !== "function") {
    return () => {};
  }

  return subscribeKey(cacheKey(PUBLIC_PROFILE_CACHE_PREFIX, username), callback);
}

export function isPublicProfileCacheFresh(username, ttlMs = DEFAULT_TTL_MS) {
  return isFresh(getPublicProfileCacheEntry(username), ttlMs);
}

export function clearPublicProfileCache(username) {
  if (username) {
    clearEntry(cacheKey(PUBLIC_PROFILE_CACHE_PREFIX, username));
    return;
  }

  Array.from(memoryCache.keys())
    .filter((key) => key.startsWith(PUBLIC_PROFILE_CACHE_PREFIX))
    .forEach((key) => clearEntry(key));
}

export function clearProfileCaches() {
  clearOwnProfileCache();
  clearPublicProfileCache();
}

export function clearProfileCacheForProfile(profile = {}) {
  if (profile?.userid) {
    clearOwnProfileCache(profile.userid);
  }

  if (profile?.username) {
    clearPublicProfileCache(profile.username);
  }
}
