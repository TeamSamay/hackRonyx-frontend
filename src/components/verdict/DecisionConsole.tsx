import React from 'react';
import {
  AlertTriangle,
  CheckCircle2,
  HelpCircle,
  XCircle,
  FileCheck,
  Shield,
  Layers,
  Database,
  Cpu,
  RefreshCw,
  UserCheck,
  Search,
} from 'lucide-react';
import type { DecisionPacket, TrustStatus } from '@/types/verdict';
import { submitHumanReview } from '@/lib/api';

const statusConfig: Record<
  TrustStatus,
  { label: string; bg: string; text: string; border: string; icon: any; desc: string }
> = {
  SUFFICIENT: {
    label: 'SUFFICIENT',
    bg: 'bg-emerald-500/10',
    text: 'text-emerald-400',
    border: 'border-emerald-500/30',
    icon: CheckCircle2,
    desc: 'All necessary evidence is present, consistent, and meets certainty threshold.',
  },
  INCOMPLETE: {
    label: 'INCOMPLETE',
    bg: 'bg-amber-500/10',
    text: 'text-amber-400',
    border: 'border-amber-500/30',
    icon: AlertTriangle,
    desc: 'Partial evidence available, but key signals are missing before a final verdict can be reached.',
  },
  CONFLICTING: {
    label: 'CONFLICTING',
    bg: 'bg-rose-500/10',
    text: 'text-rose-400',
    border: 'border-rose-500/30',
    icon: XCircle,
    desc: 'Multiple authoritative evidence sources directly contradict each other (e.g. location clash).',
  },
  LOW_QUALITY: {
    label: 'LOW QUALITY',
    bg: 'bg-orange-500/10',
    text: 'text-orange-400',
    border: 'border-orange-500/30',
    icon: HelpCircle,
    desc: 'Evidence is present but comes from low-reliability sources, poor OCR, or outdated logs.',
  },
  NEED_MORE_INFO: {
    label: 'NEED MORE INFO',
    bg: 'bg-blue-500/10',
    text: 'text-blue-400',
    border: 'border-blue-500/30',
    icon: HelpCircle,
    desc: 'Specific critical facts must be retrieved before any decision gate can be cleared.',
  },
  REFUSE: {
    label: 'REFUSE TO DECIDE',
    bg: 'bg-red-950/40',
    text: 'text-red-400',
    border: 'border-red-600/40',
    icon: Shield,
    desc: 'Evidence is so contradictory or compromised that algorithmic verdict is safely refused.',
  },
};

