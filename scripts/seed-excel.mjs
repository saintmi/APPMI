// ============================================================================
// Seed script: gabungkan data dari beberapa file Excel dan generate JSON snapshot
// untuk dipulihkan via UI (Cadangan & Pulihkan → Pulihkan dari File Cadangan)
// ============================================================================

import JSZip from 'jszip';
import fs from 'node:fs';

const FILES = [
  { path: 'D:/APPMI/docs/output_statistik_2026_final.xlsx', label: 'OUTPUT FINAL', prefix: '' },
  { path: 'D:/APPMI/docs/Tambahan Umat fase 3.xlsx', label: 'TAMBAHAN FASE 3', prefix: 'T3_' },
];
const OUT = 'D:/APPMI/seed-snapshot.json';

const SETTINGS = {
  namaLingkungan: 'Kasri',
  daftarKUB: ['KUB 1', 'KUB 2', 'KUB 3', 'KUB 4'],
  tahunStatistik: 2026,
  tanggalAcuan: '31/12/2026',
};

function excelSerialToDDMMYYYY(serial) {
  const n = Number(serial);
  if (!n || n < 1) return '';
  const excelEpoch = Date.UTC(1899, 11, 30);
  const d = new Date(excelEpoch + (n - 1) * 86400000);
  const dd = String(d.getUTCDate()).padStart(2, '0');
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0');
  const yyyy = String(d.getUTCFullYear());
  return `${dd}/${mm}/${yyyy}`;
}

function normalisasiJK(v) {
  const l = String(v ?? '').toLowerCase().trim();
  if (l === 'l' || l === 'laki' || l === 'laki-laki' || l === 'pria') return 'Laki-laki';
  if (l === 'p' || l === 'perempuan' || l === 'wanita') return 'Perempuan';
  return v || 'Laki-laki';
}

function normalisasiStatus(v) {
  const l = String(v ?? '').toLowerCase().trim();
  if (l === 'masih hidup' || l === 'aktif') return 'Aktif';
  if (l === 'meninggal') return 'Meninggal';
  if (l === 'pindah agama') return 'Pindah Agama';
  if (l === 'pindah keluar') return 'Pindah Keluar';
  return 'Belum Aktif';
}

function padId(n, prefix) {
  const s = String(n).replace(/[^0-9]/g, '');
  return prefix + s.padStart(5, '0');
}

function parseSheetXml(sheetXml, namaSheet) {
  const baris = [];
  const rowRe = /<row [^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  let m;
  while ((m = rowRe.exec(sheetXml)) !== null) {
    const nomor = parseInt(m[1], 10);
    const sel = {};
    const cellRe = /<c r="([A-Z]+\d+)"[^>]*>([\s\S]*?)<\/c>/g;
    let cm;
    while ((cm = cellRe.exec(m[2])) !== null) {
      const ref = cm[1];
      const isi = cm[2];
      const vRe = /<v>([\s\S]*?)<\/v>/;
      const vm = vRe.exec(isi);
      const tRe = /t="([^"]+)"/;
      const tm = tRe.exec(cm[0]);
      const jenis = tm ? tm[1] : 'n';
      let nilai = null;
      if (vm) nilai = vm[1];
      else if (jenis === 'inlineStr') {
        const isRe = /<is><t>([\s\S]*?)<\/t><\/is>/;
        const ism = isRe.exec(isi);
        if (ism) nilai = ism[1];
      }
      const kolomHuruf = ref.replace(/\d+$/, '');
      sel[kolomHuruf] = nilai;
    }
    baris.push({ nomor, sel });
  }
  return { nama: namaSheet, baris };
}

