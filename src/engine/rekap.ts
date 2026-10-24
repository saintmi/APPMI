import type { Umat, Peristiwa, RekapAngka, Settings } from './types.ts';
import { isStatusAktif } from './types.ts';
import { hitungStatusSemua } from './status.ts';

export const TANGGAL_ACUAN_DEFAULT = '31/12/2026';

function acuanDari(settings?: Partial<Settings> | null): string {
  return settings?.tanggalAcuan || TANGGAL_ACUAN_DEFAULT;
}

// ============================================================================
// computeRekap — meniru semua COUNTIFS di REKAP LINGKUNGAN, REKAP DETAIL, DASHBOARD
// Mengembalikan bukti (daftar ID di balik setiap angka)
// Status selalu diturunkan dari peristiwa, bukan dari kolom status tersimpan.
// ============================================================================

export function computeRekap(
  umat: Umat[],
  peristiwa: Peristiwa[],
  settings?: Partial<Settings> | null,
): RekapAngka[] {
  const hasil: RekapAngka[] = [];

  const statusMap = hitungStatusSemua(umat, peristiwa, acuanDari(settings));
  const umatAktif = umat.filter((u) => isStatusAktif(statusMap.get(u.id)?.status ?? ''));

  hasil.push({
    label: 'Total Jiwa Aktif',
    nilai: umatAktif.length,
    bukti: umatAktif.map((u) => u.id),
    sheet: 'REKAP LINGKUNGAN',
    baris: 5,
    kolom: 'B',
  });

  const kubSet = new Set(umatAktif.map((u) => u.KUB).filter(Boolean));
  for (const kub of kubSet) {
    const umatKub = umatAktif.filter((u) => u.KUB === kub);
    const kkSet = new Set(umatKub.map((u) => u.idKK).filter(Boolean));
    hasil.push({
      label: `KK Aktif (${kub})`,
      nilai: kkSet.size,
      bukti: [...kkSet],
      sheet: 'REKAP DETAIL',
      baris: 0,
      kolom: '',
    });
    hasil.push({
      label: `Jiwa Aktif (${kub})`,
      nilai: umatKub.length,
      bukti: umatKub.map((u) => u.id),
      sheet: 'REKAP DETAIL',
      baris: 0,
      kolom: '',
    });
  }

  return hasil;
}

export function computeRekapByKUB(
  umat: Umat[],
  peristiwa: Peristiwa[],
  settings?: Partial<Settings> | null,
): { kub: string; jumlahKK: number; jumlahJiwa: number; ids: string[] }[] {
  const statusMap = hitungStatusSemua(umat, peristiwa, acuanDari(settings));

  const kubMap = new Map<string, { ids: string[]; kk: Set<string> }>();
  for (const u of umat) {
    if (!isStatusAktif(statusMap.get(u.id)?.status ?? '')) continue;
    if (!u.KUB) continue;
    if (!kubMap.has(u.KUB)) kubMap.set(u.KUB, { ids: [], kk: new Set() });
    kubMap.get(u.KUB)!.ids.push(u.id);
    if (u.idKK) kubMap.get(u.KUB)!.kk.add(u.idKK);
  }

  const result: { kub: string; jumlahKK: number; jumlahJiwa: number; ids: string[] }[] = [];
  for (const [kub, data] of kubMap) {
    result.push({
      kub,
      jumlahKK: data.kk.size,
      jumlahJiwa: data.ids.length,
      ids: data.ids,
    });
  }
  return result;
}
