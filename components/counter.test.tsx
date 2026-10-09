import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { Counter } from "./counter";

describe("Counter", () => {
  it("renders the label and starts at zero", () => {
    render(<Counter label="Widgets" />);

    expect(screen.getByRole("region", { name: "Widgets" })).toBeInTheDocument();
    // <output> has the implicit ARIA role "status".
    expect(screen.getByRole("status")).toHaveTextContent("0");
  });

  it("increments the rendered count on each click", () => {
    render(<Counter label="Widgets" />);
    const button = screen.getByRole("button", { name: "Increment" });

    fireEvent.click(button);
    fireEvent.click(button);

    expect(screen.getByRole("status")).toHaveTextContent("2");
  });
});
