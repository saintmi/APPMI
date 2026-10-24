import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync('D:/APPMI/scripts/scan-results.json','utf8'));
const snapshot = JSON.parse(fs.readFileSync('D:/APPMI/seed-snapshot.json','utf8'));
const lines=[];
const push=s=>lines.push(s);
push('# Laporan Scan Kartu Keluarga (KK) - KUB 1–4');
push('');
push('Sumber: foto KK di `New folder (2)`, OCR tesseract.js (ind), peningkatan via sharp (eksperimen).');
push('Total file KK dipindai: **'+data.length+'**');
push('');
// summary per KUB
const kubs=[...new Set(data.map(d=>d.kub))].sort();
push('## Ringkasan per KUB');
push('');
push('| KUB | Jumlah KK | Rata-rata confidence | Nomor KK terbaca | Nama kepala terbaca | Filename cocok |');
push('|---|---:|---:|---:|---:|---:|');
for(const k of kubs){
  const sub=data.filter(d=>d.kub===k);
  const avg=(sub.reduce((a,b)=>a+b.confidence,0)/sub.length).toFixed(1);
  const nom=sub.filter(d=>d.nomorKK).length;
  const nama=sub.filter(d=>d.namaKepalaKeluarga).length;
  const match=sub.filter(d=>d.filenameMatchHead===true).length;
  push('| '+k+' | '+sub.length+' | '+avg+' | '+nom+'/'+sub.length+' | '+nama+'/'+sub.length+' | '+match+'/'+sub.length+' |');
}
push('');
push('Total anggota terbaca: **'+data.reduce((a,b)=>a+b.members.length,0)+'** (rata-rata '+ (data.reduce((a,b)=>a+b.members.length,0)/data.length).toFixed(2)+' per KK).');
push('');
// filename match summary
const fmTrue=data.filter(d=>d.filenameMatchHead===true).length;
const fmFalse=data.filter(d=>d.filenameMatchHead===false).length;
const fmNull=data.filter(d=>d.filenameMatchHead===null).length;
push('## Kecocokan nama file vs nama kepala keluarga');
push('');
push('- Cocok: **'+fmTrue+'**');
push('- Tidak cocok: **'+fmFalse+'**');
push('- Tidak dapat dinilai (nama kepala tidak terbaca): **'+fmNull+'**');
push('');
if(fmFalse){
  push('### Daftar tidak cocok (filename ≠ kepala)');
  push('');
  for(const r of data.filter(d=>d.filenameMatchHead===false)){
    push('- `'+r.file+'` -> terbaca: **'+r.namaKepalaKeluarga+'**');
  }
  push('');
}
// app match
push('## Perbandingan dengan data aplikasi (seed-snapshot)');
push('');
const appKk=snapshot.kk||[];
const appUmat=snapshot.umat||[];
push('Data aplikasi: '+appKk.length+' KK, '+appUmat.length+' anggota.');
push('');
let appFound=0, appNotFound=0;
for(const r of data){ if(r.appMatch&&r.appMatch.appKkFound) appFound++; else appNotFound++; }
push('- KK terbaca yang cocok dengan data aplikasi (by nama kepala): **'+appFound+'**');
push('- Tidak cocok/tidak ditemukan di aplikasi: **'+appNotFound+'**');
push('');
// member count mismatches
const mism=[];
for(const r of data){
  if(r.appMatch && r.appMatch.appKkFound && r.appMatch.appMemberCount!==r.appMatch.scannedMemberCount){
    mism.push(r);
  }
}
push('KK dengan jumlah anggota berbeda (app vs scan): **'+mism.length+'**');
push('');
if(mism.length){
  push('| File | Kepala (scan) | App members | Scan members | Matched names |');
  push('|---|---|---:|---:|---:|');
  for(const r of mism){
    push('| '+r.file+' | '+ (r.namaKepalaKeluarga||'-')+' | '+r.appMatch.appMemberCount+' | '+r.appMatch.scannedMemberCount+' | '+r.appMatch.matchedMemberNames+' |');
  }
  push('');
}
// low confidence
const low=data.filter(d=>d.confidence<30).sort((a,b)=>a.confidence-b.confidence);
push('## Gambar dengan confidence rendah (<30) - '+low.length+' file');
push('');
for(const r of low){ push('- '+r.kub+' :: `'+r.file+'` (conf '+r.confidence+')'); }
push('');
// per KK detail
push('## Detail per KK');
push('');
for(const r of data){
  push('### '+r.kub+' - '+r.file);
  push('');
  push('- Confidence OCR: **'+r.confidence+'**');
  push('- Nomor KK: '+(r.nomorKK||'_(tidak terbaca)_'));
  push('- Nama Kepala Keluarga: '+(r.namaKepalaKeluarga||'_(tidak terbaca)_'));
  push('- Kecocokan nama file: '+(r.filenameMatchHead===true?'Cocok':r.filenameMatchHead===false?'**TIDAK COCOK**':'n/a'));
  push('- Alamat: '+(r.alamat||'-'));
  push('- RT/RW: '+(r.rtRw||'-')+' | Kelurahan/Desa: '+(r.kelurahan||'-')+' | Kecamatan: '+(r.kecamatan||'-'));
  push('- Kabupaten/Kota: '+(r.kabupaten||'-')+' | Provinsi: '+(r.provinsi||'-')+' | Kode Pos: '+(r.kodePos||'-'));
  push('- Tgl dikeluarkan: '+(r.tglDikeluarkan||'-'));
  if(r.appMatch){
    push('- App: '+(r.appMatch.appKkFound?'cocok (`'+r.appMatch.appKkName+'`)':'tidak ditemukan')+' | app members '+r.appMatch.appMemberCount+' vs scan '+r.appMatch.scannedMemberCount+' | matched names '+r.appMatch.matchedMemberNames);
  }
  push('');
  push('**Anggota ('+r.members.length+'):**');
  push('');
  if(r.members.length){
    push('| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |');
    push('|---|---|---|---|---|---|---|---|---|');
    for(const m of r.members){
      push('| '+(m.index||'-')+' | '+ (m.nama||'-')+' | '+ (m.nik||'-')+' | '+ (m.jenisKelamin||'-')+' | '+ ((m.tempatLahir||'')+' / '+(m.tanggalLahir||'')).trim()+' | '+ (m.agama||'-')+' | '+ (m.pendidikan||'-')+' | '+ (m.pekerjaan||'-')+' | '+ (m.statusHubungan||'-')+' |');
    }
    push('');
  } else {
    push('_(tidak ada anggota terbaca)_');
    push('');
  }
}
push('---');
push('Catatan: field yang tidak terbaca dapat diverifikasi dari `scripts/scan-results.json` (memuat teks OCR mentah per file).');
fs.writeFileSync('D:/APPMI/LAPORAN_SCAN_KK.md', lines.join('\n'));
console.log('written', lines.length, 'lines');
