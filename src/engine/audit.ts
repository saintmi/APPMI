import type { AuditLogEntry } from './types';

// ============================================================================
// AuditLog — dasar fitur Urungkan (50 langkah terakhir)
// ============================================================================

let counter = 0;

export function seedAuditCounter(ids: number[]) {
  const maks = ids.reduce((a, b) => (b > a ? b : a), counter);
  counter = Math.max(counter, maks);
}

export function buatEntriAudit(
  aksi: AuditLogEntry['aksi'],
  entitas: string,
  idEntitas: string,
  sebelum: unknown,
  sesudah: unknown,
): AuditLogEntry {
  counter += 1;
  return {
    id: counter,
    waktu: new Date().toISOString(),
    aksi,
    entitas,
    idEntitas,
    sebelum,
    sesudah,
  };
}

export interface RiwayatAudit {
  entri: AuditLogEntry[];
  indeksSekarang: number;
}

export function buatRiwayatAudit(): RiwayatAudit {
  return { entri: [], indeksSekarang: -1 };
}

export function tambahEntri(
  riwayat: RiwayatAudit,
  entri: AuditLogEntry,
): RiwayatAudit {
  // Hapus entri setelah indeks saat ini (untuk redo setelah undo baru)
  const baru = {
    ...riwayat,
    entri: [...riwayat.entri.slice(0, riwayat.indeksSekarang + 1), entri],
    indeksSekarang: riwayat.entri.slice(0, riwayat.indeksSekarang + 1).length,
  };
  // Batasi 50 langkah terakhir
  if (baru.entri.length > 50) {
    baru.entri.shift();
    baru.indeksSekarang -= 1;
  }
  return baru;
}

export function canUndo(riwayat: RiwayatAudit): boolean {
  return riwayat.indeksSekarang >= 0;
}

export function canRedo(riwayat: RiwayatAudit): boolean {
  return riwayat.indeksSekarang < riwayat.entri.length - 1;
}

export function undo(riwayat: RiwayatAudit): { riwayat: RiwayatAudit; entri: AuditLogEntry } {
  const entri = riwayat.entri[riwayat.indeksSekarang];
  return {
    riwayat: { ...riwayat, indeksSekarang: riwayat.indeksSekarang - 1 },
    entri,
  };
}

export function redo(riwayat: RiwayatAudit): { riwayat: RiwayatAudit; entri: AuditLogEntry } {
  const entri = riwayat.entri[riwayat.indeksSekarang + 1];
  return {
    riwayat: { ...riwayat, indeksSekarang: riwayat.indeksSekarang + 2 },
    entri,
  };
}