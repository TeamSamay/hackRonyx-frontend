import {
  Archive,
  FolderKanban,
  Library,
  MessageSquare,
  Plus,
  Scale,
  ShieldAlert,
  Sparkles,
  UploadCloud,
  Database,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ChatThread } from '@/types/chat';
import type { View } from '@/pages/ChatApp';

const features = [
  { id: 'chat', label: 'Decision Chat', icon: MessageSquare },
  { id: 'decision-console', label: 'Decision Console', icon: ShieldAlert },
  { id: 'archived', label: 'Archived', icon: Archive },
  { id: 'library', label: 'Library', icon: Library },
] as const;

const workspaces = [
  { id: 'fraud', label: 'Fraud & Risk (TX-92831)', icon: ShieldAlert },
  { id: 'claims', label: 'Claims & Insurance', icon: FolderKanban },
  { id: 'legal', label: 'KYC & Legal Review', icon: Scale },
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
  onSeedDemo,
  seedingDemo,
  onOpenUpload,
}: {
  open: boolean;
  onClose: () => void;
  threads: ChatThread[];
  activeId: string;
  view: View;
  onViewChange: (view: View) => void;
  onSelectThread: (id: string) => void;
  onNewChat: () => void;
  backendOnline?: boolean;
  onSeedDemo?: () => void;
  seedingDemo?: boolean;
  onOpenUpload?: () => void;
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
        'absolute inset-y-0 left-0 z-40 flex w-[270px] shrink-0 -translate-x-full flex-col border-r border-line bg-sidebar transition-transform duration-200 lg:static lg:translate-x-0',
        open && 'translate-x-0',
      )}
    >
      <div className="flex items-center justify-between px-4 pb-3 pt-5">
        <div className="flex items-center gap-3">
          <div className="glow-orb h-8 w-8 rounded-full" />
          <div>
            <div className="text-sm font-semibold tracking-wide text-frost">VERDICT AI</div>
            <div className="text-[11px] text-mute">Deterministic Decision Gate</div>
          </div>
        </div>
      </div>

      <div className="px-3 space-y-2 mt-2">
        <button
          type="button"
          onClick={() => {
            onNewChat();
            onClose();
          }}
          className="flex w-full items-center justify-center gap-2 rounded-xl border border-line bg-[#221C2C] px-3 py-2.5 text-sm text-frost transition hover:border-[#3A3348]"
        >
          <Plus className="h-4 w-4" />
          New Investigation
        </button>

        {onSeedDemo ? (
          <button
            type="button"
            onClick={() => {
              onSeedDemo();
              onClose();
            }}
            disabled={seedingDemo}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-violet-500/40 bg-violet-500/10 px-3 py-2 text-xs font-semibold text-violet-300 transition hover:bg-violet-500/20"
          >
            <Sparkles className="h-3.5 w-3.5" />
            {seedingDemo ? 'Processing...' : '⚡ Seed Demo TX-92831'}
          </button>
        ) : null}
      </div>

      <div className="mt-4 min-h-0 flex-1 overflow-y-auto px-3 pb-4">
        <p className="px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-mute">Platform Views</p>
        <div className="mt-2 space-y-1">
          {features.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                onViewChange(item.id as View);
                onClose();
              }}
              className={cn(
                'flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-sm transition',
                view === item.id ? 'bg-white/[0.08] text-frost font-medium' : 'text-mute hover:bg-white/[0.03] hover:text-frost',
              )}
            >
              <item.icon className="h-4 w-4 text-violet-300" />
              {item.label}
            </button>
          ))}
        </div>

        <p className="mt-5 px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-mute">Live Workspaces</p>
        <div className="mt-2 space-y-1">
          {workspaces.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => {
                if (onSeedDemo) onSeedDemo();
                onClose();
              }}
              className="flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-xs text-mute transition hover:bg-white/[0.03] hover:text-frost"
            >
              <div className="flex items-center gap-2.5">
                <item.icon className="h-3.5 w-3.5 text-mute" />
                <span>{item.label}</span>
              </div>
            </button>
          ))}
        </div>

        <p className="mt-5 px-2 text-[11px] font-medium uppercase tracking-[0.18em] text-mute">
          Recent Threads
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
                  'w-full rounded-xl px-3 py-2 text-left text-xs transition',
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
          <div className="flex items-center justify-between text-xs font-semibold text-frost">
            <span className="flex items-center gap-1.5">
              <Database className="h-3.5 w-3.5 text-violet-300" />
              Evidence Ingestion
            </span>
            <span className={`h-2 w-2 rounded-full ${backendOnline ? 'bg-emerald-400' : 'bg-rose-400'}`} />
          </div>
          <p className="mt-1.5 text-[11px] leading-relaxed text-mute">
            Upload PDFs, OCR Images, or CSVs directly into the common evidence layer.
          </p>
          {onOpenUpload ? (
            <button
              type="button"
              onClick={onOpenUpload}
              className="mt-2.5 flex w-full items-center justify-center gap-1.5 rounded-xl border border-line bg-[#221C2C] px-3 py-1.5 text-xs text-frost hover:border-violet-400/40"
            >
              <UploadCloud className="h-3.5 w-3.5" />
              Upload Evidence
            </button>
          ) : null}
        </div>
      </div>
    </aside>
  );
}
