// ============================================================================
// Routing berbasis hash: '#/umat/UM00001', '#/penanda/Perlu%20dilengkapi', dst.
// Tanpa dependensi eksternal, aman untuk hosting statis & PWA.
// ============================================================================

export type RuteLayar =
  | 'beranda'
  | 'pengaturan'
  | 'cadangan'
  | 'llm'
  | 'modetabel'
  | 'umat'
  | 'kk'
  | 'peristiwa'
  | 'rekap'
  | 'ekspor'
  | 'impor'
  | 'penanda'
  | 'duplikat'
  | 'perubahan';

export interface Rute {
  layar: RuteLayar;
  id?: string;
  jenis?: string;
  tab?: string;
}

export function parseRute(hash: string): Rute {
  const s = hash.replace(/^#/, '');
  const segs = s.split('/').filter(Boolean);
  const [layar] = segs;

  const rute: Rute = { layar: (layar as RuteLayar) ?? 'beranda' };
  if (rute.layar === 'umat' || rute.layar === 'kk') {
    rute.id = segs[1];
    if (segs[2]) rute.tab = decodeURIComponent(segs[2]);
  } else if (rute.layar === 'peristiwa' || rute.layar === 'penanda') {
    rute.jenis = segs[1] ? decodeURIComponent(segs[1]) : undefined;
  }
  return rute;
}

export function formatRute(r: Rute): string {
  switch (r.layar) {
    case 'beranda': return '#';
    case 'pengaturan': return '#/pengaturan';
    case 'cadangan': return '#/cadangan';
    case 'llm': return '#/llm';
    case 'modetabel': return '#/modetabel';
    case 'umat': return r.id ? (r.tab ? `#/umat/${r.id}/${encodeURIComponent(r.tab)}` : `#/umat/${r.id}`) : '#/umat';
    case 'kk': return r.id ? (r.tab ? `#/kk/${r.id}/${encodeURIComponent(r.tab)}` : `#/kk/${r.id}`) : '#/kk';
    case 'peristiwa': return r.jenis ? `#/peristiwa/${encodeURIComponent(r.jenis)}` : '#/peristiwa';
    case 'rekap': return '#/rekap';
    case 'ekspor': return '#/ekspor';
    case 'impor': return '#/impor';
    case 'penanda': return r.jenis ? `#/penanda/${encodeURIComponent(r.jenis)}` : '#/penanda';
    case 'duplikat': return '#/duplikat';
    case 'perubahan': return '#/perubahan';
    default: return '#';
  }
}

export function gotoRute(r: Rute): void {
  window.location.hash = formatRute(r);
}

export function ruteAktif(r: Rute, sekarang: Rute): boolean {
  return (
    r.layar === sekarang.layar &&
    r.id === sekarang.id &&
    r.jenis === sekarang.jenis &&
    r.tab === sekarang.tab
  );
}

export function judulRute(r: Rute): string {
  switch (r.layar) {
    case 'beranda': return 'Beranda';
    case 'pengaturan': return 'Pengaturan Lingkungan';
    case 'cadangan': return 'Cadangan & Pulihkan';
    case 'llm': return 'Pengaturan LLM Gemini';
    case 'modetabel': return 'Mode Tabel';
    case 'umat': return r.id ? `Umat ${r.id}` : 'Umat';
    case 'kk': return r.id ? `Keluarga ${r.id}` : 'Keluarga (KK)';
    case 'peristiwa': return r.jenis ? `Peristiwa ${r.jenis}` : 'Peristiwa';
    case 'rekap': return 'Rekap';
    case 'ekspor': return 'Ekspor Excel';
    case 'impor': return 'Impor Data';
    case 'penanda': return r.jenis ? `${r.jenis}` : 'Perlu Ditindaklanjuti';
    case 'duplikat': return 'Duplikat';
    case 'perubahan': return 'Perubahan Otomatis';
    default: return 'APPMI';
  }
}
