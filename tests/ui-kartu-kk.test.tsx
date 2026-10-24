// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import { useAplikasi } from '../src/state/store.ts';
import KartuKK from '../src/ui/screens/KartuKK.tsx';
import type { Snapshot } from '../src/state/store.ts';

describe('KartuKK UI', () => {
  beforeEach(() => {
    const snap: Snapshot = {
      settings: { namaLingkungan: 'Lingkungan Test', daftarKUB: ['KUB 1'], tahunStatistik: 2026, tanggalAcuan: '31/12/2026' },
      umat: [],
      kk: [
        {
          id: 'KK0001',
          nomorKK: '123456',
          namaKepalaKeluarga: 'BUDI SANTOSO',
          alamat: 'JL. TEST',
          KUB: 'KUB 1',
          lampiran: [],
          rtRw: '001/002',
          kodePos: '76111',
          desaKelurahan: 'SEPINGGAN',
          kecamatan: 'BALIKPAPAN SELATAN',
          kabupatenKota: 'KOTA BALIKPAPAN',
          provinsi: 'KALIMANTAN TIMUR',
          tanggalDikeluarkan: '04/04/2019',
          fileSumber: 'BUDI - KARTU KELUARGA.jpg',
          namaFileScan: 'BUDI - KARTU KELUARGA.jpg',
          confidenceOcr: 0.87,
          catatanVerifikasi: 'perlu cek nama',
        },
      ],
      peristiwa: [],
      riwayat: [],
      audit: [],
      penanda: [],
      keputusanDuplikat: [],
      indeksUndo: 0,
    };
    useAplikasi.getState().muatDariSnapshot(snap);
  });

  it('menampilkan metadata KK hasil scan', () => {
    render(<KartuKK id="KK0001" />);
    expect(screen.getByText(/BUDI SANTOSO/)).toBeInTheDocument();
    expect(screen.getByText(/BUDI - KARTU KELUARGA\.jpg/)).toBeInTheDocument();
    expect(screen.getByText('87%')).toBeInTheDocument();
    expect(screen.getByText('SEPINGGAN')).toBeInTheDocument();
    expect(screen.getByText('perlu cek nama')).toBeInTheDocument();
  });
});