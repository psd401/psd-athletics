# Motion

Nexus moves like water through a channel. Things flow toward agreement, the agent's work glows and streams while it happens, and results settle into place. Motion always explains what changed and where it went, never decorates, and it stops completely when people ask it to.

## The motion language

| Moment | What moves | Component | Tokens |
| --- | --- | --- | --- |
| The agent is thinking | its glyph's dots drift; a live dot breathes | `AgentThinking`, `LiveDot` | `ease-flow`, 2.4s |
| The agent is working on something | a flowing border on that element; a sweeping line on the card or header | `AgentGlow`, `LiveLine` | `duration-glow`, 1.8s sweep |
| The agent is speaking | words stream in, unblurring, with a caret | `StreamText` | 45ms per word, `duration-base` |
| Data is moving | dashes and particles flow along ribbons, source → outcome | `FlowField` | `duration-flow`, `ease-flow` |
| A result resolves | ribbons draw into a node, which settles | `Converge` | 1.6s draw, `ease-spring` node |
| New items arrive | they rise in reading order | `Reveal` | `duration-base`, `duration-stagger` |
| A number changes | it counts from old to new | `CountUp` | `duration-count`, `ease-out` |
| The person applies a change | proposals travel to their place and turn solid | `ApplyMove` | 1.4s `ease-in-out` |
| Something new appeared | a one-time ring that fades | `LiveBrief` `.is-new` | `duration-highlight` |
| Something needs the person | a slow ping, never a shake | `CoverageMap` conflict | 2s `ease-out` |

## Choreography

1. **The person's action first.** Their press, choice or drag gets immediate feedback (`duration-instant` to `duration-fast`).
2. **Then the agent's work.** The glow goes on the element being changed, steps tick, and words stream.
3. **Then the result.** A reveal, count-up or converge, one hero moment at a time.
4. **Then the way back.** The Undo toast slides up last, and stays for the undo window.

Never run two hero moments at once (a converge and a count-up on the same screen); queue them about 200ms apart.

## Durations and easing

- `duration-instant` 80ms: press feedback, checkbox ticks.
- `duration-fast` 160ms, `ease-out`: hover, color, focus.
- `duration-base` 240ms, `ease-out`: menus, chips, content swaps, each staggered item.
- `duration-slow` 360ms, `ease-in-out`: sheets, drawers, rail open/close.
- `ease-spring`: only small arrivals (a chip landing, a check popping in, a count settling). Never panels, sheets or text.
- `ease-flow` with `duration-flow` / `duration-glow` / `duration-drift`: continuous ambient motion only.
- Entrances use `ease-out`, exits `ease-in` at about 75% of the entrance duration, and moves `ease-in-out`.

## Ambient motion rules

- Ambient motion (flow fields, drift, glow, breathing dots) only appears on live states and hero visualizations, never behind text, forms or tables.
- At most one continuously animating region in view (the glow and a live dot together count as one).
- Pause ambient motion when the tab is hidden or the element is off-screen (`IntersectionObserver`; `TimelineView` pauses automatically in SwiftUI).
- Hold battery in mind: on iOS Low Power Mode, treat ambient motion as reduced.

## Reduced motion

Respect `prefers-reduced-motion` and Reduce Motion everywhere. `bundle.css` sets `animation: none` under reduced motion, and every entrance animates *from* a state, so content always rests in its final, readable form. Specifically:

- Streams, particles, glow sweeps, drift and breathing stop. Ribbons stay as a static diagram, and the glow becomes a static 2px `flow` border.
- Count-ups show the final value; streaming text appears in sentences.
- Reveals, apply-moves and sheets become instant, or a 120ms cross-fade.
- Spinners become static "Working…" text.

## Platforms

- **Web:** the CSS classes above, or the React components (`Nexus.FlowField`, `AgentGlow`, `StreamText`, `CountUp`, `Reveal`, `Converge`, `ApplyMove`, `AgentThinking`), which also check reduced motion in JS.
- **iOS and macOS:** use the `NexusMotion` constants in `Nexus.swift` (`fast`, `base`, `slow`, `spring`, `pop`, `flowEase`, `reveal(index:)`), `.contentTransition(.numericText())` for count-ups, `matchedGeometryEffect` for apply-move, `Canvas` + `TimelineView` for flow fields, and `@Environment(\.accessibilityReduceMotion)` to switch them off.
- **Haptics (iOS):** light impact on apply and undo, a success notification when a long job completes, and a warning on conflicts. Never haptics for ambient motion.
