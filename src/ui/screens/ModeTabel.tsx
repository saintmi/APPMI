// ============================================================================
// Layar Mode Tabel — tempel data dari Excel ke dalam grid, lalu impor (Fase 3/4)
// ============================================================================

import { useState, useCallback } from 'react';
import { useAplikasi } from '../../state/store.ts';
import type { SheetBerkas } from '../../import/parser';
import { deteksiKolom, konversiBarisKeUmat, type DeteksiHasil } from '../../import/detector';

export default function ModeTabel() {
  const app = useAplikasi();
  const st = app;
  const [paste, setPaste] = useState('');
  const [baris, setBaris] = useState<{ nomor: number; sel: Record<string, string | null> }[]>([]);
  const [deteksi, setDeteksi] = useState<DeteksiHasil | null>(null);
  const [modeImpor, setModeImpor] = useState<'tambah' | 'lewati'>('tambah');
  const [pesan, setPesan] = useState('');
  const [memuat, setMemuat] = useState(false);

  const handlePaste = useCallback(
    (e: React.ChangeEvent<HTMLTextAreaElement>) => {
      const teks = e.target.value;
      setPaste(teks);
      const barisParse = parsePaste(teks);
      setBaris(barisParse);
      if (barisParse.length > 0) {
        const sheet: SheetBerkas = { nama: 'Paste', baris: barisParse };
        const d = deteksiKolom(sheet, 'umat');
        setDeteksi(d);
      } else {
        setDeteksi(null);
      }
    },
    [],
  );

  const impor = async () => {
    if (!st.settings?.namaLingkungan) {
      setPesan('Atur nama lingkungan di Pengaturan terlebih dahulu.');
      return;
    }
    if (!deteksi || baris.length === 0) {
      setPesan('Tidak ada data untuk diimpor.');
      return;
    }
    setMemuat(true);
    setPesan('');
    try {
      const dataBaris = baris.slice(deteksi.barisHeader);
      const { umat, peringatan } = konversiBarisKeUmat(
        dataBaris,
        deteksi.pemetaan,
        {
          namaLingkungan: st.settings.namaLingkungan,
          daftarKUB: st.settings.daftarKUB,
          tanggalAcuan: st.settings.tanggalAcuan,
        },
        1,
      );

      if (umat.length === 0) {
        setPesan('Tidak ada baris data yang valid untuk diimpor.');
        setMemuat(false);
        return;
      }

      if (modeImpor === 'lewati') {
        const idsLama = new Set(st.umat.map((u) => u.id));
        const baru = umat.filter((u) => !idsLama.has(u.id));
        for (const u of baru) st.tambahUmat(u);
        setPesan(`Berhasil mengimpor ${baru.length} umat dari tabel (mode lewati duplikat).`);
      } else {
        for (const u of umat) st.tambahUmat(u);
        setPesan(`Berhasil mengimpor ${umat.length} umat dari tabel.`);
      }
      if (peringatan.length > 0) setPesan((p) => p + ' Peringatan: ' + peringatan.slice(0, 3).join('; '));
    } catch (err) {
      setPesan('Gagal mengimpor: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setMemuat(false);
    }
  };

  const kosongkan = () => {
    setPaste('');
    setBaris([]);
    setDeteksi(null);
    setPesan('');
  };

  const kunciUrut = Object.keys(baris[0]?.sel ?? {}).sort((a, b) => a.localeCompare(b));

  return (
    <div className="page-card">
      <p className="lead">
        Salin baris dari Excel (Ctrl+C) dan tempel ke kotak di bawah. Setiap baris menjadi satu umat, setiap kolom dipetakan secara otomatis. Pastikan kolom pertama berisi nama.
      </p>

      <div className="card">
        <div className="card__header">
          <div className="card__title">Tempel Data dari Excel</div>
        </div>
        <div className="card__body">
          <textarea
            className="field__control"
            rows={10}
            value={paste}
            onChange={handlePaste}
            placeholder="Tempel data dari Excel di sini (tab-separated)…"
            style={{ fontFamily: 'monospace', fontSize: '0.875rem', width: '100%' }}
          />
          <div className="cluster" style={{ marginTop: 8, gap: 8 }}>
            <button className="btn btn--ghost" onClick={kosongkan}>
              Kosongkan
            </button>
            <span className="muted">{baris.length} baris terdeteksi</span>
          </div>
        </div>
      </div>

      {baris.length > 0 && (
        <>
          <div className="card" style={{ marginTop: 14 }}>
            <div className="card__header">
              <div className="card__title">Pratinjau &amp; Pemetaan Kolom</div>
            </div>
            <div className="card__body">
              {deteksi && (
                <>
                  <div className="muted" style={{ marginBottom: 8 }}>
                    Header baris {deteksi.barisHeader} · {deteksi.jumlahData} baris data ·
                    {deteksi.kolomTanpaPadanan.length} kolom tanpa padanan
                  </div>
                  <div className="table-wrap">
                    <table className="table" style={{ fontSize: '0.875rem' }}>
                      <thead>
                        <tr>
                          <th>#</th>
                          {kunciUrut.map((k) => (
                            <th key={k} className="mono tabular muted">{k}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {baris.slice(deteksi.barisHeader).slice(0, 10).map((b) => (
                          <tr key={b.nomor}>
                            <td className="tabular muted">{b.nomor}</td>
                            {kunciUrut.map((k) => (
                              <td key={k}>{b.sel[k] ?? '—'}</td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="table-wrap" style={{ marginTop: 10 }}>
                    <table className="table" style={{ fontSize: '0.875rem' }}>
                      <thead>
                        <tr>
                          <th>Header di berkas</th>
                          <th>Map ke model</th>
                          <th>Keyakinan</th>
                        </tr>
                      </thead>
                      <tbody>
                        {deteksi.pemetaan.map((p) => (
                          <tr key={p.header}>
                            <td className="mono tabular muted">{p.header}</td>
                            <td>
                              <span className={`badge ${p.target ? 'badge--status' : 'badge--neutral'}`}>
                                {p.target || '— diabaikan —'}
                              </span>
                            </td>
                            <td className="muted">{p.keyakinan}</td>
                          </tr>
                        ))}
                        {deteksi.kolomTanpaPadanan.map((h) => (
                          <tr key={h + '-skip'}>
                            <td className="mono tabular muted">{h}</td>
                            <td className="muted">(diabaikan)</td>
                            <td colSpan={1} />
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  <div className="cluster" style={{ marginTop: 12, flexWrap: 'wrap' }}>
                    <label className="checkbox muted">
                      <input type="radio" name="mode" value="tambah" checked={modeImpor === 'tambah'} onChange={() => setModeImpor('tambah')} />
                      Tambah baru
                    </label>
                    <label className="checkbox muted">
                      <input type="radio" name="mode" value="lewati" checked={modeImpor === 'lewati'} onChange={() => setModeImpor('lewati')} />
                      Lewati ID yang sudah ada
                    </label>
                    <button className="btn btn--primary" onClick={impor} disabled={memuat || deteksi.pemetaan.some((p) => !p.target)}>
                      {memuat ? 'Mengimpor…' : 'Impor ke Aplikasi'}
                    </button>
                  </div>
                  {pesan && <p className="msg-ok">{pesan}</p>}
                </>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );

  function parsePaste(teks: string): { nomor: number; sel: Record<string, string | null> }[] {
    const baris = teks.split(/\r?\n/).filter((b) => b.trim().length > 0);
    return baris.map((b, i) => {
      const sel: Record<string, string | null> = {};
      b.split('\t').forEach((v, j) => {
        sel[String.fromCharCode(65 + j)] = v.trim() || null;
      });
      return { nomor: i + 1, sel };
    });
  }
}
