"use client";

import { useRef, useState, type KeyboardEvent, type ReactNode } from "react";

export interface TabItem {
  id: string;
  label: string;
  panel: ReactNode;
}

interface TabsProps {
  items: TabItem[];
  label: string;
  classNames: { list?: string; tab?: string; panel?: string; listWrap?: string };
}

/**
 * ARIA tabs: arrow keys and Home/End move between tabs, one tab is in the tab
 * order, panels are rendered by the server and only shown here.
 */
export function Tabs({ items, label, classNames }: TabsProps) {
  const [selected, setSelected] = useState(items[0]?.id);
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  function onKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    const last = items.length - 1;
    const next =
      e.key === "ArrowRight" ? (index === last ? 0 : index + 1) : e.key === "ArrowLeft" ? (index === 0 ? last : index - 1) : e.key === "Home" ? 0 : e.key === "End" ? last : null;
    if (next === null) return;
    e.preventDefault();
    setSelected(items[next]!.id);
    refs.current[next]?.focus();
  }

  return (
    <>
      <div className={classNames.listWrap}>
        <div className={classNames.list} role="tablist" aria-label={label}>
          {items.map((item, i) => (
            <button
              key={item.id}
              ref={(el) => {
                refs.current[i] = el;
              }}
              id={`tab-${item.id}`}
              type="button"
              role="tab"
              className={classNames.tab}
              aria-selected={item.id === selected}
              aria-controls={`panel-${item.id}`}
              tabIndex={item.id === selected ? 0 : -1}
              onClick={() => setSelected(item.id)}
              onKeyDown={(e) => onKeyDown(e, i)}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
      {items.map((item) => (
        <div
          key={item.id}
          id={`panel-${item.id}`}
          role="tabpanel"
          aria-labelledby={`tab-${item.id}`}
          className={classNames.panel}
          hidden={item.id !== selected}
          tabIndex={0}
        >
          {item.panel}
        </div>
      ))}
    </>
  );
}
