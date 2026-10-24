import { sql, ensureSchema } from './_lib/db.js';
import { verifyToken, getBearerToken } from './_lib/auth.js';
import { setCors, handleOptions } from './_lib/cors.js';

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  const token = getBearerToken(req);
  if (!token) { res.status(401).json({ error: 'Belum login.' }); return; }
  try { await verifyToken(token); } catch { res.status(401).json({ error: 'Token tidak valid.' }); return; }
  if (req.method !== 'POST') { res.status(405).json({ error: 'Method not allowed' }); return; }
  await ensureSchema();
  res.status(200).json({ ok: true });
}
