import { useState } from "react";
import { X } from "lucide-react";

interface FeaturesInputProps {
  label: string;
  value: string[];
  onChange: (value: string[]) => void;
  placeholder?: string;
}

export const FeaturesInput = ({ label, value, onChange, placeholder }: FeaturesInputProps) => {
  const [draft, setDraft] = useState("");

  const addItem = () => {
    const trimmed = draft.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setDraft("");
  };

  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-[13px] font-medium" style={{ color: "#191919" }}>
        {label}
      </label>
      <div className="flex gap-2">
        <input
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              addItem();
            }
          }}
          placeholder={placeholder}
          className="flex-1 rounded-xl px-3.5 py-2.5 text-[14px] outline-none focus:ring-2 focus:ring-[#002b7f]/15"
          style={{ backgroundColor: "#f0f0f0", border: "1px solid rgba(0,0,0,0.07)" }}
        />
        <button
          type="button"
          onClick={addItem}
          className="rounded-xl px-4 text-[13px] font-semibold text-[#0f172a]"
          style={{ backgroundColor: "#f5a300" }}
        >
          Add
        </button>
      </div>
      {value.length > 0 && (
        <div className="mt-1 flex flex-wrap gap-2">
          {value.map((item, i) => (
            <span
              key={`${item}-${i}`}
              className="flex min-w-0 max-w-full items-center gap-1.5 rounded-full px-3 py-1 text-[12px]"
              style={{ backgroundColor: "rgba(0,43,127,0.08)", color: "#002b7f" }}
            >
              <span className="min-w-0 wrap-break-word">{item}</span>
              <button type="button" className="shrink-0" onClick={() => onChange(value.filter((_, idx) => idx !== i))}>
                <X size={12} />
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
};
