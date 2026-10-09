module "athletics" {
  source = "../../modules/athletics"

  environment                  = "prod"
  domain_name                  = var.domain_name
  alerts_from_address          = var.alerts_from_address
  create_github_oidc_provider  = var.create_github_oidc_provider
  permissions_boundary_arn     = var.permissions_boundary_arn
  alarm_email                  = var.alarm_email
  sms_origination_identity_arn = var.sms_origination_identity_arn

  # Single availability zone (Hagel, 2026-10-09): about $25 a month less; RDS
  # still keeps 14 days of backups and restores to a point in time.
  db_multi_az        = false
  log_retention_days = 365
}
