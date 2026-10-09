# The Next.js app on ECS Fargate (ARM), one container image for the site and
# the scheduled jobs (DECISIONS 107).

resource "aws_ecr_repository" "app" {
  name                 = local.prefix
  image_tag_mutability = "IMMUTABLE"
  image_scanning_configuration {
    scan_on_push = true
  }
  encryption_configuration {
    encryption_type = "KMS"
    kms_key         = aws_kms_key.app.arn
  }
}

resource "aws_ecr_lifecycle_policy" "app" {
  repository = aws_ecr_repository.app.name
  policy = jsonencode({
    rules = [{
      rulePriority = 1
      description  = "Keep the 30 most recent images"
      selection    = { tagStatus = "any", countType = "imageCountMoreThan", countNumber = 30 }
      action       = { type = "expire" }
    }]
  })
}

resource "aws_ecs_cluster" "main" {
  name = local.prefix
  setting {
    name  = "containerInsights"
    value = "enabled"
  }
}

resource "aws_cloudwatch_log_group" "app" {
  name              = "/${var.name}/${var.environment}/app"
  retention_in_days = var.log_retention_days
  kms_key_id        = aws_kms_key.app.arn
}

# ---------------------------------------------------------------- roles

data "aws_iam_policy_document" "ecs_tasks_assume" {
  statement {
    actions = ["sts:AssumeRole"]
    principals {
      type        = "Service"
      identifiers = ["ecs-tasks.amazonaws.com"]
    }
    condition {
      test     = "StringEquals"
      variable = "aws:SourceAccount"
      values   = [data.aws_caller_identity.current.account_id]
    }
  }
}

# Pulls the image, writes logs, reads the app secrets into the container.
resource "aws_iam_role" "execution" {
  name                 = "${local.prefix}-execution"
  assume_role_policy   = data.aws_iam_policy_document.ecs_tasks_assume.json
  permissions_boundary = var.permissions_boundary_arn
}

data "aws_iam_policy_document" "execution" {
  statement {
    sid       = "PullImage"
    actions   = ["ecr:BatchCheckLayerAvailability", "ecr:GetDownloadUrlForLayer", "ecr:BatchGetImage"]
    resources = [aws_ecr_repository.app.arn]
  }
  statement {
    sid       = "EcrToken"
    actions   = ["ecr:GetAuthorizationToken"]
    resources = ["*"] # GetAuthorizationToken has no resource-level permissions.
  }
  statement {
    sid       = "Logs"
    actions   = ["logs:CreateLogStream", "logs:PutLogEvents"]
    resources = ["${aws_cloudwatch_log_group.app.arn}:*"]
  }
  statement {
    sid       = "AppSecrets"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [for s in aws_secretsmanager_secret.app : s.arn]
  }
  statement {
    sid       = "DecryptWithAppKey"
    actions   = ["kms:Decrypt"]
    resources = [aws_kms_key.app.arn]
  }
}

resource "aws_iam_role_policy" "execution" {
  role   = aws_iam_role.execution.id
  policy = data.aws_iam_policy_document.execution.json
}

# What the running app may do: photos, alert email, the database password.
resource "aws_iam_role" "task" {
  name                 = "${local.prefix}-task"
  assume_role_policy   = data.aws_iam_policy_document.ecs_tasks_assume.json
  permissions_boundary = var.permissions_boundary_arn
}

data "aws_iam_policy_document" "task" {
  statement {
    sid       = "PhotoObjects"
    actions   = ["s3:GetObject", "s3:PutObject", "s3:DeleteObject"]
    resources = ["${aws_s3_bucket.photos.arn}/*"]
  }
  statement {
    sid       = "PhotoEncryption"
    actions   = ["kms:Decrypt", "kms:GenerateDataKey"]
    resources = [aws_kms_key.app.arn]
  }
  statement {
    sid       = "PhotoList"
    actions   = ["s3:ListBucket"]
    resources = [aws_s3_bucket.photos.arn]
  }
  statement {
    sid       = "AlertEmail"
    actions   = ["ses:SendEmail"]
    resources = [aws_sesv2_email_identity.domain.arn, aws_sesv2_configuration_set.alerts.arn]
  }
  statement {
    sid       = "DatabasePassword"
    actions   = ["secretsmanager:GetSecretValue"]
    resources = [aws_db_instance.main.master_user_secret[0].secret_arn]
  }
}

