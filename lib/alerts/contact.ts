// Contacts for alerts: an email address or a US mobile number.

import { ValidationError } from "../studio/errors";

export type Contact = { kind: "email"; value: string } | { kind: "sms"; value: string };

const EMAIL = /^[a-z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?)+$/;

/** An email (lowercased) or a US number as +1XXXXXXXXXX. Anything else is refused. */
export function parseContact(input: string): Contact {
  const raw = input.trim();
  if (raw.includes("@")) {
    const email = raw.toLowerCase();
    if (email.length <= 254 && EMAIL.test(email)) return { kind: "email", value: email };
    throw new ValidationError("That email address doesn't look right.");
  }
  const digits = raw.replace(/[\s().-]/g, "");
  const match = /^(?:\+?1)?([2-9]\d{2}[2-9]\d{6})$/.exec(digits);
  if (match) return { kind: "sms", value: `+1${match[1]}` };
  throw new ValidationError("Enter a US mobile number or an email address.");
}

/** "••••0123" or "f••@example.com", for screens and logs. */
export function maskContact(c: Contact | { kind: string; value: string }): string {
  if (c.kind === "sms") return `••••${c.value.slice(-4)}`;
  const [local = "", domain = ""] = c.value.split("@");
  return `${local.slice(0, 1)}••@${domain}`;
}
