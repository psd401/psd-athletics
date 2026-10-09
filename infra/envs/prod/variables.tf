variable "aws_account_id" {
  description = "The AWS account this environment lives in: the district account shared with psd401-prr and psd-eoc (Hagel, 2026-10-09). Plans refuse to run against any other."
  type        = string
  default     = "338414773271"
  validation {
    condition     = can(regex("^[0-9]{12}$", var.aws_account_id))
    error_message = "A 12-digit AWS account ID."
  }
}

variable "owner" {
  description = "psd:owner tag: the GitHub handle or team responsible."
  type        = string
  default     = "krishagel"
}

variable "domain_name" {
  description = "Public hostname for the site."
  type        = string
  default     = "athletics.psd401.net"
}

variable "alerts_from_address" {
  description = "Sender address for alert emails (QUESTIONS 27)."
  type        = string
  default     = "alerts@athletics.psd401.net"
}

variable "create_github_oidc_provider" {
  description = "True only if this account doesn't have the GitHub OIDC provider yet."
  type        = bool
  default     = false
}

variable "permissions_boundary_arn" {
  description = "The account's deploy permissions boundary (standards/08, phase 6 plan), once it exists."
  type        = string
  default     = null
}

variable "route53_zone_id" {
  description = "Public Route 53 zone for psd401.net (in this account)."
  type        = string
  default     = "Z2B9XR5HEMTG1R"
}

variable "sms_origination_identity_arn" {
  description = "psd-eoc's End User Messaging pool or phone-number ARN, shared for text alerts (DECISIONS 114). Null keeps texting off."
  type        = string
  default     = "arn:aws:sms-voice:us-west-2:338414773271:pool/pool-523bd2d550b44c329698f1400ba9032d"
}

variable "alarm_email" {
  description = "Where alarm notifications go."
  type        = string
  default     = null
}
