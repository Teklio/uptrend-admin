import { useState } from "react";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { useQuery } from "@tanstack/react-query";
import { Check, ChevronDown } from "lucide-react";
import { useSearchDebounce } from "../../hooks/useSearchDebounce";
import { cn } from "../../utils/cn.util";

export interface ComboboxOptionData {
  label: string;
  sublabel?: string;
  value: string;
  // Optional passthrough for extra data the picking screen needs (e.g. a
  // course's price/fee) without a second fetch after selection.
  meta?: Record<string, unknown>;
}

interface AsyncComboboxProps {
  label?: string;
  placeholder?: string;
  value: ComboboxOptionData | null;
  onChange: (option: ComboboxOptionData | null) => void;
  search: (query: string) => Promise<ComboboxOptionData[]>;
  queryKeyPrefix: string;
  error?: string;
  disabled?: boolean;
  className?: string;
}

// Search-as-you-type select backed by a paginated admin list endpoint
// (e.g. GET /admin/users?search=...) — used wherever picking a specific
// student or course from a potentially large list is needed.
export const AsyncCombobox = ({
  label,
  placeholder = "Search...",
  value,
  onChange,
  search,
  queryKeyPrefix,
  error,
  disabled,
  className,
}: AsyncComboboxProps) => {
  const [query, setQuery] = useState("");
  const debouncedQuery = useSearchDebounce(query, 300);

  const { data: options = [], isFetching } = useQuery({
    queryKey: [queryKeyPrefix, "combobox-search", debouncedQuery],
    queryFn: () => search(debouncedQuery),
  });

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-[13px] font-medium" style={{ color: "#191919" }}>
          {label}
        </label>
      )}
      <Combobox
        value={value}
        onChange={onChange}
        onClose={() => setQuery("")}
        disabled={disabled}
        by={(a, b) => a?.value === b?.value}
      >
        <div className="relative">
          <ComboboxInput
            className="w-full rounded-xl px-3.5 py-2.5 text-[14px] outline-none"
            style={{ backgroundColor: "#f0f0f0", border: `1px solid ${error ? "#dc2626" : "rgba(0,0,0,0.07)"}` }}
            displayValue={(option: ComboboxOptionData | null) => option?.label ?? ""}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={placeholder}
          />
          <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
            <ChevronDown size={16} style={{ color: "rgba(0,0,0,0.4)" }} />
          </ComboboxButton>
          <ComboboxOptions
            anchor="bottom start"
            className="z-20 mt-1.5 max-h-60 w-[var(--input-width)] overflow-auto rounded-xl bg-white py-1.5 text-[14px] shadow-lg focus:outline-none"
            style={{ border: "1px solid rgba(0,0,0,0.07)" }}
          >
            {isFetching && (
              <div className="px-3.5 py-2.5" style={{ color: "rgba(0,0,0,0.4)" }}>
                Searching...
              </div>
            )}
            {!isFetching && options.length === 0 && (
              <div className="px-3.5 py-2.5" style={{ color: "rgba(0,0,0,0.4)" }}>
                No results
              </div>
            )}
            {options.map((option) => (
              <ComboboxOption
                key={option.value}
                value={option}
                className="relative cursor-pointer select-none px-3.5 py-2.5 data-focus:bg-[#002b7f]/8"
              >
                {({ selected }) => (
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0">
                      <p className="truncate" style={{ color: "#191919" }}>
                        {option.label}
                      </p>
                      {option.sublabel && (
                        <p className="truncate text-[12px]" style={{ color: "rgba(0,0,0,0.4)" }}>
                          {option.sublabel}
                        </p>
                      )}
                    </div>
                    {selected && <Check size={15} color="#002b7f" />}
                  </div>
                )}
              </ComboboxOption>
            ))}
          </ComboboxOptions>
        </div>
      </Combobox>
      {error && (
        <span className="text-[12px]" style={{ color: "#dc2626" }}>
          {error}
        </span>
      )}
    </div>
  );
};
