import type { ReactNode } from "react";

interface StatsCardProps {
  label: string;
  value: string | number;
  icon: ReactNode;
  hint?: string;
}

export const StatsCard = ({ label, value, icon, hint }: StatsCardProps) => (
  <div className="rounded-2xl bg-white p-5" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
    <div className="flex items-center justify-between">
      <span className="text-[13px] font-medium" style={{ color: "rgba(0,0,0,0.45)" }}>
        {label}
      </span>
      <div
        className="flex h-9 w-9 items-center justify-center rounded-full"
        style={{ backgroundColor: "rgba(126,20,255,0.1)" }}
      >
        {icon}
      </div>
    </div>
    <p className="mt-3 font-mono text-[26px] font-medium" style={{ color: "#191919" }}>
      {value}
    </p>
    {hint && (
      <p className="mt-1 text-[12px]" style={{ color: "rgba(0,0,0,0.4)" }}>
        {hint}
      </p>
    )}
  </div>
);
