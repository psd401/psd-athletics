// @vitest-environment node
import { describe, expect, it } from "vitest";

import { DISTRICT_DOMAIN, isDistrictAccount } from "./domain";

describe("isDistrictAccount", () => {
  it("accepts a verified psd401.net account", () => {
    expect(DISTRICT_DOMAIN).toBe("psd401.net");
    expect(isDistrictAccount({ email: "coach@psd401.net", emailVerified: true })).toBe(true);
    expect(isDistrictAccount({ email: "Coach@PSD401.NET", emailVerified: true, hostedDomain: "psd401.net" })).toBe(true);
  });

  it.each([
    "coach@gmail.com",
    "coach@psd401.net.evil.com",
    "coach@evilpsd401.net",
    "coach@mail.psd401.net",
    "psd401.net@gmail.com",
    "coach@psd401.net@gmail.com",
    "@psd401.net",
    "coach",
    "",
  ])("rejects %j", (email) => {
    expect(isDistrictAccount({ email, emailVerified: true })).toBe(false);
  });

  it("rejects an unverified email even on the district domain", () => {
    expect(isDistrictAccount({ email: "coach@psd401.net", emailVerified: false })).toBe(false);
    expect(isDistrictAccount({ email: "coach@psd401.net" })).toBe(false);
  });

  it("rejects a Google account whose hosted domain is not the district's", () => {
    expect(isDistrictAccount({ email: "coach@psd401.net", emailVerified: true, hostedDomain: "gmail.com" })).toBe(false);
  });

  it("rejects missing email", () => {
    expect(isDistrictAccount({ email: undefined, emailVerified: true })).toBe(false);
    expect(isDistrictAccount({ email: null, emailVerified: true })).toBe(false);
  });
});
