const JSZip = require('jszip');
const fs = require('fs');
(async () => {
  const zip = await JSZip.loadAsync(fs.readFileSync('D:/APPMI/docs/output_statistik_2026_final.xlsx'));
  const relXml = await zip.file('xl/_rels/workbook.xml.rels').async('text');
  console.log('=== Isi rels (first 500 chars) ===');
  console.log(relXml.substring(0, 500));
  console.log('=== Length ===', relXml.length);
  
  const relRe = /<Relationship Id="([^"]+)"[^>]*Target="([^"]+)"/g;
  let m;
  let count = 0;
  while ((m = relRe.exec(relXml)) !== null) {
    count++;
    console.log('Match:', m[1], '->', m[2]);
  }
  console.log('Total matches:', count);
})();
