// ============================================================================
// PersonLink — tautan ke Kartu Umat dari semua layar (Fase 8 §4.9)
// ============================================================================

import { formatRute } from '../router.ts';

export interface PersonLinkProps {
  id: string;
  nama: string;
  children?: React.ReactNode;
  className?: string;
}

export default function PersonLink({ id, nama, children, className }: PersonLinkProps) {
  return (
    <button
      className={`person-link ${className ?? ''}`}
      onClick={() => {
        window.location.hash = formatRute({ layar: 'umat', id });
      }}
      title={`Buka Kartu ${nama}`}
    >
      {children ?? nama}
    </button>
  );
}
