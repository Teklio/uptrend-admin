import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { createUserFormSchema, type CreateUserFormSchemaType } from "../../schemas/user.schema";
import { useCreateUser } from "../../services/user.service";
import { Modal } from "../shared/Modal";
import { Input } from "../shared/Input";
import { toastMessage } from "../../utils/toast.util";

interface AddUserModalProps {
  open: boolean;
  onClose: () => void;
}

const defaultValues: CreateUserFormSchemaType = {
  name: "",
  email: "",
  phone: "",
  state: "",
  password: "",
  confirmPassword: "",
};

export const AddUserModal = ({ open, onClose }: AddUserModalProps) => {
  const { mutate: createUser, isPending } = useCreateUser();
  const form = useForm<CreateUserFormSchemaType>({
    resolver: zodResolver(createUserFormSchema),
    defaultValues,
  });

  const handleClose = () => {
    form.reset(defaultValues);
    onClose();
  };

  const onSubmit = (values: CreateUserFormSchemaType) => {
    const { name, email, phone, state, password } = values;
    createUser({ name, email, phone, state, password }, {
      onSuccess: () => {
        toastMessage.success({ message: "User created successfully" });
        handleClose();
      },
      onError: (err) => toastMessage.apiError(err),
    });
  };

  return (
    <Modal open={open} onClose={handleClose} title="Add user">
      <FormProvider {...form}>
        <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="flex flex-col gap-4">
          <Input name="name" label="Full name" placeholder="Jane Doe" />
          <Input name="email" type="email" label="Email" placeholder="jane@example.com" />
          <Input name="phone" label="Phone" placeholder="9876543210" />
          <Input name="state" label="State" placeholder="Tamil Nadu" />
          <Input name="password" type="password" label="Password" placeholder="Set a password" />
          <Input name="confirmPassword" type="password" label="Confirm password" placeholder="Re-enter password" />

          <p className="text-[12px]" style={{ color: "rgba(0,0,0,0.4)" }}>
            The account is created active and verified — the student can log in immediately with this password.
          </p>

          <div className="mt-1 flex justify-end gap-2.5">
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
              <UserPlus size={15} />
              {isPending ? "Creating..." : "Create user"}
            </button>
          </div>
        </form>
      </FormProvider>
    </Modal>
  );
};
