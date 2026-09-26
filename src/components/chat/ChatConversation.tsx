import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import type { ChatMessage } from '@/types/chat';
import { AnimatedOrb } from '@/components/chat/AnimatedOrb';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { messageVariants, springSoft } from '@/lib/motion';
import { cn } from '@/lib/utils';

export function ChatConversation({
  messages,
  pending,
  onSend,
}: {
  messages: ChatMessage[];
  pending: boolean;
  onSend: (text: string) => void;
}) {
  const reduce = useReducedMotion();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth', block: 'end' });
  }, [messages.length, pending, reduce]);

  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-4 py-4 sm:px-6">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-4">
        <AnimatePresence initial={false} mode="popLayout">
          {messages.map((message) => (
            <motion.div
              key={message.id}
              layout
              custom={message.role}
              variants={messageVariants}
              initial={reduce ? false : 'hidden'}
              animate="show"
              exit="exit"
              inherit={false}
              className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
            >
              <motion.div
                layout
                className={cn(
                  'max-w-[88%] rounded-[22px] px-4 py-3 text-sm leading-relaxed',
                  message.role === 'user'
                    ? 'accent-gradient text-white shadow-[0_10px_30px_rgba(91,108,255,0.25)]'
                    : 'border border-line bg-card text-frost',
                )}
                whileHover={reduce ? undefined : { y: -1 }}
                transition={springSoft}
              >
                {message.role === 'assistant' ? (
                  <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-mute">
                    <AnimatedOrb size="xs" />
                    VERDICT
                  </div>
                ) : null}
                {message.content}
              </motion.div>
            </motion.div>
          ))}
        </AnimatePresence>

        <AnimatePresence>
          {pending ? (
            <motion.div
              key="pending"
              initial={reduce ? false : { opacity: 0, y: 10, scale: 0.96 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -6, scale: 0.98 }}
              transition={springSoft}
              className="inline-flex items-center gap-2 rounded-[22px] border border-line bg-card px-4 py-3 text-sm text-mute"
            >
              <AnimatedOrb size="xs" />
              <span className="thinking-dots">
                Thinking
                <span>.</span>
                <span>.</span>
                <span>.</span>
              </span>
            </motion.div>
          ) : null}
        </AnimatePresence>
        <div ref={bottomRef} />
      </div>
      <motion.div
        className="pb-2 pt-1"
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ ...springSoft, delay: 0.05 }}
      >
        <ChatComposer onSend={onSend} disabled={pending} />
      </motion.div>
    </div>
  );
}
