# Nexus design system

Nexus is the shared design system for PSD's agent-assisted work tools on the web, macOS, and iOS. It has five themes (Nexus, Commons, both in light and dark, and High Contrast), 203 documented components and patterns, React components for the web, and a SwiftUI package for Apple platforms.

Nexus lives in two places:

- **Live studio** ([Nexus on claude.ai](https://claude.ai/artifact/L9zua8NYVAMtqb1DKgJkBA)) is where Nexus is designed, previewed and reviewed, with comments. It's private to people it's been shared with.
- **This folder** is the permanent, versioned copy that apps build from. It includes a static **catalog** of every component, so nothing depends on the studio.

**Browse the catalog:** [https://psd401.github.io/psd-dev-standards/](https://psd401.github.io/psd-dev-standards/). It's published from `main` by `.github/workflows/nexus-catalog.yml` whenever `catalog/` or `web/` changes, and you can also open `catalog/index.html` locally. The catalog is generated from the design system artifact, so a component change is exported here (catalog included) in the same PR.

## Layout

| Path | Contents |
|------|----------|
| `tokens/tokens.json` | Source of truth: colors for all five themes, type, spacing, radii, shadows, and motion. |
| `tokens/nexus.tokens.json` | The same tokens in W3C DTCG format, for Style Dictionary, Tokens Studio, or Figma variables. |
| `web/tokens.css` | CSS custom properties per `data-theme`, plus `@font-face` rules for `web/fonts/`. |
| `web/bundle.css` | Component styles (`nx-` classes), including liquid glass and the motion system. |
| `web/bundle.js` | React 18 components (`window.Nexus`). |
| `web/index.d.ts` | TypeScript types for `bundle.js`. |
| `web/tailwind.preset.js` | Tailwind preset mapped to the CSS variables. |
| `web/fonts/` | Newsreader, Public Sans, IBM Plex Mono, and Caveat as WOFF2 files (SIL OFL, see `LICENSES.txt`). |
| `apple/NexusKit/` | Swift package for iOS 26 and macOS 26 (Swift 6). It contains tokens, `.nexusTheme`, liquid glass, the agent orb and avatar, the companion accessory, the iPhone tab shell, agent controls, the charts, the data grid and tables, the graph explorer, and the bundled TTF fonts. |
| `guidelines/` | Overview, agent patterns, data visualization, graph exploration, data tables, platform guides (web, iOS, macOS), accessibility, motion, and writing. |
| `catalog/` | A static catalog: `index.html` plus one preview page per component in `previews/`, with a theme switcher and the written guidance. It works offline. |
| `components/` | One page per component: what it's for, its anatomy, how to build it, and dos and don'ts. |

## Use it

**Web:** Load the files in this order: `web/tokens.css`, then `web/bundle.css`, then React 18, then `web/bundle.js`. Set `data-theme="nexus"`, `"commons"`, `"dark"`, `"commons-dark"`, or `"high-contrast"` on a root element. Use the `nx-` classes or `window.Nexus.*` components.

**iOS and macOS:** In Xcode, choose File > Add Package Dependencies > Add Local, and select `apple/NexusKit`. Then:

```swift
import NexusKit

@main struct MyApp: App {
    init() { NexusFonts.register() }
    var body: some Scene {
        WindowGroup { ContentView().nexusTheme(family: .nexus) }
    }
}
```

To see the components, open `apple/NexusKit/Sources/NexusKit/NexusGallery.swift` or `NexusGallery2.swift` and turn on the canvas.

## Changing Nexus

Make changes in the design system artifact first, then copy the exported files here in one pull request. Never edit `web/tokens.css` or the token files in `tokens/` by hand, because they're generated from `tokens.json`. District logos are never redrawn, recolored, or AI-generated. See `standards/10-design-system.md`.
