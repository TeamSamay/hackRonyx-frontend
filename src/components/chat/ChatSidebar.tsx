import {
  Archive,
  Library,
  MessageSquare,
  Plus,
  ShieldAlert,
  Plug,
  Gavel,
  ShieldCheck,
  X,
  Lock,
  Swords,
  UserCheck,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { AnimatedOrb } from '@/components/chat/AnimatedOrb';
import { springSnappy, springSoft } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { ChatThread } from '@/types/chat';
import type { ConsoleSection } from '@/types/verdict';

const features = [
  { id: 'chat', label: 'Decision Chat', icon: MessageSquare },
  { id: 'archived', label: 'Archived Cases', icon: Archive },
  { id: 'library', label: 'Evidence Library', icon: Library },
] as const;

const workspaces: Array<{ id: ConsoleSection; label: string; icon: any }> = [
  { id: 'cases', label: 'Active Fraud Cases', icon: ShieldAlert },
  { id: 'connectors', label: 'Edge Gateway & Server Links', icon: Plug },
  { id: 'decisions', label: 'Decision Gate (6 States)', icon: Gavel },
  { id: 'challenge', label: 'Challenge Stress-Test', icon: Swords },
  { id: 'reviews', label: 'Analyst Review & Audit', icon: UserCheck },
  { id: 'demo', label: '1-Click Pitch Demo (TX-92831)', icon: ShieldCheck },
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
      ? threads.filter((thread) => thread.archived)
      : view === 'library'
        ? threads.filter((thread) => thread.messages.length > 0)
        : threads.filter((thread) => !thread.archived && (thread.messages.length > 0 || thread.id === activeId));

  return (
    <aside
      className={cn(
        'absolute inset-y-0 left-0 z-40 flex w-[264px] shrink-0 -translate-x-full flex-col border-r border-line bg-sidebar transition-transform duration-200 lg:static lg:translate-x-0',
        open && 'translate-x-0',
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-5 border-b border-line/40">
        <div className="flex items-center gap-3">
          <AnimatedOrb size="sm" />
          <div>
            <div className="text-sm font-semibold tracking-wide text-frost">VERDICT AI</div>
            <div className="text-[10px] uppercase tracking-widest text-violet-300 font-mono">Fraud Intelligence</div>
          </div>
        </div>
        <button type="button" onClick={onClose} className="text-mute hover:text-frost lg:hidden">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="px-3 pt-3">
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
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#221C2C] px-3 py-2.5 text-xs font-semibold text-frost hover:border-violet-400/30 hover:bg-[#2A2234]"
        >
          <Plus className="h-4 w-4" />
          New Fraud Evaluation
        </motion.button>
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-3 pb-4 space-y-5">
        <div>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-mute">Primary Interface</p>
          <div className="mt-2 space-y-1">
            {features.map((item) => (
              <motion.button
                key={item.id}
                type="button"
                whileHover={{ x: 2 }}
                whileTap={{ scale: 0.98 }}
                transition={springSnappy}
                onClick={() => {
                  onViewChange(item.id);
                  if (onSelectSection) onSelectSection('overview');
                  onClose();
                }}
                className={cn(
                  'relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-medium',
                  view === item.id ? 'text-frost font-semibold' : 'text-mute hover:text-frost',
                )}
              >
                {view === item.id ? (
                  <motion.span
                    layoutId="sidebar-feature-active"
                    className="absolute inset-0 rounded-xl bg-violet-500/15 border border-violet-400/30"
                    transition={springSoft}
                  />
                ) : null}
                <item.icon className="relative z-[1] h-4 w-4 text-violet-300" />
                <span className="relative z-[1] truncate">{item.label}</span>
              </motion.button>
            ))}
          </div>
        </div>

        <div>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-mute">Fraud Workspaces</p>
          <div className="mt-2 space-y-1">
            {workspaces.map((item) => {
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
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-medium text-mute hover:bg-white/[0.04] hover:text-frost transition"
                >
                  <Icon className="h-4 w-4 text-violet-300" />
                  <span className="truncate">{item.label}</span>
                </motion.button>
              );
            })}
          </div>
        </div>

        <div>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-mute">
            {view === 'archived' ? 'Archived' : view === 'library' ? 'Library' : 'Recent Cases'}
          </p>
          <div className="mt-2 space-y-1">
            {visible.length === 0 ? (
              <p className="px-3 py-2 text-xs text-mute">No chats here yet.</p>
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
                      'relative w-full rounded-xl px-3 py-2 text-left text-xs',
                      activeId === thread.id ? 'text-frost bg-white/[0.06]' : 'text-mute hover:text-frost',
                    )}
                  >
                    <span className="relative z-[1] line-clamp-1">{thread.title}</span>
                  </motion.button>
                ))}
              </AnimatePresence>
            )}
          </div>
        </div>
      </div>

      <div className="p-3 border-t border-line/40">
        <div className="rounded-2xl border border-line/60 bg-card/80 p-3 space-y-1.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-frost">
            <Lock className="h-3.5 w-3.5 text-violet-300" />
            Deterministic Gate Active
          </div>
          <p className="text-[10px] leading-relaxed text-mute font-sans">
            6 strict trust states enforced. LLM reasoning cannot bypass Python rules.
          </p>
        </div>
      </div>
    </aside>
  );
}