resource "aws_iam_role_policy" "task" {
  role   = aws_iam_role.task.id
  policy = data.aws_iam_policy_document.task.json
}

# ---------------------------------------------------------------- task and service

locals {
  site_url = "https://${var.domain_name}"
  container_environment = [
    { name = "NODE_ENV", value = "production" },
    { name = "PORT", value = tostring(local.app_port) },
    { name = "HOSTNAME", value = "0.0.0.0" },
    { name = "SITE_URL", value = local.site_url },
    { name = "BETTER_AUTH_URL", value = local.site_url },
    { name = "AWS_REGION", value = data.aws_region.current.region },
    { name = "PHOTO_STORAGE", value = "s3" },
    { name = "PHOTO_BUCKET", value = aws_s3_bucket.photos.id },
    { name = "DATABASE_HOST", value = aws_db_instance.main.address },
    { name = "DATABASE_PORT", value = tostring(aws_db_instance.main.port) },
    { name = "DATABASE_NAME", value = aws_db_instance.main.db_name },
    { name = "DATABASE_SECRET_ARN", value = aws_db_instance.main.master_user_secret[0].secret_arn },
    { name = "ALERTS_EMAIL", value = "ses" },
    { name = "ALERTS_EMAIL_FROM", value = var.alerts_from_address },
    { name = "SES_CONFIGURATION_SET", value = aws_sesv2_configuration_set.alerts.configuration_set_name },
  ]
  container_secrets = [for key, s in aws_secretsmanager_secret.app : { name = key, valueFrom = s.arn }]
}

resource "aws_ecs_task_definition" "app" {
  family                   = local.prefix
  requires_compatibilities = ["FARGATE"]
  network_mode             = "awsvpc"
  cpu                      = var.app_cpu
  memory                   = var.app_memory
  execution_role_arn       = aws_iam_role.execution.arn
  task_role_arn            = aws_iam_role.task.arn

  runtime_platform {
    operating_system_family = "LINUX"
    cpu_architecture        = "ARM64"
  }

  container_definitions = jsonencode([{
    name         = "app"
    image        = "${aws_ecr_repository.app.repository_url}:${var.image_tag}"
    essential    = true
    portMappings = [{ containerPort = local.app_port, protocol = "tcp" }]
    environment  = local.container_environment
    secrets      = local.container_secrets
    user         = "1000"
    logConfiguration = {
      logDriver = "awslogs"
      options = {
        awslogs-group         = aws_cloudwatch_log_group.app.name
        awslogs-region        = data.aws_region.current.region
        awslogs-stream-prefix = "app"
      }
    }
  }])
}

resource "aws_ecs_service" "app" {
  #checkov:skip=CKV_AWS_333:Tasks take public IPs for outbound calls instead of a NAT gateway; the security group only admits the load balancer (DECISIONS 107).
  name                               = "app"
  cluster                            = aws_ecs_cluster.main.id
  task_definition                    = aws_ecs_task_definition.app.arn
  desired_count                      = var.app_desired_count
  launch_type                        = "FARGATE"
  health_check_grace_period_seconds  = 60
  deployment_minimum_healthy_percent = 100
  deployment_maximum_percent         = 200
  propagate_tags                     = "SERVICE"

  deployment_circuit_breaker {
    enable   = true
    rollback = true
  }

  network_configuration {
    subnets          = aws_subnet.public[*].id
    security_groups  = [aws_security_group.app.id]
    assign_public_ip = true
  }

  load_balancer {
    target_group_arn = aws_lb_target_group.app.arn
    container_name   = "app"
    container_port   = local.app_port
  }

  depends_on = [aws_lb_listener.https]

  # CI deploys new images by registering task definition revisions.
  lifecycle {
    ignore_changes = [task_definition]
  }
}
