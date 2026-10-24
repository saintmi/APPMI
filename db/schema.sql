CREATE TABLE IF NOT EXISTS settings (
  id INTEGER PRIMARY KEY,
  nama_lingkungan TEXT NOT NULL DEFAULT '',
  daftar_kub JSONB NOT NULL DEFAULT '[]'::jsonb,
  tahun_statistik INTEGER NOT NULL DEFAULT 2026,
  tanggal_acuan TEXT NOT NULL DEFAULT '31/12/2026',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT settings_single_row CHECK (id = 1)
);

CREATE TABLE IF NOT EXISTS kk (
  id TEXT PRIMARY KEY,
  nomor_kk TEXT NOT NULL DEFAULT '',
  nama_kepala_keluarga TEXT NOT NULL DEFAULT '',
  alamat TEXT NOT NULL DEFAULT '',
  kub TEXT NOT NULL DEFAULT '',
  rt_rw TEXT,
  kode_pos TEXT,
  desa_kelurahan TEXT,
  kecamatan TEXT,
  kabupaten_kota TEXT,
  provinsi TEXT,
  tanggal_dikeluarkan TEXT,
  file_sumber TEXT,
  nama_file_scan TEXT,
  confidence_ocr DOUBLE PRECISION,
  catatan_verifikasi TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS umat (
  id TEXT PRIMARY KEY,
  id_kk TEXT REFERENCES kk(id) ON DELETE SET NULL,
  nama TEXT NOT NULL DEFAULT '',
  jenis_kelamin TEXT NOT NULL DEFAULT '',
  tanggal_lahir TEXT NOT NULL DEFAULT '',
  agama TEXT NOT NULL DEFAULT '',
  status TEXT NOT NULL DEFAULT '',
  kub TEXT NOT NULL DEFAULT '',
  alamat TEXT NOT NULL DEFAULT '',
  nik TEXT,
  tempat_lahir TEXT,
  pendidikan TEXT,
  pekerjaan TEXT,
  golongan_darah TEXT,
  status_perkawinan TEXT,
  tanggal_perkawinan TEXT,
  status_hubungan_keluarga TEXT,
  kewarganegaraan TEXT,
  nama_ayah TEXT,
  nama_ibu TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS peristiwa (
  id TEXT PRIMARY KEY,
  jenis TEXT NOT NULL,
  id_umat TEXT REFERENCES umat(id) ON DELETE CASCADE,
  nama TEXT NOT NULL DEFAULT '',
  lingkungan TEXT NOT NULL DEFAULT '',
  jenis_kelamin TEXT NOT NULL DEFAULT '',
  tanggal_lahir TEXT NOT NULL DEFAULT '',
  tanggal TEXT,
  keterangan TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS riwayat_pindah_alamat (
  id TEXT PRIMARY KEY,
  id_umat TEXT REFERENCES umat(id) ON DELETE CASCADE,
  tanggal TEXT NOT NULL DEFAULT '',
  alamat_lama TEXT NOT NULL DEFAULT '',
  kub_lama TEXT NOT NULL DEFAULT '',
  alamat_baru TEXT NOT NULL DEFAULT '',
  kub_baru TEXT NOT NULL DEFAULT '',
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS audit_log (
  id BIGSERIAL PRIMARY KEY,
  waktu TEXT NOT NULL,
  aksi TEXT NOT NULL,
  entitas TEXT NOT NULL,
  id_entitas TEXT NOT NULL,
  sebelum JSONB,
  sesudah JSONB
);

CREATE TABLE IF NOT EXISTS penanda (
  id TEXT PRIMARY KEY,
  jenis TEXT NOT NULL,
  pesan TEXT NOT NULL DEFAULT '',
  entitas TEXT NOT NULL DEFAULT '',
  id_entitas TEXT NOT NULL DEFAULT '',
  aktif BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS keputusan_duplikat (
  id_pasangan TEXT PRIMARY KEY,
  id_a TEXT NOT NULL,
  id_b TEXT NOT NULL,
  keputusan TEXT NOT NULL,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS lampiran (
  id TEXT PRIMARY KEY,
  entitas TEXT NOT NULL,
  id_entitas TEXT NOT NULL,
  nama TEXT NOT NULL,
  tipe TEXT NOT NULL,
  ukuran BIGINT NOT NULL DEFAULT 0,
  sumber TEXT NOT NULL DEFAULT 'lokal',
  id_drive TEXT,
  diunggah_pada TEXT NOT NULL,
  data_base64 TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS storage_objects (
  id TEXT PRIMARY KEY,
  owner_type TEXT NOT NULL,
  owner_id TEXT NOT NULL,
  bucket TEXT NOT NULL,
  object_key TEXT NOT NULL UNIQUE,
  file_name TEXT NOT NULL,
  content_type TEXT,
  size BIGINT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS app_users (
  username TEXT PRIMARY KEY,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'admin',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
