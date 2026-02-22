import { useEffect, useRef, useState } from "react";
import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import type { PDFDocumentProxy } from "pdfjs-dist/types/src/display/api";
import workerSrc from "pdfjs-dist/build/pdf.worker?url";
import { EventBus, PDFLinkService, PDFViewer } from "pdfjs-dist/web/pdf_viewer";
import "pdfjs-dist/web/pdf_viewer.css";

GlobalWorkerOptions.workerSrc = workerSrc;

type PdfReaderProps = {
  fileUrl?: string | null;
};

type RenderState = "idle" | "loading" | "ready" | "error";

export function PdfReader({ fileUrl }: PdfReaderProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const viewerRef = useRef<HTMLDivElement | null>(null);
  const pdfViewerRef = useRef<PDFViewer | null>(null);
  const linkServiceRef = useRef<PDFLinkService | null>(null);
  const [status, setStatus] = useState<RenderState>("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!containerRef.current || !viewerRef.current) return;

    const eventBus = new EventBus();
    const linkService = new PDFLinkService({ eventBus });
    const pdfViewer = new PDFViewer({
      container: containerRef.current,
      viewer: viewerRef.current,
      eventBus,
      linkService,
      textLayerMode: 2,
    });

    linkService.setViewer(pdfViewer);
    pdfViewerRef.current = pdfViewer;
    linkServiceRef.current = linkService;

    return () => {
      pdfViewer.setDocument(undefined as unknown as PDFDocumentProxy);
      pdfViewer.cleanup();
      pdfViewerRef.current = null;
      linkServiceRef.current = null;
    };
  }, []);

  useEffect(() => {
    const pdfViewer = pdfViewerRef.current;
    const linkService = linkServiceRef.current;

    if (!pdfViewer || !linkService) return;
    if (!fileUrl) {
      pdfViewer.setDocument(null);
      setStatus("idle");
      return;
    }

    let cancelled = false;
    setStatus("loading");
    setError(null);

    const loadingTask = getDocument(fileUrl);

    loadingTask.promise
      .then((pdfDoc: PDFDocumentProxy) => {
        if (cancelled) {
          pdfDoc.destroy();
          return;
        }
        linkService.setDocument(pdfDoc, null);
        pdfViewer.setDocument(pdfDoc);
        setStatus("ready");
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        console.error(err);
        setError("Unable to render PDF. Please try another file.");
        setStatus("error");
      });

    return () => {
      cancelled = true;
      loadingTask.destroy();
    };
  }, [fileUrl]);

  return (
    <div className="relative h-[70vh] overflow-hidden rounded-2xl border border-slate-100 bg-white">
      <div ref={containerRef} className="h-full overflow-auto bg-slate-50">
        <div ref={viewerRef} className="pdfViewer" />
      </div>

      {status === "loading" && (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center bg-white/80 text-sm font-medium text-slate-500">
          Preparing document…
        </div>
      )}

      {status === "error" && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-white/95 text-center">
          <p className="text-sm font-semibold text-rose-600">{error}</p>
          <p className="text-xs text-slate-500">Re-upload the PDF or refresh and try again.</p>
        </div>
      )}
    </div>
  );
}