export function DecisionConsole({
  decision,
  onRefresh,
}: {
  decision: DecisionPacket;
  onRefresh?: () => void;
}) {
  const [reviewerName, setReviewerName] = React.useState('Analyst Samay');
  const [notes, setNotes] = React.useState('');
  const [reviewSubmitted, setReviewSubmitted] = React.useState(false);
  const [submitting, setSubmitting] = React.useState(false);

  const status = statusConfig[decision.trust_status] || statusConfig.CONFLICTING;
  const StatusIcon = status.icon;

  async function handleAction(action: string) {
    try {
      setSubmitting(true);
      await submitHumanReview(decision.case_id, reviewerName, action, notes);
      setReviewSubmitted(true);
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="space-y-6 text-frost">
      {/* Top Banner: Case ID & Deterministic Decision Gate */}
      <div className="flex flex-col gap-4 rounded-2xl border border-line bg-card/90 p-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold uppercase tracking-wider text-mute">Case Dossier</span>
            <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs font-mono text-violet-300">
              {decision.case_id}
            </span>
          </div>
          <h2 className="mt-1 text-xl font-bold tracking-tight text-frost">Deterministic Decision Packet</h2>
          <p className="text-xs text-mute mt-0.5">
            Evaluated by VERDICT Gate v{decision.audit?.engine_version || '2.0.0'} • Rule-Enforced Authority
          </p>
        </div>

        <div className="flex items-center gap-3">
          {onRefresh ? (
            <button
              onClick={onRefresh}
              className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-white/5 px-3 py-2 text-xs text-mute hover:text-frost"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Re-analyze
            </button>
          ) : null}
          <div
            className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-sm font-semibold ${status.bg} ${status.text} ${status.border}`}
          >
            <StatusIcon className="h-4 w-4" />
            <span>{status.label}</span>
          </div>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: ML Risk */}
        <div className="rounded-xl border border-line bg-card/60 p-4">
          <div className="flex items-center justify-between text-xs text-mute">
            <span>ML Fraud Risk</span>
            <Cpu className="h-4 w-4 text-violet-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-rose-400">
              {(decision.fraud_model.risk_score * 100).toFixed(1)}%
            </span>
            <span className="text-xs text-mute font-mono">({decision.fraud_model.model})</span>
          </div>
          <div className="mt-2 h-1.5 w-full rounded-full bg-white/5 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-rose-500 rounded-full"
              style={{ width: `${decision.fraud_model.risk_score * 100}%` }}
            />
          </div>
        </div>

        {/* Card 2: Anomaly Score */}
        <div className="rounded-xl border border-line bg-card/60 p-4">
          <div className="flex items-center justify-between text-xs text-mute">
            <span>Isolation Forest Anomaly</span>
            <Layers className="h-4 w-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-amber-400">
              {decision.fraud_model.anomaly_score
                ? `${(decision.fraud_model.anomaly_score * 100).toFixed(0)}%`
                : 'HIGH'}
            </span>
            <span className="text-xs text-mute">Outlier Intensity</span>
          </div>
          <p className="mt-2 text-[11px] text-mute">High deviation from account history baseline</p>
        </div>

        {/* Card 3: Evidence Quality */}
        <div className="rounded-xl border border-line bg-card/60 p-4">
          <div className="flex items-center justify-between text-xs text-mute">
            <span>Evidence Quality</span>
            <FileCheck className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-emerald-400">{decision.evidence_quality}</span>
            <span className="text-xs text-mute">Source Pedigree</span>
          </div>
          <p className="mt-2 text-[11px] text-mute">Primary bank feeds & official KYC records</p>
        </div>

        {/* Card 4: Recommendation */}
        <div className="rounded-xl border border-line bg-card/60 p-4">
          <div className="flex items-center justify-between text-xs text-mute">
            <span>Recommended Action</span>
            <Shield className="h-4 w-4 text-rose-400" />
          </div>
          <div className="mt-2">
            <span className="text-lg font-bold text-rose-400">{decision.recommendation}</span>
          </div>
          <p className="mt-2 text-[11px] text-mute">Deterministic Rule: Block automatic clearance</p>
        </div>
      </div>

      {/* Contradiction & Challenge Section */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Contradiction Box */}
        <div className="rounded-2xl border border-rose-500/20 bg-rose-500/[0.03] p-5">
          <div className="flex items-center gap-2 text-rose-400 font-semibold text-sm">
            <AlertTriangle className="h-4 w-4" />
            Deterministic Contradictions Detected ({decision.contradictions?.length || 0})
          </div>
          {decision.contradictions && decision.contradictions.length > 0 ? (
            <div className="mt-3 space-y-3">
              {decision.contradictions.map((contra, idx) => (
                <div key={idx} className="rounded-xl border border-rose-500/20 bg-card p-3.5 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-rose-300 uppercase tracking-wide">
                      {contra.predicate} Clash
                    </span>
                    <span className="rounded bg-rose-500/20 px-2 py-0.5 text-[10px] font-bold text-rose-300">
                      {contra.severity}
                    </span>
                  </div>
                  <p className="mt-2 text-frost leading-relaxed">{contra.description}</p>
                  <div className="mt-2.5 flex items-center gap-2 text-[11px] text-mute">
                    <span className="text-mute">Conflicting values:</span>
                    {contra.conflicting_values?.map((v, i) => (
                      <span key={i} className="rounded bg-white/5 px-2 py-0.5 font-mono text-frost">
                        {String(v)}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-3 text-xs text-mute">No factual contradictions detected across evidence streams.</p>
          )}
        </div>

        {/* Challenge Engine Box */}
        <div className="rounded-2xl border border-violet-500/20 bg-violet-500/[0.03] p-5">
          <div className="flex items-center gap-2 text-violet-300 font-semibold text-sm">
            <Search className="h-4 w-4" />
            Challenge Engine (Counter-Evidence Scan)
          </div>
          <div className="mt-3 rounded-xl border border-violet-500/20 bg-card p-3.5 text-xs space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-mute">Adversarial Hypothesis:</span>
              <span className="font-mono text-violet-200">
                {decision.challenge?.hypothesis || 'Transaction is fraudulent'}
              </span>
            </div>
            <p className="text-frost leading-relaxed mt-2">
              {decision.challenge?.challenge_summary ||
                'Scanned for mitigating device updates, travel authorizations, or registered delegate flags.'}
            </p>
            <div className="mt-2 flex items-center gap-2 text-[11px] text-mute">
              <span>Counter-evidence Found:</span>
              <span
                className={`font-semibold ${
                  decision.challenge?.counter_evidence_found ? 'text-amber-400' : 'text-emerald-400'
                }`}
              >
                {decision.challenge?.counter_evidence_found ? 'YES (Mitigating)' : 'NO (Risk Confirmed)'}
              </span>
            </div>
          </div>

          {/* Missing Information */}
          {decision.missing_information && decision.missing_information.length > 0 ? (
            <div className="mt-4">
              <div className="text-xs font-semibold text-amber-300 flex items-center gap-1.5 mb-2">
                <HelpCircle className="h-3.5 w-3.5" />
                Missing Information Required to Resolve
              </div>
              <div className="space-y-2">
                {decision.missing_information.map((m, idx) => (
                  <div key={idx} className="rounded-lg border border-amber-500/20 bg-amber-500/[0.04] p-2.5 text-xs">
                    <span className="font-mono font-bold text-amber-200">{m.item}</span>: {m.reason}
                  </div>
                ))}
              </div>
            </div>
          ) : null}
        </div>
      </div>

      {/* Synthesized Reasoning */}
      <div className="rounded-2xl border border-line bg-card/80 p-5">
        <h3 className="text-sm font-semibold text-frost flex items-center gap-2">
          <Database className="h-4 w-4 text-violet-400" />
          Evidence-Aware Synthesized Reasoning
        </h3>
        <p className="mt-3 text-sm leading-relaxed text-frost/90 whitespace-pre-line bg-[#16121D] p-4 rounded-xl border border-line/60 font-sans">
          {decision.reasoning}
        </p>
      </div>

      {/* Normalized Evidence Grid Table */}
      <div className="rounded-2xl border border-line bg-card overflow-hidden">
        <div className="border-b border-line px-5 py-4 flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-frost">Traceable Evidence Layer</h3>
            <p className="text-xs text-mute">All disparate sources normalized into standard verifiable Evidence Objects</p>
          </div>
          <span className="text-xs text-mute font-mono">{decision.evidence?.length || 0} Evidence Items</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-line bg-white/[0.02] text-mute uppercase tracking-wider text-[10px]">
              <tr>
                <th className="px-4 py-3">Evidence ID</th>
                <th className="px-4 py-3">Source Type</th>
                <th className="px-4 py-3">Property (Claim)</th>
                <th className="px-4 py-3">Observed Value</th>
                <th className="px-4 py-3">Reliability</th>
                <th className="px-4 py-3">Traceability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line/40">
              {decision.evidence?.map((ev) => (
                <tr key={ev.evidence_id} className="hover:bg-white/[0.02] transition">
                  <td className="px-4 py-3 font-mono font-semibold text-violet-300">{ev.evidence_id}</td>
                  <td className="px-4 py-3">
                    <span className="rounded bg-white/5 px-2 py-0.5 text-[11px] font-mono text-frost">
                      {ev.source.type}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-mute font-mono">{ev.claim.predicate}</td>
                  <td className="px-4 py-3 font-semibold text-frost">{String(ev.claim.value)}</td>
                  <td className="px-4 py-3">
                    <span className="text-emerald-400 font-semibold">{ev.quality.reliability}</span>
                  </td>
                  <td className="px-4 py-3 text-mute font-mono text-[11px]">
                    {ev.traceability.table ? `${ev.traceability.table}:${ev.traceability.record_id}` : ''}
                    {ev.traceability.file ? `${ev.traceability.file}` : ''}
                    {ev.traceability.ip ? `IP: ${ev.traceability.ip}` : ''}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Human Fraud Analyst Review Box */}
      <div className="rounded-2xl border border-line bg-card/90 p-5">
        <div className="flex items-center gap-2 text-sm font-semibold text-frost">
          <UserCheck className="h-4 w-4 text-violet-300" />
          Human Fraud Analyst Decision Override & Escalation
        </div>
        {reviewSubmitted ? (
          <div className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4 text-emerald-300 text-sm">
            ✅ Human Review submitted successfully! Case status updated in audit log.
          </div>
        ) : (
          <div className="mt-4 space-y-3">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs text-mute block mb-1">Analyst Name</label>
                <input
                  type="text"
                  value={reviewerName}
                  onChange={(e) => setReviewerName(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white/[0.03] px-3 py-2 text-xs text-frost outline-none"
                />
              </div>
              <div>
                <label className="text-xs text-mute block mb-1">Analyst Notes</label>
                <input
                  type="text"
                  placeholder="e.g. Verified customer via secondary branch biometric terminal."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="w-full rounded-xl border border-line bg-white/[0.03] px-3 py-2 text-xs text-frost outline-none"
                />
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-2">
              <button
                disabled={submitting}
                onClick={() => handleAction('APPROVE_OVERRIDE')}
                className="rounded-xl border border-emerald-500/40 bg-emerald-500/20 px-4 py-2 text-xs font-semibold text-emerald-300 hover:bg-emerald-500/30"
              >
                Approve (Human Override)
              </button>
              <button
                disabled={submitting}
                onClick={() => handleAction('REJECT_FRAUD')}
                className="rounded-xl border border-rose-500/40 bg-rose-500/20 px-4 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/30"
              >
                Reject & Block Account
              </button>
              <button
                disabled={submitting}
                onClick={() => handleAction('REQUEST_ADDITIONAL_KYC')}
                className="rounded-xl border border-amber-500/40 bg-amber-500/20 px-4 py-2 text-xs font-semibold text-amber-300 hover:bg-amber-500/30"
              >
                Request Additional Verification
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
