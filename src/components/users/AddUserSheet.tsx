import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { UserPlus } from "lucide-react";
import { createUserFormSchema, type CreateUserFormSchemaType } from "../../schemas/user.schema";
import { useCreateUser } from "../../services/user.service";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle } from "../shared/Sheet";
import { Input } from "../shared/Input";
import { toastMessage } from "../../utils/toast.util";

interface AddUserSheetProps {
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

export const AddUserSheet = ({ open, onClose }: AddUserSheetProps) => {
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
    createUser(
      { name, email, phone, state, password },
      {
        onSuccess: () => {
          toastMessage.success({ message: "User created successfully" });
          handleClose();
        },
        onError: (err) => toastMessage.apiError(err),
      },
    );
  };

  return (
    <Sheet open={open} onOpenChange={(o: boolean) => !o && handleClose()}>
      <SheetContent open={open}>
        <FormProvider {...form}>
          <form onSubmit={(e) => void form.handleSubmit(onSubmit)(e)} className="flex flex-1 flex-col overflow-hidden">
            <SheetHeader>
              <SheetTitle>Add user</SheetTitle>
            </SheetHeader>

            <div className="flex flex-1 flex-col gap-4 overflow-y-auto px-6 py-5">
              <Input name="name" label="Full name" placeholder="Jane Doe" />
              <Input name="email" type="email" label="Email" placeholder="jane@example.com" />
              <Input name="phone" label="Phone" placeholder="9876543210" />
              <Input name="state" label="State" placeholder="Tamil Nadu" />
              <Input name="password" type="password" label="Password" placeholder="Set a password" />
              <Input name="confirmPassword" type="password" label="Confirm password" placeholder="Re-enter password" />

              <p className="text-[12px]" style={{ color: "rgba(0,0,0,0.4)" }}>
                The account is created active and verified — the student can log in immediately with this password.
              </p>
            </div>

            <SheetFooter>
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
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#0f172a] disabled:opacity-60"
                style={{ backgroundColor: "#f5a300" }}
              >
                <UserPlus size={15} />
                {isPending ? "Creating..." : "Create user"}
              </button>
            </SheetFooter>
          </form>
        </FormProvider>
      </SheetContent>
    </Sheet>
  );
};
