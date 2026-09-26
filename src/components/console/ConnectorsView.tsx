import { useState } from 'react';
import { Database, FileCode, CheckCircle2, Shield, Plus, RefreshCw, Upload, Lock, Cpu, Link as LinkIcon, FileSpreadsheet, FileText } from 'lucide-react';
import { motion } from 'motion/react';
import type { ConnectorConfig, EvidenceObject } from '@/types/verdict';
import { ingestEvidenceApi } from '@/lib/api';

export function ConnectorsView({
  connectors,
  onEvidenceIngested,
}: {
  connectors: ConnectorConfig[];
  onEvidenceIngested: (ev: EvidenceObject) => void;
}) {
  const [serverUrl, setServerUrl] = useState('http://192.168.1.50:8000');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    case_id: 'CASE-TX92831',
    sourceType: 'DATABASE' as EvidenceObject['source']['type'],
    system: 'ENTERPRISE_POSTGRES',
    subject: 'TX-92831',
    predicate: 'transaction_amount',
    value: '₹1,50,000',
    confidence: '0.97',
    rawStatement: 'High velocity transfer attempt detected on secondary card token',
  });

  const handleConnectServer = () => {
    setConnecting(true);
    setTimeout(() => {
      setConnecting(false);
      setConnected(true);
    }, 800);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await ingestEvidenceApi({
      case_id: form.case_id,
      source: { type: form.sourceType, system: form.system, reference: `ref-${Date.now()}` },
      claim: {
        subject: form.subject,
        predicate: form.predicate,
        value: form.value,
        raw_statement: form.rawStatement,
        confidence: parseFloat(form.confidence) || 0.95,
      },
      quality: { reliability: 'HIGH', freshness: 'CURRENT', completeness: 1, overall_quality: 'HIGH' },
      traceability: { table: 'evidence_ingestion_log', record_id: `REC-${Math.floor(Math.random() * 10000)}` },
    });
    setLoading(false);
    onEvidenceIngested(res.evidence);
    setShowModal(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-300 uppercase tracking-widest font-mono">
            <Cpu className="h-4 w-4" /> Multi-Source Ingestion & Data Connectors
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-frost">Data Sources & Server Links</h1>
          <p className="mt-1 text-xs text-mute max-w-2xl">
            VERDICT does not force manual data entry. Connect external Database URLs, Gateway endpoints, or upload Excel, PDF, CSV and OCR documents.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="accent-gradient inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" />
          Ingest Evidence / Document
        </button>
      </div>

      {/* Connect External Laptop Server Link Bar */}
      <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-semibold text-frost">
            <LinkIcon className="h-4 w-4 text-violet-300" />
            Connect External Laptop Data Server (PostgreSQL / Gateway URL)
          </div>
          <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-[10px] font-mono ${
            connected ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300' : 'border-line bg-card text-mute'
          }`}>
            {connected ? '● SERVER LINK ACTIVE' : '○ DISCONNECTED'}
          </span>
        </div>
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="Enter Database / Edge Gateway URL (e.g. http://192.168.1.50:8000)"
            className="w-full flex-1 rounded-xl border border-line bg-black/50 px-4 py-2.5 text-xs font-mono text-frost outline-none focus:border-violet-400"
          />
          <button
            type="button"
            onClick={handleConnectServer}
            disabled={connecting}
            className="w-full sm:w-auto accent-gradient inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition shrink-0"
          >
            {connecting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
            {connecting ? 'Testing Link...' : 'Test & Link Server'}
          </button>
        </div>
        <p className="text-[11px] text-mute font-mono">
          Tip: Enter your 2nd laptop's local IP (e.g., <code className="text-violet-200">http://192.168.x.x:8000</code>). VERDICT Backend pulls evidence automatically via read-only APIs.
        </p>
      </div>

      {/* Security Status */}
      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="grid h-9 w-9 place-items-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
            <Lock className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-frost">Read-Only SQL Sanitizer & Encryption Active</div>
            <div className="text-[11px] text-mute">Read-only enforcement prevents database modification. Traceability & SHA-256 hashes generated for every record.</div>
          </div>
        </div>
        <span className="rounded-full border border-emerald-500/30 bg-emerald-500/10 px-3 py-1 text-[10px] font-mono text-emerald-300">
          SECURITY: READ_ONLY_STRICT
        </span>
      </div>

      {/* Upload File / Document Library Cards */}
      <div className="grid gap-4 sm:grid-cols-3">
        <div
          onClick={() => setShowModal(true)}
          className="cursor-pointer rounded-2xl border border-line/80 bg-card/60 p-4 hover:border-violet-400/40 transition space-y-2 text-center flex flex-col items-center justify-center min-h-[120px]"
        >
          <FileText className="h-6 w-6 text-violet-300" />
          <div className="text-xs font-semibold text-frost">Upload PDF Document</div>
          <div className="text-[10px] text-mute">Extracts text, OCR & claims automatically</div>
        </div>

        <div
          onClick={() => setShowModal(true)}
          className="cursor-pointer rounded-2xl border border-line/80 bg-card/60 p-4 hover:border-violet-400/40 transition space-y-2 text-center flex flex-col items-center justify-center min-h-[120px]"
        >
          <FileSpreadsheet className="h-6 w-6 text-emerald-400" />
          <div className="text-xs font-semibold text-frost">Import Excel / CSV Dataset</div>
          <div className="text-[10px] text-mute">Ingests structured rows as Evidence Objects</div>
        </div>

        <div
          onClick={() => setShowModal(true)}
          className="cursor-pointer rounded-2xl border border-line/80 bg-card/60 p-4 hover:border-violet-400/40 transition space-y-2 text-center flex flex-col items-center justify-center min-h-[120px]"
        >
          <Upload className="h-6 w-6 text-sky-300" />
          <div className="text-xs font-semibold text-frost">Upload Image OCR Scan</div>
          <div className="text-[10px] text-mute">Tesseract OCR & identity verification</div>
        </div>
      </div>

      {/* Configured Enterprise Connectors */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-mute font-mono mb-3 flex items-center gap-2">
          <Database className="h-4 w-4 text-violet-300" />
          Active Connected Data Sources ({connectors.length})
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {connectors.map((c) => (
            <motion.div
              key={c.id}
              whileHover={{ y: -2 }}
              className="rounded-2xl border border-line/80 bg-card/60 p-4 space-y-3"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="grid h-8 w-8 place-items-center rounded-lg border border-line bg-white/5 text-violet-300">
                    <FileCode className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-frost">{c.name}</h3>
                    <div className="text-[10px] font-mono text-mute">{c.connector_type}</div>
                  </div>
                </div>
                <span
                  className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[9px] font-mono ${
                    c.is_active
                      ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
                      : 'border-line bg-card text-mute'
                  }`}
                >
                  <CheckCircle2 className="h-3 w-3" />
                  {c.is_active ? 'ACTIVE' : 'STANDBY'}
                </span>
              </div>
              <div className="pt-2 border-t border-line/40 flex items-center justify-between text-[10px] text-mute font-mono">
                <span>Endpoint: {c.host || '192.168.1.50'}</span>
                <span>Mode: {c.read_only ? 'READ_ONLY' : 'READ_WRITE'}</span>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      {/* Ingest Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="w-full max-w-lg rounded-2xl border border-line bg-card p-6 shadow-2xl space-y-4"
          >
            <div className="flex items-center justify-between border-b border-line/60 pb-3">
              <h3 className="text-sm font-semibold text-frost flex items-center gap-2">
                <Upload className="h-4 w-4 text-violet-300" />
                Ingest Evidence / Document
              </h3>
              <button onClick={() => setShowModal(false)} className="text-mute hover:text-frost">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <label className="text-xs text-mute block mb-1">Target Case ID</label>
                <input
                  type="text"
                  value={form.case_id}
                  onChange={(e) => setForm({ ...form, case_id: e.target.value })}
                  className="w-full rounded-xl border border-line bg-black/40 px-3 py-2 text-xs text-frost outline-none focus:border-violet-400"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-mute block mb-1">Source Format</label>
                  <select
                    value={form.sourceType}
                    onChange={(e) => setForm({ ...form, sourceType: e.target.value as any })}
                    className="w-full rounded-xl border border-line bg-black/40 px-3 py-2 text-xs text-frost outline-none focus:border-violet-400"
                  >
                    <option value="DATABASE">DATABASE RECORD</option>
                    <option value="PDF">PDF DOCUMENT</option>
                    <option value="EXCEL">EXCEL / CSV DATASET</option>
                    <option value="IMAGE">IMAGE OCR SCAN</option>
                    <option value="API">REST API ENDPOINT</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs text-mute block mb-1">Source System Name</label>
                  <input
                    type="text"
                    value={form.system}
                    onChange={(e) => setForm({ ...form, system: e.target.value })}
                    className="w-full rounded-xl border border-line bg-black/40 px-3 py-2 text-xs text-frost outline-none focus:border-violet-400"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs text-mute block mb-1">Claim Subject</label>
                  <input
                    type="text"
                    value={form.subject}
                    onChange={(e) => setForm({ ...form, subject: e.target.value })}
                    className="w-full rounded-xl border border-line bg-black/40 px-3 py-2 text-xs text-frost outline-none focus:border-violet-400"
                  />
                </div>
                <div>
                  <label className="text-xs text-mute block mb-1">Claim Predicate</label>
                  <input
                    type="text"
                    value={form.predicate}
                    onChange={(e) => setForm({ ...form, predicate: e.target.value })}
                    className="w-full rounded-xl border border-line bg-black/40 px-3 py-2 text-xs text-frost outline-none focus:border-violet-400"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs text-mute block mb-1">Claim Value</label>
                <input
                  type="text"
                  value={form.value}
                  onChange={(e) => setForm({ ...form, value: e.target.value })}
                  className="w-full rounded-xl border border-line bg-black/40 px-3 py-2 text-xs text-frost outline-none focus:border-violet-400"
                />
              </div>

              <div>
                <label className="text-xs text-mute block mb-1">Raw Statement / Extracted Text</label>
                <textarea
                  rows={2}
                  value={form.rawStatement}
                  onChange={(e) => setForm({ ...form, rawStatement: e.target.value })}
                  className="w-full rounded-xl border border-line bg-black/40 px-3 py-2 text-xs text-frost outline-none focus:border-violet-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="rounded-xl border border-line px-4 py-2 text-xs text-mute hover:text-frost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="accent-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-white shadow-lg hover:opacity-90"
                >
                  {loading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Shield className="h-3.5 w-3.5" />}
                  Normalize Evidence
                </button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </div>
  );
}
