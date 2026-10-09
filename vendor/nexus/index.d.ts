/**
 * Nexus — React components over the nx- CSS classes.
 * Load tokens.css, components/bundle.css, React 18 and ReactDOM 18, then bundle.js → window.Nexus.
 * Set data-theme on an ancestor (ThemeProvider): "nexus" | "commons" | "dark" | "commons-dark" | "high-contrast".
 */
import type * as React from 'react';
import type { ReactNode, CSSProperties, ButtonHTMLAttributes, InputHTMLAttributes, TextareaHTMLAttributes, SelectHTMLAttributes } from 'react';

export type Theme = 'nexus' | 'commons' | 'dark' | 'commons-dark' | 'high-contrast';
export type IconName = 'check' | 'arrow' | 'back' | 'chev' | 'down' | 'x' | 'plus' | 'more' | 'users' | 'user' | 'cal' | 'chart' | 'shield' | 'pin' | 'lock' | 'clip' | 'mic' | 'send' | 'stop' | 'pause' | 'undo' | 'search' | 'home' | 'clock' | 'doc' | 'folder' | 'bell' | 'gear' | 'help' | 'info' | 'alert' | 'checkc' | 'excl' | 'upload' | 'filter' | 'bus' | 'cloud' | 'scale' | 'link' | 'eye' | 'edit' | 'trash' | 'copy' | 'share' | 'sidebar' | 'sparkle' | 'book' | 'chat' | 'inbox' | 'sliders' | 'agent';
export type Tone = 'info' | 'success' | 'warning' | 'danger' | 'flow' | 'attention';

/* Foundations */
export interface IconProps { name: IconName; size?: number; className?: string }
export interface ThemeProviderProps { theme?: Theme; className?: string; style?: CSSProperties; children?: ReactNode }
export interface LandscapeProps { className?: string }

/* Actions */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { /** primary = the one action per view */ variant?: 'primary' | 'secondary' | 'quiet' | 'danger'; size?: 'sm' | 'md' | 'lg'; icon?: IconName; iconEnd?: IconName; block?: boolean }
export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> { icon: IconName; /** Required accessible name, also the tooltip */ label: string; variant?: 'outline' | 'send'; size?: 'sm' | 'md' }
export interface SegmentedControlProps { label: string; value: string; options: Array<string | { value: string; label: string }>; onChange?: (value: string) => void }

/* Status & feedback */
export interface BadgeProps { tone?: Tone; /** false hides the status dot */ dot?: boolean; className?: string; children: ReactNode }
export interface CountProps { strong?: boolean; children: ReactNode }
export interface BannerProps { tone?: Exclude<Tone, 'flow'>; title?: string; icon?: IconName; action?: ReactNode; children?: ReactNode }
export interface ToastProps { icon?: IconName; actionLabel?: string; onAction?: () => void; /** e.g. "30 min" undo window */ meta?: string; children: ReactNode }
export interface TooltipProps { id?: string; children: ReactNode }
export interface ProgressBarProps { /** 0–100; omit for indeterminate */ value?: number; label: string }
export interface SpinnerProps { size?: 'md' | 'lg'; label?: string }
export interface SkeletonProps { width?: number | string; height?: number | string }
export interface EmptyStateProps { title: string; art?: boolean; action?: ReactNode; tagline?: string; children?: ReactNode }
export interface AvatarProps { name?: string; initials?: string; src?: string; agent?: boolean; size?: 'xs' | 'sm' | 'md' | 'lg'; /** 1–4 → person-1…4; default hashes name */ tone?: 1 | 2 | 3 | 4; status?: 'online' | 'away' }
export interface FacepileProps { people: string[]; max?: number; label?: string }
export interface PresenceTagProps { name: string; agent?: boolean; style?: CSSProperties }

/* Forms */
interface FieldBase { label: string; help?: string; /** Error message phrased as a fix */ error?: string; optional?: boolean }
export interface TextFieldProps extends FieldBase, Omit<InputHTMLAttributes<HTMLInputElement>, 'label'> {}
export interface TextAreaProps extends FieldBase, TextareaHTMLAttributes<HTMLTextAreaElement> {}
export interface SelectProps extends FieldBase, SelectHTMLAttributes<HTMLSelectElement> { options: Array<string | { value: string; label: string }> }
export interface SearchFieldProps extends InputHTMLAttributes<HTMLInputElement> { /** 48px hero search */ hero?: boolean }
export interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> { label: ReactNode; description?: ReactNode }
export interface RadioGroupProps { label: string; name: string; value?: string; options: Array<{ value: string; label: ReactNode; description?: ReactNode }>; onChange?: (value: string) => void }
export interface SwitchProps extends InputHTMLAttributes<HTMLInputElement> { label: ReactNode }
export interface SliderProps extends FieldBase, InputHTMLAttributes<HTMLInputElement> {}
export interface FacetChipsProps { facets: Array<{ key: string; value: string }>; onRemove?: (f: { key: string; value: string }) => void; onAdd?: () => void }
export interface FileDropProps { title?: string; onFiles?: (files: FileList) => void; children?: ReactNode }

