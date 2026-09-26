import { useMemo, useState, useEffect } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { Menu } from 'lucide-react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ChatEmptyState } from '@/components/chat/ChatEmptyState';
import { ChatConversation } from '@/components/chat/ChatConversation';
import { CaseWorkspace } from '@/components/console/CaseWorkspace';
import { ConnectorsView } from '@/components/console/ConnectorsView';
import { DecisionsView } from '@/components/console/DecisionsView';
import { ChallengeView } from '@/components/console/ChallengeView';
import { ReviewsView } from '@/components/console/ReviewsView';
import { DemoTX92831View } from '@/components/console/DemoTX92831View';
import { VerdictCopilot } from '@/components/console/VerdictCopilot';

import { mockCases, mockConnectors, demoDecision } from '@/data/verdict';
import { createEmptyThread, replyTo, starterThreads } from '@/data/chat';
import type { ConsoleSection, VerdictCase, ConnectorConfig, EvidenceObject, DecisionPacket } from '@/types/verdict';
import type { ChatThread, AttachmentItem } from '@/types/chat';
import { viewSwap } from '@/lib/motion';
import { fetchChatThreadsApi, sendChatMessageApi } from '@/lib/api';

type SidebarView = 'chat' | 'archived' | 'library';

function bootstrapChat() {
  const list = [createEmptyThread(), ...starterThreads];
  return { list, activeId: list[0].id };
}

