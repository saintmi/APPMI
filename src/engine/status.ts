import {
  STATUS_AKTIF,
  STATUS_MENINGGAL,
  STATUS_PINDAH_AGAMA,
  STATUS_PINDAH_KELUAR,
} from './types.ts';
import { bandingkanTanggal, parseTanggal } from './tanggal.ts';
import type { Umat, Peristiwa } from './types.ts';

export interface PeristiwaUmat {
  id: string;
  jenis: string;
  tanggal: string | null;
}

const PRIORITAS_JENIS: Record<string, number> = {
  KEMATIAN: 5,
  'PINDAH AGAMA': 4,
  MUTASI_KELUAR: 3,
  MUTASI_MASUK: 2,
  DITERIMA_MASUK: 2,
  BAPTIS: 2,
  KOMUNI_PERTAMA: 1,
  PERMINYAKAN_SUCI: 1,
  SEMINARI_BIARA: 1,
  PERKAWINAN_GEREJANI: 1,
  PEMBUBARAN: 1,
  PINDAH_ALAMAT: 1,
};

export const ALASAN_STATUS_AKTIF = 'Terdaftar di lingkungan';

/**
 * deriveStatus — aturan 5.3 plan.md
 * Status ditentukan pada tanggal acuan (31/12/2026).
 * Peristiwa terbaru menentukan status. Kematian bersifat final.
 *
 * Orang yang tercatat di daftar lingkungan berstatus Aktif kecuali ada
 * peristiwa yang mengubahnya (kematian, pindah agama, mutasi keluar).
 */
export function deriveStatus(
  peristiwa: PeristiwaUmat[],
  tanggalAcuan: string,
): { status: string; alasan?: string } {
  const berlaku = peristiwa.filter((p) => {
    if (!p.tanggal) return false;
    if (!parseTanggal(p.tanggal)) return false;
    return bandingkanTanggal(p.tanggal, tanggalAcuan) <= 0;
  });

  if (berlaku.length === 0) {
    return { status: STATUS_AKTIF, alasan: ALASAN_STATUS_AKTIF };
  }

  const sorted = [...berlaku].sort((a, b) => {
    const c = -bandingkanTanggal(a.tanggal!, b.tanggal!);
    if (c !== 0) return c;
    return (PRIORITAS_JENIS[b.jenis] ?? 0) - (PRIORITAS_JENIS[a.jenis] ?? 0);
  });

  const terbaru = sorted[0];
  const j = terbaru.jenis;

  switch (j) {
    case 'KEMATIAN':
      return { status: STATUS_MENINGGAL, alasan: `Kematian pada ${terbaru.tanggal}` };
    case 'PINDAH AGAMA':
      return { status: STATUS_PINDAH_AGAMA, alasan: `Pindah agama pada ${terbaru.tanggal}` };
    case 'MUTASI_KELUAR':
      return { status: STATUS_PINDAH_KELUAR, alasan: `Mutasi keluar pada ${terbaru.tanggal}` };
    case 'MUTASI_MASUK':
    case 'DITERIMA_MASUK':
    case 'BAPTIS':
      return { status: STATUS_AKTIF, alasan: `${j} pada ${terbaru.tanggal}` };
    default:
      return { status: STATUS_AKTIF, alasan: ALASAN_STATUS_AKTIF };
  }
}

/** Status turunan untuk seluruh umat — sumber tunggal angka rekap & penanda. */
export function hitungStatusSemua(
  umat: Umat[],
  peristiwa: Peristiwa[],
  tanggalAcuan: string,
): Map<string, { status: string; alasan?: string }> {
  const perUmat = new Map<string, PeristiwaUmat[]>();
  for (const p of peristiwa) {
    const arr = perUmat.get(p.idUmat) ?? [];
    arr.push(p);
    perUmat.set(p.idUmat, arr);
  }
  const hasil = new Map<string, { status: string; alasan?: string }>();
  for (const u of umat) {
    hasil.set(u.id, deriveStatus(perUmat.get(u.id) ?? [], tanggalAcuan));
  }
  return hasil;
}

/**
 * Materialisasi status turunan ke rekaman: kolom `status` pada DATA UMAT harus selalu
 * sama dengan hasil perhitungan, karena kolom itu ikut diekspor ke Excel.
 */
export function terapkanStatus(
  umat: Umat[],
  peristiwa: Peristiwa[],
  tanggalAcuan: string,
): Umat[] {
  const peta = hitungStatusSemua(umat, peristiwa, tanggalAcuan);
  return umat.map((u) => {
    const s = peta.get(u.id);
    if (!s || s.status === u.status) return u;
    return { ...u, status: s.status };
  });
}

/**
 * Materialisasi status untuk sejumlah orang tertentu saja — dipakai saat satu
 * peristiwa berubah, supaya tidak menghitung ulang seluruh lingkungan.
 */
export function terapkanStatusUntuk(
  umat: Umat[],
  peristiwa: Peristiwa[],
  tanggalAcuan: string,
  ids: string[],
): Umat[] {
  if (ids.length === 0) return umat;
  const sasaran = new Set(ids);
  const perUmat = new Map<string, PeristiwaUmat[]>();
  for (const p of peristiwa) {
    if (!sasaran.has(p.idUmat)) continue;
    const arr = perUmat.get(p.idUmat) ?? [];
    arr.push(p);
    perUmat.set(p.idUmat, arr);
  }
  return umat.map((u) => {
    if (!sasaran.has(u.id)) return u;
    const s = deriveStatus(perUmat.get(u.id) ?? [], tanggalAcuan);
    return s.status === u.status ? u : { ...u, status: s.status };
  });
}

export function hitungUmur(tanggalLahir: string | null, tanggalAcuan: string): number | null {
  const lahir = parseTanggal(tanggalLahir);
  if (!lahir) return null;
  const acuan = parseTanggal(tanggalAcuan);
  if (!acuan) return null;

  let umur = acuan.y - lahir.y;
  if (acuan.m < lahir.m || (acuan.m === lahir.m && acuan.d < lahir.d)) {
    umur -= 1;
  }
  return umur;
}
