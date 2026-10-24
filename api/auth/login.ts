import { checkCredentials, createToken } from '../_lib/auth';
import { setCors, handleOptions } from '../_lib/cors';

export default async function handler(req: any, res: any) {
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
  res.status(200).json({ token, username });
}
