# Laporan Scan Kartu Keluarga (KK) - KUB 1-4

Sumber: foto KK di `New folder (2)`, OCR tesseract.js (ind), peningkatan via sharp (eksperimen).
Total file KK dipindai: **113**

## Ringkasan per KUB

| KUB | Jumlah KK | Rata-rata confidence | Nomor KK terbaca | Nama kepala terbaca | Filename cocok |
|---|---:|---:|---:|---:|---:|
| KUB 1 | 25 | 37.6 | 13/25 | 22/25 | 17/25 |
| KUB 2 | 36 | 37.2 | 22/36 | 29/36 | 25/36 |
| KUB 3 | 15 | 35.5 | 9/15 | 12/15 | 8/15 |
| KUB 4 | 37 | 39.9 | 28/37 | 31/37 | 24/37 |

Total anggota terbaca: **190** (rata-rata 1.68 per KK).

## Kecocokan nama file vs nama kepala keluarga

- Cocok: **74**
- Tidak cocok: **20**
- Tidak dapat dinilai (nama kepala tidak terbaca): **19**

### Daftar tidak cocok (filename - kepala)

- `MEIVINASARI-KARTU KELUARGA.jpg` -> terbaca: **- No.**
- `RICKY PAULUS JOANNES LANGITAN- KARTU KELUARGA.jpg` -> terbaca: **Anil Aatipa meat**
- `TEDY WIBOWO-KARTU KELUARGA.jpg` -> terbaca: **ORLE ZEFANYA HEBSON WIBOWO**
- `ULFAH- KARTU KELUARGA.jpg` -> terbaca: **az WaviK ROCMAYATI**
- `WILIAM PRIHANDOKO-KARTU KELUARGA.jpg` -> terbaca: **WILIAN PRIHADOKO**
- `CHRISTIAN HADIYANTO,SE-KARTU KELUARGA.jpg` -> terbaca: **STEFANI AVELIA CHRISTIANA**
- `PASKALIS GEMPAR-KARTU KELUARGA.jpg` -> terbaca: **IE No. b**
- `SESILIA HORI MARAN-KARTU KELUARGA.jpg` -> terbaca: **KS No-**
- `YUPENSIUS MURDIYONO - KARTU KELUARGA.jpg` -> terbaca: **Age No-**
- `ANDRIAS DANU MUKTIANTO - KARTU KELUARGA.jpg` -> terbaca: **m. dani : onar cuane - DalamKelunngo Kenerpenegaraan, armenegeraan Dokumen Imigrasi ml and,**
- `EMANUEL GIDION ADINURCAHYO - KARTU KELUARGA.jpg` -> terbaca: **is N, / Bb if Ai Shan AG ii, ADINL JRCAH BP YO Aa Aa**
- `JANSON SARAGIH - KARTU KELUARGA.jpg` -> terbaca: **. NAS No.**
- `VERO DWI ANI-KARTU KELUARGA.jpg` -> terbaca: **V. DWI ANY SETYANINGSIH**
- `ANDI PUTRA LUBIS - KARTU KELUARGA.jpg` -> terbaca: **(ARDELINA SINAGA**
- `BARNABAS MUKHTAR-KARTU KELUARGA.jpg` -> terbaca: **03 IVALENTINA YUHAINORA ROSARI -5... 1**
- `LAMBRITA TADIUS - KARTU KELUARGA.jpg` -> terbaca: **LA MBIRITA TADIYUS**
- `LAMBRITA TADIUS-KARTU KELUARGA.jpg` -> terbaca: **LA MBIRITA TADIYUS**
- `MARKUS HENDRIK - KARTU KELUARGA.jpg` -> terbaca: **ANJELINA AGATHA :**
- `MARKUS HENDRIK-KARTU KELUARGA.jpg` -> terbaca: **ANJELINA AGATHA :**
- `YONAS SORRO - KARTU KELUARGA.jpg` -> terbaca: **Lajomvemuonma**

## Perbandingan dengan data aplikasi (seed-snapshot)

Data aplikasi: 54 KK, 174 anggota.

- KK terbaca yang cocok dengan data aplikasi (by nama kepala): **35**
- Tidak cocok/tidak ditemukan di aplikasi: **78**

KK dengan jumlah anggota berbeda (app vs scan): **27**

| File | Kepala (scan) | App members | Scan members | Matched names |
|---|---|---:|---:|---:|
| CHRISTINA SELFANI RUNTU -KARTU KELUARGA.jpg | CHRISTINA SELFANI RUNTU | 2 | 0 | 0 |
| ELISABETH MANTIRI-KARTU KELUARGA.jpg | ELISABETH MANTIRI : | 1 | 3 | 0 |
| ENDANG YUDHANINGSIH -KARTU KELUARGA.jpg | ENDANG YUDHANINGSIH | 1 | 2 | 1 |
| IGNATIUS BUDIARIYANTO-KARTU KELUARGA.jpg | IGNATIUS BUDIARIYANTO | 2 | 3 | 0 |
| MARTINUS APRIADI PUTRA-KARTU KELUARGA.jpg | MARTINUS APRIADI PUTRA | 3 | 4 | 0 |
| MARTINUS PRASETYO ADI NUGROHO-KARTU KELUARGA.jpg | MARTINUS PRASETYO ADI NUGROHO | 4 | 0 | 0 |
| MEIVINASARI-KARTU KELUARGA.jpg | - No. | 3 | 2 | 0 |
| PIOTR-KARTU KELUARGA.jpg | PIOTR MACIEJ OLSZEWSKI | 5 | 1 | 0 |
| BONEFASIUS SAGUR-KARTU KELUARGA.jpg | BONEFASIUS SAGUR | 2 | 0 | 0 |
| MURTIYONO - KARTU KELUARGA.jpg | MURTIYONO | 2 | 1 | 0 |
| P. SUYATI-KARTU KELUARGA.jpg | P.SUYATI | 2 | 0 | 0 |
| SIMON SANTI-KARTU KELUARGA.jpg | SIMON SANTI | 1 | 3 | 1 |
| YUSTINUS DANI-KARTU KELUARGA.jpg | YUSTINUS DANI | 4 | 2 | 1 |
| ANA E. YAYUK SUPRAPTININGSIH-KARTU KELUARGA.jpg | ANA. E. YAYUK SUPRAPTININGSIH | 1 | 0 | 0 |
| ANTHANOSIUS KOEN BROTO.D - KARTU KELUARGA.jpg | ANTHANOSIUS KOEN BROTO. D | 4 | 2 | 0 |
| JANSON SARAGIH - KARTU KELUARGA.jpg | . NAS No. | 6 | 3 | 2 |
| MANGAPUL MANIK - KARTU KELUARGA.jpg | MANGAPUL MANIK | 3 | 1 | 0 |
| POLONIUS DOSI MITEN-KARTU KELUARGA.jpg | POLONIUS DOSI MITEN | 3 | 0 | 0 |
| THOMAS SAKINO - KARTU KELUARGA.jpg | THOMAS SAKINO | 3 | 1 | 0 |
| BARNABAS MUHTAR - KARTU KELUARGA.jpg | MUHTAR | 5 | 1 | 1 |
| CHRISTIAN KUSUMA - KARTU KELUARGA.jpg | CHRISTIAN KUSUMA | 3 | 5 | 1 |
| CHRISTIAN KUSUMA-KARTU KELUARGA.jpg | CHRISTIAN KUSUMA | 3 | 5 | 1 |
| LAMBRITA TADIUS - KARTU KELUARGA.jpg | LA MBIRITA TADIYUS | 5 | 6 | 2 |
| LAMBRITA TADIUS-KARTU KELUARGA.jpg | LA MBIRITA TADIYUS | 5 | 6 | 2 |
| MARKUS HENDRIK - KARTU KELUARGA.jpg | ANJELINA AGATHA : | 4 | 5 | 1 |
| MARKUS HENDRIK-KARTU KELUARGA.jpg | ANJELINA AGATHA : | 4 | 5 | 1 |
| PETRA KANISIA. D - KARTU KELUARGA.jpg | PETRA KANISIA. D : | 3 | 1 | 1 |

## Gambar dengan confidence rendah (<30) - 22 file

- KUB 2 :: `LAHANG ANYIE - KARTU KELUARGA.jpg` (conf 14)
- KUB 3 :: `EMANUEL GIDION ADINURCAHYO - KARTU KELUARGA.jpg` (conf 14)
- KUB 4 :: `PANDU RAMA YUDHA - KARTU KELUARGA.jpg` (conf 17)
- KUB 3 :: `ANDRIAS DANU MUKTIANTO - KARTU KELUARGA.jpg` (conf 19)
- KUB 1 :: `THERESIA SUKARSI-KARTU KELUARGA.jpg` (conf 22)
- KUB 2 :: `ADRIANI TODINGAN-KARTU KELUARGA.jpg` (conf 22)
- KUB 2 :: `P. SUYATI-KARTU KELUARGA.jpg` (conf 22)
- KUB 4 :: `BARNABAS MUKHTAR-KARTU KELUARGA.jpg` (conf 22)
- KUB 2 :: `KARBINTANUS PEDO WAJA-KARTU KELUARGA.jpg` (conf 23)
- KUB 2 :: `RADEN DESTRI SUBAGIYO - KARTU KELUARGA.jpg` (conf 23)
- KUB 3 :: `POLONIUS DOSI MITEN-KARTU KELUARGA.jpg` (conf 24)
- KUB 1 :: `JULIANA BR GINTING-KARTU KELUARGA.jpg` (conf 26)
- KUB 1 :: `ULFAH- KARTU KELUARGA.jpg` (conf 26)
- KUB 1 :: `RICKY PAULUS JOANNES LANGITAN- KARTU KELUARGA.jpg` (conf 28)
- KUB 3 :: `THEODORUS LEON-KARTU KELUARGA.jpeg` (conf 28)
- KUB 2 :: `ANTHONIUS SALEM-KARTU KELUARGA.jpg` (conf 29)
- KUB 2 :: `BENHUR MALAU-KARTU KELUARGA.jpg` (conf 29)
- KUB 2 :: `SESILIA HORI MARAN-KARTU KELUARGA.jpg` (conf 29)
- KUB 2 :: `YOHANES FANDI-KARTU KELUARGA.jpg` (conf 29)
- KUB 2 :: `YUSUF-KARTU KELUARGA.jpg` (conf 29)
- KUB 2 :: `YUSUF-KK.jpg` (conf 29)
- KUB 3 :: `JHONSON RAJA GUKGUK - KARTU KELUARGA.jpg` (conf 29)

## Detail per KK

### KUB 1 - CHRISTINA SELFANI RUNTU -KARTU KELUARGA.jpg

- Confidence OCR: **41**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: CHRISTINA SELFANI RUNTU
- Kecocokan nama file: Cocok
- Alamat: JL. GN. GUNTUR ASRI NO.37
- RT/RW: 035/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: 25-10-2024
- App: cocok (`CHRISTINA SELFANI RUNTU`) | app members 2 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 1 - DANANG UMBARAN - KARTU KELUARGA.jpg

- Confidence OCR: **67**
- Nomor KK: 6471050309080004
- Nama Kepala Keluarga: AH. DANANG UMBARAN
- Kecocokan nama file: Cocok
- Alamat: JL. TELAGASARI IV NO. 17
- RT/RW: 31/1- | Kelurahan/Desa: TELAGA SARI | Kecamatan: -
- Kabupaten/Kota: KOTA BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 5 | matched names 0

**Anggota (5):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 01 | AH. DANANG UMBARAN | 6471050204770008 | LAKI - LAKI | BALIKPAPAN / 02-04-1977 | KATHOLIK | - | KARYAWAN SWASTA | KEPALA KELUARGA |
| 02 | THERESIA YULIANTI | 6471056601770006 | PEREMPUAN | BANYUWANGI / 26-01-1977 | KATHOLIK | - | - | ISTRI |
| 03 | LEONARDUS HARIMURTI SINDUNATHA | 6471052704080003 | LAKI - LAKI | BALIKPAPAN / 27-04-2008 | KATHOLIK | TDK SEKOLAH TIDAK BEKERJA | - | ANAK |
| 04 | LAURENTIUS HARIMURTI PANDJIPUTRA NUGRAHA | 6471062410120002 | LAKI - LAKI | BALIKPAPAN / 24-10-2012 | KATHOLIK | - | - | ANAK |
| - | Sl No. | 6471050309080004 | - | / | - | - | - | - |

### KUB 1 - DARIANUS EGAR - KARTU KELUARGA.jpg

- Confidence OCR: **36**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: DARIANUS EGAR
- Kecocokan nama file: Cocok
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`DARIANUS EGAR`) | app members 2 vs scan 2 | matched names 2

