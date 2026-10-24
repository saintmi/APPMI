// ============================================================================
// Persistensi (Fase 3) — snapshot Dexie (IndexedDB). Simpan otomatis
// ditunda 500 ms setelah perubahan. Kembali ke browser tidak menghilangkan
// data (Selesai bila Fase 3).
// ============================================================================

import { db } from '../db/database.ts';
import type { Persistensi, Snapshot } from './store.ts';

const KUNCI = 'utama';

export const persistensiDexie: Persistensi = {
  async muat(): Promise<Snapshot | null> {
    const row = await db.settings.get(KUNCI);
    if (!row) return null;
    const umat = await db.umat.toArray();
    const kk = await db.kk.toArray();
    const peristiwa = await db.peristiwa.toArray();
    const riwayat = await db.riwayatPindahAlamat.toArray();
    const audit = await db.auditLog.toArray();
    const penanda = await db.penanda.toArray();
    const keputusan = await db.keputusanDuplikat.toArray();
    return {
      settings: (row as unknown as { payload: Snapshot['settings'] }).payload ?? null,
      umat, kk, peristiwa, riwayat, audit, penanda,
      keputusanDuplikat: keputusan,
      indeksUndo: audit.length - 1,
    };
  },

  async simpan(s: Snapshot): Promise<void> {
    await db.settings.put({ id: KUNCI, payload: s.settings } as never);
    await db.umat.clear();
    if (s.umat.length) await db.umat.bulkPut(s.umat);
    await db.kk.clear();
    if (s.kk.length) await db.kk.bulkPut(s.kk);
    await db.peristiwa.clear();
    if (s.peristiwa.length) await db.peristiwa.bulkPut(s.peristiwa);
    await db.riwayatPindahAlamat.clear();
    if (s.riwayat.length) await db.riwayatPindahAlamat.bulkPut(s.riwayat);
    await db.auditLog.clear();
    if (s.audit.length) await db.auditLog.bulkPut(s.audit);
    await db.penanda.clear();
    if (s.penanda.length) await db.penanda.bulkPut(s.penanda);
    await db.keputusanDuplikat.clear();
    if (s.keputusanDuplikat.length) await db.keputusanDuplikat.bulkPut(s.keputusanDuplikat);
  },
};