async function parseXlsxManual(ab) {
  const zip = await JSZip.loadAsync(ab);
  const wbXml = await zip.file('xl/workbook.xml')?.async('text');
  const relXml = await zip.file('xl/_rels/workbook.xml.rels')?.async('text');
  if (!wbXml || !relXml) throw new Error('Tidak bisa membaca workbook.xml atau rels');

  const relMap = {};
  const relRe = /<Relationship[^>]*\/>/g;
  let m;
  while ((m = relRe.exec(relXml)) !== null) {
    const tag = m[0];
    const idM = tag.match(/\bId="([^"]+)"/);
    const tM = tag.match(/\bTarget="([^"]+)"/);
    if (!idM || !tM) continue;
    let target = tM[1];
    if (target.startsWith('/')) target = target.slice(1);
    if (!target.startsWith('xl/')) target = 'xl/' + target;
    relMap[idM[1]] = target;
  }

  const sheets = [];
  const shRe = /<sheet [^>]*name="([^"]+)"[^>]*r:id="([^"]+)"[^>]*\/?>/g;
  while ((m = shRe.exec(wbXml)) !== null) {
    const namaSheet = m[1];
    const target = relMap[m[2]] || m[2];
    const sheetXml = await zip.file(target)?.async('text');
    if (!sheetXml) continue;
    sheets.push(parseSheetXml(sheetXml, namaSheet));
  }
  return sheets;
}

function deteksiHeader(baris) {
  for (let i = 0; i < baris.length; i++) {
    const nonKosong = Object.values(baris[i].sel).filter(v => v !== null && v !== '').length;
    if (nonKosong >= 3) return i;
  }
  return -1;
}

function ambil(baris, kunci) {
  return (baris.sel[kunci] ?? '').toString().trim();
}

function sheetKeUmat(sheet, idAwal, prefix = '') {
  const hdrIdx = deteksiHeader(sheet.baris);
  if (hdrIdx < 0) return { umat: [], peringatan: ['Tidak ditemukan header'] };
  const header = sheet.baris[hdrIdx].sel;
  const kunciKeKolom = {};
  Object.keys(header).forEach(k => {
    const v = header[k];
    if (v) kunciKeKolom[v.trim()] = k;
  });
  const get = (baris, nama) => {
    const k = kunciKeKolom[nama];
    return k !== undefined ? (baris.sel[k] ?? '').toString().trim() : '';
  };

  const umat = [];
  const peringatan = [];
  let idCounter = idAwal;
  const sudahId = new Set();

  for (let i = hdrIdx + 1; i < sheet.baris.length; i++) {
    const b = sheet.baris[i];
    const nama = get(b, 'Nama Lengkap') || get(b, 'Nama') || get(b, 'nama');
    if (!nama) continue;

    const idExist = get(b, 'ID Umat') || get(b, 'id');
    const id = idExist ? padId(idExist, 'UM') : `${prefix}UM${String(idCounter++).padStart(5, '0')}`;
    if (sudahId.has(id)) continue;
    sudahId.add(id);

    const idKKRaw = get(b, 'ID KK') || get(b, 'idKK') || get(b, 'No KK') || get(b, 'no kk');
    const idKK = idKKRaw ? padId(idKKRaw, 'KK') : '';

    const tanggalLahirRaw = get(b, 'Tanggal Lahir');
    const tanggalLahir = tanggalLahirRaw ? excelSerialToDDMMYYYY(tanggalLahirRaw) : '';

    umat.push({
      id,
      idKK,
      nama,
      jenisKelamin: normalisasiJK(get(b, 'Jenis Kelamin')),
      tanggalLahir,
      agama: get(b, 'Agama') || 'Katolik',
      status: normalisasiStatus(get(b, 'Status Umat')),
      KUB: get(b, 'KUB') || '',
      alamat: get(b, 'Alamat') || get(b, 'alamat') || '',
    });
  }
  return { umat, peringatan };
}

function sheetKeKk(sheet, idAwal, prefix = '') {
  const hdrIdx = deteksiHeader(sheet.baris);
  if (hdrIdx < 0) return { kk: [], peringatan: ['Tidak ditemukan header'] };
  const header = sheet.baris[hdrIdx].sel;
  const kunciKeKolom = {};
  Object.keys(header).forEach(k => {
    const v = header[k];
    if (v) kunciKeKolom[v.trim()] = k;
  });
  const get = (baris, nama) => {
    const k = kunciKeKolom[nama];
    return k !== undefined ? (baris.sel[k] ?? '').toString().trim() : '';
  };

  const kk = [];
  let idCounter = idAwal;
  const sudahId = new Set();

  for (let i = hdrIdx + 1; i < sheet.baris.length; i++) {
    const b = sheet.baris[i];
    const nama = get(b, 'Nama KK') || get(b, 'Nama') || get(b, 'nama');
    if (!nama) continue;

    const idExist = get(b, 'ID KK') || get(b, 'id');
    const id = idExist ? padId(idExist, 'KK') : `${prefix}KK${String(idCounter++).padStart(4, '0')}`;
    if (sudahId.has(id)) continue;
    sudahId.add(id);

    kk.push({
      id,
      namaKepalaKeluarga: nama,
      alamat: get(b, 'Alamat') || '',
      KUB: get(b, 'KUB') || '',
    });
  }
  return { kk, peringatan: [] };
}

const SHEET_JENIS = {
  BAPTIS: 'BAPTIS',
  'KOMUNI PERTAMA': 'KOMUNI PERTAMA',
  PERKAWINAN_GEREJANI: 'PERKAWINAN GEREJANI',
  'PERKAWINAN GEREJANI': 'PERKAWINAN GEREJANI',
  PEMBUBARAN: 'PEMBUBARAN',
  PERMINYAKAN_SUCI: 'PERMINYAKAN SUCI',
  'PERMINYAKAN SUCI': 'PERMINYAKAN SUCI',
  KEMATIAN: 'KEMATIAN',
  SEMINARI_BIARA: 'SEMINARI BIARA',
  'SEMINARI BIARA': 'SEMINARI BIARA',
  DITERIMA_MASUK: 'DITERIMA MASUK',
  'DITERIMA MASUK': 'DITERIMA MASUK',
  MUTASI: 'MUTASI',
  PINDAH_AGAMA: 'PINDAH AGAMA',
  'PINDAH AGAMA': 'PINDAH AGAMA',
};

const SHEET_TANGGAL = {
  BAPTIS: 'Tanggal Baptis',
  'KOMUNI PERTAMA': 'Tanggal Komuni I',
  'PERKAWINAN GEREJANI': 'Tanggal Perkawinan',
  PEMBUBARAN: 'Tanggal Pembubaran',
  'PERMINYAKAN SUCI': 'Tanggal Sakramen',
  KEMATIAN: 'Tanggal Meninggal',
  'SEMINARI BIARA': 'Tanggal Mulai/Status',
  'DITERIMA MASUK': 'Tanggal Masuk',
  MUTASI: 'Tanggal Mutasi',
  'PINDAH AGAMA': 'Tanggal Pindah Agama',
};

function sheetKePeristiwa(sheet, umatById, kkById, idCounter) {
  const namaSheet = sheet.nama.toUpperCase().replace(/\s+/g, '_');
  const jenis = SHEET_JENIS[namaSheet];
  if (!jenis) return { peristiwa: [], idCounter };

  const hdrIdx = deteksiHeader(sheet.baris);
  if (hdrIdx < 0) return { peristiwa: [], idCounter };
  const header = sheet.baris[hdrIdx].sel;
  const kunciKeKolom = {};
  Object.keys(header).forEach(k => {
    const v = header[k];
    if (v) kunciKeKolom[v.trim()] = k;
  });
  const get = (baris, nama) => {
    const k = kunciKeKolom[nama];
    return k !== undefined ? (baris.sel[k] ?? '').toString().trim() : '';
  };
  const tanggalKolom = SHEET_TANGGAL[namaSheet] ?? 'Tanggal';

  const peristiwa = [];
  for (let i = hdrIdx + 1; i < sheet.baris.length; i++) {
    const b = sheet.baris[i];
    const idUmatRaw = get(b, 'ID Umat') || get(b, 'ID');
    const nama = get(b, 'Nama') || get(b, 'Nama Pasangan') || '';
    if (!idUmatRaw && !nama) continue;

    const idUmat = idUmatRaw ? padId(idUmatRaw, 'UM') : '';
    const tanggalRaw = get(b, tanggalKolom);
    const tanggal = tanggalRaw ? excelSerialToDDMMYYYY(tanggalRaw) : '';
    const keterangan = get(b, 'Keterangan') || '';

    const u = umatById.get(idUmat);
    const namaFinal = nama || (u ? u.nama : '');
    const jenisKelamin = u ? u.jenisKelamin : (get(b, 'Jenis Kelamin') ? normalisasiJK(get(b, 'Jenis Kelamin')) : '');
    const tanggalLahir = u ? u.tanggalLahir : (get(b, 'Tanggal Lahir') ? excelSerialToDDMMYYYY(get(b, 'Tanggal Lahir')) : '');
    const lingkungan = SETTINGS.namaLingkungan;

    let idUmatFinal = idUmat;
    if (jenis === 'PERKAWINAN GEREJANI' || jenis === 'PEMBUBARAN') {
      const kkIdRaw = get(b, 'ID KK') || idUmatRaw;
      const kkId = kkIdRaw ? padId(kkIdRaw, 'KK') : '';
      const kk = kkById.get(kkId);
      if (kk) {
        idUmatFinal = kk.id;
      } else {
        idUmatFinal = kkId;
      }
    }

    peristiwa.push({
      id: `P${String(idCounter++).padStart(6, '0')}`,
      jenis,
      idUmat: idUmatFinal,
      nama: namaFinal,
      lingkungan,
      jenisKelamin,
      tanggalLahir,
      tanggal: tanggal || null,
      keterangan,
    });
  }
  return { peristiwa, idCounter };
}

async function main() {
  console.log('=== SEED GENERATOR (multi-file) ===\n');

  // Load all sheets from all files
  const fileSheets = [];
  for (const f of FILES) {
    console.log(`Memuat ${f.label}: ${f.path}`);
    const ab = fs.readFileSync(f.path);
    const sheets = await parseXlsxManual(ab);
    console.log(`  Sheets: ${sheets.map(s => s.nama).join(', ')}`);
    fileSheets.push({ ...f, sheets });
  }

  // Build umat and kk from all files
  let semuaUmat = [];
  let semuaKk = [];
  let idCounterUmat = 1;
  let idCounterKk = 1;

  for (const fs_ of fileSheets) {
    const sheetUmat = fs_.sheets.find(s => s.nama === 'DATA UMAT');
    if (sheetUmat) {
      const { umat, peringatan } = sheetKeUmat(sheetUmat, idCounterUmat, fs_.prefix);
      console.log(`${fs_.label} DATA UMAT: ${umat.length} umat`);
      peringatan.forEach(p => console.log(`    PERINGATAN: ${p}`));
      semuaUmat.push(...umat);
      idCounterUmat += umat.length;
    }

    const sheetKk = fs_.sheets.find(s => s.nama === 'DATA KK');
    if (sheetKk) {
      const { kk, peringatan } = sheetKeKk(sheetKk, idCounterKk, fs_.prefix);
      console.log(`${fs_.label} DATA KK: ${kk.length} KK`);
      peringatan.forEach(p => console.log(`    PERINGATAN: ${p}`));
      semuaKk.push(...kk);
      idCounterKk += kk.length;
    }
  }

  // Deduplikasi
  const umatById = new Map();
  for (const u of semuaUmat) {
    if (!umatById.has(u.id)) umatById.set(u.id, u);
  }
  const umat = Array.from(umatById.values());

  const kkById = new Map();
  for (const k of semuaKk) {
    if (!kkById.has(k.id)) kkById.set(k.id, k);
  }
  const kk = Array.from(kkById.values());

  console.log(`\nTotal dedup: ${umat.length} umat, ${kk.length} KK`);

  // Build peristiwa from all files
  let semuaPeristiwa = [];
  let idCounterPeristiwa = 1;
  for (const fs_ of fileSheets) {
    for (const sheet of fs_.sheets) {
      const { peristiwa, idCounter: nextId } = sheetKePeristiwa(sheet, umatById, kkById, idCounterPeristiwa);
      if (peristiwa.length > 0) {
        console.log(`  Peristiwa ${sheet.nama}: ${peristiwa.length}`);
        semuaPeristiwa.push(...peristiwa);
        idCounterPeristiwa = nextId;
      }
    }
  }

  const audit = [{
    id: 1,
    waktu: new Date().toISOString(),
    aksi: 'TAMBAH',
    entitas: 'Seed',
    idEntitas: 'import-excel-multi',
    sebelum: null,
    sesudah: { umat: umat.length, kk: kk.length, peristiwa: semuaPeristiwa.length },
  }];

  const snapshot = {
    settings: SETTINGS,
    umat,
    kk,
    peristiwa: semuaPeristiwa,
    riwayatPindahAlamat: [],
    audit,
    indeksUndo: 0,
  };

  fs.writeFileSync(OUT, JSON.stringify(snapshot, null, 2));
  console.log(`\n=== SEED SELESAI ===\n`);
  console.log(`File: ${OUT}`);
  console.log(`Settings: ${SETTINGS.namaLingkungan}`);
  console.log(`Umat: ${umat.length}`);
  console.log(`KK: ${kk.length}`);
  console.log(`Peristiwa: ${semuaPeristiwa.length}`);
}

main().catch(err => {
  console.error('Error:', err);
  process.exit(1);
});
