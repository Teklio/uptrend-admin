import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote } from "lucide-react";
import { offlinePaymentFormSchema, type OfflinePaymentFormSchemaType } from "../../schemas/payment.schema";
import { useCreateOfflinePayment } from "../../services/payment.service";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "../shared/Sheet";
import { Input } from "../shared/Input";
import { AsyncCombobox, type ComboboxOptionData } from "../shared/AsyncCombobox";
import { FileUpload } from "../shared/FileUpload";
import { DiscardChangesModal } from "../shared/DiscardChangesModal";
import { useDiscardGuard } from "../../hooks/useDiscardGuard";
import { toastMessage } from "../../utils/toast.util";
import { formatCurrency } from "../../utils/format.util";
import { searchCourses, searchStudents } from "../../utils/comboboxSearch.util";

interface OfflinePaymentSheetProps {
  open: boolean;
  onClose: () => void;
}

const defaultValues: OfflinePaymentFormSchemaType = { paymentMode: "" };

export const OfflinePaymentSheet = ({ open, onClose }: OfflinePaymentSheetProps) => {
  const { mutate: createOfflinePayment, isPending } = useCreateOfflinePayment();
  const [student, setStudent] = useState<ComboboxOptionData | null>(null);
  const [course, setCourse] = useState<ComboboxOptionData | null>(null);
  const [proof, setProof] = useState<File | null>(null);

  const form = useForm<OfflinePaymentFormSchemaType>({
    resolver: zodResolver(offlinePaymentFormSchema),
    defaultValues,
  });

  const coursePrice = Number(course?.meta?.price ?? 0);
  const courseExtraFee = Number(course?.meta?.extraFee ?? 0);
  const courseTotal = coursePrice + courseExtraFee;

  const reset = () => {
    form.reset(defaultValues);
    setStudent(null);
    setCourse(null);
    setProof(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  // `student`/`course`/`proof` live outside react-hook-form (they're a
  // combobox selection and a file, not registered fields), so isDirty alone
  // would miss them — combine it with those to get a true "anything entered".
  const hasChanges = form.formState.isDirty || !!student || !!course || !!proof;
  const { confirmOpen, requestClose, confirmDiscard, cancelDiscard } = useDiscardGuard(hasChanges, handleClose);

  const onSubmit = (values: OfflinePaymentFormSchemaType) => {
    if (!student || !course) {
      toastMessage.error({ message: "Please select both a student and a course" });
      return;
    }

    createOfflinePayment(
      {
        userId: student.value,
        courseId: course.value,
        paymentMode: values.paymentMode || undefined,
        proof,
      },
      {
        onSuccess: () => {
          toastMessage.success({ message: "Offline payment recorded — access granted" });
          handleClose();
        },
        onError: (err) => toastMessage.apiError(err),
      },
    );
  };

  return (
    <>
      <Sheet open={open} onOpenChange={(o: boolean) => !o && requestClose()}>
        <SheetContent open={open}>
          <FormProvider {...form}>
            <form
              onSubmit={(e) => void form.handleSubmit(onSubmit)(e)}
              className="flex flex-1 flex-col overflow-hidden"
            >
              <SheetHeader>
                <SheetTitle>Record offline payment</SheetTitle>
              </SheetHeader>

              <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
                <AsyncCombobox
                  label="Student"
                  placeholder="Search by name or email..."
                  value={student}
                  onChange={setStudent}
                  search={searchStudents}
                  queryKeyPrefix="offline-payment-students"
                />
                <AsyncCombobox
                  label="Course"
                  placeholder="Search courses..."
                  value={course}
                  onChange={setCourse}
                  search={searchCourses}
                  queryKeyPrefix="offline-payment-courses"
                />
                {course && (
                  <div className="rounded-xl p-3.5" style={{ backgroundColor: "#f8f9fa" }}>
                    <p className="mb-1.5 text-[12px] font-medium" style={{ color: "rgba(0,0,0,0.45)" }}>
                      Amount to collect
                    </p>
                    <div className="flex items-baseline justify-between text-[13px]" style={{ color: "#191919" }}>
                      <span>Course price</span>
                      <span>{formatCurrency(coursePrice)}</span>
                    </div>
                    {courseExtraFee > 0 && (
                      <div
                        className="flex items-baseline justify-between text-[13px]"
                        style={{ color: "rgba(0,0,0,0.6)" }}
                      >
                        <span>Internet handling fee</span>
                        <span>{formatCurrency(courseExtraFee)}</span>
                      </div>
                    )}
                    <div
                      className="mt-1.5 flex items-baseline justify-between border-t pt-1.5 text-[14px] font-semibold"
                      style={{ borderColor: "rgba(0,0,0,0.07)", color: "#191919" }}
                    >
                      <span>Total</span>
                      <span>{formatCurrency(courseTotal)}</span>
                    </div>
                  </div>
                )}
                <Input name="paymentMode" label="Payment mode (optional)" placeholder="Cash, Bank transfer, UPI..." />
                <FileUpload label="Proof (optional)" file={proof} onChange={setProof} />
              </div>

              <SheetFooter>
                <button
                  type="button"
                  onClick={requestClose}
                  className="rounded-xl px-4 py-2.5 text-[13px] font-semibold"
                  style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || !hasChanges}
                  className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#0f172a] disabled:opacity-60"
                  style={{ backgroundColor: "#f5a300" }}
                >
                  <Banknote size={15} />
                  {isPending ? "Recording..." : "Record payment"}
                </button>
              </SheetFooter>
            </form>
          </FormProvider>
        </SheetContent>
      </Sheet>
      <DiscardChangesModal open={confirmOpen} onCancel={cancelDiscard} onConfirm={confirmDiscard} />
    </>
  );
};
