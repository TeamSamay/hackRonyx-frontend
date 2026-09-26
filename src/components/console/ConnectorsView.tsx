import { useEffect, useState } from 'react';
import { Database, FileCode, CheckCircle2, Shield, Plus, RefreshCw, Upload, Cpu, Link as LinkIcon, FileSpreadsheet, FileText, AlertTriangle, HelpCircle, FileCheck, Download } from 'lucide-react';
import { motion } from 'motion/react';
import type { ConnectorConfig, EvidenceObject, DecisionPacket } from '@/types/verdict';
import { ingestEvidenceApi, testGatewayUrlApi, fetchGatewayStatusApi, switchScenarioApi, fetchGatewayDocumentsApi, uploadEvidenceFileApi } from '@/lib/api';

export function ConnectorsView({
  connectors,
  onEvidenceIngested,
  onDecisionUpdated,
}: {
  connectors: ConnectorConfig[];
  onEvidenceIngested: (ev: EvidenceObject) => void;
  onDecisionUpdated?: (decision: DecisionPacket) => void;
}) {
  const [serverUrl, setServerUrl] = useState('http://localhost:8001');
  const [connecting, setConnecting] = useState(false);
  const [connected, setConnected] = useState(true);
  const [gatewayDetails, setGatewayDetails] = useState<any>(null);
  const [activeScenario, setActiveScenario] = useState<string>('CONFLICTING');
  const [switchingScenario, setSwitchingScenario] = useState<string | null>(null);
  const [docList, setDocList] = useState<Array<{ filename: string; file_type: string; size_bytes: number; download_url?: string }>>([]);
  const [loadingDocs, setLoadingDocs] = useState(false);

  const [showModal, setShowModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    case_id: 'CASE-TX92831',
    sourceType: 'DATABASE' as EvidenceObject['source']['type'],
    system: 'ENTERPRISE_POSTGRES',
    subject: 'TX-92831',
    predicate: 'transaction_amount',
    value: '₹85,000',
    confidence: '0.97',
    rawStatement: 'High-value wire transfer authorized on secondary mobile token',
  });

  // Load gateway status and documents on mount
  useEffect(() => {
    handleCheckGatewayStatus();
    loadDocuments();
  }, []);

  const handleCheckGatewayStatus = async () => {
    const res = await fetchGatewayStatusApi();
    if (res.success) {
      setConnected(true);
      if (res.url) setServerUrl(res.url);
      setGatewayDetails(res.details);
      if (res.details?.active_scenario) {
        setActiveScenario(res.details.active_scenario);
      }
    } else {
      setConnected(false);
    }
  };

  const loadDocuments = async () => {
    setLoadingDocs(true);
    const res = await fetchGatewayDocumentsApi();
    setDocList(res.documents || []);
    setLoadingDocs(false);
  };

  const handleConnectServer = async () => {
    setConnecting(true);
    const res = await testGatewayUrlApi(serverUrl);
    setConnecting(false);
    if (res.success) {
      setConnected(true);
      setGatewayDetails(res.details);
      if (res.details?.active_scenario) {
        setActiveScenario(res.details.active_scenario);
      }
      loadDocuments();
    } else {
      setConnected(false);
      alert(res.message || 'Failed to connect to specified Gateway URL.');
    }
  };

  const handleSwitchScenario = async (scenario: string) => {
    setSwitchingScenario(scenario);
    const res = await switchScenarioApi(scenario, 'CASE-TX92831');
    setSwitchingScenario(null);
    if (res.success) {
      setActiveScenario(scenario);
      if (res.decision && onDecisionUpdated) {
        onDecisionUpdated(res.decision);
      }
    } else {
      alert(`Could not switch scenario to ${scenario}`);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    if (selectedFile) {
      const uploadRes = await uploadEvidenceFileApi(selectedFile, form.case_id);
      setLoading(false);
      if (uploadRes.success && uploadRes.evidence_objects && uploadRes.evidence_objects.length > 0) {
        uploadRes.evidence_objects.forEach((ev) => onEvidenceIngested(ev));
        setSelectedFile(null);
        setShowModal(false);
        loadDocuments();
        return;
      }
    }

    const res = await ingestEvidenceApi({
      case_id: form.case_id,
      source: { type: form.sourceType, system: form.system, reference: selectedFile ? selectedFile.name : `ref-${Date.now()}` },
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
    setSelectedFile(null);
    setShowModal(false);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-line/60 pb-5">
        <div>
          <div className="flex items-center gap-2 text-xs font-semibold text-violet-300 uppercase tracking-widest font-mono">
            <Cpu className="h-4 w-4" /> VERDICT Edge Gateway & Data Server Links
          </div>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-frost">Enterprise Data Gateway & Connectors</h1>
          <p className="mt-1 text-xs text-mute max-w-2xl">
            VERDICT does not force manual data uploads. Connect directly to an enterprise laptop or Edge Gateway server URL (e.g. <code className="text-violet-200">http://localhost:8001</code> or ngrok link) to stream authorized evidence live.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setShowModal(true)}
          className="accent-gradient inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/20 hover:opacity-90 transition"
        >
          <Plus className="h-4 w-4" />
          Ingest Document / Evidence
        </button>
      </div>

      {/* Connect External Laptop Server Link Bar */}
      <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5 space-y-4">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2 text-sm font-semibold text-frost">
            <LinkIcon className="h-4 w-4 text-violet-300" />
            External Laptop Data Server Link (Gateway / Ngrok URL)
          </div>
          <span className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-[10px] font-mono font-semibold ${
            connected ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300' : 'border-rose-500/40 bg-rose-500/15 text-rose-300'
          }`}>
            <span className="h-2 w-2 rounded-full bg-current animate-pulse" />
            {connected ? `GATEWAY ONLINE · ${gatewayDetails?.latency_ms || 14}ms` : 'GATEWAY OFF-LINE'}
          </span>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <input
            type="text"
            value={serverUrl}
            onChange={(e) => setServerUrl(e.target.value)}
            placeholder="Enter Gateway / Ngrok URL (e.g. http://localhost:8001 or https://xyz.ngrok-free.app)"
            className="w-full flex-1 rounded-xl border border-line bg-black/60 px-4 py-2.5 text-xs font-mono text-frost outline-none focus:border-violet-400"
          />
          <button
            type="button"
            onClick={handleConnectServer}
            disabled={connecting}
            className="w-full sm:w-auto accent-gradient inline-flex items-center justify-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-white hover:opacity-90 transition shrink-0 shadow-md"
          >
            {connecting ? <RefreshCw className="h-4 w-4 animate-spin" /> : <LinkIcon className="h-4 w-4" />}
            {connecting ? 'Testing Link...' : 'Test & Link Server'}
          </button>
        </div>

        {gatewayDetails?.connected_datasources && (
          <div className="pt-2 border-t border-violet-500/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono">
            {gatewayDetails.connected_datasources.map((ds: any, i: number) => (
              <div key={i} className="rounded-lg bg-black/40 border border-white/5 p-2 flex items-center justify-between">
                <span className="text-frost">{ds.type}</span>
                <span className="text-emerald-400 text-[10px]">{ds.status}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Demo Scenario Control Panel (4 Live States) */}
      <div className="rounded-2xl border border-line/80 bg-card/60 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-violet-300 font-mono flex items-center gap-2">
              <Shield className="h-4 w-4" /> Live Demo Test Scenarios (Second Laptop Gateway State)
            </h2>
            <p className="text-[11px] text-mute mt-0.5">
              Click any scenario to dynamically modify evidence served by the second laptop and verify how VERDICT re-evaluates trust gates deterministically.
            </p>
          </div>
          <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg border border-violet-400/30 bg-violet-500/10 text-violet-200">
            ACTIVE STATE: <strong className="text-frost">{activeScenario}</strong>
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
          {/* 1. SUFFICIENT */}
          <button
            type="button"
            onClick={() => handleSwitchScenario('SUFFICIENT')}
            disabled={switchingScenario != null}
            className={`rounded-xl border p-3.5 text-left transition flex flex-col justify-between space-y-2 ${
              activeScenario === 'SUFFICIENT'
                ? 'border-emerald-500 bg-emerald-500/15 shadow-lg shadow-emerald-500/10'
                : 'border-line/80 bg-card/40 hover:border-emerald-500/40 hover:bg-emerald-500/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-emerald-300 flex items-center gap-1.5 font-mono">
                <CheckCircle2 className="h-4 w-4" /> 1. SUFFICIENT
              </span>
              {switchingScenario === 'SUFFICIENT' ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-emerald-300" /> : null}
            </div>
            <p className="text-[11px] text-mute leading-snug">
              All evidence agrees: Bank Transaction (Mumbai), Device (Mumbai), KYC (Mumbai). Clear match.
            </p>
            <div className="text-[9px] font-mono text-emerald-400/80">State → SUFFICIENT</div>
          </button>

          {/* 2. INCOMPLETE */}
          <button
            type="button"
            onClick={() => handleSwitchScenario('INCOMPLETE')}
            disabled={switchingScenario != null}
            className={`rounded-xl border p-3.5 text-left transition flex flex-col justify-between space-y-2 ${
              activeScenario === 'INCOMPLETE'
                ? 'border-amber-500 bg-amber-500/15 shadow-lg shadow-amber-500/10'
                : 'border-line/80 bg-card/40 hover:border-amber-500/40 hover:bg-amber-500/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5 font-mono">
                <HelpCircle className="h-4 w-4" /> 2. INCOMPLETE
              </span>
              {switchingScenario === 'INCOMPLETE' ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-amber-300" /> : null}
            </div>
            <p className="text-[11px] text-mute leading-snug">
              Missing recent identity check & missing device ownership verification. Requests more info.
            </p>
            <div className="text-[9px] font-mono text-amber-400/80">State → NEED_MORE_INFO</div>
          </button>

          {/* 3. CONFLICTING */}
          <button
            type="button"
            onClick={() => handleSwitchScenario('CONFLICTING')}
            disabled={switchingScenario != null}
            className={`rounded-xl border p-3.5 text-left transition flex flex-col justify-between space-y-2 ${
              activeScenario === 'CONFLICTING'
                ? 'border-rose-500 bg-rose-500/15 shadow-lg shadow-rose-500/10'
                : 'border-line/80 bg-card/40 hover:border-rose-500/40 hover:bg-rose-500/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-rose-300 flex items-center gap-1.5 font-mono">
                <AlertTriangle className="h-4 w-4" /> 3. CONFLICTING
              </span>
              {switchingScenario === 'CONFLICTING' ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-rose-300" /> : null}
            </div>
            <p className="text-[11px] text-mute leading-snug">
              Bank (Mumbai) vs Device (Delhi) vs Corporate Registry (Pune). Contradiction detected.
            </p>
            <div className="text-[9px] font-mono text-rose-400/80">State → CONFLICTING</div>
          </button>

          {/* 4. LOW_QUALITY */}
          <button
            type="button"
            onClick={() => handleSwitchScenario('LOW_QUALITY')}
            disabled={switchingScenario != null}
            className={`rounded-xl border p-3.5 text-left transition flex flex-col justify-between space-y-2 ${
              activeScenario === 'LOW_QUALITY'
                ? 'border-orange-500 bg-orange-500/15 shadow-lg shadow-orange-500/10'
                : 'border-line/80 bg-card/40 hover:border-orange-500/40 hover:bg-orange-500/5'
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-orange-300 flex items-center gap-1.5 font-mono">
                <FileCheck className="h-4 w-4" /> 4. LOW QUALITY
              </span>
              {switchingScenario === 'LOW_QUALITY' ? <RefreshCw className="h-3.5 w-3.5 animate-spin text-orange-300" /> : null}
            </div>
            <p className="text-[11px] text-mute leading-snug">
              Outdated document (dated 2020) and low OCR confidence (0.42 blur scan).
            </p>
            <div className="text-[9px] font-mono text-orange-400/80">State → LOW_QUALITY</div>
          </button>
        </div>
      </div>

      {/* Document Vault Explorer */}
      <div className="rounded-2xl border border-line/80 bg-card/60 p-5 space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xs font-bold uppercase tracking-wider text-frost font-mono flex items-center gap-2">
              <FileText className="h-4 w-4 text-violet-300" /> Enterprise Document & Dataset Vault ({docList.length})
            </h2>
            <p className="text-[11px] text-mute">
              Structured PDFs, Excel Workbooks, CSV feeds, and Image scans stored on the second laptop server.
            </p>
          </div>
          <button
            type="button"
            onClick={loadDocuments}
            className="rounded-lg border border-line bg-white/5 p-1.5 text-mute hover:text-frost text-xs"
            title="Refresh documents"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loadingDocs ? 'animate-spin' : ''}`} />
          </button>
        </div>

        {docList.length === 0 ? (
          <div className="text-center py-6 text-xs text-mute font-mono">No document files loaded from Gateway store.</div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {docList.map((doc, idx) => (
              <div key={idx} className="rounded-xl border border-line/70 bg-black/40 p-3.5 space-y-2 flex flex-col justify-between">
                <div className="flex items-start gap-2.5">
                  <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg border border-line bg-violet-500/10 text-violet-300">
                    {doc.file_type === 'XLSX' || doc.file_type === 'CSV' ? (
                      <FileSpreadsheet className="h-4 w-4 text-emerald-400" />
                    ) : (
                      <FileText className="h-4 w-4 text-violet-300" />
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs font-semibold text-frost truncate" title={doc.filename}>{doc.filename}</div>
                    <div className="text-[10px] font-mono text-mute mt-0.5">
                      {doc.file_type} · {(doc.size_bytes / 1024).toFixed(1)} KB
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-line/40 flex items-center justify-between text-[10px]">
                  <span className="text-emerald-400 font-mono">STATUS: SYNCED</span>
                  <a
                    href={doc.download_url?.startsWith('http') ? doc.download_url : `${serverUrl.replace(/\/$/, '')}${doc.download_url || `/api/documents/${doc.filename}`}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-violet-300 hover:text-frost font-mono"
                  >
                    <Download className="h-3 w-3" /> Fetch / Download
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Connected Data Sources */}
      <div>
        <h2 className="text-xs font-semibold uppercase tracking-wider text-mute font-mono mb-3 flex items-center gap-2">
          <Database className="h-4 w-4 text-violet-300" />
          Pre-configured Enterprise Data Connectors ({connectors.length})
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
                <span>Endpoint: {c.host || 'localhost:8001'}</span>
                <span>Mode: {c.read_only ? 'READ_ONLY_ENFORCED' : 'READ_WRITE'}</span>
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
                Ingest Document / Evidence Object
              </h3>
              <button onClick={() => setShowModal(false)} className="text-mute hover:text-frost">✕</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-3">
              {/* File Upload Selector */}
              <div className="rounded-xl border border-dashed border-violet-500/40 bg-violet-500/5 p-3 text-center space-y-1">
                <input
                  type="file"
                  id="evidence-file-input"
                  accept=".pdf,.csv,.xlsx,.xls,.png,.jpg,.jpeg,.txt"
                  onChange={(e) => {
                    const f = e.target.files?.[0];
                    if (f) {
                      setSelectedFile(f);
                      const nameLower = f.name.toLowerCase();
                      if (nameLower.endsWith('.pdf')) setForm({ ...form, sourceType: 'PDF' });
                      else if (nameLower.endsWith('.csv') || nameLower.endsWith('.xlsx')) setForm({ ...form, sourceType: 'EXCEL' });
                      else if (nameLower.endsWith('.png') || nameLower.endsWith('.jpg') || nameLower.endsWith('.jpeg')) setForm({ ...form, sourceType: 'IMAGE' });
                    }
                  }}
                  className="hidden"
                />
                <label htmlFor="evidence-file-input" className="cursor-pointer flex flex-col items-center justify-center space-y-1">
                  <Upload className="h-5 w-5 text-violet-300" />
                  <span className="text-xs font-semibold text-frost">
                    {selectedFile ? `Selected: ${selectedFile.name}` : 'Click to select document file (PDF, XLSX, CSV, Image)'}
                  </span>
                  <span className="text-[10px] text-mute">Extracts text, OCR & claims automatically into Backend database</span>
                </label>
              </div>

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
