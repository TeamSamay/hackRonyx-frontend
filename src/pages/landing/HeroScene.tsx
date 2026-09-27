import { Suspense, lazy, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Database,
  FileSpreadsheet,
  FileText,
  Lock,
  Pause,
  Play,
  RotateCcw,
  ShieldCheck,
  Smartphone,
  type LucideIcon,
} from 'lucide-react';
import {
  AnimatePresence,
  animate,
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type MotionValue,
} from 'motion/react';
import { easeOutExpo } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { ScenePhase } from './ParticleField';

const ParticleField = lazy(() => import('./ParticleField'));

const PHASES: Array<{ id: ScenePhase; label: string; caption: string; duration: number }> = [
  { id: 'ingest', label: 'Ingest', caption: 'Four read-only sources stream into the gateway', duration: 2.8 },
  { id: 'normalize', label: 'Normalize', caption: 'Claims become hashed Evidence Objects', duration: 2.4 },
  { id: 'score', label: 'Score', caption: 'XGBoost and Isolation Forest attach risk', duration: 2.4 },
  { id: 'contradict', label: 'Contradict', caption: 'Mumbai at 14:02, New Delhi at 14:05', duration: 2.4 },
  { id: 'decide', label: 'Decide', caption: 'The gate locks CONFLICTING and routes to review', duration: 3.6 },
];

const STARTS = PHASES.reduce<number[]>((acc, _phase, index) => {
  acc.push(index === 0 ? 0 : acc[index - 1] + PHASES[index - 1].duration);
  return acc;
}, []);

const TOTAL = STARTS[STARTS.length - 1] + PHASES[PHASES.length - 1].duration;

const CENTER = { x: 50, y: 46 };

const SOURCES: Array<{
  id: string;
  label: string;
  meta: string;
  claim: string;
  value: string;
  icon: LucideIcon;
  x: number;
  y: number;
  clash?: boolean;
}> = [
  { id: 'bank', label: 'Bank terminal', meta: 'PostgreSQL · 14:02 IST', claim: 'location', value: 'Mumbai', icon: Database, x: 19, y: 15, clash: true },
  { id: 'device', label: 'iPhone telemetry', meta: 'REST · 14:05 IST', claim: 'location', value: 'New Delhi', icon: Smartphone, x: 81, y: 15, clash: true },
  { id: 'kyc', label: 'KYC file', meta: 'PDF + OCR · page 2', claim: 'address', value: 'Mumbai', icon: FileText, x: 19, y: 78 },
  { id: 'ledger', label: 'Dispute claim', meta: 'Excel · TX-92831', claim: 'amount', value: '₹4,50,000', icon: FileSpreadsheet, x: 81, y: 78 },
];

const HASHES = ['E-001 · sha256:9f2c…a41e', 'E-002 · sha256:1b7d…03fc', 'E-003 · sha256:c55a…9e20', 'E-004 · sha256:70e1…b6d9'];

function sourcePath(x: number, y: number) {
  return `M ${x} ${y} Q ${x} ${CENTER.y} ${CENTER.x} ${CENTER.y}`;
}

function phaseAt(time: number) {
  for (let index = PHASES.length - 1; index >= 0; index -= 1) {
    if (time >= STARTS[index]) return index;
  }
  return 0;
}

