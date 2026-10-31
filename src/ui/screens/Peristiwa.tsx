// ============================================================================
// Layar Peristiwa — input peristiwa, kolom identitas sinkron otomatis dari DATA UMAT (Fase 3)
// ============================================================================

import { useEffect, useState } from 'react';
import { useAplikasi, snapshotDari } from '../../state/store.ts';
import { persistensiAktif } from '../../state/autoSave.ts';
import type { JenisPeristiwa, Peristiwa } from '../../engine/types.ts';
import PersonLink from '../components/PersonLink.tsx';
import Field from '../components/Field.tsx';

const JENIS_PERISTIWA: JenisPeristiwa[] = [
  'KEMATIAN', 'PINDAH AGAMA', 'MUTASI_KELUAR', 'MUTASI_MASUK', 'DITERIMA MASUK',
  'BAPTIS', 'KRISMA', 'KOMUNI PERTAMA', 'PERMINYAKAN SUCI', 'SEMINARI BIARA',
  'PERKAWINAN GEREJANI', 'PEMBUBARAN', 'PINDAH ALAMAT',
];

const MUTASI_JENIS: JenisPeristiwa[] = ['MUTASI_KELUAR', 'MUTASI_MASUK', 'DITERIMA MASUK', 'PINDAH ALAMAT'];
const SAKRAMEN_JENIS: JenisPeristiwa[] = ['BAPTIS', 'KRISMA', 'KOMUNI PERTAMA'];

function jenisDefaultUntuk(jenis?: string): JenisPeristiwa {
  if (jenis === 'Mutasi') return MUTASI_JENIS[0];
  if (jenis === 'Sakramen Inisiasi') return SAKRAMEN_JENIS[0];
  if (jenis && JENIS_PERISTIWA.includes(jenis as JenisPeristiwa)) return jenis as JenisPeristiwa;
  return 'KEMATIAN';
}

function cocokJenis(p: Peristiwa, jenis?: string): boolean {
  if (!jenis) return true;
  if (jenis === 'Mutasi') return MUTASI_JENIS.includes(p.jenis);
  if (jenis === 'Sakramen Inisiasi') return SAKRAMEN_JENIS.includes(p.jenis);
  return p.jenis === jenis;
}

