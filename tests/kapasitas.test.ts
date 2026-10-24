import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { useAplikasi } from '../src/state/store.ts';
import type { Umat } from '../src/engine/types.ts';

function buatUmat(i: number): Umat {
  return {
    id: `UM${String(i).padStart(5, '0')}`,
    idKK: `KK${String(Math.ceil(i / 4)).padStart(4, '0')}`,
    nama: `Umat Ke-${i}`,
    jenisKelamin: i % 2 === 0 ? 'Laki-laki' : 'Perempuan',
    tanggalLahir: '01/01/1990',
    agama: 'Katolik',
    status: 'Aktif',
    KUB: 'KUB-A',
    alamat: `Jl. Contoh ${i}`,
  };
}

describe('kapasitas 2.000 umat (in-memory)', () => {
  beforeEach(() => {
    const st = useAplikasi.getState();
    st.umat.splice(0, st.umat.length);
    st.kk.splice(0, st.kk.length);
    st.peristiwa.splice(0, st.peristiwa.length);
  });

  afterEach(() => {
    const st = useAplikasi.getState();
    st.umat.splice(0, st.umat.length);
    st.kk.splice(0, st.kk.length);
    st.peristiwa.splice(0, st.peristiwa.length);
  });

  it('menambah 2.000 umat dalam waktu wajar (< 1000 ms)', () => {
    const st = useAplikasi.getState();
    const umat: Umat[] = [];
    for (let i = 1; i <= 2000; i++) umat.push(buatUmat(i));

    const t0 = performance.now();
    for (const u of umat) st.tambahUmat(u);
    const t1 = performance.now();

    expect(useAplikasi.getState().umat.length).toBe(2000);
    console.log(`Tambah 2.000 umat in-memory: ${(t1 - t0).toFixed(0)} ms`);
    expect(t1 - t0).toBeLessThan(1000);
  }, 30000);

  it('menghapus dan menambahkan ulang 2.000 umat (id tetap tidak bergeser)', () => {
    const st = useAplikasi.getState();
    for (let i = 1; i <= 2000; i++) st.tambahUmat(buatUmat(i));

    const idsAwal = useAplikasi.getState().umat.map((u) => u.id);
    const hapusIds = idsAwal.filter((_, i) => i % 2 === 0);
    for (const id of hapusIds) st.hapusUmat(id);
    expect(useAplikasi.getState().umat.length).toBe(1000);

    // Tambah ulang 1000
    for (let i = 2001; i <= 3000; i++) st.tambahUmat(buatUmat(i));
    expect(useAplikasi.getState().umat.length).toBe(2000);

    // Verifikasi ID tidak ada yang duplikat
    const ids = useAplikasi.getState().umat.map((u) => u.id);
    const unique = new Set(ids);
    expect(unique.size).toBe(2000);
  }, 30000);
});