**Anggota (2):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 01 | DARIANUS EGAR | 6471050505760022 | - | / | - | - | - | KEPALA KELUARGA |
| 02 | MARTINA NITA | 6471056404780002 | - | / | - | - | - | - |

### KUB 1 - DAYAN NAIBAHO-KARTU KELUARGA.jpg

- Confidence OCR: **43**
- Nomor KK: 6471051341205000
- Nama Kepala Keluarga: 1 IDAYAN NAIBAHO
- Kecocokan nama file: Cocok
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: KOTA BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 2 | matched names 0

**Anggota (2):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 10 | 1 IDAYAN NAIBAHO | 6471052802770019 | LAKI-LAKI | IKISARAN / 28-02-1977 | KATHOLIK | - | - | ANAK |
| 93 | KELA ZAIVANNA NAIBAHO | 6471055503110003 | PEREMPUAN | BALIKPAPAN / 15-03-2011 | KATHOLIK | - | TIDAK BEKERJA | - |

### KUB 1 - ELISABETH MANTIRI-KARTU KELUARGA.jpg

- Confidence OCR: **45**
- Nomor KK: 6471012808740006
- Nama Kepala Keluarga: ELISABETH MANTIRI :
- Kecocokan nama file: Cocok
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: KOTA BALIKPAPAN | Provinsi: - | Kode Pos: 76116
- Tgl dikeluarkan: -
- App: cocok (`Elisabeth Mantiri`) | app members 1 vs scan 3 | matched names 0

**Anggota (3):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 02 | !' ARTHUR ANTONIUS RUNTU | 6471012808740006 | LAKI - LAKI | BALIKPAPAN / 28-08-1974 | KATHOLIK | - | - | - |
| 10 | 1 ELUSABETI MANTIN | 6471015812820001 | PEREMPUAN | / | KATHOLIK | - | - | - |
| 23 | LUCIANA YASHINTA RUNTU | 6471015509800001 | PEREMPUAN | BALIKPAPAN / 15-09-1980 | KATHOLIK | - | AKADEMYD 11! KARYAWAN SWASTA | - |

### KUB 1 - ENDANG YUDHANINGSIH -KARTU KELUARGA.jpg

- Confidence OCR: **35**
- Nomor KK: 6471057112500064
- Nama Kepala Keluarga: ENDANG YUDHANINGSIH
- Kecocokan nama file: Cocok
- Alamat: JL. SYARIFUDDIN YOES NO. 10
- RT/RW: 001/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`Endang Yudhaningsih`) | app members 1 vs scan 2 | matched names 1

**Anggota (2):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | ENDANG YUDHANINGSIH | 6471057112500064 | - | / | - | - | - | - |
| - | HASTARI KUSUMAWARDHANI | 6471056809780005 | perempuan | / | - | - | - | - |

### KUB 1 - IGNASIUS SUYATO-KARTU KELUARGA.jpeg

- Confidence OCR: **31**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: IGNASIUS SUYATO
- Kecocokan nama file: Cocok
- Alamat: JL.MARSMA R.ISWAHYUDI
- RT/RW: 015/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: 20-11-2023
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 1 - IGNATIUS BUDIARIYANTO-KARTU KELUARGA.jpg

- Confidence OCR: **44**
- Nomor KK: 6471051312120047
- Nama Kepala Keluarga: IGNATIUS BUDIARIYANTO
- Kecocokan nama file: Cocok
- Alamat: PERUM PALM HILLS CLUSTER PAVILIUN BLOK B NO.6
- RT/RW: - | Kelurahan/Desa: SEPINGGAN | | Kecamatan: -
- Kabupaten/Kota: KOTA BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`IGNATIUS BUDIARIYANTO`) | app members 2 vs scan 3 | matched names 0

**Anggota (3):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | REI No. | 6471051312120047 | - | / | - | - | - | - |
| - | D1 IIGNATIUS BUDIARIYANTO | 6471050907810005 | LAKI -LAKI | WONOGIRI / 09-07-1981 | KATHOLIK | DIPLOMA IV/S | KARYAWAN SWA! | - |
| - | 02 IWORO VIDYA AYUNINGTYAS | 0471050501840009 | PEREMPUAN | JAKARTA / 25-01-1994 | KATHOLIK | DIPLOMAIV/S | - | - |

### KUB 1 - JULIANA BR GINTING-KARTU KELUARGA.jpg

- Confidence OCR: **26**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: Oa | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 1 - LEILIYATI. S-KARTU KELUARGA.jpg

- Confidence OCR: **32**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: .LEILIYATI S.
- Kecocokan nama file: Cocok
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 1 - LUSIA LERO-KARTU KELUARGA.jpg

- Confidence OCR: **36**
- Nomor KK: 5307040511210003
- Nama Kepala Keluarga: LUSIA LERO
- Kecocokan nama file: Cocok
- Alamat: PERUM. PALMHILLS CITY GARDEN VILLA NO.32
- RT/RW: 008/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: 15-11-2021
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | Ae), No- | 5307040511210003 | - | / | - | - | - | - |

### KUB 1 - MARTINUS APRIADI PUTRA-KARTU KELUARGA.jpg

- Confidence OCR: **39**
- Nomor KK: 6471052304920004
- Nama Kepala Keluarga: MARTINUS APRIADI PUTRA
- Kecocokan nama file: Cocok
- Alamat: -
- RT/RW: 053/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: Ta RT | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`Martinus Apriadi Putra`) | app members 3 vs scan 4 | matched names 0

**Anggota (4):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 01 | JMARTINUS APRIADI PUTRA daa | 6471052304920004 | - | / | - | - | Juarai JeauKearpan - - J22041992 Jrarmouir - Jsurasemeraar -  JKaryawanswasia jo) | - |
| 02 | JSEPTIWANTY ROULIS SITUMORANG | 6471056809920003 | PEREMPUAN | J BALIKPAPAN / 28-00-1992 | - | - | - | - |
| 03 | JIMMANUEL MEYER TAMBA | 6471061008190002 | - | / | - | - | - | - |
| 04 | JZEFANYA YOHANA TAMBA di | 6471066708250004 | - | / | - | - | - | - |

### KUB 1 - MARTINUS PRASETYO ADI NUGROHO-KARTU KELUARGA.jpg

- Confidence OCR: **33**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: MARTINUS PRASETYO ADI NUGROHO
- Kecocokan nama file: Cocok
- Alamat: PERUM PALM HILLS CITY GARDEN VILLA NO. 32
- RT/RW: 008/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`MARTINUS PRASETYO ADI NUGROHO`) | app members 4 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 1 - MEIVINASARI-KARTU KELUARGA.jpg

- Confidence OCR: **33**
- Nomor KK: 6471051509100078
- Nama Kepala Keluarga: - No.
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`anthanosius koen broto driyatmo`) | app members 3 vs scan 2 | matched names 0

**Anggota (2):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | - No. | 6471051509100078 | - | / | - | - | - | - |
| - | DI FUYADI | 6471051009500001 | LAKI - LAKI | TANJUNG / 10-09-1950 | ISLAM | - | - | - |

### KUB 1 - PETRUS NAUR-KARTU KELUARGA.jpg

- Confidence OCR: **52**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: -
- RT/RW: 005/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: 14-11-2019
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 1 - PIOTR-KARTU KELUARGA.jpg

