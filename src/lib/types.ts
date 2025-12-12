export type ActionType = 'create' | 'update' | 'delete' | 'replace' | 'read' | 'no-op';

export type RiskLevel = 'critical' | 'high' | 'medium' | 'low' | 'safe';

export interface ResourceChange {
  address: string;
  type: string;
  name?: string;
  provider_name?: string;
  change: {
    actions: string[];
    before: Record<string, unknown> | null;
    after: Record<string, unknown> | null;
    after_unknown?: Record<string, unknown>;
    before_sensitive?: Record<string, unknown>;
    after_sensitive?: Record<string, unknown>;
  };
}

export interface TerraformPlan {
  format_version?: string;
  terraform_version?: string;
  resource_changes?: ResourceChange[];
  output_changes?: Record<string, unknown>;
  prior_state?: Record<string, unknown>;
  configuration?: Record<string, unknown>;
}

export interface AnalyzedResource {
  address: string;
  type: string;
  action: ActionType;
  actions: string[];
  riskLevel: RiskLevel;
  riskScore: number;
  riskReasons: string[];
  costBefore: number;
  costAfter: number;
  costDelta: number;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  changedAttributes: string[];
  isStateful: boolean;
  hasLifecycleIssues: boolean;
  isProduction: boolean;
}

export interface PlanAnalysis {
  totalResources: number;
  creates: number;
  updates: number;
  deletes: number;
  replaces: number;
  noops: number;
  reads: number;
  overallRiskScore: number;
  overallRiskLevel: RiskLevel;
  totalCostBefore: number;
  totalCostAfter: number;
  costDelta: number;
  costPercentChange: number;
  costAvailable: boolean;
  resources: AnalyzedResource[];
  highRiskResources: AnalyzedResource[];
  warnings: string[];
  criticalIssues: string[];
}

export interface PriceEntry {
  type: string;
  attribute?: string;
  pricePerUnit: number;
  unit: string;
}
