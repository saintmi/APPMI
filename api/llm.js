import { sql, ensureSchema } from './_lib/db.js';
import { verifyToken, getBearerToken } from './_lib/auth.js';
import { setCors, handleOptions } from './_lib/cors.js';

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;
  const token = getBearerToken(req);
  if (!token) { res.status(401).json({ error: 'Belum login.' }); return; }
  try { await verifyToken(token); } catch { res.status(401).json({ error: 'Token tidak valid.' }); return; }
  await ensureSchema();

  if (req.method === 'GET') {
    try {
      const sRows = await sql`SELECT * FROM llm_settings WHERE id = 1`;
      const kRows = await sql`SELECT * FROM llm_keys ORDER BY created_at`;
      const settings = sRows.length ? {
        diaktifkan: !!sRows[0].diaktifkan,
        modeHanyaStruktur: !!sRows[0].mode_hanya_struktur,
        tingkat: sRows[0].model_tingkat ?? [],
      } : null;
      const kunci = kRows.map((r) => ({
        label: r.label,
        nilai: r.key_encrypted,
        aktif: !!r.aktif,
        istirahatSampai: r.istirahat_sampai ? new Date(r.istirahat_sampai).getTime() : undefined,
        pemakaianHariIni: r.pemakaian_hari_ini ?? 0,
        galatTerakhir: r.galat_terakhir ?? null,
        suffix: r.key_suffix,
      }));
      res.status(200).json({ settings, kunci });
      return;
    } catch (err) {
      res.status(500).json({ error: err?.message || 'Gagal memuat pengaturan LLM.' });
      return;
    }
  }

  if (req.method === 'PUT') {
    const body = req.body || {};
    const cfg = body.konfigurasi || {};
    const kunci = Array.isArray(body.kunci) ? body.kunci : [];
    try {
      await sql`INSERT INTO llm_settings (id, diaktifkan, mode_hanya_struktur, model_tingkat, updated_at)
        VALUES (1, ${!!cfg.diaktifkan}, ${cfg.modeHanyaStruktur !== false}, ${JSON.stringify(cfg.tingkat ?? [])}::jsonb, now())
        ON CONFLICT (id) DO UPDATE SET diaktifkan = EXCLUDED.diaktifkan, mode_hanya_struktur = EXCLUDED.mode_hanya_struktur, model_tingkat = EXCLUDED.model_tingkat, updated_at = now()`;
      await sql`DELETE FROM llm_keys`;
      const queries = [];
      for (let i = 0; i < kunci.length; i++) {
        const k = kunci[i] || {};
        const suffix = String(k.nilai || '').slice(-4);
        queries.push(sql`INSERT INTO llm_keys (id, label, key_encrypted, key_suffix, aktif, pemakaian_hari_ini, istirahat_sampai, galat_terakhir, updated_at) VALUES (${`kunci-${Date.now()}-${i}`}, ${k.label || 'Kunci ' + (i + 1)}, ${k.nilai || ''}, ${suffix}, ${k.aktif !== false}, ${k.pemakaianHariIni ?? 0}, ${k.istirahatSampai ? new Date(k.istirahatSampai).toISOString() : null}, ${k.galatTerakhir ?? null}, now())`);
      }
      if (queries.length) await sql.transaction(queries);
      res.status(200).json({ ok: true });
      return;
    } catch (err) {
      res.status(500).json({ error: err?.message || 'Gagal menyimpan pengaturan LLM.' });
      return;
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
