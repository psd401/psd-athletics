module "athletics" {
  source = "../../modules/athletics"

  environment                 = "prod"
  domain_name                 = var.domain_name
  alerts_from_address         = var.alerts_from_address
  create_github_oidc_provider = var.create_github_oidc_provider
  permissions_boundary_arn    = var.permissions_boundary_arn
  alarm_email                 = var.alarm_email

  db_multi_az        = true
  log_retention_days = 365
}