export default function Peristiwa({ jenis }: { jenis?: string }) {
  const st = useAplikasi();
  const [form, setForm] = useState({
    idUmat: '', jenis: jenisDefaultUntuk(jenis), tanggal: '', keterangan: '',
  });
  const [editId, setEditId] = useState<string | null>(null);
  const [editTanggal, setEditTanggal] = useState('');
  const [cari, setCari] = useState('');
  const [umatQuery, setUmatQuery] = useState('');
  const [umatOpen, setUmatOpen] = useState(false);
  const [berpindahLingkungan, setBerpindahLingkungan] = useState(false);
  const [anggotaKKIkut, setAnggotaKKIkut] = useState(false);

  const umat = st.umat;
  const umatTerpilih = umat.find((x) => x.id === form.idUmat);
  const umatFiltered = umat
    .filter((u) => {
      const q = umatQuery.trim().toLowerCase();
      if (!q) return true;
      return (u.nama || '').toLowerCase().includes(q) || u.id.toLowerCase().includes(q);
    })
    .slice(0, 15);
  const isMutasi = MUTASI_JENIS.includes(form.jenis);
  const kkKepala = isMutasi && umatTerpilih
    ? st.kk.find((k) => k.namaKepalaKeluarga === (umatTerpilih.nama || ''))
    : undefined;



  useEffect(() => {
    setForm((f) => ({ ...f, jenis: jenisDefaultUntuk(jenis) }));
  }, [jenis]);

  const daftarJenis =
    jenis === 'Mutasi' ? MUTASI_JENIS :
    jenis === 'Sakramen Inisiasi' ? SAKRAMEN_JENIS :
    jenis && JENIS_PERISTIWA.includes(jenis as JenisPeristiwa) ? [jenis as JenisPeristiwa] :
    JENIS_PERISTIWA;

  const simpan = async () => {
    if (!form.idUmat) { st.tampilkanPesan('Pilih umat terlebih dahulu.', 'galat'); return; }
    const u = umat.find((x) => x.id === form.idUmat);
    if (!u) { st.tampilkanPesan('Umat tidak ditemukan.', 'galat'); return; }
    if (!form.tanggal) { st.tampilkanPesan('Tanggal peristiwa wajib diisi.', 'galat'); return; }

    const meta: string[] = [];
    if (isMutasi) meta.push(`Berpindah ke lingkungan lain: ${berpindahLingkungan ? 'Ya' : 'Tidak'}`);
    if (kkKepala) meta.push(`Anggota KK ikut dimutasi: ${anggotaKKIkut ? 'Ya' : 'Tidak'}`);
    const keteranganFinal = [form.keterangan.trim(), meta.join('; ')].filter(Boolean).join(' | ');

    const p: Peristiwa = {
      id: '', idUmat: form.idUmat, jenis: form.jenis, nama: u.nama, lingkungan: st.settings?.namaLingkungan ?? '',
      jenisKelamin: u.jenisKelamin, tanggalLahir: u.tanggalLahir, tanggal: form.tanggal, keterangan: keteranganFinal,
    };
    st.tambahPeristiwa(p);
    await persistensiAktif().simpan(snapshotDari(useAplikasi.getState()));
    setForm({ idUmat: '', jenis: jenisDefaultUntuk(jenis), tanggal: '', keterangan: '' });
    setUmatQuery('');
    setUmatOpen(false);
    setBerpindahLingkungan(false);
    setAnggotaKKIkut(false);
    st.tampilkanPesan('Peristiwa disimpan.', 'ok');


  };

  const hapus = (id: string) => {
    if (!confirm(`Hapus peristiwa ${id}?`)) return;
    st.hapusPeristiwa(id);
  };

  const mulaiUbah = (p: Peristiwa) => {
    setEditId(p.id);
    setEditTanggal(p.tanggal ?? '');
  };

  const batalUbah = () => {
    setEditId(null);
    setEditTanggal('');
  };

  const simpanUbah = async (id: string) => {
    if (!editTanggal.trim()) { st.tampilkanPesan('Tanggal wajib diisi.', 'galat'); return; }
    st.ubahPeristiwa(id, { tanggal: editTanggal.trim() });
    await persistensiAktif().simpan(snapshotDari(useAplikasi.getState()));
    st.tampilkanPesan('Peristiwa diperbarui.', 'ok');
    batalUbah();
  };

  const daftar = st.peristiwa
    .filter((p) => cocokJenis(p, jenis))
    .filter((p) => {
      if (!cari.trim()) return true;
      const u = umat.find((x) => x.id === p.idUmat);
      const q = cari.toLowerCase();
      return (p.id.toLowerCase().includes(q) || (u?.nama ?? '').toLowerCase().includes(q) || p.jenis.toLowerCase().includes(q));
    });

  const judul = jenis ? `Peristiwa ${jenis}` : 'Semua Peristiwa';

  return (
    <div className="page-card">
      <div className="cluster" style={{ marginBottom: 14, gap: 8, flexWrap: 'wrap' }}>
        <Field label="Pilih Umat (ketik nama)" required>
          <div style={{ position: 'relative' }}>
            <input
              className="field__control"
              placeholder="Ketik nama/ID umat untuk filter..."
              value={umatQuery}
              onChange={(e) => { setUmatQuery(e.target.value); setForm({ ...form, idUmat: '' }); setUmatOpen(true); }}
              onFocus={() => setUmatOpen(true)}
              onBlur={() => setTimeout(() => setUmatOpen(false), 150)}
            />
            {umatOpen && (
              <ul
                style={{
                  position: 'absolute', zIndex: 20, left: 0, right: 0, top: '100%',
                  background: 'var(--color-surface, #fff)', border: '1px solid var(--color-border, #ccc)',
                  maxHeight: 220, overflowY: 'auto', listStyle: 'none', margin: 0, padding: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                }}
              >
                {umatFiltered.length === 0 && (
                  <li style={{ padding: 8, color: 'var(--color-text-muted, #666)' }}>Tidak ditemukan.</li>
                )}
                {umatFiltered.map((u) => (
                  <li
                    key={u.id}
                    style={{ padding: '6px 8px', cursor: 'pointer' }}
                    onMouseDown={(e) => e.preventDefault()}
                    onClick={() => {
                      setForm({ ...form, idUmat: u.id });
                      setUmatQuery(u.nama || '');
                      setUmatOpen(false);
                    }}
                  >
                    {u.nama || '(tanpa nama)'} <span className="muted">({u.id})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          {umatTerpilih && (
            <div className="muted" style={{ marginTop: 4, fontSize: 12 }}>
              Terpilih: {umatTerpilih.nama} ({umatTerpilih.id})
            </div>
          )}
        </Field>

        <Field label="Jenis Peristiwa" required>
          <select className="field__control" value={form.jenis} onChange={(e) => setForm({ ...form, jenis: e.target.value as JenisPeristiwa })}>
            {daftarJenis.map((j) => (
              <option key={j} value={j}>{j}</option>
            ))}
          </select>
        </Field>
        <Field label="Tanggal" required>
          <input className="field__control" type="text" placeholder="dd/MM/yyyy" value={form.tanggal} onChange={(e) => setForm({ ...form, tanggal: e.target.value })} />
        </Field>
        <Field label="Keterangan">
          <input className="field__control" value={form.keterangan} onChange={(e) => setForm({ ...form, keterangan: e.target.value })} />
        </Field>
        {isMutasi && (
          <>
            <Field label="Apakah umat berpindah ke lingkungan lain?">
              <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <input type="checkbox" checked={berpindahLingkungan} onChange={(e) => setBerpindahLingkungan(e.target.checked)} />
                Ya, berpindah ke lingkungan lain
              </label>
            </Field>
            {kkKepala && (
              <Field label={`Kepala KK ${kkKepala.id}: anggota KK termasuk yang dimutasi?`}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                  <input type="checkbox" checked={anggotaKKIkut} onChange={(e) => setAnggotaKKIkut(e.target.checked)} />
                  Ya, anggota KK ikut dimutasi
                </label>
              </Field>
            )}
          </>
        )}
        <button className="btn btn--primary" onClick={simpan}>
          Tambah
        </button>
      </div>

      <div className="cluster" style={{ marginBottom: 10 }}>
        <input className="field__control" placeholder={`Cari ${judul.toLowerCase()}...`} value={cari} onChange={(e) => setCari(e.target.value)} style={{ maxWidth: 320 }} />
        <span className="muted">{daftar.length} data</span>
      </div>

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID</th>
              <th>Umat</th>
              {!jenis && <th>Jenis</th>}
              <th>Tanggal</th>
              <th>Keterangan</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {daftar.map((p) => {
              const u = umat.find((x) => x.id === p.idUmat);
              return (
                <tr key={p.id}>
                  <td className="mono tabular">{p.id}</td>
                  <td><PersonLink id={p.idUmat} nama={p.nama || u?.nama || '(tanpa nama)'}>{p.nama || u?.nama || '(tanpa nama)'}</PersonLink></td>
                  {!jenis && <td>{p.jenis}</td>}
                  <td>
                    {editId === p.id ? (
                      <input
                        className="field__control"
                        style={{ width: 120 }}
                        value={editTanggal}
                        onChange={(e) => setEditTanggal(e.target.value)}
                        placeholder="dd/MM/yyyy"
                      />
                    ) : (p.tanggal || '—')}
                  </td>
                  <td>{p.keterangan || '—'}</td>
                  <td className="cluster" style={{ gap: 4 }}>
                    {editId === p.id ? (
                      <>
                        <button className="btn btn--primary btn--sm" onClick={() => { void simpanUbah(p.id); }}>Simpan</button>
                        <button className="btn btn--ghost btn--sm" onClick={batalUbah}>Batal</button>
                      </>
                    ) : (
                      <>
                        <button className="btn btn--ghost btn--sm" onClick={() => mulaiUbah(p)}>Ubah tanggal</button>
                        <button className="btn btn--ghost btn--sm" onClick={() => hapus(p.id)}>Hapus</button>
                      </>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {daftar.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 16 }}>Belum ada peristiwa.</p>}
      </div>
    </div>
  );
}
