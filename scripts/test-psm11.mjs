import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
const img='D:/APPMI/docs/BERKAS UMAT MARIA IMMACULATA TIAP KUB/BERKAS UMAT KUB 1/KK/CHRISTINA SELFANI RUNTU -KARTU KELUARGA.jpg';
const buf=await sharp(img).resize({width:2400,fit:'inside',kernel:'lanczos3'}).toBuffer();
const w=await createWorker('ind'); await w.setParameters({tessedit_pageseg_mode:'11'});
const r=await w.recognize(buf);
console.log('conf',r.data.confidence,'len',(r.data.text||'').length);
console.log(r.data.text);
await w.terminate();
