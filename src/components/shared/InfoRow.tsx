import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

interface InfoRowProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}

// Icon-led label/value row — used inside DetailSection cards.
export const InfoRow = ({ icon: Icon, label, value }: InfoRowProps) => (
  <div className="flex items-center gap-2.5">
    <div
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
      style={{ backgroundColor: "rgba(0,0,0,0.05)" }}
    >
      <Icon size={14} style={{ color: "rgba(0,0,0,0.45)" }} />
    </div>
    <div className="min-w-0 flex-1">
      <p className="text-[11px]" style={{ color: "rgba(0,0,0,0.4)" }}>
        {label}
      </p>
      <p className="truncate text-[13px] font-medium" style={{ color: "#191919" }}>
        {value}
      </p>
    </div>
  </div>
);
