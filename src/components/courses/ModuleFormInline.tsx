import { useEffect } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { moduleFormSchema, type ModuleFormSchemaType } from "../../schemas/courseModule.schema";
import { useAddModule, useUpdateModule } from "../../services/module.service";
import { Modal } from "../shared/Modal";
import { Input } from "../shared/Input";
import { toastMessage } from "../../utils/toast.util";
import type { CourseModule } from "../../types/course.type";

interface ModuleFormInlineProps {
  open: boolean;
  onClose: () => void;
  courseId: string;
  module?: CourseModule | null;
}

export const ModuleFormInline = ({ open, onClose, courseId, module }: ModuleFormInlineProps) => {
  const isEdit = !!module;
  const { mutate: addModule, isPending: isAdding } = useAddModule(courseId);
  const { mutate: updateModule, isPending: isUpdating } = useUpdateModule(courseId);

  const form = useForm<ModuleFormSchemaType>({
    resolver: zodResolver(moduleFormSchema),
    defaultValues: { title: "", description: "" },
  });

  useEffect(() => {
    if (!open) return;
    form.reset({ title: module?.title ?? "", description: module?.description ?? "" });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, module]);

  const isPending = isAdding || isUpdating;

  const onSubmit = (values: ModuleFormSchemaType) => {
    const onSuccess = () => {
      toastMessage.success({ message: isEdit ? "Module updated" : "Module added" });
      onClose();
    };
    const onError = (err: unknown) => toastMessage.apiError(err);

    if (isEdit && module) {
      updateModule({ moduleId: module.id, values }, { onSuccess, onError });
    } else {
      addModule(values, { onSuccess, onError });
    }
  };

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Rename module" : "Add module"}>
      <FormProvider {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col gap-4">
          <Input name="title" label="Title" placeholder="e.g. Getting Started" />
          <Input name="description" type="textarea" label="Description" rows={3} />
          <div className="mt-1 flex justify-end gap-2.5">
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
              className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: "#7e14ff" }}
            >
              {isPending ? "Saving..." : isEdit ? "Save changes" : "Add module"}
            </button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};
