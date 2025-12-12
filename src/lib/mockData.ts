import { TerraformPlan } from './types';

export const mockTerraformPlan: TerraformPlan = {
  format_version: "1.2",
  terraform_version: "1.6.0",
  resource_changes: [
    {
      address: "aws_instance.web[0]",
      type: "aws_instance",
      name: "web",
      change: {
        actions: ["create"],
        before: null,
        after: {
          instance_type: "t3.large",
          ami: "ami-0c55b159cbfafe1f0",
          tags: {
            Name: "web-server-0",
            env: "staging"
          },
          root_block_device: {
            volume_size: 50,
            volume_type: "gp3"
          },
          vpc_security_group_ids: ["sg-12345678"]
        }
      }
    },
    {
      address: "aws_instance.web[1]",
      type: "aws_instance",
      name: "web",
      change: {
        actions: ["create"],
        before: null,
        after: {
          instance_type: "t3.large",
          ami: "ami-0c55b159cbfafe1f0",
          tags: {
            Name: "web-server-1",
            env: "staging"
          },
          root_block_device: {
            volume_size: 50,
            volume_type: "gp3"
          }
        }
      }
    },
    {
      address: "aws_db_instance.primary",
      type: "aws_db_instance",
      name: "primary",
      change: {
        actions: ["update", "replace"],
        before: {
          identifier: "prod-db-primary",
          instance_class: "db.t3.medium",
          allocated_storage: 100,
          engine: "postgres",
          engine_version: "14.9",
          multi_az: true,
          tags: {
            env: "production"
          }
        },
        after: {
          identifier: "prod-db-primary",
          instance_class: "db.t3.large",
          allocated_storage: 100,
          engine: "postgres",
          engine_version: "14.9",
          multi_az: true,
          tags: {
            env: "production"
          }
        }
      }
    },
    {
      address: "aws_s3_bucket.assets",
      type: "aws_s3_bucket",
      name: "assets",
      change: {
        actions: ["delete"],
        before: {
          bucket: "prod-assets-12345",
          versioning: {
            enabled: true
          },
          force_destroy: false,
          tags: {
            env: "production"
          }
        },
        after: null
      }
    },
    {
      address: "aws_iam_role.app_role",
      type: "aws_iam_role",
      name: "app_role",
      change: {
        actions: ["update"],
        before: {
          name: "app-execution-role",
          assume_role_policy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [{
              Effect: "Allow",
              Principal: { Service: "ec2.amazonaws.com" },
              Action: "sts:AssumeRole"
            }]
          }),
          managed_policy_arns: [
            "arn:aws:iam::aws:policy/AmazonS3ReadOnlyAccess"
          ]
        },
        after: {
          name: "app-execution-role",
          assume_role_policy: JSON.stringify({
            Version: "2012-10-17",
            Statement: [{
              Effect: "Allow",
              Principal: { Service: "ec2.amazonaws.com" },
              Action: "sts:AssumeRole"
            }]
          }),
          managed_policy_arns: [
            "arn:aws:iam::aws:policy/AmazonS3FullAccess",
            "arn:aws:iam::aws:policy/AmazonEC2FullAccess"
          ]
        }
      }
    },
    {
      address: "aws_security_group.web",
      type: "aws_security_group",
      name: "web",
      change: {
        actions: ["update"],
        before: {
          name: "web-sg",
          ingress: [
            { from_port: 443, to_port: 443, protocol: "tcp", cidr_blocks: ["10.0.0.0/8"] }
          ]
        },
        after: {
          name: "web-sg",
          ingress: [
            { from_port: 443, to_port: 443, protocol: "tcp", cidr_blocks: ["0.0.0.0/0"] },
            { from_port: 22, to_port: 22, protocol: "tcp", cidr_blocks: ["0.0.0.0/0"] }
          ]
        }
      }
    },
    {
      address: "aws_lambda_function.processor",
      type: "aws_lambda_function",
      name: "processor",
      change: {
        actions: ["update"],
        before: {
          function_name: "data-processor",
          runtime: "nodejs18.x",
          memory_size: 256,
          timeout: 30
        },
        after: {
          function_name: "data-processor",
          runtime: "nodejs20.x",
          memory_size: 512,
          timeout: 60
        }
      }
    },
    {
      address: "aws_cloudwatch_log_group.app",
      type: "aws_cloudwatch_log_group",
      name: "app",
      change: {
        actions: ["no-op"],
        before: {
          name: "/app/logs",
          retention_in_days: 30
        },
        after: {
          name: "/app/logs",
          retention_in_days: 30
        }
      }
    },
    {
      address: "aws_efs_file_system.shared",
      type: "aws_efs_file_system",
      name: "shared",
      change: {
        actions: ["delete"],
        before: {
          creation_token: "shared-efs",
          encrypted: true,
          performance_mode: "generalPurpose",
          tags: {
            env: "production",
            data: "persistent"
          }
        },
        after: null
      }
    },
    {
      address: "aws_route53_record.api",
      type: "aws_route53_record",
      name: "api",
      change: {
        actions: ["create"],
        before: null,
        after: {
          name: "api.example.com",
          type: "A",
          alias: {
            name: "alb-12345.us-east-1.elb.amazonaws.com",
            zone_id: "Z123456789"
          }
        }
      }
    }
  ]
};

export const mockPlanJson = JSON.stringify(mockTerraformPlan, null, 2);
