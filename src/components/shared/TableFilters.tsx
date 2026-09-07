import { useState } from "react";
import type { ReactNode } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";

interface TableFiltersProps {
  children: ReactNode;
  onApply: () => void;
  onReset: () => void;
  hasActiveFilters?: boolean;
}

export const TableFilters = ({ children, onApply, onReset, hasActiveFilters }: TableFiltersProps) => {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-2xl bg-white" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-4 py-3"
      >
        <span className="flex items-center gap-2 text-[13px] font-semibold" style={{ color: "#191919" }}>
          <SlidersHorizontal size={15} color={hasActiveFilters ? "#002b7f" : "rgba(0,0,0,0.5)"} />
          Filters
          {hasActiveFilters && (
            <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: "#002b7f" }} />
          )}
        </span>
        <ChevronDown
          size={16}
          className="transition-transform"
          style={{ color: "rgba(0,0,0,0.4)", transform: open ? "rotate(180deg)" : undefined }}
        />
      </button>
      {open && (
        <div className="px-4 pb-4" style={{ borderTop: "1px solid rgba(0,0,0,0.07)" }}>
          <div className="grid grid-cols-1 gap-3 pt-4 sm:grid-cols-2 lg:grid-cols-4">{children}</div>
          <div className="mt-4 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={onReset}
              className="rounded-xl px-4 py-2 text-[13px] font-semibold"
              style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
            >
              Reset
            </button>
            <button
              type="button"
              onClick={onApply}
              className="rounded-xl px-4 py-2 text-[13px] font-semibold text-[#0f172a]"
              style={{ backgroundColor: "#f5a300" }}
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
