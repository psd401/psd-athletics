// Nexus Tailwind preset. Load tokens.css first; colors resolve per data-theme.
// tailwind.config.js: module.exports = { presets: [require("./tailwind.preset.js")] }
module.exports = {
  "theme": {
    "extend": {
      "colors": {
        "surface-canvas": "var(--surface-canvas)",
        "surface-raised": "var(--surface-raised)",
        "surface-sunken": "var(--surface-sunken)",
        "surface-hover": "var(--surface-hover)",
        "surface-selected": "var(--surface-selected)",
        "surface-header": "var(--surface-header)",
        "on-header": "var(--on-header)",
        "on-header-muted": "var(--on-header-muted)",
        "surface-inverse": "var(--surface-inverse)",
        "on-inverse": "var(--on-inverse)",
        "scrim": "var(--scrim)",
        "ink": "var(--ink)",
        "ink-muted": "var(--ink-muted)",
        "ink-subtle": "var(--ink-subtle)",
        "ink-disabled": "var(--ink-disabled)",
        "line": "var(--line)",
        "line-strong": "var(--line-strong)",
        "action": "var(--action)",
        "action-hover": "var(--action-hover)",
        "on-action": "var(--on-action)",
        "accent": "var(--accent)",
        "focus": "var(--focus)",
        "focus-on-header": "var(--focus-on-header)",
        "flow": "var(--flow)",
        "flow-soft": "var(--flow-soft)",
        "flow-ink": "var(--flow-ink)",
        "agent": "var(--agent)",
        "on-agent": "var(--on-agent)",
        "attention": "var(--attention)",
        "attention-soft": "var(--attention-soft)",
        "attention-ink": "var(--attention-ink)",
        "success": "var(--success)",
        "success-soft": "var(--success-soft)",
        "success-ink": "var(--success-ink)",
        "warning": "var(--warning)",
        "warning-soft": "var(--warning-soft)",
        "warning-ink": "var(--warning-ink)",
        "danger": "var(--danger)",
        "danger-soft": "var(--danger-soft)",
        "danger-ink": "var(--danger-ink)",
        "on-danger": "var(--on-danger)",
        "info": "var(--info)",
        "info-soft": "var(--info-soft)",
        "info-ink": "var(--info-ink)",
        "chart-1": "var(--chart-1)",
        "chart-2": "var(--chart-2)",
        "chart-3": "var(--chart-3)",
        "chart-4": "var(--chart-4)",
        "chart-5": "var(--chart-5)",
        "chart-6": "var(--chart-6)",
        "chart-grid": "var(--chart-grid)",
        "person-1": "var(--person-1)",
        "person-2": "var(--person-2)",
        "person-3": "var(--person-3)",
        "person-4": "var(--person-4)",
        "glass-fill": "var(--glass-fill)",
        "glass-fill-strong": "var(--glass-fill-strong)",
        "glass-rim": "var(--glass-rim)",
        "glass-edge": "var(--glass-edge)",
        "glass-selected": "var(--glass-selected)",
        "backdrop-1": "var(--backdrop-1)",
        "backdrop-2": "var(--backdrop-2)"
      },
      "fontFamily": {
        "display": [
          "\"Newsreader\", \"New York\", \"Source Serif 4\", Georgia, serif"
        ],
        "sans": [
          "\"Public Sans\", -apple-system, \"Segoe UI\", system-ui, sans-serif"
        ],
        "mono": [
          "\"IBM Plex Mono\", ui-monospace, \"SF Mono\", Menlo, monospace"
        ],
        "hand": [
          "\"Caveat\", \"Segoe Print\", cursive"
        ]
      },
      "spacing": {
        "0.5": "2px",
        "1": "4px",
        "2": "8px",
        "3": "12px",
        "4": "16px",
        "5": "20px",
        "6": "24px",
        "8": "32px",
        "10": "40px",
        "12": "48px",
        "16": "64px",
        "20": "80px",
        "24": "96px"
      },
      "borderRadius": {
        "xs": "4px",
        "sm": "6px",
        "md": "10px",
        "lg": "16px",
        "window": "12px",
        "glass": "22px",
        "window-lg": "26px",
        "xl": "24px",
        "sheet": "28px",
        "pill": "999px"
      },
      "boxShadow": {
        "card": "var(--shadow-card)",
        "pop": "var(--shadow-pop)",
        "overlay": "var(--shadow-overlay)",
        "inset": "var(--shadow-inset)",
        "glass": "var(--shadow-glass)"
      },
      "zIndex": {
        "base": "0",
        "raised": "10",
        "sticky": "100",
        "header": "200",
        "dropdown": "1000",
        "popover": "1100",
        "overlay": "1200",
        "modal": "1300",
        "toast": "1400",
        "tooltip": "1500"
      },
      "transitionDuration": {
        "instant": "80ms",
        "fast": "160ms",
        "base": "240ms",
        "slow": "360ms",
        "spin": "1200ms",
        "drift": "14000ms",
        "stagger": "60ms",
        "count": "900ms",
        "flow": "2400ms",
        "glow": "3200ms",
        "highlight": "2400ms"
      },
      "transitionTimingFunction": {
        "ease-out": "cubic-bezier(0.2, 0, 0, 1)",
        "ease-in": "cubic-bezier(0.4, 0, 1, 1)",
        "ease-in-out": "cubic-bezier(0.4, 0, 0.2, 1)",
        "ease-linear": "linear",
        "ease-spring": "cubic-bezier(0.34, 1.32, 0.64, 1)",
        "ease-flow": "cubic-bezier(0.45, 0.05, 0.55, 0.95)"
      },
      "screens": {
        "sm": "600px",
        "md": "900px",
        "lg": "1200px",
        "xl": "1600px"
      }
    }
  }
};
