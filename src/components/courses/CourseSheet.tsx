import { useState } from "react";
import { Controller, FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { courseFormSchema, type CourseFormSchemaType } from "../../schemas/course.schema";
import { useAddCourse, useUpdateCourse } from "../../services/course.service";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "../shared/Sheet";
import { Input } from "../shared/Input";
import { ImageUpload } from "../shared/ImageUpload";
import { FeaturesInput } from "./FeaturesInput";
import { toastMessage } from "../../utils/toast.util";
import type { Course } from "../../types/course.type";

interface CourseSheetProps {
  open: boolean;
  onClose: () => void;
  course?: Course | null;
}

const emptyDefaults: CourseFormSchemaType = {
  name: "",
  description: "",
  language: "",
  mentorName: "",
  price: 0,
  actualPrice: 0,
  extraFee: 0,
  features: [],
  highlights: [],
};

// Outer shell only handles the Sheet chrome/animation. The form itself is
// only ever rendered while `open` is true, keyed by the target course — so
// every open gets a freshly-mounted form initialized straight from props
// (via lazy useState initializers), with no reset-on-open effect needed.
export const CourseSheet = ({ open, onClose, course }: CourseSheetProps) => (
  <Sheet open={open} onOpenChange={(o: boolean) => !o && onClose()}>
    <SheetContent open={open}>
      {open && <CourseSheetForm key={course?.id ?? "add"} course={course ?? null} onClose={onClose} />}
    </SheetContent>
  </Sheet>
);

interface CourseSheetFormProps {
  course: Course | null;
  onClose: () => void;
}

const CourseSheetForm = ({ course, onClose }: CourseSheetFormProps) => {
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
          language: course.language ?? "",
          mentorName: course.mentorName ?? "",
          price: Number(course.price),
          actualPrice: Number(course.actualPrice),
          extraFee: Number(course.extraFee),
          features: course.features,
          highlights: course.highlights,
        }
      : emptyDefaults,
  });

  const isPending = isAdding || isUpdating;

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
            <Input name="language" label="Language" placeholder="English" />
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
          <Controller
            name="highlights"
            control={form.control}
            render={({ field }) => (
              <FeaturesInput
                label="Highlights"
                value={field.value}
                onChange={field.onChange}
                placeholder="Add a highlight and press Enter"
              />
            )}
          />
        </div>

        <SheetFooter>
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-[13px] font-semibold"
            style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isPending}
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
