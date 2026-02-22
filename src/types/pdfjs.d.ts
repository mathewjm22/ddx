declare module "pdfjs-dist/build/pdf";
declare module "pdfjs-dist/build/pdf.worker?url";
declare module "pdfjs-dist/web/pdf_viewer" {
  export class EventBus {
    constructor();
  }
  export class PDFLinkService {
    constructor(options?: any);
    setDocument(document: any, baseUrl: string | null): void;
    setViewer(viewer: any): void;
  }
  export class PDFViewer {
    constructor(options?: any);
    setDocument(document: any): void;
    cleanup(): void;
  }
}
