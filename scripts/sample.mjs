import { createWorker } from 'tesseract.js';
import fs from 'node:fs';
const base='D:/APPMI/docs/BERKAS UMAT MARIA IMMACULATA TIAP KUB';
for (const k of [1,2]) {
  const dir=base+'/BERKAS UMAT KUB '+k+'/KK';
  const files=fs.readdirSync(dir).slice(0,2);
  for (const f of files) {
    const img=dir+'/'+f;
    const worker=await createWorker('ind');
    await worker.setParameters({tessedit_pageseg_mode:'6'});
    const {data}=await worker.recognize(img);
    fs.writeFileSync('D:/APPMI/scripts/sample_'+k+'_'+f.replace(/[^a-z0-9]/gi,'_')+'.txt', data.text);
    console.log(k, f, 'CONF', data.confidence.toFixed(1), 'NIKs', (data.text.match(/\d{16}/g)||[]).length);
    await worker.terminate();
  }
}