export function HeroScene() {
  const reduce = useReducedMotion();
  const stageRef = useRef<HTMLDivElement>(null);
  const inView = useInView(stageRef, { amount: 0.2 });
  const time = useMotionValue(reduce ? STARTS[PHASES.length - 1] + 1 : 0);
  const [phaseIndex, setPhaseIndex] = useState(reduce ? PHASES.length - 1 : 0);
  const [loop, setLoop] = useState(0);
  const [playing, setPlaying] = useState(!reduce);
  const phaseRef = useRef(phaseIndex);

  useAnimationFrame((_, delta) => {
    if (!playing || !inView) return;
    let next = time.get() + Math.min(delta, 64) / 1000;
    if (next >= TOTAL) {
      next = 0;
      setLoop((value) => value + 1);
    }
    time.set(next);
    const index = phaseAt(next);
    if (index !== phaseRef.current) {
      phaseRef.current = index;
      setPhaseIndex(index);
    }
  });

  function seek(index: number) {
    time.set(STARTS[index] + 0.001);
    phaseRef.current = index;
    setPhaseIndex(index);
  }

  function restart() {
    time.set(0);
    phaseRef.current = 0;
    setPhaseIndex(0);
    setLoop((value) => value + 1);
    setPlaying(true);
  }

  const phase = PHASES[phaseIndex].id;
  const reached = (id: ScenePhase) => phaseIndex >= PHASES.findIndex((item) => item.id === id);
  const timecode = useTransform(time, (value) => `00:${value.toFixed(2).padStart(5, '0')}`);

  return (
    <div className="relative">
      <div className="mb-3 flex items-center justify-between px-1 text-[11px] font-medium uppercase tracking-[0.18em] text-slate-500">
        <span className="inline-flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-rose-400 opacity-60" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-rose-500" />
          </span>
          Live render · Case TX-92831
        </span>
        <motion.span className="font-mono tracking-normal text-slate-400">{timecode}</motion.span>
      </div>

      <div
        ref={stageRef}
        data-cursor="Watch"
        className="relative mx-auto aspect-square w-full overflow-hidden rounded-[32px] border border-white/80 bg-gradient-to-b from-white/70 to-violet-50/60 shadow-[0_1px_2px_rgba(20,14,40,0.05),0_40px_90px_-30px_rgba(76,29,149,0.35)] backdrop-blur-sm"
      >
        <div className="pointer-events-none absolute inset-0 [mask-image:radial-gradient(circle_at_50%_46%,black_35%,transparent_75%)]">
          <Suspense fallback={null}>
            <ParticleField phase={phase} active={inView && playing && !reduce} />
          </Suspense>
        </div>

        <motion.div
          key={loop}
          className="absolute inset-0"
          animate={phase === 'contradict' ? { x: [0, -5, 5, -3, 2, 0] } : { x: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
        >
          <svg viewBox="0 0 100 100" className="absolute inset-0 h-full w-full" aria-hidden>
            <defs>
              <linearGradient id="beam" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#38bdf8" />
              </linearGradient>
              <radialGradient id="packet">
                <stop offset="0%" stopColor="#ffffff" />
                <stop offset="60%" stopColor="#8b5cf6" />
                <stop offset="100%" stopColor="#8b5cf6" stopOpacity="0" />
              </radialGradient>
            </defs>

            {SOURCES.map((source, index) => {
              const d = sourcePath(source.x, source.y);
              const clash = phase === 'contradict' && source.clash;
              return (
                <g key={source.id}>
                  <path d={d} fill="none" stroke="rgba(124,58,237,0.12)" strokeWidth={1.5} vectorEffect="non-scaling-stroke" />
                  <motion.path
                    d={d}
                    fill="none"
                    stroke={clash ? '#fb923c' : 'url(#beam)'}
                    strokeWidth={1.75}
                    strokeLinecap="round"
                    vectorEffect="non-scaling-stroke"
                    initial={{ pathLength: 0, opacity: 0 }}
                    animate={{ pathLength: 1, opacity: phase === 'decide' ? 0.35 : 1 }}
                    transition={{ duration: 1.1, delay: 0.25 + index * 0.18, ease: easeOutExpo }}
                  />
                  {phase === 'ingest' || phase === 'normalize' ? (
                    <>
                      <circle r={1.3} fill="url(#packet)">
                        <animateMotion dur="1.5s" repeatCount="indefinite" path={d} begin={`${index * 0.22}s`} />
                      </circle>
                      <circle r={0.9} fill="url(#packet)">
                        <animateMotion dur="1.5s" repeatCount="indefinite" path={d} begin={`${index * 0.22 + 0.75}s`} />
                      </circle>
                    </>
                  ) : null}
                </g>
              );
            })}

            <AnimatePresence>
              {phase === 'contradict' ? (
                <motion.path
                  key="clash"
                  d={`M ${SOURCES[0].x} ${SOURCES[0].y + 6} Q 50 26 ${SOURCES[1].x} ${SOURCES[1].y + 6}`}
                  fill="none"
                  stroke="#f97316"
                  strokeWidth={2}
                  strokeDasharray="4 5"
                  vectorEffect="non-scaling-stroke"
                  initial={{ pathLength: 0, opacity: 0 }}
                  animate={{ pathLength: 1, opacity: [0, 1, 0.5, 1] }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.8, ease: easeOutExpo }}
                />
              ) : null}
            </AnimatePresence>
          </svg>

          <AnimatePresence>
            <motion.span
              key={`pulse-${phaseIndex}`}
              aria-hidden
              className={cn(
                'pointer-events-none absolute h-32 w-32 rounded-full border-2',
                phase === 'contradict' ? 'border-orange-400' : 'border-violet-400',
              )}
              style={{ left: `${CENTER.x}%`, top: `${CENTER.y}%`, x: '-50%', y: '-50%' }}
              initial={{ scale: 0.6, opacity: 0.7 }}
              animate={{ scale: 2.6, opacity: 0 }}
              transition={{ duration: 1.4, ease: easeOutExpo }}
            />
          </AnimatePresence>

          {SOURCES.map((source, index) => (
            <SourceChip
              key={source.id}
              source={source}
              index={index}
              showClaim={reached('normalize')}
              clash={phase === 'contradict' && Boolean(source.clash)}
              dimmed={phase === 'decide' || (phase === 'contradict' && !source.clash)}
            />
          ))}

          <AnimatePresence>
            {phase === 'normalize' ? <HashTicker key="hashes" /> : null}
          </AnimatePresence>

          <AnimatePresence>
            {phase === 'score' || phase === 'contradict' ? (
              <>
                <Gauge key="fraud" label="Fraud" value={0.91} x={27} y={CENTER.y} />
                <Gauge key="anomaly" label="Anomaly" value={0.84} x={73} y={CENTER.y} delay={0.15} />
              </>
            ) : null}
          </AnimatePresence>

          <GateCore phase={phase} />

          <AnimatePresence>{phase === 'decide' ? <PacketReveal key="packet" /> : null}</AnimatePresence>
        </motion.div>
      </div>

      <div className="mt-4 rounded-2xl border border-slate-200/80 bg-white/80 p-3 shadow-[0_12px_30px_-18px_rgba(76,29,149,0.3)] backdrop-blur">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setPlaying((value) => !value)}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-gradient-to-br from-violet-600 to-sky-500 text-white shadow-[0_8px_20px_-8px_rgba(109,40,217,0.7)]"
            aria-label={playing ? 'Pause scene' : 'Play scene'}
          >
            {playing ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 translate-x-px" />}
          </button>
          <div className="min-w-0 flex-1">
            <div className="relative h-5 overflow-hidden text-sm font-medium text-slate-800">
              <AnimatePresence mode="popLayout" initial={false}>
                <motion.p
                  key={phaseIndex}
                  className="absolute inset-0 truncate"
                  initial={{ y: 18, opacity: 0, filter: 'blur(4px)' }}
                  animate={{ y: 0, opacity: 1, filter: 'blur(0px)' }}
                  exit={{ y: -18, opacity: 0, filter: 'blur(4px)' }}
                  transition={{ duration: 0.45, ease: easeOutExpo }}
                >
                  {PHASES[phaseIndex].caption}
                </motion.p>
              </AnimatePresence>
            </div>
            <div className="mt-2 grid grid-cols-5 gap-1.5">
              {PHASES.map((item, index) => (
                <PhaseSegment
                  key={item.id}
                  label={item.label}
                  index={index}
                  time={time}
                  active={index === phaseIndex}
                  onSelect={() => seek(index)}
                />
              ))}
            </div>
          </div>
          <button
            type="button"
            onClick={restart}
            className="grid h-9 w-9 shrink-0 place-items-center rounded-full border border-slate-200 bg-white text-slate-600 transition hover:text-violet-700"
            aria-label="Replay scene"
          >
            <RotateCcw className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

function PhaseSegment({
  label,
  index,
  time,
  active,
  onSelect,
}: {
  label: string;
  index: number;
  time: MotionValue<number>;
  active: boolean;
  onSelect: () => void;
}) {
  const start = STARTS[index];
  const duration = PHASES[index].duration;
  const fill = useTransform(time, (value) => Math.min(Math.max((value - start) / duration, 0), 1));

  return (
    <button type="button" onClick={onSelect} className="group text-left" aria-label={`Jump to ${label}`}>
      <span className="block h-1 overflow-hidden rounded-full bg-slate-200/80">
        <motion.span
          className="block h-full origin-left rounded-full bg-gradient-to-r from-violet-600 to-sky-400"
          style={{ scaleX: fill }}
        />
      </span>
      <span
        className={cn(
          'mt-1.5 block truncate text-[10px] font-medium uppercase tracking-[0.14em] transition-colors',
          active ? 'text-violet-700' : 'text-slate-400 group-hover:text-slate-600',
        )}
      >
        {label}
      </span>
    </button>
  );
}

function SourceChip({
  source,
  index,
  showClaim,
  clash,
  dimmed,
}: {
  source: (typeof SOURCES)[number];
  index: number;
  showClaim: boolean;
  clash: boolean;
  dimmed: boolean;
}) {
  const Icon = source.icon;
  const fromX = source.x < 50 ? -40 : 40;
  const fromY = source.y < 50 ? -30 : 30;

  return (
    <div
      className="absolute w-[44%] max-w-[176px]"
      style={{ left: `${source.x}%`, top: `${source.y}%`, transform: 'translate(-50%, -50%)' }}
    >
    <motion.div
      initial={{ opacity: 0, x: fromX, y: fromY, scale: 0.85, filter: 'blur(8px)' }}
      animate={{ opacity: dimmed ? 0.4 : 1, x: 0, y: 0, scale: clash ? 1.05 : 1, filter: 'blur(0px)' }}
      transition={{ duration: 0.9, delay: index * 0.12, ease: easeOutExpo }}
    >
      <motion.div
        animate={{ y: [0, -4, 0] }}
        transition={{ duration: 3 + index * 0.4, repeat: Infinity, ease: 'easeInOut' }}
        className={cn(
          'rounded-2xl border bg-white/90 p-2.5 shadow-[0_12px_30px_-14px_rgba(76,29,149,0.35)] backdrop-blur transition-colors duration-300 sm:p-3',
          clash ? 'border-orange-300 shadow-[0_0_0_4px_rgba(251,146,60,0.15)]' : 'border-white',
        )}
      >
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'grid h-7 w-7 shrink-0 place-items-center rounded-lg',
              clash ? 'bg-orange-50 text-orange-600' : 'bg-violet-50 text-violet-600',
            )}
          >
            <Icon className="h-3.5 w-3.5" />
          </span>
          <div className="min-w-0">
            <div className="truncate text-[11px] font-semibold text-slate-900 sm:text-xs">{source.label}</div>
            <div className="hidden truncate font-mono text-[9px] text-slate-400 sm:block">{source.meta}</div>
          </div>
        </div>
        <AnimatePresence>
          {showClaim ? (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.5, ease: easeOutExpo }}
              className="overflow-hidden"
            >
              <div
                className={cn(
                  'mt-2 flex items-center justify-between gap-2 rounded-lg px-2 py-1 text-[10px] sm:text-[11px]',
                  clash ? 'bg-orange-50 text-orange-700' : 'bg-slate-50 text-slate-500',
                )}
              >
                <span className="font-mono">{source.claim}</span>
                <span className={cn('font-semibold', clash ? 'text-orange-600' : 'text-slate-900')}>{source.value}</span>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </motion.div>
    </motion.div>
    </div>
  );
}

function GateCore({ phase }: { phase: ScenePhase }) {
  const warning = phase === 'contradict' || phase === 'decide';

  return (
    <div
      className="absolute h-[30%] w-[30%] max-h-36 max-w-36"
      style={{ left: `${CENTER.x}%`, top: `${CENTER.y}%`, transform: 'translate(-50%, -50%)' }}
    >
      <motion.div
        aria-hidden
        className="absolute -inset-2 rounded-full"
        style={{
          background: warning
            ? 'conic-gradient(from 0deg, transparent, #fb923c, #f97316, transparent 70%)'
            : 'conic-gradient(from 0deg, transparent, #8b5cf6, #38bdf8, transparent 70%)',
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: phase === 'ingest' ? 2.2 : 4, repeat: Infinity, ease: 'linear' }}
      />
      <motion.div
        className="absolute inset-0 grid place-items-center rounded-full border border-white bg-white/95 shadow-[0_20px_50px_-20px_rgba(76,29,149,0.5)]"
        animate={{ scale: phase === 'decide' ? [1, 1.08, 1] : 1 }}
        transition={{ duration: 0.6 }}
      >
        <AnimatePresence mode="popLayout" initial={false}>
          <motion.div
            key={phase}
            className="flex flex-col items-center text-center"
            initial={{ opacity: 0, y: 12, filter: 'blur(6px)' }}
            animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            exit={{ opacity: 0, y: -12, filter: 'blur(6px)' }}
            transition={{ duration: 0.45, ease: easeOutExpo }}
          >
            <GateContent phase={phase} />
          </motion.div>
        </AnimatePresence>
      </motion.div>
    </div>
  );
}

function GateContent({ phase }: { phase: ScenePhase }) {
  switch (phase) {
    case 'ingest':
      return (
        <>
          <ShieldCheck className="h-5 w-5 text-violet-600" />
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-500">Gateway</span>
          <span className="mt-1 flex gap-1">
            {[0, 1, 2].map((dot) => (
              <motion.span
                key={dot}
                className="h-1 w-1 rounded-full bg-violet-500"
                animate={{ opacity: [0.25, 1, 0.25] }}
                transition={{ duration: 1, repeat: Infinity, delay: dot * 0.18 }}
              />
            ))}
          </span>
        </>
      );
    case 'normalize':
      return (
        <>
          <span className="text-2xl font-semibold tracking-tight text-slate-950">
            <Ticker to={14} />
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">Evidence objects</span>
        </>
      );
    case 'score':
      return (
        <>
          <span className="text-2xl font-semibold tracking-tight text-slate-950">
            0.<Ticker to={91} pad />
          </span>
          <span className="text-[9px] font-semibold uppercase tracking-[0.14em] text-slate-500">Fraud risk</span>
        </>
      );
    case 'contradict':
      return (
        <>
          <motion.span animate={{ scale: [1, 1.2, 1] }} transition={{ duration: 0.8, repeat: Infinity }}>
            <AlertTriangle className="h-6 w-6 text-orange-500" />
          </motion.span>
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-orange-600">Clash</span>
        </>
      );
    case 'decide':
      return (
        <>
          <Lock className="h-5 w-5 text-orange-600" />
          <span className="mt-1 text-[10px] font-semibold uppercase tracking-[0.16em] text-slate-600">Gate locked</span>
        </>
      );
  }
}

function Ticker({ to, pad = false }: { to: number; pad?: boolean }) {
  const value = useMotionValue(0);
  const text = useTransform(value, (latest) => {
    const rounded = Math.round(latest).toString();
    return pad ? rounded.padStart(2, '0') : rounded;
  });

  useEffect(() => {
    const controls = animate(value, to, { duration: 1.2, ease: easeOutExpo });
    return () => controls.stop();
  }, [to, value]);

  return <motion.span>{text}</motion.span>;
}

function HashTicker() {
  return (
    <motion.div
      style={{ x: '-50%' }}
      className="absolute left-1/2 top-[64%] w-[58%] max-w-[240px] rounded-xl border border-white bg-white/90 p-2 font-mono text-[9px] text-slate-500 shadow-[0_12px_30px_-14px_rgba(76,29,149,0.35)] backdrop-blur sm:text-[10px]"
      initial={{ opacity: 0, y: 16, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: -10, scale: 0.95 }}
      transition={{ duration: 0.5, ease: easeOutExpo }}
    >
      {HASHES.map((hash, index) => (
        <motion.div
          key={hash}
          className="flex items-center gap-1.5 truncate py-0.5"
          initial={{ opacity: 0, x: -8 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.2 + index * 0.28, duration: 0.4 }}
        >
          <span className="h-1 w-1 shrink-0 rounded-full bg-emerald-500" />
          {hash}
        </motion.div>
      ))}
    </motion.div>
  );
}

function Gauge({ label, value, x, y, delay = 0 }: { label: string; value: number; x: number; y: number; delay?: number }) {
  const circumference = 2 * Math.PI * 16;

  return (
    <motion.div
      className="absolute grid place-items-center"
      style={{ left: `${x}%`, top: `${y}%`, x: '-50%', y: '-50%' }}
      initial={{ opacity: 0, scale: 0.6 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ duration: 0.5, delay, ease: easeOutExpo }}
    >
      <div className="relative grid h-16 w-16 place-items-center rounded-full bg-white/90 shadow-[0_12px_30px_-14px_rgba(76,29,149,0.4)] backdrop-blur sm:h-[72px] sm:w-[72px]">
        <svg viewBox="0 0 40 40" className="absolute inset-0 h-full w-full -rotate-90">
          <circle cx="20" cy="20" r="16" fill="none" stroke="#ede9fe" strokeWidth="3" />
          <motion.circle
            cx="20"
            cy="20"
            r="16"
            fill="none"
            stroke="url(#gauge)"
            strokeWidth="3"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: circumference * (1 - value) }}
            transition={{ duration: 1.3, delay: delay + 0.2, ease: easeOutExpo }}
          />
          <defs>
            <linearGradient id="gauge" x1="0" y1="0" x2="1" y2="1">
              <stop offset="0%" stopColor="#8b5cf6" />
              <stop offset="100%" stopColor="#f97316" />
            </linearGradient>
          </defs>
        </svg>
        <div className="relative text-center">
          <div className="text-sm font-semibold text-slate-950">{value.toFixed(2)}</div>
          <div className="text-[8px] font-semibold uppercase tracking-[0.12em] text-slate-400">{label}</div>
        </div>
      </div>
    </motion.div>
  );
}

