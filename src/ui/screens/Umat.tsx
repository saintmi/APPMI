// ============================================================================
// Layar Umat — daftar, pencarian, tambah, detail + linimasa peristiwa (Fase 3)
// ============================================================================

import { useState } from 'react';
import { useAplikasi, snapshotDari, sinkronkanPeristiwa } from '../../state/store.ts';
import { persistensiDexie } from '../../state/persistence.ts';
import type { Umat } from '../../engine/types.ts';
import PersonLink from '../components/PersonLink.tsx';
import Field from '../components/Field.tsx';

export default function Umat({ idUmat }: { idUmat?: string } = {}) {
  const st = useAplikasi();
  const [cari, setCari] = useState('');
  const [detailId, setDetailId] = useState<string | null>(idUmat ?? null);
  const [form, setForm] = useState<{ show: boolean; nama: string; jenisKelamin: string; tanggalLahir: string; agama: string; alamat: string; KUB: string; idKK: string }>({
    show: false, nama: '', jenisKelamin: 'Laki-laki', tanggalLahir: '', agama: 'Katolik', alamat: '', KUB: '', idKK: '',
  });
  const [pesan, setPesan] = useState('');

  const daftarKUB = st.settings?.daftarKUB ?? [];
  const kkList = st.kk;

  const bukaForm = () => {
    setForm({ show: true, nama: '', jenisKelamin: 'Laki-laki', tanggalLahir: '', agama: 'Katolik', alamat: '', KUB: '', idKK: '' });
  };

  const daftar = st.umat.filter((u) =>
    u.nama.toLowerCase().includes(cari.toLowerCase()) ||
    u.id.toLowerCase().includes(cari.toLowerCase()) ||
    u.KUB.toLowerCase().includes(cari.toLowerCase())
  );

  const tambahUmat = async () => {
    if (!form.nama.trim()) { setPesan('Nama wajib diisi.'); return; }
    if (!form.KUB) { setPesan('KUB wajib dipilih.'); return; }
    const u: Umat = {
      id: '', idKK: form.idKK, nama: form.nama.trim(), jenisKelamin: form.jenisKelamin as 'Laki-laki' | 'Perempuan',
      tanggalLahir: form.tanggalLahir, agama: form.agama, status: 'Aktif', KUB: form.KUB, alamat: form.alamat, lampiran: [],
    };
    st.tambahUmat(u);
    await persistensiDexie.simpan(snapshotDari(st));
    setForm({ show: false, nama: '', jenisKelamin: 'Laki-laki', tanggalLahir: '', agama: 'Katolik', alamat: '', KUB: '', idKK: '' });
    setPesan(`Umat ${form.nama} ditambahkan.`);
    setTimeout(() => setPesan(''), 1500);
  };

  const hapus = (id: string) => {
    if (!confirm(`Hapus umat ${id}?`)) return;
    st.hapusUmat(id);
    setDetailId(null);
  };

  const ubahKK = (id: string, idKK: string) => {
    st.ubahUmat(id, { idKK });
  };

  return (
    <div className="page-card">
      <div className="cluster" style={{ marginBottom: 14, gap: 8 }}>
        <input
          className="field__control"
          placeholder="Cari nama, ID, atau KUB…"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
          style={{ width: 260 }}
        />
        <button className="btn btn--primary" onClick={bukaForm}>
          Tambah Umat
        </button>
        <span className="muted">{daftar.length} dari {st.umat.length} umat ditampilkan</span>
      </div>

      {form.show && (
        <div className="card">
          <div className="card__header">
            <div className="card__title">Tambah Umat Baru</div>
          </div>
          <div className="card__body">
            <div className="form-grid form-grid--2">
              <Field label="Nama lengkap" required>
                <input
                  className="field__control"
                  value={form.nama}
                  onChange={(e) => setForm({ ...form, nama: e.target.value })}
                  placeholder="Nama lengkap"
                />
              </Field>
              <Field label="Jenis Kelamin">
                <select className="field__control" value={form.jenisKelamin} onChange={(e) => setForm({ ...form, jenisKelamin: e.target.value as 'Laki-laki' | 'Perempuan' })}>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </Field>
              <Field label="Tanggal Lahir">
                <input
                  className="field__control"
                  type="text"
                  value={form.tanggalLahir}
                  onChange={(e) => setForm({ ...form, tanggalLahir: e.target.value })}
                  placeholder="dd/MM/yyyy"
                />
              </Field>
              <Field label="Agama">
                <input
                  className="field__control"
                  value={form.agama}
                  onChange={(e) => setForm({ ...form, agama: e.target.value })}
                  placeholder="Agama"
                />
              </Field>
              <Field label="KUB" required>
                <select className="field__control" value={form.KUB} onChange={(e) => setForm({ ...form, KUB: e.target.value })}>
                  <option value="">-- Pilih KUB --</option>
                  {daftarKUB.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </Field>
              <Field label="KK">
                <select className="field__control" value={form.idKK} onChange={(e) => setForm({ ...form, idKK: e.target.value })}>
                  <option value="">-- Tidak ada KK --</option>
                  {kkList.map((k) => <option key={k.id} value={k.id}>{k.id} · {k.namaKepalaKeluarga}</option>)}
                </select>
              </Field>
              <Field label="Alamat" className="field--full">
                <input
                  className="field__control"
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  placeholder="Alamat"
                />
              </Field>
            </div>
            <div className="cluster" style={{ marginTop: 10 }}>
              <button className="btn btn--primary" onClick={tambahUmat}>
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
              <th>ID</th>
              <th>Nama</th>
              <th>JK</th>
              <th>KUB</th>
              <th>KK</th>
              <th>Status</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftar.map((u) => (
              <tr key={u.id}>
                <td className="mono tabular">{u.id}</td>
                <td><PersonLink id={u.id} nama={u.nama ?? '(tanpa nama)'}>{u.nama || '(tanpa nama)'}</PersonLink></td>
                <td>{u.jenisKelamin}</td>
                <td>{u.KUB || '—'}</td>
                <td>{u.idKK || '—'}</td>
                <td><span className="badge badge--status">{u.status}</span></td>
                <td className="cluster" style={{ gap: 4 }}>
                  <select className="field__control" style={{ fontSize: '0.75rem', padding: '2px 6px', minHeight: 'auto' }} value={u.idKK} onChange={(e) => ubahKK(u.id, e.target.value)}>
                    <option value="">—</option>
                    {kkList.map((k) => <option key={k.id} value={k.id}>{k.id}</option>)}
                  </select>
                  <button className="btn btn--ghost btn--sm" onClick={() => hapus(u.id)}>
                    Hapus
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {daftar.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 16 }}>Tidak ada umat yang cocok.</p>}
      </div>

      {detailId && (
        <div className="card" style={{ marginTop: 16 }}>
          <div className="card__header">
            <div className="card__title">Detail Umat</div>
            <button className="btn btn--ghost btn--sm" onClick={() => setDetailId(null)}>
              Tutup
            </button>
          </div>
          <div className="card__body">
            <KartuDetail id={detailId} />
          </div>
        </div>
      )}
    </div>
  );
}

function KartuDetail({ id }: { id: string }) {
  const st = useAplikasi();
  const u = st.umat.find((x) => x.id === id);
  if (!u) return null;
  const peristiwa = st.peristiwa.filter((p) => p.idUmat === id).sort((a, b) => (b.tanggal ?? '').localeCompare(a.tanggal ?? ''));

  return (
    <div className="stack" style={{ gap: 10 }}>
      <div className="cluster muted" style={{ gap: 12, flexWrap: 'wrap' }}>
        <span><b>{u.id}</b></span> ·
        <span>{u.jenisKelamin}</span> ·
        <span>{u.KUB || '—'}</span> ·
        <span>KK {u.idKK || '—'}</span>
      </div>
      <div className="muted">Lahir: {u.tanggalLahir || '—'} · Agama: {u.agama || '—'} · Alamat: {u.alamat || '—'}</div>
      <div className="muted">Status: <b>{u.status}</b></div>

      <div className="muted" style={{ fontWeight: 600, marginTop: 10, marginBottom: 6, borderBottom: '1px solid var(--color-border)', paddingBottom: 4 }}>
        Linimasa Peristiwa
      </div>
      {peristiwa.length === 0 ? (
        <p className="muted">Belum ada peristiwa.</p>
      ) : (
        <ul className="warning-list" style={{ paddingLeft: 0, listStyle: 'none' }}>
          {peristiwa.map((p) => {
            const sinkron = sinkronkanPeristiwa(p, st);
            return (
              <li key={p.id} className="warning-list__item">
                <span className="muted">{p.jenis}</span> ·
                <span className="muted">{p.tanggal || '(belum ada tanggal)'}</span> ·
                <span className="muted">{sinkron.nama}</span> ·
                <span className="muted">{p.keterangan || '—'}</span>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
