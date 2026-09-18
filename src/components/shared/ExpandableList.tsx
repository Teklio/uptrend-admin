import { useState, type ReactNode } from "react";

interface ExpandableListProps<T> {
  items: T[];
  renderItem: (item: T, index: number) => ReactNode;
  maxItems?: number;
  emptyLabel?: string;
}

// Same idea as ExpandableText but for lists — caps to a few items so a
// long list never blows up a row's height, with a toggle to see the rest.
export function ExpandableList<T>({ items, renderItem, maxItems = 3, emptyLabel = "—" }: ExpandableListProps<T>) {
  const [expanded, setExpanded] = useState(false);

  if (items.length === 0) {
    return (
      <p className="text-[13px]" style={{ color: "rgba(0,0,0,0.4)" }}>
        {emptyLabel}
      </p>
    );
  }

  const visible = expanded ? items : items.slice(0, maxItems);

  return (
    <div>
      <ul className="flex flex-col gap-1.5">{visible.map((item, i) => renderItem(item, i))}</ul>
      {items.length > maxItems && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-1.5 text-[12px] font-medium hover:underline"
          style={{ color: "#002b7f" }}
        >
          {expanded ? "Show less" : `Show all ${items.length}`}
        </button>
      )}
    </div>
  );
}
