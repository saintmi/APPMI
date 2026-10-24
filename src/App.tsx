// ============================================================================
// App — inisialisasi aplikasi + App Shell (Fase 8)
// ============================================================================

import { useEffect } from 'react';
import { useAplikasi } from './state/store.ts';
import { muatAplikasi, aktifkanAutoSimpan, onSimpanDarurat } from './state/autoSave.ts';
import AppShell from './ui/AppShell.tsx';
import { isAuthenticated } from './auth/auth.ts';
import Login from './ui/screens/Login.tsx';

export default function App() {
  if (!isAuthenticated()) {
    return <Login />;
  }

  useEffect(() => {
    muatAplikasi();
    aktifkanAutoSimpan();

    onSimpanDarurat(() => {
      const e = (window as unknown as { __APPMI_EMERGENCY__?: { waktu: string } }).__APPMI_EMERGENCY__;
      if (e) {
        // Disimpan global agar UI (SaveStatus / toast) dapat menampilkannya.
        // Tidak diubah di sini agar referensi handler tetap stabil.
      }
    });

    const handler = (event: ErrorEvent) => {
      const st = useAplikasi.getState();
      try {
        const s = JSON.stringify({
          settings: st.settings,
          umat: st.umat,
          kk: st.kk,
          peristiwa: st.peristiwa,
          riwayat: st.riwayat,
          audit: st.audit,
          penanda: st.penanda,
          keputusanDuplikat: st.keputusanDuplikat,
        });
        localStorage.setItem('appmi-emergency-error', s);
        localStorage.setItem('appmi-emergency-waktu', new Date().toISOString());
        console.error('[darurat] error tak tertangani:', event.message);
      } catch {
        // biarkan
      }
    };

    window.addEventListener('error', handler);
    return () => {
      window.removeEventListener('error', handler);
    };
  }, []);

  return <AppShell />;
}

