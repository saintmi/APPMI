// ============================================================================
// GlobalSearch — cari umat dan KK, buka Kartu Umat / Kartu KK (Fase 8 §4.8)
// ============================================================================

import { useState, useRef, useCallback } from 'react';
import { useAplikasi, umatDenganStatus } from '../../state/store.ts';
import { gotoRute, type Rute } from '../router.ts';

export default function GlobalSearch() {
  const st = useAplikasi();
  const [terbuka, setTerbuka] = useState(false);
  const [kata, setKata] = useState('');
  const [pilihan, setPilihan] = useState<{ jenis: 'umat' | 'kk'; label: string; rute: Rute }[]>([]);
  const [sorot, setSorot] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);

  const cari = useCallback(
    (q: string) => {
      const k = q.trim().toLowerCase();
      if (!k) { setPilihan([]); setSorot(-1); return; }
      const umat = umatDenganStatus(st);
      const hasil: { jenis: 'umat' | 'kk'; label: string; rute: Rute }[] = [];
      for (const u of umat) {
        if (
          u.id.toLowerCase().includes(k) ||
          u.nama?.toLowerCase().includes(k) ||
          u.KUB?.toLowerCase().includes(k) ||
          u.idKK?.toLowerCase().includes(k)
        ) {
          hasil.push({ jenis: 'umat', label: `${u.nama || '(tanpa nama)'} — ${u.id}`, rute: { layar: 'umat', id: u.id } });
          if (hasil.length >= 6) break;
        }
      }
      for (const kk of st.kk) {
        if (
          kk.id.toLowerCase().includes(k) ||
          kk.namaKepalaKeluarga?.toLowerCase().includes(k) ||
          kk.nomorKK?.toLowerCase().includes(k)
        ) {
          hasil.push({ jenis: 'kk', label: `${kk.namaKepalaKeluarga || 'Keluarga'} — ${kk.id}`, rute: { layar: 'kk', id: kk.id } });
          if (hasil.length >= 6) break;
        }
      }
      setPilihan(hasil);
      setSorot(0);
    },
    [st],
  );

  const pilih = (rute: Rute) => {
    gotoRute(rute);
    setTerbuka(false);
    setKata('');
    setPilihan([]);
    setSorot(-1);
  };

  const tekan = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') { setTerbuka(false); setKata(''); setPilihan([]); setSorot(-1); return; }
    if (e.key === 'ArrowDown') { e.preventDefault(); setSorot((s) => Math.min(s + 1, pilihan.length - 1)); return; }
    if (e.key === 'ArrowUp') { e.preventDefault(); setSorot((s) => Math.max(s - 1, 0)); return; }
    if (e.key === 'Enter') { e.preventDefault(); if (pilihan[sorot]) pilih(pilihan[sorot].rute); return; }
  };

  return (
    <div className="search">
      <input
        ref={inputRef}
        className="search__input"
        placeholder="Cari umat atau keluarga…"
        value={kata}
        onChange={(e) => {
          const v = e.target.value;
          setKata(v);
          setTerbuka(true);
          cari(v);
        }}
        onFocus={() => setTerbuka(true)}
        onBlur={() => setTimeout(() => setTerbuka(false), 150)}
        onKeyDown={tekan}
        aria-label="Cari umat atau keluarga"
      />
      {terbuka && pilihan.length > 0 && (
        <div className="search__results" role="listbox" aria-label="Hasil pencarian">
          {pilihan.map((h, i) => (
            <button
              key={JSON.stringify(h.rute)}
              className={`search__result ${sorot === i ? 'search__result--active' : ''}`}
              onClick={() => pilih(h.rute)}
            >
              {h.label}
              <span className="search__result-meta">{h.jenis === 'umat' ? 'Umat' : 'Keluarga'}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
