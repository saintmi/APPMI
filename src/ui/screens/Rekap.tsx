// ============================================================================
// Layar Rekap — angka REKAP LINGKUNGAN & DETAIL dari computeRekap, klik angka → daftar nama (Fase 4)
// ============================================================================

import { useState } from 'react';
import { rekapDariState, rekapByKUBDariState, umatDenganStatus, type AplikasiState, type UmatDenganStatus } from '../../state/store.ts';
import PersonLink from '../components/PersonLink.tsx';

export default function Rekap({ st }: { st: AplikasiState }) {
  const rekap = rekapDariState(st);
  const byKUB = rekapByKUBDariState(st);
  const [bukaKUB, setBukaKUB] = useState<string | null>(null);
  const [bukaRekap, setBukaRekap] = useState<{ label: string; ids: string[] } | null>(null);

  const totalJiwa = rekap.find((r) => r.label === 'Total Jiwa Aktif')?.nilai ?? 0;
  const daftarUmat = umatDenganStatus(st);
  const aktifKK = new Set(daftarUmat.filter((u) => u.status === 'Aktif').map((u) => u.idKK).filter(Boolean)).size;
  const umatById = new Map(daftarUmat.map((u) => [u.id, u]));

  const kartu = (judul: string, nilai: string, keterangan: string) => (
    <div className="stat">
      <div className="stat__label">{judul}</div>
      <div className="stat__value tabular">{nilai}</div>
      <div className="stat__note">{keterangan}</div>
    </div>
  );

  const daftarUmatAktif = daftarUmat.filter((u) => u.status === 'Aktif');

  return (
    <div className="page-card">
      <div className="summary-grid">
        {kartu('Total Jiwa Aktif', String(totalJiwa), 'Umat berstatus Aktif')}
        {kartu('KUB', String(byKUB.length), 'Kelompok Umat Bupati')}
        {kartu('KK', String(aktifKK), 'KK yang memiliki anggota aktif')}
      </div>

      <div className="card">
        <div className="card__header">
          <div className="card__title">Rekap per KUB</div>
        </div>
        <div className="card__body">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>KUB</th>
                  <th>Jiwa Aktif</th>
                  <th>KK Aktif</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {byKUB.map((k) => {
                  const umatKUB = daftarUmatAktif.filter((u) => u.KUB === k.kub);
                  const kkKUB = new Set(umatKUB.map((u) => u.idKK).filter(Boolean)).size;
                  return (
                    <tr key={k.kub}>
                      <td>{k.kub}</td>
                      <td className="tabular">{k.jumlahJiwa}</td>
                      <td className="tabular">{kkKUB}</td>
                      <td>
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => setBukaKUB(bukaKUB === k.kub ? null : k.kub)}
                        >
                          {bukaKUB === k.kub ? 'Sembunyikan' : 'Lihat daftar umat'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          {bukaKUB && <DaftarUmatKUB kub={bukaKUB} st={st} onTutup={() => setBukaKUB(null)} />}
        </div>
      </div>

      <div className="card" style={{ marginTop: 24 }}>
        <div className="card__header">
          <div className="card__title">Semua Angka Rekap</div>
        </div>
        <div className="card__body">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Label</th>
                  <th>Nilai</th>
                  <th>Sheet</th>
                  <th>Bukti (ID)</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>
                {rekap.map((r) => (
                  <tr key={r.label + r.sheet}>
                    <td>{r.label}</td>
                    <td className="tabular" onClick={() => (r.bukti.length > 0 ? setBukaRekap({ label: r.label, ids: r.bukti }) : null)}>
                      {r.nilai}
                    </td>
                    <td>{r.sheet}</td>
                    <td className="mono muted" style={{ fontSize: '0.75rem' }}>{r.bukti.join(', ')}</td>
                    <td>
                      {r.bukti.length > 0 ? (
                        <button
                          className="btn btn--ghost btn--sm"
                          onClick={() => setBukaRekap({ label: r.label, ids: r.bukti })}
                        >
                          Lihat nama
                        </button>
                      ) : (
                        <span className="muted">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {bukaRekap && <DaftarUmatDariRekap label={bukaRekap.label} ids={bukaRekap.ids} umatById={umatById} onTutup={() => setBukaRekap(null)} />}
        </div>
      </div>
    </div>
  );
}

function DaftarUmatKUB({ kub, st, onTutup }: { kub: string; st: AplikasiState; onTutup: () => void }) {
  const daftar = umatDenganStatus(st).filter((u) => u.KUB === kub && u.status === 'Aktif');
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="card__header">
        <div className="card__title">Umat Aktif di {kub}</div>
        <button className="btn btn--ghost btn--sm" onClick={onTutup}>
          Tutup
        </button>
      </div>
      <div className="card__body">
        <div className="muted">{daftar.length} jiwa</div>
        <ul className="warning-list" style={{ maxHeight: 300, overflowY: 'auto' }}>
          {daftar.map((u) => (
            <li key={u.id} className="warning-list__item">
              <span className="mono tabular muted">{u.id}</span> ·
              <PersonLink id={u.id} nama={u.nama ?? '(tanpa nama)'}>{u.nama || '(tanpa nama)'}</PersonLink> ·
              <span className="muted">{u.jenisKelamin}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function DaftarUmatDariRekap({ label, ids, umatById, onTutup }: { label: string; ids: string[]; umatById: Map<string, UmatDenganStatus>; onTutup: () => void }) {
  const daftar = ids.map((id) => umatById.get(id)).filter(Boolean);
  return (
    <div className="card" style={{ marginTop: 12 }}>
      <div className="card__header">
        <div className="card__title">{label}</div>
        <button className="btn btn--ghost btn--sm" onClick={onTutup}>
          Tutup
        </button>
      </div>
      <div className="card__body">
        <div className="muted">{daftar.length} jiwa</div>
        <ul className="warning-list" style={{ maxHeight: 300, overflowY: 'auto' }}>
          {daftar.map((u) => (
            <li key={u!.id} className="warning-list__item">
              <span className="mono tabular muted">{u!.id}</span> ·
              <PersonLink id={u!.id} nama={u!.nama ?? '(tanpa nama)'}>{u!.nama || '(tanpa nama)'}</PersonLink> ·
              <span className="muted">{u!.jenisKelamin}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
