# One customer-managed key for the app's logs, secrets, image repository,
# photos, database insights and schedules. Rotated yearly by AWS.

resource "aws_kms_key" "app" {
  description             = "${local.prefix} data at rest"
  enable_key_rotation     = true
  deletion_window_in_days = 30
  policy                  = data.aws_iam_policy_document.kms.json
}

resource "aws_kms_alias" "app" {
  name          = "alias/${local.prefix}"
  target_key_id = aws_kms_key.app.key_id
}

data "aws_iam_policy_document" "kms" {
  #checkov:skip=CKV_AWS_111:A key policy's "*" resource is this key only.
  #checkov:skip=CKV_AWS_356:A key policy's "*" resource is this key only.
  #checkov:skip=CKV_AWS_109:Account-root administration is the AWS default key policy; IAM decides who.
  # Key administration stays with the account (IAM decides who).
  statement {
    sid       = "AccountAdministers"
    actions   = ["kms:*"]
    resources = ["*"] # In a key policy, "*" means this key.
    principals {
      type        = "AWS"
      identifiers = ["arn:${data.aws_partition.current.partition}:iam::${data.aws_caller_identity.current.account_id}:root"]
    }
  }
  # CloudWatch Logs encrypts this app's log groups with the key.
  statement {
    sid       = "CloudWatchLogs"
    actions   = ["kms:Encrypt*", "kms:Decrypt*", "kms:ReEncrypt*", "kms:GenerateDataKey*", "kms:Describe*"]
    resources = ["*"]
    principals {
      type        = "Service"
      identifiers = ["logs.${data.aws_region.current.region}.amazonaws.com"]
    }
    condition {
      test     = "ArnLike"
      variable = "kms:EncryptionContext:aws:logs:arn"
      values   = ["arn:${data.aws_partition.current.partition}:logs:${data.aws_region.current.region}:${data.aws_caller_identity.current.account_id}:log-group:*${var.name}*"]
    }
  }
}
