import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, FolderOpen } from "lucide-react";
import { useDeleteCourse, useGetCourses } from "../../services/course.service";
import { useSearchDebounce } from "../../hooks/useSearchDebounce";
import { Table, type TableField } from "../../components/shared/Table";
import { TablePagination } from "../../components/shared/TablePagination";
import { TableFilters } from "../../components/shared/TableFilters";
import { SearchInput } from "../../components/shared/SearchInput";
import { DropdownSelect } from "../../components/shared/Dropdown";
import { DateRangeFilter } from "../../components/shared/DateRangeFilter";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { DeleteConfirmModal } from "../../components/shared/DeleteConfirmModal";
import { CourseSheet } from "../../components/courses/CourseSheet";
import { formatCurrency, formatDate } from "../../utils/format.util";
import { toastMessage } from "../../utils/toast.util";
import type { Course, CourseListFilters } from "../../types/course.type";

type SheetState = { open: false } | { open: true; mode: "add" } | { open: true; mode: "edit"; course: Course };

const SORT_OPTIONS = [
  { label: "Newest first", value: "newest" },
  { label: "Price: low to high", value: "price_asc" },
  { label: "Price: high to low", value: "price_desc" },
];

const PUBLISHED_OPTIONS = [
  { label: "Published", value: "true" },
  { label: "Draft", value: "false" },
];

const FIELDS: TableField[] = [
  { key: "course", label: "Course" },
  { key: "language", label: "Language" },
  { key: "price", label: "Price" },
  { key: "status", label: "Status" },
  { key: "modules", label: "Modules" },
  { key: "date", label: "Created" },
  { key: "actions", label: "" },
];

