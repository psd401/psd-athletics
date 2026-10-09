import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";

import { TrustFooter } from "../../../../components/studio/trust-footer";
import { Badge, Card, ContextChip, PageHead, StatusStrip } from "../../../../components/studio/ui";
import styles from "../../../../components/studio/studio.module.css";
import { listGames } from "../../../../lib/data/queries";
import { getStudioAlbum, suggestGame } from "../../../../lib/photos/albums";
import { levelLabel, opponentLine } from "../../../../lib/schedule/games";
import { formatShortDate, formatTime, pacificDate } from "../../../../lib/schedule/time";
import { requireStudio } from "../../../../lib/studio/context";
import {
  describePhotoAction,
  publishAlbumAction,
  releasePhotoAction,
  removePhotoAction,
  setAlbumGameAction,
  unpublishAlbumAction,
} from "../actions";

type Params = Promise<{ id: string }>;
type Search = Promise<{ saved?: string; error?: string }>;

const timeOf = (d: Date | null) => {
  if (!d) return "No capture time";
  const local = new Intl.DateTimeFormat("en-US", { timeZone: "America/Los_Angeles", hour: "2-digit", minute: "2-digit", hourCycle: "h23" }).format(d);
  return `${formatShortDate(pacificDate(d))} · ${formatTime(local)}`;
};

