// ============================================================================
// Parser berkas impor — .xlsx / .xls / .csv → array baris (header + data)
// Hanya membaca, tidak menulis. Tidak ada dependensi SheetJS di sisi runtime
// (digunakan JSZip untuk xlsx; csv dibaca teks mentah).
// ============================================================================

import JSZip from 'jszip';

export interface BarisBerkas {
  nomor: number; // baris asli di berkas (1-based)
  sel: Record<string, string | null>;
}

export interface SheetBerkas {
  nama: string;
  baris: BarisBerkas[];
}

export function parseFile(file: File): Promise<SheetBerkas[]> {
  const nama = file.name.toLowerCase();
  if (nama.endsWith('.xlsx')) {
    return parseXlsx(file);
  }
  if (nama.endsWith('.xls')) {
    return parseXls(file);
  }
  if (nama.endsWith('.csv')) {
    return parseCsv(file);
  }
  throw new Error('Format berkas tidak didukung. Gunakan .xlsx, .xls, atau .csv.');
}

export async function parseXlsxArrayBuffer(ab: ArrayBuffer): Promise<SheetBerkas[]> {
  const zip = await JSZip.loadAsync(ab);
  const wbXml = await zip.file('xl/workbook.xml')!.async('text');
  const relXml = await zip.file('xl/_rels/workbook.xml.rels')!.async('text');
        const relMap: Record<string, string> = {};
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
  const sheets: SheetBerkas[] = [];
  const shRe = /<sheet [^>]*name="([^"]+)"[^>]*r:id="([^"]+)"[^>]*\/?>/g;
  while ((m = shRe.exec(wbXml)) !== null) {
    const namaSheet = m[1];
    const target = relMap[m[2]] || m[2];
    const sheetXml = await zip.file(target)!.async('text');
    sheets.push(parseSheetXml(sheetXml, namaSheet));
  }
  return sheets;
}

function parseXlsx(file: File): Promise<SheetBerkas[]> {
  return new Promise((resolve, reject) => {
    const pembaca = new FileReader();
    pembaca.onload = async () => {
      try {
        const ab = pembaca.result as ArrayBuffer;
        const sheets = await parseXlsxArrayBuffer(ab);
        resolve(sheets);
      } catch (err) {
        reject(err);
      }
    };
    pembaca.onerror = () => reject(new Error('Gagal membaca berkas Excel.'));
    pembaca.readAsArrayBuffer(file);
  });
}

function parseXls(_file: File): Promise<SheetBerkas[]> {
  void _file;
  // .xls (BIFF) tidak bisa diparse JSZip. Kembalikan error dengan pesan jelas.
  return Promise.reject(new Error('.xls lama (BIFF) belum didukung. Simpan ulang sebagai .xlsx.'));
}

function parseCsv(file: File): Promise<SheetBerkas[]> {
  return new Promise((resolve, reject) => {
    const pembaca = new FileReader();
    pembaca.onload = () => {
      const teks = pembaca.result as string;
      const baris = teks.split(/\r?\n/).filter((b) => b.trim().length > 0);
      const sheets: SheetBerkas[] = [
        { nama: 'Sheet1', baris: baris.map((b, i) => {
          const sel: Record<string, string | null> = {};
          b.split(',').forEach((v, j) => {
            sel[String.fromCharCode(65 + j)] = v.trim() || null;
          });
          return { nomor: i + 1, sel };
        }) },
      ];
      resolve(sheets);
    };
    pembaca.onerror = () => reject(new Error('Gagal membaca berkas CSV.'));
    pembaca.readAsText(file);
  });
}

function parseSheetXml(sheetXml: string, namaSheet: string): SheetBerkas {
  const baris: BarisBerkas[] = [];
  const rowRe = /<row [^>]*r="(\d+)"[^>]*>([\s\S]*?)<\/row>/g;
  let m;
  while ((m = rowRe.exec(sheetXml)) !== null) {
    const nomor = parseInt(m[1], 10);
    const sel: Record<string, string | null> = {};
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
      let nilai: string | null = null;
      if (vm) {
        if (jenis === 's') {
          nilai = vm[1];
        } else {
          nilai = vm[1];
        }
      } else if (jenis === 'inlineStr') {
        const isRe = /<is><t>([\s\S]*?)<\/t><\/is>/;
        const ism = isRe.exec(isi);
        if (ism) nilai = ism[1];
      }
      // Kunci hanya kolom huruf (A, B, C…) sehingga konsisten semua baris
      const kolomHuruf = ref.replace(/\d+$/, '');
      sel[kolomHuruf] = nilai;
    }
    baris.push({ nomor, sel });
  }
  return { nama: namaSheet, baris };
}
