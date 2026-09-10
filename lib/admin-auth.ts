import { createHmac, timingSafeEqual } from "crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "ste_admin_session";

function getSecret() {
  const secret = process.env.ADMIN_SESSION_SECRET;

  if (!secret) {
    throw new Error("ADMIN_SESSION_SECRET is not configured");
  }

  return secret;
}

function createToken(username: string) {
  const timestamp = Date.now().toString();

  const payload = `${username}.${timestamp}`;

  const signature = createHmac("sha256", getSecret())
    .update(payload)
    .digest("hex");

  return `${payload}.${signature}`;
}

function verifyToken(token: string) {
  try {
    const parts = token.split(".");

    if (parts.length !== 3) {
      return false;
    }

    const [username, timestamp, signature] = parts;

    if (!username || !timestamp || !signature) {
      return false;
    }

    const tokenTime = Number(timestamp);

    if (!Number.isFinite(tokenTime)) {
      return false;
    }

    // Session expires after 12 hours
    const age = Date.now() - tokenTime;

    if (age < 0 || age > 12 * 60 * 60 * 1000) {
      return false;
    }

    const payload = `${username}.${timestamp}`;

    const expectedSignature = createHmac("sha256", getSecret())
      .update(payload)
      .digest("hex");

    const actual = new Uint8Array(Buffer.from(signature));
    const expected = new Uint8Array(Buffer.from(expectedSignature));

    if (actual.length !== expected.length) {
      return false;
    }

    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

export async function createAdminSession(username: string) {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, createToken(username), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 12 * 60 * 60,
    path: "/",
  });
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();

  cookieStore.set(COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "strict",
    maxAge: 0,
    path: "/",
  });
}

export async function isAdminAuthenticated() {
  const cookieStore = await cookies();

  const token = cookieStore.get(COOKIE_NAME)?.value;

  if (!token) {
    return false;
  }

  return verifyToken(token);
}
