import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, X } from "lucide-react";

interface ImageUploadProps {
  label?: string;
  previewUrl?: string | null;
  onChange: (file: File | null) => void;
  className?: string;
}

export const ImageUpload = ({ label, previewUrl, onChange, className }: ImageUploadProps) => {
  const onDrop = useCallback(
    (accepted: File[]) => {
      if (accepted[0]) onChange(accepted[0]);
    },
    [onChange],
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
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
        className="relative flex h-36 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl text-center"
        style={{
          backgroundColor: "#f0f0f0",
          border: `1.5px dashed ${isDragActive ? "#7e14ff" : "rgba(0,0,0,0.15)"}`,
        }}
      >
        <input {...getInputProps()} />
        {previewUrl ? (
          <>
            <img src={previewUrl} alt="Preview" className="absolute inset-0 h-full w-full rounded-xl object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onChange(null);
              }}
              className="absolute right-2 top-2 flex h-7 w-7 items-center justify-center rounded-full bg-white shadow"
            >
              <X size={14} />
            </button>
          </>
        ) : (
          <>
            <ImagePlus size={22} style={{ color: "rgba(0,0,0,0.4)" }} />
            <span className="text-[12px]" style={{ color: "rgba(0,0,0,0.45)" }}>
              Drag &amp; drop, or click to upload
            </span>
          </>
        )}
      </div>
    </div>
  );
};
