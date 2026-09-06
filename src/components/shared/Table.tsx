import type { ReactNode } from "react";
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
}

export function Table<T>({
  fields,
  data,
  isLoading,
  error,
  formatRow,
  emptyMessage = "No records found",
  keyExtractor,
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
            data.map((item, index) => (
              <tr
                key={keyExtractor ? keyExtractor(item, index) : index}
                style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}
              >
                {formatRow(item, index)}
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
}
