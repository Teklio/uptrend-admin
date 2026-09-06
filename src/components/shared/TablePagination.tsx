import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PaginationMeta } from "../../types/common.type";
import { DropdownSelect } from "./Dropdown";

interface TablePaginationProps {
  meta: PaginationMeta | undefined;
  onPageChange: (page: number) => void;
  onLimitChange: (limit: number) => void;
  isLoading?: boolean;
}

const LIMIT_OPTIONS = [10, 20, 50, 100].map((n) => ({ label: `${n} / page`, value: String(n) }));

export const TablePagination = ({ meta, onPageChange, onLimitChange, isLoading }: TablePaginationProps) => {
  if (!meta) return null;
  const { page, totalPages, total, limit } = meta;

  return (
    <div className="flex flex-col gap-3 px-1 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-[13px]" style={{ color: "rgba(0,0,0,0.45)" }}>
        {total === 0 ? "0 results" : `Showing page ${page} of ${totalPages} · ${total} total`}
      </span>
      <div className="flex items-center gap-3">
        <DropdownSelect
          options={LIMIT_OPTIONS}
          value={String(limit)}
          onChange={(v) => v && onLimitChange(Number(v))}
          clearable={false}
          className="w-32"
        />
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            disabled={page <= 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-40"
            style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            disabled={page >= totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
            className="flex h-8 w-8 items-center justify-center rounded-lg disabled:opacity-40"
            style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};
