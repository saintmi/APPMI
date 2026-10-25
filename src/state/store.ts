// ============================================================================
// Zustand store inti (Fase 3/4) — state UI + snapshot untuk persistensi + audit/undo.
// Seluruh logika bisnis tetap di paket engine (murni, tanpa React).
// ============================================================================

import { create } from 'zustand';
import type {
  Settings, Kk, Umat, Peristiwa, RiwayatPindahAlamat,
  AuditLogEntry, Penanda, KeputusanDuplikat, Lampiran,
} from '../engine/types.ts';
import { buatEntriAudit, seedAuditCounter } from '../engine/audit.ts';
import { terapkanStatus, terapkanStatusUntuk } from '../engine/status.ts';
import { IdAllocator, ID_UMAT, ID_KK, ID_PERISTIWA } from '../engine/idAllocator.ts';
import { STATUS_AKTIF } from '../engine/types.ts';

export interface Snapshot {
  settings: Settings | null;
  umat: Umat[];
  kk: Kk[];
  peristiwa: Peristiwa[];
  riwayat: RiwayatPindahAlamat[];
  audit: AuditLogEntry[];
  penanda: Penanda[];
  keputusanDuplikat: KeputusanDuplikat[];
  indeksUndo: number;
}

export interface Persistensi {
  muat(): Promise<Snapshot | null>;
  simpan(s: Snapshot): Promise<void>;
}

export type StatusSimpan = 'siap' | 'ada-perubahan' | 'menyimpan' | 'tersimpan' | 'gagal';

export interface UiState {
  cariUmat: string;
  cariKK: string;
  filterKUBPenanda: string;
  filterJenisPenanda: string;
}

export interface PesanToast {
  id: number;
  teks: string;
  jenis: 'info' | 'ok' | 'galat';
}

export interface PermintaanKonfirmasi {
  judul: string;
  pesan: string;
  labelKonfirmasi: string;
  tone: 'biasa' | 'berbahaya';
  resolver: (ya: boolean) => void;
}

export interface AplikasiState {
  settings: Settings | null;
  umat: Umat[];
  kk: Kk[];
  peristiwa: Peristiwa[];
  riwayat: RiwayatPindahAlamat[];
  audit: AuditLogEntry[];
  penanda: Penanda[];
  keputusanDuplikat: KeputusanDuplikat[];
  indeksUndo: number;
  terakhirTersimpan: string | null;
  statusSimpan: StatusSimpan;
  galatSimpan: string | null;
  ui: UiState;
  pesan: PesanToast[];
  konfirmasi: PermintaanKonfirmasi | null;
  muatDariSnapshot(s: Snapshot): void;
  tandaiTersimpan(ts: string): void;
  tandaiStatus(status: StatusSimpan, pesan?: string | null): void;
  persistedPerangkatMuat(persistensi: Persistensi): Promise<void>;
  setSettings(s: Settings): void;
  tambahUmat(u: Umat): void;
  ubahUmat(id: string, patch: Partial<Umat>): void;
  hapusUmat(id: string): void;
  tambahKk(k: Kk): void;
  ubahKk(id: string, patch: Partial<Kk>): void;
  hapusKk(id: string): void;
  tambahPeristiwa(p: Peristiwa): void;
  ubahPeristiwa(id: string, patch: Partial<Peristiwa>): void;
  hapusPeristiwa(id: string): void;
  tambahRiwayat(r: RiwayatPindahAlamat): void;
  gabungUmat(idBertahan: string, idHilang: string): void;
  tambahKeputusanDuplikat(idPasangan: string, idA: string, idB: string, keputusan: 'gabung' | 'beda-orang'): void;
  catatPerubahan(aksi: AuditLogEntry['aksi'], entitas: string, idEntitas: string, sebelum: unknown, sesudah: unknown): void;
  canUndo(): boolean;
  canRedo(): boolean;
  undo(): void;
  redo(): void;
  setPenanda(p: Penanda[]): void;
  setUi(patch: Partial<UiState>): void;
  tampilkanPesan(teks: string, jenis?: 'info' | 'ok' | 'galat'): void;
  tutupPesan(id: number): void;
  mintaKonfirmasi(opts: { judul: string; pesan: string; labelKonfirmasi?: string; tone?: 'biasa' | 'berbahaya' }): Promise<boolean>;
  tutupKonfirmasi(ya: boolean): void;
  unggahLampiran(entitas: 'umat' | 'kk', idEntitas: string, file: File): Promise<void>;
  hapusLampiran(entitas: 'umat' | 'kk', idEntitas: string, lampiranId: string): void;
}

