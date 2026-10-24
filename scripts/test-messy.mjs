import sharp from 'sharp';
import { createWorker } from 'tesseract.js';
import fs from 'node:fs';
const img='D:/APPMI/docs/BERKAS UMAT MARIA IMMACULATA TIAP KUB/BERKAS UMAT KUB 2/KK/ADRIANI TODINGAN-KARTU KELUARGA.jpg';
const variants = {
  original: null,
  gray: (s)=>s.grayscale(),
  gray_norm: (s)=>s.grayscale().normalize(),
  gray_sharp: (s)=>s.grayscale().sharpen(),
  color_norm: (s)=>s.normalize(),
};
for (const [name, fn] of Object.entries(variants)) {
  const out = 'D:/APPMI/scripts/m_'+name+'.png';
  let s = sharp(img);
  if (fn) s = fn(s);
  await s.toFile(out);
  const worker = await createWorker('ind');
  await worker.setParameters({ tessedit_pageseg_mode: '6' });
  const { data } = await worker.recognize(out);
  console.log(name, 'CONF', data.confidence.toFixed(1), 'NIKs', (data.text.match(/\d{16}/g)||[]).length, 'LEN', data.text.length);
  await worker.terminate();
}
