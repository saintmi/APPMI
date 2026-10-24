// ============================================================================
// Layar Keluarga (KK) — daftar + wizard tambah KK + anggota (Fase 3)
// ============================================================================

import { useState } from 'react';
import { useAplikasi, snapshotDari } from '../../state/store.ts';
import { persistensiDexie } from '../../state/persistence.ts';
import { gotoRute } from '../router.ts';
import type { Kk } from '../../engine/types.ts';
import Field from '../components/Field.tsx';

export default function Kk() {
  const st = useAplikasi();
  const [form, setForm] = useState({ show: false, nomorKK: '', namaKepalaKeluarga: '', alamat: '', KUB: '' });
  const [pesan, setPesan] = useState('');
  const [cari, setCari] = useState('');
  const [filterKUB, setFilterKUB] = useState('');

  const daftarKUB = st.settings?.daftarKUB ?? [];

  const kkTersaring = st.kk.filter((k) => {
    if (filterKUB && k.KUB !== filterKUB) return false;
    const q = cari.trim().toLowerCase();
    if (!q) return true;
    const anggota = st.umat.filter((u) => u.idKK === k.id).length;
    return (
      k.id.toLowerCase().includes(q) ||
      (k.nomorKK || '').toLowerCase().includes(q) ||
      (k.namaKepalaKeluarga || '').toLowerCase().includes(q) ||
      (k.alamat || '').toLowerCase().includes(q) ||
      String(anggota).includes(q)
    );
  });

  const tambahKk = async () => {
    if (!form.nomorKK.trim()) { setPesan('Nomor KK wajib diisi.'); return; }
    if (!form.namaKepalaKeluarga.trim()) { setPesan('Nama kepala keluarga wajib diisi.'); return; }
    if (!form.KUB) { setPesan('KUB wajib dipilih.'); return; }
    const duplikat = st.kk.find((k) => k.nomorKK.trim().toLowerCase() === form.nomorKK.trim().toLowerCase());
    if (duplikat) {
      setPesan(`Nomor KK ${form.nomorKK} sudah tercatat (KK ${duplikat.id}). Tidak dapat menambahkan KK baru dengan nomor yang sama.`);
      return;
    }
    const k: Kk = { id: '', nomorKK: form.nomorKK.trim(), namaKepalaKeluarga: form.namaKepalaKeluarga.trim(), alamat: form.alamat, KUB: form.KUB, lampiran: [] };
    st.tambahKk(k);
    await persistensiDexie.simpan(snapshotDari(st));
    setForm({ show: false, nomorKK: '', namaKepalaKeluarga: '', alamat: '', KUB: '' });
    setPesan(`KK ${form.nomorKK} ditambahkan.`);
    setTimeout(() => setPesan(''), 1500);
  };

  const tambahAnggotaKeKK = () => {
    gotoRute({ layar: 'umat' });
  };

  const hapus = (id: string) => {
    if (!confirm(`Hapus KK ${id}?`)) return;
    st.hapusKk(id);
  };

  return (
    <div className="page-card">
      <div className="cluster" style={{ marginBottom: 14, gap: 8 }}>
        <button className="btn btn--primary" onClick={() => setForm({ ...form, show: true })}>
          Tambah KK
        </button>
        <input
          className="field__control"
          style={{ maxWidth: 260 }}
          placeholder="Cari KK (ID, nomor, nama, alamat, anggota)"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
        />
        <select className="field__control" style={{ maxWidth: 160 }} value={filterKUB} onChange={(e) => setFilterKUB(e.target.value)}>
          <option value="">Semua KUB</option>
          {daftarKUB.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <span className="muted">{kkTersaring.length} dari {st.kk.length} KK</span>
      </div>

      {form.show && (
        <div className="card">
          <div className="card__header">
            <div className="card__title">Tambah KK Baru</div>
          </div>
          <div className="card__body">
            <div className="form-grid form-grid--2">
              <Field label="Nama Kepala Keluarga" required>
                <input
                  className="field__control"
                  value={form.namaKepalaKeluarga}
                  onChange={(e) => setForm({ ...form, namaKepalaKeluarga: e.target.value })}
                  placeholder="Nama Kepala Keluarga"
                />
              </Field>
              <Field label="Alamat">
                <input
                  className="field__control"
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  placeholder="Alamat"
                />
              </Field>
              <Field label="KUB" required>
                <select className="field__control" value={form.KUB} onChange={(e) => setForm({ ...form, KUB: e.target.value })}>
                  <option value="">-- Pilih KUB --</option>
                  {daftarKUB.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </Field>
              <Field label="Nomor KK" required className="field--full">
                <input
                  className="field__control"
                  value={form.nomorKK}
                  onChange={(e) => setForm({ ...form, nomorKK: e.target.value })}
                  placeholder="Nomor KK"
                />
              </Field>
            </div>
            <div className="cluster" style={{ marginTop: 10 }}>
              <button className="btn btn--primary" onClick={tambahKk}>
                Simpan
              </button>
              <button className="btn btn--ghost" onClick={() => setForm({ ...form, show: false })}>
                Batal
              </button>
            </div>
            {pesan && <p className="msg-ok">{pesan}</p>}
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID KK</th>
              <th>Nomor KK</th>
              <th>Kepala Keluarga</th>
              <th>Alamat</th>
              <th>KUB</th>
              <th>Anggota</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {kkTersaring.map((k) => {
              const anggota = st.umat.filter((u) => u.idKK === k.id);
              return (
                <tr key={k.id}>
                  <td className="mono tabular"><button className="btn btn--ghost btn--sm" onClick={() => gotoRute({ layar: 'kk', id: k.id })}>{k.id}</button></td>
                  <td><button className="btn btn--ghost btn--sm" onClick={() => gotoRute({ layar: 'kk', id: k.id })}>{k.nomorKK || '—'}</button></td>
                  <td><button className="btn btn--ghost btn--sm" onClick={() => gotoRute({ layar: 'kk', id: k.id })}>{k.namaKepalaKeluarga || '(tanpa nama)'}</button></td>
                  <td>{k.alamat || '—'}</td>
                  <td>{k.KUB}</td>
                  <td>{anggota.length}</td>
                  <td className="cluster" style={{ gap: 4 }}>
                    <button className="btn btn--ghost btn--sm" onClick={() => tambahAnggotaKeKK()}>
                      Tambah Anggota
                    </button>
                    <button className="btn btn--ghost btn--sm" onClick={() => hapus(k.id)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {st.kk.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 16 }}>Belum ada KK.</p>}
      </div>

    </div>
  );
}

