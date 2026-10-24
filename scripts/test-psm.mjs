import { createWorker } from 'tesseract.js';
import fs from 'node:fs';
const dir = 'D:/APPMI/docs/BERKAS UMAT MARIA IMMACULATA TIAP KUB/BERKAS UMAT KUB 1/KK';
const img = dir + '/' + fs.readdirSync(dir)[0];
for (const psm of [3,4,6,11,12]) {
  const worker = await createWorker('ind');
  await worker.setParameters({ tessedit_pageseg_mode: String(psm) });
  const { data } = await worker.recognize(img);
  console.log('PSM', psm, 'CONF', data.confidence, 'LEN', data.text.length);
  await worker.terminate();
}