- Confidence OCR: **36**
- Nomor KK: 6471057107170001
- Nama Kepala Keluarga: PIOTR MACIEJ OLSZEWSKI
- Kecocokan nama file: Cocok
- Alamat: JLDAKSA RAYA RESIDEN PH3 BLOK PH3 NO.10
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: KALIMANTAN TIMUR | Kode Pos: -
- Tgl dikeluarkan: 11-10-2024
- App: cocok (`PIOTR MACIEJ OLSZEWSKI`) | app members 5 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | (3 JMARYSIA BARBARA NUR OLSz2EWSKA -- - | 6471057107170001 | - | / | - | - | - | - |

### KUB 1 - RICKY PAULUS JOANNES LANGITAN- KARTU KELUARGA.jpg

- Confidence OCR: **28**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: Anil Aatipa meat
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: IKPAP | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | Anil Aatipa meat | 5471050605680006 | - | / | - | - | - | - |

### KUB 1 - RINALDY VIATOR TARIGAN- KARTU KELUARGA.jpg

- Confidence OCR: **51**
- Nomor KK: 6471035401830002
- Nama Kepala Keluarga: i RINALDY VIATOR TARIGAN
- Kecocokan nama file: Cocok
- Alamat: JL. INPRES IV NO. 78 -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: KOTA BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 3 | matched names 0

**Anggota (3):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 01 | i RINALDY VIATOR TARIGAN | 1206012208740001 | j LAKI LAKI KABANJAHE SS 22-08-1074 KRISTEN DIPLOMA IV/S | j LAKI LAKI KABANJAHE SS / 22-08-1074 | - | - | KARYAWAN SWASTA | KEPALA KELUARGA |
| 02 | ! MULIYANTI SEMBIRING | 6471035401830002 | PEREMPUAN | BALIKPAPAN. / 14-01-1983 | - | KRISTEN DIPLOMA IV/S | KARYAWAN SWASTA | - |
| 03 | DARRIEL SEBASTIAN TARIGAN | 6471032210110002 | LAKI - LAKI | BALIKPAPAN / 22-10-2012 | - | TDK SEKOLAH TIDAK BEKERJA | - | ANAK |

### KUB 1 - SAUT PERLINDUNGAN SITANGGANG - KARTU KELUARGA.jpg

- Confidence OCR: **44**
- Nomor KK: 6471040706910004
- Nama Kepala Keluarga: SAUT PARLINDUNGAN SITANGGANG
- Kecocokan nama file: Cocok
- Alamat: PERUMAHAN REGALIA RESIDENCE BLOK E NO 11
- RT/RW: 006/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`Saut Parlindungan Sitanggang`) | app members 3 vs scan 3 | matched names 2

**Anggota (3):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | NISMA BARUS | 1208266811950001 | - | / | - | - | - | - |
| - | SHAENETTE OLIVIA SITANGGANG | 6471047107200001 | - | / | - | - | - | - |
| - | NIEL OLIVER SITANGGANG | 6471052001240002 | - | / | - | - | - | - |

### KUB 1 - STEFANUS KORO-KARTU KELUARGA.jpg

- Confidence OCR: **38**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: STEFANUS KORO
- Kecocokan nama file: Cocok
- Alamat: JL. KAPT. P. TENDEAN NO. 56
- RT/RW: 029/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: erni RT | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 1 - TEDY WIBOWO-KARTU KELUARGA.jpg

- Confidence OCR: **32**
- Nomor KK: 6471036204780001
- Nama Kepala Keluarga: ORLE ZEFANYA HEBSON WIBOWO
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: JL MARSMA R ISWAHYUDI GG. KALASUKA
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | ORLE ZEFANYA HEBSON WIBOWO | 6471051702100002 | - | / | - | - | - | - |

### KUB 1 - TEGUH WARDOYO- KARTU KELUARGA.jpg

- Confidence OCR: **31**
- Nomor KK: 1405024301810004
- Nama Kepala Keluarga: TEGUH WARDOYO
- Kecocokan nama file: Cocok
- Alamat: DAKSA RAYA KAIZEN TOWNHOUSE BLOK D2 PALM HILLS
- RT/RW: 009/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 3 | matched names 0

**Anggota (3):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 02 | IMURIYANTIMARSELLAGINING - | 1405024301810004 | perempuan | / | - | - | Kasan jane - Jos0i-1981  JkaruoLir  JoiPLOMamsiratai - JKaryawanswasia je | - |
| 03 | JSAMMYAXELBRILIANSITEPU -- - | 1405023012150001 | - | / | - | - | - | - |
| - | 4JMARCELLEANDERSITEPU | 1405022012180001 | - | / | KATHOLIK | - | - | - |

### KUB 1 - THERESIA SUKARSI-KARTU KELUARGA.jpg

- Confidence OCR: **22**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN j | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 1 - ULFAH- KARTU KELUARGA.jpg

- Confidence OCR: **26**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: az WaviK ROCMAYATI
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: - | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | az WaviK ROCMAYATI | 6471015201920001 | - | / | - | - | - | - |

### KUB 1 - WILIAM PRIHANDOKO-KARTU KELUARGA.jpg

- Confidence OCR: **38**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: WILIAN PRIHADOKO
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 2 - ADRIANI TODINGAN-KARTU KELUARGA.jpg

- Confidence OCR: **22**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: - | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 2 - ANDREAS JODI PRAYOGO-KARTU KELUARGA.jpg

- Confidence OCR: **35**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: ANDREAS JODI PRAYOGO
- Kecocokan nama file: Cocok
- Alamat: -
- RT/RW: 069/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: KALIMANTAN TIMUR | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 2 - ANTHONIUS SALEM-KARTU KELUARGA.jpg

- Confidence OCR: **29**
- Nomor KK: 6471056110750003
- Nama Kepala Keluarga: ANTHONIUS SALEM
- Kecocokan nama file: Cocok
- Alamat: JL MULAWARMAN GG.SLAMET RIYADI NO.14
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | l2jONNALUMU - . ..... | 6471056110750003 | - | / | - | - | Jperemuanjeosar -  - Jaiioisrs Jramour - Isimsemerar - MEnGuruseuman tangga jo | - |

### KUB 2 - ANTONIUS ARY PRASETYO-KARTU KELUARGA.jpg

- Confidence OCR: **35**
- Nomor KK: 3373011803870001
- Nama Kepala Keluarga: ANTONIUS ARY PRASETYO
- Kecocokan nama file: Cocok
- Alamat: PERUM CITRA GARDEN NO. A4
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: SALATIGA | Provinsi: - | Kode Pos: 50715
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 4 | matched names 0

**Anggota (4):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 01 | JANTONIUS ARY PRASETYO id | 3373011803870001 | - | / | - | - | - | - |
| 02 | JEANGGANA RARAS WIDIASAKT | 3402124110690003 | - | / | - | - | - | - |
| - | - Pa ponamAN KEENAN MOAPUTRA PRASETYG. | 8102011506160001 | - | / | - | - | - | - |
| - | - Pe jereaorus Guo MOMPUTRA PRASETYO | 3573010705260004 | - | / | - | - | - | - |

### KUB 2 - ARSINUS PURBA - KARTU KELUARGA.jpg

- Confidence OCR: **35**
- Nomor KK: 5471051703090087
- Nama Kepala Keluarga: ARSINUS PURBA
- Kecocokan nama file: Cocok
- Alamat: JL. PRAPATAN DALAM NO. 18
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: KALIMANTAN TIMUR | Kode Pos: -
- Tgl dikeluarkan: 05-04-2022
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | AD, No- | 5471051703090087 | - | / | - | - | - | - |

### KUB 2 - BENHUR MALAU-KARTU KELUARGA.jpg

- Confidence OCR: **29**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: - | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 2 - BONEFASIUS SAGUR-KARTU KELUARGA.jpg

- Confidence OCR: **35**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: BONEFASIUS SAGUR
- Kecocokan nama file: Cocok
- Alamat: JL. MULAWARMAN - GANG SELAMET RIYADI II
- RT/RW: 012/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`BONEFASIUS SAGUR`) | app members 2 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 2 - CHRISTIAN HADIYANTO,SE-KARTU KELUARGA.jpg

- Confidence OCR: **55**
- Nomor KK: 6471052306080059
- Nama Kepala Keluarga: STEFANI AVELIA CHRISTIANA
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: JL. HIRIA SARI NO. 04
- RT/RW: - | Kelurahan/Desa: SEPINGGAN | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 5 | matched names 0

**Anggota (5):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 03 | STEFANI AVELIA CHRISTIANA | 6471055612980003 | PEREMPUAN | BALIKPAPAN / 16-12-1998 | KATHOLIK | SD/SEDERAJAT PELAJAR/MAHASISWA | - | ANAK |
| 04 | EUGENIUS NATHANIEL CHRISTOFFANY | 6471050301050001 | LAKI - LAKI | BALIKPAPAN / 03-01-2005 | KATHOLIK | TDK SEKOLAH TIDAK BEKERJA | - | ANAK |
| 91 | CHRISTIAN HADIYANTO, SE | 6471052808720007 | LAKI-LAKI | / | KATHOLIK | DIPLOMAIV/S! KARYAWAN SWASTA | - | - |
| 92 | JADRIANA DEWI SUDARYANTI | 6471056406730007 | PEREMPUAN | / | KATHOLIK | - | - | - |
| - | di Ne No. | 6471052306080059 | - | / | - | - | - | - |

### KUB 2 - HENDRIX AGUNG APRIWINARTO - KARTU KELUARGA.jpg

- Confidence OCR: **44**
- Nomor KK: 6471050510740013
- Nama Kepala Keluarga: HENDRIX ASUNG APRIWINARTO
- Kecocokan nama file: Cocok
- Alamat: JL. MULAWARMAN NO.
- RT/RW: 031/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 3 | matched names 0

**Anggota (3):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | 1 JHENDRIX AGUNG APRIWINARTO | 6471050510740013 | JUAKILAKI JOENPASAR Josiotora JKATHOLIK JOPLOMANSIRATAI JKARAwanewasia oo jo | / | - | - | - | - |
| - | 2 JELLYZABETH SHINTA. AW | 6471056304800008 | PEREMPUAN | / | - | - | JPEREMPUANJMALANG - Jesoaioeo JKAMMOLK  JOPLOMAMSIRATAi -  JPEGAWAINEGERISPL (PNS) TIDAK TAHU | - |
| - | 4 IYASHINTA ANGELA AGUNG | 6471056904120005 | PEREMPUAN | / | - | - | - | - |

### KUB 2 - HENGKI-KARTU KELUARGA.jpg

- Confidence OCR: **55**
- Nomor KK: 5471051201050001
- Nama Kepala Keluarga: HENGKIF .
- Kecocokan nama file: Cocok
- Alamat: JL ARJUNA
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: 12-08-2020
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | SEN No- | 5471051201050001 | - | / | - | - | - | - |

### KUB 2 - KARBINTANUS PEDO WAJA-KARTU KELUARGA.jpg

