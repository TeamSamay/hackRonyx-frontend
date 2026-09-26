import { useMemo, useState } from 'react';
import { AnimatePresence, motion } from 'motion/react';
import { ChatSidebar } from '@/components/chat/ChatSidebar';
import { ConsoleHeader } from '@/components/console/ConsoleHeader';
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
import type { ChatThread } from '@/types/chat';
import { viewSwap } from '@/lib/motion';

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

  // Chat State
  const [boot] = useState(bootstrapChat);
  const [threads, setThreads] = useState<ChatThread[]>(boot.list);
  const [activeThreadId, setActiveThreadId] = useState<string>(boot.activeId);
  const [sidebarView, setSidebarView] = useState<SidebarView>('chat');
  const [pending, setPending] = useState<boolean>(false);

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

  async function handleSendChatMessage(text: string) {
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
    };

    setThreads((current) =>
      current.map((thread) =>
        thread.id === threadId
          ? {
              ...thread,
              title: thread.messages.length === 0 ? text.slice(0, 48) : thread.title,
              updatedAt: new Date().toISOString(),
              messages: [...thread.messages, userMsg],
            }
          : thread,
      ),
    );

    setPending(true);
    await new Promise((resolve) => setTimeout(resolve, 520));
    const botReply = replyTo(text);
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
    <div className="flex h-screen w-screen overflow-hidden bg-ink text-frost border-0 rounded-none m-0 p-0">
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
      <div className="main-canvas flex h-full min-w-0 flex-1 flex-col overflow-hidden">
        <ConsoleHeader
          section={section}
          onOpenMobileMenu={() => setSidebarOpen(true)}
          onRunDemo={() => setSection('demo')}
          onOpenIngest={() => setSection('connectors')}
          onOpenCopilot={() => setSection('copilot')}
        />

        <main className="min-h-0 flex-1 overflow-y-auto">
          <AnimatePresence mode="wait">
            <motion.div
              key={section + (section === 'cases' || section === 'evidence' ? activeCaseId : '') + (section === 'overview' ? activeThread?.id : '')}
              className="min-h-full w-full"
              initial={viewSwap.initial}
              animate={viewSwap.animate}
              exit={viewSwap.exit}
              transition={viewSwap.transition}
            >
              {/* Primary Decision Chat View (matches exact screenshot!) */}
              {section === 'overview' && (
                <div className="h-full w-full">
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

              {(section === 'cases' || section === 'evidence') && (
                <CaseWorkspace cases={cases} activeCaseId={activeCaseId} onSelectCase={setActiveCaseId} />
              )}

              {section === 'connectors' && (
                <ConnectorsView connectors={connectors} onEvidenceIngested={handleEvidenceIngested} />
              )}

              {section === 'decisions' && <DecisionsView />}
              {section === 'challenge' && <ChallengeView />}
              {section === 'reviews' && <ReviewsView />}
              {section === 'demo' && <DemoTX92831View onDemoComplete={handleDemoComplete} />}
              {section === 'copilot' && <VerdictCopilot />}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
