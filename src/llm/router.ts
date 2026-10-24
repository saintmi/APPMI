// ============================================================================
// Router LLM Gemini — multi-kunci round-robin + multi-model fallback tingkat
// (Fase 6, opsional, default mati)
// ============================================================================

import { type LLMKunci, type LLMKonfigurasi, type LLMRespons, KONFIGURASI_DEFAULT, MODEL_DEFAULT_TINGKAT_1, MODEL_DEFAULT_TINGKAT_2, MODEL_DEFAULT_TINGKAT_3 } from './types.ts';
import { panggilGemini, ekstraksiJSON } from './client.ts';

export interface RouterOpsi {
  prompt: string;
  responseMimeType?: 'application/json' | 'text/plain';
}

export interface RouterHasil {
  respons: LLMRespons;
  cobaKe: number;
  tingkatDipakai: string;
  modelDipakai: string;
  kunciDipakai: string;
}

export class LLMRouter {
  private penunjukTingkat: Record<number, number> = {}; // indeks tingkat -> penunjuk kunci
  readonly konfigurasi: LLMKonfigurasi;
  readonly kunci: LLMKunci[];

  constructor(config: LLMKonfigurasi, keys: LLMKunci[]) {
    this.konfigurasi = config;
    this.kunci = keys;
    for (let i = 0; i < config.tingkat.length; i++) {
      this.penunjukTingkat[i] = 0;
    }
  }

  private kunciAktifDiTingkat(tingkatIdx: number): number[] {
    const tingkat = this.konfigurasi.tingkat[tingkatIdx];
    const daftar: number[] = [];
    for (const ci of tingkat.kunciIndex) {
      const k = this.kunci[ci];
      if (k.aktif && (!k.istirahatSampai || Date.now() >= k.istirahatSampai)) {
        daftar.push(ci);
      }
    }
    return daftar;
  }

  private tandaiIstirahat(ci: number, delayMs: number) {
    const k = this.kunci[ci];
    k.istirahatSampai = Date.now() + delayMs;
    k.galatTerakhir = `rate-limited, istirahat ${Math.round(delayMs / 1000)} detik`;
  }

  private tandaiGagal(ci: number, pesan: string) {
    const k = this.kunci[ci];
    k.galatTerakhir = pesan;
    // Bila 401/403, nonaktifkan kunci
    if (pesan.includes('401') || pesan.includes('403')) {
      k.aktif = false;
    }
  }

  private ambilDelayDariPesan(pesan: string): number | null {
    // Coba ambil retryDelay dari pesan error Gemini (mis. "retryDelay": "30s")
    const m = pesan.match(/retryDelay"?\s*:\s*"?(\d+)s"?/i);
    if (m) return parseInt(m[1], 10) * 1000;
    const m2 = pesan.match(/(\d+)\s*detik/i);
    if (m2) return parseInt(m2[1], 10) * 1000;
    return null;
  }

  async panggil(opsi: RouterOpsi): Promise<RouterHasil> {
    if (!this.konfigurasi.diaktifkan) {
      throw new Error('LLM belum diaktifkan.');
    }
    const kunciAktif = this.kunci.filter((k) => k.aktif);
    if (kunciAktif.length === 0) {
      throw new Error('Tidak ada kunci LLM aktif.');
    }

    let cobaKe = 0;
    const maksPercobaan = this.konfigurasi.tingkat.length * 3; // 3 kunci per tingkat maksimal

    for (let t = 0; t < this.konfigurasi.tingkat.length; t++) {
      const tingkat = this.konfigurasi.tingkat[t];
      const daftarKunci = this.kunciAktifDiTingkat(t);
      if (daftarKunci.length === 0) continue;

      for (let _i = 0; _i < daftarKunci.length; _i++) {
        const ci = daftarKunci[this.penunjukTingkat[t] % daftarKunci.length];
        cobaKe += 1;
        if (cobaKe > maksPercobaan) break;

        const k = this.kunci[ci];
        try {
          const teks = await panggilGemini({
            modelId: tingkat.modelId,
            kunci: k.nilai,
            prompt: opsi.prompt,
            responseMimeType: opsi.responseMimeType,
            timeoutMs: 25_000,
          });
          const parsed = opsi.responseMimeType === 'application/json' ? ekstraksiJSON(teks) : teks;
          return {
            respons: {
              teks: typeof parsed === 'string' ? parsed : JSON.stringify(parsed),
              modelTerpakai: tingkat.modelId,
              kunciTerpakai: k.label,
              durasiMs: 0,
            },
            cobaKe,
            tingkatDipakai: tingkat.nama,
            modelDipakai: tingkat.modelId,
            kunciDipakai: k.label,
          };
        } catch (err) {
          const pesan = err instanceof Error ? err.message : String(err);
          this.tandaiGagal(ci, pesan);
          const delay = this.ambilDelayDariPesan(pesan);
          if (delay) this.tandaiIstirahat(ci, delay);
          // Coba kunci berikutnya di tingkat yang sama
        }
        this.penunjukTingkat[t] += 1;
      }
    }

    throw new Error('Semua slot LLM habis. Aplikasi tetap berjalan dengan aturan saja.');
  }
}

export function buatRouterDariEnv(kunciDariEnv: Record<string, string>): LLMRouter {
  const kunci: LLMKunci[] = Object.entries(kunciDariEnv).map(([label, nilai]) => ({
    label,
    nilai,
    aktif: true,
    pemakaianHariIni: 0,
    galatTerakhir: null,
  }));
  const konfigurasi: LLMKonfigurasi = JSON.parse(JSON.stringify(KONFIGURASI_DEFAULT));
  konfigurasi.tingkat = [
    { nama: 'Tingkat 1', modelId: MODEL_DEFAULT_TINGKAT_1, kunciIndex: kunci.map((_, idx) => idx) },
    { nama: 'Tingkat 2', modelId: MODEL_DEFAULT_TINGKAT_2, kunciIndex: kunci.map((_, idx) => idx) },
    { nama: 'Tingkat 3', modelId: MODEL_DEFAULT_TINGKAT_3, kunciIndex: kunci.map((_, idx) => idx) },
  ];
  return new LLMRouter(konfigurasi, kunci);
}
