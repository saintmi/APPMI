// ============================================================================
// Detektor kolom impor — kamus sinonim + pola isi + tingkat keyakinan
// ============================================================================

import type { JenisPeristiwa, Kk, Peristiwa, Umat } from '../engine/types.ts';
import { type LLMRouter } from '../llm/router.ts';

export type JenisSheet = 'umat' | 'kk' | 'peristiwa';

export interface KolomCandidate {
  header: string;           // teks header asli di berkas
  index: number;            // indeks kolom (0-based)
  target: string;           // nama kolom model: 'nama' | 'jenisKelamin' | ... | null
  keyakinan: 'tinggi' | 'sedang' | 'rendah';
  alasan: string;
  nilaiContoh: string[];    // 3 nilai pertama non-kosong
}

export interface DeteksiHasil {
  sheet: string;
  jenisSheet: JenisSheet;
  barisHeader: number;      // nomor baris header (1-based)
  jumlahData: number;
  pemetaan: KolomCandidate[]; // satu per kolom data yang terdeteksi
  kolomTanpaPadanan: string[];
}

const SINONIM: Record<string, string[]> = {
  nama: ['nama', 'nama lengkap', 'nama umat', 'nama lengkap umat', 'nama jemaat'],
  jenisKelamin: ['jenis kelamin', 'jk', 'l/p', 'gender', 'kelamin'],
  tanggalLahir: ['tanggal lahir', 'ttl', 'tgl lahir', 'lahir', 'tanggal lahir lengkap'],
  tanggal: ['tanggal', 'tgl', 'tanggal baptis', 'tanggal masuk', 'tanggal mutasi', 'tanggal pindah agama', 'tanggal pembubaran', 'tanggal sakramen', 'tanggal kematian', 'tanggal komuni i', 'tanggal krisma', 'tanggal mulai/status'],
  agama: ['agama'],
  status: ['status', 'status umat', 'status keaktifan'],
  KUB: ['kub', 'kelompok umat bupati', 'keterangan kub', 'basis/stasi', 'basis', 'stasi'],
  idKK: ['id kk', 'kk', 'nomor kk', 'id keluarga', 'nomor kk'],
  alamat: ['alamat', 'alamat lengkap'],
  id: ['id', 'id umat', 'nomor id', 'no id'],
  idUmat: ['id umat', 'id', 'nomor id', 'no id'],
  keterangan: ['keterangan', 'catatan', 'keterangan peristiwa'],
  nomorKK: ['nomor kk', 'no kk', 'kk'],
  namaKepalaKeluarga: ['nama kepala keluarga', 'kepala keluarga', 'nama kk'],
};

