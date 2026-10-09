/* @ds-bundle: {"format":4,"namespace":"Nexus","components":[{"name":"ThemeProvider"},{"name":"LiquidGlass"},{"name":"Icon"},{"name":"Landscape"},{"name":"Kbd"},{"name":"Divider"},{"name":"Link"},{"name":"Button"},{"name":"IconButton"},{"name":"ButtonGroup"},{"name":"SegmentedControl"},{"name":"Toolbar"},{"name":"BulkActionBar"},{"name":"TextField"},{"name":"TextArea"},{"name":"Select"},{"name":"Combobox"},{"name":"SearchField"},{"name":"FacetChips"},{"name":"FilterBar"},{"name":"Checkbox"},{"name":"RadioGroup"},{"name":"Switch"},{"name":"Slider"},{"name":"NumberStepper"},{"name":"DatePicker"},{"name":"FileDrop"},{"name":"AppHeader"},{"name":"Sidebar"},{"name":"Tabs"},{"name":"Breadcrumbs"},{"name":"Pagination"},{"name":"Wizard"},{"name":"CommandPalette"},{"name":"ProfileMenu"},{"name":"RoomLayout"},{"name":"RoomTitle"},{"name":"Card"},{"name":"BottomBar"},{"name":"DashboardGrid"},{"name":"BuilderPanel"},{"name":"SettingsPage"},{"name":"SignIn"},{"name":"Modal"},{"name":"AlertDialog"},{"name":"Drawer"},{"name":"Popover"},{"name":"Menu"},{"name":"Tooltip"},{"name":"Coachmark"},{"name":"Badge"},{"name":"Count"},{"name":"Banner"},{"name":"Toast"},{"name":"NotificationCenter"},{"name":"ProgressBar"},{"name":"ProgressRing"},{"name":"Spinner"},{"name":"Skeleton"},{"name":"EmptyState"},{"name":"ErrorState"},{"name":"Avatar"},{"name":"Facepile"},{"name":"PresenceTag"},{"name":"Mention"},{"name":"CommentThread"},{"name":"DataTable"},{"name":"ListRow"},{"name":"KeyValue"},{"name":"StatTile"},{"name":"Accordion"},{"name":"ActivityTimeline"},{"name":"AttachmentChip"},{"name":"CalendarWeek"},{"name":"Prose"},{"name":"CodeBlock"},{"name":"DataGrid"},{"name":"DataGridCells"},{"name":"DataGridColumns"},{"name":"DataGridGrouping"},{"name":"DataGridEditing"},{"name":"DataGridStates"},{"name":"PivotTable"},{"name":"ColumnProfile"},{"name":"DiffTable"},{"name":"DataCards"},{"name":"DotPlot"},{"name":"BarChart"},{"name":"LineChart"},{"name":"Sparkline"},{"name":"SmallMultiples"},{"name":"Heatmap"},{"name":"ChartLegend"},{"name":"ChartTooltip"},{"name":"StackedBarChart"},{"name":"DumbbellChart"},{"name":"SlopeChart"},{"name":"ScatterQuadrant"},{"name":"Histogram"},{"name":"CalendarHeatmap"},{"name":"StackedAreaChart"},{"name":"WaterfallChart"},{"name":"BulletChart"},{"name":"SchoolMap"},{"name":"BeforeAfter"},{"name":"FlowRibbons"},{"name":"ReflowDiagram"},{"name":"RulePipeline"},{"name":"ScheduleLanes"},{"name":"CoverageMap"},{"name":"CadenceTimeline"},{"name":"GraphCanvas"},{"name":"GraphNode"},{"name":"GraphEdge"},{"name":"GraphInspector"},{"name":"GraphQueryBar"},{"name":"GraphPath"},{"name":"GraphLegend"},{"name":"GraphTable"},{"name":"GraphExplorer"},{"name":"AgentMessage"},{"name":"Composer"},{"name":"VoiceInput"},{"name":"ChoiceChips"},{"name":"AskUserQuestion"},{"name":"ContextChip"},{"name":"WorkSteps"},{"name":"StatusStrip"},{"name":"SpecialistList"},{"name":"AgentActionBar"},{"name":"AgentAvatar"},{"name":"AgentPresence"},{"name":"PlanPreview"},{"name":"SteerQueue"},{"name":"TakeoverBar"},{"name":"ToolCallCard"},{"name":"AgentErrorRecovery"},{"name":"StandingTask"},{"name":"OutputFeedback"},{"name":"DecisionCard"},{"name":"ConsequenceDecision"},{"name":"DecisionOptions"},{"name":"ParticipantStrip"},{"name":"AgentDissent"},{"name":"ClaimPair"},{"name":"PermissionRequest"},{"name":"InlineSuggestion"},{"name":"RevisionCompare"},{"name":"DirectionCompare"},{"name":"PreferenceDelta"},{"name":"LockedSource"},{"name":"TranslationPair"},{"name":"CheckpointBar"},{"name":"VersionPath"},{"name":"AgendaBlocks"},{"name":"LiveBrief"},{"name":"EvidenceCard"},{"name":"SourceTrail"},{"name":"TrustFooter"},{"name":"WorkQueue"},{"name":"ResumeCard"},{"name":"StoryTimeline"},{"name":"JourneyTimeline"},{"name":"ArtifactList"},{"name":"ThreadList"},{"name":"DayStream"},{"name":"NoticePanel"},{"name":"TeamOrbit"},{"name":"AgentActivityLog"},{"name":"MemoryGoals"},{"name":"MotionTokens"},{"name":"FlowField"},{"name":"AgentGlow"},{"name":"AgentThinking"},{"name":"StreamText"},{"name":"CountUp"},{"name":"Reveal"},{"name":"Converge"},{"name":"ApplyMove"},{"name":"IOSRoom"},{"name":"IOSNavBar"},{"name":"IOSTabBar"},{"name":"IOSList"},{"name":"IOSSheet"},{"name":"IOSActionSheet"},{"name":"IOSNotification"},{"name":"IOSWidget"},{"name":"IOSLiveActivity"},{"name":"IOSAskSheet"},{"name":"IOSCompanion"},{"name":"IOSDecisionDeck"},{"name":"IOSSearch"},{"name":"IOSGraphBrowser"},{"name":"IPadSplitView"},{"name":"MacWindow"},{"name":"MacToolbar"},{"name":"MacSidebar"},{"name":"MacInspector"},{"name":"MacSheet"},{"name":"MacSettings"},{"name":"MacMenuBarExtra"},{"name":"MacQuickAsk"},{"name":"MacGraphExplorer"}]} */
(function () {
  var React = window.React;
  var h = React.createElement, Fragment = React.Fragment;
  function cx() { var o = []; for (var i = 0; i < arguments.length; i++) { var a = arguments[i]; if (a) o.push(a); } return o.join(' '); }
  function rest(p, omit) { var o = {}; for (var k in p) { if (omit.indexOf(k) < 0) o[k] = p[k]; } return o; }
  var ICONS = {"check": "<path d=\"M20 6 9 17l-5-5\"/>", "arrow": "<path d=\"M5 12h14M13 6l6 6-6 6\"/>", "back": "<path d=\"M15 18l-6-6 6-6\"/>", "chev": "<path d=\"m9 18 6-6-6-6\"/>", "down": "<path d=\"m6 9 6 6 6-6\"/>", "x": "<path d=\"M18 6 6 18M6 6l12 12\"/>", "plus": "<path d=\"M12 5v14M5 12h14\"/>", "more": "<circle cx=\"5\" cy=\"12\" r=\"1\"/><circle cx=\"12\" cy=\"12\" r=\"1\"/><circle cx=\"19\" cy=\"12\" r=\"1\"/>", "users": "<circle cx=\"9\" cy=\"8\" r=\"3.5\"/><path d=\"M2.5 20a6.5 6.5 0 0 1 13 0\"/><path d=\"M16 4.5a3.5 3.5 0 0 1 0 7M21.5 20a6.5 6.5 0 0 0-4-6\"/>", "user": "<circle cx=\"12\" cy=\"8\" r=\"4\"/><path d=\"M4 21a8 8 0 0 1 16 0\"/>", "cal": "<rect x=\"3.5\" y=\"5\" width=\"17\" height=\"15\" rx=\"2\"/><path d=\"M3.5 10h17M8 3v4M16 3v4\"/>", "chart": "<path d=\"M5 20V12M10 20V6M15 20v-9M20 20V9\"/>", "shield": "<path d=\"M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z\"/>", "pin": "<path d=\"M9 4h6l-1 6 3 3H7l3-3zM12 13v7\"/>", "lock": "<rect x=\"5\" y=\"11\" width=\"14\" height=\"9\" rx=\"2\"/><path d=\"M8 11V8a4 4 0 0 1 8 0v3\"/>", "clip": "<path d=\"m20 11.5-8.2 8.2a5 5 0 0 1-7.1-7.1l8.5-8.5a3.3 3.3 0 0 1 4.7 4.7l-8.5 8.5a1.7 1.7 0 0 1-2.4-2.4l7.8-7.8\"/>", "mic": "<rect x=\"9\" y=\"3\" width=\"6\" height=\"11\" rx=\"3\"/><path d=\"M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21\"/>", "send": "<path d=\"M5 12h13M12 5l7 7-7 7\"/>", "stop": "<rect x=\"6\" y=\"6\" width=\"12\" height=\"12\" rx=\"2\" fill=\"currentColor\"/>", "pause": "<path d=\"M9 5v14M15 5v14\"/>", "undo": "<path d=\"M9 14 4 9l5-5\"/><path d=\"M4 9h10.5a5.5 5.5 0 0 1 0 11H11\"/>", "search": "<circle cx=\"11\" cy=\"11\" r=\"7\"/><path d=\"m20 20-3.5-3.5\"/>", "home": "<path d=\"M3 11 12 4l9 7\"/><path d=\"M5 10v10h14V10\"/>", "clock": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5V12l3 2\"/>", "doc": "<path d=\"M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z\"/><path d=\"M14 3v5h5M8.5 13h7M8.5 16.5h5\"/>", "folder": "<path d=\"M3.5 6.5A1.5 1.5 0 0 1 5 5h4l2 2.5h8A1.5 1.5 0 0 1 20.5 9v9a1.5 1.5 0 0 1-1.5 1.5H5A1.5 1.5 0 0 1 3.5 18z\"/>", "bell": "<path d=\"M6 16V11a6 6 0 0 1 12 0v5l1.5 2h-15z\"/><path d=\"M10 20.5a2 2 0 0 0 4 0\"/>", "gear": "<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M5.3 18.7l2.1-2.1M16.6 7.4l2.1-2.1\"/>", "help": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M9.5 9.5a2.5 2.5 0 1 1 3.5 2.3c-.6.3-1 .9-1 1.6v.6M12 17h.01\"/>", "info": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 11v5.5M12 7.8h.01\"/>", "alert": "<path d=\"M12 3.5 2.5 20h19z\"/><path d=\"M12 10v4.5M12 17.3h.01\"/>", "checkc": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"m8.5 12 2.5 2.5 4.5-5\"/>", "excl": "<circle cx=\"12\" cy=\"12\" r=\"8.5\"/><path d=\"M12 7.5v5.5M12 16.3h.01\"/>", "upload": "<path d=\"M12 16V4M7 9l5-5 5 5\"/><path d=\"M4 16v3.5h16V16\"/>", "filter": "<path d=\"M4 5h16l-6 7.5V19l-4 1.5v-8z\"/>", "bus": "<rect x=\"4.5\" y=\"3.5\" width=\"15\" height=\"14\" rx=\"2.5\"/><path d=\"M4.5 10.5h15M8 17.5V20M16 17.5V20M8 14h.01M16 14h.01\"/>", "cloud": "<path d=\"M7 18.5a4.5 4.5 0 1 1 .7-8.9A6 6 0 0 1 19 11.5a3.5 3.5 0 0 1-.5 7z\"/>", "scale": "<path d=\"M12 4v16M7 20h10M5 8h14M5 8l-2.5 6a2.5 2.5 0 0 0 5 0zM19 8l-2.5 6a2.5 2.5 0 0 0 5 0z\"/>", "link": "<path d=\"M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1\"/><path d=\"M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1\"/>", "eye": "<path d=\"M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z\"/><circle cx=\"12\" cy=\"12\" r=\"2.8\"/>", "edit": "<path d=\"M4 20h4L19 9l-4-4L4 16z\"/><path d=\"m13.5 6.5 4 4\"/>", "trash": "<path d=\"M4.5 7h15M9.5 7V4.5h5V7M6.5 7l1 13h9l1-13\"/>", "copy": "<rect x=\"8.5\" y=\"8.5\" width=\"11\" height=\"11\" rx=\"2\"/><path d=\"M15.5 8.5V5.5a1.5 1.5 0 0 0-1.5-1.5H5.5A1.5 1.5 0 0 0 4 5.5V14a1.5 1.5 0 0 0 1.5 1.5h3\"/>", "share": "<path d=\"M12 3.5v11M7.5 8 12 3.5 16.5 8\"/><path d=\"M5 12.5v7h14v-7\"/>", "sidebar": "<rect x=\"3.5\" y=\"4.5\" width=\"17\" height=\"15\" rx=\"2\"/><path d=\"M9.5 4.5v15\"/>", "sparkle": "<path d=\"M12 3.5 13.8 10.2 20.5 12l-6.7 1.8L12 20.5l-1.8-6.7L3.5 12l6.7-1.8z\"/>", "book": "<path d=\"M4.5 5.5A2 2 0 0 1 6.5 3.5h13v15h-13a2 2 0 0 0-2 2z\"/><path d=\"M4.5 20.5V5.5M19.5 18.5v2h-13\"/>", "chat": "<path d=\"M4.5 5.5h15v10h-9l-4.5 4v-4h-1.5z\"/>", "inbox": "<path d=\"M3.5 13.5 6 5h12l2.5 8.5V19h-17z\"/><path d=\"M3.5 13.5H9l1 2h4l1-2h5.5\"/>", "sliders": "<path d=\"M4 7h10M18 7h2M4 17h4M12 17h8\"/><circle cx=\"16\" cy=\"7\" r=\"2\"/><circle cx=\"10\" cy=\"17\" r=\"2\"/>", "db": "<ellipse cx=\"12\" cy=\"6\" rx=\"7\" ry=\"2.5\"/><path d=\"M5 6v12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5V6M5 12c0 1.4 3.1 2.5 7 2.5s7-1.1 7-2.5\"/>", "graph": "<circle cx=\"6\" cy=\"6\" r=\"2.5\"/><circle cx=\"18\" cy=\"8\" r=\"2.5\"/><circle cx=\"9\" cy=\"18\" r=\"2.5\"/><path d=\"M8.3 7 15.6 7.6M7 8.4l1.4 7.2M10.9 16.5l5.6-6.6\"/>", "expand": "<circle cx=\"12\" cy=\"12\" r=\"3\"/><path d=\"M12 3v4M12 17v4M3 12h4M17 12h4\"/>", "fit": "<path d=\"M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5\"/>", "minus": "<path d=\"M5 12h14\"/>"};

  /* ── Foundations ── */
  function Icon(p) {
    if (p.name === 'agent') return h('svg', { viewBox: '0 0 24 24', width: p.size || 20, height: p.size || 20, fill: 'currentColor', 'aria-hidden': true, className: p.className }, h('circle', { cx: 8, cy: 8, r: 3.2 }), h('circle', { cx: 16.5, cy: 10, r: 2.6 }), h('circle', { cx: 9.5, cy: 16.5, r: 2.6 }));
    return h('svg', { viewBox: '0 0 24 24', width: p.size || 20, height: p.size || 20, fill: 'none', stroke: 'currentColor', strokeWidth: 1.75, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true, className: p.className, dangerouslySetInnerHTML: { __html: ICONS[p.name] || '' } });
  }
  function ThemeProvider(p) { return h('div', { className: cx('nx-root', p.className), 'data-theme': p.theme || 'nexus', style: p.style }, p.children); }

  /* ── Actions ── */
  function Button(p) {
    var v = p.variant || 'primary';
    return h('button', Object.assign(rest(p, ['variant', 'size', 'icon', 'iconEnd', 'block', 'children', 'className']), { type: p.type || 'button', className: cx('nx-btn', 'nx-btn--' + v, p.size && p.size !== 'md' && 'nx-btn--' + p.size, p.block && 'nx-btn--block', p.className) }),
      p.icon && h(Icon, { name: p.icon }), p.children, p.iconEnd && h(Icon, { name: p.iconEnd }));
  }
  function IconButton(p) {
    return h('button', Object.assign(rest(p, ['icon', 'label', 'variant', 'size', 'className', 'children']), { type: 'button', 'aria-label': p.label, title: p.label, className: cx('nx-icon-btn', p.variant && 'nx-icon-btn--' + p.variant, p.size === 'sm' && 'nx-icon-btn--sm', p.className) }), h(Icon, { name: p.icon }), p.children);
  }
  function SegmentedControl(p) {
    return h('div', { className: 'nx-seg', role: 'group', 'aria-label': p.label },
      p.options.map(function (o) { var val = o.value || o; return h('button', { key: val, type: 'button', className: 'nx-seg__opt', 'aria-pressed': p.value === val, onClick: function () { p.onChange && p.onChange(val); } }, o.label || o); }));
  }

  /* ── Status ── */
  function Badge(p) { return h('span', { className: cx('nx-badge', 'nx-badge--' + (p.tone || 'info'), p.dot === false && 'nx-badge--plain', p.className) }, p.children); }
  function Count(p) { return h('span', { className: cx('nx-count', p.strong && 'nx-count--strong') }, p.children); }
  function Banner(p) {
    var ic = { info: 'info', success: 'checkc', warning: 'clock', danger: 'excl', attention: 'alert' }[p.tone || 'info'];
    return h('div', { className: cx('nx-banner', 'nx-banner--' + (p.tone || 'info')), role: p.tone === 'danger' ? 'alert' : 'status' }, h(Icon, { name: p.icon || ic }),
      h('div', { className: 'nx-banner__body' }, p.title && h('b', null, p.title + ' '), p.children), p.action);
  }
  function Toast(p) {
    return h('div', { className: 'nx-toast', role: 'status' }, h(Icon, { name: p.icon || 'checkc', size: 18 }), h('span', null, p.children),
      p.actionLabel && h('button', { className: 'nx-toast__action', onClick: p.onAction }, p.actionLabel), p.meta && h('span', { className: 'nx-toast__meta' }, p.meta));
  }
  function Tooltip(p) { return h('span', { className: 'nx-tooltip', role: 'tooltip', id: p.id }, p.children); }
  function ProgressBar(p) {
    return h('div', { className: cx('nx-progress', p.value == null && 'nx-progress--indeterminate'), role: 'progressbar', 'aria-label': p.label, 'aria-valuenow': p.value, 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('span', { style: p.value != null ? { width: p.value + '%' } : null }));
  }
  function Spinner(p) { return h('span', { className: cx('nx-ring', p.size === 'lg' && 'nx-ring--lg'), role: 'status', 'aria-label': p.label || 'Working' }); }
  function Skeleton(p) { return h('div', { className: 'nx-skel', style: { width: p.width || '100%', height: p.height || 16 }, 'aria-hidden': true }); }
  function EmptyState(p) {
    return h('div', { className: 'nx-empty' }, p.art !== false && h(Landscape, { className: 'nx-empty__art' }), h('h3', null, p.title), p.children && h('p', null, p.children), p.action, p.tagline && h('span', { className: 'nx-hand' }, p.tagline));
  }
  function Landscape(p) {
    return h('svg', { viewBox: '0 0 200 90', className: p.className, 'aria-hidden': true },
      h('path', { d: 'M0 70 Q50 58 100 66 T200 62 V90 H0z', style: { fill: 'var(--flow-soft)' } }), h('path', { d: 'M0 78 Q60 70 120 76 T200 74 V90 H0z', style: { fill: 'var(--surface-sunken)' } }),
      h('g', { style: { fill: 'var(--chart-4)' } }, h('path', { d: 'M40 66 l8-26 8 26z' }), h('path', { d: 'M52 68 l6-18 6 18z' }), h('path', { d: 'M150 64 l9-30 9 30z' })),
      h('rect', { x: 96, y: 48, width: 22, height: 18, style: { fill: 'var(--line)' } }), h('path', { d: 'M94 49 l13-10 13 10z', style: { fill: 'var(--chart-4)' } }));
  }
  function Avatar(p) {
    var size = p.size && p.size !== 'md' ? 'nx-avatar--' + p.size : null;
    if (p.agent) return h('span', { className: cx('nx-avatar', 'nx-avatar--agent', size), role: 'img', 'aria-label': p.name || 'Agent' }, h(Icon, { name: 'agent', size: 18 }));
    var tone = p.tone || (1 + ((p.name || '').split('').reduce(function (a, c) { return a + c.charCodeAt(0); }, 0) % 4));
    var initials = p.initials || (p.name || '?').split(' ').map(function (s) { return s[0]; }).join('').slice(0, 2).toUpperCase();
    return h('span', { className: cx('nx-avatar', size, 'nx-avatar--p' + tone), role: 'img', 'aria-label': p.name }, p.src ? h('img', { src: p.src, alt: '', style: { width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' } }) : initials,
      p.status && h('span', { className: cx('nx-avatar__status', p.status === 'away' && 'nx-avatar__status--away') }));
  }
  function Facepile(p) {
    var shown = p.people.slice(0, p.max || 4), more = p.people.length - shown.length;
    return h('span', { className: 'nx-facepile' }, shown.map(function (n) { return h(Avatar, { key: n, name: n, size: 'sm' }); }), (more > 0 || p.label) && h('span', { className: 'nx-facepile__more' }, (more > 0 ? '+' + more + ' ' : '') + (p.label || '')));
  }
  function PresenceTag(p) { return h('span', { className: cx('nx-presence', !p.agent && 'nx-presence--person'), style: p.style }, p.name); }

  /* ── Forms ── */
  var uid = 0; function useId(p) { var r = React.useRef(p.id || 'nx-' + (++uid)); return r.current; }
  function Field(p, control) {
    var id = useId(p), msg = p.error || p.help;
    return h('div', { className: 'nx-field' }, h('label', { className: 'nx-field__label', htmlFor: id }, p.label, p.optional && h('span', { className: 'nx-opt' }, ' (optional)')),
      control(id, msg ? id + '-msg' : undefined),
      p.error ? h('span', { className: 'nx-field__error', id: id + '-msg' }, h(Icon, { name: 'excl', size: 14 }), p.error) : p.help && h('span', { className: 'nx-field__help', id: id + '-msg' }, p.help));
  }
  var FIELD = ['label', 'help', 'error', 'optional', 'options'];
  function TextField(p) { return Field(p, function (id, d) { return h('input', Object.assign(rest(p, FIELD), { id: id, className: 'nx-input', 'aria-invalid': !!p.error, 'aria-describedby': d })); }); }
  function TextArea(p) { return Field(p, function (id, d) { return h('textarea', Object.assign(rest(p, FIELD), { id: id, className: 'nx-textarea', 'aria-invalid': !!p.error, 'aria-describedby': d })); }); }
  function Select(p) { return Field(p, function (id, d) { return h('select', Object.assign(rest(p, FIELD), { id: id, className: 'nx-select', 'aria-describedby': d }), p.options.map(function (o) { return h('option', { key: o.value || o, value: o.value || o }, o.label || o); })); }); }
  function SearchField(p) { return h('div', { className: 'nx-input-wrap' }, h(Icon, { name: 'search' }), h('input', Object.assign(rest(p, ['hero']), { type: 'search', className: cx('nx-input', p.hero && 'nx-search'), 'aria-label': p['aria-label'] || p.placeholder }))); }
  function Checkbox(p) { return h('label', { className: 'nx-check' }, h('input', Object.assign(rest(p, ['label', 'description']), { type: 'checkbox' })), h('span', null, p.label, p.description && h('small', null, p.description))); }
  function RadioGroup(p) {
    return h('fieldset', { style: { border: 0, padding: 0, margin: 0, display: 'grid', gap: 12 } }, h('legend', { className: 'nx-field__label', style: { marginBottom: 10 } }, p.label),
      p.options.map(function (o) { return h('label', { key: o.value, className: 'nx-radio' }, h('input', { type: 'radio', name: p.name, value: o.value, checked: p.value === o.value, onChange: function () { p.onChange && p.onChange(o.value); } }), h('span', null, o.label, o.description && h('small', null, o.description))); }));
  }
  function Switch(p) { return h('label', { className: 'nx-switch' }, h('span', null, p.label), h('input', Object.assign(rest(p, ['label']), { type: 'checkbox', role: 'switch' }))); }
  function Slider(p) { return Field(p, function (id, d) { return h('input', Object.assign(rest(p, FIELD), { id: id, type: 'range', className: 'nx-slider', 'aria-describedby': d })); }); }
  function FacetChips(p) {
    return h('div', { className: 'nx-facets' }, p.facets.map(function (f) { return h('span', { key: f.key + f.value, className: 'nx-facet' }, h('span', null, f.key + ': ', h('b', null, f.value)), h('button', { type: 'button', 'aria-label': 'Remove ' + f.key, onClick: function () { p.onRemove && p.onRemove(f); } }, h(Icon, { name: 'x' }))); }),
      p.onAdd && h('button', { type: 'button', className: 'nx-facet nx-facet--add', onClick: p.onAdd }, '+ Add a facet'));
  }
  function FileDrop(p) {
    var s = React.useState(false), over = s[0], setOver = s[1];
    return h('div', { className: cx('nx-drop', over && 'nx-drop--active'), onDragOver: function (e) { e.preventDefault(); setOver(true); }, onDragLeave: function () { setOver(false); }, onDrop: function (e) { e.preventDefault(); setOver(false); p.onFiles && p.onFiles(e.dataTransfer.files); } },
      h(Icon, { name: 'upload' }), h('b', null, p.title || 'Drop a spreadsheet, PDF or doc'), h('span', null, p.children || 'Stays private to this room'));
  }

  /* ── Navigation & layout ── */
  function Tabs(p) {
    return h('div', { className: 'nx-tabs', role: 'tablist' }, p.tabs.map(function (t) { var v = t.value || t.label; return h('button', { key: v, type: 'button', role: 'tab', className: 'nx-tab', 'aria-selected': p.value === v, onClick: function () { p.onChange && p.onChange(v); } }, t.label, t.count != null && h(Count, null, t.count)); }));
  }
  function Sidebar(p) {
    return h('nav', { className: 'nx-nav', 'aria-label': 'Main' }, p.brand && h('div', { className: 'nx-nav__brand' }, p.brand), p.tagline && h('div', { className: 'nx-nav__tag' }, p.tagline),
      p.items.map(function (it, i) { return it.section ? h('div', { key: i, className: 'nx-nav__section' }, it.section) : h('a', { key: i, href: it.href || '#', className: 'nx-nav__item', 'aria-current': it.current ? 'page' : undefined, onClick: it.onClick }, it.icon && h(Icon, { name: it.icon }), h('span', null, it.label, it.sub && h('span', { className: 'nx-nav__sub' }, it.sub)), it.count != null && h(Count, { strong: it.urgent }, it.count)); }));
  }
  function Breadcrumbs(p) {
    return h('nav', { className: 'nx-crumbs', 'aria-label': 'Breadcrumb' }, p.items.map(function (it, i) { var last = i === p.items.length - 1; return h(Fragment, { key: i }, i > 0 && h('span', { 'aria-hidden': true }, '/'), last ? h('span', { 'aria-current': 'page' }, it.label) : h('a', { href: it.href || '#' }, it.label)); }));
  }
  function Pagination(p) {
    var pages = []; for (var i = 1; i <= p.total; i++) { if (i === 1 || i === p.total || Math.abs(i - p.page) <= 1) pages.push(i); else if (pages[pages.length - 1] !== '…') pages.push('…'); }
    return h('nav', { className: 'nx-pages', 'aria-label': 'Pages' }, h('button', { 'aria-label': 'Previous', disabled: p.page <= 1, onClick: function () { p.onChange(p.page - 1); } }, '‹'),
      pages.map(function (n, i) { return n === '…' ? h('span', { key: 'e' + i }, '…') : h('button', { key: n, 'aria-current': n === p.page ? 'page' : undefined, onClick: function () { p.onChange(n); } }, n); }),
      h('button', { 'aria-label': 'Next', disabled: p.page >= p.total, onClick: function () { p.onChange(p.page + 1); } }, '›'), p.meta && h('span', { className: 'nx-pages__meta' }, p.meta));
  }
  function AppHeader(p) {
    return h('header', { className: 'nx-header' }, h('span', { className: 'nx-header__mark' }, p.product || 'Nexus'), p.room && h('span', { className: 'nx-header__sep' }), p.room && h('span', { className: 'nx-header__room' }, p.room), p.live && h('span', { className: 'nx-header__live' }, p.live), h('div', { className: 'nx-header__meta' }, p.meta, p.user && h(Avatar, { name: p.user, size: 'sm' })));
  }
  function RoomTitle(p) {
    return h('div', { className: 'nx-room-title' }, h('div', null, h('h1', null, p.title, p.state && h('span', { className: 'nx-room-title__state' }, ' · ' + p.state)), p.subtitle && h('p', null, p.subtitle)),
      (p.actions || p.motto) && h('div', { style: { display: 'grid', gap: 12, justifyItems: 'end' } }, p.motto && h('div', { className: 'nx-motto' }, p.motto), p.actions && h('div', { className: 'nx-room-title__actions' }, p.actions)));
  }
  function Card(p) {
    return h('section', { className: cx('nx-card', p.className), style: p.style }, (p.title || p.aside) && h('div', { className: 'nx-card__head' }, h('div', null, p.title && h('h3', { className: 'nx-card__title' }, p.title, p.badge), p.subtitle && h('p', { className: 'nx-card__sub' }, p.subtitle)), p.aside), h('div', { className: p.title ? 'nx-card__body' : null }, p.children));
  }
  function BottomBar(p) { return h('div', { className: 'nx-bottombar' }, h(TrustFooter, { items: p.trust }), h('div', { className: 'nx-bottombar__end' }, p.children)); }
  function TrustFooter(p) { return h('span', { className: 'nx-trust' }, h(Icon, { name: p.icon || 'shield', size: 16 }), (p.items || []).join(' · ')); }
  function StatusStrip(p) {
    return h('div', { className: 'nx-strip', role: 'status' }, p.working && h(Spinner, null), (p.items || []).map(function (t, i) { return h(Fragment, { key: i }, i > 0 && h('span', { className: 'nx-strip__dot' }, '·'), h('span', null, t)); }),
      p.change && h('span', { className: 'nx-strip__right' }, h(Icon, { name: 'sparkle', size: 16 }), p.change, p.onUndo && ' · ', p.onUndo && h('a', { href: '#', onClick: function (e) { e.preventDefault(); p.onUndo(); } }, 'Undo')));
  }
  function Kbd(p) { return h('kbd', { className: 'nx-kbd' }, p.children); }

  /* ── Overlays ── */
  function Modal(p) {
    React.useEffect(function () { if (!p.open) return; function k(e) { if (e.key === 'Escape') p.onClose && p.onClose(); } document.addEventListener('keydown', k); return function () { document.removeEventListener('keydown', k); }; }, [p.open]);
    if (!p.open) return null;
    return h('div', { className: 'nx-scrim', style: { position: 'fixed', zIndex: 1300 }, onClick: function (e) { if (e.target === e.currentTarget) p.onClose && p.onClose(); } },
      h('div', { className: 'nx-modal', role: 'dialog', 'aria-modal': true, 'aria-label': p.title }, h('h2', null, p.title), p.children && h('p', null, p.children), h('div', { className: 'nx-modal__actions' }, p.actions)));
  }
  function Popover(p) { return h('div', { className: 'nx-popover', role: 'dialog', 'aria-label': p.title }, p.title && h('h4', null, p.title), p.children); }
  function Menu(p) {
    return h('div', { className: 'nx-menu', role: 'menu' }, p.items.map(function (it, i) {
      if (it.separator) return h('div', { key: i, className: 'nx-menu__sep', role: 'separator' });
      if (it.section) return h('div', { key: i, className: 'nx-menu__label' }, it.section);
      return h('button', { key: i, type: 'button', role: 'menuitem', className: cx('nx-menu__item', it.danger && 'nx-menu__item--danger'), onClick: it.onSelect }, it.icon && h(Icon, { name: it.icon, size: 16 }), it.label, it.shortcut && h(Kbd, null, it.shortcut));
    }));
  }
  function CommandPalette(p) {
    if (!p.open) return null;
    return h('div', { className: 'nx-scrim', style: { position: 'fixed', zIndex: 1300 }, onClick: function (e) { if (e.target === e.currentTarget) p.onClose && p.onClose(); } },
      h('div', { className: 'nx-palette', role: 'dialog', 'aria-modal': true, 'aria-label': p.title || 'Where do you want to pick up?' }, h('h2', null, p.title || 'Where do you want to pick up?'),
        h(SearchField, { hero: true, autoFocus: true, placeholder: 'Search people, outcomes, decisions, or words…', value: p.query, onChange: function (e) { p.onQuery && p.onQuery(e.target.value); } }),
        (p.sections || []).map(function (s) { return h(Fragment, { key: s.title }, h('p', { className: 'nx-palette__section' }, s.title), h('div', { className: 'nx-list' }, s.items.map(function (it, i) { return h(ListRow, Object.assign({ key: i }, it)); }))); }),
        h('div', { className: 'nx-palette__foot' }, p.hint || 'Press ', h(Kbd, null, '⌘'), h(Kbd, null, 'K'), ' anywhere.')));
  }

  /* ── Data display ── */
  function ListRow(p) {
    return h(p.href ? 'a' : 'div', { className: 'nx-row', href: p.href, onClick: p.onClick, tabIndex: p.onClick && !p.href ? 0 : undefined },
      p.icon && h('span', { className: cx('nx-row__icon', p.tone && 'nx-row__icon--' + p.tone) }, h(Icon, { name: p.icon })),
      h('span', { className: 'nx-row__body' }, h('span', { className: 'nx-row__title', style: { display: 'block' } }, p.title), p.subtitle && h('span', { className: 'nx-row__sub', style: { display: 'block' } }, p.subtitle)),
      h('span', { className: 'nx-row__end' }, p.end, (p.href || p.onClick) && h(Icon, { name: 'chev', size: 18 })));
  }
  function DataTable(p) {
    return h('div', { className: 'nx-table-wrap' }, h('table', { className: 'nx-table' }, p.caption && h('caption', { style: { position: 'absolute', left: -9999 } }, p.caption),
      h('thead', null, h('tr', null, p.columns.map(function (c) { return h('th', { key: c.key, className: c.numeric ? 'nx-num' : null, 'aria-sort': p.sort && p.sort.key === c.key ? (p.sort.dir === 'desc' ? 'descending' : 'ascending') : undefined, onClick: c.sortable && p.onSort ? function () { p.onSort(c.key); } : undefined, style: c.sortable ? { cursor: 'pointer' } : null }, c.label); }))),
      h('tbody', null, p.rows.map(function (r, i) { return h('tr', { key: r.id || i, 'aria-selected': p.selected === (r.id || i) || undefined, onClick: p.onSelect ? function () { p.onSelect(r.id || i); } : undefined }, p.columns.map(function (c) { var v = c.render ? c.render(r) : r[c.key]; return h('td', { key: c.key, className: c.numeric ? 'nx-num' : null }, v == null ? h('span', { title: p.suppressedReason || 'Hidden for privacy' }, '—') : v); })); }))));
  }
  function KeyValue(p) { return h('dl', { className: 'nx-kv' }, p.items.map(function (it, i) { return h(Fragment, { key: i }, h('dt', null, it.key), h('dd', null, it.value)); })); }
  function ActivityTimeline(p) {
    return h('div', { className: 'nx-activity' }, p.events.map(function (e, i) { return h('div', { key: i, className: 'nx-activity__item' }, h('span', { className: 'nx-activity__dot', style: e.needsYou ? { borderColor: 'var(--attention)' } : null }), h('div', { className: 'nx-activity__time' }, e.time), h('div', { className: 'nx-activity__what' }, e.what), e.who && h('div', { className: 'nx-activity__who' }, e.who)); }));
  }
  function Accordion(p) { return h('div', { className: 'nx-accordion' }, p.items.map(function (it, i) { return h('details', { key: i, open: it.open }, h('summary', null, it.title), h('div', { className: 'nx-accordion__body' }, it.content)); })); }
  function StatTile(p) {
    return h('div', { className: 'nx-stat' }, h('span', { className: 'nx-stat__label' }, p.label), h('span', { className: 'nx-stat__value' }, p.value),
      p.delta && h('span', { className: cx('nx-stat__delta', p.deltaTone === 'attention' && 'nx-stat__delta--down') }, p.delta), p.context && h('span', { className: 'nx-stat__context' }, p.context));
  }

  /* ── Agent patterns ── */
  function Message(p) {
    return h('div', { className: cx('nx-msg', p.agent && 'nx-msg--agent') }, h(Avatar, { name: p.author, agent: p.agent }),
      h('div', { className: 'nx-msg__main' }, h('div', { className: 'nx-msg__head' }, h('span', { className: 'nx-msg__name' }, p.author), p.time && h('span', { className: 'nx-msg__time' }, p.time)), h('div', { className: 'nx-msg__bubble' }, p.children)));
  }
  function WorkSteps(p) {
    return h('ul', { className: 'nx-steps', 'aria-live': 'polite' }, p.steps.map(function (s, i) { return h('li', { key: i, className: 'nx-step nx-step--' + (s.state || 'pending') }, h('span', { className: 'nx-step__mark' }, s.state === 'done' && h(Icon, { name: 'check' })), s.label); }));
  }
  function ChoiceChips(p) {
    return h('div', { className: 'nx-choices', role: 'group', 'aria-label': p.label }, p.options.map(function (o) { var v = o.value || o, sel = p.value === v; return h('button', { key: v, type: 'button', className: 'nx-choice', 'aria-pressed': sel, onClick: function () { p.onChange && p.onChange(v); } }, sel && h(Icon, { name: 'check', size: 16 }), o.label || o); }));
  }
  function ContextChip(p) {
    return h('div', { className: 'nx-chip' }, p.icon && h('span', { className: 'nx-chip__icon' }, h(Icon, { name: p.icon })), h('div', { className: 'nx-chip__body' }, h('div', { className: 'nx-chip__label' }, h('b', null, p.name + ': '), p.value), p.source && h('div', { className: cx('nx-chip__source', p.confirmed && 'nx-chip__source--confirmed') }, p.source)), p.pinned && h('span', { className: 'nx-chip__pin' }, h(Icon, { name: 'pin', size: 14 })));
  }
  function Composer(p) {
    return h('div', null, h('div', { className: 'nx-composer' }, h('textarea', { rows: 1, 'aria-label': 'Message', placeholder: p.placeholder || 'Ask, refine, paste context, or point to the work…', value: p.value, onChange: function (e) { p.onChange && p.onChange(e.target.value); }, onKeyDown: function (e) { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); p.onSend && p.onSend(); } } }),
      p.onAttach && h(IconButton, { icon: 'clip', label: 'Attach', onClick: p.onAttach }), p.onVoice && h(IconButton, { icon: 'mic', label: 'Speak', onClick: p.onVoice }), h(IconButton, { icon: 'send', label: 'Send', variant: 'send', onClick: p.onSend })), p.hint && h('div', { className: 'nx-composer__hint' }, p.hint));
  }
  function DecisionCard(p) {
    return h('div', { className: cx('nx-decision', p.needsYou && 'nx-decision--needs') }, p.eyebrow && h('span', { className: 'nx-eyebrow' }, p.eyebrow), h('h3', { className: 'nx-decision__title' }, p.title), p.why && h('p', { className: 'nx-decision__why' }, p.why),
      h('div', { className: 'nx-decision__rec' }, h('span', { className: 'nx-decision__rec-label' }, p.recommendation || (p.needsYou ? 'Your decision' : 'Recommended')), p.figure && h('span', { className: 'nx-decision__conf' }, p.figureLabel, h('b', null, p.figure))),
      h('div', { className: 'nx-decision__actions' }, p.actions), p.footnote && h('span', { className: 'nx-decision__undo' }, p.footnote));
  }
  function SpecialistList(p) {
    return h('div', { className: 'nx-specialists' }, h('div', { className: 'nx-specialists__head' }, h(Icon, { name: 'users' }), p.agents.length + ' specialists working'),
      p.agents.map(function (a, i) { return h('div', { key: i, className: 'nx-specialist' }, h('span', { className: 'nx-specialist__icon' }, h(Icon, { name: a.icon || 'agent', size: 18 })), h('div', { className: 'nx-specialist__body' }, h('div', { className: 'nx-specialist__name' }, a.name), h('div', { className: 'nx-specialist__task' }, a.task)), h('span', { className: cx('nx-specialist__state', a.state && 'nx-specialist__state--' + a.state) }, a.stateLabel || 'Working')); }),
      h('div', { className: 'nx-specialists__foot' }, p.footnote || 'Their work is synthesized into one response.'));
  }
  function RevisionCompare(p) {
    return h('div', { className: 'nx-compare' }, h('div', { className: 'nx-compare__block' }, h('span', { className: 'nx-compare__label' }, 'Before'), h('div', { className: 'nx-compare__text' }, p.before)),
      h('div', { className: 'nx-compare__block' }, h('span', { className: 'nx-compare__label' }, 'Proposed'), h('div', { className: 'nx-compare__text nx-compare__text--proposed' }, p.proposed)),
      h('div', { className: 'nx-compare__tradeoff' }, h(Icon, { name: 'scale' }), h('span', null, h('b', null, 'Tradeoff'), p.tradeoff)),
      h(Button, { block: true, onClick: p.onApply }, 'Use this here'), h('div', { className: 'nx-compare__actions' }, h(Button, { variant: 'secondary', onClick: p.onApplyAll }, 'Use this tone throughout'), h(Button, { variant: 'secondary', onClick: p.onRetry }, 'Try another')),
      h(Button, { variant: 'quiet', onClick: p.onKeep, style: { justifySelf: 'center' } }, 'Keep original'));
  }
  function VersionPath(p) {
    return h('div', { className: 'nx-versions' }, p.versions.map(function (v, i) { return h('div', { key: i, className: cx('nx-version', v.current && 'nx-version--current', v.pending && 'nx-version--next') }, h('span', { className: 'nx-version__dot' }), v.label, v.note && h('br'), v.note); }));
  }
  function ClaimPair(p) {
    return h('div', { className: 'nx-claims' }, h('div', { className: 'nx-claim nx-claim--supported' }, h(Icon, { name: 'checkc' }), h('span', null, h('b', null, p.supportedLabel || 'Supported by this view:'), ' ' + p.supported)),
      h('div', { className: 'nx-claim nx-claim--open' }, h(Icon, { name: 'excl' }), h('span', null, h('b', null, p.openLabel || 'Not yet established:'), ' ' + p.open)));
  }
  function SourceTrail(p) {
    return h('div', { className: 'nx-sources' }, p.sources.map(function (s, i) { return h('div', { key: i, className: 'nx-source' }, h(Icon, { name: s.icon || 'doc', size: 18 }), h('span', null, h('b', null, s.name), s.detail && ' · ' + s.detail), s.status && h(Badge, { tone: s.status === 'connected' ? 'success' : s.status === 'waiting' ? 'warning' : 'danger' }, s.statusLabel || s.status)); }), p.onAdd && h(Button, { variant: 'secondary', size: 'sm', icon: 'plus', onClick: p.onAdd, style: { justifySelf: 'start' } }, 'Add another source'));
  }
  function WorkQueue(p) {
    return h('div', { className: 'nx-queue' }, p.jobs.map(function (j, i) { return h('div', { key: i, className: 'nx-queue__row' }, h('span', { className: 'nx-row__icon', style: { width: 36, height: 36 } }, h(Icon, { name: j.icon || 'doc' })), h('span', null, h('b', null, j.title), j.description), h('span', { className: 'nx-queue__state' }, h('span', { className: 'nx-ring' }), j.step), h('span', { className: 'nx-queue__eta' }, j.eta)); }));
  }
  function PermissionRequest(p) {
    return h('div', { className: 'nx-permission', role: 'region', 'aria-label': 'Permission request' }, h('h4', null, h('span', { className: 'nx-avatar nx-avatar--sm' }, h(Icon, { name: 'user', size: 16 })), p.title || 'What I need from you'), h('p', null, p.reason),
      h('div', { className: 'nx-permission__scope' }, h(Icon, { name: 'lock' }), h('span', null, h('b', null, p.system), p.scope)),
      h('div', { className: 'nx-permission__actions' }, h(Button, { onClick: p.onAllow }, p.allowLabel || 'Allow for 10 minutes'), h(Button, { variant: 'secondary', onClick: p.onDeny }, 'Not now')));
  }
  function ResumeCard(p) {
    return h('div', { className: 'nx-resume' }, h('div', { className: 'nx-resume__top' }, h('span', { className: 'nx-row__icon nx-row__icon--attention' }, h(Icon, { name: p.icon || 'doc' })), h('div', null, h('h4', null, p.title), h('p', null, p.subtitle))),
      h('div', { className: 'nx-resume__left' }, h('span', null, h('b', null, 'You left here'), p.leftAt), h('span', { style: { display: 'flex', gap: 8 } }, h(Button, { size: 'sm', onClick: p.onResume }, 'Resume here'), p.onOverview && h(Button, { size: 'sm', variant: 'secondary', onClick: p.onOverview }, 'Open overview'))));
  }
  function StoryTimeline(p) {
    return h('div', { className: 'nx-story' }, p.chapters.map(function (c, i) { return h('div', { key: i, className: cx('nx-story__step', c.open && 'nx-story__step--open') }, h('span', { className: 'nx-story__num' }, i + 1), h('div', { className: 'nx-story__card', onClick: c.onClick }, h('div', null, h('h4', null, c.title), h('p', null, c.meta), c.open && c.content), !c.open && h(Icon, { name: 'chev' }))); }));
  }

  /* ── Charts (data-driven SVG) ── */
  function DotPlot(p) {
    var rows = p.rows, w = p.width || 640, lw = 150, rowH = 24, min = p.min != null ? p.min : -10, max = p.max != null ? p.max : 10;
    var sx = function (v) { return lw + (v - min) / (max - min) * (w - lw - 20); }, H = rows.length * rowH + 64, ticks = p.ticks || [min, min / 2, 0, max / 2, max];
    return h('svg', { className: 'nx-chart', viewBox: '0 0 ' + w + ' ' + H, width: '100%', role: 'img', 'aria-label': p.label },
      ticks.map(function (t) { return h('g', { key: t }, h('line', { className: t === 0 ? 'nx-c-zero' : 'nx-c-grid', x1: sx(t), x2: sx(t), y1: 6, y2: rows.length * rowH + 10 }), h('text', { x: sx(t), y: rows.length * rowH + 28, textAnchor: 'middle' }, (t > 0 ? '+' : '') + t)); }),
      rows.map(function (r, i) { var y = 20 + i * rowH, watch = r.high < 0; return h('g', { key: r.label }, h('text', { x: 0, y: y + 4, className: 'nx-c-label' }, r.label), h('line', { className: cx('nx-c-range', watch && 'nx-c-range--watch'), x1: sx(r.low), x2: sx(r.high), y1: y, y2: y }), h('circle', { className: cx('nx-c-dot', watch && 'nx-c-dot--watch'), cx: sx(r.value), cy: y, r: 5, tabIndex: 0, 'aria-label': r.label + ': ' + r.value }, h('title', null, r.label + ': ' + (r.value > 0 ? '+' : '') + r.value + (p.unit || '')))); }),
      p.axisLabel && h('text', { x: sx((min + max) / 2), y: H - 6, textAnchor: 'middle' }, p.axisLabel));
  }
  function BarChart(p) {
    var d = p.data, w = p.width || 500, H = 196, base = 170, max = p.max || Math.max.apply(null, d.map(function (x) { return x.value; })) * 1.15, step = (w - 40) / d.length, bw = Math.min(56, step * .62);
    return h('svg', { className: 'nx-chart', viewBox: '0 0 ' + w + ' ' + H, width: '100%', role: 'img', 'aria-label': p.label }, h('line', { className: 'nx-c-axis', x1: 20, x2: w - 20, y1: base, y2: base }),
      d.map(function (x, i) { var bh = x.value / max * 150, X = 30 + i * step; return h('g', { key: x.label }, h('rect', { className: x.context ? 'nx-c-bar--ctx' : 'nx-c-bar', x: X, y: base - bh, width: bw, height: bh, rx: 3 }), h('text', { x: X + bw / 2, y: base - bh - 6, textAnchor: 'middle', className: 'nx-c-label' }, x.display || x.value), h('text', { x: X + bw / 2, y: base + 18, textAnchor: 'middle' }, x.label)); }),
      p.reference != null && h('line', { className: 'nx-c-zero', x1: 20, x2: w - 20, y1: base - p.reference / max * 150, y2: base - p.reference / max * 150 }));
  }
  function LineChart(p) {
    var s = p.series, w = p.width || 600, H = p.height || 180, all = [].concat.apply([], s.map(function (x) { return x.values; })), min = p.min != null ? p.min : Math.min.apply(null, all), max = p.max != null ? p.max : Math.max.apply(null, all), n = s[0].values.length;
    var sx = function (i) { return 40 + i * (w - 60) / (n - 1); }, sy = function (v) { return H - 20 - (v - min) / (max - min || 1) * (H - 40); };
    return h('svg', { className: 'nx-chart', viewBox: '0 0 ' + w + ' ' + H, width: '100%', role: 'img', 'aria-label': p.label },
      (p.ticks || []).map(function (t) { return h('g', { key: t }, h('line', { className: 'nx-c-grid', x1: 40, x2: w - 20, y1: sy(t), y2: sy(t) }), h('text', { x: 32, y: sy(t) + 4, textAnchor: 'end' }, t + (p.unit || ''))); }),
      s.map(function (x, k) { var pts = x.values.map(function (v, i) { return sx(i) + ',' + sy(v); }).join(' '); return h('polyline', { key: k, className: cx('nx-c-line', x.context && 'nx-c-line--ctx', k === 1 && !x.context && 'nx-c-line--2'), points: pts }); }),
      p.endLabel && h('g', null, h('circle', { className: 'nx-c-dot', cx: sx(n - 1), cy: sy(s[0].values[n - 1]), r: 5 }), h('text', { x: sx(n - 1) - 8, y: sy(s[0].values[n - 1]) - 12, textAnchor: 'end', className: 'nx-c-label' }, p.endLabel)));
  }
  function Sparkline(p) {
    var v = p.values, w = p.width || 160, H = p.height || 40, min = Math.min.apply(null, v), max = Math.max.apply(null, v), sx = function (i) { return i * w / (v.length - 1); }, sy = function (x) { return H - 4 - (x - min) / (max - min || 1) * (H - 8); };
    return h('svg', { className: 'nx-chart', width: w, height: H, viewBox: '0 0 ' + w + ' ' + H, role: 'img', 'aria-label': p.label }, h('polyline', { className: 'nx-c-line', points: v.map(function (x, i) { return sx(i) + ',' + sy(x); }).join(' ') }), h('circle', { className: 'nx-c-dot', cx: sx(v.length - 1), cy: sy(v[v.length - 1]), r: 3.5 }));
  }
  function ChartLegend(p) {
    return h('div', { className: 'nx-legend' }, p.items.map(function (it, i) { return h('span', { key: i }, h('i', { className: it.mark === 'line' ? 'l' : null, style: { background: 'var(--' + (it.token || 'chart-' + (i + 1)) + ')', borderRadius: it.mark === 'dot' ? '50%' : null } }), it.label); }));
  }
  function ChartTooltip(p) { return h('div', { className: 'nx-chart-tip', role: 'tooltip' }, h('b', null, p.title), h('span', { className: 'v' }, p.value), p.context && h('span', null, p.context)); }

  window.Nexus = {
    Icon: Icon, ThemeProvider: ThemeProvider, Landscape: Landscape,
    Button: Button, IconButton: IconButton, SegmentedControl: SegmentedControl,
    Badge: Badge, Count: Count, Banner: Banner, Toast: Toast, Tooltip: Tooltip, ProgressBar: ProgressBar, Spinner: Spinner, Skeleton: Skeleton, EmptyState: EmptyState, Avatar: Avatar, Facepile: Facepile, PresenceTag: PresenceTag,
    TextField: TextField, TextArea: TextArea, Select: Select, SearchField: SearchField, Checkbox: Checkbox, RadioGroup: RadioGroup, Switch: Switch, Slider: Slider, FacetChips: FacetChips, FileDrop: FileDrop,
    Tabs: Tabs, Sidebar: Sidebar, Breadcrumbs: Breadcrumbs, Pagination: Pagination, AppHeader: AppHeader, RoomTitle: RoomTitle, Card: Card, BottomBar: BottomBar, TrustFooter: TrustFooter, StatusStrip: StatusStrip, Kbd: Kbd,
    Modal: Modal, Popover: Popover, Menu: Menu, CommandPalette: CommandPalette,
    ListRow: ListRow, DataTable: DataTable, KeyValue: KeyValue, ActivityTimeline: ActivityTimeline, Accordion: Accordion, StatTile: StatTile,
    AgentMessage: Message, WorkSteps: WorkSteps, ChoiceChips: ChoiceChips, ContextChip: ContextChip, Composer: Composer, DecisionCard: DecisionCard, SpecialistList: SpecialistList, RevisionCompare: RevisionCompare, VersionPath: VersionPath, ClaimPair: ClaimPair, SourceTrail: SourceTrail, WorkQueue: WorkQueue, PermissionRequest: PermissionRequest, ResumeCard: ResumeCard, StoryTimeline: StoryTimeline,
    DotPlot: DotPlot, BarChart: BarChart, LineChart: LineChart, Sparkline: Sparkline, ChartLegend: ChartLegend, ChartTooltip: ChartTooltip
  };
})();

(function () {
  var React = window.React, N = window.Nexus;
  var h = React.createElement, Fragment = React.Fragment, Icon = N.Icon, Button = N.Button, Avatar = N.Avatar, Badge = N.Badge;
  function cx() { var o = []; for (var i = 0; i < arguments.length; i++) if (arguments[i]) o.push(arguments[i]); return o.join(' '); }
  function rm() { return typeof window.matchMedia === 'function' && window.matchMedia('(prefers-reduced-motion: reduce)').matches; }

  /* ── Small primitives ── */
  function Link(p) { return h('a', Object.assign({}, p, { className: cx('nx-link', p.external && 'nx-link--external', p.className), target: p.external ? '_blank' : p.target, rel: p.external ? 'noopener' : p.rel, external: undefined })); }
  function Divider(p) { return p.label ? h('div', { className: 'nx-divider nx-divider--label', role: 'separator' }, p.label) : h('hr', { className: 'nx-divider' }); }
  function Mention(p) { return h('span', { className: cx('nx-mention', p.agent && 'nx-mention--agent') }, '@' + p.name); }
  function LiveDot() { return h('span', { className: 'nx-live-dot', 'aria-hidden': true }); }
  function LiveLine() { return h('div', { className: 'nx-live-line', role: 'progressbar', 'aria-label': 'Working' }); }

  /* ── Forms ── */
  function Combobox(p) {
    var s = React.useState(''), q = s[0], setQ = s[1], o = React.useState(false), open = o[0], setOpen = o[1], a = React.useState(0), act = a[0], setAct = a[1];
    var sel = p.value || [], multi = p.multiple !== false;
    var opts = (p.options || []).filter(function (x) { return x.label.toLowerCase().indexOf(q.toLowerCase()) >= 0 && sel.indexOf(x.value) < 0; }).slice(0, 8);
    function pick(x) { p.onChange && p.onChange(multi ? sel.concat([x.value]) : [x.value]); setQ(''); setAct(0); }
    function mark(t) { var i = t.toLowerCase().indexOf(q.toLowerCase()); if (!q || i < 0) return t; return [t.slice(0, i), h('mark', { key: 'm' }, t.slice(i, i + q.length)), t.slice(i + q.length)]; }
    var lid = (p.id || 'nx-combo') + '-list';
    return h('div', { className: 'nx-field' }, p.label && h('label', { className: 'nx-field__label' }, p.label),
      h('div', { className: 'nx-combo' }, h('div', { className: 'nx-combo__box' },
        sel.map(function (v) { var x = (p.options || []).filter(function (o) { return o.value === v; })[0] || { label: v }; return h('span', { key: v, className: 'nx-token' }, x.label, h('button', { type: 'button', 'aria-label': 'Remove ' + x.label, onClick: function () { p.onChange(sel.filter(function (s) { return s !== v; })); } }, h(Icon, { name: 'x', size: 12 }))); }),
        h('input', { role: 'combobox', 'aria-expanded': open && opts.length > 0, 'aria-controls': lid, 'aria-autocomplete': 'list', value: q, placeholder: sel.length ? '' : p.placeholder,
          onFocus: function () { setOpen(true); }, onBlur: function () { setTimeout(function () { setOpen(false); }, 120); }, onChange: function (e) { setQ(e.target.value); setOpen(true); },
          onKeyDown: function (e) { if (e.key === 'ArrowDown') { e.preventDefault(); setAct(Math.min(act + 1, opts.length - 1)); } else if (e.key === 'ArrowUp') { e.preventDefault(); setAct(Math.max(act - 1, 0)); } else if (e.key === 'Enter' && opts[act]) { e.preventDefault(); pick(opts[act]); } else if (e.key === 'Backspace' && !q && sel.length) { p.onChange(sel.slice(0, -1)); } else if (e.key === 'Escape') setOpen(false); } })),
        open && opts.length > 0 && h('div', { className: 'nx-listbox', role: 'listbox', id: lid }, opts.map(function (x, i) { return h('div', { key: x.value, role: 'option', 'aria-selected': i === act, className: 'nx-option-row', onMouseDown: function (e) { e.preventDefault(); pick(x); } }, x.icon && h(Icon, { name: x.icon, size: 16 }), h('span', null, mark(x.label)), x.detail && h('small', null, x.detail)); }))),
      p.help && h('span', { className: 'nx-field__help' }, p.help));
  }
  function DatePicker(p) {
    var init = p.month || new Date(), m = React.useState(new Date(init.getFullYear(), init.getMonth(), 1)), month = m[0], setMonth = m[1];
    var start = (month.getDay() + 6) % 7, days = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate(), cells = [], today = new Date();
    var same = function (a, b) { return a && b && a.toDateString() === b.toDateString(); };
    var ev = (p.events || []).map(function (d) { return d.toDateString(); });
    for (var i = 0; i < 42; i++) { var d = new Date(month.getFullYear(), month.getMonth(), i - start + 1); cells.push(d); }
    var lo = p.start, hi = p.end;
    return h('div', { className: 'nx-cal', role: 'dialog', 'aria-label': p.label || 'Choose dates' },
      h('div', { className: 'nx-cal__head' }, h('button', { className: 'nx-icon-btn nx-icon-btn--sm', 'aria-label': 'Previous month', onClick: function () { setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1)); } }, h(Icon, { name: 'back' })),
        month.toLocaleDateString(p.locale, { month: 'long', year: 'numeric' }), h('button', { className: 'nx-icon-btn nx-icon-btn--sm', 'aria-label': 'Next month', onClick: function () { setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1)); } }, h(Icon, { name: 'chev' }))),
      h('div', { className: 'nx-cal__grid' }, ['Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa', 'Su'].map(function (x) { return h('span', { key: x, className: 'nx-cal__dow' }, x); }),
        cells.map(function (d, i) { var out = d.getMonth() !== month.getMonth(), isSel = same(d, lo) || same(d, hi), inR = lo && hi && d > lo && d < hi;
          return h('button', { key: i, className: cx('nx-cal__day', out && 'nx-cal__day--muted', same(d, today) && 'nx-cal__day--today', isSel && 'nx-cal__day--sel', inR && 'nx-cal__day--range', ev.indexOf(d.toDateString()) >= 0 && 'nx-cal__day--event'), 'aria-pressed': isSel, onClick: function () { p.onSelect && p.onSelect(d); } }, d.getDate()); })),
      p.footer && h('div', { className: 'nx-cal__foot' }, p.footer));
  }
  function NumberStepper(p) {
    var v = p.value, step = p.step || 1, clamp = function (x) { return Math.max(p.min != null ? p.min : -Infinity, Math.min(p.max != null ? p.max : Infinity, x)); };
    return h('div', { className: 'nx-field' }, p.label && h('span', { className: 'nx-field__label' }, p.label), h('div', { className: 'nx-stepper' },
      h('button', { type: 'button', 'aria-label': 'Decrease', onClick: function () { p.onChange(clamp(v - step)); } }, '−'),
      h('input', { value: v, inputMode: 'numeric', 'aria-label': p.label, onChange: function (e) { var n = parseInt(e.target.value, 10); if (!isNaN(n)) p.onChange(clamp(n)); }, onKeyDown: function (e) { var k = e.shiftKey ? 10 : 1; if (e.key === 'ArrowUp') { e.preventDefault(); p.onChange(clamp(v + step * k)); } if (e.key === 'ArrowDown') { e.preventDefault(); p.onChange(clamp(v - step * k)); } } }),
      h('button', { type: 'button', 'aria-label': 'Increase', onClick: function () { p.onChange(clamp(v + step)); } }, '+')));
  }
  function ButtonGroup(p) {
    if (p.split) return h('div', { className: 'nx-btn-group nx-split' }, h(Button, { onClick: p.onClick }, p.label), h(Button, { 'aria-label': p.menuLabel || 'More options', 'aria-haspopup': 'menu', onClick: p.onMenu }, h(Icon, { name: 'down', size: 16 })));
    return h('div', { className: 'nx-btn-group', role: 'group', 'aria-label': p.label }, p.options.map(function (o) { return h('button', { key: o.value, type: 'button', className: 'nx-btn nx-btn--secondary', 'aria-pressed': p.value === o.value, onClick: function () { p.onChange && p.onChange(o.value); } }, o.icon && h(Icon, { name: o.icon, size: 16 }), o.label); }));
  }
  function FilterBar(p) {
    return h('div', { className: 'nx-filters' }, p.filters.map(function (f, i) { return h('button', { key: i, type: 'button', className: cx('nx-filter', f.active && 'nx-filter--on'), onClick: f.onClick }, f.icon && h(Icon, { name: f.icon, size: 14 }), f.label); }),
      p.onAdd && h('button', { type: 'button', className: 'nx-filter', onClick: p.onAdd }, h(Icon, { name: 'plus', size: 14 }), 'Add filter'), p.count && h('span', { className: 'nx-filters__count' }, p.count, p.onClear && ' · ', p.onClear && h('a', { className: 'nx-link', href: '#', onClick: function (e) { e.preventDefault(); p.onClear(); } }, 'Clear')));
  }

  /* ── Overlays & feedback ── */
  function Drawer(p) {
    React.useEffect(function () { if (!p.open) return; function k(e) { if (e.key === 'Escape') p.onClose && p.onClose(); } document.addEventListener('keydown', k); return function () { document.removeEventListener('keydown', k); }; }, [p.open]);
    if (!p.open) return null;
    return h('div', { style: { position: 'fixed', inset: 0, zIndex: 1300 } }, h('div', { style: { position: 'absolute', inset: 0, background: 'var(--scrim)' }, onClick: p.onClose }),
      h('aside', { className: 'nx-drawer', role: 'dialog', 'aria-modal': true, 'aria-label': p.title }, h('div', { className: 'nx-drawer__head' }, h('h3', null, p.title), h(N.IconButton, { icon: 'x', label: 'Close', onClick: p.onClose })), h('div', { className: 'nx-drawer__body' }, p.children), p.footer && h('div', { className: 'nx-drawer__foot' }, p.footer)));
  }
  function AlertDialog(p) {
    var s = React.useState(''), typed = s[0], setTyped = s[1];
    if (!p.open) return null;
    var ok = !p.confirmWord || typed === p.confirmWord;
    return h('div', { className: 'nx-scrim', style: { position: 'fixed', zIndex: 1300 } }, h('div', { className: 'nx-alert', role: 'alertdialog', 'aria-modal': true, 'aria-label': p.title },
      h('span', { className: 'nx-alert__icon' }, h(Icon, { name: p.icon || 'trash' })), h('h2', null, p.title), h('p', null, p.children),
      p.confirmWord && h('label', { className: 'nx-alert__confirm' }, h('span', null, 'Type ', h('b', null, p.confirmWord), ' to confirm'), h('input', { className: 'nx-input', value: typed, onChange: function (e) { setTyped(e.target.value); } })),
      h('div', { className: 'nx-alert__actions' }, h(Button, { variant: 'secondary', autoFocus: true, onClick: p.onCancel }, p.cancelLabel || 'Cancel'), h(Button, { variant: 'danger', disabled: !ok, onClick: p.onConfirm }, p.confirmLabel))));
  }
  function Toolbar(p) { return h('div', { className: 'nx-toolbar', role: 'toolbar', 'aria-label': p.label }, p.items.map(function (it, i) { return it.separator ? h('span', { key: i, className: 'nx-toolbar__sep' }) : h(N.IconButton, { key: i, icon: it.icon, label: it.label, 'aria-pressed': it.pressed, onClick: it.onClick }); })); }
  function Coachmark(p) { return h('div', { className: 'nx-coach', role: 'dialog', 'aria-label': p.title }, h('h4', null, p.title), p.children, h('div', { className: 'nx-coach__foot' }, h('span', null, p.step), h('span', { style: { display: 'flex', gap: 10, alignItems: 'center' } }, p.onSkip && h('a', { href: '#', style: { color: 'inherit' }, onClick: function (e) { e.preventDefault(); p.onSkip(); } }, 'Skip tour'), h('button', { onClick: p.onNext }, p.nextLabel || 'Next')))); }
  function NotificationCenter(p) {
    return h('div', { className: 'nx-inbox' }, h('div', { className: 'nx-inbox__head' }, h('h3', null, p.title || 'Notifications'), p.onMarkAll && h(Button, { variant: 'quiet', size: 'sm', onClick: p.onMarkAll }, 'Mark all read')),
      p.items.map(function (n, i) { return h('div', { key: i, className: cx('nx-notif', n.unread && 'nx-notif--unread') }, n.person ? h(Avatar, { name: n.person }) : h('span', { className: cx('nx-row__icon', n.tone && 'nx-row__icon--' + n.tone) }, h(Icon, { name: n.icon || 'bell' })), h('b', null, n.title), h('span', { className: 'nx-notif__time' }, n.time), h('span', null, n.detail), n.actions && h('div', { className: 'nx-notif__actions' }, n.actions)); }));
  }
  function ErrorState(p) { return h('div', { className: 'nx-error' }, p.code ? h('span', { className: 'nx-error__code' }, p.code) : h('span', { className: 'nx-alert__icon', style: { width: 56, height: 56 } }, h(Icon, { name: p.icon || 'excl' })), h('h3', null, p.title), p.children && h('p', null, p.children), p.action); }
  function OfflineBanner(p) { return h('div', { className: 'nx-offline', role: 'status' }, h(Icon, { name: 'cloud', size: 16 }), p.children || 'You’re offline. Changes will sync when you reconnect.'); }
  function BulkActionBar(p) { return h('div', { className: 'nx-bulk', role: 'toolbar', 'aria-label': 'Selection actions' }, h('span', null, p.count + ' selected'), p.children, h(N.IconButton, { icon: 'x', label: 'Clear selection', size: 'sm', onClick: p.onClear, style: { color: 'inherit' } })); }
  function AttachmentChip(p) { var kind = (p.kind || 'file').toLowerCase(); return h('div', { className: 'nx-attach' }, h('span', { className: cx('nx-attach__icon', kind === 'pdf' && 'nx-attach__icon--pdf', kind === 'doc' && 'nx-attach__icon--doc') }, kind.toUpperCase().slice(0, 4)), h('span', { className: 'nx-attach__body' }, h('b', null, p.name), p.detail)); }
  function SignIn(p) { return h('div', { className: 'nx-signin' }, h('span', { className: 'nx-signin__mark' }, p.product || 'Nexus'), h('p', null, p.tagline), h('button', { className: 'nx-signin__sso', onClick: p.onSignIn }, h(Icon, { name: 'shield' }), p.label || 'Continue with district account'), p.fine && h('span', { className: 'nx-signin__fine' }, p.fine)); }
  function Wizard(p) { return h('ol', { className: 'nx-wizard', style: { listStyle: 'none', margin: 0, padding: 0 } }, p.steps.map(function (s, i) { var st = i < p.current ? 'done' : i === p.current ? 'current' : ''; return h('li', { key: i, className: cx('nx-wizard__step', st && 'nx-wizard__step--' + st), 'aria-current': i === p.current ? 'step' : undefined }, h('span', { className: 'nx-wizard__num' }, i < p.current ? h(Icon, { name: 'check' }) : i + 1), h('b', null, s.title), h('span', null, s.summary)); })); }

  /* ── Content ── */
  function Prose(p) { return h('article', { className: 'nx-prose', lang: p.lang }, p.children); }
  function CodeBlock(p) {
    var s = React.useState(false), copied = s[0], setCopied = s[1];
    return h('pre', { className: 'nx-code' }, h(N.IconButton, { icon: copied ? 'check' : 'copy', label: copied ? 'Copied' : 'Copy', size: 'sm', className: 'nx-code__copy', onClick: function () { navigator.clipboard && navigator.clipboard.writeText(p.code); setCopied(true); setTimeout(function () { setCopied(false); }, 1500); } }), p.code);
  }
  function CommentThread(p) {
    return h('div', { className: 'nx-comments' }, p.anchor && h('div', { className: 'nx-comments__anchor' }, '“' + p.anchor + '”'),
      p.comments.map(function (c, i) { return h('div', { key: i, className: cx('nx-comment', c.agent && 'nx-comment--agent') }, h(Avatar, { name: c.author, agent: c.agent, size: 'sm' }), h('span', { className: 'nx-comment__meta' }, h('b', null, c.author), c.time), h('span', null, c.body)); }),
      h('div', { className: 'nx-comments__actions' }, p.onReply && h(Button, { variant: 'secondary', size: 'sm', onClick: p.onReply }, 'Reply'), p.onResolve && h(Button, { variant: 'secondary', size: 'sm', icon: 'check', onClick: p.onResolve }, 'Resolve')));
  }
  function TranslationPair(p) {
    return h('div', { className: 'nx-translate' }, p.versions.map(function (v, i) { return h('div', { key: i, className: 'nx-translate__col', lang: v.lang }, h('div', { className: 'nx-translate__head' }, v.label, h(Badge, { tone: v.approved ? 'success' : 'warning' }, v.approved ? 'Approved' : 'Needs review')), h('div', { className: 'nx-translate__text' }, v.text)); }),
      h('div', { className: 'nx-translate__foot' }, h(N.TrustFooter, { icon: 'shield', items: p.trust || [] }), p.action));
  }
  function EvidenceCard(p) { return h('div', { className: 'nx-evidence' }, p.items.map(function (e, i) { return h('a', { key: i, className: 'nx-evidence__item', href: e.href || '#' }, h('div', { className: 'nx-evidence__thumb' }, e.image ? h('img', { src: e.image, alt: '', style: { width: '100%', height: '100%', objectFit: 'cover' } }) : h(Icon, { name: e.icon || 'doc' })), h('div', { className: 'nx-evidence__meta' }, h('b', null, e.source), e.kind + (e.time ? ' · ' + e.time : ''))); })); }
  function ArtifactList(p) {
    var tone = { current: ['success', 'Current'], changed: ['warning', 'Policy changed since then'], superseded: ['danger', 'Superseded'] };
    return h('div', { className: 'nx-artifacts' }, p.items.map(function (a, i) { var t = tone[a.status || 'current']; return h('a', { key: i, className: 'nx-artifact', href: a.href || '#' }, h('span', { className: cx('nx-artifact__icon', a.status === 'changed' && 'nx-artifact__icon--warm') }, h(Icon, { name: a.icon || 'doc' })), h('b', null, a.title), h('span', null, a.byline), h(Badge, { tone: t[0] }, a.statusLabel || t[1]), h(Icon, { name: 'chev' })); }));
  }
  function JourneyTimeline(p) { return h('div', { className: 'nx-journey' }, p.steps.map(function (s, i) { return h('div', { key: i, className: cx('nx-journey__step', s.here && 'nx-journey__step--here') }, h('span', { className: 'nx-journey__dot' }, h(Icon, { name: s.icon || 'doc' })), h('span', { className: 'nx-journey__date' }, s.date), s.text, h('span', { className: 'nx-journey__kind' }, s.kind)); })); }
  function ThreadList(p) {
    var col = { resolved: '--success', waiting: '--warning', working: '--attention' };
    return h('div', { className: 'nx-threads' }, p.threads.map(function (t, i) { var v = t.activity || [1, 2, 3, 4, 5], mx = Math.max.apply(null, v), pts = v.map(function (x, j) { return (2 + j * 106 / (v.length - 1)) + ',' + (26 - x / mx * 20); }).join(' ');
      return h('div', { key: i, className: 'nx-thread' }, h('span', { className: 'nx-thread__icon' }, h(Icon, { name: t.icon || 'chat' })), h('b', null, t.title), h('span', null, t.status), h('svg', { viewBox: '0 0 110 30', 'aria-hidden': true }, h('polyline', { points: pts, style: { fill: 'none', stroke: 'var(' + (col[t.state] || '--flow') + ')', strokeWidth: 1.6 } }))); }));
  }
  function CheckpointBar(p) { return h('div', { className: 'nx-checkpoint' }, h('b', null, p.draft), p.editing && h('span', { className: 'nx-checkpoint__live' }, 'Editing now'), h('span', { className: 'nx-checkpoint__sep' }), h('span', null, 'Saved checkpoint ' + p.savedAt), p.editors && h(N.Facepile, { people: p.editors, max: 4 }), h('span', { className: 'nx-checkpoint__end' }, h(Button, { variant: 'secondary', size: 'sm', icon: 'clock', onClick: p.onVersions }, 'View versions'))); }

  /* ── Agent patterns ── */
  function AgentActionBar(p) {
    return h('div', { className: 'nx-actionbar', role: 'region', 'aria-label': 'Agent controls' }, h(Avatar, { agent: true, size: 'sm' }),
      h('div', { className: 'nx-actionbar__lines', 'aria-live': 'polite' }, p.turns.slice(-2).map(function (t, i) { return h('span', { key: i }, h('b', null, t.author + ':'), t.text); })),
      p.listening && h('div', { className: 'nx-actionbar__wave', 'aria-hidden': true }, Array.from({ length: 22 }, function (_, i) { return h('i', { key: i, style: { height: (30 + (i * 37) % 70) + '%' } }); })),
      p.onMic && h(N.IconButton, { icon: 'mic', label: p.listening ? 'Stop listening' : 'Talk', onClick: p.onMic }), h('span', { className: 'nx-actionbar__sep' }),
      h('div', { className: 'nx-actionbar__ops' }, h(Button, { variant: 'secondary', size: 'sm', icon: 'pause', onClick: p.onInterrupt }, 'Interrupt'), h(Button, { variant: 'secondary', size: 'sm', icon: 'undo', onClick: p.onUndo }, 'Undo'), h(Button, { size: 'sm', icon: 'check', onClick: p.onReview }, 'Review')));
  }
  function LiveBrief(p) {
    function list(items, mod) { return h('ul', { className: cx('nx-brief__list', mod && 'nx-brief__list--' + mod) }, items.map(function (it, i) { var o = typeof it === 'string' ? { text: it } : it; return h('li', { key: i, className: o.isNew ? 'is-new' : null }, h('span', null, o.text), o.source && h('span', { className: 'nx-brief__src' }, o.source)); })); }
    return h('section', { className: 'nx-brief' }, h('div', { className: 'nx-brief__head' }, h('div', null, h('h3', null, p.title), p.subtitle && h('p', null, p.subtitle)), p.updated && h(Badge, { tone: 'success' }, p.updated)),
      h('div', { className: 'nx-brief__section' }, h('h4', null, 'What we know'), list(p.known)), h('div', { className: 'nx-brief__section' }, h('h4', null, 'Still uncertain'), list(p.uncertain, 'uncertain')), h('div', { className: 'nx-brief__section' }, h('h4', null, 'Ready if needed'), list(p.ready, 'ready')),
      p.onWhy && h('div', { className: 'nx-brief__foot' }, h('span', { style: { display: 'inline-flex', gap: 8, alignItems: 'center' } }, h(Icon, { name: 'info', size: 18 }), h('a', { href: '#', onClick: function (e) { e.preventDefault(); p.onWhy(); } }, 'Why this changed'))));
  }
  function ConsequenceDecision(p) {
    return h('div', { className: cx('nx-consequence', p.urgent && 'nx-consequence--warm') }, h('div', { className: 'nx-consequence__top' }, h('span', { className: 'nx-eyebrow' }, p.icon && h(Icon, { name: p.icon, size: 14 }), p.area), p.onWhy && h('button', { className: 'nx-why', onClick: p.onWhy }, 'Why now?', h(Icon, { name: 'down', size: 12 }))),
      h('h4', null, p.title), p.description && h('p', null, p.description),
      h('div', { className: 'nx-if nx-if--approve' }, h(Icon, { name: 'checkc' }), h('b', null, 'If you approve'), h('span', null, p.ifApprove)), h('div', { className: 'nx-if nx-if--defer' }, h(Icon, { name: 'clock' }), h('b', null, 'If you defer'), h('span', null, p.ifDefer)),
      h('div', { className: 'nx-consequence__actions' }, h(Button, { icon: 'check', onClick: p.onApprove }, 'Approve'), h(Button, { variant: 'secondary', icon: 'edit', onClick: p.onEdit }, 'Edit'), h(Button, { variant: 'secondary', icon: 'clock', onClick: p.onDefer }, 'Defer')));
  }
  function DecisionOptions(p) {
    var icon = { go: 'checkc', hold: 'pause', stop: 'x' };
    return h('div', { style: { display: 'grid', gap: 16 } }, h('div', { className: 'nx-options' }, p.recommendation && h('div', { className: 'nx-options__rec' }, 'Recommended: ', h('b', null, p.recommendation)), p.deadline && h('span', { className: 'nx-options__timer' }, h(Icon, { name: 'clock' }), p.deadline),
      h('div', { className: 'nx-options__row', role: 'radiogroup', 'aria-label': p.label }, p.options.map(function (o) { return h('button', { key: o.value, role: 'radio', 'aria-checked': p.value === o.value, className: cx('nx-option', 'nx-option--' + o.tone), onClick: function () { p.onChoose && p.onChoose(o.value); } }, h(Icon, { name: icon[o.tone] }), h('b', null, o.label), h('span', null, o.sublabel)); }))),
      h('div', { className: 'nx-impacts' }, p.options.map(function (o) { return h('div', { key: o.value, className: 'nx-impact nx-impact--' + o.tone }, h('h5', null, h(Icon, { name: icon[o.tone], size: 16 }), o.impactTitle || o.label), h('ul', null, (o.impacts || []).map(function (t, i) { return h('li', { key: i }, t); }))); })));
  }
  function ParticipantStrip(p) {
    return h('div', { className: 'nx-participants' }, p.people.map(function (x, i) { return h('div', { key: i, className: cx('nx-participant', x.agent && 'nx-participant--agent', x.dissent && 'nx-participant--dissent') }, x.agent ? h('span', { className: 'nx-avatar nx-avatar--agent' }, h(Icon, { name: x.icon || 'agent', size: 18 })) : h(Avatar, { name: x.name }), h('b', null, x.name), h('span', null, x.role), h('span', { className: 'nx-participant__status' }, x.status)); }));
  }
  function NoticePanel(p) {
    return h('aside', { className: 'nx-notice', 'aria-label': p.title }, h('div', { className: 'nx-notice__head' }, h('div', null, h('h3', null, p.title), p.subtitle && h('p', null, p.subtitle)), h('button', { className: 'nx-pause', 'aria-pressed': !!p.paused, onClick: p.onTogglePause }, h('i'), p.paused ? 'Resume agent' : 'Pause agent')),
      p.noticed && h('div', { className: 'nx-notice__block nx-notice__block--noticed' }, h('h4', null, h('span', { className: 'nx-notice__icon' }, h(Icon, { name: 'eye' })), 'What I noticed'), h('ul', null, p.noticed.map(function (t, i) { return h('li', { key: i }, t); }))),
      p.prepared && h('div', { className: 'nx-notice__block nx-notice__block--prepared' }, h('h4', null, h('span', { className: 'nx-notice__icon' }, h(Icon, { name: 'doc' })), 'What I prepared'), h('div', { className: 'nx-notice__draft' }, p.prepared.text), h('div', { style: { display: 'flex', gap: 8, justifyContent: 'flex-end' } }, h(Button, { variant: 'secondary', size: 'sm', onClick: p.prepared.onEdit }, 'Edit'), h(Button, { size: 'sm', onClick: p.prepared.onSend }, 'Send'))),
      (p.done || []).map(function (d, i) { return h('div', { key: i, className: 'nx-notice__block' }, h('h4', null, h('span', { className: 'nx-notice__icon', style: { background: 'var(--success)', color: '#fff' } }, h(Icon, { name: 'check' })), d.title), h('span', { style: { font: '400 13px/18px var(--font-sans)', color: 'var(--ink-muted)' } }, d.detail, ' ', d.onUndo && h('a', { href: '#', className: 'nx-link', onClick: function (e) { e.preventDefault(); d.onUndo(); } }, 'Undo'))); }),
      p.need && h('div', { className: 'nx-notice__block nx-notice__block--need' }, h('h4', null, h('span', { className: 'nx-notice__icon' }, h(Icon, { name: 'user' })), 'What I need from you'), p.need),
      h('div', { className: 'nx-notice__foot' }, 'You’re always in control'));
  }
  function AgendaBlocks(p) {
    var total = p.blocks.reduce(function (a, b) { return a + b.minutes; }, 0);
    return h('div', { className: 'nx-agenda' }, h('div', { className: 'nx-agenda__scale' }, h('span', null, '0 min'), p.note && h(Badge, { tone: 'info', dot: false }, p.note), h('span', null, total + ' min')),
      h('div', { className: 'nx-agenda__row' }, p.blocks.map(function (b, i) { return h('div', { key: i, className: cx('nx-block', b.protected && 'nx-block--protected', b.changed && 'nx-block--focus'), style: { flex: b.minutes } }, b.delta && h('span', { className: 'nx-block__delta' }, b.delta), h('b', null, b.title), h('span', { className: 'nx-block__min' }, b.minutes + ' min'), b.purpose && h('span', null, b.purpose), b.protected && h('span', { className: 'nx-block__lock' }, h(Icon, { name: 'lock', size: 12 }), b.protectedLabel || 'Protected')); })),
      h('div', { className: 'nx-agenda__cites' }, p.blocks.map(function (b, i) { return h('span', { key: i, style: { flex: b.minutes } }, b.source && h('b', null, b.source), b.pages); })));
  }
  function CalendarWeek(p) {
    var startH = p.startHour || 8, hours = p.hours || 7, hpx = 48;
    return h('div', { className: 'nx-week', style: { gridTemplateColumns: '56px repeat(' + p.days.length + ', minmax(0,1fr))' } }, h('div'),
      p.days.map(function (d, i) { return h('div', { key: i, className: cx('nx-week__dh', d.today && 'nx-week__dh--today') }, d.label, h('b', null, d.date)); }),
      h('div', { className: 'nx-week__times' }, Array.from({ length: hours }, function (_, i) { var hr = startH + i; return h('span', { key: i }, ((hr - 1) % 12) + 1); })),
      p.days.map(function (d, i) { return h('div', { key: i, className: 'nx-week__col', style: { height: hours * hpx } }, (d.events || []).map(function (e, j) { return h('div', { key: j, className: cx('nx-ev', e.tone && 'nx-ev--' + e.tone), style: { top: (e.start - startH) * hpx, height: Math.max(22, (e.end - e.start) * hpx - 2) } }, e.title, e.detail && h('small', null, e.detail)); })); }));
  }

  /* ── Charts ── */
  function Heatmap(p) {
    var ramp = ['var(--surface-sunken)', 'var(--flow-soft)', 'color-mix(in srgb, var(--flow) 45%, var(--flow-soft))', 'var(--flow)', 'var(--flow-ink)'];
    var all = [].concat.apply([], p.rows.map(function (r) { return r.values; })).filter(function (v) { return v != null; }), mn = Math.min.apply(null, all), mx = Math.max.apply(null, all);
    return h('div', { className: 'nx-heat', style: { '--cols': p.rows[0].values.length }, role: 'img', 'aria-label': p.label },
      p.rows.map(function (r) { return h('div', { key: r.label, className: 'nx-heat__row' }, h('span', null, r.label), r.values.map(function (v, i) { var k = v == null ? -1 : Math.min(4, Math.floor((v - mn) / ((mx - mn) || 1) * 5)); return h('span', { key: i, className: 'nx-heat__cell', title: r.label + ': ' + (v == null ? 'hidden (small group)' : v + (p.unit || '')), style: { background: k < 0 ? 'repeating-linear-gradient(45deg, var(--surface-sunken) 0 4px, var(--line) 4px 6px)' : ramp[k] } }); })); }),
      h('div', { className: 'nx-heat__scale' }, 'Lower', ramp.map(function (c, i) { return h('i', { key: i, style: { background: c } }); }), 'Higher'));
  }
  function ProgressRing(p) { var r = 50, c = 2 * Math.PI * r, ratio = Math.max(0, Math.min(1, p.value / p.max)); return h('div', { className: 'nx-ringstat', role: 'img', 'aria-label': p.value + ' of ' + p.max + ' ' + (p.label || '') }, h('svg', { viewBox: '0 0 120 120' }, h('circle', { className: 'nx-ringstat__track', cx: 60, cy: 60, r: r }), h('circle', { className: 'nx-ringstat__value', cx: 60, cy: 60, r: r, strokeDasharray: c, strokeDashoffset: c * (1 - ratio) })), h('div', null, h('b', null, p.value), h('span', null, 'of ' + p.max + ' ' + (p.label || '')))); }
  function Meter(p) { return h('div', { className: 'nx-meter' }, h('span', { style: { display: 'flex', justifyContent: 'space-between' } }, h('b', { style: { color: 'var(--ink)', fontWeight: 600 } }, p.label), p.valueLabel), h('div', { className: 'nx-meter__track', role: 'meter', 'aria-valuenow': p.value, 'aria-valuemin': 0, 'aria-valuemax': 100, 'aria-label': p.label }, h('span', { className: 'nx-meter__mark', style: { left: p.value + '%' } })), p.ends && h('span', { style: { display: 'flex', justifyContent: 'space-between', fontSize: 11 } }, p.ends.map(function (e, i) { return h('span', { key: i }, e); }))); }
  function SmallMultiples(p) {
    var all = [].concat.apply([], p.series.map(function (s) { return s.values; })), mn = Math.min.apply(null, all.concat(p.reference != null ? [p.reference] : [])), mx = Math.max.apply(null, all.concat(p.reference != null ? [p.reference] : []));
    var sy = function (v) { return 40 - (v - mn) / ((mx - mn) || 1) * 34; };
    return h('div', { className: 'nx-multiples' }, p.series.map(function (s) { var n = s.values.length, pts = s.values.map(function (v, i) { return (i * 160 / (n - 1)) + ',' + sy(v); }).join(' ');
      return h('div', { key: s.label, className: 'nx-multiple' }, h('b', null, s.label), s.display || s.values[n - 1], h('svg', { viewBox: '0 0 160 44', width: '100%', height: 44, role: 'img', 'aria-label': s.label + ' trend' }, p.reference != null && h('line', { x1: 0, x2: 160, y1: sy(p.reference), y2: sy(p.reference), style: { stroke: 'var(--chart-4)', strokeDasharray: '3 3' } }), h('polyline', { points: pts, style: { fill: 'none', stroke: 'var(' + (s.watch ? '--chart-3' : '--chart-1') + ')', strokeWidth: 2 } }))); }));
  }

  /* ── Motion ── */
  function FlowField(p) {
    var w = p.width || 900, ht = p.height || 320;
    return h('svg', { className: 'nx-flowfield', viewBox: '0 0 ' + w + ' ' + ht, width: '100%', role: p.label ? 'img' : undefined, 'aria-label': p.label, 'aria-hidden': p.label ? undefined : true },
      (p.paths || []).map(function (d, i) { return h(Fragment, { key: 'c' + i }, h('path', { className: 'nx-ff-ribbon', d: d }), h('path', { className: 'nx-ff-stream', d: d, style: { animationDelay: (-i * 0.27) + 's' } }), i % 2 === 0 && h('circle', { className: 'nx-ff-particle', r: 3.5, style: { offsetPath: "path('" + d + "')", animationDelay: (-i * 0.31) + 's' } })); }),
      (p.warm || []).map(function (d, i) { return h(Fragment, { key: 'w' + i }, h('path', { className: 'nx-ff-ribbon nx-ff-ribbon--warm', d: d }), h('path', { className: 'nx-ff-stream nx-ff-stream--warm', d: d, style: { animationDelay: (-i * 0.5) + 's' } })); }),
      p.node && h('g', null, h('circle', { cx: p.node.x, cy: p.node.y, r: 26, style: { fill: 'var(--surface-raised)', stroke: 'var(--flow)', strokeWidth: 2 } }), h('circle', { cx: p.node.x, cy: p.node.y, r: 6, style: { fill: 'var(--flow)' } })));
  }
  function AgentGlow(p) { return h('div', { className: cx(p.active !== false && 'nx-agent-glow', p.className), style: p.style }, p.children); }
  function StreamText(p) {
    var words = (p.text || '').split(/(\s+)/).filter(Boolean), reduce = rm();
    return h('span', { 'aria-live': 'polite' }, h('span', { className: reduce ? null : 'nx-stream' }, reduce ? p.text : words.map(function (w, i) { return h('span', { key: i, className: 'w', style: { '--i': Math.max(0, i - (p.settledWords || 0)) } }, w); })), !p.done && h('span', { className: 'nx-stream__caret', 'aria-hidden': true }));
  }
  function CountUp(p) {
    var fmt = new Intl.NumberFormat(p.locale, p.format || {}), r = React.useRef(p.from != null ? p.from : 0), s = React.useState(r.current), val = s[0], setVal = s[1];
    React.useEffect(function () { var a = r.current, b = p.value, t0 = null, dur = p.duration || 900, raf;
      if (rm()) { setVal(b); r.current = b; return; }
      function step(t) { if (t0 == null) t0 = t; var k = Math.min(1, (t - t0) / dur), e = 1 - Math.pow(1 - k, 3); setVal(a + (b - a) * e); if (k < 1) raf = requestAnimationFrame(step); else r.current = b; }
      raf = requestAnimationFrame(step); return function () { cancelAnimationFrame(raf); }; }, [p.value]);
    return h('span', { 'aria-label': fmt.format(p.value), style: { fontVariantNumeric: 'tabular-nums' } }, fmt.format(val));
  }
  function Reveal(p) { return h(p.as || 'div', { className: cx('nx-reveal', p.className), style: p.style }, React.Children.map(p.children, function (c, i) { return React.isValidElement(c) ? React.cloneElement(c, { style: Object.assign({}, c.props.style, { '--i': Math.min(i, 8) }) }) : c; })); }
  function Converge(p) {
    var cx0 = p.node ? p.node.x : 350, cy0 = p.node ? p.node.y : 120;
    return h('svg', { className: 'nx-converge', viewBox: '0 0 ' + (p.width || 660) + ' ' + (p.height || 250), width: '100%', role: 'img', 'aria-label': p.label },
      (p.sources || []).map(function (y, i) { return h('path', { key: i, d: 'M10 ' + y + ' C 160 ' + y + ', 200 ' + cy0 + ', ' + (cx0 - 20) + ' ' + cy0, pathLength: 400, style: { '--i': i, '--len': 400 } }); }),
      h('g', { className: 'nx-converge__node' }, h('circle', { cx: cx0, cy: cy0, r: 34, style: { fill: 'var(--surface-raised)', stroke: 'var(--flow)', strokeWidth: 2 } }), h('text', { x: cx0, y: cy0 + 4, textAnchor: 'middle', style: { font: '500 12px var(--font-display)', fill: 'var(--ink)' } }, p.label)));
  }
  function ApplyMove(p) {
    var ref = React.useRef(null);
    React.useLayoutEffect(function () { var el = ref.current; if (!el || !p.from || rm()) return; var to = el.getBoundingClientRect(); el.style.setProperty('--dx', (p.from.left - to.left) + 'px'); el.style.setProperty('--dy', (p.from.top - to.top) + 'px'); el.classList.remove('nx-apply'); void el.offsetWidth; el.classList.add('nx-apply'); }, [p.from]);
    return h('div', { ref: ref, className: p.className, style: p.style }, p.children);
  }
  function AgentThinking(p) {
    return h('div', { style: { display: 'flex', gap: 12, alignItems: 'center' }, role: 'status' }, h('span', { className: 'nx-avatar nx-avatar--agent' }, h('svg', { className: 'nx-agent-think', viewBox: '0 0 24 24', width: 18, height: 18, fill: 'currentColor', 'aria-hidden': true }, h('circle', { cx: 8, cy: 8, r: 3.2 }), h('circle', { cx: 16.5, cy: 10, r: 2.6 }), h('circle', { cx: 9.5, cy: 16.5, r: 2.6 }))),
      h('span', { style: { font: '400 15px/22px var(--font-sans)', color: 'var(--ink-muted)' } }, p.label || 'Thinking…'), h('span', { style: { marginLeft: 'auto' } }, h(LiveDot)));
  }

  Object.assign(N, {
    Link: Link, Divider: Divider, Mention: Mention, LiveDot: LiveDot, LiveLine: LiveLine,
    Combobox: Combobox, DatePicker: DatePicker, NumberStepper: NumberStepper, ButtonGroup: ButtonGroup, FilterBar: FilterBar,
    Drawer: Drawer, AlertDialog: AlertDialog, Toolbar: Toolbar, Coachmark: Coachmark, NotificationCenter: NotificationCenter, ErrorState: ErrorState, OfflineBanner: OfflineBanner, BulkActionBar: BulkActionBar, AttachmentChip: AttachmentChip, SignIn: SignIn, Wizard: Wizard,
    Prose: Prose, CodeBlock: CodeBlock, CommentThread: CommentThread, TranslationPair: TranslationPair, EvidenceCard: EvidenceCard, ArtifactList: ArtifactList, JourneyTimeline: JourneyTimeline, ThreadList: ThreadList, CheckpointBar: CheckpointBar,
    AgentActionBar: AgentActionBar, LiveBrief: LiveBrief, ConsequenceDecision: ConsequenceDecision, DecisionOptions: DecisionOptions, ParticipantStrip: ParticipantStrip, NoticePanel: NoticePanel, AgendaBlocks: AgendaBlocks, CalendarWeek: CalendarWeek,
    Heatmap: Heatmap, ProgressRing: ProgressRing, Meter: Meter, SmallMultiples: SmallMultiples,
    FlowField: FlowField, AgentGlow: AgentGlow, StreamText: StreamText, CountUp: CountUp, Reveal: Reveal, Converge: Converge, ApplyMove: ApplyMove, AgentThinking: AgentThinking
  });
})();

