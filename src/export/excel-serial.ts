// ============================================================================
// Konversi tanggal ke serial Excel dan sebaliknya
// Excel serial: 1 = 1 Jan 1900 (dengan bug 29 Feb 1900)
// Tanggal 27/10/1991 -> serial 27821 (berdasarkan template)
// ============================================================================

const EXCEL_EPOCH = new Date(1899, 11, 30); // 30 Des 1899

export function dateToExcelSerial(date: Date): number {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((date.getTime() - EXCEL_EPOCH.getTime()) / msPerDay);
}

export function parseTanggalIndonesia(tgl: string): Date | null {
  // Format: dd/MM/yyyy
  const m = tgl.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (!m) return null;
  const d = parseInt(m[1], 10);
  const month = parseInt(m[2], 10) - 1;
  const y = parseInt(m[3], 10);
  const date = new Date(y, month, d);
  if (date.getFullYear() !== y || date.getMonth() !== month || date.getDate() !== d) {
    return null;
  }
  return date;
}

export function excelSerialToDate(serial: number): Date {
  const msPerDay = 24 * 60 * 60 * 1000;
  return new Date(EXCEL_EPOCH.getTime() + serial * msPerDay);
}