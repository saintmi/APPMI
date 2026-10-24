import { test } from 'vitest';
import assert from 'node:assert';
import { deriveStatus, hitungUmur, terapkanStatus, hitungStatusSemua } from '../src/engine/status.ts';
import { computeRekap, computeRekapByKUB } from '../src/engine/rekap.ts';
import { computeWarnings, findDuplicates, normalisasiNama } from '../src/engine/warnings.ts';
import { buildIdentitasPeristiwa, sinkronkanPeristiwaDariUmat } from '../src/engine/sync.ts';
import { IdAllocator, nomorDariId } from '../src/engine/idAllocator.ts';
import type { Umat, Peristiwa, Kk } from '../src/engine/types.ts';

const umat: Umat[] = [
  { id: '0001', idKK: 'KK0001', nama: '', jenisKelamin: '', tanggalLahir: '', agama: 'Katolik', status: 'Aktif', KUB: '', alamat: '' },
  { id: '0002', idKK: 'KK0001', nama: 'B', jenisKelamin: 'Perempuan', tanggalLahir: '02/02/1990', agama: 'Katolik', status: 'Aktif', KUB: 'KUB1', alamat: 'Jl. A' },
  { id: '0003', idKK: 'KK0002', nama: 'C', jenisKelamin: 'Laki-laki', tanggalLahir: '03/03/1990', agama: 'Katolik', status: 'Aktif', KUB: 'KUB1', alamat: 'Jl. B' },
  { id: '0004', idKK: 'KK0003', nama: 'D', jenisKelamin: 'Perempuan', tanggalLahir: '04/04/1990', agama: 'Katolik', status: 'Aktif', KUB: 'KUB2', alamat: 'Jl. C' },
];

const peristiwa: Peristiwa[] = [
  { id: 'p1', jenis: 'KEMATIAN', idUmat: '0003', nama: 'C', lingkungan: 'L', jenisKelamin: 'Laki-laki', tanggalLahir: '03/03/1990', tanggal: '12/03/2026', keterangan: '' },
  { id: 'p2', jenis: 'BAPTIS', idUmat: '0004', nama: 'D', lingkungan: 'L', jenisKelamin: 'Perempuan', tanggalLahir: '01/01/1990', tanggal: '01/01/1989', keterangan: '' },
];

test('deriveStatus: kematian → Meninggal', () => {
  const r = deriveStatus([{ id: 'p1', jenis: 'KEMATIAN', tanggal: '12/03/2026' }], '31/12/2026');
  assert.strictEqual(r.status, 'Meninggal');
});

test('deriveStatus: baptis → Aktif', () => {
  const r = deriveStatus([{ id: 'p1', jenis: 'BAPTIS', tanggal: '01/01/2026' }], '31/12/2026');
  assert.strictEqual(r.status, 'Aktif');
});

test('deriveStatus: tanpa peristiwa → Aktif (terdaftar di lingkungan)', () => {
  const r = deriveStatus([], '31/12/2026');
  assert.strictEqual(r.status, 'Aktif');
});

test('deriveStatus: peristiwa setelah tanggal acuan diabaikan', () => {
  const r = deriveStatus([{ id: 'p1', jenis: 'KEMATIAN', tanggal: '01/01/2030' }], '31/12/2026');
  assert.strictEqual(r.status, 'Aktif');
});

test('deriveStatus: peristiwa tanpa tanggal tidak memengaruhi status', () => {
  const r = deriveStatus([{ id: 'p1', jenis: 'KEMATIAN', tanggal: null }], '31/12/2026');
  assert.strictEqual(r.status, 'Aktif');
});

test('deriveStatus: mutasi keluar dan pindah agama', () => {
  assert.strictEqual(
    deriveStatus([{ id: 'p1', jenis: 'MUTASI_KELUAR', tanggal: '05/06/2026' }], '31/12/2026').status,
    'Pindah Keluar',
  );
  assert.strictEqual(
    deriveStatus([{ id: 'p1', jenis: 'PINDAH AGAMA', tanggal: '05/06/2026' }], '31/12/2026').status,
    'Pindah Agama',
  );
});

