import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import fs from 'node:fs';
const dir = 'D:/APPMI/docs/BERKAS UMAT MARIA IMMACULATA TIAP KUB/BERKAS UMAT KUB 1/KK';
const img = dir + '/' + fs.readdirSync(dir)[0];
const variants = {
  original: null,
  gray_norm: (s)=>s.grayscale().normalize(),
  gray_sharp: (s)=>s.grayscale().sharpen(),
  upscale_gray: (s)=>s.grayscale().resize({width:2400,fit:'inside'}).normalize().sharpen(),
  threshold: (s)=>s.grayscale().normalize().threshold(150),
};
for (const [name, fn] of Object.entries(variants)) {
  const out = 'D:/APPMI/scripts/v_'+name+'.png';
  let s = sharp(img);
  if (fn) s = fn(s);
  await s.toFile(out);
  const worker = await createWorker('ind');
  await worker.setParameters({ tessedit_pageseg_mode: '6' });
  const { data } = await worker.recognize(out);
  console.log(name, 'CONF', data.confidence.toFixed(1), 'LEN', data.text.length);
  await worker.terminate();
}
