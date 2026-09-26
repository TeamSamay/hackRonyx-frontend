import { ArrowUp, Image as ImageIcon, Mic, Paperclip, Settings2, Sparkles } from 'lucide-react';
import { useState } from 'react';
import { cn } from '@/lib/utils';

export function ChatComposer({
  onSend,
  disabled,
}: {
  onSend: (text: string) => void;
  disabled?: boolean;
}) {
  const [value, setValue] = useState('');

  function submit() {
    const text = value.trim();
    if (!text || disabled) return;
    onSend(text);
    setValue('');
  }

  return (
    <div className="input-glow rounded-[28px] border border-line bg-[#1A1522] p-4">
      <div className="flex items-start gap-2">
        <Sparkles className="mt-1 h-4 w-4 shrink-0 text-violet-200" />
        <textarea
          value={value}
          onChange={(event) => setValue(event.target.value)}
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
        <div className="flex flex-wrap items-center gap-1 text-xs text-mute">
          <button type="button" className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 hover:bg-white/5 hover:text-frost">
            <Paperclip className="h-3.5 w-3.5" />
            Attach
          </button>
          <button type="button" className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 hover:bg-white/5 hover:text-frost">
            <Settings2 className="h-3.5 w-3.5" />
            Settings
          </button>
          <button type="button" className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1.5 hover:bg-white/5 hover:text-frost">
            <ImageIcon className="h-3.5 w-3.5" />
            Options
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="grid h-10 w-10 place-items-center rounded-full border border-line text-mute hover:text-frost"
            aria-label="Voice input"
          >
            <Mic className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={!value.trim() || disabled}
            className={cn(
              'grid h-10 w-10 place-items-center rounded-full text-white transition',
              value.trim() && !disabled ? 'accent-gradient shadow-[0_8px_24px_rgba(91,108,255,0.35)]' : 'bg-[#2A2432] text-mute',
            )}
            aria-label="Send message"
          >
            <ArrowUp className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
