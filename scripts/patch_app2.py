p='D:/APPMI/scripts/reprocess.mjs'
s=open(p,encoding='utf-8').read()
# Add findAppUmatGroup helper after appUmatByKk build block
old_helper = "const appUmatByKk = new Map();\nfor(const u of appUmat){ if(!u.idKK) continue; const key=String(u.idKK).replace(/^KK/i,''); if(!appUmatByKk.has(key)) appUmatByKk.set(key,[]); appUmatByKk.get(key).push(u); }\n"
new_helper = old_helper + """function findAppUmatGroup(headName){
  const n=norm(headName);
  if(!n) return [];
  for(const [key,members] of appUmatByKk){
    if(members.some(m=>{const mn=norm(m.nama); return mn===n || (mn.length>6 && (mn.includes(n)||n.includes(mn)));})) return members;
  }
  return [];
}
"""
assert old_helper in s
s=s.replace(old_helper,new_helper)
old_members = "  const appMembers = r.nomorKK ? (appUmatByKk.get(r.nomorKK)||[]) : [];\n"
new_members = "  let appMembers = r.nomorKK ? (appUmatByKk.get(r.nomorKK)||[]) : [];\n  if(!appMembers.length) appMembers = findAppUmatGroup(r.namaKepalaKeluarga);\n"
assert old_members in s
s=s.replace(old_members,new_members)
# appKkFound: if appMembers found, consider found
s=s.replace("  const appKkMatch = findAppKk(r.namaKepalaKeluarga);\n", "  const appKkMatch = findAppKk(r.namaKepalaKeluarga) || (appMembers.length?{namaKepalaKeluarga: appMembers[0].nama}:null);\n")
open(p,'w',encoding='utf-8').write(s)
print('patched')
