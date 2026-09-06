import { useState } from "react";
import { Controller, useFormContext } from "react-hook-form";
import { Eye, EyeOff } from "lucide-react";
import { cn } from "../../utils/cn.util";

interface InputProps {
  name: string;
  label?: string;
  type?: "text" | "email" | "password" | "number" | "textarea";
  placeholder?: string;
  rows?: number;
  disabled?: boolean;
  className?: string;
}

export const Input = ({
  name,
  label,
  type = "text",
  placeholder,
  rows = 3,
  disabled,
  className,
}: InputProps) => {
  const { control } = useFormContext();
  const [showPassword, setShowPassword] = useState(false);

  return (
    <Controller
      name={name}
      control={control}
      render={({ field, fieldState }) => {
        const borderColor = fieldState.error ? "#dc2626" : "rgba(0,0,0,0.07)";
        return (
          <div className={cn("flex flex-col gap-1.5", className)}>
            {label && (
              <label className="text-[13px] font-medium" style={{ color: "#191919" }}>
                {label}
              </label>
            )}
            <div className="relative">
              {type === "textarea" ? (
                <textarea
                  {...field}
                  rows={rows}
                  placeholder={placeholder}
                  disabled={disabled}
                  className="w-full rounded-xl px-3.5 py-2.5 text-[14px] outline-none transition-colors resize-none focus:ring-2 focus:ring-[#7e14ff]/15"
                  style={{ backgroundColor: "#f0f0f0", border: `1px solid ${borderColor}` }}
                />
              ) : type === "number" ? (
                <input
                  name={field.name}
                  ref={field.ref}
                  onBlur={field.onBlur}
                  value={Number.isNaN(field.value) || field.value === undefined ? "" : field.value}
                  onChange={(e) => field.onChange(e.target.valueAsNumber)}
                  type="number"
                  placeholder={placeholder}
                  disabled={disabled}
                  className="w-full rounded-xl px-3.5 py-2.5 text-[14px] outline-none transition-colors focus:ring-2 focus:ring-[#7e14ff]/15"
                  style={{ backgroundColor: "#f0f0f0", border: `1px solid ${borderColor}` }}
                />
              ) : (
                <input
                  {...field}
                  type={type === "password" && showPassword ? "text" : type}
                  placeholder={placeholder}
                  disabled={disabled}
                  className="w-full rounded-xl px-3.5 py-2.5 text-[14px] outline-none transition-colors focus:ring-2 focus:ring-[#7e14ff]/15"
                  style={{ backgroundColor: "#f0f0f0", border: `1px solid ${borderColor}` }}
                />
              )}
              {type === "password" && (
                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-3 top-1/2 -translate-y-1/2"
                  style={{ color: "rgba(0,0,0,0.4)" }}
                  tabIndex={-1}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              )}
            </div>
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
