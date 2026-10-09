variable "aws_account_id" {
  description = "The AWS account this environment lives in. Plans refuse to run against any other (QUESTIONS 26)."
  type        = string
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

variable "alarm_email" {
  description = "Where alarm notifications go."
  type        = string
  default     = null
}
