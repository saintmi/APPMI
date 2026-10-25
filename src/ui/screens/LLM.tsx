// ============================================================================
// Layar Pengaturan LLM Gemini — Fase 6 (opsional, default mati)
// ============================================================================

import { useState, useEffect } from 'react';
import { useAplikasi } from '../../state/store.ts';
import { useLLM } from '../../llm/store';
import Field from '../components/Field.tsx';

export default function LLM() {
  const app = useAplikasi();
  const llm = useLLM();
  const st = llm.statusLengkap();
  useEffect(() => { void llm.muatDariBackend(); }, []);
  const [pesan, setPesan] = useState('');
  const [labelBaru, setLabelBaru] = useState('');
  const [nilaiBaru, setNilaiBaru] = useState('');
  const [memuatUji, setMemuatUji] = useState(false);

  const aktifkan = () => {
    llm.ubahKonfigurasi({ diaktifkan: true });
    app.tampilkanPesan('LLM Gemini diaktifkan.', 'ok');
  };

  const nonaktifkan = () => {
    llm.ubahKonfigurasi({ diaktifkan: false });
    app.tampilkanPesan('LLM Gemini dinonaktifkan.', 'ok');
  };

  const tambah = () => {
    if (!labelBaru.trim() || !nilaiBaru.trim()) { setPesan('Label dan kunci wajib diisi.'); return; }
    llm.tambahKunci(labelBaru.trim(), nilaiBaru.trim());
    setLabelBaru('');
    setNilaiBaru('');
    app.tampilkanPesan('Kunci ditambahkan.', 'ok');
  };

  const konfirmasiHapus = async (index: number) => {
    const ya = await app.mintaKonfirmasi({
      judul: 'Hapus kunci LLM ini?',
      pesan: 'Kunci yang dihapus tidak akan dapat dipakai lagi untuk panggilan LLM.',
      labelKonfirmasi: 'Ya, hapus',
      tone: 'berbahaya',
    });
    if (ya) {
      llm.hapusKunci(index);
      app.tampilkanPesan('Kunci dihapus.', 'ok');
    }
  };

  const toggleAktif = (index: number, aktif: boolean) => {
    llm.ubahAktifKunci(index, aktif);
  };

  const ujiKoneksi = async () => {
    const router = llm.router;
    if (!router) { setPesan('Router belum tersedia.'); return; }
    setMemuatUji(true);
    setPesan('');
    try {
      const hasil = await router.panggil({
        prompt: 'Balas hanya dengan JSON: {"tes": "ok"}. Jangan tambahkan teks lain.',
        responseMimeType: 'application/json',
      });
      app.tampilkanPesan(`Koneksi LLM berhasil via ${hasil.tingkatDipakai} / ${hasil.modelDipakai}.`, 'ok');
    } catch (err) {
      setPesan('Uji gagal: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setMemuatUji(false);
    }
  };

  const toggleHanyaStruktur = () => {
    llm.ubahKonfigurasi({ modeHanyaStruktur: !llm.konfigurasi.modeHanyaStruktur });
  };

  return (
    <div className="page-card">
      <p className="lead">
        Bantuan LLM Gemini (opsional, default mati). Digunakan untuk memetakan kolom ambigu saat impor Excel. LLM <b>mengusulkan</b>, aturan <b>memverifikasi</b>, manusia <b>mengonfirmasi</b>. LLM tidak pernah menulis langsung ke data.
      </p>

      <div className="card">
        <div className="card__header">
          <div className="card__title">Status</div>
        </div>
        <div className="card__body">
          <div className="muted">
            Diaktifkan: <b>{st.diaktifkan ? 'ya' : 'tidak'}</b> ·
            Kunci: <b>{st.kunciAktif}</b> aktif / <b>{st.totalKunci}</b> total ·
            Istirahat: <b>{st.kunciIstirahat}</b>
          </div>
          <div className="muted">
            Model tingkat:
            <ul className="muted">
              {st.modelTingkat.map((m) => <li key={m}>{m}</li>)}
            </ul>
          </div>
          <div className="cluster" style={{ marginTop: 12 }}>
            {st.diaktifkan ? (
              <button className="btn btn--ghost" onClick={nonaktifkan}>
                Nonaktifkan LLM
              </button>
            ) : (
              <button className="btn btn--primary" onClick={aktifkan} disabled={st.kunciAktif === 0}>
                Aktifkan LLM
              </button>
            )}
            <button className="btn btn--primary" onClick={ujiKoneksi} disabled={memuatUji || st.kunciAktif === 0}>
              {memuatUji ? 'Menguji…' : 'Uji Koneksi'}
            </button>
            <label className="checkbox muted">
              <input
                type="checkbox"
                checked={llm.konfigurasi.modeHanyaStruktur}
                onChange={toggleHanyaStruktur}
              /> Kirim hanya struktur (tanpa nilai identitas)
            </label>
          </div>
          {st.galatTerakhir && <p className="msg-error">{st.galatTerakhir}</p>}
          {pesan && <p className="msg-error">{pesan}</p>}
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <div className="card__title">Daftar Kunci API</div>
        </div>
        <div className="card__body">
          <table className="table">
            <thead>
              <tr>
                <th>Label</th>
                <th className="tabular">Kunci (sisi kanan disamarkan)</th>
                <th>Aktif</th>
                <th>Aksi</th>
              </tr>
            </thead>
            <tbody>
              {llm.kunci.map((k, i) => (
                <tr key={i}>
                  <td>{k.label}</td>
                  <td className="tabular muted" style={{ fontFamily: 'monospace', fontSize: '0.875rem', textAlign: 'right' }}>{'•'.repeat(12)} {k.nilai.slice(-4)}</td>
                  <td>
                    <input
                      type="checkbox"
                      checked={k.aktif}
                      onChange={() => toggleAktif(i, !k.aktif)}
                    />
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <button className="btn btn--ghost btn--sm" onClick={() => konfirmasiHapus(i)}>
                      Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {llm.kunci.length === 0 && (
            <p className="muted" style={{ textAlign: 'center', padding: 16 }}>
              Belum ada kunci. Tambahkan di bawah atau kunci akan dibaca dari environment (.env).
            </p>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <div className="card__title">Tambah Kunci API Baru</div>
        </div>
        <div className="card__body">
          <div className="grid-3">
            <Field label="Label">
              <input
                className="field__control"
                value={labelBaru}
                onChange={(e) => setLabelBaru(e.target.value)}
                placeholder="Label (mis. Google #1)"
              />
            </Field>
            <Field label="API Key">
              <input
                className="field__control"
                type="password"
                value={nilaiBaru}
                onChange={(e) => setNilaiBaru(e.target.value)}
                placeholder="API Key"
              />
            </Field>
            <div className="cluster">
              <button className="btn btn--primary" onClick={tambah}>
                Tambah
              </button>
            </div>
          </div>
        </div>
      </div>

      {pesan && <p className="msg-error">{pesan}</p>}
    </div>
  );
}
