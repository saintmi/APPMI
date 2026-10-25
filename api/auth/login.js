import { checkCredentials, createToken, buildAuthCookie } from '../_lib/auth.js';
import { setCors, handleOptions } from '../_lib/cors.js';

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }
  const { username, password } = req.body || {};
  if (!checkCredentials(String(username || ''), String(password || ''))) {
    res.status(401).json({ error: 'Username atau password salah.' });
    return;
  }
  const token = await createToken(String(username));
  res.setHeader('Set-Cookie', buildAuthCookie(token));
  res.status(200).json({ username: String(username) });
}