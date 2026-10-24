// ============================================================================
// Layar Cadangan — simpan otomatis, manual, Git terenkripsi, pulihkan (Fase 3)
// ============================================================================

import { useState } from 'react';
import { snapshotDari, type AplikasiState } from '../../state/store.ts';
import { persistensiAktif } from '../../state/autoSave.ts';
import { useBackup } from '../../backup/backup';
import type { KonfigurasiGit, VersiGit } from '../../backup/git';
import Field from '../components/Field.tsx';

export default function Cadangan({ st }: { st: AplikasiState }) {
  const bk = useBackup();
  const [config, setConfig] = useState({ owner: '', repo: '', branch: 'main', token: '', pathBerkas: 'backup.enc.json' });
  const [sandi, setSandi] = useState('');
  const [versi, setVersi] = useState<VersiGit[]>([]);
  const [memuatVersi, setMemuatVersi] = useState(false);

  const simpanManual = async () => {
    try {
      await persistensiAktif().simpan(snapshotDari(st));
      st.tampilkanPesan('Cadangan manual disimpan ke IndexedDB.', 'ok');
    } catch (err) {
      st.tampilkanPesan('Gagal menyimpan cadangan: ' + (err instanceof Error ? err.message : String(err)), 'galat');
    }
  };

  const unduhJSON = async () => {
    try {
      const blob = new Blob([JSON.stringify(snapshotDari(st), null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `cadangan-statistik-umat-${new Date().toISOString().slice(0, 16).replace(/[:]/g, '-')}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      st.tampilkanPesan('File cadangan JSON diunduh.', 'ok');
    } catch (err) {
      st.tampilkanPesan('Gagal mengunduh: ' + (err instanceof Error ? err.message : String(err)), 'galat');
    }
  };

  const pulihkanDariFile = async (file: File) => {
    try {
      const teks = await file.text();
      const data = JSON.parse(teks);
      await persistensiAktif().simpan(data);
      st.muatDariSnapshot(data);
      st.tampilkanPesan('Data pulih dari file cadangan.', 'ok');
    } catch (err) {
      st.tampilkanPesan('Gagal memulihkan: ' + (err instanceof Error ? err.message : String(err)), 'galat');
    }
  };

  const simpanConfig = () => {
    const k: KonfigurasiGit = {
      owner: config.owner.trim(),
      repo: config.repo.trim(),
      branch: config.branch.trim() || 'main',
      token: config.token.trim(),
      pathBerkas: config.pathBerkas.trim() || PATH_DEFAULT,
    };
    if (!k.owner || !k.repo || !k.token) { st.tampilkanPesan('Owner, repo, dan token wajib diisi.', 'galat'); return; }
    useBackup.getState().setConfig(k);
    st.tampilkanPesan('Konfigurasi Git disimpan (sesi ini).', 'ok');
  };

  const setSandiGit = () => {
    if (!sandi.trim()) { st.tampilkanPesan('Kata sandi wajib diisi.', 'galat'); return; }
    useBackup.getState().setSandi(sandi);
    st.tampilkanPesan('Kata sandi cadangan disimpan (hanya sesi ini, tidak tertulis ke disk).', 'ok');
  };

  const cekRepo = async () => {
    const ok = await useBackup.getState().cekKoneksi();
    st.tampilkanPesan(ok ? 'Repo terverifikasi privat.' : 'Repo tidak valid atau tidak privat.', ok ? 'ok' : 'galat');
  };

  const sinkronSekarang = async () => {
    await useBackup.getState().simpanKeGit();
    if (useBackup.getState().errorTerakhir) st.tampilkanPesan('Gagal sinkron: ' + useBackup.getState().errorTerakhir, 'galat');
    else { st.tampilkanPesan('Berhasil tersinkron ke Git.', 'ok'); }
    muatVersi();
  };

  const muatVersi = async () => {
    setMemuatVersi(true);
    try {
      const v = await useBackup.getState().daftarVersi();
      setVersi(v.slice(0, 20));
    } catch (err) {
      st.tampilkanPesan('Gagal memuat versi: ' + (err instanceof Error ? err.message : String(err)), 'galat');
    } finally {
      setMemuatVersi(false);
    }
  };

  const pulihDariGit = async (sha: string) => {
    const ya = await st.mintaKonfirmasi({
      judul: 'Pulihkan data dari commit ini?',
      pesan: 'Data saat ini akan ditimpa oleh versi yang dipilih.',
      labelKonfirmasi: 'Ya, pulihkan',
      tone: 'berbahaya',
    });
    if (!ya) return;
    await useBackup.getState().tarikDariGit(sha);
    if (useBackup.getState().errorTerakhir) st.tampilkanPesan('Gagal pulih: ' + useBackup.getState().errorTerakhir, 'galat');
    else { st.tampilkanPesan('Data pulih dari Git.', 'ok'); }
    muatVersi();
  };

  const status = bk.status();

  return (
    <div className="page-card">
      <p className="lead">
        Setiap perubahan data disimpan otomatis ke IndexedDB (browser laptop) dengan jeda 500 ms. Data tidak pernah keluar dari laptop kecuali Anda sendiri mengunduh cadangan atau mengaktifkan sinkron Git terenkripsi.
      </p>

      <div className="card">
        <div className="card__header">
          <div className="card__title">Status Simpan Otomatis</div>
        </div>
        <div className="card__body">
          <div className="muted">Umat: <b>{st.umat.length}</b> · KK: <b>{st.kk.length}</b> · Peristiwa: <b>{st.peristiwa.length}</b></div>
          <div className="muted">Terakhir tersimpan: <b className="tabular">{st.terakhirTersimpan ?? 'belum'}</b></div>
          <div className="cluster" style={{ marginTop: 10, flexWrap: 'wrap' }}>
            <button className="btn btn--primary" onClick={simpanManual}>
              Simpan Sekarang
            </button>
            <button className="btn btn--ghost" onClick={unduhJSON}>
              Unduh Cadangan (.json)
            </button>
            <span className="muted">WebCrypto: {status.webCrypto ? 'ya' : 'tidak'}</span>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <div className="card__title">Sinkron Git Terenkripsi</div>
        </div>
        <div className="card__body">
          <p className="muted">
            Snapshot dikompres, dienkripsi AES-256-GCM di browser dengan kata sandi cadangan Anda, baru dikirim ke repo GitHub privat. Git hanya melihat berkas terenkripsi. Kata sandi tidak disimpan di disk.
          </p>
          <div className="grid-3" style={{ marginBottom: 10 }}>
            <Field label="Owner GitHub">
              <input className="field__control" value={config.owner} onChange={(e) => setConfig({ ...config, owner: e.target.value })} placeholder="Owner GitHub" />
            </Field>
            <Field label="Nama repo data">
              <input className="field__control" value={config.repo} onChange={(e) => setConfig({ ...config, repo: e.target.value })} placeholder="Nama repo data" />
            </Field>
            <Field label="Branch (main)">
              <input className="field__control" value={config.branch} onChange={(e) => setConfig({ ...config, branch: e.target.value })} placeholder="main" />
            </Field>
            <Field label="Berkas">
              <input className="field__control" value={config.pathBerkas} onChange={(e) => setConfig({ ...config, pathBerkas: e.target.value })} placeholder="backup.enc.json" />
            </Field>
            <Field label="Fine-grained token">
              <input className="field__control" type="password" value={config.token} onChange={(e) => setConfig({ ...config, token: e.target.value })} placeholder="Token" />
            </Field>
          </div>
          <Field label="Kata sandi cadangan (hanya sesi ini)">
            <input className="field__control" type="password" value={sandi} onChange={(e) => setSandi(e.target.value)} placeholder="Masukkan kata sandi" />
          </Field>
          <div className="cluster" style={{ marginBottom: 10, flexWrap: 'wrap' }}>
            <button className="btn btn--ghost" onClick={simpanConfig}>
              Simpan Konfigurasi
            </button>
            <button className="btn btn--ghost" onClick={setSandiGit}>
              Simpan Kata Sandi
            </button>
            <button className="btn btn--primary" onClick={cekRepo} disabled={!config.token}>
              Verifikasi Repo Privat
            </button>
            <button className="btn btn--primary" onClick={sinkronSekarang} disabled={bk.sinkronSedangBerjalan || !sandi || !config.token}>
              {bk.sinkronSedangBerjalan ? 'Menyinkronkan…' : 'Sinkron Sekarang ke Git'}
            </button>
          </div>
          <div className="muted">
            Terdaftar: {status.terdaftar ? 'ya' : 'belum'} · Repo privat: {status.repoPrivat === null ? 'belum dicek' : status.repoPrivat ? 'ya' : 'tidak'} · Kata sandi: {status.terkunci ? 'belum diisi' : 'diisi'} · Antre: {status.antrean}
          </div>
          {status.errorTerakhir && <p className="msg-error">{status.errorTerakhir}</p>}
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <div className="card__title">Versi Cadangan di Git &amp; Pulihkan</div>
        </div>
        <div className="card__body">
          <div className="cluster" style={{ marginBottom: 10 }}>
            <button className="btn btn--ghost" onClick={muatVersi} disabled={memuatVersi || !config.token}>
              {memuatVersi ? 'Memuat…' : 'Muat Versi'}
            </button>
          </div>
          {versi.length === 0 && !memuatVersi && <div className="muted">Belum ada versi. Lakukan sinkron terlebih dahulu.</div>}
          {memuatVersi && <div className="muted">Memuat versi…</div>}
          <div className="table-wrap" style={{ maxHeight: 300 }}>
            <table className="table">
              <tbody>
                {versi.map((v) => (
                  <tr key={v.sha}>
                    <td>
                      <div className="tabular muted">{new Date(v.tanggal).toLocaleString()}</div>
                      <div className="mono muted" style={{ fontSize: '0.75rem' }}>{v.sha.slice(0, 10)}</div>
                      <div className="muted">{v.pesan}</div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn--ghost btn--sm" onClick={() => pulihDariGit(v.sha)}>
                        Pulihkan
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card__header">
          <div className="card__title">Pulihkan dari File Cadangan (.json)</div>
        </div>
        <div className="card__body">
          <p className="muted">
            Memilih file akan menimpa data saat ini di browser. Pastikan file adalah hasil cadangan aplikasi ini.
          </p>
          <div className="cluster" style={{ flexWrap: 'wrap' }}>
            <input
              type="file"
              id="file-restore"
              accept=".json"
              style={{ display: 'none' }}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) pulihkanDariFile(file);
              }}
            />
            <button
              className="btn btn--primary"
              onClick={() => document.getElementById('file-restore')?.click()}
            >
              📁 Pilih File &amp; Pulihkan
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

const PATH_DEFAULT = 'backup.enc.json';
