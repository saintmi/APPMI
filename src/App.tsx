import { useEffect, useState } from 'react';
import { muatAplikasi, aktifkanAutoSimpan, onSimpanDarurat } from './state/autoSave.ts';
import AppShell from './ui/AppShell.tsx';
import { ensureSession } from './auth/auth.ts';
import Login from './ui/screens/Login.tsx';

export default function App() {
  const [siap, setSiap] = useState(false);
  const [terautentikasi, setTerautentikasi] = useState(false);
  const [dataSiap, setDataSiap] = useState(false);

  useEffect(() => {
    ensureSession().then((ok) => {
      setTerautentikasi(ok);
      setSiap(true);
    });
  }, []);

  useEffect(() => {
    if (!terautentikasi) {
      setDataSiap(false);
      return;
    }
    let aktif = true;
    (async () => {
      try {
        await muatAplikasi();
      } finally {
        if (aktif) {
          aktifkanAutoSimpan();
          setDataSiap(true);
        }
      }
    })();

    onSimpanDarurat(() => {
      const e = (window as unknown as { __APPMI_EMERGENCY__?: { waktu: string } }).__APPMI_EMERGENCY__;
      if (e) {
        // Disimpan global agar UI (SaveStatus / toast) dapat menampilkannya.
      }
    });

    const handler = (event: ErrorEvent) => {
      console.error('[darurat] error tak tertangani:', event.message);
    };
    window.addEventListener('error', handler);
    return () => {
      aktif = false;
      window.removeEventListener('error', handler);
    };
  }, [terautentikasi]);

  if (!siap) return <div className="page-card" style={{ maxWidth: 420, margin: '80px auto' }}><div className="card"><div className="card__body">Memuat sesi...</div></div></div>;
  if (terautentikasi && !dataSiap) return <div className="page-card" style={{ maxWidth: 420, margin: '80px auto' }}><div className="card"><div className="card__body">Memuat data...</div></div></div>;
  if (!terautentikasi) return <Login />;
  return <AppShell />;
}
