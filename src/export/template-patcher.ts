// ============================================================================
// Template Patcher — buka .xlsx sebagai ZIP, ubah hanya XML yang perlu.
// Fakta template (audit scripts/audit-template.mjs): 17 sheet, semua string
// memakai sharedStrings (t="s"). DATA UMAT=sheet4 TblDATAUMAT A1:Z2001.
// DATA KK=sheet3 TblDATAKK A1:K501 (A2 rumus). REKAP=sheet15 A5 kosong,
// B5=COUNTIF KK, C5=COUNTIF UMAT (diubah jadi COUNTIFS Status=Aktif).
// Kolom KUB baru: UMAT AA (id 27), KK L (id 12). REKAP A5 style s=18.
// Sel berumus TIDAK PERNAH ditimpa.
// ============================================================================

import JSZip from 'jszip';
import type { Umat, Kk, Settings } from '../engine/types.ts';
import { dateToExcelSerial, parseTanggalIndonesia } from './excel-serial.ts';
import { hitungUmur } from '../engine/status.ts';
import { isStatusAktif } from '../engine/types.ts';

export interface CellWrite { ref: string; s: number; t: 's' | 'n'; v: string; }
export interface PatchPlan {
  sheet: string; cells: CellWrite[]; tableRef?: string; tableName?: string;
  newTableColumn?: { name: string; id: number }; setA5?: string; setFullCalcOnLoad?: boolean;
}

export const RUMUS_JIWA_AKTIF =
  'IF($A5="","",COUNTIFS(\'DATA UMAT\'!$H$2:$H$2001,$A5,\'DATA UMAT\'!$K$2:$K$2001,"Aktif"))';

export function columnLetterToIndex(letter: string): number {
  let idx = 0;
  for (let i = 0; i < letter.length; i++) idx = idx * 26 + (letter.charCodeAt(i) - 64);
  return idx;
}

export function parseRef(ref: string): { col: number; row: number } {
  const m = ref.match(/^([A-Z]+)(\d+)$/);
  if (!m) throw new Error('Invalid ref: ' + ref);
  return { col: columnLetterToIndex(m[1]), row: parseInt(m[2], 10) };
}

export function xmlEscape(t: string): string {
  return t.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;').replace(/'/g, '&apos;');
}

export function xmlUnescape(t: string): string {
  return t.replace(/&quot;/g, '"').replace(/&apos;/g, "'").replace(/&gt;/g, '>')
    .replace(/&lt;/g, '<').replace(/&amp;/g, '&');
}

export function buildSharedCell(ref: string, s: number, idx: number): string {
  return `<c r="${ref}" s="${s}" t="s"><v>${idx}</v></c>`;
}

export function buildNumberCell(ref: string, s: number, v: string): string {
  return `<c r="${ref}" s="${s}"><v>${v}</v></c>`;
}

export function getRowXml(xml: string, row: number): string | null {
  const m = xml.match(new RegExp('<row [^>]*r="' + row + '"[^>]*>([\\s\\S]*?)</row>'));
  return m ? m[0] : null;
}

export interface ParsedCell {
  ref: string; full: string; hasFormula: boolean;
  formula?: string; value?: string; t?: string; s?: number;
}

export function extractCells(rowXml: string): ParsedCell[] {
  const out: ParsedCell[] = [];
  const re = /<c r="([^"]+)"([^>]*?)(?:\/>|>([\s\S]*?)<\/c>)/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(rowXml)) !== null) {
    const inner = m[3] ?? '';
    const fm = inner.match(/<f[^>]*>([\s\S]*?)<\/f>/);
    const vm = inner.match(/<v>([\s\S]*?)<\/v>/);
    const tm = m[2].match(/t="([^"]+)"/);
    const sm = m[2].match(/s="(\d+)"/);
    out.push({
      ref: m[1], full: m[0], hasFormula: inner.includes('<f'),
      formula: fm ? fm[1] : undefined, value: vm ? vm[1] : undefined,
      t: tm ? tm[1] : undefined, s: sm ? parseInt(sm[1], 10) : undefined,
    });
  }
  return out;
}
export function parseSharedStrings(ssXml: string): string[] {
  const out: string[] = [];
  let m: RegExpExecArray | null;
  const re = /<si>([\s\S]*?)<\/si>/g;
  while ((m = re.exec(ssXml)) !== null) {
    const parts = [...m[1].matchAll(/<t[^>]*>([\s\S]*?)<\/t>/g)].map((x) => xmlUnescape(x[1]));
    out.push(parts.join(''));
  }
  return out;
}

