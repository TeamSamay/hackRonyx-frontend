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
          'Based on the available evidence, I would not treat a flag as automatic. The fraud model signal is high, but the ledger and IP intelligence disagree on location. That keeps the verdict conflicting until the contradiction is resolved.',
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
          'The notice, police report, garage estimate, and photos are consistent. Evidence looks sufficient to proceed to settlement review. That is not the same as auto-approving payment.',
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
    'I can help you reason through a decision from the evidence you have. Ask about a case, a contradiction, missing information, or what would change a verdict.';

  if (q.includes('flag') || q.includes('fraud') || q.includes('txn')) {
    content =
      'A high fraud signal is not a final verdict. Check whether sources agree on location, device, and identity. If they conflict, the trustworthy state is conflicting and human review is the next step.';
  } else if (q.includes('claim') || q.includes('insurance')) {
    content =
      'For an insurance claim, look for consistency across the first notice, police report, estimate, and photos. If those align, the evidence can support a review. If one source is weak or outdated, ask for more information first.';
  } else if (q.includes('loan') || q.includes('approve')) {
    content =
      'An approval needs a complete file. If audited financials, GST returns, or guarantees are missing, the evidence is incomplete. Pause the decision until those items are verified.';
  } else if (q.includes('missing') || q.includes('need')) {
    content =
      'List what would change the decision, then request those items. Typical gaps are device verification, current KYC, transaction confirmation, or primary documents.';
  } else if (q.includes('contradict') || q.includes('conflict')) {
    content =
      'When two sources disagree, keep both claims visible. Do not average them into a score. Name the conflict type, severity, and why it blocks an automatic conclusion.';
  } else if (q.includes('hello') || q.includes('hi ')) {
    content =
      'Hi. I am VERDICT AI. Ask a decision question and I will help you evaluate the evidence, not invent ground truth.';
  }

  return {
    id: `msg-${Date.now()}`,
    role: 'assistant',
    content,
  };
}

export const quickPrompts = [
  { label: 'Flag a transaction', prompt: 'Should we flag this transaction?' },
  { label: 'Check a claim', prompt: 'Is there enough evidence for this insurance claim?' },
  { label: 'Find contradictions', prompt: 'What contradictions should I look for?' },
];

export const toolCards = [
  {
    id: 'risk',
    title: 'Risk review',
    description: 'Walk through a fraud or transaction decision with evidence checks.',
    action: 'Start review',
    prompt: 'Help me review a suspicious transaction using available evidence.',
  },
  {
    id: 'claim',
    title: 'Claim assessment',
    description: 'Compare claim documents and spot missing or conflicting records.',
    action: 'Assess claim',
    prompt: 'Help me assess an insurance claim for evidence sufficiency.',
  },
  {
    id: 'verdict',
    title: 'Decision packet',
    description: 'Draft a clear verdict, evidence state, and recommended next action.',
    action: 'Draft verdict',
    prompt: 'Draft a decision packet for a case that is currently conflicting.',
  },
];