const CoursesPage = () => {
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const debouncedSearch = useSearchDebounce(search);

  const [draftLanguage, setDraftLanguage] = useState<string | undefined>();
  const [draftIsPublished, setDraftIsPublished] = useState<string | undefined>();
  const [draftMinPrice, setDraftMinPrice] = useState("");
  const [draftMaxPrice, setDraftMaxPrice] = useState("");
  const [draftDateFrom, setDraftDateFrom] = useState<Date | null>(null);
  const [draftDateTo, setDraftDateTo] = useState<Date | null>(null);
  const [draftSort, setDraftSort] = useState<string | undefined>("newest");

  const [appliedFilters, setAppliedFilters] = useState<CourseListFilters>({ sort: "newest" });

  const [sheetState, setSheetState] = useState<SheetState>({ open: false });
  const [courseToDelete, setCourseToDelete] = useState<Course | null>(null);

  const filters: CourseListFilters = {
    ...appliedFilters,
    page,
    limit,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, error } = useGetCourses(filters);
  const { mutate: deleteCourse, isPending: isDeleting } = useDeleteCourse();

  const applyFilters = () => {
    setAppliedFilters({
      language: draftLanguage,
      isPublished: draftIsPublished === undefined ? undefined : draftIsPublished === "true",
      minPrice: draftMinPrice ? Number(draftMinPrice) : undefined,
      maxPrice: draftMaxPrice ? Number(draftMaxPrice) : undefined,
      dateFrom: draftDateFrom ? draftDateFrom.toISOString() : undefined,
      dateTo: draftDateTo ? draftDateTo.toISOString() : undefined,
      sort: (draftSort as CourseListFilters["sort"]) ?? "newest",
    });
    setPage(1);
  };

  const resetFilters = () => {
    setDraftLanguage(undefined);
    setDraftIsPublished(undefined);
    setDraftMinPrice("");
    setDraftMaxPrice("");
    setDraftDateFrom(null);
    setDraftDateTo(null);
    setDraftSort("newest");
    setAppliedFilters({ sort: "newest" });
    setPage(1);
  };

  const hasActiveFilters =
    !!appliedFilters.language ||
    appliedFilters.isPublished !== undefined ||
    appliedFilters.minPrice !== undefined ||
    appliedFilters.maxPrice !== undefined ||
    !!appliedFilters.dateFrom;

  const handleDelete = () => {
    if (!courseToDelete) return;
    deleteCourse(courseToDelete.id, {
      onSuccess: () => {
        toastMessage.success({ message: "Course deleted successfully" });
        setCourseToDelete(null);
      },
      onError: (err) => toastMessage.apiError(err),
    });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-semibold" style={{ color: "#191919" }}>
          Courses
        </h1>
        <button
          type="button"
          onClick={() => setSheetState({ open: true, mode: "add" })}
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white"
          style={{ backgroundColor: "#7e14ff" }}
        >
          <Plus size={16} />
          Add course
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search courses..." className="sm:max-w-xs" />
      </div>

      <TableFilters onApply={applyFilters} onReset={resetFilters} hasActiveFilters={hasActiveFilters}>
        <input
          value={draftLanguage ?? ""}
          onChange={(e) => setDraftLanguage(e.target.value || undefined)}
          placeholder="Language"
          className="rounded-xl px-3.5 py-2.5 text-[14px] outline-none"
          style={{ backgroundColor: "#f0f0f0", border: "1px solid rgba(0,0,0,0.07)" }}
        />
        <DropdownSelect
          options={PUBLISHED_OPTIONS}
          value={draftIsPublished}
          onChange={setDraftIsPublished}
          placeholder="Any status"
        />
        <div className="flex gap-2">
          <input
            value={draftMinPrice}
            onChange={(e) => setDraftMinPrice(e.target.value)}
            placeholder="Min price"
            type="number"
            className="w-full rounded-xl px-3.5 py-2.5 text-[14px] outline-none"
            style={{ backgroundColor: "#f0f0f0", border: "1px solid rgba(0,0,0,0.07)" }}
          />
          <input
            value={draftMaxPrice}
            onChange={(e) => setDraftMaxPrice(e.target.value)}
            placeholder="Max price"
            type="number"
            className="w-full rounded-xl px-3.5 py-2.5 text-[14px] outline-none"
            style={{ backgroundColor: "#f0f0f0", border: "1px solid rgba(0,0,0,0.07)" }}
          />
        </div>
        <DropdownSelect options={SORT_OPTIONS} value={draftSort} onChange={setDraftSort} clearable={false} />
        <DateRangeFilter
          from={draftDateFrom}
          to={draftDateTo}
          onChange={({ from, to }) => {
            setDraftDateFrom(from);
            setDraftDateTo(to);
          }}
          className="sm:col-span-2"
        />
      </TableFilters>

      <Table
        fields={FIELDS}
        data={data?.items}
        isLoading={isLoading}
        error={error}
        keyExtractor={(c) => c.id}
        emptyMessage="No courses yet"
        formatRow={(course) => (
          <>
            <td className="px-4 py-3">
              <div className="flex items-center gap-3">
                {course.primaryImageUrl ? (
                  <img src={course.primaryImageUrl} alt="" className="h-10 w-10 rounded-lg object-cover" />
                ) : (
                  <div className="h-10 w-10 rounded-lg" style={{ backgroundColor: "rgba(0,0,0,0.06)" }} />
                )}
                <div className="min-w-0">
                  <p className="truncate font-medium" style={{ color: "#191919" }}>
                    {course.name}
                  </p>
                  <p className="truncate text-[12px]" style={{ color: "rgba(0,0,0,0.4)" }}>
                    {course.mentorName || "—"}
                  </p>
                </div>
              </div>
            </td>
            <td className="px-4 py-3">{course.language || "—"}</td>
            <td className="px-4 py-3 font-mono">{formatCurrency(course.price)}</td>
            <td className="px-4 py-3">
              <StatusBadge
                label={course.isPublished ? "Published" : "Draft"}
                variant={course.isPublished ? "success" : "neutral"}
              />
            </td>
            <td className="px-4 py-3">{course._count?.modules ?? 0}</td>
            <td className="px-4 py-3" style={{ color: "rgba(0,0,0,0.5)" }}>
              {formatDate(course.createdAt)}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  title="Manage content"
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"
                  style={{ color: "#7e14ff" }}
                >
                  <FolderOpen size={16} />
                </button>
                <button
                  type="button"
                  title="Edit"
                  onClick={() => setSheetState({ open: true, mode: "edit", course })}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"
                  style={{ color: "rgba(0,0,0,0.55)" }}
                >
                  <Pencil size={15} />
                </button>
                <button
                  type="button"
                  title="Delete"
                  onClick={() => setCourseToDelete(course)}
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

      <CourseSheet
        open={sheetState.open}
        onClose={() => setSheetState({ open: false })}
        course={sheetState.open && sheetState.mode === "edit" ? sheetState.course : null}
      />

      <DeleteConfirmModal
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Delete this course?"
        description="This cannot be undone. Courses with existing payments can't be deleted — unpublish them instead."
      />
    </div>
  );
};

export default CoursesPage;
