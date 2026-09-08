import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { FileText, Upload, X } from "lucide-react";

interface FileUploadProps {
  label?: string;
  file: File | null;
  onChange: (file: File | null) => void;
  accept?: Record<string, string[]>;
  className?: string;
}

const DEFAULT_ACCEPT = {
  "image/jpeg": [],
  "image/png": [],
  "image/webp": [],
  "application/pdf": [],
};

// Generic single-file dropzone for non-image attachments (e.g. an offline
// payment's proof of transfer) — shows the filename rather than an image
// preview, since the file may be a PDF.
export const FileUpload = ({ label, file, onChange, accept = DEFAULT_ACCEPT, className }: FileUploadProps) => {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onChange(accepted[0]);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept,
    maxFiles: 1,
    multiple: false,
  });

  return (
    <div className={className}>
      {label && (
        <label className="mb-1.5 block text-[13px] font-medium" style={{ color: "#191919" }}>
          {label}
        </label>
      )}
      <div
        {...getRootProps()}
        className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3.5 text-left"
        style={{
          backgroundColor: "#f0f0f0",
          border: `1.5px dashed ${isDragActive ? "#002b7f" : "rgba(0,0,0,0.15)"}`,
        }}
      >
        <input {...getInputProps()} />
        {file ? (
          <>
            <FileText size={18} style={{ color: "#002b7f" }} />
            <span className="flex-1 truncate text-[13px]" style={{ color: "#191919" }}>
              {file.name}
            </span>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="flex h-6 w-6 items-center justify-center rounded-full bg-white shadow"
            >
              <X size={12} />
            </button>
          </>
        ) : (
          <>
            <Upload size={18} style={{ color: "rgba(0,0,0,0.4)" }} />
            <span className="text-[13px]" style={{ color: "rgba(0,0,0,0.45)" }}>
              Drag &amp; drop, or click to upload (image or PDF)
            </span>
          </>
        )}
      </div>
    </div>
  );
};
