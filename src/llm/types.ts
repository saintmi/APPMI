// ============================================================================
// Tipe LLM Gemini — Fase 6 (opsional, default mati)
// Semua panggilan dilakukan langsung dari browser ke generativelanguage.googleapis.com
// ============================================================================

export interface LLMKunci {
  label: string;     // mis. "Google #133"
  nilai: string;     // API key tersembunyi di memori sesi
  aktif: boolean;    // boleh dipakai router
  istirahatSampai?: number; // timestamp ms, bila sedang rate-limited
  pemakaianHariIni: number; // jumlah token estimasi (perkiraan)
  galatTerakhir: string | null;
}

export interface LLMModelTingkat {
  nama: string;      // 'Tingkat 1' | 'Tingkat 2' | 'Tingkat 3'
  modelId: string;   // 'gemini-3.1-flash-lite' dst.
  kunciIndex: number[]; // indeks kunci yang dipakai di tingkat ini (round-robin)
}

export interface LLMKonfigurasi {
  diaktifkan: boolean;
  modeHanyaStruktur: boolean; // kirim hanya header/pola, tanpa nilai identitas
  tingkat: LLMModelTingkat[];
  promptSistem: string;
}

export interface LLMRespons {
  teks: string;
  modelTerpakai: string;
  kunciTerpakai: string;
  durasiMs: number;
}

export interface LLMStatus {
  diaktifkan: boolean;
  totalKunci: number;
  kunciAktif: number;
  kunciIstirahat: number;
  modelTingkat: string[];
  galatTerakhir: string | null;
  terakhirUji: string | null;
}

export const MODEL_DEFAULT_TINGKAT_1 = 'gemini-3.1-flash-lite';
export const MODEL_DEFAULT_TINGKAT_2 = 'gemini-3.5-flash-lite';
export const MODEL_DEFAULT_TINGKAT_3 = 'gemini-3.6-flash';

export const KONFIGURASI_DEFAULT: LLMKonfigurasi = {
  diaktifkan: false,
  modeHanyaStruktur: true,
  tingkat: [
    { nama: 'Tingkat 1', modelId: MODEL_DEFAULT_TINGKAT_1, kunciIndex: [] },
    { nama: 'Tingkat 2', modelId: MODEL_DEFAULT_TINGKAT_2, kunciIndex: [] },
    { nama: 'Tingkat 3', modelId: MODEL_DEFAULT_TINGKAT_3, kunciIndex: [] },
  ],
  promptSistem: `Anda membantu memetakan kolom berkas sensus/scan ke model data statistik umat.
Tanggapan harus berupa JSON tunggal dengan skema:
{"peta": [{"berkas": "Nama header di berkas", "model": "nama|jenisKelamin|tanggalLahir|agama|status|KUB|idKK|alamat|id", "alasan": "string"}], "diabaikan": ["header yang tidak ada padanannya"]}
Model yang tersedia: nama, jenisKelamin, tanggalLahir, agama, status, KUB, idKK, alamat, id.
Jangan pernah menebak nilai asli. Jika tidak yakin, masukkan ke "diabaikan" dan beri alasan.`,
};
