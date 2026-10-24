// ============================================================================
// EmptyState — kondisi kosong dengan aksi berikutnya (Fase 8 §4.8)
// ============================================================================

import type { ReactNode } from 'react';

export interface EmptyStateProps {
  judul: string;
  deskripsi?: string;
  aksi?: ReactNode;
}

export default function EmptyState({ judul, deskripsi, aksi }: EmptyStateProps) {
  return (
    <div className="empty-state">
      <h2 className="empty-state__title">{judul}</h2>
      {deskripsi && <p className="empty-state__body">{deskripsi}</p>}
      {aksi && <div className="cluster">{aksi}</div>}
    </div>
  );
}
