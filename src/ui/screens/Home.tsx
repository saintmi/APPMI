// ============================================================================
// Layar Beranda — ringkasan jiwa, KK, penanda (Fase 4)
// ============================================================================

import { useAplikasi, penandaDariState, umatDenganStatus } from '../../state/store.ts';

export default function Home() {
  const st = useAplikasi();
  const umat = umatDenganStatus(st);
  const kk = st.kk;
  const peristiwa = st.peristiwa;
  const penanda = penandaDariState(st);
  const aktif = umat.filter((u) => u.status === 'Aktif').length;
  const tidakAktif = umat.length - aktif;
  const perluDilengkapi = penanda.filter((p) => p.jenis === 'Perlu dilengkapi' && p.aktif).length;
  const perluKonfirmasi = penanda.filter((p) => p.jenis === 'Perlu konfirmasi' && p.aktif).length;

  const kartu = (judul: string, nilai: string, keterangan: string) => (
    <div className="stat">
      <div className="stat__label">{judul}</div>
      <div className="stat__value tabular">{nilai}</div>
      <div className="stat__note">{keterangan}</div>
    </div>
  );

  return (
    <div className="page-card">
      <div className="summary-grid">
        {kartu('Umat', String(umat.length), 'Data umat tersimpan')}
        {kartu('Keluarga (KK)', String(kk.length), 'KK tercatat')}
        {kartu('Jiwa Aktif', String(aktif), 'Status = Aktif')}
        {kartu('Non Aktif', String(tidakAktif), 'Meninggal / pindah')}
        {kartu('Peristiwa', String(peristiwa.length), 'Catatan peristiwa')}
        {kartu('Perlu Dilengkapi', String(perluDilengkapi), 'Kolom penting kosong')}
        {kartu('Perlu Konfirmasi', String(perluKonfirmasi), 'Data saling berselisih')}
      </div>

      <div className="card">
        <div className="card__header">
          <div className="card__title">Perubahan Terkini</div>
        </div>
        <div className="card__body">
          <div className="table-wrap--scroll-y">
            <ul className="warning-list">
              {[...st.audit].reverse().slice(0, 10).map((e) => (
                <li key={e.id} className="warning-list__item">
                  <span className="muted tabular" style={{ fontSize: '0.75rem', marginRight: 8 }}>
                    {new Date(e.waktu).toLocaleString()}
                  </span>
                  <span className="muted">{e.aksi}</span>
                  <span className="muted">{e.entitas}</span>
                  <span className="mono muted" style={{ marginLeft: 6 }}>{e.idEntitas}</span>
                </li>
              ))}
              {st.audit.length === 0 && (
                <li className="warning-list__item" style={{ color: 'var(--color-text-subtle)', textAlign: 'center' }}>
                  Belum ada perubahan.
                </li>
              )}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
