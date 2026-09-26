import { Gavel, ShieldCheck, Lock, AlertTriangle, CheckCircle, FileText, HelpCircle, XCircle } from 'lucide-react';
import { TRUST_STATE_META, type TrustStatus } from '@/types/verdict';

const trustStates: Array<{ id: TrustStatus; title: string; triggerCondition: string; routingAction: string; icon: any }> = [
  {
    id: 'SUFFICIENT',
    title: '1. Evidence is Sufficient',
    triggerCondition: 'All available sources agree, high evidence quality (>90%), zero contradictions.',
    routingAction: 'APPROVE / PROCEED — Automatic approval path.',
    icon: CheckCircle,
  },
  {
    id: 'INCOMPLETE',
    title: '2. Evidence is Incomplete',
    triggerCondition: 'Partial evidence available, key data points missing, completeness between 40%–70%.',
    routingAction: 'REQUEST_DATA — Trigger automated fetch from connector.',
    icon: FileText,
  },
  {
    id: 'CONFLICTING',
    title: '3. Sources Conflict (Contradictions)',
    triggerCondition: 'Two or more evidence objects directly contradict (e.g. location clash Mumbai ≠ Delhi).',
    routingAction: 'HUMAN_REVIEW — Mandatory analyst inspection & audit sign-off.',
    icon: AlertTriangle,
  },
  {
    id: 'LOW_QUALITY',
    title: '4. Evidence Quality Questionable',
    triggerCondition: 'Poor document OCR confidence (<75%), untraceable source, or historical stale evidence.',
    routingAction: 'REQUEST_BETTER_SOURCES — Request high-resolution document re-upload.',
    icon: HelpCircle,
  },
  {
    id: 'NEED_MORE_INFO',
    title: '5. Additional Information Required',
    triggerCondition: 'Critical proof (e.g. identity verification or device attestation) is missing.',
    routingAction: 'SPECIFY_REQUIRED_EVIDENCE — Issue targeted requirement packet.',
    icon: ShieldCheck,
  },
  {
    id: 'REFUSE',
    title: '6. No Reliable Conclusion / Refuse',
    triggerCondition: 'Critical anomaly failure, unresolvable fraud risk, or blacklisted entity.',
    routingAction: 'REFUSE_ESCALATE — Immediate refusal & escalation dispatch.',
    icon: XCircle,
  },
];

export function DecisionsView() {
  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="border-b border-line/60 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-violet-300 uppercase tracking-widest font-mono">
          <Gavel className="h-4 w-4" /> Problem Statement Decision Framework
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-frost">The 6 Deterministic Final Trust States</h1>
        <p className="mt-1 text-xs text-mute max-w-2xl">
          VERDICT AI guarantees that AI never presents uncertainty as certainty. Python rules deterministically evaluate evidence quality, contradictions, and completeness to enforce these 6 outcome states.
        </p>
      </div>

      {/* Trust Matrix Banner */}
      <div className="rounded-2xl border border-violet-500/30 bg-violet-500/10 p-5 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-sm font-semibold text-frost">
            <Lock className="h-4 w-4 text-violet-300" />
            Deterministic Gate Enforcement
          </div>
          <p className="text-xs text-mute max-w-xl">
            Even if an LLM generates a plausible text summary, if claims conflict or quality is poor, the Gate locks the verdict in <span className="font-mono text-orange-300 font-semibold">CONFLICTING</span> or <span className="font-mono text-rose-300 font-semibold">REFUSE</span> state.
          </p>
        </div>
        <span className="rounded-xl border border-violet-400/40 bg-card px-3 py-1.5 text-xs font-mono text-violet-200 shrink-0">
          LLM_BYPASS_PROTECTION: ENFORCED
        </span>
      </div>

      {/* 6 Trust States Cards Grid */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {trustStates.map((item) => {
          const meta = TRUST_STATE_META[item.id];
          const Icon = item.icon;
          return (
            <div
              key={item.id}
              className={`rounded-2xl border p-5 space-y-3 transition-transform hover:-translate-y-0.5 ${meta.tone}`}
            >
              <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
                <span className="text-xs font-bold tracking-wide flex items-center gap-1.5">
                  <Icon className="h-4 w-4 shrink-0" />
                  {item.id}
                </span>
                <span className="rounded-full border px-2 py-0.5 text-[9px] font-mono uppercase">{meta.action}</span>
              </div>
              <div>
                <h3 className="text-xs font-semibold text-frost">{item.title}</h3>
                <p className="mt-1 text-xs opacity-85 leading-relaxed">{item.triggerCondition}</p>
              </div>
              <div className="pt-2 border-t border-white/10 text-[10px] font-mono font-medium">
                → {item.routingAction}
              </div>
            </div>
          );
        })}
      </div>

      {/* Canonical JSON Packet Schema */}
      <div className="rounded-2xl border border-line bg-card/60 p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-frost flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-violet-300" />
            Canonical Decision Packet JSON Contract
          </h3>
          <span className="text-[10px] font-mono text-mute">version: 2.0.0</span>
        </div>
        <pre className="rounded-xl bg-black/60 p-4 text-xs font-mono text-violet-200 overflow-x-auto border border-line/40">
{`{
  "case_id": "CASE-TX92831",
  "trust_status": "CONFLICTING",
  "recommendation": "HUMAN_REVIEW",
  "evidence_quality": "HIGH",
  "completeness": 0.88,
  "contradictions": [
    { "contradiction_id": "CONTRA-LOC-01", "severity": "CRITICAL", "conflicting_values": ["Mumbai", "Delhi"] }
  ],
  "audit": { "gate": "DETERMINISTIC_DECISION_GATE", "timestamp": "2026-09-26T17:28:00+05:30" }
}`}
        </pre>
      </div>
    </div>
  );
}
