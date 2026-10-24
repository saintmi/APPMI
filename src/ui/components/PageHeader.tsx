// ============================================================================
// PageHeader — judul halaman, breadcrumb, dan aksi utama (Fase 8 §4.8)
// ============================================================================

import type { ReactNode } from 'react';
import { formatRute, type Rute } from '../router.ts';

export interface PageHeaderProps {
  breadcrumbs?: { label: string; rute?: Rute }[];
  judul: string;
  deskripsi?: string;
  aksi?: ReactNode;
}

export default function PageHeader({ breadcrumbs, judul, deskripsi, aksi }: PageHeaderProps) {
  return (
    <header className="page-header">
      {breadcrumbs && breadcrumbs.length > 0 && (
        <nav className="breadcrumb" aria-label="Breadcrumb">
          {breadcrumbs.map((b, i) => (
            <span key={i}>
              {i > 0 && <span className="breadcrumb__sep">/</span>}
              {b.rute ? (
                <a
                  href={b.rute ? formatRute(b.rute) : '#'}
                  onClick={(e) => {
                    e.preventDefault();
                    if (b.rute) window.location.hash = formatRute(b.rute);
                  }}
                >
                  {b.label}
                </a>
              ) : (
                <span>{b.label}</span>
              )}
            </span>
          ))}
        </nav>
      )}
      <div className="page-header__copy">
        <h1 className="page-header__title">{judul}</h1>
        {deskripsi && <p className="page-header__description">{deskripsi}</p>}
      </div>
      {aksi && <div className="page-header__actions">{aksi}</div>}
    </header>
  );
}
