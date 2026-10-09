import { TrustFooter } from "../../../components/studio/trust-footer";
import { Badge, Card, PageHead } from "../../../components/studio/ui";
import styles from "../../../components/studio/studio.module.css";
import { mcpResource } from "../../../lib/auth/server";
import { listConnections } from "../../../lib/mcp/connection";
import { formatShortDate, pacificDate } from "../../../lib/schedule/time";
import { requireStudio } from "../../../lib/studio/context";
import { turnOffAction } from "./actions";

type Search = Promise<{ saved?: string }>;

const when = (d: Date | null) => (d ? formatShortDate(pacificDate(d)) : "Not yet");

/** AI assistants connected as this person (design/CMS-Agents.dc.html, SPEC §8). */
export default async function AssistantsPage({ searchParams }: { searchParams: Search }) {
  const ctx = await requireStudio("/studio/assistants");
  const { saved } = await searchParams;
  const connections = await listConnections(ctx.db, ctx.person.id);
  return (
    <>
      <main className={styles.main}>
        <PageHead
          eyebrow="Agents and access"
          title="Your AI assistants"
          sub="An assistant you connect works as you and never more. Everything it does shows in Activity, where you can undo it for 30 minutes."
        />
        {saved ? (
          <div className="nx-banner nx-banner--success" role="status">
            <div className="nx-banner__body">{saved}</div>
          </div>
        ) : null}
        <Card title="Connected" subtitle="Everything an assistant does shows in Activity, marked as done through it">
          {connections.length ? (
            <ul className={styles.stack} style={{ listStyle: "none", margin: 0, padding: 0, gap: 4 }}>
              {connections.map((c) => (
                <li key={c.id} className={styles.checkRow}>
                  <span>
                    <b>{c.clientName}</b>
                    <span className={styles.muted}>
                      {" "}
                      · connected {when(c.createdAt)} · last used {when(c.lastUsedAt)}
                    </span>
                  </span>
                  {c.revokedAt ? (
                    <Badge tone="plain">Turned off</Badge>
                  ) : (
                    <form action={turnOffAction.bind(null, c.id)}>
                      <button type="submit" className="nx-btn nx-btn--secondary nx-btn--sm" aria-label={`Turn off ${c.clientName}`}>
                        Turn off
                      </button>
                    </form>
                  )}
                </li>
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>No assistants connected.</p>
          )}
        </Card>
        <Card title="Connect one" subtitle="For Claude or another assistant that supports MCP">
          <p style={{ margin: 0 }}>
            Add a custom connector with this address: <code>{mcpResource()}</code>. You&apos;ll sign in with your district Google account and choose whether to allow it.
          </p>
        </Card>
      </main>
      <TrustFooter items={["Works as you, never more", "Logged in Activity", "Turn off any time"]} />
    </>
  );
}
