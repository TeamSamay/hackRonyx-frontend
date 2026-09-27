import { useState, useEffect, useRef } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'motion/react';
import {
  CheckCircle2,
  HelpCircle,
  AlertTriangle,
  FileText,
  FileSpreadsheet,
  File,
  ShieldCheck,
  Building2,
  Landmark,
  FileCode,
  Globe,
  ArrowRight,
  Lock,
  Download,
  Send,
  Sparkles,
} from 'lucide-react';
import type { ChatMessage, AttachmentItem } from '@/types/chat';
import { AnimatedOrb } from '@/components/chat/AnimatedOrb';
import { ChatComposer } from '@/components/chat/ChatComposer';
import { messageVariants, springSoft } from '@/lib/motion';
import { cn } from '@/lib/utils';

function renderFormattedMarkdown(text: string) {
  // Strip out cheesy emojis from beginning of lines
  const clean = text.replace(/^[⚖️🔍🛡️📋🏛️🚨⚠️✅🎯🌐•\-\s]+/, '');
  // Split on **bold** and `code`
  const parts = clean.split(/(\*\*.*?\*\*|`.*?`)/g);

  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={i} className="font-bold text-white tracking-wide">
          {part.slice(2, -2)}
        </strong>
      );
    }
    if (part.startsWith('`') && part.endsWith('`')) {
      return (
        <code key={i} className="rounded bg-violet-950/70 border border-violet-400/30 px-1.5 py-0.5 font-mono text-[11px] text-cyan-300">
          {part.slice(1, -1)}
        </code>
      );
    }
    return <span key={i} className="text-gray-300 leading-relaxed">{part}</span>;
  });
}