/** A draft or published album (design/CMS-Photo-Upload.dc.html). */
export default async function AlbumPage({ params, searchParams }: { params: Params; searchParams: Search }) {
  const { id } = await params;
  const ctx = await requireStudio(`/studio/photos/${id}`);
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const loaded = await getStudioAlbum(ctx.db, id);
  if (!loaded) notFound();
  const { album, schoolId, photos } = loaded;
  const scope = { schoolId, teamId: album.teamId };
  if (!ctx.can("photo.upload", scope) && !ctx.can("content.takedown", scope)) notFound();
  const { saved, error } = await searchParams;

  const canPublish = ctx.can("album.publish", scope);
  const canModerate = canPublish || ctx.can("content.takedown", scope);
  const team = ctx.teams.find((t) => t.id === album.teamId)!;
  const games = (await listGames(ctx.db, { schoolId })).filter((g) => g.teamId === album.teamId);
  const game = games.find((g) => g.id === album.gameId) ?? null;
  const shown = photos.filter((p) => !p.hiddenReason);
  const removed = photos.filter((p) => p.hiddenReason);
  const held = shown.filter((p) => p.heldReason);
  const ready = shown.filter((p) => !p.heldReason);
  const missing = ready.filter((p) => !p.altText?.trim()).length;
  const suggestedId = game ? null : suggestGame(games, shown.map((p) => p.takenAt));
  const suggested = games.find((g) => g.id === suggestedId) ?? null;
  const published = album.status === "published";
  const gameLabel = (g: (typeof games)[number]) => `${opponentLine(g)}, ${formatShortDate(g.startDate)}`;
  const label = (i: number) => `photo ${i + 1}`;

  return (
    <>
      <main className={styles.main}>
        <PageHead
          eyebrow="Photos and media"
          title={`${album.title} · ${published ? "published" : "draft album"}`}
          sub={`${shown.length} ${shown.length === 1 ? "photo" : "photos"}${held.length ? `, ${held.length} held for the coach` : ""}. ${
            canPublish ? "You decide what posts." : "The head coach or an athletic director publishes."
          }`}
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

        <div className={styles.row}>
          <ContextChip name="Team" value={`${team.sport} · ${levelLabel[team.level]}`} source="album's team" />
          <ContextChip name="Game" value={game ? gameLabel(game) : "None yet"} source={game ? "attached to the album" : "matched from photo times"} />
          <ContextChip name="Photo release" value="The coach reviews every photo" source="district rule" />
        </div>
        <StatusStrip
          items={[
            `${shown.length} ${shown.length === 1 ? "photo" : "photos"} uploaded`,
            `Location data removed from all ${photos.length}`,
            `${ready.length - missing} of ${ready.length} described`,
          ]}
        />

        <div className={styles.grid2}>
          <Card title="Add photos" subtitle="JPEG, PNG, WebP or HEIC · up to 20 at a time, 25 MB each">
            <form action={`/studio/photos/${album.id}/upload`} method="post" encType="multipart/form-data" className={styles.form}>
              <div className="nx-field">
                <label className="nx-field__label" htmlFor="photo-files">
                  Photos
                </label>
                <input
                  id="photo-files"
                  className="nx-input"
                  type="file"
                  name="photos"
                  multiple
                  required
                  accept="image/jpeg,image/png,image/webp,image/heic,image/heif,image/avif"
                  aria-describedby="photo-files-help"
                />
                <span id="photo-files-help" className="nx-field__help">
                  Location and camera details are removed before anything is saved.
                </span>
              </div>
              <button type="submit" className="nx-btn nx-btn--secondary">
                Upload
              </button>
            </form>
          </Card>
          <Card title="Game" subtitle="Albums tied to a game show with its result">
            {suggested ? (
              <form action={setAlbumGameAction.bind(null, album.id)} className={styles.form}>
                <p style={{ margin: 0 }}>
                  These photos were taken during <b>{gameLabel(suggested)}</b>.
                </p>
                <input type="hidden" name="gameId" value={suggested.id} />
                <button type="submit" className="nx-btn nx-btn--secondary">
                  Use this game
                </button>
              </form>
            ) : null}
            <form action={setAlbumGameAction.bind(null, album.id)} className={styles.form}>
              <label className="nx-field">
                <span className="nx-field__label">Game</span>
                <select className="nx-select" name="gameId" defaultValue={album.gameId ?? ""}>
                  <option value="">No game</option>
                  {games.map((g) => (
                    <option key={g.id} value={g.id}>
                      {gameLabel(g)}
                    </option>
                  ))}
                </select>
              </label>
              <button type="submit" className="nx-btn nx-btn--quiet">
                Save game
              </button>
            </form>
          </Card>
        </div>

        <Card title="Photos" subtitle="Image descriptions are required for every photo. Screen readers read them aloud.">
          {shown.length ? (
            <ul className={styles.photoGrid}>
              {shown.map((p, i) => {
                const thumb = p.sizes.thumb;
                const ownDraft = p.uploadedBy === ctx.person.id && !p.publishedAt;
                return (
                  <li key={p.id} id={`photo-${p.id}`} className={styles.photoCard}>
                    <Image
                      src={`/media/${p.id}/thumb`}
                      alt={p.altText?.trim() || `Photo ${i + 1}, no description yet`}
                      width={thumb?.width ?? 480}
                      height={thumb?.height ?? 320}
                    />
                    <div className={styles.photoMeta}>
                      <span className={styles.muted}>{timeOf(p.takenAt)}</span>
                      {p.heldReason ? (
                        <Badge tone="attention">Held</Badge>
                      ) : !p.altText?.trim() ? (
                        <Badge tone="warning">Needs a description</Badge>
                      ) : album.coverPhotoId === p.id ? (
                        <Badge tone="success">Cover</Badge>
                      ) : p.publishedAt ? (
                        <Badge tone="success">On the site</Badge>
                      ) : (
                        <Badge tone="info">Ready</Badge>
                      )}
                    </div>
                    {p.heldReason ? <p className={styles.muted}>{p.heldReason}</p> : null}
                    <form action={describePhotoAction.bind(null, album.id, p.id)} className={styles.stack}>
                      <label className="nx-field">
                        <span className="nx-field__label">Image description for {label(i)}</span>
                        <textarea className="nx-textarea" name="altText" rows={3} maxLength={300} defaultValue={p.altText ?? ""} required />
                      </label>
                      <button type="submit" className="nx-btn nx-btn--secondary nx-btn--sm" aria-label={`Save the description for ${label(i)}`}>
                        Save description
                      </button>
                    </form>
                    <div className={styles.row}>
                      {p.heldReason && canPublish ? (
                        <form action={releasePhotoAction.bind(null, album.id, p.id)}>
                          <button type="submit" className="nx-btn nx-btn--secondary nx-btn--sm" aria-label={`Release ${label(i)}`}>
                            Release
                          </button>
                        </form>
                      ) : null}
                      {canModerate || ownDraft ? (
                        <form action={removePhotoAction.bind(null, album.id, p.id)}>
                          <button type="submit" className="nx-btn nx-btn--quiet nx-btn--sm" aria-label={`Remove ${label(i)}`}>
                            Remove
                          </button>
                        </form>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className={styles.muted}>No photos yet. Add some above.</p>
          )}
          {removed.length ? <p className={styles.muted}>{removed.length} removed. Undo a removal in Activity within 30 minutes.</p> : null}
        </Card>

        <Card title="Where it goes" subtitle="Coaches publish their own team's albums">
          <div className={styles.stack} style={{ gap: 4 }}>
            <div className={styles.checkRow}>
              <span>{team.sport} team page and the school photo page</span>
              <Badge tone="success">On publish</Badge>
            </div>
            <div className={styles.checkRow}>
              <span>Official school social accounts</span>
              <Badge tone="plain">Athletic directors only</Badge>
            </div>
          </div>
          <div className={styles.row} style={{ marginTop: "var(--space-4)" }}>
            {published ? (
              <form action={unpublishAlbumAction.bind(null, album.id)}>
                <button type="submit" className="nx-btn nx-btn--secondary">
                  Unpublish
                </button>
              </form>
            ) : null}
            {canPublish ? (
              <form action={publishAlbumAction.bind(null, album.id)}>
                <button type="submit" className="nx-btn nx-btn--primary">
                  {published ? `Update: publish ${ready.length} ${ready.length === 1 ? "photo" : "photos"}` : `Publish ${ready.length} ${ready.length === 1 ? "photo" : "photos"}`}
                </button>
              </form>
            ) : (
              <p className={styles.muted}>The head coach or an athletic director publishes this album.</p>
            )}
            {canPublish && missing ? <p className={styles.muted}>{missing} still {missing === 1 ? "needs a description" : "need descriptions"}.</p> : null}
          </div>
        </Card>
      </main>
      <TrustFooter items={["Draft until the coach publishes", "Location data removed", "No face recognition, ever"]} />
    </>
  );
}