- Confidence OCR: **23**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: KARBINTANUS PEDO WAJA
- Kecocokan nama file: Cocok
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 2 - LAHANG ANYIE - KARTU KELUARGA.jpg

- Confidence OCR: **14**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: - | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 2 | matched names 0

**Anggota (2):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | - | 5555555555555555 | - | / | - | - | - | - |
| - | Pa SA ee Sen Ai 5 a. -5 Sa A | 5555555555555555 | - | / | - | - | - | - |

### KUB 2 - MARSELINUS PAMBO-KARTU KELUARGA.jpg

- Confidence OCR: **46**
- Nomor KK: 6209011306970001
- Nama Kepala Keluarga: MARSELINUS PAMBO
- Kecocokan nama file: Cocok
- Alamat: -
- RT/RW: 052/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 3 | matched names 0

**Anggota (3):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 02 | JSAIDA RAHAYU NINGSIH | 5306104904990001 | perempuan | / | - | - | Jperempuan terong - - Josoaiooo Jrarmorir - Jeitaseoeranr - JMENGURUSRUMAHTANGGA | - |
| - | 1 JMARSELINUS PAMBO | 6209011306970001 | - | / | - | - | - | - |
| - | AGNES APRILIYANI PAMBO | 6471016004220002 | - | / | - | - | - | - |

### KUB 2 - MASENO SUGAYOGA-KARTU KELUARGA.jpg

- Confidence OCR: **44**
- Nomor KK: 6372021408950008
- Nama Kepala Keluarga: MASENO SUGAYOGA
- Kecocokan nama file: Cocok
- Alamat: CLUSTER ARJUNA NO.A2 JL MULAWARMAN GG ARJUNA
- RT/RW: 010/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 2 | matched names 0

**Anggota (2):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | MASENO SUGAYOGA | 6372021408950008 | - | / | - | - | Juarai Jeanjarsaru - Jisosaoos Jkarmouir - Joplomamsiraai - Jkaryawanswasia jap | - |
| - | NATHANIA USIN | 5171014506010001 | - | / | - | - | - | - |

### KUB 2 - MURTIYONO - KARTU KELUARGA.jpg

- Confidence OCR: **39**
- Nomor KK: 6471052107220005
- Nama Kepala Keluarga: MURTIYONO
- Kecocokan nama file: Cocok
- Alamat: JL. MULAWARMAN
- RT/RW: 012/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: KALIMANTAN TIMUR | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`MURTIYONO`) | app members 2 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | - | 6471052107220005 | - | BALIKPAPAN / 21-01-2022 | KATHOLIK | - | TIDAKIBLM SEKOLAH BELUM/TIDAK BEKERJA | - |

### KUB 2 - P. SUYATI-KARTU KELUARGA.jpg

- Confidence OCR: **22**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: P.SUYATI
- Kecocokan nama file: Cocok
- Alamat: JL. MULAWARMAN GN.SLAMET RIADI
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: 24-09-2024
- App: cocok (`P.SUYATI`) | app members 2 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 2 - PASKALIS GEMPAR-KARTU KELUARGA.jpg

- Confidence OCR: **46**
- Nomor KK: 5315031905920002
- Nama Kepala Keluarga: IE No. b
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: -
- RT/RW: 011/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: 76115
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | IE No. b | 3720203101190002 | - | / | - | - | - | - |

### KUB 2 - RADEN DESTRI SUBAGIYO - KARTU KELUARGA.jpg

- Confidence OCR: **23**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: - | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 2 - RIBKA RATTANG - KARTU KELUARGA.jpg

- Confidence OCR: **45**
- Nomor KK: 7326105503974001
- Nama Kepala Keluarga: RIBKA RATTANG
- Kecocokan nama file: Cocok
- Alamat: JALAN MULAWARMAN 10 NO.23
- RT/RW: 011/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 01 | JRBKARATTIANG -- . . .- | 7326105503974001 | - | / | - | - | - | - |

### KUB 2 - ROSILIA NURTANIO-KARTU KELUARGA.jpg

- Confidence OCR: **30**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 2 - ROSILIA NURTNIO-KARTU KELUARGA.jpg

- Confidence OCR: **30**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 2 - ROSMENI GULTOM-KARTU KELUARGA.jpg

- Confidence OCR: **54**
- Nomor KK: 5471052303180015
- Nama Kepala Keluarga: ROSMENI GUL TOM
- Kecocokan nama file: Cocok
- Alamat: PERUM BDS Il BLOK S NO. 07 D
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 2 | matched names 0

**Anggota (2):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | No- | 5471052303180015 | - | / | - | - | - | - |
| - | 101 ROSMENI GULTOM | 1212085903080001 | PEREMPUAN | / | KATHOLIK | - | - | - |

### KUB 2 - SESILIA HORI MARAN-KARTU KELUARGA.jpg

- Confidence OCR: **29**
- Nomor KK: 5305151802080039
- Nama Kepala Keluarga: KS No-
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: - | Provinsi: - | Kode Pos: 86287
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | KS No- | 5305151802080039 | - | / | - | - | - | - |

### KUB 2 - SIMON SANTI-KARTU KELUARGA.jpg

- Confidence OCR: **57**
- Nomor KK: 6471042711790005
- Nama Kepala Keluarga: SIMON SANTI
- Kecocokan nama file: Cocok
- Alamat: -
- RT/RW: 231- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN Aa | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: 04-04-2019
- App: cocok (`Simon Santi`) | app members 1 vs scan 3 | matched names 1

**Anggota (3):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | SIMON SANTI | 6471042711790005 | LAKI - LAKI | PALENG . / 27-11-1079 | KATHOLIK | - | SLTA/SEDERAJAT KARYAWAN SWASTA | - |
| - | YASINTA WAWO | 6471046609830007 | PEREMPUAN | BOPOMA / 26-09-1983 | KATHOLIK | SD/SEDERAJAT IBU RUMAH TANGGA | - | - |
| - | LAURENSIUS MILO | 6471041212120004 | LAKI - LAKI | BALIKPAPAN / 12-12-2012 | KATHOLIK | TDK SEKOLAH TIDAK BEKERJA 1 | - | - |

### KUB 2 - WILFRIDUS SOI - KARTU KELUARGA.jpg

- Confidence OCR: **34**
- Nomor KK: 5471051203180001
- Nama Kepala Keluarga: WILFRIDUS SOI
- Kecocokan nama file: Cocok
- Alamat: JL. MARSMA R. ISWAHYUDI
- RT/RW: 001/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: 15-02-2022
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | Dea . No-. | 5471051203180001 | - | / | - | - | - | - |

### KUB 2 - WILI BRODUS RAYMON AUGUSTINO - KARTU KELUARGA.jpg

- Confidence OCR: **36**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: WILI BRODUS RAYMON AUGUSTINO
- Kecocokan nama file: Cocok
- Alamat: JL. BATU RATNA NO.
- RT/RW: 057/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 2 - Y.F MARIA TITIK SUGIARTI-KARTU KELUARGA.jpg

- Confidence OCR: **30**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: Y.F. MARIA TITIK SUGIARTI
- Kecocokan nama file: Cocok
- Alamat: JL. SANTRI BALOIS 2 BLOK 2
- RT/RW: 069/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 2 - YOHAN KURNIAWAN BUYUNG-KARTU KELUARGA.jpg

- Confidence OCR: **64**
- Nomor KK: 6471050709070005
- Nama Kepala Keluarga: YOHAN KURNIAWAN BUYUNG
- Kecocokan nama file: Cocok
- Alamat: KOMP. TNI. AU SEPINGGAN
- RT/RW: 311- | Kelurahan/Desa: SEPINGGAN RAYA | Kecamatan: -
- Kabupaten/Kota: KOTA BALIKPAPAN i | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 4 | matched names 0

**Anggota (4):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | RAL No. | 6471050709070005 | - | / | - | - | - | - |
| - | RYSTA VERRA FEBRIANTY | 6471056702840001 | PEREMPUAN | BALIKPAPAN / 27-02-1984 | KATHOLIK | - | SLTA/SEDERAJAT KARYAWAN BUMN 1 | - |
| - | PASKALIS STEVEN FARREL SAVERIO | 6471052803070005 | LAKI -LAKI | BAUKPAPAN / 28-03-2007 | KATHOLIK | TDK SEKOLAH TIDAK BEKERJA | - | - |
| - | CHATARINA FELLICIA ROSARY KRISTEVA | 6471054705130003 | PEREMPUAN | BALIKPAPAN / 07-05-2013 | KATHOLIK | TDK SEKOLAH TIDAK BEKERJA ! | - | - |

### KUB 2 - YOHANES FANDI-KARTU KELUARGA.jpg

- Confidence OCR: **29**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: - | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 2 - YOHANES KOPONG GESI-KARTU KELUARGA.jpg

- Confidence OCR: **45**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: YOHANES KOPONG GESI
- Kecocokan nama file: Cocok
- Alamat: JL. ARJUNA NO. 61 A
- RT/RW: 010/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | LE | 4710509062300065 | - | / | - | - | - | - |

### KUB 2 - YOHANES WASKITO-KARTU KELUARGA.jpg

- Confidence OCR: **34**
- Nomor KK: 5471051909150003
- Nama Kepala Keluarga: YOHANES WASKITO'
- Kecocokan nama file: Cocok
- Alamat: JL. MARSMA R. ISWAHYUDI GG. MAWAR
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: 76115
- Tgl dikeluarkan: 29-04-2021
- App: cocok (`YOHANES WASKITO`) | app members 1 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | ed) No- | 5471051909150003 | - | / | - | - | - | - |

### KUB 2 - YOSEPH SATU-KARTU KELUARGA.jpg

- Confidence OCR: **46**
- Nomor KK: 6471054609160002
- Nama Kepala Keluarga: YOSEPH SATU |
- Kecocokan nama file: Cocok
- Alamat: JL. PRONA Ill PERUM. BALOIS SANTOSO, BLOK BALOIS 1 NO.27
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: KALIMANTAN TIMUR | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 05 | JMAGNESIASISIAENGA - | 6471054609160002 | PEREMPUAN | / | - | - | PEREMPUAN / BALIKPAPAN TIDAK/BLM SEKOLAH BELUMTIDAK BEKERJA | - |

### KUB 2 - YUPENSIUS MURDIYONO - KARTU KELUARGA.jpg