(function () {
  var React = window.React, N = window.Nexus, h = React.createElement, Icon = N.Icon, Button = N.Button;
  function cx() { var o = []; for (var i = 0; i < arguments.length; i++) if (arguments[i]) o.push(arguments[i]); return o.join(' '); }

  function Glass(p) { return h(p.as || 'div', { className: cx('nx-glass', p.strong && 'nx-glass--strong', p.capsule && 'nx-glass--capsule', p.className), style: p.style }, p.children); }
  function GlassButton(p) { return h('button', { type: 'button', className: cx('nx-glass-btn', p.prominent && 'nx-glass-btn--prominent', p.selected && 'nx-droplet'), onClick: p.onClick, 'aria-label': p.label, 'aria-pressed': p.selected }, p.icon && h(Icon, { name: p.icon, size: 17 }), p.children); }
  function AgentOrb(p) { return h('span', { className: 'nx-lg-orb', style: p.size ? { width: p.size, height: p.size } : null, role: 'img', 'aria-label': p.label || 'Agent' }, h(Icon, { name: 'agent', size: Math.round((p.size || 36) / 2) })); }

  function AskUserQuestion(p) {
    var qs = p.questions || [];
    var s = React.useState(0), idx = s[0], setIdx = s[1];
    var a = React.useState({}), ans = a[0], setAns = a[1];
    var o = React.useState({}), other = o[0], setOther = o[1];
    var f = React.useState(0), focus = f[0], setFocus = f[1];
    var q = qs[idx] || { options: [] };
    var cur = ans[idx] || [];
    var last = idx === qs.length - 1;
    function pick(i) {
      var v = q.options[i].label, next;
      if (q.multiSelect) next = cur.indexOf(v) >= 0 ? cur.filter(function (x) { return x !== v; }) : cur.concat([v]);
      else next = [v];
      setAns(Object.assign({}, ans, (function () { var m = {}; m[idx] = next; return m; })()));
      setFocus(i);
    }
    function result() {
      return qs.map(function (qq, i) { var sel = (ans[i] || []).slice(); if (other[i]) sel.push(other[i]); if (!sel.length) { var r = qq.options.filter(function (x) { return x.recommended; })[0]; if (r) sel = [r.label]; } return { header: qq.header, question: qq.question, answers: sel }; });
    }
    function next() { if (last) p.onSubmit && p.onSubmit(result()); else { setIdx(idx + 1); setFocus(0); } }
    function onKey(e) {
      if (e.target.tagName === 'INPUT') { if (e.key === 'Enter') next(); return; }
      var n = parseInt(e.key, 10);
      if (n >= 1 && n <= q.options.length) { e.preventDefault(); pick(n - 1); }
      else if (e.key === 'Enter') { e.preventDefault(); next(); }
      else if (e.key === 'ArrowRight' && !last) setIdx(idx + 1);
      else if (e.key === 'ArrowLeft' && idx > 0) setIdx(idx - 1);
      else if (e.key === 'Escape') p.onSkip && p.onSkip(result());
    }
    var answered = function (i) { return (ans[i] && ans[i].length) || other[i]; };
    var prev = q.options[focus] && q.options[focus].preview;
    return h('section', { className: cx('nx-ask', p.inline && 'nx-ask--inline', p.glass && 'nx-ask--glass nx-glass'), role: 'dialog', 'aria-label': p.title || 'Question', onKeyDown: onKey, tabIndex: -1 },
      !p.inline && h('div', { className: 'nx-ask__head' }, h(AgentOrb, { size: 32 }), h('div', null, h('h3', null, p.title || 'A quick question'), p.subtitle && h('p', null, p.subtitle)), qs.length > 1 && h('span', { className: 'nx-ask__count' }, (idx + 1) + ' of ' + qs.length)),
      qs.length > 1 && h('div', { className: 'nx-ask__tabs', role: 'tablist' }, qs.map(function (qq, i) { var done = i !== idx && answered(i); return h('button', { key: i, type: 'button', role: 'tab', 'aria-selected': i === idx, className: cx('nx-ask__tab', done && 'nx-ask__tab--done'), onClick: function () { setIdx(i); } }, done && h(Icon, { name: 'check', size: 12 }), qq.header + (done ? ' · ' + ((ans[i] || [])[0] || other[i]) : '')); })),
      h('div', { className: cx('nx-ask__body', prev && 'nx-ask__body--preview') },
        h('div', null, h('p', { className: 'nx-ask__q' }, q.question, q.multiSelect && h('span', { style: { font: '400 13px var(--font-sans)', color: 'var(--ink-muted)' } }, ' Choose all that apply')), q.why && h('p', { className: 'nx-ask__why' }, q.why),
          h('div', { className: 'nx-ask__opts', role: q.multiSelect ? 'group' : 'radiogroup', 'aria-label': q.header },
            q.options.map(function (op, i) { var on = cur.indexOf(op.label) >= 0;
              return h('button', { key: i, type: 'button', role: q.multiSelect ? 'checkbox' : 'radio', 'aria-checked': on, className: cx('nx-ask__opt', q.multiSelect && 'nx-ask__opt--multi'), onClick: function () { pick(i); }, onFocus: function () { setFocus(i); }, onMouseEnter: function () { setFocus(i); } },
                h('span', { className: 'nx-ask__key' }, on && q.multiSelect ? h(Icon, { name: 'check', size: 12 }) : i + 1), h('span', { className: 'nx-ask__label' }, op.label), op.recommended ? h('span', { className: 'nx-ask__rec' }, 'Recommended') : h('span'), op.description && h('span', { className: 'nx-ask__desc' }, op.description)); }),
            p.allowOther !== false && h('label', { className: 'nx-ask__other' }, h('span', { className: 'nx-ask__key' }, q.options.length + 1), h('input', { placeholder: 'Something else… describe it in your words', value: other[idx] || '', onChange: function (e) { var m = Object.assign({}, other); m[idx] = e.target.value; setOther(m); } })))),
        prev && h('div', { className: 'nx-ask__preview' }, h('span', { className: 'nx-ask__preview-label' }, 'Preview · ' + q.options[focus].label), prev)),
      h('div', { className: 'nx-ask__foot' }, h('span', { className: 'nx-ask__hint' }, h(N.Kbd, null, '1'), '–', h(N.Kbd, null, String(Math.min(9, q.options.length + 1))), ' choose · ', h(N.Kbd, null, '↵'), last ? ' submit' : ' next'),
        idx > 0 && h(Button, { variant: 'secondary', size: 'sm', onClick: function () { setIdx(idx - 1); } }, 'Back'),
        p.onSkip && h(Button, { variant: 'quiet', size: 'sm', onClick: function () { p.onSkip(result()); } }, 'Skip, use recommended'),
        h(Button, { size: p.inline ? 'sm' : undefined, iconEnd: last ? undefined : 'arrow', onClick: next }, last ? (p.submitLabel || 'Submit answers') : 'Next')));
  }
  function AskReceipt(p) { return h('span', null, h('b', null, 'Answered: '), p.answers.map(function (a) { return a.header + ' → ' + a.answers.join(', '); }).join(' · '), p.onChange && ' ', p.onChange && h('a', { href: '#', className: 'nx-link', onClick: function (e) { e.preventDefault(); p.onChange(); } }, 'Change')); }

  function GlassTabBar(p) {
    var tabs = p.tabs || [], min = !!p.minimized;
    var shown = min ? tabs.filter(function (t) { return t.id === p.value; }) : tabs;
    return h('div', { className: cx('nx-i26-tabs', min && 'nx-i26-tabs--min'), style: p.style },
      h('div', { className: 'nx-glass nx-i26-tabbar', role: 'tablist' }, shown.map(function (t) {
        var sel = t.id === p.value;
        return h('button', { key: t.id, type: 'button', role: 'tab', className: 'nx-i26-tab', 'aria-selected': sel, 'aria-label': t.label, onClick: function () { p.onChange && p.onChange(t.id); } },
          sel && !min && h('span', { className: 'nx-droplet', style: { position: 'absolute', inset: 0, borderRadius: 27 } }),
          h('span', { style: { position: 'relative', display: 'grid', justifyItems: 'center', gap: 2 } }, h(Icon, { name: t.icon, size: 24 }), !min && t.label),
          t.badge && !min ? h('span', { className: 'nx-count' }, t.badge) : null);
      })),
      min && h('span', { style: { flex: 1 } }),
      p.onSearch && h('button', { type: 'button', className: 'nx-glass nx-i26-searchorb', 'aria-label': 'Search', onClick: p.onSearch }, h(Icon, { name: 'search', size: 24 })));
  }
  function CompanionAccessory(p) {
    var st = p.state || 'working';
    var right = p.action ? h('button', { type: 'button', className: 'nx-glass-btn nx-glass-btn--prominent', style: { height: 36, padding: '0 14px', fontSize: 14 }, onClick: p.onAction }, p.action)
      : st === 'listening' ? h('span', { className: 'nx-i26-wave', 'aria-hidden': true }, [0,1,2,3,4,5,6,7,8,9].map(function (i) { return h('i', { key: i }); }))
      : st === 'idle' ? h('button', { type: 'button', className: 'nx-i26-circle', style: { width: 36, height: 36 }, 'aria-label': 'Dictate', onClick: p.onDictate }, h(Icon, { name: 'mic', size: 18 }))
      : st === 'needs-you' ? h('span', { className: 'nx-count', style: { background: 'var(--attention)', color: 'var(--on-action)' } }, p.count || 1)
      : st === 'working' ? h('button', { type: 'button', className: 'nx-i26-circle', style: { width: 36, height: 36 }, 'aria-label': 'Pause', onClick: p.onPause }, h(Icon, { name: 'pause', size: 18 })) : null;
    return h('div', { className: cx('nx-glass nx-glass--capsule nx-i26-acc', p.inline && 'nx-i26-acc--inline'), role: 'status', 'aria-live': 'polite', onClick: p.onOpen, style: Object.assign({}, st === 'needs-you' ? { boxShadow: 'inset 0 0 0 1.5px var(--attention), var(--shadow-glass)' } : null, p.style) },
      h(AgentOrb, { size: 36 }), h('span', { className: 'nx-i26-acc__text' }, st === 'idle' ? h('span', { style: { color: 'var(--ink-muted)' } }, p.text || 'Ask Nexus…') : p.text, p.sub && h('small', null, p.sub)), right);
  }
  Object.assign(N, { Glass: Glass, GlassButton: GlassButton, AgentOrb: AgentOrb, AskUserQuestion: AskUserQuestion, AskReceipt: AskReceipt, GlassTabBar: GlassTabBar, CompanionAccessory: CompanionAccessory });
})();

