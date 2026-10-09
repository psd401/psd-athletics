terraform {
  required_version = ">= 1.15.0, < 1.16.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 6.0"
    }
  }

  # S3 state with native lockfile locking (standards/08). Bucket, key and
  # region come from backend.hcl, which CI writes; see infra/README.md.
  backend "s3" {
    use_lockfile = true
    encrypt      = true
  }
}
