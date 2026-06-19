import { SignJWT, jwtVerify } from "jose";

export const SESSION_COOKIE_NAME = "sezony_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 180; // 180 дней — лидеры не должны вводить пароль на каждом заходе

function getSecretKey() {
  const secret = process.env.SESSION_SECRET;
  if (!secret) {
    throw new Error("SESSION_SECRET не задан в переменных окружения");
  }
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(): Promise<string> {
  return new SignJWT({ authorized: true })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecretKey());
}

export async function verifySessionToken(token: string): Promise<boolean> {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload.authorized === true;
  } catch {
    return false;
  }
}

export const SESSION_COOKIE_MAX_AGE = SESSION_TTL_SECONDS;
