import { ResourceChange, AnalyzedResource, PlanAnalysis, ActionType, RiskLevel } from './types';
import { getResourceCost } from './priceTable';

// Stateful resource types that contain persistent data
const STATEFUL_RESOURCES = [
  'aws_s3_bucket',
  'aws_db_instance',
  'aws_rds_cluster',
  'aws_efs_file_system',
  'aws_dynamodb_table',
  'aws_elasticache_cluster',
  'aws_elasticsearch_domain',
  'aws_opensearch_domain',
  'aws_kinesis_stream',
  'aws_sqs_queue',
  'aws_sns_topic',
  'aws_ebs_volume',
  'aws_redshift_cluster',
];

// Attributes that force resource replacement
const REPLACEMENT_ATTRIBUTES: Record<string, string[]> = {
  aws_db_instance: ['instance_class', 'engine', 'engine_version', 'identifier'],
  aws_instance: ['instance_type', 'ami', 'availability_zone'],
  aws_efs_file_system: ['creation_token', 'encrypted'],
  aws_s3_bucket: ['bucket'],
  aws_rds_cluster: ['cluster_identifier', 'engine', 'engine_mode'],
  aws_elasticache_cluster: ['cluster_id', 'node_type'],
};

// IAM policies that indicate elevated permissions
const ELEVATED_POLICIES = [
  'FullAccess',
  'AdministratorAccess',
  'PowerUserAccess',
  '*',
];

function determineAction(actions: string[]): ActionType {
  if (actions.includes('delete') && actions.includes('create')) {
    return 'replace';
  }
  if (actions.includes('create') && !actions.includes('delete')) {
    return 'create';
  }
  if (actions.includes('delete')) {
    return 'delete';
  }
  if (actions.includes('update')) {
    return 'update';
  }
  if (actions.includes('read')) {
    return 'read';
  }
  return 'no-op';
}

function getChangedAttributes(
  before: Record<string, unknown> | null,
  after: Record<string, unknown> | null
): string[] {
  const changed: string[] = [];
  
  if (!before && !after) return changed;
  
  const allKeys = new Set([
    ...Object.keys(before || {}),
    ...Object.keys(after || {}),
  ]);

  for (const key of allKeys) {
    const beforeVal = JSON.stringify(before?.[key]);
    const afterVal = JSON.stringify(after?.[key]);
    if (beforeVal !== afterVal) {
      changed.push(key);
    }
  }

  return changed;
}

function isProduction(resource: ResourceChange): boolean {
  const tags = (resource.change.before?.tags || resource.change.after?.tags) as Record<string, string> | undefined;
  if (!tags) return false;
  
  const envTag = tags.env || tags.environment || tags.Environment || tags.ENV;
  return envTag?.toLowerCase() === 'production' || envTag?.toLowerCase() === 'prod';
}

function checkIAMEscalation(before: Record<string, unknown> | null, after: Record<string, unknown> | null): boolean {
  if (!before || !after) return false;
  
  const beforePolicies = (before.managed_policy_arns || []) as string[];
  const afterPolicies = (after.managed_policy_arns || []) as string[];
  
  // Check for new elevated policies
  for (const policy of afterPolicies) {
    if (!beforePolicies.includes(policy)) {
      if (ELEVATED_POLICIES.some(elevated => policy.includes(elevated))) {
        return true;
      }
    }
  }
  
  return false;
}

function checkSecurityGroupWidening(before: Record<string, unknown> | null, after: Record<string, unknown> | null): boolean {
  if (!after) return false;
  
  const afterIngress = (after.ingress || []) as Array<Record<string, unknown>>;
  
  for (const rule of afterIngress) {
    const cidrBlocks = (rule.cidr_blocks || []) as string[];
    if (cidrBlocks.includes('0.0.0.0/0')) {
      const port = rule.from_port;
      // SSH or RDP open to the world is high risk
      if (port === 22 || port === 3389) {
        return true;
      }
    }
  }
  
  return false;
}

