export const formatCurrency = (amount: number | string) => {
  const value = typeof amount === "string" ? Number(amount) : amount;
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
};

export const formatDate = (date: string | Date) =>
  new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(date));

export const formatDateTime = (date: string | Date) =>
  new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));

export const formatDuration = (seconds: number | null | undefined) => {
  if (seconds === null || seconds === undefined) return "--:--";
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${String(secs).padStart(2, "0")}`;
};

// Human-readable total, e.g. for a module's combined video runtime — "1h 12m",
// "45m", "38s" — distinct from formatDuration's mm:ss (which reads oddly once
// a sum crosses into hours).
export const formatTotalDuration = (totalSeconds: number) => {
  if (totalSeconds <= 0) return "0m";
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.round((totalSeconds % 3600) / 60);
  if (hours > 0) return minutes > 0 ? `${hours}h ${minutes}m` : `${hours}h`;
  if (minutes > 0) return `${minutes}m`;
  return `${Math.round(totalSeconds)}s`;
};
