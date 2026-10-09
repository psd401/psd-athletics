# Agent patterns

Every Nexus product shares one interaction contract between a person and the agent. Use these patterns before inventing new ones.

## The turn lifecycle

1. **Ask.** The person asks in their own words, through `Composer` (type, talk or point) or `VoiceInput`. The agent may ask back once, and only when the answer changes the result: `ChoiceChips` for one quick choice inline, or `AskUserQuestion` when there are several questions, options need explaining, or a preview helps.
2. **Pin the frame.** The decisions that shape the result become `ContextChip`s under the room title, each with its source ("from Morgan's request", "confirmed"). Changing a chip re-runs the work.
3. **Work visibly.** While it works, the agent shows `WorkSteps` (concrete, counted steps) and a `StatusStrip` (sources, current step, ETA), with `Stop` and `Redirect` always available. When several agents contribute, show a `SpecialistList`, and make any disagreement visible with `AgentDissent`.
4. **Show, provisionally.** First results carry a `Provisional` badge and a building state. Every claim traces to a `SourceTrail`. Analyses that could be read as causal end with a `ClaimPair`.
5. **Propose, don't apply.** Changes to text are shown as `InlineSuggestion` or `RevisionCompare` (with the tradeoff named); alternatives as `DirectionCompare`. Changes to records (schedules, rosters) are shown as dashed proposals in place.
6. **The person decides.** One primary action per view. Consequential steps use a `DecisionCard` or `Modal` that states who is affected, the count, and whether it can be undone.
7. **Undo and remember.** Every applied change gets a `Toast` with Undo and a stated window. Versions accumulate in `VersionPath` ("Nothing is lost"), and the work's history becomes a `StoryTimeline`.
8. **Come back.** `ResumeCard` and the `CommandPalette` bring people back to the exact decision they left, and `WorkQueue` shows what's running quietly.

## Showing the agent is alive

Use the motion components (see the motion section) to make agent state legible at a glance: `AgentThinking` while reasoning, `AgentGlow` on the exact element it's changing, `StreamText` while it speaks, `Converge` or `CountUp` when a result lands, and `ApplyMove` when the person accepts changes. One live region at a time.

## The trust contract

- **Scope is always visible.** Every screen that reads or drafts district data carries a `TrustFooter`: state (Draft only / Private analysis / Live), data scope (no student names shown / roster-scoped) and side effects (nothing shared / no invitations sent).
- **Access is narrow and temporary.** The agent asks for access with a `PermissionRequest`: one system, read-only by default, time-boxed ("Allow for 10 minutes"), tied to a sentence the person can verify, and paired with the list of what stays out of reach.
- **Small groups stay private.** Suppress cells and marks below the room's privacy threshold, and say why ("Hidden: group under 10").
- **No silent changes.** The agent never sends, publishes, schedules or notifies on its own. The `StatusStrip` announces every element it adds, with Undo.
- **Humans are named; agents are roles.** Agents get role names ("Transportation agent"), the `agent` color and the three-dot glyph, never a face or a human name.

## Choosing the container

| Situation | Use |
| --- | --- |
| A question with a one-number answer | `StatTile` + `ClaimPair` in a `RoomLayout` |
| An analysis to share with leaders | `RoomLayout` with `ContextChip`s, charts, `BottomBar` |
| Drafting a letter or form | Document room: draft at `reading-max`, `InlineSuggestion`, `RevisionCompare` |
| Reworking a schedule | `ScheduleLanes` with dashed proposals, a conflict `Popover`, "Apply to shared schedule" |
| Something needs a decision today | `DecisionCard` in Waiting for me, plus a notification on iOS |
| Long-running background work | `WorkQueue`, the macOS menu bar extra, an iOS Live Activity |
| Picking up later | `ResumeCard`, `CommandPalette` (⌘K), `StoryTimeline`, `JourneyTimeline` |
| A fast-moving situation (weather, incident) | `LiveBrief` + `EvidenceCard` + `DecisionOptions` with `ParticipantStrip` |
| A leader's queue of approvals | `ConsequenceDecision` cards, `TeamOrbit` overview, `NotificationCenter` |
| An ambient helper across mail, calendar and files | `NoticePanel` (with Pause), `DayStream` morning view |
| The agent working inside another app | `AgentActionBar` (Interrupt · Undo · Review) |
| Rebalancing sections, staff or routes | `ReflowDiagram`, `CoverageMap`, `ScheduleLanes`, `ApplyMove` |
| A repeatable report | `RulePipeline`, then "Save as a repeatable report" |
| Transforming protected text (IEP goals, policy) | `LockedSource` |
| Learning someone's writing voice | `PreferenceDelta` (always ask before saving) |
| Planning a session | `AgendaBlocks` with citations and protected content |
| Co-editing a document | `CheckpointBar`, `InlineSuggestion`, `CommentThread`, `TranslationPair` |
| Building something with the agent | `BuilderPanel` |
| Showing what the agent is doing right now | `AgentAvatar` + `AgentStatusLine` (`AgentPresence`) |
| Before a multi-step job | `PlanPreview` (edit, skip, reorder; writes shown in amber) |
| Adding instructions mid-task | `SteerQueue` |
| A person taking the wheel | `TakeoverBar` |
| Showing exactly what was run | `ToolCallCard` |
| Something failed | `AgentErrorRecovery` (say what's safe, offer choices) |
| Work on a schedule | `StandingTask` (read-only by default) |
| Teaching the agent | `OutputFeedback` → `MemoryGoals` |
| What the agent did and remembers | `AgentActivityLog`, `MemoryGoals` |

## Presence

The agent has one face everywhere: `AgentAvatar`. Its twelve states (Ready, Listening, Thinking, Reading, Searching, Writing, Calculating, Talking, Waiting on you, Done, Stuck, Paused) are always paired with words in `AgentStatusLine`: verb + object + scope, then progress. Only one avatar per screen animates at full strength. Reduced Motion shows the state glyph without motion.

## Control

People can always see the plan before it runs, steer without stopping, take over with one action (⌘.), see every tool call, and undo changes from the activity log. Nothing the agent learns is hidden: memories need a yes, and can be edited or forgotten.

