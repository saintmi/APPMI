import fs from 'node:fs';
import { parseKkFields, parseMembers, filenameMatches, norm } from './kk-parser.mjs';
const data = JSON.parse(fs.readFileSync('D:/APPMI/scripts/scan-results.json','utf8'));
const snapshot = JSON.parse(fs.readFileSync('D:/APPMI/seed-snapshot.json','utf8'));
const appKk = snapshot.kk||[];
const appUmat = snapshot.umat||[];
const appUmatByKk = new Map();
for(const u of appUmat){ if(!u.idKK) continue; const key=String(u.idKK).replace(/^KK/i,''); if(!appUmatByKk.has(key)) appUmatByKk.set(key,[]); appUmatByKk.get(key).push(u); }
function findAppUmatGroup(headName){
  const n=norm(headName);
  if(!n) return [];
  for(const [key,members] of appUmatByKk){
    if(members.some(m=>{const mn=norm(m.nama); return mn===n || (mn.length>6 && (mn.includes(n)||n.includes(mn)));})) return members;
  }
  return [];
}
function findAppKk(nama){ const n=norm(nama); if(!n) return null; let r=appKk.find(k=>norm(k.namaKepalaKeluarga)===n); if(r) return r; r=appKk.find(k=>{const kn=norm(k.namaKepalaKeluarga); return kn.includes(n)||n.includes(kn);}); return r||null; }
for(const r of data){
  const fields = parseKkFields(r.rawText);
  const members = parseMembers(r.rawText);
  // derive head name if empty
  if(!fields.namaKepalaKeluarga && members.length){
    const head = members.find(m=>/KEPALA/i.test(m.statusHubungan)) || members[0];
    fields.namaKepalaKeluarga = head.nama;
  }
  // derive nomorKK if empty: try from filename? no
  Object.assign(r, fields);
  r.members = members;
  r.filenameMatchHead = filenameMatches(r.file, r.namaKepalaKeluarga);
  let appMembers = r.nomorKK ? (appUmatByKk.get(r.nomorKK)||[]) : [];
  if(!appMembers.length) appMembers = findAppUmatGroup(r.namaKepalaKeluarga);
  const appKkMatch = findAppKk(r.namaKepalaKeluarga) || (appMembers.length?{namaKepalaKeluarga: r.namaKepalaKeluarga}:null);
  const scannedNames = members.map(m=>norm(m.nama));
  const appNames = appMembers.map(m=>norm(m.nama));
  const matchedMembers = scannedNames.filter(n=>appNames.includes(n)).length;
  r.appMatch = { appKkFound: !!appKkMatch, appKkName: appKkMatch?appKkMatch.namaKepalaKeluarga:null, appMemberCount: appMembers.length, scannedMemberCount: members.length, matchedMemberNames: matchedMembers };
}
fs.writeFileSync('D:/APPMI/scripts/scan-results.json', JSON.stringify(data,null,2));
console.log('reprocessed', data.length);
console.log('nama empty', data.filter(r=>!r.namaKepalaKeluarga).length);
console.log('nomor empty', data.filter(r=>!r.nomorKK).length);
console.log('members total', data.reduce((a,b)=>a+b.members.length,0));
console.log('filenameMatch true', data.filter(r=>r.filenameMatchHead===true).length);
console.log('filenameMatch false', data.filter(r=>r.filenameMatchHead===false).length);