function analyzeResource(resource: ResourceChange): AnalyzedResource {
  const action = determineAction(resource.change.actions);
  const isStateful = STATEFUL_RESOURCES.includes(resource.type);
  const isProd = isProduction(resource);
  const changedAttributes = getChangedAttributes(resource.change.before, resource.change.after);
  
  const costBefore = getResourceCost(resource.type, resource.change.before);
  const costAfter = getResourceCost(resource.type, resource.change.after);
  const costDelta = costAfter - costBefore;

  const riskReasons: string[] = [];
  let riskScore = 0;

  // Base risk scoring by action
  switch (action) {
    case 'create':
      riskScore += 10;
      break;
    case 'update':
      riskScore += 20;
      break;
    case 'delete':
      riskScore += 40;
      riskReasons.push('Resource deletion');
      break;
    case 'replace':
      riskScore += 50;
      riskReasons.push('Resource replacement (destroy then create)');
      break;
  }

  // Stateful resource risks
  if (isStateful && (action === 'delete' || action === 'replace')) {
    riskScore += 30;
    riskReasons.push(`Stateful resource ${action} - potential data loss`);
  }

  // Production environment risks
  if (isProd && (action === 'delete' || action === 'replace')) {
    riskScore += 25;
    riskReasons.push('Production resource modification');
  }

  // Check for replacement-forcing attribute changes
  const replacementAttrs = REPLACEMENT_ATTRIBUTES[resource.type] || [];
  const forcingChanges = changedAttributes.filter(attr => replacementAttrs.includes(attr));
  if (forcingChanges.length > 0 && action === 'replace') {
    riskReasons.push(`Attribute changes forcing replacement: ${forcingChanges.join(', ')}`);
  }

  // S3 bucket deletion without force_destroy
  if (resource.type === 'aws_s3_bucket' && action === 'delete') {
    const forceDestroy = resource.change.before?.force_destroy;
    const versioning = resource.change.before?.versioning as Record<string, boolean> | undefined;
    if (forceDestroy === false) {
      riskScore += 15;
      riskReasons.push('S3 bucket deletion without force_destroy=true');
    }
    if (versioning?.enabled) {
      riskScore += 10;
      riskReasons.push('Versioned bucket deletion may leave orphaned versions');
    }
  }

  // IAM permission escalation
  if (resource.type === 'aws_iam_role' || resource.type === 'aws_iam_policy') {
    if (checkIAMEscalation(resource.change.before, resource.change.after)) {
      riskScore += 35;
      riskReasons.push('IAM policy change widens permissions');
    }
  }

  // Security group widening
  if (resource.type === 'aws_security_group') {
    if (checkSecurityGroupWidening(resource.change.before, resource.change.after)) {
      riskScore += 40;
      riskReasons.push('Security group opens sensitive ports to public internet');
    }
  }

  // Cost impact
  const costPercentChange = costBefore > 0 ? ((costDelta / costBefore) * 100) : (costAfter > 0 ? 100 : 0);
  if (costPercentChange > 50) {
    riskScore += 15;
    riskReasons.push(`Cost increase of ${costPercentChange.toFixed(0)}%`);
  }

  // Check for missing lifecycle configuration on replacements
  let hasLifecycleIssues = false;
  if (action === 'replace' && isStateful) {
    hasLifecycleIssues = true;
    riskReasons.push('Replace operation on stateful resource - consider create_before_destroy lifecycle');
  }

  // Determine risk level
  let riskLevel: RiskLevel;
  if (riskScore >= 80) {
    riskLevel = 'critical';
  } else if (riskScore >= 60) {
    riskLevel = 'high';
  } else if (riskScore >= 40) {
    riskLevel = 'medium';
  } else if (riskScore >= 20) {
    riskLevel = 'low';
  } else {
    riskLevel = 'safe';
  }

  return {
    address: resource.address,
    type: resource.type,
    action,
    actions: resource.change.actions,
    riskLevel,
    riskScore,
    riskReasons,
    costBefore,
    costAfter,
    costDelta,
    before: resource.change.before,
    after: resource.change.after,
    changedAttributes,
    isStateful,
    hasLifecycleIssues,
    isProduction: isProd,
  };
}

