import type {
  CaseResponse,
  ConnectorConfig,
  DecisionPacket,
  EvidenceObject,
  ReviewAction,
  SourceType,
  VerdictCase,
} from '@/types/verdict';
import { demoDecision, mockCases, mockConnectors } from '@/data/verdict';

const API_BASE_URL = import.meta.env.VITE_API_URL || import.meta.env.VITE_API_BASE_URL || '';

async function getJson<T>(path: string, init?: RequestInit, timeoutMs = 6000): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      signal: AbortSignal.timeout(timeoutMs),
      headers: {
        ...(init?.body && !(init.body instanceof FormData) ? { 'Content-Type': 'application/json' } : {}),
        ...init?.headers,
      },
    });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch {
    return null;
  }
}

export async function checkBackendHealth(): Promise<{
  online: boolean;
  message: string;
  service?: string;
  version?: string;
  deterministic_rules?: number;
}> {
  try {
    const data = await getJson<{ status?: string; service?: string; version?: string; deterministic_rules?: number }>('/health', undefined, 2000);
    if (data) {
      return { online: true, message: `${data.service ?? 'FastAPI'} · ${data.status ?? 'OK'}`, ...data };
    }
  } catch {
    // fallback
  }
  return { online: false, message: 'Edge Simulation Mode' };
}

export async function seedDemoTX92831(): Promise<DecisionPacket> {
  const data = await getJson<DecisionPacket>('/api/demo/seed-tx92831', { method: 'POST' }, 15000);
  return data ?? demoDecision;
}

export const triggerDemoSeedTX92831 = seedDemoTX92831;

export async function getCases(): Promise<CaseResponse[]> {
  const data = await getJson<{ total: number; cases: CaseResponse[] } | CaseResponse[]>('/api/cases');
  if (!data) return [];
  if (Array.isArray(data)) return data;
  return data.cases || [];
}

export async function fetchCases(): Promise<VerdictCase[]> {
  const data = await getJson<{ total: number; cases: VerdictCase[] } | VerdictCase[]>('/api/cases');
  if (!data) return mockCases;
  if (Array.isArray(data)) return data.length > 0 ? data : mockCases;
  return data.cases?.length ? data.cases : mockCases;
}

export async function analyzeCase(caseId: string, focusQuery?: string): Promise<DecisionPacket> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${encodeURIComponent(caseId)}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ case_id: caseId, focus_query: focusQuery }),
  });
  if (!res.ok) throw new Error(`Failed to analyze case ${caseId}`);
  return await res.json();
}

export const runCaseAnalysis = async (caseId: string): Promise<DecisionPacket | null> => {
  return getJson<DecisionPacket>(`/api/cases/${encodeURIComponent(caseId)}/analyze`, { method: 'POST' }, 20000);
};

export async function getCaseDecision(caseId: string): Promise<DecisionPacket> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${encodeURIComponent(caseId)}/decision`, {
    method: 'GET',
  });
  if (!res.ok) throw new Error(`Failed to fetch decision for ${caseId}`);
  return await res.json();
}

export const fetchCaseDecision = async (caseId: string): Promise<DecisionPacket | null> => {
  return getJson<DecisionPacket>(`/api/cases/${encodeURIComponent(caseId)}/decision`, undefined, 12000);
};

export async function fetchCaseEvidence(caseId: string): Promise<EvidenceObject[]> {
  const data = await getJson<EvidenceObject[]>(`/api/cases/${encodeURIComponent(caseId)}/evidence`);
  return data ?? [];
}

export const getCaseEvidenceApi = fetchCaseEvidence;

export async function runCaseChallenge(caseId: string): Promise<DecisionPacket['challenge'] | null> {
  return getJson<DecisionPacket['challenge']>(
    `/api/cases/${encodeURIComponent(caseId)}/challenge`,
    { method: 'POST' },
    12000,
  );
}

export async function submitHumanReview(
  caseId: string,
  reviewerName: string,
  actionTaken: string,
  notes?: string
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${encodeURIComponent(caseId)}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewer_name: reviewerName, action_taken: actionTaken, notes }),
  });
  if (!res.ok) throw new Error('Failed to submit review');
  return await res.json();
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

export async function uploadEvidenceFile(caseId: string, file: File): Promise<{
  status: string;
  document_id: string;
  evidence_count: number;
  evidence_objects: EvidenceObject[];
}> {
  const formData = new FormData();
  formData.append('case_id', caseId);
  formData.append('file', file);

  const res = await fetch(`${API_BASE_URL}/api/evidence/upload`, {
    method: 'POST',
    body: formData,
  });

  if (!res.ok) throw new Error('File upload failed');
  return await res.json();
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
    return { success: false, message: err?.message || 'File upload failed' };
  }
}

export async function uploadMultipleEvidenceFilesApi(
  files: File[],
  caseId: string
): Promise<{ success: boolean; documents?: any[]; evidence_objects?: EvidenceObject[]; message?: string }> {
  try {
    const formData = new FormData();
    files.forEach((f) => formData.append('files', f));
    formData.append('case_id', caseId);

    const res = await fetch(`${API_BASE_URL}/api/evidence/upload-multiple`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      return {
        success: true,
        documents: data.documents || [],
        evidence_objects: data.evidence_objects || [],
      };
    }
    return { success: false, message: `Server error: ${res.statusText}` };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Multi-upload failed' };
  }
}

export async function fetchCaseDocumentsApi(caseId: string): Promise<any[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cases/${encodeURIComponent(caseId)}/documents`);
    if (res.ok) {
      const data = await res.json();
      return data.documents || [];
    }
  } catch (err) {
    console.warn('Failed to fetch case documents from backend', err);
  }
  return [];
}