export function VerdictConsoleApp() {
  // Navigation & Workspace State
  const [section, setSection] = useState<ConsoleSection>('overview');
  const [activeCaseId, setActiveCaseId] = useState<string>('CASE-TX92831');
  const [cases, setCases] = useState<VerdictCase[]>(mockCases);
  const [connectors] = useState<ConnectorConfig[]>(mockConnectors);
  const [sidebarOpen, setSidebarOpen] = useState<boolean>(false);

  // Chat & History State
  const [boot] = useState(bootstrapChat);
  const [threads, setThreads] = useState<ChatThread[]>(boot.list);
  const [activeThreadId, setActiveThreadId] = useState<string>(boot.activeId);
  const [sidebarView, setSidebarView] = useState<SidebarView>('chat');
  const [pending, setPending] = useState<boolean>(false);

  // Sync threads from backend database / API on load
  useEffect(() => {
    async function loadThreads() {
      const apiThreads = await fetchChatThreadsApi();
      if (apiThreads && apiThreads.length > 0) {
        setThreads(apiThreads);
        if (!apiThreads.find((t) => t.id === activeThreadId)) {
          setActiveThreadId(apiThreads[0].id);
        }
      }
    }
    loadThreads();
  }, []);

  const activeThread = useMemo(
    () => threads.find((t) => t.id === activeThreadId) ?? threads[0],
    [threads, activeThreadId],
  );

  function handleNewChat() {
    const thread = createEmptyThread();
    setThreads((current) => [thread, ...current.filter((item) => item.messages.length > 0)]);
    setActiveThreadId(thread.id);
    setSidebarView('chat');
    setSection('overview');
  }

  async function handleSendChatMessage(text: string, attachments: AttachmentItem[] = []) {
    let threadId = activeThread?.id;
    if (!threadId || !activeThread) {
      const thread = createEmptyThread();
      threadId = thread.id;
      setThreads((current) => [thread, ...current]);
      setActiveThreadId(thread.id);
    }

    const userMsg = {
      id: `msg-${Date.now()}-u`,
      role: 'user' as const,
      content: text,
      attachments,
      timestamp: new Date().toISOString(),
    };

    // Optimistic UI update
    setThreads((current) =>
      current.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              title: thread.messages.length === 0 ? (text ? text.slice(0, 48) : 'File analysis evaluation') : thread.title,
              updatedAt: new Date().toISOString(),
              messages: [...thread.messages, userMsg],
            }
          : thread,
      ),
    );

    setPending(true);

    // Try sending to backend chat API (MongoDB / SQLite persistence)
    const apiRes = await sendChatMessageApi(threadId, text, attachments);

    if (apiRes?.botMessage) {
      const botMsg = {
        id: apiRes.botMessage.id,
        role: 'assistant' as const,
        content: apiRes.botMessage.content,
        timestamp: apiRes.botMessage.timestamp,
      };

      setThreads((current) =>
        current.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                updatedAt: new Date().toISOString(),
                messages: [...thread.messages.filter((m) => m.id !== userMsg.id), apiRes.userMessage, botMsg],
              }
            : thread,
        ),
      );
    } else {
      // Local Fallback simulation
      await new Promise((resolve) => setTimeout(resolve, 520));
      let botReplyContent = replyTo(text).content;

      if (attachments.length > 0) {
        botReplyContent += `\n\n📄 **Targeted Evidence Attachments Processed:**\n`;
        for (const att of attachments) {
          botReplyContent += `- \`${att.name}\` (OCR ${Math.round((att.ocrConfidence || 0.95) * 100)}%): Text claims extracted successfully.\n`;
        }
      }

      const botReply = {
        id: `msg-${Date.now()}-a`,
        role: 'assistant' as const,
        content: botReplyContent,
      };

      setThreads((current) =>
        current.map((thread) =>
          thread.id === threadId
            ? {
                ...thread,
                updatedAt: new Date().toISOString(),
                messages: [...thread.messages, botReply],
              }
            : thread,
        ),
      );
    }

    setPending(false);
  }

  const handleEvidenceIngested = (newEv: EvidenceObject) => {
    setCases((currentCases) =>
      currentCases.map((c) => {
        if (c.case_id === newEv.case_id) {
          const updatedDecision: DecisionPacket = c.decision
            ? {
                ...c.decision,
                evidence: [newEv, ...c.decision.evidence],
              }
            : {
                ...demoDecision,
                case_id: c.case_id,
                evidence: [newEv],
              };
          return {
            ...c,
            evidence_count: c.evidence_count + 1,
            decision: updatedDecision,
          };
        }
        return c;
      }),
    );
    setActiveCaseId(newEv.case_id);
    setSection('cases');
  };

  const handleDemoComplete = (packet: DecisionPacket) => {
    setCases((currentCases) =>
      currentCases.map((c) =>
        c.case_id === packet.case_id || c.case_id === 'CASE-TX92831'
          ? {
              ...c,
              trust_status: packet.trust_status,
              evidence_count: packet.evidence.length || c.evidence_count,
              decision: packet,
              updated_at: new Date().toISOString(),
            }
          : c,
      ),
    );
    setActiveCaseId(packet.case_id);
    setSection('cases');
  };

  const showChatEmptyState = !activeThread || activeThread.messages.length === 0;

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-ink text-frost border-0 rounded-none m-0 p-0 select-none">
      {sidebarOpen ? (
        <button
          type="button"
          aria-label="Close navigation"
          className="fixed inset-0 z-30 bg-black/60 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      ) : null}

      {/* Unified Navigation Sidebar */}
      <ChatSidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        threads={threads}
        activeId={activeThread?.id ?? ''}
        view={sidebarView}
        onViewChange={setSidebarView}
        onSelectThread={setActiveThreadId}
        onNewChat={handleNewChat}
        onSelectSection={(s) => setSection(s)}
      />

      {/* Main Content Area */}
      <div className="main-canvas flex h-full min-w-0 flex-1 flex-col overflow-hidden relative">
        {/* Floating Mobile Toggle Button */}
        {!sidebarOpen && (
          <button
            type="button"
            className="fixed top-3 left-3 z-30 grid h-9 w-9 place-items-center rounded-xl border border-line/60 bg-sidebar/80 text-frost backdrop-blur-md shadow-lg lg:hidden"
            onClick={() => setSidebarOpen(true)}
            aria-label="Open Navigation"
          >
            <Menu className="h-4 w-4" />
          </button>
        )}

        <main className="relative min-h-0 flex-1 overflow-hidden flex flex-col">
          <AnimatePresence mode="wait">
            <motion.div
              key={section + (section === 'cases' || section === 'evidence' ? activeCaseId : '') + (section === 'overview' ? activeThread?.id : '')}
              className="h-full w-full flex flex-col overflow-hidden"
              initial={viewSwap.initial}
              animate={viewSwap.animate}
              exit={viewSwap.exit}
              transition={viewSwap.transition}
            >
              {/* Primary Decision Chat View */}
              {section === 'overview' && (
                <div className="h-full w-full flex flex-col overflow-hidden">
                  {showChatEmptyState ? (
                    <ChatEmptyState onSend={handleSendChatMessage} />
                  ) : (
                    <ChatConversation
                      messages={activeThread.messages}
                      pending={pending}
                      onSend={handleSendChatMessage}
                    />
                  )}
                </div>
              )}

              {/* Scrollable container for non-chat sections */}
              {section !== 'overview' && (
                <div className="h-full w-full overflow-y-auto">
                  {(section === 'cases' || section === 'evidence') && (
                    <CaseWorkspace cases={cases} activeCaseId={activeCaseId} onSelectCase={setActiveCaseId} />
                  )}

                  {section === 'connectors' && (
                    <ConnectorsView
                      connectors={connectors}
                      onEvidenceIngested={handleEvidenceIngested}
                      onDecisionUpdated={handleDemoComplete}
                    />
                  )}

                  {section === 'decisions' && <DecisionsView />}
                  {section === 'challenge' && <ChallengeView />}
                  {section === 'reviews' && <ReviewsView />}
                  {section === 'demo' && <DemoTX92831View onDemoComplete={handleDemoComplete} />}
                  {section === 'copilot' && <VerdictCopilot />}
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
