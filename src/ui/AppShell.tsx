// ============================================================================
// App Shell — sidebar, top bar, dan area konten tunggal (Fase 8 §4.4–4.8)
// ============================================================================

import { useEffect, useState, type ReactNode } from 'react';
import { useAplikasi, type AplikasiState } from '../state/store.ts';
import { parseRute, gotoRute, type Rute } from './router.ts';
import { clearAuth } from '../auth/auth.ts';
import { MENU, itemAktif, penandaBadge } from './nav.ts';
import PageHeader from './components/PageHeader.tsx';
import GlobalSearch from './components/GlobalSearch.tsx';
import SaveStatus from './components/SaveStatus.tsx';
import Toast from './components/Toast.tsx';
import ConfirmDialog from './components/ConfirmDialog.tsx';
import UndoPanel from './components/UndoPanel.tsx';
import Home from './screens/Home.tsx';
import Settings from './screens/Settings.tsx';
import Umat from './screens/Umat.tsx';
import KartuUmat from './screens/KartuUmat.tsx';
import Kk from './screens/Kk.tsx';
import KartuKK from './screens/KartuKK.tsx';
import Peristiwa from './screens/Peristiwa.tsx';
import Rekap from './screens/Rekap.tsx';
import Ekspor from './screens/Ekspor.tsx';
import Cadangan from './screens/Cadangan.tsx';
import Perubahan from './screens/Perubahan.tsx';
import Penanda from './screens/Penanda.tsx';
import Duplikat from './screens/Duplikat.tsx';
import Impor from './screens/Impor.tsx';
import LLM from './screens/LLM.tsx';
import ModeTabel from './screens/ModeTabel.tsx';

