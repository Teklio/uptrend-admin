import { Fragment, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TableShimmer } from "./Shimmer";

export interface TableField {
  key: string;
  label: string;
  className?: string;
}

interface TableProps<T> {
  fields: TableField[];
  data: T[] | undefined;
  isLoading?: boolean;
  error?: unknown;
  formatRow: (item: T, index: number) => ReactNode;
  emptyMessage?: string;
  keyExtractor?: (item: T, index: number) => string | number;
  // Optional expand/collapse: when both are given, an extra full-width row
  // renders directly beneath any item isRowExpanded flags true for.
  isRowExpanded?: (item: T) => boolean;
  renderExpandedRow?: (item: T) => ReactNode;
}

export function Table<T>({
  fields,
  data,
  isLoading,
  error,
  formatRow,
  emptyMessage = "No records found",
  keyExtractor,
  isRowExpanded,
  renderExpandedRow,
}: TableProps<T>) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
      <table className="w-full text-left text-[13px]">
        <thead>
          <tr style={{ backgroundColor: "#f8f9fa", borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
            {fields.map((f) => (
              <th
                key={f.key}
                className={`px-4 py-3 font-semibold whitespace-nowrap ${f.className ?? ""}`}
                style={{ color: "rgba(0,0,0,0.5)" }}
              >
                {f.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {isLoading ? (
            <TableShimmer rows={6} columns={fields.length} />
          ) : error ? (
            <tr>
              <td colSpan={fields.length} className="px-4 py-10 text-center text-[13px]" style={{ color: "#dc2626" }}>
                Failed to load data. Please try again.
              </td>
            </tr>
          ) : !data || data.length === 0 ? (
            <tr>
              <td
                colSpan={fields.length}
                className="px-4 py-10 text-center text-[13px]"
                style={{ color: "rgba(0,0,0,0.4)" }}
              >
                {emptyMessage}
              </td>
            </tr>
          ) : (
            data.map((item, index) => {
              const key = keyExtractor ? keyExtractor(item, index) : index;
              const expanded = isRowExpanded?.(item) ?? false;
              return (
                <Fragment key={key}>
                  <tr style={{ borderBottom: expanded ? "none" : "1px solid rgba(0,0,0,0.05)" }}>
                    {formatRow(item, index)}
                  </tr>
                  <AnimatePresence initial={false}>
                    {expanded && renderExpandedRow && (
                      <tr style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
                        <td colSpan={fields.length} className="p-0" style={{ backgroundColor: "#f8f9fa" }}>
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.22, ease: "easeInOut" }}
                            style={{ overflow: "hidden" }}
                          >
                            <div className="px-4 pb-4 pt-3">{renderExpandedRow(item)}</div>
                          </motion.div>
                        </td>
                      </tr>
                    )}
                  </AnimatePresence>
                </Fragment>
              );
            })
          )}
        </tbody>
      </table>
    </div>
  );
}
