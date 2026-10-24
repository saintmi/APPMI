import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
import fs from 'node:fs';
const img='D:/APPMI/docs/BERKAS UMAT MARIA IMMACULATA TIAP KUB/BERKAS UMAT KUB 1/KK/JULIANA BR GINTING-KARTU KELUARGA.jpg';
const variants={
  original: await sharp(img).toBuffer(),
  up2: await sharp(img).resize({width:2000,fit:'inside',kernel:'lanczos3'}).toBuffer(),
  grayNorm: await sharp(img).grayscale().normalize().sharpen().toBuffer(),
  up2gray: await sharp(img).resize({width:2400,fit:'inside',kernel:'lanczos3'}).grayscale().normalize().sharpen().toBuffer(),
};
const worker=await createWorker('ind');
await worker.setParameters({tessedit_pageseg_mode:'6'});
for(const [name,buf] of Object.entries(variants)){
  const r=await worker.recognize(buf);
  console.log('===',name,'conf',r.data.confidence,'len', (r.data.text||'').length);
  console.log((r.data.text||'').slice(0,300).replace(/\n/g,' | '));
}
await worker.terminate();