- Confidence OCR: **37**
- Nomor KK: 5471052410020003
- Nama Kepala Keluarga: Age No-
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | Age No- | 5471052410020003 | - | / | - | - | - | - |

### KUB 2 - YUSTINUS DANI-KARTU KELUARGA.jpg

- Confidence OCR: **51**
- Nomor KK: 6471010504800005
- Nama Kepala Keluarga: YUSTINUS DANI
- Kecocokan nama file: Cocok
- Alamat: JL. PRONA III
- RT/RW: 018/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`YUSTINUS DANI APRIANTO`) | app members 4 vs scan 2 | matched names 1

**Anggota (2):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | RISTIANTI. S | 6402136004810002 | - | / | - | - | - | - |
| - | (4 JMYKIANDRA ROSELLA DAN! | 6471014707160001 | - | / | - | - | - | - |

### KUB 2 - YUSUF-KARTU KELUARGA.jpg

- Confidence OCR: **29**
- Nomor KK: 6402068112130001
- Nama Kepala Keluarga: YUSUF AJUSE
- Kecocokan nama file: Cocok
- Alamat: JL. KEMUNING ASRAMA POLISI
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: - | Provinsi: - | Kode Pos: 76518
- Tgl dikeluarkan: 05-08-2021
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 05 | JVINCENCIA MERRY AJUSE .... .. | 6402068112130001 | PEREMPUAN | / | - | TENGGARONG Jen Aa2nia JRATON  JBELUM TAMAT SOSEDERAIAT | - | - |

### KUB 2 - YUSUF-KK.jpg

- Confidence OCR: **29**
- Nomor KK: 6402068112130001
- Nama Kepala Keluarga: YUSUF AJUSE
- Kecocokan nama file: Cocok
- Alamat: JL. KEMUNING ASRAMA POLISI
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: - | Provinsi: - | Kode Pos: 76518
- Tgl dikeluarkan: 05-08-2021
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 05 | JVINCENCIA MERRY AJUSE .... .. | 6402068112130001 | PEREMPUAN | / | - | TENGGARONG Jen Aa2nia JRATON  JBELUM TAMAT SOSEDERAIAT | - | - |

### KUB 3 - ANA E. YAYUK SUPRAPTININGSIH-KARTU KELUARGA.jpg

- Confidence OCR: **47**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: ANA. E. YAYUK SUPRAPTININGSIH
- Kecocokan nama file: Cocok
- Alamat: JL.MARSMA R ISWAHYUDI GG MELAI I NO. 39
- RT/RW: 020/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`ANA. E. YAYUK SUPRAPTININGSIH`) | app members 1 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 3 - ANDRIAS DANU MUKTIANTO - KARTU KELUARGA.jpg

- Confidence OCR: **19**
- Nomor KK: 6471044408840005
- Nama Kepala Keluarga: m. dani : onar cuane - DalamKelunngo Kenerpenegaraan, armenegeraan Dokumen Imigrasi ml and,
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: KO TABAL KP PAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 3 | matched names 0

**Anggota (3):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 05 | m. dani : onar cuane - DalamKelunngo Kenerpenegaraan, armenegeraan Dokumen Imigrasi ml and, | 5555555555555551 | - | / | - | - | - | - |
| - | bee : MUK TAN na | 6471044408840005 | - | / | - | PEREI Se Mei TA-410-1083 TKA ee sasaa De an BD ES | - | - |
| - | Da 55 5555555. .... Lo. .. | 1551155555555554 | - | / | - | - | - | - |

### KUB 3 - ANTHANOSIUS KOEN BROTO.D - KARTU KELUARGA.jpg

- Confidence OCR: **43**
- Nomor KK: 6471050205790010
- Nama Kepala Keluarga: ANTHANOSIUS KOEN BROTO. D
- Kecocokan nama file: Cocok
- Alamat: JL.PRONA Ill PERUM BUKIT PRONA INDAH BLOK V/9
- RT/RW: 053/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`anthanosius koen broto driyatmo`) | app members 4 vs scan 2 | matched names 0

**Anggota (2):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 01 | JANTHANOSIUS KOENBROTO.D | 6471050205790010 | - | / | - | LAKHLAK Jwonosir -  . . Jomostera JKAmOLK - JolOMAMSmATAr . JaRvawanemasia je | - | - |
| - | 3 JERANSISCA GISELLA AYU RAHMADANI -- | 6471054204050004 | PEREMPUAN | / | - | (PEREMPUAN SLEMAN - Jomoaanos JKAmMOUK  JEEUMTAMATSOSEDERAAT  . JPELAMRMAHASISNA ...... | - | - |

### KUB 3 - C.PURWONGGO SATOTO - KARTU KELUARGA.jpg

- Confidence OCR: **40**
- Nomor KK: 5471052307150005
- Nama Kepala Keluarga: C. PURWONGGO SATOTO
- Kecocokan nama file: Cocok
- Alamat: PERUM BUKIT PRONA INDAH JL. ANGGREK BLOK ANO.7 -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: 14-09-2021
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | ETAP 3 No- | 5471052307150005 | - | / | - | - | - | - |

### KUB 3 - EMANUEL GIDION ADINURCAHYO - KARTU KELUARGA.jpg

- Confidence OCR: **14**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: is N, / Bb if Ai Shan AG ii, ADINL JRCAH BP YO Aa Aa
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIK A Ll . | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | is N, / Bb if Ai Shan AG ii, ADINL JRCAH BP YO Aa Aa | 5555555555555555 | - | / | - | - | - | - |

### KUB 3 - HADI SUJONO - KARTU KELUARGA.jpg

- Confidence OCR: **45**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 3 - JANSON SARAGIH - KARTU KELUARGA.jpg

- Confidence OCR: **43**
- Nomor KK: 6471052709120093
- Nama Kepala Keluarga: . NAS No.
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`. NAS No.`) | app members 6 vs scan 3 | matched names 2

**Anggota (3):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 03 | . NAS No. | 6471052709120093 | - | / | - | - | - | - |
| - | FENESIA FRISKA SINURAT, S.PD | 8471054902779004 | PEREMPUAN | LUMBAN SINURAT / 99-02-1977 | KATHOLIK | - | - | - |
| - | PASCAL FRIZZY ANJAS SIMARMATA | 6471051504060001 | LAKI-LAKI | BALIKPAPAN / 15-04-2005 | - | TDK SEKOLAH TIDAK BEKERJA | - | - |

### KUB 3 - JHONSON RAJA GUKGUK - KARTU KELUARGA.jpg

- Confidence OCR: **29**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 3 - JONNI SINAGA - KARTU KELUARGA.jpg

- Confidence OCR: **40**
- Nomor KK: 1801085808610002
- Nama Kepala Keluarga: JONNI SINAGA
- Kecocokan nama file: Cocok
- Alamat: JL. BUKIT PRONA INDAH BLOK N NO. 26
- RT/RW: 053/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 02 | INETTIGIRSANG | 1801085808610002 | PEREMPUAN | / | - | - | JPEREMPUAN(PEMATANGSIANTAR  Jisoeioei Jramour Jetaseperaar -  JMENGURUSRUMAH TANGGA JTIDAK | - |

### KUB 3 - MAGDALENA - KARTU KELUARGA.jpg

- Confidence OCR: **35**
- Nomor KK: 6402050803060001
- Nama Kepala Keluarga: MAGDALENA
- Kecocokan nama file: Cocok
- Alamat: PERUM BUKIT PRONA INDAH BLOK J NO. 10
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: 07-04-2022
- App: tidak ditemukan | app members 0 vs scan 3 | matched names 0

**Anggota (3):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 02 | JADEODATUS JOE ADNA SAYO. . . | 6402050803060001 | - | / | - | JARAK JBALKPAPAN -  jasonanog JKammOrk  . JEELUM TAMAT SDSEDERAAT | - | - |
| - | C3 JANJARSARI ASMARADHANA - . . . | 6402055305080001 | PEREMPUAN | / | - | - | - | - |
| - | Ca JALBERTUS AGUNG RAMA ANUGRAH | 6402052611150003 | - | / | - | - | - | - |

### KUB 3 - MANGAPUL MANIK - KARTU KELUARGA.jpg

- Confidence OCR: **42**
- Nomor KK: 6471051403540003
- Nama Kepala Keluarga: MANGAPUL MANIK
- Kecocokan nama file: Cocok
- Alamat: JL. PRONA III NO.62
- RT/RW: 054/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`MANGAPUL MANIK`) | app members 3 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | (TIJMANGAPULMANIK .. - | 6471051403540003 | - | / | - | is0s1054 - JKATHOLK - JAKADEMUDIPLOMA II/SARJANA MUDA | - | - |

### KUB 3 - POLONIUS DOSI MITEN-KARTU KELUARGA.jpg

- Confidence OCR: **24**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: POLONIUS DOSI MITEN
- Kecocokan nama file: Cocok
- Alamat: JL. TERATAI MERAH NO. 51
- RT/RW: 056/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`Polonius Dosi Miten`) | app members 3 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 3 - THEODORUS LEON-KARTU KELUARGA.jpeg

- Confidence OCR: **28**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 3 - THOMAS SAKINO - KARTU KELUARGA.jpg

- Confidence OCR: **41**
- Nomor KK: 6471050510840001
- Nama Kepala Keluarga: THOMAS SAKINO
- Kecocokan nama file: Cocok
- Alamat: JL.PRONA III NO.42
- RT/RW: 018/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`Thomas Sakino`) | app members 3 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | 3 JALBERTUS BENNY BIMO ATMOJO | 6471050510840001 | JLAKHLAKI Aa gp HEM pa an mn mag TE ana | / | - | - | - | - |

### KUB 3 - VERO DWI ANI-KARTU KELUARGA.jpg

- Confidence OCR: **43**
- Nomor KK: 8471051110120186
- Nama Kepala Keluarga: V. DWI ANY SETYANINGSIH
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: JL. PRONA II! GG. RUKUN NO.98 Ser EA --.-
- RT/RW: - | Kelurahan/Desa: SEPINGGAN | : So | Kecamatan: -
- Kabupaten/Kota: KOTA BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 4 | matched names 0

