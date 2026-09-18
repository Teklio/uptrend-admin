import { CheckCircle2, Globe, Layers, User as UserIcon } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "../shared/Sheet";
import { DetailSection } from "../shared/DetailSection";
import { InfoRow } from "../shared/InfoRow";
import { StatusBadge } from "../shared/StatusBadge";
import { ExpandableText } from "../shared/ExpandableText";
import { ExpandableList } from "../shared/ExpandableList";
import { formatCurrency, formatDate } from "../../utils/format.util";
import { COURSE_LANGUAGE_OPTIONS } from "../../utils/language.util";
import type { Course } from "../../types/course.type";

interface CourseViewSheetProps {
  open: boolean;
  onClose: () => void;
  course: Course | null;
}

// Read-only — the list response already carries every field shown here, so
// this takes the row's Course object directly rather than re-fetching.
export const CourseViewSheet = ({ open, onClose, course }: CourseViewSheetProps) => (
  <Sheet open={open} onOpenChange={(o: boolean) => !o && onClose()}>
    <SheetContent open={open}>
      <SheetHeader>
        <SheetTitle>Course details</SheetTitle>
      </SheetHeader>
      <div className="flex-1 overflow-y-auto px-6 py-5">
        {!course ? (
          <p className="text-[13px]" style={{ color: "rgba(0,0,0,0.4)" }}>
            Loading...
          </p>
        ) : (
          <div className="flex flex-col gap-5">
            <div className="flex items-center gap-3.5">
              {course.primaryImageUrl ? (
                <img
                  src={course.primaryImageUrl}
                  alt=""
                  className="h-14 w-14 shrink-0 rounded-xl object-cover"
                />
              ) : (
                <div
                  className="h-14 w-14 shrink-0 rounded-xl"
                  style={{ backgroundColor: "rgba(0,0,0,0.06)" }}
                />
              )}
              <div className="min-w-0">
                <p className="truncate text-[16px] font-semibold" style={{ color: "#191919" }}>
                  {course.name}
                </p>
                <p className="truncate text-[13px]" style={{ color: "rgba(0,0,0,0.5)" }}>
                  {course.mentorName || "No mentor set"}
                </p>
                <div className="mt-1.5">
                  <StatusBadge
                    label={course.isPublished ? "Published" : "Draft"}
                    variant={course.isPublished ? "success" : "neutral"}
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <div className="rounded-xl px-3 py-2.5 text-center" style={{ backgroundColor: "#f8f9fa" }}>
                <p className="font-mono text-[15px] font-semibold" style={{ color: "#191919" }}>
                  {formatCurrency(course.price)}
                </p>
                <p className="text-[11px]" style={{ color: "rgba(0,0,0,0.45)" }}>
                  Price
                </p>
              </div>
              <div className="rounded-xl px-3 py-2.5 text-center" style={{ backgroundColor: "#f8f9fa" }}>
                <p className="font-mono text-[16px] font-semibold" style={{ color: "#191919" }}>
                  {course._count?.modules ?? 0}
                </p>
                <p className="text-[11px]" style={{ color: "rgba(0,0,0,0.45)" }}>
                  Modules
                </p>
              </div>
              <div className="rounded-xl px-3 py-2.5 text-center" style={{ backgroundColor: "#f8f9fa" }}>
                <p className="font-mono text-[16px] font-semibold" style={{ color: "#191919" }}>
                  {course.features.length}
                </p>
                <p className="text-[11px]" style={{ color: "rgba(0,0,0,0.45)" }}>
                  Features
                </p>
              </div>
            </div>

            <DetailSection title="Details">
              <div className="flex flex-col gap-3">
                <InfoRow
                  icon={Globe}
                  label="Language"
                  value={COURSE_LANGUAGE_OPTIONS.find((o) => o.value === course.language)?.label ?? course.language ?? "—"}
                />
                <InfoRow icon={UserIcon} label="Mentor" value={course.mentorName || "—"} />
                <InfoRow icon={Layers} label="Created" value={formatDate(course.createdAt)} />
              </div>
            </DetailSection>

            <DetailSection title="Pricing">
              <div className="flex flex-col gap-2 text-[13px]">
                <div className="flex items-center justify-between">
                  <span style={{ color: "rgba(0,0,0,0.5)" }}>Price</span>
                  <span style={{ color: "#191919" }}>
                    {formatCurrency(course.price)}
                    {Number(course.actualPrice) > Number(course.price) && (
                      <span className="ml-1.5 line-through" style={{ color: "rgba(0,0,0,0.35)" }}>
                        {formatCurrency(course.actualPrice)}
                      </span>
                    )}
                  </span>
                </div>
                {Number(course.extraFee) > 0 && (
                  <div className="flex items-center justify-between">
                    <span style={{ color: "rgba(0,0,0,0.5)" }}>Internet handling fee</span>
                    <span style={{ color: "#191919" }}>{formatCurrency(course.extraFee)}</span>
                  </div>
                )}
                <div
                  className="flex items-center justify-between pt-2 font-semibold"
                  style={{ borderTop: "1px solid rgba(0,0,0,0.08)", color: "#191919" }}
                >
                  <span>Student pays</span>
                  <span>{formatCurrency(Number(course.price) + Number(course.extraFee))}</span>
                </div>
              </div>
            </DetailSection>

            {(course.primaryImageUrl || course.mentorImageUrl) && (
              <DetailSection title="Images">
                <div className="flex gap-3">
                  {course.primaryImageUrl && (
                    <div>
                      <p className="mb-1.5 text-[11px]" style={{ color: "rgba(0,0,0,0.4)" }}>
                        Primary
                      </p>
                      <img src={course.primaryImageUrl} alt="" className="h-20 w-20 rounded-xl object-cover" />
                    </div>
                  )}
                  {course.mentorImageUrl && (
                    <div>
                      <p className="mb-1.5 text-[11px]" style={{ color: "rgba(0,0,0,0.4)" }}>
                        Mentor
                      </p>
                      <img src={course.mentorImageUrl} alt="" className="h-20 w-20 rounded-xl object-cover" />
                    </div>
                  )}
                </div>
              </DetailSection>
            )}

            <DetailSection title="Description">
              <ExpandableText text={course.description || "—"} className="text-[13px]" style={{ color: "#191919" }} />
            </DetailSection>

            <DetailSection title="Features">
              <ExpandableList
                items={course.features}
                renderItem={(f, i) => (
                  <li key={i} className="flex min-w-0 items-start gap-2">
                    <CheckCircle2 size={14} className="mt-0.5 shrink-0" style={{ color: "#002b7f" }} />
                    <span className="wrap-break-word min-w-0 text-[13px]" style={{ color: "#191919" }}>
                      {f}
                    </span>
                  </li>
                )}
              />
            </DetailSection>
          </div>
        )}
      </div>
    </SheetContent>
  </Sheet>
);
