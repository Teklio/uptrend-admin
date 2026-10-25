import { useEffect, useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { useBlocker, useNavigate, useParams } from "react-router-dom";
import { zodResolver } from "@hookform/resolvers/zod";
import { ArrowLeft, Trash2 } from "lucide-react";
import { blogFormSchema, type BlogFormSchemaType } from "../../schemas/blog.schema";
import {
  useAddBlog,
  useDeleteBlog,
  useGetBlog,
  useUpdateBlog,
  useUploadBlogImage,
} from "../../services/blog.service";
import { MarkdownEditor } from "../../components/blogs/MarkdownEditor";
import { estimateReadingTime } from "../../utils/markdown.util";
import { BlogImageManager } from "../../components/blogs/BlogImageManager";
import { ImageUpload } from "../../components/shared/ImageUpload";
import { DeleteConfirmModal } from "../../components/shared/DeleteConfirmModal";
import { DiscardChangesModal } from "../../components/shared/DiscardChangesModal";
import { MainLayoutShimmer } from "../../components/shared/Shimmer";
import { toastMessage } from "../../utils/toast.util";
import { formatDateTime } from "../../utils/format.util";
import type { Blog } from "../../types/blog.type";

const BlogEditorPage = () => {
  const { blogId } = useParams<{ blogId: string }>();
  const isEdit = !!blogId;
  const { data: blog, isLoading } = useGetBlog(blogId);

  if (isEdit && (isLoading || !blog)) {
    return <MainLayoutShimmer />;
  }

  return <BlogEditorForm key={blog?.id ?? "new"} blog={blog ?? null} />;
};

interface BlogEditorFormProps {
  blog: Blog | null;
}

const BlogEditorForm = ({ blog }: BlogEditorFormProps) => {
  const isEdit = !!blog;
  const navigate = useNavigate();

  const { mutate: addBlog, isPending: isAdding } = useAddBlog();
  const { mutate: updateBlog, isPending: isUpdating } = useUpdateBlog();
  const { mutate: deleteBlog, isPending: isDeleting } = useDeleteBlog();
  const { mutate: uploadImage } = useUploadBlogImage();

  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [autoReadingTime, setAutoReadingTime] = useState(!isEdit);

  // Only used in create mode — edit mode swaps to BlogImageManager, which
  // uploads/deletes immediately against the now-real blog id instead of
  // staging a file for the next submit.
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);

  const form = useForm<BlogFormSchemaType>({
    resolver: zodResolver(blogFormSchema),
    defaultValues: blog
      ? { title: blog.title, description: blog.description, readingTime: blog.readingTime }
      : { title: "", description: "", readingTime: 1 },
  });

  const isPending = isAdding || isUpdating;
  const hasChanges = form.formState.isDirty || (!isEdit && !!coverFile);

  // useBlocker's function form (same technique as MainLayout's upload
  // blocker) reads these refs at the moment of each navigation attempt,
  // rather than closing over a boolean from the last render — so the
  // programmatic redirects below (right after a successful save/delete) can
  // flip `skipBlockRef` synchronously and reliably skip the prompt, instead
  // of racing React's render/effect cycle to see a freshly-reset form.
  const hasChangesRef = useRef(hasChanges);
  useEffect(() => {
    hasChangesRef.current = hasChanges;
  }, [hasChanges]);
  const skipBlockRef = useRef(false);

  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    if (skipBlockRef.current || currentLocation.pathname === nextLocation.pathname) return false;
    return hasChangesRef.current;
  });

  const onSubmit = (values: BlogFormSchemaType) => {
    const onError = (err: unknown) => toastMessage.apiError(err);

    if (isEdit && blog) {
      updateBlog(
        { blogId: blog.id, values },
        {
          onSuccess: () => {
            toastMessage.success({ message: "Blog saved successfully" });
            form.reset(values);
          },
          onError,
        },
      );
    } else {
      addBlog(values, {
        onSuccess: (newBlog) => {
          if (coverFile) {
            uploadImage({ blogId: newBlog.id, file: coverFile }, { onError });
          }
          toastMessage.success({ message: "Blog created successfully" });
          skipBlockRef.current = true;
          navigate(`/blogs/${newBlog.id}`, { replace: true });
        },
        onError,
      });
    }
  };

  const handleDelete = () => {
    if (!blog) return;
    deleteBlog(blog.id, {
      onSuccess: () => {
        toastMessage.success({ message: "Blog deleted successfully" });
        skipBlockRef.current = true;
        navigate("/blogs", { replace: true });
      },
      onError: (err) => toastMessage.apiError(err),
    });
  };

  return (
    // eslint-disable-next-line react-hooks/refs -- onSubmit only writes skipBlockRef.current inside its own mutation callbacks, never during render; the rule can't see that through handleSubmit's wrapping.
    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          type="button"
          onClick={() => navigate("/blogs")}
          className="flex items-center gap-2 text-[13px] font-semibold"
          style={{ color: "rgba(0,0,0,0.6)" }}
        >
          <ArrowLeft size={16} />
          Back to blogs
        </button>

        <div className="flex items-center gap-2.5">
          {isEdit && (
            <button
              type="button"
              onClick={() => setDeleteConfirmOpen(true)}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold"
              style={{ backgroundColor: "rgba(220,38,38,0.08)", color: "#dc2626" }}
            >
              <Trash2 size={15} />
              Delete
            </button>
          )}
          <button
            type="submit"
            disabled={isPending || !hasChanges}
            className="rounded-xl px-5 py-2.5 text-[13px] font-semibold text-[#0f172a] disabled:opacity-60"
            style={{ backgroundColor: "#f5a300" }}
          >
            {isPending ? "Saving..." : isEdit ? "Save changes" : "Publish blog"}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-[1fr_300px] lg:items-start">
        <div className="flex flex-1 flex-col gap-4 rounded-2xl bg-white p-5" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
          <Controller
            name="title"
            control={form.control}
            render={({ field, fieldState }) => (
              <div>
                <input
                  {...field}
                  placeholder="Blog title"
                  className="w-full border-none bg-transparent text-[26px] font-bold outline-none placeholder:text-black/25"
                  style={{ color: "#191919" }}
                />
                {fieldState.error && (
                  <span className="text-[12px]" style={{ color: "#dc2626" }}>
                    {fieldState.error.message}
                  </span>
                )}
              </div>
            )}
          />

          <Controller
            name="description"
            control={form.control}
            render={({ field, fieldState }) => (
              <MarkdownEditor
                value={field.value}
                onChange={(next) => {
                  field.onChange(next);
                  if (autoReadingTime) {
                    form.setValue("readingTime", estimateReadingTime(next), { shouldDirty: true });
                  }
                }}
                error={fieldState.error?.message}
              />
            )}
          />
        </div>

        <div className="flex flex-col gap-5">
          {isEdit && blog ? (
            <BlogImageManager blogId={blog.id} currentUrl={blog.imageUrl} />
          ) : (
            <ImageUpload
              label="Cover image"
              previewUrl={coverPreview}
              onChange={(f) => {
                setCoverFile(f);
                setCoverPreview(f ? URL.createObjectURL(f) : null);
              }}
            />
          )}

          <Controller
            name="readingTime"
            control={form.control}
            render={({ field, fieldState }) => (
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[13px] font-medium" style={{ color: "#191919" }}>
                    Reading time (minutes)
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      const estimate = estimateReadingTime(form.getValues("description"));
                      field.onChange(estimate);
                      form.setValue("readingTime", estimate, { shouldDirty: true });
                      setAutoReadingTime(true);
                    }}
                    className="text-[11.5px] font-semibold"
                    style={{ color: "#002b7f" }}
                  >
                    Auto-calculate
                  </button>
                </div>
                <input
                  type="number"
                  min={1}
                  value={Number.isNaN(field.value) ? "" : field.value}
                  onChange={(e) => {
                    field.onChange(e.target.valueAsNumber);
                    setAutoReadingTime(false);
                  }}
                  className="w-full rounded-xl px-3.5 py-2.5 text-[14px] outline-none transition-colors focus:ring-2 focus:ring-[#002b7f]/15"
                  style={{
                    backgroundColor: "#f0f0f0",
                    border: `1px solid ${fieldState.error ? "#dc2626" : "rgba(0,0,0,0.07)"}`,
                  }}
                />
                {fieldState.error && (
                  <span className="text-[12px]" style={{ color: "#dc2626" }}>
                    {fieldState.error.message}
                  </span>
                )}
              </div>
            )}
          />

          {isEdit && blog && (
            <div className="flex flex-col gap-2 rounded-2xl p-4 text-[12.5px]" style={{ backgroundColor: "#f8f9fa" }}>
              <div className="flex justify-between">
                <span style={{ color: "rgba(0,0,0,0.45)" }}>Created</span>
                <span style={{ color: "#191919" }}>{formatDateTime(blog.createdAt)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "rgba(0,0,0,0.45)" }}>Last updated</span>
                <span style={{ color: "#191919" }}>{formatDateTime(blog.updatedAt)}</span>
              </div>
            </div>
          )}
        </div>
      </div>

      <DiscardChangesModal
        open={blocker.state === "blocked"}
        onCancel={() => blocker.reset?.()}
        onConfirm={() => blocker.proceed?.()}
      />

      {isEdit && (
        <DeleteConfirmModal
          isOpen={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
          onConfirm={handleDelete}
          isDeleting={isDeleting}
          title="Delete this blog?"
          description="This cannot be undone. Its cover image will be removed too."
        />
      )}
    </form>
  );
};

export default BlogEditorPage;
