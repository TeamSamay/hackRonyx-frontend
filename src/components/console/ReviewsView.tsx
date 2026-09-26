import { useState } from 'react';
import { UserCheck, Clock, AlertCircle } from 'lucide-react';

export function ReviewsView() {
  const [reviews, setReviews] = useState([
    {
      id: 'REV-991',
      caseId: 'CASE-TX92831',
      title: 'High-Value Wire Transfer Dispute - TX92831',
      trustState: 'CONFLICTING',
      reason: 'Core banking Mumbai ≠ Device telemetry Delhi location clash',
      analystNote: 'Awaiting primary SIM binding & branch CCTV confirmation.',
      status: 'PENDING_REVIEW',
    },
    {
      id: 'REV-988',
      caseId: 'CASE-LOAN-2031',
      title: 'SME Credit Review - LOAN-2031',
      trustState: 'INCOMPLETE',
      reason: 'Audited GST return statement missing for Q3',
      analystNote: 'Automated email request dispatched to applicant accountant.',
      status: 'AWAITING_DATA',
    },
  ]);

  const [auditLogs, setAuditLogs] = useState([
    { timestamp: '2026-09-26 10:48:02', action: 'DECISION_GATE_EVALUATED', details: 'Gate assigned CONFLICTING state to TX-92831' },
    { timestamp: '2026-09-26 10:48:00', action: 'CONTRADICTION_DETECTED', details: 'Location clash Mumbai (E001) vs Delhi (E002)' },
    { timestamp: '2026-09-26 10:47:58', action: 'ML_MODELS_EXECUTED', details: 'XGBoost Risk: 91%, Isolation Forest: 84%' },
    { timestamp: '2026-09-26 10:47:55', action: 'EVIDENCE_NORMALIZED', details: '4 Evidence Objects created with SHA-256 hashes' },
  ]);

  const resolveReview = (id: string, actionName: string) => {
    setReviews(reviews.filter((r) => r.id !== id));
    setAuditLogs([
      {
        timestamp: new Date().toLocaleString(),
        action: `ANALYST_${actionName.toUpperCase()}`,
        details: `Analyst signed off on review item ${id}`,
      },
      ...auditLogs,
    ]);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="border-b border-line/60 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-violet-300 uppercase tracking-widest font-mono">
          <UserCheck className="h-4 w-4" /> Analyst Oversight & Governance
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-frost">Human Analyst Review & Audit Log</h1>
        <p className="mt-1 text-xs text-mute max-w-2xl">
          When the Deterministic Decision Gate assigns <span className="font-mono text-orange-300">CONFLICTING</span> or{' '}
          <span className="font-mono text-amber-300 font-semibold">INCOMPLETE</span> states, human analysts perform audited sign-offs.
        </p>
      </div>

      {/* Reviews Queue */}
      <div className="space-y-4">
        <h2 className="text-sm font-semibold text-frost flex items-center gap-2">
          <AlertCircle className="h-4 w-4 text-orange-300" />
          Pending Human Review Queue ({reviews.length})
        </h2>
        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-line p-8 text-center text-xs text-mute">
            All reviews completed! Zero pending analyst tasks.
          </div>
        ) : (
          <div className="space-y-3">
            {reviews.map((r) => (
              <div key={r.id} className="rounded-2xl border border-line bg-card/70 p-5 space-y-3">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line/40 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-violet-300">{r.id}</span>
                    <span className="text-xs text-mute">|</span>
                    <span className="text-xs font-semibold text-frost">{r.title}</span>
                  </div>
                  <span className="rounded-full border border-orange-400/30 bg-orange-500/10 px-2.5 py-0.5 text-[10px] font-mono text-orange-300">
                    {r.trustState} → HUMAN_REVIEW
                  </span>
                </div>
                <p className="text-xs text-frost"><span className="text-mute">Reason:</span> {r.reason}</p>
                <div className="rounded-xl bg-black/40 p-3 text-xs text-mute font-mono">
                  Notes: {r.analystNote}
                </div>
                <div className="flex items-center justify-end gap-2 pt-1">
                  <button
                    onClick={() => resolveReview(r.id, 'APPROVED_OVERRIDE')}
                    className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 px-3 py-1.5 text-xs text-emerald-300 hover:bg-emerald-500/20"
                  >
                    Approve with Override
                  </button>
                  <button
                    onClick={() => resolveReview(r.id, 'REQUESTED_EVIDENCE')}
                    className="rounded-xl border border-sky-500/30 bg-sky-500/10 px-3 py-1.5 text-xs text-sky-300 hover:bg-sky-500/20"
                  >
                    Request Evidence
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Audit Log Timeline */}
      <div className="rounded-2xl border border-line bg-card/60 p-5 space-y-4">
        <h2 className="text-sm font-semibold text-frost flex items-center gap-2">
          <Clock className="h-4 w-4 text-violet-300" />
          Immutable Audit Log Timeline
        </h2>
        <div className="space-y-3 font-mono">
          {auditLogs.map((log, i) => (
            <div key={i} className="flex items-start gap-3 border-l-2 border-violet-500/40 pl-4 py-1 text-xs">
              <span className="text-mute text-[10px] shrink-0">{log.timestamp}</span>
              <div>
                <span className="text-violet-300 font-bold">{log.action}:</span>{' '}
                <span className="text-frost">{log.details}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
