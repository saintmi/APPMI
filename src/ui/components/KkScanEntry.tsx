// ============================================================================
// KkScanEntry — entri data KK dari scan (OCR + verifikasi manual)
// Scan diproses OCR otomatis, hasil ditampilkan di formulir untuk diverifikasi
// sebelum disimpan. Sistem mencari KK yang mirip untuk opsi merge.
// ============================================================================

import { useState } from 'react';
import { useAplikasi, snapshotDari } from '../../state/store.ts';
import { persistensiAktif } from '../../state/autoSave.ts';
import type { Kk } from '../../engine/types.ts';
import { ocrKk, type OcrKkResult } from '../../ocr/ocr-service.ts';
import Field from './Field.tsx';

export interface KkScanEntryProps {
  idKK?: string;   // jika diedit KK yang sudah ada; jika kosong = KK baru
  onSelesai?: () => void;
}

export default function KkScanEntry({ idKK, onSelesai }: KkScanEntryProps) {
  const st = useAplikasi();
  const kkLama = idKK ? st.kk.find((k) => k.id === idKK) : undefined;

  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [ocrResult, setOcrResult] = useState<OcrKkResult | null>(null);
  const [ocrMemuat, setOcrMemuat] = useState(false);
  const [memuat, setMemuat] = useState(false);
  const [tampilkanForm, setTampilkanForm] = useState(false);
  const [form, setForm] = useState<{
    nomorKK: string;
    namaKepalaKeluarga: string;
    alamat: string;
    KUB: string;
  }>({
    nomorKK: kkLama?.nomorKK ?? '',
    namaKepalaKeluarga: kkLama?.namaKepalaKeluarga ?? '',
    alamat: kkLama?.alamat ?? '',
    KUB: kkLama?.KUB ?? '',
  });
  const [pesan, setPesan] = useState('');
  const [cocokan, setCocokan] = useState<Array<{ kk: Kk; alasan: string }>>([]);

  const daftarKUB = st.settings?.daftarKUB ?? [];

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const tipe = f.type;
    if (!tipe.startsWith('image/') && tipe !== 'application/pdf') {
      setPesan('File harus berupa gambar (JPG/PNG) atau PDF.');
      return;
    }
    setFile(f);
    setImageUrl(URL.createObjectURL(f));
    setTampilkanForm(true);
    setPesan('');

    cariMirip(f.name);
    await jalankanOCR(f);
  };

  const jalankanOCR = async (f: File) => {
    setOcrMemuat(true);
    try {
      const hasil = await ocrKk.recognize(f);
      setOcrResult(hasil);
      // Isi formulir otomatis dari hasil OCR (user masih bisa mengedit)
      setForm((prev) => ({
        nomorKK: hasil.nomorKK || prev.nomorKK,
        namaKepalaKeluarga: hasil.namaKepalaKeluarga || prev.namaKepalaKeluarga,
        alamat: hasil.alamat || prev.alamat,
        KUB: prev.KUB,
      }));
      cariMirip(hasil.namaKepalaKeluarga || hasil.nomorKK || f.name);
    } catch (err) {
      setPesan('OCR gagal: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setOcrMemuat(false);
    }
  };

  const cariMirip = (kataKunci: string) => {
    const k = kataKunci.toLowerCase();
    const hasil: Array<{ kk: Kk; alasan: string }> = [];
    for (const kk of st.kk) {
      if (kk.nomorKK.toLowerCase().includes(k) || kk.namaKepalaKeluarga.toLowerCase().includes(k)) {
        hasil.push({ kk, alasan: 'Cocok nomor KK atau nama kepala keluarga' });
      } else if (
        kk.nomorKK.replace(/\s/g, '').includes(k.replace(/\s/g, '')) ||
        kk.namaKepalaKeluarga.toLowerCase().includes(k.replace(/[^a-z0-9]/gi, ''))
      ) {
        hasil.push({ kk, alasan: 'Mirip nomor KK atau nama' });
      }
    }
    setCocokan(hasil);
  };

  const simpanScan = async () => {
    if (!file) return;
    setMemuat(true);
    setPesan('');
    try {
      let targetId = idKK;
      if (!targetId) {
        const buatBaru = await st.mintaKonfirmasi({
          judul: 'Buat KK baru dari scan?',
          pesan: `Scan "${file.name}" belum terhubung dengan KK mana. Buat KK baru dengan data yang diisi di formulir?`,
          labelKonfirmasi: 'Ya, buat KK baru',
        });
        if (!buatBaru) {
          setMemuat(false);
          return;
        }
        targetId = await buatKkBaruDariScan();
      }

      await st.unggahLampiran('kk', targetId, file);
      await persistensiAktif().simpan(snapshotDari(st));
      setPesan('Scan tersimpan dan data KK diperbarui.');
      onSelesai?.();
    } catch (err) {
      setPesan('Gagal menyimpan scan: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setMemuat(false);
    }
  };

  const buatKkBaruDariScan = async (): Promise<string> => {
    const baru: Kk = {
      id: '',
      nomorKK: form.nomorKK.trim(),
      namaKepalaKeluarga: form.namaKepalaKeluarga.trim(),
      alamat: form.alamat.trim(),
      KUB: form.KUB,
      lampiran: [],
    };
    st.tambahKk(baru);
    const idBaru = st.kk.find(
      (k) => k.nomorKK === baru.nomorKK && k.namaKepalaKeluarga === baru.namaKepalaKeluarga,
    )!.id;
    return idBaru;
  };

  const gabungScanDenganExisting = async (idTarget: string) => {
    setMemuat(true);
    try {
      if (file) {
        await st.unggahLampiran('kk', idTarget, file);
      }
      st.ubahKk(idTarget, {
        nomorKK: form.nomorKK.trim(),
        namaKepalaKeluarga: form.namaKepalaKeluarga.trim(),
        alamat: form.alamat.trim(),
        KUB: form.KUB,
      });
      await persistensiAktif().simpan(snapshotDari(st));
      setPesan('Scan dan data digabung dengan KK yang sudah ada.');
      onSelesai?.();
    } catch (err) {
      setPesan('Gagal menggabung: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setMemuat(false);
    }
  };

  const isiDariOcr = () => {
    if (!ocrResult) return;
    setForm({
      nomorKK: ocrResult.nomorKK,
      namaKepalaKeluarga: ocrResult.namaKepalaKeluarga,
      alamat: ocrResult.alamat,
      KUB: form.KUB,
    });
    cariMirip(ocrResult.namaKepalaKeluarga || ocrResult.nomorKK);
  };

  if (!tampilkanForm) {
    return (
      <div className="page-card">
        <p className="lead">
          Unggah scan Kartu Keluarga (JPG/PNG/PDF). Aplikasi akan membaca teks dari scan melalui OCR (bahasa Indonesia) dan mengisi formulir secara otomatis. Anda dapat mengedit sebelum disimpan.
        </p>
        <div className="card" style={{ textAlign: 'center', padding: 24 }}>
          <input type="file" accept=".jpg,.jpeg,.png,.pdf" onChange={handleFile} style={{ marginBottom: 12 }} />
          <p className="muted">Pilih file scan Kartu Keluarga dari folder BERKAS UMAT KUB &gt; KK.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="page-card">
      <div className="cluster" style={{ marginBottom: 14, gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
        <button className="btn btn--ghost" onClick={() => { setTampilkanForm(false); setFile(null); setImageUrl(null); setOcrResult(null); }}>
          Kembali
        </button>
        <span className="muted">{file?.name}</span>
        {ocrResult && (
          <span className="badge badge--neutral" style={{ fontSize: '0.75rem' }}>
            Keyakinan OCR: {(ocrResult.confidence * 100).toFixed(0)}%
          </span>
        )}
        {ocrMemuat && <span className="muted">Membaca teks…</span>}
        {memuat && <span className="muted">Menyimpan…</span>}
      </div>

      <div className="cluster" style={{ gap: 12, alignItems: 'flex-start' }}>
        {/* Kolom kiri: scan image */}
        <div className="card" style={{ minWidth: 360, maxWidth: 520 }}>
          <div className="card__header">
            <div className="card__title">Scan Kartu Keluarga</div>
          </div>
          <div className="card__body" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 420, background: 'var(--color-surface-muted)', border: '1px dashed var(--color-border)' }}>
            {imageUrl ? (
              <img src={imageUrl} alt="Scan KK" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
            ) : (
              <p className="muted">Memuat scan…</p>
            )}
          </div>
        </div>

        {/* Kolom kanan: formulir entri */}
        <div className="card" style={{ flex: 1, minWidth: 320 }}>
          <div className="card__header">
            <div className="card__title">Entri Data dari Scan</div>
            <div className="card__subtitle">
              Hasil OCR telah diisi otomatis. Periksa dan edit jika perlu.
            </div>
          </div>
          <div className="card__body">
            <div className="form-grid form-grid--2">
              <Field label="Nomor KK" required>
                <input
                  className="field__control"
                  value={form.nomorKK}
                  onChange={(e) => setForm({ ...form, nomorKK: e.target.value })}
                  placeholder="Nomor KK"
                />
              </Field>
              <Field label="Nama Kepala Keluarga" required>
                <input
                  className="field__control"
                  value={form.namaKepalaKeluarga}
                  onChange={(e) => setForm({ ...form, namaKepalaKeluarga: e.target.value })}
                  placeholder="Nama Kepala Keluarga"
                />
              </Field>
              <Field label="Alamat" className="field--full">
                <input
                  className="field__control"
                  value={form.alamat}
                  onChange={(e) => setForm({ ...form, alamat: e.target.value })}
                  placeholder="Alamat"
                />
              </Field>
              <Field label="KUB" required>
                <select className="field__control" value={form.KUB} onChange={(e) => setForm({ ...form, KUB: e.target.value })}>
                  <option value="">-- Pilih KUB --</option>
                  {daftarKUB.map((k) => <option key={k} value={k}>{k}</option>)}
                </select>
              </Field>
            </div>

            {ocrResult && (
              <div style={{ marginTop: 12, padding: 10, border: '1px solid var(--color-primary-soft)', borderRadius: 'var(--radius-sm)', background: 'var(--color-primary-soft)' }}>
                <div className="muted" style={{ fontSize: '0.875rem', marginBottom: 6, fontWeight: 600 }}>
                  Hasil Baca OCR (mentah):
                </div>
                <pre style={{ margin: 0, fontSize: '0.75rem', overflowX: 'auto', whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{ocrResult.rawText}</pre>
                <button
                  className="btn btn--ghost btn--sm"
                  onClick={isiDariOcr}
                  style={{ marginTop: 6 }}
                >
                  Terapkan hasil OCR ke formulir
                </button>
              </div>
            )}

            {cocokan.length > 0 && (
              <div style={{ marginTop: 12, padding: 10, border: '1px solid var(--color-warning-border)', borderRadius: 'var(--radius-sm)', background: 'var(--color-warning-bg)' }}>
                <div className="muted" style={{ fontSize: '0.875rem', marginBottom: 6, fontWeight: 600 }}>
                  KK yang mirip ditemukan:
                </div>
                {cocokan.map((c) => (
                  <div key={c.kk.id} style={{ marginBottom: 6 }}>
                    <span className="mono tabular muted" style={{ marginRight: 6 }}>{c.kk.nomorKK}</span>
                    <span className="muted">{c.kk.namaKepalaKeluarga}</span>
                    <button
                      className="btn btn--ghost btn--sm"
                      onClick={() => gabungScanDenganExisting(c.kk.id)}
                    >
                      Gabung dengan ini
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="cluster" style={{ marginTop: 14, flexWrap: 'wrap' }}>
              {cocokan.length === 0 ? (
                <>
                  <button className="btn btn--primary" onClick={simpanScan} disabled={memuat}>
                    {memuat ? 'Menyimpan…' : 'Buat KK Baru dari Scan'}
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn--ghost btn--sm" onClick={simpanScan} disabled={memuat}>
                    {memuat ? 'Menyimpan…' : 'Buat KK Baru (abaikan cocokan)'}
                  </button>
                </>
              )}
              <button className="btn btn--ghost" onClick={() => setTampilkanForm(false)}>
                Batal
              </button>
            </div>
          </div>
        </div>
      </div>

      {pesan && <p className={pesan.startsWith('Gagal') ? 'msg-error' : 'msg-ok'}>{pesan}</p>}
    </div>
  );
}
