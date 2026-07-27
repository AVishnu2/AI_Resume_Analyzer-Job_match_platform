declare module 'pdf-parse' {
  interface PDFData {
    numpages: number;
    numrender: number;
    info: any;
    metadata: any;
    text: string;
    version: string;
  }
  const pdf: (buffer: Buffer | Uint8Array) => Promise<PDFData>;
  export default pdf;
}
