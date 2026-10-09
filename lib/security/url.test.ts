// @vitest-environment node
import { describe, expect, it } from "vitest";

import { safeHttpsUrl } from "./url";

describe("safeHttpsUrl", () => {
  it("keeps https links", () => {
    expect(safeHttpsUrl("https://example.org/practice.pdf")).toBe("https://example.org/practice.pdf");
  });

  it.each(["javascript:alert(1)", "http://example.org", "data:text/html,hi", "/relative", "not a url", "", null, undefined])(
    "drops %j",
    (value) => {
      expect(safeHttpsUrl(value)).toBeNull();
    },
  );
});
