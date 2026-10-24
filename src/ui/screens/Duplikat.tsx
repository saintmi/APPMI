// ============================================================================
// Layar Duplikat — review kemiripan, keputusan gabung / beda orang (Fase 4)
// ============================================================================

import { useAplikasi, snapshotDari } from '../../state/store.ts';
import { persistensiDexie } from '../../state/persistence.ts';
import { findDuplicates } from '../../engine/warnings.ts';
import PersonLink from '../components/PersonLink.tsx';

export default function Duplikat() {
  const st = useAplikasi();
  const duplikat = findDuplicates(st.umat);

  const gabung = async (idA: string, idB: string) => {
    const ya = await st.mintaKonfirmasi({
      judul: 'Gabung Duplikat',
      pesan: `Rekaman ${idB} akan digabungkan ke ${idA}. Peristiwa diarahkan ke ${idA}, lalu rekaman ${idB} dihapus. Tindakan ini tidak dapat dibatasi setelah disimpan.`,
      labelKonfirmasi: 'Ya, gabung',
      tone: 'berbahaya',
    });
    if (!ya) return;
    st.gabungUmat(idA, idB);
    await persistensiDexie.simpan(snapshotDari(st));
    st.tampilkanPesan('Duplikat digabung.', 'ok');
  };

  const tandaiBeda = (idA: string, idB: string) => {
    st.tambahKeputusanDuplikat(idA + idB, idA, idB, 'beda-orang');
    st.tampilkanPesan('Tandai sebagai beda orang.', 'ok');
  };

  return (
    <div className="page-card">
      <p className="lead">
        Duplikat terdeteksi berdasarkan nama dan tanggal lahir yang sama. Untuk setiap pasang, keputusan Anda diingat sehingga tidak ditampilkan lagi.
      </p>

      <div className="cluster" style={{ marginBottom: 14, gap: 8 }}>
        <span className="muted">{duplikat.length} pasang duplikat terdeteksi</span>
      </div>

      <div className="grid-2">
        {duplikat.map((d) => (
          <div key={d.idA + d.idB} className="card">
            <div className="card__body">
              <div className="dup-review">
                <div className="dup-review__side">
                  <PersonLink id={d.idA} nama={d.idA}>{d.idA}</PersonLink>
                </div>
                <div className="dup-review__side">
                  <PersonLink id={d.idB} nama={d.idB}>{d.idB}</PersonLink>
                </div>
              </div>
              <div className="cluster muted" style={{ marginTop: 8, gap: 6, flexWrap: 'wrap' }}>
                <span className="badge badge--confirm">{Math.round(d.kemiripan * 100)}% mirip</span>
                <span className="muted">{d.alasan}</span>
              </div>
              <div className="dup-review__actions">
                <button className="btn btn--primary btn--sm" onClick={() => gabung(d.idA, d.idB)}>
                  Gabung
                </button>
                <button className="btn btn--ghost btn--sm" onClick={() => tandaiBeda(d.idA, d.idB)}>
                  Beda orang
                </button>
              </div>
            </div>
          </div>
        ))}
        {duplikat.length === 0 && (
          <div className="card">
            <div className="card__body">
              <p className="muted" style={{ textAlign: 'center' }}>Tidak ada duplikat terdeteksi.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
