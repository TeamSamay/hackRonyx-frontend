import { AlertTriangle, CheckCircle2, FileText } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import type { RecentAnalysis } from '@/data/chat';
import { fadeUp, springSnappy } from '@/lib/motion';
import { cn } from '@/lib/utils';

const toneStyles = {
  danger: {
    iconWrap: 'border-rose-400/25 bg-rose-500/10 text-rose-300',
    badge: 'border-rose-400/25 bg-rose-500/10 text-rose-200',
    Icon: AlertTriangle,
  },
  warning: {
    iconWrap: 'border-amber-300/25 bg-amber-400/10 text-amber-200',
    badge: 'border-amber-300/25 bg-amber-400/10 text-amber-100',
    Icon: AlertTriangle,
  },
  success: {
    iconWrap: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-300',
    badge: 'border-emerald-400/25 bg-emerald-400/10 text-emerald-200',
    Icon: CheckCircle2,
  },
  info: {
    iconWrap: 'border-violet-400/25 bg-violet-500/10 text-violet-200',
    badge: 'border-violet-400/25 bg-violet-500/10 text-violet-100',
    Icon: FileText,
  },
} as const;

export function RecentAnalysisCard({
  item,
  onOpen,
}: {
  item: RecentAnalysis;
  onOpen: (prompt: string) => void;
}) {
  const style = toneStyles[item.tone];
  const Icon = style.Icon;
  const reduce = useReducedMotion();

  return (
    <motion.button
      type="button"
      variants={fadeUp}
      whileHover={reduce ? undefined : { y: -4, scale: 1.02 }}
      whileTap={reduce ? undefined : { scale: 0.985 }}
      transition={springSnappy}
      onClick={() => onOpen(item.prompt)}
      className="group rounded-2xl border border-line bg-card/90 p-4 text-left hover:border-[#3A3348] hover:bg-[#221C2C]"
    >
      <div className="flex items-start justify-between gap-3">
        <motion.span
          className={cn('grid h-9 w-9 place-items-center rounded-xl border', style.iconWrap)}
          whileHover={reduce ? undefined : { rotate: [-2, 2, 0] }}
          transition={{ duration: 0.45 }}
        >
          <Icon className="h-4 w-4" />
        </motion.span>
        <span className={cn('rounded-full border px-2.5 py-1 text-[10px] font-medium uppercase tracking-[0.08em]', style.badge)}>
          {item.status}
        </span>
      </div>
      <div className="mt-3 text-sm font-semibold text-frost">{item.caseId}</div>
      <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-mute">{item.summary}</p>
      <div className="mt-3 text-[11px] text-mute/80">{item.when}</div>
    </motion.button>
  );
}
