output "dns_records" {
  description = "Records the psd401.net DNS admins add: the site, certificate validation, and SES DKIM."
  value = concat(
    [{ name = var.domain_name, type = "CNAME", value = aws_lb.main.dns_name, purpose = "site" }],
    [for o in aws_acm_certificate.site.domain_validation_options : { name = o.resource_record_name, type = o.resource_record_type, value = o.resource_record_value, purpose = "certificate validation" }],
    [for t in aws_sesv2_email_identity.domain.dkim_signing_attributes[0].tokens : { name = "${t}._domainkey.${var.domain_name}", type = "CNAME", value = "${t}.dkim.amazonses.com", purpose = "SES DKIM" }],
  )
}

output "ecr_repository_url" {
  description = "Where CI pushes the app image."
  value       = aws_ecr_repository.app.repository_url
}

output "ecs_cluster" {
  description = "ECS cluster name."
  value       = aws_ecs_cluster.main.name
}

output "ecs_service" {
  description = "ECS service name for the web app."
  value       = aws_ecs_service.app.name
}

output "task_definition_family" {
  description = "Task definition family CI registers new revisions in."
  value       = aws_ecs_task_definition.app.family
}

output "deploy_role_arn" {
  description = "Role GitHub Actions assumes (environment-scoped) to deploy."
  value       = aws_iam_role.deploy.arn
}

output "app_subnets" {
  description = "Subnets for one-off tasks (migrations)."
  value       = aws_subnet.public[*].id
}

output "app_security_group" {
  description = "Security group for one-off tasks (migrations)."
  value       = aws_security_group.app.id
}

output "photo_bucket" {
  description = "S3 bucket for photo files."
  value       = aws_s3_bucket.photos.id
}

output "app_secret_names" {
  description = "Secrets Manager secrets an administrator fills in once."
  value       = [for s in aws_secretsmanager_secret.app : s.name]
}
