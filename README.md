# APPMI — Statistik Umat Lingkungan

Aplikasi input & verifikasi statistik umat untuk satu lingkungan (paroki/kelurahan). Data tersimpan lokal di browser (IndexedDB), dapat dicadangkan ke file JSON atau sinkronkan ke repo GitHub privat (terenkripsi). Untuk pelayanan administrasi keumatagaan, bukan sistem informasi publik.

## Menjalankan secara lokal

```bash
npm install        # pasang dependensi
npm run dev        # jalankan server pengembangan (Vite)
npm run build      # buat produksi (tsc + vite)
npm test           # uji mesin, ekspor, dan kapasitas
npm run lint       # pemeriksaan kode
```

## Arsitektur (singkat)

- `src/engine` — aturan bisnis murni: status umat, rekap, penanda, duplikat, sinkron identitas, alokasi ID, tanggal.
- `src/state` — Zustand store: state, aksi, audit/undo, status simpan, pesan, konfirmasi.
- `src/export` — tambal template Excel (DATA UMAT, DATA KK, REKAP LINGKUNGAN).
- `src/import` — deteksi kolom + konversi baris dari berkas Excel/CSV.
- `src/ui/styles/global.css` — stylesheet tunggal (token, tata letak, komponen, responsif, cetak). Diimpor sekali dari `src/main.tsx`.
- `src/ui/AppShell.tsx` — shell: sidebar, top bar, pencarian global, status simpan.
- `src/ui/router.ts` — routing hash: `#/umat/:id`, `#/kk/:id`, `#/penanda/:jenis`, dst.

## Alur utama

1. Atur **Pengaturan** (nama lingkungan, daftar KUB) terlebih dahulu.
2. Masuk data via **Umat**, **KK**, dan **Peristiwa**.
3. Lihat angka di **Rekap** dan **Beranda**; perbaiki yang ditandai di **Perlu Ditindaklanjuti**.
4. **Ekspor** ke file Excel siap cetak; **Cadangkan** secara berkala.

## Catatan penting

- Data **tidak pernah keluar dari laptop** kecuali Anda mengunduh cadangan atau mengaktifkan sinkron Git terenkripsi.
- Kunci LLM (opsional) dimasukkan via UI atau `.env`; tidak disimpan ke disk.
- Lihat `docs/plan.md` untuk spesifikasi lengkap dan `docs/...` untuk artefak desain.

## Lisensi

Digunakan untuk administrasi keumatagaan lingkungan.
