import re
p='D:/APPMI/scripts/kk-parser.mjs'
s=open(p,encoding='utf-8').read()
old="""    const dateM=after.match(/(\d{2})[-\/\s]([A-Za-z]{3,}|\d{2})[-\/\s](\d{4})/);
    if(dateM){ tanggalLahir = dateM[0].trim(); tempatLahir = after.slice(0, dateM.index).trim().replace(/[^A-Za-z .]/g,'').trim(); }"""
new="""    const jkM = after.match(/(LAKI\s*-\s*LAKI|PEREMPUAN)/i);
    if(jkM && !jk) jk = jkM[1].replace(/\s+/g,' ').trim();
    const dateM=after.match(/(\d{2})[-\/\s]([A-Za-z]{3,}|\d{2})[-\/\s](\d{4})/);
    if(dateM){ tanggalLahir = dateM[0].trim(); tempatLahir = after.slice(0, dateM.index).replace(/LAKI\s*-\s*LAKI|PEREMPUAN/gi,'').trim().replace(/[^A-Za-z .]/g,'').replace(/\s{2,}/g,' ').trim(); }"""
assert old in s, 'date block not found'
s=s.replace(old,new)
old2="if(/KATHOLIK|ISLAM|PROTESTAN|HINDU|BUDDHA|KONGHUCU/i.test(p)&&!agama){agama=p.trim();continue;}"
new2="if(/KATHOLIK|ISLAM|PROTESTAN|HINDU|BUDDHA|KONGHUCU/i.test(p)&&!agama){const am=p.match(/KATHOLIK|ISLAM|PROTESTAN|HINDU|BUDDHA|KONGHUCU/i); agama=am?am[0].toUpperCase():p.trim();continue;}"
assert old2 in s, 'agama line not found'
s=s.replace(old2,new2)
open(p,'w',encoding='utf-8').write(s)
print('patched')
