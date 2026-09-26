import { ArrowRight, Lock, Shield } from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedOrb } from '@/components/chat/AnimatedOrb';
import { pipelineSteps } from '@/data/verdict';
import { fadeUp, springSnappy, staggerContainer, staggerFast } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { ConsoleSection, TrustStatus, VerdictCase } from '@/types/verdict';
import { TRUST_STATE_META } from '@/types/verdict';

const trustOrder: TrustStatus[] = [
  'SUFFICIENT',
  'INCOMPLETE',
  'CONFLICTING',
  'LOW_QUALITY',
  'NEED_MORE_INFO',
  'REFUSE',
];

export function OverviewHome({
  cases,
  onOpenCase,
  onGo,
}: {
  cases: VerdictCase[];
  onOpenCase: (caseId: string) => void;
  onGo: (section: ConsoleSection) => void;
}) {
  return (
    <motion.div
      className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-4 py-6 sm:px-6 lg:px-8"
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      inherit={false}
    >
      <div className="flex flex-col items-center text-center">
        <motion.div variants={fadeUp}>
          <AnimatedOrb size="hero" />
        </motion.div>
        <motion.p variants={fadeUp} className="mt-6 text-[11px] font-medium uppercase tracking-[0.22em] text-violet-200/80">
          Truth verification · Fraud analysis · Deterministic decisioning
        </motion.p>
        <motion.h1 variants={fadeUp} className="mt-3 max-w-3xl text-[28px] font-semibold tracking-tight text-frost sm:text-[34px]">
          Evidence in. Decision Packet out.
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-3 max-w-2xl text-sm leading-relaxed text-mute">
          Files, databases, APIs, and device signals become traceable Evidence Objects. ML and RAG inform —
          the Deterministic Decision Gate decides. Not a chatbot verdict.
        </motion.p>
        <motion.div variants={staggerFast} className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <motion.button
            type="button"
            variants={fadeUp}
            whileHover={{ y: -2, scale: 1.02 }}
            transition={springSnappy}
            onClick={() => onGo('cases')}
            className="accent-gradient rounded-full px-4 py-2 text-sm text-white"
          >
            Explore Active Cases
          </motion.button>
          <motion.button
            type="button"
            variants={fadeUp}
            whileHover={{ y: -2 }}
            transition={springSnappy}
            onClick={() => onGo('connectors')}
            className="rounded-full border border-line bg-card/70 px-4 py-2 text-sm text-mute hover:text-frost"
          >
            Connectors
          </motion.button>
          <motion.button
            type="button"
            variants={fadeUp}
            whileHover={{ y: -2 }}
            transition={springSnappy}
            onClick={() => onGo('cases')}
            className="rounded-full border border-line bg-card/70 px-4 py-2 text-sm text-mute hover:text-frost"
          >
            Open cases
          </motion.button>
        </motion.div>
      </div>

      <motion.section variants={fadeUp}>
        <div className="mb-3 flex items-center gap-2 text-sm text-frost">
          <Lock className="h-4 w-4 text-violet-200" />
          Six gate-enforced trust states
        </div>
        <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {trustOrder.map((status) => {
            const meta = TRUST_STATE_META[status];
            return (
              <div key={status} className={cn('rounded-2xl border px-3.5 py-3', meta.tone)}>
                <div className="flex items-center justify-between gap-2">
                  <span className="text-sm font-medium">{meta.label}</span>
                  <span className="text-[10px] uppercase tracking-wider opacity-80">{meta.action}</span>
                </div>
                <p className="mt-1 text-xs opacity-80">{meta.blurb}</p>
              </div>
            );
          })}
        </div>
      </motion.section>

      <motion.section variants={fadeUp} className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-line bg-card/60 p-4">
          <div className="mb-3 flex items-center gap-2 text-sm text-frost">
            <Shield className="h-4 w-4 text-violet-200" />
            Pipeline
          </div>
          <ol className="space-y-2">
            {pipelineSteps.map((step, index) => (
              <li key={step} className="flex items-start gap-3 text-sm text-mute">
                <span className="mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full border border-line text-[10px] text-frost">
                  {index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>

        <div className="rounded-2xl border border-line bg-card/60 p-4">
          <div className="mb-3 text-sm text-frost">Active cases</div>
          <div className="space-y-2">
            {cases.map((item) => {
              const meta = item.trust_status ? TRUST_STATE_META[item.trust_status] : null;
              return (
                <button
                  key={item.case_id}
                  type="button"
                  onClick={() => onOpenCase(item.case_id)}
                  className="flex w-full items-center justify-between gap-3 rounded-xl border border-transparent bg-white/[0.03] px-3 py-2.5 text-left hover:border-line"
                >
                  <div className="min-w-0">
                    <div className="truncate text-sm text-frost">{item.entity_id}</div>
                    <div className="truncate text-xs text-mute">{item.evidence_count} evidence objects</div>
                  </div>
                  <div className="flex items-center gap-2">
                    {meta ? (
                      <span className={cn('rounded-full border px-2 py-0.5 text-[10px]', meta.tone)}>{meta.label}</span>
                    ) : null}
                    <ArrowRight className="h-3.5 w-3.5 text-mute" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </motion.section>
    </motion.div>
  );
}
