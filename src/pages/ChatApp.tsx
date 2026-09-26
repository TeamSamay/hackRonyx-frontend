import { useMemo, useState, useEffect } from 'react';
import { Download, Menu, Sparkles, UploadCloud, ShieldAlert, Cpu } from 'lucide-react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatEmptyState } from '@/components/chat/ChatEmptyState';
import { ChatConversation } from '@/components/chat/ChatConversation';
import { DecisionConsole } from '@/components/verdict/DecisionConsole';
import { FileUploadModal } from '@/components/verdict/FileUploadModal';
import { createEmptyThread, starterThreads } from '@/data/chat';
import type { ChatThread } from '@/types/chat';
import type { DecisionPacket } from '@/types/verdict';
import { checkBackendHealth, seedDemoTX92831, askVerdictAI } from '@/lib/api';

export type View = 'chat' | 'decision-console' | 'archived' | 'library' | 'cases';

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
  
  // Backend Live State
  const [backendOnline, setBackendOnline] = useState(false);
  const [activeDecision, setActiveDecision] = useState<DecisionPacket | null>(null);
  const [activeCaseId, setActiveCaseId] = useState<string>('CASE-TX92831');
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [seedingDemo, setSeedingDemo] = useState(false);

  // Check health on mount & periodic polling
  useEffect(() => {
    async function verifyHealth() {
      const h = await checkBackendHealth();
      setBackendOnline(h.online);
    }
    verifyHealth();
    const interval = setInterval(verifyHealth, 8000);
    return () => clearInterval(interval);
  }, []);

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

  async function handleSeedDemo() {
    try {
      setSeedingDemo(true);
      const packet = await seedDemoTX92831();
      setActiveDecision(packet);
      setActiveCaseId(packet.case_id);
      setView('decision-console');
    } catch (err) {
      console.error(err);
    } finally {
      setSeedingDemo(false);
    }
  }

  async function send(text: string) {
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
    };

    setThreads((current) =>
      current.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              title: thread.messages.length === 0 ? text.slice(0, 48) : thread.title,
              updatedAt: new Date().toISOString(),
              messages: [...thread.messages, userMessage],
            }
          : thread,
      ),
    );

    setPending(true);

    // Call real VERDICT backend reasoning & analysis
    const result = await askVerdictAI(text, activeCaseId);
    
    if (result.decision) {
      setActiveDecision(result.decision);
    }

    const assistantMessage = {
      id: `msg-${Date.now()}-a`,
      role: 'assistant' as const,
      content: result.text,
    };

    setThreads((current) =>
      current.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              updatedAt: new Date().toISOString(),
              messages: [...thread.messages, assistantMessage],
            }
          : thread,
      ),
    );
    setPending(false);
  }

  const showEmpty = !active || active.messages.length === 0;

  return (
    <div className="min-h-screen bg-outer p-3 sm:p-4 md:p-5">
      <div className="relative mx-auto flex h-[calc(100vh-1.5rem)] overflow-hidden rounded-shell border border-white/10 bg-ink shadow-float sm:h-[calc(100vh-2rem)] md:h-[calc(100vh-2.5rem)]">
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
          backendOnline={backendOnline}
          onSeedDemo={handleSeedDemo}
          seedingDemo={seedingDemo}
          onOpenUpload={() => setUploadModalOpen(true)}
        />

        <div className="main-canvas flex min-w-0 flex-1 flex-col">
          <header className="flex h-16 shrink-0 items-center gap-3 border-b border-line px-4 sm:px-6">
            <button
              type="button"
              className="grid h-9 w-9 place-items-center rounded-full border border-line text-mute lg:hidden"
              onClick={() => setSidebarOpen(true)}
              aria-label="Open navigation"
            >
              <Menu className="h-4 w-4" />
            </button>

            {/* Backend Connection Status Badge */}
            <div className="flex items-center gap-2">
              <span
                className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${
                  backendOnline
                    ? 'border border-emerald-500/30 bg-emerald-500/10 text-emerald-400'
                    : 'border border-rose-500/30 bg-rose-500/10 text-rose-400'
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full ${
                    backendOnline ? 'bg-emerald-400 animate-pulse' : 'bg-rose-400'
                  }`}
                />
                <span className="hidden sm:inline">
                  {backendOnline ? 'FastAPI Backend Online (Port 8000)' : 'Backend Offline'}
                </span>
              </span>
            </div>

            {/* View Switcher Tabs */}
            <div className="hidden md:flex items-center gap-1 ml-2 rounded-xl border border-line bg-card/60 p-1">
              <button
                onClick={() => setView('chat')}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                  view === 'chat' ? 'bg-white/10 text-frost' : 'text-mute hover:text-frost'
                }`}
              >
                Decision Chat
              </button>
              <button
                onClick={async () => {
                  if (!activeDecision) {
                    await handleSeedDemo();
                  } else {
                    setView('decision-console');
                  }
                }}
                className={`px-3 py-1 text-xs font-medium rounded-lg transition flex items-center gap-1.5 ${
                  view === 'decision-console' ? 'bg-white/10 text-frost' : 'text-mute hover:text-frost'
                }`}
              >
                <ShieldAlert className="h-3.5 w-3.5 text-rose-400" />
                Decision Console
              </button>
            </div>

            <div className="ml-auto flex items-center gap-2">
              {/* 1-Click Demo Launcher */}
              <button
                type="button"
                onClick={handleSeedDemo}
                disabled={seedingDemo}
                className="inline-flex items-center gap-1.5 rounded-full border border-violet-500/40 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-300 hover:bg-violet-500/20 transition"
              >
                <Sparkles className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">
                  {seedingDemo ? 'Seeding Demo...' : 'Demo TX-92831'}
                </span>
              </button>

              {/* Upload Button */}
              <button
                type="button"
                onClick={() => setUploadModalOpen(true)}
                className="inline-flex items-center gap-1.5 rounded-full border border-line bg-card px-3 py-1.5 text-xs text-mute hover:text-frost"
              >
                <UploadCloud className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Upload Evidence</span>
              </button>

              {/* Export Button */}
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

          <main className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6">
            {view === 'decision-console' ? (
              activeDecision ? (
                <DecisionConsole
                  decision={activeDecision}
                  onRefresh={() => handleSeedDemo()}
                />
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <Cpu className="h-12 w-12 text-violet-400 mb-3 animate-bounce" />
                  <h3 className="text-lg font-bold text-frost">No Active Decision Dossier Loaded</h3>
                  <p className="text-xs text-mute mt-1 max-w-sm">
                    Click the demo launcher below to run the multi-source pipeline and load the Canonical Decision Packet.
                  </p>
                  <button
                    onClick={handleSeedDemo}
                    className="mt-4 rounded-xl accent-gradient px-4 py-2 text-xs font-semibold text-white shadow-lg"
                  >
                    Seed Hackathon Demo TX-92831
                  </button>
                </div>
              )
            ) : showEmpty ? (
              <ChatEmptyState onSend={send} />
            ) : (
              <ChatConversation messages={active.messages} pending={pending} onSend={send} />
            )}
          </main>
        </div>
      </div>

      {/* Evidence Upload Modal */}
      <FileUploadModal
        isOpen={uploadModalOpen}
        onClose={() => setUploadModalOpen(false)}
        caseId={activeCaseId}
        onUploadSuccess={() => {
          handleSeedDemo();
        }}
      />
    </div>
  );
}
