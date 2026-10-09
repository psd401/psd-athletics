import { TrustFooter } from "../../../../components/studio/trust-footer";
import { Card, ListRow, PageHead } from "../../../../components/studio/ui";
import styles from "../../../../components/studio/studio.module.css";
import { levelLabel } from "../../../../lib/schedule/games";
import { requireStudio } from "../../../../lib/studio/context";
import { createAlbumAction } from "../actions";

type Search = Promise<{ team?: string; error?: string }>;

/** Start an album for one of my teams; photos are added on the next screen. */
export default async function NewAlbum({ searchParams }: { searchParams: Search }) {
  const ctx = await requireStudio("/studio/photos/new");
  const teams = ctx.teams.filter((t) => ctx.can("photo.upload", { schoolId: t.schoolId, teamId: t.id }));
  const { team: teamParam, error } = await searchParams;
  const team = teams.find((t) => t.id === teamParam) ?? (teams.length === 1 ? teams[0] : undefined);

  return (
    <>
      <main className={styles.main}>
        <PageHead eyebrow="Photos and media" title="New album" sub="Name it now. The game is matched from the photos' capture times once they're in." />
        {error ? (
          <div className="nx-banner nx-banner--danger" role="alert">
            <div className="nx-banner__body">{error}</div>
          </div>
        ) : null}
        {!teams.length ? (
          <p className={styles.muted}>You don&apos;t have a team to add photos for.</p>
        ) : !team ? (
          <Card title="Which team?">
            <ul className={`nx-list ${styles.list}`}>
              {teams.map((t) => (
                <ListRow key={t.id} title={`${t.sport} · ${levelLabel[t.level]}`} href={`/studio/photos/new?team=${t.id}`} />
              ))}
            </ul>
          </Card>
        ) : (
          <Card title={`${team.sport} · ${levelLabel[team.level]}`}>
            <form action={createAlbumAction} className={styles.form}>
              <input type="hidden" name="teamId" value={team.id} />
              <label className="nx-field">
                <span className="nx-field__label">Album title</span>
                <input className="nx-input" name="title" required maxLength={120} placeholder="Senior night" />
              </label>
              <button type="submit" className="nx-btn nx-btn--primary">
                Start the album
              </button>
            </form>
          </Card>
        )}
      </main>
      <TrustFooter items={["Draft until the coach publishes", "Location data removed on upload", "No face recognition, ever"]} />
    </>
  );
}
