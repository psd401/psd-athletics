# Web application firewall in front of the site: AWS managed rule sets plus a
# per-address rate limit, which also slows anyone hammering the public forms
# (photo reports, alert codes; DECISIONS 96, 103).

resource "aws_wafv2_web_acl" "site" {
  name  = local.prefix
  scope = "REGIONAL"

  default_action {
    allow {}
  }

  rule {
    name     = "aws-common"
    priority = 10
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesCommonRuleSet"
        # Photo uploads are larger than the rule set's 8 KB body limit.
        rule_action_override {
          name = "SizeRestrictions_BODY"
          action_to_use {
            count {}
          }
        }
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.prefix}-aws-common"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "aws-known-bad-inputs"
    priority = 20
    override_action {
      none {}
    }
    statement {
      managed_rule_group_statement {
        vendor_name = "AWS"
        name        = "AWSManagedRulesKnownBadInputsRuleSet"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.prefix}-bad-inputs"
      sampled_requests_enabled   = true
    }
  }

  rule {
    name     = "rate-limit"
    priority = 30
    action {
      block {}
    }
    statement {
      rate_based_statement {
        limit              = 1000
        aggregate_key_type = "IP"
      }
    }
    visibility_config {
      cloudwatch_metrics_enabled = true
      metric_name                = "${local.prefix}-rate-limit"
      sampled_requests_enabled   = true
    }
  }

  visibility_config {
    cloudwatch_metrics_enabled = true
    metric_name                = local.prefix
    sampled_requests_enabled   = true
  }
}

resource "aws_wafv2_web_acl_association" "site" {
  resource_arn = aws_lb.main.arn
  web_acl_arn  = aws_wafv2_web_acl.site.arn
}

# WAF log groups must be named aws-waf-logs-*.
resource "aws_cloudwatch_log_group" "waf" {
  name              = "aws-waf-logs-${local.prefix}"
  retention_in_days = var.log_retention_days
  kms_key_id        = aws_kms_key.app.arn
}

resource "aws_wafv2_web_acl_logging_configuration" "site" {
  resource_arn            = aws_wafv2_web_acl.site.arn
  log_destination_configs = [aws_cloudwatch_log_group.waf.arn]

  # Never log what people type into forms or their cookies.
  redacted_fields {
    single_header {
      name = "cookie"
    }
  }
  redacted_fields {
    single_header {
      name = "authorization"
    }
  }
}
