/** Studio sign-in is limited to the district's Google Workspace (CLAUDE.md, SPEC §2). */
export const DISTRICT_DOMAIN = "psd401.net";

interface Identity {
  email?: string | null;
  emailVerified?: boolean | null;
  /** Google's `hd` claim, when the provider sends one. */
  hostedDomain?: string | null;
}

/**
 * True only for a verified address whose domain is exactly psd401.net
 * (no subdomains, no look-alikes) and, when Google says which Workspace the
 * account belongs to, that Workspace is psd401.net too.
 */
export function isDistrictAccount({ email, emailVerified, hostedDomain }: Identity): boolean {
  if (emailVerified !== true || typeof email !== "string") return false;
  const parts = email.trim().toLowerCase().split("@");
  if (parts.length !== 2 || !parts[0]) return false;
  if (parts[1] !== DISTRICT_DOMAIN) return false;
  if (hostedDomain != null && hostedDomain.toLowerCase() !== DISTRICT_DOMAIN) return false;
  return true;
}
