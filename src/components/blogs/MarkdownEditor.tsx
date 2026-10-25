import { useMemo, useRef, useState } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import {
  Bold,
  Italic,
  Strikethrough,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Code,
  Link2,
  Image as ImageIcon,
  Minus,
  Eye,
  Pencil,
  Columns2,
  Maximize2,
  Minimize2,
  type LucideIcon,
} from "lucide-react";
import { countWords, estimateReadingTime } from "../../utils/markdown.util";

// react-markdown passes every custom renderer a `node` (hast element) prop
// that native DOM elements don't understand — strip it once here instead of
// repeating the same destructure-and-drop in every renderer below.
const stripNode = <P extends { node?: unknown }>({ node, ...rest }: P) => {
  void node;
  return rest;
};

const previewComponents: Components = {
  h1: (props) => <h1 className="mb-4 mt-2 text-[26px] font-bold" style={{ color: "#191919" }} {...stripNode(props)} />,
  h2: (props) => <h2 className="mb-3 mt-6 text-[21px] font-semibold" style={{ color: "#191919" }} {...stripNode(props)} />,
  h3: (props) => <h3 className="mb-2 mt-5 text-[17px] font-semibold" style={{ color: "#191919" }} {...stripNode(props)} />,
  p: (props) => <p className="mb-4" {...stripNode(props)} />,
  a: (props) => (
    <a className="underline" style={{ color: "#002b7f" }} target="_blank" rel="noopener noreferrer" {...stripNode(props)} />
  ),
  ul: (props) => <ul className="mb-4 ml-5 list-disc space-y-1" {...stripNode(props)} />,
  ol: (props) => <ol className="mb-4 ml-5 list-decimal space-y-1" {...stripNode(props)} />,
  blockquote: (props) => (
    <blockquote
      className="mb-4 rounded-r-lg py-2 pl-4 italic"
      style={{ borderLeft: "3px solid #002b7f", backgroundColor: "#f0f4ff", color: "rgba(0,0,0,0.65)" }}
      {...stripNode(props)}
    />
  ),
  code: (props) => {
    const { className, children, ...rest } = stripNode(props);
    const isBlock = /language-/.test(className ?? "");
    if (isBlock) {
      return (
        <code className={className} {...rest}>
          {children}
        </code>
      );
    }
    return (
      <code
        className="rounded px-1.5 py-0.5 text-[13px] font-mono"
        style={{ backgroundColor: "rgba(0,0,0,0.06)", color: "#b3324c" }}
        {...rest}
      >
        {children}
      </code>
    );
  },
  pre: (props) => (
    <pre
      className="mb-4 overflow-x-auto rounded-xl p-4 text-[13px] font-mono leading-relaxed"
      style={{ backgroundColor: "#191919", color: "#f0f0f0" }}
      {...stripNode(props)}
    />
  ),
  img: (props) => <img className="mb-4 w-full rounded-xl object-cover" {...stripNode(props)} />,
  hr: () => <hr className="my-6" style={{ border: "none", borderTop: "1px solid rgba(0,0,0,0.1)" }} />,
  table: (props) => <table className="mb-4 w-full border-collapse text-[13px]" {...stripNode(props)} />,
  th: (props) => (
    <th
      className="px-3 py-2 text-left font-semibold"
      style={{ border: "1px solid rgba(0,0,0,0.1)", backgroundColor: "#f8f9fa" }}
      {...stripNode(props)}
    />
  ),
  td: (props) => <td className="px-3 py-2" style={{ border: "1px solid rgba(0,0,0,0.1)" }} {...stripNode(props)} />,
};

export const MarkdownPreview = ({ content }: { content: string }) => (
  <div className="text-[14px] leading-relaxed" style={{ color: "#191919" }}>
    <ReactMarkdown remarkPlugins={[remarkGfm]} components={previewComponents}>
      {content.trim() ? content : "*Nothing to preview yet — start writing on the left.*"}
    </ReactMarkdown>
  </div>
);

type ViewMode = "write" | "split" | "preview";

interface ToolbarAction {
  icon: LucideIcon;
  title: string;
  action: () => void;
}

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  error?: string;
}

