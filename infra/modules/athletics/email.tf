# Alert email through SES (DECISIONS 105). DKIM records are outputs for the
# psd401.net DNS admins. New SES accounts start in the sandbox; production
# access is a one-time request (infra/README.md).

resource "aws_sesv2_configuration_set" "alerts" {
  configuration_set_name = "${local.prefix}-alerts"

  delivery_options {
    tls_policy = "REQUIRE"
  }

  reputation_options {
    reputation_metrics_enabled = true
  }

  suppression_options {
    suppressed_reasons = ["BOUNCE", "COMPLAINT"]
  }
}

resource "aws_sesv2_email_identity" "domain" {
  email_identity         = var.domain_name
  configuration_set_name = aws_sesv2_configuration_set.alerts.configuration_set_name
}
