import type { Umat, Kk, Peristiwa, Penanda, Settings } from './types.ts';
import { bandingkanTanggal, parseTanggal } from './tanggal.ts';
import { hitungStatusSemua } from './status.ts';

const KOLOM_PENTING_Umat = ['nama', 'jenisKelamin', 'tanggalLahir', 'alamat'];

export function computeWarnings(
  umat: Umat[],
  kkList: Kk[],
  peristiwa: Peristiwa[],
  settings?: Partial<Settings> | null,
): Penanda[] {
  const penanda: Penanda[] = [];
  const umatById = new Map(umat.map((u) => [u.id, u]));
  const tanggalAcuan = settings?.tanggalAcuan || '31/12/2026';
  const statusMap = hitungStatusSemua(umat, peristiwa, tanggalAcuan);

  // --- Perlu dilengkapi ---
  for (const u of umat) {
    const kosong = KOLOM_PENTING_Umat.filter((k) => {
      const v = (u as unknown as Record<string, string>)[k];
      return v === undefined || v === null || v === '';
    });
    if (kosong.length > 0) {
      penanda.push({
        id: `w-umat-${u.id}`,
        jenis: 'Perlu dilengkapi',
        pesan: `Umat ${u.nama ?? '(tanpa nama)'} masih memiliki kolom kosong: ${kosong.join(', ')}`,
        entitas: 'Umat',
        idEntitas: u.id,
        aktif: true,
      });
    }
    if (!u.idKK) {
      penanda.push({
        id: `w-umat-nokk-${u.id}`,
        jenis: 'Perlu dilengkapi',
        pesan: `Umat ${u.nama} belum terhubung ke KK manapun`,
        entitas: 'Umat',
        idEntitas: u.id,
        aktif: true,
      });
    }
  }

  // KK tanpa anggota
  for (const k of kkList) {
    const anggota = umat.filter((u) => u.idKK === k.id);
    if (anggota.length === 0) {
      penanda.push({
        id: `w-kk-kosong-${k.id}`,
        jenis: 'Perlu dilengkapi',
        pesan: `KK ${k.id} (${k.namaKepalaKeluarga || 'kepala keluarga belum diisi'}) belum memiliki anggota`,
        entitas: 'Kk',
        idEntitas: k.id,
        aktif: true,
      });
    }
  }

  // Peristiwa tanpa tanggal
  for (const p of peristiwa) {
    if (p.tanggal === null || p.tanggal === '') {
      penanda.push({
        id: `w-peristiwa-notgl-${p.id}`,
        jenis: 'Perlu dilengkapi',
        pesan: `Peristiwa ${p.jenis} untuk ${p.nama} belum memiliki tanggal`,
        entitas: 'Peristiwa',
        idEntitas: p.id,
        aktif: true,
      });
    }
  }

  // --- Perlu konfirmasi ---
  for (const p of peristiwa) {
    if (!p.tanggal) continue;
    if (!parseTanggal(p.tanggal)) continue;
    const u = umatById.get(p.idUmat);
    if (!u) continue;

    // Tanggal baptis mendahului tanggal lahir
    if (p.jenis === 'BAPTIS' && parseTanggal(u.tanggalLahir)) {
      if (bandingkanTanggal(p.tanggal, u.tanggalLahir) < 0) {
        penanda.push({
          id: `w-konf-baptis-${p.id}`,
          jenis: 'Perlu konfirmasi',
          pesan: `Tanggal baptis (${p.tanggal}) mendahului tanggal lahir (${u.tanggalLahir}). Mohon dicek mana yang perlu disesuaikan.`,
          entitas: 'Peristiwa',
          idEntitas: p.id,
          aktif: true,
        });
      }
    }

    // Peristiwa setelah tanggal kematian
    const status = statusMap.get(p.idUmat)?.status ?? '';
    if (status === 'Meninggal' && p.jenis !== 'KEMATIAN') {
      const kematian = peristiwa.find(
        (x) => x.idUmat === p.idUmat && x.jenis === 'KEMATIAN' && x.tanggal,
      );
      if (kematian?.tanggal && bandingkanTanggal(p.tanggal, kematian.tanggal) > 0) {
        penanda.push({
          id: `w-konf-setelahkematian-${p.id}`,
          jenis: 'Perlu konfirmasi',
          pesan: `Peristiwa ${p.jenis} (${p.tanggal}) setelah tanggal kematian (${kematian.tanggal})`,
          entitas: 'Peristiwa',
          idEntitas: p.id,
          aktif: true,
        });
      }
    }
  }

  return penanda;
}

export function normalisasiNama(nama: string): string {
  return nama
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

export function findDuplicates(
  umat: Umat[],
  ambangKemiripan: number = 0.85,
): { idA: string; idB: string; kemiripan: number; alasan: string }[] {
  const duplikat: { idA: string; idB: string; kemiripan: number; alasan: string }[] = [];

  for (let i = 0; i < umat.length; i++) {
    for (let j = i + 1; j < umat.length; j++) {
      const a = umat[i];
      const b = umat[j];

      if (a.tanggalLahir && b.tanggalLahir && a.tanggalLahir === b.tanggalLahir) {
        const namaA = normalisasiNama(a.nama ?? '');
        const namaB = normalisasiNama(b.nama ?? '');
        const kemiripan = hitungKemiripan(namaA, namaB);
        if (kemiripan >= ambangKemiripan) {
          duplikat.push({
            idA: a.id,
            idB: b.id,
            kemiripan,
            alasan: 'Nama dan tanggal lahir mirip',
          });
        }
      }
    }
  }

  return duplikat;
}

function hitungKemiripan(a: string, b: string): number {
  if (a === b) return 1.0;
  if (a.length === 0 || b.length === 0) return 0.0;
  const panjang = Math.max(a.length, b.length);
  const jarak = levenshtein(a, b);
  return 1 - jarak / panjang;
}

function levenshtein(a: string, b: string): number {
  const matriks: number[][] = [];
  for (let i = 0; i <= a.length; i++) matriks[i] = [i];
  for (let j = 0; j <= b.length; j++) matriks[0][j] = j;
  for (let i = 1; i <= a.length; i++) {
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      matriks[i][j] = Math.min(
        matriks[i - 1][j] + 1,
        matriks[i][j - 1] + 1,
        matriks[i - 1][j - 1] + cost,
      );
    }
  }
  return matriks[a.length][b.length];
}
