import type { ChatMessage, ChatThread } from '@/types/chat';

const now = () => new Date().toISOString();

export const starterThreads: ChatThread[] = [
  {
    id: 'thread-1',
    title: 'Should we flag TXN-1042?',
    updatedAt: '2026-09-26T14:20:00+05:30',
    messages: [
      {
        id: 'm1',
        role: 'user',
        content: 'Should we flag transaction TXN-1042?',
      },
      {
        id: 'm2',
        role: 'assistant',
        content:
          '⚖️ **TRUST STATE: CONFLICTING → HUMAN_REVIEW**\n\n- **XGBoost Fraud Risk:** 91%\n- **Isolation Forest Anomaly:** 84%\n- **Contradiction Alert:** Core Banking places transaction in **Mumbai** (E001, ₹85,000) while Device Telemetry places iPhone in **Delhi** (E002).\n- **Deterministic Decision Gate:** Auto-approval blocked. Routed to human audit log. LLM reasoning cannot bypass this gate.',
      },
    ],
  },
  {
    id: 'thread-2',
    title: 'Insurance claim CLAIM-782',
    updatedAt: '2026-09-26T11:05:00+05:30',
    messages: [
      {
        id: 'm3',
        role: 'user',
        content: 'Is there enough evidence to approve CLAIM-782?',
      },
      {
        id: 'm4',
        role: 'assistant',
        content:
          '✅ **TRUST STATE: SUFFICIENT → APPROVE / PROCEED**\n\n- **Evidence Quality:** HIGH (98% completeness)\n- **Traceability:** Police Report, Garage Estimate, and Identity OCR (96%) agree.\n- **Contradictions:** 0 conflicts detected across 5 evidence objects.\n- **Gate Status:** Sufficient evidence to proceed to settlement review.',
      },
    ],
  },
  {
    id: 'thread-3',
    title: 'SME Credit Review LOAN-2031',
    updatedAt: '2026-09-26T09:12:00+05:30',
    messages: [
      {
        id: 'm5',
        role: 'user',
        content: 'What is the status of LOAN-2031 credit facility?',
      },
      {
        id: 'm6',
        role: 'assistant',
        content:
          '⚠️ **TRUST STATE: INCOMPLETE → REQUEST_DATA**\n\n- **Completeness:** 58%\n- **Missing Information:** Audited GST Returns for Q3 & Company Financial Statement PDF.\n- **Action Taken:** Automated evidence request dispatched to client connector.',
      },
    ],
  },
];

export function createEmptyThread(): ChatThread {
  return {
    id: `thread-${Date.now()}`,
    title: 'New chat',
    updatedAt: now(),
    messages: [],
  };
}