/* Navigation & layout */
export interface TabsProps { value: string; tabs: Array<{ label: string; value?: string; count?: number }>; onChange?: (value: string) => void }
export interface SidebarItem { label?: string; icon?: IconName; href?: string; sub?: string; count?: number; urgent?: boolean; current?: boolean; onClick?: () => void; section?: string }
export interface SidebarProps { brand?: string; tagline?: string; items: SidebarItem[] }
export interface BreadcrumbsProps { items: Array<{ label: string; href?: string }> }
export interface PaginationProps { page: number; total: number; onChange: (page: number) => void; meta?: string }
export interface AppHeaderProps { product?: string; room?: string; live?: string; meta?: ReactNode; user?: string }
export interface RoomTitleProps { title: string; state?: string; subtitle?: string; motto?: string; actions?: ReactNode }
export interface CardProps { title?: ReactNode; subtitle?: ReactNode; badge?: ReactNode; aside?: ReactNode; className?: string; style?: CSSProperties; children?: ReactNode }
export interface BottomBarProps { trust: string[]; children?: ReactNode }
export interface TrustFooterProps { items: string[]; icon?: 'shield' | 'lock' }
export interface StatusStripProps { working?: boolean; items: string[]; change?: string; onUndo?: () => void }
export interface KbdProps { children: ReactNode }

/* Overlays */
export interface ModalProps { open: boolean; title: string; onClose?: () => void; actions: ReactNode; children?: ReactNode }
export interface PopoverProps { title?: string; children?: ReactNode }
export interface MenuItem { label?: string; icon?: IconName; shortcut?: string; danger?: boolean; onSelect?: () => void; separator?: boolean; section?: string }
export interface MenuProps { items: MenuItem[] }
export interface CommandPaletteProps { open: boolean; title?: string; query?: string; onQuery?: (q: string) => void; onClose?: () => void; sections?: Array<{ title: string; items: ListRowProps[] }>; hint?: string }

/* Data display */
export interface ListRowProps { title: ReactNode; subtitle?: ReactNode; icon?: IconName; tone?: 'flow' | 'attention'; end?: ReactNode; href?: string; onClick?: () => void }
export interface DataTableColumn<R = any> { key: string; label: string; numeric?: boolean; sortable?: boolean; render?: (row: R) => ReactNode }
export interface DataTableProps<R = any> { columns: DataTableColumn<R>[]; /** null cell values render as "—" with suppressedReason */ rows: R[]; caption?: string; sort?: { key: string; dir: 'asc' | 'desc' }; onSort?: (key: string) => void; selected?: string | number; onSelect?: (id: string | number) => void; suppressedReason?: string }
export interface KeyValueProps { items: Array<{ key: ReactNode; value: ReactNode }> }
export interface ActivityTimelineProps { events: Array<{ time: string; what: string; who?: string; needsYou?: boolean }> }
export interface AccordionProps { items: Array<{ title: ReactNode; content: ReactNode; open?: boolean }> }
export interface StatTileProps { label: string; value: string; delta?: string; deltaTone?: 'flow' | 'attention'; context?: string }

/* Agent patterns */
export interface AgentMessageProps { author: string; agent?: boolean; time?: string; children: ReactNode }
export interface WorkStepsProps { steps: Array<{ label: string; state?: 'done' | 'active' | 'pending' }> }
export interface ChoiceChipsProps { label: string; value?: string; options: Array<string | { value: string; label: string }>; onChange?: (value: string) => void }
export interface ContextChipProps { name: string; value: string; source?: string; confirmed?: boolean; pinned?: boolean; icon?: IconName }
export interface ComposerProps { value?: string; onChange?: (v: string) => void; onSend?: () => void; onAttach?: () => void; onVoice?: () => void; placeholder?: string; hint?: string }
export interface DecisionCardProps { eyebrow?: string; title: string; why?: string; recommendation?: string; needsYou?: boolean; figure?: string; figureLabel?: string; actions: ReactNode; footnote?: string }
export interface SpecialistListProps { agents: Array<{ name: string; task: string; icon?: IconName; state?: 'done' | 'blocked'; stateLabel?: string }>; footnote?: string }
export interface RevisionCompareProps { before: ReactNode; proposed: ReactNode; /** One honest sentence on what is lost */ tradeoff: ReactNode; onApply?: () => void; onApplyAll?: () => void; onRetry?: () => void; onKeep?: () => void }
export interface VersionPathProps { versions: Array<{ label: string; note?: string; current?: boolean; pending?: boolean }> }
export interface ClaimPairProps { supported: string; open: string; supportedLabel?: string; openLabel?: string }
export interface SourceTrailProps { sources: Array<{ name: string; detail?: string; icon?: IconName; status?: 'connected' | 'waiting' | 'failed'; statusLabel?: string }>; onAdd?: () => void }
export interface WorkQueueProps { jobs: Array<{ title: string; description?: string; step: string; eta: string; icon?: IconName }> }
export interface PermissionRequestProps { title?: string; reason: string; system: string; scope: string; allowLabel?: string; onAllow?: () => void; onDeny?: () => void }
export interface ResumeCardProps { title: string; subtitle?: string; leftAt: string; icon?: IconName; onResume?: () => void; onOverview?: () => void }
export interface StoryTimelineProps { chapters: Array<{ title: string; meta?: string; open?: boolean; content?: ReactNode; onClick?: () => void }> }

/* Charts */
export interface DotPlotProps { label: string; rows: Array<{ label: string; value: number; low: number; high: number }>; min?: number; max?: number; ticks?: number[]; unit?: string; axisLabel?: string; width?: number }
export interface BarChartProps { label: string; data: Array<{ label: string; value: number; display?: string; context?: boolean }>; max?: number; /** dashed reference line, e.g. even share */ reference?: number; width?: number }
export interface LineChartProps { label: string; series: Array<{ values: number[]; context?: boolean }>; min?: number; max?: number; ticks?: number[]; unit?: string; endLabel?: string; width?: number; height?: number }
export interface SparklineProps { values: number[]; label?: string; width?: number; height?: number }
export interface ChartLegendProps { items: Array<{ label: string; token?: string; mark?: 'square' | 'line' | 'dot' }> }
export interface ChartTooltipProps { title: string; value: string; context?: string }


