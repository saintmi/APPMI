import { sql, ensureSchema } from './_lib/db.js';
import { verifyToken, getBearerToken } from './_lib/auth.js';
import { setCors, handleOptions } from './_lib/cors.js';

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  const token = getBearerToken(req);
  if (!token) { res.status(401).json({ error: 'Belum login.' }); return; }
  let payload;
  try { payload = await verifyToken(token); } catch { res.status(401).json({ error: 'Token tidak valid.' }); return; }
  const username = payload?.username || null;
  await ensureSchema();

  if (req.method === 'GET') {
    try {
      const rows = await sql`SELECT id, reason, snapshot, created_at FROM emergency_backups WHERE username IS NOT DISTINCT FROM ${username} ORDER BY id DESC LIMIT 1`;
      if (!rows.length) { res.status(204).end(); return; }
      res.status(200).json({ id: rows[0].id, reason: rows[0].reason, data: rows[0].snapshot, createdAt: rows[0].created_at });
      return;
    } catch (err) {
      res.status(500).json({ error: err?.message || 'Gagal memuat cadangan darurat.' });
      return;
    }
  }

  if (req.method === 'POST') {
    const body = req.body || {};
    const snapshot = body.snapshot ?? body.data ?? null;
    const reason = body.reason || 'gagal-simpan';
    if (!snapshot) { res.status(400).json({ error: 'Snapshot wajib diisi.' }); return; }
    try {
      await sql`INSERT INTO emergency_backups (username, reason, snapshot) VALUES (${username}, ${reason}, ${JSON.stringify(snapshot)}::jsonb)`;
      res.status(200).json({ ok: true });
      return;
    } catch (err) {
      res.status(500).json({ error: err?.message || 'Gagal menyimpan cadangan darurat.' });
      return;
    }
  }

  if (req.method === 'DELETE') {
    try {
      await sql`DELETE FROM emergency_backups WHERE username IS NOT DISTINCT FROM ${username}`;
      res.status(200).json({ ok: true });
      return;
    } catch (err) {
      res.status(500).json({ error: err?.message || 'Gagal menghapus cadangan darurat.' });
      return;
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
