import { useState, useEffect } from 'react';
import {
  Bot,
  ChevronDown,
  Menu,
  Play,
  Plus,
  ShieldCheck,
  Zap,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { checkBackendHealth } from '@/lib/api';
import type { ConsoleSection } from '@/types/verdict';

const SECTION_LABELS: Record<ConsoleSection, string> = {
  overview: 'Console Overview',
  cases: 'Cases & Evidence Workspace',
  evidence: 'Evidence Objects',
  connectors: 'Ingestion Layer & Edge Gateway',
  decisions: 'Deterministic Decision Gate',
  challenge: 'Counter-Evidence Challenge Engine',
  reviews: 'Human Analyst Review & Audit',
  demo: 'Realtime Pipeline Runner (TX-92831)',
  copilot: 'VERDICT AI Copilot',
};

export function ConsoleHeader({
  section,
  onOpenMobileMenu,
  onRunDemo,
  onOpenIngest,
  onOpenCopilot,
}: {
  section: ConsoleSection;
  onOpenMobileMenu: () => void;
  onRunDemo: () => void;
  onOpenIngest: () => void;
  onOpenCopilot: () => void;
}) {
  const [backendStatus, setBackendStatus] = useState<{ online: boolean; message: string }>({
    online: false,
    message: 'Checking backend...',
  });
  const [model, setModel] = useState('VERDICT Core Engine (FastAPI + XGBoost)');

  useEffect(() => {
    checkBackendHealth().then(setBackendStatus);
    const interval = setInterval(() => {
      checkBackendHealth().then(setBackendStatus);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex h-14 shrink-0 items-center justify-between border-b border-line/80 bg-sidebar/50 px-4 sm:px-6 backdrop-blur">
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="grid h-9 w-9 place-items-center rounded-xl border border-line text-mute hover:text-frost sm:hidden"
          onClick={onOpenMobileMenu}
          aria-label="Open Navigation"
        >
          <Menu className="h-4.5 w-4.5" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 rounded-xl border border-line bg-card/60 px-3 py-1.5 text-xs text-frost font-medium">
            <ShieldCheck className="h-4 w-4 text-violet-300" />
            <span className="hidden sm:inline">VERDICT AI</span>
            <span className="text-mute">/</span>
            <span className="text-violet-200">{SECTION_LABELS[section]}</span>
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Backend status indicator */}
        <div
          title={backendStatus.message}
          className={`hidden md:flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-mono ${
            backendStatus.online
              ? 'border-emerald-500/30 bg-emerald-500/10 text-emerald-300'
              : 'border-violet-500/30 bg-violet-500/10 text-violet-300'
          }`}
        >
          <span className="relative flex h-2 w-2">
            <span
              className={`absolute inline-flex h-full w-full animate-ping rounded-full opacity-75 ${
                backendStatus.online ? 'bg-emerald-400' : 'bg-violet-400'
              }`}
            />
            <span
              className={`relative inline-flex h-2 w-2 rounded-full ${
                backendStatus.online ? 'bg-emerald-500' : 'bg-violet-500'
              }`}
            />
          </span>
          <span>{backendStatus.online ? 'Backend :8000 Live' : 'Edge Gate Active'}</span>
        </div>

        {/* Model selector dropdown */}
        <DropdownMenu.Root>
          <DropdownMenu.Trigger className="hidden lg:inline-flex items-center gap-2 rounded-xl border border-line bg-card/80 px-3 py-1.5 text-xs text-frost outline-none hover:border-violet-400/40">
            <Zap className="h-3.5 w-3.5 text-violet-300" />
            <span className="max-w-[180px] truncate">{model}</span>
            <ChevronDown className="h-3.5 w-3.5 text-mute" />
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              className="z-50 min-w-[240px] rounded-2xl border border-line bg-card p-1.5 shadow-float backdrop-blur-xl"
            >
              {[
                { name: 'VERDICT Core Engine (FastAPI + XGBoost)', desc: 'Full deterministic gate + ML risk' },
                { name: 'VERDICT Enterprise (Multi-Edge)', desc: 'Edge gateway connectors + RAG' },
                { name: 'VERDICT Challenge Mode', desc: 'Adversarial counter-evidence engine' },
              ].map((item) => (
                <DropdownMenu.Item
                  key={item.name}
                  className="cursor-pointer rounded-xl px-3 py-2 text-left outline-none hover:bg-white/5"
                  onSelect={() => setModel(item.name)}
                >
                  <div className="text-xs font-semibold text-frost">{item.name}</div>
                  <div className="text-[10px] text-mute">{item.desc}</div>
                </DropdownMenu.Item>
              ))}
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>

        {/* Action buttons */}
        <button
          type="button"
          onClick={onRunDemo}
          className="accent-gradient inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-medium text-white shadow-lg shadow-violet-500/25 hover:opacity-90 active:scale-95 transition"
        >
          <Play className="h-3.5 w-3.5 fill-white" />
          <span>Run Pipeline TX-92831</span>
        </button>

        <button
          type="button"
          onClick={onOpenIngest}
          className="inline-flex items-center gap-1.5 rounded-xl border border-line bg-card/80 px-3 py-1.5 text-xs text-frost hover:border-violet-400/30 active:scale-95 transition"
        >
          <Plus className="h-3.5 w-3.5 text-violet-300" />
          <span className="hidden sm:inline">Ingest Evidence</span>
        </button>

        <button
          type="button"
          onClick={onOpenCopilot}
          className="inline-flex items-center gap-1.5 rounded-xl border border-violet-500/30 bg-violet-500/10 px-3 py-1.5 text-xs text-violet-200 hover:bg-violet-500/20 active:scale-95 transition"
        >
          <Bot className="h-3.5 w-3.5 text-violet-300" />
          <span className="hidden md:inline">Copilot</span>
        </button>
      </div>
    </header>
  );
}