export function getOrAddSharedString(ssXml: string, text: string): { xml: string; idx: number } {
  const arr = parseSharedStrings(ssXml);
  const ex = arr.indexOf(text);
  if (ex >= 0) return { xml: ssXml, idx: ex };
  const idx = arr.length;
  const siXml = `<si><t>${xmlEscape(text)}</t></si>`;
  let xml: string;
  if (/<\/sst\s*>/.test(ssXml)) xml = ssXml.replace(/<\/sst\s*>/, siXml + '</sst>');
  else xml = ssXml + siXml;
  xml = xml.replace(/count="(\d+)"/, (_a, c) => `count="${parseInt(c, 10) + 1}"`);
  xml = xml.replace(/uniqueCount="(\d+)"/, (_a, c) => `uniqueCount="${parseInt(c, 10) + 1}"`);
  return { xml, idx };
}

/** Isi cache <v> sel berumus tanpa mengubah <f>. Mengembalikan XML baru. */
export function setFormulaCache(sheetXml: string, ref: string, cacheValue: string): string {
  const p = parseRef(ref);
  const rowXml = getRowXml(sheetXml, p.row);
  if (!rowXml) return sheetXml;
  const cell = extractCells(rowXml).find((c) => c.ref === ref);
  if (!cell || !cell.hasFormula) return sheetXml;
  const newFull = cell.full.replace(/<v>[\s\S]*?<\/v>/, `<v>${cacheValue}</v>`);
  if (newFull === cell.full) {
    // tidak ada <v> (mis. stub tanpa nilai) -> selipkan sebelum </c> atau <f/>
    if (cell.full.endsWith('/>')) return sheetXml;
    return sheetXml.replace(cell.full, cell.full.replace(/<\/c>$/, `<v>${cacheValue}</v></c>`));
  }
  return sheetXml.replace(cell.full, newFull);
}

export function writeCellIntoSheetXml(
  sheetXml: string, cellXml: string, ref: string,
  opts?: { allowFormulaOverwrite?: boolean },
): string {
  const p = parseRef(ref);
  const rowXml = getRowXml(sheetXml, p.row);
  if (!rowXml) return sheetXml;
  const cells = extractCells(rowXml);
  const ex = cells.find((c) => c.ref === ref);
  if (ex && ex.hasFormula && !opts?.allowFormulaOverwrite) return sheetXml;
  if (ex) return sheetXml.replace(ex.full, cellXml);
  const after = cells.find((c) => {
    const cm = c.ref.match(/^([A-Z]+)\d+$/);
    return cm ? columnLetterToIndex(cm[1]) > p.col : false;
  });
  if (after) return sheetXml.replace(after.full, cellXml + after.full);
  const ci = sheetXml.indexOf('</row>', sheetXml.indexOf(rowXml));
  if (ci < 0) return sheetXml;
  return sheetXml.slice(0, ci) + cellXml + sheetXml.slice(ci);
}

export function clearRowKeepFormulas(sheetXml: string, row: number): string {
  const rowXml = getRowXml(sheetXml, row);
  if (!rowXml) return sheetXml;
  let xml = sheetXml;
  for (const c of extractCells(rowXml)) {
    if (c.hasFormula) {
      if (/<v>[\s\S]*?<\/v>/.test(c.full)) {
        const emptied = c.full.replace(/<v>[\s\S]*?<\/v>/, '<v></v>');
        if (emptied !== c.full) xml = xml.replace(c.full, emptied);
      }
      continue;
    }
    const sAttr = c.s !== undefined ? ` s="${c.s}"` : '';
    xml = xml.replace(c.full, `<c r="${c.ref}"${sAttr}/>`);
  }
  return xml;
}

