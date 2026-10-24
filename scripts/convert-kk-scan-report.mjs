// ============================================================================
// Konverter laporan scan KK -> snapshot aplikasi APPMI
// ============================================================================
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import XLSX from 'xlsx';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const INPUT = path.join(ROOT, 'docs', 'LAPORAN_KK_SCAN_TERISI_KUB4_HASIL_ISI.xlsx');
const SEED = path.join(ROOT, 'seed-snapshot.json');
const OUT_BACKUP = path.join(ROOT, 'docs', 'backup_kk_scan_2026.json');
const OUT_SEED_BACKUP = path.join(ROOT, 'docs', 'seed-snapshot.pre-kk-scan.json');

const META_SHEETS = new Set(['CATATAN_PENGISIAN', 'AUDIT_SCAN_KKUB3', 'AUDIT_SCAN_KKUB4']);

export function normTanggal(v) {
  const s = String(v ?? '').trim();
  if (!s || s === '0' || s === '-') return '';
  const m = s.match(/^(\d{1,2})[-/](\d{1,2})[-/](\d{4})$/);
  if (m) return `${m[1].padStart(2, '0')}/${m[2].padStart(2, '0')}/${m[3]}`;
  return s;
}

export function normJK(v) {
  const s = String(v ?? '').trim().toUpperCase();
  if (s === 'LAKI-LAKI' || s === 'LAKI LAKI' || s === 'PRIA' || s === 'L') return 'Laki-laki';
  if (s === 'PEREMPUAN' || s === 'WANITA' || s === 'P') return 'Perempuan';
  return '';
}

export function normAgama(v) {
  const s = String(v ?? '').trim().toUpperCase();
  if (!s) return 'Katolik';
  if (s === 'KATHOLIK' || s === 'KATOLIK') return 'Katolik';
  if (s === 'ISLAM') return 'Islam';
  if (s === 'KRISTEN') return 'Kristen';
  return s.charAt(0) + s.slice(1).toLowerCase();
}

export function normKodePos(v) {
  const s = String(v ?? '').trim();
  if (!s || s === '0' || s === '-') return '';
  return s;
}
export function bacaKKSheet(json) {
  const info = {};
  let memberHeaderIndex = -1;
  json.forEach((r, i) => {
    if (Array.isArray(r) && r[1] === 'Nama Lengkap' && r[0] === 'No') {
      memberHeaderIndex = i;
    }
  });
  json.forEach((r) => {
    if (!Array.isArray(r) || !r[0] || typeof r[0] !== 'string') return;
    const k = r[0].trim();
    if (!k || k === 'No' || /jpg|jpeg/i.test(k)) return;
    if (memberHeaderIndex >= 0) {
      const idx = json.indexOf(r);
      if (idx >= memberHeaderIndex) return;
    }
    info[k] = r[1];
  });

  if (!info['Nomor KK'] || !info['Nama Kepala Keluarga']) return null;

  const cols = memberHeaderIndex >= 0 ? json[memberHeaderIndex] : [];
  const idx = {};
  cols.forEach((c, i) => { idx[String(c).trim()] = i; });

  const members = [];
  if (memberHeaderIndex >= 0) {
    for (let i = memberHeaderIndex + 1; i < json.length; i++) {
      const r = json[i];
      if (!Array.isArray(r)) continue;
      const nama = String(r[idx['Nama Lengkap']] ?? '').trim();
      if (!nama) continue;
      members.push({
        no: String(r[idx['No']] ?? '').trim(),
        nama,
        nik: String(r[idx['NIK']] ?? '').trim(),
        jenisKelamin: normJK(r[idx['Jenis Kelamin']]),
        tempatLahir: String(r[idx['Tempat Lahir']] ?? '').trim(),
        tanggalLahir: normTanggal(r[idx['Tanggal Lahir']]),
        agama: normAgama(r[idx['Agama']]),
        pendidikan: String(r[idx['Pendidikan']] ?? '').trim(),
        pekerjaan: String(r[idx['Jenis Pekerjaan']] ?? '').trim(),
        golonganDarah: String(r[idx['Golongan Darah']] ?? '').trim(),
        statusPerkawinan: String(r[idx['Status Perkawinan']] ?? '').trim(),
        tanggalPerkawinan: normTanggal(r[idx['Tanggal Perkawinan/Perceraian']]),
        statusHubunganKeluarga: String(r[idx['Status Hubungan dalam Keluarga']] ?? '').trim(),
        kewarganegaraan: String(r[idx['Kewarganegaraan']] ?? '').trim(),
        namaAyah: String(r[idx['Nama Ayah']] ?? '').trim(),
        namaIbu: String(r[idx['Nama Ibu']] ?? '').trim(),
      });
    }
  }

  return { info, members };
}

