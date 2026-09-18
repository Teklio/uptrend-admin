import { useEffect, useState } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Pencil, X } from "lucide-react";
import {
  changeAdminPasswordSchema,
  updateAdminProfileSchema,
  type ChangeAdminPasswordSchemaType,
  type UpdateAdminProfileSchemaType,
} from "../../schemas/adminauth.schema";
import { useChangeAdminPassword, useMe, useUpdateAdminProfile } from "../../services/auth.service";
import { Input } from "../../components/shared/Input";
import { Modal } from "../../components/shared/Modal";
import { toastMessage } from "../../utils/toast.util";

type EditableField = "name" | "phone";

const passwordDefaults: ChangeAdminPasswordSchemaType = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
};

const ProfilePage = () => {
  const { data: admin } = useMe();
  const { mutate: updateProfile, isPending: isUpdatingProfile } = useUpdateAdminProfile();
  const { mutate: changePassword, isPending: isChangingPassword } = useChangeAdminPassword();

  const [editField, setEditField] = useState<EditableField | null>(null);
  const [passwordOpen, setPasswordOpen] = useState(false);
  const [pendingPassword, setPendingPassword] = useState<ChangeAdminPasswordSchemaType | null>(null);

  const profileForm = useForm<UpdateAdminProfileSchemaType>({
    resolver: zodResolver(updateAdminProfileSchema),
    defaultValues: { name: "", phone: "" },
  });

  const passwordForm = useForm<ChangeAdminPasswordSchemaType>({
    resolver: zodResolver(changeAdminPasswordSchema),
    defaultValues: passwordDefaults,
  });

  useEffect(() => {
    if (admin) {
      profileForm.reset({ name: admin.name ?? "", phone: admin.phone ?? "" });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  const startEdit = (field: EditableField) => {
    setEditField(field);
  };

  const cancelEdit = () => {
    if (admin) {
      profileForm.reset({ name: admin.name ?? "", phone: admin.phone ?? "" });
    }
    setEditField(null);
  };

  const saveField = async (field: EditableField) => {
    const isValid = await profileForm.trigger(field);
    if (!isValid) return;

    const value = profileForm.getValues(field);
    const original = (field === "name" ? admin?.name : admin?.phone) ?? "";
    if (value === original) {
      // Nothing actually changed — closing is enough, no need to hit the API.
      setEditField(null);
      return;
    }

    updateProfile(
      { [field]: value },
      {
        onSuccess: () => {
          toastMessage.success({ message: "Profile updated successfully" });
          setEditField(null);
        },
        onError: (err) => toastMessage.apiError(err),
      },
    );
  };

  const openPasswordForm = () => setPasswordOpen(true);
  const closePasswordForm = () => {
    passwordForm.reset(passwordDefaults);
    setPasswordOpen(false);
  };

  const onSubmitPassword = (values: ChangeAdminPasswordSchemaType) => {
    setPendingPassword(values);
  };

  const confirmChangePassword = () => {
    if (!pendingPassword) return;
    changePassword(pendingPassword, {
      onSuccess: () => {
        toastMessage.success({ message: "Password changed successfully" });
        setPendingPassword(null);
        closePasswordForm();
      },
      onError: (err) => {
        toastMessage.apiError(err);
        setPendingPassword(null);
      },
    });
  };

  const renderProfileRow = (field: EditableField, label: string, placeholder: string) => {
    const value = field === "name" ? admin?.name : admin?.phone;
    const isEditing = editField === field;

    return (
      <div className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
        <div className="flex-1">
          <p className="mb-1 text-[12px] font-medium" style={{ color: "rgba(0,0,0,0.45)" }}>
            {label}
          </p>
          {isEditing ? (
            <FormProvider {...profileForm}>
              <Input name={field} placeholder={placeholder} />
            </FormProvider>
          ) : (
            <p className="text-[14px] font-medium" style={{ color: "#191919" }}>
              {value || "Not provided"}
            </p>
          )}
        </div>
        {isEditing ? (
          <div className="flex shrink-0 gap-1.5">
            <button
              type="button"
              onClick={() => saveField(field)}
              disabled={isUpdatingProfile}
              className="flex h-8 w-8 items-center justify-center rounded-full disabled:opacity-60"
              style={{ backgroundColor: "rgba(22,163,74,0.1)", color: "#16a34a" }}
            >
              <Check size={16} />
            </button>
            <button
              type="button"
              onClick={cancelEdit}
              className="flex h-8 w-8 items-center justify-center rounded-full"
              style={{ backgroundColor: "rgba(220,38,38,0.1)", color: "#dc2626" }}
            >
              <X size={16} />
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => startEdit(field)}
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
            style={{ color: "rgba(0,0,0,0.4)" }}
          >
            <Pencil size={15} />
          </button>
        )}
      </div>
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <h1 className="text-[20px] font-semibold" style={{ color: "#191919" }}>
        Profile
      </h1>

      <div className="grid grid-cols-1 items-start gap-6 lg:grid-cols-2">
        <div className="rounded-2xl bg-white p-6" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
          <h2 className="mb-2 text-[15px] font-semibold" style={{ color: "#191919" }}>
            Profile details
          </h2>

          <div>
            <div className="flex items-center gap-3 py-3" style={{ borderBottom: "1px solid rgba(0,0,0,0.06)" }}>
              <div className="flex-1">
                <p className="mb-1 text-[12px] font-medium" style={{ color: "rgba(0,0,0,0.45)" }}>
                  Email
                </p>
                <p className="text-[14px] font-medium" style={{ color: "rgba(0,0,0,0.6)" }}>
                  {admin?.email}
                </p>
              </div>
            </div>

            {renderProfileRow("name", "Name", "Your name")}
            {renderProfileRow("phone", "Phone", "10-digit phone number")}
          </div>
        </div>

        <div className="rounded-2xl bg-white p-6" style={{ border: "1px solid rgba(0,0,0,0.07)" }}>
          <h2 className="mb-4 text-[15px] font-semibold" style={{ color: "#191919" }}>
            Security
          </h2>

          <AnimatePresence initial={false} mode="wait">
            {!passwordOpen ? (
              <motion.div
                key="closed"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.15 }}
                className="flex items-center justify-between gap-4"
              >
                <div>
                  <p className="text-[14px] font-medium" style={{ color: "#191919" }}>
                    Password
                  </p>
                  <p className="mt-0.5 text-[12px]" style={{ color: "rgba(0,0,0,0.45)" }}>
                    A secure password helps protect your admin account.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={openPasswordForm}
                  className="shrink-0 rounded-xl px-4 py-2.5 text-[13px] font-semibold"
                  style={{ border: "1px solid rgba(0,0,0,0.12)", color: "#191919" }}
                >
                  Change password
                </button>
              </motion.div>
            ) : (
              <motion.div
                key="open"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="overflow-hidden"
              >
                <FormProvider {...passwordForm}>
                  <form onSubmit={passwordForm.handleSubmit(onSubmitPassword)} className="flex flex-col gap-4">
                    <div className="flex items-start justify-between gap-4">
                      <p className="text-[12px]" style={{ color: "rgba(0,0,0,0.45)" }}>
                        Enter your current password to authorize this change.
                      </p>
                      <button
                        type="button"
                        onClick={closePasswordForm}
                        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full hover:bg-black/5"
                        style={{ color: "rgba(0,0,0,0.4)" }}
                      >
                        <X size={15} />
                      </button>
                    </div>

                    <Input name="currentPassword" type="password" label="Current password" />
                    <Input name="newPassword" type="password" label="New password" />
                    <Input name="confirmPassword" type="password" label="Confirm new password" />

                    <button
                      type="submit"
                      disabled={isChangingPassword || !passwordForm.formState.isDirty}
                      className="mt-1 self-start rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#0f172a] disabled:opacity-60"
                      style={{ backgroundColor: "#f5a300" }}
                    >
                      {isChangingPassword ? "Saving..." : "Save password"}
                    </button>
                  </form>
                </FormProvider>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <Modal open={!!pendingPassword} onClose={() => setPendingPassword(null)} title="Change your password?">
        <p className="mb-5 text-[13px]" style={{ color: "rgba(0,0,0,0.5)" }}>
          You'll need to use the new password the next time you sign in. Make sure you'll remember it.
        </p>
        <div className="flex justify-end gap-2.5">
          <button
            type="button"
            onClick={() => setPendingPassword(null)}
            disabled={isChangingPassword}
            className="rounded-xl px-4 py-2.5 text-[13px] font-semibold disabled:opacity-60"
            style={{ backgroundColor: "rgba(0,0,0,0.05)", color: "#191919" }}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={confirmChangePassword}
            disabled={isChangingPassword}
            className="rounded-xl px-4 py-2.5 text-[13px] font-semibold text-[#0f172a] disabled:opacity-60"
            style={{ backgroundColor: "#f5a300" }}
          >
            {isChangingPassword ? "Saving..." : "Change password"}
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default ProfilePage;
