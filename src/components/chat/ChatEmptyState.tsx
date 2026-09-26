import { FileText, Scale, ShieldAlert } from 'lucide-react';
import { motion, useReducedMotion } from 'motion/react';
import { quickPrompts, recentAnalyses, toolCards } from '@/data/chat';
import { AnimatedOrb } from '@/components/chat/AnimatedOrb';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { RecentAnalysisCard } from '@/components/chat/RecentAnalysisCard';
import { easeSoft, fadeUp, scaleIn, springSnappy, staggerContainer, staggerFast } from '@/lib/motion';
import { cn } from '@/lib/utils';

const icons = {
  risk: ShieldAlert,
  claim: Scale,
  verdict: FileText,
};

const accentStyles = {
  purple: {
    card: 'bg-[radial-gradient(120%_90%_at_0%_0%,rgba(139,108,255,0.16),transparent_55%),#1E1826]',
    icon: 'border-violet-400/30 bg-violet-500/15 text-violet-200',
    action: 'border-violet-400/30 bg-violet-500/10 text-violet-100',
  },
  blue: {
    card: 'bg-[radial-gradient(120%_90%_at_0%_0%,rgba(59,130,246,0.16),transparent_55%),#1E1826]',
    icon: 'border-blue-400/30 bg-blue-500/15 text-blue-200',
    action: 'border-blue-400/30 bg-blue-500/10 text-blue-100',
  },
  green: {
    card: 'bg-[radial-gradient(120%_90%_at_0%_0%,rgba(52,211,153,0.14),transparent_55%),#1E1826]',
    icon: 'border-emerald-400/30 bg-emerald-400/15 text-emerald-200',
    action: 'border-emerald-400/30 bg-emerald-400/10 text-emerald-100',
  },
} as const;

export function ChatEmptyState({ onSend }: { onSend: (text: string) => void }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="mx-auto flex w-full max-w-5xl flex-col px-4 py-8 sm:px-6 lg:px-8"
      variants={staggerContainer}
      initial={reduce ? false : 'hidden'}
      animate="show"
      inherit={false}
    >
      <div className="flex flex-col items-center text-center">
        <motion.div variants={scaleIn}>
          <AnimatedOrb size="hero" />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mt-8 text-[28px] font-semibold tracking-tight text-frost sm:text-[34px]"
        >
          Ready to Decide Something New?
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-3 max-w-xl text-sm leading-relaxed text-mute">
          Ask VERDICT about a decision. It evaluates evidence, contradictions, and uncertainty — it does not invent truth.
        </motion.p>

        <motion.div variants={staggerFast} className="mt-6 flex flex-wrap items-center justify-center gap-2">
          {quickPrompts.map((item) => (
            <motion.button
              key={item.label}
              type="button"
              variants={fadeUp}
              whileHover={reduce ? undefined : { y: -2, scale: 1.03 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              transition={springSnappy}
              onClick={() => onSend(item.prompt)}
              className="rounded-full border border-line bg-card/70 px-3.5 py-2 text-xs text-mute backdrop-blur hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-frost"
            >
              {item.label}
            </motion.button>
          ))}
        </motion.div>

        <motion.div
          variants={fadeUp}
          className="mt-6 w-full max-w-3xl"
          transition={{ duration: 0.55, ease: easeSoft, delay: 0.05 }}
        >
          <ChatComposer onSend={onSend} />
        </motion.div>
      </div>

      <motion.div variants={staggerFast} className="mt-8 grid w-full gap-3 md:grid-cols-3">
        {toolCards.map((card) => {
          const Icon = icons[card.id as keyof typeof icons];
          const accent = accentStyles[card.accent];
          return (
            <motion.button
              key={card.id}
              type="button"
              variants={fadeUp}
              whileHover={reduce ? undefined : { y: -4, scale: 1.015 }}
              whileTap={reduce ? undefined : { scale: 0.985 }}
              transition={springSnappy}
              onClick={() => onSend(card.prompt)}
              className={cn(
                'rounded-[22px] border border-line p-4 text-left hover:border-[#3A3348]',
                accent.card,
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <span className={cn('grid h-10 w-10 place-items-center rounded-2xl border', accent.icon)}>
                  <Icon className="h-4 w-4" />
                </span>
                <span className={cn('rounded-full border px-2.5 py-1 text-[11px]', accent.action)}>{card.action}</span>
              </div>
              <h2 className="mt-4 text-[15px] font-semibold text-frost">{card.title}</h2>
              <p className="mt-1.5 text-xs leading-relaxed text-mute">{card.description}</p>
            </motion.button>
          );
        })}
      </motion.div>

      <motion.section variants={fadeUp} className="mt-8">
        <div className="mb-3 flex items-center justify-between gap-3">
          <h2 className="text-sm font-medium text-frost">Recent analyses</h2>
          <motion.button
            type="button"
            whileHover={reduce ? undefined : { x: 2 }}
            onClick={() => onSend('Show me a summary of recent analyses.')}
            className="text-xs text-violet-200 transition hover:text-frost"
          >
            View all
          </motion.button>
        </div>
        <motion.div variants={staggerFast} initial={reduce ? false : 'hidden'} animate="show" className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {recentAnalyses.map((item) => (
            <RecentAnalysisCard key={item.id} item={item} onOpen={onSend} />
          ))}
        </motion.div>
      </motion.section>
    </motion.div>
  );
}