export function snapshotDari(st: AplikasiState): Snapshot {
  return {
    settings: st.settings,
    umat: [...st.umat],
    kk: [...st.kk],
    peristiwa: [...st.peristiwa],
    riwayat: [...st.riwayat],
    audit: [...st.audit],
    penanda: [...st.penanda],
    keputusanDuplikat: [...st.keputusanDuplikat],
    indeksUndo: st.indeksUndo,
  };
}

function ambilSnapshotLengkap(st: AplikasiState): unknown {
  return {
    settings: st.settings,
    umat: st.umat,
    kk: st.kk,
    peristiwa: st.peristiwa,
    riwayat: st.riwayat,
    penanda: st.penanda,
    keputusanDuplikat: st.keputusanDuplikat,
  };
}

const alokasiUmat = new IdAllocator(ID_UMAT);
const alokasiKk = new IdAllocator(ID_KK);
const alokasiPeristiwa = new IdAllocator(ID_PERISTIWA);

const ACUAN_DEFAULT = '31/12/2026';

/** Materialisasi status turunan ke rekaman (kolom Status ikut diekspor ke Excel). */
function denganStatus(st: AplikasiState): AplikasiState {
  const acuan = st.settings?.tanggalAcuan || ACUAN_DEFAULT;
  return { ...st, umat: terapkanStatus(st.umat, st.peristiwa, acuan) };
}

/** Materialisasi status hanya untuk orang yang terkena perubahan. */
function denganStatusUntuk(st: AplikasiState, ids: string[]): AplikasiState {
  if (ids.length === 0) return st;
  const acuan = st.settings?.tanggalAcuan || ACUAN_DEFAULT;
  return { ...st, umat: terapkanStatusUntuk(st.umat, st.peristiwa, acuan, ids) };
}

let penghitungPesan = 0;

