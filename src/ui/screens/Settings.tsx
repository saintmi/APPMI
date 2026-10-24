// ============================================================================
// Layar Pengaturan — nama lingkungan, daftar KUB, tahun (Fase 3)
// ============================================================================

import { useState } from 'react';
import { useAplikasi } from '../../state/store.ts';
import Field from '../components/Field.tsx';

export default function Settings() {
  const st = useAplikasi();
  const [nama, setNama] = useState(st.settings?.namaLingkungan ?? '');
  const [kubText, setKubText] = useState(st.settings?.daftarKUB.join(', ') ?? '');
  const [pesan, setPesan] = useState('');

  const simpan = () => {
    const daftarKUB = kubText.split(',').map((s) => s.trim()).filter(Boolean);
    if (!nama.trim()) { setPesan('Nama lingkungan wajib diisi.'); return; }
    if (daftarKUB.length === 0) { setPesan('Daftar KUB wajib diisi (pisahkan dengan koma).'); return; }
    st.setSettings({
      namaLingkungan: nama.trim(),
      daftarKUB,
      tahunStatistik: 2026,
      tanggalAcuan: '31/12/2026',
    });
    st.tampilkanPesan('Disimpan.', 'ok');
  };

  return (
    <div className="page-card">
      <p className="lead">
        Isi nama lingkungan dan daftar KUB sekali. Keduanya digunakan di seluruh aplikasi dan file ekspor. Tahun statistik terkunci 2026.
      </p>
      <div className="grid-2 stack--tight">
        <Field label="Nama lingkungan" required>
          <input
            className="field__control"
            value={nama}
            onChange={(e) => setNama(e.target.value)}
            placeholder="Nama lingkungan"
          />
        </Field>
        <Field label="Daftar KUB (koma)" required>
          <input
            className="field__control"
            value={kubText}
            onChange={(e) => setKubText(e.target.value)}
            placeholder="contoh: KUB 1, KUB 2, KUB 3"
          />
        </Field>
      </div>
      <p className="muted">
        Tahun statistik: <b>2026</b> (terkunci sesuai template) · Tanggal acuan: <b>31/12/2026</b>
      </p>
      <button className="btn btn--primary" onClick={simpan}>
        Simpan Pengaturan
      </button>
      {pesan && <p className="msg-ok">{pesan}</p>}
      <hr />
      <p className="muted">
        Setelah disimpan, layar Umat, KK, Peristiwa, dan Ekspor akan terbuka. Data tersimpan otomatis ke IndexedDB setiap perubahan.
      </p>
    </div>
  );
}
