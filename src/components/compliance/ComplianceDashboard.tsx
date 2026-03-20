import { useState, useRef, useCallback } from 'react';
import { ComplianceResults } from './ComplianceResults';
import type { ComplianceAnalysisResult } from './types';
import * as pdfjsLib from 'pdfjs-dist';

// Set the worker source
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

const ACCEPTED_TYPES = ['image/png', 'image/jpeg', 'image/webp', 'application/pdf'];

async function pdfToImageDataUrl(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);
  const viewport = page.getViewport({ scale: 2 });

  const canvas = document.createElement('canvas');
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  const ctx = canvas.getContext('2d')!;

  await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;
  return canvas.toDataURL('image/png');
}

export function ComplianceDashboard() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isConverting, setIsConverting] = useState(false);
  const [result, setResult] = useState<ComplianceAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [pageCount, setPageCount] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadPdfPage = useCallback(async (file: File, pageNum: number) => {
    setIsConverting(true);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      setPageCount(pdf.numPages);
      setCurrentPage(pageNum);

      const page = await pdf.getPage(pageNum);
      const viewport = page.getViewport({ scale: 2 });
      const canvas = document.createElement('canvas');
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext('2d')!;
      await page.render({ canvasContext: ctx, viewport, canvas } as any).promise;

      setImagePreview(canvas.toDataURL('image/png'));
    } finally {
      setIsConverting(false);
    }
  }, []);

  const handleFile = useCallback(async (file: File) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      setError('Please upload an image (PNG, JPG, WEBP) or PDF');
      return;
    }

    setImageFile(file);
    setError(null);
    setResult(null);
    setPageCount(0);
    setPdfFile(null);

    if (file.type === 'application/pdf') {
      setPdfFile(file);
      setIsConverting(true);
      try {
        const dataUrl = await pdfToImageDataUrl(file);
        setImagePreview(dataUrl);
        // Get page count
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        setPageCount(pdf.numPages);
        setCurrentPage(1);
      } catch {
        setError('Failed to read PDF. Make sure the file is a valid PDF.');
      } finally {
        setIsConverting(false);
      }
    } else {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handlePageChange = async (pageNum: number) => {
    if (!pdfFile || pageNum < 1 || pageNum > pageCount) return;
    setResult(null);
    await loadPdfPage(pdfFile, pageNum);
  };

  const handleAnalyze = async () => {
    if (!imagePreview) return;

    setIsAnalyzing(true);
    setError(null);

    try {
      const response = await fetch('/api/compliance/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image: imagePreview }),
      });

      if (!response.ok) {
        throw new Error(`Analysis failed (${response.status})`);
      }

      const data = await response.json() as ComplianceAnalysisResult;
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Analysis failed');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleReset = () => {
    setImageFile(null);
    setImagePreview(null);
    setResult(null);
    setError(null);
    setPageCount(0);
    setPdfFile(null);
  };

  const isPdf = imageFile?.type === 'application/pdf';

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-foreground">UDAAP Compliance Analysis</h1>
        <p className="text-muted-foreground mt-1">
          Upload a marketing creative to check for potential UDAAP violations
        </p>
      </div>

      {/* Upload / Results */}
      {!result ? (
        <div className="space-y-4">
          {/* Drop zone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-md p-12 text-center cursor-pointer transition-colors ${
              isDragging
                ? 'border-primary bg-primary/5'
                : imagePreview
                ? 'border-border bg-card'
                : 'border-border hover:border-muted-foreground/40 bg-card'
            }`}
          >
            {isConverting ? (
              <div className="flex items-center justify-center gap-3">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <p className="text-sm font-medium text-foreground">Converting PDF...</p>
              </div>
            ) : imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-80 mx-auto rounded border border-border"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">
                    {imageFile?.name}
                    {isPdf && pageCount > 0 && (
                      <span className="text-muted-foreground font-normal"> — Page {currentPage} of {pageCount}</span>
                    )}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">Click to replace</p>
                </div>
              </div>
            ) : (
              <div>
                <div className="w-12 h-12 bg-muted rounded mx-auto mb-3 flex items-center justify-center">
                  <svg className="w-6 h-6 text-muted-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5" />
                  </svg>
                </div>
                <p className="text-sm font-medium text-foreground">Drop a file here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, WEBP, or PDF up to 10MB</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,application/pdf"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {/* PDF page navigation */}
          {isPdf && pageCount > 1 && !isConverting && (
            <div className="flex items-center gap-2">
              <button
                onClick={(e) => { e.stopPropagation(); handlePageChange(currentPage - 1); }}
                disabled={currentPage <= 1}
                className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
              >
                Previous
              </button>
              <span className="text-sm text-muted-foreground">
                Page {currentPage} of {pageCount}
              </span>
              <button
                onClick={(e) => { e.stopPropagation(); handlePageChange(currentPage + 1); }}
                disabled={currentPage >= pageCount}
                className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-secondary/80 transition-colors"
              >
                Next
              </button>
            </div>
          )}

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={!imagePreview || isAnalyzing || isConverting}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-primary/90 transition-colors"
            >
              {isAnalyzing ? 'Analyzing...' : 'Analyze Creative'}
            </button>
            {imagePreview && (
              <button
                onClick={handleReset}
                disabled={isAnalyzing}
                className="px-4 py-2 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Clear
              </button>
            )}
          </div>

          {/* Loading state */}
          {isAnalyzing && (
            <div className="bg-card border border-border rounded-md p-6">
              <div className="flex items-center gap-3">
                <div className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin" />
                <div>
                  <p className="text-sm font-medium text-foreground">Analyzing creative for UDAAP compliance...</p>
                  <p className="text-xs text-muted-foreground mt-0.5">This may take 10-15 seconds</p>
                </div>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              Results for <span className="font-medium text-foreground">{imageFile?.name}</span>
              {isPdf && <span> — Page {currentPage}</span>}
            </p>
            <button
              onClick={handleReset}
              className="px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm font-medium hover:bg-secondary/80 transition-colors"
            >
              New Analysis
            </button>
          </div>
          <ComplianceResults result={result} imageUrl={imagePreview!} />
        </div>
      )}
    </div>
  );
}
