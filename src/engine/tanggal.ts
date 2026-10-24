// ============================================================================
// Tanggal — parsing & perbandingan tanggal Indonesia (dd/MM/yyyy)
// Tanggal TIDAK boleh dibandingkan sebagai teks: '01/01/2030' < '31/12/2026'
// secara leksikografis, padahal jelas 2030 > 2026.
// ============================================================================

export interface TanggalParts {
  y: number;
  m: number;
  d: number;
}

const POLA_DMY = /^(\d{1,2})[/\-.](\d{1,2})[/\-.](\d{4})$/;
const POLA_YMD = /^(\d{4})[/\-.](\d{1,2})[/\-.](\d{1,2})$/;

export function hariDalamBulan(y: number, m: number): number {
  return new Date(y, m, 0).getDate();
}

/**
 * Urai tanggal. Menerima 'dd/MM/yyyy', 'd/M/yyyy', dan 'yyyy-MM-dd'.
 * Tanggal yang tidak sah (tanggal 31 Februari, bulan 13, teks lain) → null.
 */
export function parseTanggal(t: string | null | undefined): TanggalParts | null {
  if (t === null || t === undefined) return null;
  const s = String(t).trim();
  if (!s) return null;

  let y: number;
  let m: number;
  let d: number;

  const dmy = POLA_DMY.exec(s);
  const ymd = POLA_YMD.exec(s);
  if (dmy) {
    d = parseInt(dmy[1], 10);
    m = parseInt(dmy[2], 10);
    y = parseInt(dmy[3], 10);
  } else if (ymd) {
    y = parseInt(ymd[1], 10);
    m = parseInt(ymd[2], 10);
    d = parseInt(ymd[3], 10);
  } else {
    return null;
  }

  if (m < 1 || m > 12) return null;
  if (d < 1 || d > hariDalamBulan(y, m)) return null;
  return { y, m, d };
}

export function tanggalValid(t: string | null | undefined): boolean {
  return parseTanggal(t) !== null;
}

/**
 * Bandingkan dua tanggal: -1 bila a lebih awal, 0 bila sama, 1 bila a lebih akhir.
 * Bila salah satu tidak dapat diurai, hasilnya -1 (tanggal dianggap belum berlaku).
 */
export function bandingkanTanggal(a: string, b: string): number {
  const pa = parseTanggal(a);
  const pb = parseTanggal(b);
  if (!pa || !pb) return a === b ? 0 : -1;
  if (pa.y !== pb.y) return pa.y < pb.y ? -1 : 1;
  if (pa.m !== pb.m) return pa.m < pb.m ? -1 : 1;
  if (pa.d !== pb.d) return pa.d < pb.d ? -1 : 1;
  return 0;
}

export function tanggalSebelum(t: string, batas: string): boolean {
  return bandingkanTanggal(t, batas) < 0;
}

export function tanggalTidakLewat(t: string, batas: string): boolean {
  return bandingkanTanggal(t, batas) <= 0;
}

export function formatTanggal(p: TanggalParts): string {
  const dd = String(p.d).padStart(2, '0');
  const mm = String(p.m).padStart(2, '0');
  return `${dd}/${mm}/${p.y}`;
}

/** Ubah 'dd/MM/yyyy' menjadi 'yyyy-MM-dd' (dipakai saat menulis ke Excel). */
export function tanggalKeIso(t: string): string | null {
  const p = parseTanggal(t);
  if (!p) return null;
  return `${String(p.y).padStart(4, '0')}-${String(p.m).padStart(2, '0')}-${String(p.d).padStart(2, '0')}`;
}
