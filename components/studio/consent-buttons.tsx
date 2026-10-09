"use client";

import { useState } from "react";

/**
 * Allow / Don't allow for an assistant's connection request. Posts to the
 * OAuth provider's consent endpoint (as Better Auth's own client does) and
 * follows the redirect back to the assistant.
 */
export function ConsentButtons({ query }: { query: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function decide(accept: boolean) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/oauth2/consent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ accept, oauth_query: query }),
      });
      const data = (await res.json()) as { url?: string; error_description?: string };
      if (data.url) {
        window.location.assign(data.url);
        return;
      }
      setError(data.error_description ?? "That didn't work. Start again from your assistant.");
    } catch {
      setError("That didn't work. Start again from your assistant.");
    }
    setBusy(false);
  }

  return (
    <>
      {error ? (
        <div className="nx-banner nx-banner--danger" role="alert">
          <div className="nx-banner__body">{error}</div>
        </div>
      ) : null}
      <div style={{ display: "flex", gap: "var(--space-3)", flexWrap: "wrap" }}>
        <button type="button" className="nx-btn nx-btn--primary" disabled={busy} onClick={() => decide(true)}>
          Allow
        </button>
        <button type="button" className="nx-btn nx-btn--secondary" disabled={busy} onClick={() => decide(false)}>
          Don&apos;t allow
        </button>
      </div>
    </>
  );
}
