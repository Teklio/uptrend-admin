import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";

interface DateRangeFilterProps {
  from: Date | null;
  to: Date | null;
  onChange: (range: { from: Date | null; to: Date | null }) => void;
  label?: string;
  fromPlaceholder?: string;
  toPlaceholder?: string;
  className?: string;
}

// react-datepicker's <DatePicker> doesn't forward a `style` prop to its
// input, so background/border here go through Tailwind arbitrary-value
// classes instead of inline style — a pragmatic exception to the
// otherwise-inline-style color convention, forced by the library.
const inputClassName =
  "w-full rounded-xl py-2.5 pl-9 pr-3 text-[13px] outline-none bg-[#f0f0f0] border border-[rgba(0,0,0,0.07)]";

export const DateRangeFilter = ({
  from,
  to,
  onChange,
  label,
  fromPlaceholder = "From",
  toPlaceholder = "To",
  className,
}: DateRangeFilterProps) => (
  <div className={className}>
    {label && (
      <label className="mb-1.5 block text-[13px] font-medium" style={{ color: "#191919" }}>
        {label}
      </label>
    )}
    <div className="flex items-center gap-2">
      <div className="relative flex-1">
        <Calendar
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "rgba(0,0,0,0.4)" }}
        />
        <DatePicker
          selected={from}
          onChange={(date: Date | null) => onChange({ from: date, to })}
          selectsStart
          startDate={from}
          endDate={to}
          placeholderText={fromPlaceholder}
          dateFormat="dd MMM yyyy"
          className={inputClassName}
          wrapperClassName="w-full"
        />
      </div>
      <span style={{ color: "rgba(0,0,0,0.3)" }}>–</span>
      <div className="relative flex-1">
        <Calendar
          size={14}
          className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
          style={{ color: "rgba(0,0,0,0.4)" }}
        />
        <DatePicker
          selected={to}
          onChange={(date: Date | null) => onChange({ from, to: date })}
          selectsEnd
          startDate={from}
          endDate={to}
          minDate={from ?? undefined}
          placeholderText={toPlaceholder}
          dateFormat="dd MMM yyyy"
          className={inputClassName}
          wrapperClassName="w-full"
        />
      </div>
    </div>
  </div>
);
