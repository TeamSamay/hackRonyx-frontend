import type { ChatMessage } from '@/types/chat';
import { ChatComposer } from '@/components/chat/ChatComposer';
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
  return (
    <div className="mx-auto flex h-full w-full max-w-3xl flex-col px-4 py-4 sm:px-6">
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pb-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={cn('flex', message.role === 'user' ? 'justify-end' : 'justify-start')}
          >
            <div
              className={cn(
                'max-w-[88%] rounded-[22px] px-4 py-3 text-sm leading-relaxed',
                message.role === 'user'
                  ? 'accent-gradient text-white shadow-[0_10px_30px_rgba(91,108,255,0.25)]'
                  : 'border border-line bg-card text-frost',
              )}
            >
              {message.role === 'assistant' ? (
                <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-[0.14em] text-mute">
                  <span className="glow-orb h-2.5 w-2.5 rounded-full" />
                  VERDICT
                </div>
              ) : null}
              {message.content}
            </div>
          </div>
        ))}
        {pending ? (
          <div className="inline-flex items-center gap-2 rounded-[22px] border border-line bg-card px-4 py-3 text-sm text-mute">
            <span className="glow-orb h-2.5 w-2.5 rounded-full" />
            Thinking…
          </div>
        ) : null}
      </div>
      <div className="pb-2 pt-1">
        <ChatComposer onSend={onSend} disabled={pending} />
      </div>
    </div>
  );
}
