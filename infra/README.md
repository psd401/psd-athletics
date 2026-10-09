# infra/ — AWS for psd-athletics (Terraform)

Terraform per `psd-dev-standards/standards/08-iac.md` v0.2 (psd401/psd-dev-standards#42). **Nothing here has been applied.** Agents never run `apply`; CI does, through an OIDC role, after a human approves the plan (standards/08 PR flow).

```
infra/
  bootstrap/           one-time: this app's state bucket (applied once by an administrator)
  modules/athletics/   the app: network, load balancer + WAF, ECS Fargate, RDS Postgres, S3, SES, SMS, secrets, schedules, alarms, CI role
  envs/prod/           production root module (state, provider, tags, account guard)
  .tflint.hcl          tflint with the AWS ruleset
```

**Account:** the district account shared with psd401-prr and psd-eoc, `338414773271`, in `us-west-2` (Hagel, 2026-10-09). The app has its own VPC, so it shares no subnets or route tables with those apps.

## What it builds (DECISIONS 107)

| Piece | Choice |
|---|---|
| Site | One container image on **ECS Fargate (ARM64)**, 2 tasks, behind an **ALB** with an ACM certificate and **WAF** (AWS managed rules, per-IP rate limit). |
| Network | VPC with 2 public subnets (ALB, tasks with public IPs and no inbound except from the ALB) and 2 private subnets (database). No NAT gateway. |
| Database | **RDS PostgreSQL 17**, Multi-AZ, encrypted, SSL forced, 14-day backups, deletion protection. The master password lives only in RDS-managed Secrets Manager. |
| Photos | Private, KMS-encrypted, versioned **S3** bucket; files are served by the app's `/media` route. |
| Email | **SES** domain identity with DKIM and a configuration set (TLS required, bounces and complaints suppressed). |
| Texts | **AWS End User Messaging**, set up like psd-eoc: a pool around a carrier-registered number, an opt-out list (AWS answers STOP), a HELP reply, and a configuration set. Created only once `sms_origination_identity_arn` is set. |
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

1. Create the state bucket once:
   1. In `infra/bootstrap`, run `terraform init` and `terraform apply` with local state. This creates `psd-athletics-tofu-state-338414773271`, following prr's tofu-state bucket.
   2. Add a `backend "s3"` block pointing at that bucket (key `bootstrap/terraform.tfstate`).
   3. Run `terraform init -migrate-state` so the bucket holds its own state.

   Then copy `envs/prod/backend.hcl.example` and `terraform.tfvars.example` and fill them in. They're git-ignored.
2. Set `create_github_oidc_provider = true` only if the account has no GitHub OIDC provider yet.
3. Plan and apply from CI (or a supervised session with scoped credentials, phase 6 decision 6.3). The first apply waits on the certificate. Add the `dns_records` output to psd401.net DNS: the site CNAME, the certificate validation and SES DKIM.
4. Set the four secret values in Secrets Manager (`app_secret_names` output).
5. Check whether the shared account already has SES production access (eoc sends email). If not, request it.
6. For texts, register a number for athletics alerts in End User Messaging (toll-free verification or a 10DLC campaign), as eoc did for its own number. Then set `sms_origination_identity_arn`. eoc's number is registered for emergency notices, so athletics needs its own registration.
7. Push a first image tagged `bootstrap`, or set `image_tag`, then run migrations as a one-off task (`bun run db:migrate`) with the `app_subnets` and `app_security_group` outputs.

## The app side

- `Dockerfile`: Node 24 runs Next.js (as `bun run` does locally), bun installs and runs jobs, the RDS certificate bundle is included, and the user is `node` (uid 1000).
- `GET /api/health` is the target group's health check. It's shallow and doesn't touch the database.
- `PHOTO_STORAGE=s3` with `PHOTO_BUCKET` uses `lib/photos/s3-storage.ts`.
- `ALERTS_EMAIL=ses` with `ALERTS_EMAIL_FROM` uses `lib/alerts/ses-sender.ts`. `ALERTS_SMS=eum` with `SMS_POOL_ARN` uses `lib/alerts/eum-sender.ts` (single wire attempt, as eoc does). A number that texted STOP is marked stopped.
- `DATABASE_HOST`/`DATABASE_NAME`/`DATABASE_SECRET_ARN` connect over verified TLS. The password is read from the RDS secret when a connection opens (`lib/db/postgres.ts`).
- Verified locally (2026-10-09): the arm64 image builds. Against Postgres 17 in Docker, migrations and seed run (seed is idempotent) and `/ghh` serves from Postgres. `sharp` works in the image.
- Not verified until AWS: the real Secrets Manager, S3 and SES calls (unit-tested with stand-in clients).

## Deploying

Deploys need a reusable workflow in `PSD401/.github` (build the arm64 image, push to ECR, register a task definition revision, run `bun run db:migrate` as a one-off task, update the service), because this repo can't add CI logic. The deploy role in `ci.tf` allows exactly those steps.

## Not verified until the first apply

- That EventBridge Scheduler accepts a task definition ARN without a revision (it should run the latest revision CI registered).
- That pushing to the KMS-encrypted ECR repository needs nothing beyond the deploy role's ECR permissions.
