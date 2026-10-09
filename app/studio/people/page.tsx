import Link from "next/link";
import { notFound } from "next/navigation";

import { TrustFooter } from "../../../components/studio/trust-footer";
import { Badge, Card, PageHead } from "../../../components/studio/ui";
import styles from "../../../components/studio/studio.module.css";
import { canAssign, type Role } from "../../../lib/permissions";
import { levelLabel } from "../../../lib/schedule/games";
import { peopleSchools, requireStudio } from "../../../lib/studio/context";
import { listPeople, roleNames, roleSummaries, schoolRoles, teamRoles } from "../../../lib/studio/people";
import { assignRoleAction, endRoleAction } from "./actions";

type Search = Promise<{ school?: string; saved?: string; error?: string }>;

const statusTone = (status: string) => (status === "Active" ? "success" : status === "Invited" ? "info" : "attention");

/** Who can do what (design/CMS-People-Roles.dc.html). Athletic directors and secretaries only. */
export default async function PeoplePage({ searchParams }: { searchParams: Search }) {
  const ctx = await requireStudio("/studio/people");
  const schools = peopleSchools(ctx);
  if (!schools.length) notFound();
  const { school: slug, saved, error } = await searchParams;
  const current = schools.find((s) => s.slug === slug);
  const shown = current ? [current] : schools;
  const district = ctx.actor.grants.some((g) => g.role === "district_ad");
  const people = await listPeople(ctx.db, { schoolIds: shown.map((s) => s.id), today: ctx.today, includeDistrict: district && !current });

  const roles = [...schoolRoles, ...teamRoles].filter((r) => shown.some((s) => canAssign(ctx.actor, r, s.id)));
  const teams = ctx.teams.filter((t) => shown.some((s) => s.id === t.schoolId));
  const schoolName = (id: string) => ctx.schools.find((s) => s.id === id)?.shortName ?? "";
  const canEnd = (role: Role, schoolId: string | null, personId: string) =>
    personId !== ctx.person.id && schoolId !== null && canAssign(ctx.actor, role, schoolId);
  const view = current?.slug ?? "";
  const exportHref = `/studio/people/export${current ? `?school=${current.slug}` : ""}`;

  return (
    <>
      <main className={styles.main}>
        <PageHead
          eyebrow="Who can do what"
          title="People and roles"
          sub="Coaches are responsible for their own teams and publish without waiting. Athletic directors can edit or take down anything at their schools."
          actions={
            <a className="nx-btn nx-btn--secondary nx-btn--sm" href={exportHref} download>
              Export access list
            </a>
          }
        />
        {schools.length > 1 ? (
          <nav aria-label="School" className={styles.row}>
            {[{ slug: "", label: "Both" }, ...schools.map((s) => ({ slug: s.slug, label: s.shortName }))].map((o) => (
              <Link
                key={o.slug || "both"}
                href={o.slug ? `/studio/people?school=${o.slug}` : "/studio/people"}
                className={`nx-btn nx-btn--sm ${o.slug === view ? "nx-btn--primary" : "nx-btn--secondary"}`}
                aria-current={o.slug === view ? "page" : undefined}
              >
                {o.label}
              </Link>
            ))}
          </nav>
        ) : null}
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

        <Card title="Roles" subtitle="Set once for the district · people get a role per team">
          <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="What each role can do">
            <table className="nx-table">
              <caption className="ath-visually-hidden">What each role can do</caption>
              <thead>
                <tr>
                  <th scope="col">Role</th>
                  <th scope="col">Publishes</th>
                  <th scope="col">Photos</th>
                  <th scope="col">Also</th>
                </tr>
              </thead>
              <tbody>
                {roleSummaries.map((r) => (
                  <tr key={r.role}>
                    <th scope="row" className={styles.rowHead}>
                      {r.role}
                    </th>
                    <td>{r.publishes}</td>
                    <td>{r.photos}</td>
                    <td>{r.also}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="People" subtitle="Signed in with psd401.net Google accounts · access ends when the role ends">
          {people.length ? (
            <div className={styles.tableWrap} tabIndex={0} role="region" aria-label="People with access">
              <table className="nx-table">
                <caption className="ath-visually-hidden">People with access</caption>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Role</th>
                    <th scope="col">Teams</th>
                    <th scope="col">Status</th>
                    <th scope="col">
                      <span className="ath-visually-hidden">End access</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {people.map((p) => (
                    <tr key={p.assignmentId}>
                      <th scope="row" className={styles.rowHead}>
                        {p.name}
                        <small>{p.email}</small>
                      </th>
                      <td>{roleNames[p.role]}</td>
                      <td>
                        {p.scope}
                        {p.endsOn ? <span className={styles.muted}> · until {p.endsOn}</span> : null}
                      </td>
                      <td>
                        <Badge tone={statusTone(p.status)}>{p.status}</Badge>
                      </td>
                      <td>
                        {canEnd(p.role, p.schoolId, p.personId) ? (
                          <form action={endRoleAction.bind(null, p.assignmentId)}>
                            <input type="hidden" name="view" value={view} />
                            <button type="submit" className="nx-btn nx-btn--quiet nx-btn--sm" aria-label={`End ${p.name}'s ${roleNames[p.role].toLowerCase()} role`}>
                              End access
                            </button>
                          </form>
                        ) : null}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className={styles.muted}>Nobody has a role here yet.</p>
          )}
        </Card>

        <Card title="Add a person" subtitle="Use their psd401.net address. They sign in with Google; nothing is emailed from here.">
          <form action={assignRoleAction} className={styles.form}>
            <input type="hidden" name="view" value={view} />
            <label className="nx-field">
              <span className="nx-field__label">Name</span>
              <input className="nx-input" name="name" required maxLength={80} autoComplete="off" />
            </label>
            <label className="nx-field">
              <span className="nx-field__label">District email</span>
              <input className="nx-input" name="email" type="email" required autoComplete="off" placeholder="name@psd401.net" />
            </label>
            <label className="nx-field">
              <span className="nx-field__label">Role</span>
              <select className="nx-select" name="role" required defaultValue="">
                <option value="" disabled>
                  Pick a role
                </option>
                {roles.map((r) => (
                  <option key={r} value={r}>
                    {roleNames[r]}
                  </option>
                ))}
              </select>
            </label>
            <label className="nx-field">
              <span className="nx-field__label">Team</span>
              <select className="nx-select" name="teamId" defaultValue="">
                <option value="">None (school roles)</option>
                {shown.map((s) => (
                  <optgroup key={s.id} label={s.shortName}>
                    {teams
                      .filter((t) => t.schoolId === s.id)
                      .map((t) => (
                        <option key={t.id} value={t.id}>
                          {`${schoolName(t.schoolId)} · ${t.sport} · ${levelLabel[t.level]}`}
                        </option>
                      ))}
                  </optgroup>
                ))}
              </select>
              <span className="nx-field__help">For coaches and photographers.</span>
            </label>
            <label className="nx-field">
              <span className="nx-field__label">School</span>
              <select className="nx-select" name="schoolId" defaultValue={shown.length === 1 ? shown[0]!.id : ""}>
                <option value="">None (team roles)</option>
                {shown.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.shortName}
                  </option>
                ))}
              </select>
              <span className="nx-field__help">For athletic directors and secretaries.</span>
            </label>
            <div className={styles.grid2}>
              <label className="nx-field">
                <span className="nx-field__label">Starts</span>
                <input className="nx-input" name="startsOn" type="date" required defaultValue={ctx.today} />
              </label>
              <label className="nx-field">
                <span className="nx-field__label">Ends (optional)</span>
                <input className="nx-input" name="endsOn" type="date" />
              </label>
            </div>
            <button type="submit" className="nx-btn nx-btn--primary">
              Add person
            </button>
          </form>
        </Card>
      </main>
      <TrustFooter items={["Access ends with the role", "Roles reviewed each season", "Every change logged and undoable for 30 minutes"]} />
    </>
  );
}
