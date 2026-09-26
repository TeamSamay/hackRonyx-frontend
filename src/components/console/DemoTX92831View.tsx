import { useState } from 'react';
import { Play, CheckCircle2, ShieldCheck, RefreshCw } from 'lucide-react';
import { motion } from 'motion/react';
import { triggerDemoSeedTX92831 } from '@/lib/api';
import type { DecisionPacket } from '@/types/verdict';
import { DecisionPacketPanel } from '@/components/console/CaseWorkspace';

const pipelineSteps = [
  { step: 1, title: 'Ingest E001 Core Banking', desc: 'Transaction ₹85,000 branch terminal in Mumbai', icon: '🏦' },
  { step: 2, title: 'Ingest E002 Telemetry', desc: 'Device IP telemetry active in Delhi', icon: '📱' },
  { step: 3, title: 'Ingest E003 KYC Record', desc: 'Registered address Mumbai (OCR 96%)', icon: '📄' },
  { step: 4, title: 'Ingest E004 History', desc: 'Spend affinity Mumbai historical baseline', icon: '📊' },
  { step: 5, title: 'Run ML Models', desc: 'XGBoost (91% Fraud Risk) + Isolation Forest (84%) + SHAP', icon: '⚡' },
  { step: 6, title: 'Contradiction Engine', desc: 'Deterministic Python detection: Mumbai ≠ Delhi', icon: '⚠️' },
  { step: 7, title: 'Challenge Engine', desc: 'Adversarial counter-evidence hypothesis stress-test', icon: '⚔️' },
  { step: 8, title: 'Decision Gate Enforcement', desc: 'Enforce CONFLICTING State → Route to HUMAN_REVIEW', icon: '⚖️' },
];

export function DemoTX92831View({ onDemoComplete }: { onDemoComplete?: (decision: DecisionPacket) => void }) {
  const [running, setRunning] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);
  const [packet, setPacket] = useState<DecisionPacket | null>(null);

  const startDemo = async () => {
    setRunning(true);
    setPacket(null);
    setCurrentStep(1);

    for (let i = 1; i <= 8; i++) {
      setCurrentStep(i);
      await new Promise((r) => setTimeout(r, 450));
    }

    const res = await triggerDemoSeedTX92831();
    setPacket(res);
    setRunning(false);
    if (onDemoComplete) onDemoComplete(res);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="border-b border-line/60 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-violet-300 uppercase tracking-widest font-mono">
          <ShieldCheck className="h-4 w-4 text-violet-300" />
          Realtime Fraud & Risk Intelligence Engine
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-frost">Case TX-92831 Realtime Pipeline Runner</h1>
        <p className="mt-1 text-xs text-mute max-w-2xl">
          Execute multi-source evidence ingestion, ML risk calculation, deterministic contradiction detection, and gate enforcement live.
        </p>
      </div>

      {/* Trigger Hero Banner */}
      <div className="rounded-2xl border border-violet-500/30 bg-gradient-to-r from-violet-900/30 via-indigo-900/20 to-purple-900/30 p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-2xl">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 rounded-full border border-violet-400/30 bg-violet-500/10 px-3 py-1 text-xs font-mono text-violet-200">
            TARGET_CASE: TX-92831 (HIGH-VALUE WIRE TRANSFER DISPUTE)
          </div>
          <h2 className="text-xl font-bold text-frost">Execute Realtime Pipeline Evaluation</h2>
          <p className="text-xs text-mute max-w-xl leading-relaxed">
            Ingests Core Banking, Device Telemetry, KYC OCR, and Account History → Runs XGBoost + Isolation Forest + SHAP → Detects Mumbai ≠ Delhi clash → Enforces CONFLICTING trust state.
          </p>
        </div>
        <button
          type="button"
          onClick={startDemo}
          disabled={running}
          className="accent-gradient inline-flex items-center justify-center gap-2.5 rounded-2xl px-6 py-3.5 text-sm font-bold text-white shadow-xl shadow-violet-500/30 hover:opacity-90 active:scale-95 transition shrink-0"
        >
          {running ? <RefreshCw className="h-5 w-5 animate-spin" /> : <Play className="h-5 w-5 fill-white" />}
          {running ? `Executing Step ${currentStep}/8...` : 'EXECUTE REALTIME PIPELINE'}
        </button>
      </div>

      {/* Step Progress Visualizer */}
      <div className="rounded-2xl border border-line bg-card/60 p-5 space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-widest text-mute font-mono">
          Pipeline Execution Tracker ({currentStep > 0 ? `${currentStep}/8` : 'Ready'})
        </h3>
        <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {pipelineSteps.map((s) => {
            const isDone = currentStep > s.step || packet !== null;
            const isCurrent = currentStep === s.step;
            return (
              <div
                key={s.step}
                className={`rounded-xl border p-3 transition-all ${
                  isCurrent
                    ? 'border-violet-400 bg-violet-500/20 text-frost ring-2 ring-violet-500/30'
                    : isDone
                    ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-200'
                    : 'border-line/60 bg-black/20 text-mute'
                }`}
              >
                <div className="flex items-center justify-between text-xs font-mono mb-1">
                  <span>{s.icon} Step {s.step}</span>
                  {isDone ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : isCurrent ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin text-violet-300" />
                  ) : null}
                </div>
                <div className="text-xs font-semibold text-frost">{s.title}</div>
                <div className="text-[10px] text-mute mt-0.5">{s.desc}</div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Final Decision Packet Output */}
      {packet && (
        <motion.div
          initial={{ opacity: 0, scale: 0.98 }}
          animate={{ opacity: 1, scale: 1 }}
          className="space-y-4"
        >
          <div className="flex items-center justify-between border-b border-line/60 pb-3">
            <h3 className="text-sm font-bold text-frost flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-violet-300" />
              Final Canonical Decision Packet (TX-92831)
            </h3>
            <span className="rounded-full border border-orange-400/30 bg-orange-500/15 px-3 py-1 text-xs font-mono text-orange-200 font-bold">
              TRUST_STATE: {packet.trust_status} (HUMAN_REVIEW)
            </span>
          </div>
          <DecisionPacketPanel packet={packet} />
        </motion.div>
      )}
    </div>
  );
}
