// The load balancer's health check (infra/modules/athletics/load_balancer.tf).
// Shallow on purpose: a database blip shouldn't make every task "unhealthy"
// and get replaced at once; database trouble has its own alarms.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}
