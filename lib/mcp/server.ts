// The MCP server at /mcp (SPEC §8, standards/07): stateless streamable HTTP,
// seven tools, each run as the signed-in person through the shared library.
// Token verification happens before this (app/mcp/route.ts, requireMcpAuth).

import { createMcpHandler, McpServer, type ToolAnnotations } from "@modelcontextprotocol/server";
import * as z from "zod";

import type { Db } from "../db/client";
import { listSchools, listTeams } from "../data/queries";
import { loadActor } from "../permissions";
import { pacificDate } from "../schedule/time";
import { PermissionError, ValidationError } from "../studio/errors";
import { resolveConnection } from "./connection";
import { contentPublish, draftsList, feedPost, rosterUpdate, scheduleGet, storyDraft, teamsList, type ToolContext } from "./tools";

/** Responses stay well under Claude Code's ~25k-token cap (standards/07). */
const MAX_TEXT = 20_000;

const READ: ToolAnnotations = { readOnlyHint: true, destructiveHint: false, openWorldHint: false };
const DRAFT: ToolAnnotations = { readOnlyHint: false, destructiveHint: false, idempotentHint: false, openWorldHint: false };

const uuid = z.string().uuid();
const dryRun = z.boolean().optional().describe("Defaults to true: preview only. Set false to save the draft.");

function result(value: unknown) {
  let text = JSON.stringify(value, null, 1);
  if (text.length > MAX_TEXT) text = `${text.slice(0, MAX_TEXT)}\n… truncated. Narrow the request (team_id, from/to, limit).`;
  return { content: [{ type: "text" as const, text }] };
}

/** Wraps a tool: plain-language errors come back as tool errors the model can act on. */
function run<A>(fn: (args: A) => Promise<unknown>) {
  return async (args: A) => {
    try {
      return result(await fn(args));
    } catch (error) {
      if (error instanceof ValidationError || error instanceof PermissionError) {
        return { isError: true, content: [{ type: "text" as const, text: error.message }] };
      }
      throw error;
    }
  };
}

export function buildServer(ctx: ToolContext): McpServer {
  const server = new McpServer({ name: "psd-athletics", version: "1.0.0" });

  server.registerTool(
    "psd_athletics_teams_list",
    { title: "My teams", description: "Teams the signed-in coach or athletic director works with, with team ids and what an assistant may do for each.", inputSchema: z.object({}), annotations: READ },
    run(() => teamsList(ctx)),
  );

  server.registerTool(
    "psd_athletics_schedule_get",
    {
      title: "Schedule and results",
      description: "Games with dates, times, opponents, venues, status and results. Defaults to the person's teams. Unknown values are null; never guess them. Paged with cursor.",
      inputSchema: z.object({
        team_id: uuid.optional(),
        from: z.string().optional().describe("YYYY-MM-DD"),
        to: z.string().optional().describe("YYYY-MM-DD"),
        cursor: z.string().optional(),
        limit: z.number().int().min(1).max(50).optional(),
      }),
      annotations: READ,
    },
    run((args) => scheduleGet(ctx, args)),
  );

  server.registerTool(
    "psd_athletics_drafts_list",
    { title: "Waiting for review", description: "Draft stories, unpublished roster entries and draft feed posts on the person's teams, with Studio links.", inputSchema: z.object({}), annotations: READ },
    run(() => draftsList(ctx)),
  );

  server.registerTool(
    "psd_athletics_story_draft",
    {
      title: "Draft a story",
      description:
        "Create a draft story (team_id) or edit a draft (story_id). Never publishes. Use first name and last initial for athletes; don't invent facts. Preview first (dry_run defaults to true).",
      inputSchema: z.object({
        story_id: uuid.optional(),
        team_id: uuid.optional(),
        game_id: uuid.optional(),
        title: z.string().min(1).max(120),
        summary: z.string().max(240).optional(),
        body: z.string().min(1).max(8000).describe("Plain text; a blank line starts a paragraph."),
        dry_run: dryRun,
      }),
      annotations: DRAFT,
    },
    run((args) => storyDraft(ctx, args)),
  );

  server.registerTool(
    "psd_athletics_roster_update",
    {
      title: "Propose roster changes",
      description:
        "Add roster entries (directory information only: first name and last initial, jersey, position, grade) or remove unpublished ones. New entries stay off the site until a coach publishes the roster. Preview first.",
      inputSchema: z.object({
        team_id: uuid,
        add: z
          .array(z.object({ display_name: z.string(), jersey_number: z.string().optional(), position: z.string().optional(), grade: z.number().int().min(9).max(12).optional() }))
          .max(50)
          .optional(),
        remove: z.array(uuid).max(50).optional(),
        dry_run: dryRun,
      }),
      annotations: DRAFT,
    },
    run((args) => rosterUpdate(ctx, args)),
  );

  server.registerTool(
    "psd_athletics_feed_post",
    {
      title: "Draft a feed post",
      description: "Draft a note or a score update for a team feed. A person publishes it in the Studio. Score updates are words; they never change the game's recorded score. Preview first.",
      inputSchema: z.object({ team_id: uuid, kind: z.enum(["note", "score"]), body: z.string().min(1).max(500), game_id: uuid.optional(), dry_run: dryRun }),
      annotations: DRAFT,
    },
    run((args) => feedPost(ctx, args)),
  );

  server.registerTool(
    "psd_athletics_content_publish",
    {
      title: "How to publish",
      description: "Doesn't publish. Agents propose; people publish. Returns the Studio link where the person reads and publishes a story, roster or feed post, and whether they're allowed to.",
      inputSchema: z.object({ kind: z.enum(["story", "roster", "feed_post"]), id: uuid.optional(), team_id: uuid.optional() }),
      annotations: READ,
    },
    run(async (args) => {
      if (args.kind === "roster") {
        if (!args.team_id) throw new ValidationError("A roster needs team_id.");
        return contentPublish(ctx, { kind: "roster", team_id: args.team_id });
      }
      if (!args.id) throw new ValidationError(`A ${args.kind === "story" ? "story" : "feed post"} needs id.`);
      return contentPublish(ctx, { kind: args.kind, id: args.id });
    }),
  );

  return server;
}

const http = createMcpHandler((reqCtx) => buildServer((reqCtx.authInfo?.extra as { toolContext: ToolContext }).toolContext), {
  // Accept 2025-era clients statelessly as well as the 2026-07-28 protocol.
  legacy: "stateless",
});

const jsonError = (status: number, message: string) => Response.json({ jsonrpc: "2.0", id: null, error: { code: -32001, message } }, { status });

/**
 * Serve one MCP request for verified token claims: the person, as this
 * assistant connection. `now` is the app clock (pinned in tests and demos);
 * `clock` is real time, for comparing with token issue times.
 */
export async function serveMcp(
  request: Request,
  claims: Record<string, unknown>,
  { db, now, clock = new Date() }: { db: Db; now: Date; clock?: Date },
): Promise<Response> {
  const connection = await resolveConnection(db, claims, clock);
  if (!connection.ok) return jsonError(403, connection.reason);
  const [actor, schools, teams] = await Promise.all([
    loadActor(db, connection.personId, pacificDate(now), connection.connectionId),
    listSchools(db),
    listTeams(db),
  ]);
  const toolContext: ToolContext = { db, actor, now, schools, teams };
  return http.fetch(request, { authInfo: { token: "verified", clientId: String(claims.azp ?? claims.client_id ?? ""), scopes: [], extra: { toolContext } } });
}
