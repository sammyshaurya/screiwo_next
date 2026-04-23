"use client";

const HISTORY_KEY = "screiwo:recently-read";
const MAX_ITEMS = 6;

function safeStorage() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage;
}

export function getRecentlyViewedPosts() {
  const storage = safeStorage();
  if (!storage) {
    return [];
  }

  try {
    const raw = storage.getItem(HISTORY_KEY);
    const items = raw ? JSON.parse(raw) : [];
    return Array.isArray(items) ? items : [];
  } catch (error) {
    console.error("Failed to read reading history:", error);
    return [];
  }
}

export function recordRecentlyViewedPost(post = {}) {
  const storage = safeStorage();
  if (!storage || !post?._id) {
    return;
  }

  try {
    const nextItem = {
      _id: post._id,
      title: post.title || "Untitled post",
      excerpt: post.excerpt || post.contentText || "",
      coverImageUrl: post.coverImageUrl || null,
      username: post.author?.username || post.username || null,
      profileImageUrl: post.author?.profileImageUrl || post.profileImageUrl || null,
      readsAt: Date.now(),
      DateofCreation: post.DateofCreation || post.createdAt || null,
    };

    const current = getRecentlyViewedPosts().filter((item) => item?._id !== post._id);
    const next = [nextItem, ...current].slice(0, MAX_ITEMS);
    storage.setItem(HISTORY_KEY, JSON.stringify(next));
  } catch (error) {
    console.error("Failed to persist reading history:", error);
  }
}

export function clearRecentlyViewedPosts() {
  const storage = safeStorage();
  if (!storage) {
    return;
  }

  storage.removeItem(HISTORY_KEY);
}
