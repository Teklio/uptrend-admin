import { AlertTriangle } from "lucide-react";

export const WarningBanner = ({ message }: { message: string }) => (
  <div
    className="flex items-center gap-2.5 rounded-xl px-4 py-3 text-[13px]"
    style={{ backgroundColor: "rgba(202,138,4,0.1)", color: "#ca8a04" }}
  >
    <AlertTriangle size={16} />
    {message}
  </div>
);
