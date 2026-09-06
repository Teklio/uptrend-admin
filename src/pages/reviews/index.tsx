import { useState } from "react";
import { Star, EyeOff, Eye as EyeIcon } from "lucide-react";
import { useGetReviews, useUpdateReviewVisibility } from "../../services/review.service";
import { useSearchDebounce } from "../../hooks/useSearchDebounce";
import { searchCourses, searchStudents } from "../../utils/comboboxSearch.util";
import { Table, type TableField } from "../../components/shared/Table";
import { TablePagination } from "../../components/shared/TablePagination";
import { TableFilters } from "../../components/shared/TableFilters";
import { SearchInput } from "../../components/shared/SearchInput";
import { DropdownSelect } from "../../components/shared/Dropdown";
import { AsyncCombobox, type ComboboxOptionData } from "../../components/shared/AsyncCombobox";
import { StatusBadge } from "../../components/shared/StatusBadge";
import { formatDate } from "../../utils/format.util";
import { toastMessage } from "../../utils/toast.util";
import type { ReviewListFilters } from "../../types/review.type";

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
  { key: "actions", label: "" },
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

  const handleToggle = (reviewId: string, nextHidden: boolean) => {
    updateVisibility(
      { reviewId, isHidden: nextHidden },
      {
        onSuccess: () => toastMessage.success({ message: nextHidden ? "Review hidden" : "Review made visible" }),
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
        <DropdownSelect options={RATING_OPTIONS} value={draftRating} onChange={setDraftRating} placeholder="Any rating" />
        <DropdownSelect
          options={VISIBILITY_OPTIONS}
          value={draftVisibility}
          onChange={setDraftVisibility}
          placeholder="Any status"
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
              <StatusBadge label={review.isHidden ? "Hidden" : "Visible"} variant={review.isHidden ? "error" : "success"} />
            </td>
            <td className="px-4 py-3" style={{ color: "rgba(0,0,0,0.5)" }}>
              {formatDate(review.createdAt)}
            </td>
            <td className="px-4 py-3">
              <button
                type="button"
                title={review.isHidden ? "Unhide" : "Hide"}
                onClick={() => handleToggle(review.id, !review.isHidden)}
                disabled={isToggling}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-black/5 disabled:opacity-60"
                style={{ color: review.isHidden ? "#16a34a" : "#dc2626" }}
              >
                {review.isHidden ? <EyeIcon size={15} /> : <EyeOff size={15} />}
              </button>
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
    </div>
  );
};

export default ReviewsPage;
