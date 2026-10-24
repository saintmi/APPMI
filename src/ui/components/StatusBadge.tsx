// ============================================================================
// StatusBadge — badge status umat & penanda (warna bukan pembeda tunggal)
// ============================================================================

export interface StatusBadgeProps {
  status: string;
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const isAktif = status === 'Aktif';
  return (
    <span
      className={`badge badge--status ${isAktif ? '' : 'badge--neutral'}`}
      title={status}
    >
      {status}
    </span>
  );
}
