import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { TrustFooter } from "./trust-footer";

describe("TrustFooter", () => {
  it("states the screen's scope and side effects as text", () => {
    render(<TrustFooter items={["Read only", "No student data shown", "Nothing published"]} />);
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Read only · No student data shown · Nothing published");
  });
});
