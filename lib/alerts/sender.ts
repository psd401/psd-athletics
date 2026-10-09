// Message senders. Locally, messages are only logged (contacts masked); email
// goes through AWS SES once infra/ exists (DECISIONS 105); texting waits for a
// provider (QUESTIONS 27).

import { randomUUID } from "node:crypto";

import { devSignInEnabled } from "../auth/dev";
import { maskContact } from "./contact";
import { sesSender } from "./ses-sender";

export interface OutgoingMessage {
  to: string;
  subject: string;
  body: string;
}

export interface AlertSender {
  send(message: OutgoingMessage): Promise<{ providerId: string }>;
}

/** One sender per channel; null when that channel isn't available. */
export interface Senders {
  email: AlertSender | null;
  sms: AlertSender | null;
}

/** For tests: keeps what it would have sent. */
export function memorySender({ fail = false } = {}): AlertSender & { sent: OutgoingMessage[] } {
  const sent: OutgoingMessage[] = [];
  return {
    sent,
    async send(message) {
      if (fail) throw new Error("Provider refused the message");
      sent.push(message);
      return { providerId: `memory-${randomUUID()}` };
    },
  };
}

/** Local development: writes to the server log with the contact masked. Sends nothing. */
export function logSender(channel: "email" | "sms"): AlertSender & { last: Map<string, OutgoingMessage> } {
  const last = new Map<string, OutgoingMessage>();
  return {
    last,
    async send(message) {
      last.set(message.to, message);
      console.info(`[alerts:${channel}] to ${maskContact({ kind: channel, value: message.to })}: ${message.subject}`);
      return { providerId: `log-${randomUUID()}` };
    },
  };
}

const globalForSenders = globalThis as typeof globalThis & { __alertSenders?: Senders & { devLog?: ReturnType<typeof logSender>[] } };

/**
 * The app's senders. With local dev sign-in on, both channels log only. In
 * AWS, email goes through SES (ALERTS_EMAIL=ses). Otherwise nothing is
 * available, and sign-up says alerts start later.
 */
export function appSenders(): Senders {
  if (!globalForSenders.__alertSenders) {
    if (devSignInEnabled()) {
      const email = logSender("email");
      const sms = logSender("sms");
      globalForSenders.__alertSenders = { email, sms, devLog: [email, sms] };
    } else if (process.env.ALERTS_EMAIL === "ses" && process.env.ALERTS_EMAIL_FROM) {
      // Texting waits for a provider (QUESTIONS 27).
      globalForSenders.__alertSenders = {
        email: sesSender({ from: process.env.ALERTS_EMAIL_FROM, configurationSet: process.env.SES_CONFIGURATION_SET }),
        sms: null,
      };
    } else {
      globalForSenders.__alertSenders = { email: null, sms: null };
    }
  }
  return globalForSenders.__alertSenders;
}

/** Local development only: the last message logged to a contact, so a developer can read the code. */
export function devLastMessage(to: string): OutgoingMessage | null {
  if (!devSignInEnabled()) return null;
  appSenders();
  for (const sender of globalForSenders.__alertSenders?.devLog ?? []) {
    const found = sender.last.get(to);
    if (found) return found;
  }
  return null;
}
