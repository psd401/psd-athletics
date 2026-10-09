// @vitest-environment node
import { describe, expect, it } from "vitest";

import { safeNext } from "./redirect";

describe("safeNext", () => {
  it("keeps Studio paths", () => {
    expect(safeNext("/studio")).toBe("/studio");
    expect(safeNext("/studio/stories/abc-123")).toBe("/studio/stories/abc-123");
    expect(safeNext(["/studio/media", "/x"])).toBe("/studio/media");
  });

  it.each([undefined, "", "/", "/ghh", "https://evil.example/studio", "//evil.example", "/studio?x=//evil", "/studio/../admin", "/studiox"])(
    "sends %j to /studio",
    (next) => {
      expect(safeNext(next)).toBe("/studio");
    },
  );
});
