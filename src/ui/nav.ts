// ============================================================================
// Navigasi — grup menu sesuai plan.md §4.4
// ============================================================================

import type { Rute } from './router.ts';
import type { Penanda } from '../engine/types.ts';

export interface MenuItem {
  label: string;
  rute: Rute;
}

export interface MenuGrup {
  label: string;
  items: MenuItem[];
}

export const MENU: MenuGrup[] = [
  { label: 'Beranda', items: [{ label: 'Beranda', rute: { layar: 'beranda' } }] },
  {
    label: 'Data',
    items: [
      { label: 'Umat', rute: { layar: 'umat' } },
      { label: 'Keluarga (KK)', rute: { layar: 'kk' } },
      { label: 'Mode Tabel', rute: { layar: 'modetabel' } },
    ],
  },
  {
    label: 'Peristiwa',
    items: [
      { label: 'Semua Peristiwa', rute: { layar: 'peristiwa' } },
      { label: 'Kematian', rute: { layar: 'peristiwa', jenis: 'KEMATIAN' } },
      { label: 'Pindah Agama', rute: { layar: 'peristiwa', jenis: 'PINDAH AGAMA' } },
      { label: 'Mutasi', rute: { layar: 'peristiwa', jenis: 'Mutasi' } },
      { label: 'Mutasi Keluar', rute: { layar: 'peristiwa', jenis: 'MUTASI_KELUAR' } },
      { label: 'Mutasi Masuk', rute: { layar: 'peristiwa', jenis: 'MUTASI_MASUK' } },
      { label: 'Diterima Masuk', rute: { layar: 'peristiwa', jenis: 'DITERIMA MASUK' } },
      { label: 'Pindah Alamat', rute: { layar: 'peristiwa', jenis: 'PINDAH ALAMAT' } },

      { label: 'Sakramen Inisiasi', rute: { layar: 'peristiwa', jenis: 'Sakramen Inisiasi' } },
      { label: 'Perminyakan Suci', rute: { layar: 'peristiwa', jenis: 'PERMINYAKAN SUCI' } },
      { label: 'Seminari Biara', rute: { layar: 'peristiwa', jenis: 'SEMINARI BIARA' } },
      { label: 'Perkawinan Gerejani', rute: { layar: 'peristiwa', jenis: 'PERKAWINAN GEREJANI' } },
      { label: 'Pembubaran', rute: { layar: 'peristiwa', jenis: 'PEMBUBARAN' } },
    ],
  },
  {
    label: 'Perlu ditindaklanjuti',
    items: [
      { label: 'Perlu dilengkapi', rute: { layar: 'penanda', jenis: 'Perlu dilengkapi' } },
      { label: 'Perlu konfirmasi', rute: { layar: 'penanda', jenis: 'Perlu konfirmasi' } },
      { label: 'Duplikat', rute: { layar: 'duplikat' } },
    ],
  },
  { label: 'Rekap', items: [{ label: 'Rekap', rute: { layar: 'rekap' } }] },
  {
    label: 'Impor / Ekspor',
    items: [
      { label: 'Impor', rute: { layar: 'impor' } },
      { label: 'Ekspor', rute: { layar: 'ekspor' } },
    ],
  },
  {
    label: 'Pengaturan & Cadangan',
    items: [
      { label: 'Pengaturan', rute: { layar: 'pengaturan' } },
      { label: 'Cadangan & Pulihkan', rute: { layar: 'cadangan' } },
      { label: 'LLM (Gemini)', rute: { layar: 'llm' } },
    ],
  },
];

export function itemAktif(item: MenuItem, sekarang: Rute): boolean {
  return itemAktifRute(item.rute, sekarang);
}

export function itemAktifRute(r: Rute, sekarang: Rute): boolean {
  if (r.layar !== sekarang.layar) return false;
  if ('id' in r && 'id' in sekarang) return r.id === sekarang.id;
  if ('jenis' in r && 'jenis' in sekarang) return r.jenis === sekarang.jenis;
  return true;
}

export function grupAktif(grup: MenuGrup, sekarang: Rute): boolean {
  return grup.items.some((i) => itemAktif(i, sekarang));
}

export function penandaBadge(penanda: Penanda[]): { [jenis: string]: number } {
  const hitung: { [jenis: string]: number } = {};
  for (const p of penanda) {
    if (!p.aktif) continue;
    hitung[p.jenis] = (hitung[p.jenis] ?? 0) + 1;
  }
  return hitung;
}
