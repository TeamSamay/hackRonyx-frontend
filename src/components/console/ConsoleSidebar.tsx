import {
  Bot,
  Briefcase,
  FileSearch,
  Gavel,
  LayoutDashboard,
  Menu,
  Plug,
  ShieldCheck,
  Swords,
  UserCheck,
  X,
} from 'lucide-react';
import { motion } from 'motion/react';
import { AnimatedOrb } from '@/components/chat/AnimatedOrb';
import { springSnappy, springSoft } from '@/lib/motion';
import { cn } from '@/lib/utils';
import type { ConsoleSection, VerdictCase } from '@/types/verdict';
import { TRUST_STATE_META } from '@/types/verdict';

const primaryNavGroup1: Array<{ id: ConsoleSection; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'overview', label: 'Console Overview', icon: LayoutDashboard },
  { id: 'cases', label: 'Cases & Evidence', icon: Briefcase },
  { id: 'connectors', label: 'Ingestion Connectors', icon: Plug },
];

const primaryNavGroup2: Array<{ id: ConsoleSection; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'decisions', label: 'Decision Gate (6 States)', icon: Gavel },
  { id: 'challenge', label: 'Challenge Engine', icon: Swords },
  { id: 'reviews', label: 'Human Analyst Review', icon: UserCheck },
];

const primaryNavGroup3: Array<{ id: ConsoleSection; label: string; icon: typeof LayoutDashboard }> = [
  { id: 'demo', label: 'Demo TX-92831', icon: ShieldCheck },
  { id: 'copilot', label: 'VERDICT Copilot', icon: Bot },
];

export function ConsoleSidebar({
  open,
  onClose,
  section,
  onSectionChange,
  cases,
  activeCaseId,
  onSelectCase,
}: {
  open: boolean;
  onClose: () => void;
  section: ConsoleSection;
  onSectionChange: (section: ConsoleSection) => void;
  cases: VerdictCase[];
  activeCaseId: string;
  onSelectCase: (caseId: string) => void;
}) {
  const renderNavGroup = (items: typeof primaryNavGroup1) => (
    <nav className="space-y-1">
      {items.map((item) => {
        const Icon = item.icon;
        const active = section === item.id;
        return (
          <motion.button
            key={item.id}
            type="button"
            whileHover={{ x: 2 }}
            whileTap={{ scale: 0.98 }}
            transition={springSnappy}
            onClick={() => {
              onSectionChange(item.id);
              onClose();
            }}
            className={cn(
              'relative flex w-full items-center gap-3 rounded-xl px-3 py-2 text-left text-xs font-medium transition-colors',
              active ? 'text-frost font-semibold' : 'text-mute hover:text-frost hover:bg-white/[0.03]',
            )}
          >
            {active ? (
              <motion.span
                layoutId="console-nav-active"
                className="absolute inset-0 rounded-xl bg-violet-500/15 border border-violet-400/30"
                transition={springSoft}
              />
            ) : null}
            <Icon className={cn('relative z-[1] h-4 w-4', active ? 'text-violet-300' : 'text-mute')} />
            <span className="relative z-[1] truncate">{item.label}</span>
          </motion.button>
        );
      })}
    </nav>
  );

  return (
    <aside
      className={cn(
        'absolute inset-y-0 left-0 z-40 flex w-[260px] shrink-0 -translate-x-full flex-col border-r border-line bg-sidebar/95 backdrop-blur-xl transition-transform duration-200 sm:static sm:translate-x-0',
        open && 'translate-x-0',
      )}
    >
      <div className="flex items-center justify-between gap-3 px-4 pb-3 pt-4 border-b border-line/60">
        <div className="flex items-center gap-3">
          <AnimatedOrb size="sm" />
          <div>
            <div className="text-sm font-bold tracking-wider text-frost">VERDICT AI</div>
            <div className="text-[10px] uppercase tracking-widest text-violet-300/80 font-mono">Truth Engine</div>
          </div>
        </div>
        <button type="button" className="rounded-lg p-1 text-mute hover:text-frost sm:hidden" onClick={onClose} aria-label="Close">
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4 space-y-5">
        <div>
          <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-mute">Core Ingestion & Storage</p>
          {renderNavGroup(primaryNavGroup1)}
        </div>

        <div>
          <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-mute">Deterministic Intelligence</p>
          {renderNavGroup(primaryNavGroup2)}
        </div>

        <div>
          <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-mute">Live Demo & Copilot</p>
          {renderNavGroup(primaryNavGroup3)}
        </div>

        <div className="pt-2 border-t border-line/40">
          <p className="px-2 pb-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-mute">Active Fraud Cases</p>
          <div className="space-y-1">
            {cases.map((item) => {
              const meta = item.trust_status ? TRUST_STATE_META[item.trust_status] : null;
              const isActive = activeCaseId === item.case_id;
              return (
                <motion.button
                  key={item.case_id}
                  type="button"
                  whileHover={{ x: 2 }}
                  transition={springSnappy}
                  onClick={() => {
                    onSelectCase(item.case_id);
                    onSectionChange('cases');
                    onClose();
                  }}
                  className={cn(
                    'relative w-full rounded-xl px-3 py-2 text-left transition-colors',
                    isActive ? 'bg-violet-500/10 border border-violet-400/30 text-frost' : 'text-mute hover:text-frost hover:bg-white/[0.02]',
                  )}
                >
                  <div className="flex items-start gap-2">
                    <FileSearch className={cn("mt-0.5 h-3.5 w-3.5 shrink-0", isActive ? "text-violet-300" : "text-mute")} />
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-xs font-medium text-frost">{item.entity_id}</div>
                      <div className="truncate text-[10px] text-mute">{item.title}</div>
                      {meta ? (
                        <span className={cn('mt-1 inline-flex rounded-full border px-1.5 py-0.2 text-[9px] font-mono', meta.tone)}>
                          {meta.label}
                        </span>
                      ) : null}
                    </div>
                  </div>
                </motion.button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-line/60 p-3 bg-card/40">
        <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3">
          <div className="flex items-center gap-2 text-xs font-semibold text-frost">
            <ShieldCheck className="h-4 w-4 text-violet-300" />
            Decision Gate
          </div>
          <p className="mt-1 text-[10px] leading-relaxed text-mute font-sans">
            6 Strict Final Trust States. Deterministic Python logic — LLM reasoning cannot override.
          </p>
        </div>
      </div>
    </aside>
  );
}

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="inline-flex items-center gap-2 rounded-xl border border-line bg-card px-3 py-2 text-xs text-frost sm:hidden"
    >
      <Menu className="h-4 w-4" />
      Navigation
    </button>
  );
}
