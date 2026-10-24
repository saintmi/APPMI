import JSZip from 'jszip';
import fs from 'node:fs';
import { getRowXml, extractCells, writeCellIntoSheetXml, buildSharedCell, getOrAddSharedString } from '../src/export/template-patcher.ts';

const buf = fs.readFileSync('D:/APPMI/public/template/Form_Statistik_Umat.xlsx');
const zip = await JSZip.loadAsync(buf);
let ux = await zip.file('xl/worksheets/sheet4.xml').async('text');
let ssXml = await zip.file('xl/sharedStrings.xml').async('text');
const cache = new Map();
const intern = (t) => {
  if (cache.has(t)) return cache.get(t);
  const r = getOrAddSharedString(ssXml, t);
  ssXml = r.xml; cache.set(t, r.idx); return r.idx;
};
ux = writeCellIntoSheetXml(ux, buildSharedCell('AA1', 7, intern('KUB')), 'AA1');
console.log('AA1 ok: ' + getRowXml(ux, 1).includes('AA1'));
const idxA2 = intern('0001000');
console.log('idxA2=' + idxA2);
ux = writeCellIntoSheetXml(ux, buildSharedCell('A2', 9, idxA2), 'A2');
console.log('A2 new? ' + getRowXml(ux, 2).includes('<v>' + idxA2 + '</v>'));
console.log('A2 cell: ' + (getRowXml(ux, 2).match(/<c r="A2"[^>]*>[\s\S]*?<\/c>|<c r="A2"[^/]*\/>/) || ['NOT FOUND'])[0]);
ux = writeCellIntoSheetXml(ux, buildSharedCell('B2', 8, intern('KK0001')), 'B2');
console.log('B2 cell: ' + (getRowXml(ux, 2).match(/<c r="B2"[^>]*>[\s\S]*?<\/c>|<c r="B2"[^/]*\/>/) || ['NOT FOUND'])[0]);
console.log('A2 still: ' + (getRowXml(ux, 2).match(/<c r="A2"[^>]*>[\s\S]*?<\/c>|<c r="A2"[^/]*\/>/) || ['NOT FOUND'])[0]);
console.log('count A2 in sheet: ' + (ux.match(/<c r="A2"/g) || []).length);
