# A few alarms that mean "families can't use the site" or "the database is
# in trouble", sent to one email.

resource "aws_sns_topic" "alarms" {
  name              = "${local.prefix}-alarms"
  kms_master_key_id = "alias/aws/sns"
}

resource "aws_sns_topic_subscription" "alarm_email" {
  count     = var.alarm_email == null ? 0 : 1
  topic_arn = aws_sns_topic.alarms.arn
  protocol  = "email"
  endpoint  = var.alarm_email
}

locals {
  alarms = {
    site_5xx = {
      description = "The site returned more than 10 server errors in 5 minutes."
      namespace   = "AWS/ApplicationELB"
      metric      = "HTTPCode_Target_5XX_Count"
      statistic   = "Sum"
      threshold   = 10
      comparison  = "GreaterThanThreshold"
      dimensions  = { LoadBalancer = aws_lb.main.arn_suffix }
    }
    unhealthy_tasks = {
      description = "A web app task is failing health checks."
      namespace   = "AWS/ApplicationELB"
      metric      = "UnHealthyHostCount"
      statistic   = "Maximum"
      threshold   = 0
      comparison  = "GreaterThanThreshold"
      dimensions  = { LoadBalancer = aws_lb.main.arn_suffix, TargetGroup = aws_lb_target_group.app.arn_suffix }
    }
    db_cpu = {
      description = "Database CPU above 80% for 5 minutes."
      namespace   = "AWS/RDS"
      metric      = "CPUUtilization"
      statistic   = "Average"
      threshold   = 80
      comparison  = "GreaterThanThreshold"
      dimensions  = { DBInstanceIdentifier = aws_db_instance.main.identifier }
    }
    db_storage = {
      description = "Database free storage below 2 GiB."
      namespace   = "AWS/RDS"
      metric      = "FreeStorageSpace"
      statistic   = "Minimum"
      threshold   = 2147483648
      comparison  = "LessThanThreshold"
      dimensions  = { DBInstanceIdentifier = aws_db_instance.main.identifier }
    }
  }
}

resource "aws_cloudwatch_metric_alarm" "main" {
  for_each            = local.alarms
  alarm_name          = "${local.prefix}-${replace(each.key, "_", "-")}"
  alarm_description   = each.value.description
  namespace           = each.value.namespace
  metric_name         = each.value.metric
  statistic           = each.value.statistic
  threshold           = each.value.threshold
  comparison_operator = each.value.comparison
  dimensions          = each.value.dimensions
  period              = 300
  evaluation_periods  = 1
  treat_missing_data  = "notBreaching"
  alarm_actions       = [aws_sns_topic.alarms.arn]
  ok_actions          = [aws_sns_topic.alarms.arn]
}
