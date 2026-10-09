import type { Metadata } from "next";
import type { ReactNode } from "react";

import "../vendor/nexus/tokens.css";
import "../styles/themes.css";
import { barlow, barlowCondensed, bigShoulders } from "./fonts";

export const metadata: Metadata = {
  title: "Peninsula Athletics",
  description: "Peninsula School District athletics: Gig Harbor Tides and Peninsula Seahawks",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={[bigShoulders.variable, barlow.variable, barlowCondensed.variable].join(" ")}>
      <body style={{ margin: 0 }}>{children}</body>
    </html>
  );
}