**Anggota (4):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 02 | V. DWI ANY SETYANINGSIH | 6471045893789003 | PEREMPUAN | MAGELANG / 13-99-1978 | KATHOLIK | - | - | ISTRI |
| 04 | NATALIA KAREN MANURUNG | 5471055812120094 | PEREMPUAN | BALIKPAPAN / 18-12-2012 | KATHOLIK | - | - | ANAK |
| 10 | 3 YOSEFA JANETT MAHARANI MANURUNG | 5471045503090002 | PEREMPUAN | / | KATHOLIK | TDK SEKOLAH TIDAK BEKERJA | - | - |
| - | SM No. | 8471051110120186 | - | / | - | - | - | - |

### KUB 4 - AGUSTINUS WASA - KARTU KELUARGA.jpg

- Confidence OCR: **41**
- Nomor KK: 7413030311230001
- Nama Kepala Keluarga: AGUSTINUS WASA
- Kecocokan nama file: Cocok
- Alamat: JL. SEPINGGAN RAYA NO. 01 "
- RT/RW: 018/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: 25-04-2024
- App: cocok (`AGUSTINUS WASA`) | app members 3 vs scan 3 | matched names 0

**Anggota (3):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 08 | ) N | 7413030311230001 | - | / | - | - | - | - |
| - | - | 6401084404020001 | - | / | - | - | - | - |
| - | - | 8471051404200005 | - | / | - | - | - | - |

### KUB 4 - AGUSTINUS WASA-KARTU KELUARGA.jpg

- Confidence OCR: **41**
- Nomor KK: 7413030311230001
- Nama Kepala Keluarga: AGUSTINUS WASA
- Kecocokan nama file: Cocok
- Alamat: JL. SEPINGGAN RAYA NO. 01 "
- RT/RW: 018/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: 25-04-2024
- App: cocok (`AGUSTINUS WASA`) | app members 3 vs scan 3 | matched names 0

**Anggota (3):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 08 | ) N | 7413030311230001 | - | / | - | - | - | - |
| - | - | 6401084404020001 | - | / | - | - | - | - |
| - | - | 8471051404200005 | - | / | - | - | - | - |

### KUB 4 - ANDI PUTRA LUBIS - KARTU KELUARGA.jpg