export const MarkdownEditor = ({ value, onChange, error }: MarkdownEditorProps) => {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [mode, setMode] = useState<ViewMode>("write");
  const [fullscreen, setFullscreen] = useState(false);

  const wordCount = useMemo(() => countWords(value), [value]);
  const readingTime = useMemo(() => estimateReadingTime(value), [value]);

  // Wraps the current selection with markdown syntax (bold/italic/etc.) —
  // falls back to a placeholder when nothing is selected, and re-selects the
  // inserted text afterwards so typing immediately replaces it.
  const applyWrap = (before: string, after: string, placeholder: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd } = textarea;
    const selected = value.slice(selectionStart, selectionEnd) || placeholder;
    const next = value.slice(0, selectionStart) + before + selected + after + value.slice(selectionEnd);
    onChange(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart + before.length, selectionStart + before.length + selected.length);
    });
  };

  // Prefixes the current line (headings, lists, quotes) rather than
  // wrapping a selection.
  const applyLinePrefix = (prefix: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart } = textarea;
    const lineStart = value.lastIndexOf("\n", selectionStart - 1) + 1;
    const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
    onChange(next);
    requestAnimationFrame(() => {
      textarea.focus();
      textarea.setSelectionRange(selectionStart + prefix.length, selectionStart + prefix.length);
    });
  };

  const insertAtCursor = (text: string) => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    const { selectionStart, selectionEnd } = textarea;
    const next = value.slice(0, selectionStart) + text + value.slice(selectionEnd);
    onChange(next);
    requestAnimationFrame(() => {
      textarea.focus();
      const cursor = selectionStart + text.length;
      textarea.setSelectionRange(cursor, cursor);
    });
  };

  const toolbarActions: ToolbarAction[] = [
    { icon: Bold, title: "Bold", action: () => applyWrap("**", "**", "bold text") },
    { icon: Italic, title: "Italic", action: () => applyWrap("_", "_", "italic text") },
    { icon: Strikethrough, title: "Strikethrough", action: () => applyWrap("~~", "~~", "strikethrough") },
    { icon: Heading1, title: "Heading 1", action: () => applyLinePrefix("# ") },
    { icon: Heading2, title: "Heading 2", action: () => applyLinePrefix("## ") },
    { icon: Heading3, title: "Heading 3", action: () => applyLinePrefix("### ") },
    { icon: List, title: "Bullet list", action: () => applyLinePrefix("- ") },
    { icon: ListOrdered, title: "Numbered list", action: () => applyLinePrefix("1. ") },
    { icon: Quote, title: "Quote", action: () => applyLinePrefix("> ") },
    { icon: Code, title: "Code block", action: () => applyWrap("```\n", "\n```", "code") },
    { icon: Link2, title: "Link", action: () => applyWrap("[", "](https://)", "link text") },
    { icon: ImageIcon, title: "Image", action: () => insertAtCursor("![alt text](https://)") },
    { icon: Minus, title: "Divider", action: () => insertAtCursor("\n\n---\n\n") },
  ];

  const viewTabs: { key: ViewMode; icon: LucideIcon; label: string }[] = [
    { key: "write", icon: Pencil, label: "Write" },
    { key: "split", icon: Columns2, label: "Split" },
    { key: "preview", icon: Eye, label: "Preview" },
  ];

  return (
    <div
      className={fullscreen ? "fixed inset-3 z-50 flex flex-col rounded-2xl bg-white shadow-2xl sm:inset-6" : "flex flex-1 flex-col rounded-2xl bg-white"}
      style={{ border: `1px solid ${error ? "#dc2626" : "rgba(0,0,0,0.07)"}` }}
    >
      <div className="flex flex-wrap items-center gap-1 px-2.5 py-2" style={{ borderBottom: "1px solid rgba(0,0,0,0.07)" }}>
        {/* eslint-disable-next-line react-hooks/refs -- each action only reads textareaRef.current inside its own onClick handler, never during render; the rule can't see that through the array literal. */}
        {toolbarActions.map(({ icon: Icon, title, action }) => (
          <button
            key={title}
            type="button"
            title={title}
            onClick={action}
            disabled={mode === "preview"}
            className="flex h-8 w-8 items-center justify-center rounded-lg transition-colors hover:bg-black/5 disabled:opacity-30"
            style={{ color: "rgba(0,0,0,0.6)" }}
          >
            <Icon size={15} />
          </button>
        ))}

        <div className="ml-auto flex items-center gap-1.5">
          <div className="flex items-center gap-0.5 rounded-lg p-0.5" style={{ backgroundColor: "#f0f0f0" }}>
            {viewTabs.map(({ key, icon: Icon, label }) => (
              <button
                key={key}
                type="button"
                onClick={() => setMode(key)}
                className="flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[12px] font-medium transition-colors"
                style={{
                  backgroundColor: mode === key ? "#fff" : "transparent",
                  color: mode === key ? "#002b7f" : "rgba(0,0,0,0.5)",
                  boxShadow: mode === key ? "0 1px 2px rgba(0,0,0,0.08)" : "none",
                }}
              >
                <Icon size={13} />
                <span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          <button
            type="button"
            title={fullscreen ? "Exit fullscreen" : "Fullscreen"}
            onClick={() => setFullscreen((f) => !f)}
            className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"
            style={{ color: "rgba(0,0,0,0.6)" }}
          >
            {fullscreen ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
          </button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden" style={{ minHeight: fullscreen ? 0 : 420 }}>
        {(mode === "write" || mode === "split") && (
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder="Write your blog in Markdown…"
            spellCheck
            className="flex-1 resize-none px-5 py-4 text-[14px] leading-relaxed outline-none font-mono"
            style={{ color: "#191919" }}
          />
        )}
        {mode === "split" && <div style={{ borderLeft: "1px solid rgba(0,0,0,0.07)" }} />}
        {(mode === "preview" || mode === "split") && (
          <div className="flex-1 overflow-y-auto px-5 py-4">
            <MarkdownPreview content={value} />
          </div>
        )}
      </div>

      <div
        className="flex items-center justify-between px-4 py-2 text-[11.5px]"
        style={{ borderTop: "1px solid rgba(0,0,0,0.07)", color: "rgba(0,0,0,0.4)" }}
      >
        <span>Markdown supported</span>
        <span>
          {wordCount} words · ~{readingTime} min read
        </span>
      </div>
    </div>
  );
};
