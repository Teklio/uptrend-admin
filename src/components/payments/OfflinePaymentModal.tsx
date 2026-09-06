import { useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Banknote } from "lucide-react";
import { offlinePaymentFormSchema, type OfflinePaymentFormSchemaType } from "../../schemas/payment.schema";
import { useCreateOfflinePayment } from "../../services/payment.service";
import { Modal } from "../shared/Modal";
import { Input } from "../shared/Input";
import { AsyncCombobox, type ComboboxOptionData } from "../shared/AsyncCombobox";
import { FileUpload } from "../shared/FileUpload";
import { toastMessage } from "../../utils/toast.util";
import { searchCourses, searchStudents } from "../../utils/comboboxSearch.util";

interface OfflinePaymentModalProps {
  open: boolean;
  onClose: () => void;
}

export const OfflinePaymentModal = ({ open, onClose }: OfflinePaymentModalProps) => {
  const { mutate: createOfflinePayment, isPending } = useCreateOfflinePayment();
  const [student, setStudent] = useState<ComboboxOptionData | null>(null);
  const [course, setCourse] = useState<ComboboxOptionData | null>(null);
  const [proof, setProof] = useState<File | null>(null);

  const form = useForm<OfflinePaymentFormSchemaType>({
    resolver: zodResolver(offlinePaymentFormSchema),
    defaultValues: { amount: undefined as unknown as number, paymentMode: "" },
  });

  const reset = () => {
    form.reset({ amount: undefined as unknown as number, paymentMode: "" });
    setStudent(null);
    setCourse(null);
    setProof(null);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  const onSubmit = (values: OfflinePaymentFormSchemaType) => {
    if (!student || !course) {
      toastMessage.error({ message: "Please select both a student and a course" });
      return;
    }

    createOfflinePayment(
      {
        userId: student.value,
        courseId: course.value,
        amount: values.amount,
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
    <Modal open={open} onClose={handleClose} title="Record offline payment">
      <FormProvider {...form}>
        <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="flex flex-col gap-4">
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
          <Input name="amount" type="number" label="Amount (₹)" placeholder="e.g. 4999" />
          <Input name="paymentMode" label="Payment mode (optional)" placeholder="Cash, Bank transfer, UPI..." />
          <FileUpload label="Proof (optional)" file={proof} onChange={setProof} />

          <div className="mt-2 flex justify-end gap-2.5">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-xl px-4 py-2.5 text-[13px] font-semibold"
              style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isPending}
              className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: "#7e14ff" }}
            >
              <Banknote size={15} />
              {isPending ? "Recording..." : "Record payment"}
            </button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};
