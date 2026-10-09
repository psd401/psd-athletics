import { TrustFooter } from "../../../components/studio/trust-footer";
import { Card, ListRow, PageHead } from "../../../components/studio/ui";
import styles from "../../../components/studio/studio.module.css";
import { levelLabel } from "../../../lib/schedule/games";
import { requireStudio } from "../../../lib/studio/context";

/** The team pages this person can edit. */
export default async function StudioTeams() {
  const ctx = await requireStudio("/studio/teams");
  const editable = ctx.teams.filter((t) => ctx.can("team.edit", { schoolId: t.schoolId, teamId: t.id }) || ctx.can("roster.view", { schoolId: t.schoolId, teamId: t.id }));
  const bySchool = ctx.schools.map((school) => ({ school, teams: editable.filter((t) => t.schoolId === school.id) })).filter((g) => g.teams.length);
  return (
    <>
      <main className={styles.main}>
        <PageHead eyebrow="Team pages" title="Your team pages" sub="Edit the note from the coach, the roster, documents and partners. Schedules come from Arbiter." />
        {bySchool.length === 0 ? (
          <Card>
            <p className={styles.muted}>You don&apos;t have a team assignment yet.</p>
          </Card>
        ) : (
          bySchool.map(({ school, teams }) => (
            <Card key={school.id} title={`${school.shortName} ${school.mascot}`} subtitle={`${teams.length} ${teams.length === 1 ? "team" : "teams"}`}>
              <ul className={`nx-list ${styles.list}`}>
                {teams.map((t) => (
                  <ListRow key={t.id} title={`${t.sport} · ${levelLabel[t.level]}`} subtitle={t.term[0]!.toUpperCase() + t.term.slice(1)} href={`/studio/teams/${t.id}`} />
                ))}
              </ul>
            </Card>
          ))
        )}
      </main>
      <TrustFooter items={["Read only on this screen", "No student data shown"]} />
    </>
  );
}
