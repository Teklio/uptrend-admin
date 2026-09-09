import type { ReactNode } from "react";
import { cn } from "../../utils/cn.util";

interface DetailSectionProps {
  title?: string;
  children: ReactNode;
  className?: string;
}

// Groups related facts into a labeled card — used by UserViewSheet and
// PaymentViewSheet to replace a single long list of label/value rows with
// visually distinct sections.
export const DetailSection = ({ title, children, className }: DetailSectionProps) => (
  <div className={cn("flex flex-col gap-2", className)}>
    {title && (
      <p className="text-[12.5px] font-semibold" style={{ color: "#191919" }}>
        {title}
      </p>
    )}
    <div className="rounded-2xl p-4" style={{ backgroundColor: "#f8f9fa", border: "1px solid rgba(0,0,0,0.06)" }}>
      {children}
    </div>
  </div>
);
