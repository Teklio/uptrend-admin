import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, Clock } from "lucide-react";
import { useDeleteBlog, useGetBlogs } from "../../services/blog.service";
import { useSearchDebounce } from "../../hooks/useSearchDebounce";
import { Table, type TableField } from "../../components/shared/Table";
import { TablePagination } from "../../components/shared/TablePagination";
import { SearchInput } from "../../components/shared/SearchInput";
import { DropdownSelect } from "../../components/shared/Dropdown";
import { DeleteConfirmModal } from "../../components/shared/DeleteConfirmModal";
import { formatDate } from "../../utils/format.util";
import { toastMessage } from "../../utils/toast.util";
import type { Blog, BlogListFilters } from "../../types/blog.type";

const SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Oldest first", value: "oldest" },
];

const FIELDS: TableField[] = [
  { key: "blog", label: "Blog" },
  { key: "readingTime", label: "Reading time" },
  { key: "date", label: "Created" },
  { key: "actions", label: "Actions", className: "text-right" },
];

const BlogsPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const debouncedSearch = useSearchDebounce(search);
  const [sort, setSort] = useState<string | undefined>("newest");
  const [blogToDelete, setBlogToDelete] = useState<Blog | null>(null);

  // Reset to page 1 whenever the search term settles on a new value — done
  // during render, not an effect, so it takes effect before the now-stale
  // page is fetched. See CoursesPage for the same pattern.
  const [prevDebouncedSearch, setPrevDebouncedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== prevDebouncedSearch) {
    setPrevDebouncedSearch(debouncedSearch);
    setPage(1);
  }

  const filters: BlogListFilters = {
    page,
    limit,
    search: debouncedSearch || undefined,
    sort: (sort as BlogListFilters["sort"]) ?? "newest",
  };

  const { data, isLoading, error } = useGetBlogs(filters);
  const { mutate: deleteBlog, isPending: isDeleting } = useDeleteBlog();

  const handleDelete = () => {
    if (!blogToDelete) return;
    deleteBlog(blogToDelete.id, {
      onSuccess: () => {
        toastMessage.success({ message: "Blog deleted successfully" });
        setBlogToDelete(null);
      },
      onError: (err) => toastMessage.apiError(err),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-semibold" style={{ color: "#191919" }}>
          Blogs
        </h1>
        <button
          type="button"
          onClick={() => navigate("/blogs/new")}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#0f172a]"
          style={{ backgroundColor: "#f5a300" }}
        >
          <Plus size={16} />
          Write blog
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search blogs..." className="sm:max-w-xs" />
        <DropdownSelect options={SORT_OPTIONS} value={sort} onChange={setSort} clearable={false} className="sm:w-48" />
      </div>

      <Table
        fields={FIELDS}
        data={data?.items}
        isLoading={isLoading}
        error={error}
        keyExtractor={(b) => b.id}
        emptyMessage="No blogs yet"
        formatRow={(blog) => (
          <>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                {blog.imageUrl ? (
                  <img src={blog.imageUrl} alt="" className="h-10 w-14 rounded-lg object-cover" />
                ) : (
                  <div className="h-10 w-14 rounded-lg" style={{ backgroundColor: "rgba(0,0,0,0.06)" }} />
                )}
                <p className="max-w-md truncate font-medium" style={{ color: "#191919" }}>
                  {blog.title}
                </p>
              </div>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-1.5" style={{ color: "rgba(0,0,0,0.5)" }}>
                <Clock size={13} />
                {blog.readingTime} min read
              </div>
            </td>
            <td className="px-4 py-3" style={{ color: "rgba(0,0,0,0.5)" }}>
              {formatDate(blog.createdAt)}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  title="Edit"
                  onClick={() => navigate(`/blogs/${blog.id}`)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"
                  style={{ color: "#002b7f" }}
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  title="Delete"
                  onClick={() => setBlogToDelete(blog)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"
                  style={{ color: "#dc2626" }}
                >
                  <Trash2 size={15} />
                </button>
              </div>
            </td>
          </>
        )}
      />

      <TablePagination
        meta={data?.pagination}
        onPageChange={setPage}
        onLimitChange={(l) => {
          setLimit(l);
          setPage(1);
        }}
        isLoading={isLoading}
      />

      <DeleteConfirmModal
        isOpen={!!blogToDelete}
        onClose={() => setBlogToDelete(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Delete this blog?"
        description="This cannot be undone. Its cover image will be removed too."
      />
    </div>
  );
};

export default BlogsPage;
