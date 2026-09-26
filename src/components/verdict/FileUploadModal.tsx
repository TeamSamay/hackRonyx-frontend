import React, { useState } from 'react';
import { UploadCloud, X, FileText, CheckCircle2, AlertCircle } from 'lucide-react';
import { uploadEvidenceFile } from '@/lib/api';

export function FileUploadModal({
  isOpen,
  onClose,
  caseId = 'CASE-TX92831',
  onUploadSuccess,
}: {
  isOpen: boolean;
  onClose: () => void;
  caseId?: string;
  onUploadSuccess?: (evidenceCount: number) => void;
}) {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    if (!file) return;

    try {
      setUploading(true);
      setErrorMsg(null);
      const res = await uploadEvidenceFile(caseId, file);
      setSuccessMsg(`Successfully processed ${file.name} — extracted ${res.evidence_count} evidence items!`);
      if (onUploadSuccess) onUploadSuccess(res.evidence_count);
      setTimeout(() => {
        onClose();
        setSuccessMsg(null);
        setFile(null);
      }, 1800);
    } catch (err: any) {
      setErrorMsg(err.message || 'Failed to upload file to backend.');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-lg rounded-2xl border border-line bg-card p-6 shadow-2xl text-frost relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-mute hover:text-frost"
        >
          <X className="h-5 w-5" />
        </button>

        <h2 className="text-lg font-bold">Upload Evidence File</h2>
        <p className="text-xs text-mute mt-1">
          Supported: PDF (PyMuPDF), Scanned Images (OCR), Excel (.xlsx), CSV records.
        </p>

        <form onSubmit={handleUpload} className="mt-5 space-y-4">
          <div className="border-2 border-dashed border-line hover:border-violet-400/50 rounded-2xl p-6 text-center transition cursor-pointer">
            <input
              type="file"
              id="file-upload"
              className="hidden"
              accept=".pdf,.png,.jpg,.jpeg,.csv,.xlsx,.xls,.txt"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <label htmlFor="file-upload" className="cursor-pointer flex flex-col items-center">
              <UploadCloud className="h-10 w-10 text-violet-300 mb-2" />
              <span className="text-sm font-semibold text-frost">
                {file ? file.name : 'Click to select or drag & drop evidence'}
              </span>
              <span className="text-xs text-mute mt-1">PDF, KYC Image, Transaction CSV, Bank Ledger</span>
            </label>
          </div>

          {file ? (
            <div className="flex items-center gap-2 rounded-xl bg-white/[0.04] p-3 text-xs">
              <FileText className="h-4 w-4 text-violet-300 shrink-0" />
              <span className="truncate flex-1 font-mono">{file.name}</span>
              <span className="text-mute font-mono">{(file.size / 1024).toFixed(1)} KB</span>
            </div>
          ) : null}

          {successMsg ? (
            <div className="flex items-center gap-2 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-300">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              <span>{successMsg}</span>
            </div>
          ) : null}

          {errorMsg ? (
            <div className="flex items-center gap-2 rounded-xl border border-rose-500/30 bg-rose-500/10 p-3 text-xs text-rose-300">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          ) : null}

          <div className="flex items-center justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-line bg-white/[0.02] px-4 py-2 text-xs text-mute hover:text-frost"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={!file || uploading}
              className="rounded-xl accent-gradient px-4 py-2 text-xs font-semibold text-white shadow-md disabled:opacity-50"
            >
              {uploading ? 'Processing OCR & Normalizing...' : 'Upload & Process'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
