// ============================================================================
// Klien REST Gemini API — dipanggil langsung dari browser
// Endpoint: https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={key}
// ============================================================================

const BASE = 'https://generativelanguage.googleapis.com/v1beta';

export interface OpsiPanggilan {
  modelId: string;
  kunci: string;
  prompt: string;
  responseMimeType?: 'application/json' | 'text/plain';
  timeoutMs?: number;
}

export async function panggilGemini(opts: OpsiPanggilan): Promise<string> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), opts.timeoutMs ?? 30_000);
  try {
    const url = `${BASE}/models/${encodeURIComponent(opts.modelId)}:generateContent?key=${encodeURIComponent(opts.kunci)}`;
    const body = {
      contents: [{ parts: [{ text: opts.prompt }] }],
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 20,
        maxOutputTokens: 2048,
        ...(opts.responseMimeType ? { responseMimeType: opts.responseMimeType } : {}),
      },
    };
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
    });
    if (!res.ok) {
      const teks = await res.text();
      let pesan = `Gagal memanggil Gemini (${res.status})`;
      try {
        const data = JSON.parse(teks);
        pesan = data.error?.message ?? pesan;
      } catch {
        // biarkan pesan default
      }
      throw new Error(pesan);
    }
    const data = await res.json();
    const teks = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
    return teks;
  } finally {
    clearTimeout(timer);
  }
}

export function ekstraksiJSON(teks: string): unknown {
  // Gemini kadang membungkus JSON dalam markdown fence. Bersihkan dulu.
  const bersih = teks
    .replace(/^```json\s*/, '')
    .replace(/```\s*$/, '')
    .trim();
  const mulai = bersih.indexOf('{');
  const akhir = bersih.lastIndexOf('}');
  if (mulai < 0 || akhir < 0) throw new Error('Tidak ada objek JSON dalam respons');
  return JSON.parse(bersih.slice(mulai, akhir + 1));
}
