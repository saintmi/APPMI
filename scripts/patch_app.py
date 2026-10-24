old_line = "if(!appUmatByKk.has(u.idKK)) appUmatByKk.set(u.idKK,[]); appUmatByKk.get(u.idKK).push(u);"
new_line = "const key=String(u.idKK).replace(/^KK/i,''); if(!appUmatByKk.has(key)) appUmatByKk.set(key,[]); appUmatByKk.get(key).push(u);"
p='D:/APPMI/scripts/reprocess.mjs'
s=open(p,encoding='utf-8').read()
assert old_line in s, 'old line not found'
s=s.replace(old_line,new_line)
open(p,'w',encoding='utf-8').write(s)
print('patched')
