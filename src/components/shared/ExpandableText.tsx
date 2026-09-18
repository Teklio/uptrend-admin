import { useEffect, useRef, useState, type CSSProperties } from "react";

interface ExpandableTextProps {
  text: string;
  maxLines?: number;
  className?: string;
  style?: CSSProperties;
}

// Clamps long free-text (descriptions, etc.) to a few lines with a
// "Read more" toggle — only shown when the text actually overflows that
// clamp, checked via the rendered element's own scroll vs. client height
// rather than guessing from character count.
export const ExpandableText = ({ text, maxLines = 3, className, style }: ExpandableTextProps) => {
  const [expanded, setExpanded] = useState(false);
  const [isTruncatable, setIsTruncatable] = useState(false);
  const ref = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (el) setIsTruncatable(el.scrollHeight > el.clientHeight + 1);
  }, [text]);

  return (
    <div>
      <p
        ref={ref}
        className={`wrap-break-word ${className ?? ""}`}
        style={
          expanded
            ? style
            : {
                ...style,
                display: "-webkit-box",
                WebkitLineClamp: maxLines,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
              }
        }
      >
        {text}
      </p>
      {isTruncatable && (
        <button
          type="button"
          onClick={() => setExpanded((e) => !e)}
          className="mt-1 text-[12px] font-medium hover:underline"
          style={{ color: "#002b7f" }}
        >
          {expanded ? "Show less" : "Read more"}
        </button>
      )}
    </div>
  );
};