/* ── v3 additions ── */
export interface LinkProps extends React.AnchorHTMLAttributes<HTMLAnchorElement> { external?: boolean }
export interface DividerProps { label?: string }
export interface MentionProps { name: string; agent?: boolean }
export interface ComboboxOption { value: string; label: string; detail?: string; icon?: IconName }
export interface ComboboxProps { label?: string; value: string[]; onChange: (v: string[]) => void; options: ComboboxOption[]; multiple?: boolean; placeholder?: string; help?: string; id?: string }
export interface DatePickerProps { label?: string; month?: Date; start?: Date; end?: Date; events?: Date[]; onSelect?: (d: Date) => void; locale?: string; footer?: ReactNode }
export interface NumberStepperProps { label?: string; value: number; onChange: (n: number) => void; min?: number; max?: number; step?: number }
export interface ButtonGroupProps { label: string; value?: string; options?: Array<{ value: string; label: string; icon?: IconName }>; onChange?: (v: string) => void; /** split button mode */ split?: boolean; onClick?: () => void; onMenu?: () => void; menuLabel?: string }
export interface FilterBarProps { filters: Array<{ label: string; active?: boolean; icon?: IconName; onClick?: () => void }>; onAdd?: () => void; count?: ReactNode; onClear?: () => void }
export interface DrawerProps { open: boolean; title: string; onClose?: () => void; footer?: ReactNode; children?: ReactNode }
export interface AlertDialogProps { open: boolean; title: string; confirmLabel: string; cancelLabel?: string; /** require typing this word */ confirmWord?: string; icon?: IconName; onConfirm?: () => void; onCancel?: () => void; children?: ReactNode }
export interface ToolbarProps { label: string; items: Array<{ icon?: IconName; label?: string; pressed?: boolean; onClick?: () => void; separator?: boolean }> }
export interface CoachmarkProps { title: string; step?: string; nextLabel?: string; onNext?: () => void; onSkip?: () => void; children?: ReactNode }
export interface NotificationItem { title: string; detail?: ReactNode; time: string; unread?: boolean; person?: string; icon?: IconName; tone?: 'flow' | 'attention'; actions?: ReactNode }
export interface NotificationCenterProps { title?: string; items: NotificationItem[]; onMarkAll?: () => void }
export interface ErrorStateProps { code?: string; icon?: IconName; title: string; action?: ReactNode; children?: ReactNode }
export interface OfflineBannerProps { children?: ReactNode }
export interface BulkActionBarProps { count: number; onClear?: () => void; children?: ReactNode }
export interface AttachmentChipProps { name: string; kind?: 'xls' | 'pdf' | 'doc' | string; detail?: ReactNode }
export interface SignInProps { product?: string; tagline?: string; label?: string; fine?: ReactNode; onSignIn?: () => void }
export interface WizardProps { current: number; steps: Array<{ title: string; summary?: string }> }
export interface ProseProps { lang?: string; children?: ReactNode }
export interface CodeBlockProps { code: string }
export interface CommentThreadProps { anchor?: string; comments: Array<{ author: string; agent?: boolean; time: string; body: ReactNode }>; onReply?: () => void; onResolve?: () => void }
export interface TranslationPairProps { versions: Array<{ lang: string; label: string; text: ReactNode; approved?: boolean }>; trust?: string[]; action?: ReactNode }
export interface EvidenceCardProps { items: Array<{ source: string; kind: string; time?: string; icon?: IconName; image?: string; href?: string }> }
export interface ArtifactListProps { items: Array<{ title: string; byline: string; status?: 'current' | 'changed' | 'superseded'; statusLabel?: string; icon?: IconName; href?: string }> }
export interface JourneyTimelineProps { steps: Array<{ date: string; text: ReactNode; kind: string; icon?: IconName; here?: boolean }> }
export interface ThreadListProps { threads: Array<{ title: string; status: string; state?: 'resolved' | 'waiting' | 'working'; icon?: IconName; activity?: number[] }> }
export interface CheckpointBarProps { draft: string; editing?: boolean; savedAt: string; editors?: string[]; onVersions?: () => void }
export interface AgentActionBarProps { turns: Array<{ author: string; text: string }>; listening?: boolean; onMic?: () => void; onInterrupt?: () => void; onUndo?: () => void; onReview?: () => void }
export interface LiveBriefItem { text: string; isNew?: boolean; source?: string }
export interface LiveBriefProps { title: string; subtitle?: string; updated?: string; known: Array<string | LiveBriefItem>; uncertain: Array<string | LiveBriefItem>; ready: Array<string | LiveBriefItem>; onWhy?: () => void }
export interface ConsequenceDecisionProps { area: string; icon?: IconName; title: string; description?: string; ifApprove: string; ifDefer: string; urgent?: boolean; onWhy?: () => void; onApprove?: () => void; onEdit?: () => void; onDefer?: () => void }
export interface DecisionOption { value: string; label: string; sublabel?: string; tone: 'go' | 'hold' | 'stop'; impactTitle?: string; impacts?: string[] }
export interface DecisionOptionsProps { label: string; recommendation?: string; deadline?: string; options: DecisionOption[]; value?: string; onChoose?: (v: string) => void }
export interface ParticipantStripProps { people: Array<{ name: string; role?: string; status?: string; agent?: boolean; icon?: IconName; dissent?: boolean }> }
export interface NoticePanelProps { title: string; subtitle?: string; paused?: boolean; onTogglePause?: () => void; noticed?: string[]; prepared?: { text: string; onEdit?: () => void; onSend?: () => void }; done?: Array<{ title: string; detail?: ReactNode; onUndo?: () => void }>; need?: ReactNode }
export interface AgendaBlocksProps { note?: string; blocks: Array<{ title: string; minutes: number; purpose?: string; source?: string; pages?: string; protected?: boolean; protectedLabel?: string; changed?: boolean; delta?: string }> }
export interface CalendarWeekProps { startHour?: number; hours?: number; days: Array<{ label: string; date: string | number; today?: boolean; events?: Array<{ title: string; detail?: string; start: number; end: number; tone?: 'flow' | 'attention' | 'proposed' }> }> }
export interface HeatmapProps { label: string; unit?: string; /** null = suppressed for privacy */ rows: Array<{ label: string; values: Array<number | null> }> }
export interface ProgressRingProps { value: number; max: number; label?: string }
export interface MeterProps { label: string; valueLabel?: string; /** 0–100 */ value: number; ends?: string[] }
export interface SmallMultiplesProps { reference?: number; series: Array<{ label: string; values: number[]; display?: string; watch?: boolean }> }
export interface FlowFieldProps { paths: string[]; warm?: string[]; node?: { x: number; y: number }; width?: number; height?: number; label?: string }
export interface AgentGlowProps { active?: boolean; className?: string; style?: CSSProperties; children?: ReactNode }
export interface StreamTextProps { text: string; done?: boolean; settledWords?: number }
export interface CountUpProps { value: number; from?: number; duration?: number; locale?: string; format?: Intl.NumberFormatOptions }
export interface RevealProps { as?: string; className?: string; style?: CSSProperties; children?: ReactNode }
export interface ConvergeProps { sources: number[]; label: string; node?: { x: number; y: number }; width?: number; height?: number }
export interface ApplyMoveProps { from?: { left: number; top: number }; className?: string; style?: CSSProperties; children?: ReactNode }
export interface AgentThinkingProps { label?: string }

