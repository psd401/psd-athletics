# Text alerts through AWS End User Messaging, the same setup as psd-eoc: a
# pool around a carrier-registered number, an opt-out list (AWS handles STOP),
# the HELP reply text (AWS answers HELP and STOP), and a configuration set. Nothing is created until a number is
# registered for athletics alerts (DECISIONS 113).

locals {
  sms_enabled = var.sms_origination_identity_arn != null
}

resource "aws_pinpointsmsvoicev2_opt_out_list" "alerts" {
  count = local.sms_enabled ? 1 : 0
  name  = "${local.prefix}-alerts"
}

resource "aws_pinpointsmsvoicev2_pool" "alerts" {
  count                         = local.sms_enabled ? 1 : 0
  iso_country_code              = "US"
  message_type                  = "TRANSACTIONAL"
  origination_identities        = [var.sms_origination_identity_arn]
  opt_out_list_name             = aws_pinpointsmsvoicev2_opt_out_list.alerts[0].name
  self_managed_opt_outs_enabled = false
  shared_routes_enabled         = false
  deletion_protection_enabled   = true
}

resource "aws_pinpointsmsvoicev2_configuration_set" "alerts" {
  count                = local.sms_enabled ? 1 : 0
  name                 = "${local.prefix}-alerts"
  default_message_type = "TRANSACTIONAL"
}

resource "aws_pinpointsmsvoicev2_keyword" "help" {
  count                    = local.sms_enabled ? 1 : 0
  origination_identity_arn = var.sms_origination_identity_arn
  keyword                  = "HELP"
  keyword_message          = "Peninsula Athletics game alerts. Msg frequency varies. Msg & data rates may apply. Reply STOP to end. Help: https://${var.domain_name}/alerts"
}
