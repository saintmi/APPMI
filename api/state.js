import { sql, ensureSchema } from './_lib/db.js';
import { verifyToken, getBearerToken } from './_lib/auth.js';
import { setCors, handleOptions } from './_lib/cors.js';
import * as M from './_lib/mappers.js';

export default async function handler(req, res) {
  setCors(res);
  if (handleOptions(req, res)) return;

  const token = getBearerToken(req);
  if (!token) { res.status(401).json({ error: 'Belum login.' }); return; }
  try { await verifyToken(token); } catch { res.status(401).json({ error: 'Token tidak valid.' }); return; }

  await ensureSchema();

  if (req.method === 'GET') {
    try {
      const settingsRows = await sql`SELECT * FROM settings WHERE id = 1`;
      const kkRows = await sql`SELECT * FROM kk ORDER BY id`;
      const umatRows = await sql`SELECT * FROM umat ORDER BY id`;
      const peristiwaRows = await sql`SELECT * FROM peristiwa ORDER BY id`;
      const riwayatRows = await sql`SELECT * FROM riwayat_pindah_alamat ORDER BY id`;
      const auditRows = await sql`SELECT * FROM audit_log ORDER BY id`;
      const penandaRows = await sql`SELECT * FROM penanda ORDER BY id`;
      const keputusanRows = await sql`SELECT * FROM keputusan_duplikat ORDER BY id_pasangan`;
      const lampiranRows = await sql`SELECT * FROM lampiran ORDER BY id`;

      const settings = settingsRows.length ? M.rowToSettings(settingsRows[0]) : null;
      const kk = kkRows.map(M.rowToKk);
      const umat = umatRows.map(M.rowToUmat);

      const lampiranByEntitas = new Map();
      for (const r of lampiranRows) {
        const L = M.rowToLampiran(r);
        const key = `${r.entitas}:${r.id_entitas}`;
        if (!lampiranByEntitas.has(key)) lampiranByEntitas.set(key, []);
        lampiranByEntitas.get(key).push(L);
      }
      for (const k of kk) { k.lampiran = lampiranByEntitas.get(`kk:${k.id}`) || []; }
      for (const u of umat) { u.lampiran = lampiranByEntitas.get(`umat:${u.id}`) || []; }

      const data = {
        settings: settings || undefined,
        kk, umat,
        peristiwa: peristiwaRows.map(M.rowToPeristiwa),
        riwayat: riwayatRows.map(M.rowToRiwayat),
        audit: auditRows.map(M.rowToAudit),
        penanda: penandaRows.map(M.rowToPenanda),
        keputusanDuplikat: keputusanRows.map(M.rowToKeputusan),
        indeksUndo: 0,
      };

      if (!settingsRows.length && kkRows.length === 0 && umatRows.length === 0) {
        res.status(204).end(); return;
      }
      res.status(200).json({ data, updatedAt: new Date().toISOString() }); return;
    } catch (err) {
      res.status(500).json({ error: err?.message || 'Gagal memuat data.' }); return;
    }
  }

  if (req.method === 'PUT') {
    const body = req.body || {};
    const value = body.data ?? body;
    try {
      const queries = [];
      queries.push(sql`DELETE FROM lampiran`);
      queries.push(sql`DELETE FROM keputusan_duplikat`);
      queries.push(sql`DELETE FROM penanda`);
      queries.push(sql`DELETE FROM audit_log`);
      queries.push(sql`DELETE FROM riwayat_pindah_alamat`);
      queries.push(sql`DELETE FROM peristiwa`);
      queries.push(sql`DELETE FROM umat`);
      queries.push(sql`DELETE FROM kk`);
      queries.push(sql`DELETE FROM settings`);

      if (value?.settings) {
        const s = value.settings;
        queries.push(sql`INSERT INTO settings (id, nama_lingkungan, daftar_kub, tahun_statistik, tanggal_acuan, tema, bahasa, format_tanggal, cadangan_otomatis, interval_cadangan_menit, retensi_audit_hari, pengaturan_lain, updated_by, updated_at) VALUES (1, ${s.namaLingkungan ?? ''}, ${JSON.stringify(s.daftarKUB ?? [])}::jsonb, ${s.tahunStatistik ?? 2026}, ${s.tanggalAcuan ?? '31/12/2026'}, ${s.tema ?? 'sistem'}, ${s.bahasa ?? 'id'}, ${s.formatTanggal ?? 'DD/MM/YYYY'}, ${s.cadanganOtomatis ?? true}, ${s.intervalCadanganMenit ?? 5}, ${s.retensiAuditHari ?? 365}, ${JSON.stringify(s.pengaturanLain ?? {})}::jsonb, ${s.updatedBy ?? null}, now())`);
      }
      for (const k of value?.kk ?? []) {
        queries.push(sql`INSERT INTO kk (id, nomor_kk, nama_kepala_keluarga, alamat, kub, rt_rw, kode_pos, desa_kelurahan, kecamatan, kabupaten_kota, provinsi, tanggal_dikeluarkan, file_sumber, nama_file_scan, confidence_ocr, catatan_verifikasi, updated_at) VALUES (${k.id}, ${k.nomorKK ?? ''}, ${k.namaKepalaKeluarga ?? ''}, ${k.alamat ?? ''}, ${k.KUB ?? ''}, ${k.rtRw ?? null}, ${k.kodePos ?? null}, ${k.desaKelurahan ?? null}, ${k.kecamatan ?? null}, ${k.kabupatenKota ?? null}, ${k.provinsi ?? null}, ${k.tanggalDikeluarkan ?? null}, ${k.fileSumber ?? null}, ${k.namaFileScan ?? null}, ${k.confidenceOcr ?? null}, ${k.catatanVerifikasi ?? null}, now())`);
      }
      for (const u of value?.umat ?? []) {
        queries.push(sql`INSERT INTO umat (id, id_kk, nama, jenis_kelamin, tanggal_lahir, agama, status, kub, alamat, nik, tempat_lahir, pendidikan, pekerjaan, golongan_darah, status_perkawinan, tanggal_perkawinan, status_hubungan_keluarga, kewarganegaraan, nama_ayah, nama_ibu, updated_at) VALUES (${u.id}, ${u.idKK ? u.idKK : null}, ${u.nama ?? ''}, ${u.jenisKelamin ?? ''}, ${u.tanggalLahir ?? ''}, ${u.agama ?? ''}, ${u.status ?? ''}, ${u.KUB ?? ''}, ${u.alamat ?? ''}, ${u.nik ?? null}, ${u.tempatLahir ?? null}, ${u.pendidikan ?? null}, ${u.pekerjaan ?? null}, ${u.golonganDarah ?? null}, ${u.statusPerkawinan ?? null}, ${u.tanggalPerkawinan ?? null}, ${u.statusHubunganKeluarga ?? null}, ${u.kewarganegaraan ?? null}, ${u.namaAyah ?? null}, ${u.namaIbu ?? null}, now())`);
      }
      for (const p of value?.peristiwa ?? []) {
        queries.push(sql`INSERT INTO peristiwa (id, jenis, id_umat, nama, lingkungan, jenis_kelamin, tanggal_lahir, tanggal, keterangan, updated_at) VALUES (${p.id}, ${p.jenis}, ${p.idUmat ? p.idUmat : null}, ${p.nama ?? ''}, ${p.lingkungan ?? ''}, ${p.jenisKelamin ?? ''}, ${p.tanggalLahir ?? ''}, ${p.tanggal ?? null}, ${p.keterangan ?? ''}, now())`);
      }
      for (const r of value?.riwayat ?? value?.riwayatPindahAlamat ?? []) {
        queries.push(sql`INSERT INTO riwayat_pindah_alamat (id, id_umat, tanggal, alamat_lama, kub_lama, alamat_baru, kub_baru, updated_at) VALUES (${r.id}, ${r.idUmat ? r.idUmat : null}, ${r.tanggal ?? ''}, ${r.alamatLama ?? ''}, ${r.KUBLama ?? ''}, ${r.alamatBaru ?? ''}, ${r.KUBBaru ?? ''}, now())`);
      }
      for (const a of value?.audit ?? value?.auditLog ?? []) {
        queries.push(sql`INSERT INTO audit_log (id, waktu, aksi, entitas, id_entitas, sebelum, sesudah) VALUES (${a.id ?? null}, ${a.waktu ?? ''}, ${a.aksi ?? ''}, ${a.entitas ?? ''}, ${a.idEntitas ?? ''}, ${a.sebelum == null ? null : JSON.stringify(a.sebelum)}::jsonb, ${a.sesudah == null ? null : JSON.stringify(a.sesudah)}::jsonb)`);
      }
      for (const p of value?.penanda ?? []) {
        queries.push(sql`INSERT INTO penanda (id, jenis, pesan, entitas, id_entitas, aktif, updated_at) VALUES (${p.id}, ${p.jenis}, ${p.pesan ?? ''}, ${p.entitas ?? ''}, ${p.idEntitas ?? ''}, ${p.aktif ?? true}, now())`);
      }
      for (const k of value?.keputusanDuplikat ?? []) {
        queries.push(sql`INSERT INTO keputusan_duplikat (id_pasangan, id_a, id_b, keputusan, updated_at) VALUES (${k.idPasangan}, ${k.idA}, ${k.idB}, ${k.keputusan}, now())`);
      }
      for (const k of value?.kk ?? []) {
        for (const l of k.lampiran ?? []) {
          queries.push(sql`INSERT INTO lampiran (id, entitas, id_entitas, nama, tipe, ukuran, sumber, id_drive, diunggah_pada, data_base64) VALUES (${l.id}, 'kk', ${k.id}, ${l.nama}, ${l.tipe}, ${l.ukuran ?? 0}, ${l.sumber ?? 'lokal'}, ${l.idDrive ?? null}, ${l.diunggahPada}, ${l.data?.data ?? null})`);
        }
      }
      for (const u of value?.umat ?? []) {
        for (const l of u.lampiran ?? []) {
          queries.push(sql`INSERT INTO lampiran (id, entitas, id_entitas, nama, tipe, ukuran, sumber, id_drive, diunggah_pada, data_base64) VALUES (${l.id}, 'umat', ${u.id}, ${l.nama}, ${l.tipe}, ${l.ukuran ?? 0}, ${l.sumber ?? 'lokal'}, ${l.idDrive ?? null}, ${l.diunggahPada}, ${l.data?.data ?? null})`);
        }
      }
      await sql.transaction(queries);
      res.status(200).json({ ok: true }); return;
    } catch (err) {
      res.status(500).json({ error: err?.message || 'Gagal menyimpan data.' }); return;
    }
  }

  res.status(405).json({ error: 'Method not allowed' });
}
