// ============================================================================
// Toast — pesan terpadu (info / ok / galat), hilang otomatis 4 detik
// ============================================================================

import { useEffect } from 'react';
import { useAplikasi } from '../../state/store.ts';

export default function Toast() {
  const st = useAplikasi();

  useEffect(() => {
    const ids = st.pesan.map((p) => p.id);
    const timers: number[] = [];
    for (const id of ids) {
      timers.push(window.setTimeout(() => st.tutupPesan(id), 4000));
    }
    return () => {
      for (const t of timers) window.clearTimeout(t);
    };
  }, [st.pesan, st]);

  return (
    <div className="toast-region" aria-live="polite" aria-atomic="true">
      {st.pesan.map((p) => (
        <div key={p.id} className={`toast toast--${p.jenis}`} role="alert">
          {p.teks}
          <button className="toast__close" onClick={() => st.tutupPesan(p.id)} aria-label="Tutup pesan">
            ✕
          </button>
        </div>
      ))}
    </div>
  );
}