function normalisasiTeks(t: string): string {
  return t
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function hitungKeyakinan(header: string, target: string): { keyakinan: KolomCandidate['keyakinan']; alasan: string } {
  const h = normalisasiTeks(header);
  const daftar = SINONIM[target] ?? [];
  if (daftar.some((s) => h === normalisasiTeks(s))) {
    return { keyakinan: 'tinggi', alasan: 'Header cocok persis dengan sinonim.' };
  }
  if (daftar.some((s) => h.includes(normalisasiTeks(s)) || normalisasiTeks(s).includes(h))) {
    return { keyakinan: 'sedang', alasan: 'Header hampir cocok dengan sinonim.' };
  }
  return { keyakinan: 'rendah', alasan: 'Tidak ada sinonim yang cocok; ditentukan dari pola isi.' };
}

function deteksiDariPolai(sel: string[], jenisSheet: JenisSheet): string | null {
  const nonKosong = sel.filter((v) => v !== null && v !== '');
  if (nonKosong.length === 0) return null;

  // Tanggal: pola dd/MM/yyyy
  const tanggalRe = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
  if (nonKosong.every((v) => tanggalRe.test(v))) {
    return jenisSheet === 'peristiwa' ? 'tanggal' : 'tanggalLahir';
  }

  // Jenis kelamin: Laki-laki / Perempuan / Pria / Wanita / L / P
  const jkRe = /^(laki-?laki|perempuan|pria|wanita|l|p)$/i;
  if (nonKosong.every((v) => jkRe.test(v))) return 'jenisKelamin';

  // ID: UMxxxxx atau KKxxxxx
  const idRe = /^(UM|KK)\d{4,}$/;
  if (nonKosong.every((v) => idRe.test(v))) {
    return jenisSheet === 'peristiwa' ? 'idUmat' : 'id';
  }

  return null;
}

export function deteksiKolom(sheet: { nama: string; baris: { nomor: number; sel: Record<string, string | null> }[] }, jenisSheet: JenisSheet = 'umat'): DeteksiHasil {
  const baris = sheet.baris;
  if (baris.length === 0) {
    return { sheet: sheet.nama, jenisSheet, barisHeader: 0, jumlahData: 0, pemetaan: [], kolomTanpaPadanan: [] };
  }

  // Cari baris header: baris pertama yang memiliki ≥ 2 sel non-kosong yang terlihat seperti teks header
  let barisHeaderIndex = -1;
  for (let i = 0; i < baris.length; i++) {
    const nonKosong = Object.values(baris[i].sel).filter((v) => v !== null && v !== '');
    if (nonKosong.length >= 3) {
      barisHeaderIndex = i;
      break;
    }
  }
  if (barisHeaderIndex < 0) {
    return { sheet: sheet.nama, jenisSheet, barisHeader: 0, jumlahData: 0, pemetaan: [], kolomTanpaPadanan: [] };
  }

  const headerBaris = baris[barisHeaderIndex];
  const kunciHeader = Object.keys(headerBaris.sel).sort((a, b) => a.localeCompare(b));
  const dataBaris = baris.slice(barisHeaderIndex + 1);

  const pemetaan: KolomCandidate[] = [];
  const kolomTanpaPadanan: string[] = [];

  for (const kunci of kunciHeader) {
    const headerText = headerBaris.sel[kunci] ?? '';
    const nilaiContoh = dataBaris
      .map((b) => b.sel[kunci])
      .filter((v) => v !== null && v !== '')
      .slice(0, 3);

    let target: string | null = null;
    let keyakinan: KolomCandidate['keyakinan'] = 'rendah';
    let alasan = '';
    // cek semua target — hanya terima match minimal 'sedang'
    let terbaik: { target: string; keyakinan: KolomCandidate['keyakinan']; alasan: string } | null = null;
    for (const t of Object.keys(SINONIM)) {
      const c = hitungKeyakinan(headerText, t);
      if (c.keyakinan === 'tinggi') {
        terbaik = { target: t, keyakinan: c.keyakinan, alasan: c.alasan };
        break;
      }
      if (c.keyakinan === 'sedang' && !terbaik) {
        terbaik = { target: t, keyakinan: c.keyakinan, alasan: c.alasan };
      }
    }

    if (terbaik) {
      target = terbaik.target;
      keyakinan = terbaik.keyakinan;
      alasan = terbaik.alasan;
    }

    // Jika masih rendah, coba dari pola isi
    if (keyakinan === 'rendah' || !target) {
      const dariPolai = deteksiDariPolai(nilaiContoh.map((v) => v ?? ''), jenisSheet);
      if (dariPolai) {
        target = dariPolai;
        keyakinan = 'sedang';
        alasan = 'Ditetapkan dari pola isi kolom.';
      }
    }

    if (target) {
      pemetaan.push({ header: headerText, index: kunciHeader.indexOf(kunci), target, keyakinan, alasan, nilaiContoh: nilaiContoh.map((v) => v ?? '') });
    } else {
      kolomTanpaPadanan.push(headerText);
    }
  }

  return {
    sheet: sheet.nama,
    jenisSheet,
    barisHeader: headerBaris.nomor,
    jumlahData: dataBaris.length,
    pemetaan,
    kolomTanpaPadanan,
  };
}

export function konversiBarisKeUmat(
  baris: { nomor: number; sel: Record<string, string | null> }[],
  pemetaan: KolomCandidate[],
  settings: { namaLingkungan: string; daftarKUB: string[]; tanggalAcuan: string },
  idMulai: number,
): { umat: Umat[]; peringatan: string[] } {
  const umat: Umat[] = [];
  const peringatan: string[] = [];
  const daftarKUB = new Set(settings.daftarKUB);
  let idCounter = idMulai;

  // Bangun map kunci header (mis. 'A', 'B') → target model
  const kunciTerurut = Object.keys(baris[0]?.sel ?? {}).sort((a, b) => a.localeCompare(b));
  const kunciKeTarget = new Map<string, string>();
  for (const p of pemetaan) {
    const kunci = kunciTerurut[p.index];
    if (kunci) kunciKeTarget.set(kunci, p.target);
  }

  const ambilNilai = (sel: Record<string, string | null>, target: string): string => {
    const kunci = [...kunciKeTarget.entries()].find(([, t]) => t === target)?.[0];
    return kunci !== undefined ? (sel[kunci] ?? '') : '';
  };

  for (const b of baris) {
    const nama = ambilNilai(b.sel, 'nama').trim();
    if (!nama) continue; // lewati baris kosong nama

    const jenisKelaminRaw = ambilNilai(b.sel, 'jenisKelamin').trim();
    const tanggalLahir = ambilNilai(b.sel, 'tanggalLahir').trim();
    const agama = ambilNilai(b.sel, 'agama').trim() || 'Katolik';
    const status = ambilNilai(b.sel, 'status').trim() || 'Belum Aktif';
    const kub = ambilNilai(b.sel, 'KUB').trim();
    const idKK = ambilNilai(b.sel, 'idKK').trim();
    const alamat = ambilNilai(b.sel, 'alamat').trim();
    const idExist = ambilNilai(b.sel, 'id').trim();

    const id = idExist || `UM${String(idCounter++).padStart(5, '0')}`;

    if (kub && !daftarKUB.has(kub)) {
      peringatan.push(`Baris ${b.nomor}: KUB "${kub}" tidak ada dalam daftar KUB lingkungan.`);
    }

    umat.push({
      id,
      idKK,
      nama,
      jenisKelamin: normalisasiJK(jenisKelaminRaw) as 'Laki-laki' | 'Perempuan',
      tanggalLahir,
      agama,
      status,
      KUB: kub,
      alamat,
      lampiran: [],
    });
  }

  return { umat, peringatan };
}

export interface DeteksiHasil {
  sheet: string;
  barisHeader: number;      // nomor baris header (1-based)
  jumlahData: number;
  pemetaan: KolomCandidate[]; // satu per kolom data yang terdeteksi
  kolomTanpaPadanan: string[];
  saranLLM?: Array<{ header: string; target: string; alasan: string }>; // saran LLM untuk kolom ambigu
}
export async function deteksiKolomDenganLLM(
  sheet: { nama: string; baris: { nomor: number; sel: Record<string, string | null> }[] },
  jenisSheet: JenisSheet,
  llm: LLMRouter | null,
  settings: { namaLingkungan: string; daftarKUB: string[]; tanggalAcuan: string },
): Promise<DeteksiHasil> {
  const dasar = deteksiKolom(sheet, jenisSheet);
  if (!llm || !llm.konfigurasi.diaktifkan) {
    return dasar;
  }

  // Kumpulkan kolom ambigu (keyakinan rendah atau tanpa target)
  const ambigu = dasar.pemetaan.filter((p) => p.keyakinan === 'rendah' || !p.target);
  const tanpaPadanan = dasar.kolomTanpaPadanan;

  if (ambigu.length === 0 && tanpaPadanan.length === 0) {
    return dasar;
  }

  const contohPerKolom = new Map<string, string[]>();
  const barisData = sheet.baris.slice(dasar.barisHeader);
  for (const p of ambigu) {
    const kunci = Object.keys(barisData[0]?.sel ?? {}).sort((a, b) => a.localeCompare(b))[p.index];
    if (kunci) {
      contohPerKolom.set(p.header, barisData.map((b) => b.sel[kunci] ?? '').filter((v) => v).slice(0, 5));
    }
  }

  const prompt = `

Anda membantu memetakan kolom berkas sensus/scan ke model data statistik umat.
Berkas: ${sheet.nama}
Lingkungan: ${settings.namaLingkungan}
Daftar KUB: ${settings.daftarKUB.join(', ')}

Kolom yang perlu dipetakan (header -> contoh nilai):
${ambigu.map((p) => `- "${p.header}": ${contohPerKolom.get(p.header)?.join(', ') || '(kosong)'}`).join('\n')}
${tanpaPadanan.map((h) => `- "${h}" (tanpa padanan aturan)`).join('\n')}

Model target yang tersedia: nama, jenisKelamin, tanggalLahir, agama, status, KUB, idKK, alamat, id.
Tanggapan harus berupa JSON tunggal: {"peta": [{"berkas": "header asli", "model": "nama|jenisKelamin|...|id|lewati", "alasan": "string"}]}
Jika kolom bukan data umat (mis. nomor urut, catatan internal), gunakan "lewati".
Jangan menebak nilai asli. Jika tidak yakin, masukkan "lewati".
`;

    try {
      const hasil = await llm.panggil({
        prompt,
        responseMimeType: 'application/json',
      });
      const data = JSON.parse(hasil.respons.teks) as { peta: Array<{ berkas: string; model: string; alasan: string }> };
      const saran = data.peta.map((p) => ({ header: p.berkas, target: p.model === 'lewati' ? '' : p.model, alasan: p.alasan }));
      return { ...dasar, saranLLM: saran };
    } catch {
      return dasar;
    }
}

function normalisasiJK(v: string): string {
  const l = v.toLowerCase();
  if (l === 'l' || l === 'laki' || l === 'laki-laki' || l === 'pria') return 'Laki-laki';
  if (l === 'p' || l === 'perempuan' || l === 'wanita') return 'Perempuan';
  return v || 'Laki-laki';
}

/** Peta nama sheet template → JenisPeristiwa. */
export function sheetKeJenisPeristiwa(namaSheet: string): JenisPeristiwa | null {
  const map: Record<string, JenisPeristiwa> = {
    BAPTIS: 'BAPTIS',
    'DITERIMA MASUK': 'DITERIMA MASUK',
    MUTASI: 'MUTASI_KELUAR',
    'PINDAH AGAMA': 'PINDAH AGAMA',
    'KOMUNI PERTAMA': 'KOMUNI PERTAMA',
    'PERKAWINAN GEREJANI': 'PERKAWINAN GEREJANI',
    PEMBUBARAN: 'PEMBUBARAN',
    'PERMINYAKAN SUCI': 'PERMINYAKAN SUCI',
    KEMATIAN: 'KEMATIAN',
    'SEMINARI BIARA': 'SEMINARI BIARA',
  };
  return map[namaSheet] ?? null;
}

/** Apakah nama sheet merupakan sheet DATA UMAT / DATA KK / peristiwa? */
export function klasifikasiSheet(namaSheet: string): JenisSheet {
  const upper = namaSheet.trim().toUpperCase();
  if (upper === 'DATA UMAT') return 'umat';
  if (upper === 'DATA KK') return 'kk';
  if (sheetKeJenisPeristiwa(namaSheet)) return 'peristiwa';
  return 'umat'; // default: treats as umat-compatible
}

/**
 * Konversi baris data sheet peristiwa → Peristiwa[].
 * id dialokasikan mesin. nama/jenisKelamin/tanggalLahir/lingkungan disinkronkan
 * kemudian lewat sinkronkanPeristiwaDariUmat.
 */
export function konversiBarisKePeristiwa(
  baris: { nomor: number; sel: Record<string, string | null> }[],
  pemetaan: KolomCandidate[],
  jenis: JenisPeristiwa,
  settings: { namaLingkungan: string; daftarKUB: string[]; tanggalAcuan: string },
  idMulai: number,
): { peristiwa: Peristiwa[]; peringatan: string[] } {
  const peristiwa: Peristiwa[] = [];
  const peringatan: string[] = [];
  let idCounter = idMulai;

  const kunciTerurut = Object.keys(baris[0]?.sel ?? {}).sort((a, b) => a.localeCompare(b));
  const kunciKeTarget = new Map<string, string>();
  for (const p of pemetaan) {
    const kunci = kunciTerurut[p.index];
    if (kunci) kunciKeTarget.set(kunci, p.target);
  }

  const ambilNilai = (sel: Record<string, string | null>, target: string): string => {
    const kunci = [...kunciKeTarget.entries()].find(([, t]) => t === target)?.[0];
    return kunci !== undefined ? (sel[kunci] ?? '') : '';
  };

  for (const b of baris) {
    const idUmat = ambilNilai(b.sel, 'idUmat').trim();
    const tanggal = ambilNilai(b.sel, 'tanggal').trim();
    const keterangan = ambilNilai(b.sel, 'keterangan').trim();

    if (!idUmat) {
      peringatan.push(`Baris ${b.nomor}: ID Umat kosong, dilewati.`);
      continue;
    }

    peristiwa.push({
      id: `P${String(idCounter++).padStart(5, '0')}`,
      jenis,
      idUmat,
      nama: '',
      lingkungan: settings.namaLingkungan,
      jenisKelamin: '',
      tanggalLahir: '',
      tanggal: tanggal || null,
      keterangan,
    });
  }

  return { peristiwa, peringatan };
}

/**
 * Konversi baris data sheet DATA KK → Kk[].
 * id dialokasikan mesin.
 */
export function konversiBarisKeKk(
  baris: { nomor: number; sel: Record<string, string | null> }[],
  pemetaan: KolomCandidate[],
  settings: { namaLingkungan: string; daftarKUB: string[]; tanggalAcuan: string },
  idMulai: number,
): { kk: Kk[]; peringatan: string[] } {
  const kk: Kk[] = [];
  const peringatan: string[] = [];
  let idCounter = idMulai;

  const kunciTerurut = Object.keys(baris[0]?.sel ?? {}).sort((a, b) => a.localeCompare(b));
  const kunciKeTarget = new Map<string, string>();
  for (const p of pemetaan) {
    const kunci = kunciTerurut[p.index];
    if (kunci) kunciKeTarget.set(kunci, p.target);
  }

  const ambilNilai = (sel: Record<string, string | null>, target: string): string => {
    const kunci = [...kunciKeTarget.entries()].find(([, t]) => t === target)?.[0];
    return kunci !== undefined ? (sel[kunci] ?? '') : '';
  };

  for (const b of baris) {
    const namaKepalaKeluarga = ambilNilai(b.sel, 'namaKepalaKeluarga').trim();
    if (!namaKepalaKeluarga) continue; // lewati baris kosong

    const nomorKK = ambilNilai(b.sel, 'nomorKK').trim();
    const alamat = ambilNilai(b.sel, 'alamat').trim();
    const KUB = ambilNilai(b.sel, 'KUB').trim();
    const idExist = ambilNilai(b.sel, 'id').trim();

    const id = idExist || `KK${String(idCounter++).padStart(4, '0')}`;

    if (KUB && !new Set(settings.daftarKUB).has(KUB)) {
      peringatan.push(`Baris ${b.nomor}: KUB "${KUB}" tidak ada dalam daftar KUB lingkungan.`);
    }

    kk.push({
      id,
      nomorKK,
      namaKepalaKeluarga,
      alamat,
      KUB,
      lampiran: [],
    });
  }

  return { kk, peringatan };
}

