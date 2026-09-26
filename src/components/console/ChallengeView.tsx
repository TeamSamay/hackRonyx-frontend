import { useState } from 'react';
import { Swords, Scale, RefreshCw, CheckCircle2 } from 'lucide-react';
import { motion } from 'motion/react';
import { demoDecision } from '@/data/verdict';

export function ChallengeView() {
  const [hypothesis, setHypothesis] = useState(
    'Legitimate user transferred money via Mumbai branch terminal while logged into Delhi office VPN telemetry.'
  );
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<typeof demoDecision.challenge | null>(demoDecision.challenge);

  const runChallenge = () => {
    setTesting(true);
    setTimeout(() => {
      setResult({
        performed: true,
        hypothesis: hypothesis,
        counter_evidence_found: false,
        challenge_summary:
          'Adversarial stress-test executed against 4 evidence streams. No valid counter-evidence neutralized the Mumbai ≠ Delhi physical location clash.',
        original_risk_state: 'CONFLICTING',
        adjusted_risk_state: 'CONFLICTING',
      });
      setTesting(false);
    }, 800);
  };

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <div className="border-b border-line/60 pb-5">
        <div className="flex items-center gap-2 text-xs font-semibold text-violet-300 uppercase tracking-widest font-mono">
          <Swords className="h-4 w-4" /> Adversarial Stress-Test Engine
        </div>
        <h1 className="mt-1 text-2xl font-bold tracking-tight text-frost">Counter-Evidence Challenge Engine</h1>
        <p className="mt-1 text-xs text-mute max-w-2xl">
          Stress-test initial fraud flags with counter-hypotheses before reaching the Deterministic Decision Gate.
        </p>
      </div>

      {/* Interactive Challenge Launcher */}
      <div className="rounded-2xl border border-line bg-card/60 p-6 space-y-4">
        <h2 className="text-sm font-semibold text-frost flex items-center gap-2">
          <Scale className="h-4 w-4 text-violet-300" />
          Test Adversarial Counter-Hypothesis
        </h2>
        <div>
          <label className="text-xs text-mute block mb-1">Enter Rationale / Defense Hypothesis</label>
          <textarea
            rows={3}
            value={hypothesis}
            onChange={(e) => setHypothesis(e.target.value)}
            className="w-full rounded-xl border border-line bg-black/40 p-3 text-xs text-frost outline-none focus:border-violet-400 font-sans"
          />
        </div>
        <button
          type="button"
          onClick={runChallenge}
          disabled={testing}
          className="accent-gradient inline-flex items-center gap-2 rounded-xl px-4 py-2.5 text-xs font-semibold text-white shadow-lg shadow-violet-500/25 hover:opacity-90"
        >
          {testing ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Swords className="h-4 w-4" />}
          Execute Challenge Stress-Test
        </button>
      </div>

      {/* Results Panel */}
      {result && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-violet-500/30 bg-card/80 p-6 space-y-4"
        >
          <div className="flex items-center justify-between border-b border-line/60 pb-3">
            <span className="text-xs font-semibold uppercase tracking-wider text-violet-300 font-mono">
              Challenge Test Outcome
            </span>
            <span className="rounded-full border border-orange-500/30 bg-orange-500/10 px-3 py-1 text-xs font-mono text-orange-300">
              STATE_RETAINED: {result.adjusted_risk_state}
            </span>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="rounded-xl border border-line bg-black/30 p-4 space-y-1">
              <div className="text-[11px] text-mute uppercase font-mono">Original Gate State</div>
              <div className="text-lg font-bold text-orange-300">{result.original_risk_state}</div>
            </div>
            <div className="rounded-xl border border-line bg-black/30 p-4 space-y-1">
              <div className="text-[11px] text-mute uppercase font-mono">Post-Challenge State</div>
              <div className="text-lg font-bold text-orange-300">{result.adjusted_risk_state}</div>
            </div>
          </div>

          <div className="rounded-xl border border-line bg-black/40 p-4 space-y-2">
            <div className="text-xs font-semibold text-frost">Engine Findings</div>
            <p className="text-xs leading-relaxed text-mute">{result.challenge_summary}</p>
            <div className="pt-2 text-[11px] font-mono text-violet-300 flex items-center gap-1">
              <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
              Decision Gate enforced state integrity. No hallucinated override permitted.
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}
