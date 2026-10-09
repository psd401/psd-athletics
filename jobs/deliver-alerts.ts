// Drains the alert outbox (lib/alerts/outbox.ts). Idempotent: only queued
// messages are sent, and each is marked sent or failed. Runs on a schedule in
// AWS (infra/) and locally with `bun run job deliver-alerts`.

import { deliverOutbox } from "../lib/alerts/outbox";
import { appSenders } from "../lib/alerts/sender";
import { appDb } from "../lib/data/db";
import { currentTime } from "../lib/schedule/time";

export default async function deliverAlerts() {
  return deliverOutbox(await appDb(), appSenders(), currentTime());
}
