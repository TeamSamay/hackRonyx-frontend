import { motion, useReducedMotion } from 'motion/react';
import { AnimatedOrb } from '@/components/chat/AnimatedOrb';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { easeSoft, fadeUp, scaleIn, springSnappy, staggerContainer } from '@/lib/motion';
import type { AttachmentItem } from '@/types/chat';

const suggestedQueries = [
  {
    label: 'Audit transaction TX-92831',
    prompt: 'Evaluate transaction TX-92831 for account 4902-8811 with GPS telemetry',
  },
  {
    label: 'Property chain of title check',
    prompt: 'Person 1 transferred property to Person 2 in 2018. Person 3 is buying in 2026. Validate chain of title and encumbrance.',
  },
  {
    label: 'Corporate due diligence search',
    prompt: 'Verify company Infosys and check if there are any fraud or regulatory sanctions reported online',
  },
  {
    label: 'Insurance claim assessment',
    prompt: 'Is there sufficient evidence to clear insurance claim CLAIM-782?',
  },
];

export function ChatEmptyState({ onSend }: { onSend: (text: string, attachments?: AttachmentItem[]) => void }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="mx-auto flex h-full w-full max-w-3xl flex-col items-center justify-center px-4 py-8 sm:px-6 overflow-y-auto"
      variants={staggerContainer}
      initial={reduce ? false : 'hidden'}
      animate="show"
      inherit={false}
    >
      <div className="flex w-full flex-col items-center text-center">
        <motion.div variants={scaleIn}>
          <AnimatedOrb size="hero" />
        </motion.div>

        <motion.h1
          variants={fadeUp}
          className="mt-6 text-2xl font-semibold tracking-tight text-frost sm:text-3xl"
        >
          What would you like to investigate?
        </motion.h1>

        <motion.p variants={fadeUp} className="mt-2 text-xs sm:text-sm text-mute max-w-md">
          Ask questions, upload evidence documents, or cross-examine case contradictions.
        </motion.p>

        {/* Input Composer */}
        <motion.div
          variants={fadeUp}
          className="mt-8 w-full"
          transition={{ duration: 0.55, ease: easeSoft, delay: 0.05 }}
        >
          <ChatComposer onSend={onSend} />
        </motion.div>

        {/* Clean, subtle pill suggestions */}
        <motion.div
          variants={fadeUp}
          className="mt-6 flex flex-wrap items-center justify-center gap-2 max-w-2xl"
        >
          {suggestedQueries.map((item) => (
            <motion.button
              key={item.label}
              type="button"
              whileHover={reduce ? undefined : { scale: 1.02 }}
              whileTap={reduce ? undefined : { scale: 0.98 }}
              transition={springSnappy}
              onClick={() => onSend(item.prompt)}
              className="rounded-full border border-line bg-card/60 px-3.5 py-1.5 text-xs text-mute transition hover:border-[#3A3348] hover:bg-card hover:text-frost"
            >
              {item.label}
            </motion.button>
          ))}
        </motion.div>
      </div>
    </motion.div>
  );
}

