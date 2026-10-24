p='D:/APPMI/scripts/reprocess.mjs'
s=open(p,encoding='utf-8').read()
s=s.replace("  const appKkMatch = findAppKk(r.namaKepalaKeluarga) || (appMembers.length?{namaKepalaKeluarga: appMembers[0].nama}:null);\n  let appMembers = r.nomorKK ? (appUmatByKk.get(r.nomorKK)||[]) : [];\n  if(!appMembers.length) appMembers = findAppUmatGroup(r.namaKepalaKeluarga);\n",
"  let appMembers = r.nomorKK ? (appUmatByKk.get(r.nomorKK)||[]) : [];\n  if(!appMembers.length) appMembers = findAppUmatGroup(r.namaKepalaKeluarga);\n  const appKkMatch = findAppKk(r.namaKepalaKeluarga) || (appMembers.length?{namaKepalaKeluarga: r.namaKepalaKeluarga}:null);\n")
open(p,'w',encoding='utf-8').write(s)
print('done')
