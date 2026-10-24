export function rowToSettings(r: any) {
  return r ? {
    namaLingkungan: r.nama_lingkungan,
    daftarKUB: r.daftar_kub ?? [],
    tahunStatistik: r.tahun_statistik,
    tanggalAcuan: r.tanggal_acuan,
  } : null;
}

export function rowToKk(r: any) {
  return {
    id: r.id,
    nomorKK: r.nomor_kk,
    namaKepalaKeluarga: r.nama_kepala_keluarga,
    alamat: r.alamat,
    KUB: r.kub,
    rtRw: r.rt_rw ?? undefined,
    kodePos: r.kode_pos ?? undefined,
    desaKelurahan: r.desa_kelurahan ?? undefined,
    kecamatan: r.kecamatan ?? undefined,
    kabupatenKota: r.kabupaten_kota ?? undefined,
    provinsi: r.provinsi ?? undefined,
    tanggalDikeluarkan: r.tanggal_dikeluarkan ?? undefined,
    fileSumber: r.file_sumber ?? undefined,
    namaFileScan: r.nama_file_scan ?? undefined,
    confidenceOcr: r.confidence_ocr ?? undefined,
    catatanVerifikasi: r.catatan_verifikasi ?? undefined,
    lampiran: [] as any[],
  };
}

export function rowToUmat(r: any) {
  return {
    id: r.id,
    idKK: r.id_kk ?? '',
    nama: r.nama,
    jenisKelamin: r.jenis_kelamin,
    tanggalLahir: r.tanggal_lahir,
    agama: r.agama,
    status: r.status,
    KUB: r.kub,
    alamat: r.alamat,
    nik: r.nik ?? undefined,
    tempatLahir: r.tempat_lahir ?? undefined,
    pendidikan: r.pendidikan ?? undefined,
    pekerjaan: r.pekerjaan ?? undefined,
    golonganDarah: r.golongan_darah ?? undefined,
    statusPerkawinan: r.status_perkawinan ?? undefined,
    tanggalPerkawinan: r.tanggal_perkawinan ?? undefined,
    statusHubunganKeluarga: r.status_hubungan_keluarga ?? undefined,
    kewarganegaraan: r.kewarganegaraan ?? undefined,
    namaAyah: r.nama_ayah ?? undefined,
    namaIbu: r.nama_ibu ?? undefined,
    lampiran: [] as any[],
  };
}

export function rowToPeristiwa(r: any) {
  return {
    id: r.id,
    jenis: r.jenis,
    idUmat: r.id_umat ?? '',
    nama: r.nama,
    lingkungan: r.lingkungan,
    jenisKelamin: r.jenis_kelamin,
    tanggalLahir: r.tanggal_lahir,
    tanggal: r.tanggal ?? null,
    keterangan: r.keterangan,
  };
}

export function rowToRiwayat(r: any) {
  return {
    id: r.id,
    idUmat: r.id_umat ?? '',
    tanggal: r.tanggal,
    alamatLama: r.alamat_lama,
    KUBLama: r.kub_lama,
    alamatBaru: r.alamat_baru,
    KUBBaru: r.kub_baru,
  };
}

export function rowToAudit(r: any) {
  return {
    id: Number(r.id),
    waktu: r.waktu,
    aksi: r.aksi,
    entitas: r.entitas,
    idEntitas: r.id_entitas,
    sebelum: r.sebelum ?? null,
    sesudah: r.sesudah ?? null,
  };
}

export function rowToPenanda(r: any) {
  return {
    id: r.id,
    jenis: r.jenis,
    pesan: r.pesan,
    entitas: r.entitas,
    idEntitas: r.id_entitas,
    aktif: r.aktif,
  };
}

export function rowToKeputusan(r: any) {
  return {
    idPasangan: r.id_pasangan,
    idA: r.id_a,
    idB: r.id_b,
    keputusan: r.keputusan,
  };
}

export function rowToLampiran(r: any) {
  return {
    id: r.id,
    nama: r.nama,
    tipe: r.tipe,
    ukuran: Number(r.ukuran),
    sumber: r.sumber,
    idDrive: r.id_drive ?? undefined,
    diunggahPada: r.diunggah_pada,
    data: r.data_base64 ? { __type: 'ArrayBuffer', data: r.data_base64 } : undefined,
  };
}