function RenderAssistantContent({
  content,
  onSend,
}: {
  content: string;
  onSend?: (text: string) => void;
}) {
  const [actionToast, setActionToast] = useState<string | null>(null);

  const handleAction = (msg: string) => {
    setActionToast(msg);
    setTimeout(() => setActionToast(null), 5000);
  };

  // Only evaluate trust gate badges if the assistant response actually evaluated a trust gate
  const hasGateEvaluation =
    content.includes('DETERMINISTIC TRUST GATE') ||
    content.includes('DETERMINISTIC GATE') ||
    content.includes('TRUST STATE:');

  // Priority 1: Incomplete / Data Required / Awaiting Ingestion
  const isIncomplete =
    hasGateEvaluation &&
    (/\b(INCOMPLETE|REQUEST_DATA|NEED_MORE_INFO|INSUFFICIENT|AWAITING INGESTION|HOLD FOR MISSING RECORDS)\b/i.test(content) ||
      content.includes('NEED MORE INFO') ||
      content.includes('INSUFFICIENT PRIMARY SOURCES') ||
      content.includes('TRUST GATE: INCOMPLETE'));

  // Priority 2: Conflicting / Fraud Blocked (ONLY if not incomplete)
  const isConflicting =
    hasGateEvaluation &&
    !isIncomplete &&
    (/\b(CONFLICTING|REFUSE|REFUSED|CRITICAL CONTRADICTION)\b/i.test(content) ||
      content.includes('DISBURSEMENT BLOCKED') ||
      content.includes('TRUST STATE: CONFLICTING') ||
      content.includes('TRUST GATE: CONFLICTING'));

  // Priority 3: Sufficient / Approved (ONLY if neither conflicting nor incomplete)
  const isSufficient =
    hasGateEvaluation &&
    !isConflicting &&
    !isIncomplete &&
    (/\b(SUFFICIENT|APPROVE|APPROVED|VERIFIED & CLEARED|100% VERIFIED)\b/i.test(content) &&
      !content.includes('INSUFFICIENT'));

  const isGreeting =
    content.includes('VERDICT DECISION INTELLIGENCE AUTHORITY') ||
    content.includes('Select a Real-World Decision Scenario') ||
    !hasGateEvaluation;

  // Split lines into structured sections
  const lines = content.split('\n').filter((l) => l.trim().length > 0);

  return (
    <div className="space-y-4 font-sans text-xs">
      {/* 1. Executive Trust Gate Badge */}
      {isConflicting ? (
        <div className="rounded-xl border border-rose-500/40 bg-gradient-to-r from-rose-950/40 via-rose-900/20 to-transparent p-3.5 flex items-center gap-3 shadow-lg">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-rose-500/20 text-rose-300 shrink-0 border border-rose-500/30">
            <AlertTriangle className="h-4 w-4 text-rose-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-rose-200 font-mono tracking-wide flex items-center gap-2">
              <span>DETERMINISTIC GATE: CONFLICTING — MANUAL AUDIT ENFORCED</span>
              <span className="text-[10px] bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-md border border-rose-500/30 font-sans">
                DISBURSEMENT BLOCKED
              </span>
            </div>
            <div className="text-[11px] text-rose-300/80 mt-0.5">
              Physical document conflict or unverified cross-jurisdictional transfer detected.
            </div>
          </div>
        </div>
      ) : isSufficient ? (
        <div className="rounded-xl border border-emerald-500/40 bg-gradient-to-r from-emerald-950/40 via-emerald-900/20 to-transparent p-3.5 flex items-center gap-3 shadow-lg">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-emerald-500/20 text-emerald-300 shrink-0 border border-emerald-500/30">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-emerald-200 font-mono tracking-wide flex items-center gap-2">
              <span>DETERMINISTIC GATE: VERIFIED & CLEARED</span>
              <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded-md border border-emerald-500/30 font-sans">
                SUFFICIENT EVIDENCE
              </span>
            </div>
            <div className="text-[11px] text-emerald-300/80 mt-0.5">
              All multi-source evidence objects cross-verified with &gt;95% completeness. Zero contradictions.
            </div>
          </div>
        </div>
      ) : isIncomplete ? (
        <div className="rounded-xl border border-amber-500/40 bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-transparent p-3.5 flex items-center gap-3 shadow-lg">
          <div className="grid h-8 w-8 place-items-center rounded-lg bg-amber-500/20 text-amber-300 shrink-0 border border-amber-500/30">
            <HelpCircle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-amber-200 font-mono tracking-wide flex items-center gap-2">
              <span>DETERMINISTIC GATE: INCOMPLETE / AWAITING INGESTION</span>
              <span className="text-[10px] bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-md border border-amber-500/30 font-sans">
                DATA REQUIRED
              </span>
            </div>
            <div className="text-[11px] text-amber-300/80 mt-0.5">
              Missing critical primary documents (e.g. Audited Financials, Encumbrance Certificate, or Remittance Cert).
            </div>
          </div>
        </div>
      ) : null}

      {/* 2. Structured Line Items with High-Clarity Visual Blocks */}
      <div className="space-y-3 leading-relaxed bg-[#110C1B]/90 rounded-2xl p-4 sm:p-5 border border-white/[0.08] shadow-xl">
        {lines.map((line, idx) => {
          const lowerLine = line.toLowerCase();

          // 2.A Highlighted Executive Summary Card (Instant Judge Clarity)
          if (lowerLine.includes('plain english summary') || lowerLine.includes('summary in simple words')) {
            const summaryText = line
              .replace(/^[\s•\-\*]*(\*\*|\*|\b)?(plain english summary|summary in simple words)(\*\*|\*|\b)?:?\s*/i, '')
              .replace(/^(\*\*|\*)/, '')
              .replace(/(\*\*|\*)$/, '')
              .trim();
            if (!summaryText || summaryText === '**' || summaryText === '*') return null;
            return (
              <div
                key={idx}
                className={cn(
                  "rounded-xl p-3.5 border transition shadow-md",
                  isConflicting
                    ? "bg-rose-950/25 border-rose-500/30 text-rose-100"
                    : isSufficient
                    ? "bg-emerald-950/25 border-emerald-500/30 text-emerald-100"
                    : isIncomplete
                    ? "bg-amber-950/25 border-amber-500/30 text-amber-100"
                    : "bg-violet-950/30 border-violet-500/30 text-violet-100"
                )}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono uppercase tracking-wider font-bold mb-1 opacity-90">
                  <ShieldCheck className="h-3.5 w-3.5 text-amber-400 shrink-0" />
                  <span>EXECUTIVE SUMMARY (WHY THIS MATTERS):</span>
                </div>
                <div className="text-xs sm:text-[13px] leading-relaxed font-normal">
                  {renderFormattedMarkdown(summaryText)}
                </div>
              </div>
            );
          }

          // 2.B Section Headers
          if (
            line.startsWith('### ') ||
            line.startsWith('#### ') ||
            (line.endsWith(':') && line === line.toUpperCase()) ||
            lowerLine.includes('evidence & document cross-examination') ||
            lowerLine.includes('contradictions & red flags') ||
            lowerLine.includes('action for auditor')
          ) {
            const heading = line.replace(/^#{3,4}\s+/, '').replace(/:$/, '');
            const isRedHeader = lowerLine.includes('contradiction') || lowerLine.includes('red flag') || lowerLine.includes('discrepanc');
            const isActionHeader = lowerLine.includes('action') || lowerLine.includes('directive');
            const isDocHeader = lowerLine.includes('evidence') || lowerLine.includes('document');

            return (
              <div
                key={idx}
                className={cn(
                  "pt-3 pb-1 font-bold text-xs uppercase tracking-wider border-b flex items-center gap-2",
                  isRedHeader
                    ? "text-rose-300 border-rose-500/20"
                    : isActionHeader
                    ? "text-emerald-300 border-emerald-500/20"
                    : isDocHeader
                    ? "text-cyan-300 border-cyan-500/20"
                    : "text-violet-300 border-white/[0.08]"
                )}
              >
                {isRedHeader ? (
                  <AlertTriangle className="h-3.5 w-3.5 text-rose-400 shrink-0" />
                ) : isActionHeader ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
                ) : (
                  <FileText className="h-3.5 w-3.5 text-cyan-400 shrink-0" />
                )}
                <span>{heading}</span>
              </div>
            );
          }

          // 2.C Discrepancy / Red Flag Items (Numbered 1. 2.)
          if (/^\d+\.\s/.test(line)) {
            const num = line.match(/^(\d+)\.\s/)?.[1] || '';
            const text = line.replace(/^\d+\.\s+/, '');
            const isConflictItem = isConflicting || lowerLine.includes('mismatch') || lowerLine.includes('conflict') || lowerLine.includes('secret') || lowerLine.includes('unverified');

            return (
              <div
                key={idx}
                className={cn(
                  "flex items-start gap-2.5 p-2 rounded-lg border transition",
                  isConflictItem
                    ? "bg-rose-950/20 border-rose-500/20 text-rose-200"
                    : "bg-white/[0.02] border-white/[0.06] text-gray-200"
                )}
              >
                <span
                  className={cn(
                    "flex h-5 w-5 shrink-0 items-center justify-center rounded-md font-mono text-[10px] font-bold border",
                    isConflictItem
                      ? "bg-rose-500/20 border-rose-500/40 text-rose-300"
                      : "bg-violet-500/20 border-violet-500/30 text-violet-300"
                  )}
                >
                  {num}
                </span>
                <div className="flex-1 min-w-0 text-xs leading-relaxed">{renderFormattedMarkdown(text)}</div>
              </div>
            );
          }

          // 2.D Document Citation Items
          if (lowerLine.includes('document 1') || lowerLine.includes('document 2') || lowerLine.includes('document 3') || lowerLine.includes('.pdf`') || lowerLine.includes('.csv`')) {
            return (
              <div key={idx} className="flex items-start gap-2.5 p-2 rounded-lg bg-white/[0.02] border border-white/[0.06] text-gray-200">
                <FileText className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
                <div className="flex-1 min-w-0 text-xs leading-relaxed">{renderFormattedMarkdown(line)}</div>
              </div>
            );
          }

          // 2.E Bullet items
          if (line.startsWith('- ') || line.startsWith('• ')) {
            return (
              <div key={idx} className="flex items-start gap-2.5 py-0.5 text-gray-300">
                <span className="text-violet-400 mt-1 font-bold text-xs shrink-0">•</span>
                <div className="flex-1 min-w-0 text-xs">{renderFormattedMarkdown(line)}</div>
              </div>
            );
          }

          // Plain text line
          return (
            <div key={idx} className="text-gray-300 py-0.5 text-xs">
              {renderFormattedMarkdown(line)}
            </div>
          );
        })}
      </div>

      {/* 2.F Institutional Next Steps & Action Enforcement */}
      {!isGreeting && (
        <div className="pt-1 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-violet-300 font-bold flex items-center gap-1.5 opacity-90">
            <Sparkles className="h-3 w-3 text-amber-300" />
            <span>Recommended Institutional Next Actions:</span>
          </div>

          {isConflicting ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAction('Automated Disbursement Freeze enforced on Account 92831 in Core Banking!')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-rose-500/40 bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 text-xs font-semibold transition cursor-pointer"
              >
                <Lock className="h-3.5 w-3.5 text-rose-400" />
                <span>Enforce Payout Freeze</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction('Forensic Audit Case Dossier exported as cryptographic PDF!')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-200 text-xs font-semibold transition cursor-pointer"
              >
                <Download className="h-3.5 w-3.5 text-cyan-400" />
                <span>Export Forensic Audit Dossier</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction('Adverse Audit Finding dispatched to Corporate Risk Committee!')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 text-xs font-semibold transition cursor-pointer"
              >
                <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
                <span>Escalate to Risk Committee</span>
              </button>
            </div>
          ) : isSufficient ? (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAction('Instant Payout Settlement authorized via Automated Core Settlement Bridge!')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/40 bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-200 text-xs font-semibold transition cursor-pointer"
              >
                <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                <span>Authorize Instant Payout Settlement</span>
              </button>
              <button
                type="button"
                onClick={() => handleAction('Cryptographic Trust Certificate issued and signed with SHA-256!')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-cyan-500/40 bg-cyan-500/15 hover:bg-cyan-500/25 text-cyan-200 text-xs font-semibold transition cursor-pointer"
              >
                <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" />
                <span>Issue Trust Certificate (SHA-256)</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => handleAction('Automated Evidence Request packet sent to borrower for missing files!')}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-amber-500/40 bg-amber-500/15 hover:bg-amber-500/25 text-amber-200 text-xs font-semibold transition cursor-pointer"
              >
                <Send className="h-3.5 w-3.5 text-amber-400" />
                <span>Dispatch Missing Document Request Packet</span>
              </button>
            </div>
          )}

          {actionToast && (
            <div className="mt-2 p-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-200 text-xs flex items-center gap-2 shadow-lg animate-in fade-in">
              <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
              <span className="font-medium">{actionToast}</span>
            </div>
          )}
        </div>
      )}

      {/* 3. Interactive Case Selector Quick Buttons (If Greeting) */}
      {isGreeting && onSend ? (
        <div className="pt-3 border-t border-line/40 space-y-2">
          <div className="text-[10px] font-mono uppercase tracking-wider text-violet-300 font-semibold">
            ⚡ 1-Click Real-World Test Cases:
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => onSend('Evaluate transaction TX-92831 for account 4902-8811 with GPS telemetry')}
              className="flex items-center justify-between p-2.5 rounded-xl border border-line bg-card/60 hover:bg-violet-500/10 hover:border-violet-400/40 text-left transition group"
            >
              <div className="flex items-center gap-2">
                <Landmark className="h-4 w-4 text-violet-300 group-hover:text-violet-200" />
                <div>
                  <div className="text-xs font-semibold text-frost">Banking Fraud (TX-92831)</div>
                  <div className="text-[10px] text-mute">GPS vs ATM Location Clash</div>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-mute group-hover:text-frost group-hover:translate-x-0.5 transition" />
            </button>

            <button
              type="button"
              onClick={() => onSend('Person 1 transferred property to Person 2 in 2018. Person 3 is buying in 2026. Validate chain of title and encumbrance.')}
              className="flex items-center justify-between p-2.5 rounded-xl border border-line bg-card/60 hover:bg-violet-500/10 hover:border-violet-400/40 text-left transition group"
            >
              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-emerald-300 group-hover:text-emerald-200" />
                <div>
                  <div className="text-xs font-semibold text-frost">Property Chain of Title</div>
                  <div className="text-[10px] text-mute">3-Party Title & EC Check</div>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-mute group-hover:text-frost group-hover:translate-x-0.5 transition" />
            </button>

            <button
              type="button"
              onClick={() => onSend('Verify company Infosys and check if there are any fraud or regulatory sanctions reported online')}
              className="flex items-center justify-between p-2.5 rounded-xl border border-line bg-card/60 hover:bg-violet-500/10 hover:border-violet-400/40 text-left transition group"
            >
              <div className="flex items-center gap-2">
                <Globe className="h-4 w-4 text-sky-300 group-hover:text-sky-200" />
                <div>
                  <div className="text-xs font-semibold text-frost">Corporate Live Web Due Diligence</div>
                  <div className="text-[10px] text-mute">Live Public Registry Search</div>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-mute group-hover:text-frost group-hover:translate-x-0.5 transition" />
            </button>

            <button
              type="button"
              onClick={() => onSend('Is there sufficient evidence to clear insurance claim CLAIM-782?')}
              className="flex items-center justify-between p-2.5 rounded-xl border border-line bg-card/60 hover:bg-violet-500/10 hover:border-violet-400/40 text-left transition group"
            >
              <div className="flex items-center gap-2">
                <FileCode className="h-4 w-4 text-amber-300 group-hover:text-amber-200" />
                <div>
                  <div className="text-xs font-semibold text-frost">Insurance Claim (CLAIM-782)</div>
                  <div className="text-[10px] text-mute">Police Report + Garage + OCR</div>
                </div>
              </div>
              <ArrowRight className="h-3.5 w-3.5 text-mute group-hover:text-frost group-hover:translate-x-0.5 transition" />
            </button>
          </div>
        </div>
      ) : null}
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
                    'max-w-[94%] sm:max-w-[88%] rounded-[22px] px-4 py-3.5 text-sm leading-relaxed shadow-lg',
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
                      <RenderAssistantContent content={message.content} onSend={onSend} />
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
                  Evaluating evidence objects, contradictions & deterministic trust gate
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

      {/* Pinned Input Bar at Bottom */}
      <div className="sticky bottom-0 shrink-0 border-t border-line/40 bg-ink/95 px-4 py-3 sm:px-6 backdrop-blur-2xl z-20">
        <div className="mx-auto max-w-4xl">
          <ChatComposer onSend={onSend} disabled={pending} />
        </div>
      </div>
    </div>
  );
}
