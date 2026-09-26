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

export type ConsoleSection =
  | 'overview'
  | 'cases'
  | 'evidence'
  | 'connectors'
  | 'decisions'
  | 'reviews'
  | 'challenge'
  | 'demo'
  | 'copilot';

export type SourceType =
  | 'DATABASE'
  | 'PDF'
  | 'IMAGE'
  | 'CSV'
  | 'EXCEL'
  | 'API'
  | 'MANUAL'
  | 'DEVICE_SIGNAL'
  | 'EXTERNAL';

export type ConnectorType = 'POSTGRESQL' | 'MYSQL' | 'CSV_DIRECTORY' | 'EXCEL_FILE' | 'REST_API';

export interface SourceMetadata {
  type: SourceType | string;
  system?: string;
  name?: string;
  reference?: string;
  connector_id?: string;
}

export interface ClaimPayload {
  subject: string;
  predicate: string;
  value: any;
  raw_statement?: string;
  confidence: number;
}

export interface QualityMetrics {
  reliability: 'HIGH' | 'MEDIUM' | 'LOW' | 'UNVERIFIED' | string;
  freshness: 'CURRENT' | 'RECENT' | 'OUTDATED' | 'HISTORICAL' | string;
  completeness: number;
  ocr_confidence?: number | null;
  is_primary_source?: boolean;
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
  sha256?: string;
}

export interface EvidenceObject {
  evidence_id: string;
  case_id: string;
  source: SourceMetadata;
  claim: ClaimPayload;
  timestamp?: string;
  quality: QualityMetrics;
  traceability: TraceabilityInfo;
  raw_payload?: Record<string, any>;
  created_at?: string;
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
  counter_evidence_ids?: string[];
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
  claims?: Array<{
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
    [key: string]: unknown;
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

export interface VerdictCase {
  case_id: string;
  title: string;
  description: string;
  entity_type: string;
  entity_id: string;
  status: string;
  trust_status?: TrustStatus;
  evidence_count: number;
  created_at?: string;
  updated_at: string;
  decision?: DecisionPacket;
}

export interface ConnectorConfig {
  id: string;
  name: string;
  connector_type: ConnectorType;
  host?: string;
  port?: number;
  database?: string;
  read_only: boolean;
  is_active: boolean;
}

export type ReviewAction = 'APPROVE' | 'REJECT' | 'ESCALATE' | 'REQUEST_MORE_DOCS' | 'OVERRIDE';

export const TRUST_STATE_META: Record<
  TrustStatus,
  { label: string; action: RecommendationAction; tone: string; blurb: string }
> = {
  SUFFICIENT: {
    label: 'Sufficient',
    action: 'PROCEED',
    tone: 'text-emerald-200 bg-emerald-500/15 border-emerald-400/30',
    blurb: 'Clean data, low risk, zero contradictions.',
  },
  INCOMPLETE: {
    label: 'Incomplete',
    action: 'REQUEST_DATA',
    tone: 'text-amber-200 bg-amber-500/15 border-amber-400/30',
    blurb: 'Partial insights — specific signals still missing.',
  },
  CONFLICTING: {
    label: 'Conflicting',
    action: 'HUMAN_REVIEW',
    tone: 'text-orange-200 bg-orange-500/15 border-orange-400/30',
    blurb: 'Spatio-temporal or claim clashes block auto-verdict.',
  },
  LOW_QUALITY: {
    label: 'Low quality',
    action: 'REQUEST_BETTER_SOURCES',
    tone: 'text-yellow-100 bg-yellow-500/10 border-yellow-400/25',
    blurb: 'Poor OCR or untraceable source reliability.',
  },
  NEED_MORE_INFO: {
    label: 'Need more info',
    action: 'SPECIFY_REQUIRED_EVIDENCE',
    tone: 'text-sky-200 bg-sky-500/15 border-sky-400/30',
    blurb: 'Critical identity or device proof is absent.',
  },
  REFUSE: {
    label: 'Refuse',
    action: 'REFUSE_ESCALATE',
    tone: 'text-rose-200 bg-rose-500/15 border-rose-400/30',
    blurb: 'Unresolvable high fraud risk — escalate.',
  },
};
