import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { connectdb, disconnectdb } from "../app/lib/db.js";
import Profile from "../app/models/Profile.model.js";
import User from "../app/models/User.model.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function loadEnvLocal() {
  if (process.env.DB_URL) {
    return;
  }

  const envPath = path.resolve(__dirname, "../.env.local");
  if (!fs.existsSync(envPath)) {
    return;
  }

  const contents = fs.readFileSync(envPath, "utf8");
  for (const line of contents.split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const separatorIndex = trimmed.indexOf("=");
    if (separatorIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, separatorIndex).trim();
    let value = trimmed.slice(separatorIndex + 1).trim();

    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }

    if (!process.env[key]) {
      process.env[key] = value;
    }
  }
}

function normalizeUsername(value) {
  return typeof value === "string" ? value.trim().toLowerCase() : value;
}

function groupUsernameCollisions(docs) {
  const collisions = new Map();

  for (const doc of docs) {
    const normalized = normalizeUsername(doc.username);
    if (!normalized) {
      continue;
    }

    if (!collisions.has(normalized)) {
      collisions.set(normalized, []);
    }

    collisions.get(normalized).push({
      _id: doc._id?.toString?.() || String(doc._id),
      username: doc.username,
    });
  }

  return [...collisions.entries()]
    .filter(([, entries]) => entries.length > 1)
    .map(([normalized, entries]) => ({ normalized, entries }));
}

async function preflightCollisions(Model, modelName) {
  const docs = await Model.find(
    { username: { $type: "string" } },
    { username: 1 }
  ).lean();

  const collisions = groupUsernameCollisions(docs);
  if (collisions.length === 0) {
    return;
  }

  console.error(`[${modelName}] Username collisions found after lowercasing:`);
  for (const collision of collisions) {
    console.error(`- ${collision.normalized}`);
    for (const entry of collision.entries) {
      console.error(`  - ${entry._id}: ${entry.username}`);
    }
  }

  throw new Error(
    `[${modelName}] Resolve the duplicate usernames above before running the migration.`
  );
}

async function lowercaseModelUsernames(Model, modelName) {
  const docs = await Model.find(
    {
      username: { $type: "string" },
      $expr: { $ne: ["$username", { $toLower: "$username" }] },
    },
    { username: 1 }
  ).lean();

  let updatedCount = 0;

  for (const doc of docs) {
    const nextUsername = normalizeUsername(doc.username);
    if (!nextUsername || nextUsername === doc.username) {
      continue;
    }

    await Model.updateOne(
      { _id: doc._id },
      { $set: { username: nextUsername } }
    );
    updatedCount += 1;
    console.log(`[${modelName}] ${doc.username} -> ${nextUsername}`);
  }

  return { matched: docs.length, updated: updatedCount };
}

async function main() {
  loadEnvLocal();

  if (!process.env.DB_URL) {
    throw new Error("DB_URL is not set. Add it to your environment or .env.local.");
  }

  await connectdb();

  try {
    console.log("Starting username lowercase migration...");

    await preflightCollisions(Profile, "Profile");
    await preflightCollisions(User, "User");

    const profileResult = await lowercaseModelUsernames(Profile, "Profile");
    const userResult = await lowercaseModelUsernames(User, "User");

    console.log("Migration complete.");
    console.log(
      JSON.stringify(
        {
          profile: profileResult,
          user: userResult,
        },
        null,
        2
      )
    );
  } finally {
    await disconnectdb();
  }
}

main().catch(async (error) => {
  console.error("Username lowercase migration failed:", error);
  try {
    await disconnectdb();
  } catch {
    // Ignore cleanup errors.
  }
  process.exitCode = 1;
});
