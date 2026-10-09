import Link from "next/link";
import { notFound } from "next/navigation";

import { TrustFooter } from "../../../../components/studio/trust-footer";
import { Badge, Card, PageHead } from "../../../../components/studio/ui";
import styles from "../../../../components/studio/studio.module.css";
import { getTeamContent } from "../../../../lib/data/queries";
import { levelLabel } from "../../../../lib/schedule/games";
import { requireStudio } from "../../../../lib/studio/context";
import { listRosterForStudio } from "../../../../lib/studio/team-content";
import {
  addDocumentAction,
  addRosterAction,
  addSponsorAction,
  postNoteAction,
  publishRosterAction,
  removeDocumentAction,
  removeRosterAction,
  removeSponsorAction,
} from "./actions";

type Search = Promise<{ saved?: string; error?: string }>;

/** Edit one team's page (coach's note, roster, documents, partners). Schedules come from Arbiter. */
export default async function StudioTeam({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Search }) {
  const { id } = await params;
  const ctx = await requireStudio(`/studio/teams/${id}`);
  const team = ctx.teams.find((t) => t.id === id);
  if (!team) notFound();
  const scope = { schoolId: team.schoolId, teamId: team.id };
  const canEdit = ctx.can("team.edit", scope);
  const canRoster = ctx.can("roster.edit", scope);
  const canSeeRoster = ctx.can("roster.view", scope);
  if (!canEdit && !canSeeRoster) notFound();

  const { saved, error } = await searchParams;
  const school = ctx.schools.find((s) => s.id === team.schoolId)!;
  const [content, roster] = await Promise.all([getTeamContent(ctx.db, team.id), canSeeRoster ? listRosterForStudio(ctx.db, team.id) : []]);
  const drafts = roster.filter((r) => !r.publishedAt).length;
  const name = `${team.sport} · ${levelLabel[team.level]}`;

  return (
    <>
      <main className={styles.main}>
        <PageHead
          eyebrow={`${school.shortName} ${school.mascot} · team page`}
          title={name}
          sub="What you change here shows on the public team page. Every change can be undone for 30 minutes from Activity."
          actions={
            <Link className="nx-btn nx-btn--secondary nx-btn--sm" href={`/${school.slug}/teams/${team.sportSlug}${team.level === "varsity" ? "" : `?level=${team.level}`}`}>
              View team page
            </Link>
          }
        />
        {saved ? (
          <div className="nx-banner nx-banner--success" role="status">
            <div className="nx-banner__body">
              {saved} <Link href="/studio/activity">Undo in Activity</Link>
            </div>
          </div>
        ) : null}
        {error ? (
          <div className="nx-banner nx-banner--danger" role="alert">
            <div className="nx-banner__body">{error}</div>
          </div>
        ) : null}

        <div id="note">
          <Card title="Note from the coach" subtitle="Travel times, what to bring, how families can help this week">
            {content.coachNote ? <p className={styles.lede}>Showing now: {content.coachNote.body}</p> : <p className={styles.muted}>No note yet.</p>}
            {canEdit ? (
              <form action={postNoteAction.bind(null, team.id)} className={styles.form}>
                <label className="nx-field">
                  <span className="nx-field__label">New note</span>
                  <textarea className="nx-textarea" name="body" rows={3} maxLength={600} required />
                </label>
                <button type="submit" className="nx-btn nx-btn--primary">
                  Post note
                </button>
              </form>
            ) : null}
          </Card>
        </div>

        {canSeeRoster ? (
          <div id="roster">
            <Card title="Roster" subtitle="Directory information only. Names as first name and last initial, like Alex R.">
              {roster.length ? (
                <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="Roster">
                  <table className="nx-table">
                    <thead>
                      <tr>
                        <th scope="col">Name</th>
                        <th scope="col">#</th>
                        <th scope="col">Position</th>
                        <th scope="col">Grade</th>
                        <th scope="col">Status</th>
                        {canRoster ? (
                          <th scope="col">
                            <span className="ath-visually-hidden">Remove</span>
                          </th>
                        ) : null}
                      </tr>
                    </thead>
                    <tbody>
                      {roster.map((r) => (
                        <tr key={r.id}>
                          <td>{r.displayName}</td>
                          <td>{r.jerseyNumber ?? "—"}</td>
                          <td>{r.position ?? "—"}</td>
                          <td>{r.grade ?? "—"}</td>
                          <td>{r.publishedAt ? <Badge tone="success">Published</Badge> : <Badge tone="warning">Draft</Badge>}</td>
                          {canRoster ? (
                            <td>
                              <form action={removeRosterAction.bind(null, team.id)}>
                                <input type="hidden" name="id" value={r.id} />
                                <button type="submit" className="nx-btn nx-btn--quiet" aria-label={`Remove ${r.displayName}`}>
                                  Remove
                                </button>
                              </form>
                            </td>
                          ) : null}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className={styles.muted}>No one on the roster yet.</p>
              )}
              {canRoster ? (
                <>
                  <form action={addRosterAction.bind(null, team.id)} className={styles.formRow}>
                    <label className="nx-field">
                      <span className="nx-field__label">Name</span>
                      <input className="nx-input" name="displayName" placeholder="Alex R." required maxLength={40} />
                    </label>
                    <label className="nx-field">
                      <span className="nx-field__label">Jersey</span>
                      <input className="nx-input" name="jerseyNumber" inputMode="numeric" maxLength={3} />
                    </label>
                    <label className="nx-field">
                      <span className="nx-field__label">Position</span>
                      <input className="nx-input" name="position" maxLength={30} />
                    </label>
                    <label className="nx-field">
                      <span className="nx-field__label">Grade</span>
                      <select className="nx-select" name="grade" defaultValue="">
                        <option value="">—</option>
                        <option value="9">9</option>
                        <option value="10">10</option>
                        <option value="11">11</option>
                        <option value="12">12</option>
                      </select>
                    </label>
                    <button type="submit" className="nx-btn nx-btn--secondary">
                      Add to roster
                    </button>
                  </form>
                  <form action={publishRosterAction.bind(null, team.id)}>
                    <button type="submit" className="nx-btn nx-btn--primary" disabled={drafts === 0}>
                      {drafts ? `Publish ${drafts} ${drafts === 1 ? "entry" : "entries"}` : "Roster is up to date"}
                    </button>
                  </form>
                </>
              ) : null}
            </Card>
          </div>
        ) : null}

        {canEdit ? (
          <div className={styles.grid2}>
            <div id="documents">
              <Card title="Documents" subtitle="Practice schedules, expectations, sign-ups (https links)">
                <ul className={styles.list}>
                  {content.documents.map((d) => (
                    <li key={d.id} className={styles.checkRow}>
                      <span>
                        {d.title} <span className={styles.muted}>{d.kind}</span>
                      </span>
                      <form action={removeDocumentAction.bind(null, team.id)}>
                        <input type="hidden" name="id" value={d.id} />
                        <button type="submit" className="nx-btn nx-btn--quiet" aria-label={`Remove ${d.title}`}>
                          Remove
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
                <form action={addDocumentAction.bind(null, team.id)} className={styles.form}>
                  <label className="nx-field">
                    <span className="nx-field__label">Title</span>
                    <input className="nx-input" name="title" required maxLength={120} />
                  </label>
                  <label className="nx-field">
                    <span className="nx-field__label">Kind</span>
                    <select className="nx-select" name="kind" defaultValue="PDF">
                      <option>PDF</option>
                      <option>Page</option>
                      <option>Link</option>
                    </select>
                  </label>
                  <label className="nx-field">
                    <span className="nx-field__label">Link (https://)</span>
                    <input className="nx-input" name="url" type="url" required />
                  </label>
                  <button type="submit" className="nx-btn nx-btn--secondary">
                    Add document
                  </button>
                </form>
              </Card>
            </div>
            <div id="partners">
              <Card title="Team partners" subtitle="Local businesses and the booster club">
                <ul className={styles.list}>
                  {content.sponsors.map((p) => (
                    <li key={p.id} className={styles.checkRow}>
                      <span>{p.name}</span>
                      <form action={removeSponsorAction.bind(null, team.id)}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" className="nx-btn nx-btn--quiet" aria-label={`Remove ${p.name}`}>
                          Remove
                        </button>
                      </form>
                    </li>
                  ))}
                </ul>
                <form action={addSponsorAction.bind(null, team.id)} className={styles.form}>
                  <label className="nx-field">
                    <span className="nx-field__label">Name</span>
                    <input className="nx-input" name="name" required maxLength={80} />
                  </label>
                  <label className="nx-field">
                    <span className="nx-field__label">Website (optional, https://)</span>
                    <input className="nx-input" name="url" type="url" />
                  </label>
                  <button type="submit" className="nx-btn nx-btn--secondary">
                    Add partner
                  </button>
                </form>
              </Card>
            </div>
          </div>
        ) : null}
      </main>
      <TrustFooter items={["Changes publish to the team page", "Undo for 30 minutes in Activity", "Roster shows directory information only"]} />
    </>
  );
}
