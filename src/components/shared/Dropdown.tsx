import { Fragment } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Listbox, Transition } from "@headlessui/react";
import { Check, ChevronDown, X } from "lucide-react";
import { cn } from "../../utils/cn.util";

export interface DropdownOption {
  label: string;
  value: string;
}

interface BaseProps {
  label?: string;
  options: DropdownOption[];
  placeholder?: string;
  disabled?: boolean;
  clearable?: boolean;
  className?: string;
}

const OptionsPanel = ({ options }: { options: DropdownOption[] }) => (
  <Transition
    as={Fragment}
    leave="transition ease-in duration-100"
    leaveFrom="opacity-100"
    leaveTo="opacity-0"
  >
    <Listbox.Options
      className="absolute z-20 mt-1.5 max-h-60 w-full overflow-auto rounded-xl bg-white py-1.5 text-[14px] shadow-lg focus:outline-none"
      style={{ border: "1px solid rgba(0,0,0,0.07)" }}
    >
      {options.map((option) => (
        <Listbox.Option
          key={option.value}
          value={option}
          className="relative cursor-pointer select-none px-3.5 py-2.5 ui-active:bg-[#7e14ff]/8"
        >
          {({ selected }) => (
            <div className="flex items-center justify-between">
              <span style={{ color: "#191919" }}>{option.label}</span>
              {selected && <Check size={15} color="#7e14ff" />}
            </div>
          )}
        </Listbox.Option>
      ))}
    </Listbox.Options>
  </Transition>
);

// RHF-bound version — used inside a <FormProvider>.
interface DropdownProps extends BaseProps {
  name: string;
}

export const Dropdown = ({ name, label, options, placeholder = "Select...", disabled, className }: DropdownProps) => {
  const { control } = useFormContext();

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
            <Listbox value={selected} onChange={(opt) => field.onChange(opt?.value)} disabled={disabled}>
              <div className="relative">
                <Listbox.Button
                  className="w-full rounded-xl px-3.5 py-2.5 text-left text-[14px] outline-none flex items-center justify-between"
                  style={{
                    backgroundColor: "#f0f0f0",
                    border: `1px solid ${fieldState.error ? "#dc2626" : "rgba(0,0,0,0.07)"}`,
                  }}
                >
                  <span style={{ color: selected ? "#191919" : "rgba(0,0,0,0.4)" }}>
                    {selected?.label ?? placeholder}
                  </span>
                  <ChevronDown size={16} style={{ color: "rgba(0,0,0,0.4)" }} />
                </Listbox.Button>
                <OptionsPanel options={options} />
              </div>
            </Listbox>
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

// Standalone version — no form dependency, used for table filters.
interface DropdownSelectProps extends BaseProps {
  value: string | undefined;
  onChange: (value: string | undefined) => void;
}

export const DropdownSelect = ({
  label,
  options,
  value,
  onChange,
  placeholder = "All",
  disabled,
  clearable = true,
  className,
}: DropdownSelectProps) => {
  const selected = options.find((o) => o.value === value) ?? null;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label className="text-[13px] font-medium" style={{ color: "#191919" }}>
          {label}
        </label>
      )}
      <Listbox value={selected} onChange={(opt) => onChange(opt?.value)} disabled={disabled}>
        <div className="relative">
          <Listbox.Button
            className="w-full rounded-xl px-3.5 py-2.5 text-left text-[14px] outline-none flex items-center justify-between gap-2"
            style={{ backgroundColor: "#f0f0f0", border: "1px solid rgba(0,0,0,0.07)" }}
          >
            <span style={{ color: selected ? "#191919" : "rgba(0,0,0,0.4)" }}>
              {selected?.label ?? placeholder}
            </span>
            <span className="flex items-center gap-1">
              {clearable && selected && (
                <X
                  size={14}
                  style={{ color: "rgba(0,0,0,0.4)" }}
                  onClick={(e) => {
                    e.stopPropagation();
                    onChange(undefined);
                  }}
                />
              )}
              <ChevronDown size={16} style={{ color: "rgba(0,0,0,0.4)" }} />
            </span>
          </Listbox.Button>
          <OptionsPanel options={options} />
        </div>
      </Listbox>
    </div>
  );
};
