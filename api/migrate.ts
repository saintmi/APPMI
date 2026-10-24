import { sql, ensureSchema } from './_lib/db';
import { verifyToken, getBearerToken } from './_lib/auth';
import { setCors, handleOptions } from './_lib/cors';

export default async function handler(req: any, res: any) {
  setCors(res);
  if (handleOptions(req, res)) return;
  const token = getBearerToken(req);
  if (!token) { res.status(401).json({ error: 'Belum login.' }); return; }
  try { await verifyToken(token); } catch { res.status(401).json({ error: 'Token tidak valid.' }); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  await ensureSchema();
  res.status(200).json({ ok: true });
}
