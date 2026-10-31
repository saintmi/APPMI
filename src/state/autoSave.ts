// ============================================================================
// Simpan otomatis + pemuatan awal + penanganan kegagalan (Fase 3/7)
// Debounce 500 ms setelah perubahan data. Saat IndexedDB gagal, simpan
// salinan darurat ke localStorage dan tunda ulang.
// ============================================================================

import { useAplikasi, snapshotDari, type AplikasiState } from './store.ts';
import { persistensiDexie } from './persistence.ts';
import { persistensiNeon } from './remotePersistence.ts';
import { isAuthenticated } from '../auth/auth.ts';

export function persistensiAktif() {
  return isAuthenticated() ? persistensiNeon : persistensiDexie;
}

let timer: number | undefined;
let gagalBerturut = 0;
const MAKS_GAGAL = 3;
let sedangMuat = false;
let sedangMenyimpan = false;

let onEmergency: (() => void) | null = null;


export function onSimpanDarurat(cb: () => void) {
  onEmergency = cb;
}

function simpanDarurat(s: unknown) {
  if (isAuthenticated()) {
    void fetch('/api/emergency', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ snapshot: s, reason: 'gagal-simpan' }),
    }).catch(() => { /* abaikan */ });
  }
  if (onEmergency) onEmergency();
}

/**
 * Hanya perubahan DATA yang memicu penyimpanan. Perubahan status simpan,
 * filter layar, pesan, dan dialog tidak boleh memicu siklus baru.
 */
function dataBerubah(state: AplikasiState, prev: AplikasiState): boolean {
  return (
    state.settings !== prev.settings ||
    state.umat !== prev.umat ||
    state.kk !== prev.kk ||
    state.peristiwa !== prev.peristiwa ||
    state.riwayat !== prev.riwayat ||
    state.audit !== prev.audit ||
    state.penanda !== prev.penanda ||
    state.keputusanDuplikat !== prev.keputusanDuplikat
  );
}

function simpanSetelahTunda() {
  if (timer !== undefined) window.clearTimeout(timer);
  timer = window.setTimeout(async () => {
    timer = undefined;
    if (sedangMenyimpan) return; // cegah pengiriman tumpang tindih
    const st = useAplikasi.getState();
    if (!st.settings) return;
    const s = snapshotDari(st);
    sedangMenyimpan = true;
    try {
      st.tandaiStatus('menyimpan');
      await persistensiAktif().simpan(s);
      gagalBerturut = 0;
      st.tandaiTersimpan(new Date().toISOString().slice(0, 19).replace('T', ' '));
      st.tandaiStatus('tersimpan');
    } catch (err) {
      gagalBerturut += 1;
      console.error('[persistensi] gagal menyimpan', err);
      simpanDarurat(s);
      const pesan = err instanceof Error ? err.message : String(err);
      st.tandaiStatus('gagal', `Penyimpanan lokal gagal. Simpan cadangan manual segera. (${pesan})`);
      if (gagalBerturut >= MAKS_GAGAL) {
        st.tandaiStatus('gagal', 'Penyimpanan lokal gagal berulang. Simpan cadangan manual segera.');
      } else {
        // coba lagi dengan jeda terbatas
        const jeda = Math.min(2000 * gagalBerturut, 8000);
        timer = window.setTimeout(simpanSetelahTunda, jeda);
      }
    } finally {
      sedangMenyimpan = false;
    }
  }, 500);
}


export function aktifkanAutoSimpan() {
  useAplikasi.subscribe((state, prev) => {
    if (sedangMuat) return;
    if (!dataBerubah(state, prev)) return;
    state.tandaiStatus('ada-perubahan');
    simpanSetelahTunda();
  });
}

export async function muatAplikasi(): Promise<void> {
  sedangMuat = true;
  try {
    if (!isAuthenticated()) return;
    const remote = await persistensiNeon.muat();
    if (remote) {
      useAplikasi.getState().muatDariSnapshot(remote);
    } else {
      // Auto-migrate existing local IndexedDB data into Neon on first login.
      const local = await persistensiDexie.muat();
      if (local && (local.umat.length || local.kk.length || local.settings)) {
        await persistensiNeon.simpan(local);
        useAplikasi.getState().muatDariSnapshot(local);
      }
    }
  } finally {
    sedangMuat = false;
  }
}
