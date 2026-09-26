import {
  MessageSquare,
  Plus,
  Plug,
  Gavel,
  X,
  Lock,
  Briefcase,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AnimatedOrb } from '@/components/chat/AnimatedOrb';
import { springSnappy } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { ChatThread } from '@/types/chat';
import type { ConsoleSection } from '@/types/verdict';

const navItems: Array<{ id: ConsoleSection; label: string; icon: any }> = [
  { id: 'overview', label: 'Decision Chat', icon: MessageSquare },
  { id: 'connectors', label: 'Evidence Vault', icon: Plug },
  { id: 'decisions', label: 'Trust Gate', icon: Gavel },
  { id: 'cases', label: 'Cases & Audit', icon: Briefcase },
];

export function ChatSidebar({
  open,
  onClose,
  threads,
  activeId,
  view,
  onViewChange,
  onSelectThread,
  onNewChat,
  onSelectSection,
}: {
  open: boolean;
  onClose: () => void;
  threads: ChatThread[];
  activeId: string;
  view: 'chat' | 'archived' | 'library';
  onViewChange: (view: 'chat' | 'archived' | 'library') => void;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
  onSelectSection?: (section: ConsoleSection) => void;
}) {
  const visible =
    view === 'archived'
      ? threads.filter((t) => t.archived)
      : threads.filter((t) => t.messages.length > 0 || t.id === activeId);

  return (
    <aside
      className={cn(
        'absolute inset-y-0 left-0 z-40 flex w-[264px] shrink-0 -translate-x-full flex-col border-r border-line bg-sidebar transition-transform duration-200 lg:static lg:translate-x-0',
        open && 'translate-x-0',
      )}
    >
      {/* Brand Title Header */}
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-5 border-b border-line/40">
        <div className="flex items-center gap-3">
          <AnimatedOrb size="sm" />
          <div>
            <div className="text-sm font-semibold tracking-wide text-frost">VERDICT AI</div>
            <div className="text-[10px] uppercase tracking-widest text-violet-300 font-mono">Decision Intelligence</div>
          </div>
        </div>
        <button type="button" onClick={onClose} className="text-mute hover:text-frost lg:hidden">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Primary Action Button (Fixed double plus bug) */}
      <div className="px-3 pt-4">
        <motion.button
          type="button"
          whileHover={{ scale: 1.02, y: -1 }}
          whileTap={{ scale: 0.98 }}
          transition={springSnappy}
          onClick={() => {
            onNewChat();
            if (onSelectSection) onSelectSection('overview');
            onClose();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#221C2C] px-3 py-2.5 text-xs font-semibold text-frost hover:border-violet-400/30 hover:bg-[#2A2234] shadow-md transition"
        >
          <Plus className="h-4 w-4 text-violet-300" />
          New Evaluation
        </motion.button>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        {/* Navigation Section */}
        <div>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-mute">Core Workspaces</p>
          <div className="mt-2 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <motion.button
                  key={item.id}
                  type="button"
                  whileHover={{ x: 2 }}
                  whileTap={{ scale: 0.98 }}
                  transition={springSnappy}
                  onClick={() => {
                    if (onSelectSection) onSelectSection(item.id);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-medium text-mute hover:bg-white/[0.04] hover:text-frost transition group"
                >
                  <div className="grid h-7 w-7 place-items-center rounded-lg border border-violet-500/20 bg-violet-500/10 text-violet-300 shrink-0 group-hover:border-violet-400/40 group-hover:text-frost transition">
                    <Icon className="h-3.5 w-3.5" />
                  </div>
                  <span className="truncate text-xs font-semibold text-frost">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Saved Decision Threads & Audited Cases */}
        <div>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-mute">Recent Evaluations</p>
          <div className="mt-2 space-y-1">
            {visible.length === 0 ? (
              <p className="px-3 py-2 text-xs text-mute font-mono">No active evaluations.</p>
            ) : (
              <AnimatePresence initial={false}>
                {visible.map((thread) => (
                  <motion.button
                    key={thread.id}
                    type="button"
                    layout
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -8 }}
                    whileHover={{ x: 2 }}
                    transition={springSnappy}
                    onClick={() => {
                      onSelectThread(thread.id);
                      onViewChange('chat');
                      if (onSelectSection) onSelectSection('overview');
                      onClose();
                    }}
                    className={cn(
                      'relative w-full rounded-xl px-3 py-2 text-left text-xs transition',
                      activeId === thread.id ? 'text-frost bg-violet-500/15 border border-violet-400/30' : 'text-mute hover:text-frost hover:bg-white/[0.03]',
                    )}
                  >
                    <div className="truncate font-medium">{thread.title}</div>
                  </motion.button>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      {/* Footer status card */}
      <div className="p-3 border-t border-line/40">
        <div className="rounded-2xl border border-line/60 bg-card/80 p-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-frost">
            <Lock className="h-3.5 w-3.5 text-emerald-400" />
            Evidence Trust Gate: Active
          </div>
          <p className="text-[10px] leading-relaxed text-mute font-sans">
            6 strict trust states enforced. LLM output validated against verified evidence.
          </p>
        </div>
      </div>
    </aside>
  );
}
