import { useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import { CheckCircle2, HelpCircle, AlertTriangle, FileText, FileSpreadsheet, Lock, File } from 'lucide-react';
import type { ChatMessage, AttachmentItem } from '@/types/chat';
import { AnimatedOrb } from '@/components/chat/AnimatedOrb';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { messageVariants, springSoft } from '@/lib/motion';
import { cn } from '@/lib/utils';

function RenderAssistantContent({ content }: { content: string }) {
  const isConflicting = content.includes('CONFLICTING');
  const isSufficient = content.includes('SUFFICIENT');
  const isIncomplete = content.includes('INCOMPLETE') || content.includes('REQUEST_DATA');

  // Split lines into structured sections
  const lines = content.split('\n').filter((l) => l.trim().length > 0);

  return (
    <div className="space-y-3 font-sans">
      {/* 1. Executive Trust Gate Badge */}
      {isConflicting ? (
        <div className="rounded-xl border border-rose-500/40 bg-rose-500/10 p-3 flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-rose-500/20 text-rose-300 shrink-0">
            <AlertTriangle className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-rose-200 font-mono">DETERMINISTIC GATE: CONFLICTING EVIDENCE</div>
            <div className="text-[11px] text-rose-300/80">Location/Telemetry disagreement detected across evidence sources. Auto-approval locked.</div>
          </div>
        </div>
      ) : isSufficient ? (
        <div className="rounded-xl border border-emerald-500/40 bg-emerald-500/10 p-3 flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0">
            <CheckCircle2 className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-emerald-200 font-mono">DETERMINISTIC GATE: SUFFICIENT & VERIFIED</div>
            <div className="text-[11px] text-emerald-300/80">All evidence objects agree. Completeness index &gt;95%. Proceed to decision.</div>
          </div>
        </div>
      ) : isIncomplete ? (
        <div className="rounded-xl border border-amber-500/40 bg-amber-500/10 p-3 flex items-center gap-3">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/20 text-amber-300 shrink-0">
            <HelpCircle className="h-4 w-4" />
          </div>
          <div>
            <div className="text-xs font-bold text-amber-200 font-mono">DETERMINISTIC GATE: INCOMPLETE INFORMATION</div>
            <div className="text-[11px] text-amber-300/80">Required evidence objects missing (Audited Financials / Device attestation).</div>
          </div>
        </div>
      ) : null}

      {/* 2. Structured Line Items */}
      <div className="space-y-1.5 text-xs text-frost leading-relaxed">
        {lines.map((line, idx) => {
          if (line.startsWith('⚖️') || line.startsWith('✅') || line.startsWith('⚠️') || line.startsWith('🎯') || line.startsWith('🚨') || line.startsWith('🔍')) {
            return (
              <div key={idx} className="font-bold text-sm text-violet-200 py-1">
                {line}
              </div>
            );
          }
          if (line.startsWith('- ') || line.startsWith('• ')) {
            const text = line.substring(2);
            return (
              <div key={idx} className="flex items-start gap-2 py-0.5">
                <span className="text-violet-400 mt-1">•</span>
                <span>{text}</span>
              </div>
            );
          }
          return <div key={idx}>{line}</div>;
        })}
      </div>

      {/* 3. Attached Source Evidence Attachments Card */}
      <div className="pt-2 border-t border-line/40 space-y-2">
        <div className="text-[10px] font-mono uppercase tracking-wider text-mute flex items-center justify-between">
          <span>Targeted Evidence Attachments</span>
          <span className="text-emerald-400 font-mono flex items-center gap-1">
            <Lock className="h-2.5 w-2.5" /> SHA-256 VERIFIED
          </span>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="rounded-lg border border-line/60 bg-black/40 p-2 flex items-center gap-2 text-[11px]">
            <FileText className="h-3.5 w-3.5 text-violet-300 shrink-0" />
            <div className="min-w-0 flex-1 truncate font-mono text-frost">kyc_registration_doc.pdf</div>
            <span className="text-[9px] text-emerald-400 font-mono">OCR 96%</span>
          </div>
          <div className="rounded-lg border border-line/60 bg-black/40 p-2 flex items-center gap-2 text-[11px]">
            <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <div className="min-w-0 flex-1 truncate font-mono text-frost">transactions.xlsx</div>
            <span className="text-[9px] text-violet-300 font-mono">Row #42</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function RenderUserAttachments({ attachments }: { attachments: AttachmentItem[] }) {
  if (!attachments || attachments.length === 0) return null;

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {attachments.map((att) => (
        <div
          key={att.id}
          className="flex items-center gap-2 rounded-xl border border-white/20 bg-black/30 p-2 text-xs text-white backdrop-blur-sm max-w-[240px]"
        >
          {att.previewUrl ? (
            <img src={att.previewUrl} alt={att.name} className="h-9 w-9 rounded-md object-cover border border-white/20" />
          ) : att.type === 'pdf' ? (
            <FileText className="h-5 w-5 text-rose-300 shrink-0" />
          ) : att.type === 'spreadsheet' ? (
            <FileSpreadsheet className="h-5 w-5 text-emerald-300 shrink-0" />
          ) : (
            <File className="h-5 w-5 text-amber-300 shrink-0" />
          )}
          <div className="min-w-0 flex-1">
            <div className="truncate text-xs font-semibold">{att.name}</div>
            <div className="text-[10px] text-violet-200/80 font-mono flex items-center gap-1">
              <span>OCR Verified</span>
              {att.ocrConfidence && <span>• {Math.round(att.ocrConfidence * 100)}%</span>}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export function ChatConversation({
  messages,
  pending,
  onSend,
}: {
  messages: ChatMessage[];
  pending: boolean;
  onSend: (text: string, attachments?: AttachmentItem[]) => void;
}) {
  const reduce = useReducedMotion();
  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
  }, [messages.length, pending, reduce]);

  return (
    <div className="relative flex h-full w-full flex-col overflow-hidden">
      {/* Scrollable Message History Window */}
      <div ref={scrollContainerRef} className="flex-1 min-h-0 overflow-y-auto px-4 py-4 sm:px-6 space-y-4">
        <div className="mx-auto max-w-4xl space-y-4">
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
                    'max-w-[92%] sm:max-w-[85%] rounded-[22px] px-4 py-3.5 text-sm leading-relaxed shadow-lg',
                    message.role === 'user'
                      ? 'accent-gradient text-white shadow-[0_10px_30px_rgba(91,108,255,0.25)] font-medium'
                      : 'border border-line/80 bg-card/90 text-frost backdrop-blur-md',
                  )}
                  whileHover={reduce ? undefined : { y: -1 }}
                  transition={springSoft}
                >
                  {message.role === 'assistant' ? (
                    <div>
                      <div className="mb-2.5 flex items-center justify-between text-[11px] uppercase tracking-[0.14em] text-mute border-b border-line/40 pb-2">
                        <div className="flex items-center gap-2">
                          <AnimatedOrb size="xs" />
                          <span className="font-bold text-violet-200 tracking-wider">VERDICT DECISION INTELLIGENCE</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/30 px-2 py-0.5 rounded-full">
                          GATE EVALUATED
                        </span>
                      </div>
                      <RenderAssistantContent content={message.content} />
                    </div>
                  ) : (
                    <div>
                      {message.attachments && <RenderUserAttachments attachments={message.attachments} />}
                      <div>{message.content}</div>
                    </div>
                  )}
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
                  Evaluating evidence objects & deterministic gate
                  <span>.</span>
                  <span>.</span>
                  <span>.</span>
                </span>
              </motion.div>
            ) : null}
          </AnimatePresence>

          <div ref={bottomRef} className="h-2" />
        </div>
      </div>

      {/* Pinned Input Bar at Bottom (ChatGPT style) */}
      <div className="sticky bottom-0 shrink-0 border-t border-line/40 bg-ink/95 px-4 py-3 sm:px-6 backdrop-blur-2xl z-20">
        <div className="mx-auto max-w-4xl">
          <ChatComposer onSend={onSend} disabled={pending} />
        </div>
      </div>
    </div>
  );
}
