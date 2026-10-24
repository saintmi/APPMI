// ============================================================================
// Layar Ekspor — unduh file Excel hasil tambal template (Fase 3/2)
// ============================================================================

import { useState } from 'react';
import { type AplikasiState } from '../../state/store.ts';
import { patchTemplate } from '../../export/template-patcher';

export default function Ekspor({ st }: { st: AplikasiState }) {
  const [siap, setSiap] = useState(false);
  const [pesan, setPesan] = useState('');

  const unduh = async () => {
    setSiap(false);
    setPesan('Menyiapkan file Excel…');
    try {
      const res = await fetch('/template/Form_Statistik_Umat.xlsx');
      if (!res.ok) throw new Error('Template tidak ditemukan di /template/Form_Statistik_Umat.xlsx');
      const buffer = await res.arrayBuffer();
      const out = await patchTemplate(buffer, st.umat, st.kk, {
        namaLingkungan: st.settings?.namaLingkungan ?? '',
        daftarKUB: st.settings?.daftarKUB ?? [],
        tahunStatistik: st.settings?.tahunStatistik ?? 2026,
        tanggalAcuan: st.settings?.tanggalAcuan ?? '31/12/2026',
      });
      const blob = new Blob([out as unknown as BlobPart], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Statistik_Umat_${st.settings?.namaLingkungan ?? 'lingkungan'}_${new Date().toISOString().slice(0, 10)}.xlsx`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setPesan('File Excel berhasil diunduh.');
      setSiap(true);
    } catch (err) {
      setPesan('Gagal mengekspor: ' + (err instanceof Error ? err.message : String(err)));
    }
  };

  const siapTombol = Boolean(st.settings?.namaLingkungan);

  return (
    <div className="page-card">
      <p className="lead">
        Ekspor menulis hanya sel input ke template asli (DATA UMAT, DATA KK, REKAP LINGKUNGAN), menyimpan rumus, style, tabel, dan gambar. File yang diunduh siap dicetak dari Excel.
      </p>
      <div className="card">
        <div className="card__header">
          <div className="card__title">Unggah Template</div>
          <div className="card__subtitle">Template dibaca dari <code>/template/Form_Statistik_Umat.xlsx</code> (tidak diubah).</div>
        </div>
        <div className="card__body">
          <div className="cluster muted" style={{ fontSize: '0.875rem' }}>
            <span>Umat: {st.umat.length}</span> ·
            <span>KK: {st.kk.length}</span> ·
            <span>Lingkungan: {st.settings?.namaLingkungan || '—'}</span>
          </div>
        </div>
        <div className="card__footer">
          <button
            className="btn btn--primary"
            onClick={unduh}
            disabled={!siapTombol}
          >
            Unduh File Excel
          </button>
        </div>
      </div>
      {pesan && <p className={siap ? 'msg-ok' : 'msg-error'}>{pesan}</p>}
      <p className="muted">
        Catatan: sebelum ekspor, atur nama lingkungan di Pengaturan. Nama lingkungan ditulis ke REKAP LINGKUNGAN!A5 dan kolom Lingkungan di setiap sheet.
      </p>
    </div>
  );
}
