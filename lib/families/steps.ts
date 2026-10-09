// What a family does before the first practice (SPEC §4 families hub).
// Wording comes from the approved comps (Main.dc.html families grid, PHS-Staff.dc.html);
// don't add policy details the district hasn't given us. Links are only ones checked on
// 2026-10-08; the rest wait on QUESTIONS 23.

export const FINAL_FORMS_URL = "https://peninsula-wa.finalforms.com";
export const WIAA_ELIGIBILITY_URL = "https://www.wiaa.com/eligibility/";

export type FamilyIcon = "form" | "pulse" | "card" | "bus" | "shield" | "info";

export interface FamilyStep {
  id: string;
  icon: FamilyIcon;
  title: string;
  /** One line, for the hub's grid. */
  summary: string;
  /** Plain-language steps, for the families page. */
  how: string[];
  link: { href: string; label: string } | null;
}

export const familySteps: FamilyStep[] = [
  {
    id: "register",
    icon: "form",
    title: "Register on Final Forms",
    summary: "One account per family for every sport, every season, at both schools.",
    how: [
      "Sign in to Final Forms, or create a family account.",
      "Register your student for each sport. One account covers every sport, every season, at both schools.",
    ],
    link: { href: FINAL_FORMS_URL, label: "Open Final Forms" },
  },
  {
    id: "physical",
    icon: "pulse",
    title: "Sports physical",
    summary: "Use the WIAA physical form, then upload it to Final Forms. Valid for two years.",
    how: ["Use the WIAA physical form.", "Upload it to Final Forms.", "A physical is valid for two years."],
    link: null,
  },
  {
    id: "asb",
    icon: "card",
    title: "ASB card",
    summary: "Required for every athlete. Buy it through the school bookkeeper's payment portal.",
    how: ["Every athlete needs an ASB card.", "Buy it through the school bookkeeper's payment portal."],
    link: null,
  },
  {
    id: "transport",
    icon: "bus",
    title: "Self-transportation form",
    summary: "Driving yourself or riding with family to an away game? File it before game day.",
    how: ["Driving yourself or riding with family to an away game? File the self-transportation form before game day."],
    link: null,
  },
  {
    id: "health",
    icon: "shield",
    title: "Insurance & health forms",
    summary: "Accident insurance, asthma, EpiPen and medication forms in one place.",
    how: ["Accident insurance, asthma, EpiPen and medication forms."],
    link: null,
  },
  {
    id: "eligibility",
    icon: "info",
    title: "Eligibility & transfers",
    summary: "Transfer rules, alternative-education contracts and WIAA eligibility, in plain language.",
    how: [
      "Transfer rules, alternative-education contracts and WIAA eligibility.",
      "Start with the athletics office. Coaches can't approve eligibility.",
    ],
    link: { href: WIAA_ELIGIBILITY_URL, label: "WIAA Student Eligibility Center" },
  },
];