test('deriveStatus: peristiwa terbaru ditentukan secara numerik', () => {
  const r = deriveStatus(
    [
      { id: 'p1', jenis: 'BAPTIS', tanggal: '01/01/2020' },
      { id: 'p2', jenis: 'KEMATIAN', tanggal: '05/03/2026' },
    ],
    '31/12/2026',
  );
  assert.strictEqual(r.status, 'Meninggal');
});

test('deriveStatus: kematian terbaru → Meninggal', () => {
  const r = deriveStatus(
    [{ id: 'p1', jenis: 'BAPTIS', tanggal: '01/01/2026' }],
    '31/12/2026',
  );
  assert.strictEqual(r.status, 'Aktif');
  const r2 = deriveStatus(
    [
      { id: 'p1', jenis: 'BAPTIS', tanggal: '01/01/2026' },
      { id: 'p2', jenis: 'KEMATIAN', tanggal: '05/03/2026' },
    ],
    '31/12/2026',
  );
  assert.strictEqual(r2.status, 'Meninggal');
});

test('deriveStatus: tanggal sama, kematian menang melalui prioritas', () => {
  const r = deriveStatus(
    [
      { id: 'p1', jenis: 'BAPTIS', tanggal: '05/03/2026' },
      { id: 'p2', jenis: 'KEMATIAN', tanggal: '05/03/2026' },
    ],
    '31/12/2026',
  );
  assert.strictEqual(r.status, 'Meninggal');
});

test('hitungUmur: 27/10/1991 @ 31/12/2026 = 35', () => {
  assert.strictEqual(hitungUmur('27/10/1991', '31/12/2026'), 35);
});

test('hitungUmur: null → null', () => {
  assert.strictEqual(hitungUmur(null, '31/12/2026'), null);
});

test('hitungUmur: tanggal tidak sah → null', () => {
  assert.strictEqual(hitungUmur('31/02/1991', '31/12/2026'), null);
});

test('terapkanStatus: kolom status selalu sama dengan hitungan', () => {
  const hasil = terapkanStatus(umat, peristiwa, '31/12/2026');
  const peta = hitungStatusSemua(umat, peristiwa, '31/12/2026');
  for (const u of hasil) {
    assert.strictEqual(u.status, peta.get(u.id)!.status);
  }
  assert.strictEqual(hasil.find((u) => u.id === '0003')!.status, 'Meninggal');
  assert.strictEqual(hasil.find((u) => u.id === '0002')!.status, 'Aktif');
});

test('computeRekap: total jiwa aktif', () => {
  const rekap = computeRekap(umat, peristiwa, { tanggalAcuan: '31/12/2026' });
  const total = rekap.find((x) => x.label === 'Total Jiwa Aktif');
  // Aktif: 0001, 0002, 0004. Meninggal: 0003 (KEMATIAN 12/03/2026).
  assert.strictEqual(total?.nilai, 3);
  assert.deepStrictEqual(total?.bukti.sort(), ['0001', '0002', '0004']);
});

test('computeRekap: status kolom tersimpan tidak lagi dipakai sebagai sumber', () => {
  const salah: Umat[] = umat.map((u) => ({ ...u, status: 'Meninggal' }));
  const rekap = computeRekap(salah, peristiwa, { tanggalAcuan: '31/12/2026' });
  const total = rekap.find((x) => x.label === 'Total Jiwa Aktif');
  assert.strictEqual(total?.nilai, 3);
});

test('computeRekapByKUB: grouping per KUB', () => {
  const byKub = computeRekapByKUB(umat, peristiwa, { tanggalAcuan: '31/12/2026' });
  const kub1 = byKub.find((x) => x.kub === 'KUB1');
  assert.ok(kub1);
  assert.strictEqual(kub1!.jumlahKK, 1);
  assert.strictEqual(kub1!.jumlahJiwa, 1);

  const kub2 = byKub.find((x) => x.kub === 'KUB2');
  assert.ok(kub2);
  assert.strictEqual(kub2!.jumlahKK, 1);
  assert.strictEqual(kub2!.jumlahJiwa, 1);
});