export function replyTo(prompt: string): ChatMessage {
  const q = prompt.toLowerCase();
  let content =
    'I can help you evaluate a decision from authorized evidence objects. Ask about a transaction, claim, contradiction, or missing signal.';

  if (q.includes('tx-92831') || q.includes('txn-1042') || (q.includes('flag') && q.includes('transaction'))) {
    content =
      '⚖️ **DETERMINISTIC GATE RESULT: CONFLICTING → HUMAN_REVIEW**\n\n' +
      '• **XGBoost Fraud Risk:** 91% | **Anomaly Score:** 84%\n' +
      '• **SHAP Breakdown:** Location mismatch (+0.34), Amount velocity (+0.28)\n' +
      '• **Contradiction Detected:** Core Banking (E001) branch terminal = Mumbai (₹85,000) ≠ Device Telemetry (E002) IP location = Delhi.\n' +
      '• **Decision Gate Policy:** Automatic approval blocked. Python gate enforces CONFLICTING state. LLM reasoning cannot bypass.';
  } else if (q.includes('loan-2031') || q.includes('loan') || q.includes('sme')) {
    content =
      '⚠️ **DETERMINISTIC GATE RESULT: INCOMPLETE → REQUEST_DATA**\n\n' +
      '• **Completeness:** 58%\n' +
      '• **Missing Signals:** Audited Financial Statements & Q3 GST Tax Filing.\n' +
      '• **Next Step:** Issuing automated evidence request packet to Edge Gateway connector.';
  } else if (q.includes('claim-782') || q.includes('claim') || q.includes('insurance')) {
    content =
      '✅ **DETERMINISTIC GATE RESULT: SUFFICIENT → APPROVE / PROCEED**\n\n' +
      '• **Evidence Quality:** HIGH (Completeness: 98%)\n' +
      '• **Traceability:** 5 verified objects (Police Report, Repair Estimate, OCR identity 96%).\n' +
      '• **Contradictions:** 0 clashes detected. Cleared for settlement review.';
  } else if (q.includes('demo') || q.includes('tx92831') || q.includes('seed')) {
    content =
      '🎯 **DEMO TX-92831 PIPELINE TRIGGERED:**\n\n' +
      '1. Ingested E001 (Core Banking: Mumbai, ₹85,000)\n' +
      '2. Ingested E002 (Device Telemetry: Delhi)\n' +
      '3. Ingested E003 (KYC Record: Mumbai, OCR 96%)\n' +
      '4. Ingested E004 (Account History: Mumbai)\n' +
      '5. XGBoost (91%) + Isolation Forest (84%) + SHAP calculated\n' +
      '6. Deterministic Contradiction: Mumbai ≠ Delhi flagged\n' +
      '7. Enforced CONFLICTING trust state → Routed to Human Analyst Review.';
  } else if (q.includes('missing') || q.includes('need')) {
    content =
      '🔍 **MISSING INFORMATION DETECTOR:**\n\n' +
      'To move a case from INCOMPLETE or NEED_MORE_INFO to SUFFICIENT, VERDICT requires:\n' +
      '1. Primary SIM binding / Device attestation\n' +
      '2. High-confidence OCR document scan (>85%)\n' +
      '3. Authorized Edge Gateway database confirmation';
  } else if (q.includes('contradict') || q.includes('conflict')) {
    content =
      '🚨 **DETERMINISTIC CONTRADICTION ENGINE:**\n\n' +
      'When two evidence objects conflict (e.g. Bank location Mumbai vs Telemetry Delhi), the engine does NOT average them into a score.\n' +
      'It flags a CRITICAL contradiction and locks the Decision Gate in CONFLICTING state.';
  } else if (q.includes('hello') || q.includes('hi')) {
    content =
      'Hello! I am **VERDICT AI**, your truth verification & decision intelligence platform. Ask me about a fraud case, claim assessment, or evidence contradiction.';
  }

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content,
  };
}

export const quickPrompts = [
  { label: 'Flag a transaction', prompt: 'Should we flag transaction TX-92831?' },
  { label: 'Check a claim', prompt: 'Is there enough evidence for CLAIM-782?' },
  { label: 'Find contradictions', prompt: 'What contradictions were found in Case TX-92831?' },
];

export const toolCards = [
  {
    id: 'risk',
    title: 'Risk review',
    description: 'Walk through a fraud or transaction decision with evidence checks.',
    action: 'Start review',
    prompt: 'Should we flag transaction TX-92831?',
    accent: 'purple' as const,
  },
  {
    id: 'claim',
    title: 'Claim assessment',
    description: 'Compare claim documents and spot missing or conflicting records.',
    action: 'Assess claim',
    prompt: 'Is there enough evidence for CLAIM-782?',
    accent: 'blue' as const,
  },
  {
    id: 'verdict',
    title: 'Decision packet',
    description: 'Draft a clear verdict, evidence state, and recommended next action.',
    action: 'Draft verdict',
    prompt: 'Show me the canonical Decision Packet for Case TX-92831.',
    accent: 'green' as const,
  },
];

export type AnalysisTone = 'danger' | 'warning' | 'success' | 'info';

export interface RecentAnalysis {
  id: string;
  caseId: string;
  status: string;
  summary: string;
  when: string;
  tone: AnalysisTone;
  prompt: string;
}

export const recentAnalyses: RecentAnalysis[] = [
  {
    id: 'ra-1',
    caseId: 'TX-92831',
    status: 'Conflicting',
    summary: 'Core Banking Mumbai ≠ Telemetry Delhi location clash.',
    when: '2 mins ago',
    tone: 'danger',
    prompt: 'Should we flag transaction TX-92831?',
  },
  {
    id: 'ra-2',
    caseId: 'LOAN-2031',
    status: 'Incomplete',
    summary: 'Audited financials and GST returns missing.',
    when: '18 mins ago',
    tone: 'warning',
    prompt: 'What is missing in LOAN-2031?',
  },
  {
    id: 'ra-3',
    caseId: 'CLAIM-782',
    status: 'Sufficient',
    summary: 'Police report and repair estimates agree.',
    when: '1 hr ago',
    tone: 'success',
    prompt: 'Is CLAIM-782 ready for settlement review?',
  },
  {
    id: 'ra-4',
    caseId: 'DEMO-TX92831',
    status: '1-Click Demo',
    summary: 'Full end-to-end evidence ingestion and gate test.',
    when: 'Live',
    tone: 'info',
    prompt: 'Run 1-click hackathon demo TX-92831',
  },
];
