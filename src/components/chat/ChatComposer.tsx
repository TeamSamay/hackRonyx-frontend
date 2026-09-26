import { ArrowUp, Mic, Paperclip, Settings2, SlidersHorizontal, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { springSnappy } from '@/lib/motion';
import { cn } from '@/lib/utils';

export function ChatComposer({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const reduce = useReducedMotion();
  const canSend = Boolean(value.trim()) && !disabled;

  function submit() {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
  }

  return (
    <motion.div
      animate={
        reduce
          ? undefined
          : {
              boxShadow: focused
                ? '0 0 0 1px rgba(167,139,250,0.45), 0 0 42px rgba(124,92,252,0.32), 0 18px 40px rgba(20,10,40,0.35)'
                : '0 0 0 1px rgba(139,108,255,0.28), 0 0 28px rgba(124,92,252,0.18), 0 18px 40px rgba(20,10,40,0.28)',
              scale: focused ? 1.01 : 1,
            }
      }
      transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
      className="rounded-[28px] border border-white/5 bg-[#1A1522]/95 p-4 backdrop-blur-md"
    >
      <div className="flex items-start gap-2.5">
        <motion.span
          animate={reduce ? undefined : { rotate: focused ? [0, -12, 8, 0] : 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        >
          <Sparkles className="mt-1 h-4 w-4 shrink-0 text-violet-200" />
        </motion.span>
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onKeyDown={(event) => {
            if (event.key === 'Enter' && !event.shiftKey) {
              event.preventDefault();
              submit();
            }
          }}
          rows={2}
          placeholder="Ask Anything..."
          className="min-h-[52px] w-full resize-none bg-transparent text-[15px] leading-relaxed text-frost outline-none placeholder:text-mute"
          aria-label="Message VERDICT AI"
        />
      </div>
      <div className="mt-3 flex items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-0.5 text-xs text-mute">
          {[
            { icon: Paperclip, label: 'Attach' },
            { icon: Settings2, label: 'Settings' },
            { icon: SlidersHorizontal, label: 'Options' },
          ].map((item) => (
            <motion.button
              key={item.label}
              type="button"
              whileHover={reduce ? undefined : { y: -1, color: '#F5F3F7' }}
              whileTap={reduce ? undefined : { scale: 0.96 }}
              className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 hover:bg-white/5"
            >
              <item.icon className="h-3.5 w-3.5" />
              {item.label}
            </motion.button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <motion.button
            type="button"
            whileHover={reduce ? undefined : { scale: 1.05 }}
            whileTap={reduce ? undefined : { scale: 0.94 }}
            className="grid h-10 w-10 place-items-center rounded-full border border-line text-mute hover:border-[#3A3348] hover:text-frost"
            aria-label="Voice input"
          >
            <Mic className="h-4 w-4" />
          </motion.button>
          <motion.button
            type="button"
            onClick={submit}
            disabled={!canSend}
            whileHover={canSend && !reduce ? { scale: 1.08 } : undefined}
            whileTap={canSend && !reduce ? { scale: 0.92 } : undefined}
            animate={
              canSend && !reduce
                ? { boxShadow: ['0 8px 24px rgba(91,108,255,0.28)', '0 8px 32px rgba(91,108,255,0.48)', '0 8px 24px rgba(91,108,255,0.28)'] }
                : { boxShadow: '0 0 0 rgba(0,0,0,0)' }
            }
            transition={canSend ? { duration: 2.2, repeat: Infinity, ease: 'easeInOut' } : springSnappy}
            className={cn(
              'grid h-10 w-10 place-items-center rounded-full text-white',
              canSend ? 'accent-gradient' : 'bg-[#2A2432] text-mute',
            )}
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4" />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
}
