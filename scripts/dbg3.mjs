import JSZip from 'jszip';
import fs from 'node:fs';
import { parseSharedStrings, readCellText } from '../src/export/template-patcher.ts';

const out = fs.readFileSync('D:/APPMI/out-test.xlsx');
const z = await JSZip.loadAsync(out);
const ss = parseSharedStrings(await z.file('xl/sharedStrings.xml').async('text'));
const ux = await z.file('xl/worksheets/sheet4.xml').async('text');
const r3 = ux.match(/<row [^>]*r="3"[^>]*>([\s\S]*?)<\/row>/);
console.log('ROW3 len=' + (r3 ? r3[0].length : -1));
console.log((r3 ? r3[0] : 'NONE').slice(0, 3000));
console.log('A3 text=' + JSON.stringify(readCellText(ux, ss, 'A3')));
console.log('AA3 text=' + JSON.stringify(readCellText(ux, ss, 'AA3')));
console.log('idx Maria Test=' + ss.indexOf('Maria Test'));
console.log('idx 0002=' + ss.indexOf('0002'));
