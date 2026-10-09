output "dns_records" {
  description = "Records for the psd401.net DNS admins."
  value       = module.athletics.dns_records
}

output "ecr_repository_url" {
  description = "Where CI pushes the app image."
  value       = module.athletics.ecr_repository_url
}

output "deploy_role_arn" {
  description = "Role GitHub Actions assumes to deploy."
  value       = module.athletics.deploy_role_arn
}

output "ecs_cluster" {
  description = "ECS cluster name."
  value       = module.athletics.ecs_cluster
}

output "ecs_service" {
  description = "ECS service name."
  value       = module.athletics.ecs_service
}

output "task_definition_family" {
  description = "Task definition family for deploys."
  value       = module.athletics.task_definition_family
}

output "app_subnets" {
  description = "Subnets for one-off tasks."
  value       = module.athletics.app_subnets
}

output "app_security_group" {
  description = "Security group for one-off tasks."
  value       = module.athletics.app_security_group
}

output "photo_bucket" {
  description = "Photo bucket."
  value       = module.athletics.photo_bucket
}

output "app_secret_names" {
  description = "Secrets to fill in once."
  value       = module.athletics.app_secret_names
}