/* ── Graph explorer ── */
(function () {
  var N = window.Nexus, h = React.createElement, Icon = N.Icon, AgentOrb = N.AgentOrb;
  var useState = React.useState, useEffect = React.useEffect, useMemo = React.useMemo, useRef = React.useRef, useLayoutEffect = React.useLayoutEffect;
  function cx() { var o = []; for (var i = 0; i < arguments.length; i++) if (arguments[i]) o.push(arguments[i]); return o.join(' '); }
  var GRAPH_TYPES = {
    school: { color: 'var(--chart-1)', icon: 'home', label: 'School' },
    person: { color: 'var(--chart-5)', icon: 'user', label: 'Person' },
    cohort: { color: 'var(--chart-6)', icon: 'users', label: 'Cohort' },
    system: { color: 'var(--chart-2)', icon: 'db', label: 'System' },
    route: { color: 'var(--chart-3)', icon: 'bus', label: 'Route' },
    fact: { color: 'var(--flow)', icon: 'checkc', label: 'Fact' },
    decision: { color: 'var(--attention)', icon: 'scale', label: 'Decision' },
    run: { color: 'var(--agent)', icon: 'agent', label: 'Agent run', agent: true },
    doc: { color: 'var(--ink-subtle)', icon: 'doc', label: 'Document' },
    dept: { color: 'var(--chart-6)', icon: 'folder', label: 'Department' }
  };
  function typeOf(types, t) { return (types && types[t]) || GRAPH_TYPES[t] || { color: 'var(--ink-subtle)', icon: 'info', label: t || 'Node' }; }
  function swatch(types, t, size) {
    var ty = typeOf(types, t);
    return h('span', { className: cx('nx-glegend__sw', ty.agent && 'nx-glegend__sw--agent'), style: { '--c': ty.color } }, h(Icon, { name: ty.icon, size: size || 12 }));
  }
  function halfW(n, focus) {
    var l = (n.label || '').length, s = (n.sub == null ? '' : n.sub).length;
    return (Math.max(l * (focus ? 8.2 : 7.4), s * 6.2) + (focus ? 60 : 50) + (n.more ? 26 : 0)) / 2;
  }

  /* Force layout seeded by hop distance from the focus; previous positions keep the picture stable. */
  function layoutGraph(nodes, edges, focusId, prev) {
    var idx = {}, adj = {};
    nodes.forEach(function (n, i) { idx[n.id] = i; adj[n.id] = []; });
    var E = edges.filter(function (e) { return adj[e.source] && adj[e.target]; });
    E.forEach(function (e) { adj[e.source].push(e.target); adj[e.target].push(e.source); });
    var root = focusId != null && idx[focusId] != null ? focusId : (nodes[0] && nodes[0].id);
    var depth = {}, q = [];
    if (root != null) { depth[root] = 0; q.push(root); }
    while (q.length) { var u = q.shift(); adj[u].forEach(function (v) { if (depth[v] == null) { depth[v] = depth[u] + 1; q.push(v); } }); }
    var rings = {};
    nodes.forEach(function (n) { if (depth[n.id] == null) depth[n.id] = 3; (rings[depth[n.id]] = rings[depth[n.id]] || []).push(n.id); });
    var P = {}, warm = false;
    Object.keys(rings).forEach(function (d) {
      var ids = rings[d];
      ids.forEach(function (id, i) {
        var n = nodes[idx[id]], a = (i / ids.length) * 2 * Math.PI + d * 0.7, r = d * 175;
        var p = { x: Math.cos(a) * r * 1.35, y: Math.sin(a) * r * 0.85, w: halfW(n, id === root), h: id === root ? 24 : 18 };
        if (prev && prev[id]) { p.x = prev[id].x; p.y = prev[id].y; warm = true; }
        else if (prev) {
          var nb = adj[id].filter(function (v) { return prev[v]; })[0];
          if (nb) { p.x = prev[nb].x + Math.cos(i * 2.4) * 140; p.y = prev[nb].y + Math.sin(i * 2.4) * 90; }
        }
        if (n.x != null && n.y != null) { p.x = n.x; p.y = n.y; p.fixed = true; }
        P[id] = p;
      });
    });
    var ids = nodes.map(function (n) { return n.id; }), iters = warm ? 160 : 320;
    for (var it = 0; it < iters; it++) {
      var alpha = (warm ? 0.5 : 1) * (1 - it / iters);
      for (var i = 0; i < ids.length; i++) for (var j = i + 1; j < ids.length; j++) {
        var a = P[ids[i]], b = P[ids[j]], dx = b.x - a.x, dy = b.y - a.y, d2 = dx * dx + dy * dy + 0.01, d = Math.sqrt(d2), f = 26000 * alpha / d2;
        var fx = dx / d * f, fy = dy / d * f;
        if (!a.fixed) { a.x -= fx; a.y -= fy; } if (!b.fixed) { b.x += fx; b.y += fy; }
        var ox = (a.w + b.w + 18) - Math.abs(dx), oy = (a.h + b.h + 16) - Math.abs(dy);
        if (ox > 0 && oy > 0) {
          if (ox / (a.w + b.w) < oy / (a.h + b.h)) { var sx = (dx < 0 ? -1 : 1) * ox * 0.5; if (!a.fixed) a.x -= sx; if (!b.fixed) b.x += sx; }
          else { var sy = (dy < 0 ? -1 : 1) * oy * 0.5; if (!a.fixed) a.y -= sy; if (!b.fixed) b.y += sy; }
        }
      }
      E.forEach(function (e) {
        var a = P[e.source], b = P[e.target], dx = b.x - a.x, dy = b.y - a.y, d = Math.sqrt(dx * dx + dy * dy) || 1;
        var L = 110 + (a.w + b.w) * 0.6, k = (d - L) * 0.05 * alpha, fx = dx / d * k, fy = dy / d * k;
        if (!a.fixed) { a.x += fx; a.y += fy; } if (!b.fixed) { b.x -= fx; b.y -= fy; }
      });
      ids.forEach(function (id) {
        var p = P[id]; if (p.fixed || id === root) return;
        var rx = p.x / 1.55, r = Math.sqrt(rx * rx + p.y * p.y) || 1, target = Math.min(depth[id], 3) * 165, k = (target - r) / r * 0.12 * alpha;
        p.x += p.x * k; p.y += p.y * k;
      });
      if (P[root] && !P[root].fixed) { P[root].x *= 0.85; P[root].y *= 0.85; }
    }
    return P;
  }
  function trimTo(x1, y1, x2, y2, hw, hh, pad) {
    var dx = x2 - x1, dy = y2 - y1;
    if (!dx && !dy) return [x2, y2];
    var tx = dx ? (hw + pad) / Math.abs(dx) : 1e9, ty = dy ? (hh + pad) / Math.abs(dy) : 1e9, t = Math.min(tx, ty, 1);
    return [x2 - dx * t, y2 - dy * t];
  }
  var uid = 0;

  function GraphCanvas(p) {
    var nodes = p.nodes || [], edges = p.edges || [], types = p.types;
    var ref = useRef(null), prevPos = useRef(null), idRef = useRef('nxg' + (++uid));
    var sizeS = useState({ w: 800, h: p.height || 520 }), size = sizeS[0], setSize = sizeS[1];
    var viewS = useState(null), view = viewS[0], setView = viewS[1];
    var P = useMemo(function () { var r = layoutGraph(nodes, edges, p.focusId, prevPos.current); prevPos.current = r; return r; }, [nodes, edges, p.focusId]);
    var adj = useMemo(function () {
      var a = {}; edges.forEach(function (e) { (a[e.source] = a[e.source] || {})[e.target] = 1; (a[e.target] = a[e.target] || {})[e.source] = 1; }); return a;
    }, [edges]);
    var bounds = useMemo(function () {
      var b = { x0: Infinity, y0: Infinity, x1: -Infinity, y1: -Infinity };
      Object.keys(P).forEach(function (k) { var q = P[k]; b.x0 = Math.min(b.x0, q.x - q.w); b.x1 = Math.max(b.x1, q.x + q.w); b.y0 = Math.min(b.y0, q.y - q.h); b.y1 = Math.max(b.y1, q.y + q.h); });
      if (b.x0 === Infinity) b = { x0: -100, y0: -100, x1: 100, y1: 100 };
      return b;
    }, [P]);
    function fitView(sz) {
      sz = sz || size;
      var bw = bounds.x1 - bounds.x0 + 80, bh = bounds.y1 - bounds.y0 + 120;
      var k = Math.max(0.3, Math.min(1.25, sz.w / bw, sz.h / bh));
      return { k: k, x: sz.w / 2 - (bounds.x0 + bounds.x1) / 2 * k, y: sz.h / 2 - (bounds.y0 + bounds.y1) / 2 * k };
    }
    useLayoutEffect(function () {
      var el = ref.current; if (!el) return;
      function measure() { var s = { w: el.clientWidth, h: el.clientHeight }; setSize(s); return s; }
      var s = measure(); setView(fitView(s));
      if (typeof ResizeObserver === 'undefined') return;
      var ro = new ResizeObserver(function () { measure(); }); ro.observe(el);
      return function () { ro.disconnect(); };
    }, []);
    useEffect(function () { if (p.autoFit !== false) setView(fitView()); }, [bounds.x0, bounds.x1, bounds.y0, bounds.y1, size.w, size.h]);
    useEffect(function () {
      var el = ref.current; if (!el) return;
      function onWheel(e) {
        e.preventDefault();
        var r = el.getBoundingClientRect(), mx = e.clientX - r.left, my = e.clientY - r.top;
        setView(function (v) { v = v || fitView(); var k = Math.max(0.25, Math.min(2.5, v.k * Math.exp(-e.deltaY * 0.0015))); return { k: k, x: mx - (mx - v.x) * k / v.k, y: my - (my - v.y) * k / v.k }; });
      }
      el.addEventListener('wheel', onWheel, { passive: false });
      return function () { el.removeEventListener('wheel', onWheel); };
    }, [bounds]);
    var v = view || fitView();
    function zoom(f) { setView({ k: Math.max(0.25, Math.min(2.5, v.k * f)), x: size.w / 2 - (size.w / 2 - v.x) * f, y: size.h / 2 - (size.h / 2 - v.y) * f }); }
    var drag = useRef(null);
    function onDown(e) {
      if (e.target.closest && e.target.closest('.nx-gnode, .nx-graph__controls, .nx-graph__crumbs, .nx-graph__minimap, .nx-graph__status')) return;
      drag.current = { x: e.clientX, y: e.clientY, vx: v.x, vy: v.y };
      if (e.currentTarget.setPointerCapture) e.currentTarget.setPointerCapture(e.pointerId);
    }
    function onMove(e) { var d = drag.current; if (!d) return; setView({ k: v.k, x: d.vx + e.clientX - d.x, y: d.vy + e.clientY - d.y }); }
    function onUp() { if (drag.current && Math.abs(drag.current.vx - v.x) + Math.abs(drag.current.vy - v.y) < 3 && p.onSelect) p.onSelect(null); drag.current = null; }
    function onKey(e) {
      if (e.target.classList && e.target.classList.contains('nx-gnode')) {
        var id = e.target.getAttribute('data-id'), here = P[id];
        if (e.key === 'e' || e.key === 'E') { if (p.onExpand) p.onExpand(id); e.preventDefault(); return; }
        if (e.key === 'f' || e.key === 'F') { if (p.onFocusNode) p.onFocusNode(id); e.preventDefault(); return; }
        var dir = { ArrowRight: [1, 0], ArrowLeft: [-1, 0], ArrowDown: [0, 1], ArrowUp: [0, -1] }[e.key];
        if (dir && here) {
          var best = null, bs = Infinity;
          Object.keys(adj[id] || {}).forEach(function (o) {
            var q = P[o]; if (!q) return; var dx = q.x - here.x, dy = q.y - here.y, along = dx * dir[0] + dy * dir[1];
            if (along <= 0) return; var score = Math.sqrt(dx * dx + dy * dy) / along; if (score < bs) { bs = score; best = o; }
          });
          if (best) { var el = ref.current.querySelector('[data-id="' + String(best).replace(/"/g, '\\"') + '"]'); if (el) el.focus(); }
          e.preventDefault();
        }
        return;
      }
      if (e.key === '+' || e.key === '=') zoom(1.2); else if (e.key === '-') zoom(1 / 1.2); else if (e.key === '0') setView(fitView());
    }
    var sel = p.selectedId, lit = sel != null ? Object.assign({}, adj[sel] || {}) : null;
    if (lit) lit[sel] = 1;
    var labelFor = sel != null ? sel : p.focusId;
    var mk = idRef.current + '-a';
    var paths = [], labels = [];
    edges.forEach(function (e, i) {
      var a = P[e.source], b = P[e.target]; if (!a || !b) return;
      var s = trimTo(b.x, b.y, a.x, a.y, a.w, a.h, 2), t = trimTo(a.x, a.y, b.x, b.y, b.w, b.h, 7);
      var inc = sel != null && (e.source === sel || e.target === sel), dim = sel != null && !inc && e.kind !== 'path';
      var kinds = (e.kind || '').split(' ').filter(Boolean);
      paths.push(h('path', { key: 'e' + i, className: cx('nx-graph__edge', kinds.map(function (k) { return 'nx-graph__edge--' + k; }).join(' '), inc && 'nx-graph__edge--strong', dim && 'nx-graph__edge--dim'), d: 'M' + s[0] + ' ' + s[1] + 'L' + t[0] + ' ' + t[1], markerEnd: kinds.indexOf('path') >= 0 ? null : 'url(#' + mk + ')' }));
      var show = e.label && (p.edgeLabels === 'all' || kinds.indexOf('path') >= 0 || kinds.indexOf('inferred') >= 0 || e.source === labelFor || e.target === labelFor);
      if (show) labels.push(h('span', { key: 'l' + i, className: cx('nx-elabel', kinds.indexOf('inferred') >= 0 && 'nx-elabel--inferred', kinds.indexOf('path') >= 0 && 'nx-elabel--path', dim && 'nx-elabel--dim'), style: { left: (a.x + b.x) / 2, top: (a.y + b.y) / 2 } }, e.label));
    });
    var count = {}; edges.forEach(function (e) { count[e.source] = (count[e.source] || 0) + 1; count[e.target] = (count[e.target] || 0) + 1; });
    var nodeEls = nodes.map(function (n) {
      var q = P[n.id], ty = typeOf(types, n.type), focus = n.id === p.focusId, selected = n.id === sel;
      var sub = n.sub == null ? ty.label : n.sub;
      return h('button', {
        key: n.id, type: 'button', 'data-id': n.id, className: cx('nx-gnode', p.animate !== false && 'nx-gnode--enter', focus && 'nx-gnode--focus', selected && 'nx-gnode--selected', lit && !lit[n.id] && 'nx-gnode--dim', n.suggested && 'nx-gnode--suggested', n.stale && 'nx-gnode--stale', n.restricted && 'nx-gnode--restricted'),
        style: { left: q.x, top: q.y, '--c': ty.color, transition: 'left var(--duration-slow) var(--ease-spring), top var(--duration-slow) var(--ease-spring), opacity var(--duration-base) var(--ease-out)' },
        'aria-pressed': selected, 'aria-label': n.label + ', ' + ty.label + ', ' + (count[n.id] || 0) + ' connections' + (n.more ? ', ' + n.more + ' more not shown' : '') + (focus ? ', focus' : ''),
        onClick: function () { if (p.onSelect) p.onSelect(n.id); }, onDoubleClick: function () { if (p.onExpand) p.onExpand(n.id); }
      },
        h('span', { className: cx('nx-gnode__icon', ty.agent && 'nx-gnode__icon--agent') }, h(Icon, { name: ty.icon, size: focus ? 19 : 15 })),
        h('span', { className: 'nx-gnode__text' }, n.label, sub && h('small', null, sub)),
        n.more ? h('span', { className: 'nx-gnode__more' }, '+' + n.more) : null);
    });
    var mm = null;
    if (p.minimap !== false && nodes.length) {
      var bw = bounds.x1 - bounds.x0 || 1, bh = bounds.y1 - bounds.y0 || 1;
      var vx0 = (-v.x / v.k - bounds.x0) / bw, vy0 = (-v.y / v.k - bounds.y0) / bh, vw = size.w / v.k / bw, vh = size.h / v.k / bh;
      function clamp(x) { return Math.max(0, Math.min(100, x)); }
      mm = h('div', { className: 'nx-glass nx-graph__minimap', 'aria-hidden': true },
        nodes.map(function (n) { var q = P[n.id]; return h('i', { key: n.id, style: { left: (6 + 88 * (q.x - bounds.x0) / bw) + '%', top: (6 + 84 * (q.y - bounds.y0) / bh) + '%' } }); }),
        h('b', { style: { left: clamp(6 + 88 * vx0) + '%', top: clamp(6 + 84 * vy0) + '%', width: Math.min(100, 88 * vw) + '%', height: Math.min(100, 84 * vh) + '%' } }));
    }
    var crumbs = p.trail && p.trail.length ? h('nav', { className: 'nx-glass nx-glass--capsule nx-graph__crumbs', 'aria-label': 'Exploration trail' },
      p.trail.map(function (t, i) {
        var last = i === p.trail.length - 1;
        return h(React.Fragment, { key: t.id }, i > 0 && h(Icon, { name: 'chev', size: 12 }),
          last ? h('b', null, t.label) : h('a', { href: '#', style: { color: 'inherit', textDecoration: 'none' }, onClick: function (e) { e.preventDefault(); if (p.onFocusNode) p.onFocusNode(t.id); } }, t.label));
      })) : null;
    return h('div', {
      ref: ref, className: cx('nx-graph', p.bare && 'nx-graph--bare', p.className), style: Object.assign({ height: p.height || 520 }, p.style),
      role: 'group', 'aria-roledescription': 'graph', 'aria-label': p.label || 'Graph', tabIndex: 0,
      onPointerDown: onDown, onPointerMove: onMove, onPointerUp: onUp, onKeyDown: onKey
    },
      h('div', { className: 'nx-graph__world', style: { transform: 'translate(' + v.x + 'px,' + v.y + 'px) scale(' + v.k + ')' } },
        h('svg', { className: 'nx-graph__edges', width: 1, height: 1, 'aria-hidden': true },
          h('defs', null, h('marker', { id: mk, viewBox: '0 0 10 10', refX: 9, refY: 5, markerWidth: 7, markerHeight: 7, orient: 'auto-start-reverse' }, h('path', { className: 'nx-graph__arrow', d: 'M0 1 10 5 0 9z' }))),
          paths),
        labels, nodeEls),
      crumbs,
      p.status ? h('div', { className: 'nx-glass nx-glass--capsule nx-graph__status', role: 'status' }, h(AgentOrb, { size: 24 }), p.status) : null,
      p.controls === false ? null : h('div', { className: 'nx-graph__controls' }, h('div', { className: 'nx-glass' },
        h('button', { type: 'button', 'aria-label': 'Zoom in', onClick: function () { zoom(1.2); } }, h(Icon, { name: 'plus', size: 17 })),
        h('button', { type: 'button', 'aria-label': 'Zoom out', onClick: function () { zoom(1 / 1.2); } }, h(Icon, { name: 'minus', size: 17 })),
        h('button', { type: 'button', 'aria-label': 'Fit to view', onClick: function () { setView(fitView()); } }, h(Icon, { name: 'fit', size: 17 })))),
      mm);
  }

  function GraphNodeChip(p) {
    var ty = typeOf(p.types, p.type), sub = p.sub == null ? ty.label : p.sub;
    return h('span', { className: cx('nx-gnode nx-gpath__node', p.focus && 'nx-gnode--focus', p.selected && 'nx-gnode--selected', p.suggested && 'nx-gnode--suggested', p.stale && 'nx-gnode--stale', p.restricted && 'nx-gnode--restricted'), style: { '--c': ty.color }, role: p.onClick ? 'button' : null, tabIndex: p.onClick ? 0 : null, onClick: p.onClick },
      h('span', { className: cx('nx-gnode__icon', ty.agent && 'nx-gnode__icon--agent') }, h(Icon, { name: ty.icon, size: 15 })),
      h('span', { className: 'nx-gnode__text' }, p.label, sub && h('small', null, sub)), p.more ? h('span', { className: 'nx-gnode__more' }, '+' + p.more) : null);
  }

  function GraphInspector(p) {
    var node = p.node || {}, ty = typeOf(p.types, node.type), lim = p.collapseAfter || 8;
    var openS = useState({}), open = openS[0], setOpen = openS[1];
    var props = Array.isArray(p.properties) ? p.properties : Object.keys(p.properties || {}).map(function (k) { return [k, p.properties[k]]; });
    var total = (p.relations || []).reduce(function (s, r) { return s + (r.count != null ? r.count : r.items.length); }, 0);
    return h('aside', { className: cx('nx-ginsp', p.className), style: p.style, 'aria-label': (node.label || 'Node') + ' details' },
      h('div', { className: 'nx-ginsp__head' },
        h('span', { className: cx('nx-gnode__icon', ty.agent && 'nx-gnode__icon--agent'), style: { background: ty.color } }, h(Icon, { name: ty.icon, size: 20 })),
        h('div', null, h('small', null, ty.label), h('h3', null, node.label)), p.menu),
      props.length ? h('dl', { className: 'nx-ginsp__props' }, props.map(function (kv) { return [h('dt', { key: 'k' + kv[0] }, kv[0]), h('dd', { key: 'v' + kv[0] }, kv[1])]; })) : null,
      (p.relations || []).length ? h('h4', null, 'Relationships · ' + total) : null,
      (p.relations || []).length ? h('div', { className: 'nx-grel' }, p.relations.map(function (r, ri) {
        var key = r.type + r.direction, all = open[key] || r.items.length <= lim, items = all ? r.items : r.items.slice(0, lim);
        return h(React.Fragment, { key: key + ri },
          h('div', { className: 'nx-grel__group' }, r.direction === 'in' ? '← ' + r.type : r.type + ' →', h('em', null, r.count != null ? r.count : r.items.length)),
          items.map(function (it) {
            return h('div', { key: it.id, className: 'nx-grel__item', role: 'button', tabIndex: 0, onClick: function () { if (p.onNavigate) p.onNavigate(it.id); }, onKeyDown: function (e) { if ((e.key === 'Enter' || e.key === ' ') && p.onNavigate) { e.preventDefault(); p.onNavigate(it.id); } } },
              swatch(p.types, it.type), h('span', null, it.label, it.note ? h('small', null, ' · ' + it.note) : null), h(Icon, { name: 'chev', size: 14, className: 'chev' }));
          }),
          !all ? h('div', { className: 'nx-grel__item', role: 'button', tabIndex: 0, onClick: function () { var o = Object.assign({}, open); o[key] = 1; setOpen(o); } }, h('span', { style: { color: 'var(--accent)', fontWeight: 600 } }, 'Show all ' + r.items.length)) : null);
      })) : null,
      (p.suggestions || []).map(function (s) {
        return h('div', { key: s.id, style: { display: 'grid', gap: 8, padding: 12, borderRadius: 12, border: '1.5px dashed var(--flow)', background: 'color-mix(in srgb, var(--flow-soft) 60%, var(--surface-raised))' } },
          h('div', { style: { display: 'flex', gap: 8, alignItems: 'center' } }, h(AgentOrb, { size: 24 }), h('b', { style: { font: '600 13px var(--font-sans)' } }, s.title)),
          h('span', { style: { color: 'var(--ink-muted)' } }, s.evidence),
          h('div', { style: { display: 'flex', gap: 8 } },
            h('button', { type: 'button', className: 'nx-btn nx-btn--sm nx-btn--secondary', onClick: function () { if (p.onDismiss) p.onDismiss(s); } }, 'Dismiss'),
            h('button', { type: 'button', className: 'nx-btn nx-btn--sm nx-btn--primary', onClick: function () { if (p.onConfirm) p.onConfirm(s); } }, 'Confirm link')));
      }),
      h('div', { className: 'nx-ginsp__actions' },
        p.onExpand && h('button', { type: 'button', className: 'nx-btn nx-btn--sm nx-btn--secondary', onClick: p.onExpand }, h(Icon, { name: 'expand', size: 14 }), ' Expand'),
        p.onPath && h('button', { type: 'button', className: 'nx-btn nx-btn--sm nx-btn--secondary', onClick: p.onPath }, h(Icon, { name: 'link', size: 14 }), ' Path to…'),
        p.onAsk && h('button', { type: 'button', className: 'nx-btn nx-btn--sm nx-btn--secondary', onClick: p.onAsk }, h(Icon, { name: 'sparkle', size: 14 }), ' Ask about this'),
        p.actions),
      p.source ? h('span', { className: 'nx-trust', style: { fontSize: 12 } }, h(Icon, { name: 'shield', size: 14 }), ' ', p.source) : null);
  }

  function GraphPath(p) {
    return h('div', { style: { display: 'grid', gap: 14 } },
      p.summary ? h('div', { style: { display: 'flex', gap: 10, alignItems: 'flex-start' } }, h(AgentOrb, { size: 30 }), h('p', { style: { margin: '4px 0 0', font: '400 15px/22px var(--font-sans)' } }, p.summary)) : null,
      (p.paths || []).map(function (path, i) {
        var est = path.status === 'established';
        return h('div', { key: i, style: { display: 'grid', gap: 10, padding: 16, border: '1px solid var(--line)', borderRadius: 16, background: 'var(--surface-raised)' } },
          h('div', { style: { display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' } },
            h('b', { style: { font: '400 18px var(--font-display)' } }, path.title),
            path.status ? h('span', { className: cx('nx-badge', est ? 'nx-badge--success' : 'nx-badge--attention') }, est ? 'Established' : 'Needs review') : null,
            path.meta ? h('span', { style: { marginLeft: 'auto', font: '400 12px var(--font-sans)', color: 'var(--ink-muted)' } }, path.meta) : null),
          h('div', { className: 'nx-gpath' }, path.steps.map(function (s, j) {
            if (s.edge) return h('span', { key: j, className: cx('nx-gpath__hop', s.edge.kind && 'nx-gpath__hop--' + s.edge.kind) }, s.edge.dir === 'in' ? '← ' + s.edge.label : s.edge.label + ' →');
            return h(GraphNodeChip, Object.assign({ key: j, types: p.types }, s.node, { onClick: p.onNavigate ? function () { p.onNavigate(s.node.id); } : null }));
          })),
          p.onShow ? h('div', null, h('button', { type: 'button', className: 'nx-btn nx-btn--sm nx-btn--secondary', onClick: function () { p.onShow(path, i); } }, 'Show on canvas')) : null);
      }));
  }

  function GraphLegend(p) {
    var hidden = p.hidden || [], counts = p.counts || {}, types = p.types || GRAPH_TYPES;
    var keys = p.order || Object.keys(types);
    return h('div', { className: 'nx-glegend', role: 'group', 'aria-label': p.label || 'Node types' }, keys.map(function (t) {
      var off = hidden.indexOf(t) >= 0;
      return h('button', { key: t, type: 'button', className: cx('nx-glegend__row', off && 'nx-glegend__row--off'), 'aria-pressed': !off, style: { border: 0, background: 'none', textAlign: 'left', width: '100%' }, onClick: function () { if (p.onToggle) p.onToggle(t); } },
        swatch(types, t), h('span', null, typeOf(types, t).label), counts[t] != null ? h('em', null, counts[t]) : null);
    }));
  }

  function GraphTable(p) {
    return h('table', { className: 'nx-gtable' },
      p.caption ? h('caption', { style: { textAlign: 'left', font: '400 20px var(--font-display)', marginBottom: 8 } }, p.caption) : null,
      h('thead', null, h('tr', null, ['Node', 'Type', 'Relationship', 'Direction', 'Source'].map(function (c) { return h('th', { key: c, scope: 'col' }, c); }))),
      h('tbody', null, (p.rows || []).map(function (r) {
        return h('tr', { key: r.id },
          h('td', null, h('span', { className: 'nx-gcell' }, swatch(p.types, r.type), p.onNavigate ? h('a', { href: '#', style: { color: 'inherit', fontWeight: 600 }, onClick: function (e) { e.preventDefault(); p.onNavigate(r.id); } }, r.label) : h('b', { style: { fontWeight: 600 } }, r.label))),
          h('td', null, typeOf(p.types, r.type).label), h('td', null, h('code', null, r.rel || '—')),
          h('td', null, r.dir === 'in' ? '← incoming' : r.dir === 'out' ? 'outgoing →' : (r.dir || '')), h('td', { style: { color: 'var(--ink-muted)' } }, r.source || ''));
      })));
  }

  Object.assign(N, { GRAPH_TYPES: GRAPH_TYPES, GraphCanvas: GraphCanvas, GraphNodeChip: GraphNodeChip, GraphInspector: GraphInspector, GraphPath: GraphPath, GraphLegend: GraphLegend, GraphTable: GraphTable, layoutGraph: layoutGraph });
})();

/* ── Charts II ── */
(function () {
  var N = window.Nexus, h = React.createElement, Icon = N.Icon;
  function cx() { var o = []; for (var i = 0; i < arguments.length; i++) if (arguments[i]) o.push(arguments[i]); return o.join(' '); }
  function fmt(v, d, unit) { if (v == null || isNaN(v)) return '—'; var s = (Math.round(v * Math.pow(10, d || 0)) / Math.pow(10, d || 0)).toFixed(d || 0); return s + (unit || ''); }
  function sgn(v, d, unit) { return (v > 0 ? '+' : v < 0 ? '−' : '') + fmt(Math.abs(v), d, unit); }
  function Frame(p, body) {
    return h('figure', { className: cx('nx-chart-fig', p.className), style: Object.assign({ margin: 0 }, p.style) },
      (p.title || p.subtitle) && h('figcaption', { className: 'nx-chart-head' }, p.title && h('b', null, p.title), p.subtitle && h('span', null, p.subtitle)),
      p.legend, body,
      (p.note || p.onTable) && h('div', { className: 'nx-chart-foot' }, p.note, p.onTable && h('a', { href: '#', onClick: function (e) { e.preventDefault(); p.onTable(); } }, 'View as table')));
  }
  function Legend(items) {
    return h('div', { className: 'nx-legend', style: { marginBottom: 8 } }, items.map(function (it, i) {
      return h('span', { key: i }, h('i', { className: it.cls || 'ord', style: it.color ? { background: it.color } : null }), it.label);
    }));
  }
  function hatchDefs() {
    return h('defs', null, h('pattern', { id: 'nx-hatch', width: 6, height: 6, patternUnits: 'userSpaceOnUse', patternTransform: 'rotate(45)' },
      h('rect', { width: 6, height: 6, className: 'nx-c-empty' }), h('line', { x1: 0, y1: 0, x2: 0, y2: 6, className: 'nx-c-hatch' })));
  }
  var ORD = ['var(--ord-1)', 'var(--ord-2)', 'var(--ord-3)', 'var(--ord-4)'];

  /* Proficiency / Likert stacked bar (100%) — stacked or diverging */
  function StackedBarChart(p) {
    var rows = p.rows, levels = p.levels, diverging = p.mode === 'diverging', w = p.width || 720, lw = p.labelWidth || 150, rowH = 34, top = 8;
    var nLv = levels.length, mid = p.midIndex != null ? p.midIndex : nLv / 2;
    var H = top + rows.length * rowH + 30, plotW = w - lw - 70;
    var cls = function (i) { if (nLv === 5 && i === 2) return 'nx-c-ord-mid'; var k = nLv === 5 ? (i < 2 ? i + 1 : i) : i + 1; return 'nx-c-ord-' + Math.min(4, k); };
    var inkCls = function (i) { return (nLv === 5 ? (i === 1 || i === 2 || i === 3) : (i === 1 || i === 2)) ? ' nx-c-seg--ink' : ''; };
    var maxLeft = 0, maxRight = 0;
    if (diverging) rows.forEach(function (r) { var t = r.values.reduce(function (a, b) { return a + b; }, 0) || 1, L = 0, R = 0; r.values.forEach(function (v, i) { var pc = v / t * 100; if (i < Math.floor(mid)) L += pc; else if (i >= Math.ceil(mid)) R += pc; else { L += pc / 2; R += pc / 2; } }); maxLeft = Math.max(maxLeft, L); maxRight = Math.max(maxRight, R); });
    var span = diverging ? Math.max(maxLeft, maxRight, 50) : 100;
    var zeroX = diverging ? lw + plotW / 2 : lw, scale = diverging ? (plotW / 2) / span : plotW / 100;
    var body = h('svg', { className: 'nx-chart', viewBox: '0 0 ' + w + ' ' + H, width: '100%', role: 'img', 'aria-label': p.label || p.title }, hatchDefs(),
      diverging ? h('line', { className: 'nx-c-zero', x1: zeroX, x2: zeroX, y1: 2, y2: H - 22 }) : null,
      rows.map(function (r, ri) {
        var y = top + ri * rowH, t = r.values.reduce(function (a, b) { return a + b; }, 0) || 1;
        var label = h('text', { x: 0, y: y + 17, className: 'nx-c-label' }, r.label, r.n != null ? h('tspan', { className: 'nx-c-muted', dx: 6, style: { fontSize: 11 } }, 'n=' + r.n) : null);
        if (r.suppressed) return h('g', { key: ri }, label, h('rect', { x: lw, y: y + 4, width: plotW, height: 20, rx: 4, className: 'nx-c-off' }), h('text', { x: lw + 10, y: y + 18, className: 'nx-c-muted', style: { fontSize: 12 } }, 'Hidden: group under 10'));
        var x;
        if (diverging) { var left = 0; r.values.forEach(function (v, i) { var pc = v / t * 100; if (i < Math.floor(mid)) left += pc; else if (i < Math.ceil(mid)) left += pc / 2; }); x = zeroX - left * scale; } else x = lw;
        var segs = r.values.map(function (v, i) {
          var pc = v / t * 100, sw = pc * scale, X = x; x += sw;
          return h('g', { key: i, tabIndex: 0, 'data-focusable': 1, 'aria-label': r.label + ', ' + levels[i].label + ': ' + fmt(pc, 0, '%') },
            h('rect', { x: X, y: y + 4, width: Math.max(0, sw - 1), height: 20, className: cls(i) }),
            sw > 26 ? h('text', { x: X + sw / 2, y: y + 18, textAnchor: 'middle', className: 'nx-c-seg' + inkCls(i) }, fmt(pc, 0)) : null);
        });
        var sumHi = 0; r.values.forEach(function (v, i) { if (i >= (p.goodFrom != null ? p.goodFrom : Math.ceil(mid))) sumHi += v / t * 100; });
        return h('g', { key: ri }, label, segs, h('text', { x: w - 4, y: y + 18, textAnchor: 'end', className: 'nx-c-strong' }, fmt(sumHi, 0, '%')));
      }),
      h('text', { x: w - 4, y: H - 6, textAnchor: 'end', className: 'nx-c-muted', style: { fontSize: 11 } }, p.sumLabel || 'Meets + exceeds'));
    return Frame(Object.assign({}, p, { legend: Legend(levels.map(function (l, i) { return { label: l.label, color: nLv === 5 && i === 2 ? 'var(--ord-mid)' : ORD[nLv === 5 ? (i < 2 ? i : i - 1) : i] }; })) }), body);
  }

  /* Dumbbell: the gap between two values per row */
  function DumbbellChart(p) {
    var rows = p.rows, w = p.width || 720, lw = p.labelWidth || 170, rowH = 32, min = p.min, max = p.max, H = rows.length * rowH + 44, rw = 70;
    var sx = function (v) { return lw + (v - min) / (max - min) * (w - lw - rw - 16); };
    var ticks = p.ticks || [min, (min + max) / 2, max];
    var body = h('svg', { className: 'nx-chart', viewBox: '0 0 ' + w + ' ' + H, width: '100%', role: 'img', 'aria-label': p.label || p.title },
      ticks.map(function (t) { return h('g', { key: t }, h('line', { className: 'nx-c-grid', x1: sx(t), x2: sx(t), y1: 4, y2: rows.length * rowH + 8 }), h('text', { x: sx(t), y: rows.length * rowH + 26, textAnchor: 'middle' }, fmt(t, 0, p.unit))); }),
      h('text', { x: w - 4, y: 12, textAnchor: 'end', className: 'nx-c-muted', style: { fontSize: 11 } }, 'Gap'),
      rows.map(function (r, i) {
        var y = 20 + i * rowH + 4, gap = r.a - r.b, watch = p.watchAbove != null && Math.abs(gap) >= p.watchAbove;
        return h('g', { key: i, tabIndex: 0, 'data-focusable': 1, 'aria-label': r.label + ': ' + p.aLabel + ' ' + fmt(r.a, 1, p.unit) + ', ' + p.bLabel + ' ' + fmt(r.b, 1, p.unit) + ', gap ' + sgn(gap, 1, p.unit) },
          h('text', { x: 0, y: y + 4, className: 'nx-c-label' }, r.label),
          h('line', { className: cx('nx-c-link', watch && 'nx-c-link--watch'), x1: sx(r.a), x2: sx(r.b), y1: y, y2: y }),
          h('circle', { cx: sx(r.a), cy: y, r: 6, className: 'nx-c-pt-a' }), h('circle', { cx: sx(r.b), cy: y, r: 6.5, className: 'nx-c-pt-b' }),
          h('text', { x: w - 4, y: y + 4, textAnchor: 'end', className: watch ? 'nx-c-strong' : 'nx-c-muted' }, sgn(gap, 1, p.unit === '%' ? ' pts' : p.unit)));
      }));
    return Frame(Object.assign({}, p, { legend: Legend([{ label: p.aLabel, cls: 'ring' }, { label: p.bLabel, color: 'var(--chart-1)', cls: 'dot' }].map(function (x) { return x; })) }), body);
  }

  /* Slope: two points in time, one line per item */
  function SlopeChart(p) {
    var items = p.items, w = p.width || 560, H = p.height || 340, x1 = 170, x2 = w - 170, all = [];
    items.forEach(function (it) { all.push(it.from, it.to); });
    var min = p.min != null ? p.min : Math.min.apply(null, all), max = p.max != null ? p.max : Math.max.apply(null, all);
    var sy = function (v) { return 34 + (max - v) / (max - min || 1) * (H - 60); };
    function spread(key) { var arr = items.map(function (it, i) { return { i: i, y: sy(it[key]) }; }).sort(function (a, b) { return a.y - b.y; }); for (var k = 1; k < arr.length; k++) if (arr[k].y - arr[k - 1].y < 15) arr[k].y = arr[k - 1].y + 15; var o = {}; arr.forEach(function (a) { o[a.i] = a.y; }); return o; }
    var L = spread('from'), R = spread('to');
    var body = h('svg', { className: 'nx-chart', viewBox: '0 0 ' + w + ' ' + H, width: '100%', role: 'img', 'aria-label': p.label || p.title },
      h('text', { x: x1, y: 14, textAnchor: 'middle', className: 'nx-c-strong' }, p.fromLabel), h('text', { x: x2, y: 14, textAnchor: 'middle', className: 'nx-c-strong' }, p.toLabel),
      h('line', { className: 'nx-c-axis', x1: x1, x2: x1, y1: 24, y2: H - 16 }), h('line', { className: 'nx-c-axis', x1: x2, x2: x2, y1: 24, y2: H - 16 }),
      items.map(function (it, i) {
        var d = it.to - it.from, watch = it.watch != null ? it.watch : d < 0;
        var stroke = watch ? 'var(--chart-3)' : it.context ? 'var(--chart-4)' : 'var(--chart-1)';
        return h('g', { key: i, tabIndex: 0, 'data-focusable': 1, 'aria-label': it.label + ': ' + fmt(it.from, 1, p.unit) + ' to ' + fmt(it.to, 1, p.unit) },
          h('line', { x1: x1, y1: sy(it.from), x2: x2, y2: sy(it.to), style: { stroke: stroke, strokeWidth: watch ? 2.5 : 2 } }),
          h('circle', { cx: x1, cy: sy(it.from), r: 4, style: { fill: stroke } }), h('circle', { cx: x2, cy: sy(it.to), r: 4, style: { fill: stroke } }),
          h('text', { x: x1 - 10, y: L[i] + 4, textAnchor: 'end', className: watch ? 'nx-c-strong' : 'nx-c-label', style: { fontSize: 12 } }, it.label + '  ' + fmt(it.from, 1)),
          h('text', { x: x2 + 10, y: R[i] + 4, className: watch ? 'nx-c-strong' : 'nx-c-label', style: { fontSize: 12 } }, fmt(it.to, 1) + '  ' + sgn(d, 1)));
      }));
    return Frame(p, body);
  }

  /* Scatter with quadrants (growth vs achievement) */
  function ScatterQuadrant(p) {
    var pts = p.points, w = p.width || 640, H = p.height || 420, l = 56, r = 20, t = 16, b = 46;
    var sx = function (v) { return l + (v - p.xMin) / (p.xMax - p.xMin) * (w - l - r); }, sy = function (v) { return t + (p.yMax - v) / (p.yMax - p.yMin) * (H - t - b); };
    var mx = sx(p.xMid), my = sy(p.yMid), q = p.quadrants || {};
    var body = h('svg', { className: 'nx-chart', viewBox: '0 0 ' + w + ' ' + H, width: '100%', role: 'img', 'aria-label': p.label || p.title },
      h('rect', { x: l, y: t, width: mx - l, height: my - t, className: 'nx-c-quadbg' }), h('rect', { x: mx, y: t, width: w - r - mx, height: my - t, className: 'nx-c-quadbg' }),
      h('rect', { x: l, y: my, width: mx - l, height: H - b - my, className: 'nx-c-quadbg--watch nx-c-quadbg' }), h('rect', { x: mx, y: my, width: w - r - mx, height: H - b - my, className: 'nx-c-quadbg' }),
      (p.xTicks || []).map(function (v) { return h('g', { key: 'x' + v }, h('line', { className: 'nx-c-grid', x1: sx(v), x2: sx(v), y1: t, y2: H - b }), h('text', { x: sx(v), y: H - b + 16, textAnchor: 'middle' }, v)); }),
      (p.yTicks || []).map(function (v) { return h('g', { key: 'y' + v }, h('line', { className: 'nx-c-grid', x1: l, x2: w - r, y1: sy(v), y2: sy(v) }), h('text', { x: l - 8, y: sy(v) + 4, textAnchor: 'end' }, v)); }),
      h('line', { className: 'nx-c-zero', x1: mx, x2: mx, y1: t, y2: H - b }), h('line', { className: 'nx-c-zero', x1: l, x2: w - r, y1: my, y2: my }),
      q.tl && h('text', { x: l + 8, y: t + 16, className: 'nx-c-quad' }, q.tl), q.tr && h('text', { x: w - r - 8, y: t + 16, textAnchor: 'end', className: 'nx-c-quad' }, q.tr),
      q.bl && h('text', { x: l + 8, y: H - b - 8, className: 'nx-c-quad' }, q.bl), q.br && h('text', { x: w - r - 8, y: H - b - 8, textAnchor: 'end', className: 'nx-c-quad' }, q.br),
      pts.map(function (pt, i) {
        var rr = pt.size ? 4 + Math.sqrt(pt.size) * 0.5 : 6;
        return h('g', { key: i, tabIndex: 0, 'data-focusable': 1, 'aria-label': pt.label + ': ' + p.xLabel + ' ' + pt.x + ', ' + p.yLabel + ' ' + pt.y },
          h('circle', { cx: sx(pt.x), cy: sy(pt.y), r: rr, className: cx('nx-c-pt', pt.context && 'nx-c-pt--ctx'), style: pt.watch ? { fill: 'var(--chart-3)' } : null }),
          pt.showLabel ? h('text', { x: sx(pt.x) + rr + 4, y: sy(pt.y) + 4, className: 'nx-c-label nx-c-halo', style: { fontSize: 12 } }, pt.label) : null);
      }),
      h('text', { x: (l + w - r) / 2, y: H - 8, textAnchor: 'middle', className: 'nx-c-label' }, p.xLabel),
      h('text', { transform: 'translate(14 ' + (t + (H - t - b) / 2) + ') rotate(-90)', textAnchor: 'middle', className: 'nx-c-label' }, p.yLabel));
    return Frame(p, body);
  }

  /* Histogram with optional strip plot and a reference line */
  function Histogram(p) {
    var w = p.width || 640, H = p.height || 240, l = 40, r = 16, t = 14, b = 40, bins = p.bins;
    var max = Math.max.apply(null, bins.map(function (x) { return x.count; })) * 1.12, bw = (w - l - r) / bins.length;
    var lo = bins[0].from, hi = bins[bins.length - 1].to, sx = function (v) { return l + (v - lo) / (hi - lo) * (w - l - r); };
    var sh = p.strip ? 34 : 0, base = H - b - sh;
    var sy = function (c) { return base - c / max * (base - t); };
    var body = h('svg', { className: 'nx-chart', viewBox: '0 0 ' + w + ' ' + H, width: '100%', role: 'img', 'aria-label': p.label || p.title },
      (p.yTicks || []).map(function (c) { return h('g', { key: c }, h('line', { className: 'nx-c-grid', x1: l, x2: w - r, y1: sy(c), y2: sy(c) }), h('text', { x: l - 6, y: sy(c) + 4, textAnchor: 'end' }, c)); }),
      bins.map(function (bn, i) { var above = p.cut != null && bn.from >= p.cut; return h('rect', { key: i, x: l + i * bw + 1, y: sy(bn.count), width: bw - 2, height: base - sy(bn.count), rx: 2, className: above ? 'nx-c-bar' : 'nx-c-bar--ctx', tabIndex: 0, 'data-focusable': 1, 'aria-label': bn.from + '–' + bn.to + ': ' + bn.count }); }),
      h('line', { className: 'nx-c-axis', x1: l, x2: w - r, y1: base, y2: base }),
      p.strip ? p.strip.map(function (v, i) { return h('circle', { key: 's' + i, cx: sx(v), cy: base + 10 + (i * 7 % 18), r: 2.6, className: 'nx-c-strip' }); }) : null,
      (p.xTicks || [lo, hi]).map(function (v) { return h('text', { key: 'xt' + v, x: sx(v), y: H - b + 18, textAnchor: 'middle' }, v); }),
      p.cut != null && h('g', null, h('line', { className: 'nx-c-cut', x1: sx(p.cut), x2: sx(p.cut), y1: t - 4, y2: base + sh }), h('text', { x: sx(p.cut) + (sx(p.cut) > w * 0.7 ? -6 : 6), y: t + 8, textAnchor: sx(p.cut) > w * 0.7 ? 'end' : 'start', className: 'nx-c-strong nx-c-halo', style: { fontSize: 12 } }, p.cutLabel)),
      p.xLabel && h('text', { x: (l + w - r) / 2, y: H - 4, textAnchor: 'middle', className: 'nx-c-label' }, p.xLabel));
    return Frame(p, body);
  }

  /* Calendar heatmap: school days by week */
  function CalendarHeatmap(p) {
    var days = p.days, start = new Date(p.start + 'T00:00:00'), weeks = p.weeks || 20, cell = p.cell || 16, gap = 3, l = 30, t = 22;
    var byDate = {}; days.forEach(function (d) { byDate[d.date] = d; });
    var w = l + weeks * (cell + gap) + 10, H = t + 5 * (cell + gap) + 16;
    var stepOf = p.step || function (v) { return v >= 96 ? 4 : v >= 94 ? 3 : v >= 92 ? 2 : v >= 90 ? 1 : 0; };
    var cells = [], months = [], lastM = -1;
    for (var wk = 0; wk < weeks; wk++) for (var dw = 0; dw < 5; dw++) {
      var dt = new Date(start); dt.setDate(start.getDate() + wk * 7 + dw);
      var key = dt.getFullYear() + '-' + String(dt.getMonth() + 1).padStart(2, '0') + '-' + String(dt.getDate()).padStart(2, '0');
      var d = byDate[key], x = l + wk * (cell + gap), y = t + dw * (cell + gap);
      if (dw === 0 && dt.getMonth() !== lastM) { lastM = dt.getMonth(); if (months.length && wk - months[months.length - 1].wk < 3) months.pop(); months.push({ wk: wk, el: h('text', { key: 'm' + wk, x: x, y: 12, className: 'nx-c-muted', style: { fontSize: 11 } }, dt.toLocaleString('en-US', { month: 'short' })) }); }
      cells.push(h('rect', { key: key, x: x, y: y, width: cell, height: cell, rx: 3, className: !d ? 'nx-c-empty' : d.off ? 'nx-c-off' : 'nx-c-seq-' + stepOf(d.value), tabIndex: d && !d.off ? 0 : null, 'data-focusable': 1, 'aria-label': key + (d ? (d.off ? ', no school' + (d.note ? ' (' + d.note + ')' : '') : ', ' + fmt(d.value, 1, p.unit)) : '') },
        d && d.note && !d.off ? h('title', null, d.note) : null));
      if (d && d.mark) cells.push(h('circle', { key: key + 'm', cx: x + cell / 2, cy: y + cell / 2, r: 2.5, style: { fill: 'var(--ink)' } }));
    }
    var body = h('svg', { className: 'nx-chart', viewBox: '0 0 ' + w + ' ' + H, width: '100%', style: { maxWidth: w * 1.4 }, role: 'img', 'aria-label': p.label || p.title }, hatchDefs(), months.map(function (m) { return m.el; }),
      ['M', 'T', 'W', 'T', 'F'].map(function (dname, i) { return h('text', { key: 'd' + i, x: 0, y: t + i * (cell + gap) + cell - 4, className: 'nx-c-muted', style: { fontSize: 10 } }, dname); }), cells);
    var steps = p.stepLabels || ['< 90%', '90–92', '92–94', '94–96', '≥ 96%'];
    return Frame(Object.assign({}, p, { legend: Legend(steps.map(function (s, i) { return { label: s, color: 'var(--seq-' + i + ')' }; }).concat([{ label: 'No school', cls: 'ord hatch' }])) }), body);
  }

  /* Stacked area over time */
  function StackedAreaChart(p) {
    var s = p.series, n = s[0].values.length, w = p.width || 640, H = p.height || 260, l = 44, r = 120, t = 12, b = 30;
    var tot = []; for (var i = 0; i < n; i++) tot.push(s.reduce(function (a, x) { return a + x.values[i]; }, 0));
    var max = p.max || Math.max.apply(null, tot) * 1.08, sx = function (i) { return l + i * (w - l - r) / (n - 1); }, sy = function (v) { return H - b - v / max * (H - t - b); };
    var acc = new Array(n).fill(0), layers = s.map(function (x, k) {
      var lo = acc.slice(), hi = acc.map(function (a, i) { return a + x.values[i]; }); acc = hi;
      var d = 'M' + hi.map(function (v, i) { return sx(i) + ' ' + sy(v); }).join(' L') + ' L' + lo.map(function (v, i) { return sx(n - 1 - i) + ' ' + sy(lo[n - 1 - i]); }).join(' L') + 'Z';
      var midY = sy((lo[n - 1] + hi[n - 1]) / 2);
      return h('g', { key: k }, h('path', { d: d, className: 'nx-c-area-' + (k % 5 + 1) }), h('path', { d: 'M' + hi.map(function (v, i) { return sx(i) + ' ' + sy(v); }).join(' L'), className: 'nx-c-areaedge' }),
        h('text', { x: w - r + 8, y: midY + 4, className: 'nx-c-label', style: { fontSize: 12 } }, x.label, h('tspan', { className: 'nx-c-muted', dx: 6 }, x.values[n - 1].toLocaleString())));
    });
    var body = h('svg', { className: 'nx-chart', viewBox: '0 0 ' + w + ' ' + H, width: '100%', role: 'img', 'aria-label': p.label || p.title },
      (p.yTicks || []).map(function (v) { return h('g', { key: v }, h('line', { className: 'nx-c-grid', x1: l, x2: w - r, y1: sy(v), y2: sy(v) }), h('text', { x: l - 6, y: sy(v) + 4, textAnchor: 'end' }, v.toLocaleString())); }),
      layers, (p.xLabels || []).map(function (lb, i) { return lb ? h('text', { key: 'x' + i, x: sx(i), y: H - 8, textAnchor: 'middle' }, lb) : null; }),
      p.marker != null && h('g', null, h('line', { className: 'nx-c-cut', x1: sx(p.marker), x2: sx(p.marker), y1: t, y2: H - b }), h('text', { x: sx(p.marker) + 4, y: t + 10, className: 'nx-c-muted', style: { fontSize: 11 } }, p.markerLabel)));
    return Frame(p, body);
  }

  /* Waterfall: start, changes, end */
  function WaterfallChart(p) {
    var steps = p.steps, w = p.width || 640, H = p.height || 260, l = 50, r = 12, t = 24, b = 46, run = 0, bars = [];
    steps.forEach(function (s) { if (s.total) { bars.push({ s: s, y0: null, y1: s.value }); run = s.value; } else { bars.push({ s: s, y0: run, y1: run + s.value }); run += s.value; } });
    var vals = []; bars.forEach(function (b) { if (b.y0 != null) vals.push(b.y0); vals.push(b.y1); });
    var min = p.min != null ? p.min : Math.min.apply(null, vals) * 0.98, max = p.max != null ? p.max : Math.max.apply(null, vals) * 1.01;
    var step = (w - l - r) / bars.length, bw = Math.min(54, step * 0.6), sy = function (v) { return t + (max - Math.max(min, Math.min(max, v))) / (max - min) * (H - t - b); };
    bars.forEach(function (b) { if (b.y0 == null) b.y0 = min; });
    var body = h('svg', { className: 'nx-chart', viewBox: '0 0 ' + w + ' ' + H, width: '100%', role: 'img', 'aria-label': p.label || p.title },
      (p.yTicks || []).map(function (v) { return h('g', { key: v }, h('line', { className: 'nx-c-grid', x1: l, x2: w - r, y1: sy(v), y2: sy(v) }), h('text', { x: l - 6, y: sy(v) + 4, textAnchor: 'end' }, v.toLocaleString())); }),
      bars.map(function (bb, i) {
        var X = l + i * step + (step - bw) / 2, top = sy(Math.max(bb.y0, bb.y1)), hh = Math.max(1.5, Math.abs(sy(bb.y0) - sy(bb.y1))), s = bb.s;
        var c = s.total ? 'nx-c-total' : s.value >= 0 ? 'nx-c-pos' : 'nx-c-neg';
        var next = bars[i + 1];
        return h('g', { key: i, tabIndex: 0, 'data-focusable': 1, 'aria-label': s.label + ': ' + (s.total ? s.value.toLocaleString() : sgn(s.value, 0)) },
          h('rect', { x: X, y: top, width: bw, height: hh, rx: 2, className: c }),
          next ? h('line', { className: 'nx-c-connector', x1: X + bw, x2: X + step, y1: sy(bb.y1), y2: sy(bb.y1) }) : null,
          h('text', { x: X + bw / 2, y: top - 6, textAnchor: 'middle', className: s.total ? 'nx-c-strong' : 'nx-c-label', style: { fontSize: 12 } }, s.total ? s.value.toLocaleString() : sgn(s.value, 0)),
          h('text', { x: X + bw / 2, y: H - b + 16, textAnchor: 'middle', style: { fontSize: 11 } }, s.label), s.sub ? h('text', { x: X + bw / 2, y: H - b + 30, textAnchor: 'middle', className: 'nx-c-muted', style: { fontSize: 10 } }, s.sub) : null);
      }));
    return Frame(p, body);
  }

  /* Bullet: a value against context bands and a comparison tick */
  function BulletChart(p) {
    var rows = p.rows, w = p.width || 640, lw = p.labelWidth || 180, rowH = 46, H = rows.length * rowH + 26, rw = 60, min = p.min || 0, max = p.max;
    var sx = function (v) { return lw + (v - min) / (max - min) * (w - lw - rw); };
    var body = h('svg', { className: 'nx-chart', viewBox: '0 0 ' + w + ' ' + H, width: '100%', role: 'img', 'aria-label': p.label || p.title },
      rows.map(function (r, i) {
        var y = 8 + i * rowH, bands = r.bands || p.bands || [], prev = min;
        return h('g', { key: i, tabIndex: 0, 'data-focusable': 1, 'aria-label': r.label + ': ' + fmt(r.value, 1, p.unit) + (r.compare != null ? ', ' + (p.compareLabel || 'comparison') + ' ' + fmt(r.compare, 1, p.unit) : '') },
          h('text', { x: 0, y: y + 16, className: 'nx-c-label' }, r.label), r.sub ? h('text', { x: 0, y: y + 31, className: 'nx-c-muted', style: { fontSize: 11 } }, r.sub) : null,
          bands.map(function (bd, k) { var x0 = sx(prev); prev = bd; return h('rect', { key: k, x: x0, y: y + 2, width: sx(bd) - x0, height: 26, className: 'nx-c-band-' + (k + 1) }); }),
          h('rect', { x: sx(min), y: y + 10, width: sx(r.value) - sx(min), height: 10, rx: 2, className: 'nx-c-measure' }),
          r.compare != null ? h('line', { className: 'nx-c-compare', x1: sx(r.compare), x2: sx(r.compare), y1: y, y2: y + 30 }) : null,
          h('text', { x: w - 4, y: y + 19, textAnchor: 'end', className: 'nx-c-strong' }, fmt(r.value, p.decimals || 0, p.unit)));
      }),
      (p.ticks || []).map(function (t) { return h('text', { key: t, x: sx(t), y: H - 4, textAnchor: 'middle' }, fmt(t, 0, p.unit)); }));
    return Frame(Object.assign({}, p, { legend: Legend([{ label: p.valueLabel || 'This year', color: 'var(--ink)' }, { label: p.compareLabel || 'Comparison', color: 'var(--chart-3)' }].concat((p.bandLabels || []).map(function (b, k) { return { label: b, color: 'color-mix(in srgb, var(--chart-4) ' + [18, 32, 48][k] + '%, var(--surface-raised))' }; }))) }), body);
  }

  /* School map: illustrative regions + school points */
  function SchoolMap(p) {
    var w = p.width || 640, H = p.height || 420, stepOf = p.step || function () { return 2; };
    var body = h('svg', { className: 'nx-chart', viewBox: '0 0 ' + w + ' ' + H, width: '100%', role: 'img', 'aria-label': p.label || p.title },
      h('rect', { width: w, height: H, rx: 12, className: 'nx-c-water' }),
      p.land ? h('path', { d: p.land, className: 'nx-c-landbase' }) : null,
      p.regions.map(function (rg) { return h('path', { key: rg.id, d: rg.d, className: 'nx-c-region ' + (rg.value == null ? 'nx-c-off' : 'nx-c-seq-' + stepOf(rg.value)), tabIndex: 0, 'data-focusable': 1, 'aria-label': rg.label + ': ' + (rg.value == null ? 'no data' : fmt(rg.value, 1, p.unit)) }, h('title', null, rg.label)); }),
      p.hatchDefs !== false ? hatchDefs() : null,
      (p.points || []).map(function (pt, i) {
        return h('g', { key: i }, pt.kind === 'high' ? h('rect', { x: pt.x - 7, y: pt.y - 7, width: 14, height: 14, rx: 2, className: cx('nx-c-school', pt.watch && 'nx-c-school--watch') }) : pt.kind === 'middle' ? h('path', { d: 'M' + pt.x + ' ' + (pt.y - 8) + 'L' + (pt.x + 8) + ' ' + (pt.y + 6) + 'L' + (pt.x - 8) + ' ' + (pt.y + 6) + 'Z', className: cx('nx-c-school', pt.watch && 'nx-c-school--watch') }) : h('circle', { cx: pt.x, cy: pt.y, r: 6.5, className: cx('nx-c-school', pt.watch && 'nx-c-school--watch') }),
          pt.label ? h('text', { x: pt.x + 11, y: pt.y + 4, className: cx('nx-c-label nx-c-halo', pt.watch && 'nx-c-strong'), style: { fontSize: 12 } }, pt.label) : null);
      }),
      p.caption ? h('text', { x: w - 12, y: H - 12, textAnchor: 'end', className: 'nx-c-muted', style: { fontSize: 10 } }, p.caption) : null);
    var steps = p.stepLabels || [];
    return Frame(Object.assign({}, p, { legend: Legend(steps.map(function (s, i) { return { label: s, color: 'var(--seq-' + i + ')' }; }).concat([{ label: 'Elementary ●', cls: 'ord ring' }, { label: 'Middle ▲', cls: 'ord ring' }, { label: 'High ■', cls: 'ord ring' }])) }), body);
  }

  Object.assign(N, { StackedBarChart: StackedBarChart, DumbbellChart: DumbbellChart, SlopeChart: SlopeChart, ScatterQuadrant: ScatterQuadrant, Histogram: Histogram, CalendarHeatmap: CalendarHeatmap, StackedAreaChart: StackedAreaChart, WaterfallChart: WaterfallChart, BulletChart: BulletChart, SchoolMap: SchoolMap });
})();

/* ── Agent avatar & interactions II ── */
(function () {
  var N = window.Nexus, h = React.createElement, Icon = N.Icon, Button = N.Button;
  var useState = React.useState;
  function cx() { var o = []; for (var i = 0; i < arguments.length; i++) if (arguments[i]) o.push(arguments[i]); return o.join(' '); }
  function svg(children, vb) { return h('svg', { viewBox: vb || '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2, strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': true }, children); }
  var MARK = h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', 'aria-hidden': true }, h('circle', { cx: 8, cy: 8, r: 3.2 }), h('circle', { cx: 16.5, cy: 10, r: 2.6 }), h('circle', { cx: 9.5, cy: 16.5, r: 2.6 }));
  var GLYPHS = {
    idle: MARK, thinking: h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', className: 'g-dots', 'aria-hidden': true }, h('circle', { cx: 6, cy: 12, r: 2.4 }), h('circle', { cx: 12, cy: 12, r: 2.4 }), h('circle', { cx: 18, cy: 12, r: 2.4 })),
    listening: svg([h('rect', { key: 1, x: 9, y: 3, width: 6, height: 11, rx: 3 }), h('path', { key: 2, d: 'M5.5 11a6.5 6.5 0 0 0 13 0M12 17.5V21' })]),
    reading: svg([h('path', { key: 1, d: 'M4 5.5c2.5-1 5-1 8 1 3-2 5.5-2 8-1V19c-2.5-1-5-1-8 1-3-2-5.5-2-8-1z' }), h('path', { key: 2, d: 'M12 6.5V20' })]),
    searching: svg([h('circle', { key: 1, cx: 11, cy: 11, r: 6 }), h('path', { key: 2, d: 'm20 20-4.5-4.5' })]),
    writing: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.2, strokeLinecap: 'round', className: 'g-write', 'aria-hidden': true }, h('path', { d: 'M3 15c3-6 5-6 6-2s3 4 5-1 4-5 7-1' })),
    calculating: h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', className: 'g-bars', 'aria-hidden': true }, h('rect', { x: 3, y: 6, width: 3.4, height: 14, rx: 1.5 }), h('rect', { x: 8.2, y: 6, width: 3.4, height: 14, rx: 1.5 }), h('rect', { x: 13.4, y: 6, width: 3.4, height: 14, rx: 1.5 }), h('rect', { x: 18.6, y: 6, width: 3.4, height: 14, rx: 1.5 })),
    talking: h('svg', { viewBox: '0 0 24 24', fill: 'currentColor', className: 'g-bars', 'aria-hidden': true }, h('rect', { x: 3, y: 4, width: 3, height: 16, rx: 1.5 }), h('rect', { x: 8, y: 4, width: 3, height: 16, rx: 1.5 }), h('rect', { x: 13, y: 4, width: 3, height: 16, rx: 1.5 }), h('rect', { x: 18, y: 4, width: 3, height: 16, rx: 1.5 })),
    waiting: svg([h('path', { key: 1, d: 'M9.2 9a3 3 0 1 1 4 2.8c-.8.3-1.2 1-1.2 1.8v.6' }), h('path', { key: 2, d: 'M12 17.5h.01' })]),
    done: h('svg', { viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', strokeWidth: 2.6, strokeLinecap: 'round', strokeLinejoin: 'round', className: 'g-check', 'aria-hidden': true }, h('path', { d: 'M5 12.5 10 17.5 19 7' })),
    error: svg([h('path', { key: 1, d: 'M12 6v7.5' }), h('path', { key: 2, d: 'M12 17.5h.01' })]),
    paused: svg([h('path', { key: 1, d: 'M9 6v12M15 6v12' })])
  };
  var STATE_LABEL = { idle: 'Ready', thinking: 'Thinking', listening: 'Listening', reading: 'Reading', searching: 'Searching', writing: 'Writing', calculating: 'Calculating', talking: 'Talking', waiting: 'Waiting on you', done: 'Done', error: 'Stuck', paused: 'Paused' };

  function AgentAvatar(p) {
    var st = p.state || 'idle', size = p.size || 'md';
    var style = Object.assign({}, p.hue ? { '--hue': p.hue } : null, typeof size === 'number' ? { '--s': size + 'px' } : null, p.style);
    return h('span', { className: cx('nx-ava', 'nx-ava--' + st, typeof size === 'string' && 'nx-ava--' + size, p.className), style: style, role: 'img', 'aria-label': (p.name || 'Nexus') + ': ' + (STATE_LABEL[st] || st) },
      h('span', { className: 'nx-ava__ripple' }), h('span', { className: 'nx-ava__ripple' }), h('span', { className: 'nx-ava__ripple' }),
      h('span', { className: 'nx-ava__ring' }),
      h('span', { className: 'nx-ava__core' }, h('span', { className: 'nx-ava__scan' })),
      h('span', { className: 'nx-ava__orbit' }, h('i')),
      h('span', { className: 'nx-ava__glyph', key: st }, GLYPHS[st] || MARK));
  }
  function AgentStatusLine(p) {
    var pct = p.progress != null ? Math.round(p.progress * 100) : null;
    return h('div', { className: cx('nx-avaline', p.className), style: p.style, role: 'status', 'aria-live': 'polite' },
      h(AgentAvatar, { state: p.state, size: p.size || 'md', hue: p.hue, name: p.name }),
      h('div', { className: 'nx-avaline__text', style: { flex: 1 } },
        h('div', { className: 'nx-avaline__now' }, h('span', { key: p.now }, p.now)),
        p.sub ? h('div', { className: 'nx-avaline__sub' }, p.sub) : null,
        pct != null ? h('div', { className: 'nx-avaline__bar', role: 'progressbar', 'aria-valuenow': pct, 'aria-valuemin': 0, 'aria-valuemax': 100 }, h('i', { style: { width: pct + '%' } })) : null),
      p.actions);
  }

  function Scope(p) { return h('span', { className: cx('nx-scope', p.kind && 'nx-scope--' + p.kind) }, p.icon ? h(Icon, { name: p.icon, size: 11 }) : null, p.children); }

  function PlanPreview(p) {
    var st = useState(p.steps), steps = st[0], setSteps = st[1], add = useState(''), val = add[0], setVal = add[1];
    function upd(i, patch) { var s = steps.slice(); s[i] = Object.assign({}, s[i], patch); setSteps(s); if (p.onChange) p.onChange(s); }
    function move(i, d) { var j = i + d; if (j < 0 || j >= steps.length) return; var s = steps.slice(), t = s[i]; s[i] = s[j]; s[j] = t; setSteps(s); }
    var active = steps.filter(function (s) { return !s.skip; });
    return h('section', { className: 'nx-panel', 'aria-label': 'Proposed plan' },
      h('div', { className: 'nx-panel__head' }, h(N.AgentOrb || AgentAvatar, { size: 36, state: 'idle' }), h('h3', null, p.title, h('small', null, p.subtitle))),
      h('ol', { className: 'nx-plan', style: { margin: 0, padding: 0, listStyle: 'none' } }, steps.map(function (s, i) {
        return h('li', { key: s.id || i, className: cx('nx-plan__step', s.skip && 'nx-plan__step--skip', s.needs && 'nx-plan__step--needs', s.added && 'nx-plan__step--new') },
          h('span', { className: 'nx-plan__grip', title: 'Drag to reorder', 'aria-hidden': true }, h(Icon, { name: 'more', size: 14 })),
          h('span', { className: 'nx-plan__num' }, i + 1),
          h('div', { className: 'nx-plan__body' }, h('b', null, s.text), h('small', null, (s.scopes || []).map(function (sc, k) { return h(Scope, { key: k, kind: sc.kind, icon: sc.kind === 'write' ? 'edit' : sc.kind === 'read' ? 'eye' : null }, sc.label); }), s.time ? h('span', null, '≈ ' + s.time) : null, s.needs ? h('span', { style: { color: 'var(--attention-ink)', fontWeight: 600 } }, s.needs) : null)),
          h('span', { style: { display: 'flex', gap: 2 } },
            h('button', { type: 'button', className: 'nx-icon-btn', 'aria-label': s.skip ? 'Include step' : 'Skip step', 'aria-pressed': !!s.skip, onClick: function () { upd(i, { skip: !s.skip }); }, style: { width: 30, height: 30 } }, h(Icon, { name: s.skip ? 'plus' : 'x', size: 14 }))));
      }),
        h('li', { className: 'nx-plan__add' }, h(Icon, { name: 'plus', size: 16 }), h('input', { value: val, placeholder: 'Add a step, e.g. "also compare to last October"', 'aria-label': 'Add a step', onChange: function (e) { setVal(e.target.value); }, onKeyDown: function (e) { if (e.key === 'Enter' && val.trim()) { setSteps(steps.concat([{ id: 'n' + Date.now(), text: val.trim(), added: true }])); setVal(''); } } }))),
      h('div', { className: 'nx-panel__foot' },
        h('span', { className: 'nx-trust', style: { fontSize: 12 } }, h(Icon, { name: 'shield', size: 14 }), ' ' + (p.trust || 'Nothing changes until you run it')),
        h('span', { className: 'sp' }),
        h(Button, { variant: 'quiet', onClick: p.onCancel }, 'Cancel'),
        h(Button, { onClick: function () { if (p.onRun) p.onRun(active); } }, p.runLabel || ('Run ' + active.length + ' steps'))));
  }

  function SteerQueue(p) {
    var st = useState(p.queued || []), q = st[0], setQ = st[1], vs = useState(''), v = vs[0], setV = vs[1];
    return h('section', { className: 'nx-panel nx-steer', 'aria-label': 'Steer the agent' },
      h('div', { className: 'nx-steer__now' }, h(AgentAvatar, { state: p.state || 'reading', size: 'md' }),
        h('div', { style: { flex: 1, minWidth: 0 } }, h('b', { style: { display: 'block' } }, p.now), h('small', { style: { color: 'var(--ink-muted)' } }, p.nowSub)),
        h(Button, { variant: 'secondary', size: 'sm', icon: 'pause', onClick: p.onPause }, 'Pause')),
      q.length ? h('div', { className: 'nx-steer__q' }, h('span', { className: 'nx-eyebrow' }, 'Queued for Nexus · ' + q.length), q.map(function (it, i) {
        return h('div', { key: i, className: 'nx-steer__item' }, h(Icon, { name: 'arrow', size: 16 }), h('span', null, it.text), h('em', null, it.when || 'after this step'),
          h('button', { type: 'button', className: 'nx-icon-btn', style: { width: 28, height: 28 }, 'aria-label': 'Remove instruction', onClick: function () { setQ(q.filter(function (_, k) { return k !== i; })); } }, h(Icon, { name: 'x', size: 14 })));
      })) : null,
      h('div', { className: 'nx-steer__input' }, h('input', { value: v, placeholder: 'Steer without stopping: "also check Westbrook"', 'aria-label': 'Add an instruction', onChange: function (e) { setV(e.target.value); }, onKeyDown: function (e) { if (e.key === 'Enter' && v.trim()) { setQ(q.concat([{ text: v.trim() }])); setV(''); if (p.onAdd) p.onAdd(v.trim()); } } }),
        h('button', { type: 'button', className: 'nx-icon-btn', 'aria-label': 'Add', onClick: function () { if (v.trim()) { setQ(q.concat([{ text: v.trim() }])); setV(''); } } }, h(Icon, { name: 'send', size: 16 }))));
  }

  function TakeoverBar(p) {
    var human = p.driver === 'human';
    return h('div', { className: cx('nx-takeover', human ? 'nx-takeover--human' : 'nx-takeover--agent'), role: 'status' },
      human ? h('span', { className: 'nx-takeover__you' }, p.initials || 'You') : h(AgentAvatar, { state: p.state || 'writing', size: 'sm' }),
      h('span', null, human ? h('b', null, 'You’re driving. ') : h('b', null, 'Nexus is driving. '), p.detail),
      h('span', { className: 'sp' }),
      human ? h(Button, { size: 'sm', onClick: p.onHandBack }, 'Hand back to Nexus') : h(Button, { size: 'sm', variant: 'secondary', onClick: p.onTakeOver }, 'Take over', h('span', { className: 'nx-kbd', style: { marginLeft: 6 } }, '⌘.')));
  }

  function ToolCallCard(p) {
    var os = useState(!!p.open), open = os[0], setOpen = os[1], rs = useState(false), raw = rs[0], setRaw = rs[1];
    var status = p.status || 'done';
    return h('div', { className: cx('nx-tool', 'nx-tool--' + status) },
      h('div', { className: 'nx-tool__head', role: 'button', tabIndex: 0, 'aria-expanded': open, onClick: function () { setOpen(!open); }, onKeyDown: function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setOpen(!open); } } },
        h('span', { className: 'nx-tool__icon' }, status === 'running' ? h('span', { className: 'nx-ring', style: { width: 16, height: 16 } }) : h(Icon, { name: status === 'failed' ? 'alert' : p.icon || 'db', size: 16 })),
        h('div', { style: { minWidth: 0 } }, h('span', { className: 'nx-tool__name' }, p.name), h('small', null, p.summary)),
        h('span', { className: 'sp' }),
        p.access ? h(Scope, { kind: p.access === 'write' ? 'write' : 'read' }, p.access === 'write' ? 'Changes data' : 'Read-only') : null,
        h('span', { className: 'nx-tool__meta' }, p.duration || (status === 'running' ? 'running…' : '')),
        h(Icon, { name: open ? 'down' : 'chev', size: 16 })),
      open ? h('div', { className: 'nx-tool__body' },
        p.inputs ? h('div', null, h('h5', null, 'Asked for'), h('dl', { className: 'nx-tool__kv' }, Object.keys(p.inputs).map(function (k) { return [h('dt', { key: 'k' + k }, k), h('dd', { key: 'v' + k }, String(p.inputs[k]))]; }))) : null,
        p.result ? h('div', null, h('h5', null, status === 'failed' ? 'What went wrong' : 'Got back'), h('div', null, p.result)) : null,
        p.raw ? h('div', null, h('button', { type: 'button', className: 'nx-link', style: { border: 0, background: 'none', padding: 0, cursor: 'pointer', font: '600 12px var(--font-sans)', color: 'var(--accent)' }, onClick: function () { setRaw(!raw); } }, raw ? 'Hide raw response' : 'Show raw response'), raw ? h('pre', { className: 'nx-tool__raw' }, p.raw) : null) : null) : null);
  }

  function AgentActivityLog(p) {
    var fs = useState('all'), f = fs[0], setF = fs[1], us = useState({}), undone = us[0], setUndone = us[1];
    var filters = [['all', 'All'], ['change', 'Changes'], ['read', 'Reads'], ['message', 'Messages'], ['permission', 'Permissions']];
    var groups = {}; (p.entries || []).forEach(function (e) { if (f !== 'all' && e.kind !== f) return; (groups[e.day] = groups[e.day] || []).push(e); });
    return h('section', { className: 'nx-panel', 'aria-label': 'Activity log' },
      h('div', { className: 'nx-panel__head' }, h('h3', null, p.title || 'What Nexus did', h('small', null, p.subtitle || 'Every action, with who allowed it. Changes can be undone while the window is open.'))),
      h('div', { className: 'nx-seg', role: 'group', 'aria-label': 'Filter' }, filters.map(function (x) { return h('button', { key: x[0], type: 'button', className: 'nx-seg__opt', 'aria-pressed': f === x[0], onClick: function () { setF(x[0]); } }, x[1]); })),
      h('div', { className: 'nx-log' }, Object.keys(groups).map(function (d) {
        return h(React.Fragment, { key: d }, h('div', { className: 'nx-log__day' }, d), groups[d].map(function (e, i) {
          var isUndone = undone[e.id] || e.undone;
          return h('div', { key: e.id || i, className: cx('nx-log__row', isUndone && 'nx-log__row--undone') },
            h('span', { className: 'nx-log__time' }, e.time), h(AgentAvatar, { state: e.state || 'done', size: 'sm' }),
            h('div', { className: 'nx-log__what' }, h('span', null, h('b', null, e.verb + ' '), e.object), h('small', null, e.scope ? h(Scope, { kind: e.kind === 'change' ? 'write' : e.kind === 'read' ? 'read' : null }, e.scope) : null, e.by ? h('span', null, 'Allowed by ' + e.by) : null, isUndone ? h('span', null, 'Undone') : null)),
            e.undoUntil && !isUndone ? h(Button, { size: 'sm', variant: 'secondary', icon: 'undo', onClick: function () { var u = Object.assign({}, undone); u[e.id] = 1; setUndone(u); if (p.onUndo) p.onUndo(e); } }, 'Undo · ' + e.undoUntil) : h('span'));
        }));
      })));
  }

  function MemoryGoals(p) {
    var ts = useState(p.tab || 'memory'), tab = ts[0], setTab = ts[1];
    return h('section', { className: 'nx-panel', 'aria-label': 'Memory and goals' },
      h('div', { className: 'nx-panel__head' }, h(AgentAvatar, { state: 'idle', size: 'md' }), h('h3', null, 'What Nexus knows', h('small', null, 'You can see, edit or forget anything here.'))),
      h('div', { className: 'nx-seg', role: 'tablist' }, [['memory', 'Memory · ' + (p.memory || []).length], ['goals', 'Goals · ' + (p.goals || []).length]].map(function (x) { return h('button', { key: x[0], type: 'button', role: 'tab', className: 'nx-seg__opt', 'aria-selected': tab === x[0], onClick: function () { setTab(x[0]); } }, x[1]); })),
      tab === 'memory' ? h('div', { className: 'nx-mem' }, (p.memory || []).map(function (m, i) {
        return h('div', { key: i, className: cx('nx-mem__item', m.pending && 'nx-mem__item--new') }, h('span', null, m.pending ? h('b', { style: { color: 'var(--flow-ink)' } }, 'Remember this? ') : null, m.text),
          h('span', { className: 'acts' }, m.pending ? [h(Button, { key: 1, size: 'sm', variant: 'secondary', onClick: function () { if (p.onForget) p.onForget(m); } }, 'No'), h(Button, { key: 2, size: 'sm', onClick: function () { if (p.onKeep) p.onKeep(m); } }, 'Remember')] :
            [h('button', { key: 1, type: 'button', className: 'nx-icon-btn', 'aria-label': 'Edit', style: { width: 30, height: 30 } }, h(Icon, { name: 'edit', size: 15 })), h('button', { key: 2, type: 'button', className: 'nx-icon-btn', 'aria-label': 'Forget', style: { width: 30, height: 30 }, onClick: function () { if (p.onForget) p.onForget(m); } }, h(Icon, { name: 'trash', size: 15 }))]),
          h('small', null, m.source));
      })) : h('div', { className: 'nx-mem' }, (p.goals || []).map(function (g, i) {
        return h('div', { key: i, className: 'nx-goal' }, h('div', { className: 'nx-goal__top' }, h(AgentAvatar, { state: g.state || 'idle', size: 'sm' }), h('b', null, g.title), h(N.Badge || 'span', { tone: g.tone }, g.status)),
          h('div', { className: 'nx-progress', style: { height: 6 } }, h('span', { style: { width: Math.round((g.progress || 0) * 100) + '%' } })), h('small', null, g.next));
      })));
  }

  function StandingTask(p) {
    return h('section', { className: 'nx-panel nx-sched', 'aria-label': 'Standing task' },
      h('div', { className: 'nx-sched__when' }, h('div', { className: 'nx-sched__cal', 'aria-hidden': true }, h('span', null, p.day || 'Mon'), h('b', null, p.date || '13')),
        h('div', { style: { flex: 1, minWidth: 0 } }, h('b', { style: { display: 'block', font: '400 20px/26px var(--font-display)' } }, p.title), h('small', { style: { color: 'var(--ink-muted)' } }, p.next)),
        h(N.Switch || 'span', { defaultChecked: p.enabled !== false, label: 'On' })),
      p.parsed ? h('div', { className: 'nx-sched__parse' }, h('span', null, 'Understood as'), p.parsed.map(function (t, i) { return h('span', { key: i, className: 'nx-sched__token' }, t.icon ? h(Icon, { name: t.icon, size: 13 }) : null, t.text); })) : null,
      p.runs ? h('div', { style: { display: 'flex', alignItems: 'center', gap: 12 } }, h('div', { className: 'nx-sched__runs', 'aria-label': 'Recent runs' }, p.runs.map(function (r, i) { return h('i', { key: i, className: r.state === 'ok' ? null : r.state, style: { height: r.state === 'next' ? 28 : 10 + (r.size || 0.6) * 18 }, title: r.label }); })),
        h('small', { style: { color: 'var(--ink-muted)' } }, p.lastRun)) : null,
      h('div', { className: 'nx-panel__foot' }, (p.scopes || []).map(function (s, i) { return h(Scope, { key: i, kind: s.kind }, s.label); }), h('span', { className: 'sp' }),
        h(Button, { variant: 'quiet', size: 'sm', onClick: p.onEdit }, 'Edit'), h(Button, { variant: 'secondary', size: 'sm', icon: 'pause', onClick: p.onPause }, 'Pause'), h(Button, { size: 'sm', onClick: p.onRunNow }, 'Run now')));
  }

  function AgentErrorRecovery(p) {
    return h('section', { className: 'nx-panel nx-recover', role: 'alert' },
      h('div', { className: 'nx-panel__head' }, h(AgentAvatar, { state: 'error', size: 'md' }), h('h3', null, p.title, h('small', null, p.detail))),
      h('div', { className: 'nx-recover__safe' }, h(Icon, { name: 'shield', size: 18 }), h('span', null, p.safe || 'Nothing was changed.')),
      h('div', { className: 'nx-recover__opts', role: 'group', 'aria-label': 'What to do next' }, (p.options || []).map(function (o, i) {
        return h('button', { key: i, type: 'button', className: cx('nx-recover__opt', o.recommended && 'nx-recover__opt--rec'), onClick: function () { if (p.onChoose) p.onChoose(o); } },
          h('b', null, o.label, o.recommended ? h('span', { className: 'nx-ask__rec', style: { marginLeft: 8 } }, 'Recommended') : null), h(Icon, { name: 'chev', size: 18 }), h('small', null, o.detail));
      })),
      p.technical ? h('details', null, h('summary', { style: { cursor: 'pointer', color: 'var(--ink-muted)', fontSize: 13 } }, 'Technical details'), h('pre', { className: 'nx-tool__raw', style: { marginTop: 8 } }, p.technical)) : null);
  }

  function OutputFeedback(p) {
    var vs = useState(p.value || null), v = vs[0], setV = vs[1], rs = useState(p.reasons || []), reasons = rs[0], setReasons = rs[1], ss = useState(!!p.sent), sent = ss[0], setSent = ss[1], ms = useState(p.remember !== false), rem = ms[0], setRem = ms[1];
    var opts = p.options || ['Wrong numbers', 'Missed something', 'Too long', 'Wrong tone', 'Not what I asked'];
    function tog(r) { setReasons(reasons.indexOf(r) >= 0 ? reasons.filter(function (x) { return x !== r; }) : reasons.concat([r])); }
    return h('div', { className: 'nx-fb' },
      h('div', { className: 'nx-fb__row' },
        h('button', { type: 'button', className: 'nx-fb__btn', 'aria-label': 'Good response', 'aria-pressed': v === 'up', onClick: function () { setV('up'); setSent(false); } }, h('svg', { viewBox: '0 0 24 24', width: 17, height: 17, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinejoin: 'round' }, h('path', { d: 'M7 10v10H4V10zM7 10l4-7c1.5 0 2.5 1 2 3l-1 4h6a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.8 20H7' }))),
        h('button', { type: 'button', className: 'nx-fb__btn', 'aria-label': 'Needs work', 'aria-pressed': v === 'down', onClick: function () { setV('down'); setSent(false); } }, h('svg', { viewBox: '0 0 24 24', width: 17, height: 17, fill: 'none', stroke: 'currentColor', strokeWidth: 1.8, strokeLinejoin: 'round', style: { transform: 'rotate(180deg)' } }, h('path', { d: 'M7 10v10H4V10zM7 10l4-7c1.5 0 2.5 1 2 3l-1 4h6a2 2 0 0 1 2 2.3l-1.2 6A2 2 0 0 1 16.8 20H7' }))),
        h('button', { type: 'button', className: 'nx-fb__btn', 'aria-label': 'Copy' }, h(Icon, { name: 'copy', size: 16 })),
        h('button', { type: 'button', className: 'nx-fb__btn', 'aria-label': 'Try again' }, h(Icon, { name: 'undo', size: 16 })),
        h('span', { className: 'sp' }), h('span', null, p.meta)),
      v === 'down' && !sent ? h('div', { className: 'nx-fb__panel' },
        h('b', { style: { font: '600 14px var(--font-sans)' } }, 'What should be different?'),
        h('div', { className: 'nx-chips', style: { display: 'flex', gap: 6, flexWrap: 'wrap' } }, opts.map(function (o) { return h('button', { key: o, type: 'button', className: 'nx-choice', 'aria-pressed': reasons.indexOf(o) >= 0, onClick: function () { tog(o); } }, o); })),
        h('textarea', { className: 'nx-input', rows: 2, placeholder: 'Tell Nexus in your words (optional)', defaultValue: p.note, style: { width: '100%', resize: 'vertical', padding: 10, borderRadius: 10, border: '1px solid var(--line-strong)', font: '400 14px var(--font-sans)', background: 'var(--surface-raised)', color: 'var(--ink)' } }),
        h('label', { style: { display: 'flex', alignItems: 'center', gap: 8, font: '400 13px var(--font-sans)' } }, h('input', { type: 'checkbox', checked: rem, onChange: function () { setRem(!rem); } }), 'Remember this for next time'),
        h('div', { style: { display: 'flex', gap: 8, justifyContent: 'flex-end' } }, h(Button, { variant: 'quiet', size: 'sm', onClick: function () { setV(null); } }, 'Cancel'), h(Button, { size: 'sm', onClick: function () { setSent(true); if (p.onSubmit) p.onSubmit({ reasons: reasons, remember: rem }); } }, 'Send feedback'))) : null,
      sent || (v === 'up' && p.thanksUp) ? h('div', { className: 'nx-fb__thanks' }, h(AgentAvatar, { state: 'done', size: 'sm' }), h('span', null, v === 'up' ? p.thanksUp : (p.thanks || 'Thanks. I’ll use shorter summaries for board memos.'), ' ', h('a', { href: '#', style: { color: 'var(--accent)' } }, 'See in memory'))) : null);
  }

  Object.assign(N, { AgentAvatar: AgentAvatar, AgentStatusLine: AgentStatusLine, AGENT_STATES: Object.keys(STATE_LABEL), PlanPreview: PlanPreview, SteerQueue: SteerQueue, TakeoverBar: TakeoverBar, ToolCallCard: ToolCallCard, AgentActivityLog: AgentActivityLog, MemoryGoals: MemoryGoals, StandingTask: StandingTask, AgentErrorRecovery: AgentErrorRecovery, OutputFeedback: OutputFeedback });
})();

/* ── Data grid & table family ── */
(function () {
  var N = window.Nexus, h = React.createElement, Icon = N.Icon, Button = N.Button;
  var useState = React.useState, useMemo = React.useMemo, useRef = React.useRef;
  function cx() { var o = []; for (var i = 0; i < arguments.length; i++) if (arguments[i]) o.push(arguments[i]); return o.join(' '); }
  var NUMERIC = { number: 1, percent: 1, delta: 1, bar: 1, heat: 1, currency: 1 };
  function fmtNum(v, c) {
    if (v == null || v === '' || isNaN(v)) return '—';
    var d = c.decimals != null ? c.decimals : (c.type === 'percent' || c.type === 'delta' ? 1 : 0);
    var s = Number(v).toLocaleString('en-US', { minimumFractionDigits: d, maximumFractionDigits: d });
    if (c.type === 'currency') s = '$' + s;
    return s + (c.type === 'percent' ? '%' : c.unit || '');
  }
  function suppressed(row, c, rule) { var min = c.suppressBelow != null ? c.suppressBelow : rule; return min != null && c.private && row.n != null && row.n < min; }
  function aggregate(rows, c) {
    var vals = rows.map(function (r) { return r[c.key]; }).filter(function (v) { return v != null && !isNaN(v); });
    if (!vals.length || !c.agg) return null;
    if (c.agg === 'sum') return vals.reduce(function (a, b) { return a + b; }, 0);
    if (c.agg === 'avg') return vals.reduce(function (a, b) { return a + b; }, 0) / vals.length;
    if (c.agg === 'wavg' && c.weight) { var tw = 0, s = 0; rows.forEach(function (r) { if (r[c.key] != null && r[c.weight] != null) { tw += r[c.weight]; s += r[c.key] * r[c.weight]; } }); return tw ? s / tw : null; }
    return null;
  }
  function Cell(p) {
    var c = p.col, r = p.row, v = r[c.key];
    if (p.supp) return h('span', { className: 'nx-cell-supp', title: 'Hidden: group under ' + (c.suppressBelow || p.rule || 10) + ' students' }, 'n<' + (c.suppressBelow || p.rule || 10));
    if (c.render) return c.render(v, r);
    switch (c.type) {
      case 'bar': { var max = c.max || 100, pct = Math.max(0, Math.min(1, v / max)) * 100, watch = c.watch && c.watch(v, r); return h('span', { className: 'nx-cell-bar' }, fmtNum(v, c), h('i', null, h('b', { className: watch ? 'watch' : null, style: { width: pct + '%' } }))); }
      case 'heat': { var steps = c.steps || [20, 40, 60, 80], k = 0; steps.forEach(function (s) { if (v >= s) k++; }); return h('span', { className: 'nx-cell-heat h' + k }, fmtNum(v, c)); }
      case 'delta': { var dir = v == null ? 'flat' : Math.abs(v) < (c.flat || 0.05) ? 'flat' : (v > 0) === (c.goodUp !== false) ? 'up' : 'down'; return h('span', { className: 'nx-cell-delta nx-cell-delta--' + dir }, v == null ? '—' : (v > 0 ? '▲ +' : v < 0 ? '▼ −' : '') + fmtNum(Math.abs(v), c)); }
      case 'spark': { var a = v || [], mn = Math.min.apply(null, a), mx = Math.max.apply(null, a), W = 72, H = 22; var pts = a.map(function (x, i) { return (i * W / (a.length - 1)).toFixed(1) + ',' + (H - 3 - (x - mn) / (mx - mn || 1) * (H - 6)).toFixed(1); }).join(' '); return h('svg', { width: W, height: H, viewBox: '0 0 ' + W + ' ' + H, 'aria-label': 'Trend ' + a.join(', '), role: 'img' }, h('polyline', { points: pts, fill: 'none', stroke: 'var(--chart-1)', strokeWidth: 1.6 }), h('circle', { cx: W, cy: pts.split(' ').pop().split(',')[1], r: 2.2, fill: 'var(--chart-1)' })); }
      case 'status': { var st = (c.statuses || {})[v] || { tone: '', label: v }; return h('span', { className: 'nx-cell-status' + (st.tone ? ' nx-cell-status--' + st.tone : '') }, h('i'), st.label); }
      case 'badge': return v ? h('span', { className: 'nx-badge nx-badge--' + (c.tone || 'info') }, v) : null;
      default: return NUMERIC[c.type] ? fmtNum(v, c) : (v == null ? '—' : String(v));
    }
  }
  function toCSV(cols, rows) {
    var esc = function (x) { x = x == null ? '' : String(x); return /[",\n]/.test(x) ? '"' + x.replace(/"/g, '""') + '"' : x; };
    return [cols.map(function (c) { return esc(c.label); }).join(',')].concat(rows.map(function (r) { return cols.map(function (c) { return esc(Array.isArray(r[c.key]) ? r[c.key].join(' ') : r[c.key]); }).join(','); })).join('\n');
  }

  function DataGrid(p) {
    var allCols = p.columns, rule = p.suppressBelow;
    var S = function (init) { return useState(init); };
    var sortS = S(p.sort || []), sort = sortS[0], setSort = sortS[1];
    var hidS = S(p.hidden || []), hidden = hidS[0], setHidden = hidS[1];
    var qS = S(''), q = qS[0], setQ = qS[1];
    var fS = S(p.filters || []), filters = fS[0], setFilters = fS[1];
    var selS = S(p.selected || []), sel = selS[0], setSel = selS[1];
    var expS = S(p.expanded || []), exp = expS[0], setExp = expS[1];
    var gS = S(p.groupBy || null), groupBy = gS[0], setGroupBy = gS[1];
    var colS = S(p.collapsed || []), collapsed = colS[0], setCollapsed = colS[1];
    var dS = S(p.density || 'regular'), density = dS[0], setDensity = dS[1];
    var mS = S(p.openMenu || null), menu = mS[0], setMenu = mS[1];
    var wS = S({}), widths = wS[0], setWidths = wS[1];
    var eS = S(p.editing || null), editing = eS[0], setEditing = eS[1];
    var edS = S(p.edits || {}), edits = edS[0], setEdits = edS[1];
    var pgS = S(0), page = pgS[0], setPage = pgS[1];
    var cols = allCols.filter(function (c) { return hidden.indexOf(c.key) < 0; });
    var rows = useMemo(function () {
      var r = p.rows.map(function (x) { var e = edits[x.id]; return e ? Object.assign({}, x, e) : x; });
      if (q) { var ql = q.toLowerCase(); r = r.filter(function (x) { return allCols.some(function (c) { var v = x[c.key]; return v != null && !Array.isArray(v) && String(v).toLowerCase().indexOf(ql) >= 0; }); }); }
      filters.forEach(function (f) { r = r.filter(function (x) { var v = x[f.key]; if (f.op === 'in') return f.values.indexOf(v) >= 0; if (f.op === '<') return v != null && v < f.value; if (f.op === '>') return v != null && v > f.value; if (f.op === 'between') return v != null && v >= f.value[0] && v <= f.value[1]; return true; }); });
      if (sort.length) r = r.slice().sort(function (a, b) { for (var i = 0; i < sort.length; i++) { var k = sort[i].key, d = sort[i].dir === 'desc' ? -1 : 1, kc = allCols.filter(function (c) { return c.key === k; })[0] || {}, x = suppressed(a, kc, rule) ? null : a[k], y = suppressed(b, kc, rule) ? null : b[k]; if (x == null && y != null) return 1; if (y == null && x != null) return -1; if (x < y) return -d; if (x > y) return d; } return 0; });
      return r;
    }, [p.rows, q, filters, sort, edits]);
    function toggleSort(key, multi) {
      var cur = sort.filter(function (s) { return s.key === key; })[0], next;
      var dir = !cur ? 'asc' : cur.dir === 'asc' ? 'desc' : null;
      next = multi ? sort.filter(function (s) { return s.key !== key; }) : [];
      if (dir) next.push({ key: key, dir: dir });
      setSort(next);
    }
    var pageSize = p.pageSize || 0, groups = null;
    if (groupBy) { groups = []; var idx = {}; rows.forEach(function (r) { var g = r[groupBy]; if (idx[g] == null) { idx[g] = groups.length; groups.push({ key: g, rows: [] }); } groups[idx[g]].rows.push(r); }); }
    var visibleRows = !groups && pageSize ? rows.slice(page * pageSize, (page + 1) * pageSize) : rows;
    var pinCount = cols.filter(function (c) { return c.pin; }).length;
    var allSel = rows.length && rows.every(function (r) { return sel.indexOf(r.id) >= 0; });
    function selToggle(id) { setSel(sel.indexOf(id) >= 0 ? sel.filter(function (x) { return x !== id; }) : sel.concat([id])); }
    function startResize(e, key) {
      var th = e.target.parentNode, x0 = e.clientX, w0 = th.getBoundingClientRect().width;
      function mv(ev) { var w = Math.max(60, w0 + ev.clientX - x0); setWidths(function (o) { var n = Object.assign({}, o); n[key] = w; return n; }); }
      function up() { window.removeEventListener('pointermove', mv); window.removeEventListener('pointerup', up); }
      window.addEventListener('pointermove', mv); window.addEventListener('pointerup', up); e.preventDefault();
    }
    function exportCSV() {
      var csv = toCSV(cols.filter(function (c) { return c.type !== 'spark'; }), rows.map(function (r) { var o = Object.assign({}, r); cols.forEach(function (c) { if (suppressed(r, c, rule)) o[c.key] = 'suppressed'; }); return o; }));
      if (p.onExport) return p.onExport(csv);
      try { var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = (p.exportName || 'nexus-export') + '.csv'; a.click(); } catch (e) { }
    }
    var pinLeft = 0, leftOf = {};
    if (p.selectable) pinLeft = 40;
    cols.forEach(function (c) { if (c.pin) { leftOf[c.key] = pinLeft; pinLeft += widths[c.key] || c.width || 160; } });
    function thFor(c, ci) {
      var s = sort.filter(function (x) { return x.key === c.key; })[0], sn = sort.length > 1 && s ? sort.indexOf(s) + 1 : null, num = NUMERIC[c.type];
      var style = { width: widths[c.key] || c.width, minWidth: widths[c.key] || c.width, position: 'sticky' };
      if (c.pin) style.left = leftOf[c.key];
      return h('th', { key: c.key, scope: 'col', className: cx(num && 'num', c.pin && 'pin'), style: style, 'aria-sort': s ? (s.dir === 'asc' ? 'ascending' : 'descending') : undefined },
        h('span', { className: 'th' },
          h('button', { type: 'button', onClick: function (e) { toggleSort(c.key, e.shiftKey); }, title: 'Sort (Shift for multi-sort)', style: { font: 'inherit', gap: 4, display: 'inline-flex', padding: '2px 4px' } }, c.label, s ? h(Icon, { name: s.dir === 'asc' ? 'down' : 'down', size: 12, className: s.dir === 'asc' ? 'nx-flip' : null }) : null, sn ? h('span', { className: 'sortn' }, sn) : null),
          h('button', { type: 'button', 'aria-label': 'Column options for ' + c.label, 'aria-haspopup': 'menu', 'aria-expanded': menu === c.key, onClick: function () { setMenu(menu === c.key ? null : c.key); } }, h(Icon, { name: 'more', size: 14 }))),
        menu === c.key ? colMenu(c) : null,
        h('span', { className: 'rz', onPointerDown: function (e) { startResize(e, c.key); }, 'aria-hidden': true }));
    }
    function colMenu(c) {
      return h('div', { className: 'nx-colmenu', role: 'menu', style: { top: 38, left: NUMERIC[c.type] ? 'auto' : 0, right: NUMERIC[c.type] ? 0 : 'auto' } },
        c.description ? h('div', { className: 'nx-colmenu__about' }, h('b', null, c.label), c.description, c.source ? h('div', { style: { marginTop: 4 } }, 'Source: ' + c.source) : null) : null,
        c.description ? h('hr') : null,
        h('button', { type: 'button', role: 'menuitem', onClick: function () { setSort([{ key: c.key, dir: 'asc' }]); setMenu(null); } }, h(Icon, { name: 'down', size: 14, className: 'nx-flip' }), 'Sort ascending'),
        h('button', { type: 'button', role: 'menuitem', onClick: function () { setSort([{ key: c.key, dir: 'desc' }]); setMenu(null); } }, h(Icon, { name: 'down', size: 14 }), 'Sort descending'),
        h('button', { type: 'button', role: 'menuitem', onClick: function () { setGroupBy(groupBy === c.key ? null : c.key); setMenu(null); } }, h(Icon, { name: 'folder', size: 14 }), groupBy === c.key ? 'Stop grouping' : 'Group by ' + c.label),
        NUMERIC[c.type] ? h('div', { style: { padding: '6px 10px', display: 'grid', gap: 6 } }, h('span', { style: { font: '600 11px var(--font-sans)', letterSpacing: '.06em', textTransform: 'uppercase', color: 'var(--ink-muted)' } }, 'Show rows below'),
          h('input', { type: 'number', 'aria-label': 'Below value', placeholder: 'e.g. 92', onKeyDown: function (e) { if (e.key === 'Enter' && e.target.value !== '') { setFilters(filters.filter(function (f) { return f.key !== c.key; }).concat([{ key: c.key, op: '<', value: Number(e.target.value), label: c.label + ' < ' + e.target.value }])); setMenu(null); } } })) : null,
        h('hr'),
        h('button', { type: 'button', role: 'menuitem', onClick: function () { setHidden(hidden.concat([c.key])); setMenu(null); } }, h(Icon, { name: 'eye', size: 14 }), 'Hide column'),
        p.onAskColumn ? h('button', { type: 'button', role: 'menuitem', onClick: function () { p.onAskColumn(c); setMenu(null); } }, h(Icon, { name: 'sparkle', size: 14 }), 'Ask Nexus about this column') : null);
    }
    function tdFor(r, c) {
      var supp = suppressed(r, c, rule), style = c.pin ? { left: leftOf[c.key], position: 'sticky' } : null, dirty = edits[r.id] && edits[r.id][c.key] != null;
      var isEd = editing && editing.id === r.id && editing.key === c.key;
      var content = isEd ? h('span', { style: { position: 'relative', display: 'block' } }, h('input', { className: cx('nx-cell-edit', editing.error && 'nx-cell-edit--err'), defaultValue: editing.draft != null ? editing.draft : r[c.key], autoFocus: true, 'aria-invalid': !!editing.error, 'aria-label': c.label,
          onKeyDown: function (e) { if (e.key === 'Escape') setEditing(null); if (e.key === 'Enter') { var val = NUMERIC[c.type] ? Number(e.target.value) : e.target.value, err = c.validate ? c.validate(val, r) : null; if (err) setEditing(Object.assign({}, editing, { error: err, draft: e.target.value })); else { var ne = Object.assign({}, edits); ne[r.id] = Object.assign({}, ne[r.id]); ne[r.id][c.key] = val; setEdits(ne); setEditing(null); } } } }),
        editing.error ? h('span', { className: 'nx-cell-err', role: 'alert' }, editing.error) : null)
        : h(Cell, { col: c, row: r, supp: supp, rule: rule });
      var first = c === cols[0] && p.renderDetail;
      return h('td', { key: c.key, className: cx(NUMERIC[c.type] && 'num', c.pin && 'pin', dirty && 'nx-cell-dirty'), style: style, onDoubleClick: c.editable ? function () { setEditing({ id: r.id, key: c.key }); } : null },
        first ? h('button', { type: 'button', className: 'expbtn', 'aria-expanded': exp.indexOf(r.id) >= 0, 'aria-label': 'Show detail', onClick: function () { setExp(exp.indexOf(r.id) >= 0 ? exp.filter(function (x) { return x !== r.id; }) : exp.concat([r.id])); } }, h(Icon, { name: 'chev', size: 14 })) : null,
        content);
    }
    function rowEls(r) {
      var out = [h('tr', { key: r.id, 'aria-selected': sel.indexOf(r.id) >= 0 || undefined },
        p.selectable ? h('td', { className: 'chk pin', style: { left: 0, position: 'sticky' } }, h('input', { type: 'checkbox', checked: sel.indexOf(r.id) >= 0, onChange: function () { selToggle(r.id); }, 'aria-label': 'Select ' + (r[cols[0].key] || r.id) })) : null,
        cols.map(function (c) { return tdFor(r, c); }))];
      if (p.renderDetail && exp.indexOf(r.id) >= 0) out.push(h('tr', { key: r.id + '-d', className: 'detail' }, h('td', { colSpan: cols.length + (p.selectable ? 1 : 0) }, p.renderDetail(r))));
      return out;
    }
    var body = [];
    if (groups) groups.forEach(function (g) {
      var closed = collapsed.indexOf(g.key) >= 0;
      body.push(h('tr', { key: 'g-' + g.key, className: 'grp' }, p.selectable ? h('td', { className: 'chk pin', style: { left: 0, position: 'sticky' } }) : null,
        cols.map(function (c, ci) {
          if (ci === 0) return h('td', { key: c.key, className: c.pin ? 'pin' : null, style: c.pin ? { left: leftOf[c.key], position: 'sticky' } : null }, h('button', { type: 'button', className: 'grpbtn', 'aria-expanded': !closed, onClick: function () { setCollapsed(closed ? collapsed.filter(function (x) { return x !== g.key; }) : collapsed.concat([g.key])); } }, h(Icon, { name: closed ? 'chev' : 'down', size: 14 }), g.key, h('small', null, g.rows.length + ' rows')));
          var a = aggregate(g.rows, c); return h('td', { key: c.key, className: NUMERIC[c.type] ? 'num' : null }, a == null ? '' : fmtNum(a, c));
        })));
      if (!closed) g.rows.forEach(function (r) { body = body.concat(rowEls(r)); });
    });
    else visibleRows.forEach(function (r) { body = body.concat(rowEls(r)); });
    var totals = p.totals ? h('tr', { className: 'tot' }, p.selectable ? h('td', { className: 'chk pin', style: { left: 0, position: 'sticky' } }) : null, cols.map(function (c, ci) { var a = aggregate(rows, c); return h('td', { key: c.key, className: cx(NUMERIC[c.type] && 'num', c.pin && 'pin'), style: c.pin ? { left: leftOf[c.key], position: 'sticky' } : null }, ci === 0 ? (p.totalsLabel || 'District') : a == null ? '' : fmtNum(a, c)); })) : null;
    var dirtyCount = Object.keys(edits).length;
    var state = p.state;
    return h('section', { className: cx('nx-grid', density !== 'regular' && 'nx-grid--' + density, p.className), style: Object.assign({ '--grid-h': p.maxHeight ? p.maxHeight + 'px' : null }, p.style), 'aria-label': p.title },
      p.toolbar !== false ? h('div', { className: 'nx-grid__bar' },
        h('div', { className: 'nx-grid__title' }, h('b', null, p.title), h('small', null, p.source ? h('span', null, p.source) : null, p.freshness ? h('span', { className: cx('nx-grid__fresh', p.stale && 'nx-grid__fresh--stale') }, h('i'), p.freshness) : null, h('span', null, rows.length.toLocaleString() + ' rows'))),
        h('label', { className: 'nx-grid__search' }, h(Icon, { name: 'search', size: 15 }), h('input', { value: q, onChange: function (e) { setQ(e.target.value); setPage(0); }, placeholder: 'Search rows', 'aria-label': 'Search rows' })),
        p.views ? h('select', { className: 'nx-grid__tool', 'aria-label': 'Saved view', defaultValue: p.view }, p.views.map(function (v) { return h('option', { key: v }, v); })) : null,
        h('button', { type: 'button', className: 'nx-grid__tool', 'aria-label': 'Row density', onClick: function () { setDensity(density === 'regular' ? 'compact' : density === 'compact' ? 'comfortable' : 'regular'); } }, h(Icon, { name: 'sliders', size: 15 }), density[0].toUpperCase() + density.slice(1)),
        h('button', { type: 'button', className: 'nx-grid__tool', 'aria-pressed': menu === '__cols', onClick: function () { setMenu(menu === '__cols' ? null : '__cols'); } }, h(Icon, { name: 'eye', size: 15 }), 'Columns' + (hidden.length ? ' · ' + hidden.length + ' hidden' : '')),
        h('button', { type: 'button', className: 'nx-grid__tool', onClick: exportCSV }, h(Icon, { name: 'upload', size: 15 }), 'Export'),
        p.onAsk ? h('button', { type: 'button', className: 'nx-grid__tool nx-grid__tool--ask', onClick: p.onAsk }, h(Icon, { name: 'sparkle', size: 15 }), 'Ask about this table') : null,
        menu === '__cols' ? h('div', { className: 'nx-colmenu', role: 'menu', style: { right: 14, top: 56 } }, h('div', { className: 'nx-colmenu__about' }, h('b', null, 'Columns'), 'Drag to reorder; pinned columns stay put while you scroll.'),
          allCols.map(function (c) { return h('label', { key: c.key }, h('input', { type: 'checkbox', checked: hidden.indexOf(c.key) < 0, onChange: function () { setHidden(hidden.indexOf(c.key) < 0 ? hidden.concat([c.key]) : hidden.filter(function (k) { return k !== c.key; })); } }), c.label, c.pin ? h(Icon, { name: 'pin', size: 13, style: { marginLeft: 'auto' } }) : null); })) : null) : null,
      (filters.length || groupBy || sort.length > 1) ? h('div', { className: 'nx-grid__chips' }, 'Showing',
        filters.map(function (f, i) { return h('span', { key: i, className: 'nx-fchip' }, h('b', null, f.label), h('button', { type: 'button', 'aria-label': 'Remove filter ' + f.label, onClick: function () { setFilters(filters.filter(function (_, k) { return k !== i; })); } }, h(Icon, { name: 'x', size: 10 }))); }),
        groupBy ? h('span', { className: 'nx-fchip' }, 'Grouped by ', h('b', null, (allCols.filter(function (c) { return c.key === groupBy; })[0] || {}).label || groupBy), h('button', { type: 'button', 'aria-label': 'Stop grouping', onClick: function () { setGroupBy(null); } }, h(Icon, { name: 'x', size: 10 }))) : null,
        sort.length > 1 ? h('span', { className: 'nx-fchip' }, 'Sorted by ', h('b', null, sort.map(function (s) { return (allCols.filter(function (c) { return c.key === s.key; })[0] || {}).label + (s.dir === 'desc' ? ' ↓' : ' ↑'); }).join(', '))) : null,
        filters.length ? h('button', { type: 'button', className: 'nx-link', style: { border: 0, background: 'none', color: 'var(--accent)', font: '600 12px var(--font-sans)', cursor: 'pointer' }, onClick: function () { setFilters([]); } }, 'Clear all') : null) : null,
      sel.length ? h('div', { className: 'nx-grid__bulk', role: 'region', 'aria-label': 'Bulk actions' }, h('span', null, sel.length + ' selected'), h('span', { className: 'sp' }), (p.bulkActions || ['Compare', 'Export selected', 'Ask Nexus']).map(function (a) { return h('button', { key: a, type: 'button' }, a); }), h('button', { type: 'button', onClick: function () { setSel([]); } }, 'Clear')) : null,
      state === 'loading' ? h('div', { className: 'nx-grid__scroll' }, h('table', null, h('tbody', { className: 'nx-grid__skel' }, [0, 1, 2, 3, 4].map(function (i) { return h('tr', { key: i }, cols.map(function (c, k) { return h('td', { key: c.key }, h('span', { style: { width: (40 + (i * 13 + k * 17) % 50) + '%' } })); })); })))) :
      state === 'empty' || state === 'error' || (!rows.length && p.rows.length) ? h('div', { className: 'nx-grid__state', role: 'status' }, h(Icon, { name: state === 'error' ? 'alert' : 'search', size: 28 }), h('b', null, state === 'error' ? (p.errorTitle || 'Couldn’t load this table') : state === 'empty' ? (p.emptyTitle || 'Nothing here yet') : 'No rows match'), h('span', null, state === 'error' ? (p.errorDetail || 'The source didn’t respond. Nothing was changed.') : state === 'empty' ? p.emptyDetail : 'Try clearing a filter or the search.'),
        state === 'error' ? h(Button, { size: 'sm', variant: 'secondary', onClick: p.onRetry }, 'Try again') : (filters.length || q) ? h(Button, { size: 'sm', variant: 'secondary', onClick: function () { setFilters([]); setQ(''); } }, 'Clear filters') : null) :
      h('div', { className: 'nx-grid__scroll', role: 'region', 'aria-label': p.title + ' table', tabIndex: 0 },
        h('table', { role: 'grid', 'aria-rowcount': rows.length },
          h('thead', null, h('tr', null, p.selectable ? h('th', { className: 'chk pin', style: { left: 0, position: 'sticky' } }, h('input', { type: 'checkbox', checked: !!allSel, onChange: function () { setSel(allSel ? [] : rows.map(function (r) { return r.id; })); }, 'aria-label': 'Select all rows' })) : null, cols.map(thFor))),
          h('tbody', null, body), totals ? h('tfoot', null, totals) : null)),
      dirtyCount ? h('div', { className: 'nx-grid__dirty', role: 'status' }, h(Icon, { name: 'edit', size: 15 }), h('span', null, dirtyCount + (dirtyCount === 1 ? ' row' : ' rows') + ' changed · not saved'), h('span', { className: 'sp' }), h(Button, { size: 'sm', variant: 'quiet', onClick: function () { setEdits({}); } }, 'Discard'), h(Button, { size: 'sm', onClick: function () { if (p.onSave) p.onSave(edits); } }, 'Review & save')) : null,
      p.footer !== false ? h('div', { className: 'nx-grid__foot' },
        h('span', null, rule ? 'Groups under ' + rule + ' students are hidden.' : ''), h('span', { className: 'sp' }),
        !groups && pageSize && rows.length > pageSize ? [h('span', { key: 'p' }, (page * pageSize + 1) + '–' + Math.min(rows.length, (page + 1) * pageSize) + ' of ' + rows.length), h('button', { key: 'a', type: 'button', disabled: page === 0, onClick: function () { setPage(page - 1); } }, 'Previous'), h('button', { key: 'b', type: 'button', disabled: (page + 1) * pageSize >= rows.length, onClick: function () { setPage(page + 1); } }, 'Next')] : h('span', null, rows.length + ' of ' + p.rows.length + ' rows')) : null);
  }

  function PivotTable(p) {
    var rowsK = p.rows, colsK = p.cols, val = p.value, data = p.data;
    var rv = [], cv = []; data.forEach(function (d) { if (rv.indexOf(d[rowsK]) < 0) rv.push(d[rowsK]); if (cv.indexOf(d[colsK]) < 0) cv.push(d[colsK]); });
    if (p.colOrder) cv = p.colOrder;
    var cell = {}; data.forEach(function (d) { cell[d[rowsK] + '|' + d[colsK]] = d; });
    var fmt = function (v) { return v == null ? '—' : Number(v).toLocaleString('en-US', { minimumFractionDigits: p.decimals || 0, maximumFractionDigits: p.decimals || 0 }) + (p.unit || ''); };
    var vals = data.map(function (d) { return d[val]; }).filter(function (v) { return v != null; }), mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals);
    var step = function (v) { return Math.min(4, Math.floor((v - mn) / ((mx - mn) || 1) * 5)); };
    return h('section', { className: 'nx-grid nx-pivot', 'aria-label': p.title },
      h('div', { className: 'nx-grid__bar' }, h('div', { className: 'nx-grid__title' }, h('b', null, p.title), h('small', null, p.subtitle))),
      h('div', { className: 'dim' }, 'Rows', h('span', { className: 'nx-dimchip' }, h(Icon, { name: 'more', size: 12 }), p.rowLabel), 'Columns', h('span', { className: 'nx-dimchip' }, h(Icon, { name: 'more', size: 12 }), p.colLabel), 'Value', h('span', { className: 'nx-dimchip' }, h(Icon, { name: 'more', size: 12 }), p.valueLabel), p.heat ? h('span', { className: 'nx-fchip', style: { marginLeft: 'auto' } }, 'Heat shading on') : null),
      h('div', { className: 'nx-grid__scroll' }, h('table', null,
        h('thead', null, h('tr', null, h('th', { className: 'pin', style: { position: 'sticky', left: 0 } }, p.rowLabel), cv.map(function (c) { return h('th', { key: c, className: 'num' }, c); }), p.rowTotals ? h('th', { className: 'num' }, p.rowTotalLabel || 'All') : null)),
        h('tbody', null, rv.map(function (r) {
          var rowVals = cv.map(function (c) { var d = cell[r + '|' + c]; return d ? d[val] : null; });
          return h('tr', { key: r }, h('td', { className: 'pin', style: { position: 'sticky', left: 0, fontWeight: 600 } }, r), cv.map(function (c, i) {
            var d = cell[r + '|' + c], v = d ? d[val] : null, supp = d && p.suppressBelow && d.n != null && d.n < p.suppressBelow;
            return h('td', { key: c, className: 'num' }, supp ? h('span', { className: 'nx-cell-supp', title: 'Hidden: group under ' + p.suppressBelow }, 'n<' + p.suppressBelow) : p.heat && v != null ? h('span', { className: 'nx-cell-heat h' + step(v) }, fmt(v)) : fmt(v));
          }), p.rowTotals ? h('td', { className: 'num', style: { fontWeight: 600 } }, fmt(p.rowTotals[r])) : null);
        })),
        p.colTotals ? h('tfoot', null, h('tr', { className: 'tot' }, h('td', { className: 'pin', style: { position: 'sticky', left: 0 } }, p.colTotalLabel || 'All'), cv.map(function (c) { return h('td', { key: c, className: 'num' }, fmt(p.colTotals[c])); }), p.rowTotals ? h('td', { className: 'num' }, fmt(p.grandTotal)) : null)) : null)));
  }

  function ColumnProfile(p) {
    return h('section', { className: 'nx-panel', 'aria-label': 'Column profile' },
      h('div', { className: 'nx-panel__head' }, h('h3', null, p.title, h('small', null, p.subtitle))),
      h('div', { className: 'nx-prof' }, p.columns.map(function (c) {
        var fill = 1 - (c.missing || 0);
        return h('div', { key: c.name, className: 'nx-prof__col' },
          h('div', { style: { display: 'flex', alignItems: 'baseline', gap: 6 } }, h('b', null, c.name), h('code', { style: { marginLeft: 'auto' } }, c.type)),
          h('div', { className: 'nx-prof__fill', title: Math.round(fill * 100) + '% filled' }, h('i', { style: { width: fill * 100 + '%' } }), h('i', { className: 'miss', style: { width: (c.missing || 0) * 100 + '%' } })),
          h('span', null, Math.round(fill * 100) + '% filled' + (c.distinct != null ? ' · ' + c.distinct.toLocaleString() + ' distinct' : '')),
          c.hist ? h('div', { className: 'nx-prof__hist', 'aria-hidden': true }, c.hist.map(function (v, i) { return h('i', { key: i, style: { height: Math.max(2, v * 100) + '%' } }); })) : null,
          c.top ? h('span', null, 'Top: ' + c.top.join(', ')) : null,
          c.range ? h('span', null, 'Range ' + c.range) : null,
          c.warn ? h('span', { className: 'nx-prof__warn' }, '⚠ ' + c.warn) : null);
      })));
  }

  function DiffTable(p) {
    var cols = p.columns, adds = 0, dels = 0, chg = 0;
    p.rows.forEach(function (r) { if (r._op === 'add') adds++; else if (r._op === 'del') dels++; else if (r._changed && r._changed.length) chg++; });
    return h('section', { className: 'nx-grid nx-tdiff', 'aria-label': p.title },
      h('div', { className: 'nx-grid__bar' }, h('div', { className: 'nx-grid__title' }, h('b', null, p.title), h('small', null, p.subtitle)), p.actions),
      h('div', { className: 'nx-tdiff__sum', role: 'status' }, h('span', null, h('i', { style: { background: 'var(--flow)' } }), chg + ' changed'), h('span', null, h('i', { style: { background: 'var(--success)' } }), adds + ' added'), h('span', null, h('i', { style: { background: 'var(--danger)' } }), dels + ' removed'), h('span', { style: { color: 'var(--ink-muted)', fontWeight: 400 } }, (p.unchanged || 0) + ' unchanged, hidden')),
      h('div', { className: 'nx-grid__scroll' }, h('table', null,
        h('thead', null, h('tr', null, cols.map(function (c) { return h('th', { key: c.key, className: NUMERIC[c.type] ? 'num' : null }, c.label); }))),
        h('tbody', null, p.rows.map(function (r, i) {
          return h('tr', { key: i, className: r._op === 'add' ? 'add' : r._op === 'del' ? 'del' : null }, cols.map(function (c) {
            var changed = r._changed && r._changed.indexOf(c.key) >= 0, num = NUMERIC[c.type];
            return h('td', { key: c.key, className: cx(num && 'num', changed && 'chg') }, changed ? [h('span', { key: 'o', className: 'old' }, num ? fmtNum(r._old[c.key], c) : r._old[c.key]), h('span', { key: 'n', className: 'new' }, num ? fmtNum(r[c.key], c) : r[c.key])] : h(Cell, { col: c, row: r }));
          }));
        })))));
  }

  function DataCards(p) {
    return h('div', { className: 'nx-dcards', role: 'list', 'aria-label': p.title },
      p.rows.map(function (r) {
        var key = p.columns.filter(function (c) { return c.key === p.figure; })[0];
        return h('article', { key: r.id, className: 'nx-dcard', role: 'listitem' },
          h('div', { className: 'nx-dcard__top' }, h('b', null, r[p.titleKey]), key ? h('span', { className: 'nx-dcard__fig' }, h(Cell, { col: key, row: r, rule: p.suppressBelow })) : null),
          h('dl', null, p.columns.filter(function (c) { return c.key !== p.titleKey && c.key !== p.figure; }).map(function (c) { return [h('dt', { key: 't' + c.key }, c.label), h('dd', { key: 'd' + c.key }, h(Cell, { col: c, row: r, supp: suppressed(r, c, p.suppressBelow), rule: p.suppressBelow }))]; })));
      }));
  }

  Object.assign(N, { DataGrid: DataGrid, DataGridCell: Cell, PivotTable: PivotTable, ColumnProfile: ColumnProfile, DiffTable: DiffTable, DataCards: DataCards, toCSV: toCSV });
})();
