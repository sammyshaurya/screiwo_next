export function normalizeUsername(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : value;
}

export function createUsernameRegex(value) {
  const normalized = normalizeUsername(value);
  if (!normalized) {
    return null;
  }

  const escaped = normalized.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  return new RegExp(`^${escaped}$`, "i");
}
