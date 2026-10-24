import { createWorker } from 'tesseract.js';
import sharp from 'sharp';
const img='D:/APPMI/docs/BERKAS UMAT MARIA IMMACULATA TIAP KUB/BERKAS UMAT KUB 1/KK/CHRISTINA SELFANI RUNTU -KARTU KELUARGA.jpg';
const meta=await sharp(img).metadata();
console.log('size',meta.width,meta.height);
const regions={
  topLeft: {left:0,top:0,width:Math.round(meta.width*0.35),height:Math.round(meta.height*0.25)},
  topMid: {left:Math.round(meta.width*0.3),top:0,width:Math.round(meta.width*0.4),height:Math.round(meta.height*0.25)},
  topRight: {left:Math.round(meta.width*0.65),top:0,width:Math.round(meta.width*0.35),height:Math.round(meta.height*0.25)},
};
for(const [name,reg] of Object.entries(regions)){
  const buf=await sharp(img).extract(reg).resize({width:1200,fit:'inside'}).toBuffer();
  const w=await createWorker('ind'); await w.setParameters({tessedit_pageseg_mode:'6'});
  const r=await w.recognize(buf);
  console.log('===',name,reg,'conf',r.data.confidence);
  console.log((r.data.text||'').trim().slice(0,500));
  await w.terminate();
}
