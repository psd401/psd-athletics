import { revalidatePath } from "next/cache";

import { TrustFooter } from "../../../components/studio/trust-footer";
import { Badge, Card, PageHead } from "../../../components/studio/ui";
import styles from "../../../components/studio/studio.module.css";
import { undoChange } from "../../../lib/audit";
import { describeChange, listActivity } from "../../../lib/studio/activity";
import { requireStudio } from "../../../lib/studio/context";

const when = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", month: "short", day: "numeric", hour: "numeric", minute: "2-digit" });

async function undo(formData: FormData) {
  "use server";
  const ctx = await requireStudio("/studio/activity");
  const result = await undoChange(ctx.db, { auditId: String(formData.get("auditId")), actor: ctx.actor, now: ctx.now });
  if (!result.ok) throw new Error(result.reason);
  revalidatePath("/studio/activity");
}

/** Every change this person made, and everything at the schools they oversee, with undo (SPEC §8). */
export default async function ActivityPage() {
  const ctx = await requireStudio("/studio/activity");
  const items = await listActivity(
    ctx.db,
    ctx.actor,
    ctx.schools.map((s) => s.id),
    ctx.now,
  );
  return (
    <>
      <main className={styles.main}>
        <PageHead
          eyebrow="Audit log"
          title="Activity"
          sub="Every change in the Studio is recorded here. A change can be undone for 30 minutes by the person who made it, or by an athletic director."
        />
        <Card title="Recent changes" subtitle={items.length ? `${items.length} shown, newest first` : undefined}>
          {items.length === 0 ? (
            <p className={styles.muted}>No changes yet.</p>
          ) : (
            <ul className={`nx-list ${styles.list}`}>
              {items.map((item) => (
                <li key={item.id} className="nx-row">
                  <span className="nx-row__body">
                    <span className="nx-row__title">
                      {item.actorName}
                      {item.viaAgent ? " (through an AI agent)" : ""} {describeChange(item.verb, item.objectType)}
                    </span>
                    <span className="nx-row__sub">{when.format(item.createdAt)}</span>
                  </span>
                  <span className="nx-row__end">
                    {item.undoneAt ? (
                      <Badge tone="plain">Undone</Badge>
                    ) : item.canUndo ? (
                      <form action={undo}>
                        <input type="hidden" name="auditId" value={item.id} />
                        <button type="submit" className="nx-btn nx-btn--secondary nx-btn--sm">
                          Undo
                        </button>
                      </form>
                    ) : null}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </main>
      <TrustFooter items={["Shows changes, not student records", "Undo restores the earlier version", "Undo is logged too"]} />
    </>
  );
}
