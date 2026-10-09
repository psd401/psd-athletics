# infra/ — AWS for psd-athletics (Terraform)

Terraform per `psd-dev-standards/standards/08-iac.md` v0.2 (psd401/psd-dev-standards#42). **Nothing here has been applied.** Agents never run `apply`; CI does, through an OIDC role, after a human approves the plan (standards/08 PR flow).

```
infra/
  modules/athletics/   the app: network, load balancer + WAF, ECS Fargate, RDS Postgres, S3, SES, secrets, schedules, alarms, CI role
  envs/prod/           production root module (state, provider, tags, account guard)
  .tflint.hcl          tflint with the AWS ruleset
```

## What it builds (DECISIONS 107)

| Piece | Choice |
|---|---|
| Site | One container image on **ECS Fargate (ARM64)**, 2 tasks, behind an **ALB** with an ACM certificate and **WAF** (AWS managed rules, per-IP rate limit). |
| Network | VPC with 2 public subnets (ALB, tasks with public IPs and no inbound except from the ALB) and 2 private subnets (database). No NAT gateway. |
| Database | **RDS PostgreSQL 17**, Multi-AZ, encrypted, SSL forced, 14-day backups, deletion protection. The master password lives only in RDS-managed Secrets Manager. |
| Photos | Private, KMS-encrypted, versioned **S3** bucket; files are served by the app's `/media` route. |
| Email | **SES** domain identity with DKIM and a configuration set (TLS required, bounces and complaints suppressed). |
| Jobs | **EventBridge Scheduler** runs the same image with `bun run job deliver-alerts` every 5 minutes. |
| Secrets | `BETTER_AUTH_SECRET`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `ALERTS_SECRET` are created empty; values are set by hand and never touch Terraform state. |
| CI | ECR repository (immutable tags, scan on push) and a deploy role that only a GitHub `production` environment job in `psd401/psd-athletics` can assume. |
| Ops | Log retention 365 days, one KMS key (rotating), VPC reject flow logs, alarms for 5xx, unhealthy tasks, database CPU and storage. |

## Checks run on this code (locally, 2026-10-09)

- `terraform fmt -check -recursive` and `terraform validate` (Terraform 1.15.9, AWS provider 6.68.0): clean.
- `tflint` 0.64.0 with `tflint-ruleset-aws` 0.49.0: no issues.
- Checkov: 339 passed, 0 failed, 16 skipped. Every skip is a `#checkov:skip` comment with its reason, for human review (standards/08).

The org's reusable IaC workflow (phase 6 plan, `reusable-iac-checks.yml`) doesn't exist yet, so CI doesn't run these. This repo can't add CI logic (CLAUDE.md).

## Before the first apply (one time, by an administrator)

1. Confirm the AWS account, and create the state bucket (versioned, encrypted, public access blocked) per QUESTIONS 26. Copy `envs/prod/backend.hcl.example` and `terraform.tfvars.example` and fill them in. They're git-ignored.
2. Set `create_github_oidc_provider = true` only if the account has no GitHub OIDC provider yet.
3. Plan and apply from CI (or a supervised session with scoped credentials, phase 6 decision 6.3). The first apply waits on the certificate. Add the `dns_records` output to psd401.net DNS: the site CNAME, the certificate validation and SES DKIM.
4. Set the four secret values in Secrets Manager (`app_secret_names` output).
5. Request SES production access for the account. New accounts can only send to verified addresses.
6. Push a first image tagged `bootstrap`, or set `image_tag`, then run migrations as a one-off task (`bun run db:migrate`) with the `app_subnets` and `app_security_group` outputs.

## Still needed in the app before it can run here

These come in the next PR: a `Dockerfile` (Next.js standalone on bun, ARM64, user 1000), `GET /api/health` (the target group's health check), the S3 photo storage adapter (`PHOTO_STORAGE=s3`), the SES alert sender (`ALERTS_EMAIL=ses`), and connecting to Postgres from `DATABASE_HOST`/`DATABASE_SECRET_ARN` with the password read at connect time, so RDS rotation doesn't break connections.

## Not verified until the first apply

- That EventBridge Scheduler accepts a task definition ARN without a revision (it should run the latest revision CI registered).
- That pushing to the KMS-encrypted ECR repository needs nothing beyond the deploy role's ECR permissions.
