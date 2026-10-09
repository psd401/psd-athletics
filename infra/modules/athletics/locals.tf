locals {
  prefix   = "${var.name}-${var.environment}"
  app_port = 3000
  azs      = var.availability_zones
}

data "aws_caller_identity" "current" {}

data "aws_region" "current" {}

data "aws_partition" "current" {}
