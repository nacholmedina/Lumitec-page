import { hashPassword, createToken } from '../_lib/auth.js';
import { timingSafeEqual } from 'crypto';

function safeCompare(a, b) {
  const bufA = Buffer.from(a);
  const bufB = Buffer.from(b);
  if (bufA.length !== bufB.length) return false;
  return timingSafeEqual(bufA, bufB);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { email, password } = req.body || {};

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const emailMatch = safeCompare(email.toLowerCase(), process.env.ADMIN_EMAIL.toLowerCase());
  const passwordMatch = safeCompare(hashPassword(password), process.env.ADMIN_PASSWORD_HASH);

  if (!emailMatch || !passwordMatch) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  const token = await createToken(email);
  res.status(200).json({ token });
}