/* ── v4: liquid glass + ask the person ── */
export interface GlassProps { as?: string; strong?: boolean; capsule?: boolean; className?: string; style?: CSSProperties; children?: ReactNode }
export interface GlassButtonProps { icon?: IconName; label?: string; prominent?: boolean; selected?: boolean; onClick?: () => void; children?: ReactNode }
export interface AgentOrbProps { size?: number; label?: string }
export interface GlassTab { id: string; label: string; icon: string; badge?: number }
export interface GlassTabBarProps { tabs: GlassTab[]; value: string; onChange?: (id: string) => void; minimized?: boolean; onSearch?: () => void; style?: React.CSSProperties }
export interface GraphType { color: string; icon: string; label: string; agent?: boolean }
export type GraphTypes = Record<string, GraphType>;
export interface GraphNodeData { id: string; label: string; type: string; sub?: string | null; more?: number; suggested?: boolean; stale?: boolean; restricted?: boolean; x?: number; y?: number }
export type GraphEdgeKind = 'strong' | 'inferred' | 'evidence' | 'path' | string;
export interface GraphEdgeData { source: string; target: string; label?: string; kind?: GraphEdgeKind }
export interface GraphCanvasProps { nodes: GraphNodeData[]; edges: GraphEdgeData[]; types?: GraphTypes; focusId?: string; selectedId?: string | null; onSelect?: (id: string | null) => void; onExpand?: (id: string) => void; onFocusNode?: (id: string) => void; height?: number; edgeLabels?: 'focus' | 'all'; trail?: { id: string; label: string }[]; status?: React.ReactNode; controls?: boolean; minimap?: boolean; animate?: boolean; autoFit?: boolean; bare?: boolean; label?: string; className?: string; style?: React.CSSProperties }
export interface GraphNodeChipProps { label: string; type: string; sub?: string | null; types?: GraphTypes; more?: number; focus?: boolean; selected?: boolean; suggested?: boolean; stale?: boolean; restricted?: boolean; onClick?: () => void }
export interface GraphRelation { type: string; direction: 'in' | 'out'; count?: number; items: { id: string; label: string; type: string; note?: string }[] }
export interface GraphSuggestion { id: string; title: string; evidence: React.ReactNode }
export interface GraphInspectorProps { node: { label: string; type: string }; types?: GraphTypes; properties?: Record<string, React.ReactNode> | [string, React.ReactNode][]; relations?: GraphRelation[]; suggestions?: GraphSuggestion[]; source?: React.ReactNode; collapseAfter?: number; menu?: React.ReactNode; actions?: React.ReactNode; onNavigate?: (id: string) => void; onConfirm?: (s: GraphSuggestion) => void; onDismiss?: (s: GraphSuggestion) => void; onExpand?: () => void; onPath?: () => void; onAsk?: () => void; className?: string; style?: React.CSSProperties }
export type GraphPathStep = { node: GraphNodeChipProps & { id?: string } } | { edge: { label: string; dir?: 'in' | 'out'; kind?: 'inferred' | 'evidence' } };
export interface GraphPathProps { summary?: React.ReactNode; paths: { title: string; status?: 'established' | 'review'; meta?: string; steps: GraphPathStep[] }[]; types?: GraphTypes; onShow?: (path: GraphPathProps['paths'][number], index: number) => void; onNavigate?: (id: string) => void }
export interface GraphLegendProps { types?: GraphTypes; order?: string[]; counts?: Record<string, number>; hidden?: string[]; onToggle?: (type: string) => void; label?: string }
export interface GraphTableProps { rows: { id: string; label: string; type: string; rel?: string; dir?: 'in' | 'out' | string; source?: string }[]; types?: GraphTypes; caption?: React.ReactNode; onNavigate?: (id: string) => void }
/* Charts II */
export interface ChartFrameProps { title?: React.ReactNode; subtitle?: React.ReactNode; note?: React.ReactNode; onTable?: () => void; label?: string; width?: number; className?: string; style?: React.CSSProperties }
export interface StackedBarChartProps extends ChartFrameProps { rows: { label: string; n?: number; values: number[]; suppressed?: boolean }[]; levels: { label: string }[]; mode?: 'stacked' | 'diverging'; goodFrom?: number; midIndex?: number; sumLabel?: string; labelWidth?: number }
export interface DumbbellChartProps extends ChartFrameProps { rows: { label: string; a: number; b: number }[]; aLabel: string; bLabel: string; min: number; max: number; ticks?: number[]; unit?: string; watchAbove?: number; labelWidth?: number }
export interface SlopeChartProps extends ChartFrameProps { items: { label: string; from: number; to: number; watch?: boolean; context?: boolean }[]; fromLabel: string; toLabel: string; min?: number; max?: number; unit?: string; height?: number }
export interface ScatterQuadrantProps extends ChartFrameProps { points: { label: string; x: number; y: number; size?: number; watch?: boolean; context?: boolean; showLabel?: boolean }[]; xLabel: string; yLabel: string; xMin: number; xMax: number; yMin: number; yMax: number; xMid: number; yMid: number; xTicks?: number[]; yTicks?: number[]; quadrants?: { tl?: string; tr?: string; bl?: string; br?: string }; height?: number }
export interface HistogramProps extends ChartFrameProps { bins: { from: number; to: number; count: number }[]; cut?: number; cutLabel?: string; strip?: number[]; xTicks?: number[]; yTicks?: number[]; xLabel?: string; height?: number }
export interface CalendarHeatmapProps extends ChartFrameProps { start: string; weeks?: number; cell?: number; days: { date: string; value?: number; off?: boolean; note?: string; mark?: boolean }[]; step?: (v: number) => 0 | 1 | 2 | 3 | 4; stepLabels?: string[]; unit?: string }
export interface StackedAreaChartProps extends ChartFrameProps { series: { label: string; values: number[] }[]; xLabels?: string[]; yTicks?: number[]; max?: number; marker?: number; markerLabel?: string; height?: number }
export interface WaterfallChartProps extends ChartFrameProps { steps: { label: string; value: number; total?: boolean; sub?: string }[]; min?: number; max?: number; yTicks?: number[]; height?: number }
export interface BulletChartProps extends ChartFrameProps { rows: { label: string; sub?: string; value: number; compare?: number; bands?: number[] }[]; bands?: number[]; bandLabels?: string[]; min?: number; max: number; ticks?: number[]; unit?: string; decimals?: number; valueLabel?: string; compareLabel?: string; labelWidth?: number }
export interface SchoolMapProps extends ChartFrameProps { regions: { id: string; label: string; d: string; value?: number | null }[]; points?: { x: number; y: number; kind?: 'elem' | 'middle' | 'high'; label?: string; watch?: boolean }[]; land?: string; step?: (v: number) => 0 | 1 | 2 | 3 | 4; stepLabels?: string[]; unit?: string; caption?: string; height?: number }
/* Agent presence & control */
export type AgentState = 'idle' | 'thinking' | 'listening' | 'reading' | 'searching' | 'writing' | 'calculating' | 'talking' | 'waiting' | 'done' | 'error' | 'paused';
export interface AgentAvatarProps { state?: AgentState; size?: 'sm' | 'md' | 'lg' | 'xl' | number; hue?: string; name?: string; className?: string; style?: React.CSSProperties }
export interface AgentStatusLineProps { state?: AgentState; now: React.ReactNode; sub?: React.ReactNode; progress?: number; size?: AgentAvatarProps['size']; hue?: string; name?: string; actions?: React.ReactNode; className?: string; style?: React.CSSProperties }
export interface PlanStep { id?: string; text: string; scopes?: { kind?: 'read' | 'write'; label: string }[]; time?: string; needs?: string; skip?: boolean; added?: boolean }
export interface PlanPreviewProps { title: React.ReactNode; subtitle?: React.ReactNode; steps: PlanStep[]; runLabel?: string; trust?: string; onRun?: (active: PlanStep[]) => void; onCancel?: () => void; onChange?: (steps: PlanStep[]) => void }
export interface SteerQueueProps { state?: AgentState; now: React.ReactNode; nowSub?: React.ReactNode; queued?: { text: string; when?: string }[]; onAdd?: (text: string) => void; onPause?: () => void }
export interface TakeoverBarProps { driver: 'agent' | 'human'; state?: AgentState; detail?: React.ReactNode; initials?: string; onTakeOver?: () => void; onHandBack?: () => void }
export interface ToolCallCardProps { name: string; summary?: React.ReactNode; status?: 'running' | 'done' | 'failed'; access?: 'read' | 'write'; duration?: string; icon?: string; inputs?: Record<string, unknown>; result?: React.ReactNode; raw?: string; open?: boolean }
export interface AgentLogEntry { id: string | number; day: string; time: string; state?: AgentState; kind: 'change' | 'read' | 'message' | 'permission'; verb: string; object: React.ReactNode; scope?: string; by?: string; undoUntil?: string; undone?: boolean }
export interface AgentActivityLogProps { entries: AgentLogEntry[]; title?: string; subtitle?: string; onUndo?: (e: AgentLogEntry) => void }
export interface MemoryGoalsProps { tab?: 'memory' | 'goals'; memory?: { text: string; source?: string; pending?: boolean }[]; goals?: { title: string; status?: string; tone?: string; progress?: number; state?: AgentState; next?: string }[]; onKeep?: (m: any) => void; onForget?: (m: any) => void }
export interface StandingTaskProps { title: string; next?: string; day?: string; date?: string; parsed?: { icon?: string; text: string }[]; runs?: { state: 'ok' | 'warn' | 'fail' | 'next'; size?: number; label?: string }[]; lastRun?: string; scopes?: { kind?: 'read' | 'write'; label: string }[]; enabled?: boolean; onRunNow?: () => void; onPause?: () => void; onEdit?: () => void }
export interface AgentErrorRecoveryProps { title: string; detail?: string; safe?: string; options: { label: string; detail?: string; recommended?: boolean }[]; technical?: string; onChoose?: (o: { label: string }) => void }
export interface OutputFeedbackProps { value?: 'up' | 'down' | null; options?: string[]; reasons?: string[]; note?: string; remember?: boolean; sent?: boolean; meta?: React.ReactNode; thanks?: string; thanksUp?: string; onSubmit?: (f: { reasons: string[]; remember: boolean }) => void }
/* Data grid */
export type GridColumnType = 'text' | 'number' | 'percent' | 'currency' | 'delta' | 'bar' | 'heat' | 'spark' | 'status' | 'badge';
export interface GridColumn<R = any> { key: string; label: string; type?: GridColumnType; pin?: boolean; width?: number; unit?: string; decimals?: number; agg?: 'sum' | 'avg' | 'wavg'; weight?: string; private?: boolean; suppressBelow?: number; description?: string; source?: string; editable?: boolean; validate?: (v: any, row: R) => string | null; render?: (v: any, row: R) => React.ReactNode; max?: number; watch?: (v: any, row: R) => boolean; steps?: number[]; goodUp?: boolean; flat?: number; statuses?: Record<string, { label: string; tone?: 'watch' | 'alert' | 'off' }>; tone?: string }
export interface GridFilter { key: string; op: 'in' | '<' | '>' | 'between'; value?: any; values?: any[]; label: string }
export interface DataGridProps<R extends { id: string | number; n?: number } = any> { title: string; source?: string; freshness?: string; stale?: boolean; columns: GridColumn<R>[]; rows: R[]; suppressBelow?: number; selectable?: boolean; selected?: R['id'][]; totals?: boolean; totalsLabel?: string; renderDetail?: (row: R) => React.ReactNode; expanded?: R['id'][]; groupBy?: string | null; collapsed?: string[]; pageSize?: number; density?: 'compact' | 'regular' | 'comfortable'; views?: string[]; view?: string; filters?: GridFilter[]; sort?: { key: string; dir: 'asc' | 'desc' }[]; hidden?: string[]; bulkActions?: string[]; state?: 'loading' | 'empty' | 'error'; emptyTitle?: string; emptyDetail?: string; errorTitle?: string; errorDetail?: string; maxHeight?: number; toolbar?: boolean; footer?: boolean; exportName?: string; onAsk?: () => void; onAskColumn?: (c: GridColumn<R>) => void; onExport?: (csv: string) => void; onSave?: (edits: Record<string, Partial<R>>) => void; onRetry?: () => void; className?: string; style?: React.CSSProperties }
export interface PivotTableProps { title: string; subtitle?: string; data: Record<string, any>[]; rows: string; cols: string; value: string; rowLabel: string; colLabel: string; valueLabel: string; colOrder?: string[]; decimals?: number; unit?: string; heat?: boolean; suppressBelow?: number; rowTotals?: Record<string, number>; colTotals?: Record<string, number>; grandTotal?: number; rowTotalLabel?: string; colTotalLabel?: string }
export interface ColumnProfileProps { title: string; subtitle?: string; columns: { name: string; type: string; missing?: number; distinct?: number; top?: string[]; range?: string; hist?: number[]; warn?: string }[] }
export interface DiffTableProps { title: string; subtitle?: string; columns: GridColumn[]; rows: (Record<string, any> & { _op?: 'add' | 'del'; _changed?: string[]; _old?: Record<string, any> })[]; unchanged?: number; actions?: React.ReactNode }
export interface DataCardsProps { title: string; columns: GridColumn[]; rows: any[]; titleKey: string; figure?: string; suppressBelow?: number }
export type CompanionState = 'idle' | 'listening' | 'working' | 'needs-you' | 'suggesting' | 'done';
export interface CompanionAccessoryProps { state?: CompanionState; text?: React.ReactNode; sub?: React.ReactNode; action?: React.ReactNode; onAction?: () => void; onPause?: () => void; onDictate?: () => void; onOpen?: () => void; count?: number; inline?: boolean; style?: React.CSSProperties }
export interface AskOption { label: string; description?: string; /** Shown first with a "Recommended" tag; used by Skip */ recommended?: boolean; /** Live preview of the consequence, shown beside the options */ preview?: ReactNode }
export interface AskQuestion { /** 1–2 word tab label */ header: string; question: string; why?: string; multiSelect?: boolean; options: AskOption[] }
export interface AskAnswer { header: string; question: string; answers: string[] }
export interface AskUserQuestionProps { title?: string; subtitle?: string; questions: AskQuestion[]; onSubmit: (answers: AskAnswer[]) => void; onSkip?: (answers: AskAnswer[]) => void; allowOther?: boolean; inline?: boolean; glass?: boolean; submitLabel?: string }
export interface AskReceiptProps { answers: AskAnswer[]; onChange?: () => void }
declare const Nexus: {
  Icon(p: IconProps): JSX.Element; ThemeProvider(p: ThemeProviderProps): JSX.Element; Landscape(p: LandscapeProps): JSX.Element;
  Button(p: ButtonProps): JSX.Element; IconButton(p: IconButtonProps): JSX.Element; SegmentedControl(p: SegmentedControlProps): JSX.Element;
  Badge(p: BadgeProps): JSX.Element; Count(p: CountProps): JSX.Element; Banner(p: BannerProps): JSX.Element; Toast(p: ToastProps): JSX.Element; Tooltip(p: TooltipProps): JSX.Element; ProgressBar(p: ProgressBarProps): JSX.Element; Spinner(p: SpinnerProps): JSX.Element; Skeleton(p: SkeletonProps): JSX.Element; EmptyState(p: EmptyStateProps): JSX.Element; Avatar(p: AvatarProps): JSX.Element; Facepile(p: FacepileProps): JSX.Element; PresenceTag(p: PresenceTagProps): JSX.Element;
  TextField(p: TextFieldProps): JSX.Element; TextArea(p: TextAreaProps): JSX.Element; Select(p: SelectProps): JSX.Element; SearchField(p: SearchFieldProps): JSX.Element; Checkbox(p: CheckboxProps): JSX.Element; RadioGroup(p: RadioGroupProps): JSX.Element; Switch(p: SwitchProps): JSX.Element; Slider(p: SliderProps): JSX.Element; FacetChips(p: FacetChipsProps): JSX.Element; FileDrop(p: FileDropProps): JSX.Element;
  Tabs(p: TabsProps): JSX.Element; Sidebar(p: SidebarProps): JSX.Element; Breadcrumbs(p: BreadcrumbsProps): JSX.Element; Pagination(p: PaginationProps): JSX.Element; AppHeader(p: AppHeaderProps): JSX.Element; RoomTitle(p: RoomTitleProps): JSX.Element; Card(p: CardProps): JSX.Element; BottomBar(p: BottomBarProps): JSX.Element; TrustFooter(p: TrustFooterProps): JSX.Element; StatusStrip(p: StatusStripProps): JSX.Element; Kbd(p: KbdProps): JSX.Element;
  Modal(p: ModalProps): JSX.Element | null; Popover(p: PopoverProps): JSX.Element; Menu(p: MenuProps): JSX.Element; CommandPalette(p: CommandPaletteProps): JSX.Element | null;
  ListRow(p: ListRowProps): JSX.Element; DataTable<R>(p: DataTableProps<R>): JSX.Element; KeyValue(p: KeyValueProps): JSX.Element; ActivityTimeline(p: ActivityTimelineProps): JSX.Element; Accordion(p: AccordionProps): JSX.Element; StatTile(p: StatTileProps): JSX.Element;
  AgentMessage(p: AgentMessageProps): JSX.Element; WorkSteps(p: WorkStepsProps): JSX.Element; ChoiceChips(p: ChoiceChipsProps): JSX.Element; ContextChip(p: ContextChipProps): JSX.Element; Composer(p: ComposerProps): JSX.Element; DecisionCard(p: DecisionCardProps): JSX.Element; SpecialistList(p: SpecialistListProps): JSX.Element; RevisionCompare(p: RevisionCompareProps): JSX.Element; VersionPath(p: VersionPathProps): JSX.Element; ClaimPair(p: ClaimPairProps): JSX.Element; SourceTrail(p: SourceTrailProps): JSX.Element; WorkQueue(p: WorkQueueProps): JSX.Element; PermissionRequest(p: PermissionRequestProps): JSX.Element; ResumeCard(p: ResumeCardProps): JSX.Element; StoryTimeline(p: StoryTimelineProps): JSX.Element;
  DotPlot(p: DotPlotProps): JSX.Element; BarChart(p: BarChartProps): JSX.Element; LineChart(p: LineChartProps): JSX.Element; Sparkline(p: SparklineProps): JSX.Element; ChartLegend(p: ChartLegendProps): JSX.Element; ChartTooltip(p: ChartTooltipProps): JSX.Element;
  Link(p: LinkProps): JSX.Element; Divider(p: DividerProps): JSX.Element; Mention(p: MentionProps): JSX.Element; LiveDot(): JSX.Element; LiveLine(): JSX.Element;
  Combobox(p: ComboboxProps): JSX.Element; DatePicker(p: DatePickerProps): JSX.Element; NumberStepper(p: NumberStepperProps): JSX.Element; ButtonGroup(p: ButtonGroupProps): JSX.Element; FilterBar(p: FilterBarProps): JSX.Element;
  Drawer(p: DrawerProps): JSX.Element | null; AlertDialog(p: AlertDialogProps): JSX.Element | null; Toolbar(p: ToolbarProps): JSX.Element; Coachmark(p: CoachmarkProps): JSX.Element; NotificationCenter(p: NotificationCenterProps): JSX.Element; ErrorState(p: ErrorStateProps): JSX.Element; OfflineBanner(p: OfflineBannerProps): JSX.Element; BulkActionBar(p: BulkActionBarProps): JSX.Element; AttachmentChip(p: AttachmentChipProps): JSX.Element; SignIn(p: SignInProps): JSX.Element; Wizard(p: WizardProps): JSX.Element;
  Prose(p: ProseProps): JSX.Element; CodeBlock(p: CodeBlockProps): JSX.Element; CommentThread(p: CommentThreadProps): JSX.Element; TranslationPair(p: TranslationPairProps): JSX.Element; EvidenceCard(p: EvidenceCardProps): JSX.Element; ArtifactList(p: ArtifactListProps): JSX.Element; JourneyTimeline(p: JourneyTimelineProps): JSX.Element; ThreadList(p: ThreadListProps): JSX.Element; CheckpointBar(p: CheckpointBarProps): JSX.Element;
  AgentActionBar(p: AgentActionBarProps): JSX.Element; LiveBrief(p: LiveBriefProps): JSX.Element; ConsequenceDecision(p: ConsequenceDecisionProps): JSX.Element; DecisionOptions(p: DecisionOptionsProps): JSX.Element; ParticipantStrip(p: ParticipantStripProps): JSX.Element; NoticePanel(p: NoticePanelProps): JSX.Element; AgendaBlocks(p: AgendaBlocksProps): JSX.Element; CalendarWeek(p: CalendarWeekProps): JSX.Element;
  Heatmap(p: HeatmapProps): JSX.Element; ProgressRing(p: ProgressRingProps): JSX.Element; Meter(p: MeterProps): JSX.Element; SmallMultiples(p: SmallMultiplesProps): JSX.Element;
  FlowField(p: FlowFieldProps): JSX.Element; AgentGlow(p: AgentGlowProps): JSX.Element; StreamText(p: StreamTextProps): JSX.Element; CountUp(p: CountUpProps): JSX.Element; Reveal(p: RevealProps): JSX.Element; Converge(p: ConvergeProps): JSX.Element; ApplyMove(p: ApplyMoveProps): JSX.Element; AgentThinking(p: AgentThinkingProps): JSX.Element;
  Glass(p: GlassProps): JSX.Element; GlassButton(p: GlassButtonProps): JSX.Element; AgentOrb(p: AgentOrbProps): JSX.Element; AskUserQuestion(p: AskUserQuestionProps): JSX.Element; AskReceipt(p: AskReceiptProps): JSX.Element; GlassTabBar(p: GlassTabBarProps): JSX.Element; CompanionAccessory(p: CompanionAccessoryProps): JSX.Element; GRAPH_TYPES: GraphTypes; GraphCanvas(p: GraphCanvasProps): JSX.Element; GraphNodeChip(p: GraphNodeChipProps): JSX.Element; GraphInspector(p: GraphInspectorProps): JSX.Element; GraphPath(p: GraphPathProps): JSX.Element; GraphLegend(p: GraphLegendProps): JSX.Element; GraphTable(p: GraphTableProps): JSX.Element; StackedBarChart(p: StackedBarChartProps): JSX.Element; DumbbellChart(p: DumbbellChartProps): JSX.Element; SlopeChart(p: SlopeChartProps): JSX.Element; ScatterQuadrant(p: ScatterQuadrantProps): JSX.Element; Histogram(p: HistogramProps): JSX.Element; CalendarHeatmap(p: CalendarHeatmapProps): JSX.Element; StackedAreaChart(p: StackedAreaChartProps): JSX.Element; WaterfallChart(p: WaterfallChartProps): JSX.Element; BulletChart(p: BulletChartProps): JSX.Element; SchoolMap(p: SchoolMapProps): JSX.Element; AgentAvatar(p: AgentAvatarProps): JSX.Element; AgentStatusLine(p: AgentStatusLineProps): JSX.Element; AGENT_STATES: AgentState[]; PlanPreview(p: PlanPreviewProps): JSX.Element; SteerQueue(p: SteerQueueProps): JSX.Element; TakeoverBar(p: TakeoverBarProps): JSX.Element; ToolCallCard(p: ToolCallCardProps): JSX.Element; AgentActivityLog(p: AgentActivityLogProps): JSX.Element; MemoryGoals(p: MemoryGoalsProps): JSX.Element; StandingTask(p: StandingTaskProps): JSX.Element; AgentErrorRecovery(p: AgentErrorRecoveryProps): JSX.Element; OutputFeedback(p: OutputFeedbackProps): JSX.Element; DataGrid<R extends { id: string | number; n?: number }>(p: DataGridProps<R>): JSX.Element; DataGridCell(p: { col: GridColumn; row: any; supp?: boolean; rule?: number }): JSX.Element; PivotTable(p: PivotTableProps): JSX.Element; ColumnProfile(p: ColumnProfileProps): JSX.Element; DiffTable(p: DiffTableProps): JSX.Element; DataCards(p: DataCardsProps): JSX.Element; toCSV(cols: GridColumn[], rows: any[]): string; layoutGraph(nodes: GraphNodeData[], edges: GraphEdgeData[], focusId?: string, prev?: Record<string, { x: number; y: number }> | null): Record<string, { x: number; y: number; w: number; h: number }>;
};
export default Nexus;
