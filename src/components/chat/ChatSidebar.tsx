import {
  MessageSquare,
  Plus,
  UploadCloud,
  Plug,
  Gavel,
  X,
  Lock,
  Briefcase,
  LogOut,
  Swords,
  UserCheck,
  Bot,
  Files,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';
import { Link } from 'react-router-dom';
import { AnimatedOrb } from '@/components/chat/AnimatedOrb';
import { springSnappy } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { ChatThread } from '@/types/chat';
import type { ConsoleSection } from '@/types/verdict';
import { useAuth } from '@/context/AuthContext';

export type SidebarView = 'chat' | 'decision-console' | 'archived' | 'library' | 'cases';

const primaryNav: Array<{ id: ConsoleSection; label: string; icon: any }> = [
  { id: 'overview', label: 'Decision Chat', icon: MessageSquare },
  { id: 'evidence', label: 'Company Doc Vault & Web', icon: Files },
  { id: 'cases', label: 'Cases & Audit Vault', icon: Briefcase },
  { id: 'connectors', label: 'Evidence Ingestion', icon: Plug },
  { id: 'decisions', label: 'Deterministic Gate', icon: Gavel },
];

const advancedNav: Array<{ id: ConsoleSection; label: string; icon: any }> = [
  { id: 'challenge', label: 'Adversarial Engine', icon: Swords },
  { id: 'reviews', label: 'Human Sign-Off', icon: UserCheck },
  { id: 'copilot', label: 'Verdict Copilot', icon: Bot },
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
  backendOnline,
  onSeedDemo: _onSeedDemo,
  seedingDemo: _seedingDemo,
  onOpenUpload,
  onSelectSection,
}: {
  open: boolean;
  onClose: () => void;
  threads: ChatThread[];
  activeId: string;
  view?: string;
  onViewChange?: (view: any) => void;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
  backendOnline?: boolean;
  onSeedDemo?: () => void;
  seedingDemo?: boolean;
  onOpenUpload?: () => void;
  onSelectSection?: (section: ConsoleSection) => void;
}) {
  const { user, logout } = useAuth();

  const visible =
    view === 'archived'
      ? threads.filter((t) => t.archived)
      : threads.filter((t) => t.messages.length > 0 || t.id === activeId);

  return (
    <aside
      className={cn(
        'absolute inset-y-0 left-0 z-40 flex w-[272px] shrink-0 -translate-x-full flex-col border-r border-line bg-sidebar transition-transform duration-200 lg:static lg:translate-x-0',
        open && 'translate-x-0',
      )}
    >
      {/* Brand Title Header */}
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-5 border-b border-line/40">
        <Link to="/" className="flex items-center gap-3">
          <AnimatedOrb size="sm" />
          <div>
            <div className="text-sm font-semibold tracking-wide text-frost">VERDICT AI</div>
            <div className="text-[10px] uppercase tracking-widest text-violet-300 font-mono">Decision Intelligence</div>
          </div>
        </Link>
        <button type="button" onClick={onClose} className="text-mute hover:text-frost lg:hidden" aria-label="Close navigation">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Primary Action Button */}
      <div className="px-3 pt-4 space-y-2">
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

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-3 pb-2 space-y-5">
        {/* Primary Workspaces */}
        <div>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-mute">Core Workspaces</p>
          <div className="mt-2 space-y-1">
            {primaryNav.map((item) => {
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
                    if (onViewChange) onViewChange(item.id);
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

        {/* Advanced Engines */}
        <div>
          <p className="px-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-mute">Advanced Engines</p>
          <div className="mt-2 space-y-1">
            {advancedNav.map((item) => {
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
                    if (onViewChange) onViewChange(item.id);
                    onClose();
                  }}
                  className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-medium text-mute hover:bg-white/[0.04] hover:text-frost transition group"
                >
                  <div className="grid h-7 w-7 place-items-center rounded-lg border border-indigo-500/20 bg-indigo-500/10 text-indigo-300 shrink-0 group-hover:border-indigo-400/40 group-hover:text-frost transition">
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
                      if (onViewChange) onViewChange('chat');
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

      {/* User Profile & Status Section */}
      <div className="p-3 border-t border-line/40 space-y-2">
        {/* User Card */}
        {user && (
          <div className="rounded-xl border border-white/10 bg-[#1F1928] p-2.5 flex items-center justify-between gap-2 shadow-sm">
            <div className="flex items-center gap-2 min-w-0">
              <div className="relative h-8 w-8 rounded-full border border-violet-400/40 overflow-hidden bg-violet-900/50 shrink-0">
                {user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="h-full w-full flex items-center justify-center text-xs font-bold text-violet-200">
                    {user.name.charAt(0)}
                  </div>
                )}
                <span className="absolute bottom-0 right-0 h-2 w-2 rounded-full bg-emerald-400 border border-sidebar" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-xs font-bold text-white truncate leading-tight">{user.name}</div>
                <div className="text-[10px] text-violet-300/80 truncate leading-tight">{user.role}</div>
              </div>
            </div>

            <button
              type="button"
              onClick={logout}
              title="Sign Out"
              className="p-1.5 rounded-lg text-gray-400 hover:text-rose-400 hover:bg-rose-500/10 transition shrink-0"
              aria-label="Log Out"
            >
              <LogOut className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        {/* Status card */}
        <div className="rounded-xl border border-line/60 bg-card/80 p-2.5 space-y-1">
          <div className="flex items-center justify-between text-[11px] font-semibold text-frost">
            <span className="flex items-center gap-1.5">
              <Lock className="h-3 w-3 text-emerald-400" />
              Evidence Trust Gate
            </span>
            <span className={`h-2 w-2 rounded-full ${backendOnline ? 'bg-emerald-400' : 'bg-emerald-400 animate-pulse'}`} />
          </div>
          <p className="text-[9.5px] leading-tight text-mute font-sans">
            Deterministic Engine active. Hallucination zero-tolerance.
          </p>
          {onOpenUpload ? (
            <button
              type="button"
              onClick={onOpenUpload}
              className="mt-1 flex w-full items-center justify-center gap-1.5 rounded-lg border border-line bg-[#221C2C] px-2.5 py-1 text-[11px] text-frost hover:border-violet-400/40"
            >
              <UploadCloud className="h-3 w-3" />
              Upload Evidence
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
