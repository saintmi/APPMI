import fs from 'node:fs';
const data = JSON.parse(fs.readFileSync('D:/APPMI/scripts/scan-results.json','utf8'));
const snapshot = JSON.parse(fs.readFileSync('D:/APPMI/seed-snapshot.json','utf8'));
const appUmat = snapshot.umat||[];
const appKk = snapshot.kk||[];
// group app umat by idKK (strip KK)
const groups = new Map();
for(const u of appUmat){
  const key = String(u.idKK||'').replace(/^KK/i,'');
  if(!groups.has(key)) groups.set(key,[]);
  groups.get(key).push(u);
}
function norm(s){return (s||'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function levenshtein(a,b){
  if(a===b) return 0; if(!a.length) return b.length; if(!b.length) return a.length;
  let prev=Array.from({length:b.length+1},(_,i)=>i);
  for(let i=1;i<=a.length;i++){
    let cur=[i]; let min=cur[0];
    for(let j=1;j<=b.length;j++){
      const cost=a[i-1]===b[j-1]?0:1;
      cur[j]=Math.min(prev[j]+1, cur[j-1]+1, prev[j-1]+cost);
      if(cur[j]<min) min=cur[j];
    }
    prev=cur;
  }
  return prev[b.length];
}
function sim(a,b){
  const na=norm(a), nb=norm(b);
  if(!na||!nb) return 0;
  if(na===nb) return 1;
  if(na.includes(nb)||nb.includes(na)) return 0.9;
  const d=levenshtein(na,nb);
  return 1 - d/Math.max(na.length,nb.length);
}
function bestMatch(name, candidates){
  let best=null, bestScore=0;
  for(const c of candidates){
    const s=sim(name, c.nama);
    if(s>bestScore){bestScore=s;best=c;}
  }
  return {best,bestScore};
}
function findAppGroup(r){
  if(r.nomorKK && groups.has(r.nomorKK) && r.nomorKK.length===16) return {key:r.nomorKK, members:groups.get(r.nomorKK), source:'nomorKK'};
  // by head name fuzzy, skip catch-all group
  let bestKey=null, bestScore=0;
  for(const [key,members] of groups){
    if(!key || key.length!==16) continue;
    for(const m of members){
      const s=sim(r.namaKepalaKeluarga, m.nama);
      if(s>bestScore){bestScore=s;bestKey=key;}
    }
  }
  if(bestScore>=0.8) return {key:bestKey, members:groups.get(bestKey), source:'nama kepala (fuzzy)'};
  return null;
}
const readable = data.filter(r=>r.nomorKK);
const unreadable = data.filter(r=>!r.nomorKK);
const lines=[];
const push=s=>lines.push(s);
push('# Laporan Gap Data KK - 72 Terbaca vs 41 Tidak Terbaca');
push('');
push('Total KK: '+data.length+' | Terbaca (ada nomor KK): '+readable.length+' | Tidak terbaca: '+unreadable.length);
push('');
push('## Daftar 72 KK yang terbaca (nomor KK terbaca)');
push('');
for(const r of readable.sort((a,b)=>a.kub.localeCompare(b.kub)||a.file.localeCompare(b.file))){
  push('- '+r.kub+' | `'+r.file+'` | No.KK: '+r.nomorKK+' | Kepala: '+(r.namaKepalaKeluarga||'-'));
}
push('');
push('## Daftar 41 KK yang tidak terbaca (nomor KK tidak terbaca)');
push('');
for(const r of unreadable.sort((a,b)=>a.kub.localeCompare(b.kub)||a.file.localeCompare(b.file))){
  push('- '+r.kub+' | `'+r.file+'` | Kepala terbaca: '+(r.namaKepalaKeluarga||'-')+' | conf: '+r.confidence);
}
push('');
push('## Data matching 72 KK terbaca dengan data aplikasi');
push('');
let found=0, notfound=0, totalAppMembers=0, totalScanMembers=0;
const allGapsHead=[];
const allMissingInScan=[]; // app members not in scan
const allExtraInScan=[]; // scan members not in app
for(const r of readable.sort((a,b)=>a.kub.localeCompare(b.kub)||a.file.localeCompare(b.file))){
  const g = findAppGroup(r);
  push('### '+r.kub+' - '+r.file);
  push('');
  push('- No.KK (scan): '+r.nomorKK);
  push('- Kepala (scan): '+(r.namaKepalaKeluarga||'-'));
  if(!g){
    notfound++; push('- App: **TIDAK DITEMUKAN** di data aplikasi'); push(''); continue;
  }
  found++;
  const appMembers=g.members;
  totalAppMembers+=appMembers.length; totalScanMembers+=r.members.length;
  // head match: find app kk by name
  const appKkMatch = appKk.find(k=>sim(k.namaKepalaKeluarga, r.namaKepalaKeluarga)>=0.75);
  push('- App: ditemukan via '+g.source+' (key '+g.key+') | app members: '+appMembers.length+' | scan members: '+r.members.length);
  if(appKkMatch) push('- Kepala app: '+appKkMatch.namaKepalaKeluarga+' (similarity '+sim(appKkMatch.namaKepalaKeluarga, r.namaKepalaKeluarga).toFixed(2)+')');
  else { push('- Kepala app: **TIDAK COCOK** (terbaca: '+r.namaKepalaKeluarga+')'); allGapsHead.push(r.kub+' | `'+r.file+'` | scan: '+(r.namaKepalaKeluarga||'-')); }
  // member matching
  const matchedApp=new Set(); const matchedScan=new Set();
  const pairs=[];
  for(let i=0;i<r.members.length;i++){
    const m=r.members[i];
    const {best,bestScore}=bestMatch(m.nama, appMembers);
    if(best && bestScore>=0.7){ matchedScan.add(i); const idx=appMembers.indexOf(best); matchedApp.add(idx); pairs.push({scan:m.nama, app:best.nama, score:bestScore}); }
  }
  const missingInScan = appMembers.filter((m,idx)=>!matchedApp.has(idx));
  const extraInScan = r.members.filter((m,idx)=>!matchedScan.has(idx));
  if(missingInScan.length){ for(const m of missingInScan) allMissingInScan.push(r.kub+' | `'+r.file+'` | '+m.nama); }
  if(extraInScan.length){ for(const m of extraInScan) allExtraInScan.push(r.kub+' | `'+r.file+'` | '+m.nama); }
  push('');
  if(pairs.length){
    push('Anggota cocok:');
    for(const p of pairs) push('  - '+p.scan+'  <=>  '+p.app+'  (sim '+p.score.toFixed(2)+')');
  } else push('Anggota cocok: (tidak ada)');
  if(missingInScan.length){
    push('Anggota di app tapi TIDAK di scan:');
    for(const m of missingInScan) push('  - '+m.nama);
  }
  if(extraInScan.length){
    push('Anggota di scan tapi TIDAK di app:');
    for(const m of extraInScan) push('  - '+m.nama);
  }
  if(!missingInScan.length && !extraInScan.length && r.members.length===appMembers.length) push('  (jumlah & nama anggota cocok)');
  push('');
}
push('## Ringkasan matching');
push('');
push('- KK terbaca yang cocok dengan app: **'+found+'** / '+readable.length);
push('- KK terbaca tidak ditemukan di app: **'+notfound+'**');
push('- Total anggota (app) pada KK cocok: '+totalAppMembers);
push('- Total anggota (scan): '+totalScanMembers);
push('');
push('## Gap kepala keluarga (nama tidak cocok) - '+allGapsHead.length);
push('');
for(const g of allGapsHead) push('- '+g);
push('');
push('## Gap anggota: ada di app, tidak terbaca di scan - '+allMissingInScan.length);
push('');
for(const g of allMissingInScan) push('- '+g);
push('');
push('## Gap anggota: terbaca di scan, tidak ada di app - '+allExtraInScan.length);
push('');
for(const g of allExtraInScan) push('- '+g);
push('');
const out='D:/APPMI/LAPORAN_GAP_KK.md';
fs.writeFileSync(out, lines.join('\n'));
console.log('written', lines.length, 'lines to', out);
