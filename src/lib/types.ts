export type Priority = 'low' | 'medium' | 'high';
export type TaskStatus = 'todo' | 'in-progress' | 'done' | 'blocked';
export type ProjectStatus = 'planning' | 'active' | 'review' | 'completed' | 'on-hold';
export type Sentiment = 'positive' | 'neutral' | 'negative';
export type ChangeRequestStatus = 'pending' | 'approved' | 'rejected';

export interface Task {
  id: string;
  projectId: string;
  title: string;
  description?: string;
  priority: Priority;
  status: TaskStatus;
  deadline?: string;
  estimatedHours?: number;
  dependencies?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface Communication {
  id: string;
  clientId?: string;
  source: 'email' | 'whatsapp' | 'slack' | 'meeting' | 'pdf' | 'manual';
  content: string;
  rawContent?: string;
  processed: boolean;
  extractedData?: ExtractedRequirements;
  createdAt: string;
}

export interface ExtractedRequirements {
  tasks: Array<{
    title: string;
    description?: string;
    priority: Priority;
    deadline?: string;
    estimatedHours?: number;
  }>;
  deadlines?: string[];
  budget?: {
    min: number;
    max: number;
  };
  dependencies?: string[];
  questions?: string[];
  risks?: string[];
  sentiment: Sentiment;
  summary: string;
  clientRequest?: string;
  blockers?: string[];
}

export interface Project {
  id: string;
  name: string;
  clientId: string;
  description?: string;
  status: ProjectStatus;
  budget?: number;
  originalScope?: string[];
  startDate?: string;
  deadline?: string;
  health?: number;
  risks?: ProjectRisk[];
  createdAt: string;
  updatedAt: string;
}

export interface ProjectRisk {
  type: 'deadline' | 'scope' | 'budget' | 'other';
  severity: 'low' | 'medium' | 'high';
  message: string;
  recommendedAction?: string;
}

export interface Client {
  id: string;
  name: string;
  email?: string;
  phone?: string;
  company?: string;
  healthScore?: ClientHealthScore;
  createdAt: string;
}

export interface ClientHealthScore {
  overall: number;
  paymentReliability: number;
  communication: number;
  scopeStability: number;
  approvalSpeed: number;
}

export interface ScopeCreepDetection {
  originalScope: string[];
  newRequest: string;
  additionalHoursMin: number;
  additionalHoursMax: number;
  additionalCostMin: number;
  additionalCostMax: number;
  risk: 'low' | 'medium' | 'high';
}

export interface Quote {
  id: string;
  projectName: string;
  clientId: string;
  lineItems: QuoteLineItem[];
  total: number;
  createdAt: string;
}

export interface QuoteLineItem {
  name: string;
  description?: string;
  amount: number;
  hours?: number;
}

export interface ChangeRequest {
  id: string;
  projectId: string;
  title: string;
  reason?: string;
  estimatedHours: number;
  additionalCost: number;
  timelineImpact?: number;
  status: ChangeRequestStatus;
  secureToken: string;
  createdAt: string;
}

export interface DashboardStats {
  revenue: number;
  activeProjects: number;
  pendingPayments: number;
  pendingApprovals: number;
  scopeChanges: number;
}

export interface DashboardAlert {
  type: 'deadline' | 'scope-creep' | 'approval' | 'risk';
  title: string;
  message: string;
  projectId?: string;
  severity: 'low' | 'medium' | 'high';
}
