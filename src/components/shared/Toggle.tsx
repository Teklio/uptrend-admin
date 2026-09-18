interface ToggleProps {
  checked: boolean;
  onClick: () => void;
  disabled?: boolean;
}

export const Toggle = ({ checked, onClick, disabled }: ToggleProps) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={onClick}
    disabled={disabled}
    className="relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors disabled:opacity-50"
    style={{ backgroundColor: checked ? "#16a34a" : "rgba(0,0,0,0.15)" }}
  >
    <span
      className="inline-block h-4 w-4 rounded-full bg-white shadow transition-transform"
      style={{ transform: checked ? "translateX(22px)" : "translateX(4px)" }}
    />
  </button>
);
