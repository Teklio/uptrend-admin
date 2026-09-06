import type { ReactNode } from "react";

interface DetailRowProps {
  label: string;
  children: ReactNode;
}

export const DetailRow = ({ label, children }: DetailRowProps) => (
  <div className="flex items-center justify-between gap-4 py-2.5" style={{ borderBottom: "1px solid rgba(0,0,0,0.05)" }}>
    <span className="text-[13px]" style={{ color: "rgba(0,0,0,0.45)" }}>
      {label}
    </span>
    <span className="text-right text-[13px] font-medium" style={{ color: "#191919" }}>
      {children}
    </span>
  </div>
);
