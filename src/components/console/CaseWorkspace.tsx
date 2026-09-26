import { AlertTriangle, FileDigit, Scale } from 'lucide-react';
import { motion } from 'motion/react';
import { fadeUp, springSnappy, staggerFast } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { DecisionPacket, EvidenceObject, VerdictCase } from '@/types/verdict';
import { TRUST_STATE_META } from '@/types/verdict';

function TrustBadge({ status }: { status: NonNullable<VerdictCase['trust_status']> }) {
  const meta = TRUST_STATE_META[status];
  return <span className={cn('rounded-full border px-2.5 py-1 text-[11px] font-medium', meta.tone)}>{meta.label}</span>;
}

function EvidenceCard({ item }: { item: EvidenceObject }) {
  return (
    <motion.article
      variants={fadeUp}
      whileHover={{ y: -2 }}
      transition={springSnappy}
      className="rounded-2xl border border-line bg-card/70 p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div>
          <div className="text-sm font-semibold text-frost">{item.evidence_id}</div>
          <div className="mt-0.5 text-[11px] uppercase tracking-wider text-mute">{item.source.type}</div>
        </div>
        <span className="rounded-full border border-line px-2 py-0.5 text-[10px] text-mute">{item.quality.overall_quality}</span>
      </div>
      <p className="mt-3 text-sm text-frost">
        <span className="text-mute">{item.claim.predicate}:</span> {String(item.claim.value)}
      </p>
      {item.claim.raw_statement ? <p className="mt-2 text-xs leading-relaxed text-mute">{item.claim.raw_statement}</p> : null}
      <div className="mt-3 flex flex-wrap gap-2 text-[10px] text-mute">
        {item.source.system ? <span className="rounded-md border border-line px-1.5 py-0.5">{item.source.system}</span> : null}
        {item.traceability.table ? (
          <span className="rounded-md border border-line px-1.5 py-0.5">table:{item.traceability.table}</span>
        ) : null}
        {item.traceability.record_id ? (
          <span className="rounded-md border border-line px-1.5 py-0.5">id:{item.traceability.record_id}</span>
        ) : null}
        {item.quality.ocr_confidence != null ? (
          <span className="rounded-md border border-line px-1.5 py-0.5">OCR {(item.quality.ocr_confidence * 100).toFixed(0)}%</span>
        ) : null}
      </div>
    </motion.article>
  );
}

export function DecisionPacketPanel({ packet }: { packet: DecisionPacket }) {
  const meta = TRUST_STATE_META[packet.trust_status];
  return (
    <div className="space-y-4">
      <div className={cn('rounded-2xl border p-4', meta.tone)}>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-[11px] uppercase tracking-[0.16em] opacity-80">Deterministic Decision Gate</div>
            <div className="mt-1 text-xl font-semibold">{meta.label}</div>
          </div>
          <div className="text-right">
            <div className="text-[11px] uppercase tracking-wider opacity-80">Recommendation</div>
            <div className="mt-1 text-sm font-medium">{packet.recommendation}</div>
          </div>
        </div>
        <p className="mt-3 text-sm leading-relaxed opacity-90">{packet.reasoning}</p>
      </div>

      <div className="grid gap-3 sm:grid-cols-3">
        <div className="rounded-2xl border border-line bg-card/60 p-3">
          <div className="text-[11px] text-mute">XGBoost risk</div>
          <div className="mt-1 text-2xl font-semibold text-frost">{(packet.fraud_model.risk_score * 100).toFixed(0)}%</div>
        </div>
        <div className="rounded-2xl border border-line bg-card/60 p-3">
          <div className="text-[11px] text-mute">Anomaly score</div>
          <div className="mt-1 text-2xl font-semibold text-frost">
            {packet.fraud_model.anomaly_score != null ? (packet.fraud_model.anomaly_score * 100).toFixed(0) + '%' : '—'}
          </div>
        </div>
        <div className="rounded-2xl border border-line bg-card/60 p-3">
          <div className="text-[11px] text-mute">Completeness</div>
          <div className="mt-1 text-2xl font-semibold text-frost">{(packet.completeness * 100).toFixed(0)}%</div>
        </div>
      </div>

      {packet.contradictions.length > 0 ? (
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-frost">
            <AlertTriangle className="h-4 w-4 text-orange-300" />
            Contradictions
          </div>
          {packet.contradictions.map((item) => (
            <div key={item.contradiction_id} className="rounded-2xl border border-orange-400/25 bg-orange-500/10 p-4">
              <div className="flex flex-wrap items-center gap-2 text-xs text-orange-100">
                <span className="font-medium">{item.severity}</span>
                <span className="text-mute">{item.evidence_ids.join(' · ')}</span>
              </div>
              <p className="mt-2 text-sm text-frost">{item.description}</p>
              <p className="mt-2 text-xs text-mute">
                Values: {item.conflicting_values.join(' ≠ ')}
                {item.resolution_suggestion ? ` — ${item.resolution_suggestion}` : ''}
              </p>
            </div>
          ))}
        </div>
      ) : null}

      {packet.challenge.performed ? (
        <div className="rounded-2xl border border-line bg-card/60 p-4">
          <div className="flex items-center gap-2 text-sm text-frost">
            <Scale className="h-4 w-4 text-violet-200" />
            Challenge engine
          </div>
          <p className="mt-2 text-sm text-mute">{packet.challenge.challenge_summary}</p>
          {packet.challenge.hypothesis ? (
            <p className="mt-2 text-xs text-mute">Hypothesis tested: {packet.challenge.hypothesis}</p>
          ) : null}
        </div>
      ) : null}

      <div className="rounded-2xl border border-line bg-card/40 px-4 py-3 text-[11px] text-mute">
        Audit · {packet.audit.gate} · v{packet.audit.engine_version} · {packet.audit.timestamp}
      </div>
    </div>
  );
}

