// ============================================================================
// OCR Service — ekstraksi teks dari scan Kartu Keluarga menggunakan tesseract.js
// Bahasa Indonesia (ind) untuk akurasi teks berbahasa Indonesia.
// ============================================================================

import { createWorker } from 'tesseract.js';
type TesseractWorker = Awaited<ReturnType<typeof createWorker>>;

export interface OcrKkResult {
  nomorKK: string;
  namaKepalaKeluarga: string;
  alamat: string;
  kabupatenKota: string;
  provinsi: string;
  rawText: string;
  confidence: number; // 0-1
}

export interface OcrKkField {
  label: string;
  value: string;
  confidence: number;
}

export class OcrKkService {
  private worker: TesseractWorker | null = null;
  private initializing: Promise<void> | null = null;

  async init(): Promise<void> {
    if (this.worker) return;
    if (this.initializing) return this.initializing;

    this.initializing = (async () => {
      this.worker = await createWorker('ind');
      try {
        await (this.worker as unknown as { setParameters: (params: Record<string, unknown>) => Promise<void> }).setParameters({
          tessedit_pageseg_mode: '6', // assume a single uniform block of text
          tessedit_char_whitelist: '',
        });
      } catch {
        // setParameters may not be available in all tesseract.js versions; non-fatal
      }
    })();
    this.initializing = this.initializing.then(() => undefined, (e) => {
      this.initializing = null;
      throw e;
    });
    return this.initializing;
  }

  async recognize(file: File | string): Promise<OcrKkResult> {
    await this.init();
    const result = await this.worker!.recognize(file);
    const text = result.data.text;
    const conf = this.averageConfidence(result.data);

    return {
      ...this.parseKkText(text),
      rawText: text,
      confidence: conf,
    };
  }

  private averageConfidence(data: { paragraphs?: Array<{ lines?: Array<{ words?: Array<{ confidence: number }> }> }> }): number {
    let sum = 0;
    let count = 0;
    for (const para of data.paragraphs ?? []) {
      for (const line of para.lines ?? []) {
        for (const word of line.words ?? []) {
          sum += word.confidence;
          count += 1;
        }
      }
    }
    return count > 0 ? sum / count / 100 : 0;
  }

  private parseKkText(text: string): OcrKkResult {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter((l) => l.length > 0);

    const result: OcrKkResult = {
      nomorKK: '',
      namaKepalaKeluarga: '',
      alamat: '',
      kabupatenKota: '',
      provinsi: '',
      rawText: text,
      confidence: 0,
    };

    // Helper: cari nilai setelah label tertentu
    const findAfter = (label: string): string | null => {
      const idx = lines.findIndex((l) => l.toLowerCase().includes(label.toLowerCase()));
      if (idx === -1) return null;
      // Ambil teks setelah label pada baris yang sama
      const line = lines[idx];
      const labelIdx = line.toLowerCase().indexOf(label.toLowerCase());
      if (labelIdx === -1) return null;
      const after = line.slice(labelIdx + label.length).trim();
      if (after) return after;
      // Coba baris berikutnya
      if (idx + 1 < lines.length) return lines[idx + 1].trim();
      return null;
    };

    // Nomor KK — cari pola angka 16 digit atau label "Nomor KK"
    const nomorKKMatch = text.match(/\b(\d{4}\s?\d{4}\s?\d{4}\s?\d{4})\b/);
    if (nomorKKMatch) {
      result.nomorKK = nomorKKMatch[1].replace(/\s/g, '');
    } else {
      const nkk = findAfter('Nomor KK') || findAfter('No KK');
      if (nkk) result.nomorKK = nkk.replace(/\s/g, '');
    }

    // Nama Kepala Keluarga
    const namaKK = findAfter('Nama Kepala Keluarga') || findAfter('Nama');
    if (namaKK) result.namaKepalaKeluarga = namaKK;

    // Alamat
    const alamat = findAfter('Alamat');
    if (alamat) result.alamat = alamat;

    // Kabupaten / Kota
    const kab = findAfter('Kabupaten') || findAfter('Kota');
    if (kab) result.kabupatenKota = kab;

    // Provinsi
    const prov = findAfter('Provinsi');
    if (prov) result.provinsi = prov;

    return result;
  }

  async terminate(): Promise<void> {
    if (this.worker) {
      await this.worker.terminate();
      this.worker = null;
    }
    this.initializing = null;
  }
}

export const ocrKk = new OcrKkService();
