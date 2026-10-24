p='D:/APPMI/scripts/gen-gap-report.mjs'
s=open(p,encoding='utf-8').read()
# Fix findAppGroup: skip empty/non-16 groups
old="""function findAppGroup(r){
  if(r.nomorKK && groups.has(r.nomorKK)) return {key:r.nomorKK, members:groups.get(r.nomorKK), source:'nomorKK'};
  // by head name fuzzy
  let bestKey=null, bestScore=0;
  for(const [key,members] of groups){
    // find a member whose name matches head
    for(const m of members){
      const s=sim(r.namaKepalaKeluarga, m.nama);
      if(s>bestScore){bestScore=s;bestKey=key;}
    }
  }
  if(bestScore>=0.75) return {key:bestKey, members:groups.get(bestKey), source:'nama kepala (fuzzy)'};
  return null;
}"""
new="""function findAppGroup(r){
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
}"""
assert old in s
s=s.replace(old,new)
open(p,'w',encoding='utf-8').write(s)
print('patched')
