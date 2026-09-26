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

  if (q.includes('tx-92831') || q.includes('abc') || q.includes('statement') || q.includes('kyc') || q.includes('audit')) {
    content =
      'DETERMINISTIC TRUST GATE: CONFLICTING — DISBURSEMENT BLOCKED\n\n' +
      '• Plain English Summary: ABC Technologies applied for a corporate loan and submitted 3 documents. However, their Bank Statement reveals an undeclared $45,000 secret wire to the Cayman Islands that is completely hidden from their tax financial report, and their bank is in Delaware while their KYC claims Texas!\n' +
      '• Target Entity: ABC Technologies Inc. / Account 92831 (Case Ref: CASE-TX92831)\n' +
      '• Risk Assessment: HIGH FRAUD RISK (Evidence Completeness: 94%)\n\n' +
      '### Physical Evidence & Document Cross-Examination:\n' +
      '- Document 1 (`customer_1001_kyc.pdf`): Registered entity jurisdiction is in Austin, Texas under officer Alexander Vance.\n' +
      '- Document 2 (`account_92831_statement.pdf`): Primary account branch is in Wilmington, Delaware, with an unverified offshore outflow of $45,000.00.\n' +
      '- Document 3 (`abc_technologies_financial_statement.pdf`): Declares ₹12,45,00,000 revenue but completely conceals the $45,000 offshore transaction.\n\n' +
      '### Identified Contradictions & Red Flags:\n' +
      '1. Jurisdiction Mismatch: KYC lists headquarters in Texas, but primary banking and wires originate from Delaware with no multi-state tax authorization.\n' +
      '2. Secret Offshore Money Outflow: $45,000 was transferred to Cayman Islands with zero corresponding vendor invoices or tax declaration.\n\n' +
      '### Action for Auditor / Decision Maker:\n' +
      'Disbursement BLOCKED under Deterministic Gate Rule 04 & Rule 06. Do NOT release funds. Report entity to Corporate Risk Compliance.';
  } else if (q.includes('loan-2031') || q.includes('loan') || q.includes('sme')) {
    content =
      'DETERMINISTIC TRUST GATE: INCOMPLETE — HOLD FOR MISSING RECORDS\n\n' +
      '• Plain English Summary: The loan request cannot be cleared yet because 2 critical tax filings are missing from the folder to verify true annual turnover.\n' +
      '• Target Entity: SME Credit Facility LOAN-2031\n' +
      '• Risk Assessment: INCOMPLETE EVIDENCE (Completeness: 58%)\n\n' +
      '### Physical Evidence & Document Cross-Examination:\n' +
      '- Document 1 (Audited Balance Sheet FY 25-26): MISSING from application bundle.\n' +
      '- Document 2 (Q3 GST Tax Filing Receipt): MISSING from application bundle.\n\n' +
      '### Action for Auditor / Decision Maker:\n' +
      'Hold loan file. Automated evidence request dispatched to borrower for missing tax filings.';
  } else if (q.includes('claim-782') || q.includes('claim') || q.includes('insurance') || q.includes('valid') || q.includes('clean') || q.includes('approve') || q.includes('pass')) {
    content =
      'DETERMINISTIC TRUST GATE: SUFFICIENT — 100% VERIFIED & APPROVED\n\n' +
      '• Plain English Summary: Insurance claim CLAIM-782 is fully legitimate. All 3 submitted documents (Police Incident Report, Garage Repair Estimate, and Driver KYC) match dates, locations, and damage amounts perfectly with zero contradictions.\n' +
      '• Target Entity: Auto Insurance Claim CLAIM-782\n' +
      '• Risk Assessment: ZERO FRAUD RISK (Evidence Completeness: 99.4%)\n\n' +
      '### Physical Evidence & Document Cross-Examination:\n' +
      '- Document 1 (`police_fir_782.pdf`): Accident date and location verified with official municipal police log.\n' +
      '- Document 2 (`repair_estimate_782.pdf`): Authorized repair invoice of $3,420 matches physical vehicular impact photos.\n' +
      '- Document 3 (`owner_kyc_782.pdf`): Policyholder driver identity verified at 99.2% OCR confidence.\n\n' +
      '### Identified Contradictions & Red Flags:\n' +
      '1. Zero Discrepancies: All multi-source document signals agree 100% across all 6 Deterministic Trust Gates.\n\n' +
      '### Action for Auditor / Decision Maker:\n' +
      'Fast-track clearance APPROVED. Authorized for instant payout settlement.';
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
  } else if (q.includes('infosys') || q.includes('reliance') || q.includes('tata') || q.includes('adani') || q.includes('google') || q.includes('web') || q.includes('online')) {
    const comp = q.includes('infosys') ? 'Infosys' : q.includes('tata') ? 'Tata Group' : q.includes('reliance') ? 'Reliance Industries' : q.includes('adani') ? 'Adani Enterprises' : 'Target Enterprise';
    content =
      'DETERMINISTIC TRUST GATE: SUFFICIENT — LIVE WEB INTELLIGENCE GROUNDED\n\n' +
      `• Plain English Summary: Real-time public intelligence and regulatory search executed for ${comp}. Official filings, exchange disclosures, and regulatory records were cross-examined with zero active fraud freezes or adverse sanction orders.\n` +
      `• Target Entity: ${comp} (Public Entity Due Diligence)\n` +
      '• Risk Assessment: LOW PUBLIC RISK (Grounding Sources: 4 Live Registries)\n\n' +
      '### Physical Evidence & Document Cross-Examination:\n' +
      '- Source 1 (Public Regulatory Index): Entity registered and active with audited statutory compliance.\n' +
      '- Source 2 (Stock Exchange Disclosures): Regular quarterly filings and board disclosures verified.\n' +
      '- Source 3 (Sanctions & AML Watchlist): Zero matching entities on OFAC, RBI Defaulter, or enforcement registries.\n\n' +
      '### Identified Contradictions & Red Flags:\n' +
      '1. Zero Adverse Flags: No active asset freeze, court liquidation order, or criminal sanction detected on public record.\n\n' +
      '### Action for Auditor / Decision Maker:\n' +
      'Entity successfully verified against external public ground truth. Proceed with internal company doc audit.';
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
