import {
  Archive,
  FolderKanban,
  Library,
  MessageSquare,
  Plus,
  Scale,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatThread } from '@/types/chat';

const features = [
  { id: 'chat', label: 'Chat', icon: MessageSquare },
  { id: 'archived', label: 'Archived', icon: Archive },
  { id: 'library', label: 'Library', icon: Library },
] as const;

const workspaces = [
  { id: 'fraud', label: 'Fraud & Risk', icon: ShieldAlert },
  { id: 'claims', label: 'Claims', icon: FolderKanban },
  { id: 'legal', label: 'Legal Review', icon: Scale },
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
}: {
  open: boolean;
  onClose: () => void;
  threads: ChatThread[];
  activeId: string;
  view: 'chat' | 'archived' | 'library';
  onViewChange: (view: 'chat' | 'archived' | 'library') => void;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
}) {
  const visible =
    view === 'archived'
      ? threads.filter((thread) => thread.archived)
      : view === 'library'
        ? threads
        : threads.filter((thread) => !thread.archived);

  return (
    <aside
      className={cn(
        'absolute inset-y-0 left-0 z-40 flex w-[260px] shrink-0 -translate-x-full flex-col border-r border-line bg-sidebar transition-transform duration-200 lg:static lg:translate-x-0',
        open && 'translate-x-0',
      )}
    >
      <div className="flex items-center gap-3 px-4 pb-3 pt-5">
        <div className="glow-orb h-8 w-8 rounded-full" />
        <div>
          <div className="text-sm font-semibold tracking-wide text-frost">VERDICT AI</div>
          <div className="text-[11px] text-mute">Decision chat</div>
        </div>
      </div>

      <div className="px-3">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-[#221C2C] px-3 py-2.5 text-sm text-frost transition hover:border-[#3A3348]"
        >
          <Plus className="h-4 w-4" />
          New Chat
        </button>
      </div>

      <div className="mt-5 min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-mute">Features</p>
        <div className="mt-2 space-y-1">
          {features.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onViewChange(item.id);
                onClose();
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition',
                view === item.id ? 'bg-white/[0.05] text-frost' : 'text-mute hover:bg-white/[0.03] hover:text-frost',
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        <p className="mt-6 px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-mute">Workspaces</p>
        <div className="mt-2 space-y-1">
          {workspaces.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onViewChange('chat');
                onNewChat();
                onClose();
              }}
              className="flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm text-mute transition hover:bg-white/[0.03] hover:text-frost"
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </button>
          ))}
        </div>

        <p className="mt-6 px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-mute">
          {view === 'archived' ? 'Archived' : view === 'library' ? 'Library' : 'Recent'}
        </p>
        <div className="mt-2 space-y-1">
          {visible.length === 0 ? (
            <p className="px-3 py-2 text-xs text-mute">No chats here yet.</p>
          ) : (
            visible.map((thread) => (
              <button
                key={thread.id}
                type="button"
                onClick={() => {
                  onSelectThread(thread.id);
                  onViewChange('chat');
                  onClose();
                }}
                className={cn(
                  'w-full rounded-xl px-3 py-2 text-left text-sm transition',
                  activeId === thread.id ? 'bg-white/[0.05] text-frost' : 'text-mute hover:bg-white/[0.03] hover:text-frost',
                )}
              >
                <span className="line-clamp-1">{thread.title}</span>
              </button>
            ))
          )}
        </div>
      </div>

      <div className="border-t border-line p-3">
        <div className="rounded-2xl border border-line bg-card p-3">
          <div className="flex items-center gap-2 text-sm text-frost">
            <Sparkles className="h-4 w-4 text-violet-200" />
            Premium demo
          </div>
          <p className="mt-2 text-xs leading-relaxed text-mute">
            Chat with VERDICT about decisions, evidence, and contradictions. Demo replies only.
          </p>
          <button
            type="button"
            className="mt-3 w-full rounded-full border border-line bg-[#221C2C] px-3 py-2 text-xs text-frost"
          >
            Upgrade
          </button>
        </div>
      </div>
    </aside>
  );
}
