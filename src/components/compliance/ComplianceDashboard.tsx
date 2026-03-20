import { useState, useRef, useCallback } from 'react';
import { ComplianceResults } from './ComplianceResults';
import type { ComplianceAnalysisResult } from './types';

export function ComplianceDashboard() {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [result, setResult] = useState<ComplianceAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file (PNG, JPG, WEBP)');
      return;
    }
    setImageFile(file);
    setError(null);
    setResult(null);

    const reader = new FileReader();
    reader.onload = (e) => {
      setImagePreview(e.target?.result as string);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

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
  };

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
            {imagePreview ? (
              <div className="space-y-4">
                <img
                  src={imagePreview}
                  alt="Preview"
                  className="max-h-80 mx-auto rounded border border-border"
                />
                <div>
                  <p className="text-sm font-medium text-foreground">{imageFile?.name}</p>
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
                <p className="text-sm font-medium text-foreground">Drop an image here or click to browse</p>
                <p className="text-xs text-muted-foreground mt-1">PNG, JPG, or WEBP up to 10MB</p>
              </div>
            )}
          </div>

          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFile(file);
            }}
          />

          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={handleAnalyze}
              disabled={!imagePreview || isAnalyzing}
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