- Confidence OCR: **63**
- Nomor KK: 6472053112830060
- Nama Kepala Keluarga: (ARDELINA SINAGA
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: KOTA BALIKPAPAN | Provinsi: KALIMANTAN TIMUR | Kode Pos: -
- Tgl dikeluarkan: 17-04-2018
- App: cocok (`(ARDELINA SINAGA`) | app members 4 vs scan 4 | matched names 2

**Anggota (4):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 22 | (ARDELINA SINAGA | 1208294504820002 | PEREMPUAN | HUTA DOLOG / 05-04-1982 | - | - | KRISTEN SLTA/SEDERAJAT WIRASWASTA | - |
| 24 | NATHANAEL LUBIS | 6471051012170003 | LAKI - LAKI | BALIKPAPAN / 10-12-2017 | KATHOLIK | TDK SEKOLAH TIDAK BEKERJA | - | - |
| - | JA ANDI PUTRA LUBIS | 6472053112830060 | LAKI - LAKI | BATU BINUMBUN / 31-12-4983 | KATHOLIK | - | - | - |
| - | J3 NADMI DUNAMAITI! THERESIA LUBIS | 6472056407130002 | PEREMPUAN | SAMARINDA / 24-07-2013 | - | KRISTEN TDK SEKOLAH TIDAK BEKERJA | - | - |

### KUB 4 - ANGGOROWATI - KARTU KELUARGA.jpg

- Confidence OCR: **36**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN . | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 4 - BARNABAS MUHTAR - KARTU KELUARGA.jpg

- Confidence OCR: **37**
- Nomor KK: 6471053004080001
- Nama Kepala Keluarga: MUHTAR
- Kecocokan nama file: Cocok
- Alamat: JL. MARSMA R. ISWAHYUDI NO.39
- RT/RW: 009/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: 10-03-2025
- App: cocok (`MUHTAR`) | app members 5 vs scan 1 | matched names 1

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | VALENTINUS HENDY DEROSARI $ | 6471053004080001 | - | / | - | - | - | - |

### KUB 4 - BARNABAS MUKHTAR-KARTU KELUARGA.jpg

- Confidence OCR: **22**
- Nomor KK: 6471055807010002
- Nama Kepala Keluarga: 03 IVALENTINA YUHAINORA ROSARI -5... 1
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | 03 IVALENTINA YUHAINORA ROSARI -5... 1 | 6471055807010002 | PEREMPUAN | BALIKPAPAN AA / 18-07-2001 | KATHOLIK | - | - | - |

### KUB 4 - CHRISTIAN KUSUMA - KARTU KELUARGA.jpg

- Confidence OCR: **64**
- Nomor KK: 6471050909090037
- Nama Kepala Keluarga: CHRISTIAN KUSUMA
- Kecocokan nama file: Cocok
- Alamat: JL. JEND. SUDIRMAN BLOK A NO. 27
- RT/RW: - | Kelurahan/Desa: KLANDASAN ULU | Kecamatan: -
- Kabupaten/Kota: KOTA BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: 02-07-2015
- App: cocok (`Christian kusuma`) | app members 3 vs scan 5 | matched names 1

**Anggota (5):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 01 | (CHRISTIAN KUSUMA | 6471051406730004 | LAKI - LAKI | BALIKPAPAN / 14-06-1973 | KATHOLIK | DIPLOMAIV/S | KARYAWAN SWASTA | KEPALA KELUARGA |
| 02 | LIEWINA PRASETIO | 6471056005820019 | PEREMPUAN | SITUBONDO / 20-05-1982 | KATHOLIK | - | - | ISTRI |
| 03 | LONEL SEBASTIAN KUSUMA | 6471052607100003 | LAKI - LAKI | BALIKPAPAN / 26-07-2019 | KATHOLIK | - | - | ANAK |
| 04 | CELINE NATANIA KUSUMA | 6471066604130001 | PEREMPUAN | BALIKPAPAN / 26-04-2013 | KATHOLIK | TDK SEKOLAH TIDAK BEKERJA | - | ANAK |
| - | Ai Mo. | 6471050909090037 | - | / | - | - | - | - |

### KUB 4 - CHRISTIAN KUSUMA-KARTU KELUARGA.jpg

- Confidence OCR: **64**
- Nomor KK: 6471050909090037
- Nama Kepala Keluarga: CHRISTIAN KUSUMA
- Kecocokan nama file: Cocok
- Alamat: JL. JEND. SUDIRMAN BLOK A NO. 27
- RT/RW: - | Kelurahan/Desa: KLANDASAN ULU | Kecamatan: -
- Kabupaten/Kota: KOTA BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: 02-07-2015
- App: cocok (`Christian kusuma`) | app members 3 vs scan 5 | matched names 1

**Anggota (5):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 01 | (CHRISTIAN KUSUMA | 6471051406730004 | LAKI - LAKI | BALIKPAPAN / 14-06-1973 | KATHOLIK | DIPLOMAIV/S | KARYAWAN SWASTA | KEPALA KELUARGA |
| 02 | LIEWINA PRASETIO | 6471056005820019 | PEREMPUAN | SITUBONDO / 20-05-1982 | KATHOLIK | - | - | ISTRI |
| 03 | LONEL SEBASTIAN KUSUMA | 6471052607100003 | LAKI - LAKI | BALIKPAPAN / 26-07-2019 | KATHOLIK | - | - | ANAK |
| 04 | CELINE NATANIA KUSUMA | 6471066604130001 | PEREMPUAN | BALIKPAPAN / 26-04-2013 | KATHOLIK | TDK SEKOLAH TIDAK BEKERJA | - | ANAK |
| - | Ai Mo. | 6471050909090037 | - | / | - | - | - | - |

### KUB 4 - DHARMA PRIYADI - KARTU KELUARGA.jpg

- Confidence OCR: **60**
- Nomor KK: 6471052703090028
- Nama Kepala Keluarga: DHARMA PRIYADI, SE
- Kecocokan nama file: Cocok
- Alamat: JL. MARSMA R. ISWAHYUDI : :
- RT/RW: - | Kelurahan/Desa: SEPINGGAN RAYA | Kecamatan: -
- Kabupaten/Kota: KOTA BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 4 | matched names 0

**Anggota (4):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 01 | 2 ANYU MAWARTI | 8471054109740902 | PEREMPUAN | SEMARANG / 01-09-1974 | KATHOLIK | - | - | - |
| 04 | BRIGITTA AURELLIA MAHARANI | 6471054708110002 | PEREMPUAN | BALIKPAPAN / 07-08-2011 | KATHOLIK | TDK SEKOLAH TIDAK BEKERJA | - | ANAK |
| 93 | VINSENSIUS YUDA PRATAMA | 6471051102090001 | LAKI -LAKI | BALIKPAPAN / 11-02-2009 | KATHOLIK | TDK SEKOLAH TIDAK BEKERJA ' | - | - |
| - | ae No. | 6471052703090028 | - | / | - | - | - | - |

### KUB 4 - DHARMA PRIYADI-KARTU KELUARGA.jpg

- Confidence OCR: **60**
- Nomor KK: 6471052703090028
- Nama Kepala Keluarga: DHARMA PRIYADI, SE
- Kecocokan nama file: Cocok
- Alamat: JL. MARSMA R. ISWAHYUDI : :
- RT/RW: - | Kelurahan/Desa: SEPINGGAN RAYA | Kecamatan: -
- Kabupaten/Kota: KOTA BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 4 | matched names 0

**Anggota (4):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 01 | 2 ANYU MAWARTI | 8471054109740902 | PEREMPUAN | SEMARANG / 01-09-1974 | KATHOLIK | - | - | - |
| 04 | BRIGITTA AURELLIA MAHARANI | 6471054708110002 | PEREMPUAN | BALIKPAPAN / 07-08-2011 | KATHOLIK | TDK SEKOLAH TIDAK BEKERJA | - | ANAK |
| 93 | VINSENSIUS YUDA PRATAMA | 6471051102090001 | LAKI -LAKI | BALIKPAPAN / 11-02-2009 | KATHOLIK | TDK SEKOLAH TIDAK BEKERJA ' | - | - |
| - | ae No. | 6471052703090028 | - | / | - | - | - | - |

### KUB 4 - EKO ADINUGROHO - KARTU KELUARGA.jpg

- Confidence OCR: **45**
- Nomor KK: 6471051609620004
- Nama Kepala Keluarga: EKO ADINUGROHO
- Kecocokan nama file: Cocok
- Alamat: JL. KOL. SYARIFUDIN YOES NO.30
- RT/RW: 013/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 4 | matched names 0

**Anggota (4):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 01 | 4 JMONICA GRACIELA ADINUGROHO | 6471057008020007 | perempuan | / | - | - | - | - |
| - | 1 JEKO ADINUGROHO | 6471051609620004 | - | / | - | - | JuAKartaseLaTAN  Jisootoe2 Jrarmorik  Joetomamsiarai -  Jkaryawanewasia oo jo | - |
| - | JESSY SANDRA INKIRIWANG | 6471057006710001 | - | / | - | - | JeerempuanJmanano -  Jaooeiora Jrammorir Jetasemeraar -  JMenGurusrumaitaneGa jo | - |
| - | 3 JCHINTYA ANGELINA ADINUGROHO | 6471054509960001 | - | / | - | - | - | - |

### KUB 4 - EKO ADINUGROHO-KARTU KELUARGA.jpg

- Confidence OCR: **45**
- Nomor KK: 6471051609620004
- Nama Kepala Keluarga: EKO ADINUGROHO
- Kecocokan nama file: Cocok
- Alamat: JL. KOL. SYARIFUDIN YOES NO.30
- RT/RW: 013/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 4 | matched names 0

**Anggota (4):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 01 | 4 JMONICA GRACIELA ADINUGROHO | 6471057008020007 | perempuan | / | - | - | - | - |
| - | 1 JEKO ADINUGROHO | 6471051609620004 | - | / | - | - | JuAKartaseLaTAN  Jisootoe2 Jrarmorik  Joetomamsiarai -  Jkaryawanewasia oo jo | - |
| - | JESSY SANDRA INKIRIWANG | 6471057006710001 | - | / | - | - | JeerempuanJmanano -  Jaooeiora Jrammorir Jetasemeraar -  JMenGurusrumaitaneGa jo | - |
| - | 3 JCHINTYA ANGELINA ADINUGROHO | 6471054509960001 | - | / | - | - | - | - |

### KUB 4 - FRANSISKUS GATOT ARIANTO - KARTU KELUARGA.jpg

- Confidence OCR: **41**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: FRANSISKUS GATOT ARIANTO
- Kecocokan nama file: Cocok
- Alamat: JL. MAYJEND. SUTOYO
- RT/RW: 053/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: i TAN RT | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 4 - FRANSISKUS GATOT ARIANTO-KARTU KELUARGA.jpg

- Confidence OCR: **41**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: FRANSISKUS GATOT ARIANTO
- Kecocokan nama file: Cocok
- Alamat: JL. MAYJEND. SUTOYO
- RT/RW: 053/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: i TAN RT | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 4 - IMMANUELLA GARCIA ADIYANI - KARTU KELUARGA.jpg

- Confidence OCR: **30**
- Nomor KK: 6471054908950004
- Nama Kepala Keluarga: IMMANUELLA GARCIA ADIYANI
- Kecocokan nama file: Cocok
- Alamat: JL. MARSMA ISWAHYUDI NO.15
- RT/RW: 016/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 02 | JGABRIELLA AUGUSTALITA | 6471054908950004 | PEREMPUAN | / | - | - | - | - |

### KUB 4 - IMMANUELLA GARCIA ADIYANI-KARTU KELUARGA.jpg

- Confidence OCR: **30**
- Nomor KK: 6471054908950004
- Nama Kepala Keluarga: IMMANUELLA GARCIA ADIYANI
- Kecocokan nama file: Cocok
- Alamat: JL. MARSMA ISWAHYUDI NO.15
- RT/RW: 016/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 02 | JGABRIELLA AUGUSTALITA | 6471054908950004 | PEREMPUAN | / | - | - | - | - |

### KUB 4 - KANISIUS KASI - KARTU KELUARGA.jpg

- Confidence OCR: **37**
- Nomor KK: 5307171006210001
- Nama Kepala Keluarga: KANISIUS KASI
- Kecocokan nama file: Cocok
- Alamat: JL MARSMA R ISWAHYUDI NO 01
- RT/RW: 015/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 4 | matched names 0

**Anggota (4):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 02 | NURHAYATIi TJ | 5313054506900002 | perempuan | / | - | - | Jperempuan malaysia  - Josoeieoo  JKAMOLIK  JIAMATSOSEDERAAT  .- JMENGURUSRUMAHTANGGA ...... TIDAK TAHU | - |
| 03 | JBENIDIKTUS WILIAM WANGGE KASI - - -- | 5307170503190001 | - | / | - | - | Jiaxriari Jeaikparan - Josos2019  JKAmoLK  JUDAKBELUMSEKOLAH JEELUMTIDAK BEKERJA... JaIDAK TAHU | - |
| 04 | JGAYLINA KENNETH OCTAVIA AUREL KASI - --- | 6471055110220005 | PEREMPUAN | / | - | - | itt02022 JKATMOLK  JUDAKBELUMSEKOLAH  - JBELUMTIDAK BEKERJA. JEDAKTANU | - |
| - | DE N | 5307171006210001 | - | / | - | - | - | - |

### KUB 4 - KANISIUS KASI-KARTU KELUARGA.jpg

- Confidence OCR: **37**
- Nomor KK: 5307171006210001
- Nama Kepala Keluarga: KANISIUS KASI
- Kecocokan nama file: Cocok
- Alamat: JL MARSMA R ISWAHYUDI NO 01
- RT/RW: 015/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 4 | matched names 0

**Anggota (4):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 02 | NURHAYATIi TJ | 5313054506900002 | perempuan | / | - | - | Jperempuan malaysia  - Josoeieoo  JKAMOLIK  JIAMATSOSEDERAAT  .- JMENGURUSRUMAHTANGGA ...... TIDAK TAHU | - |
| 03 | JBENIDIKTUS WILIAM WANGGE KASI - - -- | 5307170503190001 | - | / | - | - | Jiaxriari Jeaikparan - Josos2019  JKAmoLK  JUDAKBELUMSEKOLAH JEELUMTIDAK BEKERJA... JaIDAK TAHU | - |
| 04 | JGAYLINA KENNETH OCTAVIA AUREL KASI - --- | 6471055110220005 | PEREMPUAN | / | - | - | itt02022 JKATMOLK  JUDAKBELUMSEKOLAH  - JBELUMTIDAK BEKERJA. JEDAKTANU | - |
| - | DE N | 5307171006210001 | - | / | - | - | - | - |

### KUB 4 - LAMBRITA TADIUS - KARTU KELUARGA.jpg

- Confidence OCR: **44**
- Nomor KK: 6471050406810012
- Nama Kepala Keluarga: LA MBIRITA TADIYUS
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: JL. MARSMA R. ISWAHYUDI NO. 14
- RT/RW: 008/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`La mbirita tadiyus`) | app members 5 vs scan 6 | matched names 2

**Anggota (6):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | LA MBIRITA TADIYUS | 6471050406810012 | - | / | - | - | - | - |
| - | 2 JYANI ANASTASIA | 6471055807880007 | - | / | - | - | - | - |
| - | IWEN INESTO | 6471050504050004 | - | / | - | - | - | - |
| - | 4 IREFLY YUSDIANI | 6471052608060007 | - | / | - | - | - | - |
| - | 5 JANITA YUSDIYANI | 6471056308140003 | - | / | - | - | - | - |
| - | 6 JDERIEL SHACEL YUSDIANI | 6471051001260002 | - | / | - | - | - | - |

### KUB 4 - LAMBRITA TADIUS-KARTU KELUARGA.jpg

- Confidence OCR: **44**
- Nomor KK: 6471050406810012
- Nama Kepala Keluarga: LA MBIRITA TADIYUS
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: JL. MARSMA R. ISWAHYUDI NO. 14
- RT/RW: 008/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`La mbirita tadiyus`) | app members 5 vs scan 6 | matched names 2

**Anggota (6):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | LA MBIRITA TADIYUS | 6471050406810012 | - | / | - | - | - | - |
| - | 2 JYANI ANASTASIA | 6471055807880007 | - | / | - | - | - | - |
| - | IWEN INESTO | 6471050504050004 | - | / | - | - | - | - |
| - | 4 IREFLY YUSDIANI | 6471052608060007 | - | / | - | - | - | - |
| - | 5 JANITA YUSDIYANI | 6471056308140003 | - | / | - | - | - | - |
| - | 6 JDERIEL SHACEL YUSDIANI | 6471051001260002 | - | / | - | - | - | - |

### KUB 4 - MARIA EMAKULATA MEI - KARTU KELUARGA.jpg

- Confidence OCR: **38**
- Nomor KK: 6409045505840005
- Nama Kepala Keluarga: MARIA EMAKULATA MEI
- Kecocokan nama file: Cocok
- Alamat: -
- RT/RW: 022/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`Maria Emakulata Mei`) | app members 1 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | (1JMARIAEMAKULATAMEI - | 6409045505840005 | - | / | - | - | - | - |

### KUB 4 - MARIA EMAKULATA MEI-KARTU KELUARGA.jpg

- Confidence OCR: **38**
- Nomor KK: 6409045505840005
- Nama Kepala Keluarga: MARIA EMAKULATA MEI
- Kecocokan nama file: Cocok
- Alamat: -
- RT/RW: 022/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`Maria Emakulata Mei`) | app members 1 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | (1JMARIAEMAKULATAMEI - | 6409045505840005 | - | / | - | - | - | - |

### KUB 4 - MARKUS HENDRIK - KARTU KELUARGA.jpg

- Confidence OCR: **45**
- Nomor KK: 6471052011090035
- Nama Kepala Keluarga: ANJELINA AGATHA :
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: JL. MARSMA R. ISWAHYUDI NO. 08 : SAS
- RT/RW: - | Kelurahan/Desa: SEFINGGAN RAYA SA as : - | Kecamatan: -
- Kabupaten/Kota: - | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`ANJELINA AGATHA :`) | app members 4 vs scan 5 | matched names 1

**Anggota (5):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 05 | ANJELINA AGATHA : | 6471055612130002 | PEREMPUAN | BALIKPAPAN / 18-12-2013 | KATHOLIK | TDK SEKOLAH | TIDAK BEKERJA La | - |
| 81 | IMARKUS HENDRIK | 5471051511690004 | LAKI - LAKI | BUTON So... / 15-11-1969 | KATHOLIK | - | - | - |
| 94 | BARTHOLOMEUS BARCOLES | 5471959794020995 | LAKI - LAKI | BALIKPAPAN / 07-04-2002 | KATHOLIK | TDK SEKOLAH | TIDAK BEKERJA | - |
| - | NN No. | 6471052011090035 | - | / | - | - | - | - |
| - | G5 CRISTOPORUS COLOMBUS : | 6471050208000004 | LAKI- LAKI | SALIKPAPAN / 02-06-2000 | KATHOLIK | SD/SEDERAJAT IPELAJARMAHASISWA 1... | - | - |

### KUB 4 - MARKUS HENDRIK-KARTU KELUARGA.jpg

- Confidence OCR: **45**
- Nomor KK: 6471052011090035
- Nama Kepala Keluarga: ANJELINA AGATHA :
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: JL. MARSMA R. ISWAHYUDI NO. 08 : SAS
- RT/RW: - | Kelurahan/Desa: SEFINGGAN RAYA SA as : - | Kecamatan: -
- Kabupaten/Kota: - | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`ANJELINA AGATHA :`) | app members 4 vs scan 5 | matched names 1

