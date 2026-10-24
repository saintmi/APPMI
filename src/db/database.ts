import Dexie, { type Table } from 'dexie';
import type {
  Settings, Kk, Umat, Peristiwa, RiwayatPindahAlamat,
  KeputusanDuplikat, AuditLogEntry, Penanda,
} from '../engine/types.ts';

// ============================================================================
// Skema Dexie dengan sistem versi dan migrasi (Fase 1)
// ============================================================================

export class StatistikUmatDB extends Dexie {
  settings!: Table<Settings, string>;
  kk!: Table<Kk, string>;
  umat!: Table<Umat, string>;
  peristiwa!: Table<Peristiwa, string>;
  riwayatPindahAlamat!: Table<RiwayatPindahAlamat, string>;
  keputusanDuplikat!: Table<KeputusanDuplikat, string>;
  auditLog!: Table<AuditLogEntry, number>;
  penanda!: Table<Penanda, string>;

  constructor() {
    super('StatistikUmatDB');
    this.version(1).stores({
      settings: 'id',
      kk: 'id, KUB',
      umat: 'id, idKK, KUB, status',
      peristiwa: 'id, idUmat, jenis, tanggal',
      riwayatPindahAlamat: 'id, idUmat, tanggal',
      keputusanDuplikat: 'idPasangan, idA, idB',
      auditLog: '++id, waktu, entitas',
      penanda: 'id, jenis, aktif',
    });
  }
}

export const db = new StatistikUmatDB();
export type { Settings, Kk, Umat, Peristiwa, RiwayatPindahAlamat, KeputusanDuplikat, AuditLogEntry, Penanda };