export async function searchWebEvidenceApi(
  query: string,
  caseId = 'CASE-TX92831'
): Promise<{ success: boolean; evidence_objects?: EvidenceObject[]; message?: string }> {
  try {
    const formData = new FormData();
    formData.append('query', query);
    formData.append('case_id', caseId);

    const res = await fetch(`${API_BASE_URL}/api/evidence/search-web`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, evidence_objects: data.evidence_objects || [] };
    }
    return { success: false, message: 'Web search ingestion returned error' };
  } catch (err: any) {
    return { success: false, message: err?.message || 'Web search failed' };
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

export async function askVerdictAI(
  prompt: string,
  currentCaseId?: string,
  threadId: string = 'thread-1',
  attachments: any[] = [],
): Promise<{
  text: string;
  decision?: DecisionPacket | null;
}> {
  try {
    const health = await checkBackendHealth();
    if (!health.online) {
      return {
        text: `⚠️ Backend is currently offline at ${API_BASE_URL}. Please start FastAPI using 'uvicorn app.main:app --reload' on port 8000.`,
      };
    }

    // 1. Try Live Chat API (Groq LLM + Real-Time Web Search + Document Context)
    try {
      const chatRes = await sendChatMessageApi(threadId, prompt, attachments);
      if (chatRes && chatRes.botMessage && chatRes.botMessage.content) {
        let decision: DecisionPacket | null = null;
        if (currentCaseId || prompt.toLowerCase().includes('tx') || prompt.toLowerCase().includes('case')) {
          decision = await fetchCaseDecision(currentCaseId || 'CASE-TX92831').catch(() => null);
        }
        return {
          text: chatRes.botMessage.content,
          decision,
        };
      }
    } catch {
      // fallback to rule-based analyzeCase
    }

    const targetCaseId = currentCaseId || (prompt.toLowerCase().includes('tx') ? 'CASE-TX92831' : 'CASE-TX92831');
    const decision = await analyzeCase(targetCaseId, prompt);
    
    const contradictionNote =
      decision.contradictions.length > 0
        ? `\n\n🚨 **Contradiction Detected:** ${decision.contradictions[0].description}`
        : '';

    const missingNote =
      decision.missing_information.length > 0
        ? `\n\n🔍 **Missing Information:** ${decision.missing_information[0].item} (${decision.missing_information[0].reason})`
        : '';

    const challengeNote =
      decision.challenge?.performed
        ? `\n\n🛡️ **Challenge Engine:** ${decision.challenge.challenge_summary}`
        : '';

    const reply = `**VERDICT Authority Result for ${decision.case_id}:**\n\n` +
      `• **Trust Status:** \`${decision.trust_status}\`\n` +
      `• **ML Fraud Risk:** \`${(decision.fraud_model.risk_score * 100).toFixed(1)}%\` (${decision.fraud_model.model})\n` +
      `• **Evidence Quality:** \`${decision.evidence_quality}\` | **Completeness:** \`${(decision.completeness * 100).toFixed(0)}%\`\n` +
      `• **Recommendation:** \`${decision.recommendation}\`\n\n` +
      `**Reasoning:**\n${decision.reasoning}` +
      contradictionNote +
      missingNote +
      challengeNote;

    return { text: reply, decision };
  } catch (err: any) {
    return {
      text: `Error contacting VERDICT Backend: ${err.message || 'Unknown network error'}. Ensure FastAPI is running on http://localhost:8000.`,
    };
  }
}

export async function syncRemoteVaultApi(vaultUrl: string, caseId: string = 'CASE-TX92831'): Promise<{
  success: boolean;
  message?: string;
  files_synced?: number;
  documents?: any[];
  evidence_count?: number;
  error?: string;
}> {
  try {
    const formData = new FormData();
    formData.append('vault_url', vaultUrl);
    formData.append('case_id', caseId);

    const res = await fetch(`${API_BASE_URL}/api/evidence/remote-vault/sync`, {
      method: 'POST',
      body: formData,
    });
    if (res.ok) {
      const data = await res.json();
      return { success: true, ...data };
    } else {
      const err = await res.json().catch(() => ({}));
      return { success: false, error: err.detail || 'Failed to connect to remote vault' };
    }
  } catch (err: any) {
    return { success: false, error: err.message || 'Network error connecting to remote vault' };
  }
}

