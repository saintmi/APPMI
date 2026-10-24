import type { Umat, Peristiwa } from './types.ts';

// ============================================================================
// syncIdentity — pengambilan kolom identitas dari DATA UMAT
// Kolom identitas di semua sheet peristiwa TIDAK PERNAH diketik.
// Semua diambil dari DATA UMAT; Lingkungan selalu berasal dari Pengaturan.
// ============================================================================

export function buildIdentitasPeristiwa(
  umat: Umat[],
): Map<string, { nama: string; jenisKelamin: string; tanggalLahir: string }> {
  const map = new Map<string, { nama: string; jenisKelamin: string; tanggalLahir: string }>();
  for (const u of umat) {
    map.set(u.id, {
      nama: u.nama,
      jenisKelamin: u.jenisKelamin,
      tanggalLahir: u.tanggalLahir,
    });
  }
  return map;
}

export function sinkronkanPeristiwaDariUmat(
  peristiwa: Peristiwa,
  identitas: Map<string, { nama: string; jenisKelamin: string; tanggalLahir: string }>,
  lingkungan: string,
): Peristiwa {
  const ident = identitas.get(peristiwa.idUmat);
  if (!ident) return peristiwa;

  return {
    ...peristiwa,
    nama: ident.nama,
    jenisKelamin: ident.jenisKelamin,
    tanggalLahir: ident.tanggalLahir,
    lingkungan,
  };
}