export const useAplikasi = create<AplikasiState>((set, get) => ({
  settings: null,
  umat: [],
  kk: [],
  peristiwa: [],
  riwayat: [],
  audit: [],
  penanda: [],
  keputusanDuplikat: [],
  indeksUndo: -1,
  terakhirTersimpan: null,
  statusSimpan: 'siap',
  galatSimpan: null,
  ui: { cariUmat: '', cariKK: '', filterKUBPenanda: 'all', filterJenisPenanda: 'all' },
  pesan: [],
  konfirmasi: null,

  muatDariSnapshot(s: Snapshot) {
    alokasiUmat.seed(s.umat.map((u) => u.id));
    alokasiKk.seed(s.kk.map((k) => k.id));
    alokasiPeristiwa.seed(s.peristiwa.map((p) => p.id));
    seedAuditCounter((s.audit ?? []).map((a) => Number(a.id) || 0));
    set((st) => {
      const dasar = {
        ...st,
        settings: s.settings,
        umat: s.umat,
        kk: s.kk,
        peristiwa: s.peristiwa,
        riwayat: s.riwayat,
        audit: s.audit,
        penanda: s.penanda,
        keputusanDuplikat: s.keputusanDuplikat,
        indeksUndo: s.indeksUndo,
      };
      return denganStatus(dasar);
    });
  },

  tandaiTersimpan(ts: string) {
    set({ terakhirTersimpan: ts });
  },

  tandaiStatus(status: StatusSimpan, pesan: string | null = null) {
    set({ statusSimpan: status, galatSimpan: status === 'gagal' ? pesan : null });
  },

  async persistedPerangkatMuat(persistensi: Persistensi) {
    const s = await persistensi.muat();
    if (s) get().muatDariSnapshot(s);
  },

  setSettings(s: Settings) {
    set((st) => {
      const sebelum = ambilSnapshotLengkap(st);
      const next = denganStatus({ ...st, settings: s });
      const entri = buatEntriAudit('UBAH', 'Settings', s.namaLingkungan, sebelum, ambilSnapshotLengkap(next));
      return tambahEntriKeState(next, entri);
    });
  },

  tambahUmat(u: Umat) {
    const id = alokasiUmat.alokasi();
    const baru: Umat = { ...u, id, status: STATUS_AKTIF, lampiran: u.lampiran ?? [] };
    set((st) => {
      const sebelum = ambilSnapshotLengkap(st);
      const next = { ...st, umat: [...st.umat, baru] };
      const entri = buatEntriAudit('TAMBAH', 'Umat', baru.id, sebelum, ambilSnapshotLengkap(next));
      return tambahEntriKeState(next, entri);
    });
  },

  ubahUmat(id: string, patch: Partial<Umat>) {
    set((st) => {
      const sebelum = ambilSnapshotLengkap(st);
      const { status: _statusDiabaikan, ...isi } = patch;
      void _statusDiabaikan;
      const identitasBerubah =
        isi.nama !== undefined || isi.jenisKelamin !== undefined || isi.tanggalLahir !== undefined;
      const next = {
        ...st,
        umat: st.umat.map((u) => (u.id === id ? { ...u, ...isi } : u)),
        peristiwa: identitasBerubah
          ? st.peristiwa.map((p) =>
              p.idUmat === id
                ? {
                    ...p,
                    nama: isi.nama ?? p.nama,
                    jenisKelamin: isi.jenisKelamin ?? p.jenisKelamin,
                    tanggalLahir: isi.tanggalLahir ?? p.tanggalLahir,
                    lingkungan: st.settings?.namaLingkungan ?? p.lingkungan,
                  }
                : p,
            )
          : st.peristiwa,
      };
      const entri = buatEntriAudit('UBAH', 'Umat', id, sebelum, ambilSnapshotLengkap(next));
      return tambahEntriKeState(next, entri);
    });
  },

  hapusUmat(id: string) {
    set((st) => {
      const sebelum = ambilSnapshotLengkap(st);
      const next = {
        ...st,
        umat: st.umat.filter((u) => u.id !== id),
        peristiwa: st.peristiwa.filter((p) => p.idUmat !== id),
      };
      const entri = buatEntriAudit('HAPUS', 'Umat', id, sebelum, ambilSnapshotLengkap(next));
      return tambahEntriKeState(next, entri);
    });
    alokasiUmat.bebas(id);
  },

  tambahKk(k: Kk) {
    const id = alokasiKk.alokasi();
    const baru: Kk = { ...k, id, lampiran: k.lampiran ?? [] };
    set((st) => {
      const sebelum = ambilSnapshotLengkap(st);
      const next = { ...st, kk: [...st.kk, baru] };
      const entri = buatEntriAudit('TAMBAH', 'Kk', baru.id, sebelum, ambilSnapshotLengkap(next));
      return tambahEntriKeState(next, entri);
    });
  },

  ubahKk(id: string, patch: Partial<Kk>) {
    set((st) => {
      const sebelum = ambilSnapshotLengkap(st);
      const next = {
        ...st,
        kk: st.kk.map((k) => (k.id === id ? { ...k, ...patch } : k)),
      };
      const entri = buatEntriAudit('UBAH', 'Kk', id, sebelum, ambilSnapshotLengkap(next));
      return tambahEntriKeState(next, entri);
    });
  },

  hapusKk(id: string) {
    set((st) => {
      const sebelum = ambilSnapshotLengkap(st);
      const next = {
        ...st,
        kk: st.kk.filter((k) => k.id !== id),
        umat: st.umat.map((u) => (u.idKK === id ? { ...u, idKK: '' } : u)),
      };
      const entri = buatEntriAudit('HAPUS', 'Kk', id, sebelum, ambilSnapshotLengkap(next));
      return tambahEntriKeState(next, entri);
    });
    alokasiKk.bebas(id);
  },

  unggahLampiran(entitas: 'umat' | 'kk', idEntitas: string, file: File): Promise<void> {
    return new Promise((resolve, reject) => {
      const pembaca = new FileReader();
      pembaca.onload = () => {
        const data = pembaca.result as ArrayBuffer;
        const lampiran: Lampiran = {
          id: 'L' + Date.now(),
          nama: file.name,
          tipe: file.type,
          ukuran: file.size,
          sumber: 'lokal',
          idDrive: undefined,
          diunggahPada: new Date().toISOString(),
          data,
        };
        set((st) => {
          const sebelum = ambilSnapshotLengkap(st);
          let next: AplikasiState;
          if (entitas === 'umat') {
            next = {
              ...st,
              umat: st.umat.map((u) =>
                u.id === idEntitas
                  ? { ...u, lampiran: [...(u.lampiran ?? []), lampiran] }
                  : u,
              ),
            };
          } else {
            next = {
              ...st,
              kk: st.kk.map((k) =>
                k.id === idEntitas
                  ? { ...k, lampiran: [...(k.lampiran ?? []), lampiran] }
                  : k,
              ),
            };
          }
          const entri = buatEntriAudit(
            'TAMBAH',
            entitas.toUpperCase(),
            idEntitas,
            sebelum,
            ambilSnapshotLengkap(next),
          );
          return tambahEntriKeState(next, entri);
        });
        resolve();
      };
      pembaca.onerror = () => reject(new Error('Gagal membaca file.'));
      pembaca.readAsArrayBuffer(file);
    });
  },

  hapusLampiran(entitas: 'umat' | 'kk', idEntitas: string, lampiranId: string): void {
    set((st) => {
      const sebelum = ambilSnapshotLengkap(st);
      let next: AplikasiState;
      if (entitas === 'umat') {
        next = {
          ...st,
          umat: st.umat.map((u) =>
            u.id === idEntitas
              ? { ...u, lampiran: (u.lampiran ?? []).filter((l) => l.id !== lampiranId) }
              : u,
          ),
        };
      } else {
        next = {
          ...st,
          kk: st.kk.map((k) =>
            k.id === idEntitas
              ? { ...k, lampiran: (k.lampiran ?? []).filter((l) => l.id !== lampiranId) }
              : k,
          ),
        };
      }
      const entri = buatEntriAudit(
        'HAPUS',
        entitas.toUpperCase(),
        idEntitas,
        sebelum,
        ambilSnapshotLengkap(next),
      );
      return tambahEntriKeState(next, entri);
    });
  },

  tambahPeristiwa(p: Peristiwa) {
    const id = p.id && p.id.trim() ? p.id : alokasiPeristiwa.alokasi();
    const baru: Peristiwa = { ...p, id };
    set((st) => {
      const sebelum = ambilSnapshotLengkap(st);
      const dasar = { ...st, peristiwa: [...st.peristiwa, baru] };
      const next = denganStatusUntuk(dasar, [baru.idUmat]);
      const entri = buatEntriAudit('TAMBAH', 'Peristiwa', baru.id, sebelum, ambilSnapshotLengkap(next));
      return tambahEntriKeState(next, entri);
    });
  },

  ubahPeristiwa(id: string, patch: Partial<Peristiwa>) {
    set((st) => {
      const sebelum = ambilSnapshotLengkap(st);
      const lama = st.peristiwa.find((p) => p.id === id);
      const dasar = {
        ...st,
        peristiwa: st.peristiwa.map((p) => (p.id === id ? { ...p, ...patch } : p)),
      };
      const ids = lama ? [lama.idUmat] : [];
      if (patch.idUmat) ids.push(patch.idUmat);
      const next = denganStatusUntuk(dasar, ids);
      const entri = buatEntriAudit('UBAH', 'Peristiwa', id, sebelum, ambilSnapshotLengkap(next));
      return tambahEntriKeState(next, entri);
    });
  },

  hapusPeristiwa(id: string) {
    set((st) => {
      const sebelum = ambilSnapshotLengkap(st);
      const lama = st.peristiwa.find((p) => p.id === id);
      const dasar = { ...st, peristiwa: st.peristiwa.filter((p) => p.id !== id) };
      const next = denganStatusUntuk(dasar, lama ? [lama.idUmat] : []);
      const entri = buatEntriAudit('HAPUS', 'Peristiwa', id, sebelum, ambilSnapshotLengkap(next));
      return tambahEntriKeState(next, entri);
    });
  },

  tambahRiwayat(r: RiwayatPindahAlamat) {
    set((st) => {
      const sebelum = ambilSnapshotLengkap(st);
      const next = denganStatus({ ...st, riwayat: [...st.riwayat, r] });
      const entri = buatEntriAudit('TAMBAH', 'RiwayatPindahAlamat', r.id, sebelum, ambilSnapshotLengkap(next));
      return tambahEntriKeState(next, entri);
    });
  },

  gabungUmat(idBertahan: string, idHilang: string) {
    set((st) => {
      const sebelum = ambilSnapshotLengkap(st);
      const hilang = st.umat.find((u) => u.id === idHilang);
      const dasar = {
        ...st,
        peristiwa: st.peristiwa.map((p) => (p.idUmat === idHilang ? { ...p, idUmat: idBertahan } : p)),
        umat: st.umat
          .filter((u) => u.id !== idHilang)
          .map((u) => {
            if (u.id !== idBertahan) return u;
            if (!u.idKK && hilang?.idKK) return { ...u, idKK: hilang.idKK };
            return u;
          }),
      };
      const next = denganStatusUntuk(dasar, [idBertahan]);
      const entri = buatEntriAudit('HAPUS', 'Umat', idHilang, sebelum, ambilSnapshotLengkap(next));
      return tambahEntriKeState(next, entri);
    });
    alokasiUmat.bebas(idHilang);
  },

  tambahKeputusanDuplikat(idPasangan: string, idA: string, idB: string, keputusan: 'gabung' | 'beda-orang') {
    set((st) => {
      const sebelum = ambilSnapshotLengkap(st);
      const entri: KeputusanDuplikat = {
        idPasangan,
        idA,
        idB,
        keputusan: keputusan === 'gabung' ? 'gabung' : 'beda-orang',
      };
      const next = { ...st, keputusanDuplikat: [...st.keputusanDuplikat, entri] };
      const auditEntri = buatEntriAudit('TAMBAH', 'KeputusanDuplikat', idPasangan, sebelum, ambilSnapshotLengkap(next));
      return tambahEntriKeState(next, auditEntri);
    });
  },

  catatPerubahan(aksi, entitas, idEntitas, sebelum, sesudah) {
    set((st) => {
      const entri = buatEntriAudit(aksi, entitas, idEntitas, sebelum, sesudah);
      return tambahEntriKeState(st, entri);
    });
  },

  canUndo() {
    return get().indeksUndo >= 0;
  },

  canRedo() {
    return get().indeksUndo < get().audit.length - 1;
  },

  undo() {
    const st = get();
    if (!st.canUndo()) return;
    const entri = st.audit[st.indeksUndo];
    const sebelum = entri.sebelum as {
      settings?: Settings | null; umat?: Umat[]; kk?: Kk[]; peristiwa?: Peristiwa[];
      riwayat?: RiwayatPindahAlamat[]; penanda?: Penanda[];
    };
    set((s) => denganStatus({
      ...s,
      settings: sebelum.settings ?? null,
      umat: sebelum.umat ?? [],
      kk: sebelum.kk ?? [],
      peristiwa: sebelum.peristiwa ?? [],
      riwayat: sebelum.riwayat ?? [],
      penanda: sebelum.penanda ?? [],
      audit: s.audit,
      indeksUndo: s.indeksUndo - 1,
    }));
  },

  redo() {
    const st = get();
    if (!st.canRedo()) return;
    const entri = st.audit[st.indeksUndo + 1];
    const sesudah = entri.sesudah as {
      settings?: Settings | null; umat?: Umat[]; kk?: Kk[]; peristiwa?: Peristiwa[];
      riwayat?: RiwayatPindahAlamat[]; penanda?: Penanda[];
    };
    set((s) => denganStatus({
      ...s,
      settings: sesudah.settings ?? null,
      umat: sesudah.umat ?? [],
      kk: sesudah.kk ?? [],
      peristiwa: sesudah.peristiwa ?? [],
      riwayat: sesudah.riwayat ?? [],
      penanda: sesudah.penanda ?? [],
      audit: s.audit,
      indeksUndo: s.indeksUndo + 1,
    }));
  },

  setPenanda(p: Penanda[]) {
    set({ penanda: p });
  },

  setUi(patch: Partial<UiState>) {
    set((st) => ({ ui: { ...st.ui, ...patch } }));
  },

  tampilkanPesan(teks: string, jenis: 'info' | 'ok' | 'galat' = 'info') {
    penghitungPesan += 1;
    const id = penghitungPesan;
    set((st) => ({ pesan: [...st.pesan, { id, teks, jenis }] }));
  },

  tutupPesan(id: number) {
    set((st) => ({ pesan: st.pesan.filter((p) => p.id !== id) }));
  },

  mintaKonfirmasi(opts) {
    return new Promise<boolean>((resolve) => {
      set({
        konfirmasi: {
          judul: opts.judul,
          pesan: opts.pesan,
          labelKonfirmasi: opts.labelKonfirmasi ?? 'Ya, lanjutkan',
          tone: opts.tone ?? 'biasa',
          resolver: resolve,
        },
      });
    });
  },

  tutupKonfirmasi(ya: boolean) {
    const k = get().konfirmasi;
    if (!k) return;
    set({ konfirmasi: null });
    k.resolver(ya);
  },
}));

