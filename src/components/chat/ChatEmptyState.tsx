import { motion, useReducedMotion } from 'motion/react';
import { quickPrompts } from '@/data/chat';
import { AnimatedOrb } from '@/components/chat/AnimatedOrb';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { easeSoft, fadeUp, scaleIn, springSnappy, staggerContainer, staggerFast } from '@/lib/motion';
import type { AttachmentItem } from '@/types/chat';

export function ChatEmptyState({ onSend }: { onSend: (text: string, attachments?: AttachmentItem[]) => void }) {
  const reduce = useReducedMotion();

  return (
    <motion.div
      className="mx-auto flex h-full w-full max-w-4xl flex-col items-center justify-center px-4 py-6 sm:px-6 lg:px-8 overflow-y-auto"
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
          className="mt-6 text-[28px] font-semibold tracking-tight text-frost sm:text-[34px]"
        >
          Ready to Decide Something New?
        </motion.h1>
        <motion.p variants={fadeUp} className="mt-2 max-w-xl text-sm leading-relaxed text-mute">
          Ask VERDICT about a decision or attach PDFs/Images for automated OCR contradiction verification.
        </motion.p>

        <motion.div variants={staggerFast} className="mt-5 flex flex-wrap items-center justify-center gap-2">
          {quickPrompts.map((item) => (
            <motion.button
              key={item.label}
              type="button"
              variants={fadeUp}
              whileHover={reduce ? undefined : { y: -2, scale: 1.03 }}
              whileTap={reduce ? undefined : { scale: 0.97 }}
              transition={springSnappy}
              onClick={() => onSend(item.prompt)}
              className="rounded-full border border-line bg-card/70 px-3.5 py-1.5 text-xs text-mute backdrop-blur hover:border-violet-400/30 hover:bg-violet-500/10 hover:text-frost"
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
    </motion.div>
  );
}

