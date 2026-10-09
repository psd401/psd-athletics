import { notFound } from "next/navigation";

import { peopleSchools, requireStudio } from "../../../../lib/studio/context";
import { accessListCsv, listPeople } from "../../../../lib/studio/people";

/** The access list as CSV, for the schools the person manages (design "Export access list"). */
export async function GET(request: Request) {
  const ctx = await requireStudio("/studio/people");
  const schools = peopleSchools(ctx);
  if (!schools.length) notFound();
  const slug = new URL(request.url).searchParams.get("school");
  const shown = schools.filter((s) => !slug || s.slug === slug);
  const district = ctx.actor.grants.some((g) => g.role === "district_ad");
  const rows = await listPeople(ctx.db, { schoolIds: shown.map((s) => s.id), today: ctx.today, includeDistrict: district && !slug });
  return new Response(accessListCsv(rows), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="athletics-access-${slug ?? "all"}-${ctx.today}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
