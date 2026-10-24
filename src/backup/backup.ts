// ============================================================================
// Backup — gabungan snapshot, enkripsi, dan sinkron Git (Fase 3 lanjutan).
// Kata sandi cadangan hanya ada di memori sesi, tidak disimpan.
// ============================================================================

import { create } from 'zustand';
import {
  enkripsiSnapshot, dekripsiSnapshot, kompresi, dekompresi, cekWebCryptoTersedia,
} from './crypto.ts';
import {
  cekRepoPrivat, daftarVersi, ambilBerkasCommit, simpanBerkas,
  type KonfigurasiGit, type VersiGit,
} from './git.ts';
import { useAplikasi, snapshotDari } from '../state/store.ts';

export interface StatusBackup {
  webCrypto: boolean;
  terdaftar: boolean;
  repoPrivat: boolean | null;
  terkunci: boolean; // kata sandi belum dimasukkan sesi ini
  terakhirSinkron: string | null;
  antrean: number;
  sinkronSedangBerjalan: boolean;
  errorTerakhir: string | null;
}

interface BackupState {
  config: KonfigurasiGit | null;
  repoPrivat: boolean | null;
  sandi: string | null;
  terakhirSinkron: string | null;
  antrean: Array<{ waktu: number; aksi: 'SIMPAN' }>;
  sinkronSedangBerjalan: boolean;
  errorTerakhir: string | null;
  setConfig(k: KonfigurasiGit | null): void;
  setSandi(sandi: string | null): void;
  cekKoneksi(): Promise<boolean>;
  simpanKeGit(): Promise<void>;
  tarikDariGit(sha: string): Promise<void>;
  daftarVersi(): Promise<VersiGit[]>;
  status(): StatusBackup;
  antreSimpan(): void;
  prosesAntre(): Promise<void>;
}

export const useBackup = create<BackupState>((set, get) => ({
  config: null,
  repoPrivat: null,
  sandi: null,
  terakhirSinkron: null,
  antrean: [],
  sinkronSedangBerjalan: false,
  errorTerakhir: null,

  setConfig(k: KonfigurasiGit | null) {
    set({ config: k, errorTerakhir: null });
  },

  setSandi(sandi: string | null) {
    set({ sandi, errorTerakhir: null });
  },

  async cekKoneksi(): Promise<boolean> {
    const k = get().config;
    if (!k) { set({ errorTerakhir: 'Konfigurasi Git belum diisi.' }); return false; }
    try {
      const info = await cekRepoPrivat(k);
      set({ repoPrivat: info.privat, errorTerakhir: null });
      return info.privat;
    } catch (err) {
      set({ repoPrivat: null, errorTerakhir: err instanceof Error ? err.message : String(err) });
      return false;
    }
  },

  async simpanKeGit(): Promise<void> {
    const k = get().config;
    const sandi = get().sandi;
    if (!k) { set({ errorTerakhir: 'Konfigurasi Git belum diisi.' }); return; }
    if (!sandi) { set({ errorTerakhir: 'Kata sandi cadangan belum dimasukkan.' }); return; }
    if (!cekWebCryptoTersedia()) { set({ errorTerakhir: 'WebCrypto tidak tersedia di browser ini.' }); return; }
    set({ sinkronSedangBerjalan: true, errorTerakhir: null });
    try {
      const st = useAplikasi.getState();
      if (!st.settings?.namaLingkungan) { set({ errorTerakhir: 'Nama lingkungan belum diatur.' }); return; }
      const snapshot = snapshotDari(st);
      const teks = JSON.stringify(snapshot);
      const terkompresi = await kompresi(teks);
      const hasil = await enkripsiSnapshot(terkompresi, sandi);
      const paket = JSON.stringify({ versi: 1, salt: hasil.salt, data: hasil.data });
      const paketB64 = btoa(unescape(encodeURIComponent(paket)));

      // Ambil sha berkas terakhir untuk update (atau buat baru bila belum ada).
      let shaLama: string | undefined;
      try {
        const versi = await daftarVersi(k);
        if (versi.length > 0) {
          const cur = await ambilBerkasCommit(k, versi[0].sha);
          shaLama = cur.sha;
        }
      } catch { shaLama = undefined; }

      const jumlahUmat = st.umat.length;
      const pesan = `Cadangan ${new Date().toISOString().slice(0, 16).replace(/[:]/g, '-')} · rev ${jumlahUmat} umat`;
      await simpanBerkas(k, paketB64, pesan, shaLama);
      const sekarang = new Date().toISOString().slice(0, 19).replace('T', ' ');
      set({ terakhirSinkron: sekarang, antrean: [], sinkronSedangBerjalan: false, errorTerakhir: null });
      useAplikasi.getState().tandaiTersimpan(sekarang);
    } catch (err) {
      set({ sinkronSedangBerjalan: false, errorTerakhir: err instanceof Error ? err.message : String(err) });
    }
  },

  async tarikDariGit(sha: string): Promise<void> {
    const k = get().config;
    const sandi = get().sandi;
    if (!k || !sandi) { set({ errorTerakhir: 'Konfigurasi atau kata sandi belum lengkap.' }); return; }
    set({ sinkronSedangBerjalan: true, errorTerakhir: null });
    try {
      const { konten } = await ambilBerkasCommit(k, sha);
      const paket = JSON.parse(unescape(encodeURIComponent(atob(konten)))) as { versi: number; salt: string; data: string };
      const terkompresi = await dekripsiSnapshot({ salt: paket.salt, data: paket.data }, sandi);
      const teks = await dekompresi(terkompresi);
      const data = JSON.parse(teks);
      await import('../state/persistence.ts').then((m) => m.persistensiDexie.simpan(data));
      useAplikasi.getState().muatDariSnapshot(data);
      const sekarang = new Date().toISOString().slice(0, 19).replace('T', ' ');
      set({ terakhirSinkron: sekarang, sinkronSedangBerjalan: false, errorTerakhir: null });
      useAplikasi.getState().tandaiTersimpan(sekarang);
    } catch (err) {
      set({ sinkronSedangBerjalan: false, errorTerakhir: err instanceof Error ? err.message : String(err) });
    }
  },

  async daftarVersi(): Promise<VersiGit[]> {
    const k = get().config;
    if (!k) throw new Error('Konfigurasi Git belum diisi.');
    return daftarVersi(k);
  },

  status(): StatusBackup {
    return {
      webCrypto: cekWebCryptoTersedia(),
      terdaftar: !!get().config,
      repoPrivat: get().repoPrivat,
      terkunci: !get().sandi,
      terakhirSinkron: get().terakhirSinkron,
      antrean: get().antrean.length,
      sinkronSedangBerjalan: get().sinkronSedangBerjalan,
      errorTerakhir: get().errorTerakhir,
    };
  },

  antreSimpan() {
    set((s) => ({ antrean: [...s.antrean, { waktu: Date.now(), aksi: 'SIMPAN' }] }));
  },

  async prosesAntre() {
    const k = get().config;
    const sandi = get().sandi;
    if (!k || !sandi) return;
    const n = get().antrean.length;
    if (n === 0) return;
    try {
      await get().simpanKeGit();
    } catch { /* error sudah ditangkap di simpanKeGit */ }
  },
}));
