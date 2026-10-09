variable "environment" {
  description = "Environment name, used in resource names and the psd:environment tag (for example prod)."
  type        = string
  validation {
    condition     = can(regex("^[a-z][a-z0-9-]{1,15}$", var.environment))
    error_message = "Use lowercase letters, digits and hyphens, 2 to 16 characters."
  }
}

variable "name" {
  description = "Short name prefixed to every resource."
  type        = string
  default     = "psd-athletics"
}

variable "domain_name" {
  description = "Public hostname the site is served on (for example athletics.psd401.net). DNS lives outside this account; the needed records are outputs."
  type        = string
}

variable "github_repository" {
  description = "GitHub repository allowed to deploy, as owner/name."
  type        = string
  default     = "psd401/psd-athletics"
}

variable "github_environment" {
  description = "GitHub environment whose OIDC token may assume the deploy role (environment protection gates it)."
  type        = string
  default     = "production"
}

variable "create_github_oidc_provider" {
  description = "Create the account's GitHub OIDC provider. Set false when the account already has one (it's one per account)."
  type        = bool
  default     = false
}

variable "permissions_boundary_arn" {
  description = "Permissions boundary attached to every role this module creates (standards/08 layer 3). Null until the account's boundary exists."
  type        = string
  default     = null
}

variable "availability_zones" {
  description = "Two availability zones, pinned so the network never shifts when AWS adds a zone."
  type        = list(string)
  default     = ["us-west-2a", "us-west-2b"]
  validation {
    condition     = length(var.availability_zones) == 2
    error_message = "Exactly two availability zones."
  }
}

variable "vpc_cidr" {
  description = "CIDR block for the app's VPC."
  type        = string
  default     = "10.40.0.0/16"
}

variable "app_cpu" {
  description = "Fargate task CPU units for the web app."
  type        = number
  default     = 512
}

variable "app_memory" {
  description = "Fargate task memory (MiB) for the web app."
  type        = number
  default     = 1024
}

variable "app_desired_count" {
  description = "Number of web app tasks."
  type        = number
  default     = 2
}

variable "image_tag" {
  description = "Container image tag to run. CI deploys new tags by registering a task definition; this is the tag Terraform starts with."
  type        = string
  default     = "bootstrap"
}

variable "db_instance_class" {
  description = "RDS instance class."
  type        = string
  default     = "db.t4g.small"
}

variable "db_allocated_storage" {
  description = "RDS storage in GiB (grows automatically up to 5x)."
  type        = number
  default     = 20
}

variable "db_multi_az" {
  description = "Run RDS in two availability zones."
  type        = bool
  default     = true
}

variable "log_retention_days" {
  description = "CloudWatch log retention: 90 for dev, 365 for prod (standards/08)."
  type        = number
  default     = 365
}

variable "alerts_from_address" {
  description = "Sender address for alert emails, on the SES domain (QUESTIONS 27)."
  type        = string
}

variable "alerts_schedule" {
  description = "How often the alert outbox is drained (EventBridge Scheduler expression)."
  type        = string
  default     = "rate(5 minutes)"
}

variable "alarm_email" {
  description = "Email that receives CloudWatch alarm notifications. Null for no subscription."
  type        = string
  default     = null
}
