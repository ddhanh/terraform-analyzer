import { useMemo } from 'react';

const CODE_SNIPPETS = [
  'resource "aws_instance"',
  'provider "aws" {',
  'variable "region"',
  'output "ip_address"',
  'data "aws_ami" {',
  'module "vpc" {',
  'terraform {',
  'locals {',
  'count = 3',
  'for_each =',
  'depends_on',
  'lifecycle {',
  'create_before',
  'prevent_destroy',
  'ignore_changes',
  'instance_type',
  'availability_zone',
  'tags = {',
  'Name = "prod"',
  'Environment',
  'cidr_block',
  'subnet_id',
  'security_group',
  'iam_role',
  's3_bucket',
  'lambda_function',
  'rds_instance',
  'vpc_endpoint',
  'route_table',
  'nat_gateway',
];

export function CodeRainBackground() {
  const columns = useMemo(() => {
    const cols = [];
    const columnCount = 12;
    
    for (let i = 0; i < columnCount; i++) {
      const snippets = [];
      const snippetCount = 8 + Math.floor(Math.random() * 6);
      
      for (let j = 0; j < snippetCount; j++) {
        snippets.push(CODE_SNIPPETS[Math.floor(Math.random() * CODE_SNIPPETS.length)]);
      }
      
      cols.push({
        id: i,
        left: `${(i / columnCount) * 100 + Math.random() * 5}%`,
        duration: 25 + Math.random() * 20,
        delay: Math.random() * 15,
        reverse: i % 2 === 1,
        content: snippets.join('\n'),
      });
    }
    
    return cols;
  }, []);

  return (
    <div className="code-rain-container">
      {columns.map((col) => (
        <div
          key={col.id}
          className={`code-column ${col.reverse ? 'reverse' : ''}`}
          style={{
            left: col.left,
            '--duration': `${col.duration}s`,
            '--delay': `${col.delay}s`,
          } as React.CSSProperties}
        >
          {col.content}
        </div>
      ))}
    </div>
  );
}
