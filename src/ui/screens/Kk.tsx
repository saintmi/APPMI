// ============================================================================
// Layar Keluarga (KK) — daftar + wizard tambah KK + anggota (Fase 3)
// ============================================================================

import { useState } from 'react';
import { useAplikasi, snapshotDari } from '../../state/store.ts';
import { persistensiAktif } from '../../state/autoSave.ts';
import { gotoRute } from '../router.ts';
import type { Kk } from '../../engine/types.ts';
import { parseTanggal } from '../../engine/tanggal.ts';


import Field from '../components/Field.tsx';

export default function Kk() {
  const st = useAplikasi();
  const [form, setForm] = useState({ show: false, nomorKK: '', namaKepalaKeluarga: '', alamat: '', KUB: '' });
  const [pesan, setPesan] = useState('');
  const [cari, setCari] = useState('');
  const [filterKUB, setFilterKUB] = useState('');

  const daftarKUB = st.settings?.daftarKUB ?? [];

  const kkTersaring = st.kk.filter((k) => {
    if (filterKUB && k.KUB !== filterKUB) return false;
    const q = cari.trim().toLowerCase();
    if (!q) return true;
    const anggota = st.umat.filter((u) => u.idKK === k.id).length;
    return (
      k.id.toLowerCase().includes(q) ||
      (k.nomorKK || '').toLowerCase().includes(q) ||
      (k.namaKepalaKeluarga || '').toLowerCase().includes(q) ||
      (k.alamat || '').toLowerCase().includes(q) ||
      String(anggota).includes(q)
    );
  });

  const tambahKk = async () => {
    if (!form.nomorKK.trim()) { setPesan('Nomor KK wajib diisi.'); return; }
    if (!form.namaKepalaKeluarga.trim()) { setPesan('Nama kepala keluarga wajib diisi.'); return; }
    if (!form.KUB) { setPesan('KUB wajib dipilih.'); return; }
    const duplikat = st.kk.find((k) => k.nomorKK.trim().toLowerCase() === form.nomorKK.trim().toLowerCase());
    if (duplikat) {
      setPesan(`Nomor KK ${form.nomorKK} sudah tercatat (KK ${duplikat.id}). Tidak dapat menambahkan KK baru dengan nomor yang sama.`);
      return;
    }
    const k: Kk = { id: '', nomorKK: form.nomorKK.trim(), namaKepalaKeluarga: form.namaKepalaKeluarga.trim(), alamat: form.alamat, KUB: form.KUB, lampiran: [] };
    st.tambahKk(k);
    await persistensiAktif().simpan(snapshotDari(st));
    setForm({ show: false, nomorKK: '', namaKepalaKeluarga: '', alamat: '', KUB: '' });
    setPesan(`KK ${form.nomorKK} ditambahkan.`);
    setTimeout(() => setPesan(''), 1500);
  };

  const tambahAnggotaKeKK = () => {
    gotoRute({ layar: 'umat' });
  };

  const hapus = (id: string) => {
    if (!confirm(`Hapus KK ${id}?`)) return;
    st.hapusKk(id);
  };

  const previewKK = (k: Kk) => {
    const anggotaDasar = st.umat.filter((u) => u.idKK === k.id);
    const kepalaUmat = anggotaDasar.find((u) => u.nama === k.namaKepalaKeluarga);
    const headMale = kepalaUmat?.jenisKelamin === 'Laki-laki';
    function peran(u: typeof anggotaDasar[number]): number {
      if (u.nama === k.namaKepalaKeluarga || /kepala/i.test(u.statusHubunganKeluarga || '')) return 0;
      const hub = (u.statusHubunganKeluarga || '').toLowerCase();
      if (/istri|suami|pasangan/.test(hub)) return 1;
      if (headMale && u.jenisKelamin === 'Perempuan' && !/anak|child/.test(hub)) return 1;
      if (!headMale && u.jenisKelamin === 'Laki-laki' && !/anak|child/.test(hub)) return 1;
      return 2;
    }
    const anggota = [...anggotaDasar].sort((a, b) => {
      const ra = peran(a);
      const rb = peran(b);
      if (ra !== rb) return ra - rb;
      if (ra === 2) {
        const pa = parseTanggal(a.tanggalLahir);
        const pb = parseTanggal(b.tanggalLahir);
        if (pa && pb) {
          if (pa.y !== pb.y) return pa.y - pb.y;
          if (pa.m !== pb.m) return pa.m - pb.m;
          return pa.d - pb.d;
        }
        return (a.nama || '').localeCompare(b.nama || '');
      }
      return 0;
    });
    const w = window.open('', '_blank');
    if (!w) return;
    const rows = anggota.map((u, i) => `
      <tr>
        <td>${i + 1}</td>

        <td>${u.nama || '—'}</td>
        <td>${u.id}</td>
        <td>${u.jenisKelamin || '—'}</td>
        <td>${u.tanggalLahir || '—'}</td>
        <td>${u.agama || '—'}</td>
        <td>${u.statusPerkawinan || '—'}</td>
        <td>${u.statusHubunganKeluarga || '—'}</td>
        <td>${u.kewarganegaraan || 'WNI'}</td>
      </tr>
    `).join('');
    w.document.write(`<!DOCTYPE html><html><head><title>KK ${k.id}</title>
      <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        h1 { text-align: center; font-size: 18px; margin: 0; }
        .meta { margin: 10px 0; font-size: 13px; }
        .meta div { margin: 2px 0; }
        table { width: 100%; border-collapse: collapse; font-size: 11px; margin-top: 10px; }
        th, td { border: 1px solid #000; padding: 4px; }
        th { background: #eee; }
        .footer { margin-top: 30px; display: flex; justify-content: space-between; font-size: 12px; }
        @media print { body { margin: 10mm; } }
      </style>
    </head><body>
      <h1>KARTU KELUARGA</h1>
      <div class="meta">
        <div><b>No. KK:</b> ${k.nomorKK || '—'}</div>
        <div><b>ID KK:</b> ${k.id}</div>
        <div><b>Nama Kepala Keluarga:</b> ${k.namaKepalaKeluarga || '—'}</div>
        <div><b>Alamat:</b> ${k.alamat || '—'}</div>
        <div><b>KUB:</b> ${k.KUB || '—'}</div>
      </div>
      <table>
        <thead>
          <tr>
            <th>No</th><th>Nama Lengkap</th><th>ID Umat</th><th>JK</th><th>Tgl Lahir</th><th>Agama</th><th>Status Kawin</th><th>Hubungan</th><th>Kewarganegaraan</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="9" style="text-align:center">Belum ada anggota</td></tr>'}
        </tbody>
      </table>
      <div class="footer">
        <div>Dicetak: ${new Date().toLocaleDateString('id-ID')}</div>
        <div>Kepala Keluarga<br/><br/><br/>${k.namaKepalaKeluarga || '—'}</div>
      </div>
      <script>window.onload = () => { window.print(); };</script>
    </body></html>`);
    w.document.close();
  };


  return (
    <div className="page-card">
      <div className="cluster" style={{ marginBottom: 14, gap: 8 }}>
        <button className="btn btn--primary" onClick={() => setForm({ ...form, show: true })}>
          Tambah KK
        </button>
        <input
          className="field__control"
          style={{ maxWidth: 260 }}
          placeholder="Cari KK (ID, nomor, nama, alamat, anggota)"
          value={cari}
          onChange={(e) => setCari(e.target.value)}
        />
        <select className="field__control" style={{ maxWidth: 160 }} value={filterKUB} onChange={(e) => setFilterKUB(e.target.value)}>
          <option value="">Semua KUB</option>
          {daftarKUB.map((k) => <option key={k} value={k}>{k}</option>)}
        </select>
        <button className="btn btn--ghost" onClick={() => window.print()}>
          Cetak Bulk PDF (Filter KUB)
        </button>
        <span className="muted">{kkTersaring.length} dari {st.kk.length} KK</span>


      </div>

      {form.show && (
        <div className="card">
          <div className="card__header">
            <div className="card__title">Tambah KK Baru</div>
          </div>
          <div className="card__body">
            <div className="form-grid form-grid--2">
              <Field label="Nama Kepala Keluarga" required>
                <input
                  className="field__control"
                  value={form.namaKepalaKeluarga}
                  onChange={(e) => setForm({ ...form, namaKepalaKeluarga: e.target.value })}
                  placeholder="Nama Kepala Keluarga"
                />
              </Field>
              <Field label="Alamat">
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
              <Field label="Nomor KK" required className="field--full">
                <input
                  className="field__control"
                  value={form.nomorKK}
                  onChange={(e) => setForm({ ...form, nomorKK: e.target.value })}
                  placeholder="Nomor KK"
                />
              </Field>
            </div>
            <div className="cluster" style={{ marginTop: 10 }}>
              <button className="btn btn--primary" onClick={tambahKk}>
                Simpan
              </button>
              <button className="btn btn--ghost" onClick={() => setForm({ ...form, show: false })}>
                Batal
              </button>
            </div>
            {pesan && <p className="msg-ok">{pesan}</p>}
          </div>
        </div>
      )}

      <div className="table-wrap">
        <table className="table">
          <thead>
            <tr>
              <th>ID KK</th>
              <th>Nomor KK</th>
              <th>Kepala Keluarga</th>
              <th>Alamat</th>
              <th>KUB</th>
              <th>Anggota</th>
              <th>Aksi</th>
            </tr>
          </thead>
          <tbody>
            {kkTersaring.map((k) => {
              const anggota = st.umat.filter((u) => u.idKK === k.id);
              return (
                <tr key={k.id}>
                  <td className="mono tabular"><button className="btn btn--ghost btn--sm" onClick={() => gotoRute({ layar: 'kk', id: k.id })}>{k.id}</button></td>
                  <td><button className="btn btn--ghost btn--sm" onClick={() => gotoRute({ layar: 'kk', id: k.id })}>{k.nomorKK || '—'}</button></td>
                  <td><button className="btn btn--ghost btn--sm" onClick={() => gotoRute({ layar: 'kk', id: k.id })}>{k.namaKepalaKeluarga || '(tanpa nama)'}</button></td>
                  <td>{k.alamat || '—'}</td>
                  <td>{k.KUB}</td>
                  <td>{anggota.length}</td>
                  <td className="cluster" style={{ gap: 4 }}>
                    <button className="btn btn--ghost btn--sm" onClick={() => tambahAnggotaKeKK()}>
                      Tambah Anggota
                    </button>
                    <button className="btn btn--ghost btn--sm" onClick={() => previewKK(k)}>
                      Preview
                    </button>
                    <button className="btn btn--ghost btn--sm" onClick={() => hapus(k.id)}>
                      Hapus
                    </button>

                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
        {st.kk.length === 0 && <p className="muted" style={{ textAlign: 'center', padding: 16 }}>Belum ada KK.</p>}
      </div>

    </div>
  );
}