export function CaseWorkspace({
  cases,
  activeCaseId,
  onSelectCase,
}: {
  cases: VerdictCase[];
  activeCaseId: string;
  onSelectCase: (id: string) => void;
}) {
  const active = cases.find((item) => item.case_id === activeCaseId) ?? cases[0];
  const packet = active?.decision;

  return (
    <div className="mx-auto grid w-full max-w-6xl gap-5 px-4 py-6 sm:px-6 lg:grid-cols-[240px_1fr] lg:px-8">
      <aside className="space-y-2">
        <div className="text-[11px] font-medium uppercase tracking-[0.18em] text-mute">Cases</div>
        {cases.map((item) => (
          <button
            key={item.case_id}
            type="button"
            onClick={() => onSelectCase(item.case_id)}
            className={cn(
              'w-full rounded-xl border px-3 py-2.5 text-left',
              item.case_id === active.case_id ? 'border-violet-400/30 bg-violet-500/10' : 'border-line bg-card/40 hover:border-[#3A3348]',
            )}
          >
            <div className="text-sm text-frost">{item.entity_id}</div>
            <div className="mt-1 line-clamp-2 text-xs text-mute">{item.title}</div>
            {item.trust_status ? (
              <div className="mt-2">
                <TrustBadge status={item.trust_status} />
              </div>
            ) : null}
          </button>
        ))}
      </aside>

      <div className="space-y-5">
        <header className="rounded-2xl border border-line bg-card/50 p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="text-[11px] uppercase tracking-[0.16em] text-mute">{active.case_id}</div>
              <h1 className="mt-1 text-xl font-semibold text-frost">{active.title}</h1>
              <p className="mt-2 max-w-2xl text-sm text-mute">{active.description}</p>
            </div>
            {active.trust_status ? <TrustBadge status={active.trust_status} /> : null}
          </div>
          <div className="mt-4 flex flex-wrap gap-3 text-xs text-mute">
            <span className="rounded-full border border-line px-2.5 py-1">{active.entity_type}</span>
            <span className="rounded-full border border-line px-2.5 py-1">{active.evidence_count} evidence</span>
            <span className="rounded-full border border-line px-2.5 py-1">Updated {new Date(active.updated_at).toLocaleString()}</span>
          </div>
        </header>

        {packet ? (
          <>
            <section>
              <div className="mb-3 flex items-center gap-2 text-sm text-frost">
                <FileDigit className="h-4 w-4 text-violet-200" />
                Evidence objects
              </div>
              <motion.div className="grid gap-3 md:grid-cols-2" variants={staggerFast} initial="hidden" animate="show" inherit={false}>
                {packet.evidence.map((item) => (
                  <EvidenceCard key={item.evidence_id} item={item} />
                ))}
              </motion.div>
            </section>
            <section>
              <div className="mb-3 text-sm text-frost">Canonical Decision Packet</div>
              <DecisionPacketPanel packet={packet} />
            </section>
          </>
        ) : (
          <div className="rounded-2xl border border-dashed border-line bg-card/30 p-8 text-center text-sm text-mute">
            No Decision Packet yet. Ingest evidence, run analysis, or seed demo TX-92831.
          </div>
        )}
      </div>
    </div>
  );
}
