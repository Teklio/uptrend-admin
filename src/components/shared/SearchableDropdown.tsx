import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Combobox, ComboboxButton, ComboboxInput, ComboboxOption, ComboboxOptions } from "@headlessui/react";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "../../utils/cn.util";
import type { DropdownOption } from "./Dropdown";

interface SearchableDropdownProps {
  name: string;
  label?: string;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
}

// RHF-bound, type-to-filter dropdown over a small, already-fetched option
// list (client-side filtering) — unlike AsyncCombobox, which searches a
// paginated server endpoint on every keystroke. Use this for fixed
// reference data (e.g. seeded states), not large/dynamic collections.
export const SearchableDropdown = ({
  name,
  label,
  options,
  placeholder = "Search...",
  disabled,
  className,
}: SearchableDropdownProps) => {
  const { control } = useFormContext();
  const [query, setQuery] = useState("");

  const filtered =
    query === "" ? options : options.filter((o) => o.label.toLowerCase().includes(query.toLowerCase()));

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const selected = options.find((o) => o.value === field.value) ?? null;

        return (
          <div className={cn("flex flex-col gap-1.5", className)}>
            {label && (
              <label className="text-[13px] font-medium" style={{ color: "#191919" }}>
                {label}
              </label>
            )}
            <Combobox
              value={selected}
              onChange={(option: DropdownOption | null) => field.onChange(option?.value ?? "")}
              onClose={() => setQuery("")}
              disabled={disabled}
              immediate
              by={(a, b) => a?.value === b?.value}
            >
              <div className="relative">
                <ComboboxInput
                  className="w-full rounded-xl px-3.5 py-2.5 text-[14px] outline-none"
                  style={{
                    backgroundColor: "#f0f0f0",
                    border: `1px solid ${fieldState.error ? "#dc2626" : "rgba(0,0,0,0.07)"}`,
                  }}
                  displayValue={(option: DropdownOption | null) => option?.label ?? ""}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={placeholder}
                />
                <ComboboxButton className="absolute inset-y-0 right-0 flex items-center pr-3">
                  <ChevronDown size={16} style={{ color: "rgba(0,0,0,0.4)" }} />
                </ComboboxButton>
                <ComboboxOptions
                  className="absolute z-20 mt-1.5 max-h-60 w-full overflow-auto rounded-xl bg-white py-1.5 text-[14px] shadow-lg focus:outline-none"
                  style={{ border: "1px solid rgba(0,0,0,0.07)" }}
                >
                  {filtered.length === 0 && (
                    <div className="px-3.5 py-2.5" style={{ color: "rgba(0,0,0,0.4)" }}>
                      No results
                    </div>
                  )}
                  {filtered.map((option) => (
                    <ComboboxOption
                      key={option.value}
                      value={option}
                      className="relative cursor-pointer select-none px-3.5 py-2.5 data-focus:bg-[#002b7f]/8"
                    >
                      {({ selected: isSelected }) => (
                        <div className="flex items-center justify-between gap-2">
                          <span style={{ color: "#191919" }}>{option.label}</span>
                          {isSelected && <Check size={15} color="#002b7f" />}
                        </div>
                      )}
                    </ComboboxOption>
                  ))}
                </ComboboxOptions>
              </div>
            </Combobox>
            {fieldState.error && (
              <span className="text-[12px]" style={{ color: "#dc2626" }}>
                {fieldState.error.message}
              </span>
            )}
          </div>
        );
      }}
    />
  );
};
