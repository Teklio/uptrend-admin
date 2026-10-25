import { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { ImagePlus, Trash2 } from "lucide-react";
import { useDeleteBlogImage, useUploadBlogImage } from "../../services/blog.service";
import { ImageConfirmModal } from "../shared/ImageConfirmModal";
import { DeleteConfirmModal } from "../shared/DeleteConfirmModal";
import { toastMessage } from "../../utils/toast.util";

interface BlogImageManagerProps {
  blogId: string;
  currentUrl: string | null;
}

// Independent of the rest of the blog form — picking or removing the cover
// image here uploads/deletes immediately via its own API call, rather than
// staging a file to be bundled into the next "Save" submit.
export const BlogImageManager = ({ blogId, currentUrl }: BlogImageManagerProps) => {
  const [pendingFile, setPendingFile] = useState<File | null>(null);
  const [pendingPreview, setPendingPreview] = useState<string | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { mutate: uploadImage, isPending: isUploading } = useUploadBlogImage();
  const { mutate: deleteImage, isPending: isDeleting } = useDeleteBlogImage();

  const onDrop = useCallback((accepted: File[]) => {
    const file = accepted[0];
    if (!file) return;
    setPendingFile(file);
    setPendingPreview(URL.createObjectURL(file));
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "image/jpeg": [], "image/png": [], "image/webp": [] },
    maxFiles: 1,
    multiple: false,
  });

  const cancelUpload = () => {
    if (isUploading) return;
    setPendingFile(null);
    setPendingPreview(null);
  };

  const confirmUpload = () => {
    if (!pendingFile) return;
    uploadImage(
      { blogId, file: pendingFile },
      {
        onSuccess: () => {
          toastMessage.success({ message: "Cover image updated successfully" });
          setPendingFile(null);
          setPendingPreview(null);
        },
        onError: (err) => toastMessage.apiError(err),
      },
    );
  };

  const confirmDelete = () => {
    deleteImage(blogId, {
      onSuccess: () => {
        toastMessage.success({ message: "Cover image deleted successfully" });
        setDeleteConfirmOpen(false);
      },
      onError: (err) => toastMessage.apiError(err),
    });
  };

  return (
    <div>
      <label className="mb-1.5 block text-[13px] font-medium" style={{ color: "#191919" }}>
        Cover image
      </label>
      <div
        {...getRootProps()}
        className="relative flex h-44 cursor-pointer flex-col items-center justify-center gap-2 rounded-xl text-center"
        style={{
          backgroundColor: "#f0f0f0",
          border: `1.5px dashed ${isDragActive ? "#002b7f" : "rgba(0,0,0,0.15)"}`,
        }}
      >
        <input {...getInputProps()} />
        {currentUrl ? (
          <>
            <img src={currentUrl} alt="" className="absolute inset-0 h-full w-full rounded-xl object-cover" />
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setDeleteConfirmOpen(true);
              }}
              className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-white shadow"
            >
              <Trash2 size={14} color="#dc2626" />
            </button>
          </>
        ) : (
          <>
            <ImagePlus size={24} style={{ color: "rgba(0,0,0,0.4)" }} />
            <span className="text-[12.5px]" style={{ color: "rgba(0,0,0,0.45)" }}>
              Drag &amp; drop, or click to upload a cover image
            </span>
          </>
        )}
      </div>

      <ImageConfirmModal
        open={!!pendingPreview}
        previewUrl={pendingPreview}
        title="Update cover image"
        description={
          currentUrl ? "This will replace the current cover image immediately." : "This will be uploaded immediately."
        }
        isUploading={isUploading}
        onCancel={cancelUpload}
        onConfirm={confirmUpload}
      />

      <DeleteConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => setDeleteConfirmOpen(false)}
        onConfirm={confirmDelete}
        isDeleting={isDeleting}
        title="Delete cover image?"
        description="This will be removed immediately. This cannot be undone."
      />
    </div>
  );
};
