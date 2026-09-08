import { useEffect, useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseFormSchema, type CourseFormSchemaType } from "../../schemas/course.schema";
import { useAddCourse, useUpdateCourse } from "../../services/course.service";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "../shared/Sheet";
import { Input } from "../shared/Input";
import { Dropdown } from "../shared/Dropdown";
import { ImageUpload } from "../shared/ImageUpload";
import { FeaturesInput } from "./FeaturesInput";
import { DiscardChangesModal } from "../shared/DiscardChangesModal";
import { useDiscardGuard } from "../../hooks/useDiscardGuard";
import { toastMessage } from "../../utils/toast.util";
import { COURSE_LANGUAGE_OPTIONS } from "../../utils/language.util";
import type { Course } from "../../types/course.type";

interface CourseSheetProps {
  open: boolean;
  onClose: () => void;
  course?: Course | null;
}

// Existing courses may hold a legacy free-text value (from before language
// became a fixed set) that doesn't match either option — fall back to
// unselected rather than letting an invalid value slip past the resolver.
const normalizeLanguage = (value: string | null): CourseFormSchemaType["language"] =>
  value === "english" || value === "malayalam" ? value : "";

const emptyDefaults: CourseFormSchemaType = {
  name: "",
  description: "",
  language: "",
  mentorName: "",
  price: 0,
  actualPrice: 0,
  extraFee: 0,
  features: [],
};

// Outer shell only handles the Sheet chrome/animation. The form itself is
// only ever rendered while `open` is true, keyed by the target course — so
// every open gets a freshly-mounted form initialized straight from props
// (via lazy useState initializers), with no reset-on-open effect needed.
// `hasChanges` is lifted up from the form so backdrop clicks, Escape, and
// the header's X button — none of which the form itself sees — can also be
// guarded by the same "discard changes?" confirmation as the Cancel button.
export const CourseSheet = ({ open, onClose, course }: CourseSheetProps) => {
  const [hasChanges, setHasChanges] = useState(false);
  const { confirmOpen, requestClose, confirmDiscard, cancelDiscard } = useDiscardGuard(hasChanges, onClose);

  return (
    <>
      <Sheet open={open} onOpenChange={(o: boolean) => !o && requestClose()}>
        <SheetContent open={open}>
          {open && (
            <CourseSheetForm
              key={course?.id ?? "add"}
              course={course ?? null}
              onClose={onClose}
              onRequestClose={requestClose}
              onDirtyChange={setHasChanges}
            />
          )}
        </SheetContent>
      </Sheet>
      <DiscardChangesModal open={confirmOpen} onCancel={cancelDiscard} onConfirm={confirmDiscard} />
    </>
  );
};

interface CourseSheetFormProps {
  course: Course | null;
  onClose: () => void;
  onRequestClose: () => void;
  onDirtyChange: (hasChanges: boolean) => void;
}

const CourseSheetForm = ({ course, onClose, onRequestClose, onDirtyChange }: CourseSheetFormProps) => {
  const isEdit = !!course;
  const { mutate: addCourse, isPending: isAdding } = useAddCourse();
  const { mutate: updateCourse, isPending: isUpdating } = useUpdateCourse();

  const [primaryImage, setPrimaryImage] = useState<File | null>(null);
  const [mentorImage, setMentorImage] = useState<File | null>(null);
  const [primaryPreview, setPrimaryPreview] = useState<string | null>(course?.primaryImageUrl ?? null);
  const [mentorPreview, setMentorPreview] = useState<string | null>(course?.mentorImageUrl ?? null);

  const form = useForm<CourseFormSchemaType>({
    resolver: zodResolver(courseFormSchema),
    defaultValues: course
      ? {
          name: course.name,
          description: course.description ?? "",
          language: normalizeLanguage(course.language),
          mentorName: course.mentorName ?? "",
          price: Number(course.price),
          actualPrice: Number(course.actualPrice),
          extraFee: Number(course.extraFee),
          features: course.features,
        }
      : emptyDefaults,
  });

  const isPending = isAdding || isUpdating;

  // Image files live outside react-hook-form (they're plain File state, not
  // registered fields), so isDirty alone wouldn't notice a new image pick.
  const hasChanges = form.formState.isDirty || !!primaryImage || !!mentorImage;

  useEffect(() => {
    onDirtyChange(hasChanges);
  }, [hasChanges, onDirtyChange]);

  const onSubmit = (values: CourseFormSchemaType) => {
    const files = { primaryImage, mentorImage };
    const onSuccess = () => {
      toastMessage.success({ message: isEdit ? "Course updated successfully" : "Course created successfully" });
      onClose();
    };
    const onError = (err: unknown) => toastMessage.apiError(err);

    if (isEdit && course) {
      updateCourse({ courseId: course.id, values, files }, { onSuccess, onError });
    } else {
      addCourse({ values, files }, { onSuccess, onError });
    }
  };

  return (
    <FormProvider {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-1 flex-col overflow-hidden">
        <SheetHeader>
          <SheetTitle>{isEdit ? "Edit course" : "Add course"}</SheetTitle>
        </SheetHeader>

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
          <div className="grid grid-cols-2 gap-4">
            <ImageUpload
              label="Primary image"
              previewUrl={primaryPreview}
              onChange={(f) => {
                setPrimaryImage(f);
                setPrimaryPreview(f ? URL.createObjectURL(f) : null);
              }}
            />
            <ImageUpload
              label="Mentor image"
              previewUrl={mentorPreview}
              onChange={(f) => {
                setMentorImage(f);
                setMentorPreview(f ? URL.createObjectURL(f) : null);
              }}
            />
          </div>

          <Input name="name" label="Course name" placeholder="e.g. Complete Web Development" />
          <Input name="description" type="textarea" label="Description" rows={4} />

          <div className="grid grid-cols-2 gap-4">
            <Dropdown name="language" label="Language" options={COURSE_LANGUAGE_OPTIONS} placeholder="Select language" />
            <Input name="mentorName" label="Mentor name" placeholder="Jane Doe" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <Input name="price" type="number" label="Price (₹)" />
            <Input name="actualPrice" type="number" label="Actual price (₹)" />
          </div>

          <div>
            <Input name="extraFee" type="number" label="Internet handling fee (₹)" placeholder="0" />
            <p className="mt-1.5 text-[12px]" style={{ color: "rgba(0,0,0,0.4)" }}>
              Added on top of the price at checkout and shown to students as "Internet handling fee". Leave at 0 for
              no extra fee.
            </p>
          </div>

          <Controller
            name="features"
            control={form.control}
            render={({ field }) => (
              <FeaturesInput
                label="Features"
                value={field.value}
                onChange={field.onChange}
                placeholder="Add a feature and press Enter"
              />
            )}
          />
        </div>

        <SheetFooter>
          <button
            type="button"
            onClick={onRequestClose}
            className="rounded-xl px-4 py-2.5 text-[13px] font-semibold"
            style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending || !hasChanges}
            className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#0f172a] disabled:opacity-60"
            style={{ backgroundColor: "#f5a300" }}
          >
            {isPending ? "Saving..." : isEdit ? "Save changes" : "Create course"}
          </button>
        </SheetFooter>
      </form>
    </FormProvider>
  );
};
