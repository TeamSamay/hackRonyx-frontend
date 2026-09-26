export type TrustStatus =
  | 'SUFFICIENT'
  | 'INCOMPLETE'
  | 'CONFLICTING'
  | 'LOW_QUALITY'
  | 'NEED_MORE_INFO'
  | 'REFUSE';

export type RecommendationAction =
  | 'APPROVE'
  | 'PROCEED'
  | 'REQUEST_DATA'
  | 'HUMAN_REVIEW'
  | 'REQUEST_BETTER_SOURCES'
  | 'SPECIFY_REQUIRED_EVIDENCE'
  | 'REFUSE_ESCALATE';

export interface SourceMetadata {
  type: string;
  system?: string;
  name?: string;
  reference?: string;
}

export interface ClaimPayload {
  subject: string;
  predicate: string;
  value: any;
  raw_statement?: string;
  confidence?: number;
}

export interface QualityMetrics {
  reliability: string;
  freshness: string;
  completeness: number;
  ocr_confidence?: number | null;
  overall_quality: string;
}

export interface TraceabilityInfo {
  file?: string;
  page?: number;
  table?: string;
  record_id?: string;
  line_number?: number;
  ip?: string;
  cell_tower_id?: string;
}

export interface EvidenceObject {
  evidence_id: string;
  case_id: string;
  source: SourceMetadata;
  claim: ClaimPayload;
  timestamp: string;
  quality: QualityMetrics;
  traceability: TraceabilityInfo;
  raw_payload?: Record<string, any>;
}

export interface ContradictionItem {
  contradiction_id: string;
  evidence_ids: string[];
  subject: string;
  predicate: string;
  conflicting_values: any[];
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  description: string;
  resolution_suggestion?: string;
}

export interface MissingInformationItem {
  item: string;
  reason: string;
  priority: string;
  suggested_source?: string;
}

export interface MLFraudModel {
  risk_score: number;
  model: string;
  anomaly_score?: number;
  feature_contributions?: Record<string, number>;
}

export interface ChallengePacket {
  performed: boolean;
  hypothesis?: string;
  counter_evidence_found: boolean;
  counter_evidence_ids: string[];
  challenge_summary: string;
  original_risk_state?: string;
  adjusted_risk_state?: string;
}

export interface DecisionPacket {
  case_id: string;
  trust_status: TrustStatus;
  fraud_model: MLFraudModel;
  evidence_quality: string;
  completeness: number;
  evidence: EvidenceObject[];
  claims: Array<{
    evidence_id: string;
    subject: string;
    predicate: string;
    value: any;
    source?: string;
  }>;
  contradictions: ContradictionItem[];
  missing_information: MissingInformationItem[];
  reasoning: string;
  challenge: ChallengePacket;
  recommendation: RecommendationAction;
  audit: {
    timestamp: string;
    engine_version: string;
    gate: string;
  };
}

export interface CaseResponse {
  case_id: string;
  title: string;
  description?: string;
  entity_type: string;
  entity_id?: string;
  status: string;
  trust_status?: TrustStatus | null;
  evidence_count: number;
  created_at: string;
  updated_at: string;
  decision?: DecisionPacket | null;
}
