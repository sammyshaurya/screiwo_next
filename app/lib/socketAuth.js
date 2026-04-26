import crypto from "crypto";

const DEFAULT_TTL_MS = 10 * 60 * 1000;

function getSocketSecret() {
  return (
    process.env.SOCKET_AUTH_SECRET ||
    process.env.CLERK_SECRET_KEY ||
    process.env.NEXTAUTH_SECRET ||
    null
  );
}

function base64UrlEncode(value) {
  return Buffer.from(value).toString("base64url");
}

function base64UrlDecode(value) {
  return Buffer.from(value, "base64url").toString("utf8");
}

function sign(value, secret) {
  return crypto.createHmac("sha256", secret).update(value).digest("base64url");
}

export function createSocketToken({ userId, ttlMs = DEFAULT_TTL_MS }) {
  const secret = getSocketSecret();
  if (!secret) {
    throw new Error("Missing SOCKET_AUTH_SECRET or CLERK_SECRET_KEY");
  }

  const payload = {
    userId,
    exp: Date.now() + ttlMs,
    nonce: crypto.randomUUID(),
  };

  const encoded = base64UrlEncode(JSON.stringify(payload));
  const signature = sign(encoded, secret);

  return `${encoded}.${signature}`;
}

export function verifySocketToken(token) {
  const secret = getSocketSecret();
  if (!secret || !token || typeof token !== "string") {
    return null;
  }

  const [encoded, signature] = token.split(".");
  if (!encoded || !signature) {
    return null;
  }

  const expectedSignature = sign(encoded, secret);
  const signatureBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(expectedSignature);

  if (
    signatureBuffer.length !== expectedBuffer.length ||
    !crypto.timingSafeEqual(signatureBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(encoded));
    if (!payload?.userId || !payload?.exp || Date.now() > payload.exp) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}
