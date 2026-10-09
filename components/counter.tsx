"use client";

import { useState } from "react";

interface CounterProps {
  label: string;
}

/**
 * Example client component. It exists so the template ships with a real,
 * behavior-asserting test (see counter.test.tsx) — psd-ci fails repos with
 * zero tests by design.
 */
export function Counter({ label }: CounterProps) {
  const [count, setCount] = useState(0);

  return (
    <section aria-label={label}>
      <p>
        {label}: <output>{count}</output>
      </p>
      <button type="button" onClick={() => setCount((current) => current + 1)}>
        Increment
      </button>
    </section>
  );
}
