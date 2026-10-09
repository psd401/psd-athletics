import { SITE_URL } from "../../../../lib/config/site";
import { appDb } from "../../../../lib/data/db";
import { listGames, listSchools } from "../../../../lib/data/queries";
import { filterGames, filterName, parseFilters } from "../../../../lib/schedule/filters";
import { calendar } from "../../../../lib/schedule/ics";
import { currentTime } from "../../../../lib/schedule/time";

/**
 * Calendar feed for a school, a team (sport + level) or any filtered view:
 * /api/calendar/ghh.ics?sport=football&level=varsity (SPEC §4).
 */
export async function GET(request: Request, { params }: { params: Promise<{ feed: string }> }) {
  const { feed } = await params;
  const slug = /^(ghh|phs)\.ics$/.exec(feed)?.[1];
  const notFound = () => new Response("Calendar not found", { status: 404, headers: { "content-type": "text/plain" } });
  if (!slug) return notFound();

  const db = await appDb();
  const school = (await listSchools(db)).find((s) => s.slug === slug);
  if (!school) return notFound();
  const filters = parseFilters(new URL(request.url).searchParams);
  const games = filterGames(await listGames(db, { schoolId: school.id }), filters);
  const sportName = filters.sport ? (games[0]?.sport ?? null) : null;

  const body = calendar(games, { name: filterName(school.mascot, filters, sportName), siteUrl: SITE_URL, stamp: currentTime() });
  return new Response(body, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `inline; filename="${slug}.ics"`,
      // Calendar apps poll; let caches hold it briefly. Arbiter sync (Phase 3) revalidates.
      "cache-control": "public, max-age=900",
    },
  });
}