// Tambah entri audit ke state, batasi 50 langkah terakhir, geser indeks.
function tambahEntriKeState(st: AplikasiState, entri: AuditLogEntry): Partial<AplikasiState> {
  const baru = {
    ...st,
    audit: [...st.audit.slice(0, st.indeksUndo + 1), entri],
    indeksUndo: st.indeksUndo + 1,
  };
  if (baru.audit.length > 50) {
    baru.audit.shift();
    baru.indeksUndo -= 1;
  }
  return baru;
}

// ============================================================================
// Turunan status/rekap/penanda dari state (dihitung, tidak disimpan)
// ============================================================================

import { deriveStatus, hitungUmur } from '../engine/status.ts';
import { computeRekap, computeRekapByKUB } from '../engine/rekap.ts';
import { computeWarnings } from '../engine/warnings.ts';
import { buildIdentitasPeristiwa, sinkronkanPeristiwaDariUmat } from '../engine/sync.ts';

export interface UmatDenganStatus extends Umat {
  umur: number | null;
  peristiwa: Peristiwa[];
}

export function umatDenganStatus(st: AplikasiState): UmatDenganStatus[] {
  const perUmat = new Map<string, Peristiwa[]>();
  for (const p of st.peristiwa) {
    const arr = perUmat.get(p.idUmat) ?? [];
    arr.push(p);
    perUmat.set(p.idUmat, arr);
  }
  const acuan = st.settings?.tanggalAcuan || ACUAN_DEFAULT;
  return st.umat.map((u) => {
    const ps = perUmat.get(u.id) ?? [];
    const status = deriveStatus(ps, acuan);
    return {
      ...u,
      status: status.status,
      umur: hitungUmur(u.tanggalLahir, acuan),
      peristiwa: ps,
    };
  });
}

export function rekapDariState(st: AplikasiState) {
  return computeRekap(st.umat, st.peristiwa, st.settings ?? {});
}

export function rekapByKUBDariState(st: AplikasiState) {
  return computeRekapByKUB(st.umat, st.peristiwa, st.settings ?? {});
}

export function penandaDariState(st: AplikasiState): Penanda[] {
  return computeWarnings(st.umat, st.kk, st.peristiwa, st.settings ?? {});
}

export function identitasPeristiwa(st: AplikasiState) {
  return buildIdentitasPeristiwa(st.umat);
}

export function sinkronkanPeristiwa(
  p: Peristiwa,
  st: AplikasiState,
): Peristiwa {
  return sinkronkanPeristiwaDariUmat(
    p,
    buildIdentitasPeristiwa(st.umat),
    st.settings?.namaLingkungan ?? '',
  );
}

export type { Penanda } from '../engine/types.ts';
