import { neon } from '@neondatabase/serverless';

export const sql = neon(process.env.DATABASE_URL);

export async function ensureSchema() {
  const ddl = `
CREATE TABLE IF NOT EXISTS settings (id INTEGER PRIMARY KEY, nama_lingkungan TEXT NOT NULL DEFAULT '', daftar_kub JSONB NOT NULL DEFAULT '[]'::jsonb, tahun_statistik INTEGER NOT NULL DEFAULT 2026, tanggal_acuan TEXT NOT NULL DEFAULT '31/12/2026', updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), CONSTRAINT settings_single_row CHECK (id = 1));
CREATE TABLE IF NOT EXISTS kk (id TEXT PRIMARY KEY, nomor_kk TEXT NOT NULL DEFAULT '', nama_kepala_keluarga TEXT NOT NULL DEFAULT '', alamat TEXT NOT NULL DEFAULT '', kub TEXT NOT NULL DEFAULT '', rt_rw TEXT, kode_pos TEXT, desa_kelurahan TEXT, kecamatan TEXT, kabupaten_kota TEXT, provinsi TEXT, tanggal_dikeluarkan TEXT, file_sumber TEXT, nama_file_scan TEXT, confidence_ocr DOUBLE PRECISION, catatan_verifikasi TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS umat (id TEXT PRIMARY KEY, id_kk TEXT REFERENCES kk(id) ON DELETE SET NULL, nama TEXT NOT NULL DEFAULT '', jenis_kelamin TEXT NOT NULL DEFAULT '', tanggal_lahir TEXT NOT NULL DEFAULT '', agama TEXT NOT NULL DEFAULT '', status TEXT NOT NULL DEFAULT '', kub TEXT NOT NULL DEFAULT '', alamat TEXT NOT NULL DEFAULT '', nik TEXT, tempat_lahir TEXT, pendidikan TEXT, pekerjaan TEXT, golongan_darah TEXT, status_perkawinan TEXT, tanggal_perkawinan TEXT, status_hubungan_keluarga TEXT, kewarganegaraan TEXT, nama_ayah TEXT, nama_ibu TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS peristiwa (id TEXT PRIMARY KEY, jenis TEXT NOT NULL, id_umat TEXT REFERENCES umat(id) ON DELETE CASCADE, nama TEXT NOT NULL DEFAULT '', lingkungan TEXT NOT NULL DEFAULT '', jenis_kelamin TEXT NOT NULL DEFAULT '', tanggal_lahir TEXT NOT NULL DEFAULT '', tanggal TEXT, keterangan TEXT NOT NULL DEFAULT '', updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS riwayat_pindah_alamat (id TEXT PRIMARY KEY, id_umat TEXT REFERENCES umat(id) ON DELETE CASCADE, tanggal TEXT NOT NULL DEFAULT '', alamat_lama TEXT NOT NULL DEFAULT '', kub_lama TEXT NOT NULL DEFAULT '', alamat_baru TEXT NOT NULL DEFAULT '', kub_baru TEXT NOT NULL DEFAULT '', updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS audit_log (id BIGSERIAL PRIMARY KEY, waktu TEXT NOT NULL, aksi TEXT NOT NULL, entitas TEXT NOT NULL, id_entitas TEXT NOT NULL, sebelum JSONB, sesudah JSONB);
CREATE TABLE IF NOT EXISTS penanda (id TEXT PRIMARY KEY, jenis TEXT NOT NULL, pesan TEXT NOT NULL DEFAULT '', entitas TEXT NOT NULL DEFAULT '', id_entitas TEXT NOT NULL DEFAULT '', aktif BOOLEAN NOT NULL DEFAULT true, updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS keputusan_duplikat (id_pasangan TEXT PRIMARY KEY, id_a TEXT NOT NULL, id_b TEXT NOT NULL, keputusan TEXT NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS lampiran (id TEXT PRIMARY KEY, entitas TEXT NOT NULL, id_entitas TEXT NOT NULL, nama TEXT NOT NULL, tipe TEXT NOT NULL, ukuran BIGINT NOT NULL DEFAULT 0, sumber TEXT NOT NULL DEFAULT 'lokal', id_drive TEXT, diunggah_pada TEXT NOT NULL, data_base64 TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS storage_objects (id TEXT PRIMARY KEY, owner_type TEXT NOT NULL, owner_id TEXT NOT NULL, bucket TEXT NOT NULL, object_key TEXT NOT NULL UNIQUE, file_name TEXT NOT NULL, content_type TEXT, size BIGINT, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS app_users (username TEXT PRIMARY KEY, password_hash TEXT NOT NULL, role TEXT NOT NULL DEFAULT 'admin', created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS llm_keys (id TEXT PRIMARY KEY, label TEXT NOT NULL, key_encrypted TEXT NOT NULL, key_suffix TEXT NOT NULL, aktif BOOLEAN NOT NULL DEFAULT true, pemakaian_hari_ini INTEGER NOT NULL DEFAULT 0, istirahat_sampai TIMESTAMPTZ, galat_terakhir TEXT, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS user_preferences (username TEXT NOT NULL REFERENCES app_users(username) ON DELETE CASCADE, key TEXT NOT NULL, value JSONB NOT NULL DEFAULT '{}'::jsonb, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), PRIMARY KEY (username, key));
CREATE TABLE IF NOT EXISTS emergency_backups (id BIGSERIAL PRIMARY KEY, username TEXT, reason TEXT NOT NULL DEFAULT '', snapshot JSONB NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS app_meta (key TEXT PRIMARY KEY, value JSONB NOT NULL, updated_at TIMESTAMPTZ NOT NULL DEFAULT now());
CREATE TABLE IF NOT EXISTS user_sessions (id TEXT PRIMARY KEY, username TEXT NOT NULL REFERENCES app_users(username) ON DELETE CASCADE, token_hash TEXT NOT NULL, expires_at TIMESTAMPTZ NOT NULL, created_at TIMESTAMPTZ NOT NULL DEFAULT now(), revoked_at TIMESTAMPTZ, user_agent TEXT, ip TEXT);
CREATE TABLE IF NOT EXISTS llm_settings (id INTEGER PRIMARY KEY, diaktifkan BOOLEAN NOT NULL DEFAULT false, mode_hanya_struktur BOOLEAN NOT NULL DEFAULT true, model_tingkat JSONB NOT NULL DEFAULT '[]'::jsonb, updated_at TIMESTAMPTZ NOT NULL DEFAULT now(), CONSTRAINT llm_settings_single_row CHECK (id = 1));
`;
  const statements = ddl.split(';').map(s => s.trim()).filter(Boolean);
  for (const stmt of statements) {
    await sql.query(stmt);
  }
  await sql.query(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS tema TEXT NOT NULL DEFAULT 'sistem'`);
  await sql.query(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS bahasa TEXT NOT NULL DEFAULT 'id'`);
  await sql.query(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS format_tanggal TEXT NOT NULL DEFAULT 'DD/MM/YYYY'`);
  await sql.query(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS cadangan_otomatis BOOLEAN NOT NULL DEFAULT true`);
  await sql.query(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS interval_cadangan_menit INTEGER NOT NULL DEFAULT 5`);
  await sql.query(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS retensi_audit_hari INTEGER NOT NULL DEFAULT 365`);
  await sql.query(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS pengaturan_lain JSONB NOT NULL DEFAULT '{}'::jsonb`);
  await sql.query(`ALTER TABLE settings ADD COLUMN IF NOT EXISTS updated_by TEXT`);
await sql.query(`SELECT setval('audit_log_id_seq', COALESCE((SELECT MAX(id) FROM audit_log), 0), true)`);
}
