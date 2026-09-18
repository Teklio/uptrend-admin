type BadgeVariant = "success" | "error" | "warning" | "info" | "neutral";

const VARIANT_STYLES: Record<BadgeVariant, { bg: string; color: string }> = {
  success: { bg: "rgba(22,163,74,0.1)", color: "#16a34a" },
  error: { bg: "rgba(220,38,38,0.1)", color: "#dc2626" },
  warning: { bg: "rgba(202,138,4,0.1)", color: "#ca8a04" },
  info: { bg: "rgba(0,43,127,0.1)", color: "#002b7f" },
  neutral: { bg: "rgba(0,0,0,0.06)", color: "rgba(0,0,0,0.6)" },
};

interface StatusBadgeProps {
  label: string;
  variant?: BadgeVariant;
}

export const StatusBadge = ({ label, variant = "neutral" }: StatusBadgeProps) => {
  const { bg, color } = VARIANT_STYLES[variant];
  return (
    <span
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[12px] font-semibold whitespace-nowrap"
      style={{ backgroundColor: bg, color }}
    >
      {label}
    </span>
  );
};
