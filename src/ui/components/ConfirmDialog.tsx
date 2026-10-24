// ============================================================================
// ConfirmDialog — dialog konfirmasi, menggantikan window.confirm
// ============================================================================

import { useEffect, useRef } from 'react';
import { useAplikasi } from '../../state/store.ts';

export default function ConfirmDialog() {
  const st = useAplikasi();
  const k = st.konfirmasi;
  const btnRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    btnRef.current?.focus();
  }, [k]);

  if (!k) return null;

  const tombolUtama =
    k.tone === 'berbahaya' ? <button className="btn btn--danger" onClick={() => st.tutupKonfirmasi(true)} ref={btnRef}>{k.labelKonfirmasi}</button> :
    <button className="btn btn--primary" onClick={() => st.tutupKonfirmasi(true)} ref={btnRef}>{k.labelKonfirmasi}</button>;

  return (
    <div className="dialog__backdrop" onClick={() => st.tutupKonfirmasi(false)}>
      <div className="dialog dialog--wide" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="dialog-judul">
        <div className="dialog__header">
          <h2 id="dialog-judul" className="dialog__title">{k.judul}</h2>
        </div>
        <div className="dialog__body">{k.pesan}</div>
        <div className="dialog__actions">
          <button className="btn btn--ghost" onClick={() => st.tutupKonfirmasi(false)}>Batal</button>
          {tombolUtama}
        </div>
      </div>
    </div>
  );
}
