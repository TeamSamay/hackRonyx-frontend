import { CheckCircle2, Database, Plug, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import type { ConnectorConfig, ConsoleSection, DecisionPacket, EvidenceObject, VerdictCase } from '@/types/verdict';
import { TRUST_STATE_META } from '@/types/verdict';
import { DecisionPacketPanel } from '@/components/console/CaseWorkspace';
import { fadeUp, springSnappy, staggerFast } from '@/lib/motion';
import { cn } from '@/lib/utils';

export function EvidenceView({ cases, activeCaseId }: { cases: VerdictCase[]; activeCaseId: string }) {
  const active = cases.find((item) => item.case_id === activeCaseId) ?? cases[0];
  const evidence: EvidenceObject[] = active?.decision?.evidence ?? [];

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-xl font-semibold text-frost">Evidence Objects</h1>
      <p className="mt-2 max-w-2xl text-sm text-mute">
        Once inside VERDICT, every source becomes a traceable Evidence Object — subject, predicate, value, quality, and
        provenance.
      </p>
      <p className="mt-3 text-xs text-mute">
        Showing {active?.case_id} · {evidence.length} objects
      </p>
      <motion.div className="mt-5 grid gap-3 md:grid-cols-2" variants={staggerFast} initial="hidden" animate="show" inherit={false}>
        {evidence.map((item) => (
          <motion.div key={item.evidence_id} variants={fadeUp} className="rounded-2xl border border-line bg-card/70 p-4">
            <div className="flex justify-between gap-2">
              <span className="text-sm font-semibold text-frost">{item.evidence_id}</span>
              <span className="text-[11px] text-mute">{item.source.type}</span>
            </div>
            <p className="mt-2 text-sm text-frost">
              {item.claim.predicate} = <span className="text-violet-200">{String(item.claim.value)}</span>
            </p>
            <p className="mt-2 text-xs text-mute">{item.claim.raw_statement}</p>
          </motion.div>
        ))}
        {evidence.length === 0 ? (
          <div className="col-span-full rounded-2xl border border-dashed border-line p-8 text-center text-sm text-mute">
            No evidence on this case yet.
          </div>
        ) : null}
      </motion.div>
    </div>
  );
}

