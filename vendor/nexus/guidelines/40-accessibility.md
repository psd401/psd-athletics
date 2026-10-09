# Accessibility

Nexus is built for district staff and families with a wide range of abilities, devices and settings. These are requirements, not aspirations.

- **Contrast.** Every text token passes 4.5:1 on the grounds its usage note names, in all five themes (7:1 in High Contrast). Borders on controls, focus rings, icons and chart marks pass 3:1. The one deliberate exception is the `chart-4` context series, which is always labelled.
- **Never color alone.** Status uses a word or icon. Flow and attention differ in hue and lightness and carry labels. Tracked changes use strike and underline styling as well as their tints. Charts label watched marks.
- **Focus.** A 2px solid `focus` ring at a 2px offset on every interactive element (`focus-on-header` in the header). Never remove outlines without a replacement.
- **Keyboard and screen readers.** Use native elements first. Dialogs trap focus and return it on close. `WorkSteps` and `StatusStrip` are polite live regions; errors are assertive. Icon buttons have labels. Charts have a summary label and a table alternative.
- **Motion.** Honor `prefers-reduced-motion` and Reduce Motion: no spinning rings (show static text), no ribbon drift, no shimmer, and cross-fades instead of slides.
- **Text size.** Support 200% browser zoom and Dynamic Type through AX5 on iOS. Layouts reflow; nothing truncates important meaning.
- **Targets.** 40px minimum on pointer web, 44pt on touch.
- **Language.** Plain language at about a grade 6–8 reading level for family-facing text; the agent reports the reading level in `DirectionCompare`. Set `lang` on translated content.
- **Voice and time.** Voice input always has a typed alternative. Undo windows and permission durations are stated in words and can be extended.
