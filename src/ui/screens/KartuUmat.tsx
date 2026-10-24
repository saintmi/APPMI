// ============================================================================
// Kartu Umat — halaman detail satu umat, rute #/umat/:id (Fase 8 §4.9)
// ============================================================================

import { useState } from 'react';
import { useAplikasi, snapshotDari, umatDenganStatus } from '../../state/store.ts';
import { persistensiDexie } from '../../state/persistence.ts';
import { gotoRute } from '../router.ts';
import type { Umat } from '../../engine/types.ts';
import PersonLink from '../components/PersonLink.tsx';
import Field from '../components/Field.tsx';
import LampiranList from '../components/LampiranList.tsx';

export default function KartuUmat({ id }: { id: string }) {
  const st = useAplikasi();
  const umat = umatDenganStatus(st);
  const u = umat.find((x) => x.id === id);
  const [edit, setEdit] = useState<{ bagian: string | null; data: Partial<Umat> | null }>({ bagian: null, data: null });

  if (!u) {
    return (
      <div className="page-card">
        <div className="empty-state">
          <h2 className="empty-state__title">Umat tidak ditemukan</h2>
          <p className="empty-state__body">Umat dengan ID {id} tidak ada dalam data lingkungan.</p>
          <div className="cluster">
            <button className="btn btn--primary" onClick={() => gotoRute({ layar: 'umat' })}>
              Kembali ke Daftar Umat
            </button>
          </div>
        </div>
      </div>
    );
  }

  const daftarKUB = st.settings?.daftarKUB ?? [];
  const kkList = st.kk;

  const simpanBagian = async (bagian: string) => {
    const data = edit.data;
    if (!data) return;
    const patch: Partial<Umat> = {};
    if (bagian === 'identitas') {
      patch.nama = (data.nama ?? '').trim() || u.nama;
      patch.jenisKelamin = (data.jenisKelamin ?? u.jenisKelamin) as 'Laki-laki' | 'Perempuan';
      patch.tanggalLahir = (data.tanggalLahir ?? u.tanggalLahir) || '';
      patch.agama = (data.agama ?? u.agama) || '';
      patch.alamat = (data.alamat ?? u.alamat) || '';
    }
    if (bagian === 'kk') {
      patch.idKK = (data.idKK ?? u.idKK) || '';
    }
    if (bagian === 'scan') {
      patch.nik = (data.nik ?? u.nik) || '';
      patch.tempatLahir = (data.tempatLahir ?? u.tempatLahir) || '';
      patch.pendidikan = (data.pendidikan ?? u.pendidikan) || '';
      patch.pekerjaan = (data.pekerjaan ?? u.pekerjaan) || '';
      patch.golonganDarah = (data.golonganDarah ?? u.golonganDarah) || '';
      patch.statusPerkawinan = (data.statusPerkawinan ?? u.statusPerkawinan) || '';
      patch.tanggalPerkawinan = (data.tanggalPerkawinan ?? u.tanggalPerkawinan) || '';
      patch.statusHubunganKeluarga = (data.statusHubunganKeluarga ?? u.statusHubunganKeluarga) || '';
      patch.kewarganegaraan = (data.kewarganegaraan ?? u.kewarganegaraan) || '';
      patch.namaAyah = (data.namaAyah ?? u.namaAyah) || '';
      patch.namaIbu = (data.namaIbu ?? u.namaIbu) || '';
    }
    if (bagian === 'kub') {
      patch.KUB = (data.KUB ?? u.KUB) || '';
    }

    st.ubahUmat(u.id, patch);
    await persistensiDexie.simpan(snapshotDari(st));
    st.tampilkanPesan(`${bagian} disimpan.`, 'ok');
  };

  const batal = () => setEdit({ bagian: null, data: null });

  const peristiwa = st.peristiwa.filter((p) => p.idUmat === id).sort((a, b) => (b.tanggal ?? '').localeCompare(a.tanggal ?? ''));
  const kk = st.kk.find((k) => k.id === u.idKK);

  return (
    <div className="page-card">
      <div className="detail-header">
        <div>
          <h1 className="detail-header__title">{u.nama || '(tanpa nama)'}</h1>
          <div className="detail-header__meta">
            <span className="badge badge--status">{u.status}</span>
            <span>ID {u.id}</span>
            <span>KUB {u.KUB || '—'}</span>
            {kk && <span>KK <PersonLink id={kk.id} nama={kk.namaKepalaKeluarga || 'Keluarga'}>{kk.id} · {kk.namaKepalaKeluarga}</PersonLink></span>}
          </div>
          <div className="muted">
            Lahir: {u.tanggalLahir || '—'} · Agama: {u.agama || '—'} · Alamat: {u.alamat || '—'}
          </div>
        </div>
        <div className="cluster" style={{ gap: 6 }}>
          <button className="btn btn--primary" onClick={() => setEdit({ bagian: 'identitas', data: { nama: u.nama, jenisKelamin: u.jenisKelamin, tanggalLahir: u.tanggalLahir, agama: u.agama, alamat: u.alamat } })}>
            Edit Data Diri
          </button>
          <button className="btn btn--ghost" onClick={() => setEdit({ bagian: 'kk', data: { idKK: u.idKK } })}>
            Edit KK
          </button>
          <button className="btn btn--ghost" onClick={() => setEdit({ bagian: 'kub', data: { KUB: u.KUB } })}>
            Edit KUB
          </button>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__header">
          <div className="detail-section__title">Data Diri</div>
          {edit.bagian === 'identitas' ? (
            <div className="cluster" style={{ gap: 6 }}>
              <button className="btn btn--primary btn--sm" onClick={() => simpanBagian('identitas')}>
                Simpan
              </button>
              <button className="btn btn--ghost btn--sm" onClick={batal}>
                Batal
              </button>
            </div>
          ) : (
            <button className="btn btn--ghost btn--sm" onClick={() => setEdit({ bagian: 'identitas', data: { nama: u.nama, jenisKelamin: u.jenisKelamin, tanggalLahir: u.tanggalLahir, agama: u.agama, alamat: u.alamat } })}>
              Edit
            </button>
          )}
        </div>
        <div className="detail-section__body">
          {edit.bagian === 'identitas' ? (
            <div className="form-grid form-grid--2" style={{ gap: 10 }}>
              <Field label="Nama lengkap" required>
                <input className="field__control" value={edit.data?.nama ?? ''} onChange={(e) => setEdit({ bagian: 'identitas', data: { ...edit.data!, nama: e.target.value } })} />
              </Field>
              <Field label="Jenis Kelamin">
                <select className="field__control" value={edit.data?.jenisKelamin ?? u.jenisKelamin} onChange={(e) => setEdit({ bagian: 'identitas', data: { ...edit.data!, jenisKelamin: e.target.value as 'Laki-laki' | 'Perempuan' } })}>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </Field>
              <Field label="Tanggal Lahir">
                <input className="field__control" type="text" value={edit.data?.tanggalLahir ?? ''} onChange={(e) => setEdit({ bagian: 'identitas', data: { ...edit.data!, tanggalLahir: e.target.value } })} placeholder="dd/MM/yyyy" />
              </Field>
              <Field label="Agama">
                <input className="field__control" value={edit.data?.agama ?? ''} onChange={(e) => setEdit({ bagian: 'identitas', data: { ...edit.data!, agama: e.target.value } })} />
              </Field>
              <Field label="Alamat" className="field--full">
                <input className="field__control" value={edit.data?.alamat ?? ''} onChange={(e) => setEdit({ bagian: 'identitas', data: { ...edit.data!, alamat: e.target.value } })} />
              </Field>
            </div>
          ) : (
            <div className="cluster muted" style={{ gap: 12, flexWrap: 'wrap' }}>
              <span>Nama: <b>{u.nama || '(tanpa nama)'}</b></span>
              <span>Jenis kelamin: {u.jenisKelamin}</span>
              <span>Tanggal lahir: {u.tanggalLahir || '—'}</span>
              <span>Agama: {u.agama || '—'}</span>
              <span>Alamat: {u.alamat || '—'}</span>
            </div>
          )}
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__header">
          <div className="detail-section__title">Data Scan (KK)</div>
          {edit.bagian === 'scan' ? (
            <div className="cluster" style={{ gap: 6 }}>
              <button className="btn btn--primary btn--sm" onClick={() => simpanBagian('scan')}>Simpan</button>
              <button className="btn btn--ghost btn--sm" onClick={batal}>Batal</button>
            </div>
          ) : (
            <button className="btn btn--ghost btn--sm" onClick={() => setEdit({ bagian: 'scan', data: { nik: u.nik, tempatLahir: u.tempatLahir, pendidikan: u.pendidikan, pekerjaan: u.pekerjaan, golonganDarah: u.golonganDarah, statusPerkawinan: u.statusPerkawinan, tanggalPerkawinan: u.tanggalPerkawinan, statusHubunganKeluarga: u.statusHubunganKeluarga, kewarganegaraan: u.kewarganegaraan, namaAyah: u.namaAyah, namaIbu: u.namaIbu } })}>Edit</button>
          )}
        </div>
        <div className="detail-section__body">
          {edit.bagian === 'scan' ? (
            <div className="form-grid form-grid--2" style={{ gap: 10 }}>
              <Field label="NIK"><input className="field__control" value={edit.data?.nik ?? ''} onChange={(e) => setEdit({ bagian: 'scan', data: { ...edit.data!, nik: e.target.value } })} /></Field>
              <Field label="Tempat Lahir"><input className="field__control" value={edit.data?.tempatLahir ?? ''} onChange={(e) => setEdit({ bagian: 'scan', data: { ...edit.data!, tempatLahir: e.target.value } })} /></Field>
              <Field label="Pendidikan"><input className="field__control" value={edit.data?.pendidikan ?? ''} onChange={(e) => setEdit({ bagian: 'scan', data: { ...edit.data!, pendidikan: e.target.value } })} /></Field>
              <Field label="Pekerjaan"><input className="field__control" value={edit.data?.pekerjaan ?? ''} onChange={(e) => setEdit({ bagian: 'scan', data: { ...edit.data!, pekerjaan: e.target.value } })} /></Field>
              <Field label="Golongan Darah"><input className="field__control" value={edit.data?.golonganDarah ?? ''} onChange={(e) => setEdit({ bagian: 'scan', data: { ...edit.data!, golonganDarah: e.target.value } })} /></Field>
              <Field label="Status Perkawinan"><input className="field__control" value={edit.data?.statusPerkawinan ?? ''} onChange={(e) => setEdit({ bagian: 'scan', data: { ...edit.data!, statusPerkawinan: e.target.value } })} /></Field>
              <Field label="Tanggal Perkawinan"><input className="field__control" value={edit.data?.tanggalPerkawinan ?? ''} onChange={(e) => setEdit({ bagian: 'scan', data: { ...edit.data!, tanggalPerkawinan: e.target.value } })} placeholder="dd/MM/yyyy" /></Field>
              <Field label="Hubungan Keluarga"><input className="field__control" value={edit.data?.statusHubunganKeluarga ?? ''} onChange={(e) => setEdit({ bagian: 'scan', data: { ...edit.data!, statusHubunganKeluarga: e.target.value } })} /></Field>
              <Field label="Kewarganegaraan"><input className="field__control" value={edit.data?.kewarganegaraan ?? ''} onChange={(e) => setEdit({ bagian: 'scan', data: { ...edit.data!, kewarganegaraan: e.target.value } })} /></Field>
              <Field label="Nama Ayah"><input className="field__control" value={edit.data?.namaAyah ?? ''} onChange={(e) => setEdit({ bagian: 'scan', data: { ...edit.data!, namaAyah: e.target.value } })} /></Field>
              <Field label="Nama Ibu"><input className="field__control" value={edit.data?.namaIbu ?? ''} onChange={(e) => setEdit({ bagian: 'scan', data: { ...edit.data!, namaIbu: e.target.value } })} /></Field>
            </div>
          ) : (
            <div className="cluster muted" style={{ gap: 12, flexWrap: 'wrap' }}>
              <span>NIK: <b>{u.nik || '—'}</b></span>
              <span>Tempat Lahir: <b>{u.tempatLahir || '—'}</b></span>
              <span>Pendidikan: <b>{u.pendidikan || '—'}</b></span>
              <span>Pekerjaan: <b>{u.pekerjaan || '—'}</b></span>
              <span>Gol. Darah: <b>{u.golonganDarah || '—'}</b></span>
              <span>Status Kawin: <b>{u.statusPerkawinan || '—'}</b></span>
              <span>Tgl Kawin: <b>{u.tanggalPerkawinan || '—'}</b></span>
              <span>Hubungan: <b>{u.statusHubunganKeluarga || '—'}</b></span>
              <span>WNI: <b>{u.kewarganegaraan || '—'}</b></span>
              <span>Ayah: <b>{u.namaAyah || '—'}</b></span>
              <span>Ibu: <b>{u.namaIbu || '—'}</b></span>
            </div>
          )}
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__header">
          <div className="detail-section__title">Kartu Keluarga &amp; KUB</div>
          {edit.bagian === 'kk' || edit.bagian === 'kub' ? (
            <div className="cluster" style={{ gap: 6 }}>
              <button className="btn btn--primary btn--sm" onClick={() => simpanBagian(edit.bagian === 'kk' ? 'kk' : 'kub')}>
                Simpan
              </button>
              <button className="btn btn--ghost btn--sm" onClick={batal}>
                Batal
              </button>
            </div>
          ) : (
            <button className="btn btn--ghost btn--sm" onClick={() => setEdit({ bagian: 'kk', data: { idKK: u.idKK } })}>
              Edit KK
            </button>
          )}
        </div>
        <div className="detail-section__body">
          <div className="cluster muted" style={{ gap: 12, flexWrap: 'wrap' }}>
            <span>KK: {kk ? <PersonLink id={kk.id} nama={kk.namaKepalaKeluarga || 'Keluarga'}>{kk.id} · {kk.namaKepalaKeluarga}</PersonLink> : '—'}</span>
            <span>KUB: <b>{u.KUB || '—'}</b></span>
          </div>
          {edit.bagian === 'kk' && (
            <Field label="KK" className="field--full">
              <select className="field__control" value={edit.data?.idKK ?? ''} onChange={(e) => setEdit({ bagian: 'kk', data: { ...edit.data!, idKK: e.target.value } })}>
                <option value="">-- Tidak ada KK --</option>
                {kkList.map((k) => <option key={k.id} value={k.id}>{k.id} · {k.namaKepalaKeluarga}</option>)}
              </select>
            </Field>
          )}
          {edit.bagian === 'kub' && (
            <Field label="KUB" className="field--full">
              <select className="field__control" value={edit.data?.KUB ?? ''} onChange={(e) => setEdit({ bagian: 'kub', data: { ...edit.data!, KUB: e.target.value } })}>
                <option value="">-- Pilih KUB --</option>
                {daftarKUB.map((k) => <option key={k} value={k}>{k}</option>)}
              </select>
            </Field>
          )}
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__header">
          <div className="detail-section__title">Peristiwa</div>
        </div>
        <div className="detail-section__body">
          <ul className="warning-list" style={{ maxHeight: 300, overflowY: 'auto' }}>
            {peristiwa.map((p) => (
              <li key={p.id} className="warning-list__item">
                <span className="muted">{p.jenis}</span> ·
                <span className="muted">{p.tanggal || '(belum ada tanggal)'}</span> ·
                <span className="muted">{p.keterangan || '—'}</span>
              </li>
            ))}
            {peristiwa.length === 0 && <li className="warning-list__item" style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>Belum ada peristiwa.</li>}
          </ul>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__header">
          <div className="detail-section__title">Riwayat Perubahan</div>
        </div>
        <div className="detail-section__body">
          <ul className="warning-list" style={{ maxHeight: 240, overflowY: 'auto' }}>
            {st.audit
              .filter((e) => e.idEntitas === id)
              .reverse()
              .slice(0, 10)
              .map((e) => (
                <li key={e.id} className="warning-list__item">
                  <span className="muted tabular" style={{ fontSize: '0.75rem', marginRight: 6 }}>{new Date(e.waktu).toLocaleString()}</span>
                  <span className="muted">{e.aksi}</span>
                  <span className="muted">{e.entitas}</span>
                </li>
              ))}
            {st.audit.filter((e) => e.idEntitas === id).length === 0 && (
              <li className="warning-list__item" style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>Belum ada perubahan.</li>
            )}
          </ul>
        </div>
      </div>

      <div className="detail-section">
        <div className="detail-section__header">
          <div className="detail-section__title">Lampiran</div>
        </div>
        <div className="detail-section__body">
          <LampiranList entitas="umat" idEntitas={id} lampiran={u.lampiran ?? []} />
        </div>
      </div>
    </div>
  );
}