export function readCellText(xml: string, shared: string[], ref: string): string | null {
  const p = parseRef(ref);
  const rowXml = getRowXml(xml, p.row);
  if (!rowXml) return null;
  const c = extractCells(rowXml).find((x) => x.ref === ref);
  if (!c || c.value === undefined) return c?.formula ? '[rumus]' : null;
  if (c.t === 's') return shared[parseInt(c.value, 10)] ?? null;
  return c.value;
}

/** ID tampilan yang dihasilkan rumus template untuk baris data. */
export function idUmatUntukBaris(row: number): string {
  return 'UM' + String(row - 1).padStart(5, '0');
}
export function idKkUntukBaris(row: number): string {
  return 'KK' + String(row - 1).padStart(4, '0');
}

export const MAKS_BARIS_UMAT = 2000;
export const MAKS_BARIS_KK = 500;

/**
 * Nomor urut rekaman dari ID-nya, mis. 'UM00012' → 12.
 * Dipakai untuk memetakan rekaman ke baris yang sama dengan ID-nya, sehingga
 * penghapusan di tengah TIDAK menggeser ID rekaman lain (asumsi A4).
 */
export function nomorBarisDariId(id: string): number | null {
  const m = /(\d+)$/.exec(id);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

/**
 * Susun peta baris → rekaman. Rekaman dengan ID yang tidak dapat diurai
 * (ID non-standar) ditempatkan setelah baris terisi terakhir, tidak dibuang.
 */
export function petakanBaris<T extends { id: string }>(
  daftar: T[],
  maksBaris: number,
): Map<number, T> {
  const peta = new Map<number, T>();
  const tanpaNomor: T[] = [];

  for (const rekam of daftar) {
    const n = nomorBarisDariId(rekam.id);
    if (n === null || n > maksBaris) {
      tanpaNomor.push(rekam);
      continue;
    }
    if (!peta.has(n)) peta.set(n, rekam);
  }

  if (tanpaNomor.length > 0) {
    let baris = Math.max(0, ...peta.keys());
    for (const rekam of tanpaNomor) {
      baris += 1;
      if (baris > maksBaris) break;
      peta.set(baris, rekam);
    }
  }
  return peta;
}

/** Perbarui cache <v> sel berumus TANPA menyentuh <f> (aman untuk pratinjau). */
export function setFormulaCacheValue(sheetXml: string, ref: string, cacheV: string): string {
  const p = parseRef(ref);
  const rowXml = getRowXml(sheetXml, p.row);
  if (!rowXml) return sheetXml;
  const cell = extractCells(rowXml).find((x) => x.ref === ref);
  if (!cell || !cell.hasFormula) return sheetXml;
  const safe = xmlEscape(cacheV);
  const next = /<v>[\s\S]*?<\/v>/.test(cell.full)
    ? cell.full.replace(/<v>[\s\S]*?<\/v>/, `<v>${safe}</v>`)
    : cell.full.replace(/<\/c>$/, `<v>${safe}</v></c>`);
  return sheetXml.replace(cell.full, next);
}

export interface TemplateStyles {
  umatHeader: number; umatText: number; umatTextCenter: number; umatDate: number;
  umatStatus: number; kkText: number; rekapNama: number; rekapAngka: number;
}

export const DEFAULT_STYLES: TemplateStyles = {
  umatHeader: 7, umatText: 8, umatTextCenter: 9, umatDate: 10,
  umatStatus: 8, kkText: 8, rekapNama: 18, rekapAngka: 19,
};

export function readStyleAt(xml: string, ref: string): number | null {
  const m = xml.match(new RegExp('<c r="' + ref + '"([^>]*)>'));
  if (!m) return null;
  const s = m[1].match(/s="(\d+)"/);
  return s ? parseInt(s[1], 10) : null;
}

export function expandSheetToColumn(xml: string, newCol: 'AA' | 'L'): string {
  if (newCol === 'AA') {
    if (!xml.match(/min="27"/)) {
      const z = xml.match(/<col[^>]*min="26"[^>]*>/);
      const wm = z ? z[0].match(/width="([^"]+)"/) : null;
      const w = wm ? wm[1] : '18.0';
      xml = xml.replace(/<\/cols>/, `<col customWidth="1" min="27" max="27" width="${w}"/></cols>`);
    }
    xml = xml.replace(/\$A\$1:\$Z\$2001/g, '$A$1:$AA$2001');
  } else {
    if (!xml.match(/min="12"/)) {
      const k = xml.match(/<col[^>]*min="11"[^>]*>/);
      const wm = k ? k[0].match(/width="([^"]+)"/) : null;
      const w = wm ? wm[1] : '18.0';
      xml = xml.replace(/<\/cols>/, `<col customWidth="1" min="12" max="12" width="${w}"/></cols>`);
    }
    xml = xml.replace(/\$A\$1:\$K\$501/g, '$A$1:$L$501');
  }
  return xml;
}
export async function patchTemplate(
  templateBuffer: ArrayBuffer, umat: Umat[], kkList: Kk[], settings: Settings,
): Promise<Uint8Array> {
  const zip = await JSZip.loadAsync(templateBuffer);
  const wbXml = await zip.file('xl/workbook.xml')!.async('text');
  const wbRels = await zip.file('xl/_rels/workbook.xml.rels')!.async('text');
  const relMap: Record<string, string> = {};
  let rmm: RegExpExecArray | null;
  const relRe = /<Relationship Id="([^"]+)"[^>]*Target="([^"]+)"/g;
  while ((rmm = relRe.exec(wbRels)) !== null) relMap[rmm[1]] = rmm[2];
  const fileByName: Record<string, string> = {};
  let smm: RegExpExecArray | null;
  const shRe = /<sheet [^>]*name="([^"]+)"[^>]*r:id="([^"]+)"[^>]*\/?>/g;
  while ((smm = shRe.exec(wbXml)) !== null) {
    const t = relMap[smm[2]] || smm[2];
    fileByName[smm[1]] = t.startsWith('xl/') ? t : 'xl/' + t;
  }
  let ssXml = await zip.file('xl/sharedStrings.xml')!.async('text');
  const cache = new Map<string, number>();
  const intern = (t: string): number => {
    const hit = cache.get(t);
    if (hit !== undefined) return hit;
    const r = getOrAddSharedString(ssXml, t);
    ssXml = r.xml;
    cache.set(t, r.idx);
    return r.idx;
  };
  const idxKUB = intern('KUB');
  const idxLing = intern(settings.namaLingkungan);
  for (const u of umat) {
    intern(u.id); intern(u.nama); intern(u.jenisKelamin); intern(u.agama); intern(u.status);
    intern(u.idKK);
    if (u.KUB) intern(u.KUB); else intern('');
  }
  for (const k of kkList) {
    intern(k.namaKepalaKeluarga); intern(k.alamat);
    if (k.KUB) intern(k.KUB);
  }
  const umatFile = fileByName['DATA UMAT'];
  const kkFile = fileByName['DATA KK'];
  const rekapFile = fileByName['REKAP LINGKUNGAN'];
  let umatXml = umatFile ? await zip.file(umatFile)!.async('text') : '';
  let kkXml = kkFile ? await zip.file(kkFile)!.async('text') : '';
  const rekapXml0 = rekapFile ? await zip.file(rekapFile)!.async('text') : '';
  const st: TemplateStyles = { ...DEFAULT_STYLES };
  const grab = (x: string, r: string, key: keyof TemplateStyles): void => {
    const v = readStyleAt(x, r);
    if (v !== null) st[key] = v;
  };
  grab(umatXml, 'Z1', 'umatHeader'); grab(umatXml, 'C2', 'umatText');
  grab(umatXml, 'D2', 'umatTextCenter'); grab(umatXml, 'E2', 'umatDate');
  grab(umatXml, 'K2', 'umatStatus'); grab(kkXml, 'B2', 'kkText');
  grab(rekapXml0, 'A5', 'rekapNama'); grab(rekapXml0, 'B5', 'rekapAngka');
  void rekapFile;
  void rekapXml0;
  let rekapXml = rekapXml0;
  if (umatFile) {
    umatXml = writeCellIntoSheetXml(umatXml, buildSharedCell('AA1', st.umatHeader, idxKUB), 'AA1');
    const barisUmat = petakanBaris(umat, MAKS_BARIS_UMAT);
    const tanggalAcuan = settings.tanggalAcuan || `31/12/${settings.tahunStatistik}`;
    for (const [nomor, u] of barisUmat) {
      const row = 1 + nomor;
      const put = (col: string, s: number, idx: number): void => {
        umatXml = writeCellIntoSheetXml(umatXml, buildSharedCell(col + row, s, idx), col + row);
      };
      // A: tulis ID sesuai rumus baris ("UMxxxxx"). Bila sel template adalah
      // rumus (baris >=3), JANGAN timpa — perbarui cache-nya saja.
      const idText = idUmatUntukBaris(row);
      const rxA = getRowXml(umatXml, row);
      const cellA = rxA ? extractCells(rxA).find((x) => x.ref === 'A' + row) : undefined;
      if (cellA && cellA.hasFormula) umatXml = setFormulaCacheValue(umatXml, 'A' + row, idText);
      else umatXml = writeCellIntoSheetXml(umatXml,
        buildSharedCell('A' + row, st.umatTextCenter, intern(idText)), 'A' + row);
      put('B', st.umatText, intern(u.idKK));
      put('C', st.umatText, intern(u.nama));
      put('D', st.umatTextCenter, intern(u.jenisKelamin));
      if (u.tanggalLahir) {
        const d = parseTanggalIndonesia(u.tanggalLahir);
        if (d) umatXml = writeCellIntoSheetXml(umatXml,
          buildNumberCell('E' + row, st.umatDate, String(dateToExcelSerial(d))), 'E' + row);
        const umur = hitungUmur(u.tanggalLahir, tanggalAcuan);
        if (umur !== null) umatXml = setFormulaCacheValue(umatXml, 'F' + row, String(umur));
        else umatXml = setFormulaCacheValue(umatXml, 'F' + row, '');
      } else {
        umatXml = setFormulaCacheValue(umatXml, 'F' + row, '');
      }
      put('G', st.umatTextCenter, intern(u.agama));
      umatXml = writeCellIntoSheetXml(umatXml, buildSharedCell('H' + row, st.umatTextCenter, idxLing), 'H' + row);
      put('K', st.umatStatus, intern(u.status));
      umatXml = writeCellIntoSheetXml(umatXml, buildSharedCell('AA' + row, st.umatHeader, intern(u.KUB || '')), 'AA' + row);
    }
    const present = (umatXml.match(/<row [^>]*r="/g) || []).length;
    const barisTertinggi = barisUmat.size > 0 ? Math.max(...barisUmat.keys()) : 1;
    const lastClear = Math.min(Math.max(present, 1 + barisTertinggi), MAKS_BARIS_UMAT + 1);
    for (let row = 2; row <= lastClear; row++) {
      if (barisUmat.has(row - 1)) continue;
      const rx = getRowXml(umatXml, row);
      if (!rx || !rx.includes('<c ')) continue;
      umatXml = clearRowKeepFormulas(umatXml, row);
    }
    umatXml = expandSheetToColumn(umatXml, 'AA');
    zip.file(umatFile, umatXml);
    if (zip.file('xl/tables/table2.xml')) {
      let tx = await zip.file('xl/tables/table2.xml')!.async('text');
      tx = tx.replace(/ref="[^"]*"/, 'ref="A1:AA2001"');
      tx = tx.replace(/(<tableColumns count=")(\d+)(")/, (_a, a, c, b) => a + (parseInt(c, 10) + 1) + b);
      if (!tx.includes('name="KUB"')) tx = tx.replace(/<\/tableColumns>/, '<tableColumn id="27" name="KUB"/></tableColumns>');
      zip.file('xl/tables/table2.xml', tx);
    }
  }
  if (kkFile) {
    kkXml = writeCellIntoSheetXml(kkXml, buildSharedCell('L1', st.umatHeader, idxKUB), 'L1');
    const barisKk = petakanBaris(kkList, MAKS_BARIS_KK);
    for (const [nomor, k] of barisKk) {
      const row = 1 + nomor;
      // A = sel rumus template (JANGAN ditimpa): perbarui cache "KKxxxx" saja.
      kkXml = setFormulaCacheValue(kkXml, 'A' + row, idKkUntukBaris(row));
      kkXml = writeCellIntoSheetXml(kkXml, buildSharedCell('B' + row, st.kkText, intern(k.namaKepalaKeluarga)), 'B' + row);
      kkXml = writeCellIntoSheetXml(kkXml, buildSharedCell('C' + row, st.kkText, intern(k.alamat)), 'C' + row);
      kkXml = writeCellIntoSheetXml(kkXml, buildSharedCell('E' + row, st.kkText, idxLing), 'E' + row);
      kkXml = writeCellIntoSheetXml(kkXml, buildSharedCell('L' + row, st.umatHeader, intern(k.KUB || '')), 'L' + row);
    }
    const present = (kkXml.match(/<row [^>]*r="/g) || []).length;
    const barisTertinggi = barisKk.size > 0 ? Math.max(...barisKk.keys()) : 1;
    const lastClear = Math.min(Math.max(present, 1 + barisTertinggi), MAKS_BARIS_KK + 1);
    for (let row = 2; row <= lastClear; row++) {
      if (barisKk.has(row - 1)) continue;
      const rx = getRowXml(kkXml, row);
      if (!rx || !rx.includes('<c ')) continue;
      kkXml = clearRowKeepFormulas(kkXml, row);
    }
    kkXml = expandSheetToColumn(kkXml, 'L');
    zip.file(kkFile, kkXml);
    if (zip.file('xl/tables/table1.xml')) {
      let tx = await zip.file('xl/tables/table1.xml')!.async('text');
      tx = tx.replace(/ref="[^"]*"/, 'ref="A1:L501"');
      tx = tx.replace(/(<tableColumns count=")(\d+)(")/, (_a, a, c, b) => a + (parseInt(c, 10) + 1) + b);
      if (!tx.includes('name="KUB"')) tx = tx.replace(/<\/tableColumns>/, '<tableColumn id="12" name="KUB"/></tableColumns>');
      zip.file('xl/tables/table1.xml', tx);
    }
  }
  if (rekapFile) {
    rekapXml = writeCellIntoSheetXml(rekapXml, buildSharedCell('A5', st.rekapNama, idxLing), 'A5');
    const newC5 = `<c r="C5" s="${st.rekapAngka}" t="str"><f>${xmlEscape(RUMUS_JIWA_AKTIF)}</f><v></v></c>`;
    rekapXml = writeCellIntoSheetXml(rekapXml, newC5, 'C5', { allowFormulaOverwrite: true });
    zip.file(rekapFile, rekapXml);
    // Cache pratinjau dari mesin: KK = jumlah KK tertulis, Jiwa = Status Aktif.
    const jiwaAktif = umat.filter((u) => isStatusAktif(u.status)).length;
    let rx2 = await zip.file(rekapFile)!.async('text');
    rx2 = setFormulaCacheValue(rx2, 'B5', String(Math.min(kkList.length, 500)));
    rx2 = setFormulaCacheValue(rx2, 'C5', String(jiwaAktif));
    zip.file(rekapFile, rx2);
  }
  let newWb = wbXml;
  if (/<calcPr[^>]*\/>/.test(newWb)) newWb = newWb.replace(/<calcPr[^>]*\/>/, '<calcPr fullCalcOnLoad="1"/>');
  else if (/<calcPr[^>]*>/.test(newWb)) newWb = newWb.replace(/<calcPr[^>]*>/, '<calcPr fullCalcOnLoad="1">');
  else newWb = newWb.replace(/<\/workbook>/, '<calcPr fullCalcOnLoad="1"/></workbook>');
  // Perluas definedName filter WPS: $Z->$AA dan $K->$L (hanya akhir range).
  newWb = newWb.split("'DATA UMAT'!$A$1:$Z$2001").join("'DATA UMAT'!$A$1:$AA$2001");
  newWb = newWb.split("'DATA KK'!$A$1:$K$501").join("'DATA KK'!$A$1:$L$501");
  zip.file('xl/workbook.xml', newWb);
  zip.file('xl/sharedStrings.xml', ssXml);
  return await zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' });
}