**Anggota (5):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 05 | ANJELINA AGATHA : | 6471055612130002 | PEREMPUAN | BALIKPAPAN / 18-12-2013 | KATHOLIK | TDK SEKOLAH | TIDAK BEKERJA La | - |
| 81 | IMARKUS HENDRIK | 5471051511690004 | LAKI - LAKI | BUTON So... / 15-11-1969 | KATHOLIK | - | - | - |
| 94 | BARTHOLOMEUS BARCOLES | 5471959794020995 | LAKI - LAKI | BALIKPAPAN / 07-04-2002 | KATHOLIK | TDK SEKOLAH | TIDAK BEKERJA | - |
| - | NN No. | 6471052011090035 | - | / | - | - | - | - |
| - | G5 CRISTOPORUS COLOMBUS : | 6471050208000004 | LAKI- LAKI | SALIKPAPAN / 02-06-2000 | KATHOLIK | SD/SEDERAJAT IPELAJARMAHASISWA 1... | - | - |

### KUB 4 - MARTINUS SURATMIN - KARTU KELUARGA.jpg

- Confidence OCR: **31**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 4 - MARTINUS SURATMIN-KARTU KELUARGA.jpg

- Confidence OCR: **31**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 4 - PANDU RAMA YUDHA - KARTU KELUARGA.jpg

- Confidence OCR: **17**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: - | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 4 - PETRA KANISIA. D - KARTU KELUARGA.jpg

- Confidence OCR: **45**
- Nomor KK: 8471054508680009
- Nama Kepala Keluarga: PETRA KANISIA. D :
- Kecocokan nama file: Cocok
- Alamat: -
- RT/RW: 022/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: cocok (`PETRA KANISIA. D`) | app members 3 vs scan 1 | matched names 1

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | PETRA KANISIA. D | 8471054508680009 | pEREMPuAN | / | - | - | JpEREMPuAN Maumere Josoeiee  JKammouK  Jemeseoeraar - MenGuRuSRoman TANGGA je | - |

### KUB 4 - SIANTA IKWANTO - KARTU KELUARGA.jpg

- Confidence OCR: **40**
- Nomor KK: 6471052812070009
- Nama Kepala Keluarga: ) IKWANTO
- Kecocokan nama file: Cocok
- Alamat: JL MARSMA R.ISWAHYUDI NO. 12
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: 10-12-2015
- App: tidak ditemukan | app members 0 vs scan 3 | matched names 0

**Anggota (3):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 03 | ) IKWANTO | 6471055711070002 | PEREMPUAN | BALIKPAPAN / 17-11-2007 | KATHOLIK | - | - | - |
| 05 | UUS No. | 6471052812070009 | - | / | - | - | - | - |
| - | JOLISIANTAKWANTO | 6471042019660001 | LAKI-LAKI | SAMARINDA / 20-11-1966 | KATHOLIK | - | - | - |

### KUB 4 - SIANTA IKWANTO-KARTU KELUARGA.jpg

- Confidence OCR: **40**
- Nomor KK: 6471052812070009
- Nama Kepala Keluarga: ) IKWANTO
- Kecocokan nama file: Cocok
- Alamat: JL MARSMA R.ISWAHYUDI NO. 12
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: 10-12-2015
- App: tidak ditemukan | app members 0 vs scan 3 | matched names 0

**Anggota (3):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 03 | ) IKWANTO | 6471055711070002 | PEREMPUAN | BALIKPAPAN / 17-11-2007 | KATHOLIK | - | - | - |
| 05 | UUS No. | 6471052812070009 | - | / | - | - | - | - |
| - | JOLISIANTAKWANTO | 6471042019660001 | LAKI-LAKI | SAMARINDA / 20-11-1966 | KATHOLIK | - | - | - |

### KUB 4 - WIHELMUS WEKI - KARTU KELUARGA.jpg

- Confidence OCR: **32**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: JL. WIYATA NO 105
- RT/RW: 022/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 4 - WIHELMUS WEKI-KARTU KELUARGA.jpg

- Confidence OCR: **32**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: _(tidak terbaca)_
- Kecocokan nama file: n/a
- Alamat: JL. WIYATA NO 105
- RT/RW: 022/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 0 | matched names 0

**Anggota (0):**

_(tidak ada anggota terbaca)_

### KUB 4 - YONAS SORRO - KARTU KELUARGA.jpg

- Confidence OCR: **30**
- Nomor KK: _(tidak terbaca)_
- Nama Kepala Keluarga: Lajomvemuonma
- Kecocokan nama file: **TIDAK COCOK**
- Alamat: -
- RT/RW: - | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: RENDAM | Provinsi: - | Kode Pos: 98121
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 2 | matched names 0

**Anggota (2):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| - | Lajomvemuonma | 0871068808650001 | PEREMPUAN | / | - | H08.1885 /KATMOLIK AKADEMIDIPLOMA MBARJANA MUDA | KARYAWAN SWASTA | - |
| - | Jajmoaawikaran Oo I | 7671066200860009 | PEREMPUAN | / | KATHOLIK | - | KARYAWAN BWABTA 1. | - |

### KUB 4 - YOSEFA PRATIWI WINARTI - KARTU KELUARGA.jpg

- Confidence OCR: **32**
- Nomor KK: 6471056609730008
- Nama Kepala Keluarga: YOSEFA! ?ATIWI WINARTI
- Kecocokan nama file: Cocok
- Alamat: JL. MARS IA R ISWAHYUDI NO.399
- RT/RW: 012/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: KOTA BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 01 | JYOSELA PRATIWI WINARTI ( | 6471056609730008 | PEREMPUAN | / | - | BALiKeApAN - Jasoosora Jamorik - JAKADEMUDIPLOMANISARJANAMUDA | MENGURUS RUMAH TANGGA JA | ANAK |

### KUB 4 - YOSEFA PRATIWI WINARTI-KARTU KELUARGA.jpg

- Confidence OCR: **32**
- Nomor KK: 6471056609730008
- Nama Kepala Keluarga: YOSEFA! ?ATIWI WINARTI
- Kecocokan nama file: Cocok
- Alamat: JL. MARS IA R ISWAHYUDI NO.399
- RT/RW: 012/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: KOTA BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 1 | matched names 0

**Anggota (1):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 01 | JYOSELA PRATIWI WINARTI ( | 6471056609730008 | PEREMPUAN | / | - | BALiKeApAN - Jasoosora Jamorik - JAKADEMUDIPLOMANISARJANAMUDA | MENGURUS RUMAH TANGGA JA | ANAK |

### KUB 4 - YUSTINUS PAULUS PAIDI - KARTU KELUARGA.jpg

- Confidence OCR: **34**
- Nomor KK: 6471054806560001
- Nama Kepala Keluarga: YUSTINUS PAULUS PAIDI
- Kecocokan nama file: Cocok
- Alamat: JL. MARSMA. R. ISWAHYUDI
- RT/RW: 003/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 3 | matched names 0

**Anggota (3):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 02 | JVALENTINA SULASTRI | 6471054806560001 | PEREMPUAN | / | - | (PEREMPUAN JSANGASANGA - .- Josostase  JKATHOLK - JSITASEDERAAT TT  JuenGuusmaman mangan Re) | - | - |
| 03 | JA GUNAWAN. TS. SE | 6471051004760004 | JEnGLAKI JEAKPAPAN - jiooiiore - JKAMOLK JAKABEMDPLOMA SARANA MUDA JKARYAWANSAASTA le | / | - | - | - | - |
| 04 | ISELVI SEPTIANI RAMADHAN! --- - | 6471046209070002 | PEREMPUAN | / | ISLAM | - | - | - |

### KUB 4 - YUSTINUS PAULUS PAIDI-KARTU KELUARGA.jpg

- Confidence OCR: **34**
- Nomor KK: 6471054806560001
- Nama Kepala Keluarga: YUSTINUS PAULUS PAIDI
- Kecocokan nama file: Cocok
- Alamat: JL. MARSMA. R. ISWAHYUDI
- RT/RW: 003/- | Kelurahan/Desa: - | Kecamatan: -
- Kabupaten/Kota: BALIKPAPAN | Provinsi: - | Kode Pos: -
- Tgl dikeluarkan: -
- App: tidak ditemukan | app members 0 vs scan 3 | matched names 0

**Anggota (3):**

| # | Nama | NIK | JK | Tempat/Tgl lahir | Agama | Pendidikan | Pekerjaan | Status |
|---|---|---|---|---|---|---|---|---|
| 02 | JVALENTINA SULASTRI | 6471054806560001 | PEREMPUAN | / | - | (PEREMPUAN JSANGASANGA - .- Josostase  JKATHOLK - JSITASEDERAAT TT  JuenGuusmaman mangan Re) | - | - |
| 03 | JA GUNAWAN. TS. SE | 6471051004760004 | JEnGLAKI JEAKPAPAN - jiooiiore - JKAMOLK JAKABEMDPLOMA SARANA MUDA JKARYAWANSAASTA le | / | - | - | - | - |
| 04 | ISELVI SEPTIANI RAMADHAN! --- - | 6471046209070002 | PEREMPUAN | / | ISLAM | - | - | - |

---
Catatan: field yang tidak terbaca dapat diverifikasi dari `scripts/scan-results.json` (memuat teks OCR mentah per file).