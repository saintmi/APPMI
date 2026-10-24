// ============================================================================
// Zustand state LLM — Fase 6 (opsional, default mati)
// Kunci hanya di memori sesi, tidak tertulis ke disk.
// ============================================================================

import { create } from 'zustand';
import { buatRouterDariEnv, type LLMRouter } from './router.ts';
import { type LLMKonfigurasi, type LLMKunci, type LLMStatus, KONFIGURASI_DEFAULT } from './types.ts';

function hitungStatus(kunci: LLMKunci[], router: LLMRouter | null, diaktifkan: boolean): LLMStatus {
  const aktif = kunci.filter((k) => k.aktif).length;
  const istirahat = kunci.filter((k) => k.istirahatSampai && Date.now() < k.istirahatSampai).length;
  return {
    diaktifkan,
    totalKunci: kunci.length,
    kunciAktif: aktif,
    kunciIstirahat: istirahat,
    modelTingkat: (router?.konfigurasi.tingkat ?? []).map((t) => `${t.nama}: ${t.modelId}`),
    galatTerakhir: null,
    terakhirUji: null,
  };
}

interface LLMState {
  konfigurasi: LLMKonfigurasi;
  kunci: LLMKunci[];
  router: LLMRouter | null;
  status: LLMStatus;
  inisialisasiDariEnv(): void;
  tambahKunci(label: string, nilai: string): void;
  hapusKunci(index: number): void;
  ubahAktifKunci(index: number, aktif: boolean): void;
  ubahKonfigurasi(patch: Partial<LLMKonfigurasi>): void;
  resetKeDefault(): void;
  statusLengkap(): LLMStatus;
}

export const useLLM = create<LLMState>((set, get) => ({
  konfigurasi: JSON.parse(JSON.stringify(KONFIGURASI_DEFAULT)),
  kunci: [],
  router: null,
  status: {
    diaktifkan: false,
    totalKunci: 0,
    kunciAktif: 0,
    kunciIstirahat: 0,
    modelTingkat: [],
    galatTerakhir: null,
    terakhirUji: null,
  },

  inisialisasiDariEnv() {
    const kunciDariEnv: Record<string, string> = {};
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const env = (import.meta as any).env ?? {};
    for (const [key, val] of Object.entries(env)) {
      if (key.startsWith('VITE_GOOGLE_API_KEY_') || key === 'GOOGLE_API_KEY_') {
        if (typeof val === 'string' && val.length > 0) {
          kunciDariEnv[key] = val;
        }
      }
    }
    // Urutkan menurut angka suffix
    const entri = Object.entries(kunciDariEnv).sort((a, b) => {
      const na = a[0].match(/\d+$/)?.[0] ?? '0';
      const nb = b[0].match(/\d+$/)?.[0] ?? '0';
      return parseInt(na, 10) - parseInt(nb, 10);
    });
    const kunciTerurut: Record<string, string> = {};
    for (const [k, v] of entri) kunciTerurut[k] = v;

    const kunci: LLMKunci[] = Object.entries(kunciTerurut).map(([label, nilai]) => ({
      label,
      nilai,
      aktif: true,
      pemakaianHariIni: 0,
      galatTerakhir: null,
    }));
    const router = buatRouterDariEnv(kunciTerurut);
    set({
      kunci,
      router,
      konfigurasi: JSON.parse(JSON.stringify(KONFIGURASI_DEFAULT)),
      status: hitungStatus(kunci, router, false),
    });
  },

  tambahKunci(label: string, nilai: string) {
    set((st) => {
      const kunciBaru = [...st.kunci, { label, nilai, aktif: true, pemakaianHariIni: 0, galatTerakhir: null }];
      const env: Record<string, string> = {};
      for (const k of kunciBaru) env[k.label] = k.nilai;
      const router = buatRouterDariEnv(env);
      return { kunci: kunciBaru, router, status: hitungStatus(kunciBaru, router, st.konfigurasi.diaktifkan) };
    });
  },

  hapusKunci(index: number) {
    set((st) => {
      const kunciBaru = st.kunci.filter((_, i) => i !== index);
      const env: Record<string, string> = {};
      for (const k of kunciBaru) env[k.label] = k.nilai;
      const router = kunciBaru.length > 0 ? buatRouterDariEnv(env) : null;
      return { kunci: kunciBaru, router, status: hitungStatus(kunciBaru, router, st.konfigurasi.diaktifkan) };
    });
  },

  ubahAktifKunci(index: number, aktif: boolean) {
    set((st) => {
      const kunciBaru = [...st.kunci];
      kunciBaru[index].aktif = aktif;
      const env: Record<string, string> = {};
      for (const k of kunciBaru) env[k.label] = k.nilai;
      const router = buatRouterDariEnv(env);
      return { kunci: kunciBaru, router, status: hitungStatus(kunciBaru, router, st.konfigurasi.diaktifkan) };
    });
  },

  ubahKonfigurasi(patch: Partial<LLMKonfigurasi>) {
    set((st) => {
      const cfg = { ...st.konfigurasi, ...patch };
      return {
        konfigurasi: cfg,
        status: hitungStatus(st.kunci, st.router, cfg.diaktifkan),
      };
    });
  },

  resetKeDefault() {
    set((st) => {
      const cfg = JSON.parse(JSON.stringify(KONFIGURASI_DEFAULT));
      return {
        konfigurasi: cfg,
        status: hitungStatus(st.kunci, st.router, false),
      };
    });
  },

  statusLengkap(): LLMStatus {
    return get().status;
  },
}));
