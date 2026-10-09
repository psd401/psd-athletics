import { act, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { CompactCountdown, compactRemaining, Countdown, remaining } from "./countdown";

describe("remaining", () => {
  it("splits the time left into days, hours, minutes and seconds", () => {
    const start = Date.parse("2026-10-10T02:00:00Z");
    expect(remaining(start, Date.parse("2026-10-09T02:00:00Z"))).toEqual({ started: false, d: 1, h: 0, m: 0, s: 0 });
    expect(remaining(start, Date.parse("2026-10-09T23:58:30Z"))).toEqual({ started: false, d: 0, h: 2, m: 1, s: 30 });
    expect(remaining(start, start)).toEqual({ started: true, d: 0, h: 0, m: 0, s: 0 });
  });
});

describe("Countdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-10T01:59:58Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("ticks down and switches to Live at the start time", () => {
    render(
      <Countdown startsAt="2026-10-10T02:00:00Z" clockOffsetMs={0} initialNow={Date.parse("2026-10-10T01:59:58Z")} label="Time until kickoff" />,
    );
    const timer = screen.getByRole("timer", { name: "Time until kickoff" });
    expect(timer).toHaveTextContent("00Days00Hours00Min02Sec");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent("01Sec");

    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.queryByRole("timer")).not.toBeInTheDocument();
    expect(screen.getByText("Live")).toBeInTheDocument();
  });

  it("applies the server clock offset", () => {
    // The server's clock is a day behind the browser's.
    render(
      <Countdown startsAt="2026-10-10T02:00:00Z" clockOffsetMs={-86_400_000} initialNow={Date.parse("2026-10-09T01:59:58Z")} label="t" />,
    );
    act(() => {
      vi.advanceTimersByTime(1000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent("01Days00Hours00Min01Sec");
  });
});

describe("compactRemaining", () => {
  const start = Date.parse("2026-10-09T02:30:00Z");
  it("shows minutes and seconds, adds hours and days when needed", () => {
    expect(compactRemaining(start, start - 65_000)).toBe("01:05");
    expect(compactRemaining(start, start - 2 * 3_600_000 - 5_000)).toBe("02:00:05");
    expect(compactRemaining(start, start - 86_400_000 - 1000)).toBe("1 day 00:00:01");
    expect(compactRemaining(start, start)).toBeNull();
  });
});

describe("CompactCountdown", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-10-09T02:29:58Z"));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("counts down in one line and says Live at the start time", () => {
    render(
      <CompactCountdown
        startsAt="2026-10-09T02:30:00Z"
        clockOffsetMs={0}
        initialNow={Date.parse("2026-10-09T02:29:58Z")}
        unit="Start"
        startLabel="7:30 PM"
      />,
    );
    const timer = screen.getByRole("timer", { name: "Time until start" });
    expect(timer).toHaveTextContent("Start in00:02");
    act(() => {
      vi.advanceTimersByTime(2000);
    });
    expect(screen.getByRole("timer")).toHaveTextContent("Start was 7:30 PMLive");
  });
});
