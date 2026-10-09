# App secrets. Terraform creates each secret but never its value, so nothing
# sensitive lands in state; an administrator sets values once (infra/README.md).

locals {
  app_secrets = {
    BETTER_AUTH_SECRET   = "Better Auth signing secret (random, 32+ bytes)."
    GOOGLE_CLIENT_ID     = "Google OAuth client ID for psd401.net sign-in."
    GOOGLE_CLIENT_SECRET = "Google OAuth client secret."
    ALERTS_SECRET        = "Signs alert stop links (random, 32+ bytes)."
  }
}

resource "aws_secretsmanager_secret" "app" {
  #checkov:skip=CKV2_AWS_57:OAuth client credentials and signing keys are rotated by hand when needed; automatic rotation would sign everyone out.
  for_each                = local.app_secrets
  kms_key_id              = aws_kms_key.app.arn
  name                    = "${var.name}/${var.environment}/${each.key}"
  description             = each.value
  recovery_window_in_days = 7
}
