// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import '@testing-library/jest-dom/vitest';
import { useAplikasi } from '../src/state/store.ts';
import Kk from '../src/ui/screens/Kk.tsx';
import type { Snapshot } from '../src/state/store.ts';

describe('navigasi daftar KK', () => {
  beforeEach(() => {
    window.location.hash = '#/kk';
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

  it('membuka detail KK saat klik ID, nomor, atau nama kepala keluarga', async () => {
    const user = userEvent.setup();
    cleanup();
    render(<Kk />);
    await user.click(screen.getByRole('button', { name: 'KK0001' }));
    expect(window.location.hash).toBe('#/kk/KK0001');

    window.location.hash = '#/kk';
    cleanup();
    render(<Kk />);
    await user.click(screen.getByRole('button', { name: '123456' }));
    expect(window.location.hash).toBe('#/kk/KK0001');

    window.location.hash = '#/kk';
    cleanup();
    render(<Kk />);
    await user.click(screen.getByRole('button', { name: 'BUDI SANTOSO' }));
    expect(window.location.hash).toBe('#/kk/KK0001');
  });
});