test('computeWarnings: baptis sebelum lahir = perlu konfirmasi', () => {
  const warnings = computeWarnings(umat, [], peristiwa, { tanggalAcuan: '31/12/2026' });
  const konf = warnings.filter((w) => w.jenis === 'Perlu konfirmasi');
  assert.ok(konf.length > 0, 'harus ada peringatan baptis sebelum lahir');
  assert.ok(konf.some((w) => w.pesan.includes('mendahului tanggal lahir')));
});

test('computeWarnings: kolom kosong = perlu dilengkapi', () => {
  const warnings = computeWarnings(umat, [], [], { tanggalAcuan: '31/12/2026' });
  const lengkapi = warnings.filter((w) => w.jenis === 'Perlu dilengkapi');
  assert.ok(lengkapi.length > 0);
});

test('computeWarnings: KK tanpa anggota dilaporkan', () => {
  const kk: Kk[] = [{ id: 'KK9999', nomorKK: '9', namaKepalaKeluarga: 'Tanpa Anggota', alamat: '', KUB: 'KUB1' }];
  const warnings = computeWarnings(umat, kk, [], { tanggalAcuan: '31/12/2026' });
  assert.ok(warnings.some((w) => w.idEntitas === 'KK9999'));
});

test('normalisasiNama: trim dan lowercase', () => {
  assert.strictEqual(normalisasiNama('  Yohanes  '), 'yohanes');
});

test('findDuplicates: nama sama + tanggal lahir sama', () => {
  const duplikat = findDuplicates([
    { id: '0001', idKK: 'K1', nama: 'Yohanes', jenisKelamin: 'Laki-laki', tanggalLahir: '01/01/1990', agama: '', status: 'Aktif', KUB: '', alamat: '' },
    { id: '0002', idKK: 'K1', nama: 'Yohanes', jenisKelamin: 'Laki-laki', tanggalLahir: '01/01/1990', agama: '', status: 'Aktif', KUB: '', alamat: '' },
  ]);
  assert.strictEqual(duplikat.length, 1);
  assert.strictEqual(duplikat[0].kemiripan, 1);
});

test('syncIdentity: ambil identitas dari DATA UMAT', () => {
  const identitas = buildIdentitasPeristiwa(umat);
  assert.strictEqual(identitas.get('0002')?.nama, 'B');
});

test('syncIdentity: sinkronkan peristiwa', () => {
  const identitas = buildIdentitasPeristiwa(umat);
  const p: Peristiwa = { id: 'p1', jenis: 'KEMATIAN', idUmat: '0002', nama: '', lingkungan: '', jenisKelamin: '', tanggalLahir: '', tanggal: null, keterangan: '' };
  const s = sinkronkanPeristiwaDariUmat(p, identitas, 'Lingkungan X');
  assert.strictEqual(s.nama, 'B');
  assert.strictEqual(s.lingkungan, 'Lingkungan X');
});

test('IdAllocator: alokasi berurutan, bebas lalu ulang', () => {
  const alloc = new IdAllocator();
  assert.strictEqual(alloc.alokasi(), '0001');
  assert.strictEqual(alloc.alokasi(), '0002');
  alloc.bebas('0001');
  assert.strictEqual(alloc.alokasi(), '0001');
});

test('IdAllocator: awalan dan lebar sesuai skema ID', () => {
  const alloc = new IdAllocator({ prefix: 'UM', width: 5 });
  assert.strictEqual(alloc.alokasi(), 'UM00001');
  assert.strictEqual(alloc.alokasi(), 'UM00002');
  alloc.bebas('UM00001');
  assert.strictEqual(alloc.alokasi(), 'UM00001');
});

test('IdAllocator: seed dari data yang ada', () => {
  const alloc = new IdAllocator({ prefix: 'UM', width: 5 });
  alloc.seed(['UM00001', 'UM00003']);
  assert.strictEqual(alloc.alokasi(), 'UM00002');
  assert.strictEqual(alloc.alokasi(), 'UM00004');
});

test('nomorDariId: mengurai nomor dari ID berawalan', () => {
  assert.strictEqual(nomorDariId('UM00012'), 12);
  assert.strictEqual(nomorDariId('KK0007'), 7);
  assert.strictEqual(nomorDariId('bukan'), null);
});
