import { useState } from "react";
import { Star } from "lucide-react";
import { useGetReviews, useUpdateReviewVisibility } from "../../services/review.service";
import { useSearchDebounce } from "../../hooks/useSearchDebounce";
import { searchCourses, searchStudents } from "../../utils/comboboxSearch.util";
import { Table, type TableField } from "../../components/shared/Table";
import { TablePagination } from "../../components/shared/TablePagination";
import { TableFilters } from "../../components/shared/TableFilters";
import { SearchInput } from "../../components/shared/SearchInput";
import { DropdownSelect } from "../../components/shared/Dropdown";
import { AsyncCombobox, type ComboboxOptionData } from "../../components/shared/AsyncCombobox";
import { Toggle } from "../../components/shared/Toggle";
import { Modal } from "../../components/shared/Modal";
import { formatDate } from "../../utils/format.util";
import { toastMessage } from "../../utils/toast.util";
import type { Review, ReviewListFilters } from "../../types/review.type";

const RATING_OPTIONS = [1, 2, 3, 4, 5].map((r) => ({ label: `${r} star${r > 1 ? "s" : ""}`, value: String(r) }));

const VISIBILITY_OPTIONS = [
  { label: "Visible", value: "false" },
  { label: "Hidden", value: "true" },
];

const FIELDS: TableField[] = [
  { key: "user", label: "User" },
  { key: "course", label: "Course" },
  { key: "rating", label: "Rating" },
  { key: "comment", label: "Comment" },
  { key: "status", label: "Status" },
  { key: "date", label: "Date" },
];

const RatingStars = ({ rating }: { rating: number }) => (
  <div className="flex items-center gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <Star key={n} size={13} fill={n <= rating ? "#ca8a04" : "none"} color={n <= rating ? "#ca8a04" : "rgba(0,0,0,0.2)"} />
    ))}
  </div>
);

const ReviewsPage = () => {
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(20);
  const [search, setSearch] = useState("");
  const debouncedSearch = useSearchDebounce(search);

  const [draftRating, setDraftRating] = useState<string | undefined>();
  const [draftVisibility, setDraftVisibility] = useState<string | undefined>();
  const [draftCourse, setDraftCourse] = useState<ComboboxOptionData | null>(null);
  const [draftUser, setDraftUser] = useState<ComboboxOptionData | null>(null);
  const [appliedFilters, setAppliedFilters] = useState<ReviewListFilters>({});
  const [visibilityTarget, setVisibilityTarget] = useState<Review | null>(null);

  const filters: ReviewListFilters = {
    ...appliedFilters,
    page,
    limit,
    search: debouncedSearch || undefined,
  };

  const { data, isLoading, error } = useGetReviews(filters);
  const { mutate: updateVisibility, isPending: isToggling } = useUpdateReviewVisibility();

  const applyFilters = () => {
    setAppliedFilters({
      rating: draftRating ? Number(draftRating) : undefined,
      isHidden: draftVisibility === undefined ? undefined : draftVisibility === "true",
      courseId: draftCourse?.value,
      userId: draftUser?.value,
    });
    setPage(1);
  };

  const resetFilters = () => {
    setDraftRating(undefined);
    setDraftVisibility(undefined);
    setDraftCourse(null);
    setDraftUser(null);
    setAppliedFilters({});
    setPage(1);
  };

  const hasActiveFilters =
    appliedFilters.rating !== undefined ||
    appliedFilters.isHidden !== undefined ||
    !!appliedFilters.courseId ||
    !!appliedFilters.userId;

  const handleToggleVisibility = () => {
    if (!visibilityTarget) return;
    const nextHidden = !visibilityTarget.isHidden;
    updateVisibility(
      { reviewId: visibilityTarget.id, isHidden: nextHidden },
      {
        onSuccess: () => {
          toastMessage.success({ message: nextHidden ? "Review hidden" : "Review made visible" });
          setVisibilityTarget(null);
        },
        onError: (err) => toastMessage.apiError(err),
      },
    );
  };

  return (
    <div className="flex flex-col gap-4">
      <h1 className="text-[20px] font-semibold" style={{ color: "#191919" }}>
        Reviews
      </h1>

      <SearchInput
        value={search}
        onChange={setSearch}
        placeholder="Search by comment, user or course..."
        className="sm:max-w-sm"
      />

      <TableFilters onApply={applyFilters} onReset={resetFilters} hasActiveFilters={hasActiveFilters}>
        <DropdownSelect options={RATING_OPTIONS} value={draftRating} onChange={setDraftRating} placeholder="All rating" />
        <DropdownSelect
          options={VISIBILITY_OPTIONS}
          value={draftVisibility}
          onChange={setDraftVisibility}
          placeholder="All status"
        />
        <AsyncCombobox
          placeholder="Filter by course..."
          value={draftCourse}
          onChange={setDraftCourse}
          search={searchCourses}
          queryKeyPrefix="review-filter-courses"
        />
        <AsyncCombobox
          placeholder="Filter by user..."
          value={draftUser}
          onChange={setDraftUser}
          search={searchStudents}
          queryKeyPrefix="review-filter-users"
        />
      </TableFilters>

      <Table
        fields={FIELDS}
        data={data?.items}
        isLoading={isLoading}
        error={error}
        keyExtractor={(r) => r.id}
        emptyMessage="No reviews found"
        formatRow={(review) => (
          <>
            <td className="px-4 py-3">
              <p className="font-medium" style={{ color: "#191919" }}>
                {review.user.name || "—"}
              </p>
              <p className="text-[12px]" style={{ color: "rgba(0,0,0,0.4)" }}>
                {review.user.email}
              </p>
            </td>
            <td className="px-4 py-3">{review.course.name}</td>
            <td className="px-4 py-3">
              <RatingStars rating={review.rating} />
            </td>
            <td className="max-w-xs px-4 py-3">
              <p className="line-clamp-2" style={{ color: "#191919" }}>
                {review.comment || "—"}
              </p>
            </td>
            <td className="px-4 py-3">
              <div className="flex items-center gap-2.5">
                <Toggle checked={!review.isHidden} onClick={() => setVisibilityTarget(review)} />
                <span
                  className="text-[12.5px] font-medium"
                  style={{ color: review.isHidden ? "rgba(0,0,0,0.45)" : "#16a34a" }}
                >
                  {review.isHidden ? "Hidden" : "Visible"}
                </span>
              </div>
            </td>
            <td className="px-4 py-3" style={{ color: "rgba(0,0,0,0.5)" }}>
              {formatDate(review.createdAt)}
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

      <Modal
        open={!!visibilityTarget}
        onClose={() => setVisibilityTarget(null)}
        title={visibilityTarget?.isHidden ? "Unhide this review?" : "Hide this review?"}
      >
        <p className="mb-5 text-[13px]" style={{ color: "rgba(0,0,0,0.5)" }}>
          {visibilityTarget?.isHidden
            ? "It will become visible on the website again."
            : "It will be hidden from the website. The student's review isn't deleted."}
        </p>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setVisibilityTarget(null)}
            className="rounded-xl px-4 py-2.5 text-[13px] font-semibold"
            style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleToggleVisibility}
            disabled={isToggling}
            className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
            style={{ backgroundColor: visibilityTarget?.isHidden ? "#16a34a" : "#dc2626" }}
          >
            {isToggling ? "Saving..." : visibilityTarget?.isHidden ? "Unhide" : "Hide"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ReviewsPage;
