// Inline stroke icons (docs/BRAND.md: 2px stroke, no emoji). Decorative:
// every icon sits next to a text label or inside a control with a name.

import type { SVGProps } from "react";

function Icon({ children, ...props }: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

type P = SVGProps<SVGSVGElement>;

export const TicketIcon = (p: P) => (
  <Icon {...p}>
    <path d="M3 9a3 3 0 0 0 0 6v3h18v-3a3 3 0 0 0 0-6V6H3z" />
    <path d="M13 6v12" strokeDasharray="2 2" />
  </Icon>
);
export const WatchIcon = (p: P) => (
  <Icon {...p}>
    <rect x="2.5" y="5" width="19" height="14" rx="3" />
    <path d="m10 9 5 3-5 3z" />
  </Icon>
);
export const PinIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Icon>
);
export const CalendarAddIcon = (p: P) => (
  <Icon {...p}>
    <rect x="3.5" y="5" width="17" height="15" rx="2" />
    <path d="M3.5 10h17M8 3v4M16 3v4M12 13v4M10 15h4" />
  </Icon>
);
export const BellIcon = (p: P) => (
  <Icon {...p}>
    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
    <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
  </Icon>
);
export const ArrowIcon = (p: P) => (
  <Icon {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Icon>
);
export const BackIcon = (p: P) => (
  <Icon {...p}>
    <path d="M19 12H5M11 6l-6 6 6 6" />
  </Icon>
);
export const ChevronDownIcon = (p: P) => (
  <Icon {...p}>
    <path d="m6 9 6 6 6-6" />
  </Icon>
);
export const CheckIcon = (p: P) => (
  <Icon {...p}>
    <path d="M20 6 9 17l-5-5" />
  </Icon>
);
export const FormIcon = (p: P) => (
  <Icon {...p}>
    <path d="M14 3H6.5A1.5 1.5 0 0 0 5 4.5v15A1.5 1.5 0 0 0 6.5 21h11a1.5 1.5 0 0 0 1.5-1.5V8z" />
    <path d="M14 3v5h5M9 14l2 2 4-4" />
  </Icon>
);
export const PulseIcon = (p: P) => (
  <Icon {...p}>
    <path d="M20 12h-4l-3 7-4-14-3 7H3" />
  </Icon>
);
export const CardIcon = (p: P) => (
  <Icon {...p}>
    <rect x="3" y="6" width="18" height="13" rx="2" />
    <path d="M3 10h18M7 15h4" />
  </Icon>
);
export const BusIcon = (p: P) => (
  <Icon {...p}>
    <rect x="4" y="4" width="16" height="13" rx="2" />
    <path d="M4 11h16M8 17v3M16 17v3" />
  </Icon>
);
export const ShieldIcon = (p: P) => (
  <Icon {...p}>
    <path d="M12 3 4.5 6v6c0 4.5 3.2 7.8 7.5 9 4.3-1.2 7.5-4.5 7.5-9V6z" />
  </Icon>
);
export const InfoIcon = (p: P) => (
  <Icon {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 8v4M12 16h.01" />
  </Icon>
);
export const BagIcon = (p: P) => (
  <Icon {...p}>
    <path d="M6 7h12l-1 13H7z" />
    <path d="M9 7a3 3 0 0 1 6 0" />
  </Icon>
);
export const PauseIcon = (p: P) => (
  <Icon {...p}>
    <path d="M9 6v12M15 6v12" />
  </Icon>
);
export const PlayIcon = (p: P) => (
  <Icon {...p}>
    <path d="m8 5 11 7-11 7z" />
  </Icon>
);
