import { useMemo, useState } from 'react';
import { ChevronDown, Download, Menu, Settings } from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { AnimatePresence, motion } from 'motion/react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatEmptyState } from '@/components/chat/ChatEmptyState';
import { ChatConversation } from '@/components/chat/ChatConversation';
import { createEmptyThread, replyTo, starterThreads } from '@/data/chat';
import { viewSwap } from '@/lib/motion';
import type { ChatThread, AttachmentItem } from '@/types/chat';

type View = 'chat' | 'archived' | 'library';

function bootstrap() {
  const list = [createEmptyThread(), ...starterThreads];
  return { list, activeId: list[0].id };
}

export function ChatApp() {
  const [boot] = useState(bootstrap);
  const [threads, setThreads] = useState<ChatThread[]>(boot.list);
  const [activeId, setActiveId] = useState(boot.activeId);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [view, setView] = useState<View>('chat');
  const [pending, setPending] = useState(false);
  const [model, setModel] = useState('VERDICT Core');

  const active = useMemo(
    () => threads.find((thread) => thread.id === activeId) ?? threads[0],
    [threads, activeId],
  );

  function newChat() {
    const thread = createEmptyThread();
    setThreads((current) => [thread, ...current.filter((item) => item.messages.length > 0)]);
    setActiveId(thread.id);
    setView('chat');
  }

  async function send(text: string, attachments: AttachmentItem[] = []) {
    let threadId = active?.id;
    if (!threadId || !active) {
      const thread = createEmptyThread();
      threadId = thread.id;
      setThreads((current) => [thread, ...current]);
      setActiveId(thread.id);
    }

    const userMessage = {
      id: `msg-${Date.now()}-u`,
      role: 'user' as const,
      content: text,
      attachments,
    };

    setThreads((current) =>
      current.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              title: thread.messages.length === 0 ? (text ? text.slice(0, 48) : 'Evidence upload') : thread.title,
              updatedAt: new Date().toISOString(),
              messages: [...thread.messages, userMessage],
            }
          : thread,
      ),
    );

    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 520));
    const answer = replyTo(text);
    if (attachments.length > 0) {
      answer.content += `\n\n📄 **Targeted Evidence Attachments Processed:**\n`;
      for (const att of attachments) {
        answer.content += `- \`${att.name}\` (OCR ${Math.round((att.ocrConfidence || 0.95) * 100)}%): Text claims extracted successfully.\n`;
      }
    }
    setThreads((current) =>
      current.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              updatedAt: new Date().toISOString(),
              messages: [...thread.messages, answer],
            }
          : thread,
      ),
    );
    setPending(false);
  }

  const showEmpty = !active || active.messages.length === 0;

  return (
    <div className="relative flex h-screen w-full overflow-hidden bg-ink">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="absolute inset-0 z-30 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      <ChatSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        threads={threads}
        activeId={active?.id ?? ''}
        view={view}
        onViewChange={setView}
        onSelectThread={setActiveId}
        onNewChat={newChat}
      />

      <div className="main-canvas flex min-w-0 flex-1 flex-col overflow-hidden">
        <header className="flex h-14 shrink-0 items-center gap-3 border-b border-line/80 px-4 sm:px-6">
          <button
            type="button"
            className="grid h-9 w-9 place-items-center rounded-full border border-line text-mute lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open navigation"
          >
            <Menu className="h-4 w-4" />
          </button>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card/80 px-3 py-1.5 text-xs text-frost outline-none backdrop-blur hover:border-[#3A3348]">
              {model}
              <ChevronDown className="h-3.5 w-3.5 text-mute" />
            </DropdownMenu.Trigger>
            <DropdownMenu.Portal>
              <DropdownMenu.Content
                sideOffset={8}
                className="z-50 min-w-[180px] rounded-xl border border-line bg-card p-1 shadow-float"
              >
                {['VERDICT Core', 'VERDICT Fast', 'VERDICT Careful'].map((item) => (
                  <DropdownMenu.Item
                    key={item}
                    className="cursor-pointer rounded-lg px-3 py-2 text-sm text-frost outline-none data-[highlighted]:bg-white/5"
                    onSelect={() => setModel(item)}
                  >
                    {item}
                  </DropdownMenu.Item>
                ))}
              </DropdownMenu.Content>
            </DropdownMenu.Portal>
          </DropdownMenu.Root>

          <div className="ml-auto flex items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-xs text-mute hover:text-frost"
            >
              <Settings className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Configuration</span>
            </button>
            <button
              type="button"
              className="inline-flex items-center gap-2 rounded-full border border-line bg-card px-3 py-1.5 text-xs text-mute hover:text-frost"
              onClick={() => {
                if (!active) return;
                const blob = new Blob(
                  [active.messages.map((message) => `${message.role.toUpperCase()}: ${message.content}`).join('\n\n')],
                  { type: 'text/plain;charset=utf-8' },
                );
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `${active.title || 'verdict-chat'}.txt`;
                link.click();
                URL.revokeObjectURL(url);
              }}
            >
              <Download className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Export</span>
            </button>
          </div>
        </header>

        <main className="relative min-h-0 flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            {showEmpty ? (
              <motion.div
                key="empty"
                className="h-full w-full flex flex-col overflow-hidden"
                initial={viewSwap.initial}
                animate={viewSwap.animate}
                exit={viewSwap.exit}
                transition={viewSwap.transition}
              >
                <ChatEmptyState onSend={send} />
              </motion.div>
            ) : (
              <motion.div
                key={active?.id ?? 'chat'}
                className="h-full w-full flex flex-col overflow-hidden"
                initial={viewSwap.initial}
                animate={viewSwap.animate}
                exit={viewSwap.exit}
                transition={viewSwap.transition}
              >
                <ChatConversation messages={active.messages} pending={pending} onSend={send} />
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
