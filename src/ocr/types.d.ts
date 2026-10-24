// ============================================================================
// Type declarations for tesseract.js (no official @types package)
// ============================================================================

declare module 'tesseract.js' {
  export interface RecognizeResult {
    data: {
      text: string;
      confidence: number;
      paragraphs: Array<{
        text: string;
        lines: Array<{
          text: string;
          words: Array<{
            text: string;
            confidence: number;
            bbox: { x0: number; y0: number; x1: number; y1: number };
          }>;
        }>;
      }>;
    };
  }

  export interface ProgressInfo {
    status: string;
    progress: number;
  }

  export interface Worker {
    recognize(image: string | File | Blob | HTMLImageElement | HTMLCanvasElement): Promise<RecognizeResult>;
    terminate(): Promise<void>;
  }

  export function createWorker(lang?: string): Promise<Worker>;
}