export function ConnectorsView({ connectors }: { connectors: ConnectorConfig[] }) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-xl font-semibold text-frost">Ingestion connectors</h1>
      <p className="mt-2 max-w-2xl text-sm text-mute">
        Read-only authorized connectors and Edge Gateway feeds. Credentials stay on the gateway — the console only sees
        connector health and Evidence Objects.
      </p>
      <div className="mt-5 grid gap-3 md:grid-cols-2">
        {connectors.map((item) => (
          <motion.div
            key={item.id}
            whileHover={{ y: -2 }}
            transition={springSnappy}
            className="rounded-2xl border border-line bg-card/70 p-4"
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-2">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white/[0.03]">
                  {item.connector_type === 'REST_API' ? <Plug className="h-4 w-4 text-violet-200" /> : <Database className="h-4 w-4 text-violet-200" />}
                </span>
                <div>
                  <div className="text-sm font-medium text-frost">{item.name}</div>
                  <div className="text-[11px] text-mute">{item.connector_type}</div>
                </div>
              </div>
              <span
                className={cn(
                  'rounded-full border px-2 py-0.5 text-[10px]',
                  item.is_active ? 'border-emerald-400/30 text-emerald-200' : 'border-line text-mute',
                )}
              >
                {item.is_active ? 'Active' : 'Idle'}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-mute">
              {item.host ? <span className="rounded-md border border-line px-1.5 py-0.5">{item.host}</span> : null}
              {item.database ? <span className="rounded-md border border-line px-1.5 py-0.5">db:{item.database}</span> : null}
              {item.read_only ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-line px-1.5 py-0.5">
                  <Shield className="h-3 w-3" /> read-only
                </span>
              ) : null}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export function DecisionGateView() {
  const states = Object.entries(TRUST_STATE_META) as Array<[keyof typeof TRUST_STATE_META, (typeof TRUST_STATE_META)[keyof typeof TRUST_STATE_META]]>;
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-xl font-semibold text-frost">Deterministic Decision Gate</h1>
      <p className="mt-2 max-w-2xl text-sm text-mute">
        Un-bypassable. The LLM may reason over evidence, but only these six trust states can leave the gate.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {states.map(([status, meta]) => (
          <div key={status} className={cn('rounded-2xl border p-4', meta.tone)}>
            <div className="flex items-center justify-between gap-2">
              <span className="text-base font-semibold">{meta.label}</span>
              <span className="text-[11px] uppercase tracking-wider">{meta.action}</span>
            </div>
            <p className="mt-2 text-sm opacity-85">{meta.blurb}</p>
            <p className="mt-3 text-[11px] opacity-70">{status}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ChallengeView({ packet }: { packet?: DecisionPacket }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-xl font-semibold text-frost">Challenge Engine</h1>
      <p className="mt-2 text-sm text-mute">
        Adversarial counter-evidence stress-test. If a hypothesis cannot neutralize contradictions, the gate state
        stands.
      </p>
      {packet?.challenge ? (
        <div className="mt-5 rounded-2xl border border-line bg-card/60 p-5">
          <div className="flex items-center gap-2 text-sm text-frost">
            <CheckCircle2 className="h-4 w-4 text-violet-200" />
            Last run on {packet.case_id}
          </div>
          <p className="mt-3 text-sm text-mute">{packet.challenge.challenge_summary}</p>
          <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-[11px] text-mute">Hypothesis</dt>
              <dd className="mt-1 text-frost">{packet.challenge.hypothesis ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-mute">Counter-evidence found</dt>
              <dd className="mt-1 text-frost">{packet.challenge.counter_evidence_found ? 'Yes' : 'No'}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-mute">Original state</dt>
              <dd className="mt-1 text-frost">{packet.challenge.original_risk_state ?? '—'}</dd>
            </div>
            <div>
              <dt className="text-[11px] text-mute">Adjusted state</dt>
              <dd className="mt-1 text-frost">{packet.challenge.adjusted_risk_state ?? '—'}</dd>
            </div>
          </dl>
        </div>
      ) : (
        <div className="mt-5 rounded-2xl border border-dashed border-line p-8 text-center text-sm text-mute">
          Run analysis on a case to produce a challenge packet.
        </div>
      )}
    </div>
  );
}

export function ReviewsView({ activeCase }: { activeCase?: VerdictCase }) {
  return (
    <div className="mx-auto w-full max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-xl font-semibold text-frost">Human Review</h1>
      <p className="mt-2 text-sm text-mute">
        When the gate routes to HUMAN_REVIEW, analysts resolve contradictions with a full audit trail — never by
        averaging scores.
      </p>
      <div className="mt-5 rounded-2xl border border-line bg-card/60 p-5">
        {activeCase?.trust_status === 'CONFLICTING' ? (
          <>
            <div className="text-sm text-frost">{activeCase.case_id} queued for review</div>
            <p className="mt-2 text-sm text-mute">
              Recommendation: {activeCase.decision?.recommendation ?? 'HUMAN_REVIEW'}. Resolve Mumbai ≠ Delhi location
              clash before any proceed path.
            </p>
            <button
              type="button"
              className="mt-4 rounded-full border border-violet-400/30 bg-violet-500/15 px-4 py-2 text-sm text-violet-100"
            >
              Open review workspace
            </button>
          </>
        ) : (
          <p className="text-sm text-mute">No cases currently require human review in this mock console.</p>
        )}
      </div>
    </div>
  );
}

export function DemoView({
  packet,
  onOpenCase,
}: {
  packet: DecisionPacket;
  onOpenCase: () => void;
  onGo?: (section: ConsoleSection) => void;
}) {
  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
      <h1 className="text-xl font-semibold text-frost">Hackathon demo · TX-92831</h1>
      <p className="mt-2 max-w-2xl text-sm text-mute">
        Mirrors <code className="text-violet-200">POST /api/demo/seed-tx92831</code>: ingest E-001…E-004, run ML +
        contradiction + challenge, enforce CONFLICTING → HUMAN_REVIEW, return the Decision Packet.
      </p>
      <div className="mt-4 flex flex-wrap gap-2">
        <button type="button" onClick={onOpenCase} className="accent-gradient rounded-full px-4 py-2 text-sm text-white">
          Open CASE-TX92831
        </button>
      </div>
      <div className="mt-6">
        <DecisionPacketPanel packet={packet} />
      </div>
    </div>
  );
}
