// ============================================================================
// LampiranList — upload, daftar, dan unduh scan file (KTP, KK, Kartu Baptis, dll.)
// File disimpan sebagai Blob di IndexedDB (Dexie), bekerja offline.
// ============================================================================

import { useState } from 'react';
import { useAplikasi } from '../../state/store.ts';
import type { Lampiran } from '../../engine/types.ts';
import Field from './Field.tsx';

export interface LampiranListProps {
  entitas: 'umat' | 'kk';
  idEntitas: string;
  lampiran: Lampiran[];
}

export default function LampiranList({ entitas, idEntitas, lampiran }: LampiranListProps) {
  const st = useAplikasi();
  const [memuat, setMemuat] = useState(false);

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    setMemuat(true);
    try {
      await st.unggahLampiran(entitas, idEntitas, f);
      e.target.value = '';
    } catch (err) {
      console.error('Gagal mengunggah lampiran', err);
    } finally {
      setMemuat(false);
    }
  };

  const hapus = (id: string) => {
    st.hapusLampiran(entitas, idEntitas, id);
  };

  const unduh = (l: Lampiran) => {
    const blob = new Blob([l.data], { type: l.tipe });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = l.nama;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const formatUkuran = (b: number): string => {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / (1024 * 1024)).toFixed(1) + ' MB';
  };

  return (
    <div className="card">
      <div className="card__header">
        <div className="card__title">Lampiran Scan</div>
        <div className="card__subtitle">
          KTP, KK, Kartu Baptis, dan dokumen pendukung lainnya.
        </div>
      </div>
      <div className="card__body">
        <Field label="Pilih file untuk diunggah">
          <input
            className="field__control"
            type="file"
            onChange={handleFile}
            disabled={memuat}
          />
        </Field>

        {lampiran.length === 0 ? (
          <p className="muted" style={{ textAlign: 'center', padding: 16 }}>
            Belum ada lampiran scan.
          </p>
        ) : (
          <ul className="warning-list" style={{ maxHeight: 300, overflowY: 'auto' }}>
            {lampiran.map((l) => (
              <li key={l.id} className="warning-list__item">
                <div className="cluster" style={{ gap: 6 }}>
                  <span className="mono tabular muted">{l.nama}</span>
                  <span className="muted">{formatUkuran(l.ukuran)}</span>
                  <span className="badge badge--neutral" style={{ fontSize: '0.75rem' }}>
                    {l.tipe}
                  </span>
                  <div className="cluster" style={{ gap: 4, marginLeft: 'auto' }}>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => unduh(l)}
                    >
                      Unduh
                    </button>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => hapus(l.id)}
                    >
                      Hapus
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
