import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TrustFooter } from "../../../components/studio/trust-footer";
import { Badge, Card, Decision, ListRow, PageHead, StatTile } from "../../../components/studio/ui";
import styles from "../../../components/studio/studio.module.css";
import { listOpenReports, listStudioAlbums, type StudioAlbum } from "../../../lib/photos/albums";
import { levelLabel } from "../../../lib/schedule/games";
import { formatShortDate, pacificDate } from "../../../lib/schedule/time";
import { requireStudio } from "../../../lib/studio/context";
import { decideReportAction } from "./actions";

type Search = Promise<{ saved?: string; error?: string }>;

const WEEK_MS = 7 * 24 * 60 * 60_000;

function albumLine(a: StudioAlbum): string {
  const parts = [a.sport, `${a.photoCount} ${a.photoCount === 1 ? "photo" : "photos"}`];
  if (a.heldCount) parts.push(`${a.heldCount} held`);
  if (a.missingDescriptions) parts.push(`${a.missingDescriptions} ${a.missingDescriptions === 1 ? "needs" : "need"} a description`);
  return parts.join(" · ");
}

/** Albums for my teams; for athletic directors, every team at their schools and open family reports (design/CMS-Media-Review.dc.html). */
export default async function PhotosPage({ searchParams }: { searchParams: Search }) {
  const ctx = await requireStudio("/studio/photos");
  const { saved, error } = await searchParams;
  const uploadTeams = ctx.teams.filter((t) => ctx.can("photo.upload", { schoolId: t.schoolId, teamId: t.id }));
  const overseen = ctx.schools.filter((s) => ctx.can("content.takedown", { schoolId: s.id, teamId: null }));
  if (!uploadTeams.length && !overseen.length) notFound();

  const albums = await listStudioAlbums(ctx.db, uploadTeams.map((t) => t.id));
  const reports = await listOpenReports(ctx.db, overseen.map((s) => s.id));
  const teamName = (id: string) => {
    const t = ctx.teams.find((x) => x.id === id);
    const school = ctx.schools.find((s) => s.id === t?.schoolId);
    return t ? `${overseen.length > 1 ? `${school?.shortName} ` : ""}${t.sport} · ${levelLabel[t.level]}` : "";
  };
  const overseenTeams = ctx.teams.filter((t) => overseen.some((s) => s.id === t.schoolId) && t.term === "fall");
  const published = albums.filter((a) => a.status === "published");
  const thisWeek = published.filter((a) => ctx.now.getTime() - a.updatedAt.getTime() < WEEK_MS).length;
  const posting = new Set(published.map((a) => a.teamId).filter((id) => overseenTeams.some((t) => t.id === id))).size;

  return (
    <>
      <main className={styles.main}>
        <PageHead
          eyebrow="One home for every team's pictures"
          title="Photos and media"
          sub={
            overseen.length
              ? "Coaches post their own albums. You see every team at your schools, and you can take anything down."
              : "Albums for your teams. Location data is removed from every photo when it's uploaded."
          }
          actions={
            uploadTeams.length ? (
              <Link className="nx-btn nx-btn--primary nx-btn--sm" href="/studio/photos/new">
                New album
              </Link>
            ) : null
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

        {overseen.length ? (
          <div className={styles.statGrid}>
            <Card>
              <StatTile label="Albums this week" value={String(thisWeek)} context={overseen.map((s) => s.shortName).join(" and ")} />
            </Card>
            <Card>
              <StatTile label="Fall teams posting" value={`${posting} of ${overseenTeams.length}`} context="with a published album" />
            </Card>
            <Card>
              <StatTile label="Family reports" value={String(reports.length)} context={reports.length ? "hidden while you review" : "none open"} />
            </Card>
          </div>
        ) : null}

        {reports.length ? (
          <div className={styles.grid2}>
            {reports.map((r) => (
              <Decision
                key={r.id}
                needs
                eyebrow={`Family report · ${formatShortDate(pacificDate(r.createdAt))}`}
                title={`A family asked to take down a photo from "${r.albumTitle}"`}
                why={`${teamName(r.teamId)}. The photo came down the moment it was reported. Their note: "${r.reason}"`}
                label="Your decision"
                reaches={
                  <>
                    Visible to the public<b>No</b>
                  </>
                }
                actions={
                  <>
                    <Image className={styles.reportThumb} src={`/media/${r.photoId}/thumb`} alt="The reported photo" width={480} height={320} />
                    <form action={decideReportAction.bind(null, r.id, "removed")}>
                      <button type="submit" className="nx-btn nx-btn--secondary">
                        Keep it down
                      </button>
                    </form>
                    <form action={decideReportAction.bind(null, r.id, "kept")}>
                      <button type="submit" className="nx-btn nx-btn--secondary">
                        Restore it
                      </button>
                    </form>
                  </>
                }
                undo="Logged · can be undone for 30 minutes"
              />
            ))}
          </div>
        ) : null}

        <Card title={overseen.length ? "Albums from your teams" : "Your albums"} subtitle="Drafts stay private until the coach publishes">
          {albums.length ? (
            <ul className={`nx-list ${styles.list}`}>
              {albums.map((a) => (
                <ListRow
                  key={a.id}
                  title={a.title}
                  subtitle={albumLine(a)}
                  href={`/studio/photos/${a.id}`}
                  end={a.status === "published" ? <Badge tone="success">Published</Badge> : <Badge tone="info">Draft</Badge>}
                />
              ))}
            </ul>
          ) : (
            <p className={styles.muted}>No albums yet.</p>
          )}
        </Card>
      </main>
      <TrustFooter items={["Coaches are responsible for their posts", "Reported photos hide right away", "Every takedown is logged"]} />
    </>
  );
}
