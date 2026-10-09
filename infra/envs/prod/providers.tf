provider "aws" {
  region              = "us-west-2"
  allowed_account_ids = [var.aws_account_id]

  # The district tag set, on everything (standards/08).
  default_tags {
    tags = {
      "psd:application"         = "psd-athletics"
      "psd:environment"         = "prod"
      "psd:owner"               = var.owner
      "psd:managed-by"          = "terraform"
      "psd:repo"                = "psd401/psd-athletics"
      "psd:data-classification" = "student-pii"
    }
  }
}
