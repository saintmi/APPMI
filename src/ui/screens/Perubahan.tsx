// ============================================================================
// Layar Perubahan Otomatis — riwayat perubahan dengan tombol Urungkan (Fase 4)
// ============================================================================

import { useAplikasi } from '../../state/store.ts';

export default function Perubahan() {
  const st = useAplikasi();
  const entri = [...st.audit].reverse();

  return (
    <div className="page-card">
      <p className="lead">
        Setiap perubahan data dicatat di sini. Gunakan <b>Urungkan</b> / <b>Ulang</b> untuk membatalkan atau mengembalikan perubahan terakhir (maksimal 50 langkah).
      </p>
      <div className="cluster" style={{ marginBottom: 14, gap: 8 }}>
        <button className="btn btn--primary" onClick={st.undo} disabled={!st.canUndo()}>
          Urungkan
        </button>
        <button className="btn btn--primary" onClick={st.redo} disabled={!st.canRedo()}>
          Ulang
        </button>
        <span className="muted">{st.indeksUndo + 1} dari {st.audit.length} langkah dicatat</span>
      </div>

      <div className="card">
        <div className="card__body">
          {entri.length === 0 ? (
            <p className="muted" style={{ textAlign: 'center', padding: 24 }}>Belum ada perubahan dicatat.</p>
          ) : (
            <div className="table-wrap">
              <table className="table">
                <thead>
                  <tr>
                    <th>Waktu</th>
                    <th>Aksi</th>
                    <th>Entitas</th>
                    <th>ID</th>
                  </tr>
                </thead>
                <tbody>
                  {entri.map((e) => (
                    <tr key={e.id}>
                      <td className="muted tabular" style={{ fontSize: '0.875rem' }}>{new Date(e.waktu).toLocaleString()}</td>
                      <td className="muted" style={{ fontWeight: 600 }}>{e.aksi}</td>
                      <td>{e.entitas}</td>
                      <td className="mono tabular muted">{e.idEntitas}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
