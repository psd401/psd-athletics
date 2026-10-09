// Database schema for the athletics platform (docs/PLAN.md §3, SPEC §5).
// Migrations are generated from this file with `bun run db:generate` and
// committed in drizzle/. Never edit a committed migration; add a new one.

import { sql } from "drizzle-orm";
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
} from "drizzle-orm/pg-core";

const createdAt = () => timestamp("created_at", { withTimezone: true }).notNull().defaultNow();
const updatedAt = () =>
  timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date());
const id = () => uuid("id").primaryKey().defaultRandom();

// ---------------------------------------------------------------- enums

export const termEnum = pgEnum("term", ["fall", "winter", "spring"]);
export const levelEnum = pgEnum("team_level", ["varsity", "jv", "c_team", "freshman"]);
export const roleEnum = pgEnum("role", [
  "district_ad",
  "school_ad",
  "secretary",
  "head_coach",
  "assistant_coach",
  "photographer",
]);
export const homeAwayEnum = pgEnum("home_away", ["home", "away", "neutral"]);
export const gameStatusEnum = pgEnum("game_status", ["scheduled", "live", "final", "postponed", "cancelled"]);
export const dataSourceEnum = pgEnum("data_source", ["fixture", "arbiter"]);
export const changeStatusEnum = pgEnum("schedule_change_status", ["pending", "applied", "held"]);
export const storyStatusEnum = pgEnum("story_status", ["draft", "published"]);
export const albumStatusEnum = pgEnum("album_status", ["draft", "published", "hidden"]);
export const reportStatusEnum = pgEnum("photo_report_status", ["open", "kept", "removed"]);
export const feedKindEnum = pgEnum("feed_post_kind", ["photo", "score", "note"]);
export const channelEnum = pgEnum("alert_channel", ["sms", "email"]);
export const alertKindEnum = pgEnum("alert_kind", ["change", "final", "album"]);
export const alertStatusEnum = pgEnum("alert_status", ["queued", "sent", "failed"]);
export const ruleKindEnum = pgEnum("rule_kind", ["publish", "media", "sync"]);

// ---------------------------------------------------------------- schools and teams

export type SchoolSocial = { instagram?: string; x?: string };

