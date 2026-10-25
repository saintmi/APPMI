// ============================================================================
// Pengalokasi ID tetap — ID tidak bergeser bila data dihapus
// Baris dihapus dikosongkan (A4 kosong), ID lain tetap
// ============================================================================

export interface OpsiIdAllocator {
  prefix?: string;
  width?: number;
}

export class IdAllocator {
  private readonly prefix: string;
  private readonly width: number;
  private nextId: number;
  private tersedia: number[];

  constructor(opsi: OpsiIdAllocator = {}) {
    this.prefix = opsi.prefix ?? '';
    this.width = opsi.width ?? 4;
    this.nextId = 1;
    this.tersedia = [];
  }

  alokasi(): string {
    if (this.tersedia.length > 0) {
      return this.format(this.tersedia.shift()!);
    }
    return this.format(this.nextId++);
  }

  bebas(id: string): void {
    const angka = this.keAngka(id);
    if (angka === null) return;
    if (this.tersedia.includes(angka)) return;
    this.tersedia.push(angka);
    this.tersedia.sort((a, b) => a - b);
  }

  /**
   * Rehidrasi dari data yang sudah ada: nextId diambil dari nomor terbesar,
   * nomor yang berlubang dikembalikan ke daftar bebas (A4: ID tidak bergeser,
   * nomor yang dilepas boleh dipakai ulang).
   */
  seed(ids: string[]): void {
    this.tersedia = [];
    this.nextId = 1;
    const angkaIds = ids
      .map((id) => this.keAngka(id))
      .filter((n): n is number => n !== null);
    if (angkaIds.length === 0) return;

    const maks = Math.max(...angkaIds);
    if (maks >= this.nextId) this.nextId = maks + 1;

    const ada = new Set(angkaIds);
    for (let i = 1; i < this.nextId; i++) {
      if (!ada.has(i) && !this.tersedia.includes(i)) this.tersedia.push(i);
    }
    this.tersedia.sort((a, b) => a - b);
  }

  format(n: number): string {
    return this.prefix + String(n).padStart(this.width, '0');
  }

  private keAngka(id: string): number | null {
    const s = this.prefix && id.startsWith(this.prefix) ? id.slice(this.prefix.length) : id;
    if (!/^\d+$/.test(s)) return null;
    const n = parseInt(s, 10);
    return Number.isFinite(n) && n > 0 ? n : null;
  }
}

/** Nomor urut dari ID berawalan, mis. 'UM00012' → 12. */
export function nomorDariId(id: string): number | null {
  const m = /(\d+)$/.exec(id);
  if (!m) return null;
  const n = parseInt(m[1], 10);
  return Number.isFinite(n) && n > 0 ? n : null;
}

export const ID_UMAT = { prefix: 'UM', width: 5 } as const;
export const ID_KK = { prefix: 'KK', width: 4 } as const;
export const ID_PERISTIWA = { prefix: 'P', width: 5 } as const;
