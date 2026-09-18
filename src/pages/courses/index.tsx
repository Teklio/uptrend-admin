import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2, FolderOpen, Eye } from "lucide-react";
import { useDeleteCourse, useGetCourses, useToggleCoursePublish } from "../../services/course.service";
import { useSearchDebounce } from "../../hooks/useSearchDebounce";
import { Table, type TableField } from "../../components/shared/Table";
import { TablePagination } from "../../components/shared/TablePagination";
import { TableFilters } from "../../components/shared/TableFilters";
import { SearchInput } from "../../components/shared/SearchInput";
import { DropdownSelect } from "../../components/shared/Dropdown";
import { DateRangeFilter } from "../../components/shared/DateRangeFilter";
import { Toggle } from "../../components/shared/Toggle";
import { Modal } from "../../components/shared/Modal";
import { DeleteConfirmModal } from "../../components/shared/DeleteConfirmModal";
import { CourseSheet } from "../../components/courses/CourseSheet";
import { CourseViewSheet } from "../../components/courses/CourseViewSheet";
import { formatCurrency, formatDate } from "../../utils/format.util";
import { toastMessage } from "../../utils/toast.util";
import { COURSE_LANGUAGE_OPTIONS } from "../../utils/language.util";
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
  { key: "actions", label: "Actions", className: "text-right" },
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
  const [publishTarget, setPublishTarget] = useState<Course | null>(null);
  const [courseToView, setCourseToView] = useState<Course | null>(null);

  // Reset to page 1 whenever the search term settles on a new value —
  // during render (React's documented pattern for this), not an effect,
  // so it takes effect before the now-stale page is ever fetched. Otherwise
  // a search while sitting on page 3+ keeps requesting page 3 of the new,
  // smaller result set — showing "no results" even when matches exist on
  // page 1.
  const [prevDebouncedSearch, setPrevDebouncedSearch] = useState(debouncedSearch);
  if (debouncedSearch !== prevDebouncedSearch) {
    setPrevDebouncedSearch(debouncedSearch);
    setPage(1);
  }

  const filters: CourseListFilters = {
    ...appliedFilters,
    page,
    limit,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, error } = useGetCourses(filters);
  const { mutate: deleteCourse, isPending: isDeleting } = useDeleteCourse();
  const { mutate: togglePublish, isPending: isTogglingPublish } = useToggleCoursePublish();

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

  const handleTogglePublish = () => {
    if (!publishTarget) return;
    const nextPublished = !publishTarget.isPublished;
    togglePublish(
      { courseId: publishTarget.id, isPublished: nextPublished },
      {
        onSuccess: () => {
          toastMessage.success({ message: nextPublished ? "Course published" : "Course unpublished" });
          setPublishTarget(null);
        },
        onError: (err) => toastMessage.apiError(err),
      },
    );
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
          className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#0f172a]"
          style={{ backgroundColor: "#f5a300" }}
        >
          <Plus size={16} />
          Add course
        </button>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <SearchInput value={search} onChange={setSearch} placeholder="Search courses..." className="sm:max-w-xs" />
      </div>

      <TableFilters onApply={applyFilters} onReset={resetFilters} hasActiveFilters={hasActiveFilters}>
        <DropdownSelect
          options={COURSE_LANGUAGE_OPTIONS}
          value={draftLanguage}
          onChange={setDraftLanguage}
          placeholder="All language"
        />
        <DropdownSelect
          options={PUBLISHED_OPTIONS}
          value={draftIsPublished}
          onChange={setDraftIsPublished}
          placeholder="All status"
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
          fromPlaceholder="Created from"
          toPlaceholder="Created to"
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
              <div className="flex items-center gap-2">
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
            <td className="px-4 py-3">
              {COURSE_LANGUAGE_OPTIONS.find((o) => o.value === course.language)?.label ?? course.language ?? "—"}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2 font-mono">
                <span style={{ color: "#191919" }}>{formatCurrency(course.price)}</span>
                {Number(course.actualPrice) > Number(course.price) && (
                  <span className="text-[12px] line-through" style={{ color: "rgba(0,0,0,0.35)" }}>
                    {formatCurrency(course.actualPrice)}
                  </span>
                )}
              </div>
              {Number(course.extraFee) > 0 && (
                <p className="mt-0.5 text-[11px]" style={{ color: "rgba(0,0,0,0.4)" }}>
                  + {formatCurrency(course.extraFee)} fee
                </p>
              )}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Toggle checked={course.isPublished} onClick={() => setPublishTarget(course)} />
                <span
                  className="text-[12.5px] font-medium"
                  style={{ color: course.isPublished ? "#16a34a" : "rgba(0,0,0,0.45)" }}
                >
                  {course.isPublished ? "Published" : "Draft"}
                </span>
              </div>
            </td>
            <td className="px-4 py-3">{course._count?.modules ?? 0}</td>
            <td className="px-4 py-3" style={{ color: "rgba(0,0,0,0.5)" }}>
              {formatDate(course.createdAt)}
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center justify-end gap-1.5">
                <button
                  type="button"
                  title="View"
                  onClick={() => setCourseToView(course)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"
                  style={{ color: "#002b7f" }}
                >
                  <Eye size={15} />
                </button>
                <button
                  type="button"
                  title="Manage content"
                  onClick={() => navigate(`/courses/${course.id}`)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5"
                  style={{ color: "#002b7f" }}
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

      <CourseViewSheet open={!!courseToView} onClose={() => setCourseToView(null)} course={courseToView} />

      <DeleteConfirmModal
        isOpen={!!courseToDelete}
        onClose={() => setCourseToDelete(null)}
        onConfirm={handleDelete}
        isDeleting={isDeleting}
        title="Delete this course?"
        description="This cannot be undone. Courses with existing payments can't be deleted — unpublish them instead."
      />

      <Modal
        open={!!publishTarget}
        onClose={() => setPublishTarget(null)}
        title={publishTarget?.isPublished ? "Unpublish this course?" : "Publish this course?"}
      >
        <p className="mb-5 text-[13px]" style={{ color: "rgba(0,0,0,0.5)" }}>
          {publishTarget?.isPublished
            ? "It will disappear from the website and can't be purchased anymore. Students who already own it keep their access."
            : "It will become visible on the website and available for purchase."}
        </p>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setPublishTarget(null)}
            className="rounded-xl px-4 py-2.5 text-[13px] font-semibold"
            style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleTogglePublish}
            disabled={isTogglingPublish}
            className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: publishTarget?.isPublished ? "#dc2626" : "#16a34a" }}
          >
            {isTogglingPublish ? "Saving..." : publishTarget?.isPublished ? "Unpublish" : "Publish"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default CoursesPage;
