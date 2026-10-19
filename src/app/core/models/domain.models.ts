export type UserRole =
  | 'public'
  | 'reception'
  | 'specialist'
  | 'leader'
  | 'coordinator'
  | 'system-admin';

export type DossierStatus =
  | 'new'
  | 'received'
  | 'processing'
  | 'waiting-approval'
  | 'answered'
  | 'published';

export interface PortalUser {
  id: string;
  name: string;
  email: string;
  organization?: string;
  role: UserRole;
  avatar: string;
}

export interface Topic {
  id: string;
  name: string;
  description: string;
  icon: string;
  count: number;
}

export interface TimelineEvent {
  at: string;
  title: string;
  description: string;
  actor: string;
  state: 'done' | 'current' | 'pending';
}

export interface Dossier {
  id: string;
  code: string;
  question: string;
  topicId: string;
  sender: string;
  senderEmail: string;
  organization: string;
  receivedAt: string;
  dueAt: string;
  status: DossierStatus;
  priority: 'normal' | 'high' | 'urgent';
  assignedTo?: string;
  answer?: string;
  legalBasis: string[];
  attachments: string[];
  timeline: TimelineEvent[];
  isPublic: boolean;
}

export interface Notice {
  id: string;
  title: string;
  body: string;
  date: string;
  category: 'news' | 'guide' | 'notice';
}

export interface DashboardMetric {
  label: string;
  value: number;
  delta: string;
  icon: string;
  tone: 'blue' | 'green' | 'amber' | 'violet';
}

export interface LegalDocument {
  id: string;
  code: string;
  title: string;
  issuer: string;
  issuedAt: string;
  effectiveFrom: string;
  effectiveTo?: string;
  status: 'effective' | 'expired' | 'replaced' | 'draft';
  version: number;
  chapters: number;
  source: 'synced' | 'manual';
}

export interface WorkflowDefinition {
  id: string;
  name: string;
  version: number;
  status: 'draft' | 'active' | 'archived';
  slaDays: number;
  steps: Array<{ id: string; name: string; role: UserRole; required: boolean }>;
  updatedAt: string;
}

export interface AiSuggestion {
  id: string;
  dossierId: string;
  kind: 'classification' | 'routing' | 'legal-basis' | 'summary' | 'duplicate' | 'translation';
  value: string;
  confidence: number;
  status: 'suggested' | 'accepted' | 'rejected';
  model: string;
}

export interface ReportDefinition {
  id: string;
  code: string;
  name: string;
  description: string;
  category: 'operations' | 'sla' | 'quality' | 'public';
  lastGenerated?: string;
}

export interface CatalogEntry {
  id: string;
  type: 'topic' | 'priority' | 'tag' | 'answer-template' | 'intake-method';
  code: string;
  label: string;
  active: boolean;
  sortOrder: number;
}

export type UseCaseTraceStatus = 'specified' | 'mocked' | 'tested' | 'integrated' | 'blocked';

export interface UseCaseDefinition {
  id: string;
  number: number;
  group: string;
  title: string;
  mdc: string;
  status: UseCaseTraceStatus;
}
