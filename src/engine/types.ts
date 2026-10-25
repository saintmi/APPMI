// ============================================================================
// Model data — sesuai section 5.1 plan.md
// Tidak ada kolom baru kecuali KUB (DATA UMAT!AA, DATA KK!L)
// ============================================================================

export type Tanggal = string; // disimpan sebagai "dd/MM/yyyy" atau serial Excel

export interface Settings {
  namaLingkungan: string;
  daftarKUB: string[];
  tahunStatistik: number; // terkunci 2026
  tanggalAcuan: Tanggal;  // 31/12/2026
}

export interface Lampiran {
  id: string;             // L<timestamp>
  nama: string;           // nama file asli
  tipe: string;           // MIME type (mis. application/pdf, image/png)
  ukuran: number;         // ukuran dalam byte
  sumber: 'lokal';        // 'lokal' sekarang; 'drive' di versi depan
  idDrive?: string;       // diisi saat integrasi Google Drive versi depan
  diunggahPada: string;   // ISO timestamp
  data: ArrayBuffer;      // isi file, tersimpan di IndexedDB (Dexie)
}

export interface Kk {
  id: string;           // rumus berbasis baris, tetap tidak bergeser
  nomorKK: string;      // nomor KK (Kartu Keluarga), digunakan untuk deteksi keluarga yang sama
  namaKepalaKeluarga: string;
  alamat: string;
  KUB: string;
  lampiran: Lampiran[]; // scan KTP, KK, dll.
  // data hasil scan KK (opsional, agar data lama tetap valid)
  rtRw?: string;
  kodePos?: string;
  desaKelurahan?: string;
  kecamatan?: string;
  kabupatenKota?: string;
  provinsi?: string;
  tanggalDikeluarkan?: Tanggal;
  fileSumber?: string;
  namaFileScan?: string;
  confidenceOcr?: number;
  catatanVerifikasi?: string;
  // kolom lainnya sesuai template DATA KK A1:K501
}

export interface Umat {
  id: string;           // ID Umat, tetap tidak bergeser
  idKK: string;
  nama: string;
  jenisKelamin: 'Laki-laki' | 'Perempuan';
  tanggalLahir: Tanggal;
  agama: string;
  status: string;       // dihitung, tidak boleh diketik langsung
  KUB: string;
  alamat: string;
  lampiran: Lampiran[]; // scan KTP, KK, Kartu Baptis, dll.
  // data tambahan dari scan KK (opsional, agar data lama tetap valid)
  nik?: string;
  tempatLahir?: string;
  pendidikan?: string;
  pekerjaan?: string;
  golonganDarah?: string;
  statusPerkawinan?: string;
  tanggalPerkawinan?: Tanggal;
  statusHubunganKeluarga?: string;
  kewarganegaraan?: string;
  namaAyah?: string;
  namaIbu?: string;
  // kolom lainnya sesuai template DATA UMAT A1:Z2001
}

export type JenisPeristiwa =
  | 'KEMATIAN'
  | 'PINDAH AGAMA'
  | 'MUTASI_KELUAR'
  | 'MUTASI_MASUK'
  | 'DITERIMA MASUK'
  | 'BAPTIS'
  | 'KRISMA'
  | 'KOMUNI PERTAMA'
  | 'PERMINYAKAN SUCI'
  | 'SEMINARI BIARA'
  | 'PERKAWINAN GEREJANI'
  | 'PEMBUBARAN'
  | 'PINDAH ALAMAT';

export interface Peristiwa {
  id: string;
  jenis: JenisPeristiwa;
  idUmat: string;
  nama: string;           // diambil dari DATA UMAT, tidak diketik
  lingkungan: string;     // dari Pengaturan
  jenisKelamin: string;   // diambil dari DATA UMAT
  tanggalLahir: Tanggal;  // diambil dari DATA UMAT
  tanggal: Tanggal | null;
  keterangan: string;
  // kolom khusus per sheet (id KK untuk perkawinan, dst.)
}

export interface RiwayatPindahAlamat {
  id: string;
  idUmat: string;
  tanggal: Tanggal;
  alamatLama: string;
  KUBLama: string;
  alamatBaru: string;
  KUBBaru: string;
}

export interface KeputusanDuplikat {
  idPasangan: string;     // hash dari idA + idB
  idA: string;
  idB: string;
  keputusan: 'gabung' | 'beda-orang'; // 'gabung' ditangani oleh merge data
}

export interface AuditLogEntry {
  id: number;
  waktu: string;
  aksi: 'TAMBAH' | 'UBAH' | 'HAPUS' | 'URUNGKAN';
  entitas: string;
  idEntitas: string;
  sebelum: unknown;
  sesudah: unknown;
}

export interface Penanda {
  id: string;
  jenis: 'Perlu dilengkapi' | 'Perlu konfirmasi';
  pesan: string;
  entitas: string;
  idEntitas: string;
  aktif: boolean;
}

export interface RekapAngka {
  label: string;
  nilai: number;
  bukti: string[]; // ID umat di balik angka
  sheet: string;
  baris: number;
  kolom: string;
}

// ============================================================================
// Status umat (dihitung, aturan 5.3)
// Diekspor sebagai nilai (bukan tipe) agar bisa diimpor sebagai value.
// ============================================================================

export const STATUS_AKTIF = 'Aktif';
export const STATUS_MENINGGAL = 'Meninggal';
export const STATUS_PINDAH_AGAMA = 'Pindah Agama';
export const STATUS_PINDAH_KELUAR = 'Pindah Keluar';

export type StatusUmat = typeof STATUS_AKTIF | typeof STATUS_MENINGGAL | typeof STATUS_PINDAH_AGAMA | typeof STATUS_PINDAH_KELUAR | string;

export function isStatusAktif(status: string): boolean {
  return status === STATUS_AKTIF;
}

export function isStatusFinal(status: string): boolean {
  return status === STATUS_MENINGGAL;
}