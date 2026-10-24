// ============================================================================
// MemberPicker — dialog tambah anggota ke KK (Fase 8 §4.10)
// ============================================================================

import { useState } from 'react';
import { useAplikasi } from '../../state/store.ts';
import type { Umat } from '../../engine/types.ts';
import { normalisasiNama } from '../../engine/warnings.ts';
import PersonLink from './PersonLink.tsx';
import Field from './Field.tsx';

export interface MemberPickerProps {
  idKK: string;
  onClose: () => void;
  onSelesai: () => void;
}

export default function MemberPicker({ idKK, onClose, onSelesai }: MemberPickerProps) {
  const st = useAplikasi();
  const [mode, setMode] = useState<'ada' | 'baru'>('ada');
  const [cari, setCari] = useState('');
  const [baru, setBaru] = useState<{ nama: string; jenisKelamin: string; tanggalLahir: string; agama: string; alamat: string; KUB: string }>({
    nama: '', jenisKelamin: 'Laki-laki', tanggalLahir: '', agama: 'Katolik', alamat: '', KUB: '',
  });

  const kk = st.kk.find((k) => k.id === idKK);
  const anggotaIds = new Set(st.umat.filter((u) => u.idKK === idKK).map((u) => u.id));

  const candidates = st.umat.filter((u) => u.idKK !== idKK && !anggotaIds.has(u.id) && (
    u.nama.toLowerCase().includes(cari.toLowerCase()) || u.id.toLowerCase().includes(cari.toLowerCase())
  ));

  const pilihAda = async (id: string) => {
    const ya = await st.mintaKonfirmasi({
      judul: 'Gabungkan ke KK ini?',
      pesan: `Umat ini akan dipindahkan ke KK ${idKK}. Konfirmasi untuk melanjutkan.`,
      labelKonfirmasi: 'Ya, pindahkan',
    });
    if (!ya) return;
    st.ubahUmat(id, { idKK });
    onSelesai();
    onClose();
  };

  const simpanBaru = async () => {
    if (!baru.nama.trim()) { st.tampilkanPesan('Nama wajib diisi.', 'galat'); return; }
    const u: Umat = {
      id: '', idKK, nama: baru.nama.trim(), jenisKelamin: baru.jenisKelamin as 'Laki-laki' | 'Perempuan',
      tanggalLahir: baru.tanggalLahir, agama: baru.agama, status: 'Aktif', KUB: baru.KUB || (kk?.KUB ?? ''), alamat: baru.alamat || (kk?.alamat ?? ''),
      lampiran: [],
    };
    st.tambahUmat(u);
    onSelesai();
    onClose();
  };

  const duplikat = candidates.find((u) => {
    const samaNama = normalisasiNama(u.nama ?? '') === normalisasiNama(baru.nama);
    const samaTgl = u.tanggalLahir && baru.tanggalLahir && u.tanggalLahir === baru.tanggalLahir;
    return samaNama && samaTgl;
  });

  return (
    <div className="dialog__backdrop" onClick={onClose}>
      <div className="dialog dialog--wide" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <div className="dialog__header">
          <h2 className="dialog__title">Tambah Anggota ke KK {idKK}</h2>
          <button className="btn btn--ghost btn--sm" onClick={onClose}>
            Tutup
          </button>
        </div>
        <div className="dialog__body">
          <div className="cluster" style={{ marginBottom: 12, gap: 8 }}>
            <button className={`btn btn--ghost ${mode === 'ada' ? 'btn--primary' : ''}`} onClick={() => setMode('ada')}>
              Pilih umat yang sudah ada
            </button>
            <button className={`btn btn--ghost ${mode === 'baru' ? 'btn--primary' : ''}`} onClick={() => setMode('baru')}>
              Buat umat baru
            </button>
          </div>

          {mode === 'ada' && (
            <div className="stack" style={{ gap: 8 }}>
              <input
                className="field__control"
                placeholder="Cari nama atau ID umat…"
                value={cari}
                onChange={(e) => setCari(e.target.value)}
              />
              {candidates.length === 0 && <p className="muted">Tidak ada umat yang cocok.</p>}
              {candidates.map((u) => {
                const isDup = duplikat && duplikat.id === u.id;
                return (
                  <div key={u.id} className="warning-list__item" style={{ padding: 6, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div>
                      <PersonLink id={u.id} nama={u.nama ?? '(tanpa nama)'}>{u.nama || '(tanpa nama)'}</PersonLink>
                      <div className="muted" style={{ fontSize: '0.75rem' }}>{u.id} · {u.jenisKelamin} · {u.tanggalLahir || '—'} · {u.KUB || '—'}</div>
                      {isDup && <span className="badge badge--confirm">Mungkin duplikat (nama & lahir sama)</span>}
                    </div>
                    <button className="btn btn--primary btn--sm" onClick={() => pilihAda(u.id)}>
                      Pilih
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {mode === 'baru' && (
            <div className="form-grid form-grid--2" style={{ gap: 10 }}>
              <Field label="Nama lengkap" required>
                <input className="field__control" value={baru.nama} onChange={(e) => setBaru({ ...baru, nama: e.target.value })} />
              </Field>
              <Field label="Jenis Kelamin">
                <select className="field__control" value={baru.jenisKelamin} onChange={(e) => setBaru({ ...baru, jenisKelamin: e.target.value as 'Laki-laki' | 'Perempuan' })}>
                  <option value="Laki-laki">Laki-laki</option>
                  <option value="Perempuan">Perempuan</option>
                </select>
              </Field>
              <Field label="Tanggal Lahir">
                <input className="field__control" type="text" value={baru.tanggalLahir} onChange={(e) => setBaru({ ...baru, tanggalLahir: e.target.value })} placeholder="dd/MM/yyyy" />
              </Field>
              <Field label="Agama">
                <input className="field__control" value={baru.agama} onChange={(e) => setBaru({ ...baru, agama: e.target.value })} />
              </Field>
              <Field label="KUB">
                <select className="field__control" value={baru.KUB} onChange={(e) => setBaru({ ...baru, KUB: e.target.value })}>
                  <option value="">-- Ikuti KK ({kk?.KUB || '—'}) --</option>
                  {st.settings?.daftarKUB.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </Field>
              <Field label="Alamat" className="field--full">
                <input className="field__control" value={baru.alamat} onChange={(e) => setBaru({ ...baru, alamat: e.target.value })} />
              </Field>
              {duplikat && <p className="msg-warn">Peringatan: sudah ada umat dengan nama dan tanggal lahir yang sama. Pastikan bukan duplikat.</p>}
            </div>
          )}
        </div>
        <div className="dialog__actions">
          <button className="btn btn--ghost" onClick={onClose}>
            Batal
          </button>
          {mode === 'baru' ? (
            <button className="btn btn--primary" onClick={simpanBaru}>
              Simpan Anggota Baru
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
