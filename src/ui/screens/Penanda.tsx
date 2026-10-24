// ============================================================================
// Layar Perlu Ditindaklanjuti — dua kelompok penanda, filter per KUB dan jenis (Fase 4)
// ============================================================================

import { useState } from 'react';
import { useAplikasi, penandaDariState, type Penanda, type AplikasiState } from '../../state/store.ts';
import PersonLink from '../components/PersonLink.tsx';

export default function Penanda() {
  const st = useAplikasi();
  const penanda = penandaDariState(st);
  const daftarKUB = st.settings?.daftarKUB ?? [];

  const [filterKUB, setFilterKUB] = useState<string>('all');
  const [filterJenis, setFilterJenis] = useState<string>('all');

  let hasil = penanda.filter((p) => p.aktif);
  if (filterKUB !== 'all') hasil = hasil.filter((p) => {
    const u = st.umat.find((x) => x.id === p.idEntitas);
    return u?.KUB === filterKUB;
  });
  if (filterJenis !== 'all') hasil = hasil.filter((p) => p.jenis === filterJenis);

  const perluDilengkapi = hasil.filter((p) => p.jenis === 'Perlu dilengkapi');
  const perluKonfirmasi = hasil.filter((p) => p.jenis === 'Perlu konfirmasi');

  return (
    <div className="page-card">
      <p className="lead">
        Penanda adalah pengingat, tidak memblokir penyimpanan dan tidak mengubah angka rekap. Kuning = perlu dilengkapi, biru lembut = perlu konfirmasi.
      </p>

      <div className="cluster" style={{ marginBottom: 14, gap: 8, flexWrap: 'wrap' }}>
        <label style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)' }}>Filter KUB:</label>
        <select className="field__control" value={filterKUB} onChange={(e) => setFilterKUB(e.target.value)} style={{ width: 170 }}>
          <option value="all">Semua KUB</option>
          {daftarKUB.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <label style={{ fontSize: '0.875rem', color: 'var(--color-text-muted)', marginLeft: 10 }}>Jenis:</label>
        <select className="field__control" value={filterJenis} onChange={(e) => setFilterJenis(e.target.value)} style={{ width: 170 }}>
          <option value="all">Semua</option>
          <option value="Perlu dilengkapi">Perlu dilengkapi</option>
          <option value="Perlu konfirmasi">Perlu konfirmasi</option>
        </select>
        <span className="muted">{hasil.length} aktif dari {penanda.length}</span>
      </div>

      <div className="grid-2">
        <div className="card">
          <div className="card__header">
            <div className="card__title">Perlu Dilengkapi ({perluDilengkapi.length})</div>
          </div>
          <div className="card__body">
            <ul className="warning-list">
              {perluDilengkapi.map((p) => renderItem(p, st))}
              {perluDilengkapi.length === 0 && <li className="warning-list__item" style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>(tidak ada)</li>}
            </ul>
          </div>
        </div>
        <div className="card">
          <div className="card__header">
            <div className="card__title">Perlu Konfirmasi ({perluKonfirmasi.length})</div>
          </div>
          <div className="card__body">
            <ul className="warning-list">
              {perluKonfirmasi.map((p) => renderItem(p, st))}
              {perluKonfirmasi.length === 0 && <li className="warning-list__item" style={{ color: 'var(--color-text-muted)', textAlign: 'center' }}>(tidak ada)</li>}
            </ul>
          </div>
        </div>
      </div>

      <p className="muted">
        Keterangan: ini adalah daftar peringatan. Atur kembali data di layar Umat / Peristiwa, lalu penanda akan dihitung ulang otomatis.
      </p>
    </div>
  );
}

function renderItem(p: Penanda, st: AplikasiState) {
  const u = st.umat.find((x) => x.id === p.idEntitas);
  return (
    <li key={p.id} className="warning-list__item warning-list__item--complete">
      <div className="cluster" style={{ gap: 6 }}>
        <span className="badge badge--complete">{p.jenis}</span>
        <span className="muted">{p.pesan}</span>
        {u && <PersonLink id={u.id} nama={u.nama ?? '(tanpa nama)'}>{u.nama || '(tanpa nama)'}</PersonLink>}
      </div>
    </li>
  );
}
