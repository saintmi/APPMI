// ============================================================================
// SaveStatus — indikator status simpan (Fase 8 §4.8)
// ============================================================================

import { useAplikasi } from '../../state/store.ts';
import { gotoRute } from '../router.ts';

export default function SaveStatus() {
  const st = useAplikasi();
  const { statusSimpan, terakhirTersimpan, galatSimpan } = st;

  const label =
    statusSimpan === 'ada-perubahan' ? 'Ada perubahan' :
    statusSimpan === 'menyimpan' ? 'Menyimpan…' :
    statusSimpan === 'tersimpan' ? `Tersimpan ${terakhirTersimpan ?? ''}` :
    statusSimpan === 'gagal' ? `Gagal menyimpan — ${galatSimpan ?? ''}` :
    'Siap';

  const warna =
    statusSimpan === 'ada-perubahan' ? 'var(--color-warning-text)' :
    statusSimpan === 'menyimpan' ? 'var(--color-primary-text)' :
    statusSimpan === 'tersimpan' ? 'var(--color-success)' :
    statusSimpan === 'gagal' ? 'var(--color-danger)' :
    'var(--color-text-muted)';

  const bg =
    statusSimpan === 'ada-perubahan' ? 'var(--color-warning-bg)' :
    statusSimpan === 'menyimpan' ? 'var(--color-primary-soft)' :
    statusSimpan === 'tersimpan' ? 'var(--color-success)' :
    statusSimpan === 'gagal' ? 'var(--color-danger-bg)' :
    'transparent';

  if (!st.settings) return null;

  return (
    <span
      className="badge"
      style={{ background: bg, color: warna }}
      role="status"
      aria-live="polite"
    >
      {label}
      {statusSimpan === 'gagal' && (
        <button
          className="btn btn--link btn--sm"
          onClick={() => gotoRute({ layar: 'cadangan' })}
          style={{ marginLeft: 6, textDecoration: 'underline' }}
        >
          Cadangkan sekarang
        </button>
      )}
    </span>
  );
}
