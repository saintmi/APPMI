// ============================================================================
// UndoPanel — ringkasan Perubahan Otomatis + tombol Urungkan (Fase 8 §4.8)
// ============================================================================

import { useAplikasi } from '../../state/store.ts';

export default function UndoPanel() {
  const st = useAplikasi();
  if (!st.canUndo()) return null;

  const entri = st.audit[st.indeksUndo];
  const aksiLabel: Record<string, string> = {
    TAMBAH: 'ditambahkan',
    UBAH: 'diubah',
    HAPUS: 'dihapus',
    URUNGKAN: 'diurungkan',
  };

  return (
    <div className="undo-panel" role="status" aria-live="polite">
      <div className="undo-panel__title">Perubahan otomatis</div>
      <div className="undo-panel__row">
        <span>{entri.entitas} {entri.idEntitas} {aksiLabel[entri.aksi] ?? 'diubah'}.</span>
        <button className="btn btn--sm btn--ghost" onClick={() => st.undo()}>Urungkan</button>
      </div>
    </div>
  );
}