function PacketReveal() {
  return (
    <motion.div
      className="absolute bottom-[5%] left-1/2 w-[70%] max-w-[300px]"
      style={{ x: '-50%' }}
      initial={{ opacity: 0, y: 60, scale: 0.9, filter: 'blur(10px)' }}
      animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
      exit={{ opacity: 0, y: 30, filter: 'blur(6px)' }}
      transition={{ duration: 0.8, ease: easeOutExpo }}
    >
      <div className="relative overflow-hidden rounded-2xl border border-white bg-white p-3.5 shadow-[0_30px_60px_-24px_rgba(76,29,149,0.5)]">
        <motion.span
          aria-hidden
          className="pointer-events-none absolute inset-y-0 w-1/2 bg-gradient-to-r from-transparent via-violet-200/50 to-transparent"
          initial={{ x: '-120%' }}
          animate={{ x: '260%' }}
          transition={{ duration: 1.2, delay: 0.6, ease: 'easeInOut' }}
        />
        <div className="flex items-center justify-between text-[10px]">
          <span className="inline-flex items-center gap-1.5 font-semibold text-slate-900">
            <ShieldCheck className="h-3.5 w-3.5 text-violet-600" />
            Decision Packet
          </span>
          <span className="font-mono text-slate-400">CASE-TX92831</span>
        </div>
        <div className="mt-2.5 flex items-center justify-between gap-2">
          <motion.span
            className="rounded-lg border-2 border-orange-500 px-2 py-0.5 text-base font-bold tracking-tight text-orange-600"
            initial={{ scale: 2.2, rotate: -14, opacity: 0 }}
            animate={{ scale: 1, rotate: -4, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 16, delay: 0.35 }}
          >
            CONFLICTING
          </motion.span>
          <motion.span
            className="rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 font-mono text-[9px] text-orange-700"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.7, duration: 0.4 }}
          >
            HUMAN_REVIEW
          </motion.span>
        </div>
        <div className="mt-2.5 grid grid-cols-3 gap-1.5 text-center">
          {[
            ['Fraud', '0.91'],
            ['Anomaly', '0.84'],
            ['Clash', '1'],
          ].map(([label, value], index) => (
            <motion.div
              key={label}
              className="rounded-lg bg-slate-50 px-1.5 py-1"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 + index * 0.1, duration: 0.4 }}
            >
              <div className="text-[8px] uppercase tracking-[0.12em] text-slate-400">{label}</div>
              <div className="text-xs font-semibold text-slate-900">{value}</div>
            </motion.div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