export default function AppShell() {
  const st = useAplikasi();
  const [rute, setRute] = useState<Rute>(() => parseRute(window.location.hash));
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const onHash = () => setRute(parseRute(window.location.hash));
    window.addEventListener('hashchange', onHash);
    onHash();
    const onEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && drawerOpen) setDrawerOpen(false);
    };
    window.addEventListener('keydown', onEsc);
    return () => {
      window.removeEventListener('hashchange', onHash);
      window.removeEventListener('keydown', onEsc);
    };
  }, [drawerOpen]);

  const siap = st.settings !== null;

  const breadcrumbs: { label: string; rute?: Rute }[] = [];
  if (rute.layar !== 'beranda') breadcrumbs.push({ label: 'Beranda', rute: { layar: 'beranda' } });
  if (rute.layar === 'umat' || rute.layar === 'kk' || rute.layar === 'peristiwa' || rute.layar === 'penanda') {
    const induk: Rute =
      rute.layar === 'umat' ? { layar: 'umat' } :
      rute.layar === 'kk' ? { layar: 'kk' } :
      rute.layar === 'peristiwa' ? { layar: 'peristiwa' } : { layar: 'penanda' };
    breadcrumbs.push({ label: judulSingkat(induk), rute: induk });
  }
  if (rute.id) breadcrumbs.push({ label: rute.id });
  if (rute.jenis) breadcrumbs.push({ label: rute.jenis });

  const layar = layarDariRute(rute, st);

  return (
    <div className="app-shell">
      <a href="#konten-utama" className="skip-link">
        Lewati ke konten utama
      </a>

      <aside
        className="app-sidebar"
        data-open={drawerOpen ? 'true' : 'false'}
        aria-label="Navigasi utama"
      >
        <div className="app-sidebar__brand">
          <div className="app-sidebar__brand-mark">A</div>
          <div>
            <div className="app-sidebar__brand-label">APPMI</div>
            <div className="app-sidebar__brand-env">
              {st.settings?.namaLingkungan || '—'} · {st.settings?.tahunStatistik ?? 2026}
            </div>
          </div>
        </div>
        <nav className="app-sidebar__nav">
          {MENU.map((grup) => (
            <div key={grup.label} className="nav__group">
              <div className="nav__group-label">{grup.label}</div>
              {grup.items.map((item) => {
                const aktif = itemAktif(item, rute);
                return (
                  <button
                    key={item.label}
                    className={`nav__item ${aktif ? 'nav__item--active' : ''}`}
                    onClick={() => {
                      gotoRute(item.rute);
                      setDrawerOpen(false);
                    }}
                  >
                    {item.label}
                    {item.rute.layar === 'penanda' && (
                      <span className="nav__badge">{penandaBadge(st.penanda)[item.rute.jenis ?? ''] ?? 0}</span>
                    )}
                  </button>
                );
              })}
            </div>
          ))}
        </nav>
        <div className="app-sidebar__footer">
          <div>Umat <b>{st.umat.length}</b> · KK <b>{st.kk.length}</b></div>
          <div style={{ fontSize: '0.75rem' }}>Terakhir tersimpan: <b>{st.terakhirTersimpan ?? 'belum'}</b></div>
        </div>
      </aside>

      <button
        className="app-sidebar__scrim"
        data-open={drawerOpen ? 'true' : 'false'}
        aria-label="Tutup navigasi"
        onClick={() => setDrawerOpen(false)}
      />

      <div className="app-main">
        <header className="app-topbar">
          <button
            className="app-topbar__menu"
            aria-expanded={drawerOpen}
            aria-controls="sidebar"
            onClick={() => setDrawerOpen(!drawerOpen)}
          >
            ☰
          </button>
          <div className="app-topbar__search">
            <GlobalSearch />
          </div>
          <div className="app-topbar__meta">
            <div className="app-topbar__env">
              {st.settings?.namaLingkungan || '—'}
            </div>
            <SaveStatus />
            <button className="btn btn--ghost btn--sm" onClick={() => { clearAuth(); window.location.reload(); }}>Keluar</button>
          </div>
        </header>

        <main className="page-content" id="konten-utama">
          <PageHeader
            breadcrumbs={breadcrumbs}
            judul={siap ? (breadcrumbs[breadcrumbs.length - 1]?.label ?? 'APPMI') : 'Pengaturan Lingkungan'}
            deskripsi={siap ? undefined : 'Atur nama lingkungan dan daftar KUB sebelum menggunakan fitur lain.'}
          />
          {!siap && rute.layar !== 'pengaturan' && rute.layar !== 'cadangan' && rute.layar !== 'llm' ? (
            <div className="empty-state">
              <h2 className="empty-state__title">Nama lingkungan belum diatur</h2>
              <p className="empty-state__body">
                Atur nama lingkungan dan daftar KUB di Pengaturan terlebih dahulu. Data tersimpan otomatis ke IndexedDB setiap perubahan.
              </p>
              <div className="cluster">
                <button className="btn btn--primary" onClick={() => gotoRute({ layar: 'pengaturan' })}>
                  Buka Pengaturan
                </button>
              </div>
            </div>
          ) : (
            layar
          )}
          <Toast />
          <ConfirmDialog />
          {st.statusSimpan === 'ada-perubahan' && st.canUndo() ? <UndoPanel /> : null}
        </main>
      </div>
    </div>
  );
}

function judulSingkat(r: Rute): string {
  if (r.layar === 'umat') return 'Umat';
  if (r.layar === 'kk') return 'Keluarga (KK)';
  if (r.layar === 'peristiwa') return 'Peristiwa';
  return 'Perlu Ditindaklanjuti';
}

function layarDariRute(r: Rute, st: AplikasiState): ReactNode {
  switch (r.layar) {
    case 'beranda': return <Home />;
    case 'pengaturan': return <Settings />;
    case 'cadangan': return <Cadangan st={st} />;
    case 'llm': return <LLM />;
    case 'modetabel': return <ModeTabel />;
    case 'umat': return r.id ? <KartuUmat id={r.id} /> : <Umat />;
    case 'kk': return r.id ? <KartuKK id={r.id} /> : <Kk />;
    case 'peristiwa': return <Peristiwa />;
    case 'rekap': return <Rekap st={st} />;
    case 'ekspor': return <Ekspor st={st} />;
    case 'impor': return <Impor />;
    case 'penanda': return <Penanda />;
    case 'duplikat': return <Duplikat />;
    case 'perubahan': return <Perubahan />;
  }
}
