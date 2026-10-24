import re
p='D:/APPMI/scripts/kk-parser.mjs'
s=open(p,encoding='utf-8').read()
old="""export function filenameMatches(filename,nama){
  const base=(filename||'').replace(/\.[^.]+$/,'');
  const a=norm(base); const b=norm(nama);
  if(!b) return null;
  if(a===b) return true;
  if(a.includes(b)||b.includes(a)) return true;
  return false;
}"""
new="""export function filenameMatches(filename,nama){
  let base=(filename||'').replace(/\.[^.]+$/,'');
  base=base.replace(/kartu\s*keluarga/gi,'').replace(/\bkk\b/gi,'');
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
}"""
assert old in s
s=s.replace(old,new)
open(p,'w',encoding='utf-8').write(s)
print('patched')
