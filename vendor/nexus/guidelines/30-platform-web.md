# Platform: web

- **Shell.** `AppHeader` (56px) over either the Commons `Sidebar` (248px) and content, or a `RoomLayout` (rail plus main). Builder rooms add a right "Build together" panel at `panel-width`.
- **Responsive.** At ≥ `bp-lg`, the full room. Between `bp-md` and `bp-lg`, the rail collapses to an icon strip that opens as an overlay, and the right panel becomes a drawer. Below `bp-sm`, single column, with the conversation as a bottom sheet, the primary action sticky at the bottom (`z-sticky`) and a `space-4` gutter. No horizontal scroll except for tables and `ScheduleLanes`, which scroll inside their card.
- **Keyboard.** Everything is reachable by Tab, with a visible `focus` ring. ⌘K / Ctrl K opens the `CommandPalette`; Esc closes overlays; ⌘Enter sends from the `Composer`; ⌘Z undoes the last agent change while its toast is visible. Menus and tabs support arrow keys.
- **Themes.** Set `data-theme` from the person's setting, defaulting to `prefers-color-scheme` and `prefers-contrast`. Never hard-code hex values; use the tokens.
- **Performance.** Show skeletons only for the first 2s, then switch to a labelled building state. Stream agent output into `WorkSteps` rather than blocking.
- **Printing and export.** Rooms print on `surface-raised` with the trust footer, sources and date in the page footer. Family-facing documents use `letter` type at `reading-max`, and may carry the district lockup from the `District` asset group.
