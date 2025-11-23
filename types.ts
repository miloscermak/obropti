export interface OptimizedImage {
  originalFile: File;
  originalPreview: string; // Blob URL
  optimizedBlob: Blob;
  optimizedPreview: string; // Blob URL
  originalSize: number;
  optimizedSize: number;
  compressionRatio: number;
  name: string;
}

export enum AppState {
  IDLE = 'IDLE',
  PROCESSING = 'PROCESSING',
  DONE = 'DONE',
  ERROR = 'ERROR'
}
