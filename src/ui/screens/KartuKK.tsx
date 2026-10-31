// ============================================================================
// Kartu KK — halaman detail satu keluarga, rute #/kk/:id (Fase 8 Â§4.10)
// ============================================================================

import { useState } from 'react';
import { useAplikasi, snapshotDari } from '../../state/store.ts';
import { persistensiAktif } from '../../state/autoSave.ts';
import PersonLink from '../components/PersonLink.tsx';
import Field from '../components/Field.tsx';
import MemberPicker from '../components/MemberPicker.tsx';
import LampiranList from '../components/LampiranList.tsx';

export default function KartuKK({ id }: { id: string }) {
  const st = useAplikasi();
  const kk = st.kk.find((k) => k.id === id);
  const [tambahOpen, setTambahOpen] = useState(false);
  const [editKKOpen, setEditKK] = useState(false);

  if (!kk) {
    return (
      <div className="page-card">
        <div className="empty-state">
          <h2 className="empty-state__title">Keluarga tidak ditemukan</h2>
          <p className="empty-state__body">KK dengan ID {id} tidak ada dalam data lingkungan.</p>
          <div className="cluster">
            <button className="btn btn--primary" onClick={() => (window.location.hash = '#/kk')}>
              Kembali ke Daftar KK
            </button>
          </div>
        </div>
      </div>
    );
  }

  const anggota = st.umat.filter((u) => u.idKK === id).sort((a, b) => (a.nama ?? '').localeCompare(b.nama ?? ''));

  const hapusKK = async () => {
    const ya = await st.mintaKonfirmasi({
      judul: 'Hapus KK ini?',
      pesan: `KK ${kk.id} dan anggotanya akan dihapus. Anggota yang terhapus akan kehilangan tautan KK.`,
      labelKonfirmasi: 'Ya, hapus',
      tone: 'berbahaya',
    });
    if (!ya) return;
    st.hapusKk(kk.id);
    await persistensiAktif().simpan(snapshotDari(st));
    st.tampilkanPesan('KK dihapus.', 'ok');
    window.location.hash = '#/kk';
  };

  const simpanKK = async (patch: { nomorKK: string; namaKepalaKeluarga: string; alamat: string; KUB: string }) => {
    st.ubahKk(kk.id, patch);
    await persistensiAktif().simpan(snapshotDari(useAplikasi.getState()));
    st.tampilkanPesan('Data KK disimpan.', 'ok');
    setEditKK(false);
  };


  return (
    <div className="page-card">
      <div className="detail-header">
        <div>
          <h1 className="detail-header__title">Kartu Keluarga</h1>
          <div className="detail-header__meta">
            <span>ID {kk.id}</span>
            <span>Nomor KK: {kk.nomorKK || '—'}</span>
            <span>KUB: {kk.KUB || '—'}</span>
            <span>Anggota: {anggota.length}</span>
          </div>
          <div className="muted">Alamat: {kk.alamat || '—'}</div>
        </div>
        <div className="cluster" style={{ gap: 6 }}>
          <button className="btn btn--primary" onClick={() => setTambahOpen(true)}>
            + Tambah Anggota
          </button>
          <button className="btn btn--ghost" onClick={() => setEditKK(true)}>
            Edit Data KK
          </button>
          <button className="btn btn--danger" onClick={hapusKK}>
            Hapus KK
          </button>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__header">
          <div className="detail-section__title">Data Keluarga (Kartu Keluarga)</div>
        </div>
        <div className="detail-section__body">
          <div className="form-grid form-grid--2">
            <div><span className="muted">ID KK</span><div className="mono tabular">{kk.id}</div></div>
            <div><span className="muted">Nomor KK</span><div className="mono tabular">{kk.nomorKK || '—'}</div></div>
            <div><span className="muted">Nama Kepala Keluarga</span><div>{kk.namaKepalaKeluarga || '—'}</div></div>
            <div><span className="muted">KUB</span><div>{kk.KUB || '—'}</div></div>
            <div className="field--full"><span className="muted">Alamat</span><div>{kk.alamat || '—'}</div></div>
            <div><span className="muted">RT/RW</span><div>{kk.rtRw || '—'}</div></div>
            <div><span className="muted">Kode Pos</span><div>{kk.kodePos || '—'}</div></div>
            <div><span className="muted">Desa/Kelurahan</span><div>{kk.desaKelurahan || '—'}</div></div>
            <div><span className="muted">Kecamatan</span><div>{kk.kecamatan || '—'}</div></div>
            <div><span className="muted">Kabupaten/Kota</span><div>{kk.kabupatenKota || '—'}</div></div>
            <div><span className="muted">Provinsi</span><div>{kk.provinsi || '—'}</div></div>
            <div><span className="muted">Tanggal Dikeluarkan</span><div>{kk.tanggalDikeluarkan || '—'}</div></div>
          </div>
        </div>
      </div>


      <div className="detail-section">
        <div className="detail-section__header">
          <div className="detail-section__title">Metadata Scan</div>
        </div>
        <div className="detail-section__body">
          <div className="form-grid form-grid--3">
            <div><span className="muted">File Sumber</span><div>{kk.fileSumber || kk.namaFileScan || '—'}</div></div>
            <div><span className="muted">Confidence OCR</span><div>{kk.confidenceOcr !== undefined ? `${Math.round(kk.confidenceOcr * 100)}%` : '—'}</div></div>
            <div className="field--full"><span className="muted">Catatan Verifikasi</span><div>{kk.catatanVerifikasi || '—'}</div></div>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__header">
          <div className="detail-section__title">Anggota Keluarga</div>
        </div>
        <div className="detail-section__body">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>No</th>
                  <th>Nama Lengkap</th>
                  <th>NIK</th>
                  <th>JK</th>
                  <th>Tempat Lahir</th>
                  <th>Tanggal Lahir</th>
                  <th>Agama</th>
                  <th>Pendidikan</th>
                  <th>Pekerjaan</th>
                  <th>Gol. Darah</th>
                  <th>Status Perkawinan</th>
                  <th>Tgl. Kawin</th>
                  <th>Status Hubungan</th>
                  <th>Kewarganegaraan</th>
                  <th>Nama Ayah</th>
                  <th>Nama Ibu</th>
                  <th>Status</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {anggota.map((u, index) => (
                  <tr key={u.id}>
                    <td>{index + 1}</td>
                    <td>
                      <PersonLink id={u.id} nama={u.nama ?? '(tanpa nama)'}>{u.nama || '(tanpa nama)'}</PersonLink>
                    </td>
                    <td className="mono tabular">{u.nik || '—'}</td>
                    <td>{u.jenisKelamin}</td>
                    <td>{u.tempatLahir || '—'}</td>
                    <td>{u.tanggalLahir || '—'}</td>
                    <td>{u.agama || '—'}</td>
                    <td>{u.pendidikan || '—'}</td>
                    <td>{u.pekerjaan || '—'}</td>
                    <td>{u.golonganDarah || '—'}</td>
                    <td>{u.statusPerkawinan || '—'}</td>
                    <td>{u.tanggalPerkawinan || '—'}</td>
                    <td>{u.statusHubunganKeluarga || '—'}</td>
                    <td>{u.kewarganegaraan || '—'}</td>
                    <td>{u.namaAyah || '—'}</td>
                    <td>{u.namaIbu || '—'}</td>
                    <td><span className="badge badge--status">{u.status}</span></td>
                    <td>
                      <button className="btn btn--ghost btn--sm" onClick={() => (window.location.hash = `#/umat/${u.id}`)}>
                        Buka
                      </button>
                    </td>
                  </tr>
                ))}
                {anggota.length === 0 && (
                  <tr><td colSpan={18} style={{ textAlign: 'center', color: 'var(--color-text-muted)' }}>Belum ada anggota.</td></tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__header">
          <div className="detail-section__title">Lampiran</div>
        </div>
        <div className="detail-section__body">
          <LampiranList entitas="kk" idEntitas={kk.id} lampiran={kk.lampiran ?? []} />
        </div>
      </div>

      {tambahOpen && (
        <MemberPicker idKK={kk.id} onClose={() => setTambahOpen(false)} onSelesai={() => st.tampilkanPesan('Anggota ditambahkan.', 'ok')} />
      )}
      {editKKOpen && (
        <EditKKForm kk={kk} daftarKUB={st.settings?.daftarKUB ?? []} onSelesai={simpanKK} onClose={() => setEditKK(false)} />
      )}

    </div>
  );
}

function EditKKForm({ kk, daftarKUB, onSelesai, onClose }: { kk: { id: string; nomorKK: string; namaKepalaKeluarga: string; alamat: string; KUB: string }; daftarKUB: string[]; onSelesai: (p: { nomorKK: string; namaKepalaKeluarga: string; alamat: string; KUB: string }) => void; onClose: () => void }) {

  const [form, setForm] = useState<{ nomorKK: string; namaKepalaKeluarga: string; alamat: string; KUB: string }>({
    nomorKK: kk.nomorKK, namaKepalaKeluarga: kk.namaKepalaKeluarga, alamat: kk.alamat, KUB: kk.KUB,
  });

  return (
    <div className="card" style={{ marginTop: 16 }}>
      <div className="card__header">
        <div className="card__title">Edit Data KK</div>
        <button className="btn btn--ghost btn--sm" onClick={onClose}>
          Tutup
        </button>
      </div>
      <div className="card__body">
        <div className="form-grid form-grid--2">
          <Field label="Nomor KK" required>
            <input className="field__control" value={form.nomorKK} onChange={(e) => setForm({ ...form, nomorKK: e.target.value })} />
          </Field>
          <Field label="Kepala Keluarga" required>
            <input className="field__control" value={form.namaKepalaKeluarga} onChange={(e) => setForm({ ...form, namaKepalaKeluarga: e.target.value })} />
          </Field>
          <Field label="Alamat" className="field--full">
            <input className="field__control" value={form.alamat} onChange={(e) => setForm({ ...form, alamat: e.target.value })} />
          </Field>
          <Field label="KUB">
            <select className="field__control" value={form.KUB} onChange={(e) => setForm({ ...form, KUB: e.target.value })}>
              <option value="">-- Pilih KUB --</option>
              {daftarKUB.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>

          </Field>
        </div>
        <div className="cluster" style={{ marginTop: 10 }}>
          <button className="btn btn--primary" onClick={() => onSelesai(form)}>
            Simpan
          </button>
          <button className="btn btn--ghost" onClick={onClose}>
            Batal
          </button>
        </div>
      </div>
    </div>
  );
}

