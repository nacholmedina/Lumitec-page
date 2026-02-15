import { SignJWT, jwtVerify } from 'jose';
import { createHash } from 'crypto';

const secret = () => new TextEncoder().encode(process.env.JWT_SECRET);

export function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

export async function createToken(email) {
  return new SignJWT({ email })
    .setProtectedHeader({ alg: 'HS256' })
    .setExpirationTime('7d')
    .setIssuedAt()
    .sign(secret());
}

export async function verifyToken(token) {
  const { payload } = await jwtVerify(token, secret());
  return payload;
}

export async function authenticate(req) {
  const auth = req.headers['authorization'];
  if (!auth?.startsWith('Bearer ')) return null;
  try {
    return await verifyToken(auth.slice(7));
  } catch {
    return null;
  }
}
