import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

export const SearchInput = ({ value, onChange, placeholder = "Search...", className }: SearchInputProps) => (
  <div className={`relative ${className ?? ""}`}>
    <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2" style={{ color: "rgba(0,0,0,0.4)" }} />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="w-full rounded-xl pl-10 pr-9 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-[#7e14ff]/15"
      style={{ backgroundColor: "#f0f0f0", border: "1px solid rgba(0,0,0,0.07)" }}
    />
    {value && (
      <button
        type="button"
        onClick={() => onChange("")}
        className="absolute right-3.5 top-1/2 -translate-y-1/2"
        style={{ color: "rgba(0,0,0,0.4)" }}
      >
        <X size={15} />
      </button>
    )}
  </div>
);
