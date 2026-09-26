import { FileText, ShieldAlert, Scale } from 'lucide-react';
import { quickPrompts, toolCards } from '@/data/chat';
import { ChatComposer } from '@/components/chat/ChatComposer';

const icons = {
  risk: ShieldAlert,
  claim: Scale,
  verdict: FileText,
};

export function ChatEmptyState({ onSend }: { onSend: (text: string) => void }) {
  return (
    <div className="page-enter mx-auto flex w-full max-w-4xl flex-1 flex-col items-center justify-center px-4 py-8">
      <div className="glow-orb h-[118px] w-[118px] rounded-full sm:h-[140px] sm:w-[140px]" />
      <h1 className="mt-8 text-center text-3xl font-medium tracking-tight text-frost sm:text-4xl">
        Ready to Decide Something New?
      </h1>
      <p className="mt-3 max-w-xl text-center text-sm text-mute">
        Ask VERDICT about a decision. It evaluates evidence, contradictions, and uncertainty — it does not invent truth.
      </p>

      <div className="mt-7 flex flex-wrap items-center justify-center gap-2">
        {quickPrompts.map((item) => (
          <button
            key={item.label}
            type="button"
            onClick={() => onSend(item.prompt)}
            className="rounded-full border border-line bg-card/80 px-3.5 py-2 text-xs text-mute transition hover:border-[#3A3348] hover:text-frost"
          >
            {item.label}
          </button>
        ))}
      </div>

      <div className="mt-6 w-full max-w-3xl">
        <ChatComposer onSend={onSend} />
      </div>

      <div className="mt-8 grid w-full gap-3 sm:grid-cols-3">
        {toolCards.map((card) => {
          const Icon = icons[card.id as keyof typeof icons];
          return (
            <button
              key={card.id}
              type="button"
              onClick={() => onSend(card.prompt)}
              className="rounded-2xl border border-line bg-card p-4 text-left transition duration-200 hover:-translate-y-0.5 hover:border-[#3A3348]"
            >
              <div className="flex items-start justify-between gap-3">
                <span className="grid h-9 w-9 place-items-center rounded-xl border border-line bg-white/[0.03] text-violet-200">
                  <Icon className="h-4 w-4" />
                </span>
                <span className="rounded-full border border-line px-2.5 py-1 text-[11px] text-mute">{card.action}</span>
              </div>
              <h2 className="mt-4 text-sm font-semibold text-frost">{card.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-mute">{card.description}</p>
            </button>
          );
        })}
      </div>
    </div>
  );
}