function main() {
  const wb = XLSX.readFile(INPUT);
  const byKey = new Map();
  const membersByKey = new Map();
  for (const sheetName of wb.SheetNames) {
    if (META_SHEETS.has(sheetName)) continue;
    const ws = wb.Sheets[sheetName];
    const json = XLSX.utils.sheet_to_json(ws, { header: 1, defval: '' });
    const parsed = bacaKKSheet(json);
    if (!parsed) continue;
    const key = `${String(parsed.info['Nomor KK']).trim().toLowerCase()}|${String(parsed.info['Nama Kepala Keluarga']).trim().toLowerCase()}`;
    const prev = byKey.get(key);
    if (!prev || parsed.members.length > prev.members.length) {
      byKey.set(key, { sheetName, ...parsed });
    }
    // Gabungkan anggota dari semua sheet duplikat (tanpa duplikat NIK/nama/tanggal lahir).
    if (!membersByKey.has(key)) membersByKey.set(key, []);
    const seen = new Set(membersByKey.get(key).map((m) => [m.nik || '', m.nama || '', m.tanggalLahir || ''].join('|').toLowerCase()));
    for (const m of parsed.members) {
      const mkey = [m.nik || '', m.nama || '', m.tanggalLahir || ''].join('|').toLowerCase();
      if (seen.has(mkey)) continue;
      seen.add(mkey);
      membersByKey.get(key).push(m);
    }
  }

  const seed = JSON.parse(fs.readFileSync(SEED, 'utf8'));
  fs.writeFileSync(OUT_SEED_BACKUP, JSON.stringify(seed, null, 2), 'utf8');

  // Seed dari Excel harus bersih: buang data legacy sebelum konversi.
  seed.kk = [];
  seed.umat = [];

  const kkList = seed.kk;
  const umatList = seed.umat;

  function maxId(list, prefix) {
    let max = 0;
    for (const x of list) {
      const m = String(x.id || '').match(new RegExp('^' + prefix + '(\\d+)$'));
      if (m) max = Math.max(max, parseInt(m[1], 10));
    }
    return max;
  }
  let nextKk = maxId(kkList, 'KK') + 1;
  let nextUmat = maxId(umatList, 'UM') + 1;
  function newKkId() { return `KK${String(nextKk++).padStart(4, '0')}`; }
  function newUmatId() { return `UM${String(nextUmat++).padStart(5, '0')}`; }

  const kkByNomor = new Map();
  const kkByName = new Map();
  for (const k of kkList) {
    if (k.nomorKK) kkByNomor.set(String(k.nomorKK).trim().toLowerCase(), k);
    if (k.namaKepalaKeluarga) kkByName.set(String(k.namaKepalaKeluarga).trim().toLowerCase(), k);
  }

  const originalKkList = kkList.map((k) => ({ ...k }));

  function findUmat(kkId, nik, nama, tanggalLahir) {
    if (nik) {
      const byNik = umatList.find((u) => u.nik && String(u.nik).trim() === nik);
      if (byNik) return byNik;
    }
    return umatList.find((u) =>
      u.idKK === kkId &&
      String(u.nama || '').trim().toLowerCase() === nama.toLowerCase() &&
      String(u.tanggalLahir || '').trim() === tanggalLahir
    ) || umatList.find((u) =>
      u.idKK === kkId &&
      String(u.nama || '').trim().toLowerCase() === nama.toLowerCase()
    );
  }

  // Remap idKK lama (berisi nomor KK sumber) ke id aplikasi bila nomor KK sudah diketahui
  const appIdSet = new Set(kkList.map((k) => k.id));
  const sourceToApp = new Map();
  for (const k of kkList) {
    if (k.nomorKK) sourceToApp.set(`KK${String(k.nomorKK).trim().toLowerCase()}`, k.id);
  }
  for (const u of umatList) {
    if (appIdSet.has(u.idKK)) continue;
    const key = String(u.idKK || '').trim().toLowerCase();
    if (sourceToApp.has(key)) u.idKK = sourceToApp.get(key);
  }
  let updatedKk = 0, createdKk = 0, updatedUmat = 0, createdUmat = 0;


  for (const [key, { info }] of byKey.entries()) {
    const members = membersByKey.get(key) || [];
    const nomorKK = String(info['Nomor KK']).trim();
    const namaKepala = String(info['Nama Kepala Keluarga']).trim();
    const alamat = String(info['Alamat'] ?? '').trim();
    const kub = String(info['KUB'] ?? '').trim();
    const rtRw = String(info['RT/RW'] ?? '').trim();
    const kodePos = normKodePos(info['Kode Pos']);
    const desa = String(info['Desa/Kelurahan'] ?? '').trim();
    const kecamatan = String(info['Kecamatan'] ?? '').trim();
    const kab = String(info['Kabupaten/Kota'] ?? '').trim();
    const prov = String(info['Provinsi'] ?? '').trim();
    const tglDikeluarkan = normTanggal(info['Tanggal Dikeluarkan']);
    const fileSumber = String(info['File Sumber'] ?? '').trim();
    const conf = Number(info['Confidence OCR']);
    const confidenceOcr = Number.isFinite(conf) ? conf : undefined;

    let kk = kkByNomor.get(nomorKK.toLowerCase());
    if (!kk) kk = kkByName.get(namaKepala.toLowerCase());
    if (kk) {
      if (!kk.nomorKK) kk.nomorKK = nomorKK;
      kkByNomor.set(nomorKK.toLowerCase(), kk);
      kkByName.set(namaKepala.toLowerCase(), kk);
      const sourceKey = `kk${nomorKK.toLowerCase()}`;
      for (const u of umatList) {
        if (String(u.idKK || '').trim().toLowerCase() === sourceKey) u.idKK = kk.id;
      }
      if (namaKepala) kk.namaKepalaKeluarga = namaKepala;
      if (alamat) kk.alamat = alamat;
      if (kub) kk.KUB = kub;
      if (rtRw) kk.rtRw = rtRw;
      if (kodePos) kk.kodePos = kodePos;
      if (desa) kk.desaKelurahan = desa;
      if (kecamatan) kk.kecamatan = kecamatan;
      if (kab) kk.kabupatenKota = kab;
      if (prov) kk.provinsi = prov;
      if (tglDikeluarkan) kk.tanggalDikeluarkan = tglDikeluarkan;
      if (fileSumber) kk.fileSumber = fileSumber;
      kk.namaFileScan = kk.namaFileScan || fileSumber;
      if (confidenceOcr !== undefined) kk.confidenceOcr = confidenceOcr;
      updatedKk++;
    } else {
      kk = {
        id: newKkId(),
        nomorKK,
        namaKepalaKeluarga: namaKepala,
        alamat,
        KUB: kub,
        lampiran: [],
        rtRw: rtRw || undefined,
        kodePos: kodePos || undefined,
        desaKelurahan: desa || undefined,
        kecamatan: kecamatan || undefined,
        kabupatenKota: kab || undefined,
        provinsi: prov || undefined,
        tanggalDikeluarkan: tglDikeluarkan || undefined,
        fileSumber: fileSumber || undefined,
        namaFileScan: fileSumber || undefined,
        confidenceOcr,
      };
      kkList.push(kk);
      kkByNomor.set(nomorKK.toLowerCase(), kk);
      createdKk++;
    }

    // Remap data lama ke KK hasil scan ini berdasarkan nama kepala keluarga
    // atau kesesuaian nomor KK sumber, agar anggota lama diperbarui bukan duplikat.
    for (const oldKk of originalKkList) {
      if (String(oldKk.namaKepalaKeluarga || '').trim().toLowerCase() === namaKepala.toLowerCase()) {
        for (const u of umatList) {
          if (String(u.idKK || '').trim() === String(oldKk.id || '').trim()) u.idKK = kk.id;
        }
      }
    }
    for (const u of umatList) {
      const key = String(u.idKK || '').trim().toLowerCase();
      if (key && (key === nomorKK.toLowerCase() || key === `kk${nomorKK.toLowerCase()}`)) {
        u.idKK = kk.id;
      }
    }

    for (const m of members) {
      const u = findUmat(kk.id, m.nik, m.nama, m.tanggalLahir);
      if (u) {
        if (m.nik) u.nik = m.nik;
        if (m.tempatLahir) u.tempatLahir = m.tempatLahir;
        if (m.tanggalLahir) u.tanggalLahir = m.tanggalLahir;
        if (m.jenisKelamin) u.jenisKelamin = m.jenisKelamin;
        if (m.agama) u.agama = m.agama;
        if (m.pendidikan) u.pendidikan = m.pendidikan;
        if (m.pekerjaan) u.pekerjaan = m.pekerjaan;
        if (m.golonganDarah) u.golonganDarah = m.golonganDarah;
        if (m.statusPerkawinan) u.statusPerkawinan = m.statusPerkawinan;
        if (m.tanggalPerkawinan) u.tanggalPerkawinan = m.tanggalPerkawinan;
        if (m.statusHubunganKeluarga) u.statusHubunganKeluarga = m.statusHubunganKeluarga;
        if (m.kewarganegaraan) u.kewarganegaraan = m.kewarganegaraan;
        if (m.namaAyah) u.namaAyah = m.namaAyah;
        if (m.namaIbu) u.namaIbu = m.namaIbu;
        u.idKK = kk.id;
        if (kub) u.KUB = kub;
        if (alamat) u.alamat = alamat;
        updatedUmat++;
      } else {
        const baru = {
          id: newUmatId(),
          idKK: kk.id,
          nama: m.nama,
          jenisKelamin: m.jenisKelamin || 'Laki-laki',
          tanggalLahir: m.tanggalLahir || '',
          agama: m.agama || 'Katolik',
          status: 'Aktif',
          KUB: kub,
          alamat,
          lampiran: [],
          nik: m.nik || undefined,
          tempatLahir: m.tempatLahir || undefined,
          pendidikan: m.pendidikan || undefined,
          pekerjaan: m.pekerjaan || undefined,
          golonganDarah: m.golonganDarah || undefined,
          statusPerkawinan: m.statusPerkawinan || undefined,
          tanggalPerkawinan: m.tanggalPerkawinan || undefined,
          statusHubunganKeluarga: m.statusHubunganKeluarga || undefined,
          kewarganegaraan: m.kewarganegaraan || undefined,
          namaAyah: m.namaAyah || undefined,
          namaIbu: m.namaIbu || undefined,
        };
        umatList.push(baru);
        createdUmat++;
      }
    }
  }

  const kkIdSet = new Set(kkList.map((k) => k.id));
  for (const u of umatList) {
    if (u.idKK && !kkIdSet.has(u.idKK)) {
      const match = kkList.find((k) =>
        String(k.namaKepalaKeluarga || '').trim().toLowerCase() === String(u.nama || '').trim().toLowerCase()
      );
      if (match) u.idKK = match.id;
      else delete u.idKK;
    }
  }


  seed.kk = kkList;
  seed.umat = umatList;

  fs.writeFileSync(OUT_BACKUP, JSON.stringify(seed, null, 2), 'utf8');
  fs.writeFileSync(SEED, JSON.stringify(seed, null, 2), 'utf8');

  console.log('KK unik:', byKey.size);
  console.log('KK updated:', updatedKk, 'created:', createdKk);
  console.log('Umat updated:', updatedUmat, 'created:', createdUmat);
  console.log('Total KK:', kkList.length, 'Total Umat:', umatList.length);
  console.log('Backup:', OUT_BACKUP);
  console.log('Seed backup:', OUT_SEED_BACKUP);
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))) {
  main();
}

