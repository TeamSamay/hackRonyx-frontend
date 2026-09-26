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

async function getJson<T>(path: string, init?: RequestInit, timeoutMs = 4000): Promise<T | null> {
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
  const data = await getJson<{ status?: string; service?: string }>('/health', undefined, 2000);
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

export async function testGatewayUrlApi(url: string): Promise<{ success: boolean; url: string; message?: string; details?: any }> {
  const data = await getJson<{ success: boolean; url: string; message?: string; details?: any }>('/api/connectors/gateway-url', {
    method: 'POST',
    body: JSON.stringify({ url }),
  }, 5000);
  if (data) return data;
  return { success: false, url, message: 'Could not communicate with Backend or Gateway server.' };
}

export async function fetchGatewayStatusApi(): Promise<{ success: boolean; url?: string; details?: any; message?: string }> {
  const data = await getJson<any>('/api/connectors/gateway-status', undefined, 3000);
  return data ?? { success: false, message: 'Gateway offline' };
}

export async function switchScenarioApi(scenario: string, caseId: string = 'CASE-TX92831'): Promise<{ success: boolean; decision?: DecisionPacket }> {
  const data = await getJson<any>('/api/connectors/scenario', {
    method: 'POST',
    body: JSON.stringify({ scenario, case_id: caseId }),
  }, 10000);
  return data ?? { success: false };
}

export async function fetchGatewayDocumentsApi(): Promise<{ count: number; documents: Array<{ filename: string; file_type: string; size_bytes: number; download_url?: string }> }> {
  const data = await getJson<any>('/api/connectors/documents', undefined, 4000);
  return data ?? { count: 0, documents: [] };
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

export async function uploadEvidenceFileApi(file: File, caseId: string): Promise<{ success: boolean; evidence_objects?: EvidenceObject[]; message?: string }> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('case_id', caseId);

    const res = await fetch(`${API_BASE_URL}/api/evidence/upload`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, evidence_objects: data.evidence_objects || [] };
    }
    return { success: false, message: `Server returned status ${res.status}` };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Upload failed' };
  }
}

export async function uploadOcrFileApi(file: File, caseId = 'DEFAULT-CASE'): Promise<{
  id: string;
  filename: string;
  file_type: string;
  file_size: number;
  extractedText: string;
  ocrConfidence: number;
  pageCount: number;
} | null> {
  try {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('case_id', caseId);

    const res = await fetch(`${API_BASE_URL}/api/chat/ocr`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      return await res.json();
    }
  } catch (err) {
    console.warn('Backend OCR fallback to local text extraction', err);
  }
  return null;
}

export async function fetchChatThreadsApi(): Promise<any[] | null> {
  return getJson<any[]>('/api/chat/threads', undefined, 3000);
}

export async function sendChatMessageApi(threadId: string, content: string, attachments: any[] = []): Promise<any | null> {
  return getJson<any>(`/api/chat/threads/${encodeURIComponent(threadId)}/messages`, {
    method: 'POST',
    body: JSON.stringify({ content, attachments }),
  }, 15000);
}

export async function deleteChatThreadApi(threadId: string): Promise<boolean> {
  const res = await getJson<any>(`/api/chat/threads/${encodeURIComponent(threadId)}`, { method: 'DELETE' });
  return res != null;
}


