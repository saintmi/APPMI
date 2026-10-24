import { describe, it, expect } from 'vitest';
import { bacaKKSheet, normTanggal, normJK, normAgama, normKodePos } from '../scripts/convert-kk-scan-report.mjs';

describe('konverter scan KK', () => {
  it('normTanggal menormalisasi dd-mm-yyyy', () => {
    expect(normTanggal('4-4-2019')).toBe('04/04/2019');
    expect(normTanggal('-')).toBe('');
  });

  it('normJK dan normAgama', () => {
    expect(normJK('LAKI-LAKI')).toBe('Laki-laki');
    expect(normJK('PEREMPUAN')).toBe('Perempuan');
    expect(normAgama('KATHOLIK')).toBe('Katolik');
    expect(normKodePos('0')).toBe('');
  });

  it('bacaKKSheet membaca info dan anggota', () => {
    const json = [
      ['Nomor KK', '123456'],
      ['Nama Kepala Keluarga', 'BUDI SANTOSO'],
      ['Alamat', 'JL. TEST NO. 1'],
      ['KUB', 'KUB 2'],
      ['Confidence OCR', 87],
      ['No', 'Nama Lengkap', 'NIK', 'Jenis Kelamin', 'Tempat Lahir', 'Tanggal Lahir', 'Agama', 'Pendidikan', 'Jenis Pekerjaan', 'Golongan Darah', 'Status Perkawinan', 'Status Hubungan dalam Keluarga', 'Nama Ayah', 'Nama Ibu'],
      [1, 'BUDI SANTOSO', '6471000000000001', 'LAKI-LAKI', 'BALIKPAPAN', '01/01/1980', 'KATHOLIK', 'SLTA', 'KARYAWAN', 'A', 'KAWIN', 'KEPALA KELUARGA', 'AYAH', 'IBU'],
      [2, 'SITI', '6471000000000002', 'PEREMPUAN', 'BALIKPAPAN', '02/02/1982', 'KATHOLIK', 'SLTA', 'IBU RT', 'B', 'KAWIN', 'ISTRI', 'AYAH2', 'IBU2'],
    ];
    const parsed = bacaKKSheet(json);
    expect(parsed).not.toBeNull();
    expect(parsed.info['Nomor KK']).toBe('123456');
    expect(parsed.info['Nama Kepala Keluarga']).toBe('BUDI SANTOSO');
    expect(parsed.members).toHaveLength(2);
    expect(parsed.members[0].nama).toBe('BUDI SANTOSO');
    expect(parsed.members[0].jenisKelamin).toBe('Laki-laki');
    expect(parsed.members[1].statusHubunganKeluarga).toBe('ISTRI');
  });

  it('bacaKKSheet mengembalikan null jika Nomor KK atau kepala kosong', () => {
    const json = [['Alamat', 'JL. TEST']];
    expect(bacaKKSheet(json)).toBeNull();
  });
});