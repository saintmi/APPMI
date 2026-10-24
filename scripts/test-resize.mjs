import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
const img='D:/APPMI/docs/BERKAS UMAT MARIA IMMACULATA TIAP KUB/BERKAS UMAT KUB 1/KK/CHRISTINA SELFANI RUNTU -KARTU KELUARGA.jpg';
for(const w of [1800,2400,3200]){
  const buf=await sharp(img).resize({width:w,fit:'inside',kernel:'lanczos3'}).toBuffer();
  const worker=await createWorker('ind'); await worker.setParameters({tessedit_pageseg_mode:'6'});
  const r=await worker.recognize(buf);
  const t=r.data.text||'';
  console.log('width',w,'conf',r.data.confidence,'len',t.length);
  for(const line of t.split('\n')) if(/No\.?\s*KK|Nomor|Kartu Keluarga/i.test(line)) console.log('   ',line.trim().slice(0,200));
  await worker.terminate();
}