export const school = pgTable("school", {
  /** Stable id from the fixtures: "ghhs", "phs". */
  id: text("id").primaryKey(),
  /** URL segment: "ghh", "phs". */
  slug: text("slug").notNull().unique(),
  name: text("name").notNull(),
  shortName: text("short_name").notNull(),
  mascot: text("mascot").notNull(),
  founded: integer("founded"),
  address: text("address").notNull(),
  homeField: text("home_field"),
  logoPath: text("logo_path").notNull(),
  social: jsonb("social").$type<SchoolSocial>().notNull().default({}),
  arbiterEntityId: text("arbiter_entity_id"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const schoolContact = pgTable("school_contact", {
  id: id(),
  schoolId: text("school_id")
    .notNull()
    .references(() => school.id),
  name: text("name").notNull(),
  role: text("role").notNull(),
  /** Stored for the message relay; never rendered for coaches. */
  email: text("email"),
  phone: text("phone"),
  sort: integer("sort").notNull().default(0),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const honor = pgTable("honor", {
  id: id(),
  schoolId: text("school_id")
    .notNull()
    .references(() => school.id),
  sport: text("sport"),
  /** The big figure: "11", "’97 · ’17", "3 in 4". */
  figure: text("figure").notNull(),
  title: text("title").notNull(),
  detail: text("detail"),
  featuredOnHub: boolean("featured_on_hub").notNull().default(false),
  sort: integer("sort").notNull().default(0),
  createdAt: createdAt(),
});

export const season = pgTable(
  "season",
  {
    id: id(),
    /** "2026-27" */
    schoolYear: text("school_year").notNull(),
    term: termEnum("term").notNull(),
    createdAt: createdAt(),
  },
  (t) => [uniqueIndex("season_year_term").on(t.schoolYear, t.term)],
);

export const sport = pgTable("sport", {
  id: id(),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  createdAt: createdAt(),
});

export type TeamRecord = {
  overall?: string;
  league?: string;
  leagueRank?: number;
  pointsFor?: number;
  pointsAgainst?: number;
  home?: string;
  away?: string;
  streak?: string;
  lastThree?: string;
  note?: string;
};

export const team = pgTable(
  "team",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => school.id),
    sportId: uuid("sport_id")
      .notNull()
      .references(() => sport.id),
    seasonId: uuid("season_id")
      .notNull()
      .references(() => season.id),
    level: levelEnum("level").notNull(),
    /** Sport slug within the school, e.g. "football"; level is separate. */
    slug: text("slug").notNull(),
    /** Record cache (SPEC §5). Values are as published; unknown keys are absent. */
    record: jsonb("record").$type<TeamRecord>().notNull().default({}),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("team_school_sport_season_level").on(t.schoolId, t.sportId, t.seasonId, t.level)],
);

// ---------------------------------------------------------------- people (Better Auth tables)

/** Better Auth's user table, renamed. psd401.net accounts only (lib/auth). */
export const person = pgTable("person", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull().default(false),
  image: text("image"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const session = pgTable(
  "session",
  {
    id: text("id").primaryKey(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    token: text("token").notNull().unique(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("session_user").on(t.userId)],
);

export const account = pgTable(
  "account",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: timestamp("access_token_expires_at", { withTimezone: true }),
    refreshTokenExpiresAt: timestamp("refresh_token_expires_at", { withTimezone: true }),
    scope: text("scope"),
    password: text("password"),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [index("account_user").on(t.userId)],
);

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const roleAssignment = pgTable(
  "role_assignment",
  {
    id: id(),
    personId: text("person_id")
      .notNull()
      .references(() => person.id, { onDelete: "cascade" }),
    role: roleEnum("role").notNull(),
    schoolId: text("school_id").references(() => school.id),
    teamId: uuid("team_id").references(() => team.id),
    startsOn: date("starts_on").notNull(),
    endsOn: date("ends_on"),
    /** Where the assignment came from, e.g. "manual" or the HR feed (QUESTIONS 5). */
    source: text("source").notNull(),
    createdAt: createdAt(),
  },
  (t) => [
    index("role_assignment_person").on(t.personId),
    // District AD spans both schools; school roles need a school; team roles need a team.
    check(
      "role_assignment_scope",
      sql`(${t.role} = 'district_ad')
        or (${t.role} in ('school_ad', 'secretary') and ${t.schoolId} is not null and ${t.teamId} is null)
        or (${t.role} in ('head_coach', 'assistant_coach', 'photographer') and ${t.teamId} is not null)`,
    ),
    check("role_assignment_dates", sql`${t.endsOn} is null or ${t.endsOn} >= ${t.startsOn}`),
  ],
);

// ---------------------------------------------------------------- schedule

export const venue = pgTable("venue", {
  id: id(),
  name: text("name").notNull(),
  address: text("address"),
  mapsUrl: text("maps_url"),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const game = pgTable(
  "game",
  {
    id: id(),
    arbiterId: text("arbiter_id").unique(),
    teamId: uuid("team_id")
      .notNull()
      .references(() => team.id),
    opponent: text("opponent").notNull(),
    homeAway: homeAwayEnum("home_away").notNull(),
    /** Pacific calendar date. */
    startDate: date("start_date").notNull(),
    /** Pacific wall-clock time; null when the source doesn't list one. */
    startTime: time("start_time"),
    venueId: uuid("venue_id").references(() => venue.id),
    status: gameStatusEnum("status").notNull().default("scheduled"),
    scoreUs: integer("score_us"),
    scoreThem: integer("score_them"),
    /** Null when the source doesn't say. */
    isLeague: boolean("is_league"),
    /** "The Fish Bowl" */
    label: text("label"),
    streamUrl: text("stream_url"),
    ticketUrl: text("ticket_url"),
    source: dataSourceEnum("source").notNull(),
    lastSyncedAt: timestamp("last_synced_at", { withTimezone: true }),
    updatedFields: text("updated_fields").array().notNull().default(sql`'{}'::text[]`),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("game_team_date").on(t.teamId, t.startDate),
    index("game_date").on(t.startDate),
    check("game_scores_pair", sql`(${t.scoreUs} is null) = (${t.scoreThem} is null)`),
    check("game_scores_nonnegative", sql`${t.scoreUs} is null or (${t.scoreUs} >= 0 and ${t.scoreThem} >= 0)`),
    check("game_final_has_score", sql`${t.status} <> 'final' or ${t.scoreUs} is not null`),
  ],
);

export const rule = pgTable("rule", {
  id: id(),
  kind: ruleKindEnum("kind").notNull(),
  schoolId: text("school_id").references(() => school.id),
  teamId: uuid("team_id").references(() => team.id),
  settings: jsonb("settings").$type<Record<string, unknown>>().notNull().default({}),
  updatedBy: text("updated_by").references(() => person.id),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const scheduleChange = pgTable(
  "schedule_change",
  {
    id: id(),
    gameId: uuid("game_id")
      .notNull()
      .references(() => game.id),
    field: text("field").notNull(),
    oldValue: text("old_value"),
    newValue: text("new_value"),
    source: dataSourceEnum("source").notNull(),
    matchedLeagueSite: boolean("matched_league_site").notNull().default(false),
    status: changeStatusEnum("status").notNull().default("pending"),
    ruleId: uuid("rule_id").references(() => rule.id),
    decidedBy: text("decided_by").references(() => person.id),
    decidedAt: timestamp("decided_at", { withTimezone: true }),
    detectedAt: timestamp("detected_at", { withTimezone: true }).notNull().defaultNow(),
    createdAt: createdAt(),
  },
  (t) => [index("schedule_change_game").on(t.gameId)],
);

// ---------------------------------------------------------------- content and media

export const album = pgTable("album", {
  id: id(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => team.id),
  gameId: uuid("game_id").references(() => game.id),
  title: text("title").notNull(),
  /** Not a foreign key: photo references album, so this would be circular. */
  coverPhotoId: uuid("cover_photo_id"),
  status: albumStatusEnum("status").notNull().default("draft"),
  createdBy: text("created_by")
    .notNull()
    .references(() => person.id),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export type PhotoSizes = Partial<Record<"thumb" | "card" | "full", { key: string; width: number; height: number }>>;

export const photo = pgTable(
  "photo",
  {
    id: id(),
    albumId: uuid("album_id")
      .notNull()
      .references(() => album.id),
    /** Key of the stripped derivative set; the private original is separate. */
    storageKey: text("storage_key").notNull(),
    sizes: jsonb("sizes").$type<PhotoSizes>().notNull().default({}),
    width: integer("width").notNull(),
    height: integer("height").notNull(),
    takenAt: timestamp("taken_at", { withTimezone: true }),
    altText: text("alt_text"),
    credit: text("credit"),
    heldReason: text("held_reason"),
    hiddenReason: text("hidden_reason"),
    uploadedBy: text("uploaded_by")
      .notNull()
      .references(() => person.id),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [
    index("photo_album").on(t.albumId),
    // Every published photo needs an image description (CLAUDE.md, SPEC §7).
    check("photo_published_has_alt", sql`${t.publishedAt} is null or coalesce(length(trim(${t.altText})), 0) > 0`),
  ],
);

export const photoReport = pgTable("photo_report", {
  id: id(),
  photoId: uuid("photo_id")
    .notNull()
    .references(() => photo.id),
  reporterContact: text("reporter_contact").notNull(),
  reason: text("reason").notNull(),
  status: reportStatusEnum("status").notNull().default("open"),
  decidedBy: text("decided_by").references(() => person.id),
  decidedAt: timestamp("decided_at", { withTimezone: true }),
  createdAt: createdAt(),
});

export const story = pgTable(
  "story",
  {
    id: id(),
    schoolId: text("school_id")
      .notNull()
      .references(() => school.id),
    teamId: uuid("team_id").references(() => team.id),
    gameId: uuid("game_id").references(() => game.id),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    summary: text("summary"),
    body: text("body").notNull(),
    status: storyStatusEnum("status").notNull().default("draft"),
    authorId: text("author_id")
      .notNull()
      .references(() => person.id),
    draftedByAgent: boolean("drafted_by_agent").notNull().default(false),
    coverPhotoId: uuid("cover_photo_id").references(() => photo.id),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("story_school_slug").on(t.schoolId, t.slug)],
);

export const feedPost = pgTable("feed_post", {
  id: id(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => team.id),
  kind: feedKindEnum("kind").notNull(),
  body: text("body"),
  gameId: uuid("game_id").references(() => game.id),
  authorId: text("author_id")
    .notNull()
    .references(() => person.id),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const feedPostPhoto = pgTable(
  "feed_post_photo",
  {
    postId: uuid("post_id")
      .notNull()
      .references(() => feedPost.id, { onDelete: "cascade" }),
    photoId: uuid("photo_id")
      .notNull()
      .references(() => photo.id),
    position: integer("position").notNull(),
  },
  (t) => [primaryKey({ columns: [t.postId, t.photoId] })],
);

export const rosterEntry = pgTable("roster_entry", {
  id: id(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => team.id),
  /** Per the district's directory-information rules. Deliberately no contact,
      medical or eligibility columns (CLAUDE.md student privacy). */
  displayName: text("display_name").notNull(),
  jerseyNumber: text("jersey_number"),
  position: text("position"),
  grade: integer("grade"),
  photoReleaseOptOut: boolean("photo_release_opt_out").notNull().default(false),
  /** Null until a coach publishes the roster entry; public pages show published entries only. */
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const document = pgTable("document", {
  id: id(),
  schoolId: text("school_id")
    .notNull()
    .references(() => school.id),
  teamId: uuid("team_id").references(() => team.id),
  title: text("title").notNull(),
  kind: text("kind").notNull(),
  url: text("url"),
  storageKey: text("storage_key"),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const sponsor = pgTable("sponsor", {
  id: id(),
  schoolId: text("school_id")
    .notNull()
    .references(() => school.id),
  teamId: uuid("team_id").references(() => team.id),
  name: text("name").notNull(),
  url: text("url"),
  logoKey: text("logo_key"),
  sort: integer("sort").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

export const coachNote = pgTable("coach_note", {
  id: id(),
  teamId: uuid("team_id")
    .notNull()
    .references(() => team.id),
  authorId: text("author_id")
    .notNull()
    .references(() => person.id),
  body: text("body").notNull(),
  publishedAt: timestamp("published_at", { withTimezone: true }),
  createdAt: createdAt(),
  updatedAt: updatedAt(),
});

// ---------------------------------------------------------------- alerts

export const follower = pgTable(
  "follower",
  {
    id: id(),
    contactKind: channelEnum("contact_kind").notNull(),
    contactValue: text("contact_value").notNull(),
    verifiedAt: timestamp("verified_at", { withTimezone: true }),
    wantsChanges: boolean("wants_changes").notNull().default(true),
    wantsFinals: boolean("wants_finals").notNull().default(false),
    stoppedAt: timestamp("stopped_at", { withTimezone: true }),
    createdAt: createdAt(),
    updatedAt: updatedAt(),
  },
  (t) => [uniqueIndex("follower_contact").on(t.contactKind, t.contactValue)],
);

export const followerTeam = pgTable(
  "follower_team",
  {
    followerId: uuid("follower_id")
      .notNull()
      .references(() => follower.id, { onDelete: "cascade" }),
    teamId: uuid("team_id")
      .notNull()
      .references(() => team.id),
  },
  (t) => [primaryKey({ columns: [t.followerId, t.teamId] })],
);

export const alertMessage = pgTable(
  "alert_message",
  {
    id: id(),
    followerId: uuid("follower_id")
      .notNull()
      .references(() => follower.id),
    channel: channelEnum("channel").notNull(),
    kind: alertKindEnum("kind").notNull(),
    gameId: uuid("game_id").references(() => game.id),
    body: text("body").notNull(),
    status: alertStatusEnum("status").notNull().default("queued"),
    sentAt: timestamp("sent_at", { withTimezone: true }),
    providerId: text("provider_id"),
    createdAt: createdAt(),
  },
  (t) => [index("alert_message_status").on(t.status)],
);

// ---------------------------------------------------------------- agents and audit

export const agentConnection = pgTable("agent_connection", {
  id: id(),
  personId: text("person_id")
    .notNull()
    .references(() => person.id, { onDelete: "cascade" }),
  clientName: text("client_name").notNull(),
  scopes: text("scopes").array().notNull().default(sql`'{}'::text[]`),
  expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
  revokedAt: timestamp("revoked_at", { withTimezone: true }),
  createdAt: createdAt(),
});

/** Append-only. Only the undo columns are ever updated. */
export const auditLog = pgTable(
  "audit_log",
  {
    id: id(),
    actorPersonId: text("actor_person_id")
      .notNull()
      .references(() => person.id),
    agentConnectionId: uuid("agent_connection_id").references(() => agentConnection.id),
    verb: text("verb").notNull(),
    objectType: text("object_type").notNull(),
    objectId: text("object_id").notNull(),
    schoolId: text("school_id").references(() => school.id),
    teamId: uuid("team_id").references(() => team.id),
    before: jsonb("before"),
    after: jsonb("after"),
    undoUntil: timestamp("undo_until", { withTimezone: true }),
    undoneBy: text("undone_by").references(() => person.id),
    undoneAt: timestamp("undone_at", { withTimezone: true }),
    createdAt: createdAt(),
  },
  (t) => [index("audit_log_object").on(t.objectType, t.objectId), index("audit_log_actor").on(t.actorPersonId)],
);
