// ============================================================================
// Layar Peristiwa — input peristiwa, kolom identitas sinkron otomatis dari DATA UMAT (Fase 3)
// ============================================================================

import { useState } from 'react';
import { useAplikasi, snapshotDari } from '../../state/store.ts';
import { persistensiDexie } from '../../state/persistence.ts';
import type { JenisPeristiwa, Peristiwa } from '../../engine/types.ts';
import PersonLink from '../components/PersonLink.tsx';
import Field from '../components/Field.tsx';

const JENIS_PERISTIWA: JenisPeristiwa[] = [
  'KEMATIAN', 'PINDAH AGAMA', 'MUTASI_KELUAR', 'MUTASI_MASUK', 'DITERIMA MASUK',
  'BAPTIS', 'KOMUNI PERTAMA', 'PERMINYAKAN SUCI', 'SEMINARI BIARA',
  'PERKAWINAN GEREJANI', 'PEMBUBARAN', 'PINDAH ALAMAT',
];

export default function Peristiwa() {
  const st = useAplikasi();
  const [form, setForm] = useState({
    idUmat: '', jenis: 'KEMATIAN' as JenisPeristiwa, tanggal: '', keterangan: '',
  });

  const umat = st.umat;

  const simpan = async () => {
    if (!form.idUmat) { st.tampilkanPesan('Pilih umat terlebih dahulu.', 'galat'); return; }
    const u = umat.find((x) => x.id === form.idUmat);
    if (!u) { st.tampilkanPesan('Umat tidak ditemukan.', 'galat'); return; }

    const p: Peristiwa = {
      id: '', idUmat: form.idUmat, jenis: form.jenis, nama: u.nama, lingkungan: st.settings?.namaLingkungan ?? '',
      jenisKelamin: u.jenisKelamin, tanggalLahir: u.tanggalLahir, tanggal: form.tanggal, keterangan: form.keterangan,
    };
    st.tambahPeristiwa(p);
    await persistensiDexie.simpan(snapshotDari(st));
    setForm({ idUmat: '', jenis: 'KEMATIAN', tanggal: '', keterangan: '' });
    st.tampilkanPesan('Peristiwa disimpan.', 'ok');
  };

  const hapus = (id: string) => {
    if (!confirm(`Hapus peristiwa ${id}?`)) return;
    st.hapusPeristiwa(id);
  };

  return (
    <div className="page-card">
      <div className="cluster" style={{ marginBottom: 14, gap: 8 }}>
        <Field label="Pilih Umat" required>
          <select className="field__control" value={form.idUmat} onChange={(e) => setForm({ ...form, idUmat: e.target.value })}>
            <option value="">-- Pilih umat --</option>
            {umat.map((u) => (
              <option key={u.id} value={u.id}>{u.nama || '(tanpa nama)'} ({u.id})</option>
            ))}
          </select>
        </Field>
        <Field label="Jenis Peristiwa" required>
          <select className="field__control" value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value as JenisPeristiwa })}>
            {JENIS_PERISTIWA.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </Field>
        <button className="btn btn--primary" onClick={simpan}>
          Simpan
        </button>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Umat</th>
              <th>Jenis</th>
              <th>Tanggal</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {st.peristiwa.map((p) => {
              const u = umat.find((x) => x.id === p.idUmat);
              return (
                <tr key={p.id}>
                  <td className="mono tabular">{p.id}</td>
                  <td><PersonLink id={p.idUmat} nama={p.nama || u?.nama || '(tanpa nama)'}>{p.nama || u?.nama || '(tanpa nama)'}</PersonLink></td>
                  <td>{p.jenis}</td>
                  <td>{p.tanggal || '—'}</td>
                  <td>{p.keterangan || '—'}</td>
                  <td className="cluster" style={{ gap: 4 }}>
                    <button className="btn btn--ghost btn--sm" onClick={() => hapus(p.id)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {st.peristiwa.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 16 }}>Belum ada peristiwa.</p>}
      </div>
    </div>
  );
}
