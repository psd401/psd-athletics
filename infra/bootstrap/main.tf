# One-time bootstrap: the S3 bucket that holds this app's Terraform state
# (standards/08: versioned, encrypted, public access blocked, native lockfile
# locking). Follows psd401-prr's tofu-state bucket in the same account.
#
# An administrator applies this once with local state, then moves that state
# into the bucket (infra/README.md). Nothing else lives here.

terraform {
  required_version = ">= 1.15.0, < 1.16.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # Added after the first apply; the bucket now holds its own state.
  backend "s3" {
    bucket       = "psd-athletics-tofu-state-338414773271"
    key          = "bootstrap/terraform.tfstate"
    region       = "us-west-2"
    use_lockfile = true
    encrypt      = true
  }
}

variable "aws_account_id" {
  description = "The district account shared with psd401-prr and psd-eoc."
  type        = string
  default     = "338414773271"
}

provider "aws" {
  region              = "us-west-2"
  allowed_account_ids = [var.aws_account_id]

  default_tags {
    tags = {
      "psd:application"         = "psd-athletics"
      "psd:environment"         = "shared"
      "psd:owner"               = "krishagel"
      "psd:managed-by"          = "terraform"
      "psd:repo"                = "psd401/psd-athletics"
      "psd:data-classification" = "internal"
    }
  }
}

resource "aws_s3_bucket" "state" {
  #checkov:skip=CKV_AWS_144:State stays in us-west-2 (standards/08 region pin); versioning covers mistakes.
  #checkov:skip=CKV2_AWS_62:Nothing reacts to state writes.
  #checkov:skip=CKV_AWS_18:Access is through the CI role only; CloudTrail records it.
  bucket = "psd-athletics-tofu-state-${var.aws_account_id}"

  lifecycle {
    prevent_destroy = true
  }
}

resource "aws_s3_bucket_public_access_block" "state" {
  bucket                  = aws_s3_bucket.state.id
  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

resource "aws_s3_bucket_ownership_controls" "state" {
  bucket = aws_s3_bucket.state.id
  rule {
    object_ownership = "BucketOwnerEnforced"
  }
}

resource "aws_s3_bucket_versioning" "state" {
  bucket = aws_s3_bucket.state.id
  versioning_configuration {
    status = "Enabled"
  }
}

resource "aws_kms_key" "state" {
  description             = "psd-athletics Terraform state"
  enable_key_rotation     = true
  deletion_window_in_days = 30
  policy                  = data.aws_iam_policy_document.state_key.json
}

data "aws_caller_identity" "current" {}

# The default key policy, written out: the account administers the key and
# IAM decides who uses it (the CI role).
data "aws_iam_policy_document" "state_key" {
  #checkov:skip=CKV_AWS_111:A key policy's "*" resource is this key only.
  #checkov:skip=CKV_AWS_356:A key policy's "*" resource is this key only.
  #checkov:skip=CKV_AWS_109:Account-root administration is the AWS default key policy; IAM decides who.
  statement {
    sid       = "AccountAdministers"
    actions   = ["kms:*"]
    resources = ["*"]
    principals {
      type        = "AWS"
      identifiers = ["arn:aws:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
  }
}

resource "aws_s3_bucket_server_side_encryption_configuration" "state" {
  bucket = aws_s3_bucket.state.id
  rule {
    apply_server_side_encryption_by_default {
      sse_algorithm     = "aws:kms"
      kms_master_key_id = aws_kms_key.state.arn
    }
    bucket_key_enabled = true
  }
}

resource "aws_s3_bucket_lifecycle_configuration" "state" {
  bucket = aws_s3_bucket.state.id
  rule {
    id     = "old-state-versions"
    status = "Enabled"
    filter {}
    noncurrent_version_expiration {
      noncurrent_days = 90
    }
    abort_incomplete_multipart_upload {
      days_after_initiation = 7
    }
  }
}

data "aws_iam_policy_document" "state" {
  statement {
    sid     = "DenyInsecureTransport"
    effect  = "Deny"
    actions = ["s3:*"]
    principals {
      type        = "*"
      identifiers = ["*"]
    }
    resources = [aws_s3_bucket.state.arn, "${aws_s3_bucket.state.arn}/*"]
    condition {
      test     = "Bool"
      variable = "aws:SecureTransport"
      values   = ["false"]
    }
  }
}

resource "aws_s3_bucket_policy" "state" {
  bucket = aws_s3_bucket.state.id
  policy = data.aws_iam_policy_document.state.json
}

output "state_bucket" {
  description = "Bucket for envs/*/backend.hcl."
  value       = aws_s3_bucket.state.id
}

output "state_kms_key_arn" {
  description = "Key the CI role needs kms:Encrypt/Decrypt/GenerateDataKey on."
  value       = aws_kms_key.state.arn
}
