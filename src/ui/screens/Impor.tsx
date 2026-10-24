// ============================================================================
// Layar Impor — upload Excel/CSV, deteksi semua sheet, impor multi-sheet
// (DATA UMAT, DATA KK, dan setiap sheet peristiwa) (Fase 5)
// ============================================================================

import { useState, useCallback } from 'react';
import { useAplikasi } from '../../state/store.ts';
import { useLLM } from '../../llm/store';
import { parseFile, type SheetBerkas } from '../../import/parser';
import {
  deteksiKolomDenganLLM,
  konversiBarisKeUmat,
  konversiBarisKeKk,
  konversiBarisKePeristiwa,
  klasifikasiSheet,
  sheetKeJenisPeristiwa,
  type DeteksiHasil,
} from '../../import/detector';
import { sinkronkanPeristiwa } from '../../state/store.ts';

type JenisImpor = 'tambah' | 'lengkapi' | 'lewati';

export default function Impor() {
  const app = useAplikasi();
  const st = app;
  const llm = useLLM();
  const [file, setFile] = useState<File | null>(null);
  const [sheets, setSheets] = useState<SheetBerkas[]>([]);
  const [deteksiMap, setDeteksiMap] = useState<Map<string, DeteksiHasil>>(new Map());
  const [modeImpor, setModeImpor] = useState<JenisImpor>('tambah');
  const [pesan, setPesan] = useState('');
  const [memuat, setMemuat] = useState(false);
  const [previewSheet, setPreviewSheet] = useState<string>('');

  const handleFile = useCallback(
    async (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setFile(f);
      setPesan('');
      setDeteksiMap(new Map());
      setPreviewSheet('');
      try {
        const s = await parseFile(f);
        setSheets(s);
        // Deteksi semua sheet secara paralel
        const deteksiMapBaru = new Map<string, DeteksiHasil>();
        await Promise.all(
          s.map(async (sheet) => {
            const jenisSheet = klasifikasiSheet(sheet.nama);
            const d = await deteksiKolomDenganLLM(sheet, jenisSheet, llm.router, {
              namaLingkungan: st.settings?.namaLingkungan ?? '',
              daftarKUB: st.settings?.daftarKUB ?? [],
              tanggalAcuan: st.settings?.tanggalAcuan ?? '31/12/2026',
            });
            deteksiMapBaru.set(sheet.nama, d);
          }),
        );
        setDeteksiMap(deteksiMapBaru);
        if (s.length > 0) setPreviewSheet(s[0].nama);
      } catch (err) {
        setPesan('Gagal membaca berkas: ' + (err instanceof Error ? err.message : String(err)));
      }
    },
    [llm.router, st],
  );

  const jumlahDataSemua = useCallback(() => {
    let total = 0;
    for (const [, d] of deteksiMap) {
      if (d.jenisSheet === 'umat' || d.jenisSheet === 'kk' || d.jenisSheet === 'peristiwa') {
        total += d.jumlahData;
      }
    }
    return total;
  }, [deteksiMap]);

  const imporSemua = async () => {
    if (!file || !st.settings?.namaLingkungan) {
      setPesan('Pilih berkas dan atur nama lingkungan di Pengaturan terlebih dahulu.');
      return;
    }
    if (sheets.length === 0) {
      setPesan('Tidak ada sheet untuk diimpor.');
      return;
    }
    setMemuat(true);
    setPesan('');
    try {
      let totalUmat = 0;
      let totalKk = 0;
      let totalPeristiwa = 0;
      const peringatan: string[] = [];

      const settings = {
        namaLingkungan: st.settings.namaLingkungan,
        daftarKUB: st.settings.daftarKUB,
        tanggalAcuan: st.settings.tanggalAcuan,
      };

      for (const sheet of sheets) {
        const d = deteksiMap.get(sheet.nama);
        if (!d) continue;

        const jenisSheet = d.jenisSheet;
        const dataBaris = sheet.baris.slice(d.barisHeader);

        if (jenisSheet === 'umat') {
          const { umat, peringatan: pr } = konversiBarisKeUmat(
            dataBaris,
            d.pemetaan,
            settings,
            1,
          );
          peringatan.push(...pr);
          for (const u of umat) st.tambahUmat(u);
          totalUmat += umat.length;
        } else if (jenisSheet === 'kk') {
          const { kk, peringatan: pr } = konversiBarisKeKk(
            dataBaris,
            d.pemetaan,
            settings,
            1,
          );
          peringatan.push(...pr);
          for (const k of kk) st.tambahKk(k);
          totalKk += kk.length;
        } else if (jenisSheet === 'peristiwa') {
          const jenis = sheetKeJenisPeristiwa(sheet.nama);
          if (!jenis) continue;
          const { peristiwa, peringatan: pr } = konversiBarisKePeristiwa(
            dataBaris,
            d.pemetaan,
            jenis,
            settings,
            1,
          );
          peringatan.push(...pr);
          for (const p of peristiwa) {
            const psinkron = sinkronkanPeristiwa(p, st);
            st.tambahPeristiwa(psinkron);
          }
          totalPeristiwa += peristiwa.length;
        }
      }

      app.catatPerubahan(
        'TAMBAH',
        'Impor Multi-Sheet',
        file.name,
        null,
        { jumlahUmat: totalUmat, jumlahKk: totalKk, jumlahPeristiwa: totalPeristiwa, file: file.name, mode: modeImpor },
      );

      let p = `Berhasil mengimpor ${totalUmat} umat, ${totalKk} KK, dan ${totalPeristiwa} peristiwa dari "${file.name}".`;
      if (peringatan.length > 0) p += ' Peringatan: ' + peringatan.slice(0, 3).join('; ');
      setPesan(p);
    } catch (err) {
      setPesan('Gagal mengimpor: ' + (err instanceof Error ? err.message : String(err)));
    } finally {
      setMemuat(false);
    }
  };

  if (!file) {
    return (
      <div className="page-card">
        <p className="lead">
          Unggah berkas hasil sensus/scan (.xlsx, .xls, .csv). Aplikasi akan membaca <b>semua sheet</b>, mendeteksi jenis data (DATA UMAT, DATA KK, atau sheet peristiwa), dan memetakan kolom secara otomatis. Anda bisa meninjau pemetaan sebelum mengimpor.
        </p>
        <div className="card" style={{ textAlign: 'center', padding: 24 }}>
          <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{ marginBottom: 12 }} />
          <p className="muted">Sheet yang dikenali: DATA UMAT, DATA KK, BAPTIS, KEMATIAN, PINDAH AGAMA, MUTASI, DITERIMA MASUK, KOMUNI PERTAMA, PERKAWINAN GEREJANI, PEMBUBARAN, PERMINYAKAN SUCI, SEMINARI BIARA.</p>
        </div>
      </div>
    );
  }

  // Ringkasan sheet
  const barisRingkasan = sheets.map((sheet) => {
    const d = deteksiMap.get(sheet.nama);
    const jenisSheet = d?.jenisSheet ?? klasifikasiSheet(sheet.nama);
    const labelJenis =
      jenisSheet === 'umat' ? 'Umat' :
      jenisSheet === 'kk' ? 'KK' :
      jenisSheet === 'peristiwa' ? 'Peristiwa' : 'Lainnya';
    const jenisPeristiwa = jenisSheet === 'peristiwa' ? sheetKeJenisPeristiwa(sheet.nama) ?? '' : '';
    const jumlah = d?.jumlahData ?? sheet.baris.length - 1;
    const terdeteksi = d?.pemetaan.filter((p) => p.target).length ?? 0;
    const totalKolom = d?.pemetaan.length ?? 0;
    return (
      <tr key={sheet.nama}>
        <td className="mono tabular">{sheet.nama}</td>
        <td>
          <span className={`badge badge--${jenisSheet === 'umat' ? 'status' : jenisSheet === 'kk' ? 'confirm' : 'complete'}`}>
            {labelJenis} {jenisPeristiwa ? '(' + jenisPeristiwa + ')' : ''}
          </span>
        </td>
        <td className="tabular">{jumlah}</td>
        <td className="tabular">{terdeteksi} / {totalKolom}</td>
        <td>
          <button
            className="btn btn--ghost btn--sm"
            onClick={() => setPreviewSheet(sheet.nama)}
          >
            Lihat Mapping
          </button>
        </td>
      </tr>
    );
  });

  const dAktif = deteksiMap.get(previewSheet);
  const sheetAktif = sheets.find((s) => s.nama === previewSheet);

  return (
    <div className="page-card">
      <div className="cluster" style={{ marginBottom: 12, alignItems: 'center', flexWrap: 'wrap' }}>
        <span className="muted">{file.name}</span>
        <span className="muted">{sheets.length} sheet · {jumlahDataSemua()} baris data</span>
        <input type="file" accept=".xlsx,.xls,.csv" onChange={handleFile} style={{ fontSize: '0.875rem' }} />
      </div>

      <div className="card">
        <div className="card__header">
          <div className="card__title">Ringkasan Sheet &amp; Jenis Data</div>
        </div>
        <div className="card__body">
          <div className="table-wrap">
            <table className="table">
              <thead>
                <tr>
                  <th>Sheet</th>
                  <th>Jenis</th>
                  <th>Baris Data</th>
                  <th>Kolom Terdeteksi</th>
                  <th>Aksi</th>
                </tr>
              </thead>
              <tbody>{barisRingkasan}</tbody>
            </table>
          </div>
          <p className="muted" style={{ marginTop: 8 }}>
            Sheet yang bukan DATA UMAT, DATA KK, atau sheet peristiwa dikenal akan diabaikan saat impor.
          </p>
        </div>
      </div>

      {dAktif && sheetAktif && (
        <div className="card" style={{ marginTop: 14 }}>
          <div className="card__header">
            <div className="card__title">Pemetaan Kolom — {previewSheet}</div>
          </div>
          <div className="card__body">
            <div className="muted" style={{ marginBottom: 10 }}>
              Header terdeteksi di baris {dAktif.barisHeader} · {dAktif.jumlahData} baris data ·
              {dAktif.kolomTanpaPadanan.length} kolom tanpa padanan
            </div>
            <div className="table-wrap">
              <table className="table" style={{ fontSize: '0.875rem' }}>
                <thead>
                  <tr>
                    <th>Header di berkas</th>
                    <th>Map ke model</th>
                    <th>Keyakinan</th>
                    <th>Contoh nilai</th>
                  </tr>
                </thead>
                <tbody>
                  {dAktif.pemetaan.map((p) => (
                    <tr key={p.header}>
                      <td className="mono tabular muted">{p.header}</td>
                      <td>
                        <span className={`badge ${p.target ? 'badge--status' : 'badge--neutral'}`}>
                          {p.target || '— diabaikan —'}
                        </span>
                      </td>
                      <td className="muted">{p.keyakinan}</td>
                      <td className="mono tabular muted">{p.nilaiContoh.join(', ') || '—'}</td>
                    </tr>
                  ))}
                  {dAktif.kolomTanpaPadanan.map((h) => (
                    <tr key={h + '-skip'}>
                      <td className="mono tabular muted">{h}</td>
                      <td className="muted">(diabaikan)</td>
                      <td colSpan={2} />
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="table-wrap" style={{ marginTop: 12, maxHeight: 300, overflowY: 'auto' }}>
              <table className="table" style={{ fontSize: '0.75rem' }}>
                <thead>
                  <tr>
                    {Object.keys(sheetAktif.baris[0]?.sel ?? {}).slice(0, 8).map((k) => (
                      <th key={k}>{k}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sheetAktif.baris.slice(dAktif.barisHeader, dAktif.barisHeader + 8).map((b) => (
                    <tr key={b.nomor}>
                      {Object.values(b.sel).slice(0, 8).map((v, i) => (
                        <td key={i}>{v ?? '—'}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      <div className="grid-2" style={{ marginBottom: 14 }}>
        <div className="card">
          <div className="card__body">
            <div className="muted" style={{ fontWeight: 600, marginBottom: 6 }}>Mode impor</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <label className="checkbox muted">
                <input type="radio" name="mode" value="tambah" checked={modeImpor === 'tambah'} onChange={() => setModeImpor('tambah')} />
                Tambah baru (semua baris valid)
              </label>
              <label className="checkbox muted">
                <input type="radio" name="mode" value="lengkapi" checked={modeImpor === 'lengkapi'} onChange={() => setModeImpor('lengkapi')} />
                Lengkapi data yang ada
              </label>
              <label className="checkbox muted">
                <input type="radio" name="mode" value="lewati" checked={modeImpor === 'lewati'} onChange={() => setModeImpor('lewati')} />
                Lewati ID yang sudah ada
              </label>
            </div>
          </div>
        </div>
      </div>

      <button className="btn btn--primary" onClick={imporSemua} disabled={memuat || deteksiMap.size === 0}>
        {memuat ? 'Mengimpor semua sheet…' : 'Impor Semua Sheet ke Aplikasi'}
      </button>
      {pesan && <p className="msg-ok">{pesan}</p>}
    </div>
  );
}
