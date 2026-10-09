import { appDb } from "../../../../../lib/data/db";
import { getGame } from "../../../../../lib/data/queries";
import { calendar, gameSummary } from "../../../../../lib/schedule/ics";
import { currentTime } from "../../../../../lib/schedule/time";
import { SITE_URL } from "../../../../../lib/config/site";

/** One game as an .ics file ("Add to calendar"). */
export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const game = await getGame(await appDb(), id);
  if (!game) return new Response("Game not found", { status: 404, headers: { "content-type": "text/plain" } });
  const body = calendar([game], { name: gameSummary(game), siteUrl: SITE_URL, stamp: currentTime() });
  const filename = `${game.schoolSlug}-${game.sportSlug}-${game.startDate}.ics`;
  return new Response(body, {
    headers: {
      "content-type": "text/calendar; charset=utf-8",
      "content-disposition": `attachment; filename="${filename}"`,
      "cache-control": "no-store",
    },
  });
}
