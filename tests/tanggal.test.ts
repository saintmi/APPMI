import { test } from 'vitest';
import assert from 'node:assert';
import {
  parseTanggal,
  bandingkanTanggal,
  tanggalValid,
  formatTanggal,
  tanggalKeIso,
} from '../src/engine/tanggal.ts';

test('parseTanggal: dd/MM/yyyy', () => {
  assert.deepStrictEqual(parseTanggal('27/10/1991'), { y: 1991, m: 10, d: 27 });
  assert.deepStrictEqual(parseTanggal('1/1/2000'), { y: 2000, m: 1, d: 1 });
});

test('parseTanggal: format legacy yyyy-MM-dd', () => {
  assert.deepStrictEqual(parseTanggal('1991-10-27'), { y: 1991, m: 10, d: 27 });
});

test('parseTanggal: tanggal tidak sah → null', () => {
  assert.strictEqual(parseTanggal('31/02/2026'), null);
  assert.strictEqual(parseTanggal('13/13/2026'), null);
  assert.strictEqual(parseTanggal('bukan tanggal'), null);
  assert.strictEqual(parseTanggal(''), null);
  assert.strictEqual(parseTanggal(null), null);
  assert.strictEqual(parseTanggal(undefined), null);
  assert.strictEqual(tanggalValid('29/02/2024'), true);
  assert.strictEqual(tanggalValid('29/02/2026'), false);
});

test('bandingkanTanggal: bukan perbandingan teks', () => {
  assert.strictEqual(bandingkanTanggal('01/01/2030', '31/12/2026'), 1);
  assert.strictEqual(bandingkanTanggal('12/03/2026', '31/12/2026'), -1);
  assert.strictEqual(bandingkanTanggal('31/12/2026', '31/12/2026'), 0);
  assert.strictEqual(bandingkanTanggal('05/03/2026', '12/03/2026'), -1);
  assert.strictEqual(bandingkanTanggal('12/03/2026', '05/03/2026'), 1);
});

test('formatTanggal & tanggalKeIso', () => {
  assert.strictEqual(formatTanggal({ y: 1991, m: 10, d: 27 }), '27/10/1991');
  assert.strictEqual(tanggalKeIso('27/10/1991'), '1991-10-27');
  assert.strictEqual(tanggalKeIso('bukan tanggal'), null);
});
