import type { CaseResponse, DecisionPacket, EvidenceObject } from '@/types/verdict';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

export async function checkBackendHealth(): Promise<{
  online: boolean;
  service?: string;
  version?: string;
  deterministic_rules?: number;
}> {
  try {
    const res = await fetch(`${API_BASE_URL}/health`, { method: 'GET' });
    if (!res.ok) return { online: false };
    const data = await res.json();
    return { online: true, ...data };
  } catch {
    return { online: false };
  }
}

export async function getCases(): Promise<CaseResponse[]> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/cases`, { method: 'GET' });
    if (!res.ok) throw new Error('Failed to fetch cases');
    const data = await res.json();
    return data.cases || [];
  } catch (err) {
    console.warn('API error fetching cases, fallback empty:', err);
    return [];
  }
}

export async function seedDemoTX92831(): Promise<DecisionPacket> {
  const res = await fetch(`${API_BASE_URL}/api/demo/seed-tx92831`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
  });
  if (!res.ok) throw new Error('Failed to seed demo TX92831');
  return await res.json();
}

export async function analyzeCase(caseId: string, focusQuery?: string): Promise<DecisionPacket> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}/analyze`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ case_id: caseId, focus_query: focusQuery }),
  });
  if (!res.ok) throw new Error(`Failed to analyze case ${caseId}`);
  return await res.json();
}

export async function getCaseDecision(caseId: string): Promise<DecisionPacket> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}/decision`, {
    method: 'GET',
  });
  if (!res.ok) throw new Error(`Failed to fetch decision for ${caseId}`);
  return await res.json();
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

export async function submitHumanReview(
  caseId: string,
  reviewerName: string,
  actionTaken: string,
  notes?: string
): Promise<any> {
  const res = await fetch(`${API_BASE_URL}/api/cases/${caseId}/review`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ reviewer_name: reviewerName, action_taken: actionTaken, notes }),
  });
  if (!res.ok) throw new Error('Failed to submit review');
  return await res.json();
}

export async function askVerdictAI(prompt: string, currentCaseId?: string): Promise<{
  text: string;
  decision?: DecisionPacket | null;
}> {
  try {
    // If asking about a specific case or general fraud review, run analysis
    const targetCaseId = currentCaseId || (prompt.toLowerCase().includes('tx') ? 'CASE-TX92831' : 'CASE-TX92831');
    
    // Check if backend online
    const health = await checkBackendHealth();
    if (!health.online) {
      return {
        text: `⚠️ Backend is currently offline at ${API_BASE_URL}. Please start FastAPI using 'uvicorn app.main:app --reload' on port 8000.`,
      };
    }

    // Call analyze
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
