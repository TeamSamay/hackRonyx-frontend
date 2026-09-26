export type UserRole =
  | 'Lead Forensic Auditor'
  | 'Senior Legal Counsel'
  | 'Chief Risk Officer'
  | 'Compliance Director'
  | 'Enterprise Administrator';

export type ClearanceLevel = 'Level 1 - Case Ingestion' | 'Level 2 - Legal Review' | 'Level 3 - Gate Authority' | 'Top Secret (TS-SCI)';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  role: UserRole;
  organization: string;
  clearanceLevel: ClearanceLevel;
  provider: 'google' | 'email' | 'sso' | 'demo';
  token: string;
  createdAt: string;
}

export interface DemoPersona {
  id: string;
  name: string;
  role: UserRole;
  email: string;
  organization: string;
  clearanceLevel: ClearanceLevel;
  badgeColor: string;
  description: string;
}
