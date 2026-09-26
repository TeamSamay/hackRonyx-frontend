import type {
  ConnectorConfig,
  DecisionPacket,
  EvidenceObject,
  ReviewAction,
  SourceType,
  VerdictCase,
} from '@/types/verdict';
import { demoDecision, mockCases, mockConnectors } from '@/data/verdict';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8000';

async function getJson<T>(path: string, init?: RequestInit, timeoutMs = 2500): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        ...(init?.body ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function checkBackendHealth(): Promise<{ online: boolean; message: string }> {
  const data = await getJson<{ status?: string; service?: string }>('/health', undefined, 1500);
  if (data?.status) {
    return { online: true, message: `${data.service ?? 'FastAPI'} · ${data.status}` };
  }
  return { online: false, message: 'Edge Simulation Mode' };
}

export async function triggerDemoSeedTX92831(): Promise<DecisionPacket> {
  const data = await getJson<DecisionPacket>('/api/demo/seed-tx92831', { method: 'POST' }, 15000);
  return data ?? demoDecision;
}

export async function fetchCases(): Promise<VerdictCase[]> {
  const data = await getJson<{ total: number; cases: VerdictCase[] } | VerdictCase[]>('/api/cases');
  if (!data) return mockCases;
  if (Array.isArray(data)) return data.length > 0 ? data : mockCases;
  return data.cases?.length ? data.cases : mockCases;
}

export async function fetchCaseDecision(caseId: string): Promise<DecisionPacket | null> {
  return getJson<DecisionPacket>(`/api/cases/${encodeURIComponent(caseId)}/decision`, undefined, 12000);
}

export async function fetchCaseEvidence(caseId: string): Promise<EvidenceObject[]> {
  const data = await getJson<EvidenceObject[]>(`/api/cases/${encodeURIComponent(caseId)}/evidence`);
  return data ?? [];
}

export async function runCaseAnalysis(caseId: string): Promise<DecisionPacket | null> {
  return getJson<DecisionPacket>(`/api/cases/${encodeURIComponent(caseId)}/analyze`, { method: 'POST' }, 20000);
}

export async function runCaseChallenge(caseId: string): Promise<DecisionPacket['challenge'] | null> {
  return getJson<DecisionPacket['challenge']>(
    `/api/cases/${encodeURIComponent(caseId)}/challenge`,
    { method: 'POST' },
    12000,
  );
}

export async function submitCaseReview(
  caseId: string,
  payload: { reviewer_name: string; action_taken: ReviewAction; notes?: string },
): Promise<boolean> {
  const data = await getJson<unknown>(`/api/cases/${encodeURIComponent(caseId)}/review`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data != null;
}

export async function fetchConnectors(): Promise<ConnectorConfig[]> {
  const data = await getJson<ConnectorConfig[]>('/api/connectors');
  return data && data.length > 0 ? data : mockConnectors;
}

/** Maps console form → POST /api/evidence/manual (EvidenceCreateRequest). */
export async function ingestEvidenceApi(
  evidence: Partial<EvidenceObject>,
): Promise<{ success: boolean; evidence: EvidenceObject }> {
  const fallback: EvidenceObject = {
    evidence_id: evidence.evidence_id || `E-${Math.floor(100 + Math.random() * 900)}`,
    case_id: evidence.case_id || 'CASE-TX92831',
    source: evidence.source || { type: 'MANUAL', system: 'ANALYST_CONSOLE', reference: 'manual_entry' },
    claim: evidence.claim || {
      subject: 'ENTITY',
      predicate: 'claim_attribute',
      value: 'Value',
      confidence: 0.95,
    },
    quality: evidence.quality || {
      reliability: 'HIGH',
      freshness: 'CURRENT',
      completeness: 1,
      overall_quality: 'HIGH',
    },
    traceability: evidence.traceability || { record_id: `REC-${Date.now()}` },
  };

  const body = {
    case_id: fallback.case_id,
    source_type: (fallback.source.type || 'MANUAL') as SourceType,
    source_system: fallback.source.system ?? 'Manual Ingestion',
    claim_subject: fallback.claim.subject,
    claim_predicate: fallback.claim.predicate,
    claim_value: fallback.claim.value,
    reliability: fallback.quality.reliability,
    freshness: fallback.quality.freshness,
    traceability: fallback.traceability,
  };

  const data = await getJson<EvidenceObject>('/api/evidence/manual', {
    method: 'POST',
    body: JSON.stringify(body),
  });

  if (data?.evidence_id) {
    return { success: true, evidence: data };
  }

  return { success: true, evidence: fallback };
}
