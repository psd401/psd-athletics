# DNS in the public psd401.net Route 53 zone (Hagel, 2026-10-09). Only names
# under the site's own hostname are created; everything else in the zone,
# including the *.psd401.net wildcard, is untouched.

locals {
  manage_dns = var.route53_zone_id != null
}

resource "aws_route53_record" "certificate" {
  for_each = local.manage_dns ? { for o in aws_acm_certificate.site.domain_validation_options : o.domain_name => o } : {}
  zone_id  = var.route53_zone_id
  name     = each.value.resource_record_name
  type     = each.value.resource_record_type
  records  = [each.value.resource_record_value]
  ttl      = 300
}

resource "aws_route53_record" "dkim" {
  count   = local.manage_dns ? 3 : 0
  zone_id = var.route53_zone_id
  name    = "${aws_sesv2_email_identity.domain.dkim_signing_attributes[0].tokens[count.index]}._domainkey.${var.domain_name}"
  type    = "CNAME"
  records = ["${aws_sesv2_email_identity.domain.dkim_signing_attributes[0].tokens[count.index]}.dkim.amazonses.com"]
  ttl     = 1800
}

resource "aws_route53_record" "site" {
  count   = local.manage_dns ? 1 : 0
  zone_id = var.route53_zone_id
  name    = var.domain_name
  type    = "A"
  alias {
    name                   = aws_lb.main.dns_name
    zone_id                = aws_lb.main.zone_id
    evaluate_target_health = true
  }
}