export function analyzePlan(plan: { resource_changes?: ResourceChange[] }): PlanAnalysis {
  const resourceChanges = plan.resource_changes || [];
  const resources = resourceChanges.map(analyzeResource);

  const creates = resources.filter(r => r.action === 'create').length;
  const updates = resources.filter(r => r.action === 'update').length;
  const deletes = resources.filter(r => r.action === 'delete').length;
  const replaces = resources.filter(r => r.action === 'replace').length;
  const noops = resources.filter(r => r.action === 'no-op').length;
  const reads = resources.filter(r => r.action === 'read').length;

  const totalCostBefore = resources.reduce((sum, r) => sum + r.costBefore, 0);
  const totalCostAfter = resources.reduce((sum, r) => sum + r.costAfter, 0);
  const costDelta = totalCostAfter - totalCostBefore;
  const costPercentChange = totalCostBefore > 0 
    ? ((costDelta / totalCostBefore) * 100) 
    : (totalCostAfter > 0 ? 100 : 0);

  // Check if cost estimation is available (only for AWS resources in the price table)
  const awsResources = resources.filter(r => r.type.startsWith('aws_'));
  const costAvailable = awsResources.length > 0 && awsResources.some(r => r.costBefore > 0 || r.costAfter > 0);

  // Calculate overall risk score (weighted average with emphasis on high-risk items)
  const totalRiskScore = resources.reduce((sum, r) => {
    const weight = r.riskLevel === 'critical' ? 3 : r.riskLevel === 'high' ? 2 : 1;
    return sum + (r.riskScore * weight);
  }, 0);
  const avgRiskScore = resources.length > 0 
    ? totalRiskScore / resources.reduce((sum, r) => {
        const weight = r.riskLevel === 'critical' ? 3 : r.riskLevel === 'high' ? 2 : 1;
        return sum + weight;
      }, 0)
    : 0;

  let overallRiskLevel: RiskLevel;
  const maxRisk = Math.max(...resources.map(r => r.riskScore), 0);
  if (maxRisk >= 80 || avgRiskScore >= 70) {
    overallRiskLevel = 'critical';
  } else if (maxRisk >= 60 || avgRiskScore >= 50) {
    overallRiskLevel = 'high';
  } else if (maxRisk >= 40 || avgRiskScore >= 30) {
    overallRiskLevel = 'medium';
  } else if (maxRisk >= 20 || avgRiskScore >= 15) {
    overallRiskLevel = 'low';
  } else {
    overallRiskLevel = 'safe';
  }

  const highRiskResources = resources
    .filter(r => r.riskLevel === 'critical' || r.riskLevel === 'high')
    .sort((a, b) => b.riskScore - a.riskScore);

  const warnings: string[] = [];
  const criticalIssues: string[] = [];

  for (const resource of resources) {
    if (resource.riskLevel === 'critical') {
      criticalIssues.push(`${resource.address} (${resource.action}) — ${resource.riskReasons[0] || 'High risk operation'}`);
    } else if (resource.riskLevel === 'high') {
      warnings.push(`${resource.address} (${resource.action}) — ${resource.riskReasons[0] || 'Elevated risk'}`);
    }
  }

  return {
    totalResources: resources.length,
    creates,
    updates,
    deletes,
    replaces,
    noops,
    reads,
    overallRiskScore: Math.min(avgRiskScore, 100),
    overallRiskLevel,
    totalCostBefore,
    totalCostAfter,
    costDelta,
    costPercentChange,
    costAvailable,
    resources: resources.sort((a, b) => b.riskScore - a.riskScore),
    highRiskResources,
    warnings,
    criticalIssues,
  };
}
