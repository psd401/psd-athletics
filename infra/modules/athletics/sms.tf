# Text alerts through AWS End User Messaging, sharing psd-eoc's existing
# carrier-registered pool or number (Hagel, 2026-10-09; DECISIONS 114).
# Athletics adds only its own configuration set (so its delivery events are
# separate) and permission to send. The pool, its opt-out list and the STOP
# and HELP replies stay eoc's: nothing here changes them. Nothing is created
# until sms_origination_identity_arn is set.

locals {
  sms_enabled = var.sms_origination_identity_arn != null
}

resource "aws_pinpointsmsvoicev2_configuration_set" "alerts" {
  count                = local.sms_enabled ? 1 : 0
  name                 = "${local.prefix}-alerts"
  default_message_type = "TRANSACTIONAL"
}
