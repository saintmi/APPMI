// kk-parser.mjs (v2)
export function norm(s){return (s||'').toLowerCase().replace(/[^a-z0-9]/g,'');}
function cleanNik(tok){return (tok||'').replace(/\D/g,'');}
export function parseKkFields(text){
  const get=(r)=>{const m=text.match(r);return m?m[1].trim().replace(/\s{2,}/g,' '):'';};
  let nomorKK=(text.match(/No\.?\s*KK\s*[:：]?\s*(\d{16})/i)||text.match(/Nomor\s*KK\s*[:：]?\s*(\d{16})/i)||text.match(/No\.?\s*[:：]?\s*(\d{16})/i)||[])[1]||'';
  if(!nomorKK){const m=text.match(/\b(\d{16})\b/); if(m) nomorKK=m[1];}
  const namaKepalaKeluarga=get(/Nama Kepala Keluarga\s*[:：]\s*(.+?)(?=\s+(?:Kecamatan|Alamat|RT\/RW|Kelurahan|Desa|Kabupaten|Kode|Provinsi|$))/i);
  const alamat=get(/Alamat\s*[:：]\s*(.+?)(?=\s+(?:RT\/RW|Kecamatan|Kabupaten|Kode Pos|Kelurahan|Desa|$))/i);
  const rtRw=get(/RT\/RW\s*[:：]\s*(\S+)/i);
  const kelurahan=get(/(?:Desa|Kelurahan)\s*[:：]\s*(.+?)(?=\s+(?:Kecamatan|RT\/RW|Kabupaten|Kode|Provinsi|$))/i);
  const kecamatan=get(/Kecamatan\s*[:：]\s*(.+?)(?=\s+(?:Kabupaten|Kode|Provinsi|Kelurahan|Desa|$))/i);
  let kabupaten=get(/Kabupaten\/Kota\.?\s*[:：]\s*(.+?)(?=\s+(?:Kode Pos|Provinsi|RT\/RW|Kelurahan|Desa|$))/i);
  if(!kabupaten){const m=text.match(/Kota\s+([A-Z][A-Z .]{2,40})/i); if(m) kabupaten=m[1].trim();}
  const kodePos=get(/Kode Pos\s*[:：]?\s*(\d{5})/i);
  let provinsi=get(/Provinsi\s*[:：]\s*(.+?)(?=\s+(?:No\.?|Dikeluarkan|LEMBAR|$))/i);
  if(!provinsi){const m=text.match(/Propinsi\s*[:：]?\s*(.+?)(?=\s+(?:Kota|No\.?|Dikeluarkan|$))/i); if(m) provinsi=m[1].trim();}
  const tglDikeluarkan=get(/Dikeluarkan Tanggal\s*[:：]?\s*([0-9]{2}[-/][0-9]{2}[-/][0-9]{4})/i);
  return {nomorKK,namaKepalaKeluarga,alamat,rtRw,kelurahan,kecamatan,kabupaten,kodePos,provinsi,tglDikeluarkan};
}
export function parseMembers(text){
  const lines=text.split(/\r?\n/).map(l=>l.trim()).filter(Boolean);
  const byIndex=new Map(); const loose=[];
  // First pass: lines containing a 16-digit NIK (with or without dots)
  for(const line of lines){
    const nikMatch=line.match(/(\d[\d.\s]{14,}\d)/);
    if(!nikMatch) continue;
    const nik=cleanNik(nikMatch[1]);
    if(nik.length!==16) continue;
    const before=line.slice(0, nikMatch.index).trim();
    const after=line.slice(nikMatch.index + nikMatch[1].length).trim();
    const idxMatch=before.match(/^(\d{1,2})\s*[|]?/);
    const idx=idxMatch?idxMatch[1].padStart(2,'0'):null;
    let name=before.replace(/^(\d{1,2})\s*[|]?\s*/,'').replace(/\|/g,'').trim();
    // remove trailing non-name tokens
    name=name.replace(/\s{2,}/g,' ').trim();
    const parts=after.split('|').map(p=>p.trim()).filter(Boolean);
    let jk='',tempatTgl='',agama='',pendidikan='',pekerjaan='';
    let tempatLahir='',tanggalLahir='';
    // parse tempat/tanggal: look for date pattern dd month yyyy or dd-mm-yyyy
    const jkM = after.match(/(LAKI\s*-\s*LAKI|PEREMPUAN)/i);
    if(jkM && !jk) jk = jkM[1].replace(/\s+/g,' ').trim();
    const dateM=after.match(/(\d{2})[-\/\s]([A-Za-z]{3,}|\d{2})[-\/\s](\d{4})/);
    if(dateM){ tanggalLahir = dateM[0].trim(); tempatLahir = after.slice(0, dateM.index).replace(/LAKI\s*-\s*LAKI|PEREMPUAN/gi,'').trim().replace(/[^A-Za-z .]/g,'').replace(/\s{2,}/g,' ').trim(); }
    for(const p of parts){
      if(/LAKI|PEREMPUAN/i.test(p)&&!jk){jk=p.replace(/\s+/g,' ').trim();continue;}
      if(/KATHOLIK|ISLAM|PROTESTAN|HINDU|BUDDHA|KONGHUCU/i.test(p)&&!agama){const am=p.match(/KATHOLIK|ISLAM|PROTESTAN|HINDU|BUDDHA|KONGHUCU/i); agama=am?am[0].toUpperCase():p.trim();continue;}
      if(!pendidikan&&/TK|SD|SMP|SMA|DIPLOMA|SARJANA|TDK SEKOLAH|PERGURUAN|AKADEMI|STRATA|TAMAT/i.test(p)){pendidikan=p.trim();continue;}
      if(!pekerjaan&&/KARYAWAN|SWASTA|PETANI|WIRASWASTA|PEMBANTU|TIDAK BEKERJA|PNS|GURU/i.test(p)){pekerjaan=p.trim();continue;}
    }
    // gol darah
    const gd = after.match(/(A|B|AB|O)\b/);
    const member={index:idx,nama:name,nik,jenisKelamin:jk,tempatLahir,tanggalLahir,agama,pendidikan,pekerjaan,statusPerkawinan:'',statusHubungan:'',namaAyah:'',namaIbu:'',golonganDarah: gd?gd[1]:''};
    if(idx) byIndex.set(idx,member); else loose.push(member);
  }
  // Second pass: status lines with leading index and KEPALA/ISTRI/ANAK
  for(const line of lines){
    if(!/(KEPALA KELUARGA|ISTRI|ANAK|FAMILI LAIN|MERTUA|MENANTU|CUCU)/i.test(line)) continue;
    const idxMatch=line.match(/^(\d{1,2})\s*[|]?/);
    if(!idxMatch) continue;
    const idx=idxMatch[1].padStart(2,'0');
    const mem=byIndex.get(idx);
    if(!mem) continue;
    const shm=line.match(/(KEPALA KELUARGA|ISTRI|ANAK|FAMILI LAIN|MERTUA|MENANTU|CUCU|ORANG TUA)/i);
    if(shm) mem.statusHubungan=shm[1].toUpperCase();
    const spm=line.match(/(KAWIN|BELUM KAWIN|CERAI HIDUP|CERAI MATI)/i);
    if(spm) mem.statusPerkawinan=spm[1].toUpperCase();
    const agm=line.match(/(KATHOLIK|ISLAM|PROTESTAN|HINDU|BUDDHA|KONGHUCU)/i);
    if(agm && !mem.agama) mem.agama=agm[1].toUpperCase();
    // nama ayah/ibu: capture words after status hubungan? leave raw
  }
  const ordered=[];
  for(const i of [...byIndex.keys()].sort()) ordered.push(byIndex.get(i));
  for(const m of loose) ordered.push(m);
  return ordered;
}
export function filenameMatches(filename,nama){
  let base=(filename||'').replace(/\.[^.]+$/,'');
  base=base.replace(/kartu\s*keluarga/gi,'').replace(/kk/gi,'');
  const a=norm(base); const b=norm(nama);
  if(!b) return null;
  if(a===b) return true;
  if(a.includes(b)||b.includes(a)) return true;
  const wa=base.toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>2);
  const wb=(nama||'').toLowerCase().split(/[^a-z0-9]+/).filter(w=>w.length>2);
  if(wa.length&&wb.length){
    const overlap=wa.filter(w=>wb.includes(w)).length;
    if(overlap>=1 && overlap/wb.length>=0.5) return true;
  }
  return false;
}
