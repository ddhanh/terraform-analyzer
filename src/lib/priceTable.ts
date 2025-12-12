import { PriceEntry } from './types';

// Simplified price table for common AWS resources (monthly costs in USD)
export const priceTable: Record<string, PriceEntry[]> = {
  aws_instance: [
    { type: 'instance_type', attribute: 't3.micro', pricePerUnit: 7.59, unit: 'month' },
    { type: 'instance_type', attribute: 't3.small', pricePerUnit: 15.18, unit: 'month' },
    { type: 'instance_type', attribute: 't3.medium', pricePerUnit: 30.37, unit: 'month' },
    { type: 'instance_type', attribute: 't3.large', pricePerUnit: 60.74, unit: 'month' },
    { type: 'instance_type', attribute: 't3.xlarge', pricePerUnit: 121.47, unit: 'month' },
    { type: 'instance_type', attribute: 't3.2xlarge', pricePerUnit: 242.94, unit: 'month' },
    { type: 'instance_type', attribute: 'm5.large', pricePerUnit: 70.08, unit: 'month' },
    { type: 'instance_type', attribute: 'm5.xlarge', pricePerUnit: 140.16, unit: 'month' },
    { type: 'instance_type', attribute: 'c5.large', pricePerUnit: 62.05, unit: 'month' },
    { type: 'instance_type', attribute: 'c5.xlarge', pricePerUnit: 124.10, unit: 'month' },
  ],
  aws_db_instance: [
    { type: 'instance_class', attribute: 'db.t3.micro', pricePerUnit: 12.41, unit: 'month' },
    { type: 'instance_class', attribute: 'db.t3.small', pricePerUnit: 24.82, unit: 'month' },
    { type: 'instance_class', attribute: 'db.t3.medium', pricePerUnit: 49.64, unit: 'month' },
    { type: 'instance_class', attribute: 'db.t3.large', pricePerUnit: 99.28, unit: 'month' },
    { type: 'instance_class', attribute: 'db.r5.large', pricePerUnit: 175.20, unit: 'month' },
    { type: 'instance_class', attribute: 'db.r5.xlarge', pricePerUnit: 350.40, unit: 'month' },
  ],
  aws_lambda_function: [
    { type: 'memory_size', attribute: '128', pricePerUnit: 0.50, unit: 'month' },
    { type: 'memory_size', attribute: '256', pricePerUnit: 1.00, unit: 'month' },
    { type: 'memory_size', attribute: '512', pricePerUnit: 2.00, unit: 'month' },
    { type: 'memory_size', attribute: '1024', pricePerUnit: 4.00, unit: 'month' },
    { type: 'memory_size', attribute: '2048', pricePerUnit: 8.00, unit: 'month' },
  ],
  aws_s3_bucket: [
    { type: 'base', pricePerUnit: 0.023, unit: 'GB/month' },
  ],
  aws_efs_file_system: [
    { type: 'base', pricePerUnit: 0.30, unit: 'GB/month' },
  ],
  aws_cloudwatch_log_group: [
    { type: 'base', pricePerUnit: 0.50, unit: 'GB/month' },
  ],
  aws_route53_record: [
    { type: 'base', pricePerUnit: 0.50, unit: 'month' },
  ],
  aws_security_group: [
    { type: 'base', pricePerUnit: 0, unit: 'month' },
  ],
  aws_iam_role: [
    { type: 'base', pricePerUnit: 0, unit: 'month' },
  ],
};

export function getResourceCost(
  resourceType: string,
  attributes: Record<string, unknown> | null
): number {
  if (!attributes) return 0;
  
  const prices = priceTable[resourceType];
  if (!prices) return 0;

  let totalCost = 0;

  for (const price of prices) {
    if (price.type === 'base') {
      totalCost += price.pricePerUnit;
    } else if (price.attribute) {
      const attrValue = String(attributes[price.type] || '');
      if (attrValue === price.attribute) {
        totalCost += price.pricePerUnit;
      }
    }
  }

  // Add storage costs for instances
  if (resourceType === 'aws_instance' && attributes.root_block_device) {
    const blockDevice = attributes.root_block_device as Record<string, unknown>;
    const volumeSize = Number(blockDevice.volume_size || 0);
    totalCost += volumeSize * 0.08; // EBS gp3 pricing
  }

  // Add storage costs for RDS
  if (resourceType === 'aws_db_instance' && attributes.allocated_storage) {
    const storage = Number(attributes.allocated_storage || 0);
    totalCost += storage * 0.115; // RDS storage pricing
  }

  return totalCost;
}
