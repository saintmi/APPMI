import 'dotenv/config';
import { neon } from '@neondatabase/serverless';
import fs from 'node:fs';

const raw = JSON.parse(fs.readFileSync('seed-snapshot.json', 'utf8'));
const snapshot = {
  settings: raw.settings ?? null,
  umat: raw.umat ?? [],
  kk: raw.kk ?? [],
  peristiwa: raw.peristiwa ?? [],
  riwayat: raw.riwayat ?? raw.riwayatPindahAlamat ?? [],
  audit: raw.audit ?? raw.auditLog ?? [],
  penanda: raw.penanda ?? [],
  keputusanDuplikat: raw.keputusanDuplikat ?? [],
};

const sql = neon(process.env.DATABASE_URL);

// ensure schema
const schemaSql = fs.readFileSync(new URL('./../db/schema.sql', import.meta.url), 'utf8');
const stmts = schemaSql.split(';').map(s => s.trim()).filter(Boolean);
for (const s of stmts) await sql.query(s);

// clear
for (const t of ['lampiran','keputusan_duplikat','penanda','audit_log','riwayat_pindah_alamat','peristiwa','umat','kk','settings']) {
  await sql.query(`DELETE FROM ${t}`);
}

const kkIds = new Set(snapshot.kk.map(k => k.id));

if (snapshot.settings) {
  const s = snapshot.settings;
  await sql.query(
    `INSERT INTO settings (id, nama_lingkungan, daftar_kub, tahun_statistik, tanggal_acuan, updated_at)
     VALUES (1, $1, $2::jsonb, $3, $4, now())`,
    [s.namaLingkungan ?? '', JSON.stringify(s.daftarKUB ?? []), s.tahunStatistik ?? 2026, s.tanggalAcuan ?? '31/12/2026']
  );
}

for (const k of snapshot.kk) {
  await sql.query(
    `INSERT INTO kk (id, nomor_kk, nama_kepala_keluarga, alamat, kub, rt_rw, kode_pos, desa_kelurahan, kecamatan, kabupaten_kota, provinsi, tanggal_dikeluarkan, file_sumber, nama_file_scan, confidence_ocr, catatan_verifikasi, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,now())`,
    [k.id, k.nomorKK ?? '', k.namaKepalaKeluarga ?? '', k.alamat ?? '', k.KUB ?? '', k.rtRw ?? null, k.kodePos ?? null, k.desaKelurahan ?? null, k.kecamatan ?? null, k.kabupatenKota ?? null, k.provinsi ?? null, k.tanggalDikeluarkan ?? null, k.fileSumber ?? null, k.namaFileScan ?? null, k.confidenceOcr ?? null, k.catatanVerifikasi ?? null]
  );
  for (const l of k.lampiran ?? []) {
    await sql.query(
      `INSERT INTO lampiran (id, entitas, id_entitas, nama, tipe, ukuran, sumber, id_drive, diunggah_pada, data_base64)
       VALUES ($1,'kk',$2,$3,$4,$5,$6,$7,$8,$9)`,
      [l.id, k.id, l.nama, l.tipe, l.ukuran ?? 0, l.sumber ?? 'lokal', l.idDrive ?? null, l.diunggahPada, l.data?.data ?? null]
    );
  }
}

for (const u of snapshot.umat) {
  await sql.query(
    `INSERT INTO umat (id, id_kk, nama, jenis_kelamin, tanggal_lahir, agama, status, kub, alamat, nik, tempat_lahir, pendidikan, pekerjaan, golongan_darah, status_perkawinan, tanggal_perkawinan, status_hubungan_keluarga, kewarganegaraan, nama_ayah, nama_ibu, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,now())`,
    [u.id, (u.idKK && kkIds.has(u.idKK)) ? u.idKK : null, u.nama ?? '', u.jenisKelamin ?? '', u.tanggalLahir ?? '', u.agama ?? '', u.status ?? '', u.KUB ?? '', u.alamat ?? '', u.nik ?? null, u.tempatLahir ?? null, u.pendidikan ?? null, u.pekerjaan ?? null, u.golonganDarah ?? null, u.statusPerkawinan ?? null, u.tanggalPerkawinan ?? null, u.statusHubunganKeluarga ?? null, u.kewarganegaraan ?? null, u.namaAyah ?? null, u.namaIbu ?? null]
  );
  for (const l of u.lampiran ?? []) {
    await sql.query(
      `INSERT INTO lampiran (id, entitas, id_entitas, nama, tipe, ukuran, sumber, id_drive, diunggah_pada, data_base64)
       VALUES ($1,'umat',$2,$3,$4,$5,$6,$7,$8,$9)`,
      [l.id, u.id, l.nama, l.tipe, l.ukuran ?? 0, l.sumber ?? 'lokal', l.idDrive ?? null, l.diunggahPada, l.data?.data ?? null]
    );
  }
}

for (const p of snapshot.peristiwa) {
  await sql.query(
    `INSERT INTO peristiwa (id, jenis, id_umat, nama, lingkungan, jenis_kelamin, tanggal_lahir, tanggal, keterangan, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,now())`,
    [p.id, p.jenis, p.idUmat ? p.idUmat : null, p.nama ?? '', p.lingkungan ?? '', p.jenisKelamin ?? '', p.tanggalLahir ?? '', p.tanggal ?? null, p.keterangan ?? '']
  );
}

for (const r of snapshot.riwayat) {
  await sql.query(
    `INSERT INTO riwayat_pindah_alamat (id, id_umat, tanggal, alamat_lama, kub_lama, alamat_baru, kub_baru, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,now())`,
    [r.id, r.idUmat ? r.idUmat : null, r.tanggal ?? '', r.alamatLama ?? '', r.KUBLama ?? '', r.alamatBaru ?? '', r.KUBBaru ?? '']
  );
}

for (const a of snapshot.audit) {
  await sql.query(
    `INSERT INTO audit_log (waktu, aksi, entitas, id_entitas, sebelum, sesudah)
     VALUES ($1,$2,$3,$4,$5::jsonb,$6::jsonb)`,
    [a.waktu ?? '', a.aksi ?? '', a.entitas ?? '', a.idEntitas ?? '', a.sebelum == null ? null : JSON.stringify(a.sebelum), a.sesudah == null ? null : JSON.stringify(a.sesudah)]
  );
}

for (const p of snapshot.penanda) {
  await sql.query(
    `INSERT INTO penanda (id, jenis, pesan, entitas, id_entitas, aktif, updated_at)
     VALUES ($1,$2,$3,$4,$5,$6,now())`,
    [p.id, p.jenis, p.pesan ?? '', p.entitas ?? '', p.idEntitas ?? '', p.aktif ?? true]
  );
}

for (const k of snapshot.keputusanDuplikat) {
  await sql.query(
    `INSERT INTO keputusan_duplikat (id_pasangan, id_a, id_b, keputusan, updated_at)
     VALUES ($1,$2,$3,$4,now())`,
    [k.idPasangan, k.idA, k.idB, k.keputusan]
  );
}

console.log('Seeded KK:', snapshot.kk.length, 'Umat:', snapshot.umat.length);
