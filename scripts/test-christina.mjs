import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
const img='D:/APPMI/docs/BERKAS UMAT MARIA IMMACULATA TIAP KUB/BERKAS UMAT KUB 1/KK/CHRISTINA SELFANI RUNTU -KARTU KELUARGA.jpg';
const buf=await sharp(img).toBuffer();
const up=await sharp(img).resize({width:2600,fit:'inside',kernel:'lanczos3'}).toBuffer();
for(const [name,b] of [['orig',buf],['up',up]]){
  for(const psm of [4,6,11,12]){
    const w=await createWorker('ind');
    await w.setParameters({tessedit_pageseg_mode:String(psm)});
    const r=await w.recognize(b);
    const t=r.data.text||'';
    console.log('===',name,'PSM',psm,'conf',r.data.confidence,'len',t.length);
    // print lines containing KK / NIK-ish
    for(const line of t.split('\n')){
      if(/No\.?\s*KK|Nomor|NIK|CHRISTINA/i.test(line)) console.log('   ',line.trim().slice(0,160));
    }
    await w.terminate();
  }
}
