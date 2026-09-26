import { useState, useEffect } from 'react';
import {
  MoreVertical,
  Menu,
  Play,
  Plus,
  ShieldCheck,
  Zap,
  Bot,
} from 'lucide-react';
import * as DropdownMenu from '@radix-ui/react-dropdown-menu';
import { checkBackendHealth } from '@/lib/api';

export function ConsoleHeader({
  onOpenMobileMenu,
  onRunDemo,
  onOpenIngest,
  onOpenCopilot,
}: {
  section?: any;
  onOpenMobileMenu: () => void;
  onRunDemo: () => void;
  onOpenIngest: () => void;
  onOpenCopilot: () => void;
}) {
  const [backendStatus, setBackendStatus] = useState<{ online: boolean; message: string }>({
    online: false,
    message: 'Checking backend...',
  });

  useEffect(() => {
    checkBackendHealth().then(setBackendStatus);
    const interval = setInterval(() => {
      checkBackendHealth().then(setBackendStatus);
    }, 10000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="flex h-12 shrink-0 items-center justify-between border-b border-line/40 bg-sidebar/30 px-4 sm:px-6 backdrop-blur-md">
      {/* Mobile menu toggle & Minimal Title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          className="grid h-8 w-8 place-items-center rounded-lg border border-line text-mute hover:text-frost lg:hidden"
          onClick={onOpenMobileMenu}
          aria-label="Open Navigation"
        >
          <Menu className="h-4 w-4" />
        </button>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-xs text-frost font-medium">
            <ShieldCheck className="h-4 w-4 text-violet-300" />
            <span className="font-bold tracking-wide">VERDICT AI</span>
            <span className="text-mute/60">·</span>
            <span className="text-mute text-[11px] font-mono uppercase tracking-wider">Truth & Decision Platform</span>
          </div>
        </div>
      </div>

      {/* Top Right: Subtle Three Dots Dropdown Menu */}
      <div className="flex items-center gap-2">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger asChild>
            <button
              type="button"
              className="grid h-8 w-8 place-items-center rounded-xl border border-line/60 bg-card/60 text-mute hover:border-violet-400/40 hover:text-frost transition outline-none"
              title="More Options"
            >
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Portal>
            <DropdownMenu.Content
              sideOffset={8}
              align="end"
              className="z-50 min-w-[220px] rounded-2xl border border-line bg-card p-1.5 shadow-2xl backdrop-blur-xl space-y-1"
            >
              {/* Backend Status indicator in dropdown */}
              <div className="px-3 py-2 border-b border-line/50 flex items-center justify-between text-xs">
                <span className="text-mute font-mono">System Status</span>
                <span className={`inline-flex items-center gap-1 font-mono text-[10px] ${
                  backendStatus.online ? 'text-emerald-400' : 'text-violet-300'
                }`}>
                  <span className={`h-1.5 w-1.5 rounded-full ${backendStatus.online ? 'bg-emerald-400 animate-pulse' : 'bg-violet-400'}`} />
                  {backendStatus.online ? 'Backend :8000 Live' : 'Edge Gate Active'}
                </span>
              </div>

              <DropdownMenu.Item
                className="cursor-pointer flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-frost outline-none hover:bg-violet-500/10 hover:text-violet-200 transition"
                onSelect={onRunDemo}
              >
                <Play className="h-3.5 w-3.5 text-violet-300 fill-violet-300" />
                <span>Run Demo Pipeline TX-92831</span>
              </DropdownMenu.Item>

              <DropdownMenu.Item
                className="cursor-pointer flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-frost outline-none hover:bg-violet-500/10 hover:text-violet-200 transition"
                onSelect={onOpenIngest}
              >
                <Plus className="h-3.5 w-3.5 text-violet-300" />
                <span>Ingest Evidence / Document</span>
              </DropdownMenu.Item>

              <DropdownMenu.Item
                className="cursor-pointer flex items-center gap-2.5 rounded-xl px-3 py-2 text-xs text-frost outline-none hover:bg-violet-500/10 hover:text-violet-200 transition"
                onSelect={onOpenCopilot}
              >
                <Bot className="h-3.5 w-3.5 text-violet-300" />
                <span>VERDICT Copilot</span>
              </DropdownMenu.Item>

              <DropdownMenu.Separator className="h-px bg-line/50 my-1" />

              <div className="px-3 py-1.5 text-[10px] font-mono text-mute flex items-center gap-1.5">
                <Zap className="h-3 w-3 text-amber-300" />
                <span>Engine: FastAPI + XGBoost Gate</span>
              </div>
            </DropdownMenu.Content>
          </DropdownMenu.Portal>
        </DropdownMenu.Root>
      </div>
    </header>
  );